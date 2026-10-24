// Generic source-requested primitives only: SHA256 and canonical array order.
// Sort keys come from source requests, not a host world-schema table.
import fs from 'node:fs';
import path from 'node:path';
import {openReadback,sha} from './readback.mjs';
const [dir,out,alias]=process.argv.slice(2),r=openReadback(dir);
if(!/^[a-z][a-z0-9_]*$/.test(alias))throw Error('transport alias required');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const json=v=>JSON.stringify(canonical(v));
const oldHash=new Set(r.predicate('GPU_HASH_RESPONSE').map(f=>json(r.value(r.node(f.term).c[1]))));
const oldSort=new Set(r.predicate('GPU_SORT_RESPONSE').map(f=>{const n=r.node(f.term);return json([r.value(n.c[1]),r.value(n.c[2])]);}));
const rows=[],requests=[],seen=new Set();
for(const f of r.predicate('GPU_HASH_REQUEST')){const n=r.node(f.term);if(n.c.length!==4)throw Error('hash arity');const subject=r.value(n.c[3]),key=json(subject);if(oldHash.has(key)||seen.has('H'+key))continue;seen.add('H'+key);rows.push(['HASH',subject,sha(Buffer.from(key)).toLowerCase()]);requests.push({fact:f.id,rule:f.origin,operation:'SHA256',subject_sha256:sha(Buffer.from(key))});}
for(const f of r.predicate('GPU_SORT_REQUEST')){const n=r.node(f.term);if(n.c.length!==5)throw Error('sort arity');const subject=r.value(n.c[3]),field=r.value(n.c[4]),key=json([subject,field]);if(oldSort.has(key)||seen.has('S'+key))continue;seen.add('S'+key);if(!Array.isArray(subject)||typeof field!=='string')throw Error('sort shape');const value=x=>field===''?x:x[field];for(const x of subject)if(typeof value(x)!=='string')throw Error('source sort key must name string');const result=[...subject].sort((a,b)=>Buffer.compare(Buffer.from(value(a)),Buffer.from(value(b))));rows.push(['SORT',subject,field,result]);requests.push({fact:f.id,rule:f.origin,operation:'SORT_UTF8',field,rows:subject.length});}
if(fs.existsSync(out))throw Error('preserve prior primitive responses');fs.mkdirSync(out,{recursive:true});
const bytes=Buffer.from(JSON.stringify(rows));fs.writeFileSync(path.join(out,'responses.json'),bytes,{flag:'wx'});
const transport=Buffer.from('@readonly input J23_IMPORT_'+alias.toUpperCase()+' := "'+alias+':";\nlaw J23_IMPORT_'+alias.toUpperCase()+' := IF THIS(J23_IMPORT_'+alias.toUpperCase()+',ARRAY(rows)) THEN THIS(J23_SERVICE_ROWS,rows);\n');
fs.writeFileSync(path.join(out,'transport.mal'),transport,{flag:'wx'});
fs.writeFileSync(path.join(out,'CUSTODY.json'),JSON.stringify({scope:'SOURCE_REQUESTED_GENERIC_HASH_AND_CANONICAL_ORDER_ONLY',readback_sha256:sha(r.raw),primitive_sha256:sha(fs.readFileSync(new URL(import.meta.url))),responses_sha256:sha(bytes),transport_sha256:sha(transport),requests},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({responses:rows.length,requests:requests.length,out}));
