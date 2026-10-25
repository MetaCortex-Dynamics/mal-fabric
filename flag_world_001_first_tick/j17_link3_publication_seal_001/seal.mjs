// Byte custody only. No world-law execution, selection, promotion, or original overwrite.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {Readable, Writable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {execFileSync, spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url)), repo=path.resolve(here,'../..');
const base='flag_world_001_first_tick/', seal=base+path.basename(here)+'/';
const roots=[
 'fold_realization_j17_link_3_001','ground_admission_012_001',
 'j17_world_fold_derivation_002','j17_world_fold_binding_003','j17_cross_term_004',
 'j17_relation_scope_005','j17_incidence_correspondence_006','world_transition_contacts_007',
 'j17_propose_008','j17_strict_discharge_diagnostic_008','j17_section_diagnostic_009',
 'j17_fibre_diagnostic_010','j17_pair_diagnostic_011','j17_gate_reading_binding_012',
 'j17_authority_contact_012','j17_tick_promote_binding_013','governing_junction_content_014',
 'producer_projection_015','producer_emissions_016','law_input_decide_017',
 'relation_authority_018','j17_t_r2_r1_diagnostics_019','j17_proposer_reentry_020'
].map(x=>base+x);
const expectedHead='67f16aaa212a747012a6eec1a192517c66a64717';
const expectedBranch='review/fold-realization-j17-link-3-001';
const frozenRel=base+'j17_runs_021_023_seal/FROZEN_REHOME_MANIFEST_001.json';
const frozenHash='F7CADDA1C99DE37E9AF00D5429BA34600ACFF421A3FC4C5622FD8F239DF19560';
const trace='C:/Users/devon/Desktop/MaL/Markdowns/TRACE_FOLD_PRODUCT_PROJECTION_RECORD_001_2026-10-23.md';
const traceHash='335B1E92F61049A143AC1186640C9036D03C91F6D4ABE3CB6975D1397FCCA5B2';
const pinned=[
 [base+'j17_proposer_reentry_020/RUN_RECORD_TEST_P_020.json','DE8052E6A1DB6F4B47D377D88622202E810D5FF3756BFB85CA17F31490DE1D70'],
 [base+'j17_proposer_reentry_020/run_001/committed.world.json','946BADF27E6AA0EBDA090DB61DCE28BC93726BC0DB2153D927DC6F8AE9DB9A88'],
 [base+'j17_step_023/outputs/committed.world.json','E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059']
];
const threshold=16*1024*1024, chunkLimit=40*1024*1024;
const rel=p=>path.relative(repo,p).replaceAll('\\','/');
function resolved(p){const r=path.resolve(repo,p);if(!r.startsWith(repo+path.sep))throw Error('Outside repository: '+p);return r;}
const git=a=>execFileSync('git',a,{cwd:repo,encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024}).trim();
const digest=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const write=(p,b)=>fs.writeFileSync(resolved(p),b,{flag:'wx'});
const json=(p,v)=>write(p,JSON.stringify(v,null,2)+'\n');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('Symlink '+p);return e.isDirectory()?walk(p):[p];}).sort();}
async function hashed(stream){const h=crypto.createHash('sha256');let bytes=0;await pipeline(stream,new Writable({write(b,e,cb){h.update(b);bytes+=b.length;cb();}}));return{sha256:h.digest('hex').toUpperCase(),bytes};}
const hashFile=p=>hashed(fs.createReadStream(p));
function same(a,b,label){if(a.sha256!==b.sha256||(b.bytes!==undefined&&a.bytes!==b.bytes))throw Error('NOT_SAME '+label+' '+JSON.stringify({actual:a,expected:b}));}
async function* partsStream(parts){for(const p of parts)yield* fs.createReadStream(resolved(p.path));}
async function verifyArchiveIdentity(storage){
 if(storage.encoding==='raw')return;
 for(const p of storage.parts)same(await hashFile(resolved(p.path)),p,'archive part '+p.path);
 same(await hashed(Readable.from(partsStream(storage.parts))),{sha256:storage.compressed_sha256,bytes:storage.compressed_bytes},'concatenated gzip');
}
async function decodeHash(storage){
 if(storage.encoding==='raw')return hashFile(resolved(storage.path));
 const h=crypto.createHash('sha256');let bytes=0;
 await pipeline(Readable.from(partsStream(storage.parts)),zlib.createGunzip(),new Writable({write(b,e,cb){h.update(b);bytes+=b.length;cb();}}));
 return {sha256:h.digest('hex').toUpperCase(),bytes};
}
async function frozenCheck(){
 const b=fs.readFileSync(resolved(frozenRel));if(digest(b)!==frozenHash)throw Error('Frozen manifest changed');
 const m=JSON.parse(b);if(m.files.length!==901)throw Error('Frozen count');
 for(const f of m.files)same(await hashFile(resolved(f.destination_path)),{sha256:f.sha256,bytes:f.size},f.destination_path);
 for(const [p,sha256] of pinned)same(await hashFile(resolved(p)),{sha256},p);
 return {files:901,comparison:'SAME',manifest_sha256:frozenHash,original_g2:'SAME'};
}
async function archived(p,original){
 const dir=resolved(seal+'blobs');fs.mkdirSync(dir,{recursive:true});
 const prefix=seal+'blobs/'+original.sha256;
 const meta=resolved(prefix+'.storage.json');
 if(fs.existsSync(meta)){
  const s=JSON.parse(fs.readFileSync(meta));await verifyArchiveIdentity(s);
  same(await decodeHash(s),original,'reused archive '+rel(p));return s;
 }
 const parts=[],fullHash=crypto.createHash('sha256');let fd=null,size=0,h=null,partPath=null,total=0;
 function close(){if(fd===null)return;fs.closeSync(fd);parts.push({path:partPath,bytes:size,sha256:h.digest('hex').toUpperCase()});fd=null;}
 const writer=new Writable({write(b,e,cb){try{
  fullHash.update(b);total+=b.length;let offset=0;
  while(offset<b.length){
   if(fd===null){partPath=prefix+'.gz.part'+String(parts.length).padStart(4,'0');fd=fs.openSync(resolved(partPath),'wx');size=0;h=crypto.createHash('sha256');}
   const n=Math.min(b.length-offset,chunkLimit-size),part=b.subarray(offset,offset+n);let done=0;
   while(done<part.length)done+=fs.writeSync(fd,part,done,part.length-done);
   h.update(part);size+=n;offset+=n;if(size===chunkLimit)close();
  }cb();
 }catch(err){cb(err);}},final(cb){try{close();cb();}catch(err){cb(err);}}});
 try{await pipeline(fs.createReadStream(p),zlib.createGzip({level:6}),writer);}finally{if(fd!==null)fs.closeSync(fd);}
 const storage={encoding:'gzip-parts',compressed_bytes:total,compressed_sha256:fullHash.digest('hex').toUpperCase(),parts};
 same(await decodeHash(storage),original,'decoded '+rel(p));
 fs.writeFileSync(meta,JSON.stringify(storage,null,2)+'\n',{flag:'wx'});return storage;
}
const sums=rows=>rows.map(x=>x.sha256+'  '+x.path).sort().join('\n')+'\n';
async function prepare(){
 if(git(['rev-parse','HEAD'])!==expectedHead||git(['branch','--show-current'])!==expectedBranch)throw Error('Branch/head changed');
 if(git(['diff','--cached','--name-only']))throw Error('Preexisting staged work');
 if(fs.existsSync(resolved(seal+'MANIFEST.json')))throw Error('Preserve existing manifest');
 const frozen=await frozenCheck();
 const traceBytes=fs.readFileSync(trace);if(digest(traceBytes)!==traceHash)throw Error('Trace changed');
 const snapshot=seal+'TRACE_SNAPSHOT_335B1E92.md';if(!fs.existsSync(resolved(snapshot)))write(snapshot,traceBytes);
 same(await hashFile(resolved(snapshot)),{sha256:traceHash,bytes:87282},'trace snapshot');
 const originals=roots.flatMap(r=>walk(resolved(r)));
 if(originals.some(p=>/(?:__pycache__|\.pyc$)/i.test(p)))throw Error('Excluded bytecode');
 const files=[],cache=new Map();let bytes=0,started=Date.now();
 for(const p of originals){
  const original=await hashFile(p);const f={path:rel(p),...original};bytes+=original.bytes;
  if(original.bytes>=threshold){
   if(!cache.has(original.sha256))cache.set(original.sha256,await archived(p,original));
   f.storage=cache.get(original.sha256);
  }else f.storage={encoding:'raw',path:f.path,...original};
  files.push(f);
  if(files.length%25===0||files.length===originals.length)console.log(JSON.stringify({phase:'seal',files:files.length,total:originals.length,raw_bytes:bytes,unique_archives:cache.size,seconds:Math.round((Date.now()-started)/1000)}));
 }
 const trees=Object.fromEntries(['first-tick-conform-v1-v2-001','first-tick-o-exec-discharge-map-001'].map(x=>[x,git(['rev-parse','HEAD:'+base+'evidence/'+x])]));
 const manifest={schema:'J17_LINK3_PUBLICATION_CUSTODY_001',date:'2026-10-25',authority:'Devon: commit and push',branch:expectedBranch,source_head:expectedHead,roots,source_file_count:files.length,source_bytes:bytes,frozen,frozen_trees:trees,trace:{path:snapshot,sha256:traceHash,bytes:87282},publication_scope:'Evidence custody only; no new law promotion, erratum promotion, board action or main merge',excluded_roots:[base+'verification_kit_001',base+'publications'],files};
 json(seal+'MANIFEST.json',manifest);write(seal+'SOURCE_SHA256SUMS',sums(files));
 const stored=new Set(files.flatMap(f=>f.storage.encoding==='raw'?[f.storage.path]:f.storage.parts.map(x=>x.path)));
 for(const p of walk(here))stored.add(rel(p));stored.add(base+'.gitattributes');
 const entries=[];for(const p of [...stored].sort())entries.push({path:p,...await hashFile(resolved(p))});
 write(seal+'SHA256SUMS',sums(entries));
 console.log(JSON.stringify({prepared:'SAME',original_files:files.length,source_bytes:bytes,stored_files:entries.length+1,stored_bytes:entries.reduce((s,x)=>s+x.bytes,0),manifest_sha256:digest(fs.readFileSync(resolved(seal+'MANIFEST.json'))),SHA256SUMS_sha256:digest(fs.readFileSync(resolved(seal+'SHA256SUMS'))),frozen}));
}
function listing(){const rows=fs.readFileSync(resolved(seal+'SHA256SUMS'),'utf8').trim().split('\n').map(line=>{const m=/^([A-F0-9]{64})  (.+)$/.exec(line);if(!m)throw Error('Sum format');return{sha256:m[1],path:m[2]};});rows.push({path:seal+'SHA256SUMS',sha256:digest(fs.readFileSync(resolved(seal+'SHA256SUMS')))});return rows;}
function exact(a,b,label){if(JSON.stringify([...a].sort())!==JSON.stringify([...b].sort()))throw Error('Path set NOT_SAME '+label);}
async function verifyDependencies(){
 const prefix=seal+'dependencies/',m=JSON.parse(fs.readFileSync(resolved(prefix+'DEPENDENCY_MANIFEST.json'))),cache=new Map();
 for(const f of m.files){
  const s=f.storage.encoding==='raw'?{...f.storage,path:prefix+f.storage.path}:{...f.storage,parts:f.storage.parts.map(p=>({...p,path:prefix+p.path}))};
  const key=JSON.stringify(s);if(!cache.has(key)){await verifyArchiveIdentity(s);cache.set(key,await decodeHash(s));}
  same(cache.get(key),f,'external dependency '+f.source_path);
 }
 execFileSync(process.execPath,[resolved(prefix+'t_contacts.mjs'),'verify'],{cwd:repo,windowsHide:true,stdio:'inherit'});
 return {files:m.files.length+5,comparison:'SAME'};
}
function gitIds(mode){
 const items=git(mode==='index'?['ls-files','--stage','-z']:['ls-tree','-rz','HEAD']).split('\0').filter(Boolean);
 return new Map(items.map(line=>{const a=/^(\d+) (?:blob )?([a-f0-9]{40})(?: \d)?\t(.+)$/.exec(line);if(!a)throw Error('Git row '+line);return[a[3],a[2]];}));
}
async function verifyGitBlobs(rows,ids,mode){
 for(const f of rows)if(!ids.has(f.path))throw Error('Absent '+mode+' '+f.path);
 const child=spawn('git',['cat-file','--batch'],{cwd:repo,windowsHide:true,stdio:['pipe','pipe','pipe']});let stderr='';child.stderr.on('data',b=>stderr+=b);
 const exited=new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',c=>c===0?resolve():reject(Error('cat-file '+stderr)));});
 // Attach the rejection handler before streaming; any failure is still awaited below.
 exited.catch(()=>{});
 child.stdin.on('error',()=>{});child.stdin.end(rows.map(f=>ids.get(f.path)).join('\n')+'\n');
 let ordinal=0,header='',remaining=0,bytes=0,h=null,state='header';
 try{
  for await(const buffer of child.stdout){let offset=0;while(offset<buffer.length){
   if(state==='header'){
    const nl=buffer.indexOf(10,offset);
    if(nl<0){header+=buffer.subarray(offset).toString('ascii');if(header.length>256)throw Error('Git header length');break;}
    header+=buffer.subarray(offset,nl).toString('ascii');offset=nl+1;
    const match=/^([a-f0-9]{40}) blob (\d+)$/.exec(header),row=rows[ordinal];
    if(!match||!row||match[1]!==ids.get(row.path))throw Error('Git batch header '+header);
    remaining=Number(match[2]);bytes=remaining;if(!Number.isSafeInteger(bytes)||bytes<0)throw Error('Git blob size');
    h=crypto.createHash('sha256');header='';state=remaining?'body':'trailer';
   }else if(state==='body'){
    const n=Math.min(remaining,buffer.length-offset);h.update(buffer.subarray(offset,offset+n));remaining-=n;offset+=n;if(!remaining)state='trailer';
   }else{
    if(buffer[offset++]!==10)throw Error('Git blob trailer');
    same({sha256:h.digest('hex').toUpperCase(),bytes},rows[ordinal],mode+' '+rows[ordinal].path);ordinal++;state='header';h=null;
   }
  }}
  await exited;if(ordinal!==rows.length||state!=='header'||header)throw Error('Git batch incomplete');
 }catch(error){child.kill();await exited.catch(()=>{});throw error;}
}
async function testGitReader(){
 const ids=gitIds('HEAD'),paths=[base+'README.md',frozenRel,[...ids.keys()].find(p=>p.startsWith(base)&&p.endsWith('.gz'))],rows=[];
 for(const p of paths)rows.push({path:p,...await hashFile(resolved(p))});
 await verifyGitBlobs([...rows,...rows],ids,'reader-test');
 const bad={...rows[2],sha256:(rows[2].sha256[0]==='A'?'B':'A')+rows[2].sha256.slice(1)};
 let withheld=false;try{await verifyGitBlobs([rows[0],rows[1],bad],ids,'reader-negative');}catch(e){if(!e.message.startsWith('NOT_SAME reader-negative'))throw e;withheld=true;}
 if(!withheld)throw Error('Negative Git reader control did not withhold');
 console.log(JSON.stringify({git_reader:'SAME',objects:6,altered_digest:'WITHHELD',scope:'Read-only existing Git blobs'}));
}
function committedPaths(){
 if(git(['branch','--show-current'])!==expectedBranch)throw Error('Branch changed');
 git(['merge-base','--is-ancestor',expectedHead,'HEAD']);
 const chain=git(['rev-list','--reverse','--parents',expectedHead+'..HEAD']).split('\n').filter(Boolean);
 let prior=expectedHead;for(const line of chain){const words=line.split(' ');if(words.length!==2||words[1]!==prior)throw Error('Nonlinear publication chain');if(git(['diff','--name-only','--diff-filter=CDMRTUXB',prior,words[0]]))throw Error('Non-addition publication edge '+words[0]);prior=words[0];}
 if(git(['diff','--name-only','--diff-filter=CDMRTUXB',expectedHead,'HEAD']))throw Error('Non-addition publication');
 return git(['diff','--name-only','--diff-filter=A',expectedHead,'HEAD']).split('\n').filter(Boolean);
}
function batches(){
 const ordered=listing().sort((a,b)=>Number(!a.path.includes('/blobs/'))-Number(!b.path.includes('/blobs/'))||a.path.localeCompare(b.path,'en'));
 const groups=[];let current=[],bytes=0;for(const f of ordered){const n=fs.statSync(resolved(f.path)).size;if(n>=100*1024*1024)throw Error('Oversized Git blob '+f.path);if(bytes+n>512*1024*1024&&current.length){groups.push(current);current=[];bytes=0;}current.push({...f,bytes:n});bytes+=n;}if(current.length)groups.push(current);return groups;
}
function batchAt(n){const all=batches();if(!Number.isInteger(n)||n<1||n>all.length)throw Error('Batch number');return{all,batch:all[n-1],prior:all.slice(0,n-1).flat().map(x=>x.path),through:all.slice(0,n).flat().map(x=>x.path)};}
async function batchStage(n){
 const b=batchAt(n);exact(committedPaths(),b.prior,'prior committed batches');if(git(['diff','--cached','--name-only']))throw Error('Preexisting stage');
 for(const f of b.batch)same(await hashFile(resolved(f.path)),f,'batch working '+f.path);
 execFileSync('git',['--literal-pathspecs','add','--pathspec-from-file=-','--pathspec-file-nul'],{cwd:repo,input:b.batch.map(x=>x.path).join('\0')+'\0',windowsHide:true,stdio:['pipe','inherit','inherit']});
 console.log(JSON.stringify({staged_batch:n,batches:b.all.length,files:b.batch.length,bytes:b.batch.reduce((s,f)=>s+f.bytes,0)}));
}
async function batchVerify(n,mode){
 const b=batchAt(n),changed=mode==='index'?git(['diff','--cached','--name-only','--diff-filter=A']).split('\n').filter(Boolean):committedPaths();
 exact(changed,mode==='index'?b.batch.map(x=>x.path):b.through,mode+' batch '+n);
 if(mode==='index'){exact(committedPaths(),b.prior,'prior batches');if(git(['diff','--cached','--name-only','--diff-filter=CDMRTUXB']))throw Error('Non-addition staged');}
 for(const f of b.batch)same(await hashFile(resolved(f.path)),f,'batch disk '+f.path);
 await verifyGitBlobs(b.batch,gitIds(mode),mode);
 console.log(JSON.stringify({verification:mode,verdict:'SAME',batch:n,batches:b.all.length,files:b.batch.length,HEAD:git(['rev-parse','HEAD'])}));
}
async function verify(mode='working'){
 const m=JSON.parse(fs.readFileSync(resolved(seal+'MANIFEST.json'))),listed=listing();
 const all=listed.map(x=>x.path);let ids;
 if(mode==='index'||mode==='HEAD'){
  ids=gitIds(mode);
  const changed=mode==='index'?git(['diff','--cached','--name-only','--diff-filter=A']).split('\n').filter(Boolean):committedPaths();exact(changed,all,mode);
  if(mode==='index'&&git(['diff','--cached','--name-only','--diff-filter=CDMRTUXB']))throw Error('Non-addition '+mode);
 }
 for(const f of listed)same(await hashFile(resolved(f.path)),f,'stored '+f.path);
 if(ids)await verifyGitBlobs(listed,ids,mode);
 const seen=new Map();let n=0;
 for(const f of m.files){
  const key=JSON.stringify(f.storage);
  if(!seen.has(key)){await verifyArchiveIdentity(f.storage);seen.set(key,await decodeHash(f.storage));}
  same(seen.get(key),f,'decoded '+f.path);
  if(fs.existsSync(resolved(f.path)))same(await hashFile(resolved(f.path)),f,'original '+f.path);
  n++;if(n%250===0)console.log(JSON.stringify({phase:'verify',mode,files:n,total:m.files.length}));
 }
 for(const [k,v] of Object.entries(m.frozen_trees))if(git(['rev-parse','HEAD:'+base+'evidence/'+k])!==v)throw Error('Frozen tree changed '+k);
 const frozen=await frozenCheck(),dependencies=await verifyDependencies();
 if(m.source_head!==expectedHead)throw Error('Source commit changed');
 console.log(JSON.stringify({verification:mode,verdict:'SAME',original_files:m.files.length,stored_files:listed.length,manifest_sha256:digest(fs.readFileSync(resolved(seal+'MANIFEST.json'))),SHA256SUMS_sha256:digest(fs.readFileSync(resolved(seal+'SHA256SUMS'))),frozen,dependencies,HEAD:git(['rev-parse','HEAD'])}));
}
async function stage(){
 if(git(['rev-parse','HEAD'])!==expectedHead||git(['branch','--show-current'])!==expectedBranch)throw Error('Branch/head changed');
 if(git(['diff','--cached','--name-only']))throw Error('Preexisting stage');
 const paths=listing().map(x=>x.path);for(const p of paths){if(fs.statSync(resolved(p)).size>=100*1024*1024)throw Error('Oversized Git blob '+p);}
 execFileSync('git',['--literal-pathspecs','add','--pathspec-from-file=-','--pathspec-file-nul'],{cwd:repo,input:paths.join('\0')+'\0',windowsHide:true,stdio:['pipe','inherit','inherit']});
 console.log(JSON.stringify({staged:paths.length}));
}
async function restore(){
 const m=JSON.parse(fs.readFileSync(resolved(seal+'MANIFEST.json')));let count=0;
 for(const f of m.files){
  const target=resolved(f.path);if(fs.existsSync(target)){same(await hashFile(target),f,'existing '+f.path);continue;}
  if(f.storage.encoding==='raw')throw Error('Missing raw storage '+f.path);
  await verifyArchiveIdentity(f.storage);same(await decodeHash(f.storage),f,'before restore '+f.path);
  fs.mkdirSync(path.dirname(target),{recursive:true});await pipeline(Readable.from(partsStream(f.storage.parts)),zlib.createGunzip(),fs.createWriteStream(target,{flags:'wx'}));
  same(await hashFile(target),f,'restored '+f.path);count++;
 }console.log(JSON.stringify({restored:count,verdict:'SAME'}));
}
const mode=process.argv[2],number=Number(process.argv[3]);
if(mode==='prepare')await prepare();else if(mode==='verify')await verify();else if(mode==='verify-index')await verify('index');else if(mode==='verify-head')await verify('HEAD');else if(mode==='stage')await stage();else if(mode==='restore')await restore();else if(mode==='test-git-reader')await testGitReader();else if(mode==='batches')console.log(JSON.stringify(batches().map((b,i)=>({batch:i+1,files:b.length,bytes:b.reduce((s,f)=>s+f.bytes,0)}))));else if(mode==='stage-batch')await batchStage(number);else if(mode==='verify-index-batch')await batchVerify(number,'index');else if(mode==='verify-head-batch')await batchVerify(number,'HEAD');else throw Error('prepare | verify | stage | verify-index | verify-head | restore | batches | stage-batch N | verify-index-batch N | verify-head-batch N | test-git-reader');
