// Test P observer: native re-entry and ancestry; no result is a runtime input.

export function observe(stage,options={}){
  const variant=typeof options==='string'?options:options.variant??'normal';
  need(['normal','reversed','precommit','missing_return','missing_k_root','reload_g2'].includes(variant),'VARIANT');
  const c=open(stage),inv=inventory(c),validation=validateProofs(c),refs=references(),group=grouping(c,inv,variant);
  const {rows,args,render}=c,modeRows=rows('P20_MODE'),sourceRows=rows('P20_SOURCE_ID'),requests=rows('R1_REQUEST');
  need(modeRows.length===1&&modeRows[0].rule<0&&sourceRows.length===1&&sourceRows[0].rule<0&&requests.length===1&&requests[0].rule<0&&render(args(requests[0])[0])==='G2','EXACT_REQUEST_SOURCE_SEEDS');
  const mode=c.atom(args(modeRows[0])[0]),sourceId=args(sourceRows[0])[0],sourceHash=c.value(sourceId);
  need(mode===(variant==='reload_g2'?'RELOAD_G2':'CHAIN'),'MODE_VARIANT');
  const sourcePairHash=canonicalHash({field:refs.world.value.field,witness:refs.world.value.witness});
  need(sourceHash===sourcePairHash&&sourceHash===refs.binding.value.binding.source.pair_hash,'SOURCE_PAIR_IDENTITY');
  const g2Unique=rows('P20_UNIQUE').filter(f=>render(args(f)[0])==='G2');
  need(g2Unique.length===(variant==='missing_k_root'?0:1),'FIRST_NATIVE_SINGLETON');
  const effects=rows('P20_EFFECT');need(effects.length===g2Unique.length,'PURE_EFFECT_SINGLETON');
  const effect=effects[0],effectArgs=effect?args(effect):null,member=effect?render(effectArgs[2]):null;
  if(effect)need(json(effectArgs)===json(args(g2Unique[0]))&&effect.support.includes(g2Unique[0].id),'EFFECT_FROM_NATIVE_SINGLETON');
  const execField=[],execWitness=[],fieldProofs=new Map(),witnessProofs=new Map();
  for(const f of rows('P20_EXEC_FIELD')){
    const [i,m,flag,r]=args(f),key=json(c.value(flag));need(effect&&i===effectArgs[0]&&m===effectArgs[2]&&inv.flagByKey.has(key)&&!fieldProofs.has(key),'EXEC_FIELD_IDENTITY');
    const value={flag:c.value(flag),key,reading:c.reading(r),proof:proof(f)};execField.push(value);fieldProofs.set(key,f);
  }
  for(const f of rows('P20_EXEC_WITNESS')){
    const [i,m,a,b,r]=args(f),p=c.pair(a,b);need(effect&&i===effectArgs[0]&&m===effectArgs[2]&&inv.overlapByKey.has(p.key)&&!witnessProofs.has(p.key),'EXEC_WITNESS_IDENTITY');
    execWitness.push({...p,reading:c.relation(r),proof:proof(f)});witnessProofs.set(p.key,f);
  }
  need(execField.length===(effect?480:0)&&execWitness.length===(effect?720:0),'EXEC_PAIR_COMPLETE_EXTENTS');
  const candidate=effect?nativePair({base:execField,baseline:execWitness},refs.world.value):null;
  if(effect){
    const offer=inv.caseByTerm.get(member);need(offer,'EXEC_MEMBER_DOMAIN');const members=new Set(offer.members.map(x=>x.flagKey)),field=new Map(execField.map(x=>[x.key,x.reading]));
    for(const x of execField)need(x.reading===(members.has(x.key)?offer.reading:inv.sourceFields.get(x.key).reading),'EXEC_EXACT_ASSIGNMENT');
    for(const x of execWitness)need(x.reading===(field.get(json(x.overlap[0]))===field.get(json(x.overlap[1]))?'SAME':'NOT_SAME'),'EXEC_EXACT_WITNESS');
  }
  const returns=rows('P20_RETURN'),returnCount=['missing_return','missing_k_root'].includes(variant)?0:1;
  need(returns.length===returnCount,'CANDIDATE_RETURN_GATE');
  if(returns.length){
    const [i,p,m,q]=args(returns[0]),n=c.r.node(q);
    need(effect&&json([i,p,m])===json(effectArgs)&&n.s==='RETURN_PAIR'&&json(n.c)===json([i,m]),'CANDIDATE_RETURN_IDENTITY');
  }
  const committedRows=rows('P_COMMITTED_RETURN'),commitCount=['normal','reversed','reload_g2'].includes(variant)?1:0;
  need(committedRows.length===commitCount,'NATIVE_COMMITTED_RETURN_GATE');
  const committed=committedRows[0];
  if(committed)need(returns.length===1&&json(args(committed).slice(0,4))===json(args(returns[0]))&&committed.origin==='P20_C_COMMITTED_RETURN','COMMITTED_CANDIDATE_IDENTITY');
  const second=committed?(mode==='CHAIN'?'RETURNED(G2,'+member+')':'RELOADED_G2'):null;
  c.baseExpectations=new Map();
  if(second)c.baseExpectations.set(second,new Map((mode==='CHAIN'?execField:[...inv.sourceFields].map(([key,x])=>({key,reading:x.reading}))).map(x=>[x.key,x.reading])));
  const observed=observeR1(c,inv,second?['G2',second]:['G2']),trials=observed.trials,first=trials.find(t=>t.term==='G2'),byTrial=new Map(trials.map(t=>[t.term,t]));
  const pairs=new Map(trials.map(t=>[t.term,nativePair(t,refs.world.value)]));
  need(pairs.get('G2').pair_hash===sourcePairHash,'FIRST_PAIR_SOURCE_CONTENT');
  const firstReference=compareFirst(first,refs.first.value);
  const contexts=new Map();
  for(const f of rows('P20_CONTEXT')){
    const [i,p]=args(f),term=render(i);need(byTrial.has(term)&&!contexts.has(term),'CONTEXT_TRIAL_IDENTITY');contexts.set(term,{id:p,term:render(p),proof:proof(f)});
  }
  need(contexts.size===trials.length,'CONTEXT_TRIAL_COVERAGE');
  const initial=c.r.node(contexts.get('G2').id);need(initial.s==='RECORDED_PAIR'&&json(initial.c)===json([sourceId]),'INITIAL_SOURCE_CONTEXT');
  if(second){
    const context=contexts.get(second),n=c.r.node(context.id),[i,p,m,q,prior,tick]=args(committed);
    if(mode==='CHAIN'){
      const bounds=rows('P20_C_PAIR_BOUND').filter(f=>{const a=args(f);return a[0]===i&&a[1]===m;});need(bounds.length===1,'REENTRY_PAIR_HASH_BOUND');
      const pairHash=args(bounds[0])[3];need(n.s==='COMMITTED_PAIR'&&json(n.c)===json([q,pairHash,prior,tick])&&c.value(pairHash)===pairs.get(second).pair_hash,'REENTRY_CONTEXT_PAIR_IDENTITY');
      need(pairs.get(second).pair_hash===candidate.pair_hash&&context.proof.support.includes(committed.id)&&context.proof.support.includes(bounds[0].id),'REENTRY_CONTEXT_NATIVE_SUPPORT');
    }else need(n.s==='RELOADED_PAIR'&&json(n.c)===json([sourceId])&&pairs.get(second).pair_hash===sourcePairHash,'RELOAD_SOURCE_CONTEXT');
    const trial=byTrial.get(second);need(trial.proof.origin===(mode==='CHAIN'?'P20_REENTRY_TRIAL':'P20_RELOAD_TRIAL')&&trial.proof.support.includes(committed.id),'TRIAL_COMMITTED_SUPPORT');
    for(const row of trial.base){
      const expected=mode==='CHAIN'?fieldProofs.get(row.key):inv.sourceFields.get(row.key).proof;
      const expectedFact=expected.id??expected.fact;
      need(row.proof.origin===(mode==='CHAIN'?'P20_REENTRY_FIELD':'P20_RELOAD_FIELD')&&row.proof.support.includes(committed.id)&&row.proof.support.includes(expectedFact),'SECOND_FIELD_DIRECT_NATIVE_SUPPORT');
    }
  }
  const ready=new Set();
  for(const f of rows('P20_INPUT_READY')){const [i,p]=args(f),term=render(i);need(contexts.get(term)?.id===p&&!ready.has(term),'INPUT_READY_CONTEXT');ready.add(term);}
  need(sameSet(ready,new Set(byTrial.keys())),'INPUT_READY_COVERAGE');
  const inputWitness=new Set();
  for(const f of rows('P20_INPUT_WITNESS')){
    const [i,a,b,r]=args(f),term=render(i),p=c.pair(a,b),trial=byTrial.get(term),key=json([term,p.key]);
    need(trial&&!inputWitness.has(key)&&trial.baseline.find(x=>x.key===p.key)?.reading===c.relation(r),'INPUT_WITNESS_CONTENT');inputWitness.add(key);
    if(term===second){
      const expected=mode==='CHAIN'?witnessProofs.get(p.key):inv.witnesses.get(p.key).proof,expectedFact=expected.id??expected.fact;
      need(f.origin===(mode==='CHAIN'?'P20_REENTRY_WITNESS':'P20_RELOAD_WITNESS')&&f.support.includes(committed.id)&&f.support.includes(expectedFact),'SECOND_WITNESS_DIRECT_NATIVE_SUPPORT');
    }
  }
  need(inputWitness.size===trials.length*720,'INPUT_WITNESS_COVERAGE');
  const fold=validateFold(c,group,trials);
  validateCovers(c,group,trials,effect?[{trial:'G2',member}]:[]);
  const terminals=new Map();
  for(const tag of ['P20_UNIQUE','P20_K_EMPTY','P20_K_MULTIPLE'])for(const f of rows(tag)){
    const [i,p,m]=args(f),term=render(i);need(contexts.get(term)?.id===p&&!terminals.has(term),'K_TERMINAL_CONTEXT');
    terminals.set(term,{tag,member:m===undefined?null:render(m),proof:proof(f)});
  }
  for(const t of trials){
    const terminal=terminals.get(t.term);
    if(variant==='missing_k_root'){need(!terminal,'NO_K_TERMINAL_WITHOUT_ROOT');continue;}
    const expected=t.K.length===0?'P20_K_EMPTY':t.K.length===1?'P20_UNIQUE':'P20_K_MULTIPLE';
    need(terminal?.tag===expected&&terminal.member===(t.K.length===1?t.K[0]:null),'K_NATIVE_TERMINAL_EQUIVALENCE');
  }
  const independent=trials.map(t=>({trial:t.term,...independentReceipts(t,inv)})),offers=offeredRecords(c,inv,trials,contexts,pairs);
  for(const t of trials){t.source_context=contexts.get(t.term).term;t.source_pair_hash=pairs.get(t.term).pair_hash;}
  let candidateReference={comparison:'MAYBE',scope:'No candidate effect in this control'};
  if(candidate){
    const expected=refs.binding.value.binding.successor_identity;
    need(candidate.pair_hash===expected.pair_hash&&candidate.field_hash===expected.field_hash&&candidate.witness_hash===expected.witness_hash,'OBSERVER_ONLY_013_CANDIDATE_PAIR');
    candidateReference={comparison:'SAME',pair_hash:candidate.pair_hash,field_hash:candidate.field_hash,witness_hash:candidate.witness_hash};
  }
  // The candidate and its native singleton may not depend on the imported
  // commit admission binding; only the later commit gate may consume it.
  const candidateAncestry=effect?ancestry(c,[effect.id,...returns.map(x=>x.id)]):null;
  if(candidateAncestry)for(const row of candidateAncestry.facts)if(row[2]===-1){const n=c.r.node(c.r.facts[row[0]].term),tag=c.r.node(n.c[0]).s;need(!tag.startsWith('P20_COMMIT_'),'CANDIDATE_DEPENDS_ON_COMMIT_EXPECTATION');}
  const commit=validateCommit(c,committed,candidate,first,refs,{allowPending:variant==='precommit'});
  const p20Facts=c.r.facts.filter(f=>{const n=c.r.node(f.term),tag=n.c.length?c.r.node(n.c[0]).s:'';return tag.startsWith('P20_')||tag==='P_COMMITTED_RETURN';});
  const roots=[...observed.proofs.facts.map(f=>f.fact),...p20Facts.map(f=>f.id),...trials.flatMap(t=>[...t.base,...t.baseline].map(x=>x.proof.fact)),...trials.flatMap(t=>t.cases.flatMap(x=>x.after.map(y=>y.fact)))];
  observed.proofs.p20_facts=p20Facts.map(f=>({tag:c.r.node(c.r.node(f.term).c[0]).s,term_id:f.term,...proof(f)}));
  observed.proofs.complete_native_ancestry=ancestry(c,roots);
  observed.proofs.support_checks={...observed.proofs.support_checks,...validation,seeded_P20_conclusions:0,candidate_independent_of_commit_expectations:'SAME'};
  const o1=offers.find(x=>x.trial==='G2'),o2=second?offers.find(x=>x.trial===second):null;
  const offerComparison=o2?{member_domain:o1.member_domain_sha256===o2.member_domain_sha256?'SAME':'NOT-SAME',content:o1.canonical_offered_records_sha256===o2.canonical_offered_records_sha256?'SAME':'NOT-SAME',receipts:o1.receipt_content_sha256===o2.receipt_content_sha256?'SAME':'NOT-SAME'}:{member_domain:'MAYBE',content:'MAYBE',receipts:'MAYBE'};
  if(o2)need(offerComparison.member_domain==='SAME','REENTRY_OFFER_DOMAIN');
  observed.summary={...observed.summary,scope:'TEST_P_NATIVE_PAIR_COMMIT_AND_REENTRY_OBSERVATION; QUALIFIED_1924_ASSIGNMENT_SCOPE; NO_FULL_FABRIC_STATE_RECURRENCE; NO_OBSERVER_RUNTIME_INPUT',variant,grouping:group.summary,source_pair_hash:sourcePairHash,candidate_pair_hash:candidate?.pair_hash??null,first_K:first.K.length,second_K:second?byTrial.get(second).K.length:null,second_trial:second,native_candidate_returns:returns.length,native_committed_returns:committedRows.length,offer_comparison:offerComparison,O1:{source_pair_hash:o1.source_pair_hash,member_domain_sha256:o1.member_domain_sha256,content_sha256:o1.canonical_offered_records_sha256,receipt_content_sha256:o1.receipt_content_sha256},O2:o2?{source_pair_hash:o2.source_pair_hash,member_domain_sha256:o2.member_domain_sha256,content_sha256:o2.canonical_offered_records_sha256,receipt_content_sha256:o2.receipt_content_sha256}:null,proof_validation:validation,first_receipt_reference:firstReference,candidate_reference:candidateReference,independent_receipts:independent,observer_only_references:{world:refs.world.identity,qualification019:refs.first.identity,binding013:refs.binding.identity},commit:{reading:commit.reading,prior_hash:commit.prior_hash??null,tick_hash:commit.tick_hash??null,pair_hash:commit.pair_hash??null,hash_service:commit.hash_service}};
  return {...observed,native_pair:candidate,input_pairs:trials.map(t=>({trial:t.term,...pairs.get(t.term)})),contexts:[...contexts].map(([trial,x])=>({trial,term:x.term,proof:x.proof,source_pair_hash:pairs.get(trial).pair_hash})),fold,offered_records:offers,commit,reference_comparisons:{first:firstReference,candidate:candidateReference},native_candidate_return:returns.map(f=>({args:args(f).map(render),...proof(f)}))};
}


function validateHashService(c,{allowPending=false}={}){
  const requests=new Map();
  for(const f of c.rows('GPU_HASH_REQUEST')){
    const n=c.r.node(f.term);need(n.s==='GOES_WITH'&&n.c.length===4&&f.rule>=0,'NATIVE_HASH_REQUEST');
    const [,operation,context,subject]=n.c;if(!requests.has(subject))requests.set(subject,[]);requests.get(subject).push(proof(f));
  }
  const responses=new Map();
  for(const f of c.rows('GPU_HASH_RESPONSE')){
    const n=c.r.node(f.term);need(n.s==='GOES_WITH'&&n.c.length===3&&f.rule>=0&&f.origin==='P20_C_HASH_ROW'&&f.support.length===1,'NATIVE_HASH_RESPONSE_TRANSPORT');
    const [subject,digest]=c.args(f),value=c.value(digest);
    need(requests.has(subject)&&!responses.has(subject)&&value===canonicalHash(c.value(subject)),'REQUESTED_HASH_SUBJECT_IDENTITY');
    const seed=c.r.facts[f.support[0]],sn=c.r.node(seed.term);need(seed.rule<0&&sn.s==='THIS'&&c.r.node(sn.c[0]).s==='P20_COMMIT_HASH_ROW','HASH_RESPONSE_SOURCE_CUSTODY');
    responses.set(subject,{digest:value,proof:proof(f),requests:requests.get(subject)});
  }
  need(allowPending||responses.size===requests.size,'HASH_SERVICE_CLOSED');
  return {requests:[...requests.values()].reduce((n,x)=>n+x.length,0),subjects:requests.size,responses:responses.size,pending_subjects:requests.size-responses.size,canonical_subject_hashes:'SAME',no_unrequested_responses:'SAME',rows:[...responses.values()]};
}
function validateCommit(c,committed,candidate,first,refs,options={}){
  const hashService=validateHashService(c,options);
  if(!committed){need(c.rows('P20_COMMITTED_WORLD').length===0,'NO_WORLD_WITHOUT_COMMITTED_RETURN');return {hash_service:hashService,reading:'MAYBE',world:null};}
  const [i,p,m,q,prior,tick]=c.args(committed),priorHash=c.value(prior),tickHash=c.value(tick),world=refs.world.value;
  need(priorHash===world.chain.at(-1).link&&/^[0-9a-f]{64}$/.test(tickHash),'COMMITTED_PREDECESSOR');
  const matching=(tag)=>c.rows(tag).filter(f=>{const a=c.args(f);return a[0]===i&&a[1]===m;});
  const pairRows=matching('P20_C_PAIR_BOUND');need(pairRows.length===1,'COMMIT_PAIR_BOUND');
  const [, ,pairTerm,pairDigest]=c.args(pairRows[0]);
  need(json(c.value(pairTerm))===json({field:candidate.field,witness:candidate.witness})&&c.value(pairDigest)===candidate.pair_hash,'COMMIT_PAIR_NATIVE_CONTENT');
  const selected=first.cases.find(x=>x.term===c.render(m));need(selected,'COMMIT_SELECTED_CASE');
  const sets=Object.fromEntries(['discharged','opened','retained'].map(k=>[k,new Set(selected[k].map(x=>x.key))]));
  const receipt={discharged:world.witness.filter(x=>sets.discharged.has(json(x.slice(0,2)))).map(x=>x.slice(0,2)),opened:world.witness.filter(x=>sets.opened.has(json(x.slice(0,2)))).map(x=>x.slice(0,2))};
  const receiptRows=matching('P20_C_RECEIPT_BOUND');need(receiptRows.length===1,'COMMIT_RECEIPT_BOUND');
  const [, ,receiptTerm,receiptDigest,reading]=c.args(receiptRows[0]);
  need(json(c.value(receiptTerm))===json(receipt)&&c.value(receiptDigest)===canonicalHash(receipt)&&c.value(reading)==='THIS','COMMIT_RECEIPT_NATIVE_CONTENT');
  const tickRows=matching('P20_C_TICK_HASH');need(tickRows.length===1,'COMMIT_TICK_HASH');
  const [, ,head,recordTerm,digest]=c.args(tickRows[0]),record=c.value(recordTerm);
  need(head===prior&&digest===tick&&canonicalHash(record)===tickHash&&record.prev===priorHash&&record.pair_hash===candidate.pair_hash&&record.receipt_hash===canonicalHash(receipt)&&record.receipt_reading==='THIS','COMMIT_TICK_IDENTITY');
  need(record.kind==='TICK'&&json(record.field)===json(candidate.field)&&json(record.witness)===json(candidate.witness)&&json(record.receipt)===json(receipt),'COMMIT_TICK_CONTENT');
  const executionSources=c.rows('P20_COMMIT_EXECUTION_SOURCE');need(executionSources.length===1&&json(record.execution_source)===json(c.value(c.args(executionSources[0])[0]))&&!Object.hasOwn(record,'fabric_program'),'COMMIT_EXECUTION_SOURCE_CUSTODY');
  const worlds=c.rows('P20_COMMITTED_WORLD');need(worlds.length===1,'COMMIT_WORLD_SINGLETON');
  const returned=c.value(c.args(worlds[0])[0]);
  need(returned.chain.length===world.chain.length+1&&json(returned.chain.slice(0,-1))===json(world.chain)&&returned.chain.at(-1).link===tickHash&&json(returned.chain.at(-1).record)===json(record),'COMMIT_CHAIN_PREFIX');
  need(json(returned.field)===json(candidate.field)&&json(returned.witness)===json(candidate.witness)&&json(returned.receipt)===json(receipt),'COMMIT_WORLD_CONTENT');
  const joined=c.rows('P20_C_REQUEST_JOINED');need(joined.length===1&&c.atom(c.args(joined[0])[0])==='NORMAL','COMMIT_NEGATIVE_REQUESTS_WITHHELD');
  return {reading:'IF_THEN',hash_service:hashService,prior_hash:priorHash,tick_hash:tickHash,pair_hash:candidate.pair_hash,receipt_hash:canonicalHash(receipt),world:returned,proof:proof(committed),pair_proof:proof(pairRows[0]),receipt_proof:proof(receiptRows[0]),tick_proof:proof(tickRows[0]),world_proof:proof(worlds[0]),scope:'Native commit-object/gate observation only; observer performs no file commit'};
}


function validateFold(c,group,trials){
  const observed=new Map(),trialByTerm=new Map(trials.map(t=>[t.term,t]));
  for(const tag of ['P20_K_ZERO','P20_K_ONE','P20_K_MANY'])for(const f of c.rows(tag)){
    const [i,n,m]=c.args(f),term=c.render(i),key=json([term,n]);need(trialByTerm.has(term)&&group.k.nodes.has(n)&&!observed.has(key),'K_FOLD_IDENTITY');
    observed.set(key,{state:tag.slice(6),member:m===undefined?null:c.render(m),proof:proof(f)});
  }
  const summaries=[];
  for(const trial of trials){
    const strict=new Set(trial.K),expected=new Map();
    for(const n of group.k.postorder){
      const members=group.k.leaves.has(n)?(strict.has(group.k.leaves.get(n))?[group.k.leaves.get(n)]:[]):group.k.joins.get(n).flatMap(k=>expected.get(k));
      expected.set(n,members);const actual=observed.get(json([trial.term,n])),state=members.length===0?'ZERO':members.length===1?'ONE':'MANY';
      need(actual&&actual.state===state&&actual.member===(members.length===1?members[0]:null),'K_FOLD_CONTENT');
    }
    const root=observed.get(json([trial.term,group.k.root]));
    summaries.push({trial:trial.term,count:trial.K.length,reading:root.state,root:root.proof,member:root.member});
  }
  need(observed.size===trials.length*group.k.nodes.size,'K_FOLD_TOTAL_COVERAGE');return summaries;
}
function validateCovers(c,group,trials,effects){
  const trialSet=new Set(trials.map(t=>t.term)),effectKeys=new Set(effects.map(x=>json([x.trial,x.member])));
  for(const [tag,tree,returned]of [['P20_INPUT_FIELD_COVER',group.field,false],['P20_INPUT_WITNESS_COVER',group.witness,false],['P20_RETURN_FIELD_COVER',group.field,true],['P20_RETURN_WITNESS_COVER',group.witness,true]]){
    const seen=new Set();
    for(const f of c.rows(tag)){
      const a=c.args(f),trial=c.render(a[0]),member=returned?c.render(a[1]):null,node=a[returned?2:1],key=json([trial,member,node]);
      need(tree.nodes.has(node)&&!seen.has(key)&&(returned?effectKeys.has(json([trial,member])):trialSet.has(trial)),'FULL_COVER_IDENTITY '+tag);seen.add(key);
    }
    need(seen.size===(returned?effects.length:trials.length)*tree.nodes.size,'FULL_COVER_EXTENT '+tag);
  }
}
function independentReceipts(trial,inv){
  const baseline=new Map(trial.baseline.map(x=>[x.key,x.reading])),base=new Map(trial.base.map(x=>[x.key,x.reading]));
  const overlaps=inv.result.overlaps.map(x=>({...x,a:json(x.overlap[0]),b:json(x.overlap[1])})),rows=[];
  for(const offer of trial.cases){
    const item=inv.caseByTerm.get(offer.term),members=new Set(item.members.map(x=>x.flagKey)),actual={discharged:[],opened:[],retained:[]};
    for(const p of overlaps){
      const left=members.has(p.a)?item.reading:base.get(p.a),right=members.has(p.b)?item.reading:base.get(p.b),before=baseline.get(p.key),after=left===right?'SAME':'NOT_SAME';
      if(before==='NOT_SAME')actual[after==='SAME'?'discharged':'retained'].push(p.key);else if(after==='NOT_SAME')actual.opened.push(p.key);
    }
    for(const k of Object.keys(actual)){actual[k].sort();need(json(actual[k])===json(offer[k].map(x=>x.key).sort()),'INDEPENDENT_FULL_PAIR_RECEIPT '+k);}
    need((offer.strict.length===1)===(actual.discharged.length>0&&actual.opened.length===0),'INDEPENDENT_FULL_PAIR_STRICT');
    rows.push([offer.key,actual.discharged,actual.opened,actual.retained]);
  }
  rows.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
  return {comparison:'SAME',offers:rows.length,overlaps_per_offer:overlaps.length,receipt_rows_sha256:canonicalHash(rows),scope:'Independent observer recomputation from this native input pair and exact inventory member extents; not a runtime input'};
}
function offeredRecords(c,inv,trials,contexts,pairs){
  const byTrial=new Map(trials.map(t=>[t.term,t])),caseMaps=new Map(trials.map(t=>[t.term,new Map(t.cases.map(x=>[x.term,x]))])),seen=new Map();
  const tagToReceipt={P20_OFFER_OPENED:'opened',P20_OFFER_DISCHARGED:'discharged',P20_OFFER_RETAINED:'retained'};
  for(const tag of ['P20_OFFER','P20_OFFER_COMPLETE',...Object.keys(tagToReceipt)])for(const f of c.rows(tag)){
    const [i,p,m,a,b]=c.args(f),trial=c.render(i),member=c.render(m),context=contexts.get(trial),t=byTrial.get(trial),offer=caseMaps.get(trial)?.get(member);
    need(t&&offer&&context?.id===p,'OFFER_CONTEXT_IDENTITY');const key=json([tag,trial,member]),list=seen.get(key)??[];list.push(a===undefined?proof(f):{...c.pair(a,b),...proof(f)});seen.set(key,list);
  }
  const output=[];
  for(const t of trials){
    const records=[];
    for(const offer of t.cases){
      const key=tag=>json([tag,t.term,offer.term]),native=seen.get(key('P20_OFFER'))??[],complete=seen.get(key('P20_OFFER_COMPLETE'))??[];
      need(native.length===1&&complete.length===1,'OFFER_COMPLETE_COVERAGE');
      for(const [tag,r]of Object.entries(tagToReceipt))need(sameSet(unique((seen.get(key(tag))??[]).map(x=>x.key),'OFFER_RECEIPTS'),new Set(offer[r].map(x=>x.key))),'CONTEXTUAL_OFFER_RECEIPTS');
      const original=inv.caseByTerm.get(offer.term);
      records.push({source_pair_hash:pairs.get(t.term).pair_hash,member_id:offer.key,assignment:{flags:original.members.map(x=>x.flag),reading:original.reading},receipt:{discharged:offer.discharged.map(x=>x.overlap),opened:offer.opened.map(x=>x.overlap),retained:offer.retained.map(x=>x.overlap)},complete:'IF_THEN',strict:offer.strict.length?'IF_THEN':'NO'});
      offer.offer_proof=native[0];offer.offer_complete_proof=complete[0];
    }
    records.sort((a,b)=>a.member_id<b.member_id?-1:a.member_id>b.member_id?1:0);
    const memberIds=records.map(x=>x.member_id);
    output.push({trial:t.term,source_pair_hash:pairs.get(t.term).pair_hash,member_domain_sha256:canonicalHash(memberIds),canonical_offered_records_sha256:canonicalHash(records),receipt_content_sha256:canonicalHash(records.map(x=>[x.member_id,x.receipt])),count:records.length,encoding:'UTF-8 sorted-object-key compact JSON; records sorted by member_id; content includes actual source pair hash, member identity, assignment and exact receipts; excludes context constructors and tick hashes',records});
  }
  return output;
}



function termDigests(c){
  if(c.termDigests)return c.termDigests;
  const r=c.r,digests=Buffer.allocUnsafe(r.terms*32),word=Buffer.allocUnsafe(4);
  for(let id=0;id<r.terms;id++){
    const n=r.node(id),symbol=Buffer.from(n.s,'utf8'),h=crypto.createHash('sha256').update('R1.structural-term.v1\0');
    word.writeUInt32LE(symbol.length);h.update(word);h.update(symbol);word.writeUInt32LE(n.c.length);h.update(word);
    for(const child of n.c)h.update(digests.subarray(child*32,child*32+32));
    h.digest().copy(digests,id*32);
  }
  c.termDigests=digests;return digests;
}

// Generic full native proof verification. Ground subterms use structural
// digests, so a long transported ARRAY/TEXT is not expanded at each support.
function validateProofs(c){
  if(c.proofValidation)return c.proofValidation;
  const r=c.r,patterns=r.map.patterns,td=termDigests(c),pd=Buffer.alloc(patterns.length*32),vars=new Uint32Array(patterns.length),word=Buffer.allocUnsafe(4);
  for(let id=0;id<patterns.length;id++){
    const p=patterns[id];need(Number.isInteger(p.sym)&&p.sym>=-16&&p.sym<r.map.symbols.length&&Array.isArray(p.children)&&p.children.length<=8&&p.children.every(x=>Number.isInteger(x)&&x>=0&&x<id),'PROOF_PATTERN_SHAPE');
    if(p.sym<0){need(p.children.length===0,'PROOF_VARIABLE_ARITY');vars[id]=1<<(-p.sym-1);continue;}
    for(const child of p.children)vars[id]|=vars[child];
    if(vars[id])continue;
    const symbol=Buffer.from(r.map.symbols[p.sym],'utf8'),h=crypto.createHash('sha256').update('R1.structural-term.v1\0');
    word.writeUInt32LE(symbol.length);h.update(word);h.update(symbol);word.writeUInt32LE(p.children.length);h.update(word);
    for(const child of p.children)h.update(pd.subarray(child*32,child*32+32));
    h.digest().copy(pd,id*32);
  }
  const seedKeys=new Set(r.map.seeds.map(p=>{need(Number.isInteger(p)&&p>=0&&p<patterns.length&&!vars[p],'PROOF_GROUND_SEED');return pd.toString('hex',p*32,p*32+32);}));
  function match(pi,ti,bindings,allowNew){
    const stack=[[pi,ti]];
    while(stack.length){
      const [pId,tId]=stack.pop(),p=patterns[pId];need(p,'PROOF_PATTERN_REFERENCE');
      if(p.sym<0){const v=-p.sym-1;if(bindings[v]<0){need(allowNew,'PROOF_CONSEQUENT_UNBOUND');bindings[v]=tId;}else need(bindings[v]===tId,'PROOF_VARIABLE_NOT_SAME');continue;}
      if(!vars[pId]){need(pd.subarray(pId*32,pId*32+32).equals(td.subarray(tId*32,tId*32+32)),'PROOF_GROUND_NOT_SAME');continue;}
      const n=r.node(tId),symbol=r.raw.readInt32LE((8+tId*10)*4);
      need(p.sym===symbol&&p.children.length===n.c.length,'PROOF_CONSTRUCTOR_NOT_SAME');
      for(let j=0;j<p.children.length;j++)stack.push([p.children[j],n.c[j]]);
    }
  }
  const sourceKeys=new Set();let native=0;
  for(const f of r.facts){
    if(f.rule<0){const key=td.toString('hex',f.term*32,f.term*32+32);need(seedKeys.has(key),'PROOF_SOURCE_NOT_IN_IMAGE');sourceKeys.add(key);continue;}
    native++;const rule=r.map.rules[f.rule],bindings=new Int32Array(16);bindings.fill(-1);
    for(let i=0;i<rule.ants.length;i++)match(rule.ants[i],r.facts[f.support[i]].term,bindings,true);
    match(rule.result,f.term,bindings,false);
    need(f.rank===Math.max(...f.support.map(id=>r.facts[id].rank+1)),'PROOF_RANK_NOT_SAME');
  }
  need(sameSet(sourceKeys,seedKeys),'PROOF_SOURCE_COVERAGE');
  c.proofValidation={facts:r.count,native_facts:native,source_facts:r.count-native,antecedents:'SAME',consequents:'SAME',rank:'SAME',source_image_seeds:'SAME',support_precedence:'SAME'};return c.proofValidation;
}

function ancestry(c,roots){
  const seen=new Uint8Array(c.r.count),pending=[...new Set(roots)];
  while(pending.length){const id=pending.pop();need(Number.isInteger(id)&&id>=0&&id<c.r.count,'ANCESTRY_FACT_ID');if(seen[id])continue;seen[id]=1;pending.push(...c.r.facts[id].support);}
  return {encoding:'[fact_id,term_id,rule_index,rank,...ordered_support_fact_ids]; rule_index=-1 means SOURCE_SEED; native terms and source occurrences remain in bound readback/source-map',roots:[...new Set(roots)].sort((a,b)=>a-b),rules:c.r.map.rules.map((r,i)=>({index:i,name:r.name,start:r.start,end:r.end})),facts:c.r.facts.filter(f=>seen[f.id]).map(f=>[f.id,f.term,f.rule,f.rank,...f.support])};
}

function tree(c,kind,expected,{missingRoot=false}={}){
  const leaves=new Map(),joins=new Map(),parents=new Set(),roots=c.rows('P20_'+kind+'_ROOT').map(f=>c.args(f)[0]);
  for(const f of c.rows('P20_'+kind+'_LEAF')){
    const [node,...ids]=c.args(f),key=kind==='K'?c.render(ids[0]):kind==='FIELD'?json(c.value(ids[0])):c.pair(...ids).key;
    need(expected.has(key)&&!leaves.has(node),'TREE_LEAF '+kind);leaves.set(node,key);
  }
  unique([...leaves.values()],'TREE_LEAF_KEYS '+kind);need(sameSet(new Set(leaves.values()),expected),'TREE_LEAF_COVERAGE '+kind);
  for(const f of c.rows('P20_'+kind+'_JOIN')){
    const [node,a,b]=c.args(f);need(!leaves.has(node)&&!joins.has(node)&&a!==b&&!parents.has(a)&&!parents.has(b),'TREE_JOIN_DISJOINT '+kind);
    joins.set(node,[a,b]);parents.add(a);parents.add(b);
  }
  need(joins.size===leaves.size-1,'TREE_JOIN_COUNT '+kind);
  const all=new Set([...leaves.keys(),...joins.keys()]),tops=[...all].filter(x=>!parents.has(x));
  need(tops.length===1&&[...parents].every(x=>all.has(x)),'TREE_TOP '+kind);
  const root=tops[0],reached=new Set(),postorder=[];
  function visit(n){need(!reached.has(n),'TREE_CYCLE '+kind);reached.add(n);if(joins.has(n))joins.get(n).forEach(visit);else need(leaves.has(n),'TREE_NODE '+kind);postorder.push(n);}
  visit(root);need(reached.size===all.size,'TREE_ROOT_EXTENT '+kind);
  need(roots.length===(missingRoot?0:1)&&(!roots.length||roots[0]===root),'TREE_DECLARED_ROOT '+kind);
  return {kind,root,leaves,joins,nodes:all,postorder,declared:roots.length,summary:{leaves:leaves.size,joins:joins.size,root:c.render(root),declared_roots:roots.length}};
}

function grouping(c,inv,variant){
  const allowed={K_LEAF:2,K_JOIN:3,K_ROOT:1,FIELD_LEAF:2,FIELD_JOIN:3,FIELD_ROOT:1,WITNESS_LEAF:3,WITNESS_JOIN:3,WITNESS_ROOT:1,RETURN_ROOT:2},inputRows=[];
  for(const f of c.rows('P20_INPUT_CHUNK')){
    need(f.rule<0,'GROUP_CHUNK_SOURCE_ONLY');const [a]=c.args(f),n=c.r.node(a);need(n.s==='ARRAY'&&n.c.length===1,'GROUP_CHUNK_ARRAY');
    for(const row of c.r.list(n.c[0])){const x=c.r.node(row);need(Object.hasOwn(allowed,x.s)&&x.c.length===allowed[x.s],'GROUP_ROW_CONSTRUCTOR');inputRows.push(row);}
  }
  unique(inputRows,'GROUP_INPUT_ROWS');
  need(sameSet(new Set(inputRows),unique(c.rows('P20_ROW').map(f=>c.args(f)[0]),'GROUP_NATIVE_ROWS')),'GROUP_NATIVE_TRANSPORT');
  const k=tree(c,'K',new Set(inv.result.cases.map(x=>x.term)),{missingRoot:variant==='missing_k_root'});
  const field=tree(c,'FIELD',new Set(inv.flagByKey.keys())),witness=tree(c,'WITNESS',new Set(inv.overlapByKey.keys()));
  const returns=c.rows('P20_RETURN_ROOT');need(returns.length===(variant==='missing_return'?0:1),'RETURN_ROOT_COUNT');
  if(returns.length)need(json(c.args(returns[0]))===json([field.root,witness.root]),'RETURN_ROOT_IDENTITY');
  return {k,field,witness,summary:{K:k.summary,field:field.summary,witness:witness.summary,return_roots:returns.length,transported_rows:inputRows.length}};
}

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'..');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const canonicalHash=v=>hash(Buffer.from(json(canonical(v)))).toLowerCase();
function pinnedJSON(relative,expected){
  const p=path.join(root,relative),bytes=fs.readFileSync(p),sha256=hash(bytes);need(sha256===expected,'OBSERVER_REFERENCE_NOT_SAME '+relative);
  return {identity:{path:p,bytes:bytes.length,sha256},value:JSON.parse(bytes)};
}
function references(){
  return {
    world:pinnedJSON('j17_step_023/outputs/committed.world.json','E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'),
    first:pinnedJSON('j17_t_r2_r1_diagnostics_019/R1/run_003/qualification.OBSERVATIONS.json','5E8E814B8EF8EEEB29E2C60C5B82E2D049E598413C630022171EB579A5D20797'),
    binding:pinnedJSON('j17_tick_promote_binding_013/BINDING_EVIDENCE.json','171CD86278BD859418D42A198D13466CEC5BB0204E4FB00F3F2FD99D87F8B6F4')
  };
}
function nativePair(trial,world){
  const fieldMap=new Map(trial.base.map(x=>[x.key,[x.flag,x.reading]])),witnessMap=new Map(trial.baseline.map(x=>[x.key,[...x.overlap,x.reading]]));
  const field=world.field.map(x=>{const v=fieldMap.get(json(x[0]));need(v,'PAIR_FLAG_IDENTITY');return v;}),witness=world.witness.map(x=>{const v=witnessMap.get(json(x.slice(0,2)));need(v,'PAIR_WITNESS_IDENTITY');return v;});
  return {field,witness,pair_hash:canonicalHash({field,witness}),field_hash:canonicalHash(field),witness_hash:canonicalHash(witness)};
}
function compareFirst(trial,reference){
  const original=reference.trials.find(t=>t.term==='G2');need(original&&original.cases.length===1924,'REFERENCE_FIRST_TRIAL');
  const byKey=new Map(original.cases.map(x=>[x.key,x]));let comparisons=0;
  for(const c of trial.cases){
    const old=byKey.get(c.key);need(old,'REFERENCE_FIRST_CASE');
    for(const k of ['opened','discharged','retained']){need(json(c[k].map(x=>x.key).sort())===json(old[k].map(x=>x.key??json(x.overlap)).sort()),'FIRST_RECEIPT_REFERENCE '+k);comparisons++;}
    need(c.strict.length===old.strict.length&&c.complete.length===old.complete.length,'FIRST_TERMINAL_REFERENCE');comparisons+=2;
  }
  return {comparison:'SAME',cases:1924,comparisons};
}

// Frozen observe.mjs receipt and inventory checks remain unchanged below.
// Read-only native R1 observation. No result from this module is a runtime input.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openReadback} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';

const need=(condition,message)=>{if(!condition)throw Error('P20_OBSERVER '+message);};
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


const P20_THIS=['P20_INPUT_CHUNK','P20_MODE','P20_SOURCE_ID','P20_ROWS','P20_ROW','P20_K_ROOT','P20_FIELD_ROOT','P20_WITNESS_ROOT'];
const P20_ARITIES={P20_K_LEAF:3,P20_K_JOIN:4,P20_FIELD_LEAF:3,P20_FIELD_JOIN:4,P20_WITNESS_LEAF:4,P20_WITNESS_JOIN:4,P20_RETURN_ROOT:3,P20_CONTEXT:3,P20_INPUT_WITNESS:5,P20_INPUT_FIELD_COVER:3,P20_INPUT_WITNESS_COVER:3,P20_INPUT_READY:3,P20_K_ZERO:3,P20_K_ONE:4,P20_K_MANY:3,P20_UNIQUE:4,P20_K_EMPTY:3,P20_K_MULTIPLE:3,P20_OFFER:4,P20_OFFER_COMPLETE:4,P20_OFFER_OPENED:6,P20_OFFER_DISCHARGED:6,P20_OFFER_RETAINED:6,P20_EFFECT:4,P20_EXEC_FIELD:5,P20_EXEC_WITNESS:6,P20_RETURN_FIELD_COVER:4,P20_RETURN_WITNESS_COVER:4,P20_RETURN:5};
for(const tag of P20_THIS){P20_ARITIES[tag]=2;THIS_SET.add(tag);}
for(const tag of ['P20_INPUT_CHUNK','P20_MODE','P20_SOURCE_ID'])SOURCE_TAGS.add(tag);
Object.assign(ARITIES,P20_ARITIES);

const COMMIT_INPUT_TAGS=['P20_COMMIT_WORLD','P20_COMMIT_EXECUTION_SOURCE','P20_COMMIT_EXPECTED_RECEIPT','P20_COMMIT_EXPECTED_SITE','P20_COMMIT_EXPECTED_READING','P20_COMMIT_EXPECTED_PAIR','P20_COMMIT_EXPECTED_RECEIPT_HASH','P20_COMMIT_EXPECTED_PREV','P20_COMMIT_EXPECTED_WHENCE','P20_COMMIT_EXPECTED_SOURCE_PAIR','P20_COMMIT_HASH_ROW'];
for(const tag of COMMIT_INPUT_TAGS){SOURCE_TAGS.add(tag);THIS_SET.add(tag);ARITIES[tag]=2;}
THIS_SET.add('P20_COMMITTED_WORLD');ARITIES.P20_COMMITTED_WORLD=2;
Object.assign(ARITIES,{P20_C_SOURCE:5,P20_C_HEAD:3,P20_C_SOURCE_PAIR:2,P20_C_SOURCE_CHECKED:2,P20_C_CONTEXT_CHECKED:6,P20_C_REQUEST:7,P20_C_REQUEST_JOINED:7,P20_C_GUARD:6,P20_C_FIELD_SCAN:4,P20_C_FIELD_BUILD:5,P20_C_FIELD_COMPLETE:4,P20_C_WITNESS_SCAN:4,P20_C_WITNESS_BUILD:8,P20_C_WITNESS_COMPLETE:7,P20_C_PAIR:4,P20_C_RECEIPT:4,P20_C_RECEIPT_READING:4,P20_C_PAIR_BOUND:5,P20_C_RECEIPT_BOUND:6,P20_C_RECORD_PARTS:4,P20_C_TICK_RECORD:5,P20_C_TICK_HASH:6,P20_C_TICK_ENTRY:5,P20_C_WORLD:5,P_COMMITTED_RETURN:7});


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
    if(tag?.startsWith('R1_')||tag?.startsWith('P20_')||tag==='P_COMMITTED_RETURN'){
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

// Validate the sole projected-away predicate before any closure projection.
function validateIndexedHelper(c){
  const tag='KD_LIST_PARTS_019',requests=new Map(),helpers=c.rows(tag);
  for(const f of c.rows('KD_LIST_REQUEST')){
    const n=c.r.node(f.term);need(n.s==='GOES_WITH'&&n.c.length===3,'INDEX_REQUEST_SHAPE');
    const [left,right]=n.c.slice(1),a=c.r.node(left),b=c.r.node(right);
    if(a.s==='CONS'&&a.c.length===2&&b.s==='CONS'&&b.c.length===2){
      const key=left+','+right;need(!requests.has(key),'INDEX_DUPLICATE_REQUEST');requests.set(key,f);
    }
  }
  const seen=new Set(),producerRules=c.r.map.rules.map((rule,index)=>({rule,index})).filter(x=>x.rule.name===tag);
  if(helpers.length||requests.size)need(producerRules.length===1&&producerRules[0].rule.ants.length===1,'INDEX_SOLE_PRODUCER');
  for(const f of helpers){
    const n=c.r.node(f.term);
    need(n.s==='GOES_WITH'&&n.c.length===7,'INDEX_HELPER_SHAPE');
    need(f.rule>=0&&f.origin===tag&&f.rule===producerRules[0].index&&f.support.length===1,'INDEX_NATIVE_PRODUCER');
    const [left,right,a,x,b,y]=n.c.slice(1),l=c.r.node(left),r=c.r.node(right),key=left+','+right;
    need(l.s==='CONS'&&l.c.length===2&&r.s==='CONS'&&r.c.length===2&&l.c[0]===a&&l.c[1]===x&&r.c[0]===b&&r.c[1]===y,'INDEX_EXACT_PARTS');
    const request=requests.get(key);need(request&&f.support[0]===request.id&&!seen.has(key),'INDEX_REQUEST_SUPPORT_BIJECTION');seen.add(key);
  }
  need(seen.size===requests.size,'INDEX_COMPLETE_REQUEST_COVERAGE');
  return {tag,helper_count:helpers.length,cons_cons_request_count:requests.size,producer:'KD_LIST_PARTS_019',native_producer_and_exact_parts:'SAME',request_support_bijection:'SAME'};
}

function inventory(c){
  const indexedHelper=validateIndexedHelper(c);
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
  const result={...c.metadata,indexed_helper:indexedHelper,counts:Object.fromEntries(['R1_INPUT','R1_CASE','R1_MEMBER','R1_FLAG','R1_OVERLAP','R1_INCIDENT'].map(tag=>[tag,rows(tag).length])),family_counts:familyCounts,inputs:ordered(inputs,x=>x.term),cases:ordered(cases,x=>x.key),flags:ordered(flags,x=>x.key),overlaps:ordered(overlaps,x=>x.key),incidents:ordered(incidents,x=>json([x.flagKey,x.kind])),source_witnesses:ordered([...witnesses.values()],x=>x.key)};
  return {result,caseByTerm,flagByKey,overlapByKey,incidentByFlag,sourceFields,witnesses};
}

export function inspectInventory(stage){const c=open(stage),result=inventory(c).result;result.native_proof_validation=validateProofs(c);return result;}

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
function closureHashes(c){
  const {r}=c,digests=termDigests(c);
  const facts=r.facts.map(f=>digests.toString('hex',f.term*32,f.term*32+32)).sort();
  const excluded=new Set(c.rows('KD_LIST_PARTS_019').map(f=>digests.toString('hex',f.term*32,f.term*32+32)));
  need(excluded.size===c.rows('KD_LIST_PARTS_019').length,'INDEX_DIGEST_MULTIPLICITY');
  const h=crypto.createHash('sha256').update('structural-Merkle-fact-set-v1\0');
  const projected=crypto.createHash('sha256').update('structural-Merkle-fact-set-v1\0');
  let projectedCount=0;
  for(let i=0;i<facts.length;i++){
    need(i===0||facts[i]!==facts[i-1],'DUPLICATE_STRUCTURAL_FACT');h.update(facts[i]);h.update('\n');
    if(!excluded.has(facts[i])){projected.update(facts[i]);projected.update('\n');projectedCount++;}
  }
  need(projectedCount===r.count-excluded.size,'INDEX_PROJECTION_COUNT');
  return {closure_sha256:h.digest('hex').toUpperCase(),projected_original_closure_sha256:projected.digest('hex').toUpperCase(),projected_original_fact_count:projectedCount};
}

function observeR1(c,inv,expectedTrialTerms,{incompleteCases=[]}={}){
  const {rows,args,render,value,pair}=c;
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
    const input=inv.result.inputs.find(x=>x.term===t.trial.term),returned=c.baseExpectations?.get(t.trial.term);need(t.trial.term==='G2'||input||returned,'TRIAL_CONSTRUCTOR');
    for(const [key,entry]of t.base){const expected=returned?returned.get(key):t.trial.term==='G2'?inv.sourceFields.get(key).reading:input.edge.some(site=>json(site)===json(entry.flag[0]))?'THIS':'NO';need(entry.reading===expected,'BASE_READING '+t.trial.term);}
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
  const {closure_sha256,projected_original_closure_sha256,projected_original_fact_count}=closureHashes(c),closure_format='structural-Merkle-fact-set-v1';
  const projection={excluded_predicate:'KD_LIST_PARTS_019',excluded_fact_count:inv.result.indexed_helper.helper_count,format:closure_format,scope:'ONLY_NATIVE_VALIDATED_HELPER_FACTS_EXCLUDED; ALL_ORIGINAL_FACTS_RETAINED'};
  const summary={verdict:'IF_THEN',scope:'BOUNDED_R1_DIAGNOSTIC_OBSERVATION; NOT_PROMOTED_OFFER_EXHAUSTION_OR_WORLD_EXECUTE',...c.metadata,closure_sha256,closure_format,projected_original_closure_sha256,projected_original_fact_count,projection,indexed_helper:inv.result.indexed_helper,inventory_counts:inv.result.counts,trials:ordered(trials,x=>x.term).map(t=>({term:t.term,base:t.base.length,baseline:t.baseline.length,cases:t.cases.length,complete_cases:t.complete_cases,strict_count:t.strict_count,baseline_walls:t.old_walls.length})),partial_controls:incompleteCases};
  const proofs={readback:c.metadata.readback,source_map:c.metadata.source_map,indexed_helper_validation:inv.result.indexed_helper,scope:'NATIVE_TERMINALS_AND_EXACT_RECEIPTS; TRANSITIVE_SUPPORT_RETAINED_IN_BOUND_READBACK',facts:checkedProofs.sort((a,b)=>a.fact-b.fact),support_checks:{facts:c.r.count,precedence:'SAME',rule_antecedent_arity:'SAME',seeded_R1_conclusions:0}};
  return {summary,trials:ordered(trials,x=>x.term),proofs,closure_sha256,closure_format,projected_original_closure_sha256,projected_original_fact_count,projection};
}

