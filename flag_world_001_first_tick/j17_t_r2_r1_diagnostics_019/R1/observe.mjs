// Read-only native R1 observation. No result from this module is a runtime input.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {openReadback} from '../../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';

const need=(condition,message)=>{if(!condition)throw Error('R1_OBSERVER '+message);};
const json=JSON.stringify, hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase();
const proof=f=>({fact:f.id,origin:f.origin,rank:f.rank,support:f.support});
const sameSet=(a,b)=>a.size===b.size&&[...a].every(x=>b.has(x));
const unique=(items,label)=>{const s=new Set(items);need(s.size===items.length,'DUPLICATE '+label);return s;};
const ordered=(items,key)=>items.sort((a,b)=>key(a)<key(b)?-1:key(a)>key(b)?1:0);
const THIS_TAGS=['R1_INPUT_FIELD_ROW','R1_INPUT_WITNESS_ROW','R1_INPUT_COVER_CHUNK','R1_REQUEST','R1_SITE','R1_EDGE','R1_TRIAD','R1_INPUT','R1_CASE','R1_TRIAL','R1_COVER_ROWS','R1_COVER_ROW'];
const ARITIES={R1_SOURCE_FIELD:3,R1_FLAG:5,R1_SOURCE_WITNESS:4,R1_OVERLAP:3,R1_INCIDENT:5,R1_MEMBER:4,R1_AFFECTED:4,R1_BASE:4,R1_BASELINE:5,R1_OLD_WALL:4,R1_G2_WITNESS_BOUND:4,R1_CHECK:6,R1_READ:4,R1_NEXT:5,R1_AFTER:7,R1_OPENED:5,R1_DISCHARGED:5,R1_RETAINED:5,R1_NO_OPEN:5,R1_NO_DISCHARGE:5,R1_MEMBER_SEEN:5,R1_MEMBER_COMPLETE:4,R1_MEMBER_NO_OPEN_KIND:5,R1_MEMBER_NO_OPEN:4,R1_MEMBER_NO_DISCHARGE_KIND:5,R1_MEMBER_NO_DISCHARGE:4,R1_COVER_LEAF:4,R1_COVER_JOIN:5,R1_COVER_ROOT:3,R1_COVER:4,R1_EMPTY_OPEN:4,R1_EMPTY_DISCHARGE:4,R1_COMPLETE:3,R1_STRICT:3,R1_EXCLUDED_OPEN:5,R1_EXCLUDED_EMPTY:3};
for(const tag of THIS_TAGS)ARITIES[tag]=2;
const SOURCE_TAGS=new Set(['R1_INPUT_FIELD_ROW','R1_INPUT_WITNESS_ROW','R1_INPUT_COVER_CHUNK','R1_REQUEST']);
const THIS_SET=new Set(THIS_TAGS), KINDS=new Set(['DELTA','GAMMA','TAU']);

function open(stage){
  const r=openReadback(stage), tags=new Map(), renderCache=new Map(), values=new Map();
  need(r.terms>0&&r.count>0&&r.epochs>0&&r.error===0,'TERMINAL_HEADER');
  const capacity=r.raw.readInt32LE(8), factCapacity=r.raw.readInt32LE(12);
  need(capacity>0&&factCapacity>0&&r.terms<=capacity&&r.count<=factCapacity,'CAPACITIES');
  // Child-precedence validates the entire term transport before any decoding.
  for(let id=0;id<r.terms;id++){
    const n=r.node(id);
    need(typeof n.s==='string'&&n.s.length>0&&n.c.every(c=>Number.isInteger(c)&&c>=0&&c<id),'TERM_TRANSPORT '+id);
  }
  const factTerms=new Set();
  for(const f of r.facts){
    const supportCount=r.raw.readInt32LE((8+capacity*10+f.id*12+3)*4);
    need(Number.isInteger(f.term)&&f.term>=0&&f.term<r.terms&&!factTerms.has(f.term),'FACT_TERM '+f.id);factTerms.add(f.term);
    need(f.rule>=-1&&f.rule<r.map.rules.length&&f.rank>=0,'FACT_ORIGIN '+f.id);
    need(supportCount>=0&&supportCount<=8&&f.support.length===supportCount&&f.support.every(p=>p>=0&&p<f.id),'SUPPORT_ORDER '+f.id);
    if(f.rule<0)need(f.rank===0&&f.support.length===0,'SEED_PROOF '+f.id);
    else need(Array.isArray(r.map.rules[f.rule].ants)&&f.support.length===r.map.rules[f.rule].ants.length&&f.support.length>0,'RULE_SUPPORT_ARITY '+f.id);
    const n=r.node(f.term), first=n.c.length?r.node(n.c[0]):null, tag=first&&!first.c.length?first.s:null;
    if(tag?.startsWith('R1_')){
      need(Object.hasOwn(ARITIES,tag)&&n.c.length===ARITIES[tag]&&n.s===(THIS_SET.has(tag)?'THIS':'GOES_WITH'),'PREDICATE_SHAPE '+tag);
      if(!SOURCE_TAGS.has(tag))need(f.rule>=0&&f.support.length>0,'NO_SEEDED_CONCLUSION '+tag);
    }
    if(f.rule<0)need((n.s==='THIS'&&SOURCE_TAGS.has(tag))||(n.s==='GOES_WITH'&&tag==='KD_BYTE_NEXT'&&n.c.length===3),'SOURCE_SEED_BOUNDARY '+f.id);
    if(tag){if(!tags.has(tag))tags.set(tag,[]);tags.get(tag).push(f);}
  }
  function render(id){
    if(renderCache.has(id))return renderCache.get(id);
    const n=r.node(id), result=n.s==='TEXT'?json(r.text(id)):n.s+(n.c.length?'('+n.c.map(render).join(',')+')':'');
    renderCache.set(id,result);return result;
  }
  function value(id){if(!values.has(id))values.set(id,r.value(id));return values.get(id);}
  const args=f=>r.node(f.term).c.slice(1), rows=tag=>tags.get(tag)??[];
  const atom=id=>{const n=r.node(id);need(n.c.length===0,'EXPECTED_IDENTIFIER');return n.s;};
  const reading=id=>{const v=r.text(id);need(v==='THIS'||v==='NO','FIELD_READING');return v;};
  const relation=id=>{const v=r.text(id);need(v==='SAME'||v==='NOT_SAME','OVERLAP_READING');return v;};
  const pair=(a,b)=>({key:json([value(a),value(b)]),overlap:[value(a),value(b)]});
  const metadata={facts:r.count,terms:r.terms,epochs:r.epochs,error:r.error,fact_capacity:factCapacity,source_facts:r.facts.filter(f=>f.rule<0).length,readback:{path:path.resolve(stage,'readback.bin'),bytes:r.raw.length,sha256:hash(r.raw)},source_map:{path:path.resolve(stage,'source-map.json'),sha256:hash(fs.readFileSync(path.join(stage,'source-map.json')))}};
  return {r,tags,args,rows,render,value,atom,reading,relation,pair,metadata};
}

function inventory(c){
  const {rows,args,render,value,atom,reading,pair}=c;
  for(const [tag,count]of Object.entries({R1_INPUT:120,R1_CASE:1924,R1_MEMBER:5760,R1_FLAG:480,R1_OVERLAP:720,R1_INCIDENT:1440}))need(rows(tag).length===count,'INVENTORY_COUNT '+tag);
  const flags=rows('R1_FLAG').map(f=>{const [id,v,e,t]=args(f),flag=value(id);need(json(flag)===json([value(v),value(e),value(t)]),'FLAG_PARTS');return {term:render(id),key:json(flag),flag,proof:proof(f)};});
  const flagKeys=unique(flags.map(f=>f.key),'FLAGS'), flagByKey=new Map(flags.map(f=>[f.key,f]));
  const sourceFields=new Map();
  for(const f of rows('R1_SOURCE_FIELD')){const [id,r]=args(f),key=json(value(id));need(flagKeys.has(key)&&!sourceFields.has(key),'SOURCE_FIELD_KEY');sourceFields.set(key,{reading:reading(r),proof:proof(f)});}
  need(sourceFields.size===480,'SOURCE_FIELD_COVERAGE');
  const overlaps=rows('R1_OVERLAP').map(f=>{const [a,b]=args(f),p=pair(a,b);need(flagKeys.has(json(p.overlap[0]))&&flagKeys.has(json(p.overlap[1]))&&json(p.overlap[0])!==json(p.overlap[1]),'OVERLAP_ENDPOINTS');return {...p,proof:proof(f)};});
  const overlapKeys=unique(overlaps.map(x=>x.key),'OVERLAPS'), overlapByKey=new Map(overlaps.map(x=>[x.key,x]));
  const witnesses=new Map();
  for(const f of rows('R1_SOURCE_WITNESS')){const [a,b,r]=args(f),p=pair(a,b);need(overlapKeys.has(p.key)&&!witnesses.has(p.key),'SOURCE_WITNESS_KEY');witnesses.set(p.key,{...p,reading:c.relation(r),proof:proof(f)});}
  need(witnesses.size===720,'SOURCE_WITNESS_COVERAGE');
  const incidentByFlag=new Map(flags.map(f=>[f.key,new Map()]));
  const incidents=rows('R1_INCIDENT').map(f=>{
    const [id,k,a,b]=args(f),flag=value(id),flagKey=json(flag),kind=atom(k),p=pair(a,b),at=incidentByFlag.get(flagKey);
    need(at&&KINDS.has(kind)&&overlapKeys.has(p.key)&&p.overlap.some(x=>json(x)===flagKey)&&!at.has(kind),'INCIDENCE_KEY');
    const [left,right]=p.overlap, shared=kind==='DELTA'?[1,2]:kind==='GAMMA'?[0,2]:[0,1];
    need(shared.every(i=>json(left[i])===json(right[i])),'INCIDENCE_COORDINATES');
    at.set(kind,p.key);return {flag,flagKey,kind,...p,proof:proof(f)};
  });
  need([...incidentByFlag.values()].every(x=>x.size===3),'THREE_INCIDENCES_PER_FLAG');
  const cases=rows('R1_CASE').map(f=>{
    const [id]=args(f),n=c.r.node(id);need(['SITE','EDGE','TRIAD','PAIR'].includes(n.s)&&n.c.length===(n.s==='PAIR'?4:2),'CASE_CONSTRUCTOR');
    const operands=n.s==='PAIR'?[atom(n.c[0]),value(n.c[1]),value(n.c[2]),reading(n.c[3])]:[value(n.c[0]),reading(n.c[1])];
    if(n.s==='PAIR')need(KINDS.has(operands[0])&&overlapKeys.has(json(operands.slice(1,3)))&&incidentByFlag.get(json(operands[1]))?.get(operands[0])===json(operands.slice(1,3)),'PAIR_CASE_INCIDENCE');
    return {term:render(id),key:json([n.s,...operands]),family:n.s,operands,reading:operands.at(-1),proof:proof(f),members:[],affected:[]};
  });
  unique(cases.map(x=>x.key),'CASE_KEYS');unique(cases.map(x=>x.term),'CASE_TERMS');
  const caseByTerm=new Map(cases.map(x=>[x.term,x])),familyCounts={};
  for(const item of cases)familyCounts[item.family]=(familyCounts[item.family]??0)+1;
  need(json(familyCounts.SITE)===json(84)&&familyCounts.EDGE===240&&familyCounts.TRIAD===160&&familyCounts.PAIR===1440,'CASE_FAMILIES');
  for(const f of rows('R1_MEMBER')){const [m,id,r]=args(f),item=caseByTerm.get(render(m)),flag=value(id),flagKey=json(flag);need(item&&flagKeys.has(flagKey)&&reading(r)===item.reading,'MEMBER_IDENTITY');item.members.push({flag,flagKey,flagTerm:render(id),reading:reading(r),proof:proof(f)});}
  for(const f of rows('R1_AFFECTED')){const [m,a,b]=args(f),item=caseByTerm.get(render(m)),p=pair(a,b);need(item&&overlapKeys.has(p.key),'AFFECTED_IDENTITY');item.affected.push({...p,proof:proof(f)});}
  for(const item of cases){
    const actual=unique(item.members.map(x=>x.flagKey),'MEMBERS '+item.term), coordinate={SITE:0,EDGE:1,TRIAD:2}[item.family];
    const expected=item.family==='PAIR'?new Set(item.operands.slice(1,3).map(json)):new Set(flags.filter(f=>json(f.flag[coordinate])===json(item.operands[0])).map(f=>f.key));
    need(expected.size>0&&sameSet(actual,expected),'EXACT_MEMBER_EXTENT '+item.term);
    const affected=new Set([...actual].flatMap(key=>[...incidentByFlag.get(key).values()]));
    need(sameSet(unique(item.affected.map(x=>x.key),'AFFECTED '+item.term),affected),'EXACT_AFFECTED_EXTENT '+item.term);
    ordered(item.members,x=>x.flagKey);ordered(item.affected,x=>x.key);
  }
  const inputs=rows('R1_INPUT').map(f=>{const [id]=args(f),n=c.r.node(id);need(n.s==='TWO_SITES'&&n.c.length===1,'INPUT_CONSTRUCTOR');const edge=value(n.c[0]);need(Array.isArray(edge)&&edge.length===2&&json(edge[0])!==json(edge[1]),'INPUT_EDGE');return {term:render(id),edge,proof:proof(f)};});
  unique(inputs.map(x=>x.term),'INPUTS');
  const edges=new Set(flags.map(f=>json(f.flag[1])));need(sameSet(new Set(inputs.map(x=>json(x.edge))),edges),'INPUT_EDGE_COVERAGE');
  const result={...c.metadata,counts:Object.fromEntries(['R1_INPUT','R1_CASE','R1_MEMBER','R1_FLAG','R1_OVERLAP','R1_INCIDENT'].map(tag=>[tag,rows(tag).length])),family_counts:familyCounts,inputs:ordered(inputs,x=>x.term),cases:ordered(cases,x=>x.key),flags:ordered(flags,x=>x.key),overlaps:ordered(overlaps,x=>x.key),incidents:ordered(incidents,x=>json([x.flagKey,x.kind])),source_witnesses:ordered([...witnesses.values()],x=>x.key)};
  return {result,caseByTerm,flagByKey,overlapByKey,incidentByFlag,sourceFields,witnesses};
}

export function inspectInventory(stage){return inventory(open(stage)).result;}

function coverCheck(c,inv,allowed){
  const trees=new Map(inv.result.cases.map(x=>[x.term,{leaves:new Map(),joins:new Map(),roots:[]}]));
  for(const tag of ['R1_COVER_LEAF','R1_COVER_JOIN','R1_COVER_ROOT'])for(const f of c.rows(tag)){
    const [m,node,...rest]=c.args(f),term=c.render(m),tree=trees.get(term);need(tree,'COVER_UNKNOWN_CASE');
    if(tag==='R1_COVER_ROOT'){tree.roots.push(node);continue;}
    need(!tree.leaves.has(node)&&!tree.joins.has(node),'COVER_DUPLICATE_NODE');
    if(tag==='R1_COVER_LEAF')tree.leaves.set(node,json(c.value(rest[0])));else tree.joins.set(node,rest);
  }
  for(const [term,tree]of trees){
    const partial=allowed.has(term),members=new Set(inv.caseByTerm.get(term).members.map(x=>x.flagKey));
    need(tree.roots.length===(partial&&tree.roots.length===0?0:1),'COVER_ROOT_COUNT '+term);
    need([...tree.leaves.values()].every(x=>members.has(x)),'COVER_EXTRA_MEMBER '+term);
    unique([...tree.leaves.values()],'COVER_LEAF_MEMBERS '+term);
    if(!partial)need(sameSet(new Set(tree.leaves.values()),members),'COVER_MEMBER_COVERAGE '+term);
    const reached=new Set(),active=new Set(),usedLeaves=[];
    function visit(node){
      need(!active.has(node)&&!reached.has(node),'COVER_CYCLE_OR_SHARED_NODE '+term);active.add(node);reached.add(node);
      if(tree.leaves.has(node))usedLeaves.push(tree.leaves.get(node));
      else if(tree.joins.has(node)){const children=tree.joins.get(node);need(children.length===2,'COVER_JOIN_ARITY');children.forEach(visit);}
      else need(partial,'COVER_MISSING_NODE '+term);
      active.delete(node);
    }
    tree.roots.forEach(visit);
    if(!partial){need(reached.size===tree.leaves.size+tree.joins.size,'COVER_UNREACHABLE_NODE '+term);need(sameSet(unique(usedLeaves,'COVER_REACHED_MEMBERS '+term),members),'COVER_ROOT_EXTENT '+term);}
  }
}

// Identity-independent closure fingerprint, without expanded fact-term strings.
// Term digest: domain || u32LE(symbol UTF-8 length) || symbol || u32LE(arity)
//              || ordered 32-byte child digests.
// Fact-set digest: format domain || sorted lowercase term-digest hex + LF each.
function closureHash(c){
  const {r}=c,digests=Buffer.allocUnsafe(r.terms*32),word=Buffer.allocUnsafe(4);
  for(let id=0;id<r.terms;id++){
    const n=r.node(id),symbol=Buffer.from(n.s,'utf8'),h=crypto.createHash('sha256').update('R1.structural-term.v1\0');
    word.writeUInt32LE(symbol.length);h.update(word);h.update(symbol);word.writeUInt32LE(n.c.length);h.update(word);
    for(const child of n.c)h.update(digests.subarray(child*32,child*32+32));
    h.digest().copy(digests,id*32);
  }
  const facts=r.facts.map(f=>digests.toString('hex',f.term*32,f.term*32+32)).sort();
  const h=crypto.createHash('sha256').update('structural-Merkle-fact-set-v1\0');
  for(let i=0;i<facts.length;i++){need(i===0||facts[i]!==facts[i-1],'DUPLICATE_STRUCTURAL_FACT');h.update(facts[i]);h.update('\n');}
  return h.digest('hex').toUpperCase();
}

export function observe(stage,expectedTrialTerms,{incompleteCases=[]}={}){
  const c=open(stage),inv=inventory(c),{rows,args,render,value,pair}=c;
  need(Array.isArray(expectedTrialTerms)&&expectedTrialTerms.every(x=>typeof x==='string'),'EXPECTED_TRIAL_TERMS');
  unique(expectedTrialTerms,'EXPECTED_TRIALS');
  const trialRows=rows('R1_TRIAL'),actualTrialTerms=trialRows.map(f=>render(args(f)[0]));
  need(sameSet(unique(actualTrialTerms,'TRIALS'),new Set(expectedTrialTerms)),'TRIAL_SET');
  const partial=new Set(),partialCases=new Set();
  for(const entry of incompleteCases){
    const caseTerm=typeof entry==='string'?entry:entry.caseTerm,trialTerm=typeof entry==='string'?null:entry.trialTerm;
    need(inv.caseByTerm.has(caseTerm)&&(trialTerm===null||expectedTrialTerms.includes(trialTerm)),'INCOMPLETE_CASE_IDENTITY');
    partialCases.add(caseTerm);for(const trial of trialTerm===null?expectedTrialTerms:[trialTerm])partial.add(json([trial,caseTerm]));
  }
  coverCheck(c,inv,partialCases);
  const trials=trialRows.map(f=>{
    const term=render(args(f)[0]);return {term,proof:proof(f),base:[],baseline:[],old_walls:[],cases:inv.result.cases.map(item=>({term:item.term,key:item.key,family:item.family,operands:item.operands,member_count:item.members.length,checked:[],after:[],opened:[],discharged:[],retained:[],complete:[],strict:[],excluded_open:[],excluded_empty:[]}))};
  });
  const byTrial=new Map(trials.map(t=>[t.term,{trial:t,cases:new Map(t.cases.map(item=>[item.term,item])),base:new Map(),baseline:new Map(),next:new Map(),read:new Map(),seen:new Map(),membersComplete:new Map()}]));
  const trialFor=id=>{const t=byTrial.get(render(id));need(t,'OUTPUT_UNKNOWN_TRIAL');return t;};
  const caseFor=(t,id)=>{const item=t.cases.get(render(id));need(item,'OUTPUT_UNKNOWN_CASE');return item;};
  const checkedProofs=[];
  const record=(f,tag,trialTerm,caseTerm,overlapKey)=>checkedProofs.push({tag,trialTerm,...(caseTerm===undefined?{}:{caseTerm}),...(overlapKey===undefined?{}:{overlapKey}),...proof(f)});
  for(const f of rows('R1_BASE')){const [i,id,r]=args(f),t=trialFor(i),key=json(value(id));need(inv.flagByKey.has(key)&&!t.base.has(key),'BASE_KEY');const entry={flag:value(id),key,reading:c.reading(r),proof:proof(f)};t.base.set(key,entry);t.trial.base.push(entry);}
  for(const f of rows('R1_BASELINE')){const [i,a,b,r]=args(f),t=trialFor(i),p=pair(a,b);need(inv.overlapByKey.has(p.key)&&!t.baseline.has(p.key),'BASELINE_KEY');const entry={...p,reading:c.relation(r),proof:proof(f)};t.baseline.set(p.key,entry);t.trial.baseline.push(entry);}
  for(const f of rows('R1_OLD_WALL')){const [i,a,b]=args(f),t=trialFor(i),p=pair(a,b);need(inv.overlapByKey.has(p.key),'OLD_WALL_KEY');t.trial.old_walls.push({...p,proof:proof(f)});}
  for(const [tag,key]of [['R1_CHECK','checked'],['R1_AFTER','after'],['R1_OPENED','opened'],['R1_DISCHARGED','discharged'],['R1_RETAINED','retained'],['R1_EXCLUDED_OPEN','excluded_open']])for(const f of rows(tag)){
    const [i,m,a,b,...rest]=args(f),t=trialFor(i),item=caseFor(t,m),p=pair(a,b);need(inv.overlapByKey.has(p.key),'RECEIPT_OVERLAP '+tag);
    item[key].push({...p,...(tag==='R1_CHECK'?{before:c.relation(rest[0])}:tag==='R1_AFTER'?{before:c.relation(rest[0]),after:c.relation(rest[1])}:{}),...proof(f),proof:proof(f)});
    if(['R1_OPENED','R1_DISCHARGED','R1_RETAINED','R1_EXCLUDED_OPEN'].includes(tag))record(f,tag,t.trial.term,item.term,p.key);
  }
  for(const [tag,key]of [['R1_COMPLETE','complete'],['R1_STRICT','strict'],['R1_EXCLUDED_EMPTY','excluded_empty']])for(const f of rows(tag)){
    const [i,m]=args(f),t=trialFor(i),item=caseFor(t,m);item[key].push(proof(f));record(f,tag,t.trial.term,item.term);
  }
  for(const tag of ['R1_READ','R1_NEXT','R1_MEMBER_SEEN','R1_MEMBER_COMPLETE'])for(const f of rows(tag)){
    const [i,m,id,...rest]=args(f),t=trialFor(i),item=caseFor(t,m),flagKey=json(value(id));need(inv.flagByKey.has(flagKey),'READ_MEMBER_FLAG '+tag);
    const store=tag==='R1_READ'?t.read:tag==='R1_NEXT'?t.next:tag==='R1_MEMBER_SEEN'?t.seen:t.membersComplete;
    if(!store.has(item.term))store.set(item.term,new Map());const entries=store.get(item.term);
    const key=tag==='R1_MEMBER_SEEN'?json([flagKey,c.atom(rest[0])]):flagKey;need(!entries.has(key),'DUPLICATE '+tag);entries.set(key,tag==='R1_NEXT'?c.reading(rest[0]):proof(f));
    if(tag.startsWith('R1_MEMBER_'))need(inv.caseByTerm.get(item.term).members.some(x=>x.flagKey===flagKey),'NONMEMBER_COVERAGE');
  }
  // Every remaining trial-scoped intermediate must also retain its trial/case.
  for(const tag of ['R1_NO_OPEN','R1_NO_DISCHARGE','R1_MEMBER_NO_OPEN_KIND','R1_MEMBER_NO_OPEN','R1_MEMBER_NO_DISCHARGE_KIND','R1_MEMBER_NO_DISCHARGE','R1_COVER','R1_EMPTY_OPEN','R1_EMPTY_DISCHARGE'])for(const f of rows(tag)){const [i,m]=args(f);caseFor(trialFor(i),m);}
  for(const t of byTrial.values()){
    need(t.base.size===480&&t.baseline.size===720,'TRIAL_BASE_COVERAGE '+t.trial.term);
    const input=inv.result.inputs.find(x=>x.term===t.trial.term);need(t.trial.term==='G2'||input,'TRIAL_CONSTRUCTOR');
    for(const [key,entry]of t.base){const expected=t.trial.term==='G2'?inv.sourceFields.get(key).reading:input.edge.some(site=>json(site)===json(entry.flag[0]))?'THIS':'NO';need(entry.reading===expected,'BASE_READING '+t.trial.term);}
    for(const row of t.baseline.values()){const [a,b]=row.overlap.map(json);need(row.reading===(t.base.get(a).reading===t.base.get(b).reading?'SAME':'NOT_SAME'),'BASELINE_READING');}
    const walls=new Set([...t.baseline].filter(([,x])=>x.reading==='NOT_SAME').map(([key])=>key));
    need(sameSet(unique(t.trial.old_walls.map(x=>x.key),'OLD_WALLS'),walls),'OLD_WALL_COVERAGE');
    for(const item of t.trial.cases){
      const original=inv.caseByTerm.get(item.term),check=unique(item.checked.map(x=>x.key),'CHECK'),after=unique(item.after.map(x=>x.key),'AFTER');
      const required=new Set([...walls,...original.affected.map(x=>x.key)]);need(sameSet(check,required)&&sameSet(after,check),'CHECK_AFTER_COVERAGE '+item.term);
      const endpoints=new Set(item.checked.flatMap(x=>x.overlap.map(json))),read=t.read.get(item.term)??new Map(),next=t.next.get(item.term)??new Map();
      need(sameSet(new Set(read.keys()),endpoints)&&sameSet(new Set(next.keys()),endpoints),'READ_NEXT_COVERAGE');
      const members=new Set(original.members.map(x=>x.flagKey));
      for(const [key,r]of next)need(r===(members.has(key)?original.reading:t.base.get(key).reading),'NEXT_READING');
      for(const row of item.checked)need(row.before===t.baseline.get(row.key).reading,'CHECK_BASELINE');
      for(const row of item.after){const [a,b]=row.overlap.map(json);need(row.before===t.baseline.get(row.key).reading&&row.after===(next.get(a)===next.get(b)?'SAME':'NOT_SAME'),'AFTER_READING');}
      const expected={opened:new Set(),discharged:new Set(),retained:new Set()};
      for(const row of item.after){if(row.before==='SAME'&&row.after==='NOT_SAME')expected.opened.add(row.key);if(row.before==='NOT_SAME')expected[row.after==='SAME'?'discharged':'retained'].add(row.key);}
      for(const key of Object.keys(expected))need(sameSet(unique(item[key].map(x=>x.key),key),expected[key]),'EXACT_RECEIPT '+key);
      need(sameSet(new Set([...expected.discharged,...expected.retained]),walls)&&![...expected.discharged].some(x=>expected.retained.has(x)),'OLD_WALL_PARTITION');
      const seen=t.seen.get(item.term)??new Map(),memberComplete=t.membersComplete.get(item.term)??new Map();
      need(sameSet(new Set(memberComplete.keys()),members),'MEMBER_COMPLETE_COVERAGE');
      need(sameSet(new Set(seen.keys()),new Set([...members].flatMap(f=>[...KINDS].map(k=>json([f,k]))))),'MEMBER_KIND_COVERAGE');
      const allowIncomplete=partial.has(json([t.trial.term,item.term]));need(item.complete.length===1||(allowIncomplete&&item.complete.length===0),'COMPLETE_COUNT '+item.term);
      need(item.strict.length<=1&&item.excluded_empty.length<=1,'TERMINAL_MULTIPLICITY');
      if(item.complete.length){
        need((item.strict.length===1)===(expected.discharged.size>0&&expected.opened.size===0),'STRICT_RECEIPT_EQUIVALENCE');
        need(sameSet(unique(item.excluded_open.map(x=>x.key),'EXCLUDED_OPEN'),expected.opened),'OPEN_EXCLUSION_COVERAGE');
        need((item.excluded_empty.length===1)===(expected.discharged.size===0),'EMPTY_EXCLUSION_COVERAGE');
      }else need(item.strict.length===0&&item.excluded_open.length===0&&item.excluded_empty.length===0,'NO_VERDICT_WITHOUT_COMPLETE');
      for(const key of ['checked','after','opened','discharged','retained','excluded_open'])ordered(item[key],x=>x.key);
      item.reading=item.complete.length?(item.strict.length?'IF_THEN':'NO'):'MAYBE';
    }
    ordered(t.trial.base,x=>x.key);ordered(t.trial.baseline,x=>x.key);ordered(t.trial.old_walls,x=>x.key);
    t.trial.strict_count=t.trial.cases.filter(x=>x.strict.length).length;t.trial.K=t.trial.cases.filter(x=>x.strict.length).map(x=>x.term);
    t.trial.complete_cases=t.trial.cases.filter(x=>x.complete.length).length;
  }
  const g2Bound=rows('R1_G2_WITNESS_BOUND');
  if(byTrial.has('G2')){const keys=g2Bound.map(f=>{const [a,b,r]=args(f),p=pair(a,b);need(c.relation(r)===inv.witnesses.get(p.key)?.reading,'G2_SOURCE_WITNESS');return p.key;});need(sameSet(unique(keys,'G2_BOUND'),new Set(inv.overlapByKey.keys())),'G2_WITNESS_COVERAGE');}
  else need(g2Bound.length===0,'NO_G2_WITHOUT_REQUEST');
  const closure_sha256=closureHash(c),closure_format='structural-Merkle-fact-set-v1';
  const summary={verdict:'IF_THEN',scope:'BOUNDED_R1_DIAGNOSTIC_OBSERVATION; NOT_PROMOTED_OFFER_EXHAUSTION_OR_WORLD_EXECUTE',...c.metadata,closure_sha256,closure_format,inventory_counts:inv.result.counts,trials:ordered(trials,x=>x.term).map(t=>({term:t.term,base:t.base.length,baseline:t.baseline.length,cases:t.cases.length,complete_cases:t.complete_cases,strict_count:t.strict_count,baseline_walls:t.old_walls.length})),partial_controls:incompleteCases};
  const proofs={readback:c.metadata.readback,source_map:c.metadata.source_map,scope:'NATIVE_TERMINALS_AND_EXACT_RECEIPTS; TRANSITIVE_SUPPORT_RETAINED_IN_BOUND_READBACK',facts:checkedProofs.sort((a,b)=>a.fact-b.fact),support_checks:{facts:c.r.count,precedence:'SAME',rule_antecedent_arity:'SAME',seeded_R1_conclusions:0}};
  return {summary,trials:ordered(trials,x=>x.term),proofs,closure_sha256,closure_format};
}
