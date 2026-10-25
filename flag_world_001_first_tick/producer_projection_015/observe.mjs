// External observation only. Native .mal closure supplies every checked result.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
import {specification,expectedSeedCount} from './fixtures.mjs';
const need=(condition,reason)=>{if(!condition)throw Error(reason);};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
export function observe(stage){
 const r=openReadback(stage),cache=new Map();
 function render(id){
  if(cache.has(id))return cache.get(id);
  const n=r.node(id),s=n.s==='TEXT'?JSON.stringify(r.text(id)):n.c.length?`${n.s}(${n.c.map(render).join(',')})`:n.s;
  cache.set(id,s);return s;
 }
 const nodes=Array.from({length:r.terms},(_,id)=>({id,...r.node(id)}));
 for(const n of nodes){need(typeof n.s==='string','SYMBOL_BOUNDS');for(const c of n.c)need(c>=0&&c<n.id,'TERM_CHILD_ORDER');}
 for(const f of r.facts){
  need(f.term>=0&&f.term<r.terms&&f.rule>=-1&&f.rule<r.map.rules.length,'FACT_BOUNDS');
  need(f.support.length<=8&&f.support.every(s=>s>=0&&s<f.id),'SUPPORT_CUSTODY');
  if(f.rule<0)need(f.support.length===0,'SEED_SUPPORT');
  else need(f.support.length===r.map.rules[f.rule].ants.length,'RULE_SUPPORT_ARITY');
 }
 const seeds=r.facts.filter(f=>f.rule<0),allowedSeeds=new Set(['P15_OPERATOR','P15_BASIS','P15_VERDICT','P15_DOMAIN_STATUS','P15_PRODUCER','P15_DECLARE','P15_CONTACT','P15_PAIR','P15_TEST_R4_VECTOR','P15_MEET_REQUEST']);
 need(seeds.length===expectedSeedCount,'SEED_COUNT');
 for(const f of seeds){const n=r.node(f.term);need(n.s==='GOES_WITH'&&allowedSeeds.has(render(n.c[0])),'NO_AUTHORED_CONCLUSIONS');}
 let assertions=0;
 const assert=(condition,reason)=>{assertions++;need(condition,reason);};
 const checkedFacts=[],tagCounts={},observations={};
 for(const [tag,expected] of Object.entries(specification.expectations)){
  const actual=r.predicate(tag);
  for(const f of actual){
   const n=r.node(f.term);need(n.s==='GOES_WITH','OBSERVED_OPERATOR');
   need(f.rule>=0&&f.support.length>0,'NATIVE_CONCLUSION_PROVENANCE');
   checkedFacts.push(f.id);
  }
  const strings=actual.map(f=>render(f.term)).sort();
  assert(new Set(strings).size===strings.length,'DUPLICATE_OBSERVATION '+tag);
  assert(JSON.stringify(strings)===JSON.stringify(expected),'OBSERVATION_NOT_SAME '+tag+' missing='+JSON.stringify(expected.filter(s=>!strings.includes(s)).slice(0,5))+' extra='+JSON.stringify(strings.filter(s=>!expected.includes(s)).slice(0,5)));
  tagCounts[tag]=actual.length;
  observations[tag]=actual.map(f=>({term:render(f.term),fact:f.id,origin:f.origin,rank:f.rank,support:f.support}));
 }
 const fullMaps=specification.fullMaps.map(producer=>{
  const seeds=observations.P15_SEED.filter(f=>f.term.startsWith(`GOES_WITH(P15_SEED,${producer},`));
  const derived=observations.P15_DERIVED.filter(f=>f.term.startsWith(`GOES_WITH(P15_DERIVED,${producer},`));
  assert(seeds.length===45&&derived.length===60,'FULL_MAP_105 '+producer);
  return {producer,seeds:seeds.length,derived:derived.length,total_readings:seeds.length+derived.length,scope:'FULL_SYNTHETIC_45_COORDINATE_FIXTURE; NOT_A_MAP_VALIDATOR'};
 });
 const results={IF_THEN:0,NOT_SAME:0,MAYBE:0};
 for(const f of r.predicate('GJC_RESULT')){const n=r.node(f.term);const value=r.text(n.c[5]);need(value in results,'CONTENT_RESULT_READING');results[value]++;}
 const closure=r.facts.map(f=>r.term(f.term)).sort();
 assert(new Set(closure).size===closure.length,'DUPLICATE_NATIVE_FACT');
 const closureBytes=Buffer.from(closure.join('\n')+'\n');
 const proofClosure=new Set(),visit=id=>{if(proofClosure.has(id))return;proofClosure.add(id);for(const parent of r.facts[id].support)visit(parent);};
 checkedFacts.forEach(visit);
 const summary={verdict:'IF_THEN',scope:'BOUNDED_SYNTHETIC_PRODUCER_INTERFACE_AND_R4_QUALIFICATION',assertions,facts:r.count,terms:r.terms,epochs:r.epochs,error:r.error,source_facts:seeds.length,tag_counts:tagCounts,content_results:results,full_maps:fullMaps,scalar_meets:specification.meets.length,partial_R4_tuples:specification.vectors.length,supported_shared_missing_contact_observations:specification.cases.filter(c=>c.result==='PENDING_OBSERVATION').map(c=>({id:c.id,reading:'MAYBE',status:'PENDING_OBSERVATION_NOT_A_NATIVE_P15_PENDING_FACT'})),malformed_content_withheld:specification.cases.filter(c=>c.result===null).map(c=>c.id),readback:identity(path.join(stage,'readback.bin')),source_map:identity(path.join(stage,'source-map.json')),closure_sha256:sha(closureBytes),observations};
 const proofs={source_map:summary.source_map,readback:summary.readback,nodes,facts:r.facts,checked_facts:checkedFacts,checked_support_closure:[...proofClosure].sort((a,b)=>a-b)};
 return {summary,proofs,closureBytes};
}
