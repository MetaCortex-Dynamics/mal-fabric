// Custody/transport and observation only. Receipt predicate, reduction and
// typed dispatch execute in source on the GPU. No world write or host selector.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const digest=x=>sha(JSON.stringify(canonical(x)));
const need=(c,m)=>{if(!c)throw Error(m);};
const contacts=[];
function bind(p,h){const b=fs.readFileSync(p);need(!h||sha(b)===h,'INPUT_NOT_SAME '+p);contacts.push({path:p,sha256:sha(b),bytes:b.length});return b;}
const worldPath=path.join(root,'j17_step_023/outputs/committed.world.json');
bind(worldPath,'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059');
const one=JSON.parse(bind('D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/FIBRE_ASSIGNMENTS_AND_RECEIPTS.json','3CF8EBD03172E056852399AC472605EFEA3704EB6EB71A6EFFB259A2566B4147'));
const two=JSON.parse(bind('D:/mal_worldline_backups/j17_pair_diagnostic_011/run_001/PAIR_ASSIGNMENTS_AND_RECEIPTS.json','BF21091472DA1C4E61B4D75F3F27E8E9C48BE67742C8A6DC9DECE2D783BF981F'));
const lifts=JSON.parse(bind(path.join(root,'j17_strict_discharge_diagnostic_008/run_001/OFFERS_AND_RECEIPTS.json'),'CC6FBD5377C6FB1EF5C8DD86C2E8E1079F2D72EAC036AF430266D586E5DF7B9D'));
bind('D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/RUN_RECORD_010.json','2AD351F73AF9C7046C6883E0EF1C29180F272DAF9EDE5047630E242743F9A053');
bind('D:/mal_worldline_backups/j17_pair_diagnostic_011/run_001/RUN_RECORD_011.json','35334015AC81697383480FAE210DE3CC1AF06FEBD75079761E280BCF948EE518');
bind(path.join(root,'j17_strict_discharge_diagnostic_008/run_001/RUN_RECORD_008.json'),'AB0128699327B078BE34D5C275E352160DE3A63A5269238D2693F55CF3B95B25');
bind(path.join(root,'j17_tick_promote_binding_013/RECORD_J17_TICK_PROMOTE_BINDING_013.mal'),'2E762748A07C77A808B6CD8A612DE926839D6066D99D0E5949CE2E990BD735E4');
const sourcePath=path.join(here,'source/law_input_decide.mal'),source=bind(sourcePath).toString();
const lower=path.join(root,'j17_step_021/tools/lower.mjs'),exe=path.join(root,'runtime_021/block_iterative_runtime.exe');
bind(lower,'05CE980CBC68707070837001819A90DF532A730569BA1112367C07BC017BD45B');
bind(exe,'9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06');
bind(fileURLToPath(import.meta.url));
const ordinary=one.cases.map((v,i)=>({v,pointer:'/cases/'+i,family:'keep_one'})).filter(x=>['SITE','EDGE','TRIAD'].includes(x.v.family));
const pairs=two.cases.map((v,i)=>({v,pointer:'/cases/'+i,family:'keep_two'}));
need(one.cases.length===487&&ordinary.length===484&&pairs.length===1440&&lifts.offers.length===228,'COMPLETE_FAMILY');
const all=[...ordinary,...pairs], ids=all.map(x=>digest(x.v));need(new Set(ids).size===1924,'DUPLICATE_MEMBER');
const list=xs=>xs.reduceRight((t,x)=>`CONS(${JSON.stringify(digest(x))},${t})`,'NIL');
const leaf=(v,kind)=>`LEAF(${kind}(${JSON.stringify(digest(v))}),${list(v.discharged)},${list(v.opened)})`;
const tree=xs=>!xs.length?'EMPTY_TREE':xs.length===1?xs[0]:`BRANCH(${tree(xs.slice(0,Math.floor(xs.length/2)))},${tree(xs.slice(Math.floor(xs.length/2)))})`;
const input=(c,xs)=>`GOES_WITH(LD_INPUT,${c},${tree(xs)})`;
const strictA='LEAF(SECTION_READING(FIXTURE_A),CONS(WALL,NIL),NIL)',strictB='LEAF(SECTION_READING(FIXTURE_B),CONS(WALL,NIL),NIL)';
const fixtureRows=[input('TEST_EMPTY',[]),input('TEST_OPEN',['LEAF(SECTION_READING(FIXTURE_C),CONS(WALL,NIL),CONS(NEW_WALL,NIL))']),input('TEST_UNCHANGED',['LEAF(SECTION_READING(FIXTURE_D),NIL,NIL)']),input('TEST_ONE',[strictA]),input('TEST_MANY',[strictA,strictB]),input('TEST_LIFT',['LEAF(A3_LIFT(FIXTURE_L),CONS(WALL,NIL),NIL)'])];
const expectedMember='19EBB89436905DB26E25BDB0039043C870C9282FA0E3CDEFECFBB749340DBDE9';
const out=path.join(here,process.argv[2]||'run_001');need(!fs.existsSync(out),'PRESERVE_OUTPUT');fs.mkdirSync(out);
const write=(p,s)=>fs.writeFileSync(p,s,{flag:'wx'}),save=(p,v)=>write(p,JSON.stringify(v,null,2)+'\n');
save(path.join(out,'INPUTS.json'),{contacts,scope:'COMPLETE_BOUND_1924_SECTIONS_AND_228_LIFTS; SIX_SYNTHETIC_CONTROLS',members:all.map(x=>({family:x.family,pointer:x.pointer,identity:digest(x.v)}))});
function custody(){for(const c of contacts)need(sha(fs.readFileSync(c.path))===c.sha256,'CUSTODY_NOT_SAME '+c.path);}
function launch(label,cmd,args){custody();const r=spawnSync(cmd,args,{encoding:'utf8',windowsHide:true,timeout:600000,maxBuffer:4*1024*1024});save(path.join(out,label+'.execution.json'),{cmd,args,exit:r.status,error:r.error?.message,stdout:r.stdout,stderr:r.stderr});need(r.status===0&&!r.error,'EXECUTION_STOP '+label);custody();}
function observe(stage){const r=openReadback(stage);function render(id){const n=r.node(id);if(n.s==='TEXT')return JSON.stringify(r.text(id));return n.s+(n.c.length?'('+n.c.map(render).join(',')+')':'');}const tags=['LD_RESULT','LD_GATE_DECIDE_INPUT','LD_LIFT_DECIDE_INPUT','LD_STRICT_MEMBER'];const records=Object.fromEntries(tags.map(t=>[t,r.predicate(t).map(f=>({term:render(f.term),fact:f.id,origin:f.origin,support:f.support})).sort((a,b)=>a.term.localeCompare(b.term))]));for(const rows of Object.values(records))for(const f of rows)need(f.support.length>0&&f.origin!=='SOURCE_SEED','NATIVE_PROVENANCE');
 const results=records.LD_RESULT.map(x=>x.term);need(results.length===8,'RESULT_COUNT');
 for(const s of ['GOES_WITH(LD_RESULT,J17_LIFTS,NO_ENACTMENT)','GOES_WITH(LD_RESULT,J17_SECTIONS,DETERMINED(SECTION_READING('+JSON.stringify(expectedMember)+')))','GOES_WITH(LD_RESULT,TEST_EMPTY,NO_ENACTMENT)','GOES_WITH(LD_RESULT,TEST_OPEN,NO_ENACTMENT)','GOES_WITH(LD_RESULT,TEST_UNCHANGED,NO_ENACTMENT)','GOES_WITH(LD_RESULT,TEST_ONE,DETERMINED(SECTION_READING(FIXTURE_A)))','GOES_WITH(LD_RESULT,TEST_MANY,MAYBE)','GOES_WITH(LD_RESULT,TEST_LIFT,DETERMINED(A3_LIFT(FIXTURE_L)))'])need(results.includes(s),'RESULT_NOT_SAME '+s);
 need(records.LD_GATE_DECIDE_INPUT.length===2&&records.LD_LIFT_DECIDE_INPUT.length===1,'TYPED_DISPATCH');
 return {facts:r.count,epochs:r.epochs,error:r.error,readback_sha256:sha(r.raw),records};}
try{
 const outcomes=[];
 for(const mode of ['normal','replay','reversed']){
  const dir=path.join(out,mode);fs.mkdirSync(dir);let stage;
  if(mode==='replay'){stage=dir;fs.copyFileSync(path.join(out,'normal/stage/source-map.json'),path.join(stage,'source-map.json'),fs.constants.COPYFILE_EXCL);}
  else{const sections=all.map(x=>leaf(x.v,'SECTION_READING')),ls=lifts.offers.map(v=>leaf(v,'A3_LIFT'));if(mode==='reversed'){sections.reverse();ls.reverse();}const rows=[input('J17_SECTIONS',sections),input('J17_LIFTS',ls),...fixtureRows];const p=path.join(dir,'input.mal');write(p,source+'\n@propose seed LD_CUSTODY := {\n'+rows.join(',\n')+'\n};\n');stage=path.join(dir,'stage');launch(mode+'_lower',process.execPath,[lower,p,stage]);}
  const image=path.join(out,mode==='replay'?'normal/stage':mode+'/stage','image.bin');launch(mode+'_gpu',exe,[image,path.join(stage,'readback.bin'),'--fact-capacity','65536']);const o=observe(stage);save(path.join(dir,'OBSERVATIONS.json'),o);outcomes.push(o);console.log(JSON.stringify({mode,facts:o.facts,epochs:o.epochs,sha256:o.readback_sha256}));
 }
 need(outcomes[0].readback_sha256===outcomes[1].readback_sha256,'REPLAY_NOT_SAME');need(JSON.stringify(Object.fromEntries(Object.entries(outcomes[0].records).map(([k,v])=>[k,v.map(x=>x.term)])))===JSON.stringify(Object.fromEntries(Object.entries(outcomes[2].records).map(([k,v])=>[k,v.map(x=>x.term)]))),'ORDER_RESULT_NOT_SAME');custody();
 save(path.join(out,'RUN_RECORD_017.json'),{verdict:'IF_THEN',scope:'LAW_INPUT_DETERMINATION_AND_TYPED_DISPATCH; NOT_ENACTMENT_EXECUTION',contacts,offered_sections:1924,offered_lifts:228,synthetic_controls:6,replay:'SAME_BYTES',reversed:'SAME_RESULT_MEMBER_AND_DISPATCH_SETS',runs:outcomes,gate_member_identity:expectedMember,world:'UNCHANGED',link_3:'NOT_WRITTEN',remaining:'Enactment consumer integration and execution; no generic LocalSection prerequisite'});
}catch(e){save(path.join(out,'STOP.json'),{reason:e.message,world:'NOT_WRITTEN',link_3:'NOT_WRITTEN'});throw e;}
