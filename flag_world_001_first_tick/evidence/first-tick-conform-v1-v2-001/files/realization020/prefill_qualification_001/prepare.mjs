// CPU-only preparation; no GPU executable is invoked here.
// Only checked capacity/stack constants change in the runtime clone.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {sha,identity,capacities,packImage,packState} from './pack.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),parent=path.dirname(here);
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
const carrier=path.join(parent,'ref012_indexed_qualification/gpu');
const runtime=path.join(parent,'law_application_resume_vector_disjoint.cu');
const runtimeHash='3BC29A3542A5032F657D7C185E234764DD299D67EEE75C36E03E5DBCAAE8BE4C';
const checkpoint=path.join(carrier,'readback.bin');
if(identity(runtime).sha256!==runtimeHash||identity(checkpoint).sha256!=='ECED361A61D4D9FA514DE0E6E2EE3ECFFC975F2BFE4C68D960DEED2E3BE08D8B')throw Error('BOUND_PARENT_NOT_SAME');
function transform(file,target,changes){
 const old=fs.readFileSync(file),source=old.toString('utf8');let next=source;
 for(const [from,to] of changes){if(next.split(from).length!==2)throw Error('TRANSFORM_NOT_UNIQUE');next=next.replace(from,to);}
 // Undoing exactly these substitutions must reproduce every original byte.
 let inverse=next;for(const [from,to] of [...changes].reverse()){if(inverse.split(to).length!==2)throw Error('INVERSE_NOT_UNIQUE');inverse=inverse.replace(to,from);}
 if(!Buffer.from(inverse).equals(old))throw Error('UNLISTED_TRANSFORM');write(target,next);
 return {parent:identity(file),child:identity(target),changes:changes.map(([from,to])=>({from,to})),all_other_bytes:'SAME'};
}
const runtimeTransform=transform(runtime,path.join(here,'prefill_small.cu'),[
 ['constexpr int NP=1048576, NS=2048, NR=1024, NT=4194304, NF=2097152;','constexpr int NP=65536, NS=2048, NR=1024, NT=32768, NF=16384;'],
 ['cudaDeviceSetLimit(cudaLimitStackSize,65536)','cudaDeviceSetLimit(cudaLimitStackSize,8192)'],
 ['static_assert((2ull*PAIR_BUCKETS+1ull*NF*PAIR_SLOTS)*sizeof(int)==232ull*1024*1024);','static_assert((2ull*PAIR_BUCKETS+1ull*NF*PAIR_SLOTS)*sizeof(int)==10223616ull);']
]);
// The assertion changes only to account for requested NF; no matcher function changes.
// Parent-owned generic guard already admits this bounded capacity profile.
const guardPath=path.join(parent,'prefill_guard.mjs');
const originalGuard=execFileSync(process.execPath,[path.join(parent,'resume_guard_vector.mjs'),'--previous-map',path.join(carrier,'source-map.json'),'--previous-image',path.join(carrier,'image.bin'),'--previous-readback',checkpoint,'--next-map',path.join(carrier,'source-map.json'),'--next-image',path.join(carrier,'image.bin')],{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024});
const carrierImage=packImage(carrier,path.join(here,'carrier'));
const carrierState=packState(checkpoint,path.join(here,'carrier/readback.bin'));
const append=fs.readFileSync(path.join(here,'continuation.mal')),carrierSource=fs.readFileSync(path.join(carrier,'source.mal'));
const assembled=Buffer.concat([carrierSource,Buffer.from('\n'),append]);
const cases=[];
for(const reading of ['THIS','NO']){
 const stem=reading.toLowerCase(),sourcePath=path.join(here,stem+'.mal'),inputPath=path.join(here,stem+'.input.json');
 write(sourcePath,assembled);write(inputPath,JSON.stringify({reading}));
 const lowered=path.join(here,stem+'_lowered');
 const stdout=execFileSync(process.execPath,[path.join(parent,'lower_compact_large.mjs'),sourcePath,lowered,'-','qualification='+inputPath],{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
 const image=packImage(lowered,path.join(here,stem));
 const guard=execFileSync(process.execPath,[guardPath,'--previous-map',path.join(here,'carrier/source-map.json'),'--previous-image',path.join(here,'carrier/image.bin'),'--previous-readback',path.join(here,'carrier/readback.bin'),'--next-map',path.join(here,stem,'source-map.json'),'--next-image',path.join(here,stem,'image.bin')],{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024});
 cases.push({reading,source:identity(sourcePath),input:identity(inputPath),image,lowerer_stdout:JSON.parse(stdout),proof_guard:JSON.parse(guard)});
}
const {NP,NS,NR,NT,NF}=capacities,PAIR_BUCKETS=1048576,PAIR_SLOTS=28;
const imageBytes=16+NP*40+NS*4+NR*40,stateBytes=16+NT*40+NF*48;
const indexInts=4096+NF+4096+NF+32768+NT+NT+65536+65536+NF*8+NP+NP+NP+PAIR_BUCKETS+PAIR_BUCKETS+NF*PAIR_SLOTS+NR;
const indexBytes=indexInts*4;
const report={scope:'CPU_ONLY_GENERIC_RETAINED_PROOF_QUALIFICATION_PREPARATION; NOT_CONFORM; NO_WORLD_LAW; GPU_NOT_RUN',capacities,runtimeTransform,original_carrier_guard:JSON.parse(originalGuard),carrierImage,carrierState,cases,source_members:{carrier:identity(path.join(carrier,'source.mal')),fixture:identity(path.join(here,'continuation.mal')),separator_hex:'0A'},static_device_allocations:{image:imageBytes,state:stateBytes,index:indexBytes,total:imageBytes+stateBytes+indexBytes,progress_mapped_bytes:32,stack_bytes_per_thread:8192,stack_context_driver_allocations:'SEPARATE; must measure before launch; no sub-1GiB assertion'},tools:{prepare:identity(fileURLToPath(import.meta.url)),pack:identity(path.join(here,'pack.mjs')),guard:identity(guardPath),lowerer:identity(path.join(parent,'lower_compact_large.mjs')),build:identity(path.join(here,'build.cmd'))}};
write(path.join(here,'PREPARATION.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({scope:report.scope,static_device_bytes:report.static_device_allocations.total,runtime:runtimeTransform.child,checkpoint:carrierState.to,cases:cases.map(c=>({reading:c.reading,guard:c.proof_guard.guard,image:c.image.to}))},null,2));
