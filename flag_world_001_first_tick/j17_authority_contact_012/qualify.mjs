// Qualification/custody only. All connection operations run from contact.mal.
// Fixtures are not J17 grants, sections, admissions or decisions.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {openReadback,sha} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
const out=path.join(here,process.argv[2]??'qualification_001');
if(fs.existsSync(out))throw Error('FRESH_OUTPUT_REQUIRED');
const identity=p=>({path:p,sha256:sha(fs.readFileSync(p)),bytes:fs.statSync(p).size});
const lower=path.join(root,'j17_step_021/tools/lower.mjs'),exe=path.join(root,'runtime_021/block_iterative_runtime.exe');
if(identity(exe).sha256!=='9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06')throw Error('EXECUTOR_NOT_SAME');
const sourcePath=path.join(here,'source/contact.mal'),source=fs.readFileSync(sourcePath,'utf8');
const contact='CONTACT(BOUND(A,SP,GP,SEAT),BOUND(B,SD,GD,SEAT),FIELD)';
const facts=[
 'GOES_WITH(A12_CORRIDOR,C,A,B)',
 'GOES_WITH(A12_ALLOCATION,C,A,B,SEAT)',
 'GOES_WITH(A12_SECTION,C,A,PROPOSE,P,L,SP)',
 'GOES_WITH(A12_GRANT,C,A,PROPOSE,P,GP)',
 'GOES_WITH(A12_SECTION,C,B,DECIDE,P,L,SD)',
 'GOES_WITH(A12_GRANT,C,B,DECIDE,P,GD)',
 'GOES_WITH(A12_OFFER,P,STATE,L,FIELD)',
 `GOES_WITH(A12_OVERLAP,C,P,L,${contact},IF_THEN,OVERLAP)`,
 `GOES_WITH(A12_STATE,C,P,L,${contact},IF_THEN,ADMISSION)`,
 `GOES_WITH(A12_TRANSITION,C,P,L,STATE,${contact},IF_THEN,TRANSITION)`];
const cases=[{name:'complete_fixture',facts,expected:1}];
for(let i=0;i<facts.length;i++)cases.push({name:'missing_'+i,facts:facts.filter((_,j)=>i!==j),expected:0});
cases.push({name:'reversed_incidence_not_reversed_grant',facts:facts.map((x,i)=>i===0?'GOES_WITH(A12_CORRIDOR,C,B,A)':x),expected:1});
cases.push({name:'wrong_source',facts:facts.map((x,i)=>i===9?x.replace(',STATE,',',STALE,'):x),expected:0});
cases.push({name:'wrong_corridor',facts:facts.map((x,i)=>i===5?x.replace(',C,',',OTHER,'):x),expected:0});
cases.push({name:'wrong_lift',facts:facts.map((x,i)=>i===4?x.replace(',L,',',OTHER,'):x),expected:0});
cases.push({name:'transition_no',facts:facts.map((x,i)=>i===9?x.replace('IF_THEN','NO'):x),expected:0});
cases.push({name:'transition_maybe',facts:facts.map((x,i)=>i===9?x.replace('IF_THEN','MAYBE'):x),expected:0});
cases.push({name:'two_witnessed_contacts_no_selector',facts:[...facts,...facts.map(x=>x.replace(/\bL\b/g,'SECOND_LIFT'))],expected:2});
// Keep cases disjoint via constructor identifiers; this is fixture encoding only.
const atoms=['C','A','B','SEAT','SP','GP','SD','GD','P','L','SECOND_LIFT','STATE','FIELD','OVERLAP','ADMISSION','TRANSITION','STALE','OTHER'];
const seeds=[...new Set(cases.flatMap((t,i)=>t.facts.map(x=>x.replace(/\b[A-Z][A-Z_]*\b/g,a=>atoms.includes(a)?a+'_CASE_'+i:a))))];
fs.mkdirSync(out);
fs.writeFileSync(path.join(out,'source.mal'),'@propose seed QUALIFICATION_ONLY := {\n'+seeds.join(',\n')+'\n};\n'+source,{flag:'wx'});
const commands=[];
function run(cmd,args){const q=spawnSync(cmd,args,{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:16*1024*1024});commands.push({cmd,args,status:q.status,stdout:q.stdout,stderr:q.stderr,error:q.error?.message});fs.writeFileSync(path.join(out,'COMMANDS.json'),JSON.stringify(commands,null,2));if(q.status!==0||q.error)throw Error('EXECUTION_STOP');}
run(process.execPath,[lower,path.join(out,'source.mal'),path.join(out,'image')]);
for(const label of ['run','replay']){const d=path.join(out,label);fs.mkdirSync(d);fs.copyFileSync(path.join(out,'image/source-map.json'),path.join(d,'source-map.json'));run(exe,[path.join(out,'image/image.bin'),path.join(d,'readback.bin'),'--fact-capacity','16384']);}
const rr=openReadback(path.join(out,'run')),replay=openReadback(path.join(out,'replay'));
if(sha(rr.raw)!==sha(replay.raw))throw Error('REPLAY_NOT_SAME');
const results=rr.predicate('A12_DECIDE_OPERANDS').map(f=>({term:rr.term(f.term),rule:f.rule,support:f.support}));
const checks=cases.map((t,i)=>({name:t.name,expected:t.expected,observed:results.filter(x=>x.term.includes('P_CASE_'+i+',')).length}));
const record={scope:'SYNTHETIC_CONNECTION_QUALIFICATION_ONLY',world_admission:'NOT_CLAIMED',governed_input_record:'NOT_CONSTRUCTED; source operands only',link3:'NOT_COMMITTED',bindings:[sourcePath,lower,exe].map(identity),readback:identity(path.join(out,'run/readback.bin')),replay:identity(path.join(out,'replay/readback.bin')),replay_comparison:'SAME',checks,results,facts:rr.count,epochs:rr.epochs};
fs.writeFileSync(path.join(out,'RUN_RECORD.json'),JSON.stringify(record,null,2),{flag:'wx'});
if(checks.some(x=>x.observed!==x.expected))throw Error('QUALIFICATION_NOT_SAME');
console.log(JSON.stringify(record,null,2));
