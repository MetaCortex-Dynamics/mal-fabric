// Read-only custody checker and record formatter. NOT a MaL runtime.
// No file writes, world transitions, native projections, grants or seals.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),pkg=path.dirname(here),repo=path.dirname(pkg);
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const j=x=>JSON.stringify(canonical(x)),sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase(),digest=x=>sha(Buffer.from(j(x))).toLowerCase();
const checks=[],contacts=[];
function check(name,condition){if(!condition)throw Error('NOT_SAME: '+name);checks.push({name,verdict:'SAME'});}
function input(name,file,expected){const b=fs.readFileSync(file),h=sha(b);check(name+'_sha256',h===expected);contacts.push({name,path:file.replaceAll('\\','/'),bytes:b.length,sha256:h});return b;}
const world=JSON.parse(input('g2',path.join(pkg,'j17_step_023/outputs/committed.world.json'),'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'));
input('keep_one_run','D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/RUN_RECORD_010.json','2AD351F73AF9C7046C6883E0EF1C29180F272DAF9EDE5047630E242743F9A053');
const one=JSON.parse(input('keep_one_export','D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/FIBRE_ASSIGNMENTS_AND_RECEIPTS.json','3CF8EBD03172E056852399AC472605EFEA3704EB6EB71A6EFFB259A2566B4147'));
input('keep_two_run','D:/mal_worldline_backups/j17_pair_diagnostic_011/run_001/RUN_RECORD_011.json','35334015AC81697383480FAE210DE3CC1AF06FEBD75079761E280BCF948EE518');
const two=JSON.parse(input('keep_two_export','D:/mal_worldline_backups/j17_pair_diagnostic_011/run_001/PAIR_ASSIGNMENTS_AND_RECEIPTS.json','BF21091472DA1C4E61B4D75F3F27E8E9C48BE67742C8A6DC9DECE2D783BF981F'));
input('engine_v020',path.join(pkg,'world_transition_contacts_007/contacts/Markdowns/SPEC_FLAG_WORLD_ENGINE_V3_001_v0.2.0.md'),'B2A3CE4E4639B53EDC10573F54DF8F8CBD0351D67670790F28F1313190ED924C');
input('a7',path.join(pkg,'world_transition_contacts_007/contacts/Markdowns/PROMOTION_RECORD_A1-A10.md'),'27C995BDB06B1AE6F87D727FFD0853AD3DF0ADEA13428D1EBF0B9A06FB0BB805');
input('pdpe_record_v011',path.join(pkg,'j17_gate_reading_binding_012/contacts/RECORD_J17_REACTION_PDPE_001_v0.1.1.mal'),'B5DBC1EF843B9203EE9F7434651B2ABF66059D83D38565DFD13501A2C1BCCA88');
input('receipt_reading_001',path.join(pkg,'verification_kit_001/contracts/governance/SPEC_FLAG_WORLD_FIRST_TICK_001_v0.1.3_PROPOSED.mal'),'2ECF2EEF9A8901DA9C802922BEBE1F74C367D7A74E5B773528504B73854C1A01');
input('d2_reference',path.resolve(repo,'../flag_world_first_tick_001/D2/tick.py'),'535535DA2474B13B9B2D6C6FC9508C25D43FF2B406066540D76FF5E2AA19C7DA');
input('sheaf','C:/Users/devon/Desktop/MaL/MaLv3/sheaf.mal','E4C25D91259A3C3E68414923552681B6C887A79F64260B957352D97485B9AE75');
input('junction_spec_v03','C:/Users/devon/Desktop/MaL/Markdowns/SPEC-JUNCTION-001-GOVERNED-COREALIZATION-PROTOCOL_v0.3.md','9A82BC60519DBA3793C66ED51A31501C953D4B2016F5F96D02710C6BEEB6BAB3');
input('located_ordinal_v010','C:/Users/devon/Desktop/MaL/MaLv3/WITNESS_ORDINAL_001.mal','186BA7F3AD4C1CD344197B6BF195FA234F52FC6DC2DB171378F5B510BA8845EA');
input('abi_receipt_v034','C:/Users/devon/Desktop/MaL/Markdowns/RECEIPT_PROMOTE_SPEC-PHASE2-CFU-ABI-001_v0.3.4.md','9406E760E7EA118245E69C4D6D0425E2761C517DE2B2EB5386CBAF52ADFFDE9D');
check('two_committed_links',world.chain.length===2);
for(let i=0;i<world.chain.length;i++){
 const {link,record}=world.chain[i];
 check('link_'+(i+1)+'_hash',digest(record)===link);
 check('link_'+(i+1)+'_pair',digest({field:record.field,witness:record.witness})===record.pair_hash);
 check('link_'+(i+1)+'_receipt',digest(record.receipt)===record.receipt_hash);
 check('link_'+(i+1)+'_prev',record.prev===(i?world.chain[i-1].link:'b263644e59a696999c02dfd25386a5abefdb2d0fc4317a0fe2cccd90502ebad3'));
}
const head=world.chain.at(-1).link;
check('link_2_bound_head',head==='173e0fa1d318de52472e31e3acf064bf92d9b313bdb4e52d2f4593ddd3631386');
check('world_link_2_subject',j({field:world.field,witness:world.witness})===j({field:world.chain[1].record.field,witness:world.chain[1].record.witness}));
const ordinary=one.cases.map((value,index)=>({value,index})).filter(({value})=>['SITE','EDGE','TRIAD'].includes(value.family));
check('keep_one_484_excludes_three_controls',ordinary.length===484&&one.cases.length===487);
check('keep_two_1440',two.cases.length===1440);
const strict=ordinary.filter(({value})=>value.strict.length);
check('one_strict_case_275',strict.length===1&&strict[0].index===275);
check('keep_two_no_strict',two.cases.every(c=>c.strict.length===0));
const member=strict[0].value;
check('section_not_lift',member.family==='SITE'&&j(member.operands)===j(['C:HW_04|HW_09','NO']));
check('gpu_support_present',member.strict.length===1&&member.strict[0].origin==='SC_STRICT'&&member.coverage.length===1&&member.coverage[0].origin==='SC_COMPLETE');
// Existing readback columns, in established world order; no newly executed field operation.
const f=new Map(member.field.map(row=>[j(row.flag),row.reading])),o=new Map(member.overlaps.map(row=>[j(row.overlap),row]));
check('member_field_domain',member.field.length===480&&f.size===480&&world.field.length===480&&world.field.every(([flag])=>f.has(j(flag))));
check('member_overlap_domain',member.overlaps.length===720&&o.size===720&&world.witness.length===720&&world.witness.every(([a,b])=>o.has(j([a,b]))));
const pair={field:world.field.map(([flag])=>[flag,f.get(j(flag))]),witness:world.witness.map(([a,b])=>[a,b,o.get(j([a,b])).after])};
check('readback_before_matches_g2',world.witness.every(([a,b,r])=>o.get(j([a,b])).before===r));
check('candidate_uniform_no',pair.field.every(([,r])=>r==='NO'));
check('candidate_witness_all_same',pair.witness.every(([,,r])=>r==='SAME'));
check('candidate_witness_matches_readings',pair.witness.every(([a,b,r])=>r===(f.get(j(a))===f.get(j(b))?'SAME':'NOT_SAME')));
const receipt={discharged:[],opened:[]},retained=[];
for(const [a,b,before] of world.witness){const after=o.get(j([a,b])).after;
 if(before==='NOT_SAME'&&after==='SAME')receipt.discharged.push([a,b]);
 if(before==='SAME'&&after==='NOT_SAME')receipt.opened.push([a,b]);
 if(before==='NOT_SAME'&&after==='NOT_SAME')retained.push([a,b]);
}
const setKey=rows=>rows.map(j).sort();
for(const [key,pairs] of [['discharged',receipt.discharged],['opened',receipt.opened],['retained',retained]])check('gpu_'+key+'_set',j(setKey(pairs))===j(setKey(member[key].map(row=>row.overlap))));
check('receipt_12_0_0',receipt.discharged.length===12&&receipt.opened.length===0&&retained.length===0);
const edits=world.field.filter(([flag,r])=>f.get(j(flag))!==r).map(([flag])=>flag);
check('changed_flags_exact_j17_site',edits.length===12&&edits.every(flag=>flag[0]===member.operands[0])&&j(setKey(edits))===j(setKey(member.changed.map(row=>row.flag))));
check('candidate_pair_not_same',digest(pair)!==world.chain[1].record.pair_hash);
const binding={
 record:'J17_TICK_PROMOTE_BINDING_013',scope:'PRE_EXECUTE_TICK_BINDING; NOT_LAW_PROMOTION; NOT_GLOBAL_SECTION; NOT_WORLD_COMMIT',
 source:{file_sha256:contacts[0].sha256,pair_hash:world.chain[1].record.pair_hash},whence:head,prior_head:head,
 enactment:{kind:'SECTION_READING',fibre_kind:'SITE',site:member.operands[0],reading:member.operands[1],member_reference:{input:'keep_one_export',json_pointer:'/cases/275',canonical_record_sha256:digest(member).toUpperCase(),case_fact:member.case_fact,strict_support:member.strict,coverage_support:member.coverage}},
 receipt,receipt_hash:digest(receipt),receipt_reading:'THIS',retained,
 successor_identity:{subject:'{field,witness}',pair_hash:digest(pair),field_hash:digest(pair.field),witness_hash:digest(pair.witness),field_entries:480,witness_entries:720,
 provenance:'Existing GPU member flag/reading and overlap/after columns; established g2 array order',encoding:'UTF-8 sorted-object-key compact JSON; world-pair observation encoding, NOT LocalSection CANONICAL_BYTES'},
 execution:'NOT_RUN',local_sections:'NOT_RUN',global_section:'NOT_RUN',new_link:'NOT_WRITTEN'
};
const negatives=[];
for(const [name,mutate] of [
 ['source',x=>{x.source.file_sha256='0'.repeat(64)}],['head',x=>{x.prior_head=world.chain[0].link}],['whence',x=>{x.whence=world.chain[0].link}],
 ['lift_substitution',x=>{x.enactment.kind='A3_LIFT'}],['member',x=>{x.enactment.member_reference.canonical_record_sha256='0'.repeat(64)}],
 ['receipt',x=>{x.receipt.discharged.pop()}],['successor',x=>{x.successor_identity.pair_hash=x.source.pair_hash}],['premature_execute',x=>{x.execution='EXECUTED'}]
]){const changed=structuredClone(binding);mutate(changed);check('negative_'+name,j(changed)!==j(binding));negatives.push({name,verdict:'NOT_SAME',scope:'Exact binding-equality check; NOT native CHECK_FORM or section admission'});}
const frozenPath=path.join(pkg,'j17_runs_021_023_seal/FROZEN_REHOME_MANIFEST_001.json'),frozenBytes=fs.readFileSync(frozenPath),frozen=JSON.parse(frozenBytes);
check('frozen_count_901',frozen.file_count===901&&frozen.files.length===901);
for(const row of frozen.files){const b=fs.readFileSync(path.join(repo,row.destination_path));if(b.length!==row.size||sha(b)!==row.sha256.toUpperCase())throw Error('NOT_SAME frozen '+row.destination_path);}
check('frozen_901_same',true);
check('g2_unchanged_at_end',sha(fs.readFileSync(contacts[0].path))===contacts[0].sha256);
const output={scope:'READBACK_CUSTODY_AND_PRE_EXECUTE_BINDING_ONLY; NO_ENGINE_EXECUTION',encoding:'Observation hashes: sorted-object-key compact JSON. File hashes: raw bytes.',binding,contacts,
 observations:{keep_one:484,keep_two:1440,combined:1924,excluded_controls:3,strict_keep_one:1,strict_keep_two:0,changed_flags:edits.length,discharged:12,opened:0,retained:0,link_count_before:2,link_count_after:2},
 frozen:{manifest_path:frozenPath.replaceAll('\\','/'),manifest_sha256:sha(frozenBytes),files:901,verdict:'SAME'},checks,negative_checks:negatives};
if(process.argv.includes('--emit'))console.log(JSON.stringify(output,null,2));
else if(process.argv.includes('--verify')){
 const stored=fs.readFileSync(path.join(here,'BINDING_EVIDENCE.json'));
 const same=j(JSON.parse(stored))===j(output);if(!same)throw Error('NOT_SAME saved_evidence');
 console.log(JSON.stringify({verdict:'SAME',evidence_sha256:sha(stored),observer_sha256:sha(fs.readFileSync(fileURLToPath(import.meta.url))),comparisons:checks.length+1,negative_checks:negatives.length,frozen:output.frozen,
 pair_before:binding.source.pair_hash,pair_after:binding.successor_identity.pair_hash,receipt_hash:binding.receipt_hash,member_hash:binding.enactment.member_reference.canonical_record_sha256,sections:'NOT_RUN',world_commit:'NOT_RUN',link_count:world.chain.length},null,2));
}else throw Error('Use --emit or --verify; this observer never writes files.');
