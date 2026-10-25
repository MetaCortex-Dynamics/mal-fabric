// Custody-bound transport of existing 013 fields. Native code reconstructs the
// relation; this observer supplies no grant, seal, license or world operation.
import fs from 'node:fs';
const q=JSON.stringify,H=x=>'H_'+x;
const list=a=>a.reduceRight((t,x)=>`CONS(${x},${t})`,'NIL');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
export function bindingCases({paths,pins,sha,need,reference,fact}){
 const ev=JSON.parse(fs.readFileSync(paths.evidence)),b=ev.binding,w=JSON.parse(fs.readFileSync(paths.world));
 const exported=JSON.parse(fs.readFileSync(paths.oneExport));
 const mr=b.enactment.member_reference,si=b.successor_identity;
 need(/^\/cases\/\d+$/.test(mr.json_pointer),'BINDING_MEMBER_POINTER');
 const member=exported.cases[Number(mr.json_pointer.split('/').at(-1))];
 const digest=v=>sha(Buffer.from(JSON.stringify(stable(v))));
 need(digest(member)===mr.canonical_record_sha256,'BINDING_MEMBER_IDENTITY');
 need(member.family===b.enactment.fibre_kind&&member.operands[0]===b.enactment.site&&member.operands[1]===b.enactment.reading&&member.case_fact===mr.case_fact,'BINDING_MEMBER_OPERANDS');
 need(digest({field:w.field,witness:w.witness})===b.source.pair_hash.toUpperCase(),'BINDING_WORLD_PAIR');
 need(w.chain.at(-1).link===b.whence&&b.whence===b.prior_head,'BINDING_CURRENT_HEAD');
 const r=H(pins.get(paths.promote)),e=H(pins.get(paths.evidence)),k=`BR_KEY(${r},${e})`,p=`PRODUCER(PROMOTE,${r})`;
 const world=H(b.source.file_sha256),pair=H(b.source.pair_hash),head=H(b.whence),exp=H(pins.get(paths.oneExport)),ptr=q(mr.json_pointer),mid=H(mr.canonical_record_sha256),fid=`FACT_${mr.case_fact}`,site=q(b.enactment.site),reading=q(b.enactment.reading);
 // Entire receipt entries are transported as JSON-shaped terms, not counts or
 // opaque hashes. Object-key sorting is observation encoding, not law ordering.
 const jsonTerm=v=>Array.isArray(v)?`JSON_ARRAY(${list(v.map(jsonTerm))})`:typeof v==='string'?q(v):typeof v==='number'?`JSON_NUMBER(${q(String(v))})`:(()=>{throw Error('UNSUPPORTED_RECEIPT_SHAPE');})();
 const discharged=list(b.receipt.discharged.map(jsonTerm)),opened=list(b.receipt.opened.map(jsonTerm)),retained=list(b.retained.map(jsonTerm));
 const receipt=`BR_RECEIPT_VALUE(${H(b.receipt_hash)},${discharged},${opened},${retained},${q(b.receipt_reading)})`;
 const successor=`BR_SUCCESSOR_VALUE(${H(si.pair_hash)},${H(si.field_hash)},${H(si.witness_hash)},COUNT_${si.field_entries},COUNT_${si.witness_entries})`;
 const status=`BR_STATUS_VALUE(${b.execution},${b.local_sections},${b.global_section},${b.new_link})`;
 const term=`BR_BINDING(BR_SOURCE_VALUE(${world},${pair}),BR_HEADS(${head},${head}),BR_MEMBER_VALUE(BR_MEMBER_REFERENCE(${exp},${ptr},${mid},${fid}),BR_ENACTMENT_VALUE(${b.enactment.kind},${b.enactment.fibre_kind},${site},${reading})),${receipt},${successor},${status})`;
 // This is the already-recorded tuple's content reference, not a predicted new
 // authority outcome. Its matching native relation is the qualified subject.
 const ref=reference(digest(b));
 const rows=[fact('BR_OWNER',p,r,k),fact('BR_SOURCE',k,world,pair),fact('BR_WHENCE',k,head),fact('BR_PRIOR',k,head),fact('BR_WORLD_ID',world,pair,head),fact('BR_MEMBER',k,exp,ptr,mid,fid),fact('BR_ENACTMENT',k,b.enactment.kind,b.enactment.fibre_kind,site,reading),fact('BR_EXPORT_MEMBER',exp,ptr,mid,fid,`SITE(${q(member.operands[0])},${q(member.operands[1])})`),fact('BR_RECEIPT',k,H(b.receipt_hash),discharged,opened,retained,q(b.receipt_reading)),fact('BR_SUCCESSOR',k,H(si.pair_hash),H(si.field_hash),H(si.witness_hash),`COUNT_${si.field_entries}`,`COUNT_${si.witness_entries}`),fact('BR_STATUS',k,b.execution,b.local_sections,b.global_section,b.new_link),fact('BR_RECORDED_CONTENT',k,term,ref)];
 const contact=fact('RD_CONTACT',p,r,`BR_RELATION(${k})`,'POSITION(THIS,WHAT)','RECORD_BINDING','"IF_THEN"',ref);
 const derived=who=>['WHERE','WHICH'].map(wit=>fact('P15_DERIVED',`RD_SUBJECT(${who},${r},BR_RELATION(${k}))`,`POSITION(THIS,${wit})`,'"IF_THEN"'));
 const rdCases=[{id:'PROMOTE_RECORDED_BINDING',p,expected:[contact],derived:derived(p)}],cases=[{id:'ACTUAL',key:k,expected:[fact('BR_RECONSTRUCTED',k,term)],reading:'SAME_EXISTING_013_RELATION'}];
 const has=(x,tag)=>x.startsWith('GOES_WITH('+tag+',');
 const all=[...rows];
 function negative(id,mutate,reconstruct='NONE'){
  // Isolated synthetic key, retaining the source subject. Never a replacement
  // for actual custody or a native world input.
  const nk=`BR_KEY(${r},TEST_EVIDENCE_${id})`,np=`TEST_PRODUCER(BINDING_${id})`;
  let rr=rows.map(x=>x.replaceAll(k,nk).replaceAll(p,np));const before=JSON.stringify(rr);rr=mutate(rr);need(JSON.stringify(rr)!==before,'BINDING_NEGATIVE_NO_CHANGE '+id);
  all.push(...rr);rdCases.push({id:'BINDING_'+id,p:np,expected:[],derived:[]});
  cases.push({id,key:nk,expected:reconstruct==='NONE'?[]:[fact('BR_RECONSTRUCTED',nk,reconstruct)],reading:reconstruct==='NONE'?'WITHHELD':'NOT_SAME_RECORDED_CONTENT'});
 }
 negative('MISSING_RECEIPT',a=>a.filter(x=>!has(x,'BR_RECEIPT')));
 negative('MISMATCHED_KEY',a=>a.map(x=>has(x,'BR_RECEIPT')?x.replace('TEST_EVIDENCE_MISMATCHED_KEY','UNRELATED_EVIDENCE'):x));
 negative('WRONG_HEAD',a=>a.map(x=>has(x,'BR_PRIOR')?x.replace(head,'UNRELATED_HEAD'):x));
 negative('WRONG_SOURCE_PAIR',a=>a.map(x=>has(x,'BR_SOURCE')?x.replace(pair,'UNRELATED_PAIR'):x));
 negative('WRONG_MEMBER',a=>a.map(x=>has(x,'BR_MEMBER')?x.replace(mid,'UNRELATED_MEMBER'):x));
 negative('WRONG_ENACTMENT',a=>a.map(x=>has(x,'BR_ENACTMENT')?x.replace(site,'"UNRELATED_SITE"'):x));
 negative('PREMATURE_EXECUTION',a=>a.map(x=>has(x,'BR_STATUS')?x.replace(',NOT_RUN,',',EXECUTED,'):x));
 negative('MISSING_RECORDED_CONTENT',a=>a.filter(x=>!has(x,'BR_RECORDED_CONTENT')),term);
 negative('ALTERED_RECEIPT',a=>a.map(x=>has(x,'BR_RECEIPT')?x.replace(q(b.receipt_reading),'"NO"'):x),term.replace(receipt,receipt.replace(q(b.receipt_reading),'"NO"')));
 negative('ALTERED_SUCCESSOR',a=>a.map(x=>has(x,'BR_SUCCESSOR')?x.replace(H(si.pair_hash),'UNRELATED_SUCCESSOR'):x),term.replace(successor,successor.replace(H(si.pair_hash),'UNRELATED_SUCCESSOR')));
 return {rows:all,rdCases,cases,source_relation:{record:pins.get(paths.promote),evidence:pins.get(paths.evidence),content_sha256:digest(b),term,scope:'PRESENT_TIME_RECONSTRUCTION_OF_EXISTING_PRE_EXECUTE_BINDING; NOT_HISTORICAL_FIRING_OR_AUTHORITY'}};
}
