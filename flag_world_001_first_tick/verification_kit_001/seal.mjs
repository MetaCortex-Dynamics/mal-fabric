// Byte custody only; neither promotion nor execution conformance.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('No symbolic links in frozen kit');return e.isDirectory()?walk(p):[p];});}
function current(){return walk(root).filter(p=>path.basename(p)!=='KIT_MANIFEST.json').map(p=>{const b=fs.readFileSync(p);return {path:path.relative(root,p).replaceAll('\\','/'),bytes:b.length,sha256:hash(b)};}).sort((a,b)=>a.path.localeCompare(b.path,'en'));}
const manifest=path.join(root,'KIT_MANIFEST.json'),mode=process.argv[2];
if(mode==='refresh'){const old=fs.readFileSync(manifest),saved=path.join(root,'verification','PREVIOUS_MANIFEST_'+hash(old)+'.json');fs.writeFileSync(saved,old,{flag:'wx'});fs.writeFileSync(manifest,JSON.stringify({schema:'PUBLIC_VERIFICATION_KIT_CUSTODY_V1',status:'LOCAL_REVIEW_NOT_PROMOTION',previous_manifest_sha256:hash(old),files:current()},null,2)+'\n');}
else if(mode==='create'){if(fs.existsSync(manifest))throw Error('Preserve existing seal');fs.writeFileSync(manifest,JSON.stringify({schema:'PUBLIC_VERIFICATION_KIT_CUSTODY_V1',status:'LOCAL_REVIEW_NOT_PROMOTION',files:current()},null,2)+'\n',{flag:'wx'});}
else if(mode!=='verify')throw Error('create | verify');
const stored=JSON.parse(fs.readFileSync(manifest)),actual=current();
if(JSON.stringify(stored.files)!==JSON.stringify(actual))throw Error('NOT_SAME kit membership or bytes');
console.log(JSON.stringify({verdict:'SAME',files:actual.length,manifest_sha256:hash(fs.readFileSync(manifest)),scope:'BYTE_CUSTODY_ONLY'}));
