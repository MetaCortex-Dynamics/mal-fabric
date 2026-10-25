// Recovery of invocation wiring only. Retains the completed native effect and
// replay, observation bytes, and failed first lower log without modification.
// Original run.mjs omitted lower.mjs's positional inputJSON argument. This
// continuation supplies it before named aliases; .mal source remains unchanged.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {openReadback,sha} from '../../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const [runName='execution_001',finishName='finish_001']=process.argv.slice(2),base=path.join(here,runName),out=path.join(base,finishName);
const need=(x,m)=>{if(!x)throw Error(m);},j=JSON.stringify;
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'}),save=(p,o)=>write(p,j(o,null,2)+'\n');
const id=p=>{const b=fs.readFileSync(p);return{path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;
const cj=v=>j(canon(v)),digest=v=>sha(Buffer.from(cj(v))).toLowerCase();
const bindings=JSON.parse(fs.readFileSync(path.join(base,'BINDINGS.json'))).bindings;
for(const b of bindings)need(id(b.path).sha256===b.sha256,'BINDING_NOT_SAME '+b.path);
const resultPath=path.join(base,'NATIVE_RESULTS.json'),result=JSON.parse(fs.readFileSync(resultPath)),rendered=result.cases;
const native=openReadback(path.join(base,'native')),replay=openReadback(path.join(base,'native_replay'));
need(sha(native.raw)===sha(replay.raw)&&sha(native.raw)===result.readback.sha256,'REPLAY_NOT_SAME');
const worldPath=path.join(root,'j17_step_023/outputs/committed.world.json'),world=JSON.parse(fs.readFileSync(worldPath)),head=world.chain.at(-1).link;
need(id(worldPath).sha256==='E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059','WORLD_NOT_SAME');
need(rendered.length===12,'CASE_COUNT');
const observationsPath=path.join(base,'observations.json'),observations=rendered.flatMap(c=>['OUT','BACK'].map(s=>[c.context,s,c[s].field,c[s].witness,c[s].receipt,c[s].receipt_reading,c[s].lift]));
need(fs.readFileSync(observationsPath,'utf8')===j(observations),'OBSERVATION_NOT_SAME');
for(const c of rendered){
 need(j(c.BACK.field)===j(world.field)&&j(c.BACK.witness)===j(world.witness),'ENDPOINT_NOT_SAME');
 for(const s of ['OUT','BACK','ENDPOINT']){const x=c[s],f=native.facts[x.receipt_reading_fact],n=native.node(f.term);need(native.node(n.c[0]).s==='R2_RECEIPT_READING'&&native.value(n.c[3])===x.receipt_reading,'READING_NOT_SOURCE_DERIVED');}
 need(c.ENDPOINT.receipt_reading==='NO'&&!c.ENDPOINT.receipt.discharged.length&&!c.ENDPOINT.receipt.opened.length,'ENDPOINT_RECEIPT');
}
const lower=path.join(here,'source/lower.mjs'),exe=path.join(root,'runtime_021/block_iterative_runtime.exe'),source=path.join(base,'commit.mal');
need(!fs.existsSync(out)&&path.dirname(out)===base,'FRESH_RECOVERY_DIRECTORY');fs.mkdirSync(out);
const recoveryInputs=[resultPath,observationsPath,source,path.join(base,'native/readback.bin'),path.join(base,'native_replay/readback.bin'),path.join(base,'commit_0_lower.execution.json'),fileURLToPath(import.meta.url)].map(id);
save(path.join(out,'RECOVERY_CUSTODY.json'),{scope:'INVOCATION_ARGUMENT_SLOT_REPAIR_ONLY; RETAINED_NATIVE_EFFECT_AND_REPLAY',inputs:recoveryInputs,previous_failure:'observations alias occupied positional inputJSON slot',repair:'explicit positional inputJSON followed by named observations and hashes aliases',effect_rerun:'NO',source_change:'NONE'});
function command(label,cmd,args){const start=new Date().toISOString();console.log(label,start);const p=spawnSync(cmd,args,{encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024,timeout:1800000});save(path.join(out,label+'.execution.json'),{cmd,args,start,end:new Date().toISOString(),status:p.status,error:p.error?.message,stdout:p.stdout,stderr:p.stderr});need(p.status===0&&!p.error,'EXECUTION_STOP '+label+' '+p.stderr);}
function gpu(label,image,map){const d=path.join(out,label);fs.mkdirSync(d);write(path.join(d,'source-map.json'),fs.readFileSync(map));command(label,exe,[image,path.join(d,'readback.bin'),'--fact-capacity','262144']);return openReadback(d);}
const responses=[],responseKeys=new Set(),serviceCustody=[];let last,lastDirectory;
for(let pass=0;pass<5;pass++){
 const tag='commit_'+pass,hashPath=path.join(out,tag+'.hashes.json');write(hashPath,j(responses));
 command(tag+'_lower',process.execPath,[lower,source,path.join(out,tag+'_image'),observationsPath,'observations='+observationsPath,'hashes='+hashPath]);
 last=gpu(tag,path.join(out,tag+'_image/image.bin'),path.join(out,tag+'_image/source-map.json'));lastDirectory=path.join(out,tag);
 let added=0;
 for(const f of last.predicate('GPU_HASH_REQUEST')){const n=last.node(f.term),subject=last.value(n.c[3]),key=cj(subject);if(responseKeys.has(key))continue;responseKeys.add(key);const hash=digest(subject);responses.push([subject,hash]);serviceCustody.push({pass,fact:f.id,rule:f.origin,subject_sha256:hash});added++;}
 if(!added)break;
}
need(last&&last.predicate('R2_DIAGNOSTIC_CHAIN').length===12,'DIAGNOSTIC_CHAIN_INCOMPLETE');
need(last.predicate('R2_WRONG_PREV_REQUEST').length===12&&last.predicate('R2_WRONG_PREV_ACCEPTED').length===0,'WRONG_PREV_CONTROL');
need(native.predicate('R2_UNOFFERED_REQUEST').length===12&&native.predicate('R2_UNOFFERED_ACCEPTED').length===0,'UNOFFFERED_CONTROL');
const chains=[];
for(const f of last.predicate('R2_DIAGNOSTIC_CHAIN')){
 const n=last.node(f.term),context=last.value(n.c[1]),origin=last.value(n.c[2]),chain=last.value(n.c[3]),c=rendered.find(x=>x.context===context);need(c&&chain.length===2&&origin===head,'CHAIN_CONTEXT');
 need(chain[0].record.prev===head&&chain[1].record.prev===chain[0].link&&chain[0].link!==chain[1].link&&chain[1].link!==head,'PREDECESSOR_CHAIN');
 for(const [i,s] of ['OUT','BACK'].entries()){const e=chain[i],x=c[s];need(e.link===digest(e.record)&&e.record.pair_hash===digest({field:x.field,witness:x.witness})&&e.record.receipt_hash===digest(x.receipt),'CHAIN_HASH');need(j(e.record.field)===j(x.field)&&j(e.record.witness)===j(x.witness)&&j(e.record.receipt)===j(x.receipt),'CHAIN_SUBJECT');}
 chains.push({context,origin,chain,endpoint_receipt:c.ENDPOINT.receipt,endpoint_receipt_reading:c.ENDPOINT.receipt_reading});
}
write(path.join(out,'diagnostic.chains.json'),cj(chains));save(path.join(out,'HASH_SERVICE_CUSTODY.json'),serviceCustody);
for(const b of [...bindings,...recoveryInputs])need(id(b.path).sha256===b.sha256,'POST_RUN_BINDING_NOT_SAME '+b.path);
const summary=rendered.map(c=>({context:c.context,out:{discharged:c.OUT.receipt.discharged.length,opened:c.OUT.receipt.opened.length,retained:c.OUT.retained,reading:c.OUT.receipt_reading},back:{discharged:c.BACK.receipt.discharged.length,opened:c.BACK.receipt.opened.length,retained:c.BACK.retained,reading:c.BACK.receipt_reading},endpoint:{discharged:c.ENDPOINT.receipt.discharged.length,opened:c.ENDPOINT.receipt.opened.length,retained:c.ENDPOINT.retained,reading:c.ENDPOINT.receipt_reading},field:'SAME',witness:'SAME',forward_offer:c.OUT.offered_fact,inverse_offer:c.BACK.offered_fact}));
const record={scope:'12 ISOLATED DIAGNOSTIC PAIR CHAINS; NATIVE D2 LIFT EFFECT; NOT LIVE WORLD, NOT ENTITY INVENTORY, NOT SHELL HALF TURN',verdict:'IF_THEN',source:id(path.join(base,'source.mal')),commit_source:id(source),native_readback:id(path.join(base,'native/readback.bin')),replay_readback:id(path.join(base,'native_replay/readback.bin')),replay:'SAME',facts:native.count,epochs:native.epochs,qualified_lowerer_images:'SAME',offered_family:'SAME12 AGAINST BOUND228',branches:summary,chains:id(path.join(out,'diagnostic.chains.json')),commit_readback:id(path.join(lastDirectory,'readback.bin')),hash_service:id(path.join(out,'HASH_SERVICE_CUSTODY.json')),native_results:id(resultPath),recovery:id(path.join(out,'RECOVERY_CUSTODY.json')),controls:{unoffered_alias_inverse:'WITHHELD12; ACCEPTED0',wrong_predecessor:'WITHHELD12; ACCEPTED0'},live_world:id(worldPath),live_world_status:'UNCHANGED'};
save(path.join(out,'RUN_RECORD_R2_019.json'),record);console.log(j({record:id(path.join(out,'RUN_RECORD_R2_019.json')),branches:12,new_diagnostic_links:24,replay:'SAME'}));
