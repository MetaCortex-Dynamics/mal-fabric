// Read-only mathematical observation of committed bytes, not an execution path.
// Tests scalar factorization through supplied incidence coordinates. It does
// not propose, select, or write a world successor or assign phase values.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const input=path.resolve(here,'../j17_step_023/outputs/committed.world.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const raw=fs.readFileSync(input);
if(sha(raw)!=='E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059')throw Error('G2_NOT_SAME');
const {field}=JSON.parse(raw), encoded=new Set(field.map(([f])=>JSON.stringify(f)));
if(field.length!==480||encoded.size!==480)throw Error('FLAG_INVENTORY');
function group(keyOf){
 const buckets=new Map();for(const row of field){const k=JSON.stringify(keyOf(row[0]));if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(row);}
 const groups=[...buckets].map(([key,rows])=>{
  const counts={};for(const [,v] of rows)counts[v]=(counts[v]??0)+1;
  // Every distinguishing pair is emitted; no representative is chosen.
  const witnesses=[];for(let a=0;a<rows.length;a++)for(let b=a+1;b<rows.length;b++)if(rows[a][1]!==rows[b][1])witnesses.push([rows[a],rows[b]]);
  return {coordinate:JSON.parse(key),counts,distinguishing_pairs:witnesses};
 });
 return {groups:groups.length,mixed:groups.filter(x=>x.distinguishing_pairs.length).length,rows:groups};
}
const sites=group(f=>f[0]),triads=group(f=>f[2]);
// Identifier sorting below is set serialization only, never a traversal/metric.
const parents=group(f=>[...new Set(f[2].flatMap(site=>site.slice(2).split('|')))].sort());
if(sites.groups!==42||sites.mixed!==0||triads.groups!==80||triads.mixed!==6||parents.groups!==20||parents.mixed!==2)throw Error('FACTOR_COUNTS_NOT_SAME');
const dir=path.join(here,'transport_evidence_001');if(fs.existsSync(dir))throw Error('PRESERVE_PRIOR_EVIDENCE');fs.mkdirSync(dir);
const out={record:'J17_SCALAR_TRANSPORT_EXCLUSION_WITNESS_001',scope:'COMMITTED_FIELD_READOUT_FACTORABILITY_ONLY',input:{path:input,bytes:raw.length,sha256:sha(raw)},observer_sha256:sha(fs.readFileSync(fileURLToPath(import.meta.url))),
 criterion:'A scalar pullback reading(f)=q(coordinate(f)) requires every coordinate fiber to have one reading. A pair with the same coordinate and distinguished readings excludes every such q.',
 site_factorization:{verdict:'IF_THEN',uniqueness:'Each of all 42 fibers is nonempty and unanimous, fixing q on every site.',...sites},
 triad_scalar_pullback:{verdict:'NO',...triads},parent_scalar_pullback:{verdict:'NO',...parents},
 exclusions_scope:'Scalar copy from a face to all its flags is excluded. Richer Patch readouts and other sourced transports are not excluded by this test.',
 fold_successor_set:{cardinality:null,verdict:'MAYBE',reason:'Full fold predicate not materialized; not an empty set or a multiple-successor witness.'},world_successor:'NOT_PRODUCED',link_3:'NOT_COMMITTED'};
const file=path.join(dir,'TRANSPORT_EXCLUSIONS.json'),bytes=Buffer.from(JSON.stringify(out,null,2)+'\n');fs.writeFileSync(file,bytes,{flag:'wx'});console.log(JSON.stringify({file,sha256:sha(bytes),bytes:bytes.length,sites:42,mixed_triads:6,mixed_parents:2}));
