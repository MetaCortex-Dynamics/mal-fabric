// Isolated V1 execution using the SAME source image plus sealed carrier checkpoint.
// No expected-output file, world law, serial-run mutation, commit, or promotion.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:p,bytes:b.length,sha256:sha(b)};};
const read=p=>JSON.parse(fs.readFileSync(p));
function check(b){const a=id(b.path);if(a.sha256!==b.sha256||a.bytes!==(b.bytes??b.size))throw Error('CUSTODY_NOT_SAME '+b.path);}
const exe=path.join(here,'iterative_collect_007/block_iterative_full.exe'),source=path.join(here,'iterative_collect_007/block_iterative_full.cu'),inc=path.join(here,'telemetry.inc');
const qPath=path.join(here,'qualification_iterative_full/QUALIFICATION.json'),q=read(qPath),taPath=path.join(here,'qualification_iterative_full/TELEMETRY_AUDIT.json'),ta=read(taPath);
if(q.qualification!=='SAME'||ta.qualification!=='SAME'||ta.qualification_record.sha256!==id(qPath).sha256)throw Error('QUALIFICATION_AND_TELEMETRY_REQUIRED');
for(const p of ['exe','source','telemetry'])check(q.bindings[p]);
if(q.bindings.exe.sha256!==id(exe).sha256||q.bindings.source.sha256!==id(source).sha256||q.bindings.telemetry.sha256!==id(inc).sha256)throw Error('QUALIFIED_RUNTIME_NOT_SAME');
const sealPath=path.join(root,'carrier_prefill_001/PREFILL_MANIFEST.json');
if(id(sealPath).sha256!=='D40F88D9CA521EDF95A4FC347A309D8B23F5605F47EC164F91BB2CAD80DF4AD7')throw Error('PREFILL_SEAL_NOT_SAME');
const seal=read(sealPath);for(const b of Object.values(seal.members))check(b);
const from=path.join(root,'vectors/V1/stage01'),old=read(path.join(from,'BUILD.json'));
if(old.vector!=='V1'||old.stage!==1||old.source.sha256!=='BE1E4948CEADE240BAAA1AFAA37DFF2D0EA01810A1F188EC6F9A1F402ED91A97'||old.image.sha256!=='233D0009179E1B79DB0A8B170CDE81E08364DC76855A808C6BBAF0B729F057C1')throw Error('RETAINED_V1_NOT_SAME');
for(const b of [old.source,old.image,old.source_map,...Object.values(old.inputs)])check(b);
const guard=path.join(root,'prefill_guard_execute.mjs');if(id(guard).sha256!=='CAF7A0735EBC9ACC238295F6386541EDAB7CB0F5C165AB1DBA358FFA730D7D4C')throw Error('GUARD_NOT_SAME');
const memory=spawnSync('nvidia-smi',['--query-gpu=name,memory.free,memory.used','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});
const rows=memory.stdout?.trim().split(/\r?\n/),parts=rows?.[0]?.split(',').map(s=>s.trim());
if(memory.status!==0||rows.length!==1||!parts[0].includes('RTX 3070')||!Number.isFinite(Number(parts[1]))||Number(parts[1])<1536)throw Error('CONCURRENT_MEMORY_BOUNDARY '+memory.stdout);
const dir=path.join(here,'vectors_iterative/V1/stage01'),image=path.join(dir,'image');if(fs.existsSync(dir))throw Error('PRESERVE_PARALLEL_LINEAGE');fs.mkdirSync(image,{recursive:true});
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'}),put=(n,o)=>write(path.join(dir,n),JSON.stringify(o,null,2)+'\n');
for(const file of ['source.mal','source-map.json','image.bin']){const bytes=fs.readFileSync(path.join(from,'image',file));write(path.join(image,file),bytes);if(id(path.join(image,file)).sha256!==sha(bytes))throw Error('COPY_NOT_SAME');}
write(path.join(dir,'source.mal'),fs.readFileSync(old.source.path));
const build={...old,source:{...old.source,path:path.join(dir,'source.mal')},image:{...old.image,path:path.join(image,'image.bin')},source_map:{...old.source_map,path:path.join(image,'source-map.json')},execution_fork:{original_build:id(path.join(from,'BUILD.json')),source_image_map:'BYTE_EXACT_COPY',starting_state:'SEALED_CARRIER_ONLY; DERIVED_PROOFS_RETAINED'}};
put('BUILD.json',build);
const bindings={runner:id(fileURLToPath(import.meta.url)),runtime:id(exe),source:id(source),telemetry:id(inc),qualification:id(qPath),telemetry_audit:id(taPath),prefill_seal:id(sealPath),checkpoint:seal.members['readback.bin'],guard:id(guard),image:id(path.join(image,'image.bin')),map:id(path.join(image,'source-map.json')),world_source:id(path.join(image,'source.mal'))};
for(const [alias,b] of Object.entries(old.inputs)){check(b);bindings['input_'+alias]=id(b.path);}
const args=[guard,'--previous-map',seal.members['source-map.json'].path,'--previous-image',seal.members['image.bin'].path,'--previous-readback',seal.members['readback.bin'].path,'--next-map',path.join(image,'source-map.json'),'--next-image',path.join(image,'image.bin'),'--run','--exe',exe,'--output',path.join(image,'readback.bin'),'--report',path.join(dir,'PREFILL_EXECUTION_GUARD.json')];
const start={scope:'ITERATIVE_PARALLEL_V1_STAGE01; BOUNDED_QUALIFICATION_SAME; NOT_CONFORM',started_utc:new Date().toISOString(),bindings,preflight:{name:parts[0],free_MiB:Number(parts[1]),used_MiB:Number(parts[2])},arguments:args,serial_V1:'LEFT_RUNNING_UNCHANGED',prefilled_facts:seal.facts,derived_vector_correspondences:'NOT_PREFILLED'};
put('START.json',start);console.log(JSON.stringify({action:'PARALLEL_V1_LAUNCH',record:path.join(dir,'START.json'),preflight:start.preflight,image:bindings.image.sha256,checkpoint:bindings.checkpoint.sha256}));
try{
 for(const b of Object.values(bindings))check(b);
 const result=spawnSync(process.execPath,['--max-old-space-size=8192',...args],{cwd:root,windowsHide:true,encoding:'utf8',stdio:['ignore','pipe','inherit'],maxBuffer:32*1024*1024});
 put('EXECUTION.json',{scope:'Generic source execution; not CONFORM',vector:'V1',stage:1,mode:'SEALED_CARRIER_PREFILL',started_utc:start.started_utc,ended_utc:new Date().toISOString(),bindings,exit_code:result.status,error:result.error?.message??null,output:result.stdout??'',serial_V1:'NOT_STOPPED_OR_CHANGED'});
 for(const b of Object.values(bindings))check(b);
 if(result.error||result.status!==0)throw Error('PARALLEL_V1_EXECUTION_NOT_COMPLETED '+(result.error?.message??result.status));
 function cpu(tool,argv){const r=spawnSync(process.execPath,['--max-old-space-size=8192',path.join(root,tool),...argv],{cwd:root,windowsHide:true,encoding:'utf8',stdio:['ignore','pipe','inherit'],maxBuffer:32*1024*1024});if(r.error||r.status!==0)throw Error('OBSERVATION_STOP '+tool);return r.stdout;}
 cpu('status.mjs',[image,path.join(dir,'STATUS.json')]);
 const previous=path.join(root,'hash_empty/responses.json');cpu('hash_batch.mjs',[image,path.join(dir,'hash'),previous]);cpu('hash_delta.mjs',[path.join(dir,'hash/responses.json'),previous,path.join(dir,'hash/delta.json')]);
 const status=read(path.join(dir,'STATUS.json'));console.log(JSON.stringify({action:'PARALLEL_V1_STAGE01_COMPLETED',readback:status.readback_sha256,facts:status.facts,terms:status.terms,epochs:status.epochs,conform:'NOT_RUN; SOURCE_CONTINUATIONS_AND_COMMITTED_OUTPUT_REQUIRED',serial_V1:'LEFT_RUNNING_UNCHANGED'}));
}catch(e){put('STOP.json',{reason:e.message,conform:'NOT_RUN',serial_V1:'LEFT_RUNNING_UNCHANGED'});throw e;}
