// Custody packaging only. Does not execute world law, stage, commit, or push.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {pipeline} from 'node:stream/promises';
import {Transform, Writable} from 'node:stream';
import {fileURLToPath} from 'node:url';
const controls=path.dirname(fileURLToPath(import.meta.url));
const task=path.dirname(controls), repo=path.join(task,'review_flag_world_002');
const root='D:/Dev/flag-world-first-tick-020';
const receipt='C:/Users/devon/Desktop/MaL/Markdowns/RECEIPT_PROMOTE_FIRST_TICK_CONFORM_V1_V2_001.md';
const rel='review/first-tick-conform-v1-v2-001', dest=path.join(repo,rel);
const canon=p=>path.resolve(p).replaceAll('\\','/');
const key=p=>canon(p).toLowerCase();
const files=new Map(), refs=[], scans=[];
const recovery={
 '10C036B4739998BE848AB4C769A0DF4FEF223D21E73EE5548854560B4EA5F972':path.join(root,'vector_tool_checks/vector_build.before_extra_inputs.mjs'),
 '70EA9F0FBBACC4B8161BEB91D288EA4EB608B9665FC5D55C1156BA8A94B4FF63':path.join(controls,'recovered/vector_build.70EA9F0F.mjs')
};
const excluded=p=>/(^|\/)__pycache__(\/|$)|\.pyc$/i.test(canon(p));
function add(p,why){p=canon(p);if(excluded(p))throw Error('EXCLUDED '+p);const s=fs.statSync(p);if(!s.isFile())throw Error('NOT_FILE '+p);const k=key(p);if(!files.has(k)){files.set(k,{original:p,bytes:s.size,reasons:[why]});scans.push(p);}else if(!files.get(k).reasons.includes(why))files.get(k).reasons.push(why);}
function tree(p,why){for(const e of fs.readdirSync(p,{withFileTypes:true})){const q=path.join(p,e.name);if(excluded(q))continue;if(e.isDirectory())tree(q,why);else if(e.isFile())add(q,why);else throw Error('SYMLINK '+q);}}
function subset(p,why){for(const e of fs.readdirSync(p,{withFileTypes:true}))if(e.isFile()&&/\.(mal|mjs|cjs|cu|inc|cmd|md)$/i.test(e.name))add(path.join(p,e.name),why);}
const dirs=[
 'source','inputs','carrier_prefill_001','prefill_qualification_001','ref012_indexed_qualification',
 'parallel_prefill_002/vectors_repeat_008','parallel_prefill_002/vectors_v2_009',
 'parallel_prefill_002/vectors_iterative/V1/stage01',
 'parallel_prefill_002/qualification_iterative_full','parallel_prefill_002/qualification_iterative_small',
 'parallel_prefill_002/capacity_refusal_008','parallel_prefill_002/iterative_collect_007',
 'parallel_prefill_002/cases','block_replay_qualification_inputs_001',
 'vectors/V1/stage00','vectors/V1/stage01','vectors/V2/stage00','vectors/V2/stage01'
];
for(const d of dirs)tree(path.join(root,d),'complete successful execution / qualification dependency');
tree(path.join(task,'v2_continuation_009'),'V2 orchestration and binding');
for(const f of ['RUN_RECORD_V1_V2_CONFORM_009.json','RUN_RECORD_V1_REPEAT_AND_CONTINUATION_008.json','CONTINUATION_008_BINDINGS.json','PIPELINE_008_START.json','pipeline_v1_008.stdout.log','pipeline_v1_008.stderr.log','repeat_v1_008.stdout.log','repeat_v1_008.stderr.log'])add(path.join(root,'parallel_prefill_002',f),'promoted execution / replay custody');
for(const f of ['qualify_iterative.mjs','qualification_guard.mjs','audit_iterative_telemetry.mjs','prepare_iterative_qualification.mjs','ITERATIVE_QUALIFICATION_TRANSFORM.json','run_iterative_v1.mjs','ITERATIVE_EXECUTION_TRANSFORM.json','RUN_RECORD_ITERATIVE_PREFILL_007.json'])add(path.join(root,'parallel_prefill_002',f),'successful runtime qualification and launch genealogy');
for(const f of ['SPEC_FLAG_WORLD_FIRST_TICK_001_v0.1.3_PROPOSED.mal','V1.input.json','V1.expected.json','V2.input.json','V2.expected.json'])add(path.join(task,'flag_world_first_tick_001_v013',f),'frozen governing binding; expected bytes comparison only');
add(path.join(task,'flag_world_first_tick_001_v011/SPEC_FLAG_WORLD_FIRST_TICK_001_v0.1.1_PROPOSED.mal'),'receipt parent spec');
add(receipt,'Devon promotion and local commit authority');
tree(path.join(controls,'recovered'),'exact historical assembler identity recovery');
const absolute=s=>typeof s==='string'&&/^[A-Za-z]:[\\/]/.test(s);
function visit(o,from,where='$'){
 if(!o||typeof o!=='object')return;
 if(absolute(o.path)&&typeof o.sha256==='string'&&/^[0-9a-f]{64}$/i.test(o.sha256)){
   const sha=o.sha256.toUpperCase();
   const recovered=key(o.path)===key(path.join(root,'vector_build.mjs'))?recovery[sha]:null;
   add(recovered||o.path,'bound by '+from+' '+where);
   refs.push({from,field:where,path:canon(o.path),sha256:sha,bytes:o.size??o.bytes,...(recovered?{resolved_path:canon(recovered),resolution:'Exact historical bytes; original record path retained; no substitution of current version'}:{})});
 }
 for(const [k,v]of Object.entries(o))if(typeof v==='object')visit(v,from,where+'.'+k);
}
for(let i=0;i<scans.length;i++){
 const p=scans[i],s=fs.statSync(p);
 if(/\.json$/i.test(p)&&s.size<2*1024*1024){try{visit(JSON.parse(fs.readFileSync(p,'utf8')),p);}catch(e){if(e instanceof SyntaxError)throw Error('JSON '+p+' '+e.message);throw e;}}
 if(/\.(mjs|cjs)$/i.test(p)){
  const t=fs.readFileSync(p,'utf8');
  for(const m of t.matchAll(/(?:from\s*|import\s*|require\s*\()['"]([^'"\r\n]+)['"]/g)){
   let q=m[1];if(q.startsWith('file:///'))q=fileURLToPath(q);else if(q.startsWith('.'))q=path.resolve(path.dirname(p),q);else continue;
   add(q,'module dependency of '+p);
  }
 }
}
async function digest(p,unzip=false){const h=crypto.createHash('sha256');let bytes=0;const sink=new Writable({write(c,e,cb){h.update(c);bytes+=c.length;cb();}});if(unzip)await pipeline(fs.createReadStream(p),zlib.createGunzip(),sink);else await pipeline(fs.createReadStream(p),sink);return {sha256:h.digest('hex').toUpperCase(),bytes};}
const anchors=[
 [receipt,'162397CBFAB7FC543D80601882A7E071B0D4387D0895C341F588DAF5B831470E'],
 [path.join(root,'parallel_prefill_002/RUN_RECORD_V1_V2_CONFORM_009.json'),'6089FDC4E2B8673BBEA80925AC80BD0BB787857932723564DDA7F9D2499A8F99'],
 [path.join(root,'parallel_prefill_002/vectors_v2_009/V2/conform/CONFORM.json'),'DBD4F2A387B66E751604A14ED27C46E2BE594C7D9949BFB9310C058AD1EB0942']
];
for(const[p,h]of anchors)refs.push({from:'Devon receipt / intake binding',path:canon(p),sha256:h});
const entries=[...files.values()].sort((a,b)=>a.original.localeCompare(b.original));
const total=entries.reduce((s,e)=>s+e.bytes,0);
console.log(JSON.stringify({phase:'inventory',files:entries.length,raw_bytes:total,bound_references:refs.length}));
if(process.argv.includes('--inventory')){fs.writeFileSync(path.join(controls,'INVENTORY.json'),JSON.stringify({entries,refs,total},null,2),{flag:'wx'});process.exit(0);}
if(!process.argv.includes('--pack'))throw Error('USE --inventory OR --pack');
if(fs.existsSync(dest))throw Error('DESTINATION_ALREADY_PRESENT '+dest);
// Verify originals and every recorded file binding before creating the package.
let done=0;for(const e of entries){Object.assign(e,await digest(e.original));if(++done%50===0)console.log(JSON.stringify({phase:'hash_originals',done,total:entries.length}));}
const mismatch=[];for(const r of refs){const e=files.get(key(r.resolved_path||r.path));if(e.sha256!==r.sha256||(typeof r.bytes==='number'&&e.bytes!==r.bytes))mismatch.push({...r,observed:{sha256:e.sha256,bytes:e.bytes}});}
if(mismatch.length){fs.writeFileSync(path.join(controls,'NOT_SAME.json'),JSON.stringify(mismatch,null,2),{flag:'wx'});throw Error('BOUND_BYTES_NOT_SAME '+mismatch.length);}
for(const v of ['V1','V2']){const expected=fs.readFileSync(path.join(task,'flag_world_first_tick_001_v013',v+'.expected.json'));const actual=fs.readFileSync(path.join(root,'parallel_prefill_002/vectors_v2_009/V2/conform',v+'.actual.json'));if(!actual.equals(expected))throw Error(v+' NOT_SAME');}
const aliases=[ [root,'realization020'],[path.join(task,'v2_continuation_009'),'controls009'],[path.join(task,'flag_world_first_tick_001_v013'),'frozen013'],[path.join(task,'flag_world_first_tick_001_v011'),'frozen011'],[repo,'review014'],['C:/Users/devon/Desktop/MaL','corpus'],[task,'workspace'] ];
function logical(p){for(const[b,a]of aliases){const r=path.relative(b,p).replaceAll('\\','/');if(r&&!r.startsWith('../')&&!path.isAbsolute(r))return a+'/'+r;}return 'external/'+p.replace(':','').replaceAll('\\','/');}
fs.mkdirSync(dest,{recursive:true});
fs.writeFileSync(path.join(dest,'.gitattributes'),'* -text -filter -ident -working-tree-encoding\n',{flag:'wx'});
const blobs=new Map();done=0;
for(const e of entries){
 e.logical=logical(e.original);
 if(e.bytes>=4*1024*1024){
  e.encoding='gzip';e.stored='blobs/'+e.sha256+'.gz';
  if(!blobs.has(e.sha256)){
   const q=path.join(dest,e.stored);fs.mkdirSync(path.dirname(q),{recursive:true});
   const h=crypto.createHash('sha256');let n=0;
   const tap=new Transform({transform(c,x,cb){h.update(c);n+=c.length;cb(null,c);}});
   await pipeline(fs.createReadStream(e.original),tap,zlib.createGzip({level:6}),fs.createWriteStream(q,{flags:'wx'}));
   if(h.digest('hex').toUpperCase()!==e.sha256||n!==e.bytes)throw Error('SOURCE_CHANGED '+e.original);
   const round=await digest(q,true);if(round.sha256!==e.sha256||round.bytes!==e.bytes)throw Error('GZIP_NOT_SAME '+e.original);
   blobs.set(e.sha256,await digest(q));
  }
  e.storage=blobs.get(e.sha256);
 }else{
  e.encoding='identity';e.stored='files/'+e.logical;const q=path.join(dest,e.stored);
  fs.mkdirSync(path.dirname(q),{recursive:true});fs.copyFileSync(e.original,q,fs.constants.COPYFILE_EXCL);
  e.storage=await digest(q);if(e.storage.sha256!==e.sha256||e.storage.bytes!==e.bytes)throw Error('COPY_NOT_SAME '+e.original);
 }
 if(++done%25===0)console.log(JSON.stringify({phase:'pack_and_verify',done,total:entries.length,unique_gzip:blobs.size}));
}
const manifest={scope:'LOCAL_COMMIT_CUSTODY_OF_PROMOTED_V1_V2_CONFORMANCE',receipt_sha256:anchors[0][1],run_record_sha256:anchors[1][1],conform_sha256:anchors[2][1],promotion_scope:'V1/V2 committed-output conformance only; no J17 second step, broader placement, or marker-route promotion',encoding:'identity for small files; gzip for large files. Original bytes recover exactly. No source binary overwritten. Repeated raw hashes share storage; logical original paths retained.',bound_references_checked:refs.length,original_paths:entries.length,raw_bytes:total,entries};
fs.writeFileSync(path.join(dest,'CUSTODY_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(dest,'BOUND_REFERENCES.json'),JSON.stringify(refs,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({phase:'pack_complete',destination:dest,files:entries.length,gzip_blobs:blobs.size,raw_bytes:total}));
