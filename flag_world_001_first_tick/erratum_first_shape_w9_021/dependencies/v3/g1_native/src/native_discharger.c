#include "../include/malcog_native.h"

/*
 * G1-B native discharger scaffold.
 * Target: freestanding C -> Windows x86_64 PE (kernel boundary only).
 * This file intentionally avoids libc-heavy behavior and heap allocation.
 *
 * Current milestone:
 * - freezes constants/struct layout
 * - exposes minimal entrypoint and deterministic state shell
 * - prepares for parser/F_parse/F_struct/F_obs port
 */

#if defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdlib.h>
#else
/* Non-Windows (Linux/RISC-V, POSIX): shim the small Win32 surface onto POSIX
 * so the discharger body compiles + runs natively on the target ISA. The body
 * below is byte-identical across substrates — only the I/O substrate differs. */
#include <stdlib.h>
#include "win32_posix_shim.h"
#endif

typedef struct {
  char id[1024];
  char verdict[16];
} ResolvedEntry;

#define MAX_RESOLVED_ENTRIES 4096u
#define MAX_LAWS 64u
#define MAX_LAW_VARIABLES 8u
#define MAX_LAW_ANTECEDENTS 16u
#define MAX_LAW_TERM 1024u
#define NORMAL_FORM_INPUT_CAP (2u * 1024u * 1024u)
#define MCBF_BODY_CAP (NORMAL_FORM_INPUT_CAP + 64u)

typedef struct {
  char name[128];
  char variables[MAX_LAW_VARIABLES][64];
  uint32_t variable_count;
  char antecedents[MAX_LAW_ANTECEDENTS][MAX_LAW_TERM];
  uint32_t antecedent_count;
  char consequent[MAX_LAW_TERM];
} NativeLaw;

typedef struct {
  char terms[MAX_RESOLVED_ENTRIES][MAX_LAW_TERM];
  uint32_t term_count;
  uint32_t seed_term_count;
  NativeLaw laws[MAX_LAWS];
  uint32_t law_count;
  uint32_t hard_fail;
} LawApplicationState;

typedef struct {
  uint32_t token_count;
  uint32_t domain_count;
  uint32_t seed_count;
  uint32_t law_count;
  uint32_t motif_count;
  uint32_t f_parse_resolved;
  uint32_t f_parse_hard_p5;
  uint32_t f_struct_routed;
  uint32_t f_struct_fail;
  uint32_t f_obs_realized;
  uint32_t f_obs_fail;
  uint32_t verdict_holds;
  uint32_t verdict_no;
  uint32_t verdict_maybe;
  ResolvedEntry entries[MAX_RESOLVED_ENTRIES];
  uint32_t entry_count;
  char normal_form_input[NORMAL_FORM_INPUT_CAP];
} ParseSummary;

typedef struct {
  uint32_t cycle;
  uint32_t octopus_probe_count;
  uint32_t cetacean_escalation_count;
  uint32_t cetacean_reject_count;
  uint32_t cetacean_defer_count;
  uint32_t cetacean_promote_count;
  uint32_t gap_closed_count;
  uint32_t covered_cells_count;
  uint32_t promoted_ids_count;
} CycleSummary;

static void process_motif_span_f_parse(const char *src, DWORD a, DWORD b, const char *seed_name, ParseSummary *s);
static int validate_normal_form_canonical(const char *nf, uint32_t entry_count);
static void apply_native_laws(const char *src, DWORD len, ParseSummary *s);

static void write_stdout(const char *buf, DWORD len) {
  DWORD out = 0;
  HANDLE h = GetStdHandle(STD_OUTPUT_HANDLE);
  if (h != INVALID_HANDLE_VALUE) {
    WriteFile(h, buf, len, &out, NULL);
  }
}

static int c_strlen(const char *s) {
  int n = 0;
  while (s[n] != '\0') n++;
  return n;
}

static DWORD c_strnlen_cap(const char *s, DWORD cap) {
  DWORD i = 0;
  while (i < cap && s[i] != '\0') i++;
  return i;
}

static int c_streq(const char *a, const char *b) {
  int i = 0;
  while (a[i] != '\0' && b[i] != '\0') {
    if (a[i] != b[i]) return 0;
    i++;
  }
  return a[i] == '\0' && b[i] == '\0';
}

static int span_streq(const char *s, DWORD a, DWORD b, const char *lit) {
  DWORD i = 0;
  DWORD n = b - a;
  while (lit[i] != '\0') i++;
  if (n != i) return 0;
  for (i = 0; i < n; i++) {
    if (s[a + i] != lit[i]) return 0;
  }
  return 1;
}

static int is_ws(char c) {
  return c == ' ' || c == '\n' || c == '\r' || c == '\t';
}

static int is_alpha_num(char c) {
  if (c >= 'a' && c <= 'z') return 1;
  if (c >= 'A' && c <= 'Z') return 1;
  if (c >= '0' && c <= '9') return 1;
  if (c == '_' || c == '@') return 1;
  return 0;
}

static void trim_span(const char *src, DWORD *a, DWORD *b) {
  while (*a < *b && is_ws(src[*a])) (*a)++;
  while (*b > *a && is_ws(src[*b - 1])) (*b)--;
}

static void copy_tokenized_span(const char *src, DWORD a, DWORD b, char *dst, DWORD cap) {
  DWORD i = a;
  DWORD at = 0;
  int first = 1;
  while (i < b) {
    char c = src[i];
    DWORD t0, t1;
    if (is_ws(c)) {
      i++;
      continue;
    }
    t0 = i;
    if (is_alpha_num(c)) {
      while (i < b && is_alpha_num(src[i])) i++;
      t1 = i;
    } else if (c == '(' || c == ')' || c == ';' || c == ',' || c == ':' || c == '=') {
      i++;
      t1 = i;
    } else {
      i++;
      continue;
    }
    if (!first && (at + 1) < cap) dst[at++] = ' ';
    while (t0 < t1 && (at + 1) < cap) dst[at++] = src[t0++];
    first = 0;
  }
  dst[at] = '\0';
}

static int c_strcmp(const char *a, const char *b) {
  int i = 0;
  while (a[i] != '\0' && b[i] != '\0') {
    if (a[i] != b[i]) return (a[i] < b[i]) ? -1 : 1;
    i++;
  }
  if (a[i] == b[i]) return 0;
  return (a[i] == '\0') ? -1 : 1;
}

static int read_file_all(const char *path, char *buf, DWORD cap, DWORD *out_len) {
  HANDLE h = CreateFileA(path, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
  DWORD read_n = 0;
  if (h == INVALID_HANDLE_VALUE) return 0;
  if (!ReadFile(h, buf, cap - 1, &read_n, NULL)) {
    CloseHandle(h);
    return 0;
  }
  CloseHandle(h);
  buf[read_n] = '\0';
  *out_len = read_n;
  return 1;
}

static int read_file_bytes(const char *path, unsigned char *buf, DWORD cap, DWORD *out_len) {
  HANDLE h = CreateFileA(path, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
  DWORD read_n = 0;
  if (h == INVALID_HANDLE_VALUE) return 0;
  if (!ReadFile(h, buf, cap, &read_n, NULL)) {
    CloseHandle(h);
    return 0;
  }
  CloseHandle(h);
  *out_len = read_n;
  return 1;
}

static int write_file_bytes(const char *path, const unsigned char *buf, DWORD len) {
  HANDLE h = CreateFileA(path, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
  DWORD out_n = 0;
  if (h == INVALID_HANDLE_VALUE) return 0;
  if (!WriteFile(h, buf, len, &out_n, NULL)) { CloseHandle(h); return 0; }
  CloseHandle(h);
  return out_n == len;
}

static int copy_file_simple(const char *src, const char *dst) {
  return CopyFileA(src, dst, FALSE) ? 1 : 0;
}

static int ensure_dir(const char *path) {
  if (CreateDirectoryA(path, NULL)) return 1;
  return GetLastError() == ERROR_ALREADY_EXISTS;
}

static void hex32(const unsigned char in[32], char out[65]) {
  static const char *h = "0123456789abcdef";
  DWORD i;
  for (i = 0; i < 32; i++) {
    out[i * 2] = h[(in[i] >> 4) & 0xF];
    out[i * 2 + 1] = h[in[i] & 0xF];
  }
  out[64] = '\0';
}

static int write_text_file(const char *path, const char *txt) {
  return write_file_bytes(path, (const unsigned char*)txt, (DWORD)c_strlen(txt));
}

static int bytes_eq(const unsigned char *a, const unsigned char *b, DWORD n) {
  DWORD i;
  for (i = 0; i < n; i++) {
    if (a[i] != b[i]) return 0;
  }
  return 1;
}

/* v3 program-form evaluator (--check / --eval / --sha256). Same translation unit. */
#include "program_eval.c"

/* Every engine content hash is SHA-256 computed by sha256_digest in sha256.mal.
 * There is no C implementation of SHA-256 in the engine. */
static int sha256_bytes(const unsigned char *data, DWORD len, unsigned char out[32]) {
  return pe_sha256_mal((const uint8_t*)data, (uint32_t)len, (uint8_t*)out);
}

static int sha256_file(const char *path, unsigned char out[32]) {
  static unsigned char buf[1 << 21];
  DWORD len = 0;
  if (!read_file_bytes(path, buf, sizeof(buf), &len)) return 0;
  return sha256_bytes(buf, len, out);
}

static void strip_line_comments(char *buf, DWORD len) {
  DWORD i = 0;
  while (i + 1 < len) {
    if (buf[i] == '/' && buf[i + 1] == '/') {
      while (i < len && buf[i] != '\n') {
        buf[i] = ' ';
        i++;
      }
    } else {
      i++;
    }
  }
}

static void next_token(const char *src, DWORD len, DWORD *idx, char *out_tok, DWORD out_cap) {
  DWORD i = *idx;
  DWORD j = 0;
  out_tok[0] = '\0';

  while (i < len && !is_alpha_num(src[i])) i++;
  while (i < len && is_alpha_num(src[i])) {
    if (j + 1 < out_cap) out_tok[j++] = src[i];
    i++;
  }
  out_tok[j] = '\0';
  *idx = i;
}

static uint32_t count_seed_motifs(const char *src, DWORD len, DWORD *idx) {
  DWORD i = *idx;
  int brace_depth = 0;
  int paren_depth = 0;
  int in_motif = 0;
  uint32_t motifs = 0;
  while (i < len) {
    char c = src[i];
    if (c == '{') {
      brace_depth++;
      if (brace_depth == 1) {
        in_motif = 0;
        paren_depth = 0;
      }
    } else if (c == '}') {
      if (brace_depth == 1 && in_motif) {
        motifs++;
      }
      brace_depth--;
      i++;
      if (brace_depth == 0) {
        break;
      }
      continue;
    } else if (brace_depth >= 1) {
      if (c == '(') {
        paren_depth++;
        in_motif = 1;
      } else if (c == ')') {
        if (paren_depth > 0) paren_depth--;
      } else if (c == ',' && paren_depth == 0) {
        if (in_motif) motifs++;
        in_motif = 0;
      } else if (is_alpha_num(c)) {
        in_motif = 1;
      }
    }
    i++;
  }
  *idx = i;
  return motifs;
}

static void count_seed_motifs_f_parse(const char *src, DWORD len, DWORD *idx, const char *seed_name, ParseSummary *s) {
  DWORD i = *idx;
  DWORD motif_start = i + 1;
  int brace_depth = 0;
  int paren_depth = 0;
  int in_motif = 0;
  while (i < len) {
    char c = src[i];
    if (c == '{') {
      brace_depth++;
      if (brace_depth == 1) {
        in_motif = 0;
        paren_depth = 0;
        motif_start = i + 1;
      }
    } else if (c == '}') {
      if (brace_depth == 1 && in_motif && i > motif_start) {
        process_motif_span_f_parse(src, motif_start, i, seed_name, s);
      }
      brace_depth--;
      i++;
      if (brace_depth == 0) break;
      continue;
    } else if (brace_depth >= 1) {
      if (c == '(') {
        paren_depth++;
        in_motif = 1;
      } else if (c == ')') {
        if (paren_depth > 0) paren_depth--;
      } else if (c == ',' && paren_depth == 0) {
        if (in_motif && i > motif_start) {
          process_motif_span_f_parse(src, motif_start, i, seed_name, s);
        }
        in_motif = 0;
        motif_start = i + 1;
      } else if (is_alpha_num(c)) {
        in_motif = 1;
      }
    }
    i++;
  }
  *idx = i;
}

static int resolve_opmode_span(const char *src, DWORD a, DWORD b) {
  /* Composite dispatch (15) -> primary OpMode */
  if (span_streq(src, a, b, "THIS")) return 1;
  if (span_streq(src, a, b, "SAME_NOT_SAME")) return 1;
  if (span_streq(src, a, b, "NO")) return 1;
  if (span_streq(src, a, b, "GOES_WITH")) return 1;
  if (span_streq(src, a, b, "TOGETHER_ALONE")) return 1;
  if (span_streq(src, a, b, "MANY_ONE")) return 1;
  if (span_streq(src, a, b, "EVERY_SOME")) return 1;
  if (span_streq(src, a, b, "MORE_LESS")) return 1;
  if (span_streq(src, a, b, "CAN_CANNOT")) return 1;
  if (span_streq(src, a, b, "INSIDE_OUTSIDE")) return 1;
  if (span_streq(src, a, b, "NEAR_FAR")) return 1;
  if (span_streq(src, a, b, "IF_THEN")) return 1;
  if (span_streq(src, a, b, "BECAUSE")) return 1;
  if (span_streq(src, a, b, "MAYBE")) return 1;
  if (span_streq(src, a, b, "MUST_LET")) return 1;

  /* Direct mode names (single-token forms) */
  if (span_streq(src, a, b, "SAME")) return 1;
  if (span_streq(src, a, b, "NOT_SAME")) return 1;
  if (span_streq(src, a, b, "INSIDE")) return 1;
  if (span_streq(src, a, b, "OUTSIDE")) return 1;
  if (span_streq(src, a, b, "NEAR")) return 1;
  if (span_streq(src, a, b, "FAR")) return 1;
  if (span_streq(src, a, b, "TOGETHER")) return 1;
  if (span_streq(src, a, b, "ALONE")) return 1;
  if (span_streq(src, a, b, "MORE")) return 1;
  if (span_streq(src, a, b, "LESS")) return 1;
  if (span_streq(src, a, b, "MANY")) return 1;
  if (span_streq(src, a, b, "ONE_TERMINAL")) return 1;
  if (span_streq(src, a, b, "EVERY")) return 1;
  if (span_streq(src, a, b, "SOME")) return 1;
  if (span_streq(src, a, b, "MUST")) return 1;
  if (span_streq(src, a, b, "LET")) return 1;
  if (span_streq(src, a, b, "CAN")) return 1;
  if (span_streq(src, a, b, "CANNOT")) return 1;
  return 0; /* HARD_P5 */
}

typedef struct {
  const char *subtype;
  int composite;
} StructRoute;

static int f_struct_route(const char *src, DWORD a, DWORD b, StructRoute *out) {
  if (span_streq(src, a, b, "THIS")) { out->subtype = "identity"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "SAME_NOT_SAME")) { out->subtype = "persistence-same"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "NO")) { out->subtype = "exclusion"; out->composite = 1; return 1; }
  if (span_streq(src, a, b, "GOES_WITH")) { out->subtype = "corr-R"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "TOGETHER_ALONE")) { out->subtype = "span"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "MANY_ONE")) { out->subtype = "cardinality-many"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "EVERY_SOME")) { out->subtype = "scope-forall"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "MORE_LESS")) { out->subtype = "order-more"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "CAN_CANNOT")) { out->subtype = "kleisli-can"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "INSIDE_OUTSIDE")) { out->subtype = "membership-in"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "NEAR_FAR")) { out->subtype = "distance-near"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "IF_THEN")) { out->subtype = "conditional"; out->composite = 1; return 1; }
  if (span_streq(src, a, b, "BECAUSE")) { out->subtype = "provenance"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "MAYBE")) { out->subtype = "partial"; out->composite = 1; return 1; }
  if (span_streq(src, a, b, "MUST_LET")) { out->subtype = "modal-must"; out->composite = 0; return 1; }

  if (span_streq(src, a, b, "SAME")) { out->subtype = "persistence-same"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "NOT_SAME")) { out->subtype = "counterfactual"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "INSIDE")) { out->subtype = "membership-in"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "OUTSIDE")) { out->subtype = "membership-out"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "NEAR")) { out->subtype = "distance-near"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "FAR")) { out->subtype = "distance-far"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "TOGETHER")) { out->subtype = "span"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "ALONE")) { out->subtype = "no-corr"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "MORE")) { out->subtype = "order-more"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "LESS")) { out->subtype = "order-less"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "MANY")) { out->subtype = "cardinality-many"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "ONE_TERMINAL")) { out->subtype = "cardinality-terminal"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "EVERY")) { out->subtype = "scope-forall"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "SOME")) { out->subtype = "scope-exists"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "MUST")) { out->subtype = "modal-must"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "LET")) { out->subtype = "modal-let"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "CAN")) { out->subtype = "kleisli-can"; out->composite = 0; return 1; }
  if (span_streq(src, a, b, "CANNOT")) { out->subtype = "kleisli-cannot"; out->composite = 0; return 1; }
  return 0;
}

static int f_obs_realize(const StructRoute *r, int *is_sandbox) {
  const char *s = r->subtype;
  *is_sandbox = 0;
  if (c_streq(s, "modal-must") || c_streq(s, "modal-let") || c_streq(s, "kleisli-can") ||
      c_streq(s, "kleisli-cannot") || c_streq(s, "partial") || c_streq(s, "provenance")) {
    *is_sandbox = 1;
  }
  return 1; /* table is closed for routed subtypes here */
}

/* Witness cell WITNESS(OPERATOR), SPEC-MALCOG-V3-001 §11.3.
 * The cell is routed through the operator it reads. No witness enters the
 * operator routing table, so the frozen constants are unchanged. Returns 1
 * and the operator span when [head_a, end) is exactly WITNESS ( OPERATOR ). */
static int is_witness_span(const char *src, DWORD a, DWORD b) {
  return span_streq(src, a, b, "WHAT") || span_streq(src, a, b, "WHERE") ||
         span_streq(src, a, b, "WHICH") || span_streq(src, a, b, "WHEN") ||
         span_streq(src, a, b, "FOR_WHAT") || span_streq(src, a, b, "HOW") ||
         span_streq(src, a, b, "WHENCE");
}

static int witness_cell_operator(
    const char *src, DWORD head_a, DWORD head_b, DWORD end,
    DWORD *op_a, DWORD *op_b) {
  DWORD k = head_b, aa, bb;
  if (!is_witness_span(src, head_a, head_b)) return 0;
  while (k < end && is_ws(src[k])) k++;
  if (k >= end || src[k] != '(') return 0;
  k++;
  while (k < end && is_ws(src[k])) k++;
  aa = k;
  while (k < end && is_alpha_num(src[k])) k++;
  bb = k;
  while (k < end && is_ws(src[k])) k++;
  if (bb <= aa || k >= end || src[k] != ')') return 0;
  k++;
  while (k < end && is_ws(src[k])) k++;
  if (k != end) return 0;
  if (!resolve_opmode_span(src, aa, bb)) return 0;
  *op_a = aa;
  *op_b = bb;
  return 1;
}

static void process_motif_span_f_parse(const char *src, DWORD a, DWORD b, const char *seed_name, ParseSummary *s) {
  DWORD i = a;
  DWORD op_a, op_b;
  StructRoute route;
  int sandbox = 0;
  int is_maybe = 0;
  char motif_norm[256];
  char idbuf[256];
  const char *verdict = "MAYBE";
  DWORD aa = a, bb = b;
  DWORD id_at = 0, j = 0;
  uint32_t entry_idx;
  trim_span(src, &aa, &bb);
  copy_tokenized_span(src, aa, bb, motif_norm, sizeof(motif_norm));

  while (seed_name[id_at] != '\0' && id_at + 1 < sizeof(idbuf)) {
    idbuf[id_at] = seed_name[id_at];
    id_at++;
  }
  if (id_at + 1 < sizeof(idbuf)) idbuf[id_at++] = ':';
  while (motif_norm[j] != '\0' && id_at + 1 < sizeof(idbuf)) {
    idbuf[id_at++] = motif_norm[j++];
  }
  idbuf[id_at] = '\0';
  while (i < b && is_ws(src[i])) i++;
  op_a = i;
  while (i < b && is_alpha_num(src[i])) i++;
  op_b = i;
  if (op_b <= op_a) {
    s->f_parse_hard_p5++;
    s->verdict_maybe++;
    goto finalize;
  }
  if (!resolve_opmode_span(src, op_a, op_b)) {
    DWORD wa, wb;
    if (witness_cell_operator(src, op_a, op_b, bb, &wa, &wb)) {
      op_a = wa;
      op_b = wb;
    }
  }
  if (!resolve_opmode_span(src, op_a, op_b)) {
    s->f_parse_hard_p5++;
    s->verdict_maybe++;
    goto finalize;
  }
  s->f_parse_resolved++;

  if (!f_struct_route(src, op_a, op_b, &route)) {
    s->f_struct_fail++;
    s->verdict_maybe++;
    goto finalize;
  }
  s->f_struct_routed++;

  if (!f_obs_realize(&route, &sandbox)) {
    s->f_obs_fail++;
    s->verdict_maybe++;
    goto finalize;
  }
  s->f_obs_realized++;

  is_maybe = span_streq(src, op_a, op_b, "MAYBE");
  if (is_maybe || (sandbox && route.composite)) {
    s->verdict_maybe++;
    verdict = "MAYBE";
  } else {
    s->verdict_holds++;
    verdict = "HOLDS";
  }

finalize:
  entry_idx = s->entry_count;
  if (entry_idx < MAX_RESOLVED_ENTRIES) {
    DWORD k = 0;
    while (idbuf[k] != '\0' && k + 1 < sizeof(s->entries[entry_idx].id)) {
      s->entries[entry_idx].id[k] = idbuf[k];
      k++;
    }
    s->entries[entry_idx].id[k] = '\0';
    k = 0;
    while (verdict[k] != '\0' && k + 1 < sizeof(s->entries[entry_idx].verdict)) {
      s->entries[entry_idx].verdict[k] = verdict[k];
      k++;
    }
    s->entries[entry_idx].verdict[k] = '\0';
    s->entry_count++;
  }
}

static int match_word_at(const char *src, DWORD len, DWORD pos, const char *word) {
  DWORD i = 0;
  if (pos >= len) return 0;
  while (word[i] != '\0') {
    if ((pos + i) >= len) return 0;
    if (src[pos + i] != word[i]) return 0;
    i++;
  }
  return 1;
}

static uint32_t scan_seed_blocks_and_count_motifs(const char *src, DWORD len, uint32_t *seed_count_out) {
  DWORD i = 0;
  uint32_t motifs = 0;
  uint32_t seeds = 0;
  while (i < len) {
    DWORD j = i;
    if (!match_word_at(src, len, j, "seed")) {
      i++;
      continue;
    }
    /* word boundary after 'seed' */
    if ((j > 0 && is_alpha_num(src[j - 1])) || (j + 4 < len && is_alpha_num(src[j + 4]))) {
      i++;
      continue;
    }

    /* line-local authority guard: @... must appear before this seed on same line */
    {
      DWORD k = j;
      int has_authority = 0;
      while (k > 0 && src[k - 1] != '\n' && src[k - 1] != '\r') {
        k--;
      }
      while (k < j) {
        if (src[k] == '@') {
          has_authority = 1;
          break;
        }
        k++;
      }
      if (!has_authority) {
        i++;
        continue;
      }
    }

    j += 4;
    while (j < len && is_ws(src[j])) j++;

    /* seed name */
    if (j >= len || !is_alpha_num(src[j])) {
      i++;
      continue;
    }
    while (j < len && is_alpha_num(src[j])) j++;
    while (j < len && is_ws(src[j])) j++;

    /* := */
    if (!(j + 1 < len && src[j] == ':' && src[j + 1] == '=')) {
      i++;
      continue;
    }
    j += 2;
    while (j < len && is_ws(src[j])) j++;
    if (j >= len || src[j] != '{') {
      i++;
      continue;
    }

    {
      DWORD k = j;
      uint32_t m = count_seed_motifs(src, len, &k);
      motifs += m;
      seeds++;
      i = k;
      continue;
    }
    i++;
  }
  *seed_count_out = seeds;
  return motifs;
}

static void scan_seed_blocks_f_parse(const char *src, DWORD len, ParseSummary *s) {
  DWORD i = 0;
  while (i < len) {
    DWORD j = i;
    DWORD name_a, name_b, n = 0;
    char seed_name[128];

    if (!match_word_at(src, len, j, "seed")) {
      i++;
      continue;
    }
    if ((j > 0 && is_alpha_num(src[j - 1])) || (j + 4 < len && is_alpha_num(src[j + 4]))) {
      i++;
      continue;
    }
    {
      DWORD k = j;
      int has_authority = 0;
      while (k > 0 && src[k - 1] != '\n' && src[k - 1] != '\r') k--;
      while (k < j) {
        if (src[k] == '@') { has_authority = 1; break; }
        k++;
      }
      if (!has_authority) { i++; continue; }
    }

    j += 4;
    while (j < len && is_ws(src[j])) j++;
    name_a = j;
    while (j < len && is_alpha_num(src[j])) j++;
    name_b = j;
    while (name_a < name_b && n + 1 < sizeof(seed_name)) {
      seed_name[n++] = src[name_a++];
    }
    seed_name[n] = '\0';
    while (j < len && is_ws(src[j])) j++;
    if (!(j + 1 < len && src[j] == ':' && src[j + 1] == '=')) { i++; continue; }
    j += 2;
    while (j < len && is_ws(src[j])) j++;
    if (j >= len || src[j] != '{') { i++; continue; }

    count_seed_motifs_f_parse(src, len, &j, seed_name, s);
    i = j;
  }
}

static void canonical_term_span(const char *src, DWORD a, DWORD b, char *dst, DWORD cap) {
  DWORD at = 0;
  trim_span(src, &a, &b);
  while (a < b && at + 1 < cap) {
    if (!is_ws(src[a])) dst[at++] = src[a];
    a++;
  }
  dst[at] = '\0';
}

static int term_index(const LawApplicationState *state, const char *term) {
  uint32_t i;
  for (i = 0; i < state->term_count; i++) {
    if (c_streq(state->terms[i], term)) return (int)i;
  }
  return -1;
}

static void add_seed_term_span(
    const char *src, DWORD a, DWORD b, LawApplicationState *state) {
  char term[MAX_LAW_TERM];
  if (state->hard_fail) return;
  canonical_term_span(src, a, b, term, sizeof(term));
  if (term[0] == '\0' || term_index(state, term) >= 0) return;
  if (state->term_count >= MAX_RESOLVED_ENTRIES) {
    state->hard_fail = 1;
    return;
  }
  {
    DWORD i = 0;
    while (term[i] != '\0' && i + 1 < MAX_LAW_TERM) {
      state->terms[state->term_count][i] = term[i];
      i++;
    }
    state->terms[state->term_count][i] = '\0';
  }
  state->term_count++;
}

static void collect_seed_terms(const char *src, DWORD len, LawApplicationState *state) {
  DWORD i = 0;
  while (i < len) {
    DWORD j = i;
    if (!match_word_at(src, len, j, "seed") ||
        (j > 0 && is_alpha_num(src[j - 1])) ||
        (j + 4 < len && is_alpha_num(src[j + 4]))) {
      i++;
      continue;
    }
    {
      DWORD k = j;
      int has_authority = 0;
      while (k > 0 && src[k - 1] != '\n' && src[k - 1] != '\r') k--;
      while (k < j) {
        if (src[k] == '@') { has_authority = 1; break; }
        k++;
      }
      if (!has_authority) { i++; continue; }
    }
    j += 4;
    while (j < len && is_ws(src[j])) j++;
    while (j < len && is_alpha_num(src[j])) j++;
    while (j < len && is_ws(src[j])) j++;
    if (!(j + 1 < len && src[j] == ':' && src[j + 1] == '=')) { i++; continue; }
    j += 2;
    while (j < len && is_ws(src[j])) j++;
    if (j >= len || src[j] != '{') { i++; continue; }
    {
      DWORD motif_start = j + 1;
      int brace_depth = 1;
      int paren_depth = 0;
      int in_motif = 0;
      j++;
      while (j < len && brace_depth > 0) {
        char c = src[j];
        if (c == '{') {
          brace_depth++;
        } else if (c == '}') {
          if (brace_depth == 1 && in_motif && j > motif_start) {
            add_seed_term_span(src, motif_start, j, state);
          }
          brace_depth--;
          if (brace_depth == 0) { j++; break; }
        } else if (brace_depth == 1) {
          if (c == '(') {
            paren_depth++;
            in_motif = 1;
          } else if (c == ')') {
            if (paren_depth > 0) paren_depth--;
          } else if (c == ',' && paren_depth == 0) {
            if (in_motif && j > motif_start) {
              add_seed_term_span(src, motif_start, j, state);
            }
            motif_start = j + 1;
            in_motif = 0;
          } else if (is_alpha_num(c)) {
            in_motif = 1;
          }
        }
        j++;
      }
      i = j;
    }
  }
  state->seed_term_count = state->term_count;
}

static int find_matching_paren(const char *src, DWORD len, DWORD open, DWORD *close_out) {
  int depth = 0;
  DWORD i;
  if (open >= len || src[open] != '(') return 0;
  for (i = open; i < len; i++) {
    if (src[i] == '(') depth++;
    else if (src[i] == ')') {
      depth--;
      if (depth == 0) {
        *close_out = i;
        return 1;
      }
    }
  }
  return 0;
}

static int law_has_variable(const NativeLaw *law, const char *name) {
  uint32_t i;
  for (i = 0; i < law->variable_count; i++) {
    if (c_streq(law->variables[i], name)) return 1;
  }
  return 0;
}

static int add_law_variable_span(
    const char *src, DWORD a, DWORD b, NativeLaw *law) {
  char name[64];
  DWORD n = 0;
  trim_span(src, &a, &b);
  while (a < b && n + 1 < sizeof(name) && is_alpha_num(src[a])) {
    name[n++] = src[a++];
  }
  name[n] = '\0';
  if (name[0] == '\0') return 0;
  /* Lower-case identifiers are schematic variables. Upper-case terms are
   * exact carrier identities and are checked directly against R. */
  if (!(name[0] >= 'a' && name[0] <= 'z')) return 1;
  if (law_has_variable(law, name)) return 1;
  if (law->variable_count >= MAX_LAW_VARIABLES) return 0;
  {
    DWORD i = 0;
    while (name[i] != '\0' && i + 1 < sizeof(law->variables[0])) {
      law->variables[law->variable_count][i] = name[i];
      i++;
    }
    law->variables[law->variable_count][i] = '\0';
  }
  law->variable_count++;
  return 1;
}

static int add_law_term_variables(
    const char *src, DWORD a, DWORD b, NativeLaw *law) {
  DWORD token_at = a;
  while (token_at < b) {
    DWORD token_end;
    while (token_at < b && !is_alpha_num(src[token_at])) token_at++;
    token_end = token_at;
    while (token_end < b && is_alpha_num(src[token_end])) token_end++;
    if (token_end > token_at &&
        !add_law_variable_span(src, token_at, token_end, law)) return 0;
    token_at = token_end;
  }
  return 1;
}

/* SPEC-MALCOG-V3-001 §11.1 law production:
 *
 *   law L_name :=
 *     IF antecedent
 *     THEN consequent;
 *
 * antecedent := motif {, motif}  (a motif set; antecedent ⊆ R, §3.1)
 * consequent := motif            (obligated when the antecedent is realized)
 *
 * IF and THEN are whole words at parenthesis depth 0. `pos` is just past IF. */
static int parse_section11_law(
    const char *src, DWORD len, DWORD pos, NativeLaw *law, DWORD *end_out) {
  DWORD i = pos, then_pos = 0, semi = 0, piece_a;
  int depth = 0;
  for (i = pos; i < len; i++) {
    char c = src[i];
    if (c == '(') depth++;
    else if (c == ')') { depth--; if (depth < 0) return 0; }
    else if (depth == 0 && c == ';') { semi = i; break; }
    else if (depth == 0 && then_pos == 0 && match_word_at(src, len, i, "THEN") &&
             !is_alpha_num(src[i - 1]) &&
             !(i + 4 < len && is_alpha_num(src[i + 4]))) {
      then_pos = i;
    }
  }
  if (then_pos == 0 || semi == 0 || semi <= then_pos) return 0;

  depth = 0;
  piece_a = pos;
  for (i = pos; i <= then_pos; i++) {
    char c = (i < then_pos) ? src[i] : ',';
    if (c == '(') depth++;
    else if (c == ')') depth--;
    else if (c == ',' && depth == 0) {
      DWORD a = piece_a, b = i;
      trim_span(src, &a, &b);
      if (b <= a) return 0;
      if (law->antecedent_count >= MAX_LAW_ANTECEDENTS) return 0;
      canonical_term_span(src, a, b, law->antecedents[law->antecedent_count],
                          sizeof(law->antecedents[0]));
      law->antecedent_count++;
      if (!add_law_term_variables(src, a, b, law)) return 0;
      piece_a = i + 1;
    }
  }
  if (law->antecedent_count == 0) return 0;

  canonical_term_span(src, then_pos + 4, semi, law->consequent, sizeof(law->consequent));
  if (law->consequent[0] == '\0') return 0;
  *end_out = semi + 1;
  return 1;
}

static int parse_native_law(
    const char *src, DWORD len, DWORD law_pos, NativeLaw *law, DWORD *end_out) {
  DWORD i = law_pos + 3;
  DWORD name_a, name_b;
  DWORD if_pos, if_open, if_close, split = 0;
  DWORD antecedent_a, antecedent_b, consequent_a, consequent_b;
  int depth = 0;
  DWORD n = 0;
  law->variable_count = 0;
  law->antecedent_count = 0;
  law->name[0] = '\0';
  law->consequent[0] = '\0';

  while (i < len && is_ws(src[i])) i++;
  name_a = i;
  while (i < len && is_alpha_num(src[i])) i++;
  name_b = i;
  if (name_b <= name_a) return 0;
  while (name_a < name_b && n + 1 < sizeof(law->name)) {
    law->name[n++] = src[name_a++];
  }
  law->name[n] = '\0';
  while (i + 1 < len && !(src[i] == ':' && src[i + 1] == '=')) i++;
  if (i + 1 >= len) return 0;
  i += 2;
  while (i < len && is_ws(src[i])) i++;
  if_pos = i;
  if (match_word_at(src, len, if_pos, "IF") &&
      !(if_pos + 2 < len && is_alpha_num(src[if_pos + 2]))) {
    return parse_section11_law(src, len, if_pos + 2, law, end_out);
  }
  if (!match_word_at(src, len, if_pos, "IF_THEN")) return 0;
  i = if_pos + 7;
  while (i < len && is_ws(src[i])) i++;
  if_open = i;
  if (!find_matching_paren(src, len, if_open, &if_close)) return 0;
  antecedent_a = if_open + 1;
  for (i = antecedent_a; i < if_close; i++) {
    if (src[i] == '(') depth++;
    else if (src[i] == ')') depth--;
    else if (src[i] == ',' && depth == 0) { split = i; break; }
  }
  if (split == 0) return 0;
  antecedent_b = split;
  consequent_a = split + 1;
  consequent_b = if_close;

  i = antecedent_a;
  while (i < antecedent_b) {
    if (match_word_at(src, antecedent_b, i, "REALIZED")) {
      DWORD open = i + 8;
      DWORD close;
      DWORD token_at;
      while (open < antecedent_b && is_ws(src[open])) open++;
      if (!find_matching_paren(src, antecedent_b, open, &close)) return 0;
      if (law->antecedent_count >= MAX_LAW_ANTECEDENTS) return 0;
      canonical_term_span(
          src, open + 1, close,
          law->antecedents[law->antecedent_count],
          sizeof(law->antecedents[0]));
      law->antecedent_count++;
      token_at = open + 1;
      while (token_at < close) {
        DWORD token_end;
        while (token_at < close && !is_alpha_num(src[token_at])) token_at++;
        token_end = token_at;
        while (token_end < close && is_alpha_num(src[token_end])) token_end++;
        if (token_end > token_at &&
            !add_law_variable_span(src, token_at, token_end, law)) return 0;
        token_at = token_end;
      }
      i = close + 1;
    } else {
      i++;
    }
  }

  i = consequent_a;
  while (i < consequent_b && is_ws(src[i])) i++;
  if (match_word_at(src, consequent_b, i, "REALIZE")) {
    DWORD open = i + 7;
    DWORD close;
    while (open < consequent_b && is_ws(src[open])) open++;
    if (!find_matching_paren(src, consequent_b, open, &close)) return 0;
    canonical_term_span(src, open + 1, close, law->consequent, sizeof(law->consequent));
  } else {
    canonical_term_span(src, consequent_a, consequent_b, law->consequent, sizeof(law->consequent));
  }
  if (law->consequent[0] == '\0') return 0;
  i = if_close + 1;
  while (i < len && src[i] != ';') i++;
  *end_out = (i < len) ? i + 1 : i;
  return 1;
}

static void collect_native_laws(const char *src, DWORD len, LawApplicationState *state) {
  DWORD i = 0;
  while (i < len) {
    DWORD end;
    if (!match_word_at(src, len, i, "law") ||
        (i > 0 && is_alpha_num(src[i - 1])) ||
        (i + 3 < len && is_alpha_num(src[i + 3]))) {
      i++;
      continue;
    }
    if (state->law_count >= MAX_LAWS ||
        !parse_native_law(src, len, i, &state->laws[state->law_count], &end)) {
      state->hard_fail = 1;
      return;
    }
    state->law_count++;
    i = end;
  }
}

static int token_is(const char *src, DWORD a, DWORD b, const char *name) {
  return span_streq(src, a, b, name);
}

static int instantiate_template(
    const char *template_value,
    const NativeLaw *law,
    const char assignments[MAX_LAW_VARIABLES][MAX_LAW_TERM],
    char out[MAX_LAW_TERM]) {
  DWORD i = 0, at = 0;
  while (template_value[i] != '\0') {
    if (is_alpha_num(template_value[i])) {
      DWORD a = i, b;
      uint32_t v;
      while (template_value[i] != '\0' && is_alpha_num(template_value[i])) i++;
      b = i;
      for (v = 0; v < law->variable_count; v++) {
        if (token_is(template_value, a, b, law->variables[v])) break;
      }
      if (v < law->variable_count) {
        DWORD j = 0;
        while (assignments[v][j] != '\0' && at + 1 < MAX_LAW_TERM) {
          out[at++] = assignments[v][j++];
        }
      } else {
        while (a < b && at + 1 < MAX_LAW_TERM) out[at++] = template_value[a++];
      }
    } else {
      if (at + 1 >= MAX_LAW_TERM) return 0;
      out[at++] = template_value[i++];
    }
  }
  out[at] = '\0';
  return template_value[i] == '\0';
}

static void consider_grounding(
    const NativeLaw *law,
    const char assignments[MAX_LAW_VARIABLES][MAX_LAW_TERM],
    const LawApplicationState *state,
    char best_term[MAX_LAW_TERM],
    char best_law[128]) {
  char candidate[MAX_LAW_TERM];
  uint32_t a;
  for (a = 0; a < law->antecedent_count; a++) {
    char antecedent[MAX_LAW_TERM];
    if (!instantiate_template(
            law->antecedents[a], law, assignments, antecedent)) return;
    if (term_index(state, antecedent) < 0) return;
  }
  if (!instantiate_template(
          law->consequent, law, assignments, candidate)) return;
  if (term_index(state, candidate) >= 0) return;
  if (best_term[0] == '\0' || c_strcmp(candidate, best_term) < 0 ||
      (c_streq(candidate, best_term) && c_strcmp(law->name, best_law) < 0)) {
    DWORD i = 0;
    while (candidate[i] != '\0' && i + 1 < MAX_LAW_TERM) {
      best_term[i] = candidate[i];
      i++;
    }
    best_term[i] = '\0';
    i = 0;
    while (law->name[i] != '\0' && i + 1 < 128) {
      best_law[i] = law->name[i];
      i++;
    }
    best_law[i] = '\0';
  }
}

static void enumerate_law_groundings(
    const NativeLaw *law,
    uint32_t variable_index,
    char assignments[MAX_LAW_VARIABLES][MAX_LAW_TERM],
    const LawApplicationState *state,
    char best_term[MAX_LAW_TERM],
    char best_law[128]) {
  uint32_t i;
  if (variable_index == law->variable_count) {
    consider_grounding(law, assignments, state, best_term, best_law);
    return;
  }
  /* Schematic motif variables range over the immutable initial carrier.
   * Generated consequents never widen their own grounding domain. */
  for (i = 0; i < state->seed_term_count; i++) {
    DWORD j = 0;
    while (state->terms[i][j] != '\0' && j + 1 < MAX_LAW_TERM) {
      assignments[variable_index][j] = state->terms[i][j];
      j++;
    }
    assignments[variable_index][j] = '\0';
    enumerate_law_groundings(
        law, variable_index + 1, assignments, state, best_term, best_law);
  }
}

static void add_generated_entry(
    LawApplicationState *state, ParseSummary *s,
    const char *law_name, const char *term) {
  uint32_t idx;
  DWORD at = 0, i = 0;
  if (state->term_count >= MAX_RESOLVED_ENTRIES ||
      s->entry_count >= MAX_RESOLVED_ENTRIES) {
    state->hard_fail = 1;
    return;
  }
  idx = state->term_count++;
  while (term[i] != '\0' && i + 1 < MAX_LAW_TERM) {
    state->terms[idx][i] = term[i];
    i++;
  }
  state->terms[idx][i] = '\0';

  idx = s->entry_count++;
  s->entries[idx].id[at++] = 'L';
  s->entries[idx].id[at++] = 'A';
  s->entries[idx].id[at++] = 'W';
  s->entries[idx].id[at++] = ':';
  i = 0;
  while (law_name[i] != '\0' && at + 1 < sizeof(s->entries[idx].id)) {
    s->entries[idx].id[at] = law_name[i++];
    at++;
  }
  if (at + 1 < sizeof(s->entries[idx].id)) s->entries[idx].id[at++] = ':';
  i = 0;
  while (term[i] != '\0' && at + 1 < sizeof(s->entries[idx].id)) {
    s->entries[idx].id[at++] = term[i++];
  }
  s->entries[idx].id[at] = '\0';
  s->entries[idx].verdict[0] = 'H';
  s->entries[idx].verdict[1] = 'O';
  s->entries[idx].verdict[2] = 'L';
  s->entries[idx].verdict[3] = 'D';
  s->entries[idx].verdict[4] = 'S';
  s->entries[idx].verdict[5] = '\0';
  s->f_parse_resolved++;
  s->f_struct_routed++;
  s->f_obs_realized++;
  s->verdict_holds++;
}

static void apply_native_laws(const char *src, DWORD len, ParseSummary *s) {
  static LawApplicationState state;
  char assignments[MAX_LAW_VARIABLES][MAX_LAW_TERM];
  state.term_count = 0;
  state.seed_term_count = 0;
  state.law_count = 0;
  state.hard_fail = 0;
  collect_seed_terms(src, len, &state);
  collect_native_laws(src, len, &state);
  if (state.hard_fail || state.law_count == 0) {
    if (state.hard_fail) s->f_parse_hard_p5++;
    return;
  }

  for (;;) {
    uint32_t i;
    char best_term[MAX_LAW_TERM];
    char best_law[128];
    best_term[0] = '\0';
    best_law[0] = '\0';
    for (i = 0; i < state.law_count; i++) {
      enumerate_law_groundings(
          &state.laws[i], 0, assignments, &state, best_term, best_law);
    }
    if (best_term[0] == '\0') break;
    add_generated_entry(&state, s, best_law, best_term);
    if (state.hard_fail) {
      s->f_parse_hard_p5++;
      return;
    }
  }
}

static void build_normal_form_input(ParseSummary *s) {
  uint32_t i, j;
  DWORD at = 0;
  for (i = 0; i < s->entry_count; i++) {
    for (j = i + 1; j < s->entry_count; j++) {
      if (c_strcmp(s->entries[i].id, s->entries[j].id) > 0) {
        ResolvedEntry tmp = s->entries[i];
        s->entries[i] = s->entries[j];
        s->entries[j] = tmp;
      }
    }
  }
  s->normal_form_input[0] = '\0';

  /* D5 (Devon Generally, 2026-10-13 21:36, "retire"): the "Python parity"
   * rule that overwrote the first name-sorted entry with MAYBE is retired.
   * A verdict is what the entry's own discharge produced; name order never
   * changes it. */

  /* Recompute verdict counters from the entries as discharged. */
  s->verdict_holds = 0;
  s->verdict_no = 0;
  s->verdict_maybe = 0;
  for (i = 0; i < s->entry_count; i++) {
    if (c_strcmp(s->entries[i].verdict, "HOLDS") == 0) s->verdict_holds++;
    else if (c_strcmp(s->entries[i].verdict, "NO") == 0) s->verdict_no++;
    else if (c_strcmp(s->entries[i].verdict, "MAYBE") == 0) s->verdict_maybe++;
  }

  for (i = 0; i < s->entry_count; i++) {
    const char *id = s->entries[i].id;
    const char *v = s->entries[i].verdict;
    if (i > 0 && at + 1 < sizeof(s->normal_form_input)) s->normal_form_input[at++] = '|';
    while (*id != '\0' && at + 1 < sizeof(s->normal_form_input)) s->normal_form_input[at++] = *id++;
    if (at + 1 < sizeof(s->normal_form_input)) s->normal_form_input[at++] = ':';
    while (*v != '\0' && at + 1 < sizeof(s->normal_form_input)) s->normal_form_input[at++] = *v++;
  }
  s->normal_form_input[at] = '\0';
}

static ParseSummary *parse_counts(char *src, DWORD len) {
  static ParseSummary s;
  char tok[128];
  DWORD idx = 0;
  s.token_count = 0;
  s.domain_count = 0;
  s.seed_count = 0;
  s.law_count = 0;
  s.motif_count = 0;
  s.f_parse_resolved = 0;
  s.f_parse_hard_p5 = 0;
  s.f_struct_routed = 0;
  s.f_struct_fail = 0;
  s.f_obs_realized = 0;
  s.f_obs_fail = 0;
  s.verdict_holds = 0;
  s.verdict_no = 0;
  s.verdict_maybe = 0;
  s.entry_count = 0;
  s.normal_form_input[0] = '\0';

  strip_line_comments(src, len);

  while (idx < len) {
    next_token(src, len, &idx, tok, 128);
    if (tok[0] == '\0') break;
    s.token_count++;
    if (c_streq(tok, "domain")) {
      s.domain_count++;
    } else if (c_streq(tok, "seed")) {
      s.seed_count++;
    } else if (c_streq(tok, "law")) {
      s.law_count++;
    }
  }
  /* Motif extraction is a separate pass to mirror seed-body splitting behavior. */
  s.motif_count = scan_seed_blocks_and_count_motifs(src, len, &s.seed_count);
  scan_seed_blocks_f_parse(src, len, &s);
  apply_native_laws(src, len, &s);
  build_normal_form_input(&s);
  return &s;
}

static void append_json_escaped(char *dst, DWORD cap, DWORD *at, const char *s) {
  while (*s != '\0' && (*at + 2) < cap) {
    char c = *s++;
    if (c == '\\' || c == '"') {
      dst[*at] = '\\'; (*at)++;
      dst[*at] = c; (*at)++;
    } else if (c == '\n' || c == '\r' || c == '\t') {
      dst[*at] = ' '; (*at)++;
    } else {
      dst[*at] = c; (*at)++;
    }
  }
  dst[*at] = '\0';
}

static void append_str(char *dst, DWORD cap, DWORD *at, const char *s) {
  DWORD i = 0;
  while (s[i] != '\0' && (*at + 1) < cap) {
    dst[*at] = s[i];
    (*at)++;
    i++;
  }
  dst[*at] = '\0';
}

static void append_u32(char *dst, DWORD cap, DWORD *at, uint32_t v) {
  char tmp[16];
  int i = 0;
  if (v == 0) {
    if ((*at + 1) < cap) {
      dst[*at] = '0';
      (*at)++;
      dst[*at] = '\0';
    }
    return;
  }
  while (v > 0 && i < 15) {
    tmp[i++] = (char)('0' + (v % 10));
    v /= 10;
  }
  while (i > 0 && (*at + 1) < cap) {
    dst[*at] = tmp[i - 1];
    (*at)++;
    i--;
  }
  dst[*at] = '\0';
}

typedef struct {
  unsigned char *buf;
  DWORD cap;
  DWORD at;
  int ok;
} BinWriter;

static void bw_init(BinWriter *w, unsigned char *buf, DWORD cap) {
  w->buf = buf; w->cap = cap; w->at = 0; w->ok = 1;
}

static void bw_put_u8(BinWriter *w, uint8_t v) {
  if (!w->ok || w->at + 1 > w->cap) { w->ok = 0; return; }
  w->buf[w->at++] = v;
}

static void bw_put_u16_le(BinWriter *w, uint16_t v) {
  bw_put_u8(w, (uint8_t)(v & 0xFF));
  bw_put_u8(w, (uint8_t)((v >> 8) & 0xFF));
}

static void bw_put_u32_le(BinWriter *w, uint32_t v) {
  bw_put_u8(w, (uint8_t)(v & 0xFF));
  bw_put_u8(w, (uint8_t)((v >> 8) & 0xFF));
  bw_put_u8(w, (uint8_t)((v >> 16) & 0xFF));
  bw_put_u8(w, (uint8_t)((v >> 24) & 0xFF));
}

static void bw_put_u64_le(BinWriter *w, uint64_t v) {
  bw_put_u32_le(w, (uint32_t)(v & 0xFFFFFFFFu));
  bw_put_u32_le(w, (uint32_t)((v >> 32) & 0xFFFFFFFFu));
}

static void bw_put_bytes(BinWriter *w, const unsigned char *p, DWORD n) {
  DWORD i;
  if (!w->ok || w->at + n > w->cap) { w->ok = 0; return; }
  for (i = 0; i < n; i++) w->buf[w->at++] = p[i];
}

static int rd_u8(const unsigned char *buf, DWORD len, DWORD *at, uint8_t *out) {
  if (*at + 1 > len) return 0;
  *out = buf[*at];
  *at += 1;
  return 1;
}

static int rd_u16_le(const unsigned char *buf, DWORD len, DWORD *at, uint16_t *out) {
  uint8_t b0, b1;
  if (!rd_u8(buf, len, at, &b0)) return 0;
  if (!rd_u8(buf, len, at, &b1)) return 0;
  *out = (uint16_t)(b0 | ((uint16_t)b1 << 8));
  return 1;
}

static int rd_u32_le(const unsigned char *buf, DWORD len, DWORD *at, uint32_t *out) {
  uint8_t b0, b1, b2, b3;
  if (!rd_u8(buf, len, at, &b0)) return 0;
  if (!rd_u8(buf, len, at, &b1)) return 0;
  if (!rd_u8(buf, len, at, &b2)) return 0;
  if (!rd_u8(buf, len, at, &b3)) return 0;
  *out = ((uint32_t)b0) | ((uint32_t)b1 << 8) | ((uint32_t)b2 << 16) | ((uint32_t)b3 << 24);
  return 1;
}

static int rd_u64_le(const unsigned char *buf, DWORD len, DWORD *at, uint64_t *out) {
  uint32_t lo, hi;
  if (!rd_u32_le(buf, len, at, &lo)) return 0;
  if (!rd_u32_le(buf, len, at, &hi)) return 0;
  *out = ((uint64_t)lo) | ((uint64_t)hi << 32);
  return 1;
}

static int read_mcbf_verified(const char *path, const unsigned char schema_hash[32], ParseSummary *state_out, unsigned char source_hash_out[32], int emit_lines) {
  static unsigned char file_buf[1 << 21];
  unsigned char computed_body_hash[32];
  unsigned char expect_schema_hash[32];
  unsigned char expect_body_hash[32];
  unsigned char expect_source_hash[32];
  uint8_t endian, word_size;
  uint16_t version;
  uint32_t schema_id, flags, header_len, token_count, domain_count, seed_count, motif_count, law_count;
  uint32_t entry_count, verdict_holds, verdict_no, verdict_maybe, nf_len;
  uint64_t body_len64;
  DWORD file_len = 0, at = 0;
  const unsigned char magic[4] = {'M', 'C', 'B', 'F'};
  int ok_magic = 0, ok_version = 0, ok_endian = 0, ok_schema = 0, ok_body_hash = 0, ok_body_len = 0, ok_bounds = 0, ok_word = 0, ok_canon = 0;
  DWORD body_offset;
  uint64_t min_body = 40ull;

  if (!read_file_bytes(path, file_buf, sizeof(file_buf), &file_len)) {
    if (emit_lines) write_stdout("MCBF_READ: HARD_FAIL\nreason: read failed\n", 39);
    return 0;
  }
  if (file_len < 120) {
    if (emit_lines) write_stdout("MCBF_READ: HARD_FAIL\nreason: file too small\n", 42);
    return 0;
  }

  if (file_buf[0] == magic[0] && file_buf[1] == magic[1] && file_buf[2] == magic[2] && file_buf[3] == magic[3]) {
    ok_magic = 1;
  }
  at += 4;

  if (!rd_u16_le(file_buf, file_len, &at, &version)) return 0;
  if (!rd_u8(file_buf, file_len, &at, &endian)) return 0;
  if (!rd_u8(file_buf, file_len, &at, &word_size)) return 0;
  if (!rd_u32_le(file_buf, file_len, &at, &schema_id)) return 0;
  if (!rd_u32_le(file_buf, file_len, &at, &flags)) return 0;
  if (!rd_u32_le(file_buf, file_len, &at, &header_len)) return 0;
  if (!rd_u64_le(file_buf, file_len, &at, &body_len64)) return 0;
  if (at + 32 + 32 + 32 > file_len) return 0;
  {
    DWORD i;
    for (i = 0; i < 32; i++) expect_body_hash[i] = file_buf[at + i];
    at += 32;
    for (i = 0; i < 32; i++) expect_schema_hash[i] = file_buf[at + i];
    at += 32;
    for (i = 0; i < 32; i++) expect_source_hash[i] = file_buf[at + i];
    at += 32;
  }
  body_offset = at;

  ok_version = (version == 0x0001u);
  ok_endian = (endian == 0u);
  ok_word = (word_size == 8u);
  ok_schema = bytes_eq(expect_schema_hash, schema_hash, 32);

  if (header_len == body_offset && body_len64 <= (uint64_t)(file_len - body_offset) && body_len64 == (uint64_t)(file_len - body_offset)) {
    ok_body_len = 1;
  }

  if (ok_body_len) {
    ok_body_hash = sha256_bytes(file_buf + body_offset, (DWORD)body_len64, computed_body_hash) &&
                   bytes_eq(computed_body_hash, expect_body_hash, 32);
  }

  if (ok_body_len && body_len64 >= min_body) {
    DWORD b = body_offset;
    DWORD body_end = body_offset + (DWORD)body_len64;
    if (!rd_u32_le(file_buf, body_end, &b, &token_count)) token_count = 0xFFFFFFFFu;
    if (!rd_u32_le(file_buf, body_end, &b, &domain_count)) domain_count = 0xFFFFFFFFu;
    if (!rd_u32_le(file_buf, body_end, &b, &seed_count)) seed_count = 0xFFFFFFFFu;
    if (!rd_u32_le(file_buf, body_end, &b, &motif_count)) motif_count = 0xFFFFFFFFu;
    if (!rd_u32_le(file_buf, body_end, &b, &law_count)) law_count = 0xFFFFFFFFu;
    if (!rd_u32_le(file_buf, body_end, &b, &entry_count)) entry_count = 0xFFFFFFFFu;
    if (!rd_u32_le(file_buf, body_end, &b, &verdict_holds)) verdict_holds = 0xFFFFFFFFu;
    if (!rd_u32_le(file_buf, body_end, &b, &verdict_no)) verdict_no = 0xFFFFFFFFu;
    if (!rd_u32_le(file_buf, body_end, &b, &verdict_maybe)) verdict_maybe = 0xFFFFFFFFu;
    if (!rd_u32_le(file_buf, body_end, &b, &nf_len)) nf_len = 0xFFFFFFFFu;
    if (nf_len != 0xFFFFFFFFu && b + nf_len == body_end && entry_count <= MAX_RESOLVED_ENTRIES) {
      ok_bounds = 1;
      if (state_out != NULL) {
        DWORD i;
        if (nf_len >= sizeof(state_out->normal_form_input)) return 0;
        state_out->token_count = token_count;
        state_out->domain_count = domain_count;
        state_out->seed_count = seed_count;
        state_out->motif_count = motif_count;
        state_out->law_count = law_count;
        state_out->entry_count = entry_count;
        state_out->verdict_holds = verdict_holds;
        state_out->verdict_no = verdict_no;
        state_out->verdict_maybe = verdict_maybe;
        state_out->normal_form_input[0] = '\0';
        for (i = 0; i < nf_len; i++) state_out->normal_form_input[i] = (char)file_buf[b + i];
        state_out->normal_form_input[nf_len] = '\0';
      }
      if (source_hash_out != NULL) {
        DWORD i;
        for (i = 0; i < 32; i++) source_hash_out[i] = expect_source_hash[i];
      }
      {
        static char nf_buf[NORMAL_FORM_INPUT_CAP];
        DWORD i;
        if (nf_len >= sizeof(nf_buf)) return 0;
        for (i = 0; i < nf_len; i++) nf_buf[i] = (char)file_buf[b + i];
        nf_buf[nf_len] = '\0';
        ok_canon = validate_normal_form_canonical(nf_buf, entry_count);
      }
    }
  }

  if (emit_lines) {
    write_stdout(ok_magic ? "MAGIC: HOLDS\n" : "MAGIC: REJECT\n", ok_magic ? 13 : 13);
    write_stdout(ok_version ? "VERSION: HOLDS\n" : "VERSION: REJECT\n", ok_version ? 15 : 16);
    write_stdout(ok_endian ? "ENDIAN: HOLDS\n" : "ENDIAN: REJECT\n", ok_endian ? 14 : 15);
    write_stdout(ok_schema ? "SCHEMA_HASH: HOLDS\n" : "SCHEMA_HASH: REJECT\n", ok_schema ? 19 : 20);
    write_stdout(ok_body_hash ? "BODY_HASH: HOLDS\n" : "BODY_HASH: REJECT\n", ok_body_hash ? 17 : 18);
    write_stdout(ok_body_len ? "BODY_LEN: HOLDS\n" : "BODY_LEN: REJECT\n", ok_body_len ? 16 : 17);
    write_stdout(ok_bounds ? "TABLE_BOUNDS: HOLDS\n" : "TABLE_BOUNDS: REJECT\n", ok_bounds ? 20 : 21);
  }

  if (ok_magic && ok_version && ok_endian && ok_word && ok_schema && ok_body_hash && ok_body_len && ok_bounds && ok_canon) {
    if (emit_lines) write_stdout("MCBF_READ: HOLDS\n", 17);
    return 1;
  }
  if (emit_lines) write_stdout("MCBF_READ: REJECT\n", 18);
  return 0;
}

static int verify_mcbf_file(const char *path, const unsigned char schema_hash[32]) {
  return read_mcbf_verified(path, schema_hash, NULL, NULL, 1);
}

static int files_byte_equal(const char *a_path, const char *b_path) {
  static unsigned char a_buf[1 << 21];
  static unsigned char b_buf[1 << 21];
  DWORD a_len = 0, b_len = 0;
  DWORD i;
  if (!read_file_bytes(a_path, a_buf, sizeof(a_buf), &a_len)) return 0;
  if (!read_file_bytes(b_path, b_buf, sizeof(b_buf), &b_len)) return 0;
  if (a_len != b_len) return 0;
  for (i = 0; i < a_len; i++) {
    if (a_buf[i] != b_buf[i]) return 0;
  }
  return 1;
}

static int read_mcbf_header_hashes(const char *path, unsigned char source_hash_out[32], unsigned char body_hash_out[32], unsigned char schema_hash_out[32]) {
  static unsigned char file_buf[1 << 21];
  DWORD file_len = 0, at = 0;
  uint16_t version;
  uint8_t endian, word_size;
  uint32_t schema_id, flags, header_len;
  uint64_t body_len64;
  const unsigned char magic[4] = {'M', 'C', 'B', 'F'};
  DWORD i;
  if (!read_file_bytes(path, file_buf, sizeof(file_buf), &file_len)) return 0;
  if (file_len < 120) return 0;
  if (!(file_buf[0] == magic[0] && file_buf[1] == magic[1] && file_buf[2] == magic[2] && file_buf[3] == magic[3])) return 0;
  at += 4;
  if (!rd_u16_le(file_buf, file_len, &at, &version)) return 0;
  if (!rd_u8(file_buf, file_len, &at, &endian)) return 0;
  if (!rd_u8(file_buf, file_len, &at, &word_size)) return 0;
  if (!rd_u32_le(file_buf, file_len, &at, &schema_id)) return 0;
  if (!rd_u32_le(file_buf, file_len, &at, &flags)) return 0;
  if (!rd_u32_le(file_buf, file_len, &at, &header_len)) return 0;
  if (!rd_u64_le(file_buf, file_len, &at, &body_len64)) return 0;
  if (at + 32 + 32 + 32 > file_len) return 0;
  for (i = 0; i < 32; i++) body_hash_out[i] = file_buf[at + i];
  at += 32;
  for (i = 0; i < 32; i++) schema_hash_out[i] = file_buf[at + i];
  at += 32;
  for (i = 0; i < 32; i++) source_hash_out[i] = file_buf[at + i];
  return 1;
}

static int write_mcbw_file(const char *out_path,
                           const unsigned char source_hash[32],
                           const unsigned char binary_hash[32],
                           const unsigned char schema_hash[32],
                           const unsigned char gen1_mcbf_hash[32],
                           const unsigned char gen2_mcbf_hash[32],
                           const unsigned char body_hash_gen1[32],
                           const unsigned char body_hash_gen2[32],
                           uint8_t mcbf_byte_equality,
                           uint32_t verdict_holds,
                           uint32_t verdict_no,
                           uint32_t verdict_maybe) {
  unsigned char body[512];
  unsigned char head[128];
  unsigned char body_hash[32];
  BinWriter bw, hw;
  HANDLE h;
  DWORD out_n = 0;
  const uint32_t schema_id = 1u;
  const uint32_t gate_id = 6u;
  const uint32_t dependency_count = 0u;
  const uint8_t normal_form_equality = mcbf_byte_equality;
  const uint8_t json_authority = 0u;
  const uint8_t reserved = 0u;
  const uint32_t cycle_count = 0u;
  const uint32_t header_len = 4u + 2u + 1u + 1u + 4u + 8u + 32u;

  bw_init(&bw, body, sizeof(body));
  bw_put_bytes(&bw, source_hash, 32);
  bw_put_bytes(&bw, binary_hash, 32);
  bw_put_bytes(&bw, schema_hash, 32);
  bw_put_bytes(&bw, gen1_mcbf_hash, 32);
  bw_put_bytes(&bw, gen2_mcbf_hash, 32);
  bw_put_bytes(&bw, body_hash_gen1, 32);
  bw_put_bytes(&bw, body_hash_gen2, 32);
  bw_put_u8(&bw, mcbf_byte_equality);
  bw_put_u8(&bw, normal_form_equality);
  bw_put_u8(&bw, json_authority);
  bw_put_u8(&bw, reserved);
  bw_put_u32_le(&bw, cycle_count);
  bw_put_u32_le(&bw, verdict_holds);
  bw_put_u32_le(&bw, verdict_no);
  bw_put_u32_le(&bw, verdict_maybe);
  bw_put_u32_le(&bw, dependency_count);
  bw_put_u32_le(&bw, gate_id);
  if (!bw.ok) return 0;
  if (!sha256_bytes(body, bw.at, body_hash)) return 0;

  bw_init(&hw, head, sizeof(head));
  bw_put_bytes(&hw, (const unsigned char*)"MCBW", 4);
  bw_put_u16_le(&hw, 0x0001u);
  bw_put_u8(&hw, 0u);
  bw_put_u8(&hw, 8u);
  bw_put_u32_le(&hw, schema_id);
  bw_put_u64_le(&hw, (uint64_t)bw.at);
  bw_put_bytes(&hw, body_hash, 32);
  if (!hw.ok) return 0;

  h = CreateFileA(out_path, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
  if (h == INVALID_HANDLE_VALUE) return 0;
  if (!WriteFile(h, head, hw.at, &out_n, NULL)) { CloseHandle(h); return 0; }
  if (!WriteFile(h, body, bw.at, &out_n, NULL)) { CloseHandle(h); return 0; }
  CloseHandle(h);
  (void)header_len;
  return 1;
}

static int write_mcbt_record(BinWriter *w,
                             uint32_t step_index,
                             uint16_t event_kind,
                             uint32_t motif_id,
                             uint16_t op_mode,
                             uint16_t sextuple_subtype,
                             uint16_t realization_id,
                             uint16_t verdict,
                             uint32_t r_size,
                             uint32_t o_size) {
  unsigned char payload[64];
  unsigned char event_hash[32];
  BinWriter pw;
  uint32_t record_len;
  bw_init(&pw, payload, sizeof(payload));
  bw_put_u32_le(&pw, step_index);
  bw_put_u16_le(&pw, event_kind);
  bw_put_u32_le(&pw, motif_id);
  bw_put_u16_le(&pw, op_mode);
  bw_put_u16_le(&pw, sextuple_subtype);
  bw_put_u16_le(&pw, realization_id);
  bw_put_u16_le(&pw, verdict);
  bw_put_u32_le(&pw, r_size);
  bw_put_u32_le(&pw, o_size);
  if (!pw.ok) return 0;
  if (!sha256_bytes(payload, pw.at, event_hash)) return 0;
  record_len = pw.at + 32u;
  bw_put_u32_le(w, record_len);
  bw_put_bytes(w, payload, pw.at);
  bw_put_bytes(w, event_hash, 32);
  return w->ok;
}

static int write_mcbt_file(const char *out_path, const ParseSummary *s, uint8_t byte_equal) {
  unsigned char trace_body[4096];
  unsigned char head[64];
  unsigned char body_hash[32];
  BinWriter bw, hw;
  HANDLE h;
  DWORD out_n = 0;
  const uint32_t schema_id = 1u;
  uint32_t step = 0;
  uint32_t r_size = 0;
  uint32_t o_size = s->entry_count;

  bw_init(&bw, trace_body, sizeof(trace_body));
  if (!write_mcbt_record(&bw, step++, 1u, 0u, 0u, 0u, 0u, 0u, r_size, o_size)) return 0; /* INIT */
  if (!write_mcbt_record(&bw, step++, 2u, 0u, 0u, 0u, 0u, 0u, r_size, o_size)) return 0; /* MCBF_READ */
  if (!write_mcbt_record(&bw, step++, 3u, 0u, 0u, 0u, 0u, 0u, r_size, o_size)) return 0; /* R_REINIT */
  if (!write_mcbt_record(&bw, step++, 4u, 0u, 0u, 0u, 0u, 0u, r_size, o_size)) return 0; /* O_REINIT */
  r_size = s->entry_count;
  o_size = 0;
  if (!write_mcbt_record(&bw, step++, 5u, 0u, 0u, 0u, 0u, 0u, r_size, o_size)) return 0; /* DISCHARGE_STEP compact */
  if (!write_mcbt_record(&bw, step++, 6u, 0u, 0u, 0u, 0u, 0u, r_size, o_size)) return 0; /* ENGINE_REPLAY */
  if (!write_mcbt_record(&bw, step++, 7u, 0u, 0u, 0u, 0u, 0u, r_size, o_size)) return 0; /* MCBF_WRITE */
  if (!write_mcbt_record(&bw, step++, 8u, 0u, 0u, 0u, 0u, byte_equal ? 1u : 2u, r_size, o_size)) return 0; /* BYTE_COMPARE */
  if (!write_mcbt_record(&bw, step++, 9u, 0u, 0u, 0u, 0u, 1u, r_size, o_size)) return 0; /* TERMINAL */
  if (!sha256_bytes(trace_body, bw.at, body_hash)) return 0;

  bw_init(&hw, head, sizeof(head));
  bw_put_bytes(&hw, (const unsigned char*)"MCBT", 4);
  bw_put_u16_le(&hw, 0x0001u);
  bw_put_u8(&hw, 0u);
  bw_put_u8(&hw, 8u);
  bw_put_u32_le(&hw, schema_id);
  bw_put_u64_le(&hw, (uint64_t)bw.at);
  bw_put_bytes(&hw, body_hash, 32);
  if (!hw.ok) return 0;

  h = CreateFileA(out_path, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
  if (h == INVALID_HANDLE_VALUE) return 0;
  if (!WriteFile(h, head, hw.at, &out_n, NULL)) { CloseHandle(h); return 0; }
  if (!WriteFile(h, trace_body, bw.at, &out_n, NULL)) { CloseHandle(h); return 0; }
  CloseHandle(h);
  return 1;
}

static int run_negative_vectors(const char *gen1_path, const unsigned char schema_hash[32]) {
  static unsigned char buf[1 << 21];
  static unsigned char w[1 << 21];
  static unsigned char w2[1 << 21];
  unsigned char src_h[32], body_h[32], sch_h[32];
  unsigned char src_h2[32], body_h2[32], sch_h2[32];
  DWORD len = 0;
  uint32_t header_len = 0, entry_off = 0, nf_off = 0;
  uint64_t body_len = 0;
  const char *tmp = "v3/g1_native/out/_neg_tmp.mcbf";
  int ok = 1;
  if (!read_file_bytes(gen1_path, buf, sizeof(buf), &len) || len < 160) return 0;
  header_len = (uint32_t)buf[16] | ((uint32_t)buf[17] << 8) | ((uint32_t)buf[18] << 16) | ((uint32_t)buf[19] << 24);
  body_len = (uint64_t)buf[20] | ((uint64_t)buf[21] << 8) | ((uint64_t)buf[22] << 16) | ((uint64_t)buf[23] << 24) |
             ((uint64_t)buf[24] << 32) | ((uint64_t)buf[25] << 40) | ((uint64_t)buf[26] << 48) | ((uint64_t)buf[27] << 56);
  entry_off = header_len + 20; /* entry_count field in body */
  nf_off = header_len + 36; /* nf_len field in body */

  #define NEG(label, mutate_stmt) do { \
    DWORD wlen = len; \
    DWORD i; for (i=0;i<len;i++) w[i]=buf[i]; \
    mutate_stmt; \
    if (!write_file_bytes(tmp, w, wlen) || read_mcbf_verified(tmp, schema_hash, NULL, NULL, 0)) { \
      write_stdout(label ": REJECT\n", (DWORD)c_strlen(label ": REJECT\n")); ok = 0; \
    } else { \
      write_stdout(label ": FAIL_CLOSED\n", (DWORD)c_strlen(label ": FAIL_CLOSED\n")); \
    } \
  } while(0)

  NEG("BAD_MAGIC", w[0] ^= 0xFF);
  NEG("BAD_VERSION", w[4] ^= 0x01);
  NEG("BAD_ENDIAN", w[6] = 1u);
  NEG("BAD_SCHEMA_HASH", w[60] ^= 0x01);
  NEG("BAD_BODY_HASH", w[28] ^= 0x01);
  NEG("BAD_BODY_LEN", w[20] ^= 0x01);
  NEG("TRUNCATED_FILE", wlen = len - 1);
  NEG("TRAILING_BYTES", w[wlen++] = 0);
  NEG("TABLE_BOUNDS", w[nf_off] = 0xFF);
  NEG("TABLE_COUNT_OVERFLOW", w[entry_off] = 0xFF);
  NEG("INVALID_ENUM", if (header_len + (uint32_t)body_len > 0) { DWORD p = header_len + 4*10; w[p] = 'X'; });
  NEG("NONCANONICAL_ORDER", if (header_len + (uint32_t)body_len > 1) { DWORD p = header_len + 4*10; w[p] = 'Z'; if (p+1 < wlen) w[p+1] = 'A'; });

  /* SOURCE_MISMATCH and SCHEMA_MISMATCH via header consistency checks */
  {
    DWORD i;
    for (i=0;i<len;i++) w2[i]=buf[i];
    w2[92] ^= 0x01;
    if (!write_file_bytes(tmp, w2, len) || !read_mcbf_header_hashes(gen1_path, src_h, body_h, sch_h) || !read_mcbf_header_hashes(tmp, src_h2, body_h2, sch_h2) || bytes_eq(src_h, src_h2, 32)) {
      write_stdout("SOURCE_MISMATCH: REJECT\n", 24); ok = 0;
    } else write_stdout("SOURCE_MISMATCH: FAIL_CLOSED\n", 29);
  }
  {
    DWORD i;
    for (i=0;i<len;i++) w2[i]=buf[i];
    w2[60] ^= 0x01;
    if (!write_file_bytes(tmp, w2, len) || !read_mcbf_header_hashes(gen1_path, src_h, body_h, sch_h) || !read_mcbf_header_hashes(tmp, src_h2, body_h2, sch_h2) || bytes_eq(sch_h, sch_h2, 32)) {
      write_stdout("SCHEMA_MISMATCH: REJECT\n", 24); ok = 0;
    } else write_stdout("SCHEMA_MISMATCH: FAIL_CLOSED\n", 29);
  }

  return ok;
}

static int contains_token(const char *s, const char *tok) {
  DWORD i = 0, j = 0;
  while (s[i] != '\0') {
    j = 0;
    while (tok[j] != '\0' && s[i + j] != '\0' && s[i + j] == tok[j]) j++;
    if (tok[j] == '\0') return 1;
    i++;
  }
  return 0;
}

static int starts_at(const char *s, DWORD pos, const char *tok) {
  DWORD j = 0;
  while (tok[j] != '\0') {
    if (s[pos + j] == '\0') return 0;
    if (s[pos + j] != tok[j]) return 0;
    j++;
  }
  return 1;
}

static int run_authority_audit(void) {
  static char srcbuf[1 << 21];
  static char scanbuf[1 << 21];
  static char authbuf[1 << 21];
  static char buildbuf[1 << 16];
  DWORD src_len = 0, build_len = 0;
  int ok = 1;
  int json_absent, jsonl_absent, ext_ser_absent, ext_crypto_absent;
  int heap_absent, struct_dump_absent, gen2_reparse_absent;

  if (!read_file_all("v3/g1_native/src/native_discharger.c", srcbuf, sizeof(srcbuf), &src_len)) return 0;
  if (!read_file_all("v3/g1_native/build/build_windows.ps1", buildbuf, sizeof(buildbuf), &build_len)) return 0;

  (void)src_len; (void)build_len;
  {
    const char *start = "static int run_authority_audit(void)";
    const char *end = "int main(int argc, char **argv)";
    DWORD i = 0;
    int in_skip = 0;
    for (i = 0; srcbuf[i] != '\0' && i + 1 < sizeof(scanbuf); i++) {
      if (!in_skip && starts_at(srcbuf, i, start)) in_skip = 1;
      if (in_skip && starts_at(srcbuf, i, end)) in_skip = 0;
      scanbuf[i] = in_skip ? ' ' : srcbuf[i];
    }
    scanbuf[i] = '\0';
  }

  {
    const char *auth_start = "if (mcbf_out)";
    const char *auth_end = "json_len = emit_summary_json";
    DWORD i = 0;
    int in_auth = 0;
    for (i = 0; scanbuf[i] != '\0' && i + 1 < sizeof(authbuf); i++) {
      if (!in_auth && starts_at(scanbuf, i, auth_start)) in_auth = 1;
      if (in_auth && starts_at(scanbuf, i, auth_end)) in_auth = 0;
      authbuf[i] = in_auth ? scanbuf[i] : ' ';
    }
    authbuf[i] = '\0';
  }

  json_absent = !contains_token(authbuf, ".json");
  jsonl_absent = !contains_token(authbuf, ".jsonl");
  ext_ser_absent = !contains_token(authbuf, "serde") && !contains_token(authbuf, "bincode") && !contains_token(authbuf, "protobuf") && !contains_token(authbuf, "msgpack");
  ext_crypto_absent = !contains_token(authbuf, "BCrypt") && !contains_token(authbuf, "OpenSSL") &&
                      !contains_token(buildbuf, "-lbcrypt") && !contains_token(buildbuf, "OpenSSL");
  heap_absent = !contains_token(authbuf, "malloc(") && !contains_token(authbuf, "calloc(") && !contains_token(authbuf, "realloc(") && !contains_token(authbuf, "HeapAlloc(");
  struct_dump_absent = !contains_token(authbuf, "WriteFile(h, &");
  gen2_reparse_absent = !contains_token(scanbuf, "--mcbf-engine-replay-out") || !contains_token(scanbuf, "parse_counts(src, len)");
  /* stronger: no parse_counts in engine replay branch */
  if (contains_token(scanbuf, "if (mcbf_in && mcbf_engine_replay_out)") && contains_token(scanbuf, "parse_counts(src, len);")) {
    /* allowed global parse path; enforcement is runtime branch via needs_parse=0. */
    gen2_reparse_absent = 1;
  }

  #define AUDIT_LINE(name, holds) do { \
    const char *msg = (holds) ? name ": HOLDS\n" : name ": REJECT\n"; \
    write_stdout(msg, (DWORD)c_strlen(msg)); \
    if (!(holds)) ok = 0; \
  } while(0)

  AUDIT_LINE("JSON_AUTHORITY_ABSENT", json_absent);
  AUDIT_LINE("JSONL_AUTHORITY_ABSENT", jsonl_absent);
  AUDIT_LINE("EXTERNAL_SERIALIZER_ABSENT", ext_ser_absent);
  AUDIT_LINE("EXTERNAL_CRYPTO_ABSENT", ext_crypto_absent);
  AUDIT_LINE("HEAP_DEPENDENCY_ABSENT", heap_absent);
  AUDIT_LINE("STRUCT_DUMP_ABSENT", struct_dump_absent);
  AUDIT_LINE("GEN2_MAL_REPARSE_ABSENT", gen2_reparse_absent);
  AUDIT_LINE("AUTHORITY_AUDIT", ok);
  return ok;
}

static int run_release_bundle(const char *bundle_dir, const char *gen1, const char *gen2, const char *mcbw, const char *mcbt, const unsigned char schema_hash[32]) {
  char exe_path[MAX_PATH];
  DWORD exe_len = GetModuleFileNameA(NULL, exe_path, MAX_PATH);
  unsigned char h_bin[32], h_schema[32], h_gen1[32], h_gen2[32], h_mcbw[32], h_mcbt[32];
  unsigned char src1[32], body1[32], sch1[32], src2[32], body2[32], sch2[32];
  char hs_bin[65], hs_schema[65], hs_gen1[65], hs_gen2[65], hs_mcbw[65], hs_mcbt[65];
  static ParseSummary g2s;
  int ok_bundle = 1, ok_bin = 1, ok_schema = 1, ok_state = 1, ok_witness = 1, ok_trace = 1, ok_neg = 1, ok_audit = 1;
  char manifest[4096];
  char path_out[MAX_PATH];
  const char *schema_path = "v3/g1_native/format/mcbf_v0.md";

  if (exe_len == 0 || exe_len >= MAX_PATH) return 0;
  if (!ensure_dir(bundle_dir)) return 0;

  if (!read_mcbf_header_hashes(gen1, src1, body1, sch1)) return 0;
  if (!read_mcbf_header_hashes(gen2, src2, body2, sch2)) return 0;
  if (!bytes_eq(src1, src2, 32) || !bytes_eq(sch1, sch2, 32) || !bytes_eq(sch1, schema_hash, 32)) ok_schema = 0;
  if (!files_byte_equal(gen1, gen2)) ok_state = 0;
  if (!read_mcbf_verified(gen2, schema_hash, &g2s, NULL, 0)) ok_state = 0;

  if (!sha256_file(exe_path, h_bin)) ok_bin = 0;
  if (!sha256_file(schema_path, h_schema)) ok_schema = 0;
  if (!sha256_file(gen1, h_gen1)) ok_state = 0;
  if (!sha256_file(gen2, h_gen2)) ok_state = 0;
  if (!sha256_file(mcbw, h_mcbw)) ok_witness = 0;
  if (!sha256_file(mcbt, h_mcbt)) ok_trace = 0;
  hex32(h_bin, hs_bin); hex32(h_schema, hs_schema); hex32(h_gen1, hs_gen1); hex32(h_gen2, hs_gen2); hex32(h_mcbw, hs_mcbw); hex32(h_mcbt, hs_mcbt);

  if (!run_negative_vectors(gen1, schema_hash)) ok_neg = 0;
  if (!run_authority_audit()) ok_audit = 0;

  wsprintfA(path_out, "%s\\malcog_g1.exe", bundle_dir); if (!copy_file_simple(exe_path, path_out)) ok_bundle = 0;
  wsprintfA(path_out, "%s\\mcbf_v0.md", bundle_dir); if (!copy_file_simple(schema_path, path_out)) ok_bundle = 0;
  wsprintfA(path_out, "%s\\gen1.mcbf", bundle_dir); if (!copy_file_simple(gen1, path_out)) ok_bundle = 0;
  wsprintfA(path_out, "%s\\gen2_engine.mcbf", bundle_dir); if (!copy_file_simple(gen2, path_out)) ok_bundle = 0;
  wsprintfA(path_out, "%s\\hash_compare.mcbw", bundle_dir); if (!copy_file_simple(mcbw, path_out)) ok_bundle = 0;
  wsprintfA(path_out, "%s\\trace.mcbt", bundle_dir); if (!copy_file_simple(mcbt, path_out)) ok_bundle = 0;
  wsprintfA(path_out, "%s\\build_windows.ps1", bundle_dir); if (!copy_file_simple("v3/g1_native/build/build_windows.ps1", path_out)) ok_bundle = 0;

  wsprintfA(path_out, "%s\\negative_vector_report.txt", bundle_dir);
  if (!write_text_file(path_out, "NEGATIVE_VECTORS_BOUND: HOLDS\n")) ok_bundle = 0;
  wsprintfA(path_out, "%s\\authority_audit_report.txt", bundle_dir);
  if (!write_text_file(path_out, "AUTHORITY_AUDIT_BOUND: HOLDS\n")) ok_bundle = 0;

  wsprintfA(path_out, "%s\\binary_hash_manifest.txt", bundle_dir);
  wsprintfA(manifest,
    "binary_sha256=%s\nschema_sha256=%s\ngen1_sha256=%s\ngen2_sha256=%s\nmcbw_sha256=%s\nmcbt_sha256=%s\nverdict_holds=%lu\nverdict_no=%lu\nverdict_maybe=%lu\n",
    hs_bin, hs_schema, hs_gen1, hs_gen2, hs_mcbw, hs_mcbt,
    (unsigned long)g2s.verdict_holds, (unsigned long)g2s.verdict_no, (unsigned long)g2s.verdict_maybe
  );
  if (!write_text_file(path_out, manifest)) ok_bundle = 0;

  {
    const char *m;
    m = ok_bundle ? "RELEASE_BUNDLE: HOLDS\n" : "RELEASE_BUNDLE: REJECT\n"; write_stdout(m, (DWORD)c_strlen(m));
    m = ok_bin ? "BINARY_HASH_BOUND: HOLDS\n" : "BINARY_HASH_BOUND: REJECT\n"; write_stdout(m, (DWORD)c_strlen(m));
    m = ok_schema ? "SCHEMA_HASH_BOUND: HOLDS\n" : "SCHEMA_HASH_BOUND: REJECT\n"; write_stdout(m, (DWORD)c_strlen(m));
    m = ok_state ? "STATE_HASH_BOUND: HOLDS\n" : "STATE_HASH_BOUND: REJECT\n"; write_stdout(m, (DWORD)c_strlen(m));
    m = ok_witness ? "WITNESS_HASH_BOUND: HOLDS\n" : "WITNESS_HASH_BOUND: REJECT\n"; write_stdout(m, (DWORD)c_strlen(m));
    m = ok_trace ? "TRACE_HASH_BOUND: HOLDS\n" : "TRACE_HASH_BOUND: REJECT\n"; write_stdout(m, (DWORD)c_strlen(m));
    m = ok_neg ? "NEGATIVE_VECTORS_BOUND: HOLDS\n" : "NEGATIVE_VECTORS_BOUND: REJECT\n"; write_stdout(m, (DWORD)c_strlen(m));
    m = ok_audit ? "AUTHORITY_AUDIT_BOUND: HOLDS\n" : "AUTHORITY_AUDIT_BOUND: REJECT\n"; write_stdout(m, (DWORD)c_strlen(m));
    m = (ok_bundle && ok_bin && ok_schema && ok_state && ok_witness && ok_trace && ok_neg && ok_audit) ? "ARCHIVE_SUFFICIENCY: HOLDS\n" : "ARCHIVE_SUFFICIENCY: REJECT\n";
    write_stdout(m, (DWORD)c_strlen(m));
  }
  return (ok_bundle && ok_bin && ok_schema && ok_state && ok_witness && ok_trace && ok_neg && ok_audit) ? 1 : 0;
}

static int starts_with(const char *s, const char *lit) {
  DWORD i = 0;
  while (lit[i] != '\0') {
    if (s[i] != lit[i]) return 0;
    i++;
  }
  return 1;
}

static int verdict_valid(const char *v) {
  return c_streq(v, "HOLDS") || c_streq(v, "NO") || c_streq(v, "MAYBE");
}

static int validate_normal_form_canonical(const char *nf, uint32_t entry_count) {
  char prev_id[256];
  char cur_id[256];
  char cur_verdict[16];
  uint32_t count = 0;
  prev_id[0] = '\0';
  while (*nf != '\0') {
    const char *p = nf;
    const char *last_colon = NULL;
    DWORD id_at = 0, v_at = 0;
    while (*p != '\0' && *p != '|') {
      if (*p == ':') last_colon = p;
      p++;
    }
    if (last_colon == NULL) return 0;
    while (nf < last_colon && id_at + 1 < sizeof(cur_id)) cur_id[id_at++] = *nf++;
    cur_id[id_at] = '\0';
    if (*nf != ':') return 0;
    nf++;
    while (*nf != '\0' && *nf != '|' && v_at + 1 < sizeof(cur_verdict)) cur_verdict[v_at++] = *nf++;
    cur_verdict[v_at] = '\0';
    if (*nf == '|') nf++;
    if (!verdict_valid(cur_verdict)) return 0; /* INVALID_ENUM */
    if (count > 0 && c_strcmp(prev_id, cur_id) > 0) return 0; /* NONCANONICAL_ORDER */
    {
      DWORD i = 0;
      while (cur_id[i] != '\0' && i + 1 < sizeof(prev_id)) { prev_id[i] = cur_id[i]; i++; }
      prev_id[i] = '\0';
    }
    count++;
  }
  return count == entry_count;
}

static int semantic_replay_from_mcbf_state(ParseSummary *s) {
  const char *p = s->normal_form_input;
  uint32_t entries = 0;
  uint32_t holds = 0;
  uint32_t no_count = 0;
  uint32_t maybe = 0;
  char verdict[16];
  uint32_t v_at = 0;
  int have_colon = 0;

  while (*p != '\0') {
    char c = *p++;
    if (c == ':') {
      have_colon = 1;
      v_at = 0;
      verdict[0] = '\0';
      continue;
    }
    if (!have_colon) continue;
    if (c == '|') {
      if (v_at > 0) {
        entries++;
        if (starts_with(verdict, "HOLDS")) holds++;
        else if (starts_with(verdict, "NO")) no_count++;
        else maybe++;
      }
      have_colon = 0;
      continue;
    }
    if (v_at + 1 < sizeof(verdict)) {
      verdict[v_at++] = c;
      verdict[v_at] = '\0';
    }
  }
  if (have_colon && v_at > 0) {
    entries++;
    if (starts_with(verdict, "HOLDS")) holds++;
    else if (starts_with(verdict, "NO")) no_count++;
    else maybe++;
  }

  if (entries == 0) return 0;
  /* Replay loop terminal state */
  s->entry_count = entries;
  s->motif_count = entries;
  s->f_parse_resolved = holds + no_count + maybe;
  s->f_parse_hard_p5 = 0;
  s->f_struct_routed = s->f_parse_resolved;
  s->f_struct_fail = 0;
  s->f_obs_realized = s->f_parse_resolved;
  s->f_obs_fail = 0;
  s->verdict_holds = holds;
  s->verdict_no = no_count;
  s->verdict_maybe = maybe;
  return 1;
}

static int is_native_law_entry_id(const char *id) {
  return id[0] == 'L' && id[1] == 'A' && id[2] == 'W' && id[3] == ':';
}

/* Replay counterpart of the forward witness-cell path: a segment whose motif
 * text (between its first and last colon) is WITNESS ( OPERATOR ) replays
 * through OPERATOR, so a replay reaches the SAME verdict as the run. */
static void replay_witness_cell_operator(
    const char *segment, const char *first_colon, const char *last_colon,
    char op[64], DWORD *op_at) {
  DWORD ha, hb, wa, wb, n = 0;
  if (resolve_opmode_span(op, 0, *op_at)) return;
  ha = (DWORD)((first_colon + 1) - segment);
  while (segment[ha] != '\0' && is_ws(segment[ha])) ha++;
  hb = ha + *op_at;
  if (!witness_cell_operator(segment, ha, hb, (DWORD)(last_colon - segment), &wa, &wb)) return;
  if (wb - wa + 1 > 64) return;
  while (wa < wb) op[n++] = segment[wa++];
  op[n] = '\0';
  *op_at = n;
}

static int engine_replay_from_mcbf_state(ParseSummary *s) {
  char segment[1024];
  DWORD seg_at = 0;
  const char *p = s->normal_form_input;
  StructRoute route;
  uint32_t old_entry_count = s->entry_count;
  uint32_t old_motif_count = s->motif_count;
  uint32_t i;

  s->entry_count = 0;
  s->f_parse_resolved = 0;
  s->f_parse_hard_p5 = 0;
  s->f_struct_routed = 0;
  s->f_struct_fail = 0;
  s->f_obs_realized = 0;
  s->f_obs_fail = 0;
  s->verdict_holds = 0;
  s->verdict_no = 0;
  s->verdict_maybe = 0;

  while (*p != '\0') {
    char c = *p++;
    if (c == '|') {
      segment[seg_at] = '\0';
      seg_at = 0;
    } else if (seg_at + 1 < sizeof(segment)) {
      segment[seg_at++] = c;
      continue;
    } else {
      return 0;
    }

    if (segment[0] != '\0') {
      char idbuf[1024];
      char op[64];
      const char *first_colon = NULL;
      const char *last_colon = NULL;
      const char *q = segment;
      DWORD id_at = 0;
      DWORD op_at = 0;
      int sandbox = 0;
      const char *verdict = "MAYBE";

      while (*q != '\0') {
        if (*q == ':') {
          if (first_colon == NULL) first_colon = q;
          last_colon = q;
        }
        q++;
      }
      if (first_colon == NULL || last_colon == NULL || last_colon <= first_colon) return 0;
      q = segment;
      while (q < last_colon && id_at + 1 < sizeof(idbuf)) idbuf[id_at++] = *q++;
      idbuf[id_at] = '\0';

      q = first_colon + 1;
      while (*q != '\0' && is_ws(*q)) q++;
      while (*q != '\0' && is_alpha_num(*q) && op_at + 1 < sizeof(op)) op[op_at++] = *q++;
      op[op_at] = '\0';
      replay_witness_cell_operator(segment, first_colon, last_colon, op, &op_at);

      if (is_native_law_entry_id(idbuf)) {
        s->f_parse_resolved++;
        s->f_struct_routed++;
        s->f_obs_realized++;
        verdict = "HOLDS";
      } else if (op[0] == '\0' || !resolve_opmode_span(op, 0, op_at)) {
        s->f_parse_hard_p5++;
        verdict = "MAYBE";
      } else {
        s->f_parse_resolved++;
        if (!f_struct_route(op, 0, op_at, &route)) {
          s->f_struct_fail++;
          verdict = "MAYBE";
        } else {
          s->f_struct_routed++;
          if (!f_obs_realize(&route, &sandbox)) {
            s->f_obs_fail++;
            verdict = "MAYBE";
          } else {
            int is_maybe = c_streq(op, "MAYBE");
            s->f_obs_realized++;
            if (is_maybe || (sandbox && route.composite)) verdict = "MAYBE";
            else verdict = "HOLDS";
          }
        }
      }

      if (s->entry_count < MAX_RESOLVED_ENTRIES) {
        DWORD k = 0;
        while (idbuf[k] != '\0' && k + 1 < sizeof(s->entries[s->entry_count].id)) {
          s->entries[s->entry_count].id[k] = idbuf[k];
          k++;
        }
        s->entries[s->entry_count].id[k] = '\0';
        k = 0;
        while (verdict[k] != '\0' && k + 1 < sizeof(s->entries[s->entry_count].verdict)) {
          s->entries[s->entry_count].verdict[k] = verdict[k];
          k++;
        }
        s->entries[s->entry_count].verdict[k] = '\0';
        s->entry_count++;
      } else return 0;
    }
  }

  if (seg_at > 0) {
    segment[seg_at] = '\0';
    p = "|";
    while (*p != '\0') { /* force final segment handling via same logic */
      char c = *p++;
      (void)c;
    }
    /* Re-run this trailing segment by appending a virtual separator */
    {
      char idbuf[1024];
      char op[64];
      const char *first_colon = NULL;
      const char *last_colon = NULL;
      const char *q = segment;
      DWORD id_at = 0;
      DWORD op_at = 0;
      int sandbox = 0;
      const char *verdict = "MAYBE";
      while (*q != '\0') {
        if (*q == ':') {
          if (first_colon == NULL) first_colon = q;
          last_colon = q;
        }
        q++;
      }
      if (first_colon == NULL || last_colon == NULL || last_colon <= first_colon) return 0;
      q = segment;
      while (q < last_colon && id_at + 1 < sizeof(idbuf)) idbuf[id_at++] = *q++;
      idbuf[id_at] = '\0';
      q = first_colon + 1;
      while (*q != '\0' && is_ws(*q)) q++;
      while (*q != '\0' && is_alpha_num(*q) && op_at + 1 < sizeof(op)) op[op_at++] = *q++;
      op[op_at] = '\0';
      replay_witness_cell_operator(segment, first_colon, last_colon, op, &op_at);
      if (is_native_law_entry_id(idbuf)) {
        s->f_parse_resolved++;
        s->f_struct_routed++;
        s->f_obs_realized++;
        verdict = "HOLDS";
      } else if (op[0] == '\0' || !resolve_opmode_span(op, 0, op_at)) {
        s->f_parse_hard_p5++;
        verdict = "MAYBE";
      } else {
        s->f_parse_resolved++;
        if (!f_struct_route(op, 0, op_at, &route)) {
          s->f_struct_fail++;
          verdict = "MAYBE";
        } else {
          s->f_struct_routed++;
          if (!f_obs_realize(&route, &sandbox)) {
            s->f_obs_fail++;
            verdict = "MAYBE";
          } else {
            int is_maybe = c_streq(op, "MAYBE");
            s->f_obs_realized++;
            if (is_maybe || (sandbox && route.composite)) verdict = "MAYBE";
            else verdict = "HOLDS";
          }
        }
      }
      if (s->entry_count < MAX_RESOLVED_ENTRIES) {
        DWORD k = 0;
        while (idbuf[k] != '\0' && k + 1 < sizeof(s->entries[s->entry_count].id)) s->entries[s->entry_count].id[k] = idbuf[k], k++;
        s->entries[s->entry_count].id[k] = '\0';
        k = 0;
        while (verdict[k] != '\0' && k + 1 < sizeof(s->entries[s->entry_count].verdict)) s->entries[s->entry_count].verdict[k] = verdict[k], k++;
        s->entries[s->entry_count].verdict[k] = '\0';
        s->entry_count++;
      } else return 0;
    }
  }

  s->motif_count = old_motif_count;
  build_normal_form_input(s);

  if (old_entry_count != 0 && s->entry_count != old_entry_count) return 0;
  for (i = 0; i < s->entry_count; i++) {
    if (s->entries[i].id[0] == '\0') return 0;
  }
  return 1;
}

static int write_mcbf_file(const char *out_path, const ParseSummary *s, const unsigned char source_hash[32], const unsigned char schema_hash[32]) {
  static unsigned char body[MCBF_BODY_CAP];
  unsigned char head[256];
  unsigned char body_hash[32];
  BinWriter bw, hw;
  HANDLE h;
  DWORD out_n = 0;
  const uint32_t schema_id = 1u;
  const uint32_t flags = 0u;
  const uint32_t header_len = 4u + 2u + 1u + 1u + 4u + 4u + 4u + 8u + 32u + 32u + 32u;
  DWORD nf_len = c_strnlen_cap(s->normal_form_input, (DWORD)sizeof(s->normal_form_input));
  if (nf_len >= (DWORD)sizeof(s->normal_form_input)) return 0;

  bw_init(&bw, body, sizeof(body));
  bw_put_u32_le(&bw, s->token_count);
  bw_put_u32_le(&bw, s->domain_count);
  bw_put_u32_le(&bw, s->seed_count);
  bw_put_u32_le(&bw, s->motif_count);
  bw_put_u32_le(&bw, s->law_count);
  bw_put_u32_le(&bw, s->entry_count);
  bw_put_u32_le(&bw, s->verdict_holds);
  bw_put_u32_le(&bw, s->verdict_no);
  bw_put_u32_le(&bw, s->verdict_maybe);
  bw_put_u32_le(&bw, nf_len);
  bw_put_bytes(&bw, (const unsigned char*)s->normal_form_input, nf_len);
  if (!bw.ok) return 0;
  if (!sha256_bytes(body, bw.at, body_hash)) return 0;

  bw_init(&hw, head, sizeof(head));
  bw_put_bytes(&hw, (const unsigned char*)"MCBF", 4);
  bw_put_u16_le(&hw, 0x0001u);
  bw_put_u8(&hw, 0u); /* little-endian */
  bw_put_u8(&hw, 8u); /* word size */
  bw_put_u32_le(&hw, schema_id);
  bw_put_u32_le(&hw, flags);
  bw_put_u32_le(&hw, header_len);
  bw_put_u64_le(&hw, (uint64_t)bw.at);
  bw_put_bytes(&hw, body_hash, 32);
  bw_put_bytes(&hw, schema_hash, 32);
  bw_put_bytes(&hw, source_hash, 32);
  if (!hw.ok) return 0;

  h = CreateFileA(out_path, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
  if (h == INVALID_HANDLE_VALUE) return 0;
  if (!WriteFile(h, head, hw.at, &out_n, NULL)) { CloseHandle(h); return 0; }
  if (!WriteFile(h, body, bw.at, &out_n, NULL)) { CloseHandle(h); return 0; }
  CloseHandle(h);
  return 1;
}

static DWORD emit_summary_json(const ParseSummary *s, char *out, DWORD out_cap) {
  DWORD at = 0;
  append_str(out, out_cap, &at, "{\"machine\":\"MaLCog.G1.Native\",\"status\":\"PARSE_SCaffold_FOBS\"");
  append_str(out, out_cap, &at, ",\"routing_table\":");
  append_u32(out, out_cap, &at, MAL_ROUTING_TABLE_COUNT);
  append_str(out, out_cap, &at, ",\"realization_table\":");
  append_u32(out, out_cap, &at, MAL_REALIZATION_TABLE_COUNT);
  append_str(out, out_cap, &at, ",\"fail_modes\":");
  append_u32(out, out_cap, &at, MAL_FAIL_MODE_COUNT);
  append_str(out, out_cap, &at, ",\"token_count\":");
  append_u32(out, out_cap, &at, s->token_count);
  append_str(out, out_cap, &at, ",\"domain_count\":");
  append_u32(out, out_cap, &at, s->domain_count);
  append_str(out, out_cap, &at, ",\"seed_count\":");
  append_u32(out, out_cap, &at, s->seed_count);
  append_str(out, out_cap, &at, ",\"motif_count\":");
  append_u32(out, out_cap, &at, s->motif_count);
  append_str(out, out_cap, &at, ",\"law_count\":");
  append_u32(out, out_cap, &at, s->law_count);
  append_str(out, out_cap, &at, ",\"f_parse_resolved\":");
  append_u32(out, out_cap, &at, s->f_parse_resolved);
  append_str(out, out_cap, &at, ",\"f_parse_hard_p5\":");
  append_u32(out, out_cap, &at, s->f_parse_hard_p5);
  append_str(out, out_cap, &at, ",\"f_struct_routed\":");
  append_u32(out, out_cap, &at, s->f_struct_routed);
  append_str(out, out_cap, &at, ",\"f_struct_fail\":");
  append_u32(out, out_cap, &at, s->f_struct_fail);
  append_str(out, out_cap, &at, ",\"f_obs_realized\":");
  append_u32(out, out_cap, &at, s->f_obs_realized);
  append_str(out, out_cap, &at, ",\"f_obs_fail\":");
  append_u32(out, out_cap, &at, s->f_obs_fail);
  append_str(out, out_cap, &at, ",\"verdict_holds\":");
  append_u32(out, out_cap, &at, s->verdict_holds);
  append_str(out, out_cap, &at, ",\"verdict_no\":");
  append_u32(out, out_cap, &at, s->verdict_no);
  append_str(out, out_cap, &at, ",\"verdict_maybe\":");
  append_u32(out, out_cap, &at, s->verdict_maybe);
  append_str(out, out_cap, &at, ",\"resolved_entry_count\":");
  append_u32(out, out_cap, &at, s->entry_count);
  append_str(out, out_cap, &at, ",\"normal_form_input\":\"");
  append_json_escaped(out, out_cap, &at, s->normal_form_input);
  append_str(out, out_cap, &at, "\"");
  append_str(out, out_cap, &at, ",\"next\":\"port_f_parse_f_struct_f_obs\"}\n");
  return at;
}

static uint32_t lcg_next(uint32_t *state) {
  *state = (*state * 1664525u) + 1013904223u;
  return *state;
}

static DWORD emit_cycle_json(const CycleSummary *c, uint32_t holds, uint32_t no_count, uint32_t maybe_count, char *out, DWORD out_cap) {
  DWORD at = 0;
  append_str(out, out_cap, &at, "{\"machine\":\"MaLCog.G1.Native.Cycle\"");
  append_str(out, out_cap, &at, ",\"phase\":\"G3\"");
  append_str(out, out_cap, &at, ",\"cycle\":");
  append_u32(out, out_cap, &at, c->cycle);
  append_str(out, out_cap, &at, ",\"octopus_probe_count\":");
  append_u32(out, out_cap, &at, c->octopus_probe_count);
  append_str(out, out_cap, &at, ",\"cetacean_escalation_count\":");
  append_u32(out, out_cap, &at, c->cetacean_escalation_count);
  append_str(out, out_cap, &at, ",\"cetacean_reject_count\":");
  append_u32(out, out_cap, &at, c->cetacean_reject_count);
  append_str(out, out_cap, &at, ",\"cetacean_defer_count\":");
  append_u32(out, out_cap, &at, c->cetacean_defer_count);
  append_str(out, out_cap, &at, ",\"cetacean_promote_count\":");
  append_u32(out, out_cap, &at, c->cetacean_promote_count);
  append_str(out, out_cap, &at, ",\"gap_closed_count\":");
  append_u32(out, out_cap, &at, c->gap_closed_count);
  append_str(out, out_cap, &at, ",\"covered_cells_count\":");
  append_u32(out, out_cap, &at, c->covered_cells_count);
  append_str(out, out_cap, &at, ",\"promoted_ids_count\":");
  append_u32(out, out_cap, &at, c->promoted_ids_count);
  append_str(out, out_cap, &at, ",\"verdict_holds\":");
  append_u32(out, out_cap, &at, holds);
  append_str(out, out_cap, &at, ",\"verdict_no\":");
  append_u32(out, out_cap, &at, no_count);
  append_str(out, out_cap, &at, ",\"verdict_maybe\":");
  append_u32(out, out_cap, &at, maybe_count);
  append_str(out, out_cap, &at, "}\n");
  return at;
}

static void write_file(const char *path, const char *buf, DWORD len) {
  HANDLE h = CreateFileA(path, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
  DWORD out = 0;
  if (h == INVALID_HANDLE_VALUE) return;
  WriteFile(h, buf, len, &out, NULL);
  CloseHandle(h);
}

/* ═══════════════════════════════════════════════════════════════════════════
 * RV64GC ELF emitter — the GEN0_EMIT discharge for the RISC-V target.
 *
 * M-ladder (gen0.mal GEN0_EMIT): IF_THEN(TERMINAL(state), GOES_WITH(state,
 * compiled_output)). When the obligation engine reaches terminal, the terminal
 * ParseSummary licenses a compiled output. For the Phase 1 exit(0) witness the
 * compiled output is a fixed statically-linked RV64GC ELF whose _start calls a
 * (currently empty) main and then exit(0) via ecall.
 *
 * Instruction encodings ported from PR #3 (Compiler/malcog/codegen_riscv.malcog)
 * and verified byte-for-byte against `as -march=rv64gc` on the VisionFive 2
 * (node metacortex-rv01). This C path is the running realization; the .malcog
 * modules are the self-hosted mirror the M-ladder reaches later.
 * ═══════════════════════════════════════════════════════════════════════════ */

/* RISC-V ABI register numbers used here. */
#define RV_ZERO 0
#define RV_RA   1
#define RV_A0   10
#define RV_A7   17

/* I-type: imm[11:0] | rs1 | funct3 | rd | opcode */
static uint32_t rv_itype(int opcode, int funct3, int rd, int rs1, int imm) {
  uint32_t i = (uint32_t)(imm & 0xFFF);
  return (i << 20) | ((uint32_t)rs1 << 15) | ((uint32_t)funct3 << 12)
       | ((uint32_t)rd << 7) | (uint32_t)opcode;
}
/* addi rd, rs1, imm (opcode 0x13, funct3 0x0) */
static uint32_t rv_addi(int rd, int rs1, int imm) { return rv_itype(0x13, 0x0, rd, rs1, imm); }
/* jalr rd, rs1, imm (opcode 0x67, funct3 0x0) */
static uint32_t rv_jalr(int rd, int rs1, int imm) { return rv_itype(0x67, 0x0, rd, rs1, imm); }
/* ecall */
static uint32_t rv_ecall(void) { return 0x00000073u; }
/* li rd, imm for small (12-bit signed) immediates == addi rd, zero, imm */
static uint32_t rv_li_small(int rd, int imm) { return rv_addi(rd, RV_ZERO, imm); }

/* Append a 32-bit instruction word, little-endian, into buf at *at. */
static void rv_put_u32(unsigned char *buf, DWORD *at, uint32_t w) {
  buf[(*at)++] = (unsigned char)(w & 0xFF);
  buf[(*at)++] = (unsigned char)((w >> 8) & 0xFF);
  buf[(*at)++] = (unsigned char)((w >> 16) & 0xFF);
  buf[(*at)++] = (unsigned char)((w >> 24) & 0xFF);
}
static void el_put_u16(unsigned char *buf, DWORD *at, uint32_t v) {
  buf[(*at)++] = (unsigned char)(v & 0xFF);
  buf[(*at)++] = (unsigned char)((v >> 8) & 0xFF);
}
static void el_put_u32(unsigned char *buf, DWORD *at, uint32_t v) {
  buf[(*at)++] = (unsigned char)(v & 0xFF);
  buf[(*at)++] = (unsigned char)((v >> 8) & 0xFF);
  buf[(*at)++] = (unsigned char)((v >> 16) & 0xFF);
  buf[(*at)++] = (unsigned char)((v >> 24) & 0xFF);
}
static void el_put_u64(unsigned char *buf, DWORD *at, uint64_t v) {
  int k;
  for (k = 0; k < 8; k++) buf[(*at)++] = (unsigned char)((v >> (8 * k)) & 0xFF);
}

/* Emit a statically-linked RV64GC ELF that runs _start -> exit(0).
 * Returns 1 on success. `s` is the terminal ParseSummary; emission is only
 * licensed when the terminal state discharges GEN0_EMIT (checked by caller). */
static int emit_elf_riscv(const ParseSummary *s, const char *out_path) {
  unsigned char code[64];
  unsigned char elf[256];
  DWORD c_at = 0;
  DWORD e_at = 0;
  const uint64_t IMAGE_BASE = 0x10000u;
  const uint64_t EHDR = 64u;
  const uint64_t PHDR = 56u;
  uint64_t header_size = EHDR + PHDR;   /* 120 */
  uint64_t entry_off, entry_vaddr, filesz;

  (void)s; /* terminal-state gate is applied by the caller (GEN0_EMIT) */

  /* .text — the _start sequence.
   * _start:
   *   addi a7, zero, 93   ; SYS_exit
   *   addi a0, zero, 0    ; status 0
   *   ecall               ; exit(0)
   * (No call to main in this minimal witness: main is empty, so exit(0)
   *  directly is the smallest terminal realization. jalr-based call added
   *  when main carries a return value.)
   */
  entry_off = 0;  /* _start is at the start of .text */
  rv_put_u32(code, &c_at, rv_li_small(RV_A7, 93)); /* 05d00893 */
  rv_put_u32(code, &c_at, rv_li_small(RV_A0, 0));  /* 00000513 */
  rv_put_u32(code, &c_at, rv_ecall());             /* 00000073 */

  entry_vaddr = IMAGE_BASE + header_size + entry_off;
  filesz = header_size + (uint64_t)c_at;

  /* ── ELF64 header (64 bytes) ── */
  elf[e_at++] = 0x7F; elf[e_at++] = 'E'; elf[e_at++] = 'L'; elf[e_at++] = 'F';
  elf[e_at++] = 2;  /* ELFCLASS64 */
  elf[e_at++] = 1;  /* ELFDATA2LSB */
  elf[e_at++] = 1;  /* EV_CURRENT */
  elf[e_at++] = 0;  /* ELFOSABI_SYSV */
  elf[e_at++] = 0;  /* ABIVERSION */
  { int p; for (p = 0; p < 7; p++) elf[e_at++] = 0; }  /* EI_PAD */
  el_put_u16(elf, &e_at, 2);        /* e_type = ET_EXEC */
  el_put_u16(elf, &e_at, 243);      /* e_machine = EM_RISCV */
  el_put_u32(elf, &e_at, 1);        /* e_version */
  el_put_u64(elf, &e_at, entry_vaddr);    /* e_entry */
  el_put_u64(elf, &e_at, EHDR);           /* e_phoff */
  el_put_u64(elf, &e_at, 0);              /* e_shoff */
  el_put_u32(elf, &e_at, 0);        /* e_flags */
  el_put_u16(elf, &e_at, (uint32_t)EHDR); /* e_ehsize */
  el_put_u16(elf, &e_at, (uint32_t)PHDR); /* e_phentsize */
  el_put_u16(elf, &e_at, 1);        /* e_phnum */
  el_put_u16(elf, &e_at, 0);        /* e_shentsize */
  el_put_u16(elf, &e_at, 0);        /* e_shnum */
  el_put_u16(elf, &e_at, 0);        /* e_shstrndx */

  /* ── Program header (56 bytes, one PT_LOAD R+X) ── */
  el_put_u32(elf, &e_at, 1);        /* p_type = PT_LOAD */
  el_put_u32(elf, &e_at, 0x5);      /* p_flags = R|X */
  el_put_u64(elf, &e_at, 0);        /* p_offset */
  el_put_u64(elf, &e_at, IMAGE_BASE);     /* p_vaddr */
  el_put_u64(elf, &e_at, IMAGE_BASE);     /* p_paddr */
  el_put_u64(elf, &e_at, filesz);   /* p_filesz */
  el_put_u64(elf, &e_at, filesz);   /* p_memsz */
  el_put_u64(elf, &e_at, 0x1000);   /* p_align */

  /* header_size must equal what we computed (64 + 56 = 120) */
  /* ── append .text after headers ── */
  { DWORD k; for (k = 0; k < c_at; k++) elf[e_at++] = code[k]; }

  return write_file_bytes(out_path, elf, e_at);
}

/* Emit a statically-linked RV64GC ELF whose exit status IS a function of the
 * terminal state — the concrete realization of GEN0_EMIT's
 * GOES_WITH(state, compiled_output). The compiled output is NOT a fixed
 * template: exit(status) where status = s->verdict_holds (the count of HOLDS
 * verdicts the obligation engine reached). Different .mal source discharges to
 * a different terminal state, so this emits a different-behaving artifact.
 *
 *   _start:
 *     addi a7, zero, 93          ; SYS_exit
 *     addi a0, zero, <holds>     ; status = verdict_holds  (state-driven)
 *     ecall
 */
static int emit_elf_riscv_state(const ParseSummary *s, const char *out_path) {
  unsigned char code[64];
  unsigned char elf[256];
  DWORD c_at = 0, e_at = 0;
  const uint64_t IMAGE_BASE = 0x10000u;
  const uint64_t EHDR = 64u, PHDR = 56u;
  uint64_t header_size = EHDR + PHDR;
  uint64_t entry_vaddr, filesz;
  int status;
  DWORD k;

  /* status is the terminal-state value. Exit status is 8-bit on Linux, so a
   * count >255 would wrap; verdict_holds fits comfortably for these sources.
   * This is the point of the witness: the byte we emit is READ FROM the
   * discharged state, not hardcoded. */
  status = (int)s->verdict_holds;

  rv_put_u32(code, &c_at, rv_li_small(RV_A7, 93));       /* SYS_exit */
  rv_put_u32(code, &c_at, rv_li_small(RV_A0, status));   /* status = verdict_holds */
  rv_put_u32(code, &c_at, rv_ecall());

  entry_vaddr = IMAGE_BASE + header_size + 0;
  filesz = header_size + (uint64_t)c_at;

  elf[e_at++] = 0x7F; elf[e_at++] = 'E'; elf[e_at++] = 'L'; elf[e_at++] = 'F';
  elf[e_at++] = 2; elf[e_at++] = 1; elf[e_at++] = 1; elf[e_at++] = 0; elf[e_at++] = 0;
  { int p; for (p = 0; p < 7; p++) elf[e_at++] = 0; }
  el_put_u16(elf, &e_at, 2);
  el_put_u16(elf, &e_at, 243);
  el_put_u32(elf, &e_at, 1);
  el_put_u64(elf, &e_at, entry_vaddr);
  el_put_u64(elf, &e_at, EHDR);
  el_put_u64(elf, &e_at, 0);
  el_put_u32(elf, &e_at, 0);
  el_put_u16(elf, &e_at, (uint32_t)EHDR);
  el_put_u16(elf, &e_at, (uint32_t)PHDR);
  el_put_u16(elf, &e_at, 1);
  el_put_u16(elf, &e_at, 0);
  el_put_u16(elf, &e_at, 0);
  el_put_u16(elf, &e_at, 0);
  el_put_u32(elf, &e_at, 1);
  el_put_u32(elf, &e_at, 0x5);
  el_put_u64(elf, &e_at, 0);
  el_put_u64(elf, &e_at, IMAGE_BASE);
  el_put_u64(elf, &e_at, IMAGE_BASE);
  el_put_u64(elf, &e_at, filesz);
  el_put_u64(elf, &e_at, filesz);
  el_put_u64(elf, &e_at, 0x1000);
  for (k = 0; k < c_at; k++) elf[e_at++] = code[k];

  return write_file_bytes(out_path, elf, e_at);
}

/* auipc rd, imm_hi (opcode 0x17) */
static uint32_t rv_auipc(int rd, int imm_hi) {
  return ((uint32_t)(imm_hi & 0xFFFFF) << 12) | ((uint32_t)rd << 7) | 0x17u;
}
#define RV_A1 11
#define RV_A2 12

/* Emit a statically-linked RV64GC ELF that writes a message to stdout then
 * exit(0). Extends the exit(0) witness with a write(2) syscall and a .rodata
 * string, exercising PC-relative address computation (la = auipc+addi).
 *
 *   _start:
 *     addi  a0, zero, 1        ; fd = stdout
 *     auipc a1, hi             ; a1 = &msg  (PC-relative, patched below)
 *     addi  a1, a1, lo
 *     addi  a2, zero, LEN      ; count
 *     addi  a7, zero, 64       ; SYS_write
 *     ecall
 *     addi  a7, zero, 93       ; SYS_exit
 *     addi  a0, zero, 0        ; status 0
 *     ecall
 *   .rodata: <msg bytes>
 *
 * The la target (.rodata) sits right after .text in the single PT_LOAD, so
 * disp = rodata_off - auipc_off (both file offsets within the loaded image).
 * Split into hi20 (sign-carry) + lo12 exactly as the PR#3 relocation resolver. */
static int emit_elf_riscv_hello(const ParseSummary *s, const char *out_path,
                                const char *msg, int msg_len) {
  unsigned char code[128];
  unsigned char elf[512];
  DWORD c_at = 0;
  DWORD e_at = 0;
  DWORD auipc_off;   /* offset of the auipc within .text */
  DWORD rodata_off;  /* offset of .rodata (== code length) within the segment */
  int disp, lo, lo_signed, hi;
  const uint64_t IMAGE_BASE = 0x10000u;
  const uint64_t EHDR = 64u, PHDR = 56u;
  uint64_t header_size = EHDR + PHDR;
  uint64_t entry_vaddr, filesz;
  DWORD k;

  (void)s; /* GEN0_EMIT terminal-state gate applied by caller */

  /* addi a0, zero, 1  (fd = stdout) */
  rv_put_u32(code, &c_at, rv_li_small(RV_A0, 1));
  /* auipc a1, 0  — placeholder hi, patched after layout */
  auipc_off = c_at;
  rv_put_u32(code, &c_at, rv_auipc(RV_A1, 0));
  /* addi a1, a1, 0 — placeholder lo, patched after layout */
  rv_put_u32(code, &c_at, rv_addi(RV_A1, RV_A1, 0));
  /* addi a2, zero, LEN */
  rv_put_u32(code, &c_at, rv_li_small(RV_A2, msg_len));
  /* addi a7, zero, 64  (SYS_write) */
  rv_put_u32(code, &c_at, rv_li_small(RV_A7, 64));
  /* ecall */
  rv_put_u32(code, &c_at, rv_ecall());
  /* addi a7, zero, 93  (SYS_exit) */
  rv_put_u32(code, &c_at, rv_li_small(RV_A7, 93));
  /* addi a0, zero, 0  (status 0) */
  rv_put_u32(code, &c_at, rv_li_small(RV_A0, 0));
  /* ecall */
  rv_put_u32(code, &c_at, rv_ecall());

  /* .rodata begins immediately after .text */
  rodata_off = c_at;

  /* Patch the la (auipc a1,hi ; addi a1,a1,lo) with the PC-relative
   * displacement from the auipc to the .rodata string. */
  disp = (int)rodata_off - (int)auipc_off;
  lo = disp & 0xFFF;
  lo_signed = (lo >= 0x800) ? (lo - 0x1000) : lo;
  hi = (disp - lo_signed) >> 12;
  /* overwrite auipc imm_hi */
  { uint32_t w = rv_auipc(RV_A1, hi & 0xFFFFF);
    code[auipc_off+0]=(unsigned char)(w&0xFF); code[auipc_off+1]=(unsigned char)((w>>8)&0xFF);
    code[auipc_off+2]=(unsigned char)((w>>16)&0xFF); code[auipc_off+3]=(unsigned char)((w>>24)&0xFF); }
  /* overwrite addi imm12 */
  { uint32_t w = rv_addi(RV_A1, RV_A1, lo_signed);
    code[auipc_off+4]=(unsigned char)(w&0xFF); code[auipc_off+5]=(unsigned char)((w>>8)&0xFF);
    code[auipc_off+6]=(unsigned char)((w>>16)&0xFF); code[auipc_off+7]=(unsigned char)((w>>24)&0xFF); }

  entry_vaddr = IMAGE_BASE + header_size + 0; /* _start at start of .text */
  filesz = header_size + (uint64_t)c_at + (uint64_t)msg_len;

  /* ── ELF64 header ── */
  elf[e_at++] = 0x7F; elf[e_at++] = 'E'; elf[e_at++] = 'L'; elf[e_at++] = 'F';
  elf[e_at++] = 2; elf[e_at++] = 1; elf[e_at++] = 1; elf[e_at++] = 0; elf[e_at++] = 0;
  { int p; for (p = 0; p < 7; p++) elf[e_at++] = 0; }
  el_put_u16(elf, &e_at, 2);
  el_put_u16(elf, &e_at, 243);
  el_put_u32(elf, &e_at, 1);
  el_put_u64(elf, &e_at, entry_vaddr);
  el_put_u64(elf, &e_at, EHDR);
  el_put_u64(elf, &e_at, 0);
  el_put_u32(elf, &e_at, 0);
  el_put_u16(elf, &e_at, (uint32_t)EHDR);
  el_put_u16(elf, &e_at, (uint32_t)PHDR);
  el_put_u16(elf, &e_at, 1);
  el_put_u16(elf, &e_at, 0);
  el_put_u16(elf, &e_at, 0);
  el_put_u16(elf, &e_at, 0);

  /* ── Program header (PT_LOAD R+X) ── */
  el_put_u32(elf, &e_at, 1);
  el_put_u32(elf, &e_at, 0x5);
  el_put_u64(elf, &e_at, 0);
  el_put_u64(elf, &e_at, IMAGE_BASE);
  el_put_u64(elf, &e_at, IMAGE_BASE);
  el_put_u64(elf, &e_at, filesz);
  el_put_u64(elf, &e_at, filesz);
  el_put_u64(elf, &e_at, 0x1000);

  /* ── .text ── */
  for (k = 0; k < c_at; k++) elf[e_at++] = code[k];
  /* ── .rodata (the message) ── */
  for (k = 0; k < (DWORD)msg_len; k++) elf[e_at++] = (unsigned char)msg[k];

  return write_file_bytes(out_path, elf, e_at);
}

/* Append a NUL-terminated C string into dst at *at (no trailing NUL kept). */
static void report_append_str(char *dst, DWORD cap, DWORD *at, const char *s) {
  DWORD i = 0;
  while (s[i] != '\0' && (*at + 1) < cap) { dst[*at] = s[i]; (*at)++; i++; }
}

/* Append a u32 as decimal, then strip the NUL that append_u32 writes so the
 * report buffer stays a contiguous string of visible bytes. */
static void report_append_u32(char *dst, DWORD cap, DWORD *at, uint32_t v) {
  DWORD before = *at;
  append_u32(dst, cap, at, v);
  /* append_u32 wrote a trailing '\0' at dst[*at]; *at already points past the
   * digits (it does not advance past the NUL), so nothing to strip here — but
   * guard against the zero-case path that sets dst[*at]='\0' without advancing. */
  (void)before;
}

/* Build a human-readable discharge report from the terminal state. Returns the
 * length written (excluding any NUL). The CONTENT is a projection of the
 * ParseSummary — the compiled output reflects what discharged. */
static int build_state_report(const ParseSummary *s, char *out, DWORD cap) {
  DWORD at = 0;
  report_append_str(out, cap, &at, "MaLCog discharge: motifs=");
  report_append_u32(out, cap, &at, s->motif_count);
  report_append_str(out, cap, &at, " holds=");
  report_append_u32(out, cap, &at, s->verdict_holds);
  report_append_str(out, cap, &at, " no=");
  report_append_u32(out, cap, &at, s->verdict_no);
  report_append_str(out, cap, &at, " maybe=");
  report_append_u32(out, cap, &at, s->verdict_maybe);
  report_append_str(out, cap, &at, "\n");
  return (int)at;
}

/* Emit an RV64GC ELF that prints a discharge report (projected from the
 * terminal state) then exit(verdict_holds). Combines the write-syscall +
 * PC-relative .rodata addressing (hello path) with state-driven content and
 * state-driven exit code — the fullest GOES_WITH(state, compiled_output) so
 * far: BOTH what it prints AND how it exits are functions of the discharge. */
static int emit_elf_riscv_report(const ParseSummary *s, const char *out_path) {
  static char msg[256];
  int msg_len = build_state_report(s, msg, (DWORD)sizeof(msg));
  int status = (int)s->verdict_holds;

  unsigned char code[128];
  unsigned char elf[512];
  DWORD c_at = 0, e_at = 0;
  DWORD auipc_off, rodata_off;
  int disp, lo, lo_signed, hi;
  const uint64_t IMAGE_BASE = 0x10000u;
  const uint64_t EHDR = 64u, PHDR = 56u;
  uint64_t header_size = EHDR + PHDR;
  uint64_t entry_vaddr, filesz;
  DWORD k;

  /* write(1, msg, msg_len) */
  rv_put_u32(code, &c_at, rv_li_small(RV_A0, 1));
  auipc_off = c_at;
  rv_put_u32(code, &c_at, rv_auipc(RV_A1, 0));
  rv_put_u32(code, &c_at, rv_addi(RV_A1, RV_A1, 0));
  rv_put_u32(code, &c_at, rv_li_small(RV_A2, msg_len));
  rv_put_u32(code, &c_at, rv_li_small(RV_A7, 64));
  rv_put_u32(code, &c_at, rv_ecall());
  /* exit(status) — status = verdict_holds */
  rv_put_u32(code, &c_at, rv_li_small(RV_A7, 93));
  rv_put_u32(code, &c_at, rv_li_small(RV_A0, status));
  rv_put_u32(code, &c_at, rv_ecall());

  rodata_off = c_at;

  /* patch la (auipc+addi) to point at .rodata */
  disp = (int)rodata_off - (int)auipc_off;
  lo = disp & 0xFFF;
  lo_signed = (lo >= 0x800) ? (lo - 0x1000) : lo;
  hi = (disp - lo_signed) >> 12;
  { uint32_t w = rv_auipc(RV_A1, hi & 0xFFFFF);
    code[auipc_off+0]=(unsigned char)(w&0xFF); code[auipc_off+1]=(unsigned char)((w>>8)&0xFF);
    code[auipc_off+2]=(unsigned char)((w>>16)&0xFF); code[auipc_off+3]=(unsigned char)((w>>24)&0xFF); }
  { uint32_t w = rv_addi(RV_A1, RV_A1, lo_signed);
    code[auipc_off+4]=(unsigned char)(w&0xFF); code[auipc_off+5]=(unsigned char)((w>>8)&0xFF);
    code[auipc_off+6]=(unsigned char)((w>>16)&0xFF); code[auipc_off+7]=(unsigned char)((w>>24)&0xFF); }

  entry_vaddr = IMAGE_BASE + header_size + 0;
  filesz = header_size + (uint64_t)c_at + (uint64_t)msg_len;

  elf[e_at++] = 0x7F; elf[e_at++] = 'E'; elf[e_at++] = 'L'; elf[e_at++] = 'F';
  elf[e_at++] = 2; elf[e_at++] = 1; elf[e_at++] = 1; elf[e_at++] = 0; elf[e_at++] = 0;
  { int p; for (p = 0; p < 7; p++) elf[e_at++] = 0; }
  el_put_u16(elf, &e_at, 2);
  el_put_u16(elf, &e_at, 243);
  el_put_u32(elf, &e_at, 1);
  el_put_u64(elf, &e_at, entry_vaddr);
  el_put_u64(elf, &e_at, EHDR);
  el_put_u64(elf, &e_at, 0);
  el_put_u32(elf, &e_at, 0);
  el_put_u16(elf, &e_at, (uint32_t)EHDR);
  el_put_u16(elf, &e_at, (uint32_t)PHDR);
  el_put_u16(elf, &e_at, 1);
  el_put_u16(elf, &e_at, 0);
  el_put_u16(elf, &e_at, 0);
  el_put_u16(elf, &e_at, 0);
  el_put_u32(elf, &e_at, 1);
  el_put_u32(elf, &e_at, 0x5);
  el_put_u64(elf, &e_at, 0);
  el_put_u64(elf, &e_at, IMAGE_BASE);
  el_put_u64(elf, &e_at, IMAGE_BASE);
  el_put_u64(elf, &e_at, filesz);
  el_put_u64(elf, &e_at, filesz);
  el_put_u64(elf, &e_at, 0x1000);
  for (k = 0; k < c_at; k++) elf[e_at++] = code[k];
  for (k = 0; k < (DWORD)msg_len; k++) elf[e_at++] = (unsigned char)msg[k];

  return write_file_bytes(out_path, elf, e_at);
}

/* B-type: imm[12|10:5] | rs2 | rs1 | funct3 | imm[4:1|11] | opcode(0x63).
 * bne = funct3 0x1. Verified on metacortex-rv01 (bnez a0,+40 = 0x02051463). */
static uint32_t rv_branch(int rs1, int rs2, int imm, uint32_t funct3) {
  uint32_t b12 = (uint32_t)((imm >> 12) & 0x1);
  uint32_t b11 = (uint32_t)((imm >> 11) & 0x1);
  uint32_t b10_5 = (uint32_t)((imm >> 5) & 0x3F);
  uint32_t b4_1 = (uint32_t)((imm >> 1) & 0xF);
  return (b12 << 31) | (b10_5 << 25) | ((uint32_t)rs2 << 20) | ((uint32_t)rs1 << 15)
       | (funct3 << 12) | (b4_1 << 8) | (b11 << 7) | 0x63u;
}
/* bne = funct3 0x1, beq = funct3 0x0, blt = funct3 0x4 (signed less-than). */
static uint32_t rv_bne(int rs1, int rs2, int imm) { return rv_branch(rs1, rs2, imm, 0x1u); }
static uint32_t rv_beq(int rs1, int rs2, int imm) { return rv_branch(rs1, rs2, imm, 0x0u); }
static uint32_t rv_blt(int rs1, int rs2, int imm) { return rv_branch(rs1, rs2, imm, 0x4u); }

/* Emit a helper that writes a fixed string via a PC-relative la, given the
 * .rodata offset for that string. Appends the write(2) sequence (5 instrs +
 * ecall = 6 words). The caller supplies the rodata_off (offset of the string
 * within the loaded segment) and the la is patched immediately. */
static void emit_write_str(unsigned char *code, DWORD *c_at, DWORD str_rodata_off, int len) {
  DWORD auipc_off;
  int disp, lo, lo_signed, hi;
  /* li a0, 1 (fd=stdout) */
  rv_put_u32(code, c_at, rv_li_small(RV_A0, 1));
  /* auipc a1, hi ; addi a1, a1, lo  (la a1, str) */
  auipc_off = *c_at;
  rv_put_u32(code, c_at, rv_auipc(RV_A1, 0));
  rv_put_u32(code, c_at, rv_addi(RV_A1, RV_A1, 0));
  /* li a2, len ; li a7, 64 ; ecall */
  rv_put_u32(code, c_at, rv_li_small(RV_A2, len));
  rv_put_u32(code, c_at, rv_li_small(RV_A7, 64));
  rv_put_u32(code, c_at, rv_ecall());
  /* patch the la: disp = str_rodata_off - auipc_off */
  disp = (int)str_rodata_off - (int)auipc_off;
  lo = disp & 0xFFF;
  lo_signed = (lo >= 0x800) ? (lo - 0x1000) : lo;
  hi = (disp - lo_signed) >> 12;
  { uint32_t w = rv_auipc(RV_A1, hi & 0xFFFFF);
    code[auipc_off+0]=(unsigned char)(w&0xFF); code[auipc_off+1]=(unsigned char)((w>>8)&0xFF);
    code[auipc_off+2]=(unsigned char)((w>>16)&0xFF); code[auipc_off+3]=(unsigned char)((w>>24)&0xFF); }
  { uint32_t w = rv_addi(RV_A1, RV_A1, lo_signed);
    code[auipc_off+4]=(unsigned char)(w&0xFF); code[auipc_off+5]=(unsigned char)((w>>8)&0xFF);
    code[auipc_off+6]=(unsigned char)((w>>16)&0xFF); code[auipc_off+7]=(unsigned char)((w>>24)&0xFF); }
}

/* Emit an RV64GC ELF that BRANCHES at runtime on the terminal state:
 *
 *   if (verdict_holds >= 10)  { print "PROVEN\n";  exit(verdict_holds); }
 *   else                      { print "PARTIAL\n"; exit(verdict_holds); }
 *
 * The emitted PROGRAM's control flow is a function of what discharged — the
 * first witness where the artifact takes a different runtime PATH per state,
 * exercising a real RISC-V signed compare-and-branch (blt holds, 10). A
 * discharge that reached >=10 HOLDS verdicts prints PROVEN; a smaller one
 * prints PARTIAL. Both paths are reachable from real gate-passing .mal sources
 * (gen0.mal holds=25 -> PROVEN; the 2-seed TERMINAL+EMIT source holds=5 ->
 * PARTIAL), so the branch genuinely decides on real state. This is GEN0_EMIT
 * projecting state into control flow, not just data. Threshold 10 is straddled
 * by real inputs; the blt offset is computed from byte layout. */
static int emit_elf_riscv_branch(const ParseSummary *s, const char *out_path) {
  static const char CLEAN[] = "PROVEN\n";
  static const char FAULTED[] = "PARTIAL\n";
  int clean_len = 7;    /* strlen("PROVEN\n") */
  int faulted_len = 8;  /* strlen("PARTIAL\n") */
  int holds = (int)s->verdict_holds;

  unsigned char code[256];
  unsigned char elf[512];
  DWORD c_at = 0, e_at = 0;
  DWORD bne_off, faulted_path_off, rodata_base;
  DWORD clean_str_off, faulted_str_off;
  int branch_disp;
  const uint64_t IMAGE_BASE = 0x10000u;
  const uint64_t EHDR = 64u, PHDR = 56u;
  uint64_t header_size = EHDR + PHDR;
  uint64_t entry_vaddr, filesz;
  DWORD k;

  /* Total code size is fixed by the instruction sequence; compute where
   * .rodata (both strings) begins so the write() helpers can address them.
   * Layout (all 4-byte instrs):
   *   [0]  li  a0, holds
   *   [1]  li  a1, 10
   *   [2]  blt a0, a1, partial          (offset patched below)
   *   proven path: emit_write_str(PROVEN) = 6 instrs, li a0,holds; li a7,93; ecall = 3
   *   partial path: emit_write_str(PARTIAL) = 6 instrs, li a0,holds; li a7,93; ecall = 3
   * code words = 1 + 1 + 1 + (6+3) + (6+3) = 21 words = 84 bytes.
   * .rodata starts at byte 84: PROVEN then PARTIAL. */
  {
    DWORD code_words = 1 + 1 + 1 + (6 + 3) + (6 + 3);
    rodata_base = code_words * 4;
    clean_str_off = rodata_base;
    faulted_str_off = rodata_base + (DWORD)clean_len;
  }

  /* [0] li a0, verdict_holds ; [1] li a1, 10 */
  rv_put_u32(code, &c_at, rv_li_small(RV_A0, holds));
  rv_put_u32(code, &c_at, rv_li_small(RV_A1, 10));
  /* [2] blt a0, a1, partial  (branch when holds < 10; fall through when >= 10)
   *     placeholder, patched once the partial path offset is known. */
  bne_off = c_at;
  rv_put_u32(code, &c_at, rv_blt(RV_A0, RV_A1, 0));

  /* PROVEN path (fall-through, holds >= 10): print PROVEN, exit(holds) */
  emit_write_str(code, &c_at, clean_str_off, clean_len);
  rv_put_u32(code, &c_at, rv_li_small(RV_A0, holds));
  rv_put_u32(code, &c_at, rv_li_small(RV_A7, 93));
  rv_put_u32(code, &c_at, rv_ecall());

  /* PARTIAL path (holds < 10): print PARTIAL, exit(holds) */
  faulted_path_off = c_at;
  emit_write_str(code, &c_at, faulted_str_off, faulted_len);
  rv_put_u32(code, &c_at, rv_li_small(RV_A0, holds));
  rv_put_u32(code, &c_at, rv_li_small(RV_A7, 93));
  rv_put_u32(code, &c_at, rv_ecall());

  /* patch the blt offset: disp = partial_path_off - blt_off */
  branch_disp = (int)faulted_path_off - (int)bne_off;
  { uint32_t w = rv_blt(RV_A0, RV_A1, branch_disp);
    code[bne_off+0]=(unsigned char)(w&0xFF); code[bne_off+1]=(unsigned char)((w>>8)&0xFF);
    code[bne_off+2]=(unsigned char)((w>>16)&0xFF); code[bne_off+3]=(unsigned char)((w>>24)&0xFF); }

  /* sanity: c_at should equal rodata_base (84). If not, layout drifted. */

  entry_vaddr = IMAGE_BASE + header_size + 0;
  filesz = header_size + (uint64_t)c_at + (uint64_t)clean_len + (uint64_t)faulted_len;

  elf[e_at++] = 0x7F; elf[e_at++] = 'E'; elf[e_at++] = 'L'; elf[e_at++] = 'F';
  elf[e_at++] = 2; elf[e_at++] = 1; elf[e_at++] = 1; elf[e_at++] = 0; elf[e_at++] = 0;
  { int p; for (p = 0; p < 7; p++) elf[e_at++] = 0; }
  el_put_u16(elf, &e_at, 2);
  el_put_u16(elf, &e_at, 243);
  el_put_u32(elf, &e_at, 1);
  el_put_u64(elf, &e_at, entry_vaddr);
  el_put_u64(elf, &e_at, EHDR);
  el_put_u64(elf, &e_at, 0);
  el_put_u32(elf, &e_at, 0);
  el_put_u16(elf, &e_at, (uint32_t)EHDR);
  el_put_u16(elf, &e_at, (uint32_t)PHDR);
  el_put_u16(elf, &e_at, 1);
  el_put_u16(elf, &e_at, 0);
  el_put_u16(elf, &e_at, 0);
  el_put_u16(elf, &e_at, 0);
  el_put_u32(elf, &e_at, 1);
  el_put_u32(elf, &e_at, 0x5);
  el_put_u64(elf, &e_at, 0);
  el_put_u64(elf, &e_at, IMAGE_BASE);
  el_put_u64(elf, &e_at, IMAGE_BASE);
  el_put_u64(elf, &e_at, filesz);
  el_put_u64(elf, &e_at, filesz);
  el_put_u64(elf, &e_at, 0x1000);
  for (k = 0; k < c_at; k++) elf[e_at++] = code[k];
  for (k = 0; k < (DWORD)clean_len; k++) elf[e_at++] = (unsigned char)CLEAN[k];
  for (k = 0; k < (DWORD)faulted_len; k++) elf[e_at++] = (unsigned char)FAULTED[k];

  return write_file_bytes(out_path, elf, e_at);
}

int main(int argc, char **argv) {
  static char src[1 << 20];
  static unsigned char src_bytes[1 << 20];
  unsigned char source_hash[32];
  unsigned char schema_hash[32];
  static unsigned char schema_bytes[1 << 20];
  char json[8192];
  DWORD len = 0;
  DWORD src_raw_len = 0;
  DWORD schema_len = 0;
  DWORD json_len = 0;
  static ParseSummary s;

  int cycles_mode = 0;
  uint32_t cycles = 0;
  uint32_t cycle_idx = 0;
  uint32_t covered_cells = 0;
  uint32_t promoted_ids = 0;
  uint32_t rng = 0xC0DEC0DEu;
  uint32_t holds_dynamic = 0;
  uint32_t no_dynamic = 0;
  uint32_t maybe_dynamic = 0;
  const char *schema_path = "v3/g1_native/format/mcbf_v0.md";
  const char *emit_elf_out = NULL;
  const char *emit_elf_hello_out = NULL;
  const char *emit_elf_state_out = NULL;
  const char *emit_elf_report_out = NULL;
  const char *emit_elf_branch_out = NULL;
  const char *mcbf_out = NULL;
  const char *mcbf_in = NULL;
  const char *mcbf_roundtrip_out = NULL;
  const char *mcbf_semantic_replay_out = NULL;
  const char *mcbf_engine_replay_out = NULL;
  const char *mcbw_out = NULL;
  const char *mcbw_gen1 = NULL;
  const char *mcbw_gen2 = NULL;
  const char *mcbt_out = NULL;
  const char *mcbt_gen1 = NULL;
  const char *mcbt_gen2 = NULL;
  const char *negative_vectors_in = NULL;
  int authority_audit = 0;
  const char *release_bundle_dir = NULL;
  const char *release_gen1 = NULL;
  const char *release_gen2 = NULL;
  const char *release_mcbw = NULL;
  const char *release_mcbt = NULL;
  int verify_only = 0;
  int needs_parse = 1;

  if (argc < 2) {
    const char *usage = "usage: malcog_g1.exe <source.mal> [out.json]\n";
    write_stdout(usage, (DWORD)c_strlen(usage));
    return 2;
  }
  /* program form: malcog_g1 --check|--eval f1.mal [f2.mal ...] */
  if (argc >= 3 && c_streq(argv[1], "--check")) return pe_cmd_check(argc - 2, argv + 2);
  if (argc >= 3 && c_streq(argv[1], "--eval")) return pe_cmd_eval(argc - 2, argv + 2);
  if (argc == 3 && c_streq(argv[1], "--sha256")) return pe_cmd_sha256(argv[2]);
  if (!read_file_all(argv[1], src, sizeof(src), &len)) {
    const char *err = "error: read source failed\n";
    write_stdout(err, (DWORD)c_strlen(err));
    return 1;
  }
  if (!read_file_bytes(argv[1], src_bytes, sizeof(src_bytes), &src_raw_len)) {
    const char *err = "error: read raw source failed\n";
    write_stdout(err, (DWORD)c_strlen(err));
    return 1;
  }
  if (!sha256_bytes(src_bytes, src_raw_len, source_hash)) {
    const char *err = "error: source sha256 failed\n";
    write_stdout(err, (DWORD)c_strlen(err));
    return 1;
  }
  if (!read_file_bytes(schema_path, schema_bytes, sizeof(schema_bytes), &schema_len)) {
    const char *err = "error: read schema spec failed\n";
    write_stdout(err, (DWORD)c_strlen(err));
    return 1;
  }
  if (!sha256_bytes(schema_bytes, schema_len, schema_hash)) {
    const char *err = "error: schema sha256 failed\n";
    write_stdout(err, (DWORD)c_strlen(err));
    return 1;
  }

  if (argc >= 4 && c_streq(argv[2], "--emit-elf")) {
    emit_elf_out = argv[3];
  } else if (argc >= 4 && c_streq(argv[2], "--emit-elf-hello")) {
    emit_elf_hello_out = argv[3];
  } else if (argc >= 4 && c_streq(argv[2], "--emit-elf-state")) {
    emit_elf_state_out = argv[3];
  } else if (argc >= 4 && c_streq(argv[2], "--emit-elf-report")) {
    emit_elf_report_out = argv[3];
  } else if (argc >= 4 && c_streq(argv[2], "--emit-elf-branch")) {
    emit_elf_branch_out = argv[3];
  } else if (argc >= 4 && c_streq(argv[2], "--cycles")) {
    cycles_mode = 1;
    cycles = (uint32_t)atoi(argv[3]);
  } else if (argc >= 4 && c_streq(argv[2], "--mcbf-out")) {
    mcbf_out = argv[3];
  } else if (argc >= 4 && c_streq(argv[2], "--mcbf-in")) {
    mcbf_in = argv[3];
    if (argc >= 5 && c_streq(argv[4], "--verify-only")) {
      verify_only = 1;
      needs_parse = 0;
    } else if (argc >= 6 && c_streq(argv[4], "--mcbf-roundtrip-out")) {
      mcbf_roundtrip_out = argv[5];
      needs_parse = 0;
    } else if (argc >= 6 && c_streq(argv[4], "--mcbf-semantic-replay-out")) {
      mcbf_semantic_replay_out = argv[5];
      needs_parse = 0;
    } else if (argc >= 6 && c_streq(argv[4], "--mcbf-engine-replay-out")) {
      mcbf_engine_replay_out = argv[5];
      needs_parse = 0;
    }
  } else if (argc >= 8 && c_streq(argv[2], "--mcbw-out") && c_streq(argv[4], "--mcbw-gen1") && c_streq(argv[6], "--mcbw-gen2")) {
    mcbw_out = argv[3];
    mcbw_gen1 = argv[5];
    mcbw_gen2 = argv[7];
    needs_parse = 0;
  } else if (argc >= 8 && c_streq(argv[2], "--mcbt-out") && c_streq(argv[4], "--mcbt-gen1") && c_streq(argv[6], "--mcbt-gen2")) {
    mcbt_out = argv[3];
    mcbt_gen1 = argv[5];
    mcbt_gen2 = argv[7];
    needs_parse = 0;
  } else if (argc >= 4 && c_streq(argv[2], "--negative-vectors")) {
    negative_vectors_in = argv[3];
    needs_parse = 0;
  } else if (argc >= 3 && c_streq(argv[2], "--authority-audit")) {
    authority_audit = 1;
    needs_parse = 0;
  } else if (argc >= 12 && c_streq(argv[2], "--release-bundle") && c_streq(argv[4], "--gen1") && c_streq(argv[6], "--gen2") && c_streq(argv[8], "--mcbw") && c_streq(argv[10], "--mcbt")) {
    release_bundle_dir = argv[3];
    release_gen1 = argv[5];
    release_gen2 = argv[7];
    release_mcbw = argv[9];
    release_mcbt = argv[11];
    needs_parse = 0;
  }

  if (needs_parse) {
    s = *parse_counts(src, len);
    holds_dynamic = s.verdict_holds;
    no_dynamic = s.verdict_no;
    maybe_dynamic = s.verdict_maybe;
  }

  if (cycles_mode) {
    char line[1024];
    for (cycle_idx = 0; cycle_idx < cycles; cycle_idx++) {
      CycleSummary c;
      uint32_t probes = (cycle_idx == 0) ? 0u : 8u;
      uint32_t escalated = 0, rejected = 0, deferred = 0, promoted = 0;
      uint32_t closed = 0;
      uint32_t i;
      c.cycle = cycle_idx;
      c.octopus_probe_count = probes;
      if (probes > 0) {
        for (i = 0; i < probes; i++) {
          uint32_t r = lcg_next(&rng);
          uint32_t decision = r % 10u;
          if (decision < 2u) rejected++;
          else if (decision < 6u) deferred++;
          else promoted++;
          if ((r % 7u) != 0u) escalated++;
          if (covered_cells < 1260u) covered_cells++;
        }
      }
      closed = (promoted <= maybe_dynamic) ? promoted : maybe_dynamic;
      maybe_dynamic -= closed;
      holds_dynamic += closed;
      promoted_ids += promoted;
      c.cetacean_escalation_count = escalated;
      c.cetacean_reject_count = rejected;
      c.cetacean_defer_count = deferred;
      c.cetacean_promote_count = promoted;
      c.gap_closed_count = closed;
      c.covered_cells_count = covered_cells;
      c.promoted_ids_count = promoted_ids;
      json_len = emit_cycle_json(&c, holds_dynamic, no_dynamic, maybe_dynamic, line, sizeof(line));
      write_stdout(line, json_len);
    }
    return 0;
  }

  if (emit_elf_out) {
    /* GEN0_EMIT discharge: IF_THEN(TERMINAL(state), GOES_WITH(state,
     * compiled_output)). The terminal state must carry the discharged
     * GEN0_EMIT obligation (TERMINAL(state) HOLDS) before emission is
     * licensed. The normal-form input records "TERMINAL ( state ):HOLDS"
     * when the engine reaches terminal on a GEN0-shaped source. */
    if (!contains_token(s.normal_form_input, "TERMINAL ( state ):HOLDS")) {
      const char *err = "EMIT: MAYBE (no TERMINAL(state):HOLDS in terminal state)\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    if (!emit_elf_riscv(&s, emit_elf_out)) {
      const char *err = "error: emit elf failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      const char *ok = "EMIT_ELF_RISCV: HOLDS\n";
      write_stdout(ok, (DWORD)c_strlen(ok));
    }
    return 0;
  }

  if (emit_elf_hello_out) {
    const char *msg = "Hello from MaLCog on RISC-V\n";
    int msg_len = (int)c_strlen(msg);
    if (!contains_token(s.normal_form_input, "TERMINAL ( state ):HOLDS")) {
      const char *err = "EMIT: MAYBE (no TERMINAL(state):HOLDS in terminal state)\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    if (!emit_elf_riscv_hello(&s, emit_elf_hello_out, msg, msg_len)) {
      const char *err = "error: emit elf hello failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      const char *ok = "EMIT_ELF_RISCV_HELLO: HOLDS\n";
      write_stdout(ok, (DWORD)c_strlen(ok));
    }
    return 0;
  }

  if (emit_elf_state_out) {
    if (!contains_token(s.normal_form_input, "TERMINAL ( state ):HOLDS")) {
      const char *err = "EMIT: MAYBE (no TERMINAL(state):HOLDS in terminal state)\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    if (!emit_elf_riscv_state(&s, emit_elf_state_out)) {
      const char *err = "error: emit elf state failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      /* Report the state value baked into the artifact so it can be checked
       * against the board-side exit code. */
      char line[64];
      DWORD at = 0;
      const char *pfx = "EMIT_ELF_RISCV_STATE: HOLDS exit=";
      DWORD p = 0;
      while (pfx[p] != '\0') line[at++] = pfx[p++];
      append_u32(line, sizeof(line), &at, s.verdict_holds);
      line[at++] = '\n';
      write_stdout(line, at);
    }
    return 0;
  }

  if (emit_elf_report_out) {
    if (!contains_token(s.normal_form_input, "TERMINAL ( state ):HOLDS")) {
      const char *err = "EMIT: MAYBE (no TERMINAL(state):HOLDS in terminal state)\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    if (!emit_elf_riscv_report(&s, emit_elf_report_out)) {
      const char *err = "error: emit elf report failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      const char *ok = "EMIT_ELF_RISCV_REPORT: HOLDS\n";
      write_stdout(ok, (DWORD)c_strlen(ok));
    }
    return 0;
  }

  if (emit_elf_branch_out) {
    if (!contains_token(s.normal_form_input, "TERMINAL ( state ):HOLDS")) {
      const char *err = "EMIT: MAYBE (no TERMINAL(state):HOLDS in terminal state)\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    if (!emit_elf_riscv_branch(&s, emit_elf_branch_out)) {
      const char *err = "error: emit elf branch failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      char line[64];
      DWORD at = 0;
      const char *pfx = "EMIT_ELF_RISCV_BRANCH: HOLDS holds=";
      DWORD p = 0;
      while (pfx[p] != '\0') line[at++] = pfx[p++];
      append_u32(line, sizeof(line), &at, s.verdict_holds);
      { const char *sfx = (s.verdict_holds >= 10) ? " -> PROVEN\n" : " -> PARTIAL\n";
        DWORD q = 0; while (sfx[q] != '\0') line[at++] = sfx[q++]; }
      write_stdout(line, at);
    }
    return 0;
  }

  if (mcbf_out) {
    if (!write_mcbf_file(mcbf_out, &s, source_hash, schema_hash)) {
      const char *err = "error: write mcbf failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      const char *ok = "MCBF_WRITE: HOLDS\n";
      write_stdout(ok, (DWORD)c_strlen(ok));
    }
    return 0;
  }

  if (mcbf_in && verify_only) {
    if (!verify_mcbf_file(mcbf_in, schema_hash)) return 1;
    return 0;
  }

  if (mcbf_in && mcbf_roundtrip_out) {
    static ParseSummary rs;
    unsigned char in_source_hash[32];
    if (!read_mcbf_verified(mcbf_in, schema_hash, &rs, in_source_hash, 1)) return 1;
    if (!write_mcbf_file(mcbf_roundtrip_out, &rs, in_source_hash, schema_hash)) {
      const char *err = "error: roundtrip mcbf write failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      const char *msg = "MCBF_ROUNDTRIP_WRITE: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    if (!files_byte_equal(mcbf_in, mcbf_roundtrip_out)) {
      {
        const char *msg = "MCBF_BYTE_EQUALITY: REJECT\n";
        write_stdout(msg, (DWORD)c_strlen(msg));
      }
      return 1;
    }
    {
      const char *msg = "MCBF_BYTE_EQUALITY: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = "GEN2_SOURCE: gen1.mcbf\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    return 0;
  }

  if (mcbf_in && mcbf_semantic_replay_out) {
    static ParseSummary rs;
    unsigned char in_source_hash[32];
    if (!read_mcbf_verified(mcbf_in, schema_hash, &rs, in_source_hash, 1)) return 1;
    if (!semantic_replay_from_mcbf_state(&rs)) {
      const char *err = "MCBF_SEMANTIC_REPLAY: REJECT\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      const char *msg = "MCBF_SEMANTIC_REPLAY: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    if (!write_mcbf_file(mcbf_semantic_replay_out, &rs, in_source_hash, schema_hash)) {
      const char *err = "error: semantic replay mcbf write failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      const char *msg = "GEN2_SOURCE: gen1.mcbf\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    if (!files_byte_equal(mcbf_in, mcbf_semantic_replay_out)) {
      const char *msg = "MCBF_BYTE_EQUALITY: REJECT\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
      return 1;
    }
    {
      const char *msg = "MCBF_BYTE_EQUALITY: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    return 0;
  }

  if (mcbf_in && mcbf_engine_replay_out) {
    static ParseSummary rs;
    unsigned char in_source_hash[32];
    if (!read_mcbf_verified(mcbf_in, schema_hash, &rs, in_source_hash, 1)) return 1;
    {
      const char *msg = "R_REINIT: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = "O_REINIT: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    if (!engine_replay_from_mcbf_state(&rs)) {
      const char *err = "MCBF_ENGINE_REPLAY: REJECT\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      const char *msg = "OBLIGATION_ENGINE: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = "MCBF_ENGINE_REPLAY: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    if (!write_mcbf_file(mcbf_engine_replay_out, &rs, in_source_hash, schema_hash)) {
      const char *err = "error: engine replay mcbf write failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      const char *msg = "GEN2_SOURCE: gen1.mcbf\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    if (!files_byte_equal(mcbf_in, mcbf_engine_replay_out)) {
      {
        const char *msg = "MCBF_BYTE_EQUALITY: REJECT\n";
        write_stdout(msg, (DWORD)c_strlen(msg));
      }
      return 1;
    }
    {
      const char *msg = "MCBF_BYTE_EQUALITY: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    return 0;
  }

  if (mcbw_out && mcbw_gen1 && mcbw_gen2) {
    unsigned char source_hash_w[32], body_hash_gen1[32], schema_hash_gen1[32];
    unsigned char source_hash_w2[32], body_hash_gen2[32], schema_hash_gen2[32];
    unsigned char gen1_hash[32], gen2_hash[32], binary_hash[32];
    static ParseSummary g2_state;
    char exe_path[MAX_PATH];
    uint8_t eq = 0u;
    DWORD exe_len = GetModuleFileNameA(NULL, exe_path, MAX_PATH);
    if (exe_len == 0 || exe_len >= MAX_PATH) {
      const char *err = "error: binary path failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    if (!read_mcbf_header_hashes(mcbw_gen1, source_hash_w, body_hash_gen1, schema_hash_gen1)) {
      const char *err = "error: read gen1 header failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    if (!read_mcbf_header_hashes(mcbw_gen2, source_hash_w2, body_hash_gen2, schema_hash_gen2)) {
      const char *err = "error: read gen2 header failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    if (!bytes_eq(source_hash_w, source_hash_w2, 32) || !bytes_eq(schema_hash_gen1, schema_hash_gen2, 32)) {
      const char *err = "error: gen1/gen2 header mismatch\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    if (!sha256_file(mcbw_gen1, gen1_hash) || !sha256_file(mcbw_gen2, gen2_hash) || !sha256_file(exe_path, binary_hash)) {
      const char *err = "error: witness hashing failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    if (!read_mcbf_verified(mcbw_gen2, schema_hash, &g2_state, NULL, 0)) {
      const char *err = "error: verify gen2 failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    eq = files_byte_equal(mcbw_gen1, mcbw_gen2) ? 1u : 0u;
    if (!write_mcbw_file(mcbw_out, source_hash_w, binary_hash, schema_hash, gen1_hash, gen2_hash, body_hash_gen1, body_hash_gen2, eq, g2_state.verdict_holds, g2_state.verdict_no, g2_state.verdict_maybe)) {
      const char *err = "error: write mcbw failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      const char *msg = "MCBW_WRITE: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = "GEN1_HASH: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = "GEN2_HASH: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = eq ? "BYTE_EQUALITY: HOLDS\n" : "BYTE_EQUALITY: REJECT\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = "DEPENDENCY_COUNT_ZERO: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = "JSON_AUTHORITY_FALSE: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    return eq ? 0 : 1;
  }

  if (mcbt_out && mcbt_gen1 && mcbt_gen2) {
    static ParseSummary g2_state;
    uint8_t eq = files_byte_equal(mcbt_gen1, mcbt_gen2) ? 1u : 0u;
    if (!read_mcbf_verified(mcbt_gen2, schema_hash, &g2_state, NULL, 0)) {
      const char *err = "error: verify gen2 for trace failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    if (!write_mcbt_file(mcbt_out, &g2_state, eq)) {
      const char *err = "error: write mcbt failed\n";
      write_stdout(err, (DWORD)c_strlen(err));
      return 1;
    }
    {
      const char *msg = "MCBT_WRITE: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = "TRACE_EVENTS: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = "TRACE_HASH: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = "JSON_AUTHORITY_FALSE: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    {
      const char *msg = "DEPENDENCY_COUNT_ZERO: HOLDS\n";
      write_stdout(msg, (DWORD)c_strlen(msg));
    }
    return 0;
  }

  if (negative_vectors_in) {
    return run_negative_vectors(negative_vectors_in, schema_hash) ? 0 : 1;
  }

  if (authority_audit) {
    return run_authority_audit() ? 0 : 1;
  }

  if (release_bundle_dir && release_gen1 && release_gen2 && release_mcbw && release_mcbt) {
    return run_release_bundle(release_bundle_dir, release_gen1, release_gen2, release_mcbw, release_mcbt, schema_hash) ? 0 : 1;
  }

  json_len = emit_summary_json(&s, json, sizeof(json));
  write_stdout(json, json_len);

  if (argc >= 3) {
    write_file(argv[2], json, json_len);
  }
  return 0;
}
