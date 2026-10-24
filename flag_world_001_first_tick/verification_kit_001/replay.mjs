// Replay orchestration and byte comparisons only. World operations remain in sealed .mal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const kit=path.dirname(fileURLToPath(import.meta.url));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=p=>{const b=fs.readFileSync(p);return {sha256:sha(b),bytes:b.length};};
const contractPath=path.join(kit,'GENESIS_CONTRACT.json');
const contractHash='05737EE72CE36790AC01C96DF7F316A54282317E345E446315F8AA8EA5BBAB67';
if(identity(contractPath).sha256!==contractHash)throw Error('NOT_SAME contract');
const contract=JSON.parse(fs.readFileSync(contractPath));
const opt={target:'genesis'};
for(let i=2;i<process.argv.length;i+=2){const key=process.argv[i];if(!['--target','--output','--nvcc','--vcvars'].includes(key)||!process.argv[i+1])throw Error('Usage: node replay.mjs --target genesis|audit --output FRESH_DIRECTORY [--nvcc PATH] [--vcvars PATH]');opt[key.slice(2)]=process.argv[i+1];}
if(!['genesis','audit'].includes(opt.target)||!opt.output)throw Error('Explicit fresh output and supported target required');
const out=path.resolve(opt.output);
if(out===kit||out.startsWith(kit+path.sep)||fs.existsSync(out))throw Error('Output must be fresh, outside the immutable kit');
fs.mkdirSync(out,{recursive:true});
const report={schema:'PUBLIC_REPLAY_RECEIPT_V1',target:opt.target,started:new Date().toISOString(),contract_sha256:contractHash,runner:identity(fileURLToPath(import.meta.url)),host:{platform:process.platform,arch:process.arch,release:os.release(),node:process.version},commands:[],comparisons:[],negative_controls:[],execution:'NOT_RUN',verdict:'MAYBE',independent_builder:'NOT_ESTABLISHED',other_backends:'NOT_RUN'};
const put=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const note=v=>console.log(JSON.stringify(v));
function bound(relative){const e=contract.files.find(x=>x.path===relative);if(!e)throw Error('Unbound kit member '+relative);const p=path.resolve(kit,relative);if(!p.startsWith(kit+path.sep))throw Error('Outside kit');const n=identity(p);if(n.sha256!==e.sha256||n.bytes!==e.bytes)throw Error('NOT_SAME '+relative);return p;}
function command(exe,args,label,allowFailure=false){
 const at=new Date().toISOString();note({launch:label});
 const p=spawnSync(exe,args,{cwd:out,encoding:'utf8',windowsHide:true,maxBuffer:64*1024*1024});
 const rec={label,exe,args,started:at,ended:new Date().toISOString(),exit:p.status,signal:p.signal,error:p.error?.message??null};
 fs.writeFileSync(path.join(out,label+'.stdout.log'),p.stdout??'',{flag:'wx'});fs.writeFileSync(path.join(out,label+'.stderr.log'),p.stderr??'',{flag:'wx'});report.commands.push(rec);
 if(!allowFailure&&(p.error||p.status!==0))throw Error('COMMAND_REFUSED '+label+' '+(p.error?.message??p.stderr??p.status));return p;
}
function node(tool,args,label){return command(process.execPath,[bound(tool),...args],label);}
function compare(actual,expected,label){const a=fs.readFileSync(actual),b=fs.readFileSync(bound(expected));const comparison=a.equals(b)?'SAME':'NOT_SAME';report.comparisons.push({label,actual:identity(actual),expected:identity(bound(expected)),comparison});note({label,comparison});if(comparison!=='SAME')throw Error('NOT_SAME '+label);}
function checkHash(file,expected,label){const h=identity(file);const comparison=h.sha256===expected?'SAME':'NOT_SAME';report.comparisons.push({label,...h,expected_sha256:expected,comparison});if(comparison!=='SAME')throw Error('NOT_SAME '+label);}
function negativeControls(){
 const capture=bound('inputs/captured-frame.bin'),bad=Buffer.from(fs.readFileSync(capture));bad[bad.length-1]^=1;
 const altered=path.join(out,'altered-frame.bin');fs.writeFileSync(altered,bad,{flag:'wx'});
 for(const [id,input,pattern] of [
  ['missing',path.join(out,'absent-frame.bin'),/ENOENT/],
  ['altered',altered,/NOT_SAME input binding/],
  ['displaced',bound('inputs/capture.json'),/NOT_SAME input binding/]
 ]){const dest=path.join(out,'negative-'+id+'.json');const p=command(process.execPath,[bound('tools/transport_slices.mjs'),input,contract.event_sha256,bound('tools/persistence_frame_layout.json'),dest],'negative-'+id,true);const verdict=p.status!==0&&pattern.test(p.stderr??'')&&!fs.existsSync(dest)?'IF_THEN':'NOT_SAME';report.negative_controls.push({id,scope:'Frozen capture identity/transport only; not a world-law negative',expected:'REFUSED_NO_FRAME',verdict});if(verdict!=='IF_THEN')throw Error('NOT_SAME negative '+id);}
}
function compile(){
 let nvcc=opt.nvcc;
 if(!nvcc&&process.platform==='win32'){const recorded='C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v13.2/bin/nvcc.exe';if(fs.existsSync(recorded))nvcc=recorded;}
 nvcc??=process.env.CUDA_PATH?path.join(process.env.CUDA_PATH,'bin',process.platform==='win32'?'nvcc.exe':'nvcc'):'nvcc';
 report.host.nvcc=command(nvcc,['--version'],'nvcc-version').stdout;
 report.host.device=command('nvidia-smi',['--query-gpu=name,uuid,driver_version,memory.total','--format=csv,noheader'],'device').stdout.trim();
 const jobs=[['narrow','vendor/original/law_application.cu'],['wide','vendor/gpu_self_witness_018/law_application_capacity_16384.cu'],['hash','vendor/hash/gpu_sha256.cu']];
 const executables={};
 for(const [name,source] of jobs){const exe=path.join(out,name+(process.platform==='win32'?'.exe':''));const args=['-std=c++17','-arch=sm_86','-O2','-o',exe,bound(source)];
  if(process.platform==='win32'){
   const vcvars=opt.vcvars??'C:/Program Files (x86)/Microsoft Visual Studio/2022/BuildTools/VC/Auxiliary/Build/vcvars64.bat';
   if(!fs.existsSync(vcvars))throw Error('BUILD_INPUT_MISSING: supply --vcvars for the installed MSVC toolchain');
   const quote=s=>{if(/["%\r\n]/.test(s))throw Error('Unsupported build path');return '"'+s+'"';};
   const batch=path.join(out,'build-'+name+'.cmd');
   fs.writeFileSync(batch,'@echo off\r\ncall '+quote(vcvars)+'\r\nif errorlevel 1 exit /b %errorlevel%\r\n'+[nvcc,...args].map(quote).join(' ')+'\r\nexit /b %errorlevel%\r\n',{flag:'wx'});
   command(process.env.ComSpec??'cmd.exe',['/d','/c',batch],'build-'+name);
  }else command(nvcc,args,'build-'+name);
  executables[name]=exe;report.commands.at(-1).binary=identity(exe);report.commands.at(-1).source=identity(bound(source));
 }
 return executables;
}
try{
 for(const e of contract.files)bound(e.path);
 report.custody='SAME';negativeControls();
 if(opt.target==='genesis'){
  const executables=compile();
  const frame=path.join(out,'frame.json');
  node('tools/transport_slices.mjs',[bound('inputs/captured-frame.bin'),contract.event_sha256,bound('tools/persistence_frame_layout.json'),frame],'frame');compare(frame,'inputs/frame.json','captured-frame-to-header');
  const generated={frame,capture:bound('inputs/capture.json')};
  function stage(id,source,wide,aliases){
   const dir=path.join(out,id),lower=wide?'vendor/gpu_self_witness_018/lower_capacity_16384.mjs':'vendor/original/lower.mjs';
   node(lower,[bound(source),dir,'-',...Object.entries(aliases).map(([k,v])=>k+'='+v)],'lower-'+id);
   const expected=contract.stages.find(s=>s.id===id);checkHash(path.join(dir,'image.bin'),expected.image_sha256,id+' image');
   report.execution='EXECUTING';command(executables[wide?'wide':'narrow'],[path.join(dir,'image.bin'),path.join(dir,'readback.bin')],'gpu-'+id);
   checkHash(path.join(dir,'readback.bin'),expected.readback_sha256,id+' complete readback');return dir;
  }
  const genesis=stage('genesis_gpu','sources/genesis_run.mal',false,generated);
  for(const [tag,file] of [['CURRENT_FIELD','current.field.json'],['CURRENT_WITNESS','current.witness.json'],['CURRENT_RECEIPT','current.receipt.json'],['GROUND_0_012','Ground0.field.json']]){
   const dest=path.join(out,file);node('vendor/original/extract_json_rows.mjs',[genesis,'THIS','OBSERVATION_ROW',tag,dest],'observe-'+tag);compare(dest,'expected/genesis/'+file,tag);
  }
  generated.field=path.join(out,'current.field.json');generated.witness=path.join(out,'current.witness.json');
  const empty=bound('inputs/empty-object.json');
  const first=stage('commit0_gpu','sources/commit_run_v2.mal',false,{...generated,ground:path.join(out,'Ground0.field.json'),hashes:empty,links:empty});
  const hash0=path.join(out,'hashes0');node('vendor/original/hash_requested_values.mjs',[first,hash0,executables.hash],'hashes0');compare(path.join(hash0,'responses.json'),'expected/genesis/hashes0.json','first hash responses');
  generated.hashes=path.join(hash0,'responses.json');
  const second=stage('commit1_gpu','sources/commit_run_v3.mal',true,{...generated,links:empty});
  const hash1=path.join(out,'hashes1');node('vendor/original/hash_requested_values.mjs',[second,hash1,executables.hash],'hashes1');compare(path.join(hash1,'responses.json'),'expected/genesis/hashes1.json','chain hash responses');
  const final=stage('commit2_gpu','sources/commit_run_v3.mal',true,{...generated,links:path.join(hash1,'responses.json')});
  const committed=path.join(out,'committed.genesis.json');node('vendor/original/extract_json_value.mjs',[final,'THIS','COMMITTED_GENESIS',committed],'committed');compare(committed,'expected/genesis/committed.genesis.json','complete committed genesis');
  report.execution='EXECUTED';report.verdict='IF_THEN';
 }else {report.verdict='IF_THEN';report.scope='INPUT_CUSTODY_AND_TRANSPORT_NEGATIVES_ONLY; GPU_NOT_RUN';}
}catch(e){report.error=e.message;report.verdict=e.message.includes('NOT_SAME')?'NOT_SAME':'MAYBE';process.exitCode=2;}
report.ended=new Date().toISOString();put(path.join(out,'REPLAY_RECEIPT.json'),report);note({target:report.target,execution:report.execution,verdict:report.verdict,error:report.error??null,receipt:path.join(out,'REPLAY_RECEIPT.json')});
