"""Document typesetting only; never in a MaL execution or GPU path.

Reuse: python build_paper.py [--source manuscript.md] [--output paper.pdf]
The source manuscript is read only. Publication presentation derivative; promoted source remains frozen.
"""
from pathlib import Path
import argparse
import hashlib
import html
import json
import re

from reportlab import Version as REPORTLAB_VERSION
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, Image, KeepTogether
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent
DEFAULT_SOURCE = ROOT / 'PERSISTENCE_FROM_GEOMETRY_v0.1.1_publication.md'
DEFAULT_PDF = ROOT / 'output/pdf/Persistence_from_Geometry_v0.1.1_publication.pdf'
FONTDIR = Path('C:/Windows/Fonts')
FONTFILES = {
    'Body': ('georgia.ttf', 0), 'Body-Bold': ('georgiab.ttf', 0),
    'Body-Italic': ('georgiai.ttf', 0), 'Body-BoldItalic': ('georgiaz.ttf', 0),
    'Sans': ('segoeui.ttf', 0), 'Sans-Bold': ('segoeuib.ttf', 0),
    'Mono': ('consola.ttf', 0), 'Math': ('cambria.ttc', 1),
}
INK, ACCENT, MUTED = [colors.HexColor(s) for s in ('#192b32', '#15576a', '#52656e')]
RULE, PALE = colors.HexColor('#bacbd1'), colors.HexColor('#eef4f5')
FRAME_WIDTH = 492
SUB = dict(zip('₀₁₂₃₄₅₆₇₈₉ₙₘₖᵢⱼₜₛₓ', '0123456789nmkijtsx'))
SUB.update(dict(zip('₊₋₌₍₎', '+-=()')))
SUP = dict(zip('⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ', '0123456789n'))
MISSING = set()

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest().upper()

def fonts():
    for name, (filename, index) in FONTFILES.items():
        pdfmetrics.registerFont(TTFont(name, str(FONTDIR / filename), subfontIndex=index))
    for f in ('Body', 'Sans', 'Mono', 'Math'):
        pdfmetrics.registerFontFamily(f, normal=f, bold=f + '-Bold' if f in ('Body', 'Sans') else f,
                                     italic='Body-Italic' if f == 'Body' else f,
                                     boldItalic='Body-BoldItalic' if f == 'Body' else f + '-Bold' if f == 'Sans' else f)

def styles():
    return {
        'body': ParagraphStyle('Body', fontName='Body', fontSize=10.2, leading=15.1, textColor=INK, spaceAfter=8.3, allowWidows=0, allowOrphans=0),
        'abstract': ParagraphStyle('Abstract', fontName='Body', fontSize=10, leading=14.6, textColor=INK, spaceAfter=12, allowWidows=0, allowOrphans=0),
        'h1': ParagraphStyle('Section', fontName='Sans-Bold', fontSize=15, leading=19, textColor=ACCENT, spaceBefore=15, spaceAfter=8, keepWithNext=1),
        'h2': ParagraphStyle('Subsection', fontName='Sans-Bold', fontSize=11.8, leading=15.2, textColor=INK, spaceBefore=10, spaceAfter=6, keepWithNext=1),
        'h3': ParagraphStyle('Subsubsection', fontName='Sans-Bold', fontSize=10.5, leading=14, textColor=INK, spaceBefore=8, spaceAfter=5, keepWithNext=1),
        'title': ParagraphStyle('Title', fontName='Body-Bold', fontSize=28, leading=33, textColor=INK, spaceAfter=7, keepWithNext=1),
        'subtitle': ParagraphStyle('Subtitle', fontName='Body', fontSize=16, leading=22, textColor=ACCENT, spaceAfter=16, keepWithNext=1),
        'author': ParagraphStyle('Author', fontName='Sans', fontSize=10, leading=15, textColor=INK, spaceAfter=12, keepWithNext=1),
        'math': ParagraphStyle('Equation', fontName='Math', fontSize=11.7, leading=19.5, leftIndent=16, rightIndent=7, spaceBefore=3, spaceAfter=10),
        'code': ParagraphStyle('Literal', fontName='Mono', fontSize=8.3, leading=12, leftIndent=10, rightIndent=10, spaceBefore=3, spaceAfter=10),
        'table': ParagraphStyle('Table', fontName='Sans', fontSize=8.6, leading=11.7, textColor=INK),
        'thead': ParagraphStyle('TableHeader', fontName='Sans-Bold', fontSize=8.5, leading=11.5, textColor=INK),
        'ref': ParagraphStyle('Reference', fontName='Body', fontSize=9.2, leading=13.4, textColor=INK, spaceAfter=10, allowWidows=0, allowOrphans=0),
        'list': ParagraphStyle('List', fontName='Body', fontSize=10.2, leading=15.1, textColor=INK, leftIndent=15, firstLineIndent=-13, spaceAfter=5, allowWidows=0, allowOrphans=0),
        'caption': ParagraphStyle('FigureCaption', fontName='Sans', fontSize=8.7, leading=12, textColor=MUTED, spaceBefore=5, spaceAfter=12),
        'quote': ParagraphStyle('Quote', fontName='Body-Italic', fontSize=10, leading=14.7, textColor=MUTED, leftIndent=14, rightIndent=14, spaceAfter=10),
    }

def text_markup(value, font='Body'):
    value = value.replace('\u2014', ' - ').replace('\u2013', '-').replace('\u2011', '-').replace('\u2010', '-')
    glyphs = pdfmetrics.getFont(font).face.charToGlyph
    fallback = pdfmetrics.getFont('Math').face.charToGlyph
    out = []
    for char in value:
        if char in SUB:
            out.append('<sub>' + SUB[char] + '</sub>')
        elif char in SUP:
            out.append('<super>' + SUP[char] + '</super>')
        elif ord(char) not in glyphs and not char.isspace():
            if ord(char) not in fallback:
                MISSING.add(f'U+{ord(char):04X}')
            out.append('<font name="Math">' + html.escape(char) + '</font>')
        else:
            out.append(html.escape(char))
    return ''.join(out)

TOKEN = re.compile(r'(`[^`]+`|\[[^\]]+\]\([^\s)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)')
def inline(value, font='Body', ref=False):
    out = []
    for t in TOKEN.split(value):
        if t.startswith('`') and t.endswith('`'):
            out.append('<font name="Mono" size="' + ('7.8' if ref else '8.5') + '">' + text_markup(t[1:-1], 'Mono') + '</font>')
        elif t.startswith('[') and '](' in t:
            label, url = t[1:].split('](', 1)
            url = url[:-1]
            if not url.startswith('https://'):
                raise ValueError('Link must be a public HTTPS URL: ' + url)
            out.append('<link href="' + html.escape(url, quote=True) + '" color="#15576a">' + text_markup(label, font) + '</link>')
        elif t.startswith('**') and t.endswith('**'):
            out.append('<b>' + text_markup(t[2:-2], font) + '</b>')
        elif t.startswith('*') and t.endswith('*'):
            out.append('<i>' + text_markup(t[1:-1], font) + '</i>')
        else:
            out.append(text_markup(t, font))
    return ''.join(out)

LATEX = {
    'varnothing': '∅', 'emptyset': '∅', 'partial': '∂', 'subseteq': '⊆', 'subsetneq': '⊊',
    'supseteq': '⊇', 'cup': '∪', 'cap': '∩', 'setminus': '∖', 'longrightarrow': '→',
    'rightarrow': '→', 'to': '→', 'mapsto': '↦', 'circ': '∘', 'pi': 'π', 'Sigma': 'Σ',
    'Omega': 'Ω', 'ne': '≠', 'neq': '≠', 'le': '≤', 'leq': '≤', 'ge': '≥', 'geq': '≥',
    'in': '∈', 'notin': '∉', 'land': '∧', 'lor': '∨', 'forall': '∀', 'exists': '∃',
    'times': '×', 'cdot': '·', 'iff': '⇔', 'implies': '⇒', 'nabla': '∇', 'mid': '|',
}
def math_markup(expr):
    expr = expr.replace('\\begin{aligned}', '').replace('\\end{aligned}', '').replace('\\\\', '\n')
    expr = re.sub(r'\\(?:mathrm|text|operatorname|mathbf)\{([^{}]*)\}', r'\1', expr)
    expr = expr.replace('\\{', '{').replace('\\}', '}').replace('\\ ', ' ').replace('\\,', ' ').replace('\\;', ' ')
    expr = re.sub(r'\\([A-Za-z]+)', lambda m: LATEX.get(m.group(1), m.group(0)), expr).replace('&=', '=')
    if '\\' in expr:
        raise ValueError('Unsupported math command; use Unicode or supported subset: ' + expr)
    result = []
    for token in re.split(r'([_^](?:\{[^{}]+\}|[A-Za-z0-9]+))', expr):
        if token.startswith(('_', '^')) and len(token) > 1:
            v = token[1:]
            if v.startswith('{'):
                v = v[1:-1]
            if token.startswith('_') and re.fullmatch(r'[A-Z]{2,}', v):
                result.append(text_markup(token, 'Math'))
                continue
            tag = 'sub' if token[0] == '_' else 'super'
            result.append('<' + tag + '>' + text_markup(v, 'Math') + '</' + tag + '>')
        else:
            result.append(text_markup(token, 'Math').replace('\n', '<br/>'))
    return ''.join(result)

def blocks(source):
    lines, i = source.splitlines(), 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith('```'):
            kind, body = line[3:].strip(), []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                body.append(lines[i]); i += 1
            if i == len(lines):
                raise ValueError('Unclosed fenced block')
            i += 1
            yield ('math' if kind == 'math' else 'code', '\n'.join(body))
            continue
        image_match = re.fullmatch(r'!\[(.*?)\]\((figures/[^)]+)\)', line)
        if image_match:
            alt, relpath = image_match.groups()
            i += 1
            while i < len(lines) and not lines[i].strip(): i += 1
            caption = []
            while i < len(lines) and lines[i].strip():
                caption.append(lines[i]); i += 1
            if not caption or not caption[0].startswith('Figure '):
                raise ValueError('Figure requires adjacent named caption')
            yield ('figure', (relpath, alt, ' '.join(caption)))
            continue
        heading = re.match(r'^(#{1,4})\s+(.+)$', line)
        if heading:
            yield ('heading', (len(heading[1]), heading[2])); i += 1; continue
        if line.strip() in ('---', '***'):
            yield ('rule', ''); i += 1; continue
        if line.startswith('|'):
            table = []
            while i < len(lines) and lines[i].startswith('|'):
                table.append(lines[i]); i += 1
            yield ('table', table); continue
        li = re.match(r'^\s*(?:([-*])|(\d+)\.)\s+(.+)$', line)
        if li:
            yield ('list', ('•' if li[1] else li[2] + '.', li[3])); i += 1; continue
        para = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'^(?:#{1,4} |```|\||[-*] |\d+\. )', lines[i]):
            para.append(lines[i]); i += 1
        if para[0].startswith('> '):
            yield ('quote', ' '.join(x.removeprefix('> ') for x in para))
        else:
            yield ('paragraph', ' '.join(para))

def make_table(lines, st):
    rows = [re.split(r'(?<!\\)\|', s.strip().strip('|')) for s in lines]
    rows = [r for r in rows if not all(re.fullmatch(r'\s*:?-+:?\s*', c) for c in r)]
    n = len(rows[0])
    if not 2 <= n <= 6 or any(len(r) != n for r in rows):
        raise ValueError('Tables require consistent 2-6 columns; escape literal pipes')
    weights = [max(8, min(48, max(len(re.sub(r'[`*]', '', r[j].strip())) for r in rows) ** 0.65 * 4)) for j in range(n)]
    widths = [FRAME_WIDTH * x / sum(weights) for x in weights]
    data = [[Paragraph(inline(c.strip().replace('\\|', '|'), 'Sans'), st['thead'] if i == 0 else st['table']) for c in r] for i, r in enumerate(rows)]
    t = Table(data, colWidths=widths, hAlign='LEFT', repeatRows=1, splitByRow=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PALE), ('LINEABOVE', (0, 0), (-1, 0), 0.7, ACCENT),
        ('LINEBELOW', (0, 0), (-1, 0), 0.5, RULE), ('LINEBELOW', (0, -1), (-1, -1), 0.7, ACCENT),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7), ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafb')]),
    ]))
    return t

def build(source_path=DEFAULT_SOURCE, output=DEFAULT_PDF):
    source_path, output = Path(source_path).resolve(), Path(output).resolve()
    if not source_path.is_relative_to(ROOT) or not output.is_relative_to(ROOT):
        raise ValueError('Draft inputs and outputs must stay inside the new paper directory')
    before = sha(source_path)
    source = source_path.read_text(encoding='utf-8-sig')
    parsed = list(blocks(source))
    if not parsed or parsed[0][0] != 'heading' or parsed[0][1][0] != 1:
        raise ValueError('First block must be # Paper title')
    title = parsed.pop(0)[1][1]
    fonts(); st = styles(); MISSING.clear()
    story = [Paragraph(inline(title), st['title'])]
    if parsed and parsed[0][0] == 'paragraph' and parsed[0][1].startswith('*') and parsed[0][1].endswith('*') and not parsed[0][1].startswith('**'):
        story.append(Paragraph(inline(parsed.pop(0)[1][1:-1]), st['subtitle']))
    metadata_match = re.search(r'(?m)^Devon A\. Generally[^\n]*(?:\n[^\n]+)*', source)
    if not metadata_match:
        raise ValueError('Source author and edition block missing')
    source_metadata = [line.rstrip() for line in metadata_match.group(0).splitlines()]
    if len(source_metadata) != 3 or not source_metadata[1].startswith('ORCID: ') or 'Publication edition' not in source_metadata[2]:
        raise ValueError('Source author/ORCID/publication metadata shape NOT_SAME')
    if not parsed or parsed[0][0] != 'paragraph' or not parsed[0][1].startswith(source_metadata[0]):
        raise ValueError('Parsed source metadata does not correspond to original lines')
    parsed.pop(0)
    metadata_markup = [inline(line, 'Sans') for line in source_metadata]
    orcid = source_metadata[1].removeprefix('ORCID: ').strip()
    metadata_markup[1] = f'<link href="https://orcid.org/{orcid}" color="#15576a">{metadata_markup[1]}</link>'
    edition = source_metadata[2]
    story.extend([
        Paragraph('<br/>'.join(metadata_markup), st['author']),
        HRFlowable(width='100%', thickness=0.7, color=RULE, spaceAfter=7),
    ])
    counts = {'math_blocks': 0, 'tables': 0, 'code_blocks': 0, 'headings': 0, 'figures': 0}
    reference_mode, abstract_next = False, False
    for kind, value in parsed:
        if kind == 'heading':
            level, heading = value
            reference_mode = heading.lower().startswith(('references', 'evidence ledger'))
            abstract_next = heading.lower() == 'abstract'
            if reference_mode:
                story.append(PageBreak())
            story.append(Paragraph(inline(heading, 'Sans'), st['h1' if level <= 2 else 'h2' if level == 3 else 'h3']))
            counts['headings'] += 1
        elif kind == 'figure':
            relpath, alt, caption = value
            asset = (ROOT / relpath).resolve()
            if not asset.is_relative_to(ROOT / 'figures'):
                raise ValueError('Figure asset outside bound directory')
            img = Image(str(asset))
            scale = min(FRAME_WIDTH / img.imageWidth, 400 / img.imageHeight)
            img.drawWidth = img.imageWidth * scale
            img.drawHeight = img.imageHeight * scale
            img.hAlign = 'CENTER'
            story.append(KeepTogether([Spacer(1, 8), img, Paragraph(inline(caption, 'Sans'), st['caption'])]))
            counts['figures'] += 1
        elif kind == 'math':
            story.append(Paragraph(math_markup(value), st['math'])); counts['math_blocks'] += 1
        elif kind == 'code':
            story.append(Paragraph(text_markup(value, 'Mono').replace('\n', '<br/>'), st['code'])); counts['code_blocks'] += 1
        elif kind == 'table':
            story.extend([Spacer(1, 3), make_table(value, st), Spacer(1, 12)]); counts['tables'] += 1
        elif kind == 'list':
            marker, contents = value
            story.append(Paragraph(text_markup(marker) + ' ' + inline(contents), st['list']))
        elif kind == 'rule':
            story.append(HRFlowable(width='100%', thickness=0.4, color=RULE, spaceBefore=6, spaceAfter=10))
        elif kind == 'quote':
            story.append(Paragraph(inline(value), st['quote']))
        else:
            key = 'ref' if reference_mode else 'abstract' if abstract_next else 'body'
            story.append(Paragraph(inline(value, ref=reference_mode), st[key])); abstract_next = False
    if MISSING:
        raise ValueError('Unmapped glyphs: ' + ', '.join(sorted(MISSING)))
    def furniture(canvas, doc):
        canvas.saveState()
        if doc.page > 1:
            canvas.setFont('Sans', 8); canvas.setFillColor(MUTED)
            canvas.drawString(54, 760, 'PERSISTENCE FROM GEOMETRY')
            canvas.drawRightString(558, 760, 'Devon A. Generally')
            canvas.setStrokeColor(RULE); canvas.setLineWidth(0.4); canvas.line(54, 751, 558, 751)
        canvas.setFont('Sans', 7.6); canvas.setFillColor(MUTED)
        canvas.drawString(54, 28, edition)
        canvas.drawRightString(558, 28, str(doc.page)); canvas.restoreState()
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(output), pagesize=letter, leftMargin=54, rightMargin=54, topMargin=53, bottomMargin=48,
                            title=title, author='Devon A. Generally', subject='Publication edition: persistence from geometry',
                            creator=source_metadata[0] + ' / document typesetting only', pageCompression=1, invariant=1)
    doc.build(story, onFirstPage=furniture, onLaterPages=furniture)
    reader = PdfReader(output)
    pages = [p.extract_text() or '' for p in reader.pages]
    extracted = '\n'.join(pages)
    compact = re.sub(r'\s+', '', extracted)
    first_page_compact = re.sub(r'\s+', '', pages[0])
    missing_metadata = [line for line in source_metadata if re.sub(r'\s+', '', line) not in first_page_compact]
    hashes = sorted(set(re.findall(r'(?<![0-9a-fA-F])[0-9a-fA-F]{64}(?![0-9a-fA-F])', source)))
    missing_hashes = [h for h in hashes if h not in compact]
    uris = sorted(set(str(a.get_object().get('/A', {}).get('/URI')) for p in reader.pages for a in p.get('/Annots', []) if a.get_object().get('/A', {}).get('/URI')))
    expected_uris = set(re.findall(r'\]\((https://[^)]+)\)', source)) | {'https://orcid.org/0009-0004-8164-2159'}
    missing_uris = sorted(expected_uris - set(uris))
    if missing_metadata or missing_hashes or missing_uris or '\ufffd' in extracted or before != sha(source_path):
        raise ValueError(f'PDF/source custody: hashes={missing_hashes}; links={missing_uris}; source_same={before == sha(source_path)}')
    record = {'schema': 'PERSISTENCE_PUBLICATION_BUILD_001', 'scope': 'Document typesetting only; no experimental execution, promotion or world transition',
              'status': 'PUBLICATION_PRESENTATION_OF_PROMOTED_PAPER', 'source': {'path': str(source_path), 'sha256': before, 'bytes': source_path.stat().st_size},
              'builder': {'path': str(Path(__file__).resolve()), 'sha256': sha(__file__)},
              'source_metadata_rendered_once_by_builder': source_metadata,
              'pdf': {'path': str(output), 'sha256': sha(output), 'bytes': output.stat().st_size, 'pages': len(reader.pages)},
              'checks': {**counts, 'missing_glyphs': sorted(MISSING), 'missing_hashes': missing_hashes, 'missing_uri_annotations': missing_uris,
                         'hashes_preserved': len(hashes), 'source_metadata_comparison': 'SAME', 'missing_metadata': missing_metadata, 'page_character_counts': [len(x) for x in pages], 'visual_review': 'PENDING'},
              'links': uris, 'renderer': {'reportlab': REPORTLAB_VERSION, 'fonts': {n: {'file': f, 'sha256': sha(FONTDIR / f), 'collection_index': i} for n, (f, i) in FONTFILES.items()}}}
    (ROOT / 'BUILD_RECORD.json').write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(record['pdf'])); print(json.dumps(record['checks']))
    return record

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=DEFAULT_SOURCE)
    parser.add_argument('--output', type=Path, default=DEFAULT_PDF)
    args = parser.parse_args()
    build(args.source, args.output)
