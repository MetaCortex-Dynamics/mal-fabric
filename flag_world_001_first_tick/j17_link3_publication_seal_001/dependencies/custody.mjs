// Additive byte custody only. No GPU, world-law execution, or original writes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {Readable, Writable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const groups=[
 {name:'j17_fibre_diagnostic_010',root:'D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001',files:22,bytes:1137562365},
 {name:'j17_pair_diagnostic_011',root:'D:/mal_worldline_backups/j17_pair_diagnostic_011/run_001',files:20,bytes:578864770}
];
const known={
 'j17_fibre_diagnostic_010/RUN_RECORD_010.json':'2AD351F73AF9C7046C6883E0EF1C29180F272DAF9EDE5047630E242743F9A053',
 'j17_fibre_diagnostic_010/FIBRE_ASSIGNMENTS_AND_RECEIPTS.json':'3CF8EBD03172E056852399AC472605EFEA3704EB6EB71A6EFFB259A2566B4147',
 'j17_fibre_diagnostic_010/stage/readback.bin':'C381CCCD2A580CA90BB88216CF63F7CEA4ACD444DBA95B75379D12507FECC9D3',
 'j17_fibre_diagnostic_010/replay/readback.bin':'C381CCCD2A580CA90BB88216CF63F7CEA4ACD444DBA95B75379D12507FECC9D3',
 'j17_pair_diagnostic_011/RUN_RECORD_011.json':'35334015AC81697383480FAE210DE3CC1AF06FEBD75079761E280BCF948EE518',
 'j17_pair_diagnostic_011/PAIR_ASSIGNMENTS_AND_RECEIPTS.json':'BF21091472DA1C4E61B4D75F3F27E8E9C48BE67742C8A6DC9DECE2D783BF981F',
 'j17_pair_diagnostic_011/stage/readback.bin':'7529D7B3ADBE275B9B7C4551031C3661FF8A4AB4E5A5054A2C9219AD98FB9AA5',
 'j17_pair_diagnostic_011/replay/readback.bin':'7529D7B3ADBE275B9B7C4551031C3661FF8A4AB4E5A5054A2C9219AD98FB9AA5',
 'j17_pair_diagnostic_011/RECORD_J17_REACTION_PDPE_001.mal':'3605713EFF93B32033C51704C258B3EF60310247BB2917DCD72F7B0D872A5E05'
};
const threshold=16*1024*1024,partLimit=40*1024*1024;
const slash=p=>p.replaceAll('\\','/');
const relative=p=>slash(path.relative(here,p));
function target(p){const q=path.resolve(here,p);if(!q.startsWith(here+path.sep))throw Error('Outside dependencies: '+p);return q;}
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>{const q=path.join(p,e.name);if(e.isSymbolicLink())throw Error('Symlink '+q);return e.isDirectory()?walk(q):[q];}).sort();}
const digest=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
function write(p,b){fs.writeFileSync(target(p),b,{flag:'wx'});}
function same(a,b,label){if(a.sha256!==b.sha256||(b.bytes!==undefined&&a.bytes!==b.bytes))throw Error('NOT_SAME '+label+' '+JSON.stringify({actual:a,expected:b}));}
async function hashStream(stream){const h=crypto.createHash('sha256');let bytes=0;await pipeline(stream,new Writable({write(b,e,cb){h.update(b);bytes+=b.length;cb();}}));return{sha256:h.digest('hex').toUpperCase(),bytes};}
const hashFile=p=>hashStream(fs.createReadStream(p));
async function* partsStream(parts){for(const p of parts)yield* fs.createReadStream(target(p.path));}
async function decodedHash(s){
 if(s.encoding==='raw')return hashFile(target(s.path));
 const h=crypto.createHash('sha256');let bytes=0;
 await pipeline(Readable.from(partsStream(s.parts)),zlib.createGunzip(),new Writable({write(b,e,cb){h.update(b);bytes+=b.length;cb();}}));
 return{sha256:h.digest('hex').toUpperCase(),bytes};
}
async function archive(source,original){
 fs.mkdirSync(target('blobs'),{recursive:true});const prefix='blobs/'+original.sha256;
 const parts=[];let fd=null,size=0,h=null,partPath=null,total=0;const compressedHash=crypto.createHash('sha256');
 function close(){if(fd===null)return;fs.closeSync(fd);parts.push({path:partPath,bytes:size,sha256:h.digest('hex').toUpperCase()});fd=null;}
 const sink=new Writable({write(b,e,cb){try{
  compressedHash.update(b);total+=b.length;let offset=0;
  while(offset<b.length){
   if(fd===null){partPath=prefix+'.gz.part'+String(parts.length).padStart(4,'0');fd=fs.openSync(target(partPath),'wx');size=0;h=crypto.createHash('sha256');}
   const n=Math.min(b.length-offset,partLimit-size),part=b.subarray(offset,offset+n);let done=0;
   while(done<n){const written=fs.writeSync(fd,part,done,n-done);if(written===0)throw Error('Zero-byte write');done+=written;}
   h.update(part);size+=n;offset+=n;if(size===partLimit)close();
  }cb();
 }catch(error){cb(error);}},final(cb){try{close();cb();}catch(error){cb(error);}}});
 try{await pipeline(fs.createReadStream(source),zlib.createGzip({level:6}),sink);}finally{if(fd!==null)fs.closeSync(fd);}
 const s={encoding:'gzip-parts',compressed_bytes:total,compressed_sha256:compressedHash.digest('hex').toUpperCase(),parts};
 same(await decodedHash(s),original,'decompressed '+source);return s;
}
const sums=rows=>rows.map(x=>x.sha256+'  '+x.path).sort().join('\n')+'\n';
async function prepare(){
 if(fs.existsSync(target('DEPENDENCY_MANIFEST.json')))throw Error('Preserve existing dependency manifest');
 const inventories=groups.map(g=>({...g,paths:walk(g.root)}));
 for(const g of inventories){if(g.paths.length!==g.files||g.paths.reduce((n,p)=>n+fs.statSync(p).size,0)!==g.bytes)throw Error('Inventory NOT_SAME '+g.name);if(g.paths.some(p=>/(?:__pycache__|\.pyc$)/i.test(p)))throw Error('Excluded bytecode');}
 const files=[],archives=new Map();
 for(const g of inventories)for(const p of g.paths){
  const source_relative=slash(path.relative(g.root,p)),key=g.name+'/'+source_relative,original=await hashFile(p);
  if(known[key])same(original,{sha256:known[key]},'record-bound '+key);
  let storage;
  if(original.bytes>=threshold){if(!archives.has(original.sha256))archives.set(original.sha256,await archive(p,original));storage=archives.get(original.sha256);}
  else{const dest='raw/'+g.name+'/run_001/'+source_relative;fs.mkdirSync(path.dirname(target(dest)),{recursive:true});fs.copyFileSync(p,target(dest),fs.constants.COPYFILE_EXCL);storage={encoding:'raw',path:dest,...await hashFile(target(dest))};same(storage,original,'raw copy '+key);}
  files.push({group:g.name,source_path:slash(p),source_relative,...original,prior_record_bound:known[key]!==undefined,storage});
  console.log(JSON.stringify({phase:'dependency-custody',files:files.length,total:42,path:key,sha256:original.sha256}));
 }
 if(files.length!==42||Object.keys(known).some(k=>!files.some(f=>f.group+'/'+f.source_relative===k)))throw Error('Incomplete source inventory');
 const m={schema:'J17_LINK3_EXTERNAL_DEPENDENCIES_001',authority:'Devon: commit and push; additive custody of referenced 010/011 evidence',scope:'Exact external run bytes; no law execution, promotion, world mutation, or original write',source_file_count:files.length,source_bytes:files.reduce((n,f)=>n+f.bytes,0),groups,files};
 write('DEPENDENCY_MANIFEST.json',JSON.stringify(m,null,2)+'\n');
 write('SOURCE_SHA256SUMS',sums(files.map(f=>({path:f.source_path,sha256:f.sha256}))));
 const stored=new Set(['custody.mjs','README.md','DEPENDENCY_MANIFEST.json','SOURCE_SHA256SUMS']);
 for(const f of files)for(const p of f.storage.encoding==='raw'?[f.storage.path]:f.storage.parts.map(x=>x.path))stored.add(p);
 const rows=[];for(const p of [...stored].sort())rows.push({path:p,...await hashFile(target(p))});
 write('SHA256SUMS',sums(rows));
 console.log(JSON.stringify({prepared:'SAME',source_files:files.length,source_bytes:m.source_bytes,stored_files:rows.length+1,stored_bytes:rows.reduce((n,r)=>n+r.bytes,0),unique_archives:archives.size,manifest_sha256:digest(fs.readFileSync(target('DEPENDENCY_MANIFEST.json')))}));
}
async function verify(originals=false){
 const m=JSON.parse(fs.readFileSync(target('DEPENDENCY_MANIFEST.json'),'utf8'));
 const rows=fs.readFileSync(target('SHA256SUMS'),'utf8').trim().split('\n').map(l=>{const a=/^([A-F0-9]{64})  (.+)$/.exec(l);if(!a)throw Error('Sum format');return{sha256:a[1],path:a[2]};});
 for(const r of rows)same(await hashFile(target(r.path)),r,'storage '+r.path);
 const decoded=new Map();for(const f of m.files){
  const key=JSON.stringify(f.storage);
  if(!decoded.has(key)){
   if(f.storage.encoding==='gzip-parts'){
    for(const p of f.storage.parts){if(p.bytes>partLimit)throw Error('Oversize archive part '+p.path);same(await hashFile(target(p.path)),p,'archive part '+p.path);}
    same(await hashStream(Readable.from(partsStream(f.storage.parts))),{sha256:f.storage.compressed_sha256,bytes:f.storage.compressed_bytes},'compressed stream '+f.source_path);
   }
   decoded.set(key,await decodedHash(f.storage));
  }
  same(decoded.get(key),f,'decoded '+f.source_path);
  if(originals)same(await hashFile(f.source_path),f,'original '+f.source_path);
 }
 if(m.source_file_count!==42||m.files.length!==42||m.source_bytes!==1716427135)throw Error('Manifest census NOT_SAME');
 console.log(JSON.stringify({verification:originals?'stored_and_originals':'stored',verdict:'SAME',source_files:m.files.length,source_bytes:m.source_bytes,manifest_sha256:digest(fs.readFileSync(target('DEPENDENCY_MANIFEST.json'))),SHA256SUMS_sha256:digest(fs.readFileSync(target('SHA256SUMS')))}));
}
async function restore(){
 await verify();const m=JSON.parse(fs.readFileSync(target('DEPENDENCY_MANIFEST.json'),'utf8'));let restored=0;
 for(const f of m.files){const p=target('restored/'+f.group+'/run_001/'+f.source_relative);if(fs.existsSync(p)){same(await hashFile(p),f,'existing restored copy');continue;}
  fs.mkdirSync(path.dirname(p),{recursive:true});
  if(f.storage.encoding==='raw')fs.copyFileSync(target(f.storage.path),p,fs.constants.COPYFILE_EXCL);
  else await pipeline(Readable.from(partsStream(f.storage.parts)),zlib.createGunzip(),fs.createWriteStream(p,{flags:'wx'}));
  same(await hashFile(p),f,'restored copy');restored++;
 }console.log(JSON.stringify({restored,verdict:'SAME',scope:'dependencies/restored only; original backup paths untouched'}));
}
const command=process.argv[2];
if(command==='prepare')await prepare();else if(command==='verify')await verify();else if(command==='verify-originals')await verify(true);else if(command==='restore')await restore();else throw Error('prepare | verify | verify-originals | restore');
