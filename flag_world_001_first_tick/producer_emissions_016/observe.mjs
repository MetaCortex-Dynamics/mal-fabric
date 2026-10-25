// Read-only observer of native 016 closure; never supplies runtime conclusions.
import path from 'node:path';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
import {need,sha,identity,expectations,rowTerm} from './fixtures.mjs';

export function observe(stage,bundle,variant){
 const r=openReadback(stage),cache=new Map();
 need(r.error===0&&r.count===r.facts.length,'READBACK_TERMINAL_HEADER');
 function render(id){
  if(cache.has(id))return cache.get(id);
  const n=r.node(id);
  const text=n.s==='TEXT'?JSON.stringify(r.text(id)):n.c.length?`${n.s}(${n.c.map(render).join(',')})`:n.s;
  cache.set(id,text);return text;
 }
 const nodes=Array.from({length:r.terms},(_,id)=>({id,...r.node(id)}));
 for(const n of nodes){
  need(typeof n.s==='string'&&n.c.length<=8,'TERM_SYMBOL_ARITY');
  for(const child of n.c)need(Number.isInteger(child)&&child>=0&&child<n.id,'TERM_CHILD_ORDER');
 }
 for(const f of r.facts){
  need(f.term>=0&&f.term<r.terms&&f.rule>=-1&&f.rule<r.map.rules.length,'FACT_BOUNDS');
  need(f.support.length<=8&&f.support.every(id=>Number.isInteger(id)&&id>=0&&id<f.id),'SUPPORT_CUSTODY');
  if(f.rule<0)need(f.support.length===0,'SOURCE_SEED_SUPPORT');
  else need(f.support.length===r.map.rules[f.rule].ants.length,'NATIVE_RULE_SUPPORT_ARITY');
 }
 const fixedTags=new Set(['P15_OPERATOR','P15_BASIS','P15_VERDICT','P15_DOMAIN_STATUS','P16_SUPPORTED_SCHEMA']);
 const seeds=r.facts.filter(f=>f.rule<0),transport=[],fixed=[];
 need(seeds.length===30+variant.rows.length,'SOURCE_SEED_COUNT');
 for(const f of seeds){
  const n=r.node(f.term),tag=n.c.length?render(n.c[0]):'';
  if(n.s==='GOES_WITH'&&fixedTags.has(tag)){fixed.push(render(f.term));continue;}
  transport.push(render(f.term));
 }
 need(fixed.length===30&&new Set(fixed).size===30,'FIXED_SCHEMA_SEED_COUNT');
 const expectedInput=variant.rows.map(rowTerm).sort();
 need(JSON.stringify(transport.sort())===JSON.stringify(expectedInput),'TRANSPORTED_SOURCE_SEEDS_NOT_SAME');
 const permittedInputTags=new Set(['P16_SOURCE_RESTRICTION','P16_PRODUCER_RECORD','P16_CASE_SUPPORT','P16_STRICT_SUPPORT','P16_PROMOTE_MEMBER','P16_PROOF_CONTENT','P16_MEMBER_CONTENT','P15_PAIR']);
 for(const f of seeds){
  const n=r.node(f.term),tag=n.c.length?render(n.c[0]):'';
  if(n.s==='GOES_WITH')need(fixedTags.has(tag)||permittedInputTags.has(tag),'NO_AUTHORED_P15_CONCLUSIONS');
  else need(n.s==='THIS'&&n.c.length===2&&(tag==='SC_CASE'||tag==='SC_STRICT'),'NATIVE_INPUT_FACT_SHAPE');
 }
 let assertions=0;
 const assert=(condition,reason)=>{assertions++;need(condition,reason);};
 const expected=expectations(bundle,variant),observations={},tagCounts={},checkedFacts=[];
 for(const [tag,terms]of Object.entries(expected)){
  const actual=r.predicate(tag);
  for(const f of actual){
   const n=r.node(f.term);
   need(n.s==='GOES_WITH'&&f.rule>=0&&f.support.length>0,'NATIVE_OUTPUT_PROVENANCE '+tag);
   checkedFacts.push(f.id);
  }
  const strings=actual.map(f=>render(f.term)).sort();
  assert(new Set(strings).size===strings.length,'DUPLICATE_OUTPUT '+tag);
  assert(JSON.stringify(strings)===JSON.stringify(terms),'OUTPUT_NOT_SAME '+tag+' missing='+JSON.stringify(terms.filter(t=>!strings.includes(t)).slice(0,3))+' extra='+JSON.stringify(strings.filter(t=>!terms.includes(t)).slice(0,3)));
  tagCounts[tag]=actual.length;
  observations[tag]=actual.map(f=>({term:render(f.term),fact:f.id,origin:f.origin,rank:f.rank,support:f.support}));
 }
 const contentResults={IF_THEN:0,NOT_SAME:0,MAYBE:0};
 for(const f of r.predicate('GJC_RESULT')){
  const n=r.node(f.term);need(n.s==='GOES_WITH'&&n.c.length===6,'COMPARISON_RESULT_SHAPE');
  const reading=r.text(n.c[5]);need(reading in contentResults,'COMPARISON_READING');contentResults[reading]++;
 }
 const basisCoordinates=['POSITION(THIS,WHAT)','POSITION(BECAUSE,HOW)'];
 const producerCounts=bundle.producers.map(p=>{
  const forProducer=tag=>r.predicate(tag).filter(f=>render(r.node(f.term).c[1])===p.id);
  const domains=forProducer('P15_DOMAIN'),seeds=forProducer('P15_SEED'),derived=forProducer('P15_DERIVED');
  const actualPositions=domains.map(f=>render(r.node(f.term).c[3])).sort();
  assert(JSON.stringify(actualPositions)===JSON.stringify([...basisCoordinates].sort()),'TWO_DECLARED_COORDINATES '+p.role);
  assert(derived.every(f=>{const n=r.node(r.node(f.term).c[2]);return n.s==='POSITION'&&render(n.c[1])!=='WHENCE';}),'NO_UNSUPPORTED_WHENCE '+p.role);
  return {role:p.role,producer:p.id,declared_basis_coordinates:domains.length,contacted_seed_readings:seeds.length,derived_readings:derived.length,undeclared_basis_coordinates:43,supported_missing_contacts:2-seeds.length,pending_scope:'OBSERVER_DESCRIPTION; NOT_NATIVE_UNSUPPORTED_OR_PRIVATE'};
 });
 const closure=r.facts.map(f=>r.term(f.term)).sort();
 assert(new Set(closure).size===closure.length,'DUPLICATE_NATIVE_FACT');
 const closureBytes=Buffer.from(closure.join('\n')+'\n');
 const supportClosure=new Set(),visit=id=>{if(supportClosure.has(id))return;supportClosure.add(id);for(const parent of r.facts[id].support)visit(parent);};
 checkedFacts.forEach(visit);
 const summary={verdict:'IF_THEN',scope:'PARTIAL_MEMBER_RESTRICTED_AUTHOR_COMPONENT_QUALIFICATION; NOT_AUTHORITY_ADMISSION',variant:variant.id,assertions,facts:r.count,terms:r.terms,epochs:r.epochs,error:r.error,source_facts:seeds.length,fixed_source_facts:fixed.length,transported_source_facts:transport.length,tag_counts:tagCounts,content_results:contentResults,producer_counts:producerCounts,withheld_roles:variant.withheldRoles,missing_member_content:variant.missingMemberContent,member_subject:'SOURCE_BOUND_MEMBER_RESTRICTION; NOT_WHOLE_OFFERED_SET',proof_subject:'PRODUCER_OWN_SUPPORTING_PROOF; NOT_MEMBER_REFERENCE',verdict_scope:'IF_THEN_IS_CONTACTED_AUTHOR_CONSTRUCTION; NOT_FIELD_NO_OR_RECEIPT_THIS',authority:'NO_SECTION_SEAL_OR_AUTHORITY_ADMISSION_OR_EXECUTE_LICENSE',readback:identity(path.join(stage,'readback.bin')),source_map:identity(path.join(stage,'source-map.json')),closure_sha256:sha(closureBytes),observations};
 const proofs={source_map:summary.source_map,readback:summary.readback,nodes,facts:r.facts,checked_facts:checkedFacts,checked_support_closure:[...supportClosure].sort((a,b)=>a-b),transport_scope:'ORIGINAL_NATIVE_PROOF_CUSTODY_RETAINED_SEPARATELY_IN_INPUT_BUNDLE; IMPORTED_FACTS_ARE_SOURCE_SEEDS_IN_THIS_RUN'};
 return {summary,proofs,closureBytes};
}
