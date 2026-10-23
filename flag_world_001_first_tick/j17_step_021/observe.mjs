// Observation of GPU-produced terms and custody checks only. No world evaluator.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {openReadback,sha} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(here,'preflight');
const rb=openReadback(out);
const write=(name,obj)=>{const p=path.join(out,name),b=Buffer.from(JSON.stringify(obj,null,2)+'\n');fs.writeFileSync(p,b,{flag:'wx'});return {path:p,bytes:b.length,sha256:sha(b)};};
const row=f=>({fact_id:f.id,term:rb.term(f.term),rule:f.origin,support:f.support});
const tags=['FLAG','PAIR','COMMITTED_GENESIS','SF_COMPARATOR','SF_OCCURRENCE_ADMITTED','SF_FACE_ROLE','SF_PLACEMENT_PENDING','J21_MARKER','J21_COORDINATE','J21_CELL_MEMBER','J21_ROUTE_CONTACT','J21_ENDPOINT_MEMBERSHIP','J21_CCC_MARKER','J21_CCC_OWN_ROLE','J21_CCC_OWN_TIE','J21_ROUTE_OWN_TIE','J21_CCD_MARKER','STEP_FABRIC_RETURN','COMMITTED_WORLD'];
const counts=Object.fromEntries(tags.map(t=>[t,rb.predicate(t).length]));
const expected={FLAG:480,PAIR:720,COMMITTED_GENESIS:1,SF_COMPARATOR:720,SF_OCCURRENCE_ADMITTED:720,SF_FACE_ROLE:6,SF_PLACEMENT_PENDING:54,J21_MARKER:480,J21_COORDINATE:480,J21_CELL_MEMBER:1200,J21_ROUTE_CONTACT:1440,J21_ENDPOINT_MEMBERSHIP:1440,J21_CCC_MARKER:120,J21_CCC_OWN_ROLE:12,J21_CCC_OWN_TIE:108,J21_ROUTE_OWN_TIE:324,J21_CCD_MARKER:360,STEP_FABRIC_RETURN:0,COMMITTED_WORLD:0};
const checks=Object.entries(expected).map(([tag,n])=>({predicate:tag,expected:n,observed:counts[tag],comparison:counts[tag]===n?'SAME':'NOT_SAME'}));
const evidence=[];
for(const t of tags.filter(t=>t.startsWith('J21_')||t==='SF_FACE_ROLE'||t==='SF_PLACEMENT_PENDING'))evidence.push(write(t+'.json',rb.predicate(t).map(row)));
// Imported route encoding: four UTF-8 identifiers, each u64be length-prefixed.
// These hash structural source contacts; they are not an admitted FabricSpec.
const routes=rb.predicate('J21_ROUTE_CONTACT').map(f=>{
 const n=rb.node(f.term),fields=n.c.slice(1).map(i=>rb.term(i));
 const bytes=Buffer.concat(fields.flatMap(s=>{const b=Buffer.from(s,'utf8'),l=Buffer.alloc(8);l.writeBigUInt64BE(BigInt(b.length));return [l,b];}));
 return {source_contact:fields,route_sha256:crypto.createHash('sha256').update(bytes).digest('hex'),fact_id:f.id};
});
evidence.push(write('source_route_identities.json',routes));
const committed=rb.predicate('COMMITTED_GENESIS');
if(committed.length!==1)throw Error('Predecessor singleton NOT_SAME');
const genesis=rb.value(rb.node(committed[0].term).c[1]),genesisBytes=Buffer.from(JSON.stringify(genesis));
if(sha(genesisBytes)!=='FDA614876C99126FCE2AFE6AC8E42A77863880485E02D4B4EDA4AA817446BD2C')throw Error('Committed genesis NOT_SAME');
fs.writeFileSync(path.join(out,'predecessor.genesis.json'),genesisBytes,{flag:'wx'});
const examples=rb.predicate('J21_CCC_OWN_TIE').filter(f=>/W_12,J_15|W_13,J_16/.test(rb.term(f.term))).map(row);
const summary={record:'J17_SECOND_STEP_ENDPOINT_PREFLIGHT_021',authority:'EXECUTE under promoted bindings; no new promotion',GPU:{device:'NVIDIA GeForce RTX 3070',error:rb.error,facts:rb.count,terms:rb.terms,epochs:rb.epochs,readback_sha256:sha(rb.raw)},source_sha256:sha(fs.readFileSync(path.join(out,'source.mal'))),counts,checks,predecessor:{sha256:sha(genesisBytes),bytes:genesisBytes.length,chain_links:genesis.chain.length,comparison:'SAME'},scope:{endpoint_membership:'1440 structural source-route endpoint witnesses; not full canonical-program DRC',marker_identity:'SOURCE_MARKER(GENESIS,flag), retained structural identity, not a new canonical CellId recipe',placement:'No flag-to-modal-BOUNDARY mapping or type-seat J6 substitution',CCC:'Own triad must equal the full DG_FACE triangle',CCD:'360 occurrences are outside the CCC readout; not declared NO or PENDING from absence'},stop:{type:'EXPLICIT_OWN_RANK_TIES',CCC_tied_markers:108,affected_source_routes:324,examples,continuation:'Not run: canonical program admission / emitted-route STEP_FABRIC / successor / link 2',runtime_refusal_witness:'NOT_CLAIMED: preflight contains no full-program admission or STEP_FABRIC producers',rule:'116 L06 withholds a candidate lacking placement; promoted S/F C3 forbids tie-breaking. Source endpoint membership remains witnessed.'},stages:{endpoint_incidence:'EXECUTED',modal_admission:'NOT_RUN',propagation:'NOT_RUN',runtime_governance:'NOT_RUN',simultaneous_commit:'NOT_RUN',link_2:'NOT_PRODUCED'},V1_V2:'Promoted CONFORM preserved; not rerun or extended by this preflight',evidence};
write('PREFLIGHT_RESULT.json',summary);
console.log(JSON.stringify({counts,checks:checks.every(x=>x.comparison==='SAME')?'SAME':'NOT_SAME',readback_sha256:summary.GPU.readback_sha256,predecessor:summary.predecessor,stop:summary.stop.type}));
if(checks.some(x=>x.comparison!=='SAME'))process.exitCode=2;
