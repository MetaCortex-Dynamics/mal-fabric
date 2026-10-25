// Test P custody, exact source-row transport, native invocation and observation.
// This host program does not compute K, select a member, construct a successor,
// or feed a second field. SHA256 answers only native GPU_HASH_REQUEST subjects.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {observe} from './observe.mjs';
import {prepareCommitInputs,appendHashResponseSeeds,continueCommitHashes,inspectNativeCommit,materializeNativeCommit} from './commit/finish.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'..');
const r1=path.join(root,'j17_t_r2_r1_diagnostics_019/R1');
const j=JSON.stringify,need=(x,m)=>{if(!x)throw Error(m);};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const id=p=>{const b=fs.readFileSync(p);return{path:path.resolve(p),bytes:b.length,sha256:hash(b)};};
const put=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const save=(p,v)=>put(p,j(v,null,2)+'\n');
const worldPath=path.join(root,'j17_step_023/outputs/committed.world.json');
const oldSource=path.join(root,'j17_strict_discharge_diagnostic_008/source/diagnostic.mal');
const r1Source=path.join(r1,'source/r1_optimized.mal'),indexSource=path.join(r1,'source/list_parts_index.mal');
const source=path.join(here,'source/proposer_reentry.mal'),commitSource=path.join(here,'commit/source.mal');
const lower=path.join(r1,'fast_lowerer/lower.mjs'),exe=path.join(root,'runtime_021/block_iterative_runtime.exe');
const guard=path.join(root,'runtime_021/prefill_guard_runtime.mjs');
const inventoryPath=path.join(r1,'run_003/NATIVE_INVENTORY.json'),coveragePath=path.join(r1,'run_003/COVERAGE.json');
const sourcePairHash='e3cb79631ee00239da1f97b5ae7a9c65cd2cd138c915c093185d3bf90e4c6cc9';
const capacity=4194304;
const fixed=new Map([
 [worldPath,'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'],
 [oldSource,'9DEBF75815CCAE27FA7726ABDA0C33174B6C97ABCD39F8981E55B11D8F30046C'],
 [r1Source,'E8567527605453C6332BF5BC19D84A5EFF4DBA5B017F2819547B04AFE58392A9'],
 [indexSource,'1B5C14F9D25606279E2401E743D0EE4030B3E4582499D0F28805989E720D7AB9'],
 [lower,'C0347EA6166C129AE4223B4E4E2EEB2F662C36520EBA55E5658F6EE23872FEDE'],
 [path.join(r1,'fast_lowerer/source_occurrence_custody.mjs'),'B39A9474CBC3F4BB1E0089C0CB725F6664F1E604CBE2C2D0697DE51671CE81EE'],
 [path.join(r1,'fast_lowerer/qualification_001/QUALIFICATION.json'),'C4E1F151E820E10712CB3644A3F368C09F1F0605E6D6BD8F7BAAB1C2853C61D4'],
 [exe,'9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06'],
 [guard,'1AC89C5A0256953279B0A772210721E1D7B8BCB894B4616A4DE6BC0B2FA9DA70'],
 [path.join(root,'runtime_021/qualification_002/QUALIFICATION.json'),'D2F42E635BF8095CE5BA3208B030D8F7F26E0A96074F78597833F1CE7D6E41F5'],
 [inventoryPath,'0BFB3DFF879498037317A006F4790311AEF1357E42659931293E0C202DB91202'],
 [coveragePath,'A04FD7C446D7DF7926715C5A55C20B98B0598AF9FA7E8C120DAB01EB7775A408'],
 [path.join(r1,'run_003/INVENTORY_RECORD.json'),'F01CCF31C04486E79EB923445A5AA9E509C95410FDF2117FA590581D8D2AEA10'],
 [path.join(r1,'run_003/qualification.OBSERVATIONS.json'),'5E8E814B8EF8EEEB29E2C60C5B82E2D049E598413C630022171EB579A5D20797'],
 [path.join(root,'j17_tick_promote_binding_013/BINDING_EVIDENCE.json'),'171CD86278BD859418D42A198D13466CEC5BB0204E4FB00F3F2FD99D87F8B6F4'],
 [path.join(root,'evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs'),'4612D0189AD00B89522C8CD9F472E39EB1574991F5FB4241FF3CD85F415E32D3'],
 [commitSource,'B8AEDC68816012AC9819BD5162612C1DDEF0E014D61A4BB40BA87D52E1C3DDED'],
 [path.join(here,'commit/finish.mjs'),'9875705B9561F6025B02C01F24E0308CE5A37D1B9CD241FFDACB1DB40A545178']
]);
const additional=[source,fileURLToPath(import.meta.url),path.join(here,'observe.mjs'),path.join(here,'REQUEST.json'),
 path.join(root,'j17_step_021/tools/source_occurrence_custody.mjs'),
 'C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs',
 path.join(root,'j17_tick_promote_binding_013/RECORD_J17_TICK_PROMOTE_BINDING_013.mal')];
const [mode,name='run_001']=process.argv.slice(2);
need(['preflight','prepare','normal','qualify'].includes(mode)&&/^run_[0-9]+$/.test(name),'CLI_SCOPE');
const out=path.join(here,name);
const world=read(worldPath),inv=read(inventoryPath),coverage=read(coveragePath);
need(world.field.length===480&&world.witness.length===720&&inv.cases.length===1924&&coverage.rows.length===11520,'EXACT_NATIVE_INVENTORY_EXTENTS');
function bindings(){
 const rows=[];for(const[p,h]of fixed){const x=id(p);need(x.sha256===h,'INPUT_NOT_SAME '+p);rows.push(x);}
 const ir=read(path.join(r1,'run_003/INVENTORY_RECORD.json'));
 for(const x of [ir.readback,inv.source_map])if(x?.path){const actual=id(x.path);need(actual.sha256===x.sha256&&(x.bytes===undefined||actual.bytes===x.bytes),'NATIVE_INVENTORY_CUSTODY');rows.push(actual);}
 need(read(path.join(root,'runtime_021/qualification_002/QUALIFICATION.json')).qualification==='SAME','RUNTIME_QUALIFICATION');
 return [...rows,...additional.map(id)];
}
const current=bindings();
const checkBound=()=>{for(const x of bound){const y=id(x.path);need(y.sha256===x.sha256&&y.bytes===x.bytes,'CUSTODY_NOT_SAME '+x.path);}};
const genericNames=['KD_BYTE_SPAN','KD_BYTE_SPAN_MORE','KD_BYTE_DIFFER_F','KD_BYTE_DIFFER_R','KD_TEXT_REQUEST','KD_TEXT_PREFIX','KD_TEXT_HEAD_DIFF','KD_TEXT_LEFT_END','KD_TEXT_RIGHT_END','KD_TEXT_DIFF_PREFIX','KD_TEXT_DIFF','KD_ARRAY_REQUEST','KD_LIST_HEAD','KD_LIST_TAIL','KD_ARRAY_DIFF'];
const generic=fs.readFileSync(oldSource,'utf8').split(/\r?\n/).filter(s=>genericNames.some(n=>s.startsWith('law '+n+' :=')));
need(generic.length===genericNames.length,'GENERIC_FRAGMENT_CUSTODY');
const list=xs=>xs.reduceRight((tail,x)=>`CONS(${x},${tail})`,'NIL');
function tree(kind,leaves){
 const rows=[];let serial=0,level=[];const node=()=>`P20_${kind}_N${serial++}`;
 for(const leaf of leaves){const n=node();rows.push({type:kind+'_LEAF',node:n,term:`${kind}_LEAF(${n},${leaf})`});level.push(n);}
 while(level.length>1){const next=[];for(let i=0;i<level.length;i+=2){if(i+1===level.length){next.push(level[i]);continue;}const n=node();rows.push({type:kind+'_JOIN',node:n,left:level[i],right:level[i+1],term:`${kind}_JOIN(${n},${level[i]},${level[i+1]})`});next.push(n);}level=next;}
 rows.push({type:kind+'_ROOT',node:level[0],term:`${kind}_ROOT(${level[0]})`});return{rows,root:level[0],leaves:leaves.length};
}
const kt=tree('K',inv.cases.map(c=>c.term));
const ft=tree('FIELD',inv.flags.map(f=>f.term));
const flagTerm=new Map(inv.flags.map(f=>[j(f.flag),f.term]));
const wt=tree('WITNESS',inv.overlaps.map(w=>w.overlap.map(f=>{const term=flagTerm.get(j(f));need(term,'WITNESS_FLAG_IDENTITY');return term;}).join(',')));
const groupRows=[...kt.rows,...ft.rows,...wt.rows,{type:'RETURN_ROOT',term:`RETURN_ROOT(${ft.root},${wt.root})`}];
need(groupRows.length===6249,'EXACT_GROUPING_EXTENTS');
const executionSources=[oldSource,indexSource,r1Source,source,commitSource];
function environment(){const s=fs.statfsSync(out);return{node:process.version,platform:process.platform,architecture:process.arch,heap_limit_request_mib:8192,capacity,term_capacity:4194304,readback_bytes:32+4194304*40+capacity*48,output_volume_free_bytes:Number(s.bavail)*Number(s.bsize),scope:'Execution capacity/custody only; no semantic input selection'};}
if(mode==='preflight'){
 console.log(j({verdict:'IF_THEN',scope:'READ_ONLY_NO_GPU',bound:current,counts:{cases:1924,flags:480,overlaps:720,member_coverage_rows:11520,grouping_rows:6249},capacity}));process.exit(0);
}
let bound,commitInputs;
if(mode==='prepare'){
 need(!fs.existsSync(out),'PRESERVE_OUTPUT');fs.mkdirSync(out);bound=current;
 commitInputs=prepareCommitInputs(path.join(out,'commit_inputs'),{executionSources});
 save(path.join(out,'INPUTS.json'),{schema:'TestP020',bound,namedInputs:commitInputs.namedInputs,commit_input_custody:id(commitInputs.custodyPath),scope:'Exact 1924 native offer domain; exhaustive native singleton; native pair commit; committed-return-gated re-entry; no original world overwrite',source_pair_hash:sourcePairHash,world_file:current.find(x=>x.path===path.resolve(worldPath)),generic_laws:genericNames,execution_sources:executionSources.map(id),observer_only:[path.join(r1,'run_003/qualification.OBSERVATIONS.json')],environment:environment()});
 save(path.join(out,'GROUPING.json'),{scope:'Complete native inventory transport only; not result or member selection',inventory:id(inventoryPath),coverage:id(coveragePath),rows:groupRows,counts:{K:kt.leaves,FIELD:ft.leaves,WITNESS:wt.leaves}});
}else{
 const inputs=read(path.join(out,'INPUTS.json'));bound=inputs.bound;checkBound();
 need(id(inputs.commit_input_custody.path).sha256===inputs.commit_input_custody.sha256,'COMMIT_INPUT_CUSTODY');
 const custody=read(inputs.commit_input_custody.path);for(const x of [...custody.bound,...custody.sources,custody.execution_source,custody.binding_transport])need(id(x.path).sha256===x.sha256,'COMMIT_INPUT_NOT_SAME');
 commitInputs={sourceText:fs.readFileSync(commitSource,'utf8'),namedInputs:inputs.namedInputs};
}
function wrapper(variant){
 const seeds=[];
 for(let i=0;i<world.field.length;i++)seeds.push(`@readonly input R1_INPUT_FIELD_ROW := "g2:/field/${i}";`);
 for(let i=0;i<world.witness.length;i++)seeds.push(`@readonly input R1_INPUT_WITNESS_ROW := "g2:/witness/${i}";`);
 for(let i=0;i<coverage.rows.length;i+=32)seeds.push(`@propose seed P20_COVER_${i} := { THIS(R1_INPUT_COVER_CHUNK,ARRAY(${list(coverage.rows.slice(i,i+32).map(x=>x.term))})) };`);
 const rows=groupRows.filter(x=>!(variant==='missing_return'&&x.type==='RETURN_ROOT')&&!(variant==='missing_k_root'&&x.type==='K_ROOT'));
 for(let i=0;i<rows.length;i+=32)seeds.push(`@propose seed P20_GROUP_${i} := { THIS(P20_INPUT_CHUNK,ARRAY(${list(rows.slice(i,i+32).map(x=>x.term))})) };`);
 seeds.push('@propose seed P20_REQUEST := { THIS(R1_REQUEST,G2) };');
 seeds.push(`@propose seed P20_SOURCE := { THIS(P20_SOURCE_ID,${j(sourcePairHash)}) };`);
 seeds.push(`@propose seed P20_CHAIN_MODE := { THIS(P20_MODE,${variant==='reload_g2'?'RELOAD_G2':'CHAIN'}) };`);
 for(let i=32;i<126;i++)seeds.push(`@propose seed P20_BYTE := { GOES_WITH(KD_BYTE_NEXT,B${i},B${i+1}) };`);
 need(seeds.length+11+16<=2048,'SEED_CAPACITY');
 // Only declaration order reverses. Chunk contents and all fixed law files stay SAME.
 if(variant==='reversed')seeds.reverse();
 return '// Test P exact source rows and inventory grouping; no selected move or second field.\n'+seeds.join('\n')+'\n'+generic.join('\n')+'\n'+fs.readFileSync(indexSource,'utf8')+'\n'+fs.readFileSync(r1Source,'utf8')+'\n'+fs.readFileSync(source,'utf8')+'\n'+commitInputs.sourceText;
}
function command(label,command,args,{gpu=false,timeout=7200000}={}){
 checkBound();const started=new Date().toISOString();
 const result=spawnSync(command,args,{encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024,timeout});
 save(path.join(out,label+'.execution.json'),{command,args,started,ended:new Date().toISOString(),status:result.status,error:result.error?.message??null,stdout:result.stdout??'',stderr:result.stderr??'',gpu});
 checkBound();need(!result.error&&result.status===0,'EXECUTION_STOP '+label+' '+result.error?.message+' '+result.stderr);
 console.log(j({finished:label,status:result.status,stdout:result.stdout?.trim()}));
}
function build(label,text,extra={}){
 const dir=path.join(out,label);need(!fs.existsSync(dir),'PRESERVE_STAGE '+label);fs.mkdirSync(dir);
 const input=path.join(dir,'input.mal');put(input,text);const stage=path.join(dir,'stage');
 const named={g2:worldPath,...commitInputs.namedInputs,...extra};
 command(label+'.lower',process.execPath,['--max-old-space-size=8192',lower,input,stage,'-',...Object.entries(named).map(([k,v])=>k+'='+v)],{timeout:900000});
 const map=read(path.join(stage,'source-map.json'));need(map.seeds.length<=2048,'LOWERED_SEED_CAPACITY');
 return{readbackDirectory:stage,mapPath:path.join(stage,'source-map.json'),imagePath:path.join(stage,'image.bin'),sourcePath:input};
}
function gpu(label,stage){need(!fs.existsSync(path.join(stage.readbackDirectory,'readback.bin')),'PRESERVE_READBACK');command(label+'.gpu',exe,[stage.imagePath,path.join(stage.readbackDirectory,'readback.bin'),'--fact-capacity',String(capacity)],{gpu:true});}
function observation(label,stage,variant){
 const started=Date.now(),value=observe(stage.readbackDirectory,{variant});
 for(const t of value.trials??[])for(const c of t.cases??[]){delete c.checked;delete c.after;}
 const pp=path.join(out,label+'.NATIVE_PROOFS.json');save(pp,value.proofs);value.proofs_artifact=id(pp);delete value.proofs;
 value.summary.observer={elapsed_ms:Date.now()-started,max_rss_kib:process.resourceUsage().maxRSS,heap_used:process.memoryUsage().heapUsed};
 const op=path.join(out,label+'.OBSERVATIONS.json');save(op,value);return{value,path:op,identity:id(op)};
}
async function runVariant(label,variant,{prepared=false,precommit=false}={}){
 const fixedSource=wrapper(variant),first=prepared?{readbackDirectory:path.join(out,label+'_initial/stage'),mapPath:path.join(out,label+'_initial/stage/source-map.json'),imagePath:path.join(out,label+'_initial/stage/image.bin'),sourcePath:path.join(out,label+'_initial/input.mal')}:build(label+'_initial',fixedSource);
 need(fs.readFileSync(first.sourcePath,'utf8')===fixedSource,'FIXED_WRAPPER_NOT_SAME');gpu(label+'_initial',first);
 if(precommit)observation(label+'_precommit',first,'precommit');
 const service=await continueCommitHashes({initialStage:first,outputDirectory:path.join(out,label+'_hash_service'),
  buildNext:({round,hashRowsPath,responses})=>build(label+'_round_'+String(round).padStart(2,'0'),appendHashResponseSeeds(fixedSource,responses),{commit_hashes:hashRowsPath}),
  runGuard:(previous,next,{round})=>{
   const guardReportPath=path.join(next.readbackDirectory,'GUARD.json');
   command(label+'_round_'+String(round).padStart(2,'0')+'.resume',process.execPath,['--max-old-space-size=8192',guard,'--previous-map',previous.mapPath,'--previous-image',previous.imagePath,'--previous-readback',path.join(previous.readbackDirectory,'readback.bin'),'--next-map',next.mapPath,'--next-image',next.imagePath,'--exe',exe,'--output',path.join(next.readbackDirectory,'readback.bin'),'--report',guardReportPath,'--fact-capacity',String(capacity),'--run'],{gpu:true});
   return{guardReportPath};
  },onRound:({round,responseCount})=>console.log(j({finished:label+'_hash_round',round,responseCount}))});
 const obs=observation(label,service.finalStage,variant);
 const record={variant,initialStage:first,finalStage:service.finalStage,observation:obs.identity,hash_service:service.serviceIdentity,response_count:service.responseCount,rounds:service.rounds,closure_sha256:obs.value.closure_sha256,environment:environment()};
 save(path.join(out,label+'.RESULT.json'),record);return{record,observation:obs.value};
}
try{
 if(mode==='prepare'){
  const stage=build('normal_initial',wrapper('normal'));
  save(path.join(out,'PREPARED.json'),{verdict:'IF_THEN',execution:'NOT_RUN',stage,source:id(source),image:id(stage.imagePath),source_map:id(stage.mapPath),grouping:id(path.join(out,'GROUPING.json')),environment:environment()});
 }else if(mode==='normal'){
  await runVariant('normal','normal',{prepared:true,precommit:true});
 }else if(mode==='qualify'){
  const normal=read(path.join(out,'normal.RESULT.json')),normalObs=read(normal.observation.path);
  need(id(normal.observation.path).sha256===normal.observation.sha256,'NORMAL_OBSERVATION_CUSTODY');
  const replay=await runVariant('replay','normal');
  need(normal.rounds.length===replay.record.rounds.length,'REPLAY_ROUND_COUNT');
  const replayRows=normal.rounds.map((x,i)=>{const a=x.stage.readback,b=replay.record.rounds[i].stage.readback;need(a.sha256===b.sha256&&a.bytes===b.bytes,'REPLAY_READBACK_NOT_SAME');return{normal:a,replay:b,comparison:'SAME'};});
  need(normal.closure_sha256===replay.record.closure_sha256,'REPLAY_CLOSURE_NOT_SAME');
  const reversed=await runVariant('reversed','reversed');need(normal.closure_sha256===reversed.record.closure_sha256,'REVERSED_CLOSURE_NOT_SAME');
  const controls=[];for(const variant of ['missing_return','missing_k_root','reload_g2']){const result=await runVariant(variant,variant);controls.push({variant,result:id(path.join(out,variant+'.RESULT.json')),observation:result.record.observation});}
  const native=inspectNativeCommit(normal.finalStage),replayCommit=inspectNativeCommit(replay.record.finalStage),reversedCommit=inspectNativeCommit(reversed.record.finalStage);
  need(native.link===replayCommit.link&&native.link===reversedCommit.link,'COMMIT_LINK_NOT_SAME');
  const qualification={verdict:'IF_THEN',scope:'Native 1924-domain singleton, one pair-world link, same-source proposer re-entry; not full FABRIC_STATE or law promotion',normal:id(path.join(out,'normal.RESULT.json')),replay:id(path.join(out,'replay.RESULT.json')),reversed:id(path.join(out,'reversed.RESULT.json')),replay_readbacks:replayRows,replay_closure:'SAME',reversal:'SAME',reversal_scope:'All initial R1/P20/KD transport declarations reversed; fixed commit declarations and chunk contents retained',controls,commit_controls:native.controls,prior_head:native.prior_head,link:native.link,pair_hash:native.pair_hash,receipt_hash:native.receipt_hash,normal_summary:normalObs.summary,environment:environment()};
  save(path.join(out,'QUALIFICATION.json'),qualification);checkBound();
  const materialized=materializeNativeCommit(normal.finalStage,path.join(out,'committed.world.json'));
  save(path.join(out,'NATIVE_COMMIT.json'),{verdict:'IF_THEN',scope:materialized.scope,artifact:materialized.artifact,prior_head:materialized.prior_head,link:materialized.link,pair_hash:materialized.pair_hash,receipt_hash:materialized.receipt_hash,native_return:materialized.native_return,native_world:materialized.native_world,stage:materialized.stage,qualification:id(path.join(out,'QUALIFICATION.json')),original_world:id(worldPath)});
  checkBound();
 }
}catch(error){const stop=path.join(out,'STOP_'+mode+'.json');if(fs.existsSync(out)&&!fs.existsSync(stop))save(stop,{verdict:'MAYBE',message:error.message,stack:error.stack,at:new Date().toISOString(),scope:'All completed and partial artifacts retained; no original world overwrite'});throw error;}
