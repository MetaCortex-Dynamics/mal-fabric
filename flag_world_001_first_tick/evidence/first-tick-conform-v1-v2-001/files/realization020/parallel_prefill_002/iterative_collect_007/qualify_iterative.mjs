// CPU-only DFS binding/support restoration oracle. Not CONFORM or world law.
// Index selection and collision filtering are supplied identically to both paths;
// this check isolates the recursive-to-explicit traversal/storage replacement.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
let random=0x47C011EC,cases=0,overflows=0;const modes=new Set();
const rand=n=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random%n;};
const variable=i=>-i-1;
function match(p,f,b){if(p.tag!==f.tag||p.args.length!==f.args.length)return false;for(let j=0;j<p.args.length;j++){const q=p.args[j],x=f.args[j];if(q>=0){if(q!==x)return false;}else{const v=-q-1;if(b[v]<0)b[v]=x;else if(b[v]!==x)return false;}}return true;}
function run(body,facts,pivot,pivotFact,delta,cap,iterative,mask){
 const limit=facts.length,split=Math.min(limit,Math.floor(limit/2));
 const order=[...Array.from({length:limit-split},(_,i)=>split+i),...Array.from({length:split},(_,i)=>i)];
 const support=Array(8).fill(-1),root=Array(16).fill(-1),records=[];let count=0;
 if(!match(body[pivot],facts[pivotFact],root))return {count,records};support[pivot]=pivotFact;
 function candidates(slot,b){
  const p=body[slot],values=p.args.map(q=>q>=0?q:b[-q-1]);
  const known=values.map((v,i)=>v>=0?i:-1).filter(i=>i>=0);
  let mode=known.length===values.length?'SINGLE':known.length>=2?'PAIR':known.length?'ARGUMENT':'PREDICATE';modes.add(mode);
  if(mode==='SINGLE')return facts.map((f,i)=>({f,i})).filter(({f,i})=>i<limit&&!(slot<pivot&&i>=delta)&&f.tag===p.tag&&f.args.length===values.length&&f.args.every((x,j)=>x===values[j])).map(x=>x.i);
  // Intentional collisions keep rejected candidates in visitation order.
  const hash=xs=>xs.reduce((h,x)=>(Math.imul(h,16777619)^x)>>>0,0)&mask;
  const selected=known.slice(0,mode==='PAIR'?2:mode==='ARGUMENT'?1:0),target=hash([p.tag,...selected.map(i=>values[i])]);
  return order.filter(i=>!(slot<pivot&&i>=delta)&&hash([facts[i].tag,...selected.map(j=>facts[i].args[j]??-1)])===target);
 }
 function emit(b){if(count<cap)records.push({bindings:b.slice(),support:support.slice(0,body.length)});count++;}
 if(!iterative){
  function collect(ai,b){if(count>cap)return;if(ai===body.length){emit(b);return;}const slot=ai<=pivot?ai-1:ai;for(const i of candidates(slot,b)){if(count>cap)break;const next=b.slice();if(match(body[slot],facts[i],next)){support[slot]=i;collect(ai+1,next);}}}
  collect(1,root);
 }else{
  const frames=Array.from({length:9},()=>({b:Array(16).fill(-1),entered:false}));frames[0].b=root.slice();let depth=0;
  while(depth>=0&&count<=cap){const f=frames[depth],ai=1+depth;if(ai===body.length){emit(f.b);depth--;continue;}
   if(!f.entered){f.entered=true;f.slot=ai<=pivot?ai-1:ai;f.order=candidates(f.slot,f.b);f.cursor=0;}
   if(f.cursor===f.order.length){depth--;continue;}const i=f.order[f.cursor++],child=frames[depth+1];child.b=f.b.slice();
   if(match(body[f.slot],facts[i],child.b)){support[f.slot]=i;child.entered=false;depth++;}
  }
 }
 return {count,records};
}
function check(body,raw,mask){
 const facts=[...new Map(raw.map(f=>[JSON.stringify(f),f])).values()];
 for(let pivot=0;pivot<body.length;pivot++)for(const delta of [0,Math.floor(facts.length/2)])for(const cap of [0,1,4,256]){
  const possible=facts.map((f,i)=>({f,i})).filter(({f})=>f.tag===body[pivot].tag).slice(0,3);
  for(const {i}of possible){const a=run(body,facts,pivot,i,delta,cap,false,mask),b=run(body,facts,pivot,i,delta,cap,true,mask);assert.deepEqual(b,a);cases++;if(a.count>cap)overflows++;}
 }
}
// Eight antecedents bind all sixteen variables, exercising every frame and slot.
for(const mask of [0,7,31]){
 const body=Array.from({length:8},(_,i)=>({tag:100+i,args:[variable(2*i),variable(2*i+1)]}));
 const facts=body.flatMap((p,i)=>Array.from({length:3},(_,j)=>({tag:p.tag,args:[i*10+j,i*10+j+1]})));
 check(body,facts,mask);
 check(Array.from({length:8},()=>({tag:10,args:[variable(0),variable(1)]})),[{tag:10,args:[1,2]},{tag:10,args:[2,3]}],mask);
}
for(let n=0;n<120;n++){
 const size=1+rand(8),body=Array.from({length:size},()=>({tag:10+rand(4),args:Array.from({length:1+rand(3)},()=>rand(4)?variable(rand(8)):rand(4))}));
 const facts=Array.from({length:20},()=>({tag:10+rand(4),args:Array.from({length:1+rand(3)},()=>rand(4))}));
 for(const p of body)facts.push({tag:p.tag,args:p.args.map(q=>q<0?(-q-1)%4:q)});
 check(body,facts,n%2?7:0);
}
const record={kind:'CPU_DFS_STORAGE_ORACLE',verdict:'SAME',cases,overflow_cases:overflows,modes:[...modes].sort(),antecedents_max:8,bindings_max:16,capacities:[0,1,4,256],world_execution:'NOT_RUN',gpu_execution:'NOT_RUN',conform:'NOT_RUN',collector_sha256:sha(path.join(here,'collector.inc')),test_sha256:sha(fileURLToPath(import.meta.url))};
fs.writeFileSync(path.join(here,'CPU_ORACLE.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(record,null,2));
