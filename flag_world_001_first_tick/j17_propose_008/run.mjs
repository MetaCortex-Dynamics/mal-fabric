// Exact source extraction, evidence transport, invocation and observation.
// World operations execute only as the retained .mal rules on the GPU.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {openReadback,sha} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
const out=path.join(here,process.argv[2]??'execution_001');
const check=(v,m)=>{if(!v)throw Error(m);},json=JSON.stringify;
const write=(p,v)=>fs.writeFileSync(p,v,{flag:'wx'});
const id=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
check(path.dirname(out)===here&&!fs.existsSync(out),'FRESH_OUTPUT_REQUIRED');
const prior=path.join(root,'j17_step_023/stage12');
const worldPath=path.join(root,'j17_step_023/outputs/committed.world.json');
const src=path.join(root,'evidence/first-tick-conform-v1-v2-001/files/realization020/source');
const producer=path.join(src,'vector_displacement.mal'),comparison=path.join(src,'vector_comparison_contact.mal');
const lower=path.join(root,'j17_step_021/tools/lower.mjs'),exe=path.join(root,'runtime_021/block_iterative_runtime.exe');
check(id(worldPath).sha256==='E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059','WORLD_NOT_SAME');
check(id(producer).sha256==='22192EBAEE1248B35B722C97924B0FF6DF577CCD024F0A9B9F75C9A6ECFB3F8F','PRODUCER_NOT_SAME');
check(id(exe).sha256==='9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06','EXECUTOR_NOT_SAME');
const r=openReadback(prior),world=JSON.parse(fs.readFileSync(worldPath));
const flagJSON=new Map(r.predicate('FLAG_JSON').map(f=>{const n=r.node(f.term);return [r.term(n.c[1]),r.value(n.c[2])];}));
const snapshot=r.predicate('CURRENT_FIELD').map(f=>{const n=r.node(f.term);return [flagJSON.get(r.term(n.c[1])),r.node(n.c[2]).s];});
const sorted=a=>[...a].sort((a,b)=>Buffer.compare(Buffer.from(json(a)),Buffer.from(json(b))));
check(json(sorted(snapshot))===json(sorted(world.field)),'READBACK_WORLD_NOT_SAME');
check(snapshot.length===480&&snapshot.filter(x=>x[1]==='THIS').length===12,'OPERANDS_NOT_SAME');
const tags=['CURRENT_FIELD','EDGE_IN_TRIAD','GAMMA','TAU','PAIR','DISTINCT_SITE'];
const imports=tags.flatMap(t=>r.predicate(t).map(f=>({tag:t,fact:f.id,term:r.term(f.term),rule:f.rule,support:f.support})));
const names=['VD_HARDWARE_SITE_LIFT_AB','VD_HARDWARE_SITE_LIFT_BA','VD_HARDWARE_EDGE_LIFT','VD_HARDWARE_TRIAD_LIFT','VD_OFFERED_FROM','VD_OFFERED_TO','VD_OFFERED_COMPARE_FROM','VD_OFFERED_COMPARE_TO','VD_OFFERED_RETAIN','VD_GENESIS_GLUING','VD_OFFERED_GLUING','VD_OFFERED_SAME_SAME','VD_OFFERED_SAME_DIFFER','VD_OFFERED_DIFFER_SAME','VD_OFFERED_DIFFER_DIFFER'];
const selected=[...fs.readFileSync(producer,'utf8').matchAll(/law\s+(\w+)\s*:=.*?;/gs)].filter(m=>m[1].startsWith('VD_DIFFER_')||names.includes(m[1]));
check(names.every(n=>selected.some(m=>m[1]===n)),'RULE_EXTRACTION');
const cseed=fs.readFileSync(comparison,'utf8').match(/@propose seed[^]*?};/);check(cseed,'COMPARISON_SEED');
const bindings=[worldPath,producer,comparison,lower,exe,path.join(prior,'readback.bin'),path.join(prior,'source-map.json'),path.join(here,'source/probe.mal'),fileURLToPath(import.meta.url)].map(id);
fs.mkdirSync(out);write(path.join(out,'BINDINGS.json'),JSON.stringify({scope:'PROPOSE_ONLY',bindings,imports,rules:selected.map(m=>({name:m[1],sha256:sha(Buffer.from(m[0]))}))},null,2));
// Chunking is transport only: retain every imported fact, no semantic filter.
const chunks=[];for(let i=0;i<imports.length;i+=32){let list='NIL';for(const x of imports.slice(i,i+32).reverse())list='CONS('+x.term+','+list+')';chunks.push('THIS(P8_IMPORT_LIST,'+list+')');}
const transport='law P8_IMPORT_HEAD := IF THIS(P8_IMPORT_LIST,CONS(GOES_WITH(t,a,b),tail)) THEN GOES_WITH(t,a,b);\nlaw P8_IMPORT_TAIL := IF THIS(P8_IMPORT_LIST,CONS(x,tail)) THEN THIS(P8_IMPORT_LIST,tail);\n';
const source='@propose seed P8_CUSTODIED_INPUT := {\n'+chunks.join(',\n')+'\n};\n'+transport+cseed[0]+'\n'+fs.readFileSync(path.join(here,'source/probe.mal'),'utf8')+'\n'+selected.map(m=>m[0]).join('\n');
write(path.join(out,'source.mal'),source);
function run(label,cmd,args){const start=new Date().toISOString();console.log(label,start);const q=spawnSync(cmd,args,{encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024,timeout:3600000});write(path.join(out,label+'.execution.json'),JSON.stringify({cmd,args,start,end:new Date().toISOString(),status:q.status,error:q.error?.message,stdout:q.stdout,stderr:q.stderr},null,2));check(q.status===0&&!q.error,'EXECUTION_STOP '+label+' '+q.stderr);}
run('lower',process.execPath,[lower,path.join(out,'source.mal'),path.join(out,'image')]);
const image=path.join(out,'image/image.bin');
for(const label of ['run','replay1','replay2']){const d=path.join(out,label);fs.mkdirSync(d);write(path.join(d,'source-map.json'),fs.readFileSync(path.join(out,'image/source-map.json')));run(label,exe,[image,path.join(d,'readback.bin'),'--fact-capacity','2097152']);}
const hashes=['run','replay1','replay2'].map(k=>id(path.join(out,k,'readback.bin')));check(hashes.every(x=>x.sha256===hashes[0].sha256),'REPLAY_NOT_SAME');
const rr=openReadback(path.join(out,'run')),offers=new Map();
for(const f of rr.predicate('VD_LIFT_GEOMETRY')){const n=rr.node(f.term),c=rr.node(n.c[1]),l=rr.node(n.c[2]);const key=rr.term(n.c[1])+'|'+rr.term(n.c[2]);const flag=x=>flagJSON.get(rr.term(x));offers.set(key,{context:rr.term(n.c[1]),kind:rr.node(c.c[1]).s,target:rr.term(c.c[2]),from:flag(l.c[0]),via:flag(l.c[1]),to:flag(l.c[2]),field:[],receipt:{discharged:[],opened:[],retained:[]},unchanged:0,evidence:{lift_fact:f.id,field_facts:[],gluing_facts:[],change_facts:[]}});}
for(const f of rr.predicate('VD_OFFERED_FIELD')){const n=rr.node(f.term),o=offers.get(rr.term(n.c[1])+'|'+rr.term(n.c[2]));check(o,'UNKNOWN_OFFER');o.field.push([flagJSON.get(rr.term(n.c[3])),rr.node(n.c[4]).s]);o.evidence.field_facts.push(f.id);}
for(const f of rr.predicate('VD_OFFERED_GLUING')){const n=rr.node(f.term);offers.get(rr.term(n.c[1])+'|'+rr.term(n.c[2])).evidence.gluing_facts.push(f.id);}
for(const f of rr.predicate('VD_OFFERED_CHANGE')){const n=rr.node(f.term),o=offers.get(rr.term(n.c[1])+'|'+rr.term(n.c[2])),s=rr.node(n.c[5]).s,pair=[flagJSON.get(rr.term(n.c[3])),flagJSON.get(rr.term(n.c[4]))];o.evidence.change_facts.push(f.id);if(s==='UNCHANGED')o.unchanged++;else{const k={DISCHARGED:'discharged',OPENED:'opened',RETAINED_WALL:'retained'}[s];check(k,'CHANGE_KIND');o.receipt[k].push(pair);}}
const members=[...offers.values()].sort((a,b)=>Buffer.compare(Buffer.from(json([a.context,a.from,a.via,a.to])),Buffer.from(json([b.context,b.from,b.via,b.to]))));
for(const o of members){check(o.field.length===480&&o.evidence.gluing_facts.length===720&&o.evidence.change_facts.length===720,'OFFER_INCOMPLETE');check(new Set(o.field.map(x=>json(x[0]))).size===480,'FIELD_NOT_UNIQUE');o.field=sorted(o.field);o.field_sha256=sha(Buffer.from(json(o.field)));for(const k of Object.keys(o.receipt))o.receipt[k]=sorted(o.receipt[k]);o.counts=Object.fromEntries(Object.entries(o.receipt).map(([k,v])=>[k,v.length]));}
write(path.join(out,'OFFERED_SET.json'),json(members));
const totals={};for(const o of members){const k=json([o.kind,o.counts]);totals[k]=(totals[k]??0)+1;}
for(const b of bindings)check(id(b.path).sha256===b.sha256,'POST_RUN_CUSTODY_NOT_SAME');
const record={scope:'BOUNDED_PROPOSE_ENUMERATION; NOT_FOLD_SUCCESSOR_OR_ADMISSION',selection:'NONE',link3:'NOT_COMMITTED',source:id(path.join(out,'source.mal')),image:id(image),readbacks:hashes,replay:'SAME',facts:rr.count,epochs:rr.epochs,contexts:rr.predicate('P8_CONTEXT').length,members:members.length,totals,offered_set:id(path.join(out,'OFFERED_SET.json'))};
write(path.join(out,'RUN_RECORD.json'),JSON.stringify(record,null,2));console.log(JSON.stringify(record,null,2));
