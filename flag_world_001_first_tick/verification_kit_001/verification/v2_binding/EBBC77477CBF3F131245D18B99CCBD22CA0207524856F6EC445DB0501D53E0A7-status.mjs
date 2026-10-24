// Observation only; counts do not grant admission or perform a commit.
import fs from 'node:fs';
import {openReadback,sha} from './readback.mjs';
const [dir,out]=process.argv.slice(2),r=openReadback(dir),counts={},requests={},origins={};
for(const f of r.facts){const n=r.node(f.term);origins[f.origin]=(origins[f.origin]||0)+1;if(!n.c.length)continue;const tag=r.node(n.c[0]);if(tag.c.length)continue;counts[tag.s]=(counts[tag.s]||0)+1;if(tag.s==='GPU_HASH_REQUEST'){const k=r.node(n.c[1]).s;requests[k]=(requests[k]||0)+1;}}
const result={source_sha256:r.map.source_sha256,image_sha256:r.map.image_sha256,readback_sha256:sha(r.raw),error:r.error,terms:r.terms,facts:r.count,epochs:r.epochs,requests,counts,origins};
if(out)fs.writeFileSync(out,JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,counts:Object.fromEntries(Object.entries(counts).filter(([k])=>/^(P20_|I20_|C20_|STEP_|COMMITTED_WORLD)/.test(k))),origins:undefined}));
