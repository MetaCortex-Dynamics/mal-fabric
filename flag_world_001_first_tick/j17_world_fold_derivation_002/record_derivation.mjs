// Assemble evidence identities, quoted source contacts and the residual obligation.
// This is a run-record observer. It constructs no world operation or successor.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here),repo=path.dirname(root);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
const read=p=>JSON.parse(fs.readFileSync(p));
const check=(x,s)=>{if(!x)throw Error(s);};
const qpath=path.join(here,'qualification_002/QUALIFICATION.json'),q=read(qpath);
check(q.verdict==='IF_THEN','RUNTIME_QUALIFICATION_REQUIRED');
const frozen=path.join(root,'j17_runs_021_023_seal/FROZEN_REHOME_MANIFEST_001.json');
check(id(frozen).sha256==='F7CADDA1C99DE37E9AF00D5429BA34600ACFF421A3FC4C5622FD8F239DF19560','FROZEN_MANIFEST_NOT_SAME');
const manifest=read(frozen);check(manifest.files.length===901,'FROZEN_COUNT');
let bytes=0;for(const f of manifest.files){const actual=id(path.join(repo,f.destination_path));check(actual.bytes===f.size&&actual.sha256===f.sha256,'FROZEN_NOT_SAME '+f.destination_path);bytes+=actual.bytes;}
function contact(p,expected,ranges){const identity=id(p);check(identity.sha256===expected,'LAW_NOT_SAME '+p);const lines=fs.readFileSync(p,'utf8').split(/\r?\n/);return {...identity,clauses:ranges.map(([from,to])=>({from,to,text:lines.slice(from-1,to).join('\n')}))};}
const d='C:/Users/devon/Desktop/MaL',k='C:/Dev/mal_kernel_lab_repo/v3/software_fpga';
const contacts=[
 contact(path.join(d,'SPECS/SPEC_QUEUEGATE_CONSTRUCTED_UNIVERSE_GENESIS_001_v0.1.0.md'),'8A9986EB5E4B12A834AF4A8A2DB78D5DF42230CF06057E93E3C6223AA642252C',[[128,150],[338,348],[681,708],[991,1006]]),
 contact(path.join(d,'Markdowns/FABRIC_EXECUTION_SPEC_v0.3.0-candidate.md'),'5BB1497AA3D791150F0416FEDA4E393695A9302B42030ADD0A7D22C08CCBEAC0',[[66,106],[118,132],[169,205],[216,228],[261,290]]),
 contact(path.join(d,'MaLv3/SPEC_J17_WORLD_FOLD_EFFECT_001_v0.1.0_PROPOSED.mal'),'E2A87BDC3E5A7AAC7B246F3CBBAF77F141689FCF6270D537ACC059F9E6BB9E9E',[[91,105],[170,188]]),
 contact(path.join(k,'geometric_reading_001/witness_payload_v1.mal'),'0B3B9FF7C29C6C0E74EAB2222D69AB334506EC53976EF8FA87514ACEA47BBCD5',[[296,322]]),
 contact(path.join(k,'geometric_reading_001/o15_operator_result_v1.mal'),'34D79BEC206DB18181229713156B1581A26A296837469333B34F4F7E92D67B2D',[[291,305],[326,345]]),
 contact(path.join(k,'geometric_reading_001/immutable_committed_carrier_snapshot_v1.mal'),'0546ED90A43D7AEDB771FE262F337AFAE2CD5FD861E91ED9C310CB7C99F7CE68',[[43,64]]),
 contact(path.join(k,'geometric_reading_001/GROUND_REACTION_FIBER_V1.mal'),'1E1E82E3E5C237C8AF5F36BA8F79886F26B5298DEFEBE1F40A212CDBE34E8A6B',[[1,36]])
];
const git=args=>{const r=spawnSync('git',args,{cwd:repo,encoding:'utf8',windowsHide:true});check(r.status===0,'GIT_OBSERVATION');return r.stdout.trim();};
const record={record:'J17_FOLD_DERIVATION_002',date:new Date().toISOString(),branch:git(['branch','--show-current']),head:git(['rev-parse','HEAD']),authority_receipt:id(path.join(d,'Markdowns/RECEIPT_PROMOTE_SPEC_J17_WORLD_FOLD_EFFECT_001_v0.1.0.md')),
 acceptance_criterion:{source:'Devon, current turn: one successor requires exclusion of every alternative by bound constraints, with witnesses.',full_fold_requires:'Complete bound predicate plus exhaustive exclusion/uniqueness witness; constructing one satisfying output is insufficient.',no_selection:'No candidate is selected.',unevaluated_predicate:'Does not imply cardinality zero or cardinality greater than one.'},
 inputs:q.inputs,contacts,
 runtime_fragment:{verdict:'IF_THEN',scope:'Fixed admitted g2 program and its hash-bound COMPLETED snapshot; not the full fold.',successor_cardinality:1,qualification:id(qpath),witness:id(path.join(here,'RUNTIME_UNIQUENESS_WITNESS.json')),output:q.candidate,replay:'SAME',payloads_discharged:18,buffers_retained:6,new_evaluations:0,new_arrivals:0,new_transition_receipts:18},
 scalar_transport_exclusion:{verdict:'IF_THEN',evidence:id(path.join(here,'transport_evidence_001/TRANSPORT_EXCLUSIONS.json')),excluded:'Copying one scalar face reading to every incident flag cannot recover g2.',remaining:'Richer Patch/readout transports are not excluded.'},
 full_fold:{verdict:'MAYBE',successor_cardinality:null,unique_successor:'NOT_WITNESSED',reason:'The complete relations-from-shape predicate and its successor field consequence have not yet been materialized.',residual_operands:['Successor active-incidence relation entailed by intrinsic participants/ports and coupling under section 24.4.','Reading of that successor relation on the 480 flag occurrences.'],scope:'These are unresolved derivation/implementation contacts, not a proof that the governing law is absent, not a certificate of multiple admissible futures, and not a request for a new law or per-case choice.',known_non_substitutes:['SAME reading is not automatically coupling.','Scalar phase-to-marker copying loses committed support.','Replaying the read-only THIS/SAME program does not witness HELD under FOLD.'],link_3:'NOT_COMMITTED',world_successor:'NOT_PRODUCED',O_FOLD_REALIZE:'PENDING',O_REENTRY:'PENDING',O_QUALIFY:'PENDING_FOR_FULL_FOLD'},
 qualification_correction:{prior_attempt:id(path.join(here,'qualification_001/STOP.json')),reason:'Checker changed after review: distinct-arrival overconnection and exact new-receipt comparison. Custody guard stopped the earlier sandbox attempt; it is retained, not promoted.'},
 implementation:['source/runtime_reentry.mal','qualify.mjs','inspect_transport.mjs','export_witness.mjs','record_derivation.mjs'].map(p=>id(path.join(here,p))),
 custody:{frozen_manifest:id(frozen),files:901,bytes,comparison:'SAME',original_g2:'UNCHANGED',sealed_prior_stop:'PRESERVED',admission:'NOT_REOPENED',python_execution:'NOT_RUN',board_action:'NOT_RUN',repository_commit:'NOT_PERFORMED',push:'NOT_PERFORMED'}
};
const target=path.join(here,'RUN_RECORD_FOLD_DERIVATION_002.json');fs.writeFileSync(target,JSON.stringify(record,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({record:id(target),runtime:'IF_THEN_SINGLETON',full_fold:'MAYBE',frozen:'901_SAME'}));
