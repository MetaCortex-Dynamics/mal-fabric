// Generic runtime-storage qualification; frozen source and expected outputs untouched.
// Preparation only extracts sealed inputs. Only explicit `run` launches CUDA.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url));
const archive=path.resolve(here,'../evidence/first-tick-conform-v1-v2-001');
const runDir=path.join(here,'qualification_001'),inputs=path.join(runDir,'inputs');
const mode=process.argv[2];if(!['prepare','run'].includes(mode)||process.argv.length!==3)throw Error('prepare|run');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=p=>{const b=fs.readFileSync(p);return {path:p,bytes:b.length,sha256:hash(b)};};
const read=p=>JSON.parse(fs.readFileSync(p));
const check=(condition,label)=>{if(!condition)throw Error(label);};
const json=(p,value)=>fs.writeFileSync(p,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const manifestPath=path.join(archive,'CUSTODY_MANIFEST.json'),manifest=read(manifestPath);
const root='realization020/',par=root+'parallel_prefill_002/';
const oldQPath=path.join(archive,'files',par,'qualification_iterative_full/QUALIFICATION.json');
check(identity(oldQPath).sha256==='00E7AAB2A752830F01297D580905D9B3F717057159C4E7016A1C3558931F1A70','QUALIFIED_BASELINE_NOT_SAME');
const oldQ=read(oldQPath);
const runtime=path.join(here,'block_iterative_runtime.exe'),guard=path.join(here,'prefill_guard_runtime.mjs');
function extract(logical,dest){
 const found=manifest.entries.filter(e=>e.logical===logical);check(found.length===1,'ARCHIVE_IDENTITY '+logical);const e=found[0];
 const stored=fs.readFileSync(path.join(archive,e.stored));check(stored.length===e.storage.bytes&&hash(stored)===e.storage.sha256,'STORAGE_NOT_SAME '+logical);
 const raw=e.encoding==='gzip'?zlib.gunzipSync(stored):stored;check(raw.length===e.bytes&&hash(raw)===e.sha256,'ARCHIVED_BYTES_NOT_SAME '+logical);
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,raw,{flag:'wx'});return {logical,...identity(dest)};
}
const dirs={carrier:root+'carrier_prefill_001',this:root+'prefill_qualification_001/this_lowered',no:root+'prefill_qualification_001/no_lowered',overflow:root+'block_replay_qualification_inputs_001/overflow',deep_antecedent:root+'block_replay_qualification_inputs_001/deep_antecedent',deep_consequent:root+'block_replay_qualification_inputs_001/deep_consequent'};
if(mode==='prepare'){
 check(!fs.existsSync(runDir),'PRESERVE_EXISTING_QUALIFICATION');fs.mkdirSync(inputs,{recursive:true});const materialized=[];
 for(const [name,logical] of Object.entries(dirs))for(const file of ['source.mal','source-map.json','image.bin'])materialized.push(extract(logical+'/'+file,path.join(inputs,name,file)));
 materialized.push(extract(root+'carrier_prefill_001/readback.bin',path.join(inputs,'carrier/readback.bin')));
 const j17=path.resolve(here,'../j17_step_021/preflight');
 const j17Bound=['source.mal','source-map.json','image.bin','readback.bin'].map(file=>identity(path.join(j17,file)));
 json(path.join(runDir,'PREPARATION.json'),{scope:'GENERIC_RUNTIME_CAPACITY_QUALIFICATION_INPUTS',archive_manifest:identity(manifestPath),qualified_baseline:identity(oldQPath),runtime:identity(runtime),source:identity(path.join(here,'block_iterative_runtime.cu')),guard:identity(guard),telemetry:identity(path.join(here,'telemetry.inc')),driver:identity(fileURLToPath(import.meta.url)),materialized,j17_baseline:j17Bound,gpu_execution:'NOT_RUN'});
 console.log(JSON.stringify({preparation:identity(path.join(runDir,'PREPARATION.json')),members:materialized.length,gpu_execution:'NOT_RUN'}));
}else{
 const prep=read(path.join(runDir,'PREPARATION.json'));
 const bound=[prep.archive_manifest,prep.qualified_baseline,prep.runtime,prep.source,prep.guard,prep.telemetry,prep.driver,...prep.materialized,...prep.j17_baseline];
 const verify=()=>{for(const b of bound){const now=identity(b.path);check(now.bytes===b.bytes&&now.sha256===b.sha256,'CUSTODY_NOT_SAME '+b.path);}};
 verify();const out=path.join(runDir,'outputs');check(!fs.existsSync(out),'PRESERVE_PRIOR_EXECUTION');fs.mkdirSync(out);const events=[],cases=[];
 const exeOutput=label=>path.join(out,label+'.bin');
 function launch(label,exe,args,expectedExit=0,gpu=true){
  verify();let memory=null;if(gpu){const q=spawnSync('nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});check(q.status===0,'GPU_MEMORY_UNAVAILABLE');const line=q.stdout.trim(),parts=line.split(',').map(s=>s.trim());check(parts.length===2&&parts[0].includes('RTX 3070')&&Number(parts[1])>=1536,'GPU_MEMORY_BOUNDARY '+line);memory={device:parts[0],free_MiB:Number(parts[1])};}
  console.log(JSON.stringify({launch:label,memory}));const started=new Date().toISOString();
  const r=spawnSync(exe,args,{encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024,timeout:exe===process.execPath?undefined:120000});
  const e={label,executable:exe,args,started_utc:started,ended_utc:new Date().toISOString(),exit:r.status,error:r.error?.message??null,signal:r.signal,stdout:r.stdout??'',stderr:r.stderr??'',memory};json(path.join(out,label+'.execution.json'),e);events.push(e);verify();check(!r.error&&r.status===expectedExit,'EXECUTION_NOT_SAME '+label);return e;
 }
 function state(file){const b=fs.readFileSync(file),w=i=>b.readInt32LE(i*4);check(b.length>=32,'SHORT_READBACK');const nt=w(2),nf=w(3),tc=w(5),fc=w(6);check(w(0)===0x31524c47&&w(1)===1&&nt===4194304&&nf>=1&&nf<=4194304&&tc>=0&&tc<=nt&&fc>=0&&fc<=nf&&b.length===32+nt*40+nf*48,'READBACK_BOUNDS');return {identity:identity(file),error:w(4),terms:tc,facts:fc,epochs:w(7),term_capacity:nt,fact_capacity:nf,used_terms:hash(b.subarray(32,32+tc*40)),used_facts:hash(b.subarray(32+nt*40,32+nt*40+fc*48))};}
 function same(s,reference,raw){for(const k of ['error','terms','facts','epochs','used_terms','used_facts'])check(s[k]===reference[k],'ORDERED_BYTES_NOT_SAME '+k);if(raw)check(s.identity.sha256===reference.identity.sha256,'DEFAULT_RAW_NOT_SAME');}
 const reference=name=>name==='carrier'?oldQ.carrier.observed:oldQ.cases.find(c=>c.reading===name.toUpperCase()).clean;
 const image=name=>path.join(inputs,name,'image.bin'),map=name=>path.join(inputs,name,'source-map.json');
 function guardArgs(previous,next,readback,cap){return [guard,'--previous-map',map(previous),'--previous-image',image(previous),'--previous-readback',readback,'--next-map',map(next),'--next-image',image(next),'--fact-capacity',String(cap)];}
 try{
  for(const [label,arg] of [['zero','0'],['negative','-1'],['overflow','999999999999999999'],['nondecimal','1x'],['above_terms','4194305']]){const e=launch('cli_'+label,runtime,['--telemetry-layout','--fact-capacity',arg],1,false);check(/fact capacity/.test(e.stderr),'CLI_REFUSAL_NOT_SAME');}
  for(const name of ['carrier','this','no'])for(const cap of [2097152,16384,4194304]){const label=name+'_'+cap,file=exeOutput(label);launch(label,runtime,[image(name),file,'--fact-capacity',String(cap)]);const s=state(file);same(s,reference(name),cap===2097152);cases.push({label,comparison:'SAME',observed:s});}
  for(const name of ['this','no'])for(const cap of [2097152,16384]){const label=name+'_prefilled_'+cap,file=exeOutput(label),report=path.join(out,label+'.guard.json');launch(label,process.execPath,[...guardArgs('carrier',name,path.join(inputs,'carrier/readback.bin'),cap),'--run','--exe',runtime,'--output',file,'--compare',exeOutput(name+'_'+cap),'--report',report,'--timeout-ms','120000']);const s=state(file),r=read(report),reference=oldQ.cases.find(c=>c.reading===name.toUpperCase()).prefilled;same(s,reference,cap===2097152);check(r.qualification==='SAME'&&r.retained_proof_bytes==='SAME','RESUME_PROOFS_NOT_SAME');cases.push({label,comparison:'SAME',observed:s,guard:identity(report)});}
  for(const name of ['overflow','deep_antecedent','deep_consequent']){const label='regression_'+name,file=exeOutput(label),expected=name==='overflow'?0:2;launch(label,runtime,[image(name),file],expected);const s=state(file),r=oldQ.regression.find(c=>c.name===name).parallel;same(s,r,true);cases.push({label,comparison:'SAME',observed:s});}
  for(const cap of [5282,5281]){const label='fact_boundary_'+cap,file=exeOutput(label);launch(label,runtime,[image('carrier'),file,'--fact-capacity',String(cap)],cap===5282?0:2);const s=state(file);if(cap===5282)same(s,reference('carrier'),false);else{check(s.error===4&&s.facts===cap,'FACT_OVERFLOW_DID_NOT_REFUSE');const e=launch('failed_checkpoint_guard',process.execPath,guardArgs('carrier','carrier',file,16384),1,false);check(/checkpoint incomplete or failed/.test(e.stderr),'FAILED_CHECKPOINT_ADMITTED');}cases.push({label,comparison:'SAME',observed:s});}
  const tooSmall=launch('resume_target_too_small',runtime,[image('carrier'),exeOutput('resume_target_too_small'),path.join(inputs,'carrier/readback.bin'),String(read(map('carrier')).rules.length),'--fact-capacity','5281'],1,false);check(/checkpoint bounds or target fact capacity/.test(tooSmall.stderr)&&!fs.existsSync(exeOutput('resume_target_too_small')),'RESUME_CAPACITY_DID_NOT_REFUSE');
  const original=fs.readFileSync(path.join(inputs,'carrier/readback.bin')),corrupt=Buffer.from(original.subarray(0,64)),bad=path.join(out,'truncated_checkpoint.bin');fs.writeFileSync(bad,corrupt,{flag:'wx'});const trunc=launch('truncated_checkpoint',runtime,[image('carrier'),exeOutput('truncated_checkpoint_output'),bad,String(read(map('carrier')).rules.length)],1,false);check(/checkpoint byte count/.test(trunc.stderr)&&!fs.existsSync(exeOutput('truncated_checkpoint_output')),'TRUNCATED_CHECKPOINT_DID_NOT_REFUSE');
  for(const [label,prior,cap] of [['closed_shrink',exeOutput('carrier_4194304'),16384],['closed_grow',exeOutput('carrier_16384'),4194304]]){const file=exeOutput(label),report=path.join(out,label+'.guard.json');launch(label,process.execPath,[...guardArgs('carrier','carrier',prior,cap),'--run','--exe',runtime,'--output',file,'--compare',exeOutput('carrier_'+cap),'--report',report,'--timeout-ms','120000']);const s=state(file),r=read(report);check(r.qualification==='SAME'&&r.retained_proof_bytes==='SAME'&&s.epochs===reference('carrier').epochs+1&&s.used_terms===reference('carrier').used_terms&&s.used_facts===reference('carrier').used_facts,'CROSS_CAPACITY_PREFIX_NOT_SAME');cases.push({label,comparison:'SAME',observed:s,guard:identity(report)});}
  const j17Image=prep.j17_baseline.find(b=>path.basename(b.path)==='image.bin').path,j17Readback=prep.j17_baseline.find(b=>path.basename(b.path)==='readback.bin').path,j17Output=exeOutput('j17_default');launch('j17_default',runtime,[j17Image,j17Output]);const j17State=state(j17Output);same(j17State,state(j17Readback),true);cases.push({label:'j17_default',comparison:'SAME',observed:j17State,reference:identity(j17Readback)});
  json(path.join(runDir,'QUALIFICATION.json'),{scope:'GENERIC_RUNTIME_SIZED_FACT_STORAGE; NOT_WORLD_CONFORM',qualification:'SAME',preparation:identity(path.join(runDir,'PREPARATION.json')),cases,event_count:events.length,source_laws:'UNCHANGED',default_readback_ABI:'SAME',schedule:'SAME_ORDERED_USED_BYTES',resource_refusal:'SAME',production_run:'NOT_RUN'});console.log(JSON.stringify({qualification:identity(path.join(runDir,'QUALIFICATION.json')),cases:cases.length,verdict:'SAME'}));
 }catch(e){json(path.join(runDir,'STOP.json'),{reason:e.message,events:events.length,qualification:'NOT_SAME',production_run:'NOT_RUN'});throw e;}
}
