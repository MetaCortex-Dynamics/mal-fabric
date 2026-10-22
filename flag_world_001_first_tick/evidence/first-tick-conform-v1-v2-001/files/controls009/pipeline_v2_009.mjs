// Execution/custody orchestration only. No world law, expected-output injection,
// CUDA change, V1 rerun, board action, repository commit or promotion.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';

const controls=path.dirname(fileURLToPath(import.meta.url));
const root='D:/Dev/flag-world-first-tick-020';
const qualified=path.join(root,'parallel_prefill_002');
const work=path.join(qualified,'vectors_v2_009/V2');
const prepared=path.join(root,'vectors/V2/stage01');
const corpus='C:/Users/devon/Documents/Codex/2026-10-04/new-chat/flag_world_first_tick_001_v013';
const manifestPath=path.join(controls,'V2_009_BINDINGS.json');
const record=path.join(qualified,'RUN_RECORD_V1_V2_CONFORM_009.json');
const oldManifestPath=path.join(qualified,'CONTINUATION_008_BINDINGS.json');
const v1RecordPath=path.join(qualified,'RUN_RECORD_V1_REPEAT_AND_CONTINUATION_008.json');
const v1Run=path.join(qualified,'vectors_repeat_008/V1/stage14/image');
const sealPath=path.join(root,'carrier_prefill_001/PREFILL_MANIFEST.json');
const [mode]=process.argv.slice(2);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),size:b.length,sha256:sha(b)};};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,o)=>fs.writeFileSync(p,JSON.stringify(o,null,2)+'\n',{flag:'wx'});
const check=r=>{const a=id(r.path);if(a.sha256!==r.sha256||a.size!==(r.size??r.bytes))throw Error('CUSTODY_NOT_SAME '+r.path);};
const requireHash=(p,h)=>{const a=id(p);if(a.sha256!==h)throw Error('BOUND_BYTES_NOT_SAME '+p);return a;};
const emit=o=>console.log(JSON.stringify(o));
const expected={
 V1:{input:'28093717ACC694FACC3B635701A22AFF37DDB09FB0447774BACC700647F262BE',expected:'69786966E9B5D66A2078D29C43E1F1511545786AB07BF562E37D91205085B588'},
 V2:{input:'DC46E239B9D693AF25DC3D7005718060230D31AC9CA057F7ECCCF73968AA2C8E',expected:'BD0492B4CAC427432CC3251EB27FC997C0D5EFF2862ECBC10A89B9AC19F1AD0F'}
};
function frozen(){
 const spec=requireHash(path.join(corpus,'SPEC_FLAG_WORLD_FIRST_TICK_001_v0.1.3_PROPOSED.mal'),'2ECF2EEF9A8901DA9C802922BEBE1F74C367D7A74E5B773528504B73854C1A01');
 const vectors={};
 for(const [v,bindings]of Object.entries(expected)){
  vectors[v]={};for(const [kind,h]of Object.entries(bindings))vectors[v][kind]=requireHash(path.join(corpus,v+'.'+kind+'.json'),h);
 }
 return {spec,vectors,scope:'Expected files are custody/CONFORM only; not runtime inputs'};
}
function originalPrepared(){
 const b=read(path.join(prepared,'BUILD.json'));
 if(b.vector!=='V2'||b.stage!==1||b.source.sha256!=='BE1E4948CEADE240BAAA1AFAA37DFF2D0EA01810A1F188EC6F9A1F402ED91A97'||b.image.sha256!=='FE34A07948DB72507CFD7D28278E63DCABEA478FDB949B4C28CBFA2A0B41D75A'||b.source_map.sha256!=='C84A099325D37D942229FA71B1E721FA3A66C2803BB154F2C879E5EE21EEC058')throw Error('PREPARED_V2_NOT_SAME');
 for(const r of [b.source,b.image,b.source_map,...b.members,...Object.values(b.inputs)])check(r);
 if(b.inputs.vector.sha256!==expected.V2.input||Object.values(b.inputs).some(r=>Object.values(expected).some(v=>r.sha256===v.expected)||/\.expected\.json$/i.test(r.path)))throw Error('EXPECTED_OUTPUT_INPUT_EXCLUDED');
 return b;
}
function qualification(){
 requireHash(oldManifestPath,'7C11042376B4F1E2509265773256E512EC37C824A7D9EEF3A14474D6584CE05E');
 const prior=read(oldManifestPath);for(const r of prior.members)check(r);
 const qualifiedV1=requireHash(v1RecordPath,'886DA11F3A3FB7009C7368E4F7BC6A18CC787A222D555B8082BDD199CD617AD5');
 const v1=read(v1RecordPath);
 if(v1.repeat.comparison!=='SAME'||v1.repeat.repeated.sha256!=='6C30E87F2DCA3325015D82F86482315134D93530D2A0C4517A76FC3D6DB09849'||v1.V1.comparison!=='SAME'||v1.V1.verdict!=='IF_THEN')throw Error('RETAINED_V1_QUALIFICATION_REQUIRED');
 check(v1.conform_record);
 const capacity=requireHash(path.join(qualified,'capacity_refusal_008/QUALIFICATION.json'),'0BAD5646C5D071F11886A42EBF5A7341FF44EBFEB921C3BE5B227DD1F9D06938');
 const sealID=requireHash(sealPath,'D40F88D9CA521EDF95A4FC347A309D8B23F5605F47EC164F91BB2CAD80DF4AD7');
 const seal=read(sealPath);for(const r of Object.values(seal.members))check(r);
 const importGuard=read(seal.members['V2_IMPORT_GUARD.json'].path);
 if(importGuard.guard!=='IF_THEN'||importGuard.next_image_sha256!=='FE34A07948DB72507CFD7D28278E63DCABEA478FDB949B4C28CBFA2A0B41D75A'||importGuard.checkpoint_sha256!==seal.members['readback.bin'].sha256)throw Error('CARRIER_V2_IMPORT_BINDING_REQUIRED');
 return {prior,qualifiedV1,capacity,sealID,seal};
}
if(mode==='--prepare'){
 if(fs.existsSync(work)||fs.existsSync(record))throw Error('PRESERVE_EXISTING_V2_LINEAGE');
 const q=qualification(),old=originalPrepared();
 const extra=[fileURLToPath(import.meta.url),path.join(controls,'continue_vector_009.mjs'),path.join(controls,'execute_stage_009.mjs'),path.join(controls,'CONTINUATION_TRANSFORM.json'),path.join(prepared,'BUILD.json'),v1RecordPath,oldManifestPath,sealPath,q.seal.members['V2_IMPORT_GUARD.json'].path,...old.members.map(x=>x.path),...Object.values(old.inputs).map(x=>x.path)];
 const byPath=new Map();for(const r of [...q.prior.members,...extra.map(id)])byPath.set(path.resolve(r.path),r);
 write(manifestPath,{scope:'V2_EXECUTION_WITH_UNCHANGED_QUALIFIED_RUNTIME_AND_SOURCE; CARRIER_ONLY_PREFILL',created_utc:new Date().toISOString(),authority:'Devon: proceed; execute V2 through commit and ordered V1/V2 CONFORM',members:[...byPath.values()],frozen:frozen(),qualification:{V1:q.qualifiedV1,capacity:q.capacity,prefill:q.sealID},prepared_v2:{build:id(path.join(prepared,'BUILD.json')),source:old.source,image:old.image,source_map:old.source_map},outputs:{work,record},preservation:'V1/source/CUDA/promoted bytes untouched; no promotion or repository operation'});
 emit({action:'V2_BINDINGS_SEALED',bindings:id(manifestPath),prepared_image:old.image.sha256,checkpoint:q.seal.members['readback.bin'].sha256});
 process.exit(0);
}
if(mode!=='--run')throw Error('usage: --prepare OR --run');
const bound=read(manifestPath),boundID=id(manifestPath);
function verify(){check(boundID);for(const r of bound.members)check(r);frozen();}
verify();
if(fs.existsSync(work)||fs.existsSync(record))throw Error('PRESERVE_EXISTING_V2_LINEAGE');
const memory=spawnSync('nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});
const gpuRows=memory.stdout?.trim().split(/\r?\n/),gpu=gpuRows?.[0]?.split(',').map(s=>s.trim());
if(memory.status!==0||gpuRows.length!==1||!gpu[0].includes('RTX 3070')||!Number.isFinite(Number(gpu[1]))||Number(gpu[1])<1536)throw Error('GPU_MEMORY_PREFLIGHT '+memory.stdout);
const started=new Date().toISOString();
write(path.join(controls,'PIPELINE_009_START.json'),{started_utc:started,bindings:boundID,runner:id(fileURLToPath(import.meta.url)),vector:'V2',starting_state:'SEALED_CARRIER_ONLY',prefilled_facts:5282,vector_dependent_facts:'DERIVE_FRESH',gpu:{name:gpu[0],free_MiB:Number(gpu[1])},after:'AUDITED_STAGE01 -> SOURCE_DIRECTED_ADDITIVE_STAGES -> COMMITTED_VECTOR_OUTPUT -> ORDERED_V1_V2_CONFORM',V1:'RETAINED_SAME_NO_GPU_RERUN',failure:'STOP_AND_KEEP_ALL_EVIDENCE; NO_FALLBACK_OR_EXPECTATION_ADJUSTMENT'});
async function launch(file,args){
 verify();emit({action:'PLAN_BEFORE_LAUNCH',script:id(file),arguments:args,scope:'Generic execution/custody only; source laws unchanged'});
 await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['--max-old-space-size=8192',file,...args],{cwd:root,stdio:'inherit',windowsHide:true});child.once('error',reject);child.once('exit',(code,signal)=>code===0?resolve():reject(Error('CHILD_REFUSAL '+path.basename(file)+' '+(signal??code))));});
}
let committed=null,conform=null;
try{
 const old=originalPrepared(),first=path.join(work,'stage01'),image=path.join(first,'image');
 fs.mkdirSync(image,{recursive:true});
 for(const f of ['source.mal','source-map.json','image.bin']){
  const b=fs.readFileSync(path.join(prepared,'image',f)),target=path.join(image,f);
  fs.writeFileSync(target,b,{flag:'wx'});if(!fs.readFileSync(target).equals(b))throw Error('V2_IMAGE_COPY_NOT_SAME');
 }
 fs.writeFileSync(path.join(first,'source.mal'),fs.readFileSync(old.source.path),{flag:'wx'});
 if(fs.existsSync(old.source.path+'.custody.json'))fs.copyFileSync(old.source.path+'.custody.json',path.join(first,'source.mal.custody.json'),fs.constants.COPYFILE_EXCL);
 write(path.join(first,'BUILD.json'),{...old,source:id(path.join(first,'source.mal')),image:id(path.join(image,'image.bin')),source_map:id(path.join(image,'source-map.json')),execution_fork:{original_build:id(path.join(prepared,'BUILD.json')),source_image_map:'BYTE_EXACT_COPY',starting_state:'SEALED_CARRIER_ONLY; V2_SPECIFIC_FACTS_NOT_PREFILLED'}});
 emit({action:'V2_PREPARED_IMAGE_COPIED',image:id(path.join(image,'image.bin')),source:id(path.join(first,'source.mal')),V1:'UNTOUCHED'});
 await launch(path.join(controls,'execute_stage_009.mjs'),['V2','1']);
 await launch(path.join(controls,'continue_vector_009.mjs'),['V2','--start-stage','1']);
 const committedPath=path.join(work,'SOURCE_COMMITTED.json');
 if(!fs.existsSync(committedPath))throw Error('SOURCE_CONTINUATION_PENDING '+JSON.stringify(read(path.join(work,'CONTINUATION_PENDING.json'))));
 committed=read(committedPath);
 const comparisonManifest=path.join(work,'CONFORM_MANIFEST.json'),out=path.join(work,'conform');
 write(comparisonManifest,{scope:'ORDERED_V1_V2_CONFORM; V1_RETAINED_COMMITTED_OUTPUT; V2_NEW_EXECUTION',vectors:Object.entries(expected).map(([v,h])=>({id:v,input:path.join(corpus,v+'.input.json'),expected:path.join(corpus,v+'.expected.json'),input_sha256:h.input,expected_sha256:h.expected,run_dir:v==='V1'?v1Run:committed.run_dir}))});
 try{await launch(path.join(root,'compare_vectors.mjs'),[comparisonManifest,out]);}finally{if(fs.existsSync(path.join(out,'CONFORM.json')))conform=read(path.join(out,'CONFORM.json'));}
 if(conform?.verdict!=='IF_THEN'||conform.vectors.some(v=>v.execution!=='EXECUTED'||v.comparison!=='SAME'))throw Error('ORDERED_CONFORM_NOT_SAME_OR_NOT_EXECUTED');
 verify();
 write(record,{scope:'V2_CARRIER_PREFILL_EXECUTION_AND_SOURCE_CONTINUATION_THEN_ORDERED_V1_V2_CONFORM',started_utc:started,ended_utc:new Date().toISOString(),bindings:boundID,qualification:bound.qualification,committed,conform_record:id(path.join(out,'CONFORM.json')),vectors:conform.vectors,verdict:conform.verdict,promotion:'NONE',repository_commit:'NONE',V1_preservation:'No rerun or overwrite; original record unchanged'});
 emit({action:'V1_V2_CONFORM_IF_THEN',record:id(record)});
}catch(e){
 const stopped={scope:'V2_STOPPED_WITH_EVIDENCE_PRESERVED',started_utc:started,ended_utc:new Date().toISOString(),bindings:boundID,reason:e.message,committed,conform,verdict:conform?.verdict??'MAYBE',V1:'RETAINED_SAME_UNCHANGED',continuation:'STOPPED',promotion:'NONE',repository_commit:'NONE'};
 write(record,stopped);emit({action:'V2_PIPELINE_STOP',reason:e.message,record:id(record)});process.exitCode=2;
}
