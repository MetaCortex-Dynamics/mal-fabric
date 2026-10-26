// Hash custody for the explicitly authorized erratum publication. No Git mutation.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),project=path.dirname(root),repo=path.dirname(project);
const hash=b=>createHash('sha256').update(b).digest('hex').toUpperCase();
const bind=p=>{const b=fs.readFileSync(p);return {path:path.relative(repo,p).replaceAll('\\','/'),size:b.length,sha256:hash(b)};};
if(fs.existsSync(path.join(root,'SHA256SUMS'))||fs.existsSync(path.join(root,'SEAL_025.json')))throw new Error('Seal already present; do not overwrite.');
const old=path.join(project,'erratum_first_shape_w9_021');
let previous=0;
for(const line of fs.readFileSync(path.join(old,'SHA256SUMS'),'utf8').trim().split(/\r?\n/)){
 const m=line.match(/^([A-Fa-f0-9]{64})  (.+)$/);if(!m)throw new Error('Unread checksum line');
 const p=path.resolve(old,m[2]);if(!p.startsWith(old+path.sep))throw new Error('Path outside prior package');
 if(hash(fs.readFileSync(p))!==m[1].toUpperCase())throw new Error(`NOT_SAME prior qualification ${m[2]}`);previous++;
}
const frozenPath=path.join(project,'j17_runs_021_023_seal/FROZEN_REHOME_MANIFEST_001.json');
if(hash(fs.readFileSync(frozenPath))!=='F7CADDA1C99DE37E9AF00D5429BA34600ACFF421A3FC4C5622FD8F239DF19560')throw new Error('NOT_SAME frozen manifest');
const frozen=JSON.parse(fs.readFileSync(frozenPath));
if(frozen.files.length!==901)throw new Error('Frozen count NOT_SAME');
for(const f of frozen.files){const b=fs.readFileSync(path.join(repo,f.destination_path));if(b.length!==f.size||hash(b)!==f.sha256)throw new Error(`NOT_SAME frozen ${f.destination_path}`);}
const qualificationPath=path.join(root,'qualification_final/RUN_RECORD_PROMOTION_CHECK_024.json');
const qualification=JSON.parse(fs.readFileSync(qualificationPath));
if(qualification.terminal!=='IF_THEN'||qualification.tests.length!==46||qualification.tests.some(t=>t.comparison!=='SAME'))throw new Error('Qualification NOT_SAME');
const contact=path.join(project,'world_transition_contacts_007');
const read=JSON.parse(fs.readFileSync(path.join(root,'SECTION_7_1_READ_025.json')));
for(const f of read.sources.filter(f=>f.id!=='ARCHIVE'))if(hash(fs.readFileSync(path.resolve(root,f.path)))!==f.sha256)throw new Error(`NOT_SAME read source ${f.id}`);
const sourceIdentities=[
 ['../erratum_first_shape_promotion_024/inputs/ERRATUM_E_FIRST_SHAPE_NO_PIECES_001.mal','E93318BCB508733174FB5D4D7622BF8F1ABFD80A8D6F6CC79FF4DA0C6E337BCC'],
 ['../erratum_first_shape_promotion_024/inputs/RECEIPT_PROMOTE_ERRATUM_E_FIRST_SHAPE_NO_PIECES_001_v0.1.3.md','19AD057BD1C3F3EF27480F8D292A54EC6E5FAE518BBFF0AAB17BE0E4C8D17B65'],
 ['../erratum_first_shape_promotion_024/BINDING_RECORD_024.json','72FCC40F21CE8AC8654D289D71737ECE4691D422F02E30D30AA06E77698E35A8']
];
for(const [p,h] of sourceIdentities)if(hash(fs.readFileSync(path.resolve(root,p)))!==h)throw new Error(`NOT_SAME ${p}`);
const seal={kind:'ERRATUM_REPOSITORY_SEAL_025',authority:'Devon: commit and push the erratum and receipt after the read',
 repository:'MetaCortex-Dynamics/mal-fabric',branch:'review/first-shape-w9-propose-scope-021',base_commit:'f099abe4e1708fc90edc09f04b2f855eb48c161b',
 subjects:sourceIdentities.map(([p])=>bind(path.resolve(root,p))),read:bind(path.join(root,'SECTION_7_1_READ_025.json')),qualification:bind(qualificationPath),
 checks:{previous_w9_files_SAME:previous,frozen_files_SAME:901,qualification_comparisons_SAME:46,native_evaluations:44,existing_W9_cases:37},
 entrypoints:['HANDOFF_FLAG_WORLD_FIRST_TICK_2026-10-21.md','mal-compliance.SKILL.md'].map(n=>bind(path.join(root,'entrypoints',n))),
 checksum_scope:['erratum_first_shape_w9_021/','erratum_first_shape_promotion_024/','erratum_first_shape_seal_025/','CHECK_FORM_PROMOTE.ps1','world_transition_contacts_007/README.md','world_transition_contacts_007/PROMOTION_BINDINGS_024.json'],
 checksum_rule:'SHA256SUMS lists every scoped file except itself; paths relative to repository root; SEAL_025.json included.',
 exclusions:['Unrelated ancestral and parent diagnostic packages','All frozen evidence mutations','__pycache__ and .pyc','Any worldline append','New law promotion','Merge to main'],
 commit_identity:'Reported after commit; not invented here',remote_publication:'Authorized; confirmed after push, not asserted by this pre-commit seal'};
fs.writeFileSync(path.join(root,'SEAL_025.json'),JSON.stringify(seal,null,2)+'\n',{flag:'wx'});
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);}
const files=[...walk(old),...walk(path.join(project,'erratum_first_shape_promotion_024')),...walk(root),path.join(project,'CHECK_FORM_PROMOTE.ps1'),path.join(contact,'README.md'),path.join(contact,'PROMOTION_BINDINGS_024.json')].sort();
if(files.some(p=>/(^|[\\/])__pycache__([\\/]|$)|\.pyc$/i.test(p)))throw new Error('Excluded cache file in seal');
const rows=files.map(bind);
fs.writeFileSync(path.join(root,'SHA256SUMS'),rows.map(f=>`${f.sha256}  ${f.path}`).join('\n')+'\n',{flag:'wx'});
console.log(JSON.stringify({files:rows.length,total_bytes:rows.reduce((n,f)=>n+f.size,0),seal_sha256:bind(path.join(root,'SEAL_025.json')).sha256,checksums_sha256:bind(path.join(root,'SHA256SUMS')).sha256,read_sha256:bind(path.join(root,'SECTION_7_1_READ_025.json')).sha256}));
