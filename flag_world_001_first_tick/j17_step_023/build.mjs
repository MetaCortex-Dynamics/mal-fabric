// Generic additive byte assembly and lowering. Never computes world facts.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {sha} from '../evidence/first-tick-conform-v1-v2-001/files/realization020/readback.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const [previousArg,outArg,...args]=process.argv.slice(2);
if(!previousArg||!outArg)throw Error('previous directory and fresh output directory required');
const previous=path.resolve(previousArg),out=path.resolve(outArg),append=[],extra=[];
if(!out.startsWith(root+path.sep)||fs.existsSync(out))throw Error('fresh output beneath023 required');
for(let i=0;i<args.length;i++){
 if(args[i]==='--append')append.push(path.resolve(args[++i]));
 else if(args[i]==='--input'){const s=args[++i],at=s.indexOf('=');if(at<1)throw Error('alias=path');extra.push([s.slice(0,at),path.resolve(s.slice(at+1))]);}
 else throw Error('unknown argument');
}
const identify=p=>{const b=fs.readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length};};
const files=path.resolve(root,'../evidence/first-tick-conform-v1-v2-001/files');
let inputs;
if(fs.existsSync(path.join(previous,'BUILD.json')))inputs=JSON.parse(fs.readFileSync(path.join(previous,'BUILD.json'))).inputs;
else{
 const aliases={frame:'review014/jtp_locus_017/inputs/frame.json',capture:'review014/jtp_locus_017/inputs/capture.json',field:'review014/gpu_self_witness_018/current.field.json',witness:'review014/gpu_self_witness_018/current.witness.json',hashes:'review014/gpu_self_witness_018/hashes0/responses.json',links:'review014/gpu_self_witness_018/hashes1/responses.json'};
 inputs=Object.fromEntries(Object.entries(aliases).map(([k,p])=>[k,identify(path.join(files,p))]));
 if(identify(path.join(previous,'readback.bin')).sha256!=='47BE6D935D0B5EFF30D3304FCA3FA0A9A866607F4896A589060C3A8458107B1B')throw Error('022 readback custody NOT_SAME');
}
for(const [k,p] of extra){if(Object.hasOwn(inputs,k))throw Error('input replacement forbidden');inputs[k]=identify(p);}
for(const v of Object.values(inputs)){const b=identify(v.path);if(b.sha256!==v.sha256)throw Error('input NOT_SAME '+v.path);}
const members=[path.join(previous,'source.mal'),...append].map(identify);
const bytes=Buffer.concat(members.flatMap(x=>[fs.readFileSync(x.path),Buffer.from('\n')]));
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'source.mal'),bytes,{flag:'wx'});
const lower=path.resolve(root,'../j17_step_021/tools/lower.mjs');
execFileSync(process.execPath,[lower,path.join(out,'source.mal'),out,'-',...Object.entries(inputs).map(([k,v])=>k+'='+v.path)],{stdio:'inherit',windowsHide:true});
const record={scope:'ADD_ONLY_SOURCE_BYTE_ASSEMBLY; GPU_NOT_RUN',previous,inputs,members,source:identify(path.join(out,'source.mal')),image:identify(path.join(out,'image.bin')),source_map:identify(path.join(out,'source-map.json')),lowerer:identify(lower)};
fs.writeFileSync(path.join(out,'BUILD.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({out,source_sha256:record.source.sha256,image_sha256:record.image.sha256}));
