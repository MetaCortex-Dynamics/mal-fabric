// Execution/custody harness. All runtime transitions are source-owned .mal rules.
// Host services: exact input transport, SHA256, source-requested canonical order,
// and observation/comparison. This harness NEVER writes a committed world/link.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)), root=path.dirname(here);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
const read=p=>JSON.parse(fs.readFileSync(p));
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const json=v=>JSON.stringify(canonical(v));
const check=(x,s)=>{if(!x)throw Error(s);};
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const record=(p,v)=>write(p,JSON.stringify(v,null,2)+'\n');
const input={program:path.join(root,'j17_step_023/outputs/program.json'),runtime:path.join(root,'j17_step_023/outputs/fabric.successor.json'),world:path.join(root,'j17_step_023/outputs/committed.world.json')};
const expected={program:'6A2A2B384638C6983C20F708D059B6538AB4AAA9D1F468F460A961EBEF7FC529',runtime:'D41166EC3BC832AFA306D05E2F5E57E960FA635A1C4916A50381F3DB6A167C47',world:'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'};
const lower=path.join(root,'j17_step_021/tools/lower.mjs'), exe=path.join(root,'runtime_021/block_iterative_runtime.exe');
const sourcePath=path.join(here,'source/runtime_reentry.mal');
const qualification=path.join(root,'runtime_021/qualification_002/QUALIFICATION.json');
const out=path.join(here,process.argv[3]??'qualification_001');
check(process.argv[2]==='run'&&process.argv.length<=4,'usage: node qualify.mjs run [fresh-directory-name]');
check(path.dirname(out)===here,'OUTPUT_SCOPE');check(!fs.existsSync(out),'PRESERVE_PRIOR_EXECUTION');
for(const [k,p] of Object.entries(input))check(id(p).sha256===expected[k],'INPUT_NOT_SAME '+k);
check(id(exe).sha256==='9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06','RUNTIME_NOT_SAME');
check(read(qualification).qualification==='SAME','RUNTIME_QUALIFICATION');
const bound=[...Object.values(input),sourcePath,lower,exe,qualification,fileURLToPath(import.meta.url)].map(id);
const verify=()=>{for(const x of bound)check(id(x.path).sha256===x.sha256,'CUSTODY_NOT_SAME '+x.path);};
fs.mkdirSync(out);record(path.join(out,'INPUTS.json'),{scope:'RUNTIME_REENTRY_FRAGMENT_ONLY; NOT_FOLD_OR_WORLD_COMMIT',bound});
const source=fs.readFileSync(sourcePath,'utf8'), aliases=[`rr_program=${input.program}`,`rr_state=${input.runtime}`];
const events=[], observations=[];
const launch=(label,command,args,gpu=false)=>{
 verify();let memory=null;
 if(gpu){const q=spawnSync('nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});check(q.status===0,'GPU_QUERY');const a=q.stdout.trim().split(',').map(s=>s.trim());check(a[0].includes('RTX 3070')&&Number(a[1])>=1536,'GPU_MEMORY '+q.stdout);memory=q.stdout.trim();}
 console.log(JSON.stringify({launch:label,gpu,memory}));
 const started=new Date().toISOString(),r=spawnSync(command,args,{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024,timeout:gpu?180000:60000});
 const e={label,command,args,started,ended:new Date().toISOString(),exit:r.status,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??'',memory};
 record(path.join(out,label+'.execution.json'),e);events.push(e);verify();check(!r.error&&r.status===0,'EXECUTION_STOP '+label+' '+e.stderr);return e;
};
function lowerRun(label,text,bindings){
 const file=path.join(out,label+'.mal'),dir=path.join(out,label);write(file,text);
 launch(label+'_lower',process.execPath,[lower,file,dir,'-',...bindings]);
 launch(label+'_gpu',exe,[path.join(dir,'image.bin'),path.join(dir,'readback.bin'),'--fact-capacity','262144'],true);
 return dir;
}
function observation(dir){
 const r=openReadback(dir),tags=['RR_EGRESS_CLOSED','RR_BUFFER_RETAINED','RR_NEXT_PAYLOAD','RR_RUNTIME_CANDIDATE','RR_COMPLETE','RR_RUNTIME_UNIQUE','RR_EXCLUDED','RR_UNSUPPORTED'];
 const counts=Object.fromEntries(tags.map(t=>[t,r.predicate(t).length]));
 const candidates=r.predicate('RR_RUNTIME_CANDIDATE').map(f=>{const n=r.node(f.term);return r.value(n.c[n.c.length-1]);});
 const result={directory:dir,readback:id(path.join(dir,'readback.bin')),image:id(path.join(dir,'image.bin')),error:r.error,facts:r.count,terms:r.terms,epochs:r.epochs,counts,candidates};
 const forbidden=['COMMITTED_WORLD','CURRENT_FIELD','COMMITTED_LINK','FOLD_HELD','FOLD_MOVED'];
 for(const tag of forbidden)check(r.predicate(tag).length===0,'OUTSIDE_FRAGMENT '+tag);
 observations.push({...result,candidates:candidates.map(v=>({bytes:Buffer.byteLength(json(v)),sha256:sha(Buffer.from(json(v)))}))});
 return {r,result};
}
function services(r){
 const rows=[],seen=new Set(),oldHash=new Set(r.predicate('RR_HASH').map(f=>json(r.value(r.node(f.term).c[1])))),oldSort=new Set(r.predicate('RR_SORT').map(f=>{const n=r.node(f.term);return json([r.value(n.c[1]),r.value(n.c[2])]);}));
 for(const f of r.predicate('GPU_HASH_REQUEST')){const n=r.node(f.term),v=r.value(n.c[3]),key=json(v);if(oldHash.has(key)||seen.has('H'+key))continue;seen.add('H'+key);rows.push(['HASH',v,sha(Buffer.from(key)).toLowerCase()]);}
 for(const f of r.predicate('GPU_SORT_REQUEST')){const n=r.node(f.term),v=r.value(n.c[3]),field=r.value(n.c[4]),key=json([v,field]);if(oldSort.has(key)||seen.has('S'+key))continue;seen.add('S'+key);check(Array.isArray(v)&&typeof field==='string','SORT_SHAPE');const value=x=>field===''?x:x[field];for(const x of v)check(typeof value(x)==='string','SORT_KEY');rows.push(['SORT',v,field,[...v].sort((a,b)=>Buffer.compare(Buffer.from(value(a)),Buffer.from(value(b))))]);}
 return rows;
}
let text=source,bindings=[...aliases],final;
try{
 for(let i=0;i<7;i++){
  const dir=lowerRun('stage'+i,text,bindings),observed=observation(dir),rows=services(observed.r);
  console.log(JSON.stringify({stage:i,...observed.result.counts,facts:observed.r.count,requests:rows.length}));
  if(!rows.length){final=observed.result;break;}
  const alias='svc'+i,file=path.join(out,alias+'.json');write(file,JSON.stringify(rows));bindings.push(alias+'='+file);
  text+='\n@readonly input RR_IMPORT_'+i+' := "'+alias+':";\nlaw RR_IMPORT_'+i+' := IF THIS(RR_IMPORT_'+i+',ARRAY(rows)) THEN THIS(RR_SERVICE_ROWS,rows);\n';
 }
 check(final,'SERVICE_CLOSURE_NOT_REACHED');check(final.candidates.length===1&&final.counts.RR_COMPLETE===1&&final.counts.RR_RUNTIME_UNIQUE===1,'FRAGMENT_INCOMPLETE');
 const candidate=final.candidates[0],snapshot=read(input.runtime),program=read(input.program);
 check(final.counts.RR_NEXT_PAYLOAD===18&&final.counts.RR_EGRESS_CLOSED===18&&final.counts.RR_BUFFER_RETAINED===6,'INVENTORY_NOT_SAME');
 check(Object.keys(candidate.payload_states).length===18,'PAYLOAD_INVENTORY');
 const digest=v=>sha(Buffer.from(json(v))).toLowerCase();
 for(const [cell,payload] of Object.entries(candidate.payload_states)){
  const ref=digest(snapshot.payload_states[cell].result),receipt=digest(['PAYLOAD_DISCHARGED',cell,digest(ref)]);
  check(payload.phase==='DISCHARGED'&&payload.result_ref===ref&&payload.discharge_receipt===receipt,'PAYLOAD_DERIVATION_NOT_SAME '+cell);
  check(payload.frame===null&&payload.result===null&&payload.admission_receipt===null&&payload.completion_evidence.length===0,'DISCHARGE_CUSTODY_SHAPE');
 }
 check(json(candidate.pending_input_buffers)===json(snapshot.pending_input_buffers),'BUFFER_RETENTION_NOT_SAME');
 check(json(candidate.route_states)===json(snapshot.route_states),'ROUTE_CUSTODY_NOT_SAME');
 check(candidate.pending_admissions.length===0&&candidate.outstanding_obligations.length===0,'NEW_ADMISSION_OR_OBLIGATION');
 check(candidate.receipts.length===snapshot.receipts.length+18,'TRANSITION_RECEIPT_COUNT');
 const oldReceipts=new Map(snapshot.receipts.map(x=>[x.receipt_id,json(x)]));for(const r of candidate.receipts)if(oldReceipts.has(r.receipt_id)){check(json(r)===oldReceipts.get(r.receipt_id),'OLD_RECEIPT_CHANGED');oldReceipts.delete(r.receipt_id);}check(oldReceipts.size===0,'OLD_RECEIPT_LOST');
 const expectedReceiptUnion=new Map(snapshot.receipts.map(r=>[r.receipt_id,r]));
 for(const cell of Object.keys(snapshot.payload_states)){
  const payload_digest=digest(['COMPLETED','DISCHARGED']),receipt_id=digest(['PAYLOAD_TRANSITION',cell,payload_digest]);
  expectedReceiptUnion.set(receipt_id,{kind:'PAYLOAD_TRANSITION',payload_digest,receipt_id,subject_id:cell});
 }
 const expectedReceipts=[...expectedReceiptUnion.values()].sort((a,b)=>Buffer.compare(Buffer.from(a.receipt_id),Buffer.from(b.receipt_id)));
 check(json(candidate.receipts)===json(expectedReceipts),'TRANSITION_RECEIPT_UNION_NOT_SAME');
 write(path.join(out,'uncommitted.runtime.json'),json(candidate));
 const replay=path.join(out,'replay');fs.mkdirSync(replay);write(path.join(replay,'source-map.json'),fs.readFileSync(path.join(final.directory,'source-map.json')));
 launch('replay_gpu',exe,[path.join(final.directory,'image.bin'),path.join(replay,'readback.bin'),'--fact-capacity','262144'],true);
 check(id(path.join(replay,'readback.bin')).sha256===final.readback.sha256,'REPLAY_NOT_SAME');
 const tests=[{name:'actual_g2',verdict:'IF_THEN',payloads_discharged:18,buffers_retained:6,new_evaluations:0,new_arrivals:0},{name:'raw_readback_replay',verdict:'IF_THEN',comparison:'SAME'}];
 // Negative fixtures are test inputs only, never current state or promoted bytes.
 const route=program.routes[0],broken=structuredClone(snapshot);
 delete broken.route_states[route.route_id];
 broken.payload_states[route.source_cell].completion_evidence=broken.payload_states[route.source_cell].completion_evidence.filter(x=>x.route_id!==route.route_id);
 const negative=path.join(out,'missing_disposition.input.json');write(negative,json(broken));
 const ndir=lowerRun('missing_disposition',text,bindings.map(s=>s.startsWith('rr_state=')?'rr_state='+negative:s)),n=observation(ndir).result;
 check(n.candidates.length===0&&n.counts.RR_COMPLETE===0&&n.counts.RR_EGRESS_CLOSED===17,'MISSING_DISPOSITION_NOT_WITHHELD');
 tests.push({name:'missing_disposition',verdict:'IF_THEN',withheld_source:route.source_cell,closed_other_cells:17,runtime_candidate:'WITHHELD'});
 const overconnected=structuredClone(snapshot),extra=structuredClone(overconnected.pending_input_buffers[0].arrived_values.LEFT[0]);
 // Exact retransmissions deduplicate by (route_id,digest(value)); this must be
 // a distinguished arrival, not the same arrival repeated in serialization.
 extra.route_id='FIXTURE_DISTINCT_ROUTE';overconnected.pending_input_buffers[0].arrived_values.LEFT.push(extra);
 const malformed=path.join(out,'overconnected_buffer.input.json');write(malformed,json(overconnected));
 const mdir=lowerRun('overconnected_buffer',text,bindings.map(s=>s.startsWith('rr_state=')?'rr_state='+malformed:s)),m=observation(mdir).result;
 check(m.candidates.length===0&&m.counts.RR_RUNTIME_UNIQUE===0&&m.counts.RR_BUFFER_RETAINED===5,'MALFORMED_BUFFER_NOT_WITHHELD');
 tests.push({name:'overconnected_buffer',verdict:'IF_THEN',retained_other_buffers:5,runtime_candidate:'WITHHELD'});
 const reorderedProgram=structuredClone(program);reorderedProgram.cells.reverse();reorderedProgram.routes.reverse();
 const permuted=path.join(out,'permuted_program.input.json');write(permuted,json(reorderedProgram));
 const pdir=lowerRun('permuted_program',text,bindings.map(s=>s.startsWith('rr_program=')?'rr_program='+permuted:s)),p=observation(pdir).result;
 check(p.candidates.length===1&&json(p.candidates[0])===json(candidate),'ENUMERATION_NOT_SAME');
 tests.push({name:'reversed_program_enumeration',verdict:'IF_THEN',comparison:'SAME'});
 verify();record(path.join(out,'QUALIFICATION.json'),{scope:'J17_RUNTIME_REENTRY_FRAGMENT_ONLY',verdict:'IF_THEN',tests,inputs:bound,source:id(sourcePath),candidate:id(path.join(out,'uncommitted.runtime.json')),observations,replay:id(path.join(replay,'readback.bin')),fold_realization:'PENDING',world_successor:'NOT_PRODUCED',link_3:'NOT_COMMITTED',promotion:'NOT_PERFORMED',push:'NOT_PERFORMED'});
 console.log(JSON.stringify({record:id(path.join(out,'QUALIFICATION.json')),scope:'RUNTIME_FRAGMENT_ONLY',verdict:'IF_THEN'}));
}catch(e){record(path.join(out,'STOP.json'),{scope:'RUNTIME_FRAGMENT_ONLY',reason:e.message,events:events.length,observations,world_successor:'NOT_PRODUCED',link_3:'NOT_COMMITTED'});throw e;}
