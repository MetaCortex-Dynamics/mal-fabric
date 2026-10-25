// Custody, generic row transport, invocation and observation only.
// All field assignments, comparisons and receipt predicates run as .mal on GPU.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)), root=path.dirname(here);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:hash(b)};};
const need=(x,m)=>{if(!x)throw Error(m);};
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const save=(p,o)=>write(p,JSON.stringify(o,null,2)+'\n');
const input=path.join(root,'j17_step_023/outputs/committed.world.json');
const prior=path.join(root,'j17_strict_discharge_diagnostic_008/source/diagnostic.mal');
const source=path.join(here,'source/fibres.mal');
const baselineSource=path.join(root,'j17_section_diagnostic_009/source/sections.mal');
const priorRecord=path.join(root,'j17_section_diagnostic_009/run_002/RUN_RECORD_009.json');
const lower=path.join(root,'j17_step_021/tools/lower.mjs');
const exe=path.join(root,'runtime_021/block_iterative_runtime.exe');
const qualification=path.join(root,'runtime_021/qualification_002/QUALIFICATION.json');
const contacts=path.join(root,'world_transition_contacts_007');
const expected=new Map([
 [input,'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'],
 [baselineSource,'B8D2F889A2C97F6F9CB7BC4DFAB014C9E7DCD49EDE64752BC3D99828B97E36ED'],
 [priorRecord,'949E23F8F7F2C493F9DB8A0B733C98FA993D5FF32F4EFCA0219165C0ADA27090'],
 [prior,'9DEBF75815CCAE27FA7726ABDA0C33174B6C97ABCD39F8981E55B11D8F30046C'],
 [lower,'05CE980CBC68707070837001819A90DF532A730569BA1112367C07BC017BD45B'],
 [exe,'9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06'],
 [qualification,'D2F42E635BF8095CE5BA3208B030D8F7F26E0A96074F78597833F1CE7D6E41F5'],
 [path.join(contacts,'MANIFEST.json'),'13F4676010390261EAFC6C208498231806C738599D5376314D36E3DFDCA44EC6']
]);
for(const [p,h] of expected)need(identity(p).sha256===h,'NOT_SAME_INPUT '+p);
need(JSON.parse(fs.readFileSync(qualification)).qualification==='SAME','UNQUALIFIED_RUNTIME');
const [mode,name='run_001']=process.argv.slice(2);
need(mode==='run'&&/^[A-Za-z0-9_]+$/.test(name),'usage: node run.mjs run fresh_directory');
const out=path.join('D:/mal_worldline_backups/j17_fibre_diagnostic_010',name);need(!fs.existsSync(out),'PRESERVE_PRIOR_OUTPUT');
const world=JSON.parse(fs.readFileSync(input));
need(world.field.length===480&&world.witness.length===720,'INPUT_ARRAY_COVERAGE');
const bound=[...expected.keys(),source,fileURLToPath(import.meta.url)].map(identity);
const verify=()=>{for(const x of bound)need(identity(x.path).sha256===x.sha256,'CUSTODY_NOT_SAME '+x.path);};
fs.mkdirSync(out);
save(path.join(out,'INPUTS.json'),{scope:'USER_AUTHORIZED_COORDINATE_FIBRE_ASSIGNMENTS; COMMIT_CONTRACT_REVIEW_SEPARATE',storage:'New diagnostic directory on D:; no original overwritten',bound});

// Every witness row has one leaf. Binary grouping covers the complete array;
// grouping order affects execution only, never an offer or a reading.
const coverage={rows:world.witness.map((row,i)=>['l'+i,row])};
const coveragePath=path.join(out,'coverage.json');write(coveragePath,JSON.stringify(coverage));
let level=coverage.rows.map(row=>row[0]), pairs=[];
while(level.length>1){const next=[];for(let i=0;i<level.length;i+=2){
 if(i+1===level.length){next.push(level[i]);continue;}
 const parent='n'+pairs.length;pairs.push([parent,level[i],level[i+1]]);next.push(parent);
}level=next;}
need(pairs.length===world.witness.length-1,'COVERAGE_GROUPING');
const rootLabel=level[0];
let wrapper='// Exact g2 rows and complete generic coverage transport.\n';
for(let i=0;i<world.field.length;i++)wrapper+=`@readonly input KD_INPUT_FIELD_ROW := "g2:/field/${i}";\n`;
for(let i=0;i<coverage.rows.length;i++)wrapper+=`@readonly input SC_INPUT_WITNESS_ROW := "coverage:/rows/${i}";\n`;
const seeds=[...Array.from({length:94},(_,i)=>`GOES_WITH(KD_BYTE_NEXT,B${i+32},B${i+33})`),
 ...pairs.map(p=>`GOES_WITH(SC_COVER_PAIR,${p.map(JSON.stringify).join(',')})`),`THIS(SC_COVER_ROOT,${JSON.stringify(rootLabel)})`];
need(world.field.length+coverage.rows.length+seeds.length<=2048,'SEED_CAPACITY');
wrapper+='@propose seed SC_TRANSPORT := {\n'+seeds.join(',\n')+'\n};\n';
wrapper+='law SC_IMPORT_WITNESS := IF THIS(SC_INPUT_WITNESS_ROW,ARRAY(CONS(leaf,CONS(row,NIL)))) THEN THIS(KD_INPUT_WITNESS_ROW,row);\n';
wrapper+='law SC_IMPORT_LEAF := IF THIS(SC_INPUT_WITNESS_ROW,ARRAY(CONS(leaf,CONS(ARRAY(CONS(a,CONS(b,CONS(old,NIL)))),NIL)))) THEN GOES_WITH(SC_WITNESS_LEAF,leaf,a,b,old);\n';
const imageSource=path.join(out,'diagnostic.mal');
write(imageSource,wrapper+fs.readFileSync(prior,'utf8')+'\n'+fs.readFileSync(baselineSource,'utf8')+'\n'+fs.readFileSync(source,'utf8'));
save(path.join(out,'TRANSPORT.json'),{input:identity(input),coverage:identity(coveragePath),leaf_count:coverage.rows.length,pair_count:pairs.length,root:rootLabel,seed_count:world.field.length+coverage.rows.length+seeds.length,meaning:'Only grouping of every input overlap; no application operation on the host.'});
const stage=path.join(out,'stage');
function launch(label,command,args,gpu=false){
 verify();
 if(gpu){const q=spawnSync('nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});need(q.status===0&&q.stdout.includes('RTX 3070'),'GPU_NOT_BOUND');console.log(q.stdout.trim());}
 console.log(JSON.stringify({launch:label,args}));const started=new Date().toISOString();
 const r=spawnSync(command,args,{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024,timeout:600000});
 save(path.join(out,label+'.execution.json'),{command,args,started,ended:new Date().toISOString(),exit:r.status,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??''});
 verify();need(!r.error&&r.status===0,'EXECUTION_STOP '+label+' '+(r.error?.message??'')+' '+r.stderr);
}
try{
 launch('lower',process.execPath,[lower,imageSource,stage,'-','g2='+input,'coverage='+coveragePath]);
 launch('gpu',exe,[path.join(stage,'image.bin'),path.join(stage,'readback.bin'),'--fact-capacity','4194304'],true);
 const r=openReadback(stage), json=JSON.stringify;
 const rows=tag=>r.predicate(tag).map(f=>({fact:f.id,origin:f.origin,support:f.support,args:r.node(f.term).c.slice(1)}));
 const incident=new Map();for(const f of rows('KD_INCIDENT')){const key=json([r.value(f.args[0]),r.node(f.args[1]).s]);incident.set(key,(incident.get(key)||0)+1);}
 need(incident.size===1440&&[...incident.values()].every(n=>n===1),'INCIDENCE_EXHAUSTION');
 need(rows('SC_WITNESS_LEAF').length===720&&rows('SC_COVER_PAIR').length===719,'NATIVE_COVERAGE_TRANSPORT');
 const caseValue=id=>{const n=r.node(id);need(['SITE','EDGE','TRIAD','UNIFORM','BOUNDARY_GROW'].includes(n.s),'CASE_ENCODING');return {family:n.s,operands:n.c.map(x=>r.value(x))};};
 const cases=new Map(rows('SC_CASE').map(f=>[json(caseValue(f.args[0])),{...caseValue(f.args[0]),case_fact:f.fact,field:[],overlaps:[],opened:[],discharged:[],retained:[],changed:[],strict:[],excluded:[],coverage:[]} ]));
 function each(tag,fn){for(const f of rows(tag)){const c=cases.get(json(caseValue(f.args[0])));need(c,'UNBOUND_CASE '+tag);fn(c,f);}}
 each('SC_FIELD',(c,f)=>c.field.push({flag:r.value(f.args[1]),reading:r.value(f.args[2]),fact:f.fact}));
 each('SC_AFTER',(c,f)=>c.overlaps.push({overlap:f.args.slice(1,3).map(x=>r.value(x)),before:r.value(f.args[3]),after:r.value(f.args[4]),fact:f.fact}));
 for(const [tag,key] of [['SC_OPENED','opened'],['SC_DISCHARGED','discharged'],['SC_RETAINED','retained']])each(tag,(c,f)=>c[key].push({overlap:f.args.slice(1).map(x=>r.value(x)),fact:f.fact}));
 each('SC_CHANGED',(c,f)=>c.changed.push({flag:r.value(f.args[1]),before:r.value(f.args[2]),after:r.value(f.args[3]),fact:f.fact}));
 each('SC_STRICT',(c,f)=>c.strict.push({fact:f.fact,origin:f.origin,support:f.support}));
 each('SC_NOT_STRICT',(c,f)=>c.excluded.push({reason:r.node(f.args[1]).s,fact:f.fact}));
 each('SC_COMPLETE',(c,f)=>c.coverage.push({fact:f.fact,origin:f.origin,support:f.support}));
 const sort=a=>a.sort((x,y)=>Buffer.compare(Buffer.from(json(x)),Buffer.from(json(y))));
 const inventory=sort([...cases.values()]);
 for(const c of inventory){need(c.field.length===480&&c.overlaps.length===720&&c.coverage.length===1,'CASE_COVERAGE '+json(c.operands));need(c.strict.length+c.excluded.length>0,'UNCLASSIFIED_CASE');need(!(c.strict.length&&c.excluded.length),'CONFLICTING_VERDICT');need(new Set(c.field.map(x=>json(x.flag))).size===480,'FIELD_CONFLICT');}
 const singles=new Map(rows('SC_SINGLE').map(f=>[json(r.value(f.args[0])),{flag:r.value(f.args[0]),before:r.value(f.args[1]),after:r.value(f.args[2]),source_fact:f.fact,opened:[],discharged:[],examined:[],complete:[],excluded:[]} ]));
 for(const [tag,key] of [['SC_SINGLE_OPEN','opened'],['SC_SINGLE_DISCHARGE','discharged'],['SC_SINGLE_AFTER','examined'],['SC_SINGLE_COMPLETE','complete'],['SC_SINGLE_NOT_STRICT','excluded']])for(const f of rows(tag)){
  const s=singles.get(json(r.value(f.args[0])));need(s,'UNBOUND_SINGLE');s[key].push({fact:f.fact,args:f.args.slice(1).map(id=>{const n=r.node(id);return n.s==='TEXT'||n.s==='ARRAY'?r.value(id):n.s;})});
 }
 for(const s of singles.values())need(s.examined.length===3&&s.complete.length===1&&s.excluded.length===1,'SINGLE_COVERAGE');
 const histogram={};for(const s of singles.values()){const key=`${s.before}->${s.after};discharged=${s.discharged.length};opened=${s.opened.length}`;histogram[key]=(histogram[key]??0)+1;}
 const geometry={walls:rows('SC_OLD_WALL').map(f=>({relation:r.node(f.args[0]).s,overlap:f.args.slice(1).map(x=>r.value(x)),fact:f.fact})),internal:rows('SC_THIS_INTERNAL').map(f=>({relation:r.node(f.args[0]).s,overlap:f.args.slice(1).map(x=>r.value(x)),fact:f.fact})),boundary_flags:rows('SC_BOUNDARY_FLAG').map(f=>({flag:r.value(f.args[0]),fact:f.fact}))};
 need(rows('KD_BASE_BOUND').length===720,'BASELINE_NOT_SAME');
 const sites=inventory.filter(c=>c.family==='SITE'), fibres=inventory.filter(c=>['SITE','EDGE','TRIAD'].includes(c.family)), edges=inventory.filter(c=>c.family==='EDGE'),triads=inventory.filter(c=>c.family==='TRIAD'),summary=c=>({family:c.family,operands:c.operands,changed:c.changed.length,discharged:c.discharged.length,opened:c.opened.length,retained:c.retained.length,reading:c.strict.length?'IF_THEN':'NO',proof:c.strict.length?c.strict:c.excluded});
 need(sites.length===84&&edges.length===240&&triads.length===160&&fibres.length===484&&singles.size===480,'REQUEST_COVERAGE');
 save(path.join(out,'FIBRE_ASSIGNMENTS_AND_RECEIPTS.json'),{scope:'484 coordinate-fibre assignments (84 site,240 edge,160 triad); two uniform and one boundary-growth checks separate',geometry,cases:inventory});
 save(path.join(out,'SINGLE_FLAG_EXCLUSIONS.json'),{scope:'Every one-coordinate inversion of the 480-entry field',histogram,singles:sort([...singles.values()])});
 const result={fibre_cases:fibres.length,edge_cases:edges.length,triad_cases:triads.length,edge_strict:edges.filter(c=>c.strict.length).map(summary),triad_strict:triads.filter(c=>c.strict.length).map(summary),fibre_strict:fibres.filter(c=>c.strict.length).map(summary),site_cases:sites.length,site_strict:sites.filter(c=>c.strict.length).map(summary),site_non_strict:sites.filter(c=>!c.strict.length).length,separate_checks:inventory.filter(c=>!['SITE','EDGE','TRIAD'].includes(c.family)).map(summary),single_cases:singles.size,single_exclusions:singles.size,single_histogram:histogram,walls:geometry.walls.length,wall_relations:geometry.walls.map(x=>x.relation),internal_overlaps:geometry.internal.length,internal_relations:geometry.internal.map(x=>x.relation),boundary_flags:geometry.boundary_flags.length,all_cases:inventory.map(summary)};
 save(path.join(out,'SUMMARY.json'),result);
 console.log(JSON.stringify({native_result:result.fibre_strict,edge_strict:result.edge_strict,triad_strict:result.triad_strict,separate_checks:result.separate_checks,singles:histogram,facts:r.count,epochs:r.epochs}));
 const replay=path.join(out,'replay');fs.mkdirSync(replay);fs.copyFileSync(path.join(stage,'source-map.json'),path.join(replay,'source-map.json'),fs.constants.COPYFILE_EXCL);
 launch('replay',exe,[path.join(stage,'image.bin'),path.join(replay,'readback.bin'),'--fact-capacity','4194304'],true);
 const readback=identity(path.join(stage,'readback.bin')), repeated=identity(path.join(replay,'readback.bin'));
 need(readback.sha256===repeated.sha256,'REPLAY_NOT_SAME');
 verify();
 const record={schema:'J17CoordinateFibreDiagnostic010',verdict:'IF_THEN_ON_DIAGNOSTIC_SUBJECT',inputs:bound,source:identity(imageSource),native_source:identity(source),image:identity(path.join(stage,'image.bin')),readback,replay:repeated,replay_comparison:'SAME',fact_capacity:4194304,facts:r.count,epochs:r.epochs,error:r.error,summary:result,artifacts:['TRANSPORT.json','FIBRE_ASSIGNMENTS_AND_RECEIPTS.json','SINGLE_FLAG_EXCLUSIONS.json','SUMMARY.json'].map(n=>identity(path.join(out,n))),scope:{fibre_family:'User-requested constant assignments on each of the 42 site,120 edge,80 triad fibres. Promotion and commit contract reviewed separately.',global_uniqueness:'484-case coverage witnessed; family membership in the promoted offer relation is a distinct source correspondence.',physical_correspondence:'No hydrogen or radiation correspondence established by this diagnostic.',worldline:'UNCHANGED; no link committed.',repository:'UNCOMMITTED; no push.'}};
 save(path.join(out,'RUN_RECORD_010.json'),record);
 console.log(JSON.stringify({record:identity(path.join(out,'RUN_RECORD_010.json')),replay:'SAME',site_strict:result.site_strict,separate_checks:result.separate_checks}));
}catch(e){save(path.join(out,'STOP.json'),{reason:e.message,scope:'DIAGNOSTIC_ONLY',worldline:'UNCHANGED',commit:'NOT_PERFORMED'});throw e;}


