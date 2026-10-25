// Test P commit custody and generic SHA256 continuation service.
// Importing this module performs no writes and launches no process.
// Effects, cardinality, receipts, predecessor guards and commit are .mal facts.
// Callers own lower/run/qualification; this service never selects a member.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openReadback,sha} from '../../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const task=path.resolve(here,'..'),root=path.resolve(task,'..');
const WORLD=path.join(root,'j17_step_023/outputs/committed.world.json');
const BINDING=path.join(root,'j17_tick_promote_binding_013/BINDING_EVIDENCE.json');
const PROMOTE=path.join(root,'j17_tick_promote_binding_013/RECORD_J17_TICK_PROMOTE_BINDING_013.mal');
const WORLD_SHA='E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059';
const BINDING_SHA='171CD86278BD859418D42A198D13466CEC5BB0204E4FB00F3F2FD99D87F8B6F4';
const PROMOTE_SHA='2E762748A07C77A808B6CD8A612DE926839D6066D99D0E5949CE2E990BD735E4';
const requireThat=(x,message)=>{if(!x)throw Error(message);};
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export const canonicalJSON=v=>JSON.stringify(canonical(v));
export const canonicalHash=v=>sha(Buffer.from(canonicalJSON(v))).toLowerCase();
const identity=p=>{const bytes=fs.readFileSync(p);return{path:path.resolve(p),bytes:bytes.length,sha256:sha(bytes)};};
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const save=(p,v)=>write(p,JSON.stringify(v,null,2)+'\n');
function scoped(p){const resolved=path.resolve(p),relative=path.relative(task,resolved);requireThat(relative!==''&&!relative.startsWith('..')&&!path.isAbsolute(relative),'OUTPUT_OUTSIDE_ADDITIVE_020');return resolved;}
function pin(p,expected){const id=identity(p);requireThat(id.sha256===expected,'INPUT_NOT_SAME '+p);return id;}

// Inputs contain source custody and the retained 013 binding, never a chosen
// result row. The original world is read directly, not copied or overwritten.
export function prepareCommitInputs(directory,{executionSources}={}){
 const out=scoped(directory);requireThat(Array.isArray(executionSources)&&executionSources.length>0,'EXECUTION_SOURCE_FILES_REQUIRED');
 fs.mkdirSync(out,{recursive:true});
 const bound=[pin(WORLD,WORLD_SHA),pin(BINDING,BINDING_SHA),pin(PROMOTE,PROMOTE_SHA)];
 const worldBytes=fs.readFileSync(WORLD),world=JSON.parse(worldBytes);
 requireThat(Buffer.from(JSON.stringify(world)).equals(worldBytes),'WORLD_TRANSPORT_NOT_COMPACT');
 const binding=JSON.parse(fs.readFileSync(BINDING));
 const fileList=[...new Set([...executionSources.map(p=>path.resolve(p)),path.join(here,'source.mal')])];
 requireThat(fileList.every(p=>path.extname(p)==='.mal'),'MAL_SOURCE_BUNDLE_ONLY');
 const sources=fileList.map(identity);
 const executionSource={kind:'MAL_SOURCE_BUNDLE',scope:'EXECUTOR_PROVENANCE_ONLY_NOT_GEOMETRIC_FABRIC_PROGRAM',files:sources};
 const bindingPath=path.join(out,'binding.compact.json'),executionPath=path.join(out,'execution_source.compact.json');
 write(bindingPath,JSON.stringify(binding));write(executionPath,canonicalJSON(executionSource));
 const custody={schema:'TestPCommitInputCustody020',scope:'SOURCE_AND_EXISTING_BINDING_TRANSPORT_ONLY',bound,sources,execution_source:identity(executionPath),binding_transport:identity(bindingPath),script:identity(fileURLToPath(import.meta.url)),commit_source:identity(path.join(here,'source.mal'))};
 const custodyPath=path.join(out,'COMMIT_INPUT_CUSTODY.json');save(custodyPath,custody);
 return{sourceText:fs.readFileSync(path.join(here,'source.mal'),'utf8'),namedInputs:{commit_world:WORLD,commit_binding:bindingPath,commit_execution_source:executionPath},custodyPath,custody,executionSource};
}

// Append only. Reusing the same fixed source and every prior row retains the
// existing rule/symbol/seed prefixes checked by prefill_guard_runtime.mjs.
export function appendHashResponseSeeds(fixedSource,responses){
 requireThat(typeof fixedSource==='string'&&Array.isArray(responses),'HASH_SEED_ARGUMENTS');
 return fixedSource+'\n// Generic SHA256 service responses; all earlier rows retained.\n'+responses.map((_,i)=>'@readonly input P20_COMMIT_HASH_ROW := "commit_hashes:/'+i+'";').join('\n')+'\n';
}

function stageReadback(stage){requireThat(stage&&typeof stage.readbackDirectory==='string','STAGE_READBACK_DIRECTORY_REQUIRED');return openReadback(stage.readbackDirectory);}
function artifactStage(stage){return{readback:identity(path.join(stage.readbackDirectory,'readback.bin')),map:identity(stage.mapPath??path.join(stage.readbackDirectory,'source-map.json')),image:stage.imagePath?identity(stage.imagePath):undefined,source:stage.sourcePath?identity(stage.sourcePath):undefined};}

// initialStage already exists and has completed. buildNext receives the complete
// response list and an appended-seed source suffix; runGuard must invoke the
// qualified prefix/proof-preserving continuation, not replace prior facts.
// A typical buildNext uses appendHashResponseSeeds(fixedSource, rows), retains
// fixed namedInputs, and adds commit_hashes=hashRowsPath to the lowerer invocation.
export async function continueCommitHashes({initialStage,outputDirectory,buildNext,runGuard,maxRounds=8,onRound}={}){
 requireThat(typeof buildNext==='function'&&typeof runGuard==='function','NATIVE_BUILD_AND_GUARDED_RESUME_CALLBACKS_REQUIRED');
 requireThat(Number.isSafeInteger(maxRounds)&&maxRounds>0&&maxRounds<=16,'HASH_ROUND_BOUND');
 const out=scoped(outputDirectory);fs.mkdirSync(out,{recursive:true});
 const responses=[],keys=new Map(),service=[],rounds=[];let stage=initialStage,rb=stageReadback(stage),settled=false;
 for(let round=0;round<maxRounds;round++){
  let added=0;const priorCount=responses.length;
  for(const f of rb.predicate('GPU_HASH_REQUEST')){
   const n=rb.node(f.term);requireThat(n.c.length===4,'HASH_REQUEST_SHAPE');
   const subject=rb.value(n.c[3]),key=canonicalJSON(subject),digest=canonicalHash(subject);
   if(keys.has(key)){requireThat(keys.get(key)===digest,'HASH_SERVICE_NOT_SAME');continue;}
   keys.set(key,digest);responses.push([subject,digest]);added++;
   service.push({round,fact:f.id,origin:f.origin,support:f.support,subject_sha256:digest});
  }
  rounds.push({round,stage:artifactStage(stage),response_count_before:priorCount,new_responses:added,total_responses:responses.length});
  if(!added){settled=true;break;}
  const hashRowsPath=path.join(out,'hash_rows_'+String(round).padStart(2,'0')+'.json');write(hashRowsPath,JSON.stringify(responses));
  const next=await buildNext({round,hashRowsPath,responses:responses.slice(),hashSeedSource:appendHashResponseSeeds('',responses)});
  const resumed=await runGuard(stage,next,{round,responseCount:responses.length,priorResponseCount:priorCount});
  requireThat(resumed?.guardReportPath,'GUARD_REPORT_REQUIRED');
  const guard=JSON.parse(fs.readFileSync(resumed.guardReportPath));
  requireThat(guard.guard==='IF_THEN'&&guard.execution==='EXECUTED'&&guard.symbol_prefix==='SAME'&&guard.logical_rule_prefix==='SAME'&&guard.prior_seeds==='PRESERVED'&&guard.checkpoint_proofs==='SAME'&&guard.retained_proof_bytes==='SAME','RESUME_CUSTODY_NOT_SAME');
  rounds.at(-1).continuation_guard=identity(resumed.guardReportPath);
  stage={...next,...resumed};rb=stageReadback(stage);if(onRound)await onRound({round,stage,responseCount:responses.length});
 }
 requireThat(settled,'HASH_SERVICE_ROUND_BOUND');
 const servicePath=path.join(out,'HASH_SERVICE_CUSTODY.json');save(servicePath,{scope:'GENERIC_SHA256_ONLY; NATIVE_REQUEST_SUBJECTS; APPEND_ONLY_RESPONSE_SEEDS',script:identity(fileURLToPath(import.meta.url)),rounds,requests:service});
 // No file called committed.world.json is written here. Qualification and
 // replay must complete before the caller requests materialization explicitly.
 return{finalStage:stage,readback:rb,servicePath,serviceIdentity:identity(servicePath),responseCount:responses.length,rounds};
}

// Read-only postcondition observer. A returned pair and a committed world are
// different subjects: only P20_COMMITTED_WORLD supplies the latter.
export function inspectNativeCommit(stage){
 const rb=stageReadback(stage),returns=rb.predicate('P_COMMITTED_RETURN'),worldFacts=rb.predicate('P20_COMMITTED_WORLD');
 requireThat(returns.length===1&&worldFacts.length===1,'NATIVE_COMMIT_NOT_SINGLETON');
 const ret=returns[0],rn=rb.node(ret.term);requireThat(rn.c.length===7,'COMMITTED_RETURN_SHAPE');
 const prev=rb.value(rn.c[5]),link=rb.value(rn.c[6]);
 const wfact=worldFacts[0],world=rb.value(rb.node(wfact.term).c[1]),source=JSON.parse(fs.readFileSync(WORLD)),binding=JSON.parse(fs.readFileSync(BINDING)).binding;
 pin(WORLD,WORLD_SHA);pin(BINDING,BINDING_SHA);pin(PROMOTE,PROMOTE_SHA);
 requireThat(world.chain.length===source.chain.length+1,'ONE_LINK_APPEND_REQUIRED');
 requireThat(JSON.stringify(world.chain.slice(0,source.chain.length))===JSON.stringify(source.chain),'PREDECESSOR_PREFIX_NOT_SAME');
 const entry=world.chain.at(-1),record=entry.record;
 requireThat(prev===source.chain.at(-1).link&&record.prev===prev&&entry.link===link&&canonicalHash(record)===link,'CURRENT_HEAD_OR_LINK_NOT_SAME');
 requireThat(canonicalHash({field:world.field,witness:world.witness})===binding.successor_identity.pair_hash,'BOUND_SUCCESSOR_NOT_SAME');
 requireThat(canonicalJSON(world.receipt)===canonicalJSON(binding.receipt)&&canonicalHash(world.receipt)===binding.receipt_hash,'BOUND_RECEIPT_NOT_SAME');
 requireThat(record.pair_hash===binding.successor_identity.pair_hash&&record.receipt_hash===binding.receipt_hash&&record.receipt_reading===binding.receipt_reading,'RECORD_BINDING_NOT_SAME');
 requireThat(canonicalJSON(record.field)===canonicalJSON(world.field)&&canonicalJSON(record.witness)===canonicalJSON(world.witness)&&canonicalJSON(record.receipt)===canonicalJSON(world.receipt),'WORLD_RECORD_SUBJECT_NOT_SAME');
 requireThat(!Object.hasOwn(record,'fabric_program')&&record.execution_source?.kind==='MAL_SOURCE_BUNDLE','PROGRAM_IDENTITY_SUBJECT_NOT_SAME');
 for(const s of record.execution_source.files)requireThat(identity(s.path).sha256===s.sha256,'EXECUTION_SOURCE_NOT_SAME '+s.path);
 const requests=rb.predicate('P20_C_REQUEST'),joined=rb.predicate('P20_C_REQUEST_JOINED');
 const requestCases=requests.map(f=>rb.node(rb.node(f.term).c[1]).s),joinedCases=joined.map(f=>rb.node(rb.node(f.term).c[1]).s);
 requireThat(requestCases.includes('ALTERED_MEMBER')&&requestCases.includes('WRONG_HEAD'),'NEGATIVE_REQUESTS_MISSING');
 requireThat(joinedCases.length===1&&joinedCases[0]==='NORMAL','ALTERED_MEMBER_OR_HEAD_ADMITTED');
 return{world,source,binding,scope:'NATIVE_SECTION_PAIR_WORLD_COMMIT; NOT_FULL_FABRIC_STATE',native_return:{fact:ret.id,origin:ret.origin,support:ret.support},native_world:{fact:wfact.id,origin:wfact.origin,support:wfact.support},prior_head:prev,link,pair_hash:record.pair_hash,receipt_hash:record.receipt_hash,controls:{altered_member:'WITHHELD',wrong_head:'WITHHELD'},stage:artifactStage(stage)};
}

// Caller invokes only after its replay/qualification. This is an observation of
// ONE native committed-world fact, not construction of a successor or its link.
export function materializeNativeCommit(stage,outputPath){
 const out=scoped(outputPath);requireThat(path.resolve(out)!==path.resolve(WORLD),'ORIGINAL_WORLD_OVERWRITE');
 const result=inspectNativeCommit(stage);write(out,canonicalJSON(result.world));return{...result,artifact:identity(out)};
}
