// Generic custody projection: retain only newly returned subject/digest pairs.
// Prior response inputs remain in the additive source and checkpoint.
import fs from 'node:fs';
import path from 'node:path';
import {sha} from './readback.mjs';
const [current,previous,out]=process.argv.slice(2);
const a=JSON.parse(fs.readFileSync(current)),b=JSON.parse(fs.readFileSync(previous));
const seen=new Map(b.map(row=>[JSON.stringify(row[0]),JSON.stringify(row)]));
const delta=[];
for(const row of a){const key=JSON.stringify(row[0]),old=seen.get(key);if(old&&old!==JSON.stringify(row))throw Error('changed subject response');if(!old)delta.push(row);}
const bytes=Buffer.from(JSON.stringify(delta));fs.writeFileSync(out,bytes);
fs.writeFileSync(path.join(path.dirname(out),'DELTA_CUSTODY.json'),JSON.stringify({scope:'Generic additive response transport only',current,previous,current_sha256:sha(fs.readFileSync(current)),previous_sha256:sha(fs.readFileSync(previous)),delta_sha256:sha(bytes),retained_prior:b.length,new_rows:delta.length},null,2));
console.log(JSON.stringify({new_rows:delta.length,sha256:sha(bytes)}));
