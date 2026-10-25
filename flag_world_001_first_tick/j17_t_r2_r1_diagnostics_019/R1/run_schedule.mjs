// Scheduling-only coordinator. Native construction and observation remain in run_batch.mjs.
// No retries, child termination, source mutation, field selection, or receipt computation.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';

const self=fileURLToPath(import.meta.url),here=path.dirname(self);
const [mode,name,...extra]=process.argv.slice(2);
const need=(x,m)=>{if(!x)throw Error(m);};
need(['prepare','benchmark','continue','finalize'].includes(mode)&&name==='run_003'&&!extra.length,'CLI_SCOPE');
const out=path.join(here,name),runner=path.join(here,'run_batch.mjs');
const manifestPath=path.join(out,'SCHEDULING_BINDING.json');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const save=(p,o)=>fs.writeFileSync(p,JSON.stringify(o,null,2)+'\n',{flag:'wx'});
const key=p=>path.resolve(p).replaceAll('\\','/').toLowerCase();
const now=()=>new Date().toISOString();
const GiB=1024**3,MiB=1024**2,logLimit=1024**2;
function id(p){
 const f=fs.openSync(p,'r'),h=crypto.createHash('sha256'),b=Buffer.allocUnsafe(MiB);let bytes=0,n;
 try{while((n=fs.readSync(f,b,0,b.length,null))>0){h.update(b.subarray(0,n));bytes+=n;}}
 finally{fs.closeSync(f);}
 return {path:path.resolve(p),bytes,sha256:h.digest('hex').toUpperCase()};
}
function check(x){const a=id(x.path);need(a.sha256===x.sha256&&a.bytes===x.bytes,'CUSTODY_NOT_SAME '+x.path);return a;}
function boundCheck(xs){for(const x of xs)check(x);}
const batchRecord=i=>path.join(out,'BATCH_'+String(i).padStart(3,'0')+'.json');
const nativeLog=i=>path.join(out,'batch_'+String(i).padStart(3,'0')+'.gpu.execution.json');
function nativeTiming(i){
 const p=nativeLog(i),x=read(p),start=Date.parse(x.started),end=Date.parse(x.ended);
 need(x.status===0&&x.error===null&&x.gpu===true&&Number.isFinite(start)&&end>=start,'NATIVE_EXECUTION_RECORD '+i);
 return {batch:i,record:id(p),started:x.started,ended:x.ended,start_ms:start,end_ms:end,duration_ms:end-start};
}
if(mode==='prepare'){
 need(fs.statSync(out).isDirectory(),'RUN_DIRECTORY_REQUIRED');
 need(!fs.existsSync(manifestPath),'PRESERVE_SCHEDULING_BINDING');
 const inputsPath=path.join(out,'INPUTS.json'),inputs=id(inputsPath);
 need(inputs.sha256==='829F8EAEE18F5D278737BB7C15F3E94E5F45F24E4DF089DC30589C335504245F','ORIGINAL_INPUTS_IDENTITY');
 need(id(runner).sha256==='14E6B7B682D038000D82BC4BA2EBF627161680D600AA077AFDE5631D8AE92B11','BATCH_EXECUTOR_IDENTITY');
 const original=read(inputsPath).bound;need(Array.isArray(original)&&original.length>0,'ORIGINAL_BINDING_REQUIRED');boundCheck(original);
 const records=new Map(original.map(x=>[key(x.path),x]));
 const named=[self,runner,process.execPath,path.join(here,'run_indexed.mjs'),path.join(here,'observe_indexed.mjs'),path.join(here,'source/list_parts_index.mal'),inputsPath,
  ...['SCHEDULING_PAUSE_RESERVATION.json','SCHEDULING_PAUSE_RELEASE.json','STOP_sweep.json','NATIVE_INVENTORY.json','COVERAGE.json','QUALIFICATION.json','PILOT_ORIGINAL_EQUIVALENCE.json'].map(x=>path.join(out,x)),
  batchRecord(0),batchRecord(1),nativeLog(0),nativeLog(1)];
 for(const p of named){const x=id(p),previous=records.get(key(p));need(!previous||previous.sha256===x.sha256&&previous.bytes===x.bytes,'DUPLICATE_BINDING_NOT_SAME');records.set(key(p),x);}
 const baseline=[0,1].map(i=>{const b=read(batchRecord(i));need(b.verdict==='IF_THEN'&&b.batch===i&&b.inputs.length===4,'COMPLETED_SEQUENTIAL_PREFIX_REQUIRED');return nativeTiming(i);});
 const bound=[...records.values()];boundCheck(bound);
 save(manifestPath,{schema:'R1SchedulingBinding019',verdict:'IF_THEN',created:now(),run:name,
  scope:'Execution scheduling only. Original native inputs, source, grouping, observation and receipts remain unchanged. No promotion or world mutation.',
  bound,original_inputs:inputs,coordinator:id(self),executor:id(runner),node:id(process.execPath),
  baseline_native:baseline,benchmark_batches:[2,3],continuation_batches:Array.from({length:26},(_,i)=>i+4),
  maximum_children:2,log_limit_bytes_per_stream:logLimit,
  resource_floor:{one:{host_free_bytes:3*GiB,gpu_free_bytes:2.5*GiB},two:{host_free_bytes:6*GiB,gpu_free_bytes:4.5*GiB}},
  benefit_rule:'Two contexts are eligible only when the completed batch002/003 native wall envelope is strictly less than batch000 duration plus batch001 duration. This is a scoped cohort comparison, not a universal speedup claim.',
  resource_scope:'Free-memory reservation and absence of the named qualified runtime before each idle cohort; WDDM process listing is observational and does not assert exclusive CUDA ownership.',
  worldline:'UNCHANGED',promotion:'NOT_PERFORMED'});
 console.log(JSON.stringify({verdict:'IF_THEN',mode,binding:id(manifestPath),launched:0}));
 process.exit(0);
}

const manifest=read(manifestPath),schedule=id(manifestPath);
need(manifest.schema==='R1SchedulingBinding019'&&manifest.run===name&&manifest.maximum_children===2,'SCHEDULING_BINDING_SCOPE');
const bound=[...manifest.bound,schedule];
for(const p of [self,runner,process.execPath])need(manifest.bound.some(x=>key(x.path)===key(p)),'REQUIRED_EXECUTION_BINDING '+p);
boundCheck(bound);
const selfId=id(self),runnerId=id(runner);
function query(command,args){
 const r=spawnSync(command,args,{encoding:'utf8',windowsHide:true,timeout:15000,maxBuffer:512*1024});
 return {command,args,status:r.status,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??''};
}
function resources(){
 const memory=query('nvidia-smi',['-i','0','--query-gpu=index,memory.free,memory.total','--format=csv,noheader,nounits']);
 need(memory.status===0&&!memory.error,'GPU_MEMORY_TELEMETRY_REQUIRED');
 const values=memory.stdout.trim().split(/\s*,\s*/).map(Number);
 need(values.length===3&&values[0]===0&&values.slice(1).every(x=>Number.isFinite(x)&&x>=0),'GPU_MEMORY_TELEMETRY_SHAPE');
 const processes=query('nvidia-smi',['--query-compute-apps=pid,process_name,used_memory','--format=csv,noheader,nounits']);
 const qualified=query('powershell.exe',['-NoProfile','-NonInteractive','-Command',"@(Get-Process -Name block_iterative_runtime -ErrorAction SilentlyContinue | Select-Object Id,ProcessName) | ConvertTo-Json -Compress"]);
 need(qualified.status===0&&!qualified.error,'QUALIFIED_RUNTIME_PROCESS_SNAPSHOT_REQUIRED');
 const parsed=qualified.stdout.trim()?JSON.parse(qualified.stdout):[],active=Array.isArray(parsed)?parsed:[parsed];
 need(active.length===0,'QUALIFIED_RUNTIME_ACTIVE_NO_DISPATCH');
 return {observed:now(),host_free_bytes:os.freemem(),gpu_free_bytes:values[1]*MiB,gpu_total_bytes:values[2]*MiB,memory,reported_gpu_processes:processes,qualified_runtime_processes:qualified,qualified_runtime_count:active.length,scope:manifest.resource_scope};
}
function fits(r,n){const f=manifest.resource_floor[n===2?'two':'one'];return r.host_free_bytes>=f.host_free_bytes&&r.gpu_free_bytes>=f.gpu_free_bytes;}
function boundedLog(p){
 const fd=fs.openSync(p,'wx');let seen=0,written=0;
 return {write(chunk){const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);seen+=b.length;const n=Math.min(b.length,Math.max(0,logLimit-written));if(n){fs.writeSync(fd,b,0,n);written+=n;}},close(){fs.closeSync(fd);return {...id(p),seen_bytes:seen,written_bytes:written,omitted_bytes:seen-written};}};
}
function child(label,args,event){
 const stdout=boundedLog(path.join(out,label+'.stdout.log')),stderr=boundedLog(path.join(out,label+'.stderr.log'));
 const started=now();
 return new Promise(resolve=>{
  let error=null;
  const p=spawn(process.execPath,['--max-old-space-size=8192',runner,...args],{cwd:here,windowsHide:true,stdio:['ignore','pipe','pipe']});
  event({type:'CHILD_START',label,pid:p.pid??null,started,args});
  p.stdout.on('data',x=>stdout.write(x));p.stderr.on('data',x=>stderr.write(x));
  p.on('error',e=>{error=e.message;});
  p.on('close',(status,signal)=>{
   const record={schema:'R1SchedulingChild019',label,command:process.execPath,args:['--max-old-space-size=8192',runner,...args],pid:p.pid??null,started,ended:now(),status,signal,error,stdout:stdout.close(),stderr:stderr.close(),coordinator:selfId,executor:runnerId,execution_schedule:schedule};
   const target=path.join(out,label+'.execution.json');save(target,record);event({type:'CHILD_END',label,status,signal,error,record:id(target)});resolve(record);
  });
 });
}
function completedBatch(i){
 const p=batchRecord(i),b=read(p);need(b.verdict==='IF_THEN'&&b.batch===i&&b.inputs.length===4,'BATCH_COMPLETION_REQUIRED '+i);
 need(b.executor?.sha256===runnerId.sha256&&key(b.executor.path)===key(runner)&&b.execution_schedule?.sha256===schedule.sha256&&key(b.execution_schedule.path)===key(manifestPath),'BATCH_SCHEDULE_CUSTODY '+i);
 check(b.executor);check(b.execution_schedule);check(b.observations);check(b.readback);
 return {batch:i,record:id(p),native:nativeTiming(i),inputs:b.inputs.map(x=>x.term),observations:b.observations,readback:b.readback};
}
const phase='SCHEDULE_'+mode.toUpperCase(),resultPath=path.join(out,phase+'.json');
need(!fs.existsSync(resultPath),'PRESERVE_PHASE_RESULT');
const eventsPath=path.join(out,phase+'.events.jsonl'),events=fs.openSync(eventsPath,'wx');
const event=o=>fs.writeSync(events,JSON.stringify({time:now(),...o})+'\n');
save(path.join(out,phase+'.START.json'),{mode,started:now(),coordinator:selfId,executor:runnerId,execution_schedule:schedule});
let result;
async function cohort(indices,requireTwo=false){
 boundCheck(bound);const r=resources();need(fits(r,indices.length),'RESOURCE_FLOOR_NO_DISPATCH');
 need(!requireTwo||indices.length===2,'TWO_CONTEXT_BENCHMARK_REQUIRED');
 for(const i of indices)need(!fs.existsSync(batchRecord(i))&&!fs.existsSync(path.join(out,'batch_'+String(i).padStart(3,'0'))),'PRESERVE_BATCH_ARTIFACTS '+i);
 event({type:'COHORT_DISPATCH',indices,resources:r});
 const started=now();
 // Await every started child even when another child fails; never terminate a child.
 const settled=await Promise.allSettled(indices.map(i=>Promise.resolve().then(()=>child('schedule_batch_'+String(i).padStart(3,'0'),['batch',name,String(i)],event))));
 const children=[];let launchErrors=0;
 for(let n=0;n<settled.length;n++){
  const x=settled[n];
  if(x.status==='fulfilled')children.push(x.value);
  else{launchErrors++;event({type:'CHILD_LAUNCH_REJECTION',batch:indices[n],reason:x.reason?.message??String(x.reason)});}
 }
 need(launchErrors===0,'CHILD_LAUNCH_STOP_AFTER_COHORT_DRAIN');
 need(children.every(x=>x.status===0&&x.error===null),'CHILD_EXECUTION_STOP_AFTER_COHORT_DRAIN');
 boundCheck(bound);const batches=indices.map(completedBatch),ended=now();
 return {indices,started,ended,resources:r,children:children.map(x=>id(path.join(out,x.label+'.execution.json'))),batches};
}
try{
 if(mode==='benchmark'){
  const c=await cohort([2,3],true),timings=c.batches.map(x=>x.native);
  const envelope=Math.max(...timings.map(x=>x.end_ms))-Math.min(...timings.map(x=>x.start_ms));
  const baseline=manifest.baseline_native.map(x=>{check(x.record);return nativeTiming(x.batch);});
  const sequential=baseline.reduce((n,x)=>n+x.duration_ms,0),sum=timings.reduce((n,x)=>n+x.duration_ms,0);
  const overlap=Math.max(0,Math.min(...timings.map(x=>x.end_ms))-Math.max(...timings.map(x=>x.start_ms)));
  const eligible=envelope<sequential&&overlap>0;
  result={verdict:'IF_THEN',mode,cohort:c,baseline_native:baseline,baseline_sequential_native_ms:sequential,benchmark_native_envelope_ms:envelope,benchmark_native_duration_sum_ms:sum,native_overlap_ms:overlap,baseline_to_envelope_ratio:sequential/envelope,eligible_contexts:eligible?2:1,comparison:eligible?'IF_THEN':'NOT-SAME',scope:'Observed scheduling-only comparison of batches002/003 envelope with sequential batches000/001; cohorts differ. No native input or semantic result is changed.'};
 }else if(mode==='continue'){
  const benchmarkPath=path.join(out,'SCHEDULE_BENCHMARK.json'),b=read(benchmarkPath);
  need(b.verdict==='IF_THEN'&&b.execution_schedule.sha256===schedule.sha256&&[1,2].includes(b.eligible_contexts),'BENCHMARK_COMPLETION_REQUIRED');
  check(b.execution_schedule);for(const i of [2,3])completedBatch(i);
  const expected=b.benchmark_native_envelope_ms<b.baseline_sequential_native_ms&&b.native_overlap_ms>0?2:1;
  need(b.eligible_contexts===expected,'BENCHMARK_SELECTION_NOT_SAME');
  const cohorts=[];let next=4;
  while(next<30){
   const r=resources();need(fits(r,1),'RESOURCE_FLOOR_NO_DISPATCH');
   const width=expected===2&&fits(r,2)&&next+1<30?2:1;
   cohorts.push(await cohort(Array.from({length:width},(_,i)=>next+i)));next+=width;
  }
  result={verdict:'IF_THEN',mode,benchmark:id(benchmarkPath),eligible_contexts:expected,cohorts,scope:'Remaining original batches004..029 only; each idle cohort uses at most the measured eligible context count and may fall back to one for memory reservations.'};
 }else{
  const continuationPath=path.join(out,'SCHEDULE_CONTINUE.json'),c=read(continuationPath);
  need(c.verdict==='IF_THEN'&&c.execution_schedule.sha256===schedule.sha256,'CONTINUATION_COMPLETION_REQUIRED');check(c.execution_schedule);
  for(let i=2;i<30;i++)completedBatch(i);
  const r=resources();event({type:'FINALIZE_DISPATCH',resources:r});
  const x=await child('schedule_finalize',['finalize',name],event);
  need(x.status===0&&x.error===null,'FINALIZE_EXECUTION_STOP');boundCheck(bound);
  const p=path.join(out,'RUN_RECORD_R1.json'),run=read(p);
  need(run.verdict==='IF_THEN'&&run.inputs===120&&run.batches.length===30&&run.execution_schedule.sha256===schedule.sha256&&run.executor.sha256===runnerId.sha256,'FINAL_RUN_RECORD_REQUIRED');
  need(new Set(run.batches.flatMap(x=>x.inputs.map(y=>y.term))).size===120,'FULL_INPUT_COVERAGE');
  result={verdict:'IF_THEN',mode,continuation:id(continuationPath),execution:id(path.join(out,'schedule_finalize.execution.json')),run_record:id(p),scope:'Final record custody and original120 input identities only; no semantic recomputation.'};
 }
 boundCheck(bound);
}catch(error){result={verdict:'MAYBE',mode,reason:error.message,scope:'No further child was dispatched after the detected stop. Started cohorts are awaited without child termination.'};process.exitCode=1;}
finally{fs.closeSync(events);}
result={...result,ended:now(),events:id(eventsPath),coordinator:selfId,executor:runnerId,execution_schedule:schedule,worldline:'UNCHANGED',promotion:'NOT_PERFORMED'};
save(resultPath,result);console.log(JSON.stringify({verdict:result.verdict,mode,result:id(resultPath),eligible_contexts:result.eligible_contexts,reason:result.reason}));
