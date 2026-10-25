// Authoring/custody, native GPU invocation, generic observation, requested SHA.
// No host field update, inverse effect, wall predicate, or link-record creation.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {openReadback,sha} from '../../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const [mode,name='execution_001']=process.argv.slice(2),out=path.join(here,name);
const need=(x,m)=>{if(!x)throw Error(m);},j=JSON.stringify;
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const save=(p,o)=>write(p,j(o,null,2)+'\n');
const id=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;
const cj=v=>j(canon(v)),digest=v=>sha(Buffer.from(cj(v))).toLowerCase();
const worldPath=path.join(root,'j17_step_023/outputs/committed.world.json');
const prior=path.join(root,'j17_step_023/stage12');
const producer=path.join(root,'evidence/first-tick-conform-v1-v2-001/files/realization020/source/vector_displacement.mal');
const comparison=path.join(root,'evidence/first-tick-conform-v1-v2-001/files/realization020/source/vector_comparison_contact.mal');
const originalLower=path.join(root,'j17_step_021/tools/lower.mjs'),lower=path.join(here,'source/lower.mjs');
const helper=path.join(here,'source/source_occurrence_custody.mjs');
const originalHelper=path.join(root,'j17_step_021/tools/source_occurrence_custody.mjs');
const exe=path.join(root,'runtime_021/block_iterative_runtime.exe');
const qualification=path.join(root,'runtime_021/qualification_002/QUALIFICATION.json');
const offersPath=path.join(root,'j17_propose_008/execution_002/OFFERED_SET.json');
const receiptSpec=path.join(root,'evidence/first-tick-conform-v1-v2-001/files/frozen013/SPEC_FLAG_WORLD_FIRST_TICK_001_v0.1.3_PROPOSED.mal');
const expected=new Map([[worldPath,'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'],[producer,'22192EBAEE1248B35B722C97924B0FF6DF577CCD024F0A9B9F75C9A6ECFB3F8F'],[originalLower,'05CE980CBC68707070837001819A90DF532A730569BA1112367C07BC017BD45B'],[exe,'9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06'],[qualification,'D2F42E635BF8095CE5BA3208B030D8F7F26E0A96074F78597833F1CE7D6E41F5'],[offersPath,'C962288C1729F04214355BC72AB3E09F678113A2E71969559FE70BA5056EC0F3']]);
for(const [p,h] of expected)need(id(p).sha256===h,'INPUT_NOT_SAME '+p);
need(id(receiptSpec).sha256==='2ECF2EEF9A8901DA9C802922BEBE1F74C367D7A74E5B773528504B73854C1A01','RECEIPT_READING_LAW_NOT_SAME');
need(id(helper).sha256===id(originalHelper).sha256,'HELPER_NOT_SAME');
const originalText=fs.readFileSync(originalLower,'utf8');
const oldPath="new URL('file:///C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs')";
const newPath="new URL('./source_occurrence_custody.mjs',import.meta.url)";
need(originalText.includes(oldPath)&&fs.readFileSync(lower,'utf8')===originalText.replace(oldPath,newPath),'LOWERER_NOT_PATH_ONLY');
const world=JSON.parse(fs.readFileSync(worldPath)),head=world.chain.at(-1).link;
need(head==='173e0fa1d318de52472e31e3acf064bf92d9b313bdb4e52d2f4593ddd3631386','HEAD_NOT_SAME');
const r=openReadback(prior),flagJSON=new Map(r.predicate('FLAG_JSON').map(f=>{const n=r.node(f.term);return[r.term(n.c[1]),r.value(n.c[2])];}));
const snapshot=r.predicate('CURRENT_FIELD').map(f=>{const n=r.node(f.term);return[flagJSON.get(r.term(n.c[1])),r.node(n.c[2]).s];});
const sorted=a=>[...a].sort((a,b)=>Buffer.compare(Buffer.from(j(a)),Buffer.from(j(b))));
need(j(sorted(snapshot))===j(sorted(world.field)),'READBACK_FIELD_NOT_SAME');
const boundOffers=JSON.parse(fs.readFileSync(offersPath)),current=new Map(world.field.map(([f,v])=>[j(f),v]));
const expectedOffers=boundOffers.filter(o=>o.kind==='SITE'&&j(o.from)===j(o.via)&&current.get(j(o.to))==='NO');
need(expectedOffers.length===12,'DIAGNOSTIC_FAMILY_NOT_12');
const names=['VD_HARDWARE_SITE_LIFT_AB','VD_HARDWARE_SITE_LIFT_BA','VD_OFFERED_FROM','VD_OFFERED_TO','VD_OFFERED_COMPARE_FROM','VD_OFFERED_COMPARE_TO','VD_OFFERED_RETAIN','VD_GENESIS_GLUING','VD_OFFERED_GLUING','VD_OFFERED_SAME_SAME','VD_OFFERED_SAME_DIFFER','VD_OFFERED_DIFFER_SAME','VD_OFFERED_DIFFER_DIFFER'];
const extracted=[...fs.readFileSync(producer,'utf8').matchAll(/law\s+(\w+)\s*:=.*?;/gs)].filter(m=>m[1].startsWith('VD_DIFFER_')||names.includes(m[1]));
need(names.every(n=>extracted.some(m=>m[1]===n)),'EXTRACTION_INCOMPLETE');
const cseed=fs.readFileSync(comparison,'utf8').match(/@propose seed[^]*?};/);need(cseed,'COMPARISON_SEED');
const bindings=[...expected.keys(),receiptSpec,comparison,lower,helper,path.join(prior,'readback.bin'),path.join(prior,'source-map.json'),path.join(here,'source/roundtrip.mal'),path.join(here,'source/commit.mal'),fileURLToPath(import.meta.url)].map(id);
function command(label,cmd,args){const start=new Date().toISOString();console.log(label,start);const p=spawnSync(cmd,args,{encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024,timeout:1800000});save(path.join(out,label+'.execution.json'),{cmd,args,start,end:new Date().toISOString(),status:p.status,error:p.error?.message,stdout:p.stdout,stderr:p.stderr});need(p.status===0&&!p.error,'EXECUTION_STOP '+label+' '+p.stderr);}
function gpu(label,image,map,capacity=1048576){const d=path.join(out,label);fs.mkdirSync(d);write(path.join(d,'source-map.json'),fs.readFileSync(map));command(label,exe,[image,path.join(d,'readback.bin'),'--fact-capacity',String(capacity)]);return openReadback(d);}
if(mode==='prepare'){
 need(!fs.existsSync(out)&&path.dirname(out)===here,'FRESH_DIRECTORY_REQUIRED');fs.mkdirSync(out);
 const imports=['CURRENT_FIELD','DELTA','EDGE_IN_TRIAD','PAIR','DISTINCT_SITE'].flatMap(t=>r.predicate(t).map(f=>({tag:t,fact:f.id,term:r.term(f.term),rule:f.rule,support:f.support})));
 const chunks=[];for(let i=0;i<imports.length;i+=32){let tail='NIL';for(const x of imports.slice(i,i+32).reverse())tail='CONS('+x.term+','+tail+')';chunks.push('THIS(R2_IMPORT_LIST,'+tail+')');}
 // Exhaustive balanced grouping of the source's 720 PAIR identities. It
 // changes proof scheduling only; no values or candidate choices enter it.
 const pairTerms=r.predicate('PAIR').map(f=>{const n=r.node(f.term);return[r.term(n.c[1]),r.term(n.c[2])];}),tree=[];let serial=0;
 function pairTree(rows){const n='R2_GROUP_'+serial++;if(rows.length===1)tree.push('GOES_WITH(R2_PAIR_LEAF,'+n+','+rows[0].join(',')+')');else{const mid=Math.floor(rows.length/2),a=pairTree(rows.slice(0,mid)),b=pairTree(rows.slice(mid));tree.push('GOES_WITH(R2_PAIR_JOIN,'+n+','+a+','+b+')');}return n;}
 need(pairTerms.length===720&&new Set(pairTerms.map(j)).size===720,'PAIR_COVERAGE');const treeRoot=pairTree(pairTerms);chunks.push(...tree,'THIS(R2_PAIR_ROOT,'+treeRoot+')');
 const transport='law R2_IMPORT_HEAD := IF THIS(R2_IMPORT_LIST,CONS(GOES_WITH(t,a,b),tail)) THEN GOES_WITH(t,a,b);\nlaw R2_IMPORT_TAIL := IF THIS(R2_IMPORT_LIST,CONS(x,tail)) THEN THIS(R2_IMPORT_LIST,tail);\n';
 const source='@propose seed R2_CUSTODY := {\n'+chunks.join(',\n')+'\n};\n'+transport+cseed[0]+'\n'+fs.readFileSync(path.join(here,'source/roundtrip.mal'),'utf8')+'\n'+extracted.map(m=>m[0]).join('\n');
 write(path.join(out,'source.mal'),source);
 save(path.join(out,'BINDINGS.json'),{scope:'DIAGNOSTIC_PAIR_FORKS; NOT_LIVE_WORLD; NOT_D2_ENTITY_INVENTORY',bindings,imports,selected_family:'ALL direct SITE lifts with from=via and target reading NO',bound_offer_count:expectedOffers.length,lowerer_change:{oldPath,newPath,helper:'BYTE_SAME',nonpath_source:'BYTE_SAME'},rules:extracted.map(m=>({name:m[1],sha256:sha(Buffer.from(m[0]))}))});
 command('lower',process.execPath,[lower,path.join(out,'source.mal'),path.join(out,'image')]);
 // The original lowerer is read-only; every qualification output remains here.
 command('lower_original_qualification',process.execPath,[originalLower,path.join(out,'source.mal'),path.join(out,'original_image')]);
 need(id(path.join(out,'image/image.bin')).sha256===id(path.join(out,'original_image/image.bin')).sha256,'LOWERER_IMAGE_NOT_SAME');
 save(path.join(out,'PREFLIGHT.json'),{status:'READY_NOT_RUN',native_rules:extracted.length,lowerer_images:'SAME',source:id(path.join(out,'source.mal')),image:id(path.join(out,'image/image.bin')),world:id(worldPath),head,offered_set:id(offersPath),family_count:12,live_world:'UNTOUCHED'});
 console.log(j({prepared:out,image:id(path.join(out,'image/image.bin')),gpu:'NOT_RUN'}));
}else if(mode==='run'){
 const pre=JSON.parse(fs.readFileSync(path.join(out,'PREFLIGHT.json'))),bound=JSON.parse(fs.readFileSync(path.join(out,'BINDINGS.json')));
 for(const b of bound.bindings)need(id(b.path).sha256===b.sha256,'PREFLIGHT_BINDING_NOT_SAME '+b.path);
 need(id(pre.image.path).sha256===pre.image.sha256,'IMAGE_NOT_SAME');
 const a=gpu('native',pre.image.path,path.join(out,'image/source-map.json')),b=gpu('native_replay',pre.image.path,path.join(out,'image/source-map.json'));
 need(sha(a.raw)===sha(b.raw),'REPLAY_NOT_SAME');
 const cases=new Map(),flag=i=>flagJSON.get(a.term(i)),key=i=>a.term(i);
 for(const fact of a.predicate('R2_CASE')){const n=a.node(fact.term),from=flag(n.c[1]),to=flag(n.c[2]),c='BRANCH('+a.term(n.c[1])+','+a.term(n.c[2])+')';need(from&&to,'CASE_FLAG');cases.set(c,{context:j([from,to]),from,to,proof:{case:fact.id},OUT:{field:[],witness:[],changes:[],proof:[]},BACK:{field:[],witness:[],changes:[],proof:[]},ENDPOINT:{changes:[],proof:[]}});}
 need(cases.size===12,'CASE_COUNT');
 need(j(sorted([...cases.values()].map(c=>[c.from,c.from,c.to])))===j(sorted(expectedOffers.map(o=>[o.from,o.via,o.to]))),'SOURCE_BOUND_OFFER_FAMILY_NOT_SAME');
 for(const f of a.predicate('R2_OFFERED')){const n=a.node(f.term),c=cases.get(key(n.c[1])),s=a.node(n.c[2]).s,l=a.node(n.c[3]);need(c&&['OUT','BACK'].includes(s),'OFFER_CONTEXT');c[s].lift=l.c.map(flag);c[s].offered_fact=f.id;}
 for(const f of a.predicate('R2_FIELD')){const n=a.node(f.term),c=cases.get(key(n.c[1])),s=a.node(n.c[2]).s;c[s].field.push([flag(n.c[3]),a.node(n.c[4]).s]);c[s].proof.push(f.id);}
 for(const f of a.predicate('R2_GLUING')){const n=a.node(f.term),c=cases.get(key(n.c[1])),s=a.node(n.c[2]).s;c[s].witness.push([flag(n.c[3]),flag(n.c[4]),a.node(n.c[5]).s]);c[s].proof.push(f.id);}
 for(const f of a.predicate('R2_CHANGE')){const n=a.node(f.term),c=cases.get(key(n.c[1])),s=a.node(n.c[2]).s;c[s].changes.push([flag(n.c[3]),flag(n.c[4]),a.node(n.c[5]).s]);c[s].proof.push(f.id);}
 for(const f of a.predicate('R2_RECEIPT_READING')){const n=a.node(f.term),x=cases.get(key(n.c[1]))[a.node(n.c[2]).s];need(!x.receipt_reading,'RECEIPT_READING_NOT_UNIQUE');x.receipt_reading=a.value(n.c[3]);x.receipt_reading_fact=f.id;}
 need(a.predicate('R2_UNOFFERED_REQUEST').length===12&&a.predicate('R2_UNOFFERED_ACCEPTED').length===0,'NEGATIVE_LIFT_CONTROL');
 const fieldOrder=new Map(world.field.map((row,i)=>[j(row[0]),i])),pairOrder=new Map(world.witness.map((row,i)=>[j(row.slice(0,2)),i]));
 const observations=[];
 for(const c of cases.values())for(const s of ['OUT','BACK','ENDPOINT']){
   const x=c[s];need(x.changes.length===720&&new Set(x.changes.map(row=>j(row.slice(0,2)))).size===720,'CHANGE_COVERAGE');
   x.changes.sort((a,b)=>pairOrder.get(j(a.slice(0,2)))-pairOrder.get(j(b.slice(0,2))));
   need(x.changes.every(row=>pairOrder.has(j(row.slice(0,2)))),'CHANGE_DOMAIN');
   // Generic projection of source-produced change rows into receipt lists.
   x.receipt={discharged:x.changes.filter(row=>row[2]==='DISCHARGED').map(row=>row.slice(0,2)),opened:x.changes.filter(row=>row[2]==='OPENED').map(row=>row.slice(0,2))};
   x.retained=x.changes.filter(row=>row[2]==='RETAINED_WALL').length;need(['THIS','NO'].includes(x.receipt_reading),'RECEIPT_READING_UNSUPPLIED');
   if(s!=='ENDPOINT'){
    need(x.lift&&x.field.length===480&&new Set(x.field.map(row=>j(row[0]))).size===480&&x.witness.length===720&&new Set(x.witness.map(row=>j(row.slice(0,2)))).size===720,'SNAPSHOT_COVERAGE');
    need(x.field.every(row=>fieldOrder.has(j(row[0])))&&x.witness.every(row=>pairOrder.has(j(row.slice(0,2)))),'SNAPSHOT_DOMAIN');
    x.field.sort((a,b)=>fieldOrder.get(j(a[0]))-fieldOrder.get(j(b[0])));x.witness.sort((a,b)=>pairOrder.get(j(a.slice(0,2)))-pairOrder.get(j(b.slice(0,2))));
    observations.push([c.context,s,x.field,x.witness,x.receipt,x.receipt_reading,x.lift]);
   }
 }
 const rendered=[...cases.values()];
 for(const c of rendered){need(j(c.BACK.field)===j(world.field)&&j(c.BACK.witness)===j(world.witness),'ENDPOINT_NOT_SAME');need(c.ENDPOINT.receipt.discharged.length===0&&c.ENDPOINT.receipt.opened.length===0,'ENDPOINT_NOT_EMPTY');}
 save(path.join(out,'NATIVE_RESULTS.json'),{readback:id(path.join(out,'native/readback.bin')),replay:'SAME',cases:rendered});
 write(path.join(out,'observations.json'),j(observations));
 const responses=[],responseKeys=new Set();let last;
 const program=sha(Buffer.from(fs.readFileSync(path.join(out,'source.mal'),'utf8')+'\n'+fs.readFileSync(path.join(here,'source/commit.mal'),'utf8'))).toLowerCase();
 const commitSource='@propose seed R2_RECORD_CUSTODY := { GOES_WITH(R2_PHASE,"OUT",OUT), GOES_WITH(R2_PHASE,"BACK",BACK), THIS(R2_G2_HEAD,'+j(head)+'), GOES_WITH(R2_DIAGNOSTIC_PROGRAM,'+j(program)+') };\n'+fs.readFileSync(path.join(here,'source/commit.mal'),'utf8');
 write(path.join(out,'commit.mal'),commitSource);
 const serviceCustody=[];
 for(let pass=0;pass<5;pass++){
   const tag='commit_'+pass,hashPath=path.join(out,tag+'.hashes.json');write(hashPath,j(responses));
   command(tag+'_lower',process.execPath,[lower,path.join(out,'commit.mal'),path.join(out,tag+'_image'),'observations='+path.join(out,'observations.json'),'hashes='+hashPath]);
   last=gpu(tag,path.join(out,tag+'_image/image.bin'),path.join(out,tag+'_image/source-map.json'),262144);
   let added=0;
   for(const f of last.predicate('GPU_HASH_REQUEST')){const n=last.node(f.term),subject=last.value(n.c[3]),k=cj(subject);if(responseKeys.has(k))continue;responseKeys.add(k);const hash=digest(subject);responses.push([subject,hash]);serviceCustody.push({pass,fact:f.id,rule:f.origin,subject_sha256:hash});added++;}
   if(!added)break;
 }
 need(last&&last.predicate('R2_DIAGNOSTIC_CHAIN').length===12,'DIAGNOSTIC_CHAIN_INCOMPLETE');
 need(last.predicate('R2_WRONG_PREV_REQUEST').length===12&&last.predicate('R2_WRONG_PREV_ACCEPTED').length===0,'WRONG_PREV_CONTROL');
 const chains=[];
 for(const f of last.predicate('R2_DIAGNOSTIC_CHAIN')){const n=last.node(f.term),context=last.value(n.c[1]),origin=last.value(n.c[2]),chain=last.value(n.c[3]),c=rendered.find(x=>x.context===context);need(c&&chain.length===2&&origin===head,'CHAIN_CONTEXT');
   need(chain[0].record.prev===head&&chain[1].record.prev===chain[0].link&&chain[0].link!==chain[1].link&&chain[1].link!==head,'PREDECESSOR_CHAIN');
   for(const [i,s] of ['OUT','BACK'].entries()){const e=chain[i],x=c[s];need(e.link===digest(e.record)&&e.record.pair_hash===digest({field:x.field,witness:x.witness})&&e.record.receipt_hash===digest(x.receipt),'CHAIN_HASH');need(j(e.record.field)===j(x.field)&&j(e.record.witness)===j(x.witness)&&j(e.record.receipt)===j(x.receipt),'CHAIN_SUBJECT');}
   chains.push({context,origin,chain,endpoint_receipt:c.ENDPOINT.receipt,endpoint_receipt_reading:c.ENDPOINT.receipt_reading});
 }
 write(path.join(out,'diagnostic.chains.json'),cj(chains));save(path.join(out,'HASH_SERVICE_CUSTODY.json'),serviceCustody);
 for(const b of bindings)need(id(b.path).sha256===b.sha256,'POST_RUN_BINDING_NOT_SAME '+b.path);
 const summary=rendered.map(c=>({context:c.context,out:{discharged:c.OUT.receipt.discharged.length,opened:c.OUT.receipt.opened.length,retained:c.OUT.retained},back:{discharged:c.BACK.receipt.discharged.length,opened:c.BACK.receipt.opened.length,retained:c.BACK.retained},endpoint:{discharged:c.ENDPOINT.receipt.discharged.length,opened:c.ENDPOINT.receipt.opened.length,retained:c.ENDPOINT.retained},field:'SAME',witness:'SAME',forward_offer:c.OUT.offered_fact,inverse_offer:c.BACK.offered_fact}));
 save(path.join(out,'RUN_RECORD_R2_019.json'),{scope:'12 ISOLATED DIAGNOSTIC PAIR CHAINS; NATIVE D2 LIFT EFFECT; NOT LIVE WORLD, NOT ENTITY INVENTORY, NOT SHELL HALF TURN',verdict:'IF_THEN',source:id(path.join(out,'source.mal')),commit_source:id(path.join(out,'commit.mal')),native_readback:id(path.join(out,'native/readback.bin')),replay_readback:id(path.join(out,'native_replay/readback.bin')),replay:'SAME',facts:a.count,epochs:a.epochs,qualified_lowerer_images:'SAME',offered_family:'SAME12 AGAINST BOUND228',branches:summary,chains:id(path.join(out,'diagnostic.chains.json')),hash_service:id(path.join(out,'HASH_SERVICE_CUSTODY.json')),native_results:id(path.join(out,'NATIVE_RESULTS.json')),controls:{unoffered_alias_inverse:'WITHHELD12; ACCEPTED0',wrong_predecessor:'WITHHELD12; ACCEPTED0'},live_world:id(worldPath),live_world_status:'UNCHANGED'});
 console.log(j({record:id(path.join(out,'RUN_RECORD_R2_019.json')),branches:12,new_diagnostic_links:24,replay:'SAME'}));
}else throw Error('prepare|run required');
