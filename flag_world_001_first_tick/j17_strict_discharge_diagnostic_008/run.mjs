// Custody/transport/invocation/observation only. All geometry and receipt
// predicates are produced by diagnostic.mal on the qualified GPU runtime.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { openReadback } from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)), root=path.dirname(here);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:hash(b)};};
const requireThat=(x,message)=>{if(!x)throw Error(message);};
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const save=(p,o)=>write(p,JSON.stringify(o,null,2)+'\n');
const input=path.join(root,'j17_step_023/outputs/committed.world.json');
const lower=path.join(root,'j17_step_021/tools/lower.mjs');
const exe=path.join(root,'runtime_021/block_iterative_runtime.exe');
const qualification=path.join(root,'runtime_021/qualification_002/QUALIFICATION.json');
const source=path.join(here,'source/diagnostic.mal');
const expected=new Map([
 [input,'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'],
 [lower,'05CE980CBC68707070837001819A90DF532A730569BA1112367C07BC017BD45B'],
 [exe,'9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06'],
 [qualification,'D2F42E635BF8095CE5BA3208B030D8F7F26E0A96074F78597833F1CE7D6E41F5']
]);
for(const [p,h] of expected)requireThat(identity(p).sha256===h,'NOT_SAME_INPUT '+p);
requireThat(JSON.parse(fs.readFileSync(qualification)).qualification==='SAME','UNQUALIFIED_RUNTIME');
const [mode,name='run_001']=process.argv.slice(2);
requireThat(mode==='run'&&/^[A-Za-z0-9_]+$/.test(name),'usage: node run.mjs run fresh_directory');
const out=path.join(here,name);requireThat(!fs.existsSync(out),'PRESERVE_PRIOR_OUTPUT');
const world=JSON.parse(fs.readFileSync(input));
requireThat(Array.isArray(world.field)&&Array.isArray(world.witness),'INPUT_ARRAY_SHAPE');
const bound=[input,source,lower,exe,qualification,fileURLToPath(import.meta.url)].map(identity);
const verify=()=>{for(const x of bound)requireThat(identity(x.path).sha256===x.sha256,'CUSTODY_NOT_SAME '+x.path);};
fs.mkdirSync(out);save(path.join(out,'INPUTS.json'),{scope:'USER_AUTHORIZED_DIAGNOSTIC_UNION_NOT_PROMOTED_WORLD_TRANSITION',bound});

// Row seating is generic JSON transport, not a geometry or predicate producer.
// All rows are imported; no field reading filters them on the host.
let wrapper='// Exact g2 JSON-pointer transport. Repeated input labels form relations.\n';
for(const [key,label] of [['field','KD_INPUT_FIELD_ROW'],['witness','KD_INPUT_WITNESS_ROW']])
 for(let i=0;i<world[key].length;i++)wrapper+=`@readonly input ${label} := "g2:/${key}/${i}";\n`;
// ASCII coding supports symmetric distinction only, not a semantic order.
wrapper+='@propose seed KD_ASCII_ENCODING := {\n'+Array.from({length:94},(_,i)=>` GOES_WITH(KD_BYTE_NEXT,B${i+32},B${i+33})`).join(',\n')+'\n};\n';
const imageSource=path.join(out,'diagnostic.mal');
write(imageSource,wrapper+fs.readFileSync(source,'utf8'));
const stage=path.join(out,'stage');
function launch(label,command,args,gpu=false){
 verify();
 if(gpu){const q=spawnSync('nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});requireThat(q.status===0&&q.stdout.includes('RTX 3070'),'GPU_NOT_BOUND');console.log(q.stdout.trim());}
 console.log(JSON.stringify({launch:label,args}));
 const started=new Date().toISOString();
 const r=spawnSync(command,args,{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024,timeout:600000});
 save(path.join(out,label+'.execution.json'),{command,args,started,ended:new Date().toISOString(),exit:r.status,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??''});
 verify();requireThat(!r.error&&r.status===0,'EXECUTION_STOP '+label+' '+r.error?.message+' '+r.stderr);
}
try{
 launch('lower',process.execPath,[lower,imageSource,stage,'-','g2='+input]);
 launch('gpu',exe,[path.join(stage,'image.bin'),path.join(stage,'readback.bin'),'--fact-capacity','262144'],true);
 const r=openReadback(stage);
 const rows=tag=>r.predicate(tag).map(f=>({fact:f.id,origin:f.origin,support:f.support,args:r.node(f.term).c.slice(1)}));
 const move=id=>{const n=r.node(id);requireThat(n.s==='MOVE'&&n.c.length===5,'MOVE_ENCODING');const [kind,target,from,via,to]=n.c.map(x=>r.value(x));return {kind,target,from,via,to};};
 const json=v=>JSON.stringify(v);
 const offers=new Map(rows('KD_OFFER').map(f=>[json(move(f.args[0])),{...move(f.args[0]),offer_fact:f.fact,opened:[],discharged:[],exclusions:[],affected:[],coverage:[]} ]));
 function each(tag,fn){for(const f of rows(tag)){const offer=offers.get(json(move(f.args[0])));requireThat(offer,'UNBOUND_OFFER '+tag);fn(offer,f);}}
 each('KD_OPENED',(o,f)=>o.opened.push({overlap:f.args.slice(1).map(x=>r.value(x)),fact:f.fact}));
 each('KD_DISCHARGED',(o,f)=>o.discharged.push({overlap:f.args.slice(1).map(x=>r.value(x)),fact:f.fact}));
 each('KD_NOT_STRICT',(o,f)=>o.exclusions.push({kind:r.node(f.args[1]).s,overlap:f.args.slice(2).map(x=>r.value(x)),fact:f.fact}));
 each('KD_AFTER_OVERLAP',(o,f)=>o.affected.push({overlap:f.args.slice(1,3).map(x=>r.value(x)),before:r.value(f.args[3]),after:r.value(f.args[4]),fact:f.fact}));
 each('KD_SIDE_EXAMINED',(o,f)=>o.coverage.push({side:r.node(f.args[1]).s,relation:r.node(f.args[2]).s,fact:f.fact}));
 const strict=rows('KD_STRICT').map(f=>({move:move(f.args[0]),fact:f.fact}));
 const complete=new Set(rows('KD_RECEIPT_COMPLETE').map(f=>json(move(f.args[0]))));
 requireThat(rows('KD_WRITE_CONFLICT').length===0,'CONFLICTING_FLAG_WRITES');
 requireThat(rows('KD_FIELD').length===world.field.length,'FIELD_COVERAGE');
 requireThat(rows('KD_BASE_BOUND').length===world.witness.length,'BASELINE_NOT_SAME');
 requireThat(offers.size===complete.size&&[...offers.keys()].every(k=>complete.has(k)),'RECEIPT_COVERAGE');
 // Observe the supplied corpus's one delta/gamma/tau overlap per flag.
 const incident=new Map();for(const f of rows('KD_INCIDENT')){const key=json([r.value(f.args[0]),r.node(f.args[1]).s]);incident.set(key,(incident.get(key)||0)+1);}
 requireThat(incident.size===world.field.length*3&&[...incident.values()].every(n=>n===1),'INCIDENCE_EXHAUSTION');
 const inventory=[...offers.values()].sort((a,b)=>Buffer.compare(Buffer.from(json([a.kind,a.target,a.from,a.via,a.to])),Buffer.from(json([b.kind,b.target,b.from,b.via,b.to]))));
 const counts={};const histogram={};for(const o of inventory){counts[o.kind]=(counts[o.kind]??0)+1;const key=`discharged=${o.discharged.length};opened=${o.opened.length}`;histogram[key]=(histogram[key]??0)+1;}
 const result={scope:'DIAGNOSTIC_UNION_ALL_INCIDENCE_ELIGIBLE_TARGETS; NOT_A_PROMOTED_AUTONOMOUS_INPUT_BINDING',counts,total:offers.size,strict_count:strict.length,strict,receipt_histogram:histogram,excluded_with_opened_witness:inventory.filter(o=>o.exclusions.length).length,all_receipts_complete:complete.size,offers:inventory};
 save(path.join(out,'OFFERS_AND_RECEIPTS.json'),result);
 // Equal native image replay: observation only, no world effects.
 const replay=path.join(out,'replay');fs.mkdirSync(replay);fs.copyFileSync(path.join(stage,'source-map.json'),path.join(replay,'source-map.json'),fs.constants.COPYFILE_EXCL);
 launch('replay',exe,[path.join(stage,'image.bin'),path.join(replay,'readback.bin'),'--fact-capacity','262144'],true);
 const readback=identity(path.join(stage,'readback.bin')), repeated=identity(path.join(replay,'readback.bin'));
 requireThat(readback.sha256===repeated.sha256,'REPLAY_NOT_SAME');
 const record={schema:'J17StrictDischargeDiagnostic008',verdict:'IF_THEN_ON_DIAGNOSTIC_SUBJECT',inputs:bound,source:identity(imageSource),image:identity(path.join(stage,'image.bin')),readback,replay:repeated,replay_comparison:'SAME',facts:r.count,epochs:r.epochs,error:r.error,counts,total:offers.size,strict_count:strict.length,receipt_histogram:histogram,excluded_with_opened_witness:result.excluded_with_opened_witness,receipt_coverage:complete.size,incidence_roles:incident.size,result:identity(path.join(out,'OFFERS_AND_RECEIPTS.json')),interpretation:{all_targets_union:'User-authorized diagnostic; not a new promotion of ENGINE declared-move semantics.',A6:'No terminal contradiction inferred: zero strict lifts in this restricted one-source/one-target family is not exhaustion of every strict-discharge transition.',worldline:'UNCHANGED; no entity record created, no lift selected, no link committed.',repository:'UNCOMMITTED; no push.'}};
 verify();save(path.join(out,'RUN_RECORD_008.json'),record);
 console.log(JSON.stringify({record:identity(path.join(out,'RUN_RECORD_008.json')),counts,total:offers.size,strict:strict.length,histogram,replay:'SAME'}));
}catch(error){save(path.join(out,'STOP.json'),{scope:'DIAGNOSTIC_ONLY',reason:error.message,worldline:'UNCHANGED',commit:'NOT_PERFORMED'});throw error;}
