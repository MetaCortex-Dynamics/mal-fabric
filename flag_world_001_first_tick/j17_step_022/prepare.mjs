// Byte custody, concatenation and generic lowering; no world classification.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url));
const prior=path.resolve(here,'../j17_step_021/preflight');
const files=path.resolve(here,'../evidence/first-tick-conform-v1-v2-001/files');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const assembly=JSON.parse(fs.readFileSync(path.join(prior,'ASSEMBLY.json')));
const inputs=[...assembly.inputs,...assembly.members,
 {path:path.join(prior,'source.mal'),sha256:'2B408B8B0621457FBFB2640C575D1F3D6AC8967FA3A5F4457E3AC136D686F446'},
 {path:path.join(prior,'readback.bin'),sha256:'159567EEB9DB979FE75B3C69DA7749DDA3D7B4AD714F87A5FF1A73242F12A7D4'},
 {path:path.join(prior,'predecessor.genesis.json'),sha256:'FDA614876C99126FCE2AFE6AC8E42A77863880485E02D4B4EDA4AA817446BD2C'}];
for(const x of inputs)if(sha(fs.readFileSync(x.path))!==x.sha256)throw Error('NOT_SAME '+x.path);
const sourcePath=path.join(here,'source/classify_routes.mal');
const members=[path.join(prior,'source.mal'),sourcePath];
const source=Buffer.concat(members.flatMap(p=>[fs.readFileSync(p),Buffer.from('\n')]));
const out=path.join(here,'classification');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'source.mal'),source,{flag:'wx'});
fs.writeFileSync(path.join(out,'ASSEMBLY.json'),JSON.stringify({authority:'TASK_CODEX_J17_SECOND_STEP_022',inputs,members:members.map(p=>({path:p,sha256:sha(fs.readFileSync(p))})),source_sha256:sha(source),scope:'A-D classification, induced routes and static checks; no host world law'},null,2)+'\n',{flag:'wx'});
const aliases={frame:'review014/jtp_locus_017/inputs/frame.json',capture:'review014/jtp_locus_017/inputs/capture.json',field:'review014/gpu_self_witness_018/current.field.json',witness:'review014/gpu_self_witness_018/current.witness.json',hashes:'review014/gpu_self_witness_018/hashes0/responses.json',links:'review014/gpu_self_witness_018/hashes1/responses.json'};
execFileSync(process.execPath,[path.resolve(here,'../j17_step_021/tools/lower.mjs'),path.join(out,'source.mal'),out,'-',...Object.entries(aliases).map(([k,p])=>k+'='+path.join(files,p))],{stdio:'inherit'});
console.log(JSON.stringify({out,source_sha256:sha(source)}));
