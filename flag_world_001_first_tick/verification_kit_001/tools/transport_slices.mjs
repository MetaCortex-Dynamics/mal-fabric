// Generic byte slicing and integrity primitives. The descriptor owns offsets.
// No protocol admission, carrier lookup, field construction or worldline choice.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const [input,expected,descriptor,output]=process.argv.slice(2);
if(!input||!output||!/^[0-9A-F]{64}$/.test(expected))throw Error('input SHA256 descriptor output required');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const bytes=fs.readFileSync(input),layoutBytes=fs.readFileSync(descriptor),layout=JSON.parse(layoutBytes);
if(hash(bytes)!==expected)throw Error('NOT_SAME input binding');
function slice(pair){
 if(!Array.isArray(pair)||pair.length!==2)throw Error('slice pair');
 const [at,n]=pair;
 if(!Number.isSafeInteger(at)||!Number.isSafeInteger(n)||at<0||n<0||at+n>bytes.length)throw Error('slice bounds');
 return bytes.subarray(at,at+n);
}
const fields=Object.create(null);
for(const [name,segments] of Object.entries(layout.fields))fields[name]=Buffer.concat(segments.map(slice)).toString('hex').toUpperCase();
const checks=Object.create(null);
for(const [name,segments] of Object.entries(layout.crc32_ieee??{})){
 let crc=0xFFFFFFFF;
 for(const b of Buffer.concat(segments.map(slice))){crc^=b;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xEDB88320:0);}
 checks[name]=((crc^0xFFFFFFFF)>>>0).toString(16).padStart(8,'0').toUpperCase();
}
const encoded=Buffer.from(JSON.stringify({sha256:expected,size:bytes.length,fields,checks}));
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output+'.source.bin',bytes,{flag:'wx'});
fs.writeFileSync(output,encoded,{flag:'wx'});
const custody={input:path.resolve(input),input_sha256:expected,descriptor:path.resolve(descriptor),descriptor_sha256:hash(layoutBytes),output_sha256:hash(encoded),producer_sha256:hash(fs.readFileSync(new URL(import.meta.url))),scope:'Byte slices and integrity primitives only; no admission or world state'};
fs.writeFileSync(output+'.custody.json',JSON.stringify(custody,null,2),{flag:'wx'});
console.log(JSON.stringify(custody));
