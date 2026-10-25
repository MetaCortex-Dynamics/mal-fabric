// Custody, transport, invocation and observation only. Native pairs.mal
// constructs every case, applies assignments and produces receipt witnesses.
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
const j=JSON.stringify;
const input=path.join(root,'j17_step_023/outputs/committed.world.json');
const base=path.join(root,'j17_strict_discharge_diagnostic_008/source/diagnostic.mal');
const source=path.join(here,'source/pairs.mal');
const lower=path.join(root,'j17_step_021/tools/lower.mjs');
const exe=path.join(root,'runtime_021/block_iterative_runtime.exe');
const qualification=path.join(root,'runtime_021/qualification_002/QUALIFICATION.json');
const packet=path.join(root,'world_transition_contacts_007/MANIFEST.json');
const record='C:/Users/devon/Desktop/MaL/MaLv3/RECORD_J17_REACTION_PDPE_001.mal';
const prior='D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/RUN_RECORD_010.json';
const priorBinding=path.join(root,'j17_fibre_diagnostic_010/FINAL_BINDING.json');
const expected=new Map([
 [input,'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'],
 [base,'9DEBF75815CCAE27FA7726ABDA0C33174B6C97ABCD39F8981E55B11D8F30046C'],
 [lower,'05CE980CBC68707070837001819A90DF532A730569BA1112367C07BC017BD45B'],
 [exe,'9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06'],
 [qualification,'D2F42E635BF8095CE5BA3208B030D8F7F26E0A96074F78597833F1CE7D6E41F5'],
 [packet,'13F4676010390261EAFC6C208498231806C738599D5376314D36E3DFDCA44EC6'],
 [record,'3605713EFF93B32033C51704C258B3EF60310247BB2917DCD72F7B0D872A5E05'],
 [prior,'2AD351F73AF9C7046C6883E0EF1C29180F272DAF9EDE5047630E242743F9A053'],
 [priorBinding,'D3BC0F9871DDA01CE528634AC7EF384E54D4F317B4B8E8661B9B39C4D74B838E']
]);
for(const [p,h] of expected)need(identity(p).sha256===h,'NOT_SAME_INPUT '+p);
need(JSON.parse(fs.readFileSync(qualification)).qualification==='SAME','UNQUALIFIED_RUNTIME');
const [mode,name='run_001']=process.argv.slice(2);
need(mode==='run'&&/^[A-Za-z0-9_]+$/.test(name),'usage: node run.mjs run fresh_directory');
const out=path.join('D:/mal_worldline_backups/j17_pair_diagnostic_011',name);
need(!fs.existsSync(out),'PRESERVE_PRIOR_OUTPUT');
const world=JSON.parse(fs.readFileSync(input));
need(world.field.length===480&&world.witness.length===720,'INPUT_CARRIER_SHAPE');
const bound=[...expected.keys(),source,fileURLToPath(import.meta.url)].map(identity);
const verify=()=>{for(const b of bound)need(identity(b.path).sha256===b.sha256,'CUSTODY_NOT_SAME '+b.path);};
fs.mkdirSync(out);
fs.copyFileSync(record,path.join(out,path.basename(record)),fs.constants.COPYFILE_EXCL);
save(path.join(out,'INPUTS.json'),{scope:'PART_A_KEEP_TWO_ASSIGNMENT_DIAGNOSTIC',bound});
let wrapper='// All g2 rows imported unchanged; no host-side offer generation.\n';
for(const [key,label] of [['field','KD_INPUT_FIELD_ROW'],['witness','KD_INPUT_WITNESS_ROW']])
 for(let i=0;i<world[key].length;i++)wrapper+=`@readonly input ${label} := "g2:/${key}/${i}";\n`;
wrapper+='@propose seed KD_ASCII_ENCODING := {\n'+Array.from({length:94},(_,i)=>` GOES_WITH(KD_BYTE_NEXT,B${i+32},B${i+33})`).join(',\n')+'\n};\n';
const imageSource=path.join(out,'diagnostic.mal');
write(imageSource,wrapper+fs.readFileSync(base,'utf8')+'\n'+fs.readFileSync(source,'utf8'));
const stage=path.join(out,'stage'), capacity='1048576';
function launch(label,command,args,gpu=false){
 verify();
 if(gpu){const q=spawnSync('nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});need(q.status===0&&q.stdout.includes('RTX 3070'),'GPU_NOT_BOUND');console.log(q.stdout.trim());}
 console.log(j({launch:label,args}));
 const started=new Date().toISOString();
 const r=spawnSync(command,args,{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024,timeout:600000});
 save(path.join(out,label+'.execution.json'),{command,args,started,ended:new Date().toISOString(),exit:r.status,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??''});
 verify();need(!r.error&&r.status===0,'EXECUTION_STOP '+label+' '+r.error?.message+' '+r.stderr);
}
try{
 launch('lower',process.execPath,[lower,imageSource,stage,'-','g2='+input]);
 launch('gpu',exe,[path.join(stage,'image.bin'),path.join(stage,'readback.bin'),'--fact-capacity',capacity],true);
 const r=openReadback(stage);
 const rows=tag=>r.predicate(tag).map(f=>({fact:f.id,origin:f.origin,support:f.support,args:r.node(f.term).c.slice(1)}));
 const pair=id=>{const n=r.node(id);need(n.s==='PAIR'&&n.c.length===4,'PAIR_ENCODING');return {kind:r.node(n.c[0]).s,a:r.value(n.c[1]),b:r.value(n.c[2]),reading:r.value(n.c[3])};};
 const proof=f=>({fact:f.fact,origin:f.origin,support:f.support});
 const cases=new Map(rows('PA_CASE').map(f=>[j(pair(f.args[0])),{...pair(f.args[0]),proof:proof(f),opened:[],discharged:[],retained:[],changed:[],checked:[],after:[],fields:[],coverage:[],excluded_open:[],excluded_empty:[],strict:[],complete:[]} ]));
 const each=(tag,fn)=>{for(const f of rows(tag)){const c=cases.get(j(pair(f.args[0])));need(c,'UNBOUND_CASE '+tag);fn(c,f);}};
 for(const [tag,key] of [['PA_OPENED','opened'],['PA_DISCHARGED','discharged'],['PA_RETAINED','retained']])each(tag,(c,f)=>c[key].push({overlap:f.args.slice(1).map(x=>r.value(x)),...proof(f)}));
 each('PA_CHANGED',(c,f)=>c.changed.push({flag:r.value(f.args[1]),before:r.value(f.args[2]),after:r.value(f.args[3]),...proof(f)}));
 each('PA_CHECK',(c,f)=>c.checked.push({overlap:f.args.slice(1,3).map(x=>r.value(x)),before:r.value(f.args[3]),...proof(f)}));
 each('PA_AFTER',(c,f)=>c.after.push({overlap:f.args.slice(1,3).map(x=>r.value(x)),before:r.value(f.args[3]),after:r.value(f.args[4]),...proof(f)}));
 each('PA_FIELD',(c,f)=>c.fields.push({flag:r.value(f.args[1]),reading:r.value(f.args[2]),...proof(f)}));
 each('PA_SIDE_EXAMINED',(c,f)=>c.coverage.push({side:r.node(f.args[1]).s,kind:r.node(f.args[2]).s,...proof(f)}));
 each('PA_EXCLUDED',(c,f)=>c.excluded_open.push({condition:r.node(f.args[1]).s,overlap:f.args.slice(2).map(x=>r.value(x)),...proof(f)}));
 each('PA_EXCLUDED_EMPTY',(c,f)=>c.excluded_empty.push({condition:r.node(f.args[1]).s,...proof(f)}));
 each('PA_STRICT',(c,f)=>c.strict.push(proof(f)));
 each('PA_COMPLETE',(c,f)=>c.complete.push(proof(f)));
 need(rows('KD_FIELD').length===480&&rows('KD_BASE_BOUND').length===720,'BASELINE_COVERAGE');
 const incident=new Map();for(const f of rows('KD_INCIDENT')){const key=j([r.value(f.args[0]),r.node(f.args[1]).s]);incident.set(key,(incident.get(key)||0)+1);}
 need(incident.size===1440&&[...incident.values()].every(n=>n===1),'INCIDENCE_ROLE_COVERAGE');
 need(cases.size===1440,'CASE_COUNT');
 const baselineWalls=new Set(world.witness.filter(x=>x[2]==='NOT_SAME').map(x=>j(x.slice(0,2))));
 const sameSet=(a,b)=>a.size===b.size&&[...a].every(x=>b.has(x));
 for(const c of cases.values()){
  need(c.complete.length===1&&c.coverage.length===6,'NATIVE_COMPLETENESS');
  need(new Set(c.coverage.map(x=>j([x.side,x.kind]))).size===6,'DUPLICATE_COVERAGE');
  const check=new Set(c.checked.map(x=>j(x.overlap))), after=new Set(c.after.map(x=>j(x.overlap)));
  need(check.size===c.checked.length&&after.size===c.after.length&&sameSet(check,after),'AFTER_CHECK_COVERAGE');
  need([...baselineWalls].every(x=>check.has(x)),'OLD_WALL_COVERAGE');
  need(sameSet(new Set([...c.retained,...c.discharged].map(x=>j(x.overlap))),baselineWalls),'OLD_WALL_PARTITION');
  need(c.retained.length+c.discharged.length===baselineWalls.size,'OLD_WALL_DISJOINTNESS');
  need(new Set(c.fields.map(x=>j(x.flag))).size===c.fields.length,'FIELD_READING_CONFLICT');
  need(c.strict.length+c.excluded_open.length+c.excluded_empty.length>0,'CASE_WITHOUT_VERDICT');
  need((c.strict.length>0)===(c.discharged.length>0&&c.opened.length===0),'STRICT_RECEIPT_NOT_SAME');
  need(c.excluded_open.length===c.opened.length,'OPENING_WITNESS_COVERAGE');
  need((c.excluded_empty.length>0)===(c.discharged.length===0),'EMPTY_DISCHARGE_WITNESS');
 }
 const inventory=[...cases.values()].sort((a,b)=>Buffer.compare(Buffer.from(j([a.kind,a.a,a.b,a.reading])),Buffer.from(j([b.kind,b.a,b.b,b.reading]))));
 const counts={},histogram={},byKind={};
 for(const c of inventory){counts[c.kind]=(counts[c.kind]??0)+1;const key=`discharged=${c.discharged.length};opened=${c.opened.length}`;histogram[key]=(histogram[key]??0)+1;(byKind[c.kind]??={})[key]=((byKind[c.kind]??{})[key]??0)+1;}
 need(Object.values(counts).length===3&&Object.values(counts).every(n=>n===480),'KIND_COVERAGE');
 const strict=inventory.filter(c=>c.strict.length).map(c=>({kind:c.kind,a:c.a,b:c.b,reading:c.reading,discharged:c.discharged.length,opened:c.opened.length,proof:c.strict}));
 const summary={scope:'USER_REQUESTED_KEEP_TWO_CONSTANT_ASSIGNMENTS; OFFER_CORRESPONDENCE_NOT_INFERRED',total:inventory.length,counts,strict_count:strict.length,strict,histogram,by_kind:byKind,opened_nonempty:inventory.filter(c=>c.opened.length).length,discharged_empty:inventory.filter(c=>!c.discharged.length).length,unchanged:inventory.filter(c=>!c.changed.length).length,receipt_coverage:inventory.length,incidence_roles:incident.size};
 save(path.join(out,'PAIR_ASSIGNMENTS_AND_RECEIPTS.json'),{...summary,cases:inventory});
 save(path.join(out,'SUMMARY.json'),summary);
 console.log(j(summary));
 const replay=path.join(out,'replay');fs.mkdirSync(replay);fs.copyFileSync(path.join(stage,'source-map.json'),path.join(replay,'source-map.json'),fs.constants.COPYFILE_EXCL);
 launch('replay',exe,[path.join(stage,'image.bin'),path.join(replay,'readback.bin'),'--fact-capacity',capacity],true);
 const readback=identity(path.join(stage,'readback.bin')), repeated=identity(path.join(replay,'readback.bin'));
 need(readback.sha256===repeated.sha256,'REPLAY_NOT_SAME');
 const old=JSON.parse(fs.readFileSync(priorBinding));
 const result={schema:'J17PairDiagnostic011',verdict:'IF_THEN_ON_REQUESTED_DIAGNOSTIC_SUBJECT',inputs:bound,source:identity(imageSource),image:identity(path.join(stage,'image.bin')),readback,replay:repeated,replay_comparison:'SAME',facts:r.count,epochs:r.epochs,error:r.error,summary,combined:{keep_one:484,keep_two:1440,total_assignments:1924,strict_count:old.result.strict.length+strict.length,keep_one_strict:old.result.strict,keep_two_strict:strict,scope:'Exactly the two requested families; not an assertion of promoted offer exhaustion'},record_correction:{keep_one_non_strict:483,opened_nonempty:253,unchanged_empty_discharge:230,original_record_preserved:identity(path.join(out,path.basename(record)))},result:identity(path.join(out,'PAIR_ASSIGNMENTS_AND_RECEIPTS.json')),worldline:'UNCHANGED: no runtime PROMOTE or worldline EXECUTE inferred from this diagnostic',repository:'No repository commit or push'};
 verify();save(path.join(out,'RUN_RECORD_011.json'),result);
 console.log(j({record:identity(path.join(out,'RUN_RECORD_011.json')),readback,replay:'SAME',facts:r.count,epochs:r.epochs,total:inventory.length,strict:strict.length,combined:result.combined}));
}catch(error){save(path.join(out,'STOP.json'),{scope:'PART_A_DIAGNOSTIC',reason:error.message,worldline:'UNCHANGED',commit:'NOT_PERFORMED'});throw error;}
