// Generic projection of source-produced rows; canonical encoding only.
import fs from 'node:fs';
import {openReadback,sha} from './readback.mjs';
const [dir,tag,out,...options]=process.argv.slice(2),r=openReadback(dir);
if(options.some(x=>x!=='--sort=full-row'))throw Error('unknown observation option');
const fullRow=options.includes('--sort=full-row');
const rows=r.predicate('OBSERVATION_ROW').filter(f=>{const n=r.node(f.term);return n.c.length===3&&r.node(n.c[1]).s===tag&&!r.node(n.c[1]).c.length;}).map(f=>({value:r.value(r.node(f.term).c[2]),fact:f.id,origin:f.origin,support:f.support}));
rows.sort((a,b)=>{const x=JSON.stringify(fullRow?a.value:a.value[0]),y=JSON.stringify(fullRow?b.value:b.value[0]);return fullRow?Buffer.compare(Buffer.from(x),Buffer.from(y)):x<y?-1:x>y?1:0;});
const bytes=Buffer.from(JSON.stringify(rows.map(x=>x.value)));fs.writeFileSync(out,bytes);
fs.writeFileSync(out+'.custody.json',JSON.stringify({source_sha256:r.map.source_sha256,image_sha256:r.map.image_sha256,readback_sha256:sha(r.raw),selector:tag,ordering:fullRow?'full-row JSON UTF-8':'retained first-column JSON string order',output_sha256:sha(bytes),projector_sha256:sha(fs.readFileSync(new URL(import.meta.url))),rows:rows.map(({value,...x})=>x)},null,2));
console.log(JSON.stringify({selector:tag,rows:rows.length,sha256:sha(bytes)}));
