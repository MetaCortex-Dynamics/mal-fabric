// Custody/orchestration and read-only expectations. All relation contacts,
// restrictions, R4 consequences and comparisons execute in native .mal on GPU.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {here,root,paths,pins,sources,identity,sha,need,verifyPins,build,fixtureSource} from './binding_inputs.mjs';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const [mode,name='run_001']=process.argv.slice(2);
need(['preflight','run'].includes(mode),'usage: node run.mjs preflight | run fresh_directory');
verifyPins();
const bundle=build(),runtimeQualification=JSON.parse(fs.readFileSync(paths.runtimeQualification));
need(runtimeQualification.qualification==='SAME','RUNTIME_QUALIFICATION');
const watched=[...new Set([...pins.keys(),...sources,fileURLToPath(import.meta.url),path.join(here,'binding_inputs.mjs'),path.join(here,'binding_fixtures.mjs')])].map(identity);
if(mode==='preflight'){
 console.log(JSON.stringify({verdict:'IF_THEN',scope:'READ_ONLY_PREFLIGHT; GPU_NOT_RUN',inputs:watched,transported_facts:bundle.rows.length,fixed_facts:54,relation_cases:bundle.rdCases.map(x=>({id:x.id,contacts:x.expected.length})),authority_cases:bundle.arCases,original_proofs:bundle.proofs.map(x=>({role:x.role,parents:x.parents,law:x.law,proof:x.proof})),actual_topology:bundle.actual_topology,actual_grants:bundle.actual_grants},null,2));
 process.exit(0);
}
need(/^[A-Za-z0-9_]+$/.test(name),'OUTPUT_NAME');
const out=path.join(here,name);need(!fs.existsSync(out),'PRESERVE_PRIOR_RUN');fs.mkdirSync(out);
const save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'}),write=(p,v)=>fs.writeFileSync(p,v,{flag:'wx'});
const artifacts=[];const bind=p=>{const item=identity(p);artifacts.push(item);return item;};
function checkWatched(){for(const item of watched){const now=identity(item.path);need(now.sha256===item.sha256&&now.bytes===item.bytes,'INPUT_NOT_SAME '+item.path);}}
function command(label,exe,args){
 const started=new Date().toISOString(),r=spawnSync(exe,args,{windowsHide:true,encoding:'utf8',timeout:600000,maxBuffer:4*1024*1024});
 const p=path.join(out,label+'.execution.json');save(p,{exe,args,started,ended:new Date().toISOString(),exit:r.status,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??''});bind(p);
 need(!r.error&&r.status===0,'EXECUTION_STOP '+label+' '+(r.error?.message??r.stderr));return r.stdout;
}
function custody(label){const result=JSON.parse(command(label,process.execPath,[paths.checker,'--verify']));need(result.verdict==='SAME'&&result.frozen?.files===901&&result.frozen.verdict==='SAME'&&result.link_count===2,'013_AND_FROZEN_CUSTODY');return result;}
function lower(label,rows){
 const dir=path.join(out,label);fs.mkdirSync(dir);const input=path.join(dir,'input.mal');
 write(input,sources.map(s=>fs.readFileSync(s,'utf8')).join('\n')+'\n'+fixtureSource(rows));bind(input);
 const stage=path.join(dir,'stage');command(label+'_lower',process.execPath,[paths.lower,input,stage]);
 for(const f of ['source.mal','image.bin','source-map.json','source-occurrence-custody.json'])bind(path.join(stage,f));
 const m=JSON.parse(fs.readFileSync(path.join(stage,'source-map.json')));need(m.source_sha256===identity(input).sha256&&m.image_sha256===identity(path.join(stage,'image.bin')).sha256&&m.lowerer_sha256===pins.get(paths.lower),'LOWER_CUSTODY');
 need(m.imports.length===0&&m.seeds.length===54+rows.length,'SOURCE_SEED_BOUNDARY');return stage;
}
function gpu(label,stage,image=path.join(stage,'image.bin')){
 const gpuText=command(label+'_device','nvidia-smi',['--query-gpu=name,memory.free','--format=csv,noheader,nounits']);const [device,free]=gpuText.trim().split(',').map(x=>x.trim());need(device.includes('RTX 3070')&&Number(free)>1536,'GPU_CAPACITY');
 console.log(JSON.stringify({launch:label,device,fact_capacity:32768}));
 command(label+'_gpu',paths.runtime,[image,path.join(stage,'readback.bin'),'--fact-capacity','32768']);
 for(const f of ['readback.bin','readback.bin.progress.jsonl','readback.bin.epochs.jsonl'])bind(path.join(stage,f));
}
function observe(label,stage){
 const r=openReadback(stage),cache=new Map(),render=id=>{if(cache.has(id))return cache.get(id);const n=r.node(id);const t=n.s==='TEXT'?JSON.stringify(r.text(id)):n.s+(n.c.length?'('+n.c.map(render).join(',')+')':'');cache.set(id,t);return t;};
 const assertions=[];const assert=(condition,contact)=>{need(condition,'OBSERVATION_NOT_SAME '+label+' '+contact);assertions.push(contact);};
 for(let id=0;id<r.terms;id++){const n=r.node(id);assert(typeof n.s==='string'&&n.c.every(c=>c>=0&&c<id),'TERM_'+id);}
 for(const f of r.facts){assert(f.support.every(p=>p>=0&&p<f.id)&&f.support.length<=8,'PARENTS_'+f.id);assert(f.rule<0?f.support.length===0:f.support.length===r.map.rules[f.rule].ants.length,'RULE_'+f.id);}
 const terms=tag=>r.predicate(tag).map(f=>({fact:f,children:r.node(f.term).c.map(render),text:render(f.term)}));
 const contacts=terms('RD_CONTACT'),relations=[];
 for(const c of bundle.rdCases){const got=contacts.filter(x=>x.children[1]===c.p).map(x=>x.text).sort();assert(JSON.stringify(got)===JSON.stringify([...c.expected].sort()),'RELATION_'+c.id);relations.push({id:c.id,contact_count:got.length,contacts:got});}
 assert(contacts.length===bundle.rdCases.reduce((n,c)=>n+c.expected.length,0),'ALL_RELATION_CONTACTS');
 assert(r.predicate('RD_AUTHORITY_PARTY').length===0,'NO_ACTUAL_AUTHORITY_PARTY_SUPPLIED');
 assert(!terms('AR_CONTACT').some(x=>x.fact.rule>=0),'NO_ACTUAL_GRANTS_INFERRED_FROM_CONTACTS');
 const authority=[];
 for(const c of bundle.arCases){
  const inContext=tag=>terms(tag).filter(x=>x.children[1]===c.c);
  const resultRows=terms('GJC_RESULT').filter(x=>x.children[1].startsWith('AR_COMPARE_CONTEXT('+c.c+','));
  const readings=resultRows.map(x=>JSON.parse(x.children[5])).sort();
  for(const [tag,n]of [['AR_SHARED',c.shared],['AR_PROJECTED_CONTACT',c.projected],['AR_LOCAL_CONTACT',c.local],['AR_VISIBILITY_CONFLICT',c.conflict]])assert(inContext(tag).length===n,c.id+'_'+tag);
  for(const [tag,wanted]of Object.entries(c.exact)){const got=(tag==='GJC_RESULT'?resultRows:inContext(tag)).map(x=>x.text).sort();assert(JSON.stringify(got)===JSON.stringify([...wanted].sort()),c.id+'_EXACT_'+tag);}
  assert(JSON.stringify(readings)===JSON.stringify(c.result),c.id+'_RESULT');
  authority.push({id:c.id,shared:inContext('AR_SHARED').length,projected:inContext('AR_PROJECTED_CONTACT').length,local:inContext('AR_LOCAL_CONTACT').length,conflicts:inContext('AR_VISIBILITY_CONFLICT').length,readings});
 }
 const bindingObservations=[];
 for(const c of bundle.bindingCases){const got=terms('BR_RECONSTRUCTED').filter(x=>x.children[1]===c.key).map(x=>x.text).sort();assert(JSON.stringify(got)===JSON.stringify([...c.expected].sort()),'EXACT_BINDING_'+c.id);bindingObservations.push({id:c.id,reading:c.reading,reconstructed:got});}
 assert(JSON.stringify(terms('BR_RECONSTRUCTED').map(x=>x.text).sort())===JSON.stringify(bundle.bindingCases.flatMap(c=>c.expected).sort()),'NO_UNEXPECTED_BINDING');
 const normalization=terms('P15_DERIVED');assert(normalization.length===bundle.rdCases.reduce((n,c)=>n+c.derived.length,0),'R4_CONTACT_CONSEQUENCES');
 assert(JSON.stringify(normalization.map(x=>x.text).sort())===JSON.stringify(bundle.rdCases.flatMap(c=>c.derived).sort()),'EXACT_R4_SUBJECT_POSITION_VERDICT');
 for(const tag of Object.keys(bundle.arCases[0].exact))assert(JSON.stringify(terms(tag).map(x=>x.text).sort())===JSON.stringify(bundle.arCases.flatMap(c=>c.exact[tag]).sort()),'NO_UNEXPECTED_'+tag);
 assert(!normalization.some(x=>x.text.includes(',WHENCE)')),'NO_INVENTED_WHENCE');
 assert(!r.map.rules.some(x=>/SEAL|GLOBAL|LICENSE|EXECUTE|PROMOTE_WORLD/.test(x.name)),'NO_AUTHORITY_EFFECT_RULE');
 for(const tag of ['RD_CONTACT','RD_COMPLETE','AR_PROJECTED_CONTACT','AR_SHARED','GJC_RESULT'])for(const x of terms(tag))assert(x.fact.rule>=0&&x.fact.support.length>0,'DERIVED_'+tag+'_'+x.fact.id);
 const seedTerms=r.facts.filter(f=>f.rule<0).map(f=>render(f.term));assert(seedTerms.length===54+bundle.rows.length,'SEED_COUNT');
 for(const input of bundle.rows)assert(seedTerms.includes(input),'TRANSPORT_'+sha(Buffer.from(input)).slice(0,12));
 const closure=Buffer.from(r.facts.map(f=>render(f.term)).sort().join('\n')+'\n');
 const summary={verdict:'IF_THEN',scope:'SCOPED_RECORDED_RELATION_CONTACTS_AND_RESTRICTION_COMPONENT_QUALIFICATION',label,facts:r.count,terms:r.terms,epochs:r.epochs,error:r.error,assertions:assertions.length,relations,authority,binding_reconstruction:bindingObservations,r4_derived:normalization.length,readback:identity(path.join(stage,'readback.bin')),closure_sha256:sha(closure),actual_authority:'NOT_RUN_NO_TOPOLOGY_OR_GRANTS_SUPPLIED',seal:'NOT_RUN',global_section:'NOT_RUN',link_3:'NOT_WRITTEN'};
 const p=path.join(out,label+'.OBSERVATION.json');save(p,summary);bind(p);write(path.join(out,label+'.CLOSURE.txt'),closure);bind(path.join(out,label+'.CLOSURE.txt'));
 const checked=r.facts.filter(f=>['RD_CONTACT','RD_COMPLETE','AR_PROJECTED_CONTACT','AR_SHARED','GJC_RESULT','P15_DERIVED'].includes(r.node(f.term).c.length?r.node(r.node(f.term).c[0]).s:''));const support=new Set();const visit=id=>{if(support.has(id))return;support.add(id);r.facts[id].support.forEach(visit);};checked.forEach(f=>visit(f.id));
 save(path.join(out,label+'.PROOFS.json'),{source_map:identity(path.join(stage,'source-map.json')),readback:summary.readback,checked:checked.map(f=>f.id),facts:[...support].sort((a,b)=>a-b).map(id=>({...r.facts[id],term_text:render(r.facts[id].term)}))});bind(path.join(out,label+'.PROOFS.json'));
 console.log(JSON.stringify({observed:label,facts:r.count,epochs:r.epochs,assertions:assertions.length,closure:summary.closure_sha256}));return summary;
}
try{
 save(path.join(out,'INPUTS.json'),{watched,scope:bundle.scope,original_proofs:bundle.proofs,recorded_binding:bundle.bindingRelation,actual_grants:bundle.actual_grants,actual_topology:bundle.actual_topology});bind(path.join(out,'INPUTS.json'));
 save(path.join(out,'EXPECTATIONS.json'),{scope:'OBSERVER_ONLY_NOT_NATIVE_INPUT',relations:bundle.rdCases,authority:bundle.arCases,recorded_bindings:bundle.bindingCases});bind(path.join(out,'EXPECTATIONS.json'));
 const before=custody('custody_before'),normal=lower('normal',bundle.rows);gpu('normal',normal);const first=observe('normal',normal);
 const replay=path.join(out,'replay');fs.mkdirSync(replay);fs.copyFileSync(path.join(normal,'source-map.json'),path.join(replay,'source-map.json'),fs.constants.COPYFILE_EXCL);bind(path.join(replay,'source-map.json'));gpu('replay',replay,path.join(normal,'image.bin'));const second=observe('replay',replay);need(first.readback.sha256===second.readback.sha256,'REPLAY_NOT_SAME');
 const reversed=lower('reversed',[...bundle.rows].reverse());gpu('reversed',reversed);const third=observe('reversed',reversed);need(first.closure_sha256===third.closure_sha256,'REVERSED_CLOSURE_NOT_SAME');
 const after=custody('custody_after');checkWatched();for(const a of artifacts)need(identity(a.path).sha256===a.sha256,'ARTIFACT_NOT_SAME '+a.path);
 const record={schema:'RelationAuthority018Qualification',verdict:'IF_THEN',scope:bundle.scope,inputs:watched,artifacts,native_sources:sources.map(identity),runs:[first,second,third],replay:'SAME_RAW_BYTES',reversed:'SAME_FULL_DECODED_CLOSURE',custody_before:before,custody_after:after,remaining:['CONTACT_SCOPE_NOT_A_COMPLETE_ARBITRARY_RECORD_DECOMPOSITION','CONCRETE_AUTHORITY_TOPOLOGY_AND_GRANTS_NOT_SUPPLIED','GENERIC_LOCAL_SECTION_ADAPTER_NOT_BOUND_AS_J17_REQUIRED_EXECUTION_PATH','NO_LOCAL_SECTION_GLOBAL_SECTION_OR_EXECUTE_LICENSE'],world_link_3:'NOT_WRITTEN',repository_commit:'NOT_PERFORMED'};
 save(path.join(out,'RUN_RECORD_018.json'),record);console.log(JSON.stringify({run_record:identity(path.join(out,'RUN_RECORD_018.json'))}));
}catch(e){save(path.join(out,'STOP.json'),{verdict:'MAYBE',reason:e.message,world:'NOT_WRITTEN',retained:'ALL_OUTPUTS_RETAINED'});throw e;}
