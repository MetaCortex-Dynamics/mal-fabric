// Bounded GPU qualification of proof-carrying prefill, not V1/V2 CONFORM.
// No active run is stopped or changed. All outputs are write-once in a new folder.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));
const base=path.join(root,'prefill_qualification_001');
const out=path.join(base,'execution');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:p,bytes:b.length,sha256:sha(b)};};
const check=r=>{const a=id(r.path);if(a.sha256!==r.sha256||a.bytes!==r.bytes)throw Error('CUSTODY_NOT_SAME '+r.path);};
const write=(name,v)=>fs.writeFileSync(path.join(out,name),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const exe=path.join(base,'prefill_small.exe'),guard=path.join(root,'prefill_guard_execute.mjs');
const manifest=path.join(root,'carrier_prefill_001/PREFILL_MANIFEST.json');
const preparation=path.join(base,'PREPARATION.json');
const bound={
 exe:'58B3A1A4387E73F2D238B749614B5C51B29F460D5C1AD02FEC61F2949B44D5B0',
 guard:'CAF7A0735EBC9ACC238295F6386541EDAB7CB0F5C165AB1DBA358FFA730D7D4C',
 manifest:'D40F88D9CA521EDF95A4FC347A309D8B23F5605F47EC164F91BB2CAD80DF4AD7',
 preparation:'EDA7A8E7CEE76F33A1786CB3D47FBED67B4521B8435155520E07D6E16787A892'
};
for(const [k,p] of Object.entries({exe,guard,manifest,preparation}))if(id(p).sha256!==bound[k])throw Error('BOUND_INPUT_NOT_SAME '+k);
const seal=JSON.parse(fs.readFileSync(manifest)),prep=JSON.parse(fs.readFileSync(preparation));
for(const r of Object.values(seal.members))check(r);
check(prep.runtimeTransform.parent);check(prep.runtimeTransform.child);check(prep.carrierImage.to);check(prep.carrierState.to);
for(const c of prep.cases){check(c.source);check(c.input);check(c.image.to);}
let undo=fs.readFileSync(prep.runtimeTransform.child.path,'utf8');
for(const change of [...prep.runtimeTransform.changes].reverse()){
 if(undo.split(change.to).length!==2)throw Error('TRANSFORM_NOT_UNIQUE');undo=undo.replace(change.to,change.from);
}
if(sha(Buffer.from(undo))!==prep.runtimeTransform.parent.sha256)throw Error('UNLISTED_RUNTIME_CHANGE');
if(fs.existsSync(out))throw Error('PRESERVE_QUALIFICATION_OUTPUT');
fs.mkdirSync(out);
const before={runner:id(fileURLToPath(import.meta.url)),exe:id(exe),guard:id(guard),manifest:id(manifest),preparation:id(preparation)};
const events=[];
function budget(){
 const r=spawnSync('nvidia-smi',['--query-gpu=name,memory.free,memory.used','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});
 if(r.status!==0)throw Error('GPU_MEMORY_OBSERVATION_UNAVAILABLE');
 const rows=r.stdout.trim().split(/\r?\n/);if(rows.length!==1)throw Error('SINGLE_GPU_QUALIFICATION_REQUIRED');
 const [name,freeText,usedText]=rows[0].split(',').map(x=>x.trim()),free=Number(freeText),used=Number(usedText);
 if(!name.includes('RTX 3070')||!Number.isFinite(free)||free<1536)throw Error('DEFER_GPU_QUALIFICATION_MEMORY_BUDGET '+rows[0]);
 return {name,free_MiB:free,used_MiB:used,minimum_free_MiB:1536,scope:'pre-launch observation; not a measured per-context allocation'};
}
function launch(label,command,args){
 for(const r of Object.values(before))check(r);
 const preflight=budget(),started=new Date().toISOString();
 console.log(JSON.stringify({action:'BOUNDED_QUALIFICATION_LAUNCH',label,preflight}));
 const r=spawnSync(command,args,{cwd:root,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','inherit'],maxBuffer:16*1024*1024});
 const record={label,started_utc:started,ended_utc:new Date().toISOString(),command,args,preflight,exit_code:r.status,signal:r.signal,stdout:r.stdout||'',error:r.error?.message||null};
 write(label+'.execution.json',record);events.push(record);
 for(const x of Object.values(before))check(x);
 if(r.error||r.status!==0)throw Error('QUALIFICATION_EXECUTION_STOP '+label);
 return record;
}
function state(file,dir){
 const b=fs.readFileSync(file),w=i=>b.readInt32LE(i*4),nt=w(2),nf=w(3),tc=w(5),fc=w(6);
 if(w(0)!==0x31524c47||w(1)!==1||w(4)!==0||b.length!==32+nt*40+nf*48)throw Error('QUALIFICATION_STATE_FORMAT');
 const map=JSON.parse(fs.readFileSync(path.join(dir,'source-map.json'))),counts={},readings={},seeded=[];
 for(let i=0;i<fc;i++){
  const at=8+nt*10+i*12,t=w(at),tp=8+t*10,a=w(tp+1);if(a<1)continue;
  const tag=map.symbols[w(8+w(tp+2)*10)];counts[tag]=(counts[tag]||0)+1;
  if(tag==='PQ_FLAG_READING'||tag==='PQ_PAIR_READING'){
   if(w(at+1)<0)seeded.push(i);
   const r=map.symbols[w(8+w(tp+1+a)*10)];readings[tag]??={};readings[tag][r]=(readings[tag][r]||0)+1;
  }
 }
 return {identity:id(file),error:w(4),terms:tc,facts:fc,epochs:w(7),used_terms:sha(b.subarray(32,32+tc*40)),used_facts:sha(b.subarray(32+nt*40,32+nt*40+fc*48)),counts,readings,seeded_results:seeded.length};
}
try{
 const carrier=path.join(base,'carrier'),coldCarrier=path.join(out,'carrier.clean.bin');
 launch('carrier_clean',exe,[path.join(carrier,'image.bin'),coldCarrier]);
 const original=state(path.join(carrier,'readback.bin'),carrier),cold=state(coldCarrier,carrier);
 if(cold.used_terms!==original.used_terms||cold.used_facts!==original.used_facts||cold.facts!==original.facts||cold.terms!==original.terms)throw Error('BOUNDED_RUNTIME_CARRIER_NOT_SAME');
 const cases=[];
 for(const reading of ['THIS','NO']){
  const stem=reading.toLowerCase(),dir=path.join(base,stem),clean=path.join(out,stem+'.clean.bin'),warm=path.join(out,stem+'.prefilled.bin'),reportPath=path.join(out,stem+'.guard.json');
  launch(stem+'_clean',exe,[path.join(dir,'image.bin'),clean]);
  const args=[guard,'--previous-map',path.join(carrier,'source-map.json'),'--previous-image',path.join(carrier,'image.bin'),'--previous-readback',path.join(carrier,'readback.bin'),'--next-map',path.join(dir,'source-map.json'),'--next-image',path.join(dir,'image.bin'),'--run','--exe',exe,'--output',warm,'--compare',clean,'--report',reportPath];
  launch(stem+'_prefilled',process.execPath,args);
  const g=JSON.parse(fs.readFileSync(reportPath)),a=state(clean,dir),b=state(warm,dir);
  if(g.qualification!=='SAME'||g.retained_proof_bytes!=='SAME')throw Error('CACHED_CLEAN_NOT_SAME');
  for(const s of [a,b])if(s.counts.PQ_FLAG_READING!==480||s.counts.PQ_PAIR_READING!==720||s.seeded_results!==0||s.readings.PQ_FLAG_READING[reading]!==480||s.readings.PQ_PAIR_READING[reading]!==720)throw Error('INPUT_DERIVATION_NOT_SAME');
  cases.push({reading,clean:a,prefilled:b,guard:id(reportPath),closure:'SAME',retained_proof_bytes:'SAME',reading_results:'DERIVED_ONLY'});
 }
 const record={scope:'GENERIC_PREFILL_QUALIFICATION_ONLY; NOT_V1_V2_CONFORM',qualification:'SAME',bindings:before,carrier:{original,clean:cold,used_terms:'SAME',used_facts_and_proofs:'SAME'},cases,qualification_runtime:prep.runtimeTransform,static_device_buffers:prep.static_device_allocations,active_V1:'NOT_STOPPED_OR_CHANGED',production_use:'NOT_EXECUTED; ordered V1/V2 remains separate',seal_scope:'CUSTODY_ONLY; NO_PROMOTION_OR_REPOSITORY_COMMIT'};
 write('QUALIFICATION.json',record);console.log(JSON.stringify({qualification:'SAME',record:id(path.join(out,'QUALIFICATION.json')),cases:cases.map(c=>({reading:c.reading,facts:c.clean.facts,clean_epochs:c.clean.epochs,prefilled_epochs:c.prefilled.epochs,retained_proof_bytes:c.retained_proof_bytes}))}));
}catch(e){write('STOP.json',{scope:'QUALIFICATION_ONLY',reason:e.message,events:events.length,conform:'NOT_RUN',active_V1:'NOT_STOPPED_OR_CHANGED'});throw e;}
