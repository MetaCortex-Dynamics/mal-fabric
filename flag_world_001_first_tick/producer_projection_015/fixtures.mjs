// Synthetic fixture transport and external observer expectations only.
// No J17 projection assignment, expected answer, or terminal is a runtime seed.
export const operators=['THIS','SAME_NOT_SAME','NO','IF_THEN','BECAUSE','INSIDE_OUTSIDE','NEAR_FAR','CAN_CANNOT','MAYBE','MUST_LET','TOGETHER_ALONE','MORE_LESS','GOES_WITH','MANY_ONE','EVERY_SOME'];
export const bases=['WHAT','HOW','FOR_WHAT'];
export const verdicts=['IF_THEN','NOT_SAME','NO','MAYBE'];
export const facts=[], expectations={}, cases=[], fullMaps=[], vectors=[], meets=[];
const q=JSON.stringify;
const fact=(tag,...args)=>`GOES_WITH(${[tag,...args].join(',')})`;
const pos=(o,w)=>`POSITION(${o},${w})`;
const add=(tag,...args)=>facts.push(fact(tag,...args));
const expect=(tag,...args)=>(expectations[tag]??=[]).push(fact(tag,...args));
const list=bits=>bits.reduceRight((tail,bit)=>`CONS(${q(bit)},${tail})`,'NIL');
const ref=bits=>bits===null?'ABSENT':`PRESENT(${list(bits)})`;
const ranked=['NO','MAYBE','NOT_SAME','IF_THEN'];
// This bounded table is an observer expectation, never part of input.mal.
const expectedMeet=(...values)=>ranked[Math.min(...values.map(x=>ranked.indexOf(x)))];
const checkedTags=['P15_OWNER','P15_DOMAIN','P15_SEED','P15_PENDING','P15_DOMAIN_CONFLICT','P15_SHARED','P15_PRIVATE','P15_OUTSIDE_BOTH','P15_DERIVED','GJC_REQUEST','GJC_RESULT','GJC_AGREEMENT','GJC_WALL','GJC_MISSING','P15_MEET_RESULT'];
for(const tag of checkedTags)expectations[tag]=[];
function owner(id,role='PROPOSE'){
 const p={id,role,record:`RECORD_${id}`,domain:`DOMAIN_${id}`};
 add('P15_PRODUCER',id,role,p.record,p.domain);
 if(role!=='UNKNOWN_ROLE')expect('P15_OWNER',id,p.record,p.domain);
 return p;
}
function derived(p,o,w,v){expect('P15_DERIVED',p,pos(o,w),q(v));}
function expectedSeed(p,o,w,v,bits){
 expect('P15_SEED',p,pos(o,w),q(v),ref(bits));
 if(w==='WHAT'){derived(p,o,'WHERE',v);derived(p,o,'WHICH',v);}
 if(w==='HOW')derived(p,o,'WHEN',v);
}
function comparison(pair,l,r,o,w,left,right,result){
 const context=`PAIR_CONTEXT(${pair},${l},${r})`,position=pos(o,w);
 expect('GJC_REQUEST',context,position,ref(left),ref(right));
 if(result===null)return;
 expect('GJC_RESULT',context,position,ref(left),ref(right),q(result));
 if(result==='IF_THEN')expect('GJC_AGREEMENT',context,position,ref(left),ref(right));
 if(result==='NOT_SAME')expect('GJC_WALL',context,position,ref(left),ref(right));
 if(result==='MAYBE')expect('GJC_MISSING',context,position,left===null?(right===null?'BOTH':'LEFT'):'RIGHT');
}
// Three complete producer maps: 45 explicitly declared seed coordinates each.
// These full-map fixtures, unlike the 256 partial tuples below, witness 105 readings.
const complete=[owner('FULL_PROPOSE','PROPOSE'),owner('FULL_DECIDE','DECIDE'),owner('FULL_PROMOTE','PROMOTE')];
const completeVerdict=(o,w)=>w==='WHAT'?'IF_THEN':w==='HOW'?'NOT_SAME':o==='BECAUSE'?'NO':'MAYBE';
for(const p of complete){
 fullMaps.push(p.id);
 for(const [i,o] of operators.entries())for(const w of bases){
  const position=pos(o,w),v=completeVerdict(o,w),bits=[i%2?'THIS':'NO','THIS'];
  add('P15_DECLARE',p.id,p.domain,position,'SUPPORTED');
  add('P15_CONTACT',p.id,p.record,position,q(v),ref(bits));
  expect('P15_DOMAIN',p.id,p.domain,position,'SUPPORTED');
  expectedSeed(p.id,o,w,v,bits);
 }
 for(const o of operators)derived(p.id,o,'WHENCE','NO');
}
for(const [a,b] of [[0,1],[1,2],[0,2]]){
 const l=complete[a],r=complete[b],pair='REUSED_FULL_PAIR';
 add('P15_PAIR',pair,l.id,r.id);
 for(const [i,o] of operators.entries())for(const w of bases){
  expect('P15_SHARED',pair,l.id,r.id,pos(o,w));
  comparison(pair,l.id,r.id,o,w,[i%2?'THIS':'NO','THIS'],[i%2?'THIS':'NO','THIS'],'IF_THEN');
 }
}
const present=(bits=['NO','THIS'],v='IF_THEN')=>({bits,v});
const absent=()=>({bits:null,v:'IF_THEN'});
// Each side explicitly declares both its input and expected admission status.
const side=(overrides={})=>({declared:'SUPPORTED',admitted:'SUPPORTED',contact:present(),seed:'YES',...overrides});
const definitions=[
 ['EQUAL',side(),side(),'SHARED','IF_THEN'],
 ['SAME_CONTENT_DIFFERENT_VERDICT',side(),side({contact:present(['NO','THIS'],'NO')}),'SHARED','IF_THEN'],
 ['DIFFERENT_CONTENT_SAME_VERDICT',side(),side({contact:present(['THIS','THIS'])}),'SHARED','NOT_SAME'],
 ['EMPTY_EQUAL',side({contact:present([])}),side({contact:present([])}),'SHARED','IF_THEN'],
 ['LAST_BIT_DIFFERENT',side({contact:present(['NO','THIS','NO'])}),side({contact:present(['NO','THIS','THIS'])}),'SHARED','NOT_SAME'],
 ['LEFT_SHORTER',side({contact:present(['NO'])}),side(),'SHARED','NOT_SAME'],
 ['RIGHT_SHORTER',side(),side({contact:present(['NO'])}),'SHARED','NOT_SAME'],
 ['LEFT_ABSENT',side({contact:absent()}),side(),'SHARED','MAYBE'],
 ['RIGHT_ABSENT',side(),side({contact:absent()}),'SHARED','MAYBE'],
 ['BOTH_ABSENT',side({contact:absent()}),side({contact:absent()}),'SHARED','MAYBE'],
 ['MISSING_LEFT_CONTACT',side({contact:null,seed:'NO'}),side(),'SHARED','PENDING_OBSERVATION'],
 ['MISSING_RIGHT_CONTACT',side(),side({contact:null,seed:'NO'}),'SHARED','PENDING_OBSERVATION'],
 ['PRIVATE_LEFT',side(),side({declared:'UNSUPPORTED',admitted:'UNSUPPORTED',seed:'NO'}),'PRIVATE_LEFT','NO_REQUEST'],
 ['PRIVATE_RIGHT',side({declared:'UNSUPPORTED',admitted:'UNSUPPORTED',seed:'NO'}),side(),'PRIVATE_RIGHT','NO_REQUEST'],
 ['BOTH_OUTSIDE',side({declared:'UNSUPPORTED',admitted:'UNSUPPORTED',seed:'NO'}),side({declared:'UNSUPPORTED',admitted:'UNSUPPORTED',seed:'NO'}),'OUTSIDE_BOTH','NO_REQUEST'],
 ['LEFT_UNDECLARED',side({declared:null,admitted:null,seed:'NO'}),side(),'NONE','NO_REQUEST'],
 ['WRONG_RECORD',side({foreignRecord:'YES',seed:'NO'}),side(),'SHARED','PENDING_OBSERVATION'],
 ['WRONG_DOMAIN',side({foreignDomain:'YES',admitted:null,seed:'NO'}),side(),'NONE','NO_REQUEST'],
 ['UNKNOWN_ROLE',side({role:'UNKNOWN_ROLE',admitted:null,seed:'NO'}),side(),'NONE','NO_REQUEST'],
 ['UNKNOWN_OPERATOR',side({admitted:null,seed:'NO'}),side({admitted:null,seed:'NO'}),'NONE','NO_REQUEST','UNKNOWN_OPERATOR'],
 ['UNKNOWN_BASIS',side({admitted:null,seed:'NO'}),side({admitted:null,seed:'NO'}),'NONE','NO_REQUEST','THIS','UNKNOWN_BASIS'],
 ['UNKNOWN_VERDICT',side({contact:present(['NO'],'UNKNOWN_VERDICT'),seed:'NO'}),side(),'SHARED','PENDING_OBSERVATION'],
 ['UNKNOWN_STATUS',side({declared:'UNKNOWN_STATUS',admitted:null,seed:'NO'}),side(),'NONE','NO_REQUEST'],
 ['MALFORMED_EQUAL',side({contact:present(['MALFORMED'])}),side({contact:present(['MALFORMED'])}),'SHARED',null],
];
for(const [index,[id,left,right,domainExpected,result,o='THIS',w='WHAT']] of definitions.entries()){
 const pair='REUSED_EDGE_PAIR',position=pos(o,w),owned=[];
 for(const [label,s] of [['LEFT',left],['RIGHT',right]]){
  const p=owner(`${id}_${label}`,s.role??['PROPOSE','DECIDE','PROMOTE'][(index+(label==='LEFT'?0:1))%3]);owned.push(p);
  if(s.declared!==null)add('P15_DECLARE',p.id,s.foreignDomain?'FOREIGN_DOMAIN':p.domain,position,s.declared);
  if(s.contact)add('P15_CONTACT',p.id,s.foreignRecord?'FOREIGN_RECORD':p.record,position,q(s.contact.v),ref(s.contact.bits));
  if(s.admitted!==null){expect('P15_DOMAIN',p.id,p.domain,position,s.admitted);if(s.admitted==='UNSUPPORTED')expect('P15_PENDING',p.id,position);}
  if(s.seed==='YES')expectedSeed(p.id,o,w,s.contact.v,s.contact.bits);
 }
 const [l,r]=owned,context=`PAIR_CONTEXT(${pair},${l.id},${r.id})`;
 add('P15_PAIR',pair,l.id,r.id);
 if(domainExpected==='SHARED')expect('P15_SHARED',pair,l.id,r.id,position);
 if(domainExpected==='PRIVATE_LEFT')expect('P15_PRIVATE',context,l.id,position);
 if(domainExpected==='PRIVATE_RIGHT')expect('P15_PRIVATE',context,r.id,position);
 if(domainExpected==='OUTSIDE_BOTH')expect('P15_OUTSIDE_BOTH',context,position);
 if(domainExpected==='SHARED'&&left.seed==='YES'&&right.seed==='YES')comparison(pair,l.id,r.id,o,w,left.contact.bits,right.contact.bits,result);
 cases.push({id,pair,left:l.id,right:r.id,position,domain:domainExpected,result,scope:'SYNTHETIC_PRODUCER_INTERFACE'});
}
// Conflict is named by positive closure, not treated as a retraction or a seal.
// Deliberately no pair: this fixture does not assert a consistent partition.
const conflict=owner('CONFLICT_ISOLATED','PROMOTE');
for(const status of ['SUPPORTED','UNSUPPORTED']){add('P15_DECLARE',conflict.id,conflict.domain,pos('THIS','WHAT'),status);expect('P15_DOMAIN',conflict.id,conflict.domain,pos('THIS','WHAT'),status);}
add('P15_CONTACT',conflict.id,conflict.record,pos('THIS','WHAT'),q('IF_THEN'),ref(['NO']));
expectedSeed(conflict.id,'THIS','WHAT','IF_THEN',['NO']);
expect('P15_PENDING',conflict.id,pos('THIS','WHAT'));
expect('P15_DOMAIN_CONFLICT',conflict.id,conflict.domain,pos('THIS','WHAT'));
// All 16 scalar meets and all 256 four-operand R4 tuples.
for(const [i,a] of verdicts.entries())for(const [j,b] of verdicts.entries()){
 const id=`MEET_${i}_${j}`,result=expectedMeet(a,b);add('P15_MEET_REQUEST',id,q(a),q(b));expect('P15_MEET_RESULT',id,q(result));meets.push({id,left:a,right:b,result});
}
let number=0;
for(const w of verdicts)for(const h of verdicts)for(const f of verdicts)for(const y of verdicts){
 const id=`R4_VECTOR_${String(number++).padStart(3,'0')}`,result=expectedMeet(w,w,h,f,y);
 add('P15_TEST_R4_VECTOR',id,q(w),q(h),q(f),q(y));
 expectedSeed(id,'THIS','WHAT',w,null);expectedSeed(id,'THIS','HOW',h,null);expectedSeed(id,'THIS','FOR_WHAT',f,null);expectedSeed(id,'BECAUSE','FOR_WHAT',y,null);
 derived(id,'THIS','WHENCE',result);vectors.push({id,what:w,how:h,for_what:f,why_F:y,whence:result,scope:'PARTIAL_INPUT_R1_R2_ONLY'});
}
for(const tag of checkedTags)expectations[tag]=[...new Set(expectations[tag])].sort();
export const fixtureSource=rows=>'// Synthetic input facts only; no conclusions or expected answers.\n@propose seed P15_SYNTHETIC_FIXTURES := {\n  '+rows.join(',\n  ')+'\n};\n';
export const expectedSeedCount=24+facts.length;
export const specification={scope:'SYNTHETIC_DECLARED_DOMAINS_AND_SUPPLIED_CONTACTS_ONLY',fullMaps,cases,meets,vectors,expectations,fixture_source_facts:facts.length,fixed_source_facts:24};
