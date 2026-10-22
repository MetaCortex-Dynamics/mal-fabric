// Execution variant: pre-launch runtime/guard identities are retained and checked afterward.
// Parent prefill_guard.mjs remains byte-exact as bound by the carrier seal.
// Carrier-prefill qualification guard; generic proof-preserving continuation.
// Derived from resume_guard_vector.mjs; adds bounded qualification capacities,
// exact retained-byte checks and a write-once custody report. No world predicates.
// Check-only is the default. --run explicitly launches the supplied executable.
// --compare additionally requires complete fact/term closure equality with a
// separately produced clean readback before this command reports qualification.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const args=new Map();
for(let i=2;i<process.argv.length;i++){
 const key=process.argv[i];
 if(!key.startsWith('--')||args.has(key))throw Error('unique named arguments required');
 if(key==='--run')args.set(key,true);
 else{const value=process.argv[++i];if(!value||value.startsWith('--'))throw Error('argument value required: '+key);args.set(key,path.resolve(value));}
}
const allowed=new Set(['--previous-map','--previous-image','--previous-readback','--next-map','--next-image','--exe','--output','--compare','--run','--report']);
for(const key of args.keys())if(!allowed.has(key))throw Error('unknown argument '+key);
function required(key){const value=args.get(key);if(!value)throw Error('required '+key);return value;}
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const fingerprint=(symbol,children)=>sha(JSON.stringify([symbol,children]));
const guardHashBefore=sha(fs.readFileSync(new URL(import.meta.url)));
const NS=2048,NR=1024;
function readProgram(mapPath,imagePath){
 const rawMap=fs.readFileSync(mapPath),map=JSON.parse(rawMap),raw=fs.readFileSync(imagePath);
 if(sha(raw)!==map.image_sha256)throw Error('source-map/image hash NOT_SAME');
 const sourcePath=path.join(path.dirname(mapPath),'source.mal');
 if(sha(fs.readFileSync(sourcePath))!==map.source_sha256)throw Error('source-map/source hash NOT_SAME');
 const word=at=>raw.readInt32LE(at*4);
 const NP=(raw.length-16-NS*4-NR*40)/40;
 if(![65536,524288,1048576].includes(NP)||word(0)!==0x33414c47)throw Error('image format');
 const pc=word(1),sc=word(2),rc=word(3);
 if(pc<1||pc>NP||sc<1||sc>NS||rc<1||rc>NR||map.patterns.length!==pc||map.seeds.length!==sc||map.rules.length!==rc)throw Error('image/source-map bounds');
 const patterns=[],keys=[];
 for(let i=0;i<pc;i++){
  const at=4+i*10,sym=word(at),arity=word(at+1),children=[];
  if(sym< -16||sym>=map.symbols.length||arity<0||arity>8)throw Error('pattern bounds');
  for(let j=0;j<arity;j++){const child=word(at+2+j);if(child<0||child>=i)throw Error('pattern child order');children.push(child);}
  const actual={sym,children},recorded=map.patterns[i];
  if(recorded.sym!==sym||JSON.stringify(recorded.children)!==JSON.stringify(children))throw Error('source-map pattern NOT_SAME');
  patterns.push(actual);keys.push(fingerprint(sym,children.map(j=>keys[j])));
 }
 const seeds=[];
 for(let i=0;i<sc;i++){const id=word(4+NP*10+i);if(id<0||id>=pc||id!==map.seeds[i])throw Error('seed/image NOT_SAME');seeds.push(id);}
 const rules=[];
 for(let i=0;i<rc;i++){
  const at=4+NP*10+NS+i*10,count=word(at),result=word(at+1),ants=[];
  if(count<1||count>8||result<0||result>=pc)throw Error('rule bounds');
  for(let j=0;j<count;j++){const a=word(at+2+j);if(a<0||a>=pc)throw Error('antecedent bounds');ants.push(a);}
  const recorded=map.rules[i];if(recorded.result!==result||JSON.stringify(recorded.ants)!==JSON.stringify(ants))throw Error('source-map rule NOT_SAME');
  rules.push({ants,result,key:sha(JSON.stringify([ants.map(j=>keys[j]),keys[result]]))});
 }
 return {map,patterns,keys,seeds,rules,image_sha256:sha(raw),map_sha256:sha(rawMap)};
}

function readState(file,program,verifyProof){
 const raw=fs.readFileSync(file),word=at=>raw.readInt32LE(at*4);
 if(raw.length<32)throw Error('checkpoint format');
 const NT=word(2),NF=word(3);
 if(!((NT===32768&&NF===16384)||(NT===1048576&&NF===524288)||(NT===4194304&&NF===2097152))||raw.length!==32+NT*40+NF*48||word(0)!==0x31524c47||word(1)!==1)throw Error('checkpoint format');
 const error=word(4),tc=word(5),fc=word(6),epochs=word(7);
 if(error||tc<1||tc>NT||fc<1||fc>NF||epochs<1)throw Error('checkpoint incomplete or failed');
 const terms=[],keys=[],termKeys=new Set();
 for(let i=0;i<tc;i++){
  const at=8+i*10,sym=word(at),arity=word(at+1),children=[];
  if(sym<0||sym>=program.map.symbols.length||arity<0||arity>8)throw Error('checkpoint term bounds');
  for(let j=0;j<arity;j++){const child=word(at+2+j);if(child<0||child>=i)throw Error('checkpoint term order');children.push(child);}
  const key=fingerprint(sym,children.map(j=>keys[j]));if(termKeys.has(key))throw Error('checkpoint duplicate term');
  terms.push({sym,children});keys.push(key);termKeys.add(key);
 }
 const facts=[],factKeys=new Set(),seedKeys=new Set(program.seeds.map(i=>program.keys[i]));
 function match(patternId,termId,bindings){
  const stack=[[patternId,termId]];
  while(stack.length){const [pi,ti]=stack.pop(),p=program.patterns[pi],t=terms[ti];
   if(p.sym<0){const v=-p.sym-1;if(bindings.has(v)&&bindings.get(v)!==ti)return false;bindings.set(v,ti);continue;}
   if(p.sym!==t.sym||p.children.length!==t.children.length)return false;
   for(let j=0;j<p.children.length;j++)stack.push([p.children[j],t.children[j]]);
  }return true;
 }
 for(let i=0;i<fc;i++){
  const at=8+NT*10+i*12,term=word(at),rule=word(at+1),rank=word(at+2),count=word(at+3),support=[];
  if(term<0||term>=tc||rule< -1||rule>=program.rules.length||rank<0||count<0||count>8)throw Error('checkpoint fact bounds');
  for(let j=0;j<count;j++){const n=word(at+4+j);if(n<0||n>=i)throw Error('checkpoint support order');support.push(n);}
  const key=keys[term];if(factKeys.has(key))throw Error('checkpoint duplicate fact');
  if(verifyProof){
   if(rule===-1){if(rank||count||!seedKeys.has(key))throw Error('checkpoint seed not supplied by prior image');}
   else{
    const r=program.rules[rule],bindings=new Map();if(count!==r.ants.length)throw Error('checkpoint support count');
    for(let j=0;j<count;j++)if(!match(r.ants[j],facts[support[j]].term,bindings))throw Error('checkpoint antecedent proof NOT_SAME');
    const before=bindings.size;if(!match(r.result,term,bindings)||bindings.size!==before)throw Error('checkpoint consequent proof NOT_SAME');
    if(rank!==Math.max(...support.map(j=>facts[j].rank+1)))throw Error('checkpoint rank proof NOT_SAME');
   }
  }
  facts.push({term,rank});factKeys.add(key);
 }
 if(verifyProof)for(const key of seedKeys)if(!factKeys.has(key))throw Error('prior seed missing from checkpoint');
 return {sha256:sha(raw),term_count:tc,fact_count:fc,epochs,termKeys,factKeys,usedTerms:raw.subarray(32,32+tc*40),usedFacts:raw.subarray(32+NT*40,32+NT*40+fc*48)};
}

if(args.has('--report')&&fs.existsSync(args.get('--report')))throw Error('preserve existing custody report');
const previous=readProgram(required('--previous-map'),required('--previous-image'));
const next=readProgram(required('--next-map'),required('--next-image'));
if(next.map.symbols.length<previous.map.symbols.length||previous.map.symbols.some((s,i)=>s!==next.map.symbols[i]))throw Error('prior symbol-table prefix NOT_SAME');
if(next.rules.length<previous.rules.length||previous.rules.some((r,i)=>r.key!==next.rules[i].key))throw Error('retained logical rule/index NOT_SAME');
const nextSeeds=new Set(next.seeds.map(i=>next.keys[i]));
for(const seed of previous.seeds)if(!nextSeeds.has(previous.keys[seed]))throw Error('prior input seed removed');
const checkpoint=readState(required('--previous-readback'),previous,true);
const report={guard:'IF_THEN',previous_image_sha256:previous.image_sha256,next_image_sha256:next.image_sha256,checkpoint_sha256:checkpoint.sha256,retained_rules:previous.rules.length,retained_facts:checkpoint.fact_count,retained_terms:checkpoint.term_count,symbol_prefix:'SAME',logical_rule_prefix:'SAME',prior_seeds:'PRESERVED',checkpoint_proofs:'SAME',execution:'NOT_RUN',qualification:'MAYBE'};
if(args.has('--run')){
 const exe=required('--exe'),output=required('--output');
 if([required('--previous-readback'),required('--previous-image'),required('--next-image')].some(p=>p.toLowerCase()===output.toLowerCase()))throw Error('output must not overwrite evidence/input');
 if(fs.existsSync(output))throw Error('output already present; preserve it');
 const runtimeHashBefore=sha(fs.readFileSync(exe));
 const result=spawnSync(exe,[required('--next-image'),output,required('--previous-readback'),String(previous.rules.length)],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','inherit']});
 if(result.error||result.status!==0)throw Error('continuation failed: '+(result.error?.message??result.stderr??result.stdout));
 report.execution='EXECUTED';report.substrate_output=result.stdout.trim();report.runtime_sha256=runtimeHashBefore;
 if(sha(fs.readFileSync(exe))!==runtimeHashBefore)throw Error('runtime custody changed during execution');
 const resumed=readState(output,next,true);
 if(!resumed.usedTerms.subarray(0,checkpoint.usedTerms.length).equals(checkpoint.usedTerms)||!resumed.usedFacts.subarray(0,checkpoint.usedFacts.length).equals(checkpoint.usedFacts))throw Error('retained proof bytes NOT_SAME');
 report.retained_proof_bytes='SAME';report.resumed_sha256=resumed.sha256;report.facts=resumed.fact_count;report.terms=resumed.term_count;report.epochs=resumed.epochs;
 if(args.has('--compare')){
  const clean=readState(required('--compare'),next,true);
  const missingFacts=[...clean.factKeys].filter(k=>!resumed.factKeys.has(k)),extraFacts=[...resumed.factKeys].filter(k=>!clean.factKeys.has(k));
  const missingTerms=[...clean.termKeys].filter(k=>!resumed.termKeys.has(k)),extraTerms=[...resumed.termKeys].filter(k=>!clean.termKeys.has(k));
  report.clean_sha256=clean.sha256;report.fact_difference={missing:missingFacts.length,extra:extraFacts.length};report.term_difference={missing:missingTerms.length,extra:extraTerms.length};
  report.qualification=missingFacts.length||extraFacts.length||missingTerms.length||extraTerms.length?'NOT_SAME':'SAME';
  if(report.qualification!=='SAME')process.exitCode=2;
 }
}else if(args.has('--compare'))throw Error('--compare requires --run');
report.scope='PREFILL_CUSTODY_AND_GENERIC_CLOSURE_QUALIFICATION_ONLY; NOT_V1_V2_CONFORM';
report.guard_source_sha256=guardHashBefore;
if(sha(fs.readFileSync(new URL(import.meta.url)))!==guardHashBefore)throw Error('guard custody changed during execution');
if(args.has('--report'))fs.writeFileSync(args.get('--report'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report,null,2));
