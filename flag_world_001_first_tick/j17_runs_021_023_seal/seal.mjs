// Repository byte custody only: no world-law execution, selection or promotion.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {pipeline} from 'node:stream/promises';
import {Transform} from 'node:stream';
import {execFileSync,spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(here,'../..');
const roots=['j17_step_021','j17_step_022','j17_step_023','runtime_021'].map(x=>'flag_world_001_first_tick/'+x);
const relative=p=>path.relative(repo,p).replaceAll('\\','/');
const git=args=>execFileSync('git',args,{cwd:repo,encoding:'utf8',windowsHide:true}).trim();
const digest=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const expectedHead='60340c61f1a29321a0b414b4d079b55a1bfd9fd6';
const expectedBranch='review/flag-world-j17-second-step-021';
const frozenManifest=path.join(here,'FROZEN_REHOME_MANIFEST_001.json');
const frozenManifestHash='F7CADDA1C99DE37E9AF00D5429BA34600ACFF421A3FC4C5622FD8F239DF19560';
const manifestPath=path.join(here,'MANIFEST.json');
function checkedPath(p){const q=path.resolve(repo,p);if(!q.startsWith(repo+path.sep))throw Error('path outside repository');return q;}
function walk(p){const out=[];for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isSymbolicLink())throw Error('unexpected symbolic link '+f);if(e.isDirectory())out.push(...walk(f));else out.push(f);}return out.sort();}
async function streamed(input,unzip=false){const h=crypto.createHash('sha256');let bytes=0;const sink=new Transform({transform(b,e,cb){h.update(b);bytes+=b.length;cb();}});if(unzip)await pipeline(input,zlib.createGunzip(),sink);else await pipeline(input,sink);return{sha256:h.digest('hex').toUpperCase(),bytes};}
const hashFile=(p,unzip=false)=>streamed(fs.createReadStream(p),unzip);
function same(actual,expected,label){if(actual.sha256!==expected.sha256||actual.bytes!==expected.bytes)throw Error('NOT_SAME '+label+' '+JSON.stringify({actual,expected}));}
async function frozenCheck(){const b=fs.readFileSync(frozenManifest);if(digest(b)!==frozenManifestHash)throw Error('frozen manifest NOT_SAME');const m=JSON.parse(b);if(m.files.length!==901)throw Error('frozen count');for(const f of m.files)same(await hashFile(checkedPath(f.destination_path)),{sha256:f.sha256,bytes:f.size},f.destination_path);return{count:901,comparison:'SAME',manifest_sha256:frozenManifestHash};}
function write(p,b){fs.writeFileSync(p,b,{flag:'wx'});}
function sums(rows){return rows.map(x=>x.sha256+'  '+x.path).sort().join('\n')+'\n';}
async function prepare(){
 if(git(['rev-parse','HEAD'])!==expectedHead||git(['branch','--show-current'])!==expectedBranch)throw Error('branch/head changed');
 if(git(['diff','--cached','--name-only']))throw Error('unrelated staged work');
 if(fs.existsSync(manifestPath))throw Error('preserve seal');
 const frozen=await frozenCheck(),originals=roots.flatMap(x=>walk(checkedPath(x)));
 if(originals.length!==353)throw Error('source inventory changed '+originals.length);
 if(originals.some(x=>/(?:__pycache__|\.pyc$)/i.test(x)))throw Error('excluded Python cache');
 fs.mkdirSync(path.join(here,'blobs'),{recursive:true});const files=[];
 for(const p of originals){
  const original=await hashFile(p),f={path:relative(p),...original};
  if(original.bytes>100*1024*1024){
   const target=path.join(here,'blobs',original.sha256+'.gz');
   if(!fs.existsSync(target))await pipeline(fs.createReadStream(p),zlib.createGzip({level:9}),fs.createWriteStream(target,{flags:'wx'}));
   same(await hashFile(target,true),original,f.path+' decompressed');
   f.storage={encoding:'gzip',path:relative(target),...await hashFile(target)};
  }else f.storage={encoding:'raw',path:f.path,...original};
  files.push(f);
 }
 const frozenTrees=Object.fromEntries(['first-tick-conform-v1-v2-001','first-tick-o-exec-discharge-map-001'].map(x=>[x,git(['rev-parse','HEAD:flag_world_001_first_tick/evidence/'+x])]));
 const manifest={record:'J17_RUNS_021_023_BYTE_CUSTODY',authority:'Devon: commit runs 021–023 into mal-fabric; local only; no promotion',date:'2026-10-22',branch:expectedBranch,source_head:expectedHead,source_file_count:files.length,source_bytes:files.reduce((n,f)=>n+f.bytes,0),frozen_evidence:frozen,frozen_trees:frozenTrees,files};
 write(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 write(path.join(here,'SOURCE_SHA256SUMS'),sums(files));
 const helpers=[relative(manifestPath),relative(path.join(here,'SOURCE_SHA256SUMS')),relative(path.join(here,'README.md')),relative(path.join(here,'.gitattributes')),relative(path.join(here,'seal.mjs')),relative(frozenManifest),'flag_world_001_first_tick/.gitignore'];
 const entries=[...new Set([...files.map(f=>f.storage.path),...helpers])];const stored=[];
 for(const p of entries)stored.push({path:p,...await hashFile(checkedPath(p))});
 write(path.join(here,'SHA256SUMS'),sums(stored));
 console.log(JSON.stringify({prepared:'SAME',files:files.length,archives:files.filter(f=>f.storage.encoding==='gzip').length,manifest_sha256:digest(fs.readFileSync(manifestPath)),stored_files:entries.length+1,frozen}));
}
async function blob(id){const p=spawn('git',['cat-file','blob',id],{cwd:repo,windowsHide:true,stdio:['ignore','pipe','pipe']});let error='';p.stderr.on('data',b=>error+=b);const exit=new Promise((resolve,reject)=>{p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(Error(error)));});return{stream:p.stdout,done:exit};}
async function verify(mode){
 const m=JSON.parse(fs.readFileSync(manifestPath));
 const listed=fs.readFileSync(path.join(here,'SHA256SUMS'),'utf8').trim().split('\n').map(line=>{const hit=/^([A-F0-9]{64})  (.+)$/.exec(line);if(!hit)throw Error('sum format');return{sha256:hit[1],path:hit[2]};});
 const all=[...listed,{path:relative(path.join(here,'SHA256SUMS')),sha256:digest(fs.readFileSync(path.join(here,'SHA256SUMS')))}];
 let indexed;
 if(mode==='index'){
  indexed=git(['diff','--cached','--name-only','--diff-filter=A']).split('\n');
  if(JSON.stringify([...indexed].sort())!==JSON.stringify(all.map(x=>x.path).sort()))throw Error('staged paths NOT_SAME');
  if(git(['diff','--cached','--name-only','--diff-filter=CDMRTUXB']))throw Error('non-addition staged');
 }
 for(const f of all){const disk=await hashFile(checkedPath(f.path));if(disk.sha256!==f.sha256)throw Error('storage file NOT_SAME '+f.path);if(mode==='index'||mode==='HEAD'){const id=git(['rev-parse',mode==='index'?':'+f.path:'HEAD:'+f.path]),b=await blob(id);const bound=await streamed(b.stream);await b.done;same(bound,disk,mode+' '+f.path);}}
 for(const f of m.files){const result=await hashFile(checkedPath(f.storage.path),f.storage.encoding==='gzip');same(result,f,'decoded '+f.path);const original=checkedPath(f.path);if(fs.existsSync(original))same(await hashFile(original),f,'working '+f.path);}
 for(const [key,tree] of Object.entries(m.frozen_trees))if(git(['rev-parse','HEAD:flag_world_001_first_tick/evidence/'+key])!==tree)throw Error('frozen Git tree NOT_SAME '+key);
 const frozen=await frozenCheck();
 if(mode==='HEAD'){
  if(git(['rev-parse','HEAD^'])!==m.source_head)throw Error('commit parent NOT_SAME');
  const changed=git(['diff-tree','--no-commit-id','--name-only','-r','HEAD']).split('\n');
  if(JSON.stringify(changed.sort())!==JSON.stringify(all.map(x=>x.path).sort()))throw Error('committed paths NOT_SAME');
 }
 console.log(JSON.stringify({verification:mode,verdict:'SAME',original_files:m.files.length,stored_files:all.length,archives:m.files.filter(f=>f.storage.encoding==='gzip').length,manifest_sha256:digest(fs.readFileSync(manifestPath)),SHA256SUMS_sha256:digest(fs.readFileSync(path.join(here,'SHA256SUMS'))),frozen,HEAD:git(['rev-parse','HEAD'])}));
}
async function restore(){const m=JSON.parse(fs.readFileSync(manifestPath));let restored=0;for(const f of m.files.filter(x=>x.storage.encoding==='gzip')){const p=checkedPath(f.path),archive=checkedPath(f.storage.path);same(await hashFile(archive),f.storage,'archive '+f.path);same(await hashFile(archive,true),f,'decoded '+f.path);if(fs.existsSync(p)){same(await hashFile(p),f,'existing '+f.path);continue;}fs.mkdirSync(path.dirname(p),{recursive:true});await pipeline(fs.createReadStream(archive),zlib.createGunzip(),fs.createWriteStream(p,{flags:'wx'}));same(await hashFile(p),f,'restored '+f.path);restored++;}console.log(JSON.stringify({restore:'SAME',recovered_files:restored}));}
const [command]=process.argv.slice(2);
if(command==='prepare')await prepare();else if(command==='verify')await verify('working');else if(command==='verify-index')await verify('index');else if(command==='verify-head')await verify('HEAD');else if(command==='restore')await restore();else throw Error('prepare | verify | verify-index | verify-head | restore');
