// Post-run observation/custody only. No runtime input, effect or link construction.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const parent=path.dirname(here),run=path.join(here,'run_001');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const need=(condition,message)=>{if(!condition)throw Error(message);};
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const canon=v=>JSON.stringify(canonical(v));
const hashObject=v=>sha(Buffer.from(canon(v))).toLowerCase();
async function identity(p){
 const stat=fs.statSync(p),h=crypto.createHash('sha256');
 for await(const chunk of fs.createReadStream(p))h.update(chunk);
 return{path:path.resolve(p),bytes:stat.size,sha256:h.digest('hex').toUpperCase()};
}
const save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const qualification=read(path.join(run,'QUALIFICATION.json'));
const commit=read(path.join(run,'NATIVE_COMMIT.json'));
const normalResult=read(path.join(run,'normal.RESULT.json'));
const observed=read(normalResult.observation.path),summary=observed.summary;
const after=read(path.join(here,'CUSTODY_AFTER.json'));
need(qualification.verdict==='IF_THEN'&&qualification.replay_closure==='SAME'&&qualification.reversal==='SAME','QUALIFICATION_REQUIRED');
need(summary.error===0&&summary.first_K===1&&summary.second_K===0&&summary.native_committed_returns===1,'TEST_P_NATIVE_TERMINALS');
need(summary.offer_comparison.member_domain==='SAME'&&summary.offer_comparison.content==='NOT-SAME'&&summary.offer_comparison.receipts==='NOT-SAME','TEST_P_OFFER_COMPARISON');
need(summary.trials.length===2&&summary.trials.every(t=>t.cases===1924&&t.complete_cases===1924),'TEST_P_COMPLETE_DOMAIN');
need(summary.second_trial.startsWith('RETURNED('),'TEST_P_RETURNED_NOT_RELOADED');
need(after.frozen_files===901&&after.frozen_comparison==='SAME'&&after.original_world_sha256==='E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059','CUSTODY_AFTER_REQUIRED');
need(after.head==='67f16aaa212a747012a6eec1a192517c66a64717'&&after.tracked_changes.length===0,'REPOSITORY_CUSTODY');
const sourcePath=path.join(parent,'j17_step_023/outputs/committed.world.json');
const source=read(sourcePath),successor=read(commit.artifact.path);
need(source.chain.length===2&&successor.chain.length===3&&canon(successor.chain.slice(0,2))===canon(source.chain),'ONE_LINK_PREFIX');
const last=successor.chain.at(-1);
need(last.record.prev===source.chain.at(-1).link&&last.link===hashObject(last.record)&&last.link===commit.link,'LINK_IDENTITY');
need(hashObject({field:successor.field,witness:successor.witness})===commit.pair_hash,'PAIR_IDENTITY');
need(successor.field.length===480&&successor.field.every(x=>x[1]==='NO')&&successor.witness.length===720&&successor.witness.every(x=>x[2]==='SAME'),'SUCCESSOR_CONTENT');
need(successor.receipt.discharged.length===12&&successor.receipt.opened.length===0&&last.record.receipt_reading==='THIS','RECEIPT_CONTENT');
const oldField=new Map(source.field.map(([f,r])=>[JSON.stringify(f),r]));
const changed=successor.field.filter(([f,r])=>oldField.get(JSON.stringify(f))!==r).map(([flag,to])=>({flag,from:oldField.get(JSON.stringify(flag)),to}));
need(changed.length===12,'CHANGED_FIELD_EXTENT');
need(summary.O1.source_pair_hash===hashObject({field:source.field,witness:source.witness})&&summary.O2.source_pair_hash===commit.pair_hash,'RETURNED_PAIR_SUBJECT');
need(commit.controls===undefined||commit.controls.altered_member==='WITHHELD','COMMIT_CONTROL');
const controlRecords=[];
for(const c of qualification.controls){
 const result=read(c.result.path),observation=read(result.observation.path),s=observation.summary;
 need(c.variant===result.variant,'CONTROL_VARIANT');
 if(c.variant==='missing_return'||c.variant==='missing_k_root')need(s.native_committed_returns===0&&s.second_trial===null,'MISSING_OPERAND_WITHHOLDS_RETURN');
 if(c.variant==='reload_g2')need(s.second_trial==='RELOADED_G2'&&s.second_K===1&&s.offer_comparison.content==='SAME','RELOADED_CONTROL_DISTINGUISHED');
 controlRecords.push({variant:c.variant,result:c.result,observation:result.observation,first_K:s.first_K,second_K:s.second_K,second_trial:s.second_trial,offer_comparison:s.offer_comparison});
}
need(controlRecords.length===3&&qualification.commit_controls.altered_member==='WITHHELD'&&qualification.commit_controls.wrong_head==='WITHHELD','ALL_CONTROLS_REQUIRED');
const manifestPath=path.join(here,'SHA256_MANIFEST_TEST_P_020.json');
const recordPath=path.join(here,'RUN_RECORD_TEST_P_020.json');
need(!fs.existsSync(manifestPath)&&!fs.existsSync(recordPath),'PRESERVE_EXISTING_RECORD');
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else if(entry.isFile())files.push(p);}}
walk(here);files.sort();
const artifacts=[];for(const p of files)artifacts.push(await identity(p));
save(manifestPath,{schema:'SHA256_TEST_P_020',scope:'All existing additive Test P artifacts, including preflight and retained partial attempts; manifest and final record excluded to avoid self-reference',files:artifacts});
const record={
 schema:'RUN_RECORD_TEST_P_020',date:'2026-10-25',verdict:'IF_THEN',terminal:'MOVED',
 subject:'GPU-owned pair-world proposer re-entry: g2 -> one committed successor -> renewed PROPOSE on that RETURNED pair',
 scope:{offer_domain:'1924 incidence-fibre assignments, exact native inventory and complete receipts on both states',ticks:'First tick commits link 3; second pass enumerates and witnesses K empty; no second link appended',not_claimed:['Unbounded autonomous execution','Full FABRIC_STATE phase recurrence','Fixed four-tick period','Resonance or K-admissible outward/back cycle','New law promotion']},
 authority:{request:await identity(path.join(here,'REQUEST.json')),promote_binding:await identity(path.join(parent,'j17_tick_promote_binding_013/RECORD_J17_TICK_PROMOTE_BINDING_013.mal'))},
 input:{world:await identity(sourcePath),pair_hash:summary.O1.source_pair_hash,prior_head:commit.prior_head,links:2},
 output:{world:await identity(commit.artifact.path),pair_hash:commit.pair_hash,link:commit.link,prev:last.record.prev,links:3,field:{THIS:0,NO:480},witness:{SAME:720,NOT_SAME:0},receipt:{discharged:12,opened:0,retained:0,reading:'THIS',sha256:commit.receipt_hash},changed},
 proposer:{O1:summary.O1,O2:summary.O2,offer_hash_subject:'Source pair identity, member assignment and exact receipts; excludes tick hashes and context constructors',offer_comparison:summary.offer_comparison,first_K:summary.first_K,second_K:summary.second_K,native_cardinality:observed.fold,second_trial:summary.second_trial,native_return:commit.native_return,native_world:commit.native_world,proof_validation:summary.proof_validation,hash_service:summary.commit.hash_service,proof_custody:'All native facts checked against image rules and supports in bound raw readback; compact ancestry export covers its named roots, not the entire closure'},
 qualification:{artifact:await identity(path.join(run,'QUALIFICATION.json')),replay_readbacks:'SAME',reversed_declaration_closure:'SAME',controls:controlRecords,commit_controls:qualification.commit_controls,independent_receipts:summary.independent_receipts},
 custody:{before:await identity(path.join(here,'CUSTODY_BEFORE.json')),after:await identity(path.join(here,'CUSTODY_AFTER.json')),frozen_files:901,frozen_comparison:'SAME',original_g2:'SAME',git:{branch:after.branch,head:after.head,commit:'NOT_RUN',push:'NOT_RUN'},board_action:'NOT_RUN',law_promotion:'NOT_RUN'},
 artifacts:{manifest:await identity(manifestPath),file_count:artifacts.length,normal:await identity(path.join(run,'normal.RESULT.json')),observations:await identity(normalResult.observation.path),native_commit:await identity(path.join(run,'NATIVE_COMMIT.json'))}
};
save(recordPath,record);console.log(JSON.stringify({record:await identity(recordPath),manifest:await identity(manifestPath),link:commit.link,pair_hash:commit.pair_hash,O1:summary.O1.content_sha256,O2:summary.O2.content_sha256,verdict:record.verdict}));
