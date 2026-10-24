// Generic substrate dispatcher, driven exclusively by GPU-produced requests.
// No application identity, record field, expected value or world rule is named.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const [dir,out,hashExecutable]=process.argv.slice(2);
const raw=fs.readFileSync(dir+'/readback.bin'),map=JSON.parse(fs.readFileSync(dir+'/source-map.json'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase(),w=i=>raw.readInt32LE(i*4),cap=w(2),nf=w(6);
if(w(0)!==0x31524c47||w(1)!==1||w(4)!==0)throw Error('candidate readback');
function t(i){const p=8+i*10;return {s:map.symbols[w(p)],c:Array.from({length:w(p+1)},(_,j)=>w(p+2+j))};}
fs.mkdirSync(out,{recursive:true});
const requests=[];
for(let i=0;i<nf;i++){const p=8+cap*10+i*12,n=t(w(p));if(n.s!=='THIS'||n.c.length!==3)continue;const tag=t(n.c[0]),id=t(n.c[1]);if(tag.s!=='HASH_JSON_REQUEST'||tag.c.length)continue;if(id.c.length||!/^[A-Z][A-Z_0-9]*$/.test(id.s))throw Error('primitive request identifier');requests.push({id:id.s,fact:i,term:n.c[2]});}
const response=Object.create(null),records=[];
for(const request of requests){if(Object.hasOwn(response,request.id))throw Error('duplicate primitive request identity');
 const json=path.join(out,request.id+'.json'),digest=path.join(out,request.id+'.digest');
 execFileSync(process.execPath,[new URL('./extract_json_value.mjs',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),dir,'THIS','HASH_JSON_REQUEST',request.id,json],{stdio:'inherit'});
 execFileSync(hashExecutable,[json,digest],{stdio:'inherit'});
 const b=fs.readFileSync(digest);if(b.length!==32)throw Error('digest custody');
 const observation=fs.readFileSync(json);
 // Bind the result to its actual subject, not merely to a request label.
 if(b.toString('hex').toUpperCase()!==hash(observation))throw Error('GPU digest correspondence');
 response[request.id]={digest:b.toString('hex'),value:JSON.parse(observation)};
 records.push({...request,observation_sha256:hash(observation),digest_bytes_sha256:hash(b),digest:response[request.id].digest,projection:JSON.parse(fs.readFileSync(json+'.custody.json'))});
}
const bytes=Buffer.from(JSON.stringify(response));
fs.writeFileSync(path.join(out,'responses.json'),bytes);
const record={scope:'GPU-requested generic JSON observation hashing only; no world admission, stage transition or commit',source_sha256:map.source_sha256,image_sha256:map.image_sha256,readback_sha256:hash(raw),dispatcher_sha256:hash(fs.readFileSync(new URL(import.meta.url))),hash_executable_sha256:hash(fs.readFileSync(hashExecutable)),responses_sha256:hash(bytes),requests:records};
fs.writeFileSync(path.join(out,'HASH_CUSTODY.json'),JSON.stringify(record,null,2));console.log(JSON.stringify({requests:records.length,responses_sha256:hash(bytes)}));
