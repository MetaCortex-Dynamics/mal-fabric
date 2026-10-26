// Custody audit and public-entrypoint checks only. No staging, commit, seal, or push.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,hash} from './check_form_promote.mjs';
const project=path.dirname(root),repo=path.dirname(project);
const resultFile=path.join(root,'BINDING_RECORD_024.json');
if(fs.existsSync(resultFile))throw new Error('Binding record already present.');
const bind=p=>{const b=fs.readFileSync(p);return {path:p.replaceAll('\\','/'),size:b.length,sha256:hash(b)};};
const git=args=>{
 const r=spawnSync('git',['-C',repo,...args],{maxBuffer:4*1024*1024,windowsHide:true});
 if(r.status!==0)throw new Error(r.stderr.toString());return r.stdout;
};
const tests=[],check=(id,condition,detail)=>tests.push({id,comparison:condition?'SAME':'NOT_SAME',detail});
const expectedHead='f099abe4e1708fc90edc09f04b2f855eb48c161b';
const erratum='E93318BCB508733174FB5D4D7622BF8F1ABFD80A8D6F6CC79FF4DA0C6E337BCC';
const receipt='19AD057BD1C3F3EF27480F8D292A54EC6E5FAE518BBFF0AAB17BE0E4C8D17B65';
const entries={
 handoff:'C:/Users/devon/Desktop/MaL/Markdowns/HANDOFF_FLAG_WORLD_FIRST_TICK_2026-10-21.md',
 packet:path.join(project,'world_transition_contacts_007/README.md'),
 skill:'C:/Users/devon/.agents/skills/synced/3bfc4f6d-7353-40b2-a2b3-75de649ef19e_71f39d80-8f16-485f-a606-0aa085360c46/mal-compliance/SKILL.md'
};
for(const [name,p] of Object.entries(entries)){
 const s=fs.readFileSync(p,'utf8');
 check(`${name}_full_bindings`,s.includes(erratum)&&s.includes(receipt),bind(p));
}
const skill=fs.readFileSync(entries.skill,'utf8');
const skillBefore=fs.readFileSync(path.join(root,'entrypoint_preimages/mal-compliance.SKILL.md'),'utf8');
const front=s=>s.match(/^---\r?\n[\s\S]*?\r?\n---/u)?.[0];
check('skill_frontmatter_unchanged',front(skill)===front(skillBefore)&&front(skill)?.includes('name: mal-compliance'),null);
const strip=s=>s.replace(/### Promoted first-shape vocabulary binding \(2026-10-25\)[\s\S]*?(?=### Recovery Procedure)/u,'').replaceAll('\r\n','\n');
check('skill_unrelated_text_unchanged',strip(skill)===skillBefore.replaceAll('\r\n','\n'),null);
const handoff=fs.readFileSync(entries.handoff,'utf8');
const oldHandoff=fs.readFileSync(path.join(root,'entrypoint_preimages/HANDOFF.md'),'utf8');
const without=handoff.replace(/## Current vocabulary binding — 2026-10-25[\s\S]*?(?=```text\r?\nSTATUS)/u,'');
check('handoff_historical_body_unchanged',without.replaceAll('\r\n','\n')===oldHandoff.replaceAll('\r\n','\n'),null);
for(const name of ['MANIFEST.json','READOUT.json','VERIFICATION.json','verify_contacts.mjs']){
 const rel=`flag_world_001_first_tick/world_transition_contacts_007/${name}`;
 check(`historical_packet_${name}`,git(['show',`HEAD:${rel}`]).equals(fs.readFileSync(path.join(repo,rel))),bind(path.join(repo,rel)));
}
const packetRoot=path.join(project,'world_transition_contacts_007');
const packet=JSON.parse(fs.readFileSync(path.join(packetRoot,'MANIFEST.json')));
const packetChanged=packet.contacts.filter(f=>hash(fs.readFileSync(path.join(packetRoot,f.path)))!==f.sha256);
check('historical_packet_contacts',packetChanged.length===0,{count:packet.contacts.length,not_same:packetChanged.map(f=>f.path)});
const frozenPath=path.join(project,'j17_runs_021_023_seal/FROZEN_REHOME_MANIFEST_001.json');
if(hash(fs.readFileSync(frozenPath))!=='F7CADDA1C99DE37E9AF00D5429BA34600ACFF421A3FC4C5622FD8F239DF19560')throw new Error('NOT_SAME frozen manifest');
const frozen=JSON.parse(fs.readFileSync(frozenPath));
const changed=[];
for(const f of frozen.files){const b=fs.readFileSync(path.join(repo,f.destination_path));if(b.length!==f.size||hash(b)!==f.sha256)changed.push(f.destination_path);}
check('frozen_901',frozen.files.length===901&&changed.length===0,{count:frozen.files.length,not_same:changed});
const cli=[];
for(const [id,input,kind,expectedCode] of [
 ['public_erratum',path.join(root,'inputs/ERRATUM_E_FIRST_SHAPE_NO_PIECES_001.mal'),'erratum',0],
 ['public_retired',path.join(root,'qualification_001/retired_domain.mal'),'specification',1]
]){
 const out=path.join(root,id);
 const r=spawnSync('pwsh',['-NoProfile','-File',path.join(project,'CHECK_FORM_PROMOTE.ps1'),'-InputFile',input,'-RecordKind',kind,'-OutputDirectory',out],{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:4*1024*1024});
 check(id,r.status===expectedCode,{exit_code:r.status,expected_code:expectedCode,stdout:r.stdout,stderr:r.stderr});
 if(fs.existsSync(path.join(out,'CHECK_FORM_PROMOTE.json')))cli.push(bind(path.join(out,'CHECK_FORM_PROMOTE.json')));
}
check('HEAD_unchanged',git(['rev-parse','HEAD']).toString().trim()===expectedHead,expectedHead);
check('no_tracked_diffs',git(['diff','HEAD','--name-only']).length===0,null);
const files=['source/check_form_promote.mal','check_form_promote.mjs','qualify.mjs','prepare.mjs','audit.mjs','README.md','INPUT_CUSTODY.json','qualification_001/RUN_RECORD_PROMOTION_CHECK_024.json',
 'inputs/ERRATUM_E_FIRST_SHAPE_NO_PIECES_001.mal','inputs/RECEIPT_PROMOTE_ERRATUM_E_FIRST_SHAPE_NO_PIECES_001_v0.1.3.md'].map(p=>bind(path.join(root,p)));
const record={kind:'BINDING_RECORD_024',authority:'Devon promotion recorded by receipt; Codex executes entry-point and checker integration only',
 erratum_sha256:erratum,receipt_sha256:receipt,entrypoints:Object.fromEntries(Object.entries(entries).map(([k,p])=>[k,bind(p)])),
 additional_entrypoints:[bind(path.join(project,'CHECK_FORM_PROMOTE.ps1')),bind(path.join(packetRoot,'PROMOTION_BINDINGS_024.json'))],
 files,cli_records:cli,checks:tests,terminal:tests.every(t=>t.comparison==='SAME')?'IF_THEN':'NOT_SAME',
 repository:{head:expectedHead,branch:git(['branch','--show-current']).toString().trim(),seal:'NOT_PERFORMED',staging:'NOT_PERFORMED',commit:'NOT_PERFORMED',push:'NOT_PERFORMED'},
 worldline:'UNCHANGED',promotion:'RECEIPT_BOUND; no new attestation performed',scope:'This mal-fabric promotion-check entrypoint; no automatic hook in every historical script'};
fs.writeFileSync(resultFile,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({terminal:record.terminal,sha256:hash(fs.readFileSync(resultFile)),checks:tests.length,not_same:tests.filter(t=>t.comparison!=='SAME')}));
if(record.terminal!=='IF_THEN')process.exitCode=1;
