// Observer-only comparison with the retained009 readback projections.
// No field update, offer membership, admission, selection or commit is computed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
const out='D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const id=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
const read=p=>JSON.parse(fs.readFileSync(p));
const need=(x,m)=>{if(!x)throw Error(m);};
const save=(p,o)=>fs.writeFileSync(p,JSON.stringify(o,null,2)+'\n',{flag:'wx'});
const prior=path.join(root,'j17_section_diagnostic_009/run_002');
const oldRecord=id(path.join(prior,'RUN_RECORD_009.json'));
need(oldRecord.sha256==='949E23F8F7F2C493F9DB8A0B733C98FA993D5FF32F4EFCA0219165C0ADA27090','PRIOR_RECORD_NOT_SAME');
const previous=read(path.join(prior,'SITE_SECTIONS_AND_RECEIPTS.json'));
const current=read(path.join(out,'FIBRE_ASSIGNMENTS_AND_RECEIPTS.json'));
const record=read(path.join(out,'RUN_RECORD_010.json'));
need(record.replay_comparison==='SAME'&&record.error===0,'CURRENT_NOT_QUALIFIED');
const j=JSON.stringify, key=c=>j([c.family,c.operands]);
const now=new Map(current.cases.map(c=>[key(c),c]));
function projection(rows){return rows.map(row=>{const copy={...row};delete copy.fact;delete copy.origin;delete copy.support;return j(copy);}).sort();}
const comparisons=[];
for(const before of previous.cases){const after=now.get(key(before));need(after,'MISSING_PRIOR_CASE');const result={family:before.family,operands:before.operands,fields:{}};
 for(const field of ['field','overlaps','opened','discharged','retained','changed']){
  const a=j(projection(before[field])),b=j(projection(after[field]));need(a===b,'NOT_SAME_OUTPUT '+key(before)+' '+field);
  result.fields[field]={rows:before[field].length,sha256:sha(a),comparison:'SAME'};
 }
 need(before.strict.length===after.strict.length,'NOT_SAME_STRICT');
 need(j(projection(before.excluded))===j(projection(after.excluded)),'NOT_SAME_EXCLUSION');
 comparisons.push(result);
}
const repo=path.dirname(root),frozenPath=path.join(root,'j17_runs_021_023_seal/FROZEN_REHOME_MANIFEST_001.json');
const frozen=read(frozenPath), differences=[];
for(const x of frozen.files){const actual=id(path.join(repo,x.destination_path));if(actual.bytes!==x.size||actual.sha256!==x.sha256)differences.push({path:x.destination_path,actual});}
need(differences.length===0&&frozen.files.length===901,'FROZEN_NOT_SAME');
save(path.join(here,'BASELINE_QUALIFICATION.json'),{schema:'FibreDiagnostic010BaselineQualification',prior_record:oldRecord,current_record:id(path.join(out,'RUN_RECORD_010.json')),case_count:comparisons.length,comparison:'SAME',comparisons,frozen:{manifest:id(frozenPath),count:901,comparison:'SAME',differences},worldline:'UNCHANGED'});
save(path.join(here,'FINAL_BINDING.json'),{schema:'J17FibreDiagnosticFinalBinding010',run_record:id(path.join(out,'RUN_RECORD_010.json')),baseline_qualification:id(path.join(here,'BASELINE_QUALIFICATION.json')),contract_read:id(path.join(here,'CONTRACT_READ.json')),sources:[id(path.join(here,'source/fibres.mal')),id(path.join(here,'run.mjs')),id(fileURLToPath(import.meta.url))],result:{site_cases:record.summary.site_cases,edge_cases:record.summary.edge_cases,triad_cases:record.summary.triad_cases,strict:record.summary.fibre_strict,facts:record.facts,epochs:record.epochs,error:record.error,replay:record.replay_comparison},readback:record.readback,replay:record.replay,diagnostic:'IF_THEN: complete requested484-case family',worldline:'UNCHANGED: O_COORDINATE_FIBRE_ACTION_OFFER_CORRESPONDENCE remains MAYBE; no successor chosen or appended',authority:'No new DECIDE requested; no PROMOTE performed',repository:'No repository commit or push'});
console.log(j({qualification:id(path.join(here,'BASELINE_QUALIFICATION.json')),cases:comparisons.length,comparison:'SAME',frozen:901,record:id(path.join(out,'RUN_RECORD_010.json'))}));
