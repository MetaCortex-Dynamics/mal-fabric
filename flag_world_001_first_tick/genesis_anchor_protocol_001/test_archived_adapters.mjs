import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createArchivedAPI} from './archived_adapters.mjs';
import {PROFILE} from './api_boundary.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const [out,original]=process.argv.slice(2);
if(!out||!original||!path.isAbsolute(out)||!path.isAbsolute(original)||fs.existsSync(out))throw Error('Fresh absolute output and original execution directory required');
const artifacts=path.join(out,'artifacts'),evidence=path.join(out,'evidence'),kit=path.resolve(here,'../verification_kit_001');
fs.mkdirSync(artifacts,{recursive:true});fs.mkdirSync(evidence);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=(file,relative)=>{const b=fs.readFileSync(file);return {path:relative,bytes:b.length,sha256:hash(b)};};
const copy=(src,dest)=>{fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest,fs.constants.COPYFILE_EXCL);};
const contract=JSON.parse(fs.readFileSync(path.join(kit,'GENESIS_CONTRACT.json')));
for(const p of new Set(['GENESIS_CONTRACT.json','verification/PRIMARY_GENESIS_RECEIPT.json',...contract.files.map(x=>x.path)]))copy(path.join(kit,p),path.join(artifacts,'kit',p));
const archiveFiles=['frame.json','Ground0.field.json','current.field.json','current.witness.json','current.receipt.json','committed.genesis.json','hashes0/responses.json','hashes1/responses.json',...contract.stages.flatMap(s=>[s.id+'/image.bin',s.id+'/readback.bin'])];
const provenance=[];
for(const p of archiveFiles){const src=path.join(original,p),dest=path.join(artifacts,'archive',p);copy(src,dest);provenance.push({source:src,...identity(dest,'archive/'+p)});}
const api=createArchivedAPI({evidenceDirectory:evidence});
const context={artifactDirectory:artifacts},rows=[];
const ref=p=>identity(path.join(artifacts,p),p);
const capture={profile:PROFILE,event:ref('kit/inputs/captured-frame.bin'),evidence:ref('kit/inputs/capture.json')};
let seq=0;
async function call(operation,input,reading='IF_THEN',code=null){
 const r=await api.invoke({profile:PROFILE,operation,input},context);
 fs.writeFileSync(path.join(out,`${++seq}-${operation}.response.json`),JSON.stringify(r,null,2)+'\n');
 assert.equal(r.reading,reading,JSON.stringify(r));
 if(reading!=='IF_THEN'){assert.equal(r.result,null);assert.equal(r.obligations[0],'REASON:'+code);}else assert.ok(r.result);
 for(const e of r.evidence){const b=fs.readFileSync(path.join(evidence,e.path));assert.equal(hash(b),e.sha256);assert.equal(b.length,e.bytes);}
 rows.push({operation,reading,reason:code,evidence_count:r.evidence.length});return r.result;
}
const c=await call('captureArchived',capture);
const v=await call('validateArchived',c);
const l=await call('locate',v);
assert.equal(l.junction,'J_17');assert.equal(l.site,'C:HW_04|HW_09');
const s=await call('seedInitial',{locus:l,predecessor:ref('archive/Ground0.field.json')});
const committed=await call('commitInitial',s);
await call('verifyInitial',committed);
const variants=[['altered.bin',b=>{b[b.length-1]^=1;}],['displaced-header.bin',b=>{b[28]^=1;}]];
for(const [name,edit] of variants){const b=Buffer.from(fs.readFileSync(path.join(artifacts,capture.event.path)));edit(b);fs.writeFileSync(path.join(artifacts,name),b);}
await call('captureArchived',{...capture,event:{...capture.event,path:'absent.bin'}},'MAYBE','MISSING_CAPTURE');
await call('captureArchived',{...capture,event:{...capture.event,path:'altered.bin'}},'NOT-SAME','BLOB_BINDING_MISMATCH');
await call('captureArchived',{...capture,event:{...capture.event,path:capture.evidence.path}},'NOT-SAME','BLOB_BINDING_MISMATCH');
await call('captureArchived',{...capture,event:{...capture.event,path:'displaced-header.bin'}},'NOT-SAME','BLOB_BINDING_MISMATCH');
await call('captureArchived',{...capture,evidence:null},'MAYBE','MISSING_SOURCE_EVIDENCE');
await call('seedInitial',{locus:l,predecessor:ref('archive/current.field.json')},'NO','NON_GROUND_PREDECESSOR');
await call('applyLaterEvent',committed,'NO','UNSUPPORTED_OPERATION');
// Tampered API tokens cannot bypass the source-backed correspondence.
await call('locate',{...v,frame:capture.evidence},'NOT-SAME','VALIDATION_frame');
await call('seedInitial',{locus:{...l,junction:'J_18'},predecessor:ref('archive/Ground0.field.json')},'NOT-SAME','SOURCE_LOCUS');
await call('commitInitial',{...s,witness:s.field},'NOT-SAME','SEED_witness');
await call('verifyInitial',{...committed,execution_receipt:capture.evidence},'NOT-SAME','EXECUTION_RECEIPT');
// New self-hash does not convert an altered archive event into an admitted one.
await call('captureArchived',{...capture,event:ref('displaced-header.bin')},'NOT-SAME','ARCHIVED_EVENT_BINDING');
// A damaged output copy cannot be passed downstream, even after a prior success.
const target=path.join(artifacts,'archive/committed.genesis.json'),originalBytes=fs.readFileSync(target);
const damaged=Buffer.from(originalBytes);damaged[damaged.length-1]^=1;fs.writeFileSync(target,damaged);
await call('verifyInitial',committed,'NOT-SAME','BLOB_BINDING_MISMATCH');
fs.writeFileSync(target,originalBytes); // only the test-owned copy; original execution stays untouched
for(const x of provenance){assert.equal(hash(fs.readFileSync(x.source)),x.sha256);assert.equal(hash(fs.readFileSync(path.join(artifacts,x.path))),x.sha256);}
for(const x of contract.files){const b=fs.readFileSync(path.join(kit,x.path));assert.equal(hash(b),x.sha256);assert.equal(b.length,x.bytes);}
const sources=['api_boundary.mjs','archived_adapters.mjs','test_archived_adapters.mjs'].map(p=>identity(path.join(here,p),p));
const record={schema:'GAP_ARCHIVED_ADAPTER_QUALIFICATION_V1',profile:PROFILE,obligation:'O_API_REALIZATION',scope:'Archived receipt reuse; source lowering and observation re-executed; no GPU execution or new commit',sources,provenance,tests:rows,verdict:'IF_THEN',gpu_execution:'NOT_RUN',original_receipt_sha256:'BDC284C1F43621EA69A6098AB4A0B7F9FA6095770A3439E9A19CBE2E5CF95212',vectors:{'GAP-JTP-01':'NEWLY_EXECUTED_API_INTEGRATION_WITH_INHERITED_GPU_EVIDENCE','GAP-JTP-02':'NEWLY_EXECUTED','GAP-JTP-03':'NEWLY_EXECUTED','GAP-JTP-04':'NEWLY_EXECUTED','GAP-JTP-05':'NEWLY_EXECUTED','GAP-JTP-06':'NEWLY_EXECUTED','GAP-JTP-07':'NEWLY_EXECUTED','GAP-JTP-08':'NEWLY_EXECUTED'}};
fs.writeFileSync(path.join(out,'RUN_RECORD.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({tests:rows.length,verdict:record.verdict,sha256:hash(fs.readFileSync(path.join(out,'RUN_RECORD.json'))),record:path.join(out,'RUN_RECORD.json')}));
