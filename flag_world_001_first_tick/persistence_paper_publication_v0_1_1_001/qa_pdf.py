"""Document PDF QA only: render pages and record text/layout bounds.

Run after build_paper.py. PNG inspection remains an explicit human/agent step.
"""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import pdfplumber
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parent
PDF = ROOT / 'output/pdf/Persistence_from_Geometry_v0.1.1_publication.pdf'
POPPLER = Path('C:/Users/devon/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe')

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest().upper()

def inspect(pdf=PDF):
    pdf = Path(pdf).resolve()
    if not pdf.is_relative_to(ROOT):
        raise ValueError('QA subject must be inside the new paper directory')
    out = ROOT / 'tmp/pdfs'
    out.mkdir(parents=True, exist_ok=True)
    prefix = out / 'page'
    result = subprocess.run([str(POPPLER), '-r', '120', '-png', str(pdf), str(prefix)], capture_output=True, text=True, timeout=300)
    if result.returncode:
        raise RuntimeError('PDF render did not close: ' + result.stderr)
    records, issues = [], []
    with pdfplumber.open(pdf) as doc:
        for index, page in enumerate(doc.pages, 1):
            chars = page.chars
            outside = [c for c in chars if c['x0'] < 45 or c['x1'] > page.width - 45 or c['top'] < 16 or c['bottom'] > page.height - 16]
            blackboxes = [c for c in chars if c.get('text') in ('\ufffd', '\u25a0')]
            if outside or blackboxes:
                issues.append({'page': index, 'outside_margin_count': len(outside), 'replacement_or_box_count': len(blackboxes), 'examples': [c.get('text') for c in outside[:12]]})
            records.append({'page': index, 'characters': len(chars), 'words': len(page.extract_words()), 'outside_margin_count': len(outside), 'replacement_or_box_count': len(blackboxes)})
        count = len(doc.pages)
    rendered = sorted(out.glob('page-*.png'), key=lambda p: int(p.stem.split('-')[-1]))
    rendered = [p for p in rendered if int(p.stem.split('-')[-1]) <= count]
    if len(rendered) != count:
        raise ValueError('Rendered-page coverage differs from PDF')
    thumbs = []
    for p in rendered:
        image = Image.open(p).convert('RGB')
        image.thumbnail((408, 528))
        cell = Image.new('RGB', (440, 566), '#e5ebed')
        cell.paste(image, ((440-image.width)//2, 18))
        ImageDraw.Draw(cell).text((16, 548), p.stem, fill='#192b32')
        thumbs.append(cell)
    contacts = []
    for start in range(0, count, 8):
        group = thumbs[start:start+8]
        sheet = Image.new('RGB', (880, 566*((len(group)+1)//2)), '#e5ebed')
        for i, image in enumerate(group):
            sheet.paste(image, ((i%2)*440, (i//2)*566))
        target = out / f'contact-{start//8+1:02d}.png'
        sheet.save(target)
        contacts.append({'path': str(target), 'sha256': sha(target)})
    record = {'schema': 'PERSISTENCE_PUBLICATION_PDF_QA_001', 'scope': 'Document rendering only; no MaL or GPU execution',
              'pdf': {'path': str(pdf), 'sha256': sha(pdf), 'bytes': pdf.stat().st_size, 'pages': count},
              'renderer': {'path': str(POPPLER), 'sha256': sha(POPPLER), 'dpi': 120, 'exit': result.returncode},
              'pages': records, 'bounds_findings': issues, 'contact_sheets': contacts,
              'rendered_pages': [{'path': str(p), 'sha256': sha(p)} for p in rendered],
              'visual_review': 'PENDING: inspect latest page images before delivery', 'status': 'PUBLICATION_PRESENTATION_OF_PROMOTED_PAPER'}
    (ROOT / 'PDF_QA_RECORD.json').write_text(json.dumps(record, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'pages': count, 'bounds_findings': issues, 'contact_sheets': contacts}))
    return record

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--pdf', type=Path, default=PDF)
    args = p.parse_args()
    inspect(args.pdf)
