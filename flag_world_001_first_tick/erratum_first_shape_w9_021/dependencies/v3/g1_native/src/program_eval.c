/*
 * program_eval.c — MaLCog v3 program-form evaluator (IN / CAN / THIS / SAME /
 * MANY / TOGETHER / NO / .call) for the native G1 engine.
 *
 * Included by native_discharger.c (single translation unit, so the build scripts
 * do not change). It uses that file's static I/O helpers. No heap: every table is
 * a fixed static arena.
 *
 * Semantics follow the program form as the corpus writes it (sha256.mal,
 * bytes.mal):
 *   - one flat global environment; THIS rebinds; parameters bind globally
 *   - NO IN e   returns e from the enclosing function
 *   - NO e      boolean negation (operand MUST be a boolean)
 *   - SAME e { p -> body }  first matching arm; no match yields NONE
 *   - MANY x IN list { ... } iterates; MANY [a, b] builds a list
 *   - TOGETHER { f: e } builds a record; r.f reads a field
 *   - f.call(args) calls a function defined in any loaded module
 *
 * Missing evidence is never turned into a value (defects D1, D2 of
 * RUN_RECORD_SHA256_MAL_STANDARD_VECTORS_001):
 *   - check and eval reject an unresolved function name before execution
 *   - eval rejects an unbound variable, an absent record field, or an
 *     operator applied to the wrong kind of value
 *   - the process exit code carries the verdict of main():
 *       0 HOLDS (true)  1 FAILS (false)  2 MAYBE (no boolean)  3 HARD-FAIL
 *     (the same codes as CFU ABI v0.3.4 rd[31:30])
 */

#define PE_MAX_FILES     16u
#define PE_SRC_CAP       (4u << 20)
#define PE_MAX_TOK       (1u << 20)
#define PE_MAX_NODE      (1u << 20)
#define PE_STR_CAP       (2u << 20)
#define PE_MAX_SYM       (1u << 16)
#define PE_MAX_FN        4096u
#define PE_MAX_PARAMS    16u
#define PE_MAX_FIELDS    96u
#define PE_ARENA_CAP     (16u << 20)
#define PE_MAX_DEPTH     20000u
#define PE_MAX_ERRORS    64u

enum { PT_EOF, PT_IDENT, PT_INT, PT_STR, PT_PUNCT };

typedef struct {
  uint8_t kind;
  char punct;          /* '{' '}' '(' ')' '[' ']' ',' ':' '.' '=' '>' (for ->) */
  uint32_t sym;        /* PT_IDENT, PT_STR */
  int64_t ival;        /* PT_INT */
  uint32_t file;
  uint32_t line;
} PeTok;

enum {
  PK_INT, PK_STR, PK_BOOL, PK_NONE, PK_NAME, PK_FIELD, PK_CALL, PK_REC, PK_FLD, PK_LIST,
  PK_NOT, PK_RET, PK_THIS, PK_SAME, PK_ARM, PK_BLOCK, PK_MANY
};
enum { PP_ANY, PP_INT, PP_STR, PP_BOOL };

typedef struct {
  uint8_t kind;
  uint8_t pat;         /* PK_ARM pattern kind */
  uint32_t a;          /* sym (name / field / fn / var) */
  uint32_t b;          /* PK_CALL argc, PK_LIST count, PK_SAME first arm, PK_MANY body */
  uint32_t c;          /* PK_CALL resolved fn index + 1 (0 = unresolved) */
  int64_t iv;          /* literal / pattern value */
  uint32_t first;      /* first child (0 = none) */
  uint32_t next;       /* next sibling (0 = none) */
  uint32_t file;
  uint32_t line;
} PeNode;

typedef struct {
  uint32_t name;
  uint32_t module;
  uint32_t nparams;
  uint32_t params[PE_MAX_PARAMS];
  uint32_t body;       /* PK_BLOCK node */
  uint32_t file;
  uint32_t line;
} PeFn;

enum { PV_NONE, PV_BOOL, PV_INT, PV_STR, PV_REC, PV_LIST };

typedef struct {
  int64_t v;           /* int / bool / arena start */
  uint32_t aux;        /* str sym / field or item count */
  uint8_t tag;
} PVal;

/* ---- static state ------------------------------------------------------- */
static char pe_src[PE_SRC_CAP];
static uint32_t pe_src_len;
static const char *pe_file_names[PE_MAX_FILES];
static uint32_t pe_file_count;

static PeTok pe_tok[PE_MAX_TOK];
static uint32_t pe_ntok, pe_pos;

static PeNode pe_node[PE_MAX_NODE];
static uint32_t pe_nnode = 1;          /* node 0 = none */

static char pe_str[PE_STR_CAP];
static uint32_t pe_str_len;
static uint32_t pe_sym_off[PE_MAX_SYM];
static uint32_t pe_sym_len[PE_MAX_SYM];
static uint32_t pe_nsym = 1;           /* sym 0 = none */
static uint32_t pe_sym_hash[PE_MAX_SYM * 2u];

static PeFn pe_fn[PE_MAX_FN];
static uint32_t pe_nfn;
static uint32_t pe_fn_of_sym[PE_MAX_SYM]; /* fn index + 1 */

static PVal pe_env[PE_MAX_SYM];
static uint8_t pe_bound[PE_MAX_SYM];

static PVal pe_arena_val[PE_ARENA_CAP];
static uint32_t pe_arena_name[PE_ARENA_CAP];
static uint32_t pe_arena_len;
static uint32_t pe_arena_peak;

static uint32_t pe_depth;
static int pe_quiet;                   /* suppress println (library self-test) */
static uint64_t pe_calls;
static char pe_err[16384];
static uint32_t pe_err_len;
static uint32_t pe_errors;

static uint32_t PS_IN, PS_CAN, PS_THIS, PS_NO, PS_SAME, PS_MANY, PS_TOGETHER, PS_NONE,
                PS_TRUE, PS_FALSE, PS_UNDERSCORE, PS_CALL, PS_MAIN, PS_PRINTLN;

/* ---- output helpers ----------------------------------------------------- */
static void pe_out(const char *s) { write_stdout(s, (DWORD)c_strlen(s)); }
static void pe_out_n(const char *s, uint32_t n) { write_stdout(s, (DWORD)n); }
static void pe_out_u(uint64_t u) {
  char b[24]; int i = 23; b[i] = '\0';
  if (u == 0) b[--i] = '0';
  while (u) { b[--i] = (char)('0' + (u % 10u)); u /= 10u; }
  pe_out(b + i);
}
static void pe_out_i(int64_t v) {
  if (v < 0) { pe_out("-"); pe_out_u((uint64_t)(-(v + 1)) + 1u); } else pe_out_u((uint64_t)v);
}
static void pe_out_sym(uint32_t s) { pe_out_n(pe_str + pe_sym_off[s], pe_sym_len[s]); }

static void pe_err_add(const char *s) {
  while (*s && pe_err_len + 1u < sizeof(pe_err)) pe_err[pe_err_len++] = *s++;
  pe_err[pe_err_len] = '\0';
}
static void pe_err_sym(uint32_t s) {
  uint32_t i;
  for (i = 0; i < pe_sym_len[s] && pe_err_len + 1u < sizeof(pe_err); i++) pe_err[pe_err_len++] = pe_str[pe_sym_off[s] + i];
  pe_err[pe_err_len] = '\0';
}
static void pe_err_u(uint64_t u) {
  char b[24]; int i = 23; b[i] = '\0';
  if (u == 0) b[--i] = '0';
  while (u) { b[--i] = (char)('0' + (u % 10u)); u /= 10u; }
  pe_err_add(b + i);
}
static void pe_err_at(uint32_t file, uint32_t line) {
  pe_err_add(file < pe_file_count ? pe_file_names[file] : "?");
  pe_err_add(":");
  pe_err_u(line);
  pe_err_add(": ");
}
/* begin one error line; returns 0 so callers can `return pe_fail(...)` */
static int pe_fail(uint32_t file, uint32_t line, const char *what) {
  if (pe_errors < PE_MAX_ERRORS) {
    pe_err_add("HARD-FAIL ");
    pe_err_at(file, line);
    pe_err_add(what);
  }
  pe_errors++;
  return 0;
}
static void pe_fail_end(void) { if (pe_errors <= PE_MAX_ERRORS) pe_err_add("\n"); }

/* ---- symbols ------------------------------------------------------------ */
static uint32_t pe_hash(const char *s, uint32_t n) {
  uint32_t h = 2166136261u, i;
  for (i = 0; i < n; i++) { h ^= (uint8_t)s[i]; h *= 16777619u; }
  return h;
}
static uint32_t pe_intern(const char *s, uint32_t n) {
  uint32_t mask = PE_MAX_SYM * 2u - 1u;
  uint32_t h = pe_hash(s, n) & mask;
  for (;;) {
    uint32_t id = pe_sym_hash[h];
    if (id == 0) break;
    if (pe_sym_len[id] == n) {
      uint32_t i; const char *t = pe_str + pe_sym_off[id];
      for (i = 0; i < n && t[i] == s[i]; i++) {}
      if (i == n) return id;
    }
    h = (h + 1u) & mask;
  }
  if (pe_nsym >= PE_MAX_SYM || pe_str_len + n + 1u > PE_STR_CAP) return 0;
  {
    uint32_t id = pe_nsym++, i;
    pe_sym_off[id] = pe_str_len;
    pe_sym_len[id] = n;
    for (i = 0; i < n; i++) pe_str[pe_str_len++] = s[i];
    pe_str[pe_str_len++] = '\0';
    pe_sym_hash[h] = id;
    return id;
  }
}
static uint32_t pe_intern_c(const char *s) { return pe_intern(s, (uint32_t)c_strlen(s)); }

/* ---- lexer -------------------------------------------------------------- */
static int pe_is_alpha(char c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'; }
static int pe_is_digit(char c) { return c >= '0' && c <= '9'; }

static int pe_lex(uint32_t file, uint32_t start, uint32_t end) {
  uint32_t i = start, line = 1;
  while (i < end) {
    char c = pe_src[i];
    if (c == '\n') { line++; i++; continue; }
    if (c == ' ' || c == '\t' || c == '\r') { i++; continue; }
    if (c == '/' && i + 1 < end && pe_src[i + 1] == '/') {
      while (i < end && pe_src[i] != '\n') i++;
      continue;
    }
    if (pe_ntok + 1u >= PE_MAX_TOK) return pe_fail(file, line, "token capacity exceeded");
    {
      PeTok *t = &pe_tok[pe_ntok];
      t->file = file; t->line = line; t->sym = 0; t->ival = 0; t->punct = 0;
      if (pe_is_alpha(c)) {
        uint32_t j = i;
        while (j < end && (pe_is_alpha(pe_src[j]) || pe_is_digit(pe_src[j]))) j++;
        t->kind = PT_IDENT;
        t->sym = pe_intern(pe_src + i, j - i);
        if (!t->sym) return pe_fail(file, line, "symbol capacity exceeded");
        i = j;
      } else if (pe_is_digit(c)) {
        int64_t v = 0;
        while (i < end && pe_is_digit(pe_src[i])) { v = v * 10 + (pe_src[i] - '0'); i++; }
        t->kind = PT_INT; t->ival = v;
      } else if (c == '"') {
        uint32_t j = i + 1;
        while (j < end && pe_src[j] != '"' && pe_src[j] != '\n') j++;
        if (j >= end || pe_src[j] != '"') return pe_fail(file, line, "unterminated string");
        t->kind = PT_STR;
        t->sym = pe_intern(pe_src + i + 1, j - i - 1);
        i = j + 1;
      } else if (c == '-' && i + 1 < end && pe_src[i + 1] == '>') {
        t->kind = PT_PUNCT; t->punct = '>'; i += 2;
      } else if (c == '{' || c == '}' || c == '(' || c == ')' || c == '[' || c == ']' ||
                 c == ',' || c == ':' || c == '.' || c == '=') {
        t->kind = PT_PUNCT; t->punct = c; i++;
      } else {
        return pe_fail(file, line, "unexpected character");
      }
      pe_ntok++;
    }
  }
  pe_tok[pe_ntok].kind = PT_EOF;
  pe_tok[pe_ntok].file = file;
  pe_tok[pe_ntok].line = line;
  return 1;
}

/* ---- parser ------------------------------------------------------------- */
static PeTok *pe_cur(void) { return &pe_tok[pe_pos]; }
static int pe_is_p(char p) { return pe_tok[pe_pos].kind == PT_PUNCT && pe_tok[pe_pos].punct == p; }
static int pe_is_kw(uint32_t s) { return pe_tok[pe_pos].kind == PT_IDENT && pe_tok[pe_pos].sym == s; }
static int pe_syntax(const char *what) {
  pe_fail(pe_cur()->file, pe_cur()->line, "syntax: expected ");
  if (pe_errors <= PE_MAX_ERRORS) pe_err_add(what);
  pe_fail_end();
  return 0;
}
static int pe_expect_p(char p, const char *what) {
  if (!pe_is_p(p)) return pe_syntax(what);
  pe_pos++;
  return 1;
}
static uint32_t pe_new(uint8_t kind) {
  uint32_t n;
  if (pe_nnode >= PE_MAX_NODE) { pe_syntax("(node capacity exceeded)"); return 0; }
  n = pe_nnode++;
  pe_node[n].kind = kind; pe_node[n].pat = 0; pe_node[n].a = 0; pe_node[n].b = 0;
  pe_node[n].c = 0; pe_node[n].iv = 0; pe_node[n].first = 0; pe_node[n].next = 0;
  pe_node[n].file = pe_cur()->file; pe_node[n].line = pe_cur()->line;
  return n;
}
static uint32_t pe_ident(const char *what) {
  if (pe_cur()->kind != PT_IDENT) { pe_syntax(what); return 0; }
  return pe_tok[pe_pos++].sym;
}

static uint32_t pe_parse_expr(void);
static uint32_t pe_parse_stmt(void);

/* stmts until '}' (consumed) */
static uint32_t pe_parse_block_body(void) {
  uint32_t blk = pe_new(PK_BLOCK), last = 0;
  if (!blk) return 0;
  while (!pe_is_p('}')) {
    uint32_t s;
    if (pe_cur()->kind == PT_EOF) { pe_syntax("'}'"); return 0; }
    s = pe_parse_stmt();
    if (!s) return 0;
    if (last) pe_node[last].next = s; else pe_node[blk].first = s;
    last = s;
  }
  pe_pos++;
  return blk;
}

static uint32_t pe_parse_primary(void) {
  PeTok *t = pe_cur();
  uint32_t n;
  if (t->kind == PT_INT) { n = pe_new(PK_INT); if (n) pe_node[n].iv = t->ival; pe_pos++; return n; }
  if (t->kind == PT_STR) { n = pe_new(PK_STR); if (n) pe_node[n].a = t->sym; pe_pos++; return n; }
  if (t->kind != PT_IDENT) { pe_syntax("expression"); return 0; }
  if (t->sym == PS_TRUE || t->sym == PS_FALSE) {
    n = pe_new(PK_BOOL); if (n) pe_node[n].iv = (t->sym == PS_TRUE); pe_pos++; return n;
  }
  if (t->sym == PS_NONE) { n = pe_new(PK_NONE); pe_pos++; return n; }
  if (t->sym == PS_NO) {            /* NO e : boolean negation */
    pe_pos++;
    if (pe_is_kw(PS_IN)) { pe_syntax("expression (NO IN is a statement)"); return 0; }
    n = pe_new(PK_NOT); if (!n) return 0;
    pe_node[n].first = pe_parse_expr();
    return pe_node[n].first ? n : 0;
  }
  if (t->sym == PS_TOGETHER) {
    uint32_t last = 0;
    n = pe_new(PK_REC); if (!n) return 0;
    pe_pos++;
    if (!pe_expect_p('{', "'{' after TOGETHER")) return 0;
    while (!pe_is_p('}')) {
      uint32_t f = pe_new(PK_FLD);
      if (!f) return 0;
      pe_node[f].a = pe_ident("field name");
      if (!pe_node[f].a) return 0;
      if (!pe_expect_p(':', "':' after field name")) return 0;
      pe_node[f].first = pe_parse_expr();
      if (!pe_node[f].first) return 0;
      if (pe_is_p(',')) pe_pos++;
      if (last) pe_node[last].next = f; else pe_node[n].first = f;
      last = f;
      pe_node[n].b++;
    }
    pe_pos++;
    return n;
  }
  if (t->sym == PS_MANY) {          /* MANY [ e, ... ] list literal */
    uint32_t last = 0;
    n = pe_new(PK_LIST); if (!n) return 0;
    pe_pos++;
    if (!pe_expect_p('[', "'[' after MANY in an expression")) return 0;
    while (!pe_is_p(']')) {
      uint32_t e = pe_parse_expr();
      if (!e) return 0;
      if (last) pe_node[last].next = e; else pe_node[n].first = e;
      last = e;
      pe_node[n].b++;
      if (pe_is_p(',')) pe_pos++; else if (!pe_is_p(']')) { pe_syntax("',' or ']'"); return 0; }
    }
    pe_pos++;
    return n;
  }
  if (t->sym == PS_IN || t->sym == PS_CAN || t->sym == PS_THIS || t->sym == PS_SAME) {
    pe_syntax("expression"); return 0;
  }
  n = pe_new(PK_NAME); if (n) pe_node[n].a = t->sym;
  pe_pos++;
  return n;
}

static uint32_t pe_parse_expr(void) {
  uint32_t e = pe_parse_primary();
  while (e && pe_is_p('.')) {
    uint32_t name;
    pe_pos++;
    name = pe_ident("name after '.'");
    if (!name) return 0;
    if (name == PS_CALL && pe_is_p('(')) {
      uint32_t call, last = 0;
      if (pe_node[e].kind != PK_NAME) { pe_syntax("function name before .call"); return 0; }
      call = pe_new(PK_CALL); if (!call) return 0;
      pe_node[call].a = pe_node[e].a;
      pe_node[call].file = pe_node[e].file; pe_node[call].line = pe_node[e].line;
      pe_pos++;
      while (!pe_is_p(')')) {
        uint32_t arg = pe_parse_expr();
        if (!arg) return 0;
        if (last) pe_node[last].next = arg; else pe_node[call].first = arg;
        last = arg;
        pe_node[call].b++;
        if (pe_is_p(',')) pe_pos++; else if (!pe_is_p(')')) { pe_syntax("',' or ')'"); return 0; }
      }
      pe_pos++;
      e = call;
    } else {
      uint32_t f = pe_new(PK_FIELD); if (!f) return 0;
      pe_node[f].a = name;
      pe_node[f].first = e;
      e = f;
    }
  }
  return e;
}

static uint32_t pe_parse_stmt(void) {
  uint32_t n;
  if (pe_is_kw(PS_THIS)) {
    n = pe_new(PK_THIS); if (!n) return 0;
    pe_pos++;
    pe_node[n].a = pe_ident("name after THIS");
    if (!pe_node[n].a) return 0;
    if (!pe_expect_p('=', "'=' after THIS name")) return 0;
    pe_node[n].first = pe_parse_expr();
    return pe_node[n].first ? n : 0;
  }
  if (pe_is_kw(PS_NO) && pe_tok[pe_pos + 1].kind == PT_IDENT && pe_tok[pe_pos + 1].sym == PS_IN) {
    n = pe_new(PK_RET); if (!n) return 0;
    pe_pos += 2;
    pe_node[n].first = pe_parse_expr();
    return pe_node[n].first ? n : 0;
  }
  if (pe_is_kw(PS_SAME)) {
    uint32_t last = 0;
    n = pe_new(PK_SAME); if (!n) return 0;
    pe_pos++;
    pe_node[n].first = pe_parse_expr();
    if (!pe_node[n].first) return 0;
    if (!pe_expect_p('{', "'{' after SAME scrutinee")) return 0;
    while (!pe_is_p('}')) {
      uint32_t arm = pe_new(PK_ARM);
      PeTok *t = pe_cur();
      if (!arm) return 0;
      if (t->kind == PT_INT) { pe_node[arm].pat = PP_INT; pe_node[arm].iv = t->ival; }
      else if (t->kind == PT_STR) { pe_node[arm].pat = PP_STR; pe_node[arm].iv = t->sym; }
      else if (t->kind == PT_IDENT && (t->sym == PS_TRUE || t->sym == PS_FALSE)) { pe_node[arm].pat = PP_BOOL; pe_node[arm].iv = (t->sym == PS_TRUE); }
      else if (t->kind == PT_IDENT && t->sym == PS_UNDERSCORE) { pe_node[arm].pat = PP_ANY; }
      else { pe_syntax("pattern (integer, string, true, false or _)"); return 0; }
      pe_pos++;
      if (!pe_expect_p('>', "'->' after pattern")) return 0;
      if (pe_is_kw(PS_IN)) {           /* p -> IN label { stmts } */
        pe_pos++;
        if (!pe_ident("block label after IN")) return 0;
        if (!pe_expect_p('{', "'{' after block label")) return 0;
        pe_node[arm].first = pe_parse_block_body();
      } else {
        pe_node[arm].first = pe_parse_stmt();
      }
      if (!pe_node[arm].first) return 0;
      if (last) pe_node[last].next = arm; else pe_node[n].b = arm;
      last = arm;
    }
    pe_pos++;
    return n;
  }
  if (pe_is_kw(PS_MANY) && pe_tok[pe_pos + 1].kind == PT_IDENT) {   /* MANY x IN list { } */
    n = pe_new(PK_MANY); if (!n) return 0;
    pe_pos++;
    pe_node[n].a = pe_ident("loop variable");
    if (!pe_node[n].a) return 0;
    if (!pe_is_kw(PS_IN)) { pe_syntax("IN after MANY variable"); return 0; }
    pe_pos++;
    pe_node[n].first = pe_parse_expr();
    if (!pe_node[n].first) return 0;
    if (!pe_expect_p('{', "'{' after MANY source")) return 0;
    pe_node[n].b = pe_parse_block_body();
    return pe_node[n].b ? n : 0;
  }
  return pe_parse_expr();
}

/* type := Ident [ '(' type ')' ] — recorded by the source, not used by eval */
static int pe_skip_type(void) {
  if (!pe_ident("type")) return 0;
  if (pe_is_p('(')) {
    pe_pos++;
    if (!pe_skip_type()) return 0;
    if (!pe_expect_p(')', "')' closing type")) return 0;
  }
  return 1;
}

static int pe_parse_function(uint32_t module) {
  PeFn *f;
  if (pe_nfn >= PE_MAX_FN) return pe_syntax("(function capacity exceeded)");
  f = &pe_fn[pe_nfn];
  f->module = module; f->nparams = 0;
  f->file = pe_cur()->file; f->line = pe_cur()->line;
  pe_pos++;                                  /* CAN */
  if (!pe_ident("capability after CAN")) return 0;
  if (!pe_is_kw(PS_IN)) return pe_syntax("IN after capability");
  pe_pos++;
  f->name = pe_ident("function name");
  if (!f->name) return 0;
  if (!pe_expect_p('(', "'(' after function name")) return 0;
  while (!pe_is_p(')')) {
    uint32_t p = pe_ident("parameter name");
    if (!p) return 0;
    if (f->nparams >= PE_MAX_PARAMS) return pe_syntax("(parameter capacity exceeded)");
    f->params[f->nparams++] = p;
    if (!pe_expect_p(':', "':' after parameter name")) return 0;
    if (!pe_skip_type()) return 0;
    if (pe_is_p(',')) pe_pos++; else if (!pe_is_p(')')) return pe_syntax("',' or ')'");
  }
  pe_pos++;
  if (!pe_expect_p('>', "'->' before return type")) return 0;
  if (!pe_skip_type()) return 0;
  if (!pe_expect_p('{', "'{' opening function body")) return 0;
  f->body = pe_parse_block_body();
  if (!f->body) return 0;
  if (pe_fn_of_sym[f->name]) {
    pe_fail(f->file, f->line, "duplicate function ");
    if (pe_errors <= PE_MAX_ERRORS) pe_err_sym(f->name);
    pe_fail_end();
    return 0;
  }
  pe_fn_of_sym[f->name] = ++pe_nfn;
  return 1;
}

static int pe_parse_program(void) {
  while (pe_cur()->kind != PT_EOF) {
    uint32_t module;
    if (!pe_is_kw(PS_IN)) return pe_syntax("IN <module> { ... } at top level");
    pe_pos++;
    module = pe_ident("module name");
    if (!module) return 0;
    if (!pe_expect_p('{', "'{' after module name")) return 0;
    while (!pe_is_p('}')) {
      if (!pe_is_kw(PS_CAN)) return pe_syntax("CAN <capability> IN <name>(...) inside a module");
      if (!pe_parse_function(module)) return 0;
    }
    pe_pos++;
  }
  return 1;
}

/* ---- resolution (check) -------------------------------------------------- */
static uint32_t pe_unres_first[PE_MAX_SYM];   /* first offending node per name */
static uint32_t pe_unres_count[PE_MAX_SYM];

static uint32_t pe_resolve(int require_main) {
  uint32_t i, unresolved = 0;
  /* unresolved names: one line per name, first site + occurrence count */
  for (i = 1; i < pe_nnode; i++) {
    PeNode *n = &pe_node[i];
    if (n->kind != PK_CALL || n->a == PS_PRINTLN || pe_fn_of_sym[n->a]) continue;
    if (!pe_unres_count[n->a]) pe_unres_first[n->a] = i;
    pe_unres_count[n->a]++;
  }
  for (i = 1; i < pe_nnode; i++) {
    PeNode *n = &pe_node[i];
    if (n->kind != PK_CALL || pe_unres_first[n->a] != i) continue;
    pe_fail(n->file, n->line, "unresolved function ");
    if (pe_errors <= PE_MAX_ERRORS) { pe_err_sym(n->a); pe_err_add(" ("); pe_err_u(pe_unres_count[n->a]); pe_err_add(" call sites)"); }
    pe_fail_end();
    unresolved++;
  }
  for (i = 1; i < pe_nnode; i++) {
    PeNode *n = &pe_node[i];
    if (n->kind != PK_CALL) continue;
    if (n->a == PS_PRINTLN) {
      if (n->b != 1) {
        pe_fail(n->file, n->line, "println takes exactly 1 argument");
        pe_fail_end();
        unresolved++;
      }
      continue;
    }
    n->c = pe_fn_of_sym[n->a];
    if (!n->c) continue;                       /* reported above */
    if (pe_fn[n->c - 1].nparams != n->b) {
      pe_fail(n->file, n->line, "arity mismatch calling ");
      if (pe_errors <= PE_MAX_ERRORS) { pe_err_sym(n->a); pe_err_add(": expected "); pe_err_u(pe_fn[n->c - 1].nparams); pe_err_add(", given "); pe_err_u(n->b); }
      pe_fail_end();
      unresolved++;
    }
  }
  if (!require_main) return unresolved;
  if (!pe_fn_of_sym[PS_MAIN]) {
    pe_fail(0, 0, "no function named main");
    pe_fail_end();
    unresolved++;
  } else if (pe_fn[pe_fn_of_sym[PS_MAIN] - 1].nparams != 0) {
    pe_fail(0, 0, "main must take no parameters");
    pe_fail_end();
    unresolved++;
  }
  return unresolved;
}

/* ---- evaluation ---------------------------------------------------------- */
enum { PST_OK = 0, PST_RET = 1, PST_ERR = -1 };

/* ---- copying collector ---------------------------------------------------
 * Values are immutable; records and lists own one contiguous arena range.
 * Roots: every bound name in the global environment, plus the value ranges
 * C frames hold across a nested call (registered on pe_roots). Collection runs
 * only at function entry, after arguments are bound, so no partially built
 * value exists at that moment. Sharing is preserved with forwarding marks. */
#define PE_TO_CAP     (8u << 20)
#define PE_GC_AT      (PE_ARENA_CAP - (2u << 20))
#define PE_MAX_ROOTS  (4u * PE_MAX_DEPTH + 64u)
#define PE_FWD        0xFFFFFFFFu
typedef struct { PVal *p; uint32_t n; } PeRoot;
static PeRoot pe_roots[PE_MAX_ROOTS];
static uint32_t pe_nroots;
static PVal pe_to_val[PE_TO_CAP];
static uint32_t pe_to_name[PE_TO_CAP];
static uint32_t pe_to_len;
static uint32_t pe_gc_runs;
static int pe_gc_overflow;

static uint32_t pe_root_push(PVal *p, uint32_t n) {
  uint32_t idx = pe_nroots;
  if (pe_nroots < PE_MAX_ROOTS) { pe_roots[pe_nroots].p = p; pe_roots[pe_nroots].n = n; pe_nroots++; }
  else pe_gc_overflow = 1;
  return idx;
}

static void pe_gc_forward(PVal *v) {
  uint32_t s, n, i;
  if ((v->tag != PV_REC && v->tag != PV_LIST) || v->aux == 0) return;
  s = (uint32_t)v->v; n = v->aux;
  if (pe_arena_name[s] == PE_FWD) { v->v = pe_arena_val[s].v; return; }
  if (pe_to_len + n > PE_TO_CAP) { pe_gc_overflow = 1; return; }
  for (i = 0; i < n; i++) { pe_to_val[pe_to_len + i] = pe_arena_val[s + i]; pe_to_name[pe_to_len + i] = pe_arena_name[s + i]; }
  pe_arena_name[s] = PE_FWD;
  pe_arena_val[s].v = pe_to_len;
  v->v = pe_to_len;
  pe_to_len += n;
}

static void pe_gc(void) {
  uint32_t i, j, scan = 0;
  pe_to_len = 0;
  for (i = 1; i < pe_nsym; i++) if (pe_bound[i]) pe_gc_forward(&pe_env[i]);
  for (i = 0; i < pe_nroots; i++) for (j = 0; j < pe_roots[i].n; j++) pe_gc_forward(&pe_roots[i].p[j]);
  while (scan < pe_to_len && !pe_gc_overflow) {
    /* a slot copied from a forwarded range keeps its own (field) name */
    pe_gc_forward(&pe_to_val[scan]);
    scan++;
  }
  if (pe_gc_overflow) return;
  for (i = 0; i < pe_to_len; i++) { pe_arena_val[i] = pe_to_val[i]; pe_arena_name[i] = pe_to_name[i]; }
  pe_arena_len = pe_to_len;
  pe_gc_runs++;
}

static PVal pe_none(void) { PVal v; v.tag = PV_NONE; v.v = 0; v.aux = 0; return v; }
static PVal pe_bool(int b) { PVal v; v.tag = PV_BOOL; v.v = b ? 1 : 0; v.aux = 0; return v; }

static int pe_rt(uint32_t node, const char *what, uint32_t sym) {
  pe_fail(pe_node[node].file, pe_node[node].line, what);
  if (sym && pe_errors <= PE_MAX_ERRORS) pe_err_sym(sym);
  pe_fail_end();
  return PST_ERR;
}

static int pe_exec(uint32_t node, PVal *out);

static int pe_exec_block(uint32_t blk, PVal *out) {
  uint32_t s = pe_node[blk].first;
  PVal last = pe_none();
  while (s) {
    int st = pe_exec(s, &last);
    if (st != PST_OK) { *out = last; return st; }
    s = pe_node[s].next;
  }
  *out = last;
  return PST_OK;
}

/* Scratch stack: temporaries held across nested evaluation live here, not on
 * the C stack, so each recursive C frame stays small (Windows default stack
 * is 1 MB under cl, 2 MB under MinGW). */
#define PE_SCRATCH_CAP (1u << 20)
static PVal pe_scratch[PE_SCRATCH_CAP];
static uint32_t pe_scratch_name[PE_SCRATCH_CAP];
static uint32_t pe_scratch_top;

static int pe_scratch_take(uint32_t n, uint32_t *base) {
  if (pe_scratch_top + n > PE_SCRATCH_CAP) return 0;
  *base = pe_scratch_top;
  pe_scratch_top += n;
  return 1;
}

static int pe_call(uint32_t node, PVal *out) {
  PeNode *n = &pe_node[node];
  PVal *args;
  uint32_t i = 0, a = n->first, sb;
  PeFn *f;
  int st;
  uint32_t root;
  if (!pe_scratch_take(n->b, &sb)) return pe_rt(node, "scratch stack exhausted at ", n->a);
  args = &pe_scratch[sb];
  root = pe_root_push(args, 0);
  while (a) {
    st = pe_exec(a, &args[i]);
    if (st == PST_ERR) return PST_ERR;
    if (st == PST_RET) return pe_rt(a, "NO IN inside a call argument", 0);
    i++;
    pe_roots[root].n = i;
    a = pe_node[a].next;
  }
  pe_nroots = root;
  pe_scratch_top = sb;                 /* args are copied out below before any nested call */
  if (n->a == PS_PRINTLN) {
    PVal v = args[0];
    if (pe_quiet) { *out = pe_none(); return PST_OK; }
    switch (v.tag) {
      case PV_BOOL: pe_out(v.v ? "true" : "false"); break;
      case PV_INT:  pe_out_i(v.v); break;
      case PV_STR:  pe_out_sym(v.aux); break;
      case PV_NONE: pe_out("()"); break;
      case PV_REC:  pe_out("_"); break;
      default:     pe_out("["); pe_out_u(v.aux); pe_out(" items]"); break;
    }
    pe_out("\n");
    *out = pe_none();
    return PST_OK;
  }
  f = &pe_fn[n->c - 1];
  if (++pe_depth > PE_MAX_DEPTH) return pe_rt(node, "call depth exceeded at ", n->a);
  pe_calls++;
  for (i = 0; i < f->nparams; i++) { pe_env[f->params[i]] = args[i]; pe_bound[f->params[i]] = 1; }
  if (pe_arena_len > PE_GC_AT) pe_gc();
  if (pe_gc_overflow) return pe_rt(node, "collector capacity exceeded at ", n->a);
  st = pe_exec_block(f->body, out);
  pe_depth--;
  if (st == PST_ERR) return PST_ERR;
  return PST_OK;                       /* PST_RET stops at the function boundary */
}

static int pe_match(uint32_t arm, PVal v) {
  PeNode *a = &pe_node[arm];
  switch (a->pat) {
    case PP_ANY:  return 1;
    case PP_INT:  return v.tag == PV_INT && v.v == a->iv;
    case PP_STR:  return v.tag == PV_STR && v.aux == (uint32_t)a->iv;
    default:     return v.tag == PV_BOOL && v.v == a->iv;
  }
}

static int pe_exec(uint32_t node, PVal *out) {
  PeNode *n = &pe_node[node];
  int st;
  switch (n->kind) {
    case PK_INT:  out->tag = PV_INT; out->v = n->iv; out->aux = 0; return PST_OK;
    case PK_STR:  out->tag = PV_STR; out->v = 0; out->aux = n->a; return PST_OK;
    case PK_BOOL: *out = pe_bool((int)n->iv); return PST_OK;
    case PK_NONE: *out = pe_none(); return PST_OK;
    case PK_NAME:
      if (!pe_bound[n->a]) return pe_rt(node, "unbound name ", n->a);
      *out = pe_env[n->a];
      return PST_OK;
    case PK_FIELD: {
      PVal base;
      uint32_t i;
      st = pe_exec(n->first, &base);
      if (st != PST_OK) return st == PST_ERR ? PST_ERR : pe_rt(node, "NO IN inside a field base", 0);
      if (base.tag != PV_REC) return pe_rt(node, "field access on a non-record: .", n->a);
      for (i = 0; i < base.aux; i++) {
        if (pe_arena_name[(uint32_t)base.v + i] == n->a) { *out = pe_arena_val[(uint32_t)base.v + i]; return PST_OK; }
      }
      return pe_rt(node, "absent record field .", n->a);
    }
    case PK_CALL: return pe_call(node, out);
    case PK_REC: {
      PVal *vals;
      uint32_t *names;
      uint32_t cnt = 0, f = n->first, i, base, sb;
      uint32_t root;
      if (n->b > PE_MAX_FIELDS) return pe_rt(node, "record field capacity exceeded", 0);
      if (!pe_scratch_take(n->b, &sb)) return pe_rt(node, "scratch stack exhausted", 0);
      vals = &pe_scratch[sb];
      names = &pe_scratch_name[sb];
      root = pe_root_push(vals, 0);
      while (f) {
        st = pe_exec(pe_node[f].first, &vals[cnt]);
        if (st == PST_ERR) return PST_ERR;
        if (st == PST_RET) return pe_rt(f, "NO IN inside a record field", 0);
        for (i = 0; i < cnt; i++) if (names[i] == pe_node[f].a) return pe_rt(f, "duplicate record field ", pe_node[f].a);
        names[cnt++] = pe_node[f].a;
        pe_roots[root].n = cnt;
        f = pe_node[f].next;
      }
      pe_nroots = root;
      if (pe_arena_len + cnt > PE_ARENA_CAP) return pe_rt(node, "value arena exhausted", 0);
      base = pe_arena_len;
      for (i = 0; i < cnt; i++) { pe_arena_val[base + i] = vals[i]; pe_arena_name[base + i] = names[i]; }
      pe_scratch_top = sb;
      pe_arena_len += cnt;
      if (pe_arena_len > pe_arena_peak) pe_arena_peak = pe_arena_len;
      out->tag = PV_REC; out->v = base; out->aux = cnt;
      return PST_OK;
    }
    case PK_LIST: {
      PVal *items;
      uint32_t e = n->first, base, i = 0, root, sb;
      if (!pe_scratch_take(n->b, &sb)) return pe_rt(node, "scratch stack exhausted", 0);
      items = &pe_scratch[sb];
      root = pe_root_push(items, 0);
      while (e) {
        st = pe_exec(e, &items[i]);
        if (st == PST_ERR) return PST_ERR;
        if (st == PST_RET) return pe_rt(e, "NO IN inside a list", 0);
        i++;
        pe_roots[root].n = i;
        e = pe_node[e].next;
      }
      pe_nroots = root;
      if (pe_arena_len + i > PE_ARENA_CAP) return pe_rt(node, "value arena exhausted", 0);
      base = pe_arena_len;
      for (e = 0; e < i; e++) { pe_arena_val[base + e] = items[e]; pe_arena_name[base + e] = 0; }
      pe_scratch_top = sb;
      pe_arena_len += i;
      if (pe_arena_len > pe_arena_peak) pe_arena_peak = pe_arena_len;
      out->tag = PV_LIST; out->v = base; out->aux = i;
      return PST_OK;
    }
    case PK_NOT: {
      PVal v;
      st = pe_exec(n->first, &v);
      if (st != PST_OK) return st == PST_ERR ? PST_ERR : pe_rt(node, "NO IN inside NO", 0);
      if (v.tag != PV_BOOL) return pe_rt(node, "NO applied to a non-boolean", 0);
      *out = pe_bool(!v.v);
      return PST_OK;
    }
    case PK_RET:
      st = pe_exec(n->first, out);
      if (st == PST_ERR) return PST_ERR;
      return PST_RET;
    case PK_THIS:
      st = pe_exec(n->first, out);
      if (st != PST_OK) return st == PST_ERR ? PST_ERR : pe_rt(node, "NO IN inside THIS", 0);
      pe_env[n->a] = *out;
      pe_bound[n->a] = 1;
      return PST_OK;
    case PK_SAME: {
      PVal v;
      uint32_t arm = n->b;
      st = pe_exec(n->first, &v);
      if (st != PST_OK) return st == PST_ERR ? PST_ERR : pe_rt(node, "NO IN inside a SAME scrutinee", 0);
      while (arm) {
        if (pe_match(arm, v)) {
          uint32_t body = pe_node[arm].first;
          return pe_node[body].kind == PK_BLOCK ? pe_exec_block(body, out) : pe_exec(body, out);
        }
        arm = pe_node[arm].next;
      }
      *out = pe_none();
      return PST_OK;
    }
    case PK_MANY: {
      PVal src, last = pe_none();
      uint32_t i, root;
      st = pe_exec(n->first, &src);
      if (st != PST_OK) return st == PST_ERR ? PST_ERR : pe_rt(node, "NO IN inside a MANY source", 0);
      if (src.tag != PV_LIST) return pe_rt(node, "MANY iterates a non-list", 0);
      root = pe_root_push(&src, 1);
      for (i = 0; i < src.aux; i++) {
        pe_env[n->a] = pe_arena_val[(uint32_t)src.v + i];   /* src.v is re-read: a collection may move it */
        pe_bound[n->a] = 1;
        st = pe_exec_block(n->b, &last);
        if (st != PST_OK) { pe_nroots = root; *out = last; return st; }
      }
      pe_nroots = root;
      *out = last;
      return PST_OK;
    }
    case PK_BLOCK: return pe_exec_block(node, out);
    default: return pe_rt(node, "internal: unknown node", 0);
  }
}

/* ---- driver -------------------------------------------------------------- */
static void pe_init_syms(void) {
  PS_IN = pe_intern_c("IN"); PS_CAN = pe_intern_c("CAN"); PS_THIS = pe_intern_c("THIS");
  PS_NO = pe_intern_c("NO"); PS_SAME = pe_intern_c("SAME"); PS_MANY = pe_intern_c("MANY");
  PS_TOGETHER = pe_intern_c("TOGETHER"); PS_NONE = pe_intern_c("NONE");
  PS_TRUE = pe_intern_c("true"); PS_FALSE = pe_intern_c("false"); PS_UNDERSCORE = pe_intern_c("_");
  PS_CALL = pe_intern_c("call"); PS_MAIN = pe_intern_c("main"); PS_PRINTLN = pe_intern_c("println");
}

/* load + lex + parse + resolve. returns 1 when the program is closed. */
static int pe_load_mode(int nfiles, char **files, int require_main) {
  int i;
  pe_init_syms();
  for (i = 0; i < nfiles; i++) {
    DWORD len = 0;
    uint32_t start = pe_src_len;
    if (pe_file_count >= PE_MAX_FILES) { pe_fail(0, 0, "too many input files"); pe_fail_end(); return 0; }
    pe_file_names[pe_file_count] = files[i];
    if (!read_file_all(files[i], pe_src + start, PE_SRC_CAP - start - 1u, &len)) {
      pe_fail(pe_file_count, 0, "cannot read file");
      pe_fail_end();
      return 0;
    }
    pe_src_len = start + (uint32_t)len;
    pe_ntok = 0; pe_pos = 0;
    if (!pe_lex(pe_file_count, start, pe_src_len)) { pe_fail_end(); return 0; }
    if (!pe_parse_program()) return 0;
    pe_file_count++;
  }
  return pe_resolve(require_main) == 0;
}
static int pe_load(int nfiles, char **files) { return pe_load_mode(nfiles, files, 1); }

static void pe_flush_errors(void) {
  if (pe_err_len) pe_out(pe_err);
  if (pe_errors > PE_MAX_ERRORS) { pe_out("HARD-FAIL ... "); pe_out_u(pe_errors - PE_MAX_ERRORS); pe_out(" more\n"); }
}

/* `--check f1.mal f2.mal ...` : 0 OK, 3 HARD-FAIL */
static int pe_cmd_check(int nfiles, char **files) {
  if (!pe_load(nfiles, files)) { pe_flush_errors(); return 3; }
  pe_out("OK\n");
  return 0;
}

/* `--eval f1.mal f2.mal ...` : exit code is the verdict of main() */
static int pe_cmd_eval(int nfiles, char **files) {
  PVal result;
  int st;
  if (!pe_load(nfiles, files)) { pe_flush_errors(); return 3; }
  st = pe_exec_block(pe_fn[pe_fn_of_sym[PS_MAIN] - 1].body, &result);
  if (st == PST_ERR) { pe_flush_errors(); return 3; }
  if (result.tag != PV_BOOL) return 2;
  return result.v ? 0 : 1;
}

/* ---- engine SHA-256 through sha256.mal ----------------------------------- */
/*
 * The engine's content hashes (source_hash, schema_hash, body_hash, artifact
 * hashes) are computed by sha256_digest in sha256.mal, evaluated here. The
 * library is loaded once, from the repository root (the same root the engine
 * already requires for v3/g1_native/format/mcbf_v0.md).
 */
#define PE_SHA_DIR "v3/software_fpga/threejs_projection_001_committed_4d_world_sections/"
static char pe_sha_lib0[] = PE_SHA_DIR "bytes.mal";
static char pe_sha_lib1[] = PE_SHA_DIR "sha256.mal";
static char pe_sha_lib2[] = PE_SHA_DIR "sha256_standard_vectors.mal";
static int pe_sha_state;              /* 0 unloaded, 1 ready, -1 failed */

/* call a loaded function from C with already-evaluated arguments */
static int pe_invoke(uint32_t fn_sym, const PVal *args, uint32_t nargs, PVal *out) {
  PeFn *f;
  uint32_t i;
  int st;
  if (!pe_fn_of_sym[fn_sym]) return PST_ERR;
  f = &pe_fn[pe_fn_of_sym[fn_sym] - 1];
  if (f->nparams != nargs) return PST_ERR;
  for (i = 0; i < nargs; i++) { pe_env[f->params[i]] = args[i]; pe_bound[f->params[i]] = 1; }
  st = pe_exec_block(f->body, out);
  return st == PST_ERR ? PST_ERR : PST_OK;
}

static int pe_sha_ready(void) {
  if (pe_sha_state == 0) {
    char *libs[3];
    PVal result;
    uint32_t i;
    libs[0] = pe_sha_lib0;
    libs[1] = pe_sha_lib1;
    libs[2] = pe_sha_lib2;
    pe_sha_state = -1;
    if (!pe_load(3, libs)) { pe_flush_errors(); return 0; }
    /* self-test before first use: the library must reproduce the standard
     * vectors (empty, "abc", 448-bit two-block) or the engine hashes nothing */
    pe_quiet = 1;
    if (pe_exec_block(pe_fn[pe_fn_of_sym[PS_MAIN] - 1].body, &result) != PST_ERR &&
        result.tag == PV_BOOL && result.v) {
      pe_sha_state = 1;
    } else {
      pe_out("HARD-FAIL sha256.mal did not reproduce the standard vectors\n");
      pe_flush_errors();
    }
    pe_quiet = 0;
    pe_arena_len = 0;
    pe_nroots = 0;
    pe_scratch_top = 0;
    for (i = 0; i < PE_MAX_SYM; i++) pe_bound[i] = 0;
  }
  return pe_sha_state > 0;
}

/* SHA-256 of data[0..len) computed by sha256.mal. returns 1 on success. */
static int pe_sha256_mal(const uint8_t *data, uint32_t len, uint8_t out[32]) {
  static const char *byte_fn[4] = { "word32_be_byte_0", "word32_be_byte_1", "word32_be_byte_2", "word32_be_byte_3" };
  static const char *word_field[8] = { "h0", "h1", "h2", "h3", "h4", "h5", "h6", "h7" };
  uint32_t mark, i, j;
  PVal list, seq, digest, valid;
  int ok = 0;
  if (!pe_sha_ready()) return 0;
  mark = pe_arena_len;
  if (pe_arena_len + len > PE_ARENA_CAP) goto done;
  for (i = 0; i < len; i++) {
    PVal b; b.tag = PV_INT; b.v = data[i]; b.aux = 0;
    pe_arena_val[pe_arena_len + i] = b;
    pe_arena_name[pe_arena_len + i] = 0;
  }
  list.tag = PV_LIST; list.v = pe_arena_len; list.aux = len;
  pe_arena_len += len;
  if (pe_invoke(pe_intern_c("byte_seq_leaf"), &list, 1, &seq) != PST_OK) goto done;
  if (pe_invoke(pe_intern_c("sha256_digest"), &seq, 1, &digest) != PST_OK) goto done;
  if (digest.tag != PV_REC) goto done;
  pe_root_push(&digest, 1);
  valid = pe_none();
  for (j = 0; j < digest.aux; j++) if (pe_arena_name[(uint32_t)digest.v + j] == pe_intern_c("valid")) valid = pe_arena_val[(uint32_t)digest.v + j];
  if (valid.tag != PV_BOOL || !valid.v) goto done;
  for (i = 0; i < 8; i++) {
    uint32_t fs = pe_intern_c(word_field[i]);
    PVal w = pe_none();
    for (j = 0; j < digest.aux; j++) if (pe_arena_name[(uint32_t)digest.v + j] == fs) w = pe_arena_val[(uint32_t)digest.v + j];
    if (w.tag != PV_REC) goto done;
    pe_root_push(&w, 1);
    for (j = 0; j < 4; j++) {
      PVal byte;
      if (pe_invoke(pe_intern_c(byte_fn[j]), &w, 1, &byte) != PST_OK) goto done;
      if (byte.tag != PV_INT || byte.v < 0 || byte.v > 255) goto done;
      out[i * 4u + j] = (uint8_t)byte.v;
    }
    pe_nroots--;
  }
  ok = 1;
done:
  /* release everything this digest allocated; no binding survives into the next digest */
  (void)mark;
  pe_arena_len = 0;                   /* engine hashing keeps no value between digests */
  pe_nroots = 0;
  pe_scratch_top = 0;
  for (i = 0; i < PE_MAX_SYM; i++) pe_bound[i] = 0;
  if (pe_gc_overflow) ok = 0;
  if (!ok) pe_flush_errors();
  return ok;
}

/* `--sha256 FILE` : print the sha256.mal digest of FILE (lowercase hex) */
static int pe_cmd_sha256(const char *path) {
  static unsigned char buf[1 << 22];
  static const char hx[] = "0123456789abcdef";
  DWORD len = 0;
  uint8_t d[32];
  char hex[66];
  uint32_t i;
  if (!read_file_bytes(path, buf, sizeof(buf), &len)) { pe_out("HARD-FAIL cannot read file\n"); return 3; }
  if (!pe_sha256_mal(buf, (uint32_t)len, d)) return 3;
  for (i = 0; i < 32; i++) { hex[i * 2] = hx[d[i] >> 4]; hex[i * 2 + 1] = hx[d[i] & 15]; }
  hex[64] = '\n'; hex[65] = '\0';
  pe_out(hex);
  return 0;
}
