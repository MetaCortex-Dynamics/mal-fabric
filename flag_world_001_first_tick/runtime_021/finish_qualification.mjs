// Continue the bounded runtime qualification after host-disk refusal.
// Recheck all prior comparisons from losslessly retained bytes, then run only
// the uncompleted grow-resume and J17 cases. The first STOP record is unchanged.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url)),first=path.join(here,'qualification_001'),next=path.join(here,'qualification_002');
if(process.argv.length!==3||process.argv[2]!=='run')throw Error('Explicit run required');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:p,bytes:b.length,sha256:sha(b)};};
const read=p=>JSON.parse(fs.readFileSync(p)),check=(v,s)=>{if(!v)throw Error(s);};
const json=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
check(!fs.existsSync(next),'PRESERVE_CONTINUATION');fs.mkdirSync(next);
const prep=read(path.join(first,'PREPARATION.json')),q=read(prep.qualified_baseline.path),entries=fs.readFileSync(path.join(first,'COMPACTION.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const bound=[prep.archive_manifest,prep.qualified_baseline,prep.runtime,prep.source,prep.guard,prep.telemetry,prep.driver,...prep.materialized,...prep.j17_baseline];
function custody(){for(const b of bound){const a=id(b.path);check(a.bytes===b.bytes&&a.sha256===b.sha256,'CUSTODY_NOT_SAME '+b.path);}}
custody();const cases=[],events=[];
function archived(label){const matches=entries.filter(e=>path.basename(e.raw)===label+'.bin');check(matches.length===1,'ARCHIVED_RESULT '+label);const e=matches[0],storage=fs.readFileSync(e.stored);check(storage.length===e.storage.bytes&&sha(storage)===e.storage.sha256,'COMPRESSED_CUSTODY');const raw=zlib.gunzipSync(storage);check(raw.length===e.bytes&&sha(raw)===e.sha256,'DECOMPRESSED_CUSTODY');return {raw,identity:{path:e.stored,encoding:'gzip',bytes:e.bytes,sha256:e.sha256,storage:e.storage}};}
function state(raw,identity){check(raw.length>=32,'SHORT_READBACK');const w=i=>raw.readInt32LE(i*4),nt=w(2),nf=w(3),tc=w(5),fc=w(6);check(w(0)===0x31524c47&&w(1)===1&&nt===4194304&&nf>=1&&nf<=4194304&&tc>=0&&tc<=nt&&fc>=0&&fc<=nf&&raw.length===32+nt*40+nf*48,'READBACK_BOUNDS');return {identity,error:w(4),terms:tc,facts:fc,epochs:w(7),term_capacity:nt,fact_capacity:nf,used_terms:sha(raw.subarray(32,32+tc*40)),used_facts:sha(raw.subarray(32+nt*40,32+nt*40+fc*48))};}
function oldState(label){const a=archived(label);return state(a.raw,a.identity);}
function fileState(file){return state(fs.readFileSync(file),id(file));}
function same(a,b,raw=false){for(const k of ['error','terms','facts','epochs','used_terms','used_facts'])check(a[k]===b[k],'ORDERED_BYTES_NOT_SAME '+k);if(raw)check(a.identity.sha256===b.identity.sha256,'RAW_BYTES_NOT_SAME');}
function oldEvent(label,code){const file=path.join(first,'outputs',label+'.execution.json'),e=read(file);check(e.exit===code&&!e.error,'RETAINED_EXECUTION '+label);return {...e,record:id(file)};}
function recheck(){
 for(const label of ['zero','negative','overflow','nondecimal','above_terms']){const e=oldEvent('cli_'+label,1);check(/fact capacity/.test(e.stderr),'CLI_REFUSAL_NOT_SAME');events.push(e.record);}
 for(const name of ['carrier','this','no'])for(const cap of [2097152,16384,4194304]){const label=name+'_'+cap;oldEvent(label,0);const s=oldState(label),r=name==='carrier'?q.carrier.observed:q.cases.find(c=>c.reading===name.toUpperCase()).clean;same(s,r,cap===2097152);cases.push({label,comparison:'SAME',observed:s});}
 for(const name of ['this','no'])for(const cap of [2097152,16384]){const label=name+'_prefilled_'+cap;oldEvent(label,0);const s=oldState(label),r=q.cases.find(c=>c.reading===name.toUpperCase()).prefilled,guardPath=path.join(first,'outputs',label+'.guard.json'),g=read(guardPath);same(s,r,cap===2097152);check(g.qualification==='SAME'&&g.retained_proof_bytes==='SAME','PREFIX_NOT_SAME');cases.push({label,comparison:'SAME',observed:s,guard:id(guardPath)});}
 for(const name of ['overflow','deep_antecedent','deep_consequent']){const label='regression_'+name;oldEvent(label,name==='overflow'?0:2);const s=oldState(label);same(s,q.regression.find(c=>c.name===name).parallel,true);cases.push({label,comparison:'SAME',observed:s});}
 for(const cap of [5282,5281]){const label='fact_boundary_'+cap;oldEvent(label,cap===5282?0:2);const s=oldState(label);if(cap===5282)same(s,q.carrier.observed);else check(s.error===4&&s.facts===cap,'CAPACITY_REFUSAL_NOT_SAME');cases.push({label,comparison:'SAME',observed:s});}
 for(const [label,message] of [['failed_checkpoint_guard',/checkpoint incomplete or failed/],['resume_target_too_small',/checkpoint bounds or target fact capacity/],['truncated_checkpoint',/checkpoint byte count/]]){const e=oldEvent(label,1);check(message.test(e.stderr),'RESUME_REFUSAL_NOT_SAME');events.push(e.record);}
 oldEvent('closed_shrink',0);const shrink=oldState('closed_shrink'),sgPath=path.join(first,'outputs/closed_shrink.guard.json'),sg=read(sgPath);same(shrink,{...q.carrier.observed,epochs:q.carrier.observed.epochs+1});check(sg.qualification==='SAME'&&sg.retained_proof_bytes==='SAME','SHRINK_PREFIX_NOT_SAME');cases.push({label:'closed_shrink',comparison:'SAME',observed:shrink,guard:id(sgPath)});
 const stopped=read(path.join(first,'STOP.json')),failed=read(path.join(first,'outputs/closed_grow.execution.json'));check(stopped.reason==='EXECUTION_NOT_SAME closed_grow'&&failed.exit===1&&/output custody/.test(failed.stderr),'STOP_SCOPE_NOT_SAME');
}
function launch(label,exe,args){custody();const mem=spawnSync('nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true}),parts=mem.stdout.trim().split(',').map(x=>x.trim());check(mem.status===0&&parts.length===2&&parts[0].includes('RTX 3070')&&Number(parts[1])>=1536,'GPU_MEMORY_BOUNDARY');console.log(JSON.stringify({launch:label,free_MiB:Number(parts[1])}));const started=new Date().toISOString(),r=spawnSync(exe,args,{encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024,timeout:exe===process.execPath?undefined:120000}),e={label,exe,args,started_utc:started,ended_utc:new Date().toISOString(),exit:r.status,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??''};json(path.join(next,label+'.execution.json'),e);check(!r.error&&r.status===0,'EXECUTION_NOT_SAME '+label);custody();return e;}
try{
 recheck();const materialized=path.join(next,'carrier.small.prior.bin'),small=archived('carrier_16384');fs.writeFileSync(materialized,small.raw,{flag:'wx'});
 const carrier=path.join(first,'inputs/carrier'),grow=path.join(next,'closed_grow.bin'),guardReport=path.join(next,'closed_grow.guard.json');
 launch('closed_grow',process.execPath,[prep.guard.path,'--previous-map',path.join(carrier,'source-map.json'),'--previous-image',path.join(carrier,'image.bin'),'--previous-readback',materialized,'--next-map',path.join(carrier,'source-map.json'),'--next-image',path.join(carrier,'image.bin'),'--fact-capacity','4194304','--run','--exe',prep.runtime.path,'--output',grow,'--compare',path.join(carrier,'readback.bin'),'--report',guardReport,'--timeout-ms','120000']);
 const gs=fileState(grow),gr=read(guardReport);same(gs,{...q.carrier.observed,epochs:q.carrier.observed.epochs+1});check(gr.qualification==='SAME'&&gr.retained_proof_bytes==='SAME','GROW_PREFIX_NOT_SAME');cases.push({label:'closed_grow',comparison:'SAME',observed:gs,guard:id(guardReport)});
 const j17Image=prep.j17_baseline.find(b=>path.basename(b.path)==='image.bin'),j17Readback=prep.j17_baseline.find(b=>path.basename(b.path)==='readback.bin'),j17=path.join(next,'j17_default.bin');launch('j17_default',prep.runtime.path,[j17Image.path,j17]);const js=fileState(j17);same(js,fileState(j17Readback.path),true);cases.push({label:'j17_default',comparison:'SAME',observed:js,reference:j17Readback});
 json(path.join(next,'QUALIFICATION.json'),{scope:'GENERIC_RUNTIME_SIZED_FACT_STORAGE; NOT_WORLD_CONFORM',qualification:'SAME',preparation:id(path.join(first,'PREPARATION.json')),compaction:id(path.join(first,'COMPACTION.jsonl')),prior_stop:id(path.join(first,'STOP.json')),prior_stop_scope:'HOST_DISK_OUTPUT_REFUSAL; FAILED_OUTPUT_PRESERVED; NOT_CHECKPOINT',runtime:prep.runtime,source:prep.source,guard:prep.guard,driver:id(fileURLToPath(import.meta.url)),cases,refusal_cases:events,source_laws:'UNCHANGED',default_readback_ABI:'SAME',schedule:'SAME_ORDERED_USED_BYTES',resource_refusal:'SAME',production_run:'NOT_RUN'});
 console.log(JSON.stringify({qualification:id(path.join(next,'QUALIFICATION.json')),cases:cases.length,verdict:'SAME'}));
}catch(e){json(path.join(next,'STOP.json'),{reason:e.message,qualification:'NOT_SAME',production_run:'NOT_RUN'});throw e;}
