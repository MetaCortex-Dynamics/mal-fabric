// Lossless custody compaction of this runtime qualification's own readbacks only.
// Original evidence and input archives are outside this exact directory.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {pipeline} from 'node:stream/promises';
import {Writable} from 'node:stream';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const dir=path.join(here,'qualification_001/outputs'),record=path.join(here,'qualification_001/COMPACTION.jsonl');
fs.writeFileSync(record,'',{flag:'wx'});
async function digest(stream){const h=crypto.createHash('sha256');let bytes=0;await pipeline(stream,new Writable({write(chunk,enc,done){h.update(chunk);bytes+=chunk.length;done();}}));return {sha256:h.digest('hex').toUpperCase(),bytes};}
for(const entry of fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.isFile()&&e.name.endsWith('.bin'))){
 const raw=path.resolve(dir,entry.name);if(path.dirname(raw)!==path.resolve(dir))throw Error('OUTSIDE_QUALIFICATION_OUTPUTS');
 const original=await digest(fs.createReadStream(raw)),stored=raw+'.'+original.sha256+'.gz';
 await pipeline(fs.createReadStream(raw),zlib.createGzip({level:9}),fs.createWriteStream(stored,{flags:'wx'}));
 const restored=await digest(fs.createReadStream(stored).pipe(zlib.createGunzip()));
 if(restored.bytes!==original.bytes||restored.sha256!==original.sha256)throw Error('RESTORATION_NOT_SAME '+raw);
 const archive=await digest(fs.createReadStream(stored));
 fs.appendFileSync(record,JSON.stringify({raw,...original,stored,storage:archive,restoration:'SAME',scope:entry.name==='closed_grow.bin'?'FAILED_OUTPUT_CUSTODY_DIAGNOSTIC_ONLY':'QUALIFICATION_OUTPUT'})+'\n');
 fs.unlinkSync(raw);console.log(JSON.stringify({compacted:entry.name,...original,stored_bytes:archive.bytes,restoration:'SAME'}));
}
