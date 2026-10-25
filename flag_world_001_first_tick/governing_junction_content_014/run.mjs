// Custody, fixture transport, native invocation and observation only.
// All content comparison and terminal conclusions are in the bound .mal source.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
import {fixtures, fixtureSource} from './fixtures.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)), root=path.dirname(here);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=p=>{const bytes=fs.readFileSync(p);return {path:path.resolve(p),bytes:bytes.length,sha256:sha(bytes)};};
const need=(condition,reason)=>{if(!condition)throw Error(reason);};
const write=(p,bytes)=>fs.writeFileSync(p,bytes,{flag:'wx'});
const save=(p,value)=>write(p,JSON.stringify(value,null,2)+'\n');
const read=p=>JSON.parse(fs.readFileSync(p));
const source=path.join(here,'source/governing_junction_content.mal');
const lower=path.join(root,'j17_step_021/tools/lower.mjs');
const executable=path.join(root,'runtime_021/block_iterative_runtime.exe');
const qualification=path.join(root,'runtime_021/qualification_002/QUALIFICATION.json');
const decoder=path.join(root,'evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs');
const original=path.join(root,'j17_step_023/outputs/committed.world.json');
const contactsFile=path.join(here,'CONTACTS.json');
const expectedInputs=new Map([
 [lower,'05CE980CBC68707070837001819A90DF532A730569BA1112367C07BC017BD45B'],
 [executable,'9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06'],
 [path.join(root,'runtime_021/block_iterative_runtime.cu'),'F055FFCE4AA8F536CE9BC7AEA7B1235887371D2855C9312F420FB5FEFB1D5ECE'],
 [qualification,'D2F42E635BF8095CE5BA3208B030D8F7F26E0A96074F78597833F1CE7D6E41F5'],
 [decoder,'4612D0189AD00B89522C8CD9F472E39EB1574991F5FB4241FF3CD85F415E32D3'],
 [path.join(root,'j17_step_021/tools/source_occurrence_custody.mjs'),'187C741EACD6285166B4D359D0921A012A3ACDBE8C3FEB5AAAC62198FC82EA3B'],
 ['C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs','187C741EACD6285166B4D359D0921A012A3ACDBE8C3FEB5AAAC62198FC82EA3B'],
 [original,'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'],
 ['C:/Users/devon/Desktop/MaL/MaLv3/governing_junction.mal','A14B15BC19B354E49F744D13D762B61986BB74B206D19C2BCE692138C95DE7A4'],
]);
const [mode,name='run_001']=process.argv.slice(2);
need(mode==='run'&&/^[A-Za-z0-9_]+$/.test(name),'usage: node run.mjs run fresh_directory');
const out=path.join(here,name);
need(!fs.existsSync(out),'PRESERVE_PRIOR_OUTPUT');
for(const [p,digest] of expectedInputs)need(identity(p).sha256===digest,'INPUT_NOT_SAME '+p);
need(read(qualification).qualification==='SAME','RUNTIME_NOT_QUALIFIED');
const contacts=read(contactsFile);
for(const contact of contacts.contacts){const now=identity(contact.path);need(now.bytes===contact.bytes&&now.sha256===contact.sha256,'CONTACT_NOT_SAME '+contact.name);}
const bound=[...new Set([...expectedInputs.keys(),source,fileURLToPath(import.meta.url),path.join(here,'fixtures.mjs'),contactsFile,...contacts.contacts.map(c=>c.path)])].map(identity);
const verifyCustody=()=>{for(const b of bound){const now=identity(b.path);need(now.bytes===b.bytes&&now.sha256===b.sha256,'CUSTODY_NOT_SAME '+b.path);}};
fs.mkdirSync(out);
save(path.join(out,'INPUTS.json'),{scope:'SYNTHETIC_SUPPLIED_PROJECTION_CONTENT_ONLY',bound,fixture_count:fixtures.length,fact_capacity:16384,worldline:'NOT_AN_INPUT_TO_CONTENT_COMPARISON; HASH_WATCH_ONLY'});
save(path.join(out,'FIXTURES_AND_EXPECTATIONS.json'),{scope:'EXTERNAL_OBSERVER_EXPECTATIONS_NOT_RUNTIME_INPUT',fixtures});
const artifacts=[];
function bindArtifact(p){const b=identity(p);artifacts.push(b);return b;}
function verifyArtifacts(){for(const b of artifacts)need(identity(b.path).sha256===b.sha256,'ARTIFACT_NOT_SAME '+b.path);}
function launch(label,command,args,gpu=false){
 verifyCustody();verifyArtifacts();
 let telemetry=null;
 if(gpu){
  const probe=spawnSync('nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});
  const [gpuName,free]=probe.stdout.trim().split(',').map(s=>s.trim());
  need(probe.status===0&&gpuName?.includes('RTX 3070')&&Number(free)>=1536,'GPU_MEMORY_BOUNDARY');
  telemetry={name:gpuName,free_MiB:Number(free)};
 }
 console.log(JSON.stringify({launch:label,telemetry}));
 const started=new Date().toISOString();
 const result=spawnSync(command,args,{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024,timeout:600000});
 const event={command,args,started,ended:new Date().toISOString(),telemetry,exit:result.status,error:result.error?.message??null,stdout:result.stdout??'',stderr:result.stderr??''};
 save(path.join(out,label+'.execution.json'),event);
 bindArtifact(path.join(out,label+'.execution.json'));
 verifyCustody();verifyArtifacts();
 need(!result.error&&result.status===0,'EXECUTION_STOP '+label+' '+(result.error?.message??result.stderr));
}
function lowerFixture(label,rows){
 const directory=path.join(out,label);fs.mkdirSync(directory);
 const fixturesPath=path.join(directory,'fixtures.mal'),combined=path.join(directory,'input.mal');
 write(fixturesPath,fixtureSource(rows));
 write(combined,fs.readFileSync(source,'utf8')+'\n'+fs.readFileSync(fixturesPath,'utf8'));
 bindArtifact(fixturesPath);bindArtifact(combined);
 const stage=path.join(directory,'stage');
 launch(label+'_lower',process.execPath,[lower,combined,stage]);
 for(const name of ['source.mal','image.bin','source-map.json','source-occurrence-custody.json'])bindArtifact(path.join(stage,name));
 const map=read(path.join(stage,'source-map.json'));
 need(map.source_sha256===identity(combined).sha256&&map.lowerer_sha256===identity(lower).sha256&&map.image_sha256===identity(path.join(stage,'image.bin')).sha256,'LOWER_CUSTODY');
 need(map.imports.length===0&&map.seeds.length===fixtures.length,'SYNTHETIC_INPUT_BOUNDARY');
 return stage;
}
const key=(caseId,position)=>JSON.stringify([caseId,position.operator,position.witness]);
const expected=new Map(fixtures.map(f=>[key(f.case,f.position),f]));
need(expected.size===fixtures.length,'DUPLICATE_EXPECTATION_POSITION');
function observe(stage,label){
 verifyCustody();verifyArtifacts();
 const r=openReadback(stage);
 const atom=id=>{const n=r.node(id);need(n.c.length===0&&typeof n.s==='string','ATOM_ENCODING');return n.s;};
 const position=id=>{const n=r.node(id);need(n.s==='POSITION'&&n.c.length===2,'POSITION_ENCODING');return {operator:atom(n.c[0]),witness:atom(n.c[1])};};
 const side=id=>{const n=r.node(id);if(n.s==='ABSENT'&&!n.c.length)return null;need(n.s==='PRESENT'&&n.c.length===1,'SIDE_ENCODING');return r.list(n.c[0]).map(r.text);};
 const nodes=Array.from({length:r.terms},(_,id)=>({id,...r.node(id)}));
 for(const n of nodes){need(typeof n.s==='string','SYMBOL_BOUNDS');for(const c of n.c)need(c>=0&&c<n.id,'TERM_CHILD_ORDER');}
 for(const f of r.facts){
  need(f.term>=0&&f.term<r.terms&&f.rule>=-1&&f.rule<r.map.rules.length,'FACT_BOUNDS');
  need(f.support.length<=8&&f.support.every(s=>s>=0&&s<f.id),'SUPPORT_CUSTODY');
  if(f.rule<0)need(f.support.length===0,'SEED_SUPPORT');
  else need(f.support.length===r.map.rules[f.rule].ants.length,'RULE_SUPPORT_ARITY');
 }
 const seeds=r.facts.filter(f=>f.rule<0);
 need(seeds.length===fixtures.length,'SEED_COUNT');
 for(const f of seeds){const n=r.node(f.term);need(n.s==='GOES_WITH'&&n.c.length===5&&atom(n.c[0])==='GJC_REQUEST','NO_AUTHORED_TERMINALS');}
 const observations=new Map(fixtures.map(f=>[key(f.case,f.position),{id:f.id,case:f.case,position:f.position,left:f.left,right:f.right,expected:f.expected,result:[],agreement:[],wall:[],missing:[]} ]));
 const tags=[['GJC_RESULT','result',6],['GJC_AGREEMENT','agreement',5],['GJC_WALL','wall',5],['GJC_MISSING','missing',4]];
 const terminalFacts=[];
 for(const [tag,field,arity] of tags)for(const f of r.predicate(tag)){
  const n=r.node(f.term);need(n.s==='GOES_WITH'&&n.c.length===arity,'TERMINAL_SHAPE '+tag);
  need(f.origin!=='SOURCE_SEED'&&f.support.length>0,'NATIVE_TERMINAL_PROVENANCE');
  const caseId=atom(n.c[1]),p=position(n.c[2]),entry=observations.get(key(caseId,p));
  need(entry,'UNEXPECTED_TERMINAL_POSITION');
  if(field!=='missing')need(JSON.stringify(side(n.c[3]))===JSON.stringify(entry.left)&&JSON.stringify(side(n.c[4]))===JSON.stringify(entry.right),'ORIGINAL_PAYLOAD_NOT_RETAINED');
  const proof={fact:f.id,rule:f.rule,origin:f.origin,rank:f.rank,support:f.support};
  if(field==='result')proof.reading=r.text(n.c[5]);
  if(field==='missing')proof.side=atom(n.c[3]);
  entry[field].push(proof);terminalFacts.push(f.id);
 }
 let assertions=0;const assert=(condition,reason)=>{assertions++;need(condition,reason);};
 for(const entry of observations.values()){
  if(entry.expected===null){assert(entry.result.length===0&&entry.agreement.length===0&&entry.wall.length===0&&entry.missing.length===0,'MALFORMED_EXPECTED_WITHHELD '+entry.id);continue;}
  assert(entry.result.length===1&&entry.result[0].reading===entry.expected,'RESULT_NOT_SAME '+entry.id);
  assert(entry.agreement.length===(entry.expected==='IF_THEN'?1:0),'AGREEMENT_NOT_SAME '+entry.id);
  assert(entry.wall.length===(entry.expected==='NOT_SAME'?1:0),'WALL_NOT_SAME '+entry.id);
  assert(entry.missing.length===(entry.expected==='MAYBE'?1:0),'MISSING_NOT_SAME '+entry.id);
  if(entry.expected==='MAYBE')assert(entry.missing[0].side===(entry.left===null?(entry.right===null?'BOTH':'LEFT'):'RIGHT'),'MISSING_SIDE_NOT_SAME '+entry.id);
 }
 const closure=r.facts.map(f=>r.term(f.term)).sort();
 need(new Set(closure).size===closure.length,'DUPLICATE_NATIVE_FACT');
 const closureBytes=Buffer.from(closure.join('\n')+'\n');
 const proofs=new Set(),visit=id=>{if(proofs.has(id))return;proofs.add(id);for(const p of r.facts[id].support)visit(p);};
 terminalFacts.forEach(visit);
 const summary={scope:'SUPPLIED_SYNTHETIC_CONTENT_AT_SUPPLIED_SHARED_POSITIONS',reading:'IF_THEN_FOR_BOUNDED_QUALIFICATION',cases:fixtures.length,assertions,facts:r.count,terms:r.terms,epochs:r.epochs,error:r.error,results:{IF_THEN:0,NOT_SAME:0,MAYBE:0,WITHHELD:0},closure_sha256:sha(closureBytes),readback:identity(path.join(stage,'readback.bin')),map:identity(path.join(stage,'source-map.json')),observations:[...observations.values()]};
 for(const entry of observations.values())summary.results[entry.result[0]?.reading??'WITHHELD']++;
 save(path.join(out,label+'.OBSERVATIONS.json'),summary);
 save(path.join(out,label+'.NATIVE_PROOFS.json'),{source_map:summary.map,readback:summary.readback,nodes,facts:r.facts,terminal_facts:terminalFacts,terminal_support_closure:[...proofs].sort((a,b)=>a-b)});
 write(path.join(out,label+'.CLOSURE.txt'),closureBytes);
 for(const suffix of ['.OBSERVATIONS.json','.NATIVE_PROOFS.json','.CLOSURE.txt'])bindArtifact(path.join(out,label+suffix));
 console.log(JSON.stringify({observed:label,cases:summary.cases,assertions,facts:r.count,epochs:r.epochs,results:summary.results,closure:summary.closure_sha256}));
 return summary;
}
function bindReadback(stage){for(const name of ['readback.bin','readback.bin.progress.jsonl','readback.bin.epochs.jsonl'])bindArtifact(path.join(stage,name));}
try{
 const normal=lowerFixture('normal',fixtures);
 launch('normal_gpu',executable,[path.join(normal,'image.bin'),path.join(normal,'readback.bin'),'--fact-capacity','16384'],true);
 bindReadback(normal);
 const first=observe(normal,'normal');
 const replay=path.join(out,'replay');fs.mkdirSync(replay);
 fs.copyFileSync(path.join(normal,'source-map.json'),path.join(replay,'source-map.json'),fs.constants.COPYFILE_EXCL);
 bindArtifact(path.join(replay,'source-map.json'));
 launch('replay_gpu',executable,[path.join(normal,'image.bin'),path.join(replay,'readback.bin'),'--fact-capacity','16384'],true);
 bindReadback(replay);
 const repeated=observe(replay,'replay');
 need(first.readback.sha256===repeated.readback.sha256,'REPLAY_BYTES_NOT_SAME');
 const reversed=lowerFixture('reversed',[...fixtures].reverse());
 launch('reversed_gpu',executable,[path.join(reversed,'image.bin'),path.join(reversed,'readback.bin'),'--fact-capacity','16384'],true);
 bindReadback(reversed);
 const reverse=observe(reversed,'reversed');
 need(first.closure_sha256===reverse.closure_sha256,'REVERSED_CLOSURE_NOT_SAME');
 verifyCustody();verifyArtifacts();
 const record={schema:'GoverningJunctionContent014Qualification',verdict:'IF_THEN_FOR_BOUNDED_SUPPLIED_CONTENT_CASES',bound,artifacts,fixtures:identity(path.join(out,'FIXTURES_AND_EXPECTATIONS.json')),runtime_qualification_scope:read(qualification).scope,runs:[first,repeated,reverse].map(({observations,...summary})=>summary),replay:'SAME_RAW_READBACK_BYTES',reversed:'SAME_DECODED_FULL_CLOSURE',content_law_scope:'SUPPLIED_FINITE_NO_THIS_LISTS_AND_EXPLICIT_ABSENCE; NO_SCHEMA_VALIDATION_CLAIM',exclusions:['NO_J17_PROJECTION_SEEDS','NO_WORLD_TO_SEED_EXTRACTION','NO_SHARED_PRIVATE_PARTITION_INFERENCE','NO_NATIVE_LOCAL_SECTION_SEAL','NO_GLOBAL_SECTION_ADMISSION','NO_WORLDCHAIN_EXECUTE','NO_REPOSITORY_COMMIT']};
 save(path.join(out,'QUALIFICATION.json'),record);
 console.log(JSON.stringify({qualification:identity(path.join(out,'QUALIFICATION.json')),cases:fixtures.length,results:first.results,replay:record.replay,reversed:record.reversed}));
}catch(error){save(path.join(out,'STOP.json'),{scope:'SYNTHETIC_CONTENT_COMPONENT_ONLY',reason:error.message,worldline:'NOT_WRITTEN_BY_THIS_HARNESS; CUSTODY_STATUS_SEPARATE',commit:'NOT_PERFORMED'});throw error;}
