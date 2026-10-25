// Custody and invocation only. Producer, R1/R2 and comparator computation is native .mal.
// The observer's expectations are never included in the input image.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {here,paths,sources,pins,verifyPins,identity,need,buildBundle,fixtureSource,expectations} from './fixtures.mjs';
import {observe} from './observe.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const save=(p,v)=>write(p,JSON.stringify(v,null,2)+'\n');
const [mode,name='run_001']=process.argv.slice(2);
need(mode==='preflight'||mode==='run','usage: node run.mjs preflight | run fresh_directory');
verifyPins();
need(read(paths.runtimeQualification).qualification==='SAME','RUNTIME_NOT_QUALIFIED');
const contactsFile=path.join(here,'CONTACTS.json'),contacts=read(contactsFile);
need(contacts.contacts.length===7,'CONTACT_COUNT');
for(const c of contacts.contacts){const i=identity(c.path);need(i.bytes===c.bytes&&i.sha256===c.sha256,'CONTACT_NOT_SAME '+c.name);}
const bound=[...new Set([...pins.keys(),fileURLToPath(import.meta.url),path.join(here,'fixtures.mjs'),path.join(here,'observe.mjs'),...contacts.contacts.map(c=>c.path)])].map(identity);
const bundle=buildBundle();
for(const v of bundle.variants)need(30+v.rows.length<=2048,'LOWERER_SEED_CAPACITY');
if(mode==='preflight'){
 console.log(JSON.stringify({verdict:'IF_THEN',scope:'READ_ONLY_INPUT_AND_HARNESS_PREFLIGHT; NATIVE_NOT_RUN',bound,
  native_proofs:bundle.transport.native_proofs,proof_descriptors:bundle.transport.proof_descriptors,
  variants:bundle.variants.map(v=>({id:v.id,input_count:30+v.rows.length,withheld_roles:v.withheldRoles,expected:Object.fromEntries(Object.entries(expectations(bundle,v)).map(([k,a])=>[k,a.length]))}))},null,2));
 process.exit(0);
}
need(/^[A-Za-z0-9_]+$/.test(name),'OUTPUT_DIRECTORY_NAME');
const out=path.join(here,name);need(!fs.existsSync(out),'PRESERVE_PRIOR_OUTPUT');
fs.mkdirSync(out);
const artifacts=[];
function bindArtifact(p){const b=identity(p);artifacts.push(b);return b;}
function verifyCustody(){for(const b of bound){const n=identity(b.path);need(n.bytes===b.bytes&&n.sha256===b.sha256,'CUSTODY_NOT_SAME '+b.path);}}
function verifyArtifacts(){for(const b of artifacts){const n=identity(b.path);need(n.bytes===b.bytes&&n.sha256===b.sha256,'ARTIFACT_NOT_SAME '+b.path);}}
save(path.join(out,'INPUTS.json'),{scope:'EXISTING_MEMBER_RESTRICTED_PRODUCER_TRANSPORT',bound,fixed_source_facts:30,
 fact_capacity:16384,variants:bundle.variants.map(v=>({id:v.id,input_count:30+v.rows.length})),
 worldline:'HASH_WATCH_ONLY; NO_WORLD_BYTES_IN_NATIVE_IMAGE',expected_outputs:'EXTERNAL_OBSERVER_ONLY; NEVER_IMPORTED'});
save(path.join(out,'TRANSPORT.json'),bundle.transport);
save(path.join(out,'EXPECTATIONS.json'),{scope:'OBSERVER_ONLY; NOT_NATIVE_INPUT',variants:bundle.variants.map(v=>({id:v.id,withheld_roles:v.withheldRoles,missing_member_content:v.missingMemberContent,expected:expectations(bundle,v)}))});
for(const f of ['INPUTS.json','TRANSPORT.json','EXPECTATIONS.json'])bindArtifact(path.join(out,f));
function launch(label,command,args,gpu=false){
 verifyCustody();verifyArtifacts();let telemetry=null;
 if(gpu){
  const probe=spawnSync('nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});
  const [gpuName,free]=String(probe.stdout??'').trim().split(',').map(s=>s.trim());
  need(probe.status===0&&gpuName?.includes('RTX 3070')&&Number(free)>=1536,'GPU_MEMORY_BOUNDARY');telemetry={name:gpuName,free_MiB:Number(free)};
 }
 console.log(JSON.stringify({launch:label,telemetry}));
 const started=new Date().toISOString(),result=spawnSync(command,args,{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024,timeout:600000});
 save(path.join(out,label+'.execution.json'),{command,args,started,ended:new Date().toISOString(),telemetry,exit:result.status,error:result.error?.message??null,stdout:result.stdout??'',stderr:result.stderr??''});
 bindArtifact(path.join(out,label+'.execution.json'));verifyCustody();verifyArtifacts();
 need(!result.error&&result.status===0,'EXECUTION_STOP '+label+' '+(result.error?.message??result.stderr));return result.stdout;
}
function check013(label){
 const result=JSON.parse(launch(label,process.execPath,[paths.checker,'--verify']));
 need(result.verdict==='SAME'&&result.comparisons===55&&result.negative_checks===8&&result.frozen?.files===901&&result.frozen.verdict==='SAME'&&result.link_count===2&&result.sections==='NOT_RUN'&&result.world_commit==='NOT_RUN','BINDING_013_CUSTODY');
 need(result.evidence_sha256===pins.get(paths.evidence)&&result.observer_sha256===pins.get(paths.checker)&&result.member_hash===bundle.memberHash,'BINDING_013_IDENTITIES');return result;
}
function lowerFixture(label,rows){
 const dir=path.join(out,label);fs.mkdirSync(dir);
 const fixture=path.join(dir,'fixtures.mal'),combined=path.join(dir,'input.mal');
 write(fixture,fixtureSource(rows));write(combined,sources.map(s=>fs.readFileSync(s,'utf8')).join('\n')+'\n'+fs.readFileSync(fixture,'utf8'));
 bindArtifact(fixture);bindArtifact(combined);
 const stage=path.join(dir,'stage');launch(label+'_lower',process.execPath,[paths.lower,combined,stage]);
 for(const f of ['source.mal','image.bin','source-map.json','source-occurrence-custody.json'])bindArtifact(path.join(stage,f));
 const map=read(path.join(stage,'source-map.json'));
 need(map.source_sha256===identity(combined).sha256&&map.lowerer_sha256===pins.get(paths.lower)&&map.image_sha256===identity(path.join(stage,'image.bin')).sha256,'LOWER_CUSTODY');
 need(map.imports.length===0&&map.seeds.length===30+rows.length,'SOURCE_INPUT_BOUNDARY');return stage;
}
function runGpu(stage,label,image=path.join(stage,'image.bin')){
 launch(label+'_gpu',paths.runtime,[image,path.join(stage,'readback.bin'),'--fact-capacity','16384'],true);
 for(const f of ['readback.bin','readback.bin.progress.jsonl','readback.bin.epochs.jsonl'])bindArtifact(path.join(stage,f));
}
function observeStage(stage,label,variant){
 verifyCustody();verifyArtifacts();const {summary,proofs,closureBytes}=observe(stage,bundle,variant);
 save(path.join(out,label+'.OBSERVATIONS.json'),summary);save(path.join(out,label+'.NATIVE_PROOFS.json'),proofs);write(path.join(out,label+'.CLOSURE.txt'),closureBytes);
 for(const s of ['.OBSERVATIONS.json','.NATIVE_PROOFS.json','.CLOSURE.txt'])bindArtifact(path.join(out,label+s));
 console.log(JSON.stringify({observed:label,facts:summary.facts,terms:summary.terms,epochs:summary.epochs,counts:summary.tag_counts,closure:summary.closure_sha256}));return summary;
}
try{
 const bindingBefore=check013('binding_before'),normalVariant=bundle.variants[0];
 const normal=lowerFixture('normal',normalVariant.rows);runGpu(normal,'normal');const first=observeStage(normal,'normal',normalVariant);
 const replay=path.join(out,'replay');fs.mkdirSync(replay);
 fs.copyFileSync(path.join(normal,'source-map.json'),path.join(replay,'source-map.json'),fs.constants.COPYFILE_EXCL);bindArtifact(path.join(replay,'source-map.json'));
 runGpu(replay,'replay',path.join(normal,'image.bin'));const repeated=observeStage(replay,'replay',normalVariant);
 need(first.readback.sha256===repeated.readback.sha256,'REPLAY_BYTES_NOT_SAME');
 const reverseVariant={...normalVariant,rows:[...normalVariant.rows].reverse()},reversed=lowerFixture('reversed',reverseVariant.rows);
 runGpu(reversed,'reversed');const reverse=observeStage(reversed,'reversed',reverseVariant);
 need(first.closure_sha256===reverse.closure_sha256,'REVERSED_CLOSURE_NOT_SAME');
 const negatives=[];
 for(const v of bundle.variants.slice(1)){const stage=lowerFixture(v.id,v.rows);runGpu(stage,v.id);negatives.push(observeStage(stage,v.id,v));}
 const bindingAfter=check013('binding_after');verifyCustody();verifyArtifacts();
 const record={schema:'ProducerEmissions016Qualification',verdict:'IF_THEN',scope:'ACTUAL_MEMBER_RESTRICTED_PARTIAL_AUTHOR_CANDIDATE',bound,artifacts,
  production_sources:sources.map(identity),runtime_qualification_scope:read(paths.runtimeQualification).scope,
  actual_runs:[first,repeated,reverse],negative_runs:negatives,negative_scope:'ISOLATED_INPUT_JOIN_MUTATIONS; NO_PAIR_COMPARISON_INPUTS',
  replay:'SAME_RAW_READBACK_BYTES',reversed:'SAME_DECODED_FULL_CLOSURE',binding_before:bindingBefore,binding_after:bindingAfter,
  projected_coordinates:['THIS/WHAT','BECAUSE/HOW'],undeclared_basis_coordinates_per_producer:43,
  content_partition_scope:'SHARED_MEMBER_HASH_AGREEMENTS; DISTINCT_OWN_PROOF_REFERENCE_WALLS; NOT_WORLD_INCOMPATIBILITY',
  exclusions:['NO_FULL_45_SEEDMAP_OR_105_CELL_NORMAL_FORM','NO_DERIVED_CONTENT_REFERENCES','NO_AUTHORITY_GRANT_OR_ADMISSION','NO_LOCAL_SECTION_CANONICAL_SERIALIZATION_OR_SEAL','NO_GLOBAL_SECTION','NO_NEW_LAW_PROMOTION','NO_WORLDCHAIN_WRITE','NO_REPOSITORY_COMMIT']};
 save(path.join(out,'QUALIFICATION.json'),record);
 console.log(JSON.stringify({qualification:identity(path.join(out,'QUALIFICATION.json')),native_runs:3+negatives.length,replay:record.replay,reversed:record.reversed}));
}catch(error){save(path.join(out,'STOP.json'),{verdict:'MAYBE',scope:'PARTIAL_PRODUCER_EMISSION_QUALIFICATION',reason:error.message,worldline:'NOT_WRITTEN_BY_THIS_HARNESS; CUSTODY_STATUS_SEPARATE',seal:'NOT_PERFORMED'});throw error;}
