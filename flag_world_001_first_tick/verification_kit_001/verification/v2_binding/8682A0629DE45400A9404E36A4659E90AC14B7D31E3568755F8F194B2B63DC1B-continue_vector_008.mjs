// Generic, additive continuation orchestration only. Invoke deliberately:
//   node continue_vector.mjs V1 --start-stage 1
// No expected-output file, world transition, placement, or admission is supplied.
// A completed source fact is reported, not declared CONFORM by this driver.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const isolated=path.dirname(fileURLToPath(import.meta.url));
const root=path.dirname(isolated);
const [vector,...args]=process.argv.slice(2);
let start;
for(let i=0;i<args.length;i++){
 if(args[i]!=='--start-stage'||start!==undefined||i+1===args.length)throw Error('usage: continue_vector.mjs V1|V2 --start-stage N');
 start=Number(args[++i]);
}
if(vector!=='V1'||!Number.isInteger(start)||start<1||start>99)throw Error('isolated V1 and completed start stage required');
const work=path.join(isolated,'vectors_repeat_008',vector);
const stagePath=n=>path.join(work,'stage'+String(n).padStart(2,'0'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const hash=p=>sha(fs.readFileSync(p));
const equalHash=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.toUpperCase()===b.toUpperCase();
const diagnosticCounts=s=>Object.fromEntries(Object.entries(s.counts).filter(([k])=>/^(VC_CORRESPONDENCE_COMPLETE|VC_ALL_ANCHORS|VD_INITIAL|VD_FIELD_TRANSPORT|VD_ALL_LIFTS|VD_OFFERED_READING|VO_(PAIR$|PAIR_SEQUENCE|ALL_CONTEXTS|PROPOSAL$|DECISION$|OPERAND|COMPARATOR|FIXTURE_PARENT)|P20_CELL_DRC|I20_(FRAME$|CELL_RESULT|RUNTIME_RECEIPT|SUCCESSOR_JSON)|VCOM_(RETURN|ALL_RESULTS|RESULT_DIFFER)|COMMITTED_VECTOR)/.test(k)));
const emit=x=>console.log(JSON.stringify(x));
function custody(r){
 if(!r||!r.path||!equalHash(hash(r.path),r.sha256)||fs.statSync(r.path).size!==(r.size??r.bytes))throw Error('custody NOT_SAME: '+r?.path);
}
function toolsCustody(){for(const r of read(path.join(isolated,'CONTINUATION_008_BINDINGS.json')).members)custody(r);}
function arrayFile(p){const v=read(p);if(!Array.isArray(v))throw Error('array observation required: '+p);return v;}
function bounded(n,max,label){if(!Number.isInteger(n)||n<0||n>max)throw Error(label+' exceeds bounded inventory: '+n);return n;}
function nonemptyInput(build,test,expected){
 for(const [alias,r] of Object.entries(build.inputs))if(test(alias)){
  const n=arrayFile(r.path).length;
  if(n!==0&&n!==expected)throw Error('prior '+alias+' inventory has unexpected extent '+n);
  if(n)return true;
 }
 return false;
}
function inspect(n){
 toolsCustody();
 const dir=stagePath(n),build=read(path.join(dir,'BUILD.json'));
 if(build.vector!==vector||build.stage!==n)throw Error('stage identity NOT_SAME');
 // All three completion products are required. A partial GPU write is preserved.
 const execution=read(path.join(dir,'EXECUTION.json'));
 const status=read(path.join(dir,'STATUS.json'));
 const hashCustody=read(path.join(dir,'hash','HASH_CUSTODY.json'));
 const deltaCustody=read(path.join(dir,'hash','DELTA_CUSTODY.json'));
 if(execution.vector!==vector||execution.stage!==n||execution.exit_code!==0||execution.error!==null||status.error!==0)throw Error('completed source execution required');
 const guard=read(path.join(dir,'PREFILL_EXECUTION_GUARD.json'));
 if(guard.guard!=='IF_THEN')throw Error('completed proof audit required');
 for(const r of [build.source,build.image,build.source_map,...Object.values(build.inputs)])custody(r);
 const raw=path.join(dir,'image','readback.bin');
 if(!equalHash(hash(raw),status.readback_sha256)||!equalHash(status.source_sha256,build.source.sha256)||!equalHash(status.image_sha256,build.image.sha256))throw Error('readback custody NOT_SAME');
 if(!equalHash(guard.resumed_sha256,status.readback_sha256)||!equalHash(guard.next_image_sha256,build.image.sha256)||guard.runtime_sha256!=='8A739F97DC3A67DC440DE3BE5C079A7ED7FC0898D5DCFDB5AEFE6F9CE8AB2B08')throw Error('proof audit custody NOT_SAME');
 if(!equalHash(hashCustody.readback_sha256,status.readback_sha256)||!equalHash(hashCustody.source_sha256,status.source_sha256)||!equalHash(hashCustody.image_sha256,status.image_sha256))throw Error('hash request custody NOT_SAME');
 const responses=path.join(dir,'hash','responses.json'),delta=path.join(dir,'hash','delta.json');
 if(!equalHash(hash(responses),hashCustody.responses_sha256)||!equalHash(hash(responses),deltaCustody.current_sha256)||!equalHash(hash(delta),deltaCustody.delta_sha256))throw Error('hash response custody NOT_SAME');
 const deltaRows=arrayFile(delta);
 if(deltaRows.length!==deltaCustody.new_rows)throw Error('hash delta extent NOT_SAME');
 return {dir,build,status,delta,deltaRows};
}
async function run(script,argv){
 toolsCustody();
 const file=script==='execute_stage_008.mjs'?path.join(isolated,script):path.join(root,script);
 emit({action:'LAUNCH',tool:script,tool_sha256:hash(file),arguments:argv,scope:'CPU observation/lowering or explicitly listed generic GPU continuation; no CONFORM'});
 await new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,['--max-old-space-size=8192',file,...argv],{cwd:root,stdio:'inherit',windowsHide:true});
  child.once('error',reject);
  child.once('exit',(code,signal)=>code===0?resolve():reject(Error(script+' stopped: '+(signal||code))));
 });
}
function observationIdentity(c,s){
 if(!equalHash(c.source_sha256,s.source_sha256)||!equalHash(c.image_sha256,s.image_sha256)||!equalHash(c.readback_sha256,s.readback_sha256))throw Error('retained observation belongs to different source execution');
}
async function rows(current,tag,file,extent,fullRow){
 const record=file+'.custody.json';
 if(fs.existsSync(file)||fs.existsSync(record)){
  if(!fs.existsSync(file)||!fs.existsSync(record))throw Error('partial observation preserved; manual custody repair required: '+file);
  const c=read(record);observationIdentity(c,current.status);
  if(c.selector!==tag||c.ordering!==(fullRow?'full-row JSON UTF-8':'retained first-column JSON string order')||c.rows.length!==extent||arrayFile(file).length!==extent||!equalHash(hash(file),c.output_sha256))throw Error('retained row observation NOT_SAME: '+file);
  emit({action:'REUSE_VERIFIED_OBSERVATION',path:file,sha256:c.output_sha256,rows:extent});
 }else{
  await run('observe_rows.mjs',[path.join(current.dir,'image'),tag,file,...(fullRow?['--sort=full-row']:[])]);
  const c=read(record);observationIdentity(c,current.status);
  if(c.rows.length!==extent||arrayFile(file).length!==extent||!equalHash(hash(file),c.output_sha256))throw Error('source row observation extent/custody NOT_SAME: '+file);
 }
}
async function inventory(current,out){
 if(fs.existsSync(out)){
  const c=read(path.join(out,'CUSTODY.json'));observationIdentity(c,current.status);
  if(c.selectors?.occurrences!=='VO_COMPARATOR'||c.selectors?.flags!=='VO_FLAG_JSON'||c.observations.length!==720||arrayFile(path.join(out,'program_inventory.json')).length!==720||!equalHash(hash(path.join(out,'program_inventory.json')),c.inventory_sha256)||!equalHash(hash(path.join(out,'cell_hashes.mal')),c.hash_response_sha256))throw Error('retained program inventory NOT_SAME');
  emit({action:'REUSE_VERIFIED_INVENTORY',path:out,rows:720,sha256:c.inventory_sha256});
 }else{
  await run('export_inventory.mjs',[path.join(current.dir,'image'),out,'--occurrences=VO_COMPARATOR','--flags=VO_FLAG_JSON']);
  const c=read(path.join(out,'CUSTODY.json'));observationIdentity(c,current.status);
  if(c.observations.length!==720||arrayFile(path.join(out,'program_inventory.json')).length!==720)throw Error('source comparator observation extent NOT_SAME');
 }
}

const repeated=read(path.join(stagePath(1),'REPEATABILITY.json'));
if(repeated.comparison!=='SAME'||repeated.repeated.sha256!=='6C30E87F2DCA3325015D82F86482315134D93530D2A0C4517A76FC3D6DB09849')throw Error('exact V1 repeat SAME required');
custody(repeated.baseline);custody(repeated.repeated);
emit({scope:'GENERIC_ADDITIVE_CONTINUATION_ONLY',vector,start_stage:start,other_vectors:'NOT_RUN',conform:'NOT_RUN',expected_output_inputs:'NONE',admission:'source laws only'});
for(let stage=start;stage<=99;stage++){
 const current=inspect(stage),{build,status}=current,count=k=>status.counts[k]||0;
 const committed=bounded(count('COMMITTED_VECTOR_OUTPUT'),1,'committed output');
 if(committed===1){
  emit({status:'SOURCE_COMMITTED',vector,stage,readback:path.join(current.dir,'image','readback.bin'),readback_sha256:status.readback_sha256,count:1,conform:'NOT_RUN',other_vectors:'NOT_RUN'});
  fs.writeFileSync(path.join(work,'SOURCE_COMMITTED.json'),JSON.stringify({vector,stage,run_dir:path.join(current.dir,'image'),readback_sha256:status.readback_sha256,conform:'NOT_RUN'},null,2)+'\n',{flag:'wx'});
  break;
 }
 const pairs=bounded(count('VO_PAIR'),720,'source pair'),ready=bounded(count('VO_OPERAND_FIXTURE_READY'),1,'source fixture'),comparators=bounded(count('VO_COMPARATOR'),720,'source comparator'),receipts=bounded(count('I20_RUNTIME_RECEIPT'),1440,'source receipt');
 const pairImported=nonemptyInput(build,a=>a==='observer_pairs'||/^vp\d{2}$/.test(a),720);
 const receiptImported=nonemptyInput(build,a=>a==='receipt_inventory'||/^vr\d{2}$/.test(a),1440);
 const deltaAlreadyImported=Object.values(build.inputs).some(r=>equalHash(r.sha256,hash(current.delta)));
 const useHash=current.deltaRows.length>0&&!deltaAlreadyImported;
 const usePairs=pairs===720&&!pairImported;
 const useRuntime=!build.runtime&&ready===1&&comparators===720;
 const useReceipts=build.runtime&&receipts===1440&&!receiptImported;
 const useAcceleration=(build.runtime||useRuntime)&&!build.accelerated;
 if(useRuntime&&count('VO_FLAG_JSON')!==480)throw Error('source flag observation extent NOT_SAME before runtime inventory');
 const actions=[...(useHash?[{kind:'IMPORT_NEW_SOURCE_REQUESTED_HASH_DELTA',path:current.delta,rows:current.deltaRows.length}]:[]),...(usePairs?[{kind:'OBSERVE_AND_IMPORT_SOURCE_PAIRS',rows:720,sort:'full-row JSON UTF-8'}]:[]),...(useRuntime?[{kind:'EXPORT_SELECTOR_BOUND_PROGRAM_INVENTORY_AND_APPEND_SHARED_RUNTIME',rows:720,selectors:{occurrences:'VO_COMPARATOR',flags:'VO_FLAG_JSON'}}]:[]),...(useReceipts?[{kind:'OBSERVE_AND_IMPORT_SOURCE_RUNTIME_RECEIPTS',rows:1440,sort:'first-column JSON string'}]:[]),...(useAcceleration?[{kind:'APPEND_RETAINED_SOURCE_FOLD_ACCELERATION'}]:[])];
 if(!actions.length){const pending={status:'PENDING',vector,stage,reason:'No new source-requested input or retained next action',counts:diagnosticCounts(status),requests:status.requests,conform:'NOT_RUN',other_vectors:'NOT_RUN'};emit(pending);fs.writeFileSync(path.join(work,'CONTINUATION_PENDING.json'),JSON.stringify(pending,null,2)+'\n',{flag:'wx'});break;}
 if(stage===99)throw Error('bounded stage extent reached; all existing artifacts preserved');
 const next=stage+1;
 if(fs.existsSync(stagePath(next)))throw Error('preserve existing next stage; no overwrite or automatic alternate lineage: '+stagePath(next));
 const observations=path.join(current.dir,'continuation_observations');
 const pairFile=path.join(observations,'observer_pairs.json'),receiptFile=path.join(observations,'runtime_receipts.json'),inventoryDir=path.join(observations,'program_inventory');
 emit({action:'PLAN_BEFORE_LAUNCH',vector,completed_stage:stage,next_stage:next,actions,then:['vector_build.mjs additive stage '+next,'execute_stage_008.mjs '+vector+' '+next],count_scope:'bounded observation extent only; .mal determines admission and commit'});
 if(usePairs||useRuntime||useReceipts)fs.mkdirSync(observations,{recursive:true});
 const buildArgs=[vector,'--stage',String(next),'--out',work];
 if(useHash)buildArgs.push('--hash-response',current.delta);
 if(usePairs){await rows(current,'VO_PAIRS',pairFile,720,true);buildArgs.push('--observer-pairs',pairFile);}
 if(useRuntime){await inventory(current,inventoryDir);buildArgs.push('--runtime',inventoryDir);}
 if(useReceipts){await rows(current,'I20_RECEIPTS',receiptFile,1440,false);buildArgs.push('--receipts',receiptFile);}
 if(useAcceleration)buildArgs.push('--accelerate');
 await run('vector_build.mjs',buildArgs);
 await run('execute_stage_008.mjs',[vector,String(next)]);
}
