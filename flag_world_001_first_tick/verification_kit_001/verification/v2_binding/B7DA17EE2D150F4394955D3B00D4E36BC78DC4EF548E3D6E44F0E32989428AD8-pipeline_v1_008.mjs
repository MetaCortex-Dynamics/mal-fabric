// Authorized execution orchestration: exact replay gate, then additive source continuations.
// No world law, expected-output substitution, promotion, commit or V2 launch.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
const work=path.join(here,'vectors_repeat_008/V1'),first=path.join(work,'stage01');
const corpus='C:/Users/devon/Documents/Codex/2026-10-04/new-chat/flag_world_first_tick_001_v013';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),size:b.length,sha256:sha(b)};};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const check=r=>{const a=id(r.path);if(a.sha256!==r.sha256||a.size!==(r.size??r.bytes))throw Error('CUSTODY_NOT_SAME '+r.path);};
const write=(file,obj)=>fs.writeFileSync(file,JSON.stringify(obj,null,2)+'\n',{flag:'wx'});
const record=path.join(here,'RUN_RECORD_V1_REPEAT_AND_CONTINUATION_008.json');
const manifestPath=path.join(here,'CONTINUATION_008_BINDINGS.json');
const tools=['vector_build.mjs','lower_compact_large.mjs','prefill_guard_execute.mjs','readback.mjs','status.mjs','hash_batch.mjs','hash_delta.mjs','observe_rows.mjs','export_inventory.mjs','compare_vectors.mjs'];
const sources=['fixture_core_contacts.mal','program_core.mal','ingress_core.mal','vector_commit.mal','fold_acceleration.mal'];
const files=[...tools.map(x=>path.join(root,x)),...sources.map(x=>path.join(root,'source',x)),...['continue_vector_008.mjs','execute_stage_008.mjs','pipeline_v1_008.mjs','repeat_v1_008.mjs','iterative_collect_007/block_iterative_full.exe','iterative_collect_007/block_iterative_full.cu','telemetry.inc','qualification_iterative_full/QUALIFICATION.json','qualification_iterative_full/TELEMETRY_AUDIT.json','capacity_refusal_008/QUALIFICATION.json'].map(x=>path.join(here,x)),'C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs'];
const expected={V1:{input:'28093717ACC694FACC3B635701A22AFF37DDB09FB0447774BACC700647F262BE',expected:'69786966E9B5D66A2078D29C43E1F1511545786AB07BF562E37D91205085B588'},V2:{input:'DC46E239B9D693AF25DC3D7005718060230D31AC9CA057F7ECCCF73968AA2C8E',expected:'BD0492B4CAC427432CC3251EB27FC997C0D5EFF2862ECBC10A89B9AC19F1AD0F'}};
function frozen(){
 const spec=id(path.join(corpus,'SPEC_FLAG_WORLD_FIRST_TICK_001_v0.1.3_PROPOSED.mal'));
 if(spec.sha256!=='2ECF2EEF9A8901DA9C802922BEBE1F74C367D7A74E5B773528504B73854C1A01')throw Error('PROMOTED_SPEC_NOT_SAME');
 const vectors={};for(const [v,binding]of Object.entries(expected)){vectors[v]={};for(const [kind,h]of Object.entries(binding)){const r=id(path.join(corpus,v+'.'+kind+'.json'));if(r.sha256!==h)throw Error('FROZEN_VECTOR_NOT_SAME '+v+' '+kind);vectors[v][kind]=r;}}
 return {spec,vectors,scope:'Expected files observed only here and by final CONFORM; not execution inputs'};
}
const [mode,pidText]=process.argv.slice(2);
if(mode==='--prepare'){
 const capacity=id(path.join(here,'capacity_refusal_008/QUALIFICATION.json'));
 if(capacity.sha256!=='0BAD5646C5D071F11886A42EBF5A7341FF44EBFEB921C3BE5B227DD1F9D06938')throw Error('CAPACITY_WITNESS_NOT_SAME');
 write(manifestPath,{scope:'ISOLATED_V1_REPLAY_CONTINUATION_ONLY; SOURCE_LAWS_UNCHANGED',created_utc:new Date().toISOString(),members:files.map(id),frozen:frozen(),capacity_witness:capacity,other_vectors:'NOT_RUN'});
 console.log(JSON.stringify({action:'PIPELINE_BINDINGS_SEALED',manifest:id(manifestPath)}));
 process.exit(0);
}
if(mode!=='--run'||!/^\d+$/.test(pidText)||Number(pidText)<=0)throw Error('usage --prepare OR --run repeat-runner-pid');
const pid=Number(pidText),bound=read(manifestPath),boundID=id(manifestPath);
function verify(){check(boundID);for(const r of bound.members)check(r);frozen();}
verify();
if(fs.existsSync(record))throw Error('PRESERVE_EXISTING_PIPELINE_RESULT');
const started=new Date().toISOString();
write(path.join(here,'PIPELINE_008_START.json'),{started_utc:started,runner:id(fileURLToPath(import.meta.url)),manifest:boundID,replay_pid:pid,gate:'RAW_READBACK_BYTE_SAME_AND_COMPLETED_PROOF_AUDIT',capacity_witness:bound.capacity_witness,then:'EXISTING_SOURCE_DIRECTED_CONTINUATIONS; V1_COMMITTED_OUTPUT_COMPARISON',V2:'NOT_RUN'});
const emit=o=>console.log(JSON.stringify(o));
const alive=()=>{try{process.kill(pid,0);return true;}catch(e){if(e.code==='ESRCH')return false;throw e;}};
async function launch(script,args){verify();emit({action:'LAUNCH',script:id(script),arguments:args});await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['--max-old-space-size=8192',script,...args],{cwd:root,stdio:'inherit',windowsHide:true});child.once('error',reject);child.once('exit',(code,signal)=>code===0?resolve():reject(Error('CHILD_REFUSAL '+path.basename(script)+' '+(signal??code))));});}
let repeat=null,conform=null;
try{
 emit({action:'WAIT_FOR_EXACT_REPLAY',replay_pid:pid});
 while(alive())await new Promise(resolve=>setTimeout(resolve,30000));
 verify();
 if(fs.existsSync(path.join(first,'STOP.json')))throw Error('REPLAY_STOP '+read(path.join(first,'STOP.json')).reason);
 const execution=read(path.join(first,'EXECUTION.json'));repeat=read(path.join(first,'REPEATABILITY.json'));
 if(execution.exit_code!==0||execution.error!==null||repeat.comparison!=='SAME'||repeat.repeated.sha256!=='6C30E87F2DCA3325015D82F86482315134D93530D2A0C4517A76FC3D6DB09849')throw Error('REPEAT_NOT_SAME_OR_NOT_COMPLETED');
 check(repeat.baseline);check(repeat.repeated);
 const guard=read(path.join(first,'PREFILL_EXECUTION_GUARD.json')),status=read(path.join(first,'STATUS.json'));
 if(guard.guard!=='IF_THEN'||guard.resumed_sha256!==repeat.repeated.sha256||guard.next_image_sha256!==status.image_sha256||status.error!==0||status.readback_sha256!==repeat.repeated.sha256)throw Error('REPEAT_AUDIT_NOT_SAME');
 emit({action:'REPEAT_GATE_SAME',readback:repeat.repeated,then:'SOURCE_CONTINUATION'});
 await launch(path.join(here,'continue_vector_008.mjs'),['V1','--start-stage','1']);
 const committedPath=path.join(work,'SOURCE_COMMITTED.json');
 if(!fs.existsSync(committedPath))throw Error('SOURCE_CONTINUATION_PENDING '+JSON.stringify(read(path.join(work,'CONTINUATION_PENDING.json'))));
 const committed=read(committedPath),manifest={scope:'V1_COMMITTED_OUTPUT_ONLY; V2_NOT_RUN',vectors:Object.entries(expected).map(([v,h])=>({id:v,input:path.join(corpus,v+'.input.json'),expected:path.join(corpus,v+'.expected.json'),input_sha256:h.input,expected_sha256:h.expected,...(v==='V1'?{run_dir:committed.run_dir}:{})}))};
 const comparisonManifest=path.join(work,'CONFORM_MANIFEST.json'),out=path.join(work,'conform');write(comparisonManifest,manifest);
 try{await launch(path.join(root,'compare_vectors.mjs'),[comparisonManifest,out]);}finally{if(fs.existsSync(path.join(out,'CONFORM.json')))conform=read(path.join(out,'CONFORM.json'));}
 const v1=conform?.vectors?.find(x=>x.id==='V1');
 if(v1?.execution!=='EXECUTED'||v1.comparison!=='SAME')throw Error('V1_NOT_SAME_OR_NOT_EXECUTED');
 verify();
 write(record,{scope:'EXACT_REPLAY_THEN_V1_SOURCE_CONTINUATION_AND_BYTE_CONFORM',started_utc:started,ended_utc:new Date().toISOString(),bindings:boundID,repeat,capacity:bound.capacity_witness,committed,conform_record:id(path.join(out,'CONFORM.json')),V1:{execution:v1.execution,comparison:v1.comparison,verdict:'IF_THEN',actual:v1.actual,expected:v1.expected},full_V1_V2_verdict:conform.verdict,V2:'NOT_RUN',promotion:'NONE',repository_commit:'NONE'});
 emit({action:'V1_CONFORM_SAME',record:id(record),V2:'NOT_RUN',full_V1_V2_verdict:conform.verdict});
}catch(e){
 const v1=conform?.vectors?.find(x=>x.id==='V1');
 write(record,{scope:'EXACT_REPLAY_THEN_V1; STOPPED_WITH_EVIDENCE_PRESERVED',started_utc:started,ended_utc:new Date().toISOString(),bindings:boundID,repeat,capacity:bound.capacity_witness,reason:e.message,V1:v1?{execution:v1.execution,comparison:v1.comparison,verdict:v1.comparison==='NOT_SAME'?'NO':'MAYBE'}:{execution:'NOT_RUN_TO_CONFORM',comparison:'MAYBE',verdict:'MAYBE'},conform,V2:'NOT_RUN',continuation:'STOPPED',promotion:'NONE',repository_commit:'NONE'});
 emit({action:'PIPELINE_STOP',reason:e.message,record:id(record)});process.exitCode=2;
}
