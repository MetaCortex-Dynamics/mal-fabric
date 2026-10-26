// Qualification transport: immutable fixtures, native checks, byte/result comparisons.
import fs from 'node:fs';
import path from 'node:path';
import {runCheck,root,hash} from './check_form_promote.mjs';
const out=path.resolve(root,process.argv[2]||'qualification_001');
if(fs.existsSync(out))throw new Error('Fresh output directory required.');
fs.mkdirSync(out,{recursive:true});
const records=[],tests=[];
const check=(id,condition,detail)=>tests.push({id,comparison:condition?'SAME':'NOT_SAME',detail});
const run=(id,input,kind='specification',baseline=false)=>{
 const r=runCheck({input,kind,baseline,out:path.join(out,id)});
 records.push({id,input:r.input,result:r.result,record_sha256:hash(fs.readFileSync(path.join(out,id,'CHECK_FORM_PROMOTE.json')))});
 console.log(JSON.stringify({id,reading:r.result.reading,w1_w8:r.result.w1_w8?.reading,w9:r.result.w9?.verdict}));
 return r.result;
};
const original=path.join(root,'inputs/SPEC002_v030.mal');
const spec=fs.readFileSync(original,'utf8');
const fixture=(id,text)=>{const p=path.join(out,id+'.mal');fs.writeFileSync(p,text,{flag:'wx'});return p;};
const baseline=run('baseline',original,'specification',true);
const combined=run('combined',original);
check('baseline_byte_19',baseline.w1_w8.kind==='EXECUTED'&&baseline.w1_w8.payload==='19',baseline);
check('unchanged_W1_W8',JSON.stringify(combined.w1_w8)===JSON.stringify(baseline.w1_w8),combined.w1_w8);
check('combined_IF_THEN',combined.reading==='IF_THEN'&&combined.w9.verdict==='IF_THEN',combined);
const retired=run('retired_domain',fixture('retired_domain',spec.replace('domain SPECIFICATION_SYSTEM','domain hydrogen')));
check('W9_additional_rejection',retired.w1_w8.reading==='IF_THEN'&&retired.w9.verdict==='NO'&&retired.reading==='NO'&&retired.w9.law_positions.join(',')==='hydrogen',retired);
const mention=run('mention',fixture('mention',spec+'\n// hydrogen atom are correspondence labels in this comment only.\n'));
check('mention_not_use',mention.reading==='IF_THEN'&&mention.w9.law_positions.length===0,mention);
const badForm=run('form_NO',fixture('form_NO',spec.replace('// SPEC-MAL-SPECIFICATION-SYSTEM-002','// absent-spec-header')));
check('W1_W8_NO_retained',badForm.w1_w8.reading==='NO'&&badForm.w9.verdict==='IF_THEN'&&badForm.reading==='NO',badForm);
const gap=run('parse_gap',fixture('parse_gap',spec+'\n@readonly input ;\n'));
check('parse_gap_named',gap.w9.verdict==='MAYBE'&&gap.reading!=='IF_THEN',gap);
let bypass='';
try{runCheck({input:original,kind:'erratum',out:path.join(out,'kind_bypass')});}catch(e){bypass=e.message;}
check('erratum_kind_identity_bound',bypass==='NOT_SAME promoted erratum identity',bypass);
const old=path.resolve(root,'../erratum_first_shape_w9_021');
const priorPath=path.join(old,'qualification_03/RUN_RECORD_W9_021.json');
const priorBytes=fs.readFileSync(priorPath);
if(hash(priorBytes)!=='BCF261610B18BF535D235FE8FBF5AA153D03BFC8AEE6AE024923732A4A058D22')throw new Error('NOT_SAME prior qualification');
const prior=JSON.parse(priorBytes);
for(const f of prior.observations){
 const input=path.join(old,f.input.path),expected=path.join(old,f.expected.path);
 if(hash(fs.readFileSync(input))!==f.input.sha256||hash(fs.readFileSync(expected))!==f.expected.sha256)throw new Error(`NOT_SAME prior fixture ${f.id}`);
 const r=run(`w9_${f.id}`,input,f.id==='V4'?'erratum':'specification');
 const actual=Buffer.from(JSON.stringify({law_positions:r.w9.law_positions,verdict:r.w9.verdict}));
 check(`W9_${f.id}`,actual.equals(fs.readFileSync(expected)),r.w9);
}
const replay=run('replay',original);
check('replay_readings_SAME',JSON.stringify(combined)===JSON.stringify(replay),replay);
const rec={kind:'RUN_RECORD_PROMOTION_CHECK_024',scope:'Additional W9 promotion check; W1-W8 unchanged. No attestation or repository seal performed.',
 old_qualification_sha256:hash(priorBytes),native_executions:records.length,w9_regression_cases:prior.observations.length,
 tests,records,terminal:tests.every(t=>t.comparison==='SAME')?'IF_THEN':'NOT_SAME'};
const resultPath=path.join(out,'RUN_RECORD_PROMOTION_CHECK_024.json');
fs.writeFileSync(resultPath,JSON.stringify(rec,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({terminal:rec.terminal,tests:tests.length,native_executions:records.length,record_sha256:hash(fs.readFileSync(resultPath))}));
if(rec.terminal!=='IF_THEN')process.exitCode=1;
