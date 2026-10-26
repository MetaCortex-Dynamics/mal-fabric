// Custody transport only. No verdict, parser, or promotion is implemented in JavaScript.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));
const old=path.resolve(root,'../erratum_first_shape_w9_021');
const hash=b=>createHash('sha256').update(b).digest('hex').toUpperCase();
const ref='269421f8f3d9a7de59751d59ba7d2a7f5042e5c7';
const files=[
 ['dependencies/sha256.mal','v3/software_fpga/threejs_projection_001_committed_4d_world_sections/sha256.mal','CC4E659254B9A093DF0A0EF025DB92D827528FF76844047DF7D4BEDEA44BE94D'],
 ['inputs/SPEC002_v030.mal','v3/spec_system/002_successor/v0.3.0/SPEC_MAL_SPECIFICATION_SYSTEM_002_v0.3.0_PROPOSED.mal','454EF7D150A2D1C69D0BAA8C520884E105CC1A9E30D7CC24A76535259FD31D56'],
 ['inputs/BASELINE_CHECK_FORM_010.txt','v3/spec_system/tig/corpus_first/OUTPUT_CHECK_FORM_010_002_v0.3.0.txt','DFCC8D0BA359208F2ACA3DB6205EFB25B489E439857C4114F943649940FD4BC1']
];
const rows=[];
function preserve(dest,b,expected,origin){
 if(hash(b)!==expected)throw new Error(`NOT_SAME ${origin}`);
 const to=path.join(root,dest);
 if(fs.existsSync(to)){if(!fs.readFileSync(to).equals(b))throw new Error(`NOT_SAME existing ${dest}`);}
 else fs.writeFileSync(to,b,{flag:'wx'});
 rows.push({path:dest,sha256:expected,size:b.length,origin});
}
for(const [dest,source,h] of files){
 const r=spawnSync('git',['-C','C:/Dev/MaL-Cog','show',`${ref}:${source}`],{maxBuffer:4*1024*1024,windowsHide:true});
 if(r.status!==0)throw new Error(r.stderr.toString());
 preserve(dest,r.stdout,h,{repository:'C:/Dev/MaL-Cog',commit:ref,path:source});
}
const receipt='C:/Users/devon/Desktop/MaL/Markdowns/RECEIPT_PROMOTE_ERRATUM_E_FIRST_SHAPE_NO_PIECES_001_v0.1.3.md';
preserve('inputs/RECEIPT_PROMOTE_ERRATUM_E_FIRST_SHAPE_NO_PIECES_001_v0.1.3.md',fs.readFileSync(receipt),'19AD057BD1C3F3EF27480F8D292A54EC6E5FAE518BBFF0AAB17BE0E4C8D17B65',receipt);
preserve('inputs/ERRATUM_E_FIRST_SHAPE_NO_PIECES_001.mal',fs.readFileSync(path.join(old,'inputs/ERRATUM_E_FIRST_SHAPE_NO_PIECES_001.mal')),'E93318BCB508733174FB5D4D7622BF8F1ABFD80A8D6F6CC79FF4DA0C6E337BCC','../erratum_first_shape_w9_021/inputs/ERRATUM_E_FIRST_SHAPE_NO_PIECES_001.mal');
for(const [name,p] of Object.entries({
 'HANDOFF.md':'C:/Users/devon/Desktop/MaL/Markdowns/HANDOFF_FLAG_WORLD_FIRST_TICK_2026-10-21.md',
 'mal-compliance.SKILL.md':'C:/Users/devon/.agents/skills/synced/3bfc4f6d-7353-40b2-a2b3-75de649ef19e_71f39d80-8f16-485f-a606-0aa085360c46/mal-compliance/SKILL.md'
})){
 const dest=path.join(root,'entrypoint_preimages',name);
 if(!fs.existsSync(dest))fs.copyFileSync(p,dest,fs.constants.COPYFILE_EXCL);
}
const record=path.join(root,'INPUT_CUSTODY.json');
if(!fs.existsSync(record))fs.writeFileSync(record,JSON.stringify({kind:'ERRATUM_PROMOTION_INPUT_CUSTODY_024',files:rows},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({files:rows.length,custody_sha256:hash(fs.readFileSync(record))}));
