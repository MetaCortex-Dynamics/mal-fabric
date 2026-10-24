// Generic source-requested SHA-256 primitive; no application semantics.
// SHA-256 and sorted-key compact JSON observation are permitted host substrate.
import fs from 'node:fs';
import path from 'node:path';
import {openReadback,sha} from './readback.mjs';
const [dir,out,previous]=process.argv.slice(2),r=openReadback(dir);
function canonical(v){if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));return v;}
const merged=new Map();
if(previous){for(const row of JSON.parse(fs.readFileSync(previous))){const [subject,digest]=row,b=Buffer.from(JSON.stringify(canonical(subject)));if(sha(b).toLowerCase()!==digest)throw Error('previous digest NOT_SAME');merged.set(JSON.stringify(subject),row);}}
const records=[];
for(const f of r.predicate('GPU_HASH_REQUEST')){
 const n=r.node(f.term);if(n.s!=='GOES_WITH'||n.c.length!==4)throw Error('request arity');
 const subject=r.value(n.c[3]),bytes=Buffer.from(JSON.stringify(canonical(subject))),digest=sha(bytes).toLowerCase();
 merged.set(JSON.stringify(subject),[subject,digest]);
 records.push({fact:f.id,rule:f.origin,kind:r.term(n.c[1]),key:r.term(n.c[2]),subject_sha256:sha(bytes),digest});
}
fs.mkdirSync(out,{recursive:true});
const bytes=Buffer.from(JSON.stringify([...merged.values()]));fs.writeFileSync(path.join(out,'responses.json'),bytes);
const record={scope:'Generic source-requested sorted-key compact JSON SHA-256; no source law, placement, evaluation, admission or commit is supplied',source_sha256:r.map.source_sha256,image_sha256:r.map.image_sha256,readback_sha256:sha(r.raw),primitive_sha256:sha(fs.readFileSync(new URL(import.meta.url))),previous:previous||null,responses_sha256:sha(bytes),requests:records};
fs.writeFileSync(path.join(out,'HASH_CUSTODY.json'),JSON.stringify(record,null,2));
console.log(JSON.stringify({requests:records.length,subjects:merged.size,responses_sha256:sha(bytes)}));
