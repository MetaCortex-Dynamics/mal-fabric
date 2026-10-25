// Observe qualified CUDA proof support. No transition/effect construction.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),qdir=path.join(here,'qualification_002');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=p=>{const b=fs.readFileSync(p);return {path:p,bytes:b.length,sha256:sha(b)};};
const qpath=path.join(qdir,'QUALIFICATION.json'),q=JSON.parse(fs.readFileSync(qpath));
if(q.verdict!=='IF_THEN'||q.scope!=='J17_RUNTIME_REENTRY_FRAGMENT_ONLY')throw Error('QUALIFICATION_REQUIRED');
const final=q.observations.find(x=>x.counts.RR_RUNTIME_UNIQUE===1),r=openReadback(final.directory);
if(sha(r.raw)!==final.readback.sha256)throw Error('READBACK_NOT_SAME');
const roots=r.predicate('RR_RUNTIME_UNIQUE');if(roots.length!==1)throw Error('UNIQUE_ROOT_REQUIRED');
const retained=new Set(),walk=[roots[0].id];
while(walk.length){const i=walk.pop();if(retained.has(i))continue;const f=r.facts[i];if(!f||f.id!==i)throw Error('SUPPORT_BOUNDS');retained.add(i);for(const s of f.support){if(s>=i||s<0)throw Error('SUPPORT_NOT_PREDECESSOR');walk.push(s);}}
const support=[...retained].sort((a,b)=>a-b).map(i=>{const f=r.facts[i];return {fact_id:i,term_id:f.term,rule:f.origin,rank:f.rank,support:f.support};});
const exclusions=r.predicate('RR_EXCLUDED').map(f=>{const n=r.node(f.term);return {fact_id:f.id,cell:r.value(n.c[1]),excluded:r.term(n.c[2]),clause_condition:r.term(n.c[3])};});
const buffers=r.predicate('RR_BUFFER_EXCLUDED').map(f=>{const n=r.node(f.term);return {fact_id:f.id,cell:r.value(n.c[1]),buffer:r.value(n.c[2]),excluded:r.term(n.c[3]),clause_condition:r.term(n.c[4])};});
const cert={record:'J17_BOUNDED_RUNTIME_UNIQUENESS_WITNESS_001',verdict:'IF_THEN',scope:'FIXED_G2_PROGRAM_AND_COMPLETED_SNAPSHOT_RUNTIME_ONLY',
qualification:identity(qpath),readback:identity(path.join(final.directory,'readback.bin')),image:identity(path.join(final.directory,'image.bin')),source_map:identity(path.join(final.directory,'source-map.json')),source:identity(path.join(here,'source/runtime_reentry.mal')),root_fact:roots[0].id,
runtime_successor_cardinality:1,canonical_runtime:q.candidate,payloads_discharged:18,buffers_retained:6,exclusions,buffer_exclusions:buffers,support,
world_fold_successor_cardinality:null,world_fold_verdict:'MAYBE',scope_boundary:'This certificate excludes lifecycle/buffering alternatives under FABEX on the fixed g2 program. It does not certify a successor active-relation set or successor flag field under the fold.',link_3:'NOT_COMMITTED'};
const out=path.join(here,'RUNTIME_UNIQUENESS_WITNESS.json');fs.writeFileSync(out,JSON.stringify(cert,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({certificate:identity(out),support_facts:support.length,cell_exclusions:exclusions.length,buffer_exclusions:buffers.length}));
