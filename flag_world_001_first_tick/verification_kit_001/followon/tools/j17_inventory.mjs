// Generic term-identity observation and pinned route-hash primitive.
// All membership and endpoints are read from GPU-produced selection predicates.
import fs from 'node:fs';
import path from 'node:path';
import {openReadback,sha} from './readback.mjs';
const [dir,out]=process.argv.slice(2),r=openReadback(dir);
if(fs.existsSync(out))throw Error('preserve inventory');
const rows=tag=>r.predicate(tag).map(f=>({fact:f.id,rule:f.origin,args:r.node(f.term).c.slice(1)}));
const markers=rows('J23_SELECTED_MARKER'),comps=rows('J23_SELECTED_COMPARATOR'),routes=rows('J23_SELECTED_ROUTE');
const order=(a,b)=>Buffer.compare(Buffer.from(a),Buffer.from(b));
const cells=[...markers,...comps].map(x=>r.term(x.args[0])).sort(order);
if(new Set(cells).size!==cells.length)throw Error('duplicate occurrence');
const cs=comps.map(x=>r.term(x.args[0])).sort(order);
const routeRows=routes.map(x=>{const [m,s,c,t]=x.args.map(r.term),parts=[m,s,c,t];const bytes=Buffer.concat(parts.flatMap(p=>{const b=Buffer.from(p),n=Buffer.alloc(8);n.writeBigUInt64BE(BigInt(b.length));return[n,b];}));return{...x,m,s,c,t,hash:sha(bytes).toLowerCase()};}).sort((a,b)=>order(a.hash,b.hash));
if(new Set(routeRows.map(x=>x.hash)).size!==routeRows.length)throw Error('route hash collision or duplicate');
const seq=a=>a.reduceRight((t,x)=>'CONS('+x+','+t+')','NIL'),q=JSON.stringify;
const facts=cells.map(c=>'GOES_WITH(J23_ID_RESPONSE,'+c+','+q(c)+')');
facts.push('THIS(J23_INVENTORY_CELLS,'+seq(cells)+')','THIS(J23_INVENTORY_COMPARATORS,'+seq(cs)+')');
facts.push('THIS(J23_INVENTORY_ROUTES,'+seq(routeRows.map(x=>'ROUTE('+q(x.hash)+','+x.m+','+x.s+','+x.c+','+x.t+')'))+')');
for(const x of routeRows)facts.push('GOES_WITH(J23_ROUTE_HASH,'+[x.m,x.s,x.c,x.t,q(x.hash),q(x.m),q(x.c)].join(',')+')');
const bytes=Buffer.from('@propose seed J23_OBSERVED_IDENTITY_BYTES := {\n '+facts.join(',\n ')+'\n};\n');
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'inventory.mal'),bytes,{flag:'wx'});
const detail=tag=>rows(tag).map(x=>({fact:x.fact,rule:x.rule,terms:x.args.map(r.term)}));
const record={scope:'GPU_SELECTION_OBSERVATION_AND_GENERIC_IDENTITY_HASH_ONLY',readback_sha256:sha(r.raw),primitive_sha256:sha(fs.readFileSync(new URL(import.meta.url))),inventory_sha256:sha(bytes),cells,comparators:cs,routes:routeRows.map(x=>({source:x.m,source_role:x.s,target:x.c,target_role:x.t,route_id:x.hash,source_fact:x.fact})),withheld_comparators:detail('J23_EXCLUDED_TARGET').filter(x=>x.terms[1].startsWith('HALF_JOIN(')),withheld_routes:detail('J23_WITHHELD_ROUTE')};
fs.writeFileSync(path.join(out,'CUSTODY.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({cells:cells.length,comparators:cs.length,routes:routes.length,withheld:record.withheld_routes.length,sha256:sha(bytes)}));
