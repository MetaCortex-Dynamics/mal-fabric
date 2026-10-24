// Replay orchestration only. All world operations remain in the sealed sources.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const kit=path.dirname(fileURLToPath(import.meta.url));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {sha256:sha(b),bytes:b.length};};
const contractHash='1EF8D4623D92365FC9038DC42B774BA6BC73ADD7C31B2E659A01EC4070F74361';
const cp=path.join(kit,'FOLLOWON_CONTRACT.json');
if(id(cp).sha256!==contractHash)throw Error('NOT_SAME follow-on contract');
const c=JSON.parse(fs.readFileSync(cp));
const options={};
for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i];if(!['--target','--output','--genesis','--nvcc','--vcvars'].includes(k)||!process.argv[i+1])throw Error('target V1|V2|j17, fresh output, optional generated genesis directory and toolchain paths');options[k.slice(2)]=process.argv[i+1];}
if(!c.targets[options.target]||!options.output)throw Error('Explicit target and output required');
const out=path.resolve(options.output);
if(out===kit||out.startsWith(kit+path.sep)||fs.existsSync(out))throw Error('Fresh output outside kit required');
fs.mkdirSync(out,{recursive:true});
const report={schema:'FOLLOWON_REPLAY_RECEIPT_V1',target:options.target,scope:c.targets[options.target].scope,contract_sha256:contractHash,runner:id(fileURLToPath(import.meta.url)),started:new Date().toISOString(),commands:[],comparisons:[],execution:'NOT_RUN',verdict:'MAYBE'};
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
function check(p,h,label){const actual=id(p),comparison=actual.sha256===h?'SAME':'NOT_SAME';report.comparisons.push({label,actual,expected_sha256:h,comparison});if(comparison!=='SAME')throw Error('NOT_SAME '+label);return p;}
function bound(p){const f=c.files.find(f=>f.path===p);if(!f)throw Error('Unbound member '+p);const full=path.resolve(kit,p);if(!full.startsWith(kit+path.sep))throw Error('Outside kit');return check(full,f.sha256,p);}
function command(exe,args,label){console.log(JSON.stringify({launch:label}));const p=spawnSync(exe,args,{cwd:out,encoding:'utf8',windowsHide:true,maxBuffer:256*1024*1024});fs.writeFileSync(path.join(out,label+'.stdout.log'),p.stdout??'',{flag:'wx'});fs.writeFileSync(path.join(out,label+'.stderr.log'),p.stderr??'',{flag:'wx'});report.commands.push({label,exe,args,exit:p.status,error:p.error?.message??null});if(p.error||p.status!==0)throw Error('COMMAND_REFUSED '+label+': '+(p.error?.message??p.stderr?.slice(-2000)));}
const node=(tool,args,label)=>command(process.execPath,[bound('followon/tools/'+tool),...args],label);
function build(){const nvcc=options.nvcc??'C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v13.2/bin/nvcc.exe',vcvars=options.vcvars??'C:/Program Files (x86)/Microsoft Visual Studio/2022/BuildTools/VC/Auxiliary/Build/vcvars64.bat';
 command(nvcc,['--version'],'nvcc-version');command('nvidia-smi',['--query-gpu=name,uuid,driver_version,memory.total','--format=csv,noheader'],'device');
 const source=bound('followon/tools/'+(options.target==='j17'?'j17':'vector')+'.cu'),exe=path.join(out,'evaluator.exe');
 const quote=s=>{if(/["%\r\n]/.test(s))throw Error('Unsupported build path');return '"'+s+'"';};
 const batch=path.join(out,'build.cmd');fs.writeFileSync(batch,'@echo off\r\ncall '+quote(vcvars)+'\r\nif errorlevel 1 exit /b %errorlevel%\r\n'+[nvcc,'-std=c++17','-arch=sm_86','-O2','-o',exe,source].map(quote).join(' ')+'\r\nexit /b %errorlevel%\r\n',{flag:'wx'});
 command(process.env.ComSpec??'cmd.exe',['/d','/c',batch],'build');report.binary=id(exe);return exe;
}
try{
 for(const f of c.files)bound(f.path);
 check(path.join(kit,'followon/tools/telemetry.inc'),'E7033E77BB0F27343AF16277536D7441D26775A2475745BF890B5C7F59ECE81D','telemetry include; exact runtime_021 and vector include');
 // Genesis is generated here by default. Reuse accepts only a full matching replay receipt.
 const genesis=options.genesis?path.resolve(options.genesis):path.join(out,'genesis');
 const runner=path.join(kit,'replay.mjs');check(runner,'B2B67AC4AA308EF87F6D73F2A2C0CF09848D6620D1A01217A2B6B605B8D84A57','genesis runner');
 if(!options.genesis)command(process.execPath,[runner,'--target','genesis','--output',genesis,...['nvcc','vcvars'].flatMap(k=>options[k]?['--'+k,options[k]]:[])],'genesis');
 const receipt=JSON.parse(fs.readFileSync(path.join(genesis,'REPLAY_RECEIPT.json')));
 if(receipt.target!=='genesis'||receipt.execution!=='EXECUTED'||receipt.verdict!=='IF_THEN'||receipt.runner.sha256!==id(runner).sha256)throw Error('Genesis replay receipt required');
 report.predecessor_replay=id(path.join(genesis,'REPLAY_RECEIPT.json'));
 check(path.join(genesis,'committed.genesis.json'),'FDA614876C99126FCE2AFE6AC8E42A77863880485E02D4B4EDA4AA817446BD2C','committed predecessor');
 const aliases={frame:path.join(genesis,'frame.json'),capture:path.join(kit,'inputs/capture.json'),field:path.join(genesis,'current.field.json'),witness:path.join(genesis,'current.witness.json'),hashes:path.join(genesis,'hashes0/responses.json'),links:path.join(genesis,'hashes1/responses.json')};
 const empty=bound('followon/inputs/empty-array.json'),exe=build();let previous=null,previousHashes=empty;
 const j17=options.target==='j17';
 function lower(source,dir,bindings){node('lower.mjs',[bound(source),dir,'-',...Object.entries(bindings).map(([k,v])=>k+'='+v)],'lower-'+path.basename(dir));}
 function execute(dir,capacity){report.execution='EXECUTING';if(previous){const args=['--previous-map',path.join(previous,'source-map.json'),'--previous-image',path.join(previous,'image.bin'),'--previous-readback',path.join(previous,'readback.bin'),'--next-map',path.join(dir,'source-map.json'),'--next-image',path.join(dir,'image.bin'),'--exe',exe,'--output',path.join(dir,'readback.bin'),'--report',path.join(dir,'CONTINUATION_CUSTODY.json'),'--run'];if(j17)args.push('--fact-capacity',String(capacity));node(j17?'prefill_guard_runtime.mjs':'prefill_guard_execute.mjs',args,'gpu-'+path.basename(dir));}else command(exe,[path.join(dir,'image.bin'),path.join(dir,'readback.bin'),...(j17?['--fact-capacity',String(capacity)]:[])],'gpu-'+path.basename(dir));}
 if(!j17){aliases.vector=bound(c.targets[options.target].input);aliases.observer_pairs=empty;aliases.hash_batch=empty;const dir=path.join(out,'carrier');lower(c.carrier.source,dir,{});check(path.join(dir,'image.bin'),c.carrier.image_sha256,'carrier image');execute(dir);check(path.join(dir,'readback.bin'),c.carrier.readback_sha256,'carrier prefill closure');previous=dir;}
 for(const s of c.targets[options.target].stages){
  const dir=path.join(out,s.id);
  if(j17&&s.id==='j17_step_023-stage02'){const inv=path.join(out,'inventory');node('j17_inventory.mjs',[previous,inv],'inventory');check(path.join(inv,'inventory.mal'),id(bound('followon/contracts/j17-inventory.mal')).sha256,'source-generated inventory');}
  for(const alias of Object.keys(s.inputs))if(!aliases[alias]){
   if(alias==='hash_batch'||alias==='receipt_inventory')aliases[alias]=empty;
   else if(/^svc\d+$/.test(alias)){const dest=path.join(out,alias);node('j17_services.mjs',[previous,dest,alias],'service-'+alias);aliases[alias]=path.join(dest,'responses.json');}
   else if(/^vh\d+$/.test(alias))aliases[alias]=path.join(previous,'hash/delta.json');
   else if(/^vp\d+$/.test(alias)){const dest=path.join(out,alias+'.json');node('observe_rows.mjs',[previous,'VO_PAIRS',dest,'--sort=full-row'],'observe-'+alias);aliases[alias]=dest;}
   else if(/^vr\d+$/.test(alias)){const dest=path.join(out,alias+'.json');node('observe_rows.mjs',[previous,'I20_RECEIPTS',dest],'observe-'+alias);aliases[alias]=dest;}
   else if(alias==='program_inventory'){const dest=path.join(out,'inventory');node('export_inventory.mjs',[previous,dest,'--occurrences=VO_COMPARATOR','--flags=VO_FLAG_JSON'],'inventory');aliases[alias]=path.join(dest,'program_inventory.json');if(!s.generated_member)throw Error('Generated source binding missing');check(path.join(dest,'cell_hashes.mal'),s.generated_member.sha256,'generated cell hash source');}
   else throw Error('Unimplemented source input '+alias);
  }
  const inputs={};for(const [a,b]of Object.entries(s.inputs)){inputs[a]=check(aliases[a],b.sha256,s.id+' input '+a);}
  lower(s.source,dir,inputs);check(path.join(dir,'image.bin'),s.image_sha256,s.id+' image');execute(dir,s.capacity);check(path.join(dir,'readback.bin'),s.readback_sha256,s.id+' full readback');
  if(!j17){const dest=path.join(dir,'hash');node('hash_batch.mjs',[dir,dest,previousHashes],'hash-'+s.id);node('hash_delta.mjs',[path.join(dest,'responses.json'),previousHashes,path.join(dest,'delta.json')],'delta-'+s.id);previousHashes=path.join(dest,'responses.json');}
  previous=dir;
 }
 const {openReadback}=await import('./followon/tools/readback.mjs'),r=openReadback(previous);
 const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
 function extract(tag,index,file,expected){const rows=r.predicate(tag);if(rows.length!==1)throw Error('NOT_SAME singleton '+tag);const value=r.value(r.node(rows[0].term).c[index]);const p=path.join(out,file);fs.writeFileSync(p,JSON.stringify(canonical(value)),{flag:'wx'});check(p,id(bound(expected)).sha256,'complete '+file);return value;}
 if(j17){extract('J23_PROGRAM_OBJECT',2,'program.json','followon/expected/j17/program.json');extract('S23_SUCCESSOR_JSON',4,'fabric.successor.json','followon/expected/j17/fabric.successor.json');extract('C23_COMMITTED_OBJECT',4,'committed.world.json','followon/expected/j17/committed.world.json');}
 else extract('COMMITTED_VECTOR_OUTPUT',1,options.target+'.actual.json',c.targets[options.target].expected);
 report.execution='EXECUTED';report.verdict='IF_THEN';
}catch(e){report.error=e.stack;report.verdict=e.message.includes('NOT_SAME')?'NOT_SAME':'MAYBE';process.exitCode=2;}
report.ended=new Date().toISOString();write(path.join(out,'REPLAY_RECEIPT.json'),report);console.log(JSON.stringify({target:options.target,execution:report.execution,verdict:report.verdict,error:report.error??null,receipt:path.join(out,'REPLAY_RECEIPT.json')}));
