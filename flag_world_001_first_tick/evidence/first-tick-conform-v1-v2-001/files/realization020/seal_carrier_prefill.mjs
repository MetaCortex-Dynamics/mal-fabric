// Custody packaging of an already executed source closure; no world derivation.
// No expected vector file or independent reference index is a runtime input.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));
const prior=path.join(root,'ref012_indexed_qualification');
const gpu=path.join(prior,'gpu'),out=path.join(root,'carrier_prefill_001');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=p=>{const b=fs.readFileSync(p);return {path:p,bytes:b.length,sha256:sha(b)};};
const bindings={
 'source.mal':'A5729729A8636C16DA1AC84476C6B32E5CD443BE506BE7068CCB53FB57792A8F',
 'source-map.json':'616A81F266115C37BDD3316A35F7BA068A79FEE978D7E27C114B55C1C2BFD4D1',
 'image.bin':'7509314A34D0607B62F83D1AA048802B1108E9CA58A342908CF3603217EB5399',
 'readback.bin':'ECED361A61D4D9FA514DE0E6E2EE3ECFFC975F2BFE4C68D960DEED2E3BE08D8B',
 'source-occurrence-custody.json':'47BCB22CBD67576D8BB93C021A6448D6952DDA5468FEB1B2E5DDBDC4A03C7872'
};
if(fs.existsSync(out))throw Error('PRESERVE_EXISTING_PREFILL');
for(const [name,expected] of Object.entries(bindings))if(identity(path.join(gpu,name)).sha256!==expected)throw Error('PREFILL_INPUT_NOT_SAME: '+name);
if(identity(path.join(gpu,'readback.disjoint.bin')).sha256!==bindings['readback.bin'])throw Error('REPLAY_NOT_SAME');
const map=JSON.parse(fs.readFileSync(path.join(gpu,'source-map.json')));
if((map.inputs||[]).length)throw Error('CARRIER_PREFILL_HAS_EXTERNAL_INPUT');
const guard=path.join(root,'prefill_guard.mjs');
const guards={};
// Audit first, before creating the package. The guard proves every fact against
// its original rule/support and checks all retained seeds and target prefixes.
for(const vector of ['V1','V2']){
 const next=path.join(root,'vectors',vector,'stage01','image');
 const args=['--previous-map',path.join(gpu,'source-map.json'),'--previous-image',path.join(gpu,'image.bin'),'--previous-readback',path.join(gpu,'readback.bin'),'--next-map',path.join(next,'source-map.json'),'--next-image',path.join(next,'image.bin')];
 const report=JSON.parse(execFileSync(process.execPath,[guard,...args],{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024}));
 if(report.guard!=='IF_THEN'||report.checkpoint_proofs!=='SAME')throw Error('IMPORT_PROOF_NOT_SAME');
 guards[vector]=report;
}
const raw=fs.readFileSync(path.join(gpu,'readback.bin'));
const word=i=>raw.readInt32LE(i*4),NT=word(2),terms=word(5),facts=word(6);
const inventory={},ruleUse={},seedFacts=[];
for(let i=0;i<facts;i++){
 const at=8+NT*10+i*12,term=word(at),rule=word(at+1),tp=8+term*10;
 const arity=word(tp+1),head=arity?word(tp+2):term,hp=8+head*10;
 const tag=word(hp+1)===0?map.symbols[word(hp)]:map.symbols[word(tp)];
 inventory[tag]=(inventory[tag]||0)+1;
 if(rule<0)seedFacts.push(i);else ruleUse[map.rules[rule].name]=(ruleUse[map.rules[rule].name]||0)+1;
}
fs.mkdirSync(out);
const members={};
for(const [name,expected] of Object.entries(bindings)){
 const p=path.join(out,name);fs.copyFileSync(path.join(gpu,name),p,fs.constants.COPYFILE_EXCL);
 members[name]=identity(p);if(members[name].sha256!==expected)throw Error('COPY_NOT_SAME');
}
for(const [vector,report] of Object.entries(guards)){
 const p=path.join(out,vector+'_IMPORT_GUARD.json');fs.writeFileSync(p,JSON.stringify(report,null,2)+'\n',{flag:'wx'});members[vector+'_IMPORT_GUARD.json']=identity(p);
}
const record={
 scope:'CUSTODY_SEAL_OF_REUSABLE_DERIVED_CARRIER_CHECKPOINT; NO_PROMOTION; NOT_CONFORM',
 seal_version:1,
 members,
 execution_input:'program image plus this proof-carrying starting state; the target program-image bytes need not change',
 facts,terms,source_seed_facts:seedFacts.length,derived_facts:facts-seedFacts.length,retained_rules:map.rules.length,epochs:word(7),
 inventory,rule_use:ruleUse,
 derived_fact_treatment:'Original rule, support, rank and term identities retained. Derived facts are not rewritten as authority seeds.',
 imported_inputs:[],
 excluded:['independent reference index','vector readings and correspondence contexts','current/genesis field','placement','JTP','committed world output','expected vector bytes'],
 split:{
  carrier_only:'Exact012 prefix: incidence, refinement, moves, overlap pairs and source-bound structural order/parent relations.',
  carrier_only_not_in_checkpoint:'Hardware observation encoding after the012 prefix remains derived.',
  correspondence:'Retains vector field/kappa and checked current-field ancestry; not part of the carrier-only prefill.',
  vector_dependent:'Offered/candidate fields, gluing, changes, counts, suffix checks, runtime and commit remain derived.'
 },
 used_term_bytes_sha256:sha(raw.subarray(32,32+terms*40)),
 used_fact_bytes_sha256:sha(raw.subarray(32+NT*40,32+NT*40+facts*48)),
 evidence_only:{
  original_execution:identity(path.join(prior,'EXECUTION.json')),
  observed_execution:identity(path.join(prior,'OBSERVED_EXECUTION.json')),
  independent_full_set_comparison:identity(path.join(prior,'ReferenceComparison.json')),
  disjoint_replay:identity(path.join(gpu,'readback.disjoint.bin'))
 },
 guard:identity(guard),packager:identity(fileURLToPath(import.meta.url)),
 qualification:'PENDING_SEPARATE_CACHED_VS_CLEAN_GPU_QUALIFICATION',
 repository_action:'NONE'
};
const manifest=path.join(out,'PREFILL_MANIFEST.json');fs.writeFileSync(manifest,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({manifest:identity(manifest),facts,terms,seeds:seedFacts.length,derived:facts-seedFacts.length,qualification:record.qualification}));
