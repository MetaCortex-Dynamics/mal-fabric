"""Publication packaging only. No MaL evaluation, GPU or repository mutation."""
from pathlib import Path
import hashlib, json, re, shutil, zipfile

ROOT = Path('D:/Dev/Codex/2026-10-04/new-chat/mal_fabric_flag_world_001/flag_world_001_first_tick')
DRAFT = ROOT/'persistence_paper_two_draft_001/v0_1_1'
PROMO = ROOT/'persistence_paper_two_draft_001/promotion_v0_1_1_001'
PUB = ROOT/'persistence_paper_publication_v0_1_1_001'
DEP = ROOT/'persistence_paper_doi_deposit_v0_1_1_001'
LAUNCH = ROOT/'persistence_substack_launch_001'
STAGE = Path('C:/Users/devon/Documents/Codex/2026-10-04/new-chat/paper_two_launch_staging_20261101')

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest().upper()
def ident(p): return {'bytes':p.stat().st_size,'sha256':sha(p)}
def writejson(p,obj): p.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
def archive(dest,root,paths):
    with zipfile.ZipFile(dest,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for p in sorted(paths):
            rel=p.relative_to(root).as_posix()
            zi=zipfile.ZipInfo(rel,date_time=(2026,11,1,0,0,0));zi.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(zi,p.read_bytes())
    with zipfile.ZipFile(dest) as z:
        for p in paths:
            if z.read(p.relative_to(root).as_posix())!=p.read_bytes(): raise ValueError('Archive NOT_SAME '+str(p))

if DEP.exists() or LAUNCH.exists(): raise ValueError('Output directory already present; inspect instead of overwriting.')
source=DRAFT/'PERSISTENCE_FROM_GEOMETRY_v0.1.1.md'
if sha(source)!='690425E860C7CEACA5726A59C8CF5B8BF8090FED51634DFD60F6EFAB358573E1': raise ValueError('Promoted source NOT_SAME')
pubmd=PUB/'PERSISTENCE_FROM_GEOMETRY_v0.1.1_publication.md'
pubpdf=PUB/'output/pdf/Persistence_from_Geometry_v0.1.1_publication.pdf'
for p in (pubmd,pubpdf,PUB/'PUBLICATION_CHANGES.json',PUB/'figures/FIGURE_MANIFEST.json'):
    if not p.is_file(): raise ValueError('Publication artifact pending: '+str(p))
DEP.mkdir();upload=DEP/'upload';upload.mkdir();comp=DEP/'companion';comp.mkdir()
for name in ['EVIDENCE_LEDGER.json','FINDING_016_REVIEW.json','FINDING_016_REVIEW.md','VERSION_CUSTODY.json']:
    shutil.copyfile(DRAFT/name,comp/name)
shutil.copytree(DRAFT/'evidence',comp/'evidence')
proman=json.loads((PROMO/'PROMOTION_MANIFEST_001.json').read_text(encoding='utf-8'))
for entry in proman['files']:
    p=PROMO/entry['path']
    if sha(p)!=entry['sha256']: raise ValueError('Promotion member NOT_SAME')
    target=comp/'promotion'/entry['path'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target)
shutil.copyfile(PROMO/'PROMOTION_MANIFEST_001.json',comp/'promotion/PROMOTION_MANIFEST_001.json')
shutil.copyfile(PUB/'PUBLICATION_CHANGES.json',comp/'PUBLICATION_CHANGES.json')
(comp/'README.md').write_text('''# Paper Two companion evidence — version 0.1.1

This archive contains 22 byte-identical compact evidence records, their ledger, finding annotations, promotion binding and predecessor-ledger locator. Large raw readbacks and complete execution packages referenced by the compact records are not bundled.

Read promotion/PREDECESSOR_LEDGER_LOCATOR_001.json with FINDING_016_REVIEW.json. That review's historical /ledger identity resolves to promotion/predecessor/Persistence_from_Geometry_v0.1_review.zip, exact member EVIDENCE_LEDGER.json (ADD864CF…194F916). The current root EVIDENCE_LEDGER.json is the distinct 22-record ledger (98A4A269…91EC5BD). Both are preserved and named separately.

Finding 0.1.6 remains independently PROPOSED. Its historical raw-offer/effect and unselected-status wording is read with FINDING_016_REVIEW.md. Paper Two promotion does not change any experimental record. The promoted review files remain inside promotion/review/Persistence_from_Geometry_v0.1.1_review.zip; the illustrated publication derivative is bound by PUBLICATION_CHANGES.json.

Evidence scopes: exhaustive GPU receipts for the listed (1,0)/(2,0) families; complete read-only classification and 89 targeted GPU receipts at (4,0); full-family GPU receipt for the stated single (8,0) configuration. 038 remains paused and partially qualified. No new execution or world transition accompanies publication.
''',encoding='utf-8')
compfiles=sorted(p for p in comp.rglob('*') if p.is_file())
writejson(comp/'MANIFEST.json',{'schema':'PAPER_TWO_COMPANION_MANIFEST_001','files':[{'path':p.relative_to(comp).as_posix(),**ident(p)} for p in compfiles],'evidence_records':22,'scope':'Compact records only; exact copied bytes; no new execution'})
archive(upload/'Persistence_from_Geometry_v0.1.1_companion_evidence.zip',comp,compfiles+[comp/'MANIFEST.json'])
figurefiles=sorted(p for p in (PUB/'figures').iterdir() if p.is_file())
archive(upload/'Persistence_from_Geometry_v0.1.1_figures.zip',PUB/'figures',figurefiles)
shutil.copyfile(pubmd,upload/pubmd.name);shutil.copyfile(pubpdf,upload/pubpdf.name)
license_source=ROOT/'genesis_paper_doi_deposit_v0_5_001/upload/LICENSE.txt'
if sha(license_source)!='C71D239DF91726FC519C6EB72D318EC65820627232B2F796219E87DCF35D0AB4': raise ValueError('License NOT_SAME')
shutil.copyfile(license_source,upload/'LICENSE.txt')
(upload/'CITATION.bib').write_text('''@misc{generally2026persistence,
  author = {Generally, Devon A.},
  title = {Persistence from Geometry: Context, Refinement and Deterministic Change},
  year = {2026},
  month = {nov},
  version = {0.1.1},
  publisher = {MetaCortex Dynamics LLC},
  note = {Preprint; DOI to be added from the actual Zenodo record after assignment}
}
''',encoding='utf-8')
(upload/'README.md').write_text('''# Persistence from Geometry — v0.1.1

Devon A. Generally · MetaCortex Dynamics LLC
ORCID: https://orcid.org/0009-0004-8164-2159
Apache License 2.0

The illustrated publication PDF and Markdown accompany the companion-evidence archive and figure assets. Figure files include SVG, high-resolution PNG, web PNG, captions, alt text, source-hashed data and the plotting script. Figures plot the recorded counts; no new experiment was run to create them.

The promoted manuscript remains frozen. PUBLICATION_CHANGES.json inside the companion archive binds the illustrated publication derivative and its exact changes. The promotion receipt binds the original reviewed subjects. Finding 0.1.6 remains independently PROPOSED, with its two historical statements annotated separately. The predecessor-ledger locator resolves the earlier review's historical ledger without overwriting its evidence.

The companion archive contains 22 compact records, not the complete raw execution archive. The paper distinguishes exhaustive listed-family GPU receipts, complete read-only classification, targeted finer-level receipts and a single transported configuration. 038 remains paused; no public release upgrades its qualification scope.

This locally prepared package does not assign a DOI. Use the identifier returned by Zenodo when this record is published. Paper One is a different object: https://doi.org/10.5281/zenodo.23673872.
''',encoding='utf-8')
source_text=pubmd.read_text(encoding='utf-8')
abstract=re.search(r'## Abstract\n\n(.*?)\n\n## 1\.',source_text,re.S).group(1)
metadata={'metadata':{'title':'Persistence from Geometry: Context, Refinement and Deterministic Change','upload_type':'publication','publication_type':'preprint','publication_date':'2026-11-01','version':'0.1.1','creators':[{'name':'Generally, Devon A.','affiliation':'MetaCortex Dynamics LLC','orcid':'0009-0004-8164-2159'}],'description':'<p>'+abstract+'</p>','access_right':'open','license':'Apache-2.0','language':'eng','keywords':['geometric computation','persistent structure','contextual retention','refinement','GPU computation','strict discharge','deterministic change','reproducible research'],'notes':'Illustrated publication edition of promoted Paper Two v0.1.1. Includes three source-bound figures and companion compact records. Evidence scopes remain as stated in the manuscript. Referenced large raw readbacks and complete execution packages are not bundled. No new experiment or world transition accompanies this deposit.','related_identifiers':[{'identifier':'10.5281/zenodo.23673872','relation':'references','scheme':'doi'}]}}
writejson(DEP/'ZENODO_DEPOSIT_METADATA.json',metadata)
files=[p for p in sorted(upload.iterdir()) if p.is_file()]
writejson(upload/'MANIFEST.json',{'schema':'PAPER_TWO_DEPOSIT_MANIFEST_001','version':'0.1.1','status':'PREPARED_NOT_UPLOADED','files':[{'path':p.name,**ident(p)} for p in files],'manifest_self_hash':'External package receipt binds this manifest; manifest does not hash itself.','paper_promotion_receipt_sha256':'3C2D1A013837328CE909BB0409F477A9ADAC122F1B65D774387287ED12FEC62B','publication_changes':ident(PUB/'PUBLICATION_CHANGES.json')})
archive(DEP/'Persistence_from_Geometry_v0.1.1_deposit.zip',upload,sorted(p for p in upload.iterdir() if p.is_file()))
shutil.copytree(STAGE,LAUNCH)
(LAUNCH/'images').mkdir()
for name in ['figure_1_pair_classification_web.png','figure_2_context_receipts_web.png','figure_3_refinement_contrasts_web.png','paper_two_cover_1200x630.png']:
    shutil.copyfile(PUB/'figures'/name,LAUNCH/'images'/name)
launchmeta=json.loads((LAUNCH/'LAUNCH_METADATA.json').read_text(encoding='utf-8'))
launchmeta['social_preview_image']='images/paper_two_cover_1200x630.png'
launchmeta['delivery']='Public web publication authorized; newsletter email dispatch is not separately requested.'
launchmeta['upload_sequence']='Zenodo, then repository main binding, then Substack. Do not publish placeholder URLs.'
writejson(LAUNCH/'LAUNCH_METADATA.json',launchmeta)
draft=(LAUNCH/'WHAT_MAKES_A_STRUCTURE_HOLD_DRAFT.md').read_text(encoding='utf-8')
for token,name in [('{{FIGURE_CONTEXT_URL}}','figure_2_context_receipts_web.png'),('{{FIGURE_REFINEMENT_URL}}','figure_3_refinement_contrasts_web.png'),('{{FIGURE_PAIR_URL}}','figure_1_pair_classification_web.png')]:
    draft=draft.replace(token,'images/'+name)
(LAUNCH/'WHAT_MAKES_A_STRUCTURE_HOLD_LOCAL_PREVIEW.md').write_text(draft,encoding='utf-8')
block={'schema':'PAPER_TWO_PUBLICATION_PREFLIGHT_001','status':'PREPARED_EXTERNAL_PUBLICATION_BLOCKED','browser_error':'failed to write kernel assets: The system cannot find the path specified. (os error 3)','attempts':['cua_repl initial entry','node_repl supported sky initialization','node_repl reset and one supported initialization retry'],'external_actions':'NONE','work_038':'PAUSED','publication_order':['Zenodo','repository binding on main','Substack'],'deposit':ident(DEP/'Persistence_from_Geometry_v0.1.1_deposit.zip'),'upload_files':[{'path':p.name,**ident(p)} for p in sorted(upload.iterdir()) if p.is_file()],'required_before_upload':['Use actual Zenodo draft/DOI identifiers only.','Bind CITATION.bib to assigned DOI and refresh MANIFEST/deposit ZIP.'],'required_before_substack':['Verify Zenodo publication and main binding.','Replace DOI/repository/image URLs from actual observed records.','Set cover, inline images, captions, alt text, SEO title/description, slug, tags and social preview.','Verify live post and its links.']}
writejson(DEP/'PUBLICATION_PREFLIGHT.json',block)
print(json.dumps({'deposit':str(DEP),'files':len(block['upload_files']),'deposit_zip':block['deposit'],'launch':str(LAUNCH),'status':block['status']}))
