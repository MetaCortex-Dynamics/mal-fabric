// Re-read working, index, or committed bytes against the sealed checksum list.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),repo=path.dirname(path.dirname(root));
const hash=b=>createHash('sha256').update(b).digest('hex').toUpperCase();
const sumsPath=path.join(root,'SHA256SUMS'),sumsBytes=fs.readFileSync(sumsPath);
const entries=sumsBytes.toString('utf8').trim().split(/\r?\n/).map(line=>{
 const m=line.match(/^([A-F0-9]{64})  (.+)$/);if(!m)throw new Error('Unread checksum');
 const p=path.resolve(repo,m[2]);if(!p.startsWith(repo+path.sep))throw new Error('Checksum path outside repo');
 return {sha256:m[1],path:m[2]};
});
entries.push({sha256:hash(sumsBytes),path:path.relative(repo,sumsPath).replaceAll('\\','/')});
if(new Set(entries.map(e=>e.path)).size!==entries.length)throw new Error('Duplicate checksum path');
for(const f of entries)if(hash(fs.readFileSync(path.join(repo,f.path)))!==f.sha256)throw new Error(`NOT_SAME worktree ${f.path}`);
const git=(args,input)=>{const r=spawnSync('git',['-C',repo,...args],{input,maxBuffer:32*1024*1024,windowsHide:true});if(r.status!==0)throw new Error(r.stderr.toString());return r.stdout;};
let subject='WORKTREE';
if(process.argv[2]==='--index'||process.argv[2]==='--commit'){
 const index=process.argv[2]==='--index',ref=index?'':process.argv[3];
 if(!index&&!/^[0-9a-f]{40}$/i.test(ref||''))throw new Error('Full commit identity required');
 const staged=index?git(['diff','--cached','--name-only','-z']).toString().split('\0').filter(Boolean):git(['diff-tree','--no-commit-id','--name-only','-z','-r',ref]).toString().split('\0').filter(Boolean);
 const expected=new Set(entries.map(e=>e.path));
 if(staged.length!==entries.length||staged.some(p=>!expected.has(p)))throw new Error(`NOT_SAME scoped file list ${staged.length}/${entries.length}`);
 const batch=git(['cat-file','--batch'],entries.map(f=>`${index?':':ref+':'}${f.path}`).join('\n')+'\n');
 let offset=0;
 for(const f of entries){
  const nl=batch.indexOf(10,offset);if(nl<0)throw new Error('Missing blob header');
  const header=batch.subarray(offset,nl).toString();const m=header.match(/^[0-9a-f]+ blob (\d+)$/);if(!m)throw new Error(`Unread blob ${header}`);
  const size=Number(m[1]),b=batch.subarray(nl+1,nl+1+size);
  if(b.length!==size||hash(b)!==f.sha256)throw new Error(`NOT_SAME blob ${f.path}`);offset=nl+1+size+1;
 }
 if(offset!==batch.length)throw new Error('Trailing blob transport');
 subject=index?'INDEX':ref;
}
console.log(JSON.stringify({subject,files:entries.length,comparison:'SAME',checksums_sha256:hash(sumsBytes)}));
