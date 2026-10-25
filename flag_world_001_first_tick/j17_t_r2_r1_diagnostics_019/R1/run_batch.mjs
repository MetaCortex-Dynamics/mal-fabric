// Scheduling-only per-batch successor of frozen run_indexed.mjs.
// All native input constructors, grouping, source fragments and observation are unchanged.
// Additive native list-parts index. No extra offer, field, receipt, selection, or input pruning.
// The two original list-difference heads are unchanged; projection excludes only the new helper.
// Additive driver: same native diagnostic, four redundant CASE guards, qualified UTF8 custody-cost helper.
// run_001 is retained; its interrupted partial replay is not a completed result.
// R1 custody, generic native-row transport, invocation, and observation only.
// No field assignment, overlap classification, receipt or K is a runtime input.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {inspectInventory,observe} from './observe_indexed.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(here,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const j=JSON.stringify, need=(x,m)=>{if(!x)throw Error(m);};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const id=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:hash(b)};};
const put=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const save=(p,o)=>put(p,j(o,null,2)+'\n');
const worldPath=path.join(root,'j17_step_023/outputs/committed.world.json');
const oldSource=path.join(root,'j17_strict_discharge_diagnostic_008/source/diagnostic.mal');
const source=path.join(here,'source/r1_optimized.mal');
const indexSource=path.join(here,'source/list_parts_index.mal');
const originalPilotObservation=path.join(here,'run_002/batch_000.OBSERVATIONS.json');
const originalPilotReadback=path.join(here,'run_002/batch_000/stage/readback.bin');
const originalObservation=path.join(here,'run_001/qualification.OBSERVATIONS.json');
const originalReadback=path.join(here,'run_001/qualification/stage/readback.bin');
const fastQualification=path.join(here,'fast_lowerer/qualification_001/QUALIFICATION.json');
const lower=path.join(here,'fast_lowerer/lower.mjs');
const exe=path.join(root,'runtime_021/block_iterative_runtime.exe');
const qualification=path.join(root,'runtime_021/qualification_002/QUALIFICATION.json');
const oldOne='D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/FIBRE_ASSIGNMENTS_AND_RECEIPTS.json';
const oldTwo='D:/mal_worldline_backups/j17_pair_diagnostic_011/run_001/PAIR_ASSIGNMENTS_AND_RECEIPTS.json';
const independent=path.resolve(here,'../R1_INDEPENDENT_OBSERVATION.json');
const fixed=new Map([
 [worldPath,'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'],
 [oldSource,'9DEBF75815CCAE27FA7726ABDA0C33174B6C97ABCD39F8981E55B11D8F30046C'],
 [lower,'C0347EA6166C129AE4223B4E4E2EEB2F662C36520EBA55E5658F6EE23872FEDE'],
 [path.join(here,'fast_lowerer/source_occurrence_custody.mjs'),'B39A9474CBC3F4BB1E0089C0CB725F6664F1E604CBE2C2D0697DE51671CE81EE'],
 [fastQualification,'C4E1F151E820E10712CB3644A3F368C09F1F0605E6D6BD8F7BAAB1C2853C61D4'],
 [path.join(here,'source/r1.mal'),'9961C3CEB348831AC90858542552EE9BC9F889AE612DC331E7B3535BB2A9DDF1'],
 [path.join(here,'run.mjs'),'48F5C554E3C36347A28BA2CF80F9981B1EA0FBDBEC6A7A583C8667599BC32828'],
 [originalObservation,'95FF7468ACA8C111645E6FFF5C2223EE930BAE5BE7920AD177EF43DAA3E2620D'],
 [originalReadback,'92E6F084B886D21503182CD0A2A65890ABAA05572C6BC6330976BCCF77A9CCCE'],
 [exe,'9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06'],
 [qualification,'D2F42E635BF8095CE5BA3208B030D8F7F26E0A96074F78597833F1CE7D6E41F5'],
 [oldOne,'3CF8EBD03172E056852399AC472605EFEA3704EB6EB71A6EFFB259A2566B4147'],
 [oldTwo,'BF21091472DA1C4E61B4D75F3F27E8E9C48BE67742C8A6DC9DECE2D783BF981F'],
 [independent,'D3F47E53B283C688546E4EBE50FF514C716AC3A8851282DA7C859A5AB526EBEA']
]);
const additional=[source,indexSource,fileURLToPath(import.meta.url),path.join(here,'observe_indexed.mjs'),path.join(here,'observe.mjs'),
 originalPilotObservation,originalPilotReadback,path.join(here,'run_002/BATCH_000.json'),path.join(here,'run_optimized.mjs'),
 path.join(root,'j17_step_021/tools/source_occurrence_custody.mjs'),
 'C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs',
 path.join(root,'evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs'),
 path.join(root,'j17_section_diagnostic_009/source/sections.mal'),
 path.join(root,'j17_fibre_diagnostic_010/source/fibres.mal'),
 path.join(root,'j17_pair_diagnostic_011/source/pairs.mal'),
 path.resolve(here,'../REQUEST.json'),
 path.join(here,'run_001/INTERRUPTION_PRESTATE.json'),
 path.join(here,'run_001/qualification_replay.gpu.execution.json'),
 path.join(here,'run_001/STOP_qualify.json')];
const [mode,name,batchArgument,...extra]=process.argv.slice(2);
need(['batch','finalize'].includes(mode)&&name==='run_003'&&extra.length===0,'CLI_SCOPE');
const selectedBatch=mode==='batch'?Number(batchArgument):null;
need(mode==='finalize'?batchArgument===undefined:/^(?:[2-9]|[12][0-9])$/.test(batchArgument??'')&&Number.isInteger(selectedBatch)&&selectedBatch<30,'BATCH_SCOPE');
const out=path.join(here,name), capacity=4194304;
const world=read(worldPath);
need(world.field.length===480&&world.witness.length===720,'CARRIER_ARRAY_COUNTS');
function bindings(){
 const a=[];for(const[p,h]of fixed){const b=id(p);need(b.sha256===h,'NOT_SAME_INPUT '+p);a.push(b);}
 need(read(qualification).qualification==='SAME','RUNTIME_QUALIFICATION');
 need(read(fastQualification).verdict==='SAME','LOWERER_COST_QUALIFICATION');
 const original=fs.readFileSync(path.join(here,'source/r1.mal'),'utf8').replace(/\r\n/g,'\n').trimEnd();
 let expected=original;for(const [k,c] of Object.entries({SITE:'SITE(v,r)',EDGE:'EDGE(e,r)',TRIAD:'TRIAD(t,r)',PAIR:'PAIR(k,a,b,r)'}))expected=expected.replace('law R1_RETAIN_'+k+' := IF ','law R1_RETAIN_'+k+' := IF THIS(R1_CASE,'+c+'), ');
 const actual=fs.readFileSync(source,'utf8').replace(/\r\n/g,'\n').split('\n').filter(x=>!x.startsWith('//')).join('\n').trim();
 need(actual===expected.split('\n').filter(x=>!x.startsWith('//')).join('\n').trim(),'ONLY_REDUNDANT_CASE_GUARDS');
 const oldLines=fs.readFileSync(oldSource,'utf8').split(/\r?\n/);
 const helper='law KD_LIST_PARTS_019 := IF GOES_WITH(KD_LIST_REQUEST,CONS(a,x),CONS(b,y)) THEN GOES_WITH(KD_LIST_PARTS_019,CONS(a,x),CONS(b,y),a,x,b,y);';
 const expectedIndex=[helper,...['KD_LIST_HEAD_DIFF','KD_LIST_TAIL_DIFF'].map(k=>oldLines.find(x=>x.startsWith('law '+k+' :=')).replace('GOES_WITH(KD_LIST_REQUEST,CONS(a,x),CONS(b,y))','GOES_WITH(KD_LIST_PARTS_019,CONS(a,x),CONS(b,y),a,x,b,y)'))];
 need(j(fs.readFileSync(indexSource,'utf8').split(/\r?\n/).filter(x=>x.startsWith('law ')))===j(expectedIndex),'ONLY_NATIVE_LIST_PARTS_EXTENSION');
 return [...a,...additional.map(id)];
}
const checkBound=bound=>{for(const b of bound)need(id(b.path).sha256===b.sha256,'CUSTODY_NOT_SAME '+b.path);};
const currentBindings=bindings();
if(mode==='preflight'){
 console.log(j({verdict:'IF_THEN',scope:'PREPARATION_ONLY_NO_GPU',bound:currentBindings,capacity,readback_bytes:32+4194304*40+capacity*48}));
 process.exit(0);
}
let bound;
if(mode==='prepare'){
 need(!fs.existsSync(out),'PRESERVE_OUTPUT');fs.mkdirSync(out);bound=currentBindings;
 save(path.join(out,'INPUTS.json'),{schema:'R1NativeDiagnostic019',bound,scope:'Native 120 adjacent-site-union fields, 1924 diagnostic assignments per field; no world mutation',observer_only:[oldOne,oldTwo,independent,originalObservation,originalReadback,originalPilotObservation,originalPilotReadback],authority:'REQUEST.json; no PROMOTE or commit'});
}else{
 need(fs.existsSync(path.join(out,'INPUTS.json')),'PREPARE_FIRST');bound=read(path.join(out,'INPUTS.json')).bound;
 checkBound(bound);
}
const schedulingPath=path.join(out,'SCHEDULING_BINDING.json'),scheduling=read(schedulingPath);
need(Array.isArray(scheduling.bound)&&scheduling.bound.some(x=>path.resolve(x.path)===fileURLToPath(import.meta.url)),'SCHEDULE_EXECUTOR_CUSTODY');
const schedulingBound=[...scheduling.bound,id(schedulingPath)];checkBound(schedulingBound);
const genericNames=['KD_BYTE_SPAN','KD_BYTE_SPAN_MORE','KD_BYTE_DIFFER_F','KD_BYTE_DIFFER_R','KD_TEXT_REQUEST','KD_TEXT_PREFIX','KD_TEXT_HEAD_DIFF','KD_TEXT_LEFT_END','KD_TEXT_RIGHT_END','KD_TEXT_DIFF_PREFIX','KD_TEXT_DIFF','KD_ARRAY_REQUEST','KD_LIST_HEAD','KD_LIST_TAIL','KD_ARRAY_DIFF'];
const generic=fs.readFileSync(oldSource,'utf8').split(/\r?\n/).filter(s=>genericNames.some(n=>s.startsWith('law '+n+' :=')));
need(generic.length===genericNames.length,'DISTINCTION_FRAGMENT_CUSTODY');
function arr(v){need(Array.isArray(v),'ARRAY_TRANSPORT');return 'ARRAY('+list(v.map(atom))+')';}
function atom(v){return Array.isArray(v)?arr(v):j(v);}
function list(xs){return xs.reduceRight((t,x)=>`CONS(${x},${t})`,'NIL');}
function caseNative(c){
 if(c.family==='PAIR')return `PAIR(${c.operands[0]},${atom(c.operands[1])},${atom(c.operands[2])},${j(c.reading)})`;
 return `${c.family}(${atom(c.operands[0])},${j(c.reading)})`;
}
const inputNative=x=>`TWO_SITES(${arr(x.edge)})`;
function coverage(inv){
 const rows=[],proof=[];
 for(const c of inv.cases){
  const members=[...c.members].sort((a,b)=>j(a.flag).localeCompare(j(b.flag),'en'));
  need(members.length>0&&new Set(members.map(x=>j(x.flag))).size===members.length,'NATIVE_MEMBER_COVERAGE');
  const m=caseNative(c);let serial=0,level=[];
  for(const x of members){const n='N'+serial++;rows.push({type:'LEAF',caseTerm:c.term,node:n,flag:x.flag,term:`LEAF(${m},${n},${atom(x.flag)})`});level.push(n);}
  while(level.length>1){const next=[];for(let k=0;k<level.length;k+=2){if(k+1===level.length){next.push(level[k]);continue;}const n='N'+serial++;rows.push({type:'JOIN',caseTerm:c.term,node:n,left:level[k],right:level[k+1],term:`JOIN(${m},${n},${level[k]},${level[k+1]})`});next.push(n);}level=next;}
  rows.push({type:'ROOT',caseTerm:c.term,node:level[0],term:`ROOT(${m},${level[0]})`});
  proof.push({caseTerm:c.term,native_member_facts:members.map(x=>x.proof.fact??x.proof.id),leaves:members.length,joins:members.length-1,root:level[0]});
 }
 need(rows.filter(x=>x.type==='LEAF').length===5760&&rows.length===11520,'EXACT_COVERAGE_ROWS');
 return {rows,proof};
}
function wrapper(requests,coverRows=[],reverse=false){
 const seeds=[];
 for(let i=0;i<world.field.length;i++)seeds.push(`@readonly input R1_INPUT_FIELD_ROW := "g2:/field/${i}";`);
 for(let i=0;i<world.witness.length;i++)seeds.push(`@readonly input R1_INPUT_WITNESS_ROW := "g2:/witness/${i}";`);
 // Reversal changes only seed order, not the contents of coverage chunks.
 // Otherwise transport-tail facts would describe different input objects.
 const rows=coverRows;
 for(let i=0;i<rows.length;i+=16)seeds.push(`@propose seed R1_COVER_CHUNK_${i} := { THIS(R1_INPUT_COVER_CHUNK,ARRAY(${list(rows.slice(i,i+16).map(x=>x.term))})) };`);
 for(const term of requests)seeds.push(`@propose seed R1_REQUEST_SEED := { THIS(R1_REQUEST,${term}) };`);
 for(let i=32;i<126;i++)seeds.push(`@propose seed R1_BYTE := { GOES_WITH(KD_BYTE_NEXT,B${i},B${i+1}) };`);
 need(seeds.length<=2048,'SEED_CAPACITY');
 if(reverse)seeds.reverse();
 return '// Exact source rows, native-inventory coverage and execution grouping only.\n'+seeds.join('\n')+'\n'+generic.join('\n')+'\n'+fs.readFileSync(indexSource,'utf8')+'\n'+fs.readFileSync(source,'utf8');
}
function command(label,command,args,{gpu=false,timeout=1800000}={}){
 checkBound(bound);checkBound(schedulingBound);const started=new Date().toISOString();
 const result=spawnSync(command,args,{encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024,timeout});
 save(path.join(out,label+'.execution.json'),{command,args,started,ended:new Date().toISOString(),status:result.status,error:result.error?.message??null,stdout:result.stdout??'',stderr:result.stderr??'',gpu});
 checkBound(bound);checkBound(schedulingBound);need(!result.error&&result.status===0,'EXECUTION_STOP '+label+' '+result.error?.message+' '+result.stderr);
 console.log(j({finished:label,status:result.status,stdout:result.stdout?.trim()}));
}
function build(label,requests,coverRows=[],reverse=false){
 const dir=path.join(out,label);need(!fs.existsSync(dir),'PRESERVE_STAGE '+label);fs.mkdirSync(dir);
 const p=path.join(dir,'input.mal');put(p,wrapper(requests,coverRows,reverse));
 command(label+'.lower',process.execPath,[lower,p,path.join(dir,'stage'),'-','g2='+worldPath],{timeout:600000});
 return path.join(dir,'stage');
}
function gpu(label,stage){
 need(!fs.existsSync(path.join(stage,'readback.bin')),'PRESERVE_READBACK');
 command(label+'.gpu',exe,[path.join(stage,'image.bin'),path.join(stage,'readback.bin'),'--fact-capacity',String(capacity)],{gpu:true});
}
function exportObservation(label,stage,trials,options={}){
 const started=Date.now();
 const value=observe(stage,trials,options);
 // Full CHECK/AFTER relations were examined above and remain in readback.bin.
 // The handoff exports exact receipt sets and terminal proofs without duplicating
 // every intermediate field/overlap row in the same JSON string.
 for(const trial of value.trials)for(const c of trial.cases){delete c.checked;delete c.after;}
 const proofPath=path.join(out,label+'.NATIVE_PROOFS.json');save(proofPath,value.proofs);
 value.proofs_artifact=id(proofPath);delete value.proofs;
 value.summary.observer={elapsed_ms:Date.now()-started,max_rss_kib:process.resourceUsage().maxRSS,heap_used:process.memoryUsage().heapUsed,scope:'Full native coverage checked; intermediate rows retained in readback, exact receipts and terminal proofs exported'};
 save(path.join(out,label+'.OBSERVATIONS.json'),value);
 return value;
}
function invLoad(){return read(path.join(out,'NATIVE_INVENTORY.json'));}
function oldReference(){
 const entries=[];
 for(const c of read(oldOne).cases){if(['SITE','EDGE','TRIAD'].includes(c.family))entries.push({key:j([c.family,...c.operands]),...Object.fromEntries(['opened','discharged','retained'].map(k=>[k,c[k].map(x=>j(x.overlap)).sort()])),strict:c.strict.length>0});}
 for(const c of read(oldTwo).cases)entries.push({key:j(['PAIR',c.kind,c.a,c.b,c.reading]),...Object.fromEntries(['opened','discharged','retained'].map(k=>[k,c[k].map(x=>j(x.overlap)).sort()])),strict:c.strict.length>0});
 need(entries.length===1924&&new Set(entries.map(x=>x.key)).size===1924,'RETAINED_REFERENCE_COVERAGE');return new Map(entries.map(x=>[x.key,x]));
}
function referenceComparison(observation){
 const reference=oldReference();let comparisons=0;
 need(observation.trials.length===1,'G2_TRIAL_COUNT');
 for(const c of observation.trials[0].cases){const r=reference.get(c.key);need(r,'REFERENCE_CASE '+c.key);
  for(const k of ['opened','discharged','retained']){need(j(c[k].map(x=>x.key??j(x.overlap)).sort())===j(r[k]),'G2_RECEIPTS_NOT_SAME '+k+' '+c.key);comparisons++;}
  need((c.strict.length>0)===r.strict,'G2_STRICT_NOT_SAME '+c.key);comparisons++;
 }
 return {verdict:'IF_THEN',cases:reference.size,comparisons,scope:'SAME exact D/O/retained and strict for all 1924 retained g2 diagnostic offers'};
}
// This independent report is opened only AFTER native observation. It is never
// read by wrapper(), build(), source construction, input construction or GPU.
function independentComparison(observation,inv){
 const report=read(independent), flagIndex=new Map(world.field.map((x,i)=>[j(x[0]),i])), overlapIndex=new Map(world.witness.map((x,i)=>[j(x.slice(0,2)),i]));
 const signature=(indices,r)=>j([indices.slice().sort((a,b)=>a-b),r]);
 const offerIndex=new Map(report.offers.map((x,i)=>[signature(x.flag_indices,x.reading),i]));
 need(offerIndex.size===1924,'INDEPENDENT_OFFER_IDENTITY');
 const caseIndex=new Map(inv.cases.map(c=>[c.term,offerIndex.get(signature(c.members.map(x=>flagIndex.get(j(x.flag))),c.reading))]));
 need([...caseIndex.values()].every(x=>Number.isInteger(x))&&new Set(caseIndex.values()).size===1924,'INDEPENDENT_CASE_BIJECTION');
 const checks=[];
 for(const t of observation.trials){
  const entry=t.term==='G2'?report.qualification_g2:report.inputs.find(x=>inv.inputs.some(y=>y.term===t.term&&j(y.edge)===j(x.sites)));
  need(entry,'INDEPENDENT_INPUT_IDENTITY');
  const rows=t.cases.map(c=>[caseIndex.get(c.term),...['discharged','opened','retained'].map(k=>c[k].map(x=>overlapIndex.get(x.key??j(x.overlap))).sort((a,b)=>a-b))]).sort((a,b)=>a[0]-b[0]);
  need(rows.every(x=>x.slice(1).every(s=>s.every(n=>Number.isInteger(n)))),'INDEPENDENT_OVERLAP_BIJECTION');
  const digest=hash(Buffer.from(j(rows)+'\n')), strict=t.cases.filter(c=>c.strict.length).map(c=>caseIndex.get(c.term)).sort((a,b)=>a-b);
  need(digest===entry.receipt_rows_sha256&&j(strict)===j(entry.strict_offer_indices),'INDEPENDENT_RECEIPTS_NOT_SAME');
  checks.push({input:t.term,cases:1924,receipt_rows_sha256:digest,strict_count:strict.length,comparison:'SAME'});
 }
 return {observer_only:id(independent),checks};
}
try{
 need(read(path.join(out,'QUALIFICATION.json')).verdict==='IF_THEN','QUALIFICATION_REQUIRED');
 need(read(path.join(out,'PILOT_ORIGINAL_EQUIVALENCE.json')).verdict==='IF_THEN','PILOT_EQUIVALENCE_REQUIRED');
 need(read(path.join(out,'BATCH_000.json')).verdict==='IF_THEN'&&read(path.join(out,'BATCH_001.json')).verdict==='IF_THEN','COMPLETED_SEQUENTIAL_PREFIX_REQUIRED');
 const inv=invLoad(),cov=read(path.join(out,'COVERAGE.json')),inputs=[...inv.inputs].sort((a,b)=>j(a.edge).localeCompare(j(b.edge),'en'));
 const batches=[];for(let i=0;i<inputs.length;i+=4)batches.push(inputs.slice(i,i+4));need(batches.length===30,'BATCH_COVERAGE');
 if(mode==='batch'){
  const b=selectedBatch,label='batch_'+String(b).padStart(3,'0'),batch=batches[b];
  need(!fs.existsSync(path.join(out,'BATCH_'+String(b).padStart(3,'0')+'.json')),'PRESERVE_BATCH_RECORD');
  const stage=build(label,batch.map(inputNative),cov.rows);gpu(label,stage);
  const o=exportObservation(label,stage,batch.map(x=>x.term)),check=independentComparison(o,inv);
  save(path.join(out,'BATCH_'+String(b).padStart(3,'0')+'.json'),{verdict:'IF_THEN',batch:b,inputs:batch.map(x=>({term:x.term,edge:x.edge})),summary:o.summary,independent:check,readback:id(path.join(stage,'readback.bin')),observations:id(path.join(out,label+'.OBSERVATIONS.json')),executor:id(fileURLToPath(import.meta.url)),execution_schedule:id(schedulingPath)});
  console.log(j({batch:b,...o.summary,independent:'SAME',executor:id(fileURLToPath(import.meta.url))}));
 }else{
  const records=batches.map((x,i)=>read(path.join(out,'BATCH_'+String(i).padStart(3,'0')+'.json')));
  need(records.every((x,i)=>x.verdict==='IF_THEN'&&x.batch===i&&j(x.inputs.map(y=>y.term).sort())===j(batches[i].map(y=>y.term).sort())),'FULL_BATCH_IDENTITY');
  need(new Set(records.flatMap(x=>x.inputs.map(y=>y.term))).size===120,'FULL_INPUT_COVERAGE');
  checkBound(bound);checkBound(schedulingBound);
  save(path.join(out,'RUN_RECORD_R1.json'),{verdict:'IF_THEN',scope:'Exactly120 adjacent-site-union input fields times1924 constant incidence-fibre assignment diagnostics; K from native strict facts; scheduling only differs',inputs:120,offers_per_input:1924,receipt_cases:120*1924,batches:records,qualification:id(path.join(out,'QUALIFICATION.json')),pilot_equivalence:id(path.join(out,'PILOT_ORIGINAL_EQUIVALENCE.json')),index_source:id(indexSource),observer:id(path.join(here,'observe_indexed.mjs')),bound,execution_schedule:id(schedulingPath),executor:id(fileURLToPath(import.meta.url)),worldline:'UNCHANGED',promotion:'NOT_PERFORMED',repository_commit:'NOT_PERFORMED'});
 }
}catch(error){const suffix=mode==='batch'?String(selectedBatch).padStart(3,'0'):'finalize',target=path.join(out,'STOP_scheduled_'+suffix+'.json');if(!fs.existsSync(target))save(target,{reading:'MAYBE',reason:error.message,mode,batch:selectedBatch,worldline:'UNCHANGED'});throw error;}
