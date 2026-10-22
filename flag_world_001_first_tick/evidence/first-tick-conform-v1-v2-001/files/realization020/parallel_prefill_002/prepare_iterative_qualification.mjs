// Retain the bounded serial/parallel qualification, specializing only runtime and output paths.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const records=[];
for(const [name,expected,out] of [['qualify.mjs','99950350B93511520551D033D45346F72A7F8F1013E8234D20CC324CD2FBF250','qualify_iterative.mjs'],['audit_telemetry.mjs','EE9A8825974484BB2BBEE6A75D6248C4E46B3DFC82D2F9143DF3C86961A4195E','audit_iterative_telemetry.mjs']]){
 const b=fs.readFileSync(path.join(here,name));if(sha(b)!==expected)throw Error('PARENT_NOT_SAME');
 let s=b.toString('utf8');const changes=[];
 const replace=(from,to)=>{if(!s.includes(from))throw Error('ANCHOR_NOT_FOUND '+from);changes.push({from,to,count:s.split(from).length-1});s=s.replaceAll(from,to);};
 replace("'qualification_'+mode","'qualification_iterative_'+mode");
 if(name==='qualify.mjs'){
  replace("'qualification_small", "'qualification_iterative_small");
  replace("'block_telemetry_'+mode", "'iterative_collect_007/block_iterative_'+mode");
 }
 fs.writeFileSync(path.join(here,out),s,{flag:'wx'});
 records.push({parent:name,parent_sha256:expected,output:out,sha256:sha(Buffer.from(s)),changes});
}
fs.writeFileSync(path.join(here,'ITERATIVE_QUALIFICATION_TRANSFORM.json'),JSON.stringify({scope:'PATH_ONLY_SPECIALIZATION; QUALIFICATION_CHECKS_UNCHANGED',records},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(records,null,2));
