// Read/hash/copy evidence only. Not a fold runtime, vector classifier or world-state producer.
// The UNSUPPLIED finding below records the source audit; this utility does not derive a world verdict.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(root,'../..');
const workspace=path.resolve(repo,'..');
const corpus='C:/Users/devon/Desktop/MaL';
const kernel='C:/Dev/mal_kernel_lab_repo';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const canon=o=>JSON.stringify(o,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const identify=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p).replaceAll('\\','/'),bytes:b.length,sha256:sha(b)};};
const check=(p,h,n)=>{const v=identify(p);assert.equal(v.sha256,h,'NOT_SAME '+p);if(n!==undefined)assert.equal(v.bytes,n,'SIZE_NOT_SAME '+p);return v;};
const write=(name,b)=>{const p=path.join(root,name),bytes=Buffer.isBuffer(b)?b:Buffer.from(b);if(fs.existsSync(p)){assert.deepEqual(fs.readFileSync(p),bytes,'retained output NOT_SAME '+name);}else{fs.writeFileSync(p,bytes,{flag:'wx'});}return identify(p);};
const json=(name,o)=>write(name,JSON.stringify(o,null,2)+'\n');

const specification=check(path.join(corpus,'MaLv3/SPEC_J17_WORLD_FOLD_EFFECT_001_v0.1.0_PROPOSED.mal'),'E2A87BDC3E5A7AAC7B246F3CBBAF77F141689FCF6270D537ACC059F9E6BB9E9E',19195);
const promotion=check(path.join(corpus,'Markdowns/RECEIPT_PROMOTE_SPEC_J17_WORLD_FOLD_EFFECT_001_v0.1.0.md'),'E674B00C04B0B8119BFFD4596A756467B8054C9A6CF6741E3B2869365B7ECD9A',2634);
const authoring=check(path.join(corpus,'Python code/vectors.py'),'F5212A09A4FC7BA613C68B7E20255E25FDE527170D41BB77DC6F78164F95A3D9',2882);
const handoff=check(path.join(corpus,'Markdowns/HANDOFF_FLAG_WORLD_FIRST_TICK_2026-10-21.md'),'A9090321B24C4E004B3617E59787DE154A623EEDD644CE60CBCF3CF06C4149FB',13204);
const priorStop=check(path.join(root,'../fold_realization_j17_link_3_001/RUN_RECORD_FOLD_REALIZATION_J17_LINK_3_001.json'),'C6F83D545E599DE465C174D2980619EBB401288087BE7DFD504EE9B37FE1F54D',15139);
const prior=JSON.parse(fs.readFileSync(priorStop.path,'utf8'));
const inputs=Object.fromEntries(prior.inputs.map(i=>[i.id,check(path.join(prior.roots[i.root],i.path),i.sha256,i.bytes)]));
inputs.element_basis_receipt=check(path.join(kernel,'v3/software_fpga/constructed_universe_genesis_001/evidence/u01-execution-001/fold-receipt.bin'),'563F99BAC7E7DAE40317BAF7622D9B874FCB0DB792D823F528A71BAF8E653D93',100);
inputs.motif=check(path.join(workspace,'review_flag_world_002/hardware_carrier_012/parents/motif_junction_table_v1.h'),'25AF837405F450986FBD24A425D2197BD5E5D9D4BF952F74BE43CFB992B10F64',2859);
inputs.marker_ports=check(path.join(repo,'flag_world_001_first_tick/j17_step_021/source/marker_incidence.mal'),'10CDE160E3FC6A3A74A57E63465FE93FB2CA4010F75F44A601DCFB762411A1E1',3625);
const frozen=JSON.parse(fs.readFileSync(inputs.frozen_manifest.path,'utf8'));
assert.equal(frozen.files.length,901);
let frozenBytes=0;
for(const f of frozen.files){check(path.join(repo,f.destination_path),f.sha256,f.size);frozenBytes+=f.size;}
assert.equal(frozenBytes,1069571560);
const g2=JSON.parse(fs.readFileSync(inputs.g2.path,'utf8'));
const g1=JSON.parse(fs.readFileSync(inputs.g1.path,'utf8'));
assert.equal(g2.chain.length,2);
assert.deepEqual(g2.chain[0],g1.chain[0]);
assert.equal(g2.chain[0].record.prev,inputs.ground0.sha256.toLowerCase());
assert.equal(g2.chain[1].record.prev,g2.chain[0].link);
assert.equal(g2.chain[1].link,'173e0fa1d318de52472e31e3acf064bf92d9b313bdb4e52d2f4593ddd3631386');
const lawRanges=[['aggregate_spec',332,357],['aggregate_spec',591,617],['aggregate_spec',681,708],['fold_source',97,115],['fold_source',181,228],['reaction_contract',5,28],['fabric_execution_spec',66,106],['fabric_execution_spec',373,376]];
const quotes=lawRanges.map(([id,first,last])=>{const lines=fs.readFileSync(inputs[id].path,'utf8').split(/\r?\n/);const text=lines.slice(first-1,last).join('\n');return {input:id,source_sha256:inputs[id].sha256,first_line:first,last_line:last,text,quoted_utf8_sha256:sha(Buffer.from(text))};});
const lawText=json('LAW_TEXT_BINDINGS.json',{record:'J17_WORLD_FOLD_EFFECT_LAW_TEXT_BINDINGS_V1',specification:specification.sha256,verdict:'IF_THEN',scope:'Identity-bound text reading only; no new successor operation inferred',quote_encoding:'UTF-8; original logical lines joined by LF; no terminal newline in quoted digest; source whole-file identity retained',sources:inputs,quotes});

const packages={
  element_basis:['element_basis_receipt','fold_execution_manifest','carrier','A9_B3_promotion'],
  junction_ports:['motif','marker_ports','g2_program_source','g2_program'],
  grl_configuration:['carrier','A9_B3_promotion','g2','g2_runtime_state'],
  admissibility:['gpu_self_witness','gpu_self_witness_promotion','run018','run023','g2_drc_readback','g2_drc_source_map'],
  k_id_min:['frozen_manifest','carrier','ground0','g1','g2','gpu_self_witness']
};
const operands=Object.fromEntries(Object.entries(packages).map(([name,ids])=>[name,ids.map(id=>({id,...inputs[id]}))]));
const predecessorChain={ground0:inputs.ground0.sha256,g1:inputs.g1.sha256,g2:inputs.g2.sha256,links:g2.chain.map(x=>({link:x.link,prev:x.record.prev})),required_link3_prev:g2.chain[1].link};
const operandBinding=json('OPERAND_BINDINGS.json',{record:'J17_WORLD_FOLD_EFFECT_OPERAND_BINDINGS_V1',specification:specification.sha256,verdict:'IF_THEN',terminal:'BOUND',operands,predecessor_chain:predecessorChain,bound_sha256:sha(Buffer.from(canon({operands,predecessor_chain:predecessorChain}))),identity_comparison:'SAME',frozen_custody:{manifest:inputs.frozen_manifest,files:901,bytes:frozenBytes,comparison:'SAME'},scope:['Evidence packages bound by existing file identities; no basis inferred from flags','Existing admission and DRC carried, not rerun','k_id_min names the preserved-custody contact in the promoted spec; no new kernel extraction or future-transition preservation claimed','This is actual-file custody, not execution of V2 placeholder binding on a runtime','Canonical key order is serialization only; no successor selection or geometric orientation is derived from it']});

const source=fs.readFileSync(specification.path,'utf8');
const vectorRows=[];
for(const m of source.matchAll(/^\/\/ V([2-8])\s[^\n]*\r?\n\/\/     input  (.+)\r?\n\/\/     sha256 ([A-F0-9]{64}); (\d+) bytes\r?\n\/\/     expected (.+)\r?\n\/\/     expected_sha256 ([A-F0-9]{64}); (\d+) bytes/gm)){
  const [,n,ib,ih,il,ob,oh,ol]=m;assert.equal(sha(Buffer.from(ib)),ih);assert.equal(Buffer.byteLength(ib),Number(il));assert.equal(sha(Buffer.from(ob)),oh);assert.equal(Buffer.byteLength(ob),Number(ol));assert.equal(canon(JSON.parse(ib)),ib);assert.equal(canon(JSON.parse(ob)),ob);vectorRows.push({vector:'V'+n,input_sha256:ih,input_bytes:Number(il),expected_sha256:oh,expected_bytes:Number(ol),byte_custody:'SAME',execution:'NOT_RUN'});
}
assert.equal(vectorRows.length,7);
const vectorCustody=json('VECTOR_BYTE_CUSTODY.json',{record:'J17_WORLD_FOLD_EFFECT_VECTOR_BYTE_CUSTODY_V1',specification:specification.sha256,authoring_support:authoring,python_execution:'NO',payloads:14,comparison:'SAME',vector_conformance:'NOT_RUN',scope:'Checks frozen embedded bytes and encoding only. No bind/terminal classifier or world fold was executed. Spec lines192-193 delimit this scope.',vectors:vectorRows});
const sealedSpec=write(path.basename(specification.path),fs.readFileSync(specification.path));
const sealedReceipt=write(path.basename(promotion.path),fs.readFileSync(promotion.path));
const record=json('RUN_RECORD_SPEC_J17_WORLD_FOLD_EFFECT_001.json',{
  record:'RUN_RECORD_SPEC_J17_WORLD_FOLD_EFFECT_001',date:'2026-10-23',authority:{specification:sealedSpec,promotion:sealedReceipt,act:'EXECUTE_UNDER_DEVON_PROMOTION',assistant_promotion:'NO'},context:{handoff,prior_stop:priorStop},repository:{remote:'https://github.com/MetaCortex-Dynamics/mal-fabric.git',branch:'review/fold-realization-j17-link-3-001',head_before_seal:'3b703f6a2cd5227c497de2a02bfb693c9fe4d829',seal_authority:'receipt line44; local only',push:'NO'},
  obligations:[
    {id:'O_LAW_TEXT',verdict:'IF_THEN',evidence:lawText},
    {id:'O_OPERAND_BIND',verdict:'IF_THEN',evidence:operandBinding,scope:'Five evidence packages and predecessor chain; not future target admission'},
    {id:'O_FOLD_REALIZE',verdict:'MAYBE',terminal:'UNSUPPLIED',missing:'J17_WORLD_FOLD_EFFECT'},
    {id:'O_REENTRY',verdict:'MAYBE',execution:'NOT_RUN'},
    {id:'O_QUALIFY',verdict:'MAYBE',execution:'NOT_RUN'}
  ],
  terminal:{name:'UNSUPPLIED',missing:'J17_WORLD_FOLD_EFFECT',verdict:'MAYBE',stop_authority:'promoted spec lines75-77,182-187; receipt lines40-42',operand:'g2 field, incidence, intrinsic ports, runtime state, predecessor genealogy',absent_operation:'Source-owned derivation of successor active relations and their flag readings from the bound current realization; neither target effects nor a no-op fold result are supplied by inspected LAW/SRC/RXN',new_spec_contacts:[{lines:[72,77],reading:'Requires relation/fiber derivation and conditional return; names absent operation'},{lines:[95,98],reading:'Requires coupling/enough-for-fold to be read; does not supply a J17 readout producing successor effects'},{lines:[101,102],reading:'Explicitly excludes repeating THIS/SAME as a HELD witness'},{lines:[154,168],reading:'Explicit laws derive witness coordinates of the specification walk, not the world successor'},{lines:[182,185],reading:'Names the realization obligation and its stop; re-entry/qualification follow it'},{lines:[192,193],reading:'V2-V8 do not realize the fold or read LAW text'}],existing_contacts:[{input:'aggregate_spec',lines:[338,355],reading:'Reaction/conservation constraints'},{input:'aggregate_spec',lines:[681,708],reading:'Required relation/fiber inputs and outputs; no J17 incidence-to-effect transformation'},{input:'fold_source',lines:[97,115],reading:'F2 returns geometric basis; F3 retains its realization'},{input:'fold_source',lines:[189,215],reading:'Re-entry and terminal ElementBasis return'},{input:'reaction_contract',lines:[5,28],reading:'Consumes supplied target and transition evidence'},{input:'world_tick_consumer',lines:[4,24],reading:'Consumes proposal.target_candidate'},{input:'g2_commit_source',lines:[27,62],reading:'NO_FLAG_WRITE belongs to the existing THIS/SAME program, not an unrealized fold'}],boundary:'This terminal names the operation absent on the inspected source path. It does not revoke J17 admission, assert a corpus-wide absence, or decide that another law is required.'},
  source_inputs:inputs,
  qualification:{frozen_vector_byte_custody:vectorCustody,V1_CHECK_FORM:'NOT_RUN',V2_V8_execution:'NOT_RUN',CONFORM:'MAYBE',GPU:'NOT_RUN',gpu_invocations:0,replay:'NOT_RUN',new_program_DRC:'NOT_RUN',inherited_DRC:'I-VIII IF_THEN retained from RUN_RECORD_023; not a new-program result'},
  successor:{status:'NOT_PRODUCED',required_prev:g2.chain[1].link,state_hash:null,receipt:null,receipt_reading:null,link3:'NOT_COMMITTED',d_G:null},
  implementation:{new_world_fold_mal_files:[],custody_utility:identify(fileURLToPath(import.meta.url)),utility_scope:'File reading, hashing, byte copying and audit-record assembly only; not engine/runtime execution',python:'READ_AND_HASH_ONLY'},
  preservation:{frozen_files:901,frozen_comparison:'SAME',source_g2:'UNCHANGED',digital_ground_constructor:'NOT_READ_OR_RUN',hand:'NOT_SELECTED',A3_menu:'NOT_USED',board:'NO',original_spec_and_receipt:'UNCHANGED',prior_stop_record:'UNCHANGED'},
  result_scope:'One source-preflight run record under the newly promoted spec; no GPU fold result or world commit claimed'
});
const files=fs.readdirSync(root).filter(n=>n!=='SHA256SUMS').sort();
write('SHA256SUMS',files.map(n=>`${identify(path.join(root,n)).sha256}  ${n}\n`).join(''));
console.log(JSON.stringify({record,law_text:lawText.sha256,operands:operandBinding.sha256,vector_bytes:vectorCustody.sha256,inputs:Object.keys(inputs).length,frozen_files:901,terminal:'UNSUPPLIED(J17_WORLD_FOLD_EFFECT)',gpu:'NOT_RUN',python:'NOT_RUN'}));
