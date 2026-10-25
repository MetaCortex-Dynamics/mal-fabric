// Independent read-only observation of the specified diagnostic family.
// NEVER an input, verdict provider, or candidate producer for the GPU realization.
// Builds fibres directly from the committed incidence triples and checks all
// 720 overlaps. The native implementation instead owns its inventory and proofs.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const worldPath=path.resolve(here,'../j17_step_023/outputs/committed.world.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const bytes=fs.readFileSync(worldPath),world=JSON.parse(bytes);
if(sha(bytes)!=='E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059')throw Error('WORLD_NOT_SAME');
const key=JSON.stringify,flags=world.field.map(x=>x[0]);
const index=new Map(flags.map((f,i)=>[key(f),i]));
const overlaps=world.witness.map(([a,b])=>[index.get(key(a)),index.get(key(b))]);
if(flags.length!==480||overlaps.length!==720||overlaps.some(p=>p.some(x=>x===undefined)))throw Error('INCIDENCE_COVERAGE');
const projections=[['SITE',[0]],['EDGE',[1]],['TRIAD',[2]],['SITE_EDGE',[0,1]],['SITE_TRIAD',[0,2]],['EDGE_TRIAD',[1,2]]];
const offers=[];
for(const[kind,positions]of projections){
 const fibres=new Map();
 flags.forEach((f,i)=>{const coordinates=positions.map(p=>f[p]),k=key(coordinates);if(!fibres.has(k))fibres.set(k,{coordinates,indices:[]});fibres.get(k).indices.push(i);});
 for(const[k,v]of [...fibres].sort((a,b)=>a[0].localeCompare(b[0],'en'))){
  for(const reading of ['NO','THIS'])offers.push({kind,coordinates:v.coordinates,reading,flag_indices:v.indices});
 }
}
if(offers.length!==1924)throw Error('OFFER_COVERAGE');
const edges=[...new Map(flags.map(f=>[key(f[1]),f[1]])).entries()].sort((a,b)=>a[0].localeCompare(b[0],'en')).map(x=>x[1]);
if(edges.length!==120)throw Error('EDGE_COVERAGE');
const memberships=offers.map(o=>{const set=new Uint8Array(480);o.flag_indices.forEach(i=>set[i]=1);return set;});
function observe(field){
 const old=overlaps.map(([a,b])=>field[a]!==field[b]);
 const rows=[],strict=[],histogram=new Map();
 for(let n=0;n<offers.length;n++){
  const o=offers[n],inside=memberships[n],reading=o.reading==='THIS';
  const discharged=[],opened=[],retained=[];
  for(let j=0;j<overlaps.length;j++){
   const[a,b]=overlaps[j],next=(inside[a]?reading:field[a])!==(inside[b]?reading:field[b]);
   if(old[j]&&!next)discharged.push(j);if(!old[j]&&next)opened.push(j);if(old[j]&&next)retained.push(j);
  }
  if(discharged.length&&opened.length===0)strict.push(n);
  const h=key([discharged.length,opened.length,retained.length]);histogram.set(h,(histogram.get(h)||0)+1);
  rows.push([n,discharged,opened,retained]);
 }
 return {walls:old.flatMap((w,i)=>w?[i]:[]),strict_offer_indices:strict,receipt_rows_sha256:sha(Buffer.from(key(rows)+'\n')),receipt_count_histogram:[...histogram].sort((a,b)=>a[0].localeCompare(b[0],'en')).map(([k,count])=>({counts:JSON.parse(k),offers:count}))};
}
const inputResults=edges.map((sites,i)=>{const siteSet=new Set(sites);return {id:i,sites,...observe(flags.map(f=>siteSet.has(f[0])))};});
const qualification=observe(world.field.map(x=>x[1]==='THIS'));
const report={schema:'IndependentR1DiagnosticObservation019',scope:'OBSERVER_ONLY; NEVER_GPU_INPUT; NOT_A_NATIVE_RUN_RECORD',world:{path:worldPath,bytes:bytes.length,sha256:sha(bytes)},observer:{path:fileURLToPath(import.meta.url),sha256:sha(fs.readFileSync(fileURLToPath(import.meta.url)))},offers,overlap_index_subject:'Exact committed.world.json witness array order, zero based',receipt_digest_encoding:'UTF8 JSON.stringify of [offer_index,discharged_indices,opened_indices,retained_indices] rows in offers order plus LF',qualification_g2:qualification,inputs:inputResults};
const target=path.join(here,'R1_INDEPENDENT_OBSERVATION.json');
fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({record:target,sha256:sha(fs.readFileSync(target)),input_count:inputResults.length,offers:offers.length,qualification_strict:qualification.strict_offer_indices.length,strict_count_histogram:inputResults.reduce((h,r)=>(h[r.strict_offer_indices.length]=(h[r.strict_offer_indices.length]||0)+1,h),{})}));
