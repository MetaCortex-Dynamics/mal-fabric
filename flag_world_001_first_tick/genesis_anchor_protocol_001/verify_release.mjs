// Byte custody only; not API execution or world conformance.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=fs.realpathSync(process.argv[2]??'.');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const m=JSON.parse(fs.readFileSync(path.join(root,'RELEASE_MANIFEST.json')));
if(m.schema!=='GAP_ARCHIVED_RELEASE_MANIFEST_V1'||m.scope!=='ARCHIVED_JTP_CAPTURE_ONLY')throw Error('Manifest scope');
const names=new Set();
for(const row of m.files){
 const p=row.path;
 if(typeof p!=='string'||p.includes('\\')||p.includes(':')||p.split('/').some(x=>!x||x==='.'||x==='..')||names.has(p))throw Error('Manifest path');
 names.add(p);let f=root;
 for(const part of p.split('/')){f=path.join(f,part);if(fs.lstatSync(f).isSymbolicLink())throw Error('Link not admitted');}
 const b=fs.readFileSync(f);if(b.length!==row.bytes||hash(b)!==row.sha256)throw Error('NOT_SAME '+p);
}
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('Link not admitted');if(e.isDirectory())walk(f);else{const p=path.relative(root,f).split(path.sep).join('/');if(p!=='RELEASE_MANIFEST.json'&&!names.has(p))throw Error('Unlisted file '+p);}}}
walk(root);
console.log(JSON.stringify({scope:m.scope,files:names.size,comparison:'SAME',manifest_sha256:hash(fs.readFileSync(path.join(root,'RELEASE_MANIFEST.json'))),api_execution:'NOT_RUN',gpu_execution:'NOT_RUN'}));
