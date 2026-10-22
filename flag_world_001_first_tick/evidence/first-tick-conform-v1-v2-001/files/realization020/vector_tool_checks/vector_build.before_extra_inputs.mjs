// CPU-only byte assembly and generic lowering. Never launches a GPU or board.
// All correspondence, displacement, admission and commit laws remain in .mal.
// Input expected-output files are neither opened nor accepted by this script.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));
const cwd='C:/Users/devon/Documents/Codex/2026-10-04/new-chat';
const retained=path.join(cwd,'review_flag_world_002');
const [vector,...args]=process.argv.slice(2);
if(!['V1','V2'].includes(vector))throw Error('V1 or V2 is required');
const options={stage:0};
for(let i=0;i<args.length;i++){
 const key=args[i];
 if(key==='--accelerate'){options.accelerate=true;continue;}
 if(!['--stage','--out','--hash-response','--observer-pairs','--runtime','--receipts','--append-source'].includes(key)||i+1===args.length)throw Error('unknown or unfilled option '+key);
 const name=key.slice(2);if(Object.hasOwn(options,name)&&name!=='stage')throw Error('duplicate option '+key);options[name]=args[++i];
}
const stage=Number(options.stage);
if(!Number.isInteger(stage)||stage<0||stage>99)throw Error('bounded stage index');
const work=path.resolve(options.out||path.join(root,'vectors',vector));
if(work!==path.join(root,'vectors',vector)&&!work.startsWith(root+path.sep))throw Error('output must remain beneath this approved realization root');
const stem=String(stage).padStart(2,'0'),stageDir=path.join(work,'stage'+stem);
if(fs.existsSync(stageDir))throw Error('preserve existing stage '+stageDir);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const identity=p=>{const bytes=fs.readFileSync(p);return {path:path.resolve(p),sha256:sha(bytes),size:bytes.length};};
const same=r=>{const now=identity(r.path);if(now.sha256!==r.sha256||now.size!==r.size)throw Error('custody NOT_SAME: '+r.path);};
const src=name=>path.join(root,'source',name);
const inputHash={V1:'28093717ACC694FACC3B635701A22AFF37DDB09FB0447774BACC700647F262BE',V2:'DC46E239B9D693AF25DC3D7005718060230D31AC9CA057F7ECCCF73968AA2C8E'};
const vectorInput=identity(path.join(cwd,'flag_world_first_tick_001_v013',vector+'.input.json'));
if(vectorInput.sha256!==inputHash[vector])throw Error('frozen vector input NOT_SAME');
let inputs={},members=[],runtime=false,accelerated=false,prior=null;
const bind=(alias,file)=>{if(Object.hasOwn(inputs,alias))throw Error('input alias already bound: '+alias);inputs[alias]=identity(file);};
if(stage===0){
 if(options.runtime)throw Error('runtime requires an executed source proof and its observed inventory');
 members=[path.join(retained,'s_f_binding_019/placement_run.mal'),src('vector_correspondence.mal'),src('vector_displacement.mal'),src('vector_observer.mal'),src('hash_transport.mal')];
 bind('frame',path.join(retained,'jtp_locus_017/inputs/frame.json'));
 bind('capture',path.join(retained,'jtp_locus_017/inputs/capture.json'));
 bind('field',path.join(retained,'gpu_self_witness_018/current.field.json'));
 bind('witness',path.join(retained,'gpu_self_witness_018/current.witness.json'));
 bind('hashes',path.join(retained,'gpu_self_witness_018/hashes0/responses.json'));
 bind('links',path.join(retained,'gpu_self_witness_018/hashes1/responses.json'));
 bind('vector',vectorInput.path);
 bind('observer_pairs',path.join(root,'hash_empty/responses.json'));
 bind('hash_batch',path.join(root,'hash_empty/responses.json'));
}else{
 const previous=path.join(work,'stage'+String(stage-1).padStart(2,'0'),'BUILD.json');
 prior=JSON.parse(fs.readFileSync(previous,'utf8'));
 if(prior.vector!==vector||prior.stage!==stage-1)throw Error('previous stage identity NOT_SAME');
 same(prior.source);for(const r of Object.values(prior.inputs))same(r);
 inputs=prior.inputs;members=[prior.source.path];runtime=prior.runtime;accelerated=prior.accelerated;
}
const transports=[];
function additive(option,alias,atom,body){
 if(!options[option])return;
 bind(alias,options[option]);
 transports.push(`// Generic additive custody import; no previous input seed is replaced.\n@readonly input ${atom} := "${alias}:";\nlaw ${atom}_TRANSPORT := IF THIS(${atom},${body.input}) THEN ${body.output};\n`);
}
additive('hash-response','vh'+stem,'VECTOR_HASH_'+stem,{input:'ARRAY(rows)',output:'THIS(HASH_BATCH_ROWS,rows)'});
additive('observer-pairs','vp'+stem,'VECTOR_PAIRS_'+stem,{input:'rows',output:'THIS(VO_PAIR_INVENTORY,rows)'});
additive('receipts','vr'+stem,'VECTOR_RECEIPTS_'+stem,{input:'rows',output:'THIS(I20_RECEIPT_INVENTORY,rows)'});
if(options.receipts&&!runtime&&!options.runtime)throw Error('receipt import requires runtime source');
if(options.runtime){
 if(runtime)throw Error('runtime source already retained; cannot replace its program inventory');
 const inventory=path.resolve(options.runtime);
 bind('program_inventory',path.join(inventory,'program_inventory.json'));
 bind('receipt_inventory',path.join(root,'hash_empty/responses.json'));
 members.push(path.join(inventory,'cell_hashes.mal'),src('fixture_core_contacts.mal'),src('program_core.mal'),src('ingress_core.mal'),src('vector_commit.mal'));
 runtime=true;
}
if(options.accelerate){
 if(accelerated)throw Error('fold accelerations already retained');
 if(!runtime)throw Error('runtime folds require runtime source');
 members.push(src('fold_acceleration.mal'));accelerated=true;
}
// Additive source bytes remain separately hash-bound in this stage's custody.
// Nothing in the retained source or its imports is replaced or reinterpreted.
if(options['append-source'])members.push(path.resolve(options['append-source']));
const bytesMembers=members.map(p=>({record:identity(p),bytes:fs.readFileSync(p)}));
const transportBytes=Buffer.from(transports.join('\n'));
const bytes=Buffer.concat([...bytesMembers.flatMap(x=>[x.bytes,Buffer.from('\n')]),transportBytes]);
// This preflight count is diagnostic; the existing generic parser is authoritative.
const laws=(bytes.toString('utf8').match(/^law\s/gm)||[]).length;
if(laws>1024)throw Error('source rule capacity exceeded before artifact creation');
for(const r of Object.values(inputs))same(r);
fs.mkdirSync(stageDir,{recursive:true});
const source=path.join(stageDir,'source.mal');fs.writeFileSync(source,bytes);
fs.writeFileSync(source+'.custody.json',JSON.stringify({members:bytesMembers.map(x=>x.record),transport_sha256:sha(transportBytes),source_sha256:sha(bytes),scope:'byte assembly plus generic additive readonly-import forwarding only'},null,2));
const image=path.join(stageDir,'image');
const lower=path.join(root,'lower_compact_large.mjs');
const output=execFileSync(process.execPath,[lower,source,image,'-',...Object.entries(inputs).map(([alias,r])=>alias+'='+r.path)],{cwd,encoding:'utf8',maxBuffer:32*1024*1024,windowsHide:true});
process.stdout.write(output);
const map=JSON.parse(fs.readFileSync(path.join(image,'source-map.json'),'utf8'));
const record={scope:'CPU_ONLY; image prepared, GPU_NOT_RUN; source proof is not CONFORM',vector,stage,runtime,accelerated,source:identity(source),inputs,members:bytesMembers.map(x=>x.record),orchestrator:identity(fileURLToPath(import.meta.url)),lowerer:identity(lower),image:identity(path.join(image,'image.bin')),source_map:identity(path.join(image,'source-map.json')),bounds:{rules:map.rules.length,patterns:map.patterns.length,seeds:map.seeds.length,max_variables:Math.max(...map.rules.map(r=>r.vars.length)),max_antecedents:Math.max(...map.rules.map(r=>r.ants.length))},previous:prior?{source:prior.source,image:prior.image}:null};
fs.writeFileSync(path.join(stageDir,'BUILD.json'),JSON.stringify(record,null,2));
console.log(JSON.stringify({vector,stage,source_sha256:record.source.sha256,image_sha256:record.image.sha256,...record.bounds,execution:'NOT_RUN'}));
