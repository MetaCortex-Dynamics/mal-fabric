// Read-only supplement: recorded-binding and R4 terminal proof custody.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const digest=b=>createHash('sha256').update(b).digest('hex').toUpperCase();
const identify=p=>({path:p,bytes:fs.statSync(p).size,sha256:digest(fs.readFileSync(p))});
const need=(x,m)=>{if(!x)throw Error(m);};
const recordPath=path.join(here,'run_005/RUN_RECORD_018.json'),recordId=identify(recordPath);
need(recordId.sha256==='9333EA6CE1D187458C3849695B3E84AEA6629C8C1440CDBFE101987CB78B18F8','RECORD_NOT_SAME');
const record=JSON.parse(fs.readFileSync(recordPath));
const bindings=[...record.inputs,...record.artifacts,...record.native_sources];
for(const b of bindings){const now=identify(b.path);need(now.sha256===b.sha256&&now.bytes===b.bytes,'CUSTODY_NOT_SAME '+b.path);}
const runs=[];
for(const name of ['normal','replay','reversed']){
 const stage=path.join(here,'run_005',name,name==='replay'?'':'stage'),r=openReadback(stage);
 const terminals=['BR_RECONSTRUCTED','P15_DERIVED'].flatMap(tag=>r.predicate(tag).map(f=>({tag,id:f.id})));
 const ancestry=new Set(),visit=id=>{if(ancestry.has(id))return;ancestry.add(id);const f=r.facts[id];need(f,'MISSING_FACT');need(f.support.every(p=>p>=0&&p<id),'SUPPORT_ORDER');if(f.rule<0)need(f.support.length===0,'SEED_SUPPORT');else need(f.support.length===r.map.rules[f.rule].ants.length,'RULE_SUPPORT');f.support.forEach(visit);};
 for(const t of terminals){const f=r.facts[t.id];need(f.rule>=0&&f.support.length>0,'TERMINAL_WITHOUT_NATIVE_PROOF '+t.tag);visit(t.id);}
 need(terminals.filter(t=>t.tag==='BR_RECONSTRUCTED').length===4,'RECONSTRUCTION_SET');
 const facts=[...ancestry].sort((a,b)=>a-b).map(id=>({...r.facts[id],rule_name:r.facts[id].rule<0?'SOURCE_SEED':r.map.rules[r.facts[id].rule].name}));
 runs.push({label:name,source_map:identify(path.join(stage,'source-map.json')),readback:identify(path.join(stage,'readback.bin')),terminals,proof_ancestry:facts});
}
const output=path.join(here,'run_005/BINDING_PROOF_SUPPLEMENT.json');
fs.writeFileSync(output,JSON.stringify({schema:'RelationAuthority018BindingProofSupplement',verdict:'IF_THEN',scope:'READ_ONLY_PROVENANCE_AND_CUSTODY; NO_NATIVE_RUN_OR_AUTHORITY_EFFECT',observer:identify(fileURLToPath(import.meta.url)),record:recordId,identity_checks:bindings.length,runs},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({verdict:'IF_THEN',identity_checks:bindings.length,output:identify(output),runs:runs.map(x=>({label:x.label,terminals:x.terminals.length,ancestry:x.proof_ancestry.length}))}));
