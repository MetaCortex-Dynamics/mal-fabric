// Five external T-run inputs, carried byte-exactly. No original or world writes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {Writable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(here,'../..');
const input=path.join(project,'j17_t_r2_r1_diagnostics_019/T/run_001/INPUTS.json');
const inputHash='9A3A1C690DFE0CFA96047D380D4E260E6DE1CA626CDAB31B1C430F4419C52DB8';
const members=['source/incidence.mal','source/junction_identity.mal','gpu/readback.bin','parents/qg003-carrier.mcbf','parents/motif_junction_table_v1.h'];
const threshold=16*1024*1024,partLimit=40*1024*1024;
const slash=p=>p.replaceAll('\\','/').replace(/\/+/g,'/');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
function dst(p){const q=path.resolve(here,p);if(!q.startsWith(here+path.sep))throw Error('Outside dependencies '+p);return q;}
function same(a,b,label){if(a.sha256!==b.sha256||(b.bytes!==undefined&&a.bytes!==b.bytes))throw Error('NOT_SAME '+label);}
async function hashStream(s){const h=crypto.createHash('sha256');let bytes=0;await pipeline(s,new Writable({write(b,e,cb){h.update(b);bytes+=b.length;cb();}}));return{sha256:h.digest('hex').toUpperCase(),bytes};}
const hashFile=p=>hashStream(fs.createReadStream(p));
async function decode(s){if(s.encoding==='raw')return hashFile(dst(s.path));const h=crypto.createHash('sha256');let bytes=0;await pipeline(fs.createReadStream(dst(s.path)),zlib.createGunzip(),new Writable({write(b,e,cb){h.update(b);bytes+=b.length;cb();}}));return{sha256:h.digest('hex').toUpperCase(),bytes};}
const write=(p,b)=>fs.writeFileSync(dst(p),b,{flag:'wx'});
const sums=rows=>rows.map(x=>x.sha256+'  '+x.path).sort().join('\n')+'\n';
async function prepare(){
 if(fs.existsSync(dst('T_CONTACTS_MANIFEST.json')))throw Error('Preserve manifest');
 const bytes=fs.readFileSync(input);if(digest(bytes)!==inputHash)throw Error('T input binding NOT_SAME');
 const bound=JSON.parse(bytes),files=[];
 for(const name of members){
  const rows=bound.watched.filter(r=>slash(r.path).endsWith('/hardware_carrier_012/'+name));if(rows.length!==1)throw Error('T input row NOT_SAME '+name);
  const r=rows[0],original=await hashFile(r.path);same(original,r,'T bound input '+name);let storage;
  if(original.bytes>=threshold){
   const p='t_contacts/blobs/'+original.sha256+'.gz';fs.mkdirSync(path.dirname(dst(p)),{recursive:true});
   await pipeline(fs.createReadStream(r.path),zlib.createGzip({level:6}),fs.createWriteStream(dst(p),{flags:'wx'}));
   const compressed=await hashFile(dst(p));if(compressed.bytes>partLimit)throw Error('T compressed part exceeds40MiB');
   storage={encoding:'gzip',path:p,bytes:compressed.bytes,sha256:compressed.sha256};
  }else{
   const p='t_contacts/raw/'+name;fs.mkdirSync(path.dirname(dst(p)),{recursive:true});fs.copyFileSync(r.path,dst(p),fs.constants.COPYFILE_EXCL);
   storage={encoding:'raw',path:p,...await hashFile(dst(p))};
  }
  same(await decode(storage),original,'T decoded '+name);
  files.push({source_path:slash(r.path),source_relative:name,...original,storage});
 }
 const m={schema:'J17_LINK3_T_CARRIER_CONTACTS_001',scope:'Five runtime T inputs absent from prior storage; byte custody only',bound_by:{path:'flag_world_001_first_tick/j17_t_r2_r1_diagnostics_019/T/run_001/INPUTS.json',sha256:inputHash},source_file_count:5,source_bytes:files.reduce((n,f)=>n+f.bytes,0),files};
 if(m.source_bytes!==16811982)throw Error('T census NOT_SAME');
 write('T_CONTACTS_MANIFEST.json',JSON.stringify(m,null,2)+'\n');
 const paths=['t_contacts.mjs','T_CONTACTS_README.md','T_CONTACTS_MANIFEST.json',...files.map(f=>f.storage.path)],rows=[];
 for(const p of paths)rows.push({path:p,...await hashFile(dst(p))});
 write('T_CONTACTS_SHA256SUMS',sums(rows));
 console.log(JSON.stringify({prepared:'SAME',source_files:5,source_bytes:m.source_bytes,stored_bytes:rows.reduce((n,r)=>n+r.bytes,0),manifest_sha256:digest(fs.readFileSync(dst('T_CONTACTS_MANIFEST.json')))}));
}
async function verify(originals=false){
 const m=JSON.parse(fs.readFileSync(dst('T_CONTACTS_MANIFEST.json'),'utf8'));
 const rows=fs.readFileSync(dst('T_CONTACTS_SHA256SUMS'),'utf8').trim().split('\n').map(l=>{const a=/^([A-F0-9]{64})  (.+)$/.exec(l);if(!a)throw Error('sum format');return{path:a[2],sha256:a[1]};});
 for(const r of rows)same(await hashFile(dst(r.path)),r,'T storage '+r.path);
 if(m.files.length!==5||m.source_bytes!==16811982)throw Error('T census NOT_SAME');
 for(const f of m.files){same(await hashFile(dst(f.storage.path)),f.storage,'T stored bytes');if(f.storage.bytes>partLimit)throw Error('T storage exceeds40MiB');same(await decode(f.storage),f,'T decoded original');if(originals)same(await hashFile(f.source_path),f,'T source unchanged');}
 console.log(JSON.stringify({verification:originals?'stored_and_originals':'stored',verdict:'SAME',source_files:5,manifest_sha256:digest(fs.readFileSync(dst('T_CONTACTS_MANIFEST.json'))),SHA256SUMS_sha256:digest(fs.readFileSync(dst('T_CONTACTS_SHA256SUMS')))}));
}
async function restore(){
 await verify();const m=JSON.parse(fs.readFileSync(dst('T_CONTACTS_MANIFEST.json'),'utf8'));let count=0;
 for(const f of m.files){const p=dst('t_contacts/restored/'+f.source_relative);if(fs.existsSync(p)){same(await hashFile(p),f,'T existing restored');continue;}fs.mkdirSync(path.dirname(p),{recursive:true});
  if(f.storage.encoding==='raw')fs.copyFileSync(dst(f.storage.path),p,fs.constants.COPYFILE_EXCL);
  else await pipeline(fs.createReadStream(dst(f.storage.path)),zlib.createGunzip(),fs.createWriteStream(p,{flags:'wx'}));
  same(await hashFile(p),f,'T restored');count++;
 }console.log(JSON.stringify({restored:count,scope:'dependencies/t_contacts/restored only'}));
}
const mode=process.argv[2];if(mode==='prepare')await prepare();else if(mode==='verify')await verify();else if(mode==='verify-originals')await verify(true);else if(mode==='restore')await restore();else throw Error('prepare | verify | verify-originals | restore');
