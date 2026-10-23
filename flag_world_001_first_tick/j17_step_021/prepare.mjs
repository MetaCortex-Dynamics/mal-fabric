// Byte custody and source concatenation only. All world predicates are .mal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url));
const files=path.resolve(here,'../evidence/first-tick-conform-v1-v2-001/files');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const bound=[
 ['review014/s_f_binding_019/placement_run.mal','7EB20F9513236E010E2C20779057F5D2835AC777F9F22BABEC37AD2D78262ED0'],
 ['review014/gpu_self_witness_018/current.field.json','1B69800444F0A83B09976F8EDF7411865D4721B12423B343BE69C31B4856AA0A'],
 ['review014/gpu_self_witness_018/current.witness.json','4861769871804EF03EF02F4EDFE368BBC79F43871F35D85209043BEE0BFE87E9'],
 ['review014/gpu_self_witness_018/hashes0/responses.json','427405C27C18E3635C05C4F7EC9FD14436CE42B409A15F798F16EB98C9B69DD0'],
 ['review014/gpu_self_witness_018/hashes1/responses.json','D28FBCA97878DB77193712408B6A37CA2BD751A7DDB61DA79365EDD695D86FC6']
];
const inputs=bound.map(([rel,want])=>{const p=path.join(files,rel),b=fs.readFileSync(p),h=sha(b);if(h!==want)throw Error('NOT_SAME '+rel);return {path:p,sha256:h,bytes:b.length};});
const members=[inputs[0].path,path.join(here,'source/marker_incidence.mal')];
const source=Buffer.concat(members.flatMap(p=>[fs.readFileSync(p),Buffer.from('\n')]));
const out=path.join(here,'preflight');fs.mkdirSync(out,{recursive:true});
const sourcePath=path.join(out,'source.mal');fs.writeFileSync(sourcePath,source,{flag:'wx'});
const binding={source_sha256:sha(source),members:members.map(p=>({path:p,sha256:sha(fs.readFileSync(p))})),inputs,scope:'Source endpoint/incidence/own-role preflight. Not a second-step commit or CONFORM.'};
fs.writeFileSync(path.join(out,'ASSEMBLY.json'),JSON.stringify(binding,null,2)+'\n',{flag:'wx'});
const aliases={frame:'review014/jtp_locus_017/inputs/frame.json',capture:'review014/jtp_locus_017/inputs/capture.json',field:bound[1][0],witness:bound[2][0],hashes:bound[3][0],links:bound[4][0]};
execFileSync(process.execPath,[path.join(here,'tools/lower.mjs'),sourcePath,out,'-',...Object.entries(aliases).map(([k,p])=>k+'='+path.join(files,p))],{stdio:'inherit'});
console.log(JSON.stringify({out,source_sha256:sha(source),binding_sha256:sha(fs.readFileSync(path.join(out,'ASSEMBLY.json')))}));
