// Read-only custody verifier. No world execution, index changes, commits or pushes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {spawn,execFileSync} from 'node:child_process';
import {Writable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2), mode=args[0]||'--files';
const root=path.resolve(args[1]||here);
const repo=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:root,encoding:'utf8'}).trim();
const prefix=path.relative(repo,root).replaceAll('\\','/');
const revision=mode==='--index'?':':(args[2]||'HEAD')+':';
const h=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const gitPath=p=>revision+prefix+'/'+p;
function bytes(p){return mode==='--files'?fs.readFileSync(path.join(root,p)):execFileSync('git',['cat-file','blob',gitPath(p)],{cwd:repo,maxBuffer:32*1024*1024});}
async function digest(p,gunzip=false){
 let source,finished;
 if(mode==='--files')source=fs.createReadStream(path.join(root,p));
 else{
  const c=spawn('git',['cat-file','blob',gitPath(p)],{cwd:repo,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let stderr='';c.stderr.on('data',b=>stderr+=b);source=c.stdout;
  finished=new Promise((resolve,reject)=>{c.on('error',reject);c.on('close',code=>code===0?resolve():reject(Error(stderr)));});
 }
 const hash=crypto.createHash('sha256');let n=0;
 const sink=new Writable({write(b,e,cb){hash.update(b);n+=b.length;cb();}});
 if(gunzip)await pipeline(source,zlib.createGunzip(),sink);else await pipeline(source,sink);
 if(finished)await finished;
 return {sha256:hash.digest('hex').toUpperCase(),bytes:n};
}
const sums=bytes('SHA256SUMS').toString('utf8').trimEnd().split('\n').map(line=>{const m=/^([0-9A-F]{64})  (.+)$/.exec(line);if(!m||m[2].includes('..')||path.isAbsolute(m[2]))throw Error('CHECKSUM_SYNTAX');return{sha256:m[1],path:m[2]};});
const manifest=JSON.parse(bytes('CUSTODY_MANIFEST.json'));
if(new Set(sums.map(s=>s.path)).size!==sums.length)throw Error('DUPLICATE_CHECKSUM_PATH');
const aliasCheck=new Map(), originals=new Set();
for(const e of manifest.entries){
 if(path.isAbsolute(e.stored)||e.stored.split('/').includes('..')||!['gzip','identity'].includes(e.encoding))throw Error('UNSAFE_STORAGE_PATH_OR_ENCODING');
 if(originals.has(e.original.toLowerCase()))throw Error('DUPLICATE_ORIGINAL_PATH');originals.add(e.original.toLowerCase());
 const desc=JSON.stringify([e.sha256,e.bytes,e.encoding,e.storage]);
 if(aliasCheck.has(e.stored)&&aliasCheck.get(e.stored)!==desc)throw Error('INCONSISTENT_DEDUPLICATED_ALIAS');aliasCheck.set(e.stored,desc);
}
function walk(d,p=''){let out=[];for(const e of fs.readdirSync(d,{withFileTypes:true})){const q=p?p+'/'+e.name:e.name;if(e.isDirectory())out.push(...walk(path.join(d,e.name),q));else if(e.isFile())out.push(q);else throw Error('SYMLINK '+q);}return out;}
const listed=mode==='--files'?walk(root):(mode==='--index'?execFileSync('git',['ls-files','-z','--',prefix],{cwd:repo}):execFileSync('git',['ls-tree','-r','--name-only','-z',args[2]||'HEAD','--',prefix],{cwd:repo})).toString('utf8').split('\0').filter(Boolean).map(p=>p.slice(prefix.length+1));
const expectedPaths=[...sums.map(s=>s.path),'SHA256SUMS'].sort();
if(JSON.stringify(listed.sort())!==JSON.stringify(expectedPaths))throw Error('EXACT_TREE_NOT_SAME');
const stored=new Map(manifest.entries.map(e=>[e.stored,e]));
let done=0;
for(const s of sums){const d=await digest(s.path);if(d.sha256!==s.sha256)throw Error('STORAGE_NOT_SAME '+s.path);const e=stored.get(s.path);if(e&&(d.sha256!==e.storage.sha256||d.bytes!==e.storage.bytes))throw Error('MANIFEST_STORAGE_NOT_SAME '+s.path);if(++done%100===0)console.log(JSON.stringify({mode,phase:'storage',done,total:sums.length}));}
done=0;for(const[p,e]of stored){
 const d=await digest(p,e.encoding==='gzip');
 if(d.sha256!==e.sha256||d.bytes!==e.bytes)throw Error('ORIGINAL_BYTES_NOT_SAME '+p);
 if(++done%100===0)console.log(JSON.stringify({mode,phase:'original_bytes',done,total:stored.size}));
}
const byOriginal=new Map(manifest.entries.map(e=>[e.original.toLowerCase().replaceAll('\\','/'),e]));
const refs=JSON.parse(bytes('BOUND_REFERENCES.json'));
for(const r of refs){const e=byOriginal.get((r.resolved_path||r.path).toLowerCase().replaceAll('\\','/'));if(!e||e.sha256!==r.sha256||(typeof r.bytes==='number'&&e.bytes!==r.bytes))throw Error('BINDING_NOT_SAME '+r.path);}
const result={mode,revision:mode==='--files'?'WORKTREE':mode==='--index'?'INDEX':execFileSync('git',['rev-parse',args[2]||'HEAD'],{cwd:repo,encoding:'utf8'}).trim(),verdict:'SAME',checksummed_files:sums.length,original_paths:manifest.entries.length,bound_references:refs.length,run_record_sha256:manifest.run_record_sha256,sha256sums_sha256:h(bytes('SHA256SUMS'))};
console.log(JSON.stringify(result));
