// Generic GPU matcher/prefill qualification. No world input or expected output.
// Serial V1 is neither stopped nor modified. All results are write-once.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
const mode=process.argv[2];if(!['small','full'].includes(mode))throw Error('small|full');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:p,bytes:b.length,sha256:sha(b)};};
const read=p=>JSON.parse(fs.readFileSync(p));
function check(b){const a=id(b.path);if(a.sha256!==b.sha256||a.bytes!==(b.bytes??b.size))throw Error('CUSTODY_NOT_SAME '+b.path);}
const out=path.join(here,'qualification_iterative_'+mode);if(fs.existsSync(out))throw Error('PRESERVE_QUALIFICATION');
const old=path.join(root,'prefill_qualification_001'),sealPath=path.join(root,'carrier_prefill_001/PREFILL_MANIFEST.json');
if(id(sealPath).sha256!=='D40F88D9CA521EDF95A4FC347A309D8B23F5605F47EC164F91BB2CAD80DF4AD7')throw Error('PREFILL_SEAL_NOT_SAME');
const seal=read(sealPath);for(const b of Object.values(seal.members))check(b);
const priorQPath=path.join(old,'execution/QUALIFICATION.json');
if(id(priorQPath).sha256!=='8C784B4A8BA6020BDCC40E4399761CD54EB03F09BA1889318ECEA17894C4BDE9')throw Error('PRIOR_QUALIFICATION_NOT_SAME');
const priorQ=read(priorQPath);for(const c of priorQ.cases){check(c.clean.identity);check(c.prefilled.identity);}
const exe=path.join(here,'iterative_collect_007/block_iterative_'+mode+'.exe'),source=path.join(here,'iterative_collect_007/block_iterative_'+mode+'.cu');
const serial=path.join(old,'prefill_small.exe'),guard=path.join(here,'qualification_guard.mjs');
if(id(serial).sha256!=='58B3A1A4387E73F2D238B749614B5C51B29F460D5C1AD02FEC61F2949B44D5B0'||id(guard).sha256!=='B2C1B115F158915AF4DF9AA20CEA89CFB698076CB29BC6E2F9BDCC13B895FA38')throw Error('REFERENCE_TOOLS_NOT_SAME');
if(mode==='full'&&read(path.join(here,'qualification_iterative_small/QUALIFICATION.json')).qualification!=='SAME')throw Error('SMALL_QUALIFICATION_REQUIRED');
const bound={runner:id(fileURLToPath(import.meta.url)),exe:id(exe),source:id(source),telemetry:id(path.join(here,'telemetry.inc')),guard:id(guard),serial:id(serial),seal:id(sealPath),prior_qualification:id(priorQPath)};
if(mode==='full'){const p=path.join(here,'qualification_iterative_small/QUALIFICATION.json'),s=read(p);bound.small_qualification=id(p);for(const c of s.regression){check(c.serial.identity);bound['serial_regression_'+c.name]=c.serial.identity;}}
const carrier=mode==='small'?path.join(old,'carrier'):path.join(root,'carrier_prefill_001');
const preparationPath=path.join(old,'PREPARATION.json');check(priorQ.bindings.preparation);
const prep=read(preparationPath);for(const c of prep.cases){check(c.image.from);check(c.image.to);check(c.source);check(c.input);}check(prep.carrierImage.to);check(prep.carrierState.to);
const regressionManifestPath=path.join(root,'block_replay_qualification_inputs_001/MANIFEST.json');
if(id(regressionManifestPath).sha256!=='572345C3AC16313CD5E4F7259B7870C45D3D14D91656DE5085B3FFE16E43DE0B')throw Error('REGRESSION_MANIFEST_NOT_SAME');
for(const b of read(regressionManifestPath).files)check(b);
const casePrepPath=path.join(here,'cases/PREPARATION.json');for(const c of read(casePrepPath).cases){check(c.packed.from);check(c.packed.to);}
Object.assign(bound,{preparation:id(preparationPath),case_preparation:id(casePrepPath),regression_manifest:id(regressionManifestPath)});
const inputDirs=[carrier,...['this','no'].map(s=>path.join(old,s+(mode==='full'?'_lowered':''))),...['overflow','deep_antecedent','deep_consequent'].map(s=>mode==='small'?path.join(here,'cases',s):path.join(root,'block_replay_qualification_inputs_001',s))];
for(let i=0;i<inputDirs.length;i++)for(const file of ['source.mal','source-map.json','image.bin'])bound['input_'+i+'_'+file]=id(path.join(inputDirs[i],file));
bound.carrier_checkpoint=id(path.join(carrier,'readback.bin'));
const events=[];fs.mkdirSync(out);
const write=(n,v)=>fs.writeFileSync(path.join(out,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
function budget(){
 const r=spawnSync('nvidia-smi',['--query-gpu=name,memory.free,memory.used','--format=csv,noheader,nounits'],{encoding:'utf8',windowsHide:true});
 if(r.status!==0)throw Error('MEMORY_OBSERVATION_UNAVAILABLE');const rows=r.stdout.trim().split(/\r?\n/);if(rows.length!==1)throw Error('GPU_COUNT');
 const [name,f,u]=rows[0].split(',').map(x=>x.trim()),free=Number(f),used=Number(u),minimum=mode==='small'?1024:1536;
 if(!name.includes('RTX 3070')||!Number.isFinite(free)||free<minimum)throw Error('CONCURRENT_MEMORY_BOUNDARY '+rows[0]);
 return {name,free_MiB:free,used_MiB:used,minimum_free_MiB:minimum,scope:'pre-launch observation; not measured allocation'};
}
function launch(label,command,args,expectedExit=0){
 for(const b of Object.values(bound))check(b);const preflight=budget(),started=new Date().toISOString();
 console.log(JSON.stringify({action:'QUALIFY_LAUNCH',mode,label,preflight}));
 // The guard bounds its direct CUDA child; do not kill a Node parent and orphan it.
 const timeout=command===process.execPath?undefined:120000;
 const r=spawnSync(command,args,{cwd:root,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe'],maxBuffer:32*1024*1024,timeout});
 const e={label,command,args,preflight,started_utc:started,ended_utc:new Date().toISOString(),exit_code:r.status,signal:r.signal,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??''};
 write(label+'.execution.json',e);events.push(e);for(const b of Object.values(bound))check(b);
 console.log(JSON.stringify({action:'QUALIFY_RETURN',label,exit:r.status,stdout:e.stdout.slice(-300)}));
 if(r.error||r.status!==expectedExit)throw Error('QUALIFICATION_EXECUTION_NOT_SAME '+label);return e;
}
function state(file,mapDir){
 const b=fs.readFileSync(file),w=i=>b.readInt32LE(i*4),nt=w(2),nf=w(3),tc=w(5),fc=w(6),map=read(path.join(mapDir,'source-map.json'));
 if(w(0)!==0x31524c47||w(1)!==1||tc<0||tc>nt||fc<0||fc>nf||b.length!==32+nt*40+nf*48)throw Error('READBACK_FORMAT');
 const counts={},readings={},seeded={};
 for(let i=0;i<fc;i++){const at=8+nt*10+i*12,t=w(at),p=8+t*10,a=w(p+1);if(a<1)continue;const child=w(p+2),cp=8+child*10;if(w(cp+1))continue;const tag=map.symbols[w(cp)];counts[tag]=(counts[tag]??0)+1;
  if(tag==='PQ_FLAG_READING'||tag==='PQ_PAIR_READING'){if(w(at+1)<0)seeded[tag]=(seeded[tag]??0)+1;const r=map.symbols[w(8+w(p+1+a)*10)];readings[tag]??={};readings[tag][r]=(readings[tag][r]??0)+1;}
 }
 return {identity:id(file),error:w(4),terms:tc,facts:fc,epochs:w(7),used_terms:sha(b.subarray(32,32+tc*40)),used_facts:sha(b.subarray(32+nt*40,32+nt*40+fc*48)),counts,readings,seeded};
}
function sameState(a,b,label){for(const k of ['error','terms','facts','epochs','used_terms','used_facts'])if(a[k]!==b[k])throw Error('ORDERED_READBACK_NOT_SAME '+label+' '+k);if(a.identity.bytes===b.identity.bytes&&a.identity.sha256!==b.identity.sha256)throw Error('SAME_CAPACITY_RAW_NOT_SAME '+label);return 'SAME';}
function suppliedResults(s,reading){if(s.error||s.facts!==6484||s.terms!==7395||Object.keys(s.seeded).length||s.readings.PQ_FLAG_READING?.[reading]!==480||s.readings.PQ_PAIR_READING?.[reading]!==720||Object.keys(s.readings.PQ_FLAG_READING).length!==1||Object.keys(s.readings.PQ_PAIR_READING).length!==1)throw Error('OWN_INPUT_DERIVATION_NOT_SAME');}
try{
 const carrierOut=path.join(out,'carrier.clean.bin');launch('carrier_clean',exe,[path.join(carrier,'image.bin'),carrierOut]);
 const c=state(carrierOut,carrier),original=state(path.join(carrier,'readback.bin'),carrier);sameState(c,original,'carrier');
 const cases=[];
 for(const reading of ['THIS','NO']){
  const stem=reading.toLowerCase(),dir=path.join(old,stem+(mode==='full'?'_lowered':'')),clean=path.join(out,stem+'.clean.bin'),warm=path.join(out,stem+'.prefilled.bin'),report=path.join(out,stem+'.guard.json');
  launch(stem+'_clean',exe,[path.join(dir,'image.bin'),clean]);
  launch(stem+'_prefilled',process.execPath,[guard,'--previous-map',path.join(carrier,'source-map.json'),'--previous-image',path.join(carrier,'image.bin'),'--previous-readback',path.join(carrier,'readback.bin'),'--next-map',path.join(dir,'source-map.json'),'--next-image',path.join(dir,'image.bin'),'--run','--exe',exe,'--output',warm,'--compare',clean,'--report',report]);
  const a=state(clean,dir),b=state(warm,dir),g=read(report),reference=priorQ.cases.find(x=>x.reading===reading);
  sameState(a,reference.clean,stem+' clean');sameState(b,reference.prefilled,stem+' prefill');suppliedResults(a,reading);suppliedResults(b,reading);
  if(g.qualification!=='SAME'||g.retained_proof_bytes!=='SAME')throw Error('FULL_SET_OR_RETAINED_PREFIX_NOT_SAME');
  cases.push({reading,clean:a,prefilled:b,reference_serial_clean:'SAME',reference_serial_prefilled:'SAME',full_fact_term_sets:'SAME',retained_proofs:'SAME',own_input_readings:'DERIVED',guard:id(report)});
 }
 const closed=path.join(out,'carrier.closed.bin'),closedGuard=path.join(out,'carrier.closed.guard.json');
 launch('carrier_closed',process.execPath,[guard,'--previous-map',path.join(carrier,'source-map.json'),'--previous-image',path.join(carrier,'image.bin'),'--previous-readback',path.join(carrier,'readback.bin'),'--next-map',path.join(carrier,'source-map.json'),'--next-image',path.join(carrier,'image.bin'),'--run','--exe',exe,'--output',closed,'--compare',carrierOut,'--report',closedGuard]);
 if(read(closedGuard).qualification!=='SAME'||read(closedGuard).retained_proof_bytes!=='SAME')throw Error('CLOSED_CHECKPOINT_NOT_SAME');
 const regression=[];
 for(const name of ['overflow','deep_antecedent','deep_consequent']){
  const expectedExit=name==='overflow'?0:2,smallDir=path.join(here,'cases',name),dir=mode==='small'?smallDir:path.join(root,'block_replay_qualification_inputs_001',name),ref=path.join(here,'qualification_iterative_small',name+'.serial.bin'),result=path.join(out,name+'.parallel.bin');
  if(mode==='small')launch(name+'_serial',serial,[path.join(smallDir,'image.bin'),ref],expectedExit);
  launch(name+'_parallel',exe,[path.join(dir,'image.bin'),result],expectedExit);
  const a=state(ref,smallDir),b=state(result,dir);sameState(a,b,name);regression.push({name,serial:a,parallel:b,used_terms_facts_supports_refusal:'SAME'});
 }
 const result={scope:'GENERIC_MATCHER_AND_PREFILL_QUALIFICATION; NOT_V1_V2_CONFORM',qualification:'SAME',mode,bindings:bound,carrier:{observed:c,reference:original,ordered_bytes:'SAME'},cases,closed_checkpoint:read(closedGuard),regression,telemetry:'SEPARATE_AUDIT_REQUIRED_BEFORE_PRODUCTION',active_serial_V1:'NOT_STOPPED_OR_CHANGED',source_laws:'UNCHANGED',repository_action:'NONE'};
 write('QUALIFICATION.json',result);console.log(JSON.stringify({qualification:'SAME',record:id(path.join(out,'QUALIFICATION.json')),mode}));
}catch(e){write('STOP.json',{reason:e.message,events:events.length,conform:'NOT_RUN',active_serial_V1:'NOT_STOPPED_OR_CHANGED'});throw e;}
