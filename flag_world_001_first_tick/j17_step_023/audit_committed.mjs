// Independent read-only comparison of a finished GPU readback.
// This tool creates no world state, source fact, input, image, or output file.
// Its arithmetic/hashes are observation checks only, never realization input.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openReadback,sha} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const [dir]=process.argv.slice(2);
if(!dir)throw Error('finished readback directory required');
const r=openReadback(dir),checks=[];
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const j=v=>JSON.stringify(canonical(v)),digest=v=>sha(Buffer.from(j(v))).toLowerCase();
function check(name,condition,detail){checks.push({name,verdict:condition?'SAME':'NOT_SAME',...(detail===undefined?{}:{detail})});if(!condition)throw Error('NOT_SAME '+name+(detail===undefined?'':' '+JSON.stringify(detail)));}
function one(tag){const fs=r.predicate(tag);check(tag+'_singleton',fs.length===1,{count:fs.length});return r.node(fs[0].term).c;}
function ownCount(id){let count=0;for(let n=r.node(id);n.s==='NEXT_COUNT';n=r.node(id)){check('unary_count_arity',n.c.length===1);count++;id=n.c[0];if(count>480)throw Error('count exceeds field');}const n=r.node(id);check('unary_count_terminal',n.s==='EMPTY_COUNT'&&!n.c.length);return count;}
const frozenPath=path.resolve(here,'../j17_step_021/preflight/predecessor.genesis.json');
const frozenBytes=fs.readFileSync(frozenPath),g1=JSON.parse(frozenBytes);
check('bound_genesis_bytes',sha(frozenBytes)==='FDA614876C99126FCE2AFE6AC8E42A77863880485E02D4B4EDA4AA817446BD2C');
const emittedGenesis=r.value(one('COMMITTED_GENESIS')[1]);
check('retained_genesis_full_object',JSON.stringify(emittedGenesis)===frozenBytes.toString('utf8'));
const c=one('C23_COMMITTED_OBJECT'),world=r.value(c[4]);
check('public_commit_exact_object',j(world)===j(r.value(one('COMMITTED_WORLD')[1])));
check('chain_length_two',world.chain.length===2);
check('genesis_chain_entry_byte_preserved',JSON.stringify(world.chain[0])===JSON.stringify(g1.chain[0]));
check('field_complete_and_unchanged',world.field.length===480&&JSON.stringify(world.field)===JSON.stringify(g1.field));
check('witness_complete_and_unchanged',world.witness.length===720&&JSON.stringify(world.witness)===JSON.stringify(g1.witness));
const predecessorField=new Map(g1.field.map(([f,v])=>[j(f),v]));
check('predecessor_field_distinct',predecessorField.size===480);
const successorField=new Map(world.field.map(([f,v])=>[j(f),v]));
check('successor_field_distinct',successorField.size===480);
let edits=0;for(const [f,v] of successorField){check('successor_flag_in_predecessor',predecessorField.has(f));if(v!==predecessorField.get(f))edits++;}
check('no_flag_edits',edits===0);
for(let i=0;i<world.chain.length;i++){
 const {link,record}=world.chain[i];
 check('chain_'+i+'_link_hash',digest(record)===link);
 check('chain_'+i+'_pair_hash',digest({field:record.field,witness:record.witness})===record.pair_hash);
 check('chain_'+i+'_receipt_hash',digest(record.receipt)===record.receipt_hash);
 check('chain_'+i+'_receipt_reading',record.receipt_reading===(record.receipt.discharged.length||record.receipt.opened.length?'THIS':'NO'));
 check('chain_'+i+'_prev',record.prev===(i?world.chain[i-1].link:'b263644e59a696999c02dfd25386a5abefdb2d0fc4317a0fe2cccd90502ebad3'));
}
const tick=world.chain[1].record;
check('tick_record_kind',tick.kind==='TICK');
check('tick_top_field_witness_receipt',j(tick.field)===j(world.field)&&j(tick.witness)===j(world.witness)&&j(tick.receipt)===j(world.receipt));
check('empty_world_receipt',world.receipt.opened.length===0&&world.receipt.discharged.length===0&&tick.receipt_reading==='NO');
const returned=one('STEP_FABRIC_RETURN'),stateNode=one('S23_SUCCESSOR_JSON'),state=r.value(stateNode[4]);
check('returned_program_identity',r.value(returned[1])===tick.fabric_program);
check('successor_json_bound_to_return',stateNode[1]===returned[1]&&stateNode[2]===returned[2]&&stateNode[3]===returned[3]);
const fabricHash=one('C23_FABRIC_STATE_HASH');
check('fabric_state_hash',r.value(fabricHash[4])===digest(state));
check('fabric_state_hash_bound_to_commit',fabricHash[1]===c[1]&&fabricHash[2]===c[2]&&fabricHash[3]===c[3]);
const receiptRows=r.predicate('C23_RECEIPT_PAIR'),receiptCounts={UNCHANGED:0,RETAINED:0};
check('receipt_pair_count',receiptRows.length===720);
const receiptKeys=new Set();
for(const f of receiptRows){const n=r.node(f.term),key=r.term(n.c[3])+'|'+r.term(n.c[4]),s=r.value(n.c[5]);check('receipt_pair_distinct',!receiptKeys.has(key));receiptKeys.add(key);check('receipt_pair_disposition',Object.hasOwn(receiptCounts,s));receiptCounts[s]++;}
check('retained_walls',receiptCounts.RETAINED===12&&receiptCounts.UNCHANGED===708);
const markerMap=new Map(r.predicate('MARKER_TEXT').map(f=>{const n=r.node(f.term);return[r.term(n.c[1]),r.value(n.c[2])];}));
const flagJson=new Map(r.predicate('FLAG_JSON').map(f=>{const n=r.node(f.term);return[r.term(n.c[1]),r.value(n.c[2])];}));
const pairRows=r.predicate('D23_PAIR'),paired=new Set();
check('cross_snapshot_comparisons',pairRows.length===480);
for(const f of pairRows){const n=r.node(f.term),key=r.term(n.c[1]),json=flagJson.get(key);check('cross_snapshot_flag_distinct',!paired.has(key));paired.add(key);check('cross_snapshot_readings',markerMap.get(r.term(n.c[2]))===successorField.get(j(json))&&markerMap.get(r.term(n.c[3]))===predecessorField.get(j(json)));}
const siteText=new Map(r.predicate('SITE_TEXT').map(f=>{const n=r.node(f.term);return[r.term(n.c[1]),r.value(n.c[2])];}));
const values=new Map();
for(const f of r.predicate('D23_VALUE')){const n=r.node(f.term),s=r.term(n.c[1]),text=siteText.get(s),count=ownCount(n.c[2]);check('junction_readout_distinct',!values.has(s));let expected=0;for(const [flag,reading] of world.field){const prior=predecessorField.get(j(flag));if(reading!==prior&&(flag[0]===text||flag[1].includes(text)||flag[2].includes(text)))expected++;}check('junction_dg_independent_comparison',count===expected,{junction:text,observed:count,expected});values.set(s,{text,count});}
check('all_junction_readouts',values.size===30);
const faceRows=r.predicate('D23_FACE_DISTANCE'),faces=new Set(),faceReport=[];
check('all_face_readouts',faceRows.length===20);
for(const f of faceRows){const n=r.node(f.term),w=r.term(n.c[1]),sites=n.c.slice(2,5).map(x=>r.term(x)),distances=n.c.slice(5,8).map(ownCount);check('face_distinct',!faces.has(w));faces.add(w);check('face_distances_match_junctions',sites.every((s,i)=>values.get(s)?.count===distances[i]));check('face_zero_edit_tie',distances.every(x=>x===0));faceReport.push({face:w,junctions:sites.map(s=>values.get(s).text),d_G:distances,G:'MAYBE'});}
const obs=r.predicate('OBSERVATION_ROW').map(f=>r.node(f.term)).filter(n=>r.term(n.c[1])==='STEP_023_FACE_READOUT').map(n=>r.value(n.c[2]));
check('all_face_observation_rows',obs.length===20&&new Set(obs.map(x=>j(x.face))).size===20);
check('face_observation_ties',obs.every(x=>x.G===null&&x.ranks===null&&x.G_verdict==='MAYBE'&&x.S_F_verdict==='MAYBE'&&x.distances.every(a=>Array.isArray(a)&&a.length===0)));
check('all_face_ties_explicit',r.predicate('D23_G_MAYBE').length===20&&r.predicate('D23_OWN_TIE').length===60);
check('no_derived_unique_next_rank',r.predicate('D23_ROLE').length===0&&r.predicate('D23_RANK').length===0);
check('six_comparator_results',r.predicate('S23_COMPARATOR_READING').length===6);
check('no_comparator_disagreement_with_snapshot',r.predicate('C23_RESULT_DIFFER').length===0);
const report={scope:'READ_ONLY_INDEPENDENT_OBSERVATION_CHECK; NOT_RUNTIME; NO_OUTPUT_FILES_WRITTEN',verdict:'SAME',source_sha256:r.map.source_sha256,readback_sha256:sha(r.raw),audit_sha256:sha(fs.readFileSync(new URL(import.meta.url))),prior_object_sha256:sha(frozenBytes),committed_object_sha256:sha(Buffer.from(JSON.stringify(world))),canonical_committed_object_sha256:digest(world).toUpperCase(),genesis_link:world.chain[0].link,tick_link:world.chain[1].link,pair_hash:tick.pair_hash,receipt_hash:tick.receipt_hash,receipt_reading:tick.receipt_reading,runtime_state_sha256:digest(state).toUpperCase(),field_edits:edits,receiptCounts,comparison_count:checks.length,faceReadout:faceReport,fabric_custody:{payloads:Object.keys(state.payload_states).length,route_states:Object.keys(state.route_states).length,pending_input_buffers:state.pending_input_buffers.length,pending_admissions:state.pending_admissions.length,outstanding_obligations:state.outstanding_obligations.length,receipts:state.receipts.length},branch:'FIXED_POINT_WORLD_FIELD_ONLY; RUNTIME_CUSTODY_CHANGED'};
console.log(JSON.stringify(report,null,2));
