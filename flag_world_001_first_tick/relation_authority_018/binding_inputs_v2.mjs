// Custody, typed transport and external expectations; no native verdict inputs
// for actual-record decomposition. Synthetic authority cases are labelled tests,
// never J17 grants. All observer expectations remain outside the GPU image.
import fs from 'node:fs';
import {bindingCases} from './binding_fixtures_v2.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {identity,sha,need,reference,paths as priorPaths,pins as priorPins} from '../producer_emissions_016/fixtures.mjs';
export {identity,sha,need};
export const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
export const paths={...priorPaths,originalSource:'D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/stage/source.mal'};
export const sources=[path.join(here,'source/relation_decomposition.mal'),path.join(here,'source/authority_restriction.mal'),path.join(here,'source/recorded_binding.mal'),path.join(root,'producer_projection_015/source/producer_projection.mal'),path.join(root,'producer_projection_015/source/r4_verdicts.mal'),path.join(root,'governing_junction_content_014/source/governing_junction_content.mal')];
export const pins=new Map([...priorPins].filter(([p])=>[paths.lower,paths.runtime,paths.runtimeQualification,paths.decoder,paths.world,paths.checker,paths.evidence,paths.promote,paths.oneRun,paths.oneExport,paths.originalMap,paths.originalReadback,...sources].includes(p)));
pins.set(paths.originalSource,'80CBE260C40FA58B5E5A70C557FF102428EC4036F5064446F143650196DEC2A1');
pins.set('C:/Users/devon/Desktop/MaL/MaLv3/SPEC_MAL_SPECIFICATION_SYSTEM_002.mal','FF85EE5F18813F7D64CE7BF275EBEA2F1FF581B32431D232FA4FD2B5B4E7E093');
pins.set('C:/Users/devon/Desktop/MaL/Markdowns/SPEC-JUNCTION-001-GOVERNED-COREALIZATION-PROTOCOL_v0.3.md','9A82BC60519DBA3793C66ED51A31501C953D4B2016F5F96D02710C6BEEB6BAB3');
pins.set('C:/Users/devon/Desktop/MaL/Markdowns/TRACE_FOLD_PRODUCT_PROJECTION_RECORD_001_2026-10-23.md','ACE3A574E6748C2445D82133E32C0B5990C59AFD2879E5E90338B16EF506EBA2');
pins.set(path.join(here,'source/recorded_binding.mal'),'768AB9ABE2003B010B21A0B592EDC52FDBBDCC182AAA9B0593056E8911CA23DB');
pins.set(path.join(root,'producer_emissions_016/fixtures.mjs'),'76B0F4B944BA85614074B96C29AE26AC186F34B7EFC74DD3F2F3B2359C6E2FFA');
pins.set(path.join(root,'j17_step_021/tools/source_occurrence_custody.mjs'),'187C741EACD6285166B4D359D0921A012A3ACDBE8C3FEB5AAAC62198FC82EA3B');
pins.set('C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/source_occurrence_custody.mjs','187C741EACD6285166B4D359D0921A012A3ACDBE8C3FEB5AAAC62198FC82EA3B');
export const verifyPins=()=>{for(const [p,h]of pins)need(identity(p).sha256===h,'INPUT_NOT_SAME '+p);};
const q=JSON.stringify,H=h=>'H_'+h;
export const fact=(tag,...args)=>`GOES_WITH(${[tag,...args].join(',')})`;
const list=a=>a.reduceRight((t,x)=>`CONS(${x},${t})`,'NIL');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const descriptor=v=>{const bytes=Buffer.from(JSON.stringify(stable(v)));return {value:v,encoding:'UTF8_SORTED_OBJECT_KEYS_COMPACT_JSON; OBSERVATION_REFERENCE_NOT_SECTION_BYTES',sha256:sha(bytes)};};

function readProofs(){
 const map=JSON.parse(fs.readFileSync(paths.originalMap)),source=fs.readFileSync(paths.originalSource,'utf8'),fd=fs.openSync(paths.originalReadback,'r');
 const read=(n,o)=>{const b=Buffer.alloc(n);need(fs.readSync(fd,b,0,n,o)===n,'SHORT_READ');return b;};
 try{
  const h=read(32,0),w=i=>h.readInt32LE(i*4);need(w(0)===0x31524c47&&w(1)===1&&w(4)===0,'SOURCE_HEADER');
  need(fs.fstatSync(fd).size===4*(8+w(2)*10+w(3)*12),'SOURCE_SIZE');
  function node(id){need(id>=0&&id<w(5),'TERM_BOUNDS');const b=read(40,4*(8+id*10)),n=b.readInt32LE(4);need(n>=0&&n<=8,'ARITY');return {id,s:map.symbols[b.readInt32LE(0)],c:Array.from({length:n},(_,j)=>b.readInt32LE(8+4*j))};}
  function text(id){let n=node(id);need(n.s==='TEXT'&&n.c.length===1,'TEXT');let at=n.c[0],out=[];for(let k=0;k<w(5);k++){n=node(at);if(n.s==='NIL')return q(new TextDecoder('utf8',{fatal:true}).decode(Uint8Array.from(out)));need(n.s==='CONS'&&n.c.length===2,'TEXT_LIST');const b=node(n.c[0]);need(!b.c.length&&/^B\d+$/.test(b.s)&&+b.s.slice(1)<256,'BYTE');out.push(+b.s.slice(1));at=n.c[1];}throw Error('LIST_BOUND');}
  function term(id,s,depth=0){const n=node(id);if(n.s==='TEXT')return text(id);if(!n.c.length)return n.s;if(['THIS','GOES_WITH','SITE'].includes(n.s)&&depth<3)return `${n.s}(${n.c.map(x=>term(x,s,depth+1)).join(',')})`;return `ORIGINAL_TERM(${s},T_${id})`;}
  function rawFact(id){need(id>=0&&id<w(6),'FACT_BOUNDS');const b=read(48,4*(8+w(2)*10+id*12)),rule=b.readInt32LE(4),n=b.readInt32LE(12);need(n>=0&&n<=8,'SUPPORT_ARITY');return {id,term:b.readInt32LE(0),rule,parents:Array.from({length:n},(_,j)=>b.readInt32LE(16+4*j))};}
  const s=`SOURCE_CUSTODY(${H(pins.get(paths.originalSource))},${H(pins.get(paths.originalMap))},${H(pins.get(paths.originalReadback))})`;
  function pattern(id,rule){const p=map.patterns[id];need(p,'PATTERN');return p.sym<0?{variable:rule.vars[-1-p.sym]}:{symbol:map.symbols[p.sym],children:p.children.map(c=>pattern(c,rule))};}
  return [8296,3535068].map((id,i)=>{
   const f=rawFact(id),rule=map.rules[f.rule],parents=f.parents.map(rawFact);need(rule&&f.parents.length===rule.ants.length,'PARENT_COUNT');
   need(parents.every(p=>p.id<f.id),'PARENT_ORDER');need(rule.name===(i?'SC_STRICT':'SC_SITE_NO'),'RULE_IDENTITY');
   const r=H(pins.get(paths.oneExport)),p=`PRODUCER(${i?'DECIDE':'PROPOSE'},${r})`,l=`LAW_${f.rule}`,ff=`FACT_${id}`;
   const aa=list(rule.ants.map(n=>`PATTERN_${n}`)),z=`PATTERN_${rule.result}`,ps=list(f.parents.map(n=>`FACT_${n}`)),c=term(f.term,s);
   const law=descriptor({source_sha256:pins.get(paths.originalSource),map_sha256:pins.get(paths.originalMap),rule:f.rule,name:rule.name,antecedents:rule.ants.map(n=>pattern(n,rule)),consequent:pattern(rule.result,rule),source_clause:source.slice(rule.start,rule.end)});
   const proof=descriptor({source_custody:s,record_sha256:pins.get(paths.oneExport),fact:f.id,rule:f.rule,law_name:rule.name,conclusion:{term_id:f.term,transport:c},parents:parents.map(x=>({fact:x.id,term_id:x.term,transport:term(x.term,s)}))});
   const rows=[fact('RD_OWNER',p,r,s,ff),fact('RD_APPLICATION',s,ff,l,c,ps),fact('RD_RULE_NAME',s,l,rule.name),fact('RD_RULE',s,l,aa,z),fact('RD_RULE_CONTENT',s,l,aa,z,reference(law.sha256)),fact('RD_PROOF_CONTENT',s,ff,l,c,ps,reference(proof.sha256)),...([f,...parents].map(x=>fact('RD_FACT',s,`FACT_${x.id}`,term(x.term,s))))];
   return {role:i?'DECIDE':'PROPOSE',p,r,s,l,ff,c,ps,aa,z,rows,law,proof,rootTerm:i?term(node(parents[1].term).c[1],s):null,parents:parents.map(x=>({...x,transport:term(x.term,s)})),expected:[fact('RD_CONTACT',p,r,`RD_RELATION(${s},${ff})`,'POSITION(IF_THEN,WHAT)','RULE_RELATION','"IF_THEN"',reference(law.sha256)),fact('RD_CONTACT',p,r,`RD_RELATION(${s},${ff})`,'POSITION(BECAUSE,HOW)','APPLICATION_PROVENANCE','"IF_THEN"',reference(proof.sha256))]};
  });
 }finally{fs.closeSync(fd);}
}

export function build(){
 const derived=(p,r,s,f,parts=[0,1])=>[...(parts.includes(0)?['WHERE','WHICH'].map(w=>fact('P15_DERIVED',`RD_SUBJECT(${p},${r},RD_RELATION(${s},${f}))`,`POSITION(IF_THEN,${w})`,'"IF_THEN"')):[]),...(parts.includes(1)?[fact('P15_DERIVED',`RD_SUBJECT(${p},${r},RD_RELATION(${s},${f}))`,'POSITION(BECAUSE,WHEN)','"IF_THEN"')]:[])];
 const proofs=readProofs(),rows=[...proofs[0].rows,...proofs[1].rows],rdCases=proofs.map(p=>({id:p.role,p:p.p,expected:p.expected,derived:derived(p.p,p.r,p.s,p.ff)}));
 // Test contexts are not source identities. Each contains a deliberate isolated
 // alteration; no mutation enters the actual J17 source/context above.
 function rdNegative(id,base,mutate,expectedKind=[]){
  const s=`TEST_CUSTODY(${id},${base.s})`,p=`TEST_PRODUCER(${id})`;
  let rr=base.rows.map(x=>x.replaceAll(base.s,s).replaceAll(base.p,p));const before=JSON.stringify(rr);rr=mutate(rr,s,p);need(JSON.stringify(rr)!==before,'NEGATIVE_MUTATION_NO_EFFECT '+id);
  rows.push(...rr);rdCases.push({id,p,expected:base.expected.filter((_,i)=>expectedKind.includes(i)).map(x=>x.replaceAll(base.s,s).replaceAll(base.p,p)),derived:derived(p,base.r,s,base.ff,expectedKind)});
 }
 const has=(row,tag)=>row.startsWith('GOES_WITH('+tag+',');
 rdNegative('MISSING_PARENT',proofs[0],a=>a.filter(x=>!x.includes(',FACT_7004,THIS(SC_SITE,')));
 rdNegative('WRONG_PARENT_MEMBER',proofs[0],a=>a.map(x=>has(x,'RD_FACT')&&x.includes('THIS(SC_SITE,')?x.replace('"C:HW_04|HW_09"','"OTHER_SITE"'):x));
 rdNegative('WRONG_RULE',proofs[0],a=>a.map(x=>has(x,'RD_RULE_NAME')?x.replace('SC_SITE_NO','SC_UNKNOWN'):x));
 rdNegative('WRONG_SOURCE',proofs[0],a=>a.map(x=>has(x,'RD_RULE')?x.replace('TEST_CUSTODY(WRONG_SOURCE,','OTHER_CUSTODY(WRONG_SOURCE,'):x));
 rdNegative('WRONG_CONCLUSION',proofs[0],a=>a.map(x=>has(x,'RD_FACT')&&x.includes(',FACT_8296,')?x.replace('SITE("C:HW_04|HW_09","NO")','SITE("C:HW_04|HW_09","THIS")'):x));
 rdNegative('REORDERED_PARENTS',proofs[1],a=>a.map(x=>has(x,'RD_APPLICATION')?x.replace('FACT_3533939,CONS(FACT_2013','FACT_2013,CONS(FACT_3533939'):x));
 rdNegative('INCONSISTENT_ROOT',proofs[1],a=>a.map(x=>has(x,'RD_FACT')&&x.includes(',FACT_3534047,')?x.replace(','+proofs[1].rootTerm+'))',',"UNRELATED_ROOT"))'):x));
 rdNegative('MISSING_PROOF_CONTENT',proofs[1],a=>a.filter(x=>!has(x,'RD_PROOF_CONTENT')),[0]);
 rdNegative('NO_NATIVE_PROMOTE',proofs[0],a=>a.filter(x=>!has(x,'RD_APPLICATION')));
 rdNegative('FIELD_NAME_ONLY',proofs[0],a=>a.filter(x=>has(x,'RD_OWNER')).concat('GOES_WITH(FIELD_NAME,proof,receipt,law)'));
 // One producer can carry two relations at the same coordinate. Both survive;
 // their references are not collapsed into the first encountered payload.
 const multi='TEST_PRODUCER(MULTIPLE_RELATIONS)';
 for(const p of proofs)rows.push(fact('RD_OWNER',multi,p.r,p.s,p.ff));
 rdCases.push({id:'MULTIPLE_RELATIONS_ONE_PRODUCER',p:multi,expected:proofs.flatMap(p=>p.expected.map(x=>x.replaceAll(p.p,multi))),derived:proofs.flatMap(p=>derived(multi,p.r,p.s,p.ff))});
 const short=b=>`PRESENT(CONS("${b}",NIL))`,arCases=[];
 function arCase(id,options={}){
  const t=`TOPOLOGY_${id}`,s=`SCOPE_${id}`,c=`AR_CONTEXT(${t},${s},PAIR_${id})`,pos=options.pos??'POSITION(THIS,WHAT)';
  const lp=`AR_PARTICIPANT(LEFT_${id},LEFT_RECORD_${id},PROPOSE,LEFT_GRANT_${id})`,rp=`AR_PARTICIPANT(RIGHT_${id},RIGHT_RECORD_${id},DECIDE,RIGHT_GRANT_${id})`;
  const rr=[fact('AR_PAIR',c,lp,rp),fact('AR_OVERLAP',c,pos,'MEMBER_ID','MEMBER_ID')];
  for(const [side,role,party]of [['LEFT','PROPOSE',lp],['RIGHT','DECIDE',rp]]){
   rr.push(fact('AR_TYPE',t,role,pos,'MEMBER_ID'),fact('AR_VISIBILITY',t,s,`${side}_${id}`,role,pos,'SHARED'),fact('AR_GRANT',`${side}_GRANT_${id}`,`${side}_${id}`,`${side}_RECORD_${id}`,role,t,s),fact('AR_GRANT_POSITION',`${side}_GRANT_${id}`,pos));
   rr.push(fact('AR_CONTACT',party,pos,'MEMBER_ID','"IF_THEN"',side==='LEFT'?short('THIS'):options.ref??short('THIS')));
  }
  options.mutate?.(rr,{t,s,c,pos,lp,rp});rows.push(...rr);
  const result=options.result??'IF_THEN',shared=options.shared??1,projected=options.projected??2,local=options.local??0,conflict=options.conflict??0;
  const parties=n=>n===2?[lp,rp]:n===1?[lp]:[],ref=p=>p===lp?short('THIS'):options.ref??short('THIS');
  const exact={
   AR_SHARED:shared?[fact('AR_SHARED',c,lp,rp,pos,'MEMBER_ID','MEMBER_ID')]:[],
   AR_PROJECTED_CONTACT:parties(projected).map(p=>fact('AR_PROJECTED_CONTACT',c,p,pos,'MEMBER_ID','"IF_THEN"',ref(p))),
   AR_LOCAL_CONTACT:parties(local).map(p=>fact('AR_LOCAL_CONTACT',c,p,pos,'MEMBER_ID','"IF_THEN"',ref(p))),
   AR_VISIBILITY_CONFLICT:conflict?[fact('AR_VISIBILITY_CONFLICT',c,lp,pos,'MEMBER_ID')]:[],
   GJC_RESULT:result==='NONE'?[]:[fact('GJC_RESULT',`AR_COMPARE_CONTEXT(${c},${lp},${rp},MEMBER_ID,MEMBER_ID)`,pos,ref(lp),ref(rp),q(result))]
  };
  arCases.push({id,c,pos,lp,rp,shared,projected,local,conflict,result:result==='NONE'?[]:[result],exact});
 }
 arCase('AGREEMENT'); arCase('WALL',{ref:short('NO'),result:'NOT_SAME'});
 arCase('ABSENCE',{ref:'ABSENT',result:'MAYBE'});
 arCase('PROOF_SHARED',{pos:'POSITION(BECAUSE,HOW)',ref:short('NO'),result:'NOT_SAME'});
 arCase('PROOF_LOCAL',{pos:'POSITION(BECAUSE,HOW)',shared:0,projected:0,local:2,result:'NONE',mutate:a=>{for(let i=0;i<a.length;i++)if(has(a[i],'AR_VISIBILITY'))a[i]=a[i].replace(',SHARED)',',LOCAL_ONLY)');}});
 arCase('CONTACT_MISSING',{projected:1,result:'NONE',mutate:a=>a.splice(a.findIndex(x=>has(x,'AR_CONTACT')&&x.includes('RIGHT_CONTACT_MISSING,')),1)});
 arCase('GRANT_MISSING',{shared:0,projected:1,result:'NONE',mutate:a=>a.splice(a.findIndex(x=>has(x,'AR_GRANT')&&x.includes('RIGHT_GRANT_GRANT_MISSING,')),1)});
 arCase('WRONG_RECORD',{shared:0,projected:1,result:'NONE',mutate:a=>{const i=a.findIndex(x=>has(x,'AR_GRANT')&&x.includes('RIGHT_GRANT_WRONG_RECORD,'));a[i]=a[i].replace('RIGHT_RECORD_WRONG_RECORD','UNRELATED_RECORD');}});
 arCase('WRONG_SCOPE',{shared:0,projected:1,result:'NONE',mutate:a=>{const i=a.findIndex(x=>has(x,'AR_GRANT')&&x.includes('RIGHT_GRANT_WRONG_SCOPE,'));a[i]=a[i].replace('SCOPE_WRONG_SCOPE','UNRELATED_SCOPE');}});
 arCase('WRONG_ROLE',{shared:0,projected:1,result:'NONE',mutate:a=>{const i=a.findIndex(x=>has(x,'AR_GRANT')&&x.includes('RIGHT_GRANT_WRONG_ROLE,'));a[i]=a[i].replace(',DECIDE,',',PROMOTE,');}});
 arCase('WRONG_TOPOLOGY',{shared:0,projected:1,result:'NONE',mutate:a=>{const i=a.findIndex(x=>has(x,'AR_GRANT')&&x.includes('RIGHT_GRANT_WRONG_TOPOLOGY,'));a[i]=a[i].replace('TOPOLOGY_WRONG_TOPOLOGY','UNRELATED_TOPOLOGY');}});
 arCase('NO_GRANT_POSITION',{shared:0,projected:1,result:'NONE',mutate:a=>a.splice(a.findIndex(x=>has(x,'AR_GRANT_POSITION')&&x.includes('RIGHT_GRANT_NO_GRANT_POSITION,')),1)});
 arCase('TYPE_MISMATCH',{projected:1,result:'NONE',mutate:a=>{const i=a.findIndex(x=>has(x,'AR_CONTACT')&&x.includes('RIGHT_TYPE_MISMATCH,'));a[i]=a[i].replace(',MEMBER_ID,',',OTHER_TYPE,');}});
 arCase('NO_OVERLAP',{shared:0,result:'NONE',mutate:a=>a.splice(a.findIndex(x=>has(x,'AR_OVERLAP')),1)});
 arCase('WRONG_OPERATOR',{shared:0,projected:1,result:'NONE',mutate:a=>{const i=a.findIndex(x=>has(x,'AR_VISIBILITY')&&x.includes(',RIGHT_WRONG_OPERATOR,'));a[i]=a[i].replace('POSITION(THIS,WHAT)','POSITION(BECAUSE,WHAT)');}});
 arCase('VISIBILITY_CONFLICT',{conflict:1,mutate:(a,{t,s,pos})=>a.push(fact('AR_VISIBILITY',t,s,'LEFT_VISIBILITY_CONFLICT','PROPOSE',pos,'LOCAL_ONLY')),local:1});
 const bindings=bindingCases({paths,pins,sha,need,reference,fact});rows.push(...bindings.rows);rdCases.push(...bindings.rdCases);
 const unique=[...new Set(rows)];need(unique.length<1900,'SOURCE_SEED_BOUND');
 return {rows:unique,rdCases,arCases,proofs,bindingCases:bindings.cases,bindingRelation:bindings.source_relation,scope:'ACTUAL_PROPOSE_DECIDE_AND_RECORDED_PROMOTE_CONTACTS_PLUS_SYNTHETIC_RESTRICTION_TESTS',actual_grants:'NONE_SUPPLIED',actual_topology:'NONE_SUPPLIED'};
}
export const fixtureSource=rows=>'// Actual proof transport plus labelled isolated qualification cases.\n@propose seed RD_AR_INPUTS := {\n'+rows.map(x=>'  '+x).join(',\n')+'\n};\n';
