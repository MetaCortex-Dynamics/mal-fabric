// Isolated generic resource-refusal qualification. No world inputs or checkpoints.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {packImage} from '../../prefill_qualification_001/pack.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const node=process.execPath;
const mode=process.argv[2];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const json=(p,x)=>write(p,JSON.stringify(x,null,2)+'\n');
const assert=(condition,label)=>{if(!condition)throw Error(label);};
const runtime=path.join(root,'parallel_prefill_002/iterative_collect_007/block_iterative_small.exe');
const smallSource=runtime.replace(/\.exe$/,'.cu');
const fullSource=smallSource.replace('_small.cu','_full.cu');
const transformPath=path.join(path.dirname(runtime),'SOURCE_TRANSFORM.json');
const qualificationPath=path.join(root,'parallel_prefill_002/qualification_iterative_small/QUALIFICATION.json');
const lowerer=path.join(root,'lower_compact_large.mjs');
const guard=path.join(root,'prefill_guard_execute.mjs');
const status=path.join(root,'status.mjs');
const readback=path.join(root,'readback.mjs');
const own=identity(fileURLToPath(import.meta.url));
const expectedRuntime='A4A0254258430BBE1754A4058552B126F7CE0D4D0371FB4489B160B0E6F51E28';
const expectedSmall='CEC65C99FDF63CA20CF214F56140200EDD78F7D74EAC902943FE437705072CE9';
const expectedFull='C09A06FC4B2F1D733C2A9F7FC247844E98B6EF4DB3C7EC5915C63A089D3D6169';
function custody(){
 assert(identity(runtime).sha256===expectedRuntime,'RUNTIME_CUSTODY');
 assert(identity(smallSource).sha256===expectedSmall,'SMALL_SOURCE_CUSTODY');
 assert(identity(fullSource).sha256===expectedFull,'FULL_SOURCE_CUSTODY');
 const t=JSON.parse(fs.readFileSync(transformPath));let inverse=fs.readFileSync(smallSource,'utf8');
 for(const c of t.small_changes){assert(inverse.split(c.after).length===2,'UNIQUE_CAPACITY_TRANSFORM');inverse=inverse.replace(c.after,c.before);}
 assert(Buffer.from(inverse).equals(fs.readFileSync(fullSource)),'CAPACITY_ONLY_SOURCE_NOT_SAME');
 const q=JSON.parse(fs.readFileSync(qualificationPath));assert(q.qualification==='SAME','RETAINED_SMALL_QUALIFICATION');
 return {runtime:identity(runtime),small_source:identity(smallSource),full_source:identity(fullSource),transform:identity(transformPath),retained_qualification:identity(qualificationPath),capacity_only_source_equivalence:'SAME',small_capacity:{NP:65536,NS:2048,NR:1024,NT:32768,NF:16384},full_capacity:{NP:1048576,NS:2048,NR:1024,NT:4194304,NF:2097152},lowerer:identity(lowerer),guard:identity(guard),status:identity(status),readback:identity(readback),orchestrator:own};
}
const invoke=(exe,args,timeout=60000)=>{const started=new Date().toISOString();const r=spawnSync(exe,args,{encoding:'utf8',windowsHide:true,timeout,maxBuffer:16*1024*1024});return {started,finished:new Date().toISOString(),command:{executable:exe,args},exit:r.status,signal:r.signal,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??''};};
function auditRaw(dir){
 const raw=fs.readFileSync(path.join(dir,'readback.bin')),image=fs.readFileSync(path.join(dir,'image.bin')),map=JSON.parse(fs.readFileSync(path.join(dir,'source-map.json')));
 assert(sha(image)===map.image_sha256&&sha(fs.readFileSync(path.join(dir,'source.mal')))===map.source_sha256,'IMAGE_SOURCE_CUSTODY');
 const NP=65536,NS=2048,NR=1024;
 assert(image.length===16+NP*40+NS*4+NR*40&&image.readInt32LE(0)===0x33414c47,'IMAGE_FORMAT');
 assert(image.readInt32LE(4)===map.patterns.length&&image.readInt32LE(8)===map.seeds.length&&image.readInt32LE(12)===map.rules.length,'MAP_IMAGE_COUNTS');
 for(let i=0;i<map.patterns.length;i++){const p=map.patterns[i],o=16+i*40;assert(image.readInt32LE(o)===p.sym&&image.readInt32LE(o+4)===p.children.length,'MAP_PATTERN');for(let j=0;j<p.children.length;j++)assert(image.readInt32LE(o+8+j*4)===p.children[j],'MAP_PATTERN_CHILD');}
 for(let i=0;i<map.seeds.length;i++)assert(image.readInt32LE(16+NP*40+i*4)===map.seeds[i],'MAP_SEED');
 for(let i=0;i<map.rules.length;i++){const r=map.rules[i],o=16+NP*40+NS*4+i*40;assert(image.readInt32LE(o)===r.ants.length&&image.readInt32LE(o+4)===r.result,'MAP_RULE');for(let j=0;j<r.ants.length;j++)assert(image.readInt32LE(o+8+j*4)===r.ants[j],'MAP_ANTECEDENT');}
 assert(raw.readInt32LE(0)===0x31524c47&&raw.readInt32LE(4)===1,'READBACK_FORMAT');
 const NT=raw.readInt32LE(8),NF=raw.readInt32LE(12),error=raw.readInt32LE(16),tc=raw.readInt32LE(20),fc=raw.readInt32LE(24),epochs=raw.readInt32LE(28);
 assert(NT===32768&&NF===16384&&raw.length===32+NT*40+NF*48,'READBACK_CAPACITY');
 assert(tc>0&&tc<=NT&&fc>0&&fc<=NF&&epochs>0,'COUNTERS_BOUNDED');
 const terms=[],termIds=new Map();
 for(let i=0;i<tc;i++){const o=32+i*40,s=raw.readInt32LE(o),a=raw.readInt32LE(o+4),c=[];assert(s>=0&&s<map.symbols.length&&a>=0&&a<=8,'TERM_SHAPE');for(let j=0;j<a;j++){const id=raw.readInt32LE(o+8+j*4);assert(id>=0&&id<i,'TERM_CHILD_PREDECESSOR');c.push(id);}const key=JSON.stringify([s,c]);assert(!termIds.has(key),'DUPLICATE_TERM');termIds.set(key,i);terms.push({s,c});}
 function match(pId,tId,b){const p=map.patterns[pId],t=terms[tId];if(p.sym<0){const v=-p.sym-1;if(b.has(v))return b.get(v)===tId;b.set(v,tId);return true;}return p.sym===t.s&&p.children.length===t.c.length&&p.children.every((p,j)=>match(p,t.c[j],b));}
 function lookup(pId,b){const p=map.patterns[pId];if(p.sym<0){assert(b.has(-p.sym-1),'UNBOUND_HEAD');return b.get(-p.sym-1);}const c=p.children.map(p=>lookup(p,b)),id=termIds.get(JSON.stringify([p.sym,c]));assert(id!==undefined,'MISSING_INSTANTIATED_TERM');return id;}
 const seedIds=new Set(map.seeds.map(p=>lookup(p,new Map()))),facts=[],factTerms=new Set();let seedFacts=0,derivedFacts=0;
 for(let i=0;i<fc;i++){const o=32+NT*40+i*48,term=raw.readInt32LE(o),rule=raw.readInt32LE(o+4),rank=raw.readInt32LE(o+8),count=raw.readInt32LE(o+12),support=[];assert(term>=0&&term<tc&&!factTerms.has(term),'FACT_TERM_UNIQUE');factTerms.add(term);
  if(rule===-1){assert(rank===0&&count===0&&seedIds.has(term),'SEED_PROOF');seedFacts++;}
  else{assert(rule>=0&&rule<map.rules.length,'FACT_RULE');const r=map.rules[rule],b=new Map();assert(count===r.ants.length,'FACT_SUPPORT_COUNT');let max=-1;for(let j=0;j<count;j++){const id=raw.readInt32LE(o+16+j*4);assert(id>=0&&id<i,'SUPPORT_PREDECESSOR');support.push(id);assert(match(r.ants[j],facts[id].term,b),'ANTECEDENT_MATCH');max=Math.max(max,facts[id].rank);}assert(rank===max+1&&lookup(r.result,b)===term,'HEAD_AND_RANK');derivedFacts++;}
  facts.push({term,rule,rank,count,support});
 }
 assert(seedFacts===seedIds.size&&seedFacts===128,'ALL_INPUT_SEEDS');
 return {raw:identity(path.join(dir,'readback.bin')),image:identity(path.join(dir,'image.bin')),source:identity(path.join(dir,'source.mal')),map:identity(path.join(dir,'source-map.json')),error,terms:tc,facts:fc,epochs,seed_facts:seedFacts,derived_facts:derivedFacts,all_retained_fact_proofs:'SAME',map_image:'SAME',unique_terms:termIds.size,unique_facts:factTerms.size,counts_within_capacity:'SAME',last_fact:facts.at(-1),partial_term_interning:'PERMITTED; instantiation can precede refusal; not a checkpoint',scope:'RESOURCE_REFUSAL_DIAGNOSTIC_ONLY; NOT_CONFORM; NOT_CHECKPOINT'};
}
if(mode==='prepare'){
 const bound=custody(),cases=[];
 for(const name of ['fact','term']){const source=path.join(here,name+'.mal'),large=path.join(here,name+'_large'),small=path.join(here,name);assert(!fs.existsSync(large)&&!fs.existsSync(small),'PRESERVE_EXISTING_CASE');const command=invoke(node,[lowerer,source,large],120000);assert(command.exit===0&&!command.error,'LOWERING_REFUSED '+command.stderr);const repack=packImage(large,small);cases.push({name,source:identity(source),lowering:command,repack});}
 const report={kind:'GENERIC_CAPACITY_REFUSAL_PREPARATION',authority:'EXECUTE_SCOPED_DIAGNOSTIC; NO_PROMOTION',bound,cases,production_mutation:'NONE',next:'Two isolated small-runtime launches only'};
 json(path.join(here,'PREPARATION.json'),report);console.log(JSON.stringify({preparation:identity(path.join(here,'PREPARATION.json')),cases:cases.map(x=>({name:x.name,...x.repack}))}));
}else if(mode==='run'){
 const bound=custody(),prep=JSON.parse(fs.readFileSync(path.join(here,'PREPARATION.json')));assert(prep.bound.orchestrator.sha256===own.sha256,'PREP_ORCHESTRATOR_CUSTODY');
 const cases=[];
 for(const name of ['fact','term']){
  const dir=path.join(here,name),out=path.join(dir,'readback.bin');assert(!fs.existsSync(out)&&!fs.existsSync(path.join(dir,'EXECUTION.json')),'PRESERVE_PRIOR_EXECUTION');
  const pre={runtime:identity(runtime),image:identity(path.join(dir,'image.bin')),source:identity(path.join(dir,'source.mal')),map:identity(path.join(dir,'source-map.json'))};const execution=invoke(runtime,[pre.image.path,out]);json(path.join(dir,'EXECUTION.json'),execution);
  assert(!execution.error&&execution.signal===null&&execution.exit===2,'REFUSAL_EXIT_NOT_TWO');assert(identity(runtime).sha256===pre.runtime.sha256&&identity(pre.image.path).sha256===pre.image.sha256&&identity(pre.source.path).sha256===pre.source.sha256&&identity(pre.map.path).sha256===pre.map.sha256,'EXECUTION_CUSTODY');
  const observed=auditRaw(dir);assert(observed.error===(name==='fact'?4:1),'RESOURCE_ERROR_NOT_SAME');assert(name==='fact'?observed.facts===16384&&observed.terms<32768:observed.terms===32768&&observed.facts<16384,'RESOURCE_BOUNDARY_NOT_SAME');
  const rejected=invoke(node,[guard,'--previous-map',pre.map.path,'--previous-image',pre.image.path,'--previous-readback',out,'--next-map',pre.map.path,'--next-image',pre.image.path]);json(path.join(dir,'GUARD_REJECTION.json'),rejected);assert(rejected.exit!==0&&!rejected.error&&/checkpoint incomplete or failed/.test(rejected.stderr),'GUARD_DID_NOT_REFUSE_ERROR');
  const statusOut=path.join(dir,'STATUS_MUST_NOT_EXIST.json'),statusResult=invoke(node,[status,dir,statusOut]);json(path.join(dir,'STATUS_REJECTION.json'),statusResult);assert(statusResult.exit!==0&&!statusResult.error&&statusResult.stderr.includes('GPU error '+observed.error)&&!fs.existsSync(statusOut),'STATUS_DID_NOT_REFUSE_ERROR');
  cases.push({name,execution:identity(path.join(dir,'EXECUTION.json')),observed,guard_rejection:identity(path.join(dir,'GUARD_REJECTION.json')),status_rejection:identity(path.join(dir,'STATUS_REJECTION.json')),checkpoint_admission:'NO',status_publication:'NO',resource_refusal:'SAME'});
 }
 const after=custody();assert(JSON.stringify(after)===JSON.stringify(bound),'TOOL_CUSTODY_CHANGED');
 const report={kind:'GENERIC_CAPACITY_REFUSAL_QUALIFICATION',qualification:'SAME',scope:'SMALL_CAPACITY_EQUIVALENT_ITERATIVE_RUNTIME; RESOURCE_REFUSAL_ONLY; NOT_V1_V2_CONFORM; NOT_CHECKPOINT',preparation:identity(path.join(here,'PREPARATION.json')),bound,cases,production_artifacts_changed:'NONE',diagnostic_outputs_used_as_production_inputs:'NO'};
 json(path.join(here,'QUALIFICATION.json'),report);console.log(JSON.stringify({qualification:identity(path.join(here,'QUALIFICATION.json')),cases:cases.map(x=>({name:x.name,error:x.observed.error,terms:x.observed.terms,facts:x.observed.facts,epochs:x.observed.epochs,raw:x.observed.raw.sha256,refusal:x.resource_refusal}))}));
}else throw Error('Use prepare or run');
