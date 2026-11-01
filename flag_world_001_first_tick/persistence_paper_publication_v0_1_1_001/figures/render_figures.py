"""Publication plotting only. Reads sealed compact evidence; no MaL/GPU execution."""
from pathlib import Path
import hashlib, json, textwrap, platform, argparse
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyBboxPatch
import numpy as np

ROOT = Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--evidence-dir',type=Path,default=Path(r'D:/Dev/Codex/2026-10-04/new-chat/mal_fabric_flag_world_001/flag_world_001_first_tick/persistence_paper_two_draft_001/v0_1_1/evidence'))
EVIDENCE = parser.parse_args().evidence_dir
INK='#19333D'; TEAL='#197A7A'; PALE='#DDECE9'; ORANGE='#BD5B32'; GRAY='#9BAEB5'; MUTED='#536C76'; GRID='#D9E2E4'; PAPER='#FFFFFF'
EXPECTED = {
 'RUN_RECORD_036.json':'FE41196D8008620488CF9A6CC4A89379F4D273A431D9EB4EA83091F4EC6B3F34',
 'RUN_RECORD_RULE_D_026.json':'02234D0482842067C8140A4DCF91ED9CC7FC3AC72F522E65D7B869699ACCCAFB',
 'FINDING_SAND_RELATION_DERIVED_RULE_001_v0.1.6.md':'5DF47E3343EF3E0569DBF7C3B726871B9B08BB4CE376927EACB4E0C5C573C81C'}
sources=[]
for name,expected in EXPECTED.items():
 b=(EVIDENCE/name).read_bytes(); h=hashlib.sha256(b).hexdigest().upper()
 if h!=expected: raise RuntimeError(f'NOT_SAME: {name}')
 sources.append({'file':name,'absolute_source':str(EVIDENCE/name),'bytes':len(b),'sha256':h})
r36=json.loads((EVIDENCE/'RUN_RECORD_036.json').read_text(encoding='utf-8'))
r8=json.loads((EVIDENCE/'RUN_RECORD_RULE_D_026.json').read_text(encoding='utf-8'))
finding=(EVIDENCE/'FINDING_SAND_RELATION_DERIVED_RULE_001_v0.1.6.md').read_text(encoding='utf-8')
nested=r36['families']['RULE_D']['receipt_counts'][0]['counts']
contrast=r36['families']['RULE_D_CONTRAST']['receipt_counts'][0]['counts']
assert [nested[k] for k in ('changed','discharged','opened','retained')]==[42,30,10,34]
assert [contrast[k] for k in ('changed','discharged','opened','retained')]==[24,20,0,0]
assert r36['families']['INTERIOR_PAIR']['strict']==60
assert '420 pairs bound' in finding and 'classes 12 / 468, 12 walls' in finding and 'classes 48 / 1,872, 12 walls' in finding
assert r8['walls_before']==64 and r8['strict_members']==[] and r8['W00_THIS']=={'discharged':30,'opened':20,'retained':34}
assert r8['prediction']['classes']==[96,384,7200]

plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'text.color':INK,
 'axes.labelcolor':INK,'xtick.color':MUTED,'ytick.color':MUTED,'axes.edgecolor':GRID,
 'axes.titleweight':'bold','axes.titlesize':13,'axes.labelsize':10,'svg.fonttype':'none',
 'pdf.fonttype':42,'svg.hashsalt':'paper-two-figures-v011','figure.facecolor':PAPER,'axes.facecolor':PAPER,'savefig.facecolor':PAPER})
artifacts=[]
def save(fig,name):
 for ext,dpi in [('svg',None),('png',300)]:
  path=ROOT/f'{name}.{ext}'
  fig.savefig(path,dpi=dpi,metadata={'Creator':'Paper Two evidence figures; matplotlib','Date':None} if ext=='svg' else {'Software':'Paper Two evidence figures; matplotlib'})
  artifacts.append(path.name)
 path=ROOT/f'{name}_web.png';fig.savefig(path,dpi=180);artifacts.append(path.name)
 plt.close(fig)
def clean(ax):
 ax.spines[['top','right','left']].set_visible(False)
 ax.tick_params(axis='y',length=0);ax.set_axisbelow(True)

# FIGURE 1: exact whole-family classification plus a separate receipt scope.
fig=plt.figure(figsize=(7.2,3.4))
fig.text(.08,.91,'Placement separates 480 adjacent pairs',fontsize=15,fontweight='bold')
fig.text(.08,.835,'(4,0) carrier · complete classification over bound incidence',fontsize=10,color=MUTED)
ax=fig.add_axes([.08,.36,.84,.34])
ax.barh([0],[60],color=ORANGE,height=.50)
ax.barh([0],[420],left=[60],color=TEAL,height=.50)
ax.text(30,0,'60',ha='center',va='center',color='white',fontsize=13,fontweight='bold')
ax.text(270,0,'420',ha='center',va='center',color='white',fontsize=13,fontweight='bold')
ax.set_xlim(0,480);ax.set_ylim(-.65,.65);ax.set_yticks([])
ax.set_xticks([0,120,240,360,480]);ax.set_xlabel('Adjacent-pair fields',labelpad=8)
clean(ax);ax.grid(axis='x',color=GRID,lw=.6)
fig.text(.08,.19,'60 with a strict face exit',color=ORANGE,fontweight='bold',fontsize=10)
fig.text(.08,.115,'All 60 exits have GPU receipts.',fontsize=9.4,color=MUTED)
fig.text(.52,.19,'420 with no strict exit',color=TEAL,fontweight='bold',fontsize=10)
fig.text(.52,.115,'Read-only classification; not a GPU census.',fontsize=9.1,color=MUTED)
save(fig,'figure_1_pair_classification')

# FIGURE 2: independent receipt categories, not an additive score.
fig=plt.figure(figsize=(7.2,4.0))
fig.text(.08,.93,'The same hole has different outcomes',fontsize=15,fontweight='bold')
fig.text(.08,.862,'24 hole flags and the same containing face in both fields',fontsize=10,color=MUTED)
ax=fig.add_axes([.12,.24,.81,.48]);xs=np.arange(3);width=.31
colors=[TEAL,ORANGE,GRAY]
for i,key in enumerate(['discharged','opened','retained']):
 for offset,counts,alpha,hatch in [(-width/2,nested,1,None),(width/2,contrast,.42,'///')]:
  value=counts[key]
  ax.bar(i+offset,value,width,color=colors[i],alpha=alpha,hatch=hatch,edgecolor=colors[i],lw=.7)
  ax.text(i+offset,value+.8,str(value),ha='center',va='bottom',fontsize=11,fontweight='bold')
ax.set_xticks(xs,['Discharged','Opened','Retained']);ax.set_ylim(0,40)
ax.set_yticks([0,10,20,30,40]);ax.set_ylabel('Walls');ax.grid(axis='y',color=GRID,lw=.6);clean(ax)
fig.add_artist(Rectangle((.12,.79),.025,.025,transform=fig.transFigure,color=INK))
fig.text(.155,.788,'Nested field · 42 flags changed',fontsize=9.5,color=MUTED)
fig.add_artist(Rectangle((.55,.79),.025,.025,transform=fig.transFigure,facecolor='white',edgecolor=INK,hatch='///'))
fig.text(.585,.788,'Contrast · 24 changed',fontsize=9.5,color=MUTED)
fig.text(.12,.09,'Nested: opens 10 → not strict',fontsize=10,color=ORANGE,fontweight='bold')
fig.text(.55,.09,'Contrast: 20 / 0 → strict',fontsize=10,color=TEAL,fontweight='bold')
save(fig,'figure_2_context_receipts')

# FIGURE 3: two scoped correspondences, not a general invariance claim.
fig=plt.figure(figsize=(7.2,6.0))
fig.text(.08,.95,'Readings carry; strict exits need not',fontsize=15,fontweight='bold')
fig.text(.08,.89,'A   Single-site pullback: the exit disappears',fontsize=12,fontweight='bold')
ax=fig.add_axes([.12,.60,.39,.22])
ax.bar([0,1],[12,48],color=[ORANGE,TEAL],width=.45)
for i,v in enumerate([12,48]):ax.text(i,v+1.3,str(v),ha='center',fontweight='bold',fontsize=11)
ax.set_ylim(0,57);ax.set_xticks([0,1],['(2,0)','(4,0)']);ax.set_yticks([0,24,48]);ax.set_ylabel('THIS-class flags')
clean(ax);ax.grid(axis='y',color=GRID,lw=.6)
fig.text(.59,.775,'1 strict exit  →  none',fontsize=12,fontweight='bold',color=TEAL)
fig.text(.59,.715,'12 walls at both levels',fontsize=10)
fig.text(.59,.655,'Read-only correspondence\nNo world refinement executed',fontsize=9.5,color=MUTED,linespacing=1.6)
fig.add_artist(plt.Line2D([.08,.94],[.52,.52],transform=fig.transFigure,color=GRID,lw=1))
fig.text(.08,.47,'B   Nested-field pullback: retention persists',fontsize=12,fontweight='bold')
ax=fig.add_axes([.12,.18,.39,.22]);w=.30;xx=np.array([0,1])
for off,vals,col,label in [(-w/2,[30,30],TEAL,'Discharged'),(w/2,[10,20],ORANGE,'Opened')]:
 ax.bar(xx+off,vals,w,color=col,label=label)
 for i,v in enumerate(vals):ax.text(i+off,v+.8,str(v),ha='center',fontsize=10,fontweight='bold')
ax.set_xticks([0,1],['(4,0)','(8,0)']);ax.set_yticks([0,10,20,30]);ax.set_ylim(0,37);ax.set_ylabel('Containing-face receipt · walls')
clean(ax);ax.grid(axis='y',color=GRID,lw=.6)
fig.text(.59,.365,'K empty · 64 walls',fontsize=12,fontweight='bold',color=TEAL)
fig.text(.59,.312,'At both levels',fontsize=9.5,color=MUTED)
fig.text(.59,.25,'(8,0) GPU receipt matches\nthe prior prediction.',fontsize=10,linespacing=1.6)
fig.text(.12,.10,'Discharged',color=TEAL,fontsize=9.5,fontweight='bold')
fig.text(.31,.10,'Opened',color=ORANGE,fontsize=9.5,fontweight='bold')
fig.text(.59,.16,'Hole / surround / exterior flags',fontsize=9,color=MUTED)
fig.text(.59,.115,'24 / 96 / 1,800 →',fontsize=9.5)
fig.text(.59,.075,'96 / 384 / 7,200',fontsize=9.5)
save(fig,'figure_3_refinement_contrasts')

# Web cover: a numerical comparison, not an invented physical picture.
fig=plt.figure(figsize=(6,3.15),dpi=200)
fig.patch.set_facecolor('#F3F7F7')
fig.text(.055,.86,'Persistence from Geometry',fontsize=21,fontweight='bold',color=INK)
fig.text(.055,.74,'Same region. Different surroundings. Different outcome.',fontsize=10.5,color=MUTED)
for x,title,values,accent,footer in [(.055,'OUTSIDE THE HOLE: THIS','20  /  0',TEAL,'Strict exit'),(.515,'NESTED FIELD','30  /  10',ORANGE,'No strict exit for this offer')]:
 fig.add_artist(FancyBboxPatch((x,.17),.43,.45,boxstyle='round,pad=0.012,rounding_size=0.014',transform=fig.transFigure,facecolor='white',edgecolor=GRID,linewidth=1))
 fig.text(x+.025,.54,title,fontsize=8.5,fontweight='bold',color=MUTED)
 fig.text(x+.025,.38,values,fontsize=29,fontweight='bold',color=accent)
 fig.text(x+.025,.30,'discharged / opened walls',fontsize=8.5,color=MUTED)
 fig.text(x+.025,.215,footer,fontsize=9.7,fontweight='bold',color=accent)
fig.text(.055,.065,'Paper Two · MetaCortex Dynamics LLC',fontsize=8.5,color=MUTED)
fig.text(.945,.065,'GPU receipts · same 24-flag hole',fontsize=8.5,color=MUTED,ha='right')
fig.savefig(ROOT/'paper_two_cover_1200x630.png',dpi=200);artifacts.append('paper_two_cover_1200x630.png');plt.close(fig)

captions={
 'figure_1_pair_classification':{
  'caption':'Figure 1. Adjacent-pair placement at (4,0). Read-only evaluation over the bound incidence classifies all 480 isolated adjacent-pair fields under the recorded native and ancestral offered family: 60 have a strict face exit and 420 have none. Targeted GPU receipts witness all 60 predicted exits, each at 20 walls discharged and none opened. The 420 held cases are a complete read-only classification, not an exhaustive GPU receipt census.',
  'alt':'A horizontal count bar divides 480 adjacent-pair fields into 60 with a strict face exit and 420 with no strict exit. The full classification is read-only; GPU receipts cover all 60 exits.'},
 'figure_2_context_receipts':{
  'caption':'Figure 2. Context changes the receipt for the same hole and containing face. In the nested (4,0) field, the face-to-THIS assignment changes 42 flags, discharges 30 walls, opens 10 and retains 34. With every flag outside the same 24-flag hole read THIS, it changes 24 flags, discharges 20 walls, opens none and retains none. Both are targeted GPU receipts. Strictness fails in the nested case BECAUSE ten new walls open; receipt categories are shown separately and are not an additive score.',
  'alt':'Grouped bars compare two GPU receipts. Nested field: 30 discharged, 10 opened, 34 retained; contrast: 20 discharged, zero opened, zero retained. The same 24-flag hole is used in both. The respective changed sets contain 42 and 24 flags.'},
 'figure_3_refinement_contrasts':{
  'caption':'Figure 3. Two refinement correspondences with different retention outcomes. A: a diagnostic single-site THIS class grows from 12 flags at (2,0) to 48 at (4,0) under the recorded pullback. Its 12 walls remain, but the strict offer set changes from one exit to empty. This is a read-only carrier-to-carrier computation, not a world refinement. B: the nested configuration retains an empty strict offer set and 64 walls at both (4,0) and (8,0); its class counts change from 24/96/1,800 to 96/384/7,200. The containing-face receipt changes from 30 discharged/10 opened to 30/20. The (8,0) full-family GPU run matches the prior prediction for this configuration. No general invariance claim is made.',
  'alt':'Two panels. A shows a THIS class increasing from 12 to 48 flags while its 12 walls remain; its single strict exit disappears. B compares containing-face receipts 30/10 and 30/20 at levels 4 and 8, with 64 walls and K empty at both levels. The (8,0) result has a closed GPU receipt matching its prediction.'},
 'paper_two_cover_1200x630':{
  'caption':'The same 24-flag hole, two surrounding fields, two different GPU receipts.',
  'alt':'Persistence from Geometry. Same region, different surroundings, different outcome. Two cards compare GPU receipts for the same 24-flag hole: 20 discharged and 0 opened when the exterior reads THIS, versus 30 discharged and 10 opened in the nested field.'}}
data={
 'schema':'PAPER_TWO_FIGURE_DATA_001','scope':'Publication plotting of recorded counts only; no new execution, law or world transition.',
 'sources':sources,
 'figures':{
  'figure_1_pair_classification':{'level':[4,0],'fields':480,'with_strict_exit':60,'without_strict_exit':420,'classification_evidence':'Read-only bound-incidence computation; finding 0.1.6 §3 lines 75-76','gpu_scope':'RUN_RECORD_036.json /families/INTERIOR_PAIR; all 60 exits, not a 420-case no-exit census'},
  'figure_2_context_receipts':{'hole_flags':24,'nested':{k:nested[k] for k in ('changed','discharged','opened','retained')},'contrast':{k:contrast[k] for k in ('changed','discharged','opened','retained')},'source_pointers':['RUN_RECORD_036.json /families/RULE_D','RUN_RECORD_036.json /families/RULE_D_CONTRAST']},
  'figure_3_refinement_contrasts':{'single_site':{'levels':[[2,0],[4,0]],'class_flags':[12,48],'exterior_flags':[468,1872],'walls':[12,12],'strict_exit_counts':[1,0],'evidence':'Finding 0.1.6 §4 lines 138-145; read-only, not world transition'},'nested':{'levels':[[4,0],[8,0]],'class_flags':[[24,96,1800],[96,384,7200]],'walls':[64,64],'strict_exit_counts':[0,0],'diagnostic_receipts':[[30,10],[30,20]],'gpu8_source_pointers':['RUN_RECORD_RULE_D_026.json /prediction','RUN_RECORD_RULE_D_026.json /walls_before','RUN_RECORD_RULE_D_026.json /strict_members','RUN_RECORD_RULE_D_026.json /W00_THIS']}}
 },'captions_and_alt':captions,
 'rendering':{'library':'matplotlib','version':matplotlib.__version__,'python':platform.python_version(),'scientific_png_dpi':300,'web_png_dpi':180,'vector_format':'SVG','display_layout':'Chart coordinates encode recorded counts only; not physical spatial placement.'}}
(ROOT/'figuredata.json').write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
(ROOT/'CAPTIONS_AND_ALT.md').write_text('\n\n'.join(f'## {k}\n\n{v["caption"]}\n\nAlt: {v["alt"]}' for k,v in captions.items())+'\n',encoding='utf-8')
manifest=[]
for name in artifacts+['figuredata.json','CAPTIONS_AND_ALT.md','render_figures.py']:
 b=(ROOT/name).read_bytes();manifest.append({'path':name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest().upper()})
(ROOT/'FIGURE_MANIFEST.json').write_text(json.dumps({'schema':'PAPER_TWO_FIGURE_MANIFEST_001','files':manifest,'source_hashes':'SAME','visual_review':'PENDING'},indent=2)+'\n',encoding='utf-8')
print(json.dumps({'files':len(manifest),'output':str(ROOT),'source_hashes':'SAME'},indent=2))
