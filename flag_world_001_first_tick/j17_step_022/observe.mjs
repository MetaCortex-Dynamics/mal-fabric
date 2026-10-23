// Observe GPU facts and bind bytes. This file does not classify the world,
// admit a program, synthesize missing routes, or construct a successor.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {openReadback,sha} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.join(here,'classification');
const rb=openReadback(out),artifacts=[];
const write=(name,obj)=>{const b=Buffer.from(JSON.stringify(obj,null,2)+'\n'),p=path.join(out,name);fs.writeFileSync(p,b,{flag:'wx'});const binding={path:p,bytes:b.length,sha256:sha(b)};artifacts.push(binding);return binding;};
const row=f=>({fact_id:f.id,term:rb.term(f.term),rule:f.origin,support:f.support});
const predicates=['J22_CLASS','J22_LOCATION_EVIDENCE','J22_CELL_ADMITTED','J22_ROUTE','J22_DRC_III_CELL','J22_DRC_III_FACE','J22_DRC_IV','J22_ROUTE_REGION','J22_ROUTE_PORT_TYPE','J22_TARGET_ROLE_STATUS','J22_JOIN_CHECK','J22_JOIN_UNCONNECTED','J22_PROGRAM_REFUSAL'];
for(const p of predicates)write(p+'.json',rb.predicate(p).map(row));
const counts=Object.fromEntries(predicates.map(p=>[p,rb.predicate(p).length]));
const classes={A:0,B:0,C:0,D:0},markers=new Set();
for(const f of rb.predicate('J22_CLASS')){const n=rb.node(f.term),m=rb.term(n.c[1]),k=rb.term(n.c[2]);if(!Object.hasOwn(classes,k)||markers.has(m))throw Error('Classification partition NOT_SAME');classes[k]++;markers.add(m);}
const joins={IF_THEN:0,NOT_SAME:0};
for(const f of rb.predicate('J22_JOIN_CHECK'))joins[rb.term(rb.node(f.term).c[2])]++;
const perFace=rb.predicate('J22_DRC_III_FACE').map(f=>{const n=rb.node(f.term);return {face:rb.term(n.c[1]),verdict:rb.term(n.c[2]),fact_id:f.id};});
const routes=rb.predicate('J22_ROUTE').map(f=>{
 const n=rb.node(f.term),fields=n.c.slice(1).map(i=>rb.term(i));
 const bytes=Buffer.concat(fields.flatMap(s=>{const b=Buffer.from(s,'utf8'),l=Buffer.alloc(8);l.writeBigUInt64BE(BigInt(b.length));return [l,b];}));
 return {source_contact:fields,route_sha256:crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase(),fact_id:f.id};
});
write('admitted_source_routes.json',routes);
const failureDetails=rb.predicate('J22_JOIN_CHECK').filter(f=>rb.term(rb.node(f.term).c[2])==='NOT_SAME').map(f=>{
 const n=rb.node(f.term),reason=rb.node(n.c[3]),withheld=rb.node(reason.c[2]);
 return {...row(f),comparator:rb.term(n.c[1]),actual_roles:reason.c.slice(0,2).map(i=>rb.term(i)),withheld_source:rb.term(withheld.c[0]),withheld_class:rb.term(withheld.c[1])};
});
write('join_shape_failures.json',failureDetails);
const expected={A:12,B:0,C:108,D:360,routes:36,joins_complete:6,joins_not_same:24};
const observed={...classes,routes:counts.J22_ROUTE,joins_complete:joins.IF_THEN,joins_not_same:joins.NOT_SAME};
const comparison=Object.keys(expected).every(k=>expected[k]===observed[k])?'SAME':'NOT_SAME';
const genesis=rb.predicate('COMMITTED_GENESIS');if(genesis.length!==1)throw Error('Genesis singleton NOT_SAME');
const bytes=Buffer.from(JSON.stringify(rb.value(rb.node(genesis[0].term).c[1])));
if(sha(bytes)!=='FDA614876C99126FCE2AFE6AC8E42A77863880485E02D4B4EDA4AA817446BD2C')throw Error('Genesis custody NOT_SAME');
const result={record:'TASK_CODEX_J17_SECOND_STEP_022',GPU:{device:'NVIDIA GeForce RTX 3070',error:rb.error,facts:rb.count,terms:rb.terms,epochs:rb.epochs,readback_sha256:sha(rb.raw)},classes,counts,per_face_placement_capability:perFace,static_joins:joins,withheld_counterparts:failureDetails.reduce((a,f)=>{a[f.withheld_class]=(a[f.withheld_class]||0)+1;return a;},{}),observation_comparison:{expected,observed,comparison,origin:'Independent observation of retained021, not promoted vector expectation; never supplied to image'},handoff_estimate:{A:4,C:108,D:360,B:'8 or in C',comparison:'NOT_SAME',scope:'estimate only; no promoted expectation altered; eight additional unique own maxima are rank S'},predecessor:{sha256:sha(bytes),comparison:'SAME',chain_links:1},scope:{classification:'EXECUTED',induced_source_routes:'EXECUTED; exact endpoint-membership filter',DRC_III:'EXECUTED per admitted occurrence-face and each of six touched CCC faces',DRC_IV:'EXECUTED on all36 source routes',DRC_VIII:'EXECUTED necessary static role-shape condition:24 NOT_SAME',full_canonical_program_admission:'NOT_CLAIMED; necessary static condition fails',STEP_FABRIC:'NOT_RUN; static refusal before runtime',link_2:'NOT_PRODUCED',successor_readout:'NOT_RUN; no successor manufactured'},contract:{L06_sha256:'FFF676FC92D57CB564A2045754939794CE4CB0BE71DA286E5B709A623E3F9513',static_spec_sha256:'E328B574DE32635358AC488C4C5E20E80E86A845EB154401C8E1A7C0DD8D68F1',static_reference_sha256:'8B983301DAD795DD9C3F020970BAD76017EF648AC0C71E3FB6FDEF3D0E4347C0',clause:'DRC before runtime; actual incoming role signature MUST conform_to ROLE_SCHEMA; incoherent joins rejected statically'},verdict:'NOT_SAME',boundary:'24 comparator targets have LEFT without RIGHT or RIGHT without LEFT in the requested induced static route list. This is not class-C re-stopping or a temporal arrival tie.',artifacts:[...artifacts]};
write('RESULT_022.json',result);
console.log(JSON.stringify({classes,routes:counts.J22_ROUTE,joins,comparison,readback_sha256:result.GPU.readback_sha256,verdict:result.verdict}));
if(comparison!=='SAME')process.exitCode=2;
