// Indexed successor of final_binding.mjs; the prior binder is preserved.
// Additive final custody binding only. No GPU, lowering, observer execution,
// receipt computation, K computation, promotion, or existing-file mutation.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const self=fileURLToPath(import.meta.url),here=path.dirname(self),root=path.resolve(here,'../..');
const need=(x,message)=>{if(!x)throw Error('R1_FINAL_BINDING '+message);};
const [name,...extra]=process.argv.slice(2);
need(name==='run_003'&&extra.length===0,'usage: node final_binding_indexed.mjs run_003');
const out=path.join(here,name),target=path.join(out,'FINAL_BINDING_R1.json');
need(path.dirname(out)===here&&fs.existsSync(out),'RUN_DIRECTORY');
need(!fs.existsSync(target),'PRESERVE_FINAL_BINDING');
const runPath=path.join(out,'RUN_RECORD_R1.json');
need(fs.existsSync(runPath),'COMPLETED_RUN_RECORD_REQUIRED');
const identities=new Map(),reasons=new Map(),json=JSON.stringify;
const normalized=p=>path.resolve(p).replaceAll('\\','/').toLowerCase();
const samePath=(a,b)=>typeof a==='string'&&typeof b==='string'&&normalized(a)===normalized(b);
const digestPattern=/^[A-F0-9]{64}$/;

function identity(file){
  const absolute=path.resolve(file),fd=fs.openSync(absolute,'r'),hash=crypto.createHash('sha256'),buffer=Buffer.allocUnsafe(1024*1024);
  let bytes=0;
  try{
    const before=fs.fstatSync(fd);need(before.isFile(),'NOT_A_FILE '+absolute);
    for(;;){const n=fs.readSync(fd,buffer,0,buffer.length,null);if(!n)break;bytes+=n;hash.update(buffer.subarray(0,n));}
    const after=fs.fstatSync(fd);need(bytes===before.size&&after.size===before.size&&after.mtimeMs===before.mtimeMs,'CHANGED_DURING_HASH '+absolute);
  }finally{fs.closeSync(fd);}
  return {path:absolute,bytes,sha256:hash.digest('hex').toUpperCase()};
}
function bind(file,reason){
  const key=normalized(file);if(!identities.has(key))identities.set(key,identity(file));
  if(!reasons.has(key))reasons.set(key,new Set());reasons.get(key).add(reason);
  return identities.get(key);
}
function pin(record,expectedPath,reason){
  need(record&&typeof record==='object'&&samePath(record.path,expectedPath)&&digestPattern.test(record.sha256),'PIN_SHAPE_OR_PATH '+reason);
  const actual=bind(expectedPath,reason);
  need(actual.sha256===record.sha256&&(record.bytes===undefined||record.bytes===actual.bytes),'NOT_SAME_PIN '+reason);
  return actual;
}
function document(file,reason){bind(file,reason);return JSON.parse(fs.readFileSync(file,'utf8'));}
function header(file){
  const fd=fs.openSync(file,'r'),buffer=Buffer.allocUnsafe(65536);let n;
  try{n=fs.readSync(fd,buffer,0,buffer.length,0);}finally{fs.closeSync(fd);}
  return buffer.toString('utf8',0,n);
}
// Source maps are large. These scalar custody fields precede the large arrays;
// only their JSON string values are decoded, never native predicates or cases.
function scalar(text,key){
  const found=text.match(new RegExp('"'+key+'"\\s*:\\s*("(?:\\\\.|[^"\\\\])*")'));
  need(found,'MISSING_HEADER_SCALAR '+key);return JSON.parse(found[1]);
}
function proofHeader(file){
  const text=header(file),stop=text.indexOf('"scope"');need(stop>0,'PROOF_HEADER_SCOPE');
  return JSON.parse(text.slice(0,stop).replace(/,\s*$/,'')+'}');
}
function execution(file,expectedArgs,gpu){
  const record=document(file,'execution');
  need(record.status===0&&record.error===null&&record.gpu===gpu,'EXECUTION_COMPLETION '+file);
  need(Array.isArray(record.args)&&json(record.args)===json(expectedArgs),'EXECUTION_ARGUMENTS '+file);
  if(gpu)need(samePath(record.command,runtime),'EXECUTION_RUNTIME '+file);
  return bind(file,'execution');
}

const inputPath=path.join(out,'INPUTS.json');
pin({path:inputPath,sha256:'829F8EAEE18F5D278737BB7C15F3E94E5F45F24E4DF089DC30589C335504245F'},inputPath,'prepared_input_binding');
const inputs=document(inputPath,'prepared_inputs');need(Array.isArray(inputs.bound)&&inputs.bound.length>0,'INPUT_BINDINGS');
const inputKeys=new Set();
for(const record of inputs.bound){need(!inputKeys.has(normalized(record.path)),'DUPLICATE_INPUT_BINDING');inputKeys.add(normalized(record.path));pin(record,record.path,'prepared_input');}
const run=document(runPath,'completed_run_record');
need(run.verdict==='IF_THEN'&&run.inputs===120&&run.offers_per_input===1924&&run.receipt_cases===230880&&Array.isArray(run.batches)&&run.batches.length>0,'RUN_RECORD_SCOPE');
const batchIds=new Set(),inputIds=new Set();let listedInputCount=0;
for(const batch of run.batches){
  need(Number.isSafeInteger(batch.batch)&&batch.batch>=0&&!batchIds.has(batch.batch)&&Array.isArray(batch.inputs)&&batch.inputs.length>0,'RUN_BATCH_METADATA');
  batchIds.add(batch.batch);
  for(const input of batch.inputs){need(typeof input.term==='string'&&input.term.length>0&&!inputIds.has(input.term),'RUN_INPUT_IDENTITY');inputIds.add(input.term);listedInputCount++;}
}
need(listedInputCount===120&&inputIds.size===120,'RUN_120_DISTINCT_INPUTS');
need(json(run.bound)===json(inputs.bound),'RUN_INPUT_BINDINGS');
need(run.promotion==='NOT_PERFORMED'&&run.repository_commit==='NOT_PERFORMED','RUN_AUTHORITY_SCOPE');
const runtime=path.join(root,'runtime_021/block_iterative_runtime.exe');
const fastLower=path.join(here,'fast_lowerer/lower.mjs'),fastHelper=path.join(here,'fast_lowerer/source_occurrence_custody.mjs');
const oldLower=path.join(root,'j17_step_021/tools/lower.mjs'),oldHelper=path.join(root,'j17_step_021/tools/source_occurrence_custody.mjs');
const world=path.join(root,'j17_step_023/outputs/committed.world.json'),capacity='4194304';
const binder=bind(self,'binder_self');
const indexedSource=path.join(here,'source/list_parts_index.mal'),indexedObserver=path.join(here,'observe_indexed.mjs'),indexedDriver=path.join(here,'run_indexed.mjs');
pin(run.index_source,indexedSource,'run_index_source');pin(run.observer,indexedObserver,'run_indexed_observer');
pin({path:indexedDriver,sha256:'664F4245FD822C36B66EE2BFA7D4DB3E14F480C0CFDBC2241F396E9D45040D18'},indexedDriver,'indexed_driver_pin');

function stage(label,{directory=out,lower=fastLower,helper=fastHelper}={}){
  const folder=path.join(directory,label),stagePath=path.join(folder,'stage'),input=path.join(folder,'input.mal');
  const files={input:bind(input,'stage_input'),image:bind(path.join(stagePath,'image.bin'),'stage_image'),source:bind(path.join(stagePath,'source.mal'),'lowered_source'),source_map:bind(path.join(stagePath,'source-map.json'),'stage_source_map'),occurrence_custody:bind(path.join(stagePath,'source-occurrence-custody.json'),'stage_occurrence_custody'),readback:bind(path.join(stagePath,'readback.bin'),'stage_readback'),progress:bind(path.join(stagePath,'readback.bin.progress.jsonl'),'stage_progress_log'),epochs:bind(path.join(stagePath,'readback.bin.epochs.jsonl'),'stage_epoch_log')};
  const map=header(files.source_map.path),occurrence=header(files.occurrence_custody.path);
  need(samePath(scalar(map,'source'),input)&&scalar(map,'source_sha256')===files.input.sha256&&scalar(map,'image_sha256')===files.image.sha256&&scalar(map,'lowerer_sha256')===bind(lower,'stage_lowerer').sha256,'SOURCE_IMAGE_LOWERER_CHAIN '+label);
  need(scalar(occurrence,'source_sha256')===files.input.sha256&&scalar(occurrence,'producer_sha256')===bind(helper,'stage_occurrence_helper').sha256,'OCCURRENCE_CUSTODY_CHAIN '+label);
  files.lower_execution=execution(path.join(directory,label+'.lower.execution.json'),[lower,input,stagePath,'-','g2='+world],false);
  files.gpu_execution=execution(path.join(directory,label+'.gpu.execution.json'),[files.image.path,files.readback.path,'--fact-capacity',capacity],true);
  return files;
}
function observation(label,files,directory=out,{indexed=directory===out}={}){
  const file=path.join(directory,label+'.OBSERVATIONS.json'),record=document(file,'native_observation'),summary=record.summary;
  need(summary?.verdict==='IF_THEN'&&summary.error===0,'OBSERVATION_STATUS '+label);
  pin(summary.readback,files.readback.path,'observation_readback');pin(summary.source_map,files.source_map.path,'observation_source_map');
  const proofPath=path.join(directory,label+'.NATIVE_PROOFS.json');pin(record.proofs_artifact,proofPath,'observation_proof_export');
  const proofs=proofHeader(proofPath);pin(proofs.readback,files.readback.path,'proof_readback');pin(proofs.source_map,files.source_map.path,'proof_source_map');
  need(digestPattern.test(record.closure_sha256)&&record.closure_sha256===summary.closure_sha256&&record.closure_format==='structural-Merkle-fact-set-v1'&&record.closure_format===summary.closure_format,'OBSERVATION_CLOSURE_FIELDS '+label);
  if(indexed){
    need(digestPattern.test(record.projected_original_closure_sha256)&&record.projected_original_closure_sha256===summary.projected_original_closure_sha256,'PROJECTED_CLOSURE_FIELDS '+label);
    need(Number.isSafeInteger(record.projected_original_fact_count)&&record.projected_original_fact_count>=0&&record.projected_original_fact_count===summary.projected_original_fact_count,'PROJECTED_FACT_COUNT_FIELDS '+label);
    const projection=record.projection,helper=summary.indexed_helper;
    need(projection?.excluded_predicate==='KD_LIST_PARTS_019'&&projection.format===record.closure_format&&json(projection)===json(summary.projection),'ONLY_HELPER_PROJECTION '+label);
    need(helper?.tag==='KD_LIST_PARTS_019'&&helper.producer==='KD_LIST_PARTS_019'&&Number.isSafeInteger(helper.helper_count)&&helper.helper_count>=0&&helper.cons_cons_request_count===helper.helper_count,'HELPER_COUNT_FIELDS '+label);
    need(projection.excluded_fact_count===helper.helper_count&&record.projected_original_fact_count===summary.facts-helper.helper_count,'PROJECTED_COUNT_CUSTODY '+label);
    need(helper.native_producer_and_exact_parts==='SAME'&&helper.request_support_bijection==='SAME'&&json(proofs.indexed_helper_validation)===json(helper),'RECORDED_HELPER_VALIDATION '+label);
  }
  return {observation:bind(file,'native_observation'),proofs:bind(proofPath,'native_proof_export'),summary,closure_sha256:record.closure_sha256,closure_format:record.closure_format,...(indexed?{projected_original_closure_sha256:record.projected_original_closure_sha256,projected_original_fact_count:record.projected_original_fact_count,projection:record.projection}:{})};
}

const preparedPath=path.join(out,'PREPARED.json'),prepared=document(preparedPath,'prepared_record');
const inventoryFiles=stage('inventory'),inventoryPath=path.join(out,'NATIVE_INVENTORY.json'),inventoryRecordPath=path.join(out,'INVENTORY_RECORD.json');
const inventoryRecord=document(inventoryRecordPath,'inventory_record'),inventory=document(inventoryPath,'native_inventory');
need(prepared.verdict==='IF_THEN'&&inventoryRecord.verdict==='IF_THEN','INVENTORY_RECORD_STATUS');
pin(prepared.source,path.join(here,'source/r1_optimized.mal'),'prepared_source');pin(prepared.image,inventoryFiles.image.path,'prepared_inventory_image');
pin(inventoryRecord.readback,inventoryFiles.readback.path,'inventory_record_readback');pin(inventoryRecord.inventory,inventoryPath,'inventory_record_inventory');
pin(inventoryRecord.coverage,path.join(out,'COVERAGE.json'),'inventory_record_coverage');
pin(inventory.readback,inventoryFiles.readback.path,'inventory_readback');pin(inventory.source_map,inventoryFiles.source_map.path,'inventory_source_map');

const qualificationPath=path.join(out,'QUALIFICATION.json'),qualification=document(qualificationPath,'qualification_record');
pin(run.qualification,qualificationPath,'run_qualification');
pin(qualification.index_source,indexedSource,'qualification_index_source');pin(qualification.observer,indexedObserver,'qualification_indexed_observer');
need(qualification.verdict==='IF_THEN'&&qualification.replay==='SAME'&&qualification.reversal==='SAME','QUALIFICATION_STATUS');
const normalFiles=stage('qualification'),normal=observation('qualification',normalFiles);
const reversedFiles=stage('qualification_reversed'),reversed=observation('qualification_reversed',reversedFiles);
pin(qualification.source,path.join(here,'source/r1_optimized.mal'),'qualification_source');pin(qualification.readback,normalFiles.readback.path,'qualification_readback');
need(normal.closure_sha256===reversed.closure_sha256&&qualification.closure_sha256===normal.closure_sha256,'QUALIFIED_FULL_INDEXED_CLOSURE_IDENTITY');
need(normal.projected_original_closure_sha256===reversed.projected_original_closure_sha256,'QUALIFIED_PROJECTED_CLOSURE_IDENTITY');

const replayPath=path.join(out,'qualification_replay'),replay={readback:bind(path.join(replayPath,'readback.bin'),'replay_readback'),source_map:bind(path.join(replayPath,'source-map.json'),'replay_source_map'),progress:bind(path.join(replayPath,'readback.bin.progress.jsonl'),'replay_progress_log'),epochs:bind(path.join(replayPath,'readback.bin.epochs.jsonl'),'replay_epoch_log')};
replay.execution=execution(path.join(out,'qualification_replay.gpu.execution.json'),[normalFiles.image.path,replay.readback.path,'--fact-capacity',capacity],true);
need(replay.readback.sha256===normalFiles.readback.sha256&&replay.source_map.sha256===normalFiles.source_map.sha256,'REPLAY_BYTE_IDENTITY');

const equivalencePath=path.join(out,'ORIGINAL_EQUIVALENCE.json'),equivalence=document(equivalencePath,'original_equivalence');
need(equivalence.verdict==='IF_THEN'&&equivalence.originalFactSet?.comparison==='SAME'&&json(qualification.originalFactSet)===json(equivalence.originalFactSet),'ORIGINAL_EQUIVALENCE_RECORDS');
const originalDirectory=path.join(here,'run_001'),originalFiles=stage('qualification',{directory:originalDirectory,lower:oldLower,helper:oldHelper}),original=observation('qualification',originalFiles,originalDirectory);
pin(equivalence.originalFactSet.original_observation,original.observation.path,'equivalence_original_observation');pin(equivalence.originalFactSet.original_readback,originalFiles.readback.path,'equivalence_original_readback');
need(original.closure_sha256===normal.projected_original_closure_sha256&&equivalence.originalFactSet.closure_sha256===normal.projected_original_closure_sha256&&equivalence.originalFactSet.closure_format===normal.closure_format&&equivalence.originalFactSet.excluded_only==='KD_LIST_PARTS_019'&&equivalence.originalFactSet.helper_count===normal.summary.indexed_helper.helper_count,'ORIGINAL_PROJECTED_FACT_SET_IDENTITY');

const independentPath=path.resolve(here,'../R1_INDEPENDENT_OBSERVATION.json'),independentScript=path.resolve(here,'../observe_r1_independent.mjs');
const independent=document(independentPath,'independent_observer_report');
pin(independent.observer,independentScript,'independent_observer_script');pin(independent.world,world,'independent_observer_world');
pin({path:independentScript,sha256:'780C98C5CFB8C5CCCF6ED691CC4162BEC86DAF5505BC3C9739C9900C1C8973E2'},independentScript,'independent_observer_script_pin');
pin(equivalence.independent.observer_only,independentPath,'equivalence_independent_report');pin(qualification.independent.observer_only,independentPath,'qualification_independent_report');

need(Array.isArray(qualification.negative)&&qualification.negative.length===2,'NEGATIVE_CONTROL_RECORDS');
const negatives=[];
for(const label of ['missing_leaf','missing_root']){
  const control=qualification.negative.find(x=>x.label===label);need(control&&control.reading==='MAYBE'&&control.complete===0&&control.strict===0,'NEGATIVE_CONTROL_STATUS '+label);
  const files=stage(label),observed=observation(label,files);pin(control.observations,observed.observation.path,'negative_control_observation');
  negatives.push({label,record:control,files,observation:observed.observation,proofs:observed.proofs,closure_sha256:observed.closure_sha256});
}

const batches=[];
for(const finalBatch of run.batches){
  const index=finalBatch.batch;
  const suffix=String(index).padStart(3,'0'),label='batch_'+suffix,recordPath=path.join(out,'BATCH_'+suffix+'.json'),record=document(recordPath,'batch_record');
  need(record.verdict==='IF_THEN'&&record.batch===index&&json(record)===json(finalBatch),'BATCH_RUN_RECORD_IDENTITY '+suffix);
  const files=stage(label),observed=observation(label,files);
  pin(record.readback,files.readback.path,'batch_record_readback');pin(record.observations,observed.observation.path,'batch_record_observation');pin(record.independent.observer_only,independentPath,'batch_independent_report');
  need(json(record.summary)===json(observed.summary),'BATCH_OBSERVATION_SUMMARY '+suffix);
  need(Array.isArray(observed.summary.trials)&&json(record.inputs.map(x=>x.term).sort())===json(observed.summary.trials.map(x=>x.term).sort()),'BATCH_OBSERVED_INPUT_IDENTITIES '+suffix);
  batches.push({batch:index,record:bind(recordPath,'batch_record'),inputs:record.inputs,summary:record.summary,independent:record.independent,files,observation:observed.observation,proofs:observed.proofs,full_indexed_closure_sha256:observed.closure_sha256,projected_original_closure_sha256:observed.projected_original_closure_sha256});
}

const pilotEquivalencePath=path.join(out,'PILOT_ORIGINAL_EQUIVALENCE.json'),pilotEquivalence=document(pilotEquivalencePath,'pilot_original_equivalence');
pin(run.pilot_equivalence,pilotEquivalencePath,'run_pilot_equivalence');
need(pilotEquivalence.verdict==='IF_THEN'&&pilotEquivalence.comparison==='SAME'&&pilotEquivalence.excluded_only==='KD_LIST_PARTS_019','PILOT_EQUIVALENCE_STATUS');
const originalPilotDirectory=path.join(here,'run_002'),originalPilotFiles=stage('batch_000',{directory:originalPilotDirectory});
const originalPilot=observation('batch_000',originalPilotFiles,originalPilotDirectory),originalPilotRecordPath=path.join(originalPilotDirectory,'BATCH_000.json'),originalPilotRecord=document(originalPilotRecordPath,'original_pilot_record');
need(originalPilotRecord.verdict==='IF_THEN'&&originalPilotRecord.batch===0&&json(originalPilotRecord.summary)===json(originalPilot.summary),'ORIGINAL_PILOT_RECORD');
need(json(originalPilotRecord.inputs.map(x=>x.term).sort())===json(originalPilot.summary.trials.map(x=>x.term).sort()),'ORIGINAL_PILOT_INPUT_IDENTITIES');
pin(originalPilotRecord.readback,originalPilotFiles.readback.path,'original_pilot_record_readback');pin(originalPilotRecord.observations,originalPilot.observation.path,'original_pilot_record_observation');pin(originalPilotRecord.independent.observer_only,independentPath,'original_pilot_independent_report');
pin(pilotEquivalence.original_observation,originalPilot.observation.path,'pilot_equivalence_original_observation');pin(pilotEquivalence.original_readback,originalPilotFiles.readback.path,'pilot_equivalence_original_readback');pin(pilotEquivalence.independent.observer_only,independentPath,'pilot_equivalence_independent_report');
need(originalPilot.closure_sha256==='F4A9CFCC11B29D456C40F92F385017B0449DA27143045A099697742BCC057BF1','ORIGINAL_PILOT_CLOSURE_PIN');
const indexedPilot=batches.find(x=>x.batch===0);need(indexedPilot,'INDEXED_PILOT_BATCH_REQUIRED');
need(json(originalPilot.summary.trials.map(x=>x.term).sort())===json(indexedPilot.summary.trials.map(x=>x.term).sort()),'PILOT_RECORDED_INPUT_IDENTITIES');
need(indexedPilot.projected_original_closure_sha256===originalPilot.closure_sha256&&pilotEquivalence.projected_closure_sha256===originalPilot.closure_sha256,'PILOT_PROJECTED_ORIGINAL_IDENTITY');
need(pilotEquivalence.full_indexed_closure_sha256===indexedPilot.full_indexed_closure_sha256&&pilotEquivalence.helper_count===indexedPilot.summary.indexed_helper.helper_count,'PILOT_FULL_INDEXED_CUSTODY');
const pilotBinding={record:bind(pilotEquivalencePath,'pilot_original_equivalence'),original_record:bind(originalPilotRecordPath,'original_pilot_record'),original:{files:originalPilotFiles,...originalPilot},indexed_batch:indexedPilot.record,full_indexed_closure_sha256:indexedPilot.full_indexed_closure_sha256,projected_original_closure_sha256:indexedPilot.projected_original_closure_sha256,excluded_only:'KD_LIST_PARTS_019'};

// A second complete byte pass closes the binder's read interval. It does not
// claim continuous monitoring before this final read-only custody check.
for(const expected of identities.values()){
  const actual=identity(expected.path);need(actual.bytes===expected.bytes&&actual.sha256===expected.sha256,'CHANGED_DURING_BINDING '+expected.path);
}
const artifacts=[...identities.values()].sort((a,b)=>a.path.localeCompare(b.path,'en')).map(item=>({...item,roles:[...reasons.get(normalized(item.path))].sort()}));
const result={schema:'R1IndexedFinalCustodyBinding001',verdict:'IF_THEN',scope:'END_OF_INDEXED_RUN_BYTE_CUSTODY_ONLY; FULL_AND_PROJECTED_CLOSURES_DISTINCT; RECORDED_NATIVE_RESULTS_NOT_RECOMPUTED; NO_PROMOTION_OR_WORLD_EXECUTE',created_at:new Date().toISOString(),run:name,binder,index_source:bind(indexedSource,'run_index_source'),indexed_observer:bind(indexedObserver,'run_indexed_observer'),indexed_driver:bind(indexedDriver,'indexed_driver_pin'),pilot_original_equivalence:pilotBinding,run_record:bind(runPath,'completed_run_record'),inputs:bind(inputPath,'prepared_inputs'),prepared:bind(preparedPath,'prepared_record'),inventory:{record:bind(inventoryRecordPath,'inventory_record'),inventory:bind(inventoryPath,'native_inventory'),coverage:bind(path.join(out,'COVERAGE.json'),'inventory_record_coverage'),files:inventoryFiles},qualification:{record:bind(qualificationPath,'qualification_record'),normal:{files:normalFiles,...normal},reversed:{files:reversedFiles,...reversed},replay,original_equivalence:bind(equivalencePath,'original_equivalence'),original:{files:originalFiles,...original},negative_controls:negatives},independent_observer:{script:bind(independentScript,'independent_observer_script'),report:bind(independentPath,'independent_observer_report'),scope:'HASH_BOUND_ONLY; NOT_EXECUTED_BY_BINDER'},batches,artifacts,verification:{prepared_input_pins:'SAME',observation_readback_source_map_proof_pins:'SAME',lowered_source_image_helper_chains:'SAME',record_links:'SAME',second_byte_pass:'SAME',closure_comparison:'FULL_INDEXED_NORMAL_REVERSED_SAME; ORIGINAL_AND_PILOT_PROJECTED_DIGESTS_SAME; NOT_RECOMPUTED',replay_readback_and_source_map:'BYTE_SAME'},authority:{native_execution:'NOT_RUN_BY_BINDER',host_receipt_or_K_computation:'NOT_PERFORMED',world_write:'NOT_PERFORMED',promotion:'NOT_PERFORMED',prior_artifact_mutation:'NOT_PERFORMED'}};
fs.writeFileSync(target,json(result,null,2)+'\n',{flag:'wx'});
console.log(json({verdict:'IF_THEN',binding:identity(target),artifacts:artifacts.length,scope:result.scope}));
