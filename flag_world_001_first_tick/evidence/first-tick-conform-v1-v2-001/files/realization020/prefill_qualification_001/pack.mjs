// Generic capacity repack only. No symbol/rule/fact remapping or proof reseeding.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
export const capacities=Object.freeze({NP:65536,NS:2048,NR:1024,NT:32768,NF:16384,stack:8192});
export const identity=p=>{const b=fs.readFileSync(p);return {path:path.resolve(p),bytes:b.length,sha256:sha(b)};};
const write=(p,b)=>fs.writeFileSync(p,b,{flag:'wx'});
function requireZero(b,label){for(const v of b)if(v!==0)throw Error('NONZERO_UNUSED_PADDING '+label);}
export function packImage(sourceDir,targetDir){
 const original=fs.readFileSync(path.join(sourceDir,'image.bin'));
 const sourceMapRaw=fs.readFileSync(path.join(sourceDir,'source-map.json'));
 const map=JSON.parse(sourceMapRaw),source=fs.readFileSync(path.join(sourceDir,'source.mal'));
 const {NP,NS,NR}=capacities,oldNP=(original.length-16-NS*4-NR*40)/40;
 const counts={patterns:original.readInt32LE(4),seeds:original.readInt32LE(8),rules:original.readInt32LE(12)};
 if(!Number.isInteger(oldNP)||oldNP<NP||original.readInt32LE(0)!==0x33414c47||sha(original)!==map.image_sha256||sha(source)!==map.source_sha256)throw Error('IMAGE_CUSTODY_NOT_SAME');
 if(counts.patterns>NP||counts.patterns!==map.patterns.length||counts.seeds>NS||counts.seeds!==map.seeds.length||counts.rules>NR||counts.rules!==map.rules.length)throw Error('IMAGE_CAPACITY');
 requireZero(original.subarray(16+counts.patterns*40,16+oldNP*40),'patterns');
 requireZero(original.subarray(16+oldNP*40+counts.seeds*4,16+oldNP*40+NS*4),'seeds');
 requireZero(original.subarray(16+oldNP*40+NS*4+counts.rules*40),'rules');
 const next=Buffer.alloc(16+NP*40+NS*4+NR*40);
 original.copy(next,0,0,16+counts.patterns*40);
 original.copy(next,16+NP*40,16+oldNP*40,16+oldNP*40+NS*4+NR*40);
 if(!next.subarray(0,16+counts.patterns*40).equals(original.subarray(0,16+counts.patterns*40))||!next.subarray(16+NP*40).equals(original.subarray(16+oldNP*40)))throw Error('IMAGE_USED_BYTES_NOT_SAME');
 if(fs.existsSync(targetDir))throw Error('PRESERVE_OUTPUT '+targetDir);
 fs.mkdirSync(targetDir,{recursive:true});
 write(path.join(targetDir,'source.mal'),source);write(path.join(targetDir,'image.bin'),next);
 const updated={...map,image_sha256:sha(next),capacity_repack:{scope:'USED_IMAGE_BYTES_SAME; NO_SYMBOL_OR_RULE_REMAP',original_image_sha256:sha(original),original_source_map_sha256:sha(sourceMapRaw),from:{NP:oldNP,NS,NR},to:{NP,NS,NR},packer_sha256:sha(fs.readFileSync(new URL(import.meta.url)))}};
 write(path.join(targetDir,'source-map.json'),JSON.stringify(updated,null,2));
 return {from:identity(path.join(sourceDir,'image.bin')),to:identity(path.join(targetDir,'image.bin')),source_sha256:sha(source),...counts,used_bytes:'SAME'};
}
export function packState(sourceFile,targetFile){
 const raw=fs.readFileSync(sourceFile),{NT,NF}=capacities;
 if(raw.readInt32LE(0)!==0x31524c47||raw.readInt32LE(4)!==1)throw Error('STATE_FORMAT');
 const oldNT=raw.readInt32LE(8),oldNF=raw.readInt32LE(12),error=raw.readInt32LE(16),tc=raw.readInt32LE(20),fc=raw.readInt32LE(24),epochs=raw.readInt32LE(28);
 if(raw.length!==32+oldNT*40+oldNF*48||error||tc<1||tc>NT||fc<1||fc>NF||epochs<1)throw Error('STATE_CAPACITY_OR_FAILURE');
 const next=Buffer.alloc(32+NT*40+NF*48);raw.copy(next,0,0,32);next.writeInt32LE(NT,8);next.writeInt32LE(NF,12);
 raw.copy(next,32,32,32+tc*40);raw.copy(next,32+NT*40,32+oldNT*40,32+oldNT*40+fc*48);
 if(!next.subarray(16,32).equals(raw.subarray(16,32))||!next.subarray(32,32+tc*40).equals(raw.subarray(32,32+tc*40))||!next.subarray(32+NT*40,32+NT*40+fc*48).equals(raw.subarray(32+oldNT*40,32+oldNT*40+fc*48)))throw Error('STATE_USED_BYTES_NOT_SAME');
 write(targetFile,next);
 return {from:identity(sourceFile),to:identity(targetFile),from_capacity:{NT:oldNT,NF:oldNF},to_capacity:{NT,NF},terms:tc,facts:fc,epochs,header_counts:'SAME',used_term_fact_rule_rank_support_bytes:'SAME',symbol_rule_remap:'NONE',derived_facts_reseeded:0};
}
