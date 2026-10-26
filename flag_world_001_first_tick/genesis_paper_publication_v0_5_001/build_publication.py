"""Publication typesetting only. This script is not in the MaL execution path.

Requirements: reportlab, pypdf; licensed Windows fonts supplied by the host.
Run from any directory: python build_publication.py
The promoted manuscript is never modified.
"""
from pathlib import Path
import hashlib
import html
import json
import re

from reportlab import Version as REPORTLAB_VERSION
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, HRFlowable,
)
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'GENESIS_ON_THE_GPU_v0.5_publication.md'
FROZEN = ROOT.parent / 'genesis_paper_promotion_v0_5_001' / 'GENESIS_ON_THE_GPU_v0.5.md'
OUTPUT = ROOT / 'output' / 'pdf'
OUTPUT.mkdir(parents=True, exist_ok=True)
PDF = OUTPUT / 'Genesis_on_the_GPU_v0.5.pdf'
FROZEN_HASH = '65D2DB5EA689F040B304E5AB89AD33A86220CA1152A2847ADEE9712A048998DF'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()

if sha(FROZEN) != FROZEN_HASH:
    raise RuntimeError('NOT-SAME: promoted manuscript identity')

fontdir = Path('C:/Windows/Fonts')
fontfiles = {
    'Body': ('georgia.ttf', 0),
    'Body-Bold': ('georgiab.ttf', 0),
    'Body-Italic': ('georgiai.ttf', 0),
    'Body-BoldItalic': ('georgiaz.ttf', 0),
    'Sans': ('segoeui.ttf', 0),
    'Sans-Bold': ('segoeuib.ttf', 0),
    'Mono': ('consola.ttf', 0),
    'Math': ('cambria.ttc', 1),
}
for name, (filename, index) in fontfiles.items():
    pdfmetrics.registerFont(TTFont(name, str(fontdir / filename), subfontIndex=index))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Body-Bold', italic='Body-Italic', boldItalic='Body-BoldItalic')
pdfmetrics.registerFontFamily('Sans', normal='Sans', bold='Sans-Bold', italic='Sans', boldItalic='Sans-Bold')
pdfmetrics.registerFontFamily('Mono', normal='Mono', bold='Mono', italic='Mono', boldItalic='Mono')
pdfmetrics.registerFontFamily('Math', normal='Math', bold='Math', italic='Math', boldItalic='Math')

INK = colors.HexColor('#192b32')
ACCENT = colors.HexColor('#15576a')
MUTED = colors.HexColor('#52656e')
RULE = colors.HexColor('#bacbd1')
PALE = colors.HexColor('#eef4f5')
WIDTH = 504
styles = {
    'body': ParagraphStyle('Body', fontName='Body', fontSize=10.2, leading=15.1,
                           textColor=INK, spaceAfter=8.3, allowWidows=0, allowOrphans=0),
    'abstract': ParagraphStyle('Abstract', fontName='Body', fontSize=10, leading=14.6,
                               textColor=INK, spaceAfter=12, allowWidows=0, allowOrphans=0),
    'h1': ParagraphStyle('Section', fontName='Sans-Bold', fontSize=15, leading=19,
                         textColor=ACCENT, spaceBefore=15, spaceAfter=8, keepWithNext=1),
    'h2': ParagraphStyle('Subsection', fontName='Sans-Bold', fontSize=11.8, leading=15.2,
                         textColor=INK, spaceBefore=10, spaceAfter=6, keepWithNext=1),
    'title': ParagraphStyle('Title', fontName='Body-Bold', fontSize=28, leading=33,
                            textColor=INK, spaceAfter=7, keepWithNext=1),
    'subtitle': ParagraphStyle('Subtitle', fontName='Body', fontSize=17, leading=23,
                               textColor=ACCENT, spaceAfter=16, keepWithNext=1),
    'author': ParagraphStyle('Author', fontName='Sans', fontSize=10, leading=15,
                             textColor=INK, spaceAfter=12, keepWithNext=1),
    'deck': ParagraphStyle('Deck', fontName='Body-Italic', fontSize=10, leading=14,
                           textColor=MUTED, spaceAfter=13, keepWithNext=1),
    'math': ParagraphStyle('Equation', fontName='Math', fontSize=11.8, leading=20,
                           leftIndent=18, rightIndent=8, spaceBefore=3, spaceAfter=9),
    'table': ParagraphStyle('Table', fontName='Sans', fontSize=8.8, leading=12,
                            textColor=INK, spaceAfter=0),
    'thead': ParagraphStyle('TableHeader', fontName='Sans-Bold', fontSize=8.6,
                            leading=11.6, textColor=INK, spaceAfter=0),
    'ref': ParagraphStyle('Reference', fontName='Body', fontSize=9.2, leading=13.4,
                          textColor=INK, spaceAfter=10, allowWidows=0, allowOrphans=0),
}

missing = set()
def text_markup(text, font='Body'):
    # Rendering substitutions only; the Markdown edition retains its typography.
    text = text.replace('\u2014', ' - ').replace('\u2013', '-').replace('\u2011', '-').replace('\u2010', '-')
    glyphs = pdfmetrics.getFont(font).face.charToGlyph
    fallback = pdfmetrics.getFont('Math').face.charToGlyph
    out = []
    for char in text:
        if char in '₀₁₂₃₄₅₆₇₈₉':
            out.append('<sub>' + str('₀₁₂₃₄₅₆₇₈₉'.index(char)) + '</sub>')
        elif ord(char) not in glyphs and not char.isspace():
            if ord(char) not in fallback:
                missing.add(f'U+{ord(char):04X}')
            out.append('<font name="Math">' + html.escape(char) + '</font>')
        else:
            out.append(html.escape(char))
    return ''.join(out)

token_re = re.compile(r'(`[^`]+`|\[[^\]]+\]\([^\s)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)')
def inline(text, font='Body', ref=False):
    result = []
    for token in token_re.split(text):
        if token.startswith('`') and token.endswith('`'):
            size = '7.9' if ref else '8.5'
            result.append(f'<font name="Mono" size="{size}">' + text_markup(token[1:-1], 'Mono') + '</font>')
        elif token.startswith('[') and '](' in token:
            label, url = token[1:].split('](', 1)
            url = url[:-1]
            if not url.startswith('https://'):
                raise RuntimeError('Non-public citation: ' + url)
            result.append('<link href="' + html.escape(url, quote=True) + '" color="#15576a">' + text_markup(label, font) + '</link>')
        elif token.startswith('**') and token.endswith('**'):
            result.append('<b>' + text_markup(token[2:-2], font) + '</b>')
        elif token.startswith('*') and token.endswith('*'):
            result.append('<i>' + text_markup(token[1:-1], font) + '</i>')
        else:
            result.append(text_markup(token, font))
    return ''.join(result)

equations = [
    '<i>q</i> : <i>F</i> → {NO, THIS}.',
    '<i>W</i>(<i>q</i>) = {{<i>f</i>, <i>g</i>} ∈ Ω | <i>q</i>(<i>f</i>) ≠ <i>q</i>(<i>g</i>)}.',
    '<i>D</i>(<i>q</i>, <i>q</i>′) = <i>W</i>(<i>q</i>) ∖ <i>W</i>(<i>q</i>′),<br/>'
    '<i>O</i>(<i>q</i>, <i>q</i>′) = <i>W</i>(<i>q</i>′) ∖ <i>W</i>(<i>q</i>),<br/>'
    '<i>R</i><sub>retained</sub>(<i>q</i>, <i>q</i>′) = <i>W</i>(<i>q</i>) ∩ <i>W</i>(<i>q</i>′).',
    '<i>K</i><sub><i>A</i></sub>(<i>q</i>) = {<i>a</i> ∈ <i>A</i>(<i>q</i>) | '
    '<i>D</i>(<i>q</i>, <i>a</i>(<i>q</i>)) ≠ ∅ ∧ <i>O</i>(<i>q</i>, <i>a</i>(<i>q</i>)) = ∅}.',
]
expected_math = [
    r'q:F\longrightarrow\{\mathrm{NO},\mathrm{THIS}\}.',
    r'W(q)=\{\{f,g\}\in\Omega\mid q(f)\ne q(g)\}.',
    "\\begin{aligned}\nD(q,q')&=W(q)\\setminus W(q'),\\\\\nO(q,q')&=W(q')\\setminus W(q),\\\\\nR_{\\mathrm{retained}}(q,q')&=W(q)\\cap W(q').\n\\end{aligned}",
    r'K_A(q)=\{a\in A(q)\mid D(q,a(q))\ne\varnothing\ \land\ O(q,a(q))=\varnothing\}.',
]

source = SOURCE.read_text(encoding='utf-8')
blocks = re.split(r'\n\s*\n', source.strip())
story = [
    Paragraph('Genesis on the GPU', styles['title']),
    Paragraph('A World That Proposes Its Own Next Step', styles['subtitle']),
    Paragraph('Devon A. Generally · MetaCortex Dynamics LLC<br/>'
              '<link href="https://orcid.org/0009-0004-8164-2159" color="#15576a">ORCID 0009-0004-8164-2159</link>'
              '<br/>Version 0.5 · Promoted 26 October 2026', styles['author']),
    Paragraph('Settlement, persistent structure and a world that proposes from its own returned state', styles['deck']),
    HRFlowable(width='100%', thickness=0.7, color=RULE, spaceAfter=6),
]
math_count = 0
table_count = 0
reference_mode = False
abstract_next = False
for block in blocks[2:]:
    if block.startswith('```math\n'):
        expr = block[len('```math\n'):-3].strip()
        if math_count >= len(expected_math) or expr != expected_math[math_count]:
            raise RuntimeError('NOT-SAME equation source ' + str(math_count + 1))
        story.append(Paragraph(equations[math_count], styles['math']))
        math_count += 1
    elif block.startswith('|'):
        rows = [line.strip().strip('|').split('|') for line in block.splitlines()]
        rows = [row for row in rows if not all(re.fullmatch(r'\s*:?-+:?\s*', cell) for cell in row)]
        data = [[Paragraph(inline(cell.strip(), 'Sans'), styles['thead'] if i == 0 else styles['table'])
                 for cell in row] for i, row in enumerate(rows)]
        widths = [[236, 62, 206], [107, 55, 65, 104, 173], [245, 99, 98, 62]][table_count]
        # SimpleDocTemplate's frame has 6 pt padding on both sides.
        table = Table(data, colWidths=[w * 492 / 504 for w in widths], hAlign='LEFT', repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PALE),
            ('LINEABOVE', (0, 0), (-1, 0), 0.7, ACCENT),
            ('LINEBELOW', (0, 0), (-1, 0), 0.5, RULE),
            ('LINEBELOW', (0, -1), (-1, -1), 0.7, ACCENT),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 7),
            ('RIGHTPADDING', (0, 0), (-1, -1), 7),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafb')]),
        ]))
        story.append(KeepTogether([Spacer(1, 3), table, Spacer(1, 13)]))
        table_count += 1
    elif block.startswith('## '):
        story.append(Paragraph(inline(block[3:], 'Sans'), styles['h2']))
    elif block.startswith('# '):
        title = block[2:]
        if title == 'References and evidence ledger':
            reference_mode = True
            story.append(PageBreak())
        abstract_next = title == 'Abstract'
        story.append(Paragraph(inline(title, 'Sans'), styles['h1']))
    else:
        key = 'ref' if reference_mode else ('abstract' if abstract_next else 'body')
        story.append(Paragraph(inline(block.replace('\n', ' '), ref=reference_mode), styles[key]))
        abstract_next = False

if math_count != 4 or table_count != 3 or missing:
    raise RuntimeError(f'Incomplete rendering: math={math_count}, tables={table_count}, glyphs={missing}')

def furniture(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFont('Sans', 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(54, 760, 'GENESIS ON THE GPU')
        canvas.drawRightString(558, 760, 'Devon A. Generally')
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.4)
        canvas.line(54, 751, 558, 751)
    canvas.setFillColor(MUTED)
    canvas.setFont('Sans', 7.6)
    canvas.drawString(54, 28, 'Version 0.5  |  26 October 2026')
    canvas.drawRightString(558, 28, str(doc.page))
    canvas.restoreState()

doc = SimpleDocTemplate(str(PDF), pagesize=letter, leftMargin=54, rightMargin=54,
                        topMargin=53, bottomMargin=48, title='Genesis on the GPU: A World That Proposes Its Own Next Step',
                        author='Devon A. Generally', subject='Witnessed settlement, persistence and renewed proposal on a geometric GPU world',
                        creator='MetaCortex Dynamics LLC / publication typesetting', pageCompression=1, invariant=1)
doc.build(story, onFirstPage=furniture, onLaterPages=furniture)
reader = PdfReader(PDF)
page_text = [p.extract_text() for p in reader.pages]
extracted = '\n'.join(page_text)
compact = re.sub(r'\s+', '', extracted)
hashes = sorted(set(re.findall(r'(?<![0-9a-fA-F])[0-9a-fA-F]{64}(?![0-9a-fA-F])', source)))
missing_hashes = [h for h in hashes if h not in compact]
uris = sorted(set(str(a.get_object().get('/A', {}).get('/URI'))
                  for p in reader.pages for a in p.get('/Annots', [])
                  if a.get_object().get('/A', {}).get('/URI')))
expected_uris = set(re.findall(r'\]\((https://[^)]+)\)', source)) | {'https://orcid.org/0009-0004-8164-2159'}
missing_uris = sorted(expected_uris - set(uris))
if missing_hashes or missing_uris or 'library-file:' in extracted or '\ufffd' in extracted:
    raise RuntimeError(f'PDF custody check: hashes={missing_hashes}; links={missing_uris}')
checks = {
    'schema': 'GENESIS_PUBLICATION_BUILD_001',
    'scope': 'Document typesetting only; no MaL execution or experimental rerun',
    'promoted_source': {'path': str(FROZEN.relative_to(ROOT.parent)), 'sha256': sha(FROZEN)},
    'publication_source': {'path': SOURCE.name, 'sha256': sha(SOURCE), 'bytes': SOURCE.stat().st_size},
    'pdf': {'path': 'output/pdf/' + PDF.name, 'sha256': sha(PDF), 'bytes': PDF.stat().st_size, 'pages': len(reader.pages)},
    'checks': {'math_blocks': math_count, 'tables': table_count, 'hashes_preserved': len(hashes),
               'missing_hashes': missing_hashes, 'missing_uri_annotations': missing_uris,
               'private_attachment_links': 0, 'missing_glyphs': sorted(missing),
               'page_character_counts': [len(t) for t in page_text]},
    'links': uris,
    'renderer': {'reportlab': REPORTLAB_VERSION, 'fonts': {name: {'file': filename, 'sha256': sha(fontdir / filename), 'collection_index': index} for name, (filename, index) in fontfiles.items()}},
}
(ROOT / 'BUILD_RECORD.json').write_text(json.dumps(checks, indent=2) + '\n', encoding='utf-8')
print(json.dumps(checks['pdf']))
print(json.dumps(checks['checks']))
