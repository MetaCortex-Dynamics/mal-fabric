// Final custody metadata and sums, only after lossless packaging has completed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const c=path.dirname(fileURLToPath(import.meta.url));
const d=path.join(path.dirname(c),'review_flag_world_002/review/first-tick-conform-v1-v2-001');
if(!fs.existsSync(path.join(d,'CUSTODY_MANIFEST.json')))throw Error('PACKAGE_NOT_COMPLETE');
for(const n of ['README.md','verify.mjs','package.mjs','finalize.mjs'])fs.copyFileSync(path.join(c,n),path.join(d,n),fs.constants.COPYFILE_EXCL);
async function sha(p){const h=crypto.createHash('sha256');for await(const b of fs.createReadStream(p))h.update(b);return h.digest('hex').toUpperCase();}
function walk(p,r=''){let a=[];for(const e of fs.readdirSync(p,{withFileTypes:true})){const t=r?r+'/'+e.name:e.name;if(e.isDirectory())a.push(...walk(path.join(p,e.name),t));else a.push(t);}return a;}
const list=walk(d).sort(),rows=[];for(const p of list)rows.push((await sha(path.join(d,p)))+'  '+p);
fs.writeFileSync(path.join(d,'SHA256SUMS'),rows.join('\n')+'\n',{flag:'wx'});
console.log(JSON.stringify({files:list.length+1,sha256sums_sha256:await sha(path.join(d,'SHA256SUMS')),manifest_sha256:await sha(path.join(d,'CUSTODY_MANIFEST.json'))}));
