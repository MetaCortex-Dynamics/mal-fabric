// Custody, synthetic input transport, qualified GPU invocation and observation.
// Producer domains, contact binding, content comparison and R4 normalization
// are computed only by the bound .mal sources. This is not a host evaluator.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {facts,fixtureSource,specification,expectedSeedCount} from './fixtures.mjs';
import {observe} from './observe.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
const need=(condition,reason)=>{if(!condition)throw Error(reason);};
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const save=(p,v)=>write(p,JSON.stringify(v,null,2)+'\n');
const read=p=>JSON.parse(fs.readFileSync(p));
const lower=path.join(root,'j17_step_021/tools/lower.mjs');
const executable=path.join(root,'runtime_021/block_iterative_runtime.exe');
const qualification=path.join(root,'runtime_021/qualification_002/QUALIFICATION.json');
const original=path.join(root,'j17_step_023/outputs/committed.world.json');
const comparator=path.join(root,'governing_junction_content_014/source/governing_junction_content.mal');
const sources=[path.join(here,'source/producer_projection.mal'),path.join(here,'source/r4_verdicts.mal'),comparator,path.join(here,'source/r4_test_inputs.mal')];
const expectedInputs=new Map([
 [lower,'05CE980CBC68707070837001819A90DF532A730569BA1112367C07BC017BD45B'],
 [executable,'9634C205A4641AB99898F58189722979884CA7818DA84085498D845F5C56CA06'],
 [path.join(root,'runtime_021/block_iterative_runtime.cu'),'F055FFCE4AA8F536CE9BC7AEA7B1235887371D2855C9312F420FB5FEFB1D5ECE'],
 [qualification,'D2F42E635BF8095CE5BA3208B030D8F7F26E0A96074F78597833F1CE7D6E41F5'],
 [path.join(root,'evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs'),'4612D0189AD00B89522C8CD9F472E39EB1574991F5FB4241FF3CD85F415E32D3'],
 [path.join(root,'j17_step_021/tools/source_occurrence_custody.mjs'),'187C741EACD6285166B4D359D0921A012A3ACDBE8C3FEB5AAAC62198FC82EA3B'],
 ['C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs','187C741EACD6285166B4D359D0921A012A3ACDBE8C3FEB5AAAC62198FC82EA3B'],
 [comparator,'056AD86E4D09BD21AD99385F981E7480854F21BE723F0350A7B282A7734F70E6'],
 [path.join(here,'source/producer_projection.mal'),'6D5154712636E80354154D2465A847DCEB6C7B7CA87036F3BFFC9C6C34577739'],
 [path.join(here,'source/r4_verdicts.mal'),'4ACC52308528FDBCF38A73CAA36E020EB370F6B1ADFA361659AACEB5AF55A1F6'],
 [path.join(here,'source/r4_test_inputs.mal'),'155AC0DF0514B712E9618F80D2926D54025FB695110BF999D459F67F064C6E22'],
 [original,'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'],
 ['C:/Users/devon/Desktop/MaL/MaLv3/governing_junction.mal','A14B15BC19B354E49F744D13D762B61986BB74B206D19C2BCE692138C95DE7A4'],
]);
const [mode,name='run_001']=process.argv.slice(2);
need(mode==='run'&&/^[A-Za-z0-9_]+$/.test(name),'usage: node run.mjs run fresh_directory');
const out=path.join(here,name);need(!fs.existsSync(out),'PRESERVE_PRIOR_OUTPUT');
need(expectedSeedCount<=2048,'LOWERER_SEED_CAPACITY');
for(const [p,digest] of expectedInputs)need(identity(p).sha256===digest,'INPUT_NOT_SAME '+p);
need(read(qualification).qualification==='SAME','RUNTIME_NOT_QUALIFIED');
const contactsFile=path.join(here,'CONTACTS.json'),contacts=read(contactsFile);
for(const c of contacts.contacts){const b=identity(c.path);need(b.bytes===c.bytes&&b.sha256===c.sha256,'CONTACT_NOT_SAME '+c.name);}
const bound=[...new Set([...expectedInputs.keys(),...sources,fileURLToPath(import.meta.url),path.join(here,'fixtures.mjs'),path.join(here,'observe.mjs'),contactsFile,...contacts.contacts.map(c=>c.path)])].map(identity);
const verifyCustody=()=>{for(const b of bound){const n=identity(b.path);need(n.bytes===b.bytes&&n.sha256===b.sha256,'CUSTODY_NOT_SAME '+b.path);}};
fs.mkdirSync(out);
const artifacts=[];
function bindArtifact(p){const b=identity(p);artifacts.push(b);return b;}
function verifyArtifacts(){for(const b of artifacts){const n=identity(b.path);need(n.bytes===b.bytes&&n.sha256===b.sha256,'ARTIFACT_NOT_SAME '+b.path);}}
save(path.join(out,'INPUTS.json'),{scope:'SYNTHETIC_PRODUCER_DECLARATIONS_AND_CONTACTS',bound,fixture_count:facts.length,fixed_source_facts:24,fact_capacity:16384,test_only_source:sources[3],worldline:'NOT_AN_INPUT; HASH_WATCH_ONLY'});
save(path.join(out,'FIXTURES_AND_EXPECTATIONS.json'),{...specification,expectations_scope:'EXTERNAL_OBSERVER_ONLY; NEVER_IMPORTED_BY_NATIVE_RUNTIME'});
bindArtifact(path.join(out,'INPUTS.json'));bindArtifact(path.join(out,'FIXTURES_AND_EXPECTATIONS.json'));
function launch(label,command,args,gpu=false){
 verifyCustody();verifyArtifacts();let telemetry=null;
 if(gpu){const probe=spawnSync('nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});const [name,free]=probe.stdout.trim().split(',').map(s=>s.trim());need(probe.status===0&&name?.includes('RTX 3070')&&Number(free)>=1536,'GPU_MEMORY_BOUNDARY');telemetry={name,free_MiB:Number(free)};}
 console.log(JSON.stringify({launch:label,telemetry}));
 const started=new Date().toISOString(),result=spawnSync(command,args,{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024,timeout:600000});
 save(path.join(out,label+'.execution.json'),{command,args,started,ended:new Date().toISOString(),telemetry,exit:result.status,error:result.error?.message??null,stdout:result.stdout??'',stderr:result.stderr??''});
 bindArtifact(path.join(out,label+'.execution.json'));verifyCustody();verifyArtifacts();
 need(!result.error&&result.status===0,'EXECUTION_STOP '+label+' '+(result.error?.message??result.stderr));
}
function lowerFixture(label,rows){
 const dir=path.join(out,label);fs.mkdirSync(dir);
 const fixture=path.join(dir,'fixtures.mal'),combined=path.join(dir,'input.mal');
 write(fixture,fixtureSource(rows));write(combined,sources.map(s=>fs.readFileSync(s,'utf8')).join('\n')+'\n'+fs.readFileSync(fixture,'utf8'));
 bindArtifact(fixture);bindArtifact(combined);
 const stage=path.join(dir,'stage');launch(label+'_lower',process.execPath,[lower,combined,stage]);
 for(const name of ['source.mal','image.bin','source-map.json','source-occurrence-custody.json'])bindArtifact(path.join(stage,name));
 const map=read(path.join(stage,'source-map.json'));
 need(map.source_sha256===identity(combined).sha256&&map.lowerer_sha256===identity(lower).sha256&&map.image_sha256===identity(path.join(stage,'image.bin')).sha256,'LOWER_CUSTODY');
 need(map.imports.length===0&&map.seeds.length===expectedSeedCount,'SYNTHETIC_INPUT_BOUNDARY');return stage;
}
function readbackCustody(stage){for(const name of ['readback.bin','readback.bin.progress.jsonl','readback.bin.epochs.jsonl'])bindArtifact(path.join(stage,name));}
function observeStage(stage,label){
 verifyCustody();verifyArtifacts();const {summary,proofs,closureBytes}=observe(stage);
 save(path.join(out,label+'.OBSERVATIONS.json'),summary);save(path.join(out,label+'.NATIVE_PROOFS.json'),proofs);write(path.join(out,label+'.CLOSURE.txt'),closureBytes);
 for(const suffix of ['.OBSERVATIONS.json','.NATIVE_PROOFS.json','.CLOSURE.txt'])bindArtifact(path.join(out,label+suffix));
 console.log(JSON.stringify({observed:label,assertions:summary.assertions,facts:summary.facts,terms:summary.terms,epochs:summary.epochs,results:summary.content_results,closure:summary.closure_sha256}));return summary;
}
try{
 const normal=lowerFixture('normal',facts);launch('normal_gpu',executable,[path.join(normal,'image.bin'),path.join(normal,'readback.bin'),'--fact-capacity','16384'],true);readbackCustody(normal);const first=observeStage(normal,'normal');
 const replay=path.join(out,'replay');fs.mkdirSync(replay);fs.copyFileSync(path.join(normal,'source-map.json'),path.join(replay,'source-map.json'),fs.constants.COPYFILE_EXCL);bindArtifact(path.join(replay,'source-map.json'));
 launch('replay_gpu',executable,[path.join(normal,'image.bin'),path.join(replay,'readback.bin'),'--fact-capacity','16384'],true);readbackCustody(replay);const repeated=observeStage(replay,'replay');need(first.readback.sha256===repeated.readback.sha256,'REPLAY_BYTES_NOT_SAME');
 const reversed=lowerFixture('reversed',[...facts].reverse());launch('reversed_gpu',executable,[path.join(reversed,'image.bin'),path.join(reversed,'readback.bin'),'--fact-capacity','16384'],true);readbackCustody(reversed);const reverse=observeStage(reversed,'reversed');need(first.closure_sha256===reverse.closure_sha256,'REVERSED_CLOSURE_NOT_SAME');
 verifyCustody();verifyArtifacts();
 const record={schema:'ProducerProjection015Qualification',verdict:'IF_THEN',scope:'BOUNDED_SYNTHETIC_PRODUCER_INTERFACE_AND_R4_QUALIFICATION',bound,artifacts,runtime_qualification_scope:read(qualification).scope,runs:[first,repeated,reverse].map(({observations,...s})=>s),replay:'SAME_RAW_READBACK_BYTES',reversed:'SAME_DECODED_FULL_CLOSURE',production_sources:sources.slice(0,3).map(identity),test_only_source:identity(sources[3]),exclusions:['NO_J17_DOMAIN_OR_SEED_ASSIGNMENTS','NO_WORLD_TO_SEED_EXTRACTION','NO_GENERAL_SCHEMA_OR_AUTHORIZATION_VALIDATOR','NO_CONTENT_PAYLOAD_ASSIGNED_TO_DERIVED_WITNESSES','NO_CONFLICT_RETRACTION','NO_LOCAL_SECTION_SEAL','NO_GLOBAL_SECTION_ADMISSION','NO_WORLDCHAIN_EXECUTE','NO_REPOSITORY_COMMIT']};
 save(path.join(out,'QUALIFICATION.json'),record);console.log(JSON.stringify({qualification:identity(path.join(out,'QUALIFICATION.json')),source_facts:expectedSeedCount,results:first.content_results,replay:record.replay,reversed:record.reversed}));
}catch(error){save(path.join(out,'STOP.json'),{verdict:'MAYBE',scope:'SYNTHETIC_COMPONENT_QUALIFICATION',reason:error.message,worldline:'NOT_WRITTEN_BY_THIS_HARNESS; CUSTODY_STATUS_SEPARATE',commit:'NOT_PERFORMED'});throw error;}
