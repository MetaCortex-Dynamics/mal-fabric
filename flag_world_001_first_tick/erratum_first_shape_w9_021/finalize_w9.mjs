// Evidence binding only: compare recorded outputs, hash bytes, preserve every prior run.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const sha=b=>createHash('sha256').update(b).digest('hex').toUpperCase();
const info=p=>{const b=fs.readFileSync(p);return {path:path.relative(root,p).replaceAll('\\','/'),size:b.length,sha256:sha(b)};};
const paths=process.argv.slice(2);
if(paths.length!==2)throw new Error('Provide exactly two completed full run directories.');
if(new Set(paths.map(p=>fs.realpathSync(path.join(root,p)).toLowerCase())).size!==2)throw new Error('Replay requires two distinct run directories.');
const records=paths.map(p=>path.join(root,p,'RUN_RECORD_W9_021.json'));
const runs=records.map(p=>JSON.parse(fs.readFileSync(p)));
for(const r of runs)if(r.kind!=='W9_NATIVE_QUALIFICATION'||r.terminal!=='IF_THEN'||r.qualification!=='FULL_FIXTURE_SET')throw new Error('Full qualification not discharged');
if(runs[0].observations.length!==runs[1].observations.length)throw new Error('NOT_SAME case counts');
for(const r of runs){
 for(const i of r.inputs){const current=info(path.join(root,i.path));if(current.sha256!==i.sha256||current.size!==i.size)throw new Error('NOT_SAME current frozen input '+i.path);}
 if(info(path.join(root,'source/w9.mal')).sha256!==r.executed_snapshots.implementation.executed_copy.sha256)throw new Error('NOT_SAME current implementation');
 for(const s of Object.values(r.executed_snapshots))if(info(path.join(root,s.executed_copy.path)).sha256!==s.executed_copy.sha256)throw new Error('NOT_SAME run snapshot');
 for(const c of r.observations)for(const label of ['input','expected','actual','harness']){
  const recorded=c[label],current=info(path.join(root,recorded.path));
  if(current.sha256!==recorded.sha256||current.size!==recorded.size)throw new Error('NOT_SAME case custody '+c.id+':'+label);
 }
}
for(const key of ['native_runtime','byte_library','implementation','transport'])if(runs[0].executed_snapshots[key].executed_copy.sha256!==runs[1].executed_snapshots[key].executed_copy.sha256)throw new Error('NOT_SAME replay implementation '+key);
const replay=runs[0].observations.map((a,i)=>{
 const b=runs[1].observations[i];
 if(a.id!==b.id||a.comparison!=='SAME'||b.comparison!=='SAME')throw new Error('NOT_SAME replay membership');
 if(a.input.sha256!==b.input.sha256||a.expected.sha256!==b.expected.sha256)throw new Error('NOT_SAME replay input/expected '+a.id);
 const ba=fs.readFileSync(path.join(root,a.actual.path)),bb=fs.readFileSync(path.join(root,b.actual.path));
 if(!ba.equals(fs.readFileSync(path.join(root,a.expected.path)))||!bb.equals(fs.readFileSync(path.join(root,b.expected.path))))throw new Error('NOT_SAME frozen comparison '+a.id);
 if(!ba.equals(bb))throw new Error('NOT_SAME replay: '+a.id);
 return {id:a.id,actual_sha256:sha(ba),comparison:'SAME'};
});
const item=JSON.parse(fs.readFileSync(path.join(root,'ITEM_7_READ.json')));
for(const s of item.sources){
 const p=path.isAbsolute(s.path)?s.path:path.join(root,s.path);
 if(sha(fs.readFileSync(p))!==s.sha256)throw new Error('NOT_SAME item7 source '+s.id);
}
const archive=path.join(root,'erratum_e_first_shape_v0.1.3.zip');
const original='C:/Users/devon/Desktop/MaL/Compressed/erratum_e_first_shape_v0.1.3.zip';
if(!fs.readFileSync(archive).equals(fs.readFileSync(original)))throw new Error('NOT_SAME supplied archive');
if(sha(fs.readFileSync(archive))!=='574A41ECF4A415BC384E22ECDF3AE95605432341FD71E14A9435783E129EE010')throw new Error('NOT_SAME archive identity');
const repo=path.resolve(root,'../..');
const git=(...a)=>execFileSync('git',['-C',repo,...a],{encoding:'utf8'}).trim();
const protectedFiles=[
 ['../j17_step_023/outputs/committed.world.json','E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'],
 ['../j17_proposer_reentry_020/RUN_RECORD_TEST_P_020.json','DE8052E6A1DB6F4B47D377D88622202E810D5FF3756BFB85CA17F31490DE1D70'],
 ['../j17_runs_021_023_seal/FROZEN_REHOME_MANIFEST_001.json','F7CADDA1C99DE37E9AF00D5429BA34600ACFF421A3FC4C5622FD8F239DF19560']
].map(([p,expected])=>{const f=info(path.join(root,p));if(f.sha256!==expected)throw new Error('NOT_SAME protected subject '+p);return {...f,comparison:'SAME'};});
const trackedDiff=git('diff','HEAD','--name-only');
if(trackedDiff!=='')throw new Error('Tracked edits require separate disposition; no unchanged-tree claim.');
const record={
 kind:'ERRATUM_V013_W9_AND_ITEM7_BINDING',
 authority:'Devon requested binding v0.1.3, executing W9 before promotion, and the item 7 read.',
 erratum:info(path.join(root,'inputs/ERRATUM_E_FIRST_SHAPE_NO_PIECES_001.mal')),
 archive:info(archive),original_archive:original,archive_copy:'SAME',
 promotion:'NOT_PERFORMED',entrypoint_integration:'NOT_PERFORMED',repository_commit:'NOT_PERFORMED',push:'NOT_PERFORMED',
 implementation:info(path.join(root,'source/w9.mal')),
 execution:'Native .mal W9 lexer/position reader in the unchanged bound MaLCog evaluator; Node transports bytes, serializes returned token flags/verdict, and compares frozen JSON. No Python.',
 qualification_records:records.map(info),frozen_vectors:runs[0].observations.filter(r=>r.kind==='FROZEN').length,
 additional_controls:runs[0].observations.filter(r=>r.kind!=='FROZEN').length,
 replay,verdict:'IF_THEN',
 scope:'W9 additional PROMOTE check only, not W1-W8. Parser-boundary MAYBE is a named implementation deferral, not an added W9 law verdict. The named productions and qualification fixtures are the witnessed scope; no universal parser-coverage claim.',
 item7:info(path.join(root,'ITEM_7_READ.json')),
 protected_subjects:protectedFiles,
 repository:{branch:git('branch','--show-current'),head:git('rev-parse','HEAD'),tracked_diff:trackedDiff},
 world:'No world input, committed link, frozen fixture, promoted source, or authority receipt edited.'
};
const dest=path.join(root,'BINDING_RECORD_021.json');
if(fs.existsSync(dest))throw new Error('Binding already recorded; do not overwrite.');
fs.writeFileSync(dest,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(!['MANIFEST.json','SHA256SUMS'].includes(path.relative(root,p)))files.push(info(p));}}
walk(root);
const manifest={kind:'LOCAL_UNPROMOTED_EVIDENCE_MANIFEST',files};
fs.writeFileSync(path.join(root,'MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
const all=[...files,info(path.join(root,'MANIFEST.json'))].sort((a,b)=>a.path.localeCompare(b.path));
fs.writeFileSync(path.join(root,'SHA256SUMS'),all.map(f=>`${f.sha256}  ${f.path}`).join('\n')+'\n',{flag:'wx'});
for(const f of all)if(info(path.join(root,f.path)).sha256!==f.sha256)throw new Error('NOT_SAME final manifest '+f.path);
console.log(JSON.stringify({binding:info(dest),manifest:info(path.join(root,'MANIFEST.json')),sums:info(path.join(root,'SHA256SUMS')),cases:replay.length}));
