// Isolated V2 execution and additive continuation; no world law or expected bytes.
// Stage 01 starts from the sealed carrier-only checkpoint, not a V1 closure.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const controls=path.dirname(fileURLToPath(import.meta.url));
const root='D:/Dev/flag-world-first-tick-020';
const qualified=path.join(root,'parallel_prefill_002');
const [vector,stageText,...extra]=process.argv.slice(2),stage=Number(stageText);
if(vector!=='V2'||extra.length||!Number.isInteger(stage)||stage<1||stage>99)throw Error('ISOLATED_V2_STAGE_1_TO_99_REQUIRED');
const work=path.join(qualified,'vectors_v2_009','V2');
const dir=path.join(work,'stage'+String(stage).padStart(2,'0')),image=path.join(dir,'image');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),size:b.length,sha256:sha(b)};};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const check=r=>{const n=id(r.path);if(n.sha256!==r.sha256||n.size!==(r.size??r.bytes))throw Error('CUSTODY_NOT_SAME '+r.path);};
const put=(n,o)=>fs.writeFileSync(path.join(dir,n),JSON.stringify(o,null,2)+'\n',{flag:'wx'});
const bindingsManifest=path.join(controls,'V2_009_BINDINGS.json');
const manifestIdentity=id(bindingsManifest),manifest=read(bindingsManifest);
function checkManifest(){check(manifestIdentity);for(const b of manifest.members)check(b);}
checkManifest();

const exe=path.join(qualified,'iterative_collect_007','block_iterative_full.exe');
const source=path.join(qualified,'iterative_collect_007','block_iterative_full.cu');
const guard=path.join(root,'prefill_guard_execute.mjs');
if(id(exe).sha256!=='8A739F97DC3A67DC440DE3BE5C079A7ED7FC0898D5DCFDB5AEFE6F9CE8AB2B08'||id(source).sha256!=='C09A06FC4B2F1D733C2A9F7FC247844E98B6EF4DB3C7EC5915C63A089D3D6169'||id(guard).sha256!=='CAF7A0735EBC9ACC238295F6386541EDAB7CB0F5C165AB1DBA358FFA730D7D4C')throw Error('QUALIFIED_RUNTIME_NOT_SAME');
const qpath=path.join(qualified,'qualification_iterative_full','QUALIFICATION.json');
const q=read(qpath);
if(id(qpath).sha256!=='00E7AAB2A752830F01297D580905D9B3F717057159C4E7016A1C3558931F1A70'||q.qualification!=='SAME')throw Error('QUALIFICATION_REQUIRED');
for(const b of Object.values(q.bindings))if(b?.path)check(b);
const capacityPath=path.join(qualified,'capacity_refusal_008','QUALIFICATION.json');
const capacityQualification=read(capacityPath);
if(id(capacityPath).sha256!=='0BAD5646C5D071F11886A42EBF5A7341FF44EBFEB921C3BE5B227DD1F9D06938'||capacityQualification.qualification!=='SAME'||capacityQualification.bound.full_capacity.NF!==2097152||capacityQualification.bound.full_capacity.NT!==4194304)throw Error('CAPACITY_REFUSAL_QUALIFICATION_REQUIRED');

const build=read(path.join(dir,'BUILD.json'));
if(build.vector!==vector||build.stage!==stage)throw Error('STAGE_IDENTITY_NOT_SAME');
for(const b of [build.source,build.image,build.source_map,...Object.values(build.inputs)])check(b);
if(path.resolve(build.image.path)!==path.resolve(image,'image.bin')||path.resolve(build.source_map.path)!==path.resolve(image,'source-map.json'))throw Error('STAGE_OUTPUT_CUSTODY_NOT_SAME');
for(const b of Object.values(build.inputs))if(/(?:^|[\\/])[^\\/]*\.expected\.json$/i.test(b.path))throw Error('EXPECTED_OUTPUT_INPUT_EXCLUDED');

let previousMap,previousImage,previousReadback,priorFacts,priorTerms,previousHashes,priorBindings;
if(stage===1){
 const sealPath=path.join(root,'carrier_prefill_001','PREFILL_MANIFEST.json');
 if(id(sealPath).sha256!=='D40F88D9CA521EDF95A4FC347A309D8B23F5605F47EC164F91BB2CAD80DF4AD7')throw Error('CARRIER_PREFILL_SEAL_NOT_SAME');
 const seal=read(sealPath);
 for(const b of Object.values(seal.members))check(b);
 const importGuard=read(seal.members['V2_IMPORT_GUARD.json'].path);
 if(build.image.sha256!=='FE34A07948DB72507CFD7D28278E63DCABEA478FDB949B4C28CBFA2A0B41D75A'||build.source.sha256!=='BE1E4948CEADE240BAAA1AFAA37DFF2D0EA01810A1F188EC6F9A1F402ED91A97'||importGuard.guard!=='IF_THEN'||importGuard.next_image_sha256!==build.image.sha256||importGuard.checkpoint_sha256!==seal.members['readback.bin'].sha256)throw Error('SEALED_V2_IMPORT_NOT_SAME');
 previousMap=seal.members['source-map.json'].path;
 previousImage=seal.members['image.bin'].path;
 previousReadback=seal.members['readback.bin'].path;
 priorFacts=seal.facts;priorTerms=seal.terms;
 previousHashes=path.join(root,'hash_empty','responses.json');
 priorBindings={carrier_seal:id(sealPath),carrier_import_guard:id(seal.members['V2_IMPORT_GUARD.json'].path)};
}else{
 const prev=path.join(work,'stage'+String(stage-1).padStart(2,'0'));
 const previous=path.join(prev,'image');
 const prior=read(path.join(prev,'STATUS.json'));
 const priorExecution=read(path.join(prev,'EXECUTION.json'));
 const priorGuard=read(path.join(prev,'PREFILL_EXECUTION_GUARD.json'));
 const priorBuild=read(path.join(prev,'BUILD.json'));
 if(priorExecution.vector!==vector||priorExecution.stage!==stage-1||priorBuild.vector!==vector||priorBuild.stage!==stage-1||prior.error!==0||priorExecution.exit_code!==0||priorExecution.error!==null||priorGuard.guard!=='IF_THEN'||priorGuard.resumed_sha256!==prior.readback_sha256||priorGuard.next_image_sha256!==prior.image_sha256||priorGuard.runtime_sha256!==id(exe).sha256||id(path.join(previous,'readback.bin')).sha256!==prior.readback_sha256)throw Error('PRIOR_AUDITED_V2_CLOSURE_REQUIRED');
 for(const b of [priorBuild.source,priorBuild.image,priorBuild.source_map,...Object.values(priorBuild.inputs)])check(b);
 if(prior.source_sha256!==priorBuild.source.sha256||prior.image_sha256!==priorBuild.image.sha256||build.previous?.source.sha256!==priorBuild.source.sha256||build.previous?.image.sha256!==priorBuild.image.sha256)throw Error('ADDITIVE_V2_PREDECESSOR_NOT_SAME');
 previousMap=path.join(previous,'source-map.json');previousImage=path.join(previous,'image.bin');previousReadback=path.join(previous,'readback.bin');
 priorFacts=prior.facts;priorTerms=prior.terms;
 previousHashes=path.join(prev,'hash','responses.json');
 const hashCustody=read(path.join(prev,'hash','HASH_CUSTODY.json'));
 if(hashCustody.readback_sha256!==prior.readback_sha256||hashCustody.source_sha256!==prior.source_sha256||hashCustody.image_sha256!==prior.image_sha256||id(previousHashes).sha256!==hashCustody.responses_sha256)throw Error('PRIOR_HASH_CUSTODY_NOT_SAME');
 priorBindings={previous_execution:id(path.join(prev,'EXECUTION.json')),previous_status:id(path.join(prev,'STATUS.json')),previous_guard:id(path.join(prev,'PREFILL_EXECUTION_GUARD.json')),previous_hash_custody:id(path.join(prev,'hash','HASH_CUSTODY.json'))};
}
if(!Number.isInteger(priorFacts)||priorFacts<1||priorFacts>2097152||!Number.isInteger(priorTerms)||priorTerms<1||priorTerms>4194304)throw Error('PRIOR_CAPACITY_BOUND_NOT_SAME');
const output=path.join(image,'readback.bin');
for(const p of [output,path.join(dir,'START.json'),path.join(dir,'EXECUTION.json'),path.join(dir,'STOP.json'),path.join(dir,'STATUS.json'),path.join(dir,'PREFILL_EXECUTION_GUARD.json'),path.join(dir,'hash')])if(fs.existsSync(p))throw Error('PRESERVE_EXISTING_EXECUTION '+p);
const argv=[guard,'--previous-map',previousMap,'--previous-image',previousImage,'--previous-readback',previousReadback,'--next-map',path.join(image,'source-map.json'),'--next-image',path.join(image,'image.bin'),'--run','--exe',exe,'--output',output,'--report',path.join(dir,'PREFILL_EXECUTION_GUARD.json')];
const bindings={runner:id(fileURLToPath(import.meta.url)),runtime:id(exe),source:id(source),guard:id(guard),qualification:id(qpath),capacity_qualification:id(capacityPath),continuation_manifest:manifestIdentity,...priorBindings,previous_map:id(previousMap),previous_image:id(previousImage),previous_readback:id(previousReadback),previous_hashes:id(previousHashes),image:id(path.join(image,'image.bin')),source_map:id(path.join(image,'source-map.json')),world_source:id(path.join(image,'source.mal'))};
const started=new Date().toISOString();
put('START.json',{scope:stage===1?'GUARDED_V2_CARRIER_PREFILL; NOT_CONFORM':'GUARDED_ADDITIVE_V2_CONTINUATION; NOT_CONFORM',vector,stage,started_utc:started,bindings,arguments:argv,capacity:{facts:2097152,terms:4194304,prior_facts:priorFacts,prior_terms:priorTerms,remaining_facts:2097152-priorFacts},capacity_refusal:'NONZERO_ERROR_NONZERO_EXIT; NO_STATUS_HASH_OR_CONTINUATION_ON_REFUSAL',expected_output_inputs:'NONE',V1:'UNCHANGED'});
console.log(JSON.stringify({action:stage===1?'CARRIER_PREFILL_GPU_LAUNCH':'ADDITIVE_GPU_LAUNCH',vector,stage,capacity_remaining_facts:2097152-priorFacts,image:bindings.image.sha256}));
try{
 for(const b of Object.values(bindings))check(b);
 checkManifest();
 const r=spawnSync(process.execPath,['--max-old-space-size=8192',...argv],{cwd:root,windowsHide:true,encoding:'utf8',stdio:['ignore','pipe','inherit'],maxBuffer:32*1024*1024});
 put('EXECUTION.json',{scope:'Generic source execution; not CONFORM',vector,stage,mode:stage===1?'SEALED_CARRIER_PREFILL':'AUDITED_V2_ADDITIVE_CONTINUATION',started_utc:started,ended_utc:new Date().toISOString(),bindings,exit_code:r.status,signal:r.signal,error:r.error?.message??null,output:r.stdout??'',diagnostic_readback:fs.existsSync(output)?id(output):null});
 for(const b of Object.values(bindings))check(b);
 checkManifest();
 if(r.error||r.status!==0)throw Error('V2_EXECUTION_REFUSED '+(r.error?.message??r.status));
 function cpu(tool,args){checkManifest();const result=spawnSync(process.execPath,['--max-old-space-size=8192',path.join(root,tool),...args],{cwd:root,windowsHide:true,encoding:'utf8',stdio:['ignore','pipe','inherit'],maxBuffer:32*1024*1024});if(result.error||result.status!==0)throw Error('OBSERVATION_REFUSED '+tool);return result.stdout;}
 cpu('status.mjs',[image,path.join(dir,'STATUS.json')]);
 const status=read(path.join(dir,'STATUS.json'));
 if(status.error!==0||status.readback_sha256!==id(output).sha256)throw Error('COMPLETED_V2_STATUS_REQUIRED');
 cpu('hash_batch.mjs',[image,path.join(dir,'hash'),previousHashes]);
 cpu('hash_delta.mjs',[path.join(dir,'hash','responses.json'),previousHashes,path.join(dir,'hash','delta.json')]);
 console.log(JSON.stringify({action:stage===1?'CARRIER_PREFILL_STAGE_COMPLETED':'ADDITIVE_STAGE_COMPLETED',vector,stage,readback:status.readback_sha256,error:status.error,facts:status.facts,terms:status.terms,epochs:status.epochs,capacity_remaining_facts:2097152-status.facts,conform:'NOT_RUN'}));
}catch(e){put('STOP.json',{utc:new Date().toISOString(),reason:e.message,continuation:'WITHHELD',conform:'NOT_RUN',V1:'UNCHANGED'});throw e;}
