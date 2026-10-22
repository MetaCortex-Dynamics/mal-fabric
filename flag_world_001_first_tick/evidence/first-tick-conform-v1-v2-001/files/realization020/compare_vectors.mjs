// Observation-only ordered CONFORM. Never builds or launches a GPU.
// Expected bytes are observer-only and must not appear in runtime input custody.
import fs from 'node:fs';
import path from 'node:path';
import {openReadback,sha} from './readback.mjs';
const [manifestPath,outArg]=process.argv.slice(2);
if(!manifestPath||!outArg)throw Error('manifest.json output-directory required');
const manifestBytes=fs.readFileSync(manifestPath),manifest=JSON.parse(manifestBytes);
if(JSON.stringify(manifest.vectors?.map(v=>v.id))!==JSON.stringify(['V1','V2']))throw Error('ordered V1/V2 manifest required');
const out=path.resolve(outArg);if(fs.existsSync(out))throw Error('preserve existing comparison directory');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const bytes=v=>Buffer.from(JSON.stringify(canonical(v))),digest=v=>sha(bytes(v)).toLowerCase(),same=(a,b)=>bytes(a).equals(bytes(b))?'SAME':'NOT_SAME';
function audit(v){
 const inputBytes=fs.readFileSync(v.input),expectedBytes=fs.readFileSync(v.expected);
 const bound={id:v.id,input:{path:path.resolve(v.input),bytes:inputBytes.length,sha256:sha(inputBytes)},expected:{path:path.resolve(v.expected),bytes:expectedBytes.length,sha256:sha(expectedBytes)}};
 if(!v.input_sha256||!v.expected_sha256||v.input_sha256.toUpperCase()!==bound.input.sha256||v.expected_sha256.toUpperCase()!==bound.expected.sha256)throw Error(v.id+' frozen specification byte binding NOT_SAME');
 if(!v.run_dir)return {...bound,execution:'NOT_RUN',comparison:'MAYBE'};
 const dir=path.resolve(v.run_dir),r=openReadback(dir),imageBytes=fs.readFileSync(path.join(dir,'image.bin')),sourceBytes=fs.readFileSync(path.join(dir,'source.mal'));
 if(sha(imageBytes)!==r.map.image_sha256||sha(sourceBytes)!==r.map.source_sha256)throw Error(v.id+' run custody NOT_SAME');
 const imports=[...(r.map.inputs||[]),...(r.map.input?[r.map.input]:[])];
 if(!imports.some(x=>x.sha256===bound.input.sha256))throw Error(v.id+' frozen input not bound in run map');
 if(imports.some(x=>x.sha256===bound.expected.sha256))throw Error(v.id+' expected bytes appear as runtime input');
 const outputs=r.predicate('COMMITTED_VECTOR_OUTPUT');if(outputs.length!==1||outputs[0].rule<0)throw Error(v.id+' requires one source-derived COMMITTED_VECTOR_OUTPUT');
 const outputFact=outputs[0],root=r.node(outputFact.term);if(root.s!=='THIS'||root.c.length!==2)throw Error(v.id+' output arity');
 const ancestors=new Set(),stack=[outputFact.id];
 while(stack.length){const id=stack.pop();if(ancestors.has(id))continue;const f=r.facts[id];if(!f)throw Error('support index');ancestors.add(id);for(const s of f.support){if(s>=id)throw Error('support order');stack.push(s);}}
 const ancestral=tag=>r.predicate(tag).filter(f=>ancestors.has(f.id)&&f.rule>=0);
 for(const tag of ['VCOM_RETURN','VCOM_ALL_RESULTS','STEP_FABRIC_RETURN','I20_SUCCESSOR_JSON','VD_INITIAL_CHAIN_MATCH','VO_DECISION'])if(!ancestral(tag).length)throw Error(v.id+' missing source ancestry '+tag);
 const returns=ancestral('VCOM_RETURN');if(returns.length!==1)throw Error(v.id+' return context not singleton');
 const rc=r.node(returns[0].term).c,[p,h,next]=rc.slice(1),matching=(tag,test)=>ancestral(tag).filter(f=>test(r.node(f.term).c));
 if(matching('STEP_FABRIC_RETURN',c=>c[1]===p&&c[3]===next).length!==1||matching('I20_SUCCESSOR_JSON',c=>c[1]===p&&c[2]===h&&c[3]===next).length!==1)throw Error(v.id+' output/return context NOT_SAME');
 const observed=r.value(root.c[1]),actualBytes=Buffer.from(JSON.stringify(observed)),input=JSON.parse(inputBytes),checks=[],check=(name,a,b)=>checks.push({name,reading:same(a,b)});
 const chain=observed.state?.chain,prior=input.initial_state?.chain;if(!Array.isArray(chain)||!Array.isArray(prior)||chain.length!==prior.length+1)throw Error(v.id+' chain shape');
 check('retained predecessor entries',chain.slice(0,-1),prior);
 for(let i=0;i<chain.length;i++){const {link,...record}=chain[i];check('link '+i+' hashes full record',link,digest(record));if(i)check('predecessor '+i,chain[i].prev,chain[i-1].link);}
 const tick=chain.at(-1);
 check('receipt hash',tick.receipt_hash,digest(observed.receipt));
 check('successor state hash',tick.state_hash,digest({entities:observed.state.entities,field:observed.state.field}));
 if(prior.length)check('genesis state hash',prior[0].state_hash,digest({entities:input.initial_state.entities,field:input.initial_state.field}));
 check('receipt reading',tick.receipt_reading,observed.receipt.discharged.length||observed.receipt.opened.length?'THIS':'NO');
 const comparison=actualBytes.equals(expectedBytes)?'SAME':'NOT_SAME';if(comparison==='SAME'&&checks.some(x=>x.reading!=='SAME'))throw Error(v.id+' byte-SAME but diagnostic chain NOT_SAME');
 const allResults=ancestral('VCOM_ALL_RESULTS').map(f=>({fact:f.id,rule:f.origin}));
 const committedComparisons=r.predicate('I20_COMMITTED_AGREEMENT').filter(f=>{const c=r.node(f.term).c;return c[1]===p&&c[2]===h&&c[3]===next;}).length;
 const runtimeReceipts=r.predicate('I20_RUNTIME_RECEIPT').filter(f=>{const c=r.node(f.term).c;return c[1]===p&&c[2]===h;}).length;
 const result={...bound,execution:'EXECUTED',comparison,run_dir:dir,source_sha256:sha(sourceBytes),image_sha256:sha(imageBytes),readback_sha256:sha(r.raw),source_map_sha256:sha(fs.readFileSync(path.join(dir,'source-map.json'))),actual:{file:v.id+'.actual.json',bytes:actualBytes.length,sha256:sha(actualBytes)},source_output:{fact:outputFact.id,rule:outputFact.origin,return_fact:returns[0].id,return_rule:returns[0].origin,complete_results:allResults,committed_comparisons:committedComparisons,runtime_receipts:runtimeReceipts},expected_runtime_input:'NOT_PRESENT_IN_BOUND_INPUTS',diagnostics:checks};
 if(comparison!=='SAME'){let first=0;while(first<actualBytes.length&&first<expectedBytes.length&&actualBytes[first]===expectedBytes[first])first++;result.first_differing_byte_offset=first;}
 return {result,actualBytes};
}
const vectors=[],artifacts=[];let stopped=null;
for(const v of manifest.vectors){if(stopped){vectors.push({id:v.id,execution:'NOT_RUN',comparison:'MAYBE',reason:'ordered CONFORM stopped at '+stopped});continue;}const x=audit(v);if(x.execution==='NOT_RUN'){vectors.push(x);stopped=v.id;continue;}vectors.push(x.result);artifacts.push([x.result.actual.file,x.actualBytes]);if(x.result.comparison==='NOT_SAME')stopped=v.id;}
const verdict=vectors.some(v=>v.comparison==='NOT_SAME')?'NO':vectors.every(v=>v.execution==='EXECUTED'&&v.comparison==='SAME')?'IF_THEN':'MAYBE';
const report={scope:'Ordered V1/V2 byte conformance only; no GPU execution or runtime input construction',manifest_sha256:sha(manifestBytes),observer_sha256:sha(fs.readFileSync(new URL(import.meta.url))),vectors,verdict};
fs.mkdirSync(out,{recursive:true});for(const [name,data] of artifacts)fs.writeFileSync(path.join(out,name),data);fs.writeFileSync(path.join(out,'CONFORM.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(verdict==='NO')process.exitCode=2;
