// Source-fact observation and the retained014 identity byte primitive only.
// The source checks every imported occurrence and its complete carrier coverage.
import fs from 'node:fs';
import path from 'node:path';
import {openReadback,sha} from './readback.mjs';
const [dir,out,...options]=process.argv.slice(2);
const selectors={occurrences:'SF_COMPARATOR',flags:'FLAG_JSON'};
for(const option of options){const m=/^--(occurrences|flags)=([A-Z][A-Z_0-9]*)$/.exec(option);if(!m)throw Error('unknown source predicate selector');selectors[m[1]]=m[2];}
const r=openReadback(dir);
const flags=new Map(r.predicate(selectors.flags).map(f=>{const n=r.node(f.term);if(n.c.length!==3)throw Error('source flag observation arity');return [n.c[1],r.value(n.c[2])];}));
const observations=r.predicate(selectors.occurrences).map(f=>{
 const n=r.node(f.term),c=r.node(n.c[1]);
 if(n.c.length!==4)throw Error('source occurrence arity');
 if(c.s!=='OCCURRENCE'||c.c.length!==2)throw Error('source identity subject');
 const subjects=c.c.map(r.term),bytes=Buffer.concat(subjects.flatMap(s=>{const b=Buffer.from(s),l=Buffer.alloc(8);l.writeBigUInt64BE(BigInt(b.length));return [l,b];}));
 if(!flags.has(n.c[2])||!flags.has(n.c[3]))throw Error('source observation missing');
 return {id:sha(bytes),f:flags.get(n.c[2]),g:flags.get(n.c[3]),occurrence:r.term(n.c[1]),subjects,fact:f.id,support:f.support};
});
// Sorting here normalizes encoding only. GPU verifies strict order and coverage.
observations.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
if(new Set(observations.map(x=>x.id)).size!==observations.length)throw Error('identity collision');
fs.mkdirSync(out,{recursive:true});
const bytes=Buffer.from(JSON.stringify(observations.map(x=>[x.id,x.f,x.g])));
fs.writeFileSync(path.join(out,'program_inventory.json'),bytes);
const data=Buffer.from('// Generic hash primitive responses; subjects are verbatim GPU source terms.\n@propose seed P20_HASH_CUSTODY := {\n'+observations.map(x=>' GOES_WITH(P20_CELL_HASH,'+x.occurrence+','+JSON.stringify(x.id)+','+x.subjects.join(',')+')').join(',\n')+'\n};\n');
fs.writeFileSync(path.join(out,'cell_hashes.mal'),data);
const record={scope:'Observation, canonical ordering and retained014 length-prefixed SHA-256 only; no cell declaration, placement, admission or world transition',selectors,source_sha256:r.map.source_sha256,image_sha256:r.map.image_sha256,readback_sha256:sha(r.raw),projector_sha256:sha(fs.readFileSync(new URL(import.meta.url))),inventory_sha256:sha(bytes),hash_response_sha256:sha(data),observations};
fs.writeFileSync(path.join(out,'CUSTODY.json'),JSON.stringify(record,null,2));
console.log(JSON.stringify({rows:observations.length,inventory_sha256:sha(bytes),hash_response_sha256:sha(data)}));
