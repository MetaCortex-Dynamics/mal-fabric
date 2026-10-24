// Evidence identity verification, not a new CONFORM or GPU execution.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),sha=b=>crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const p=path.join(root,'verification/v2_binding/BINDING.json'),bytes=fs.readFileSync(p);
if(sha(bytes)!=='EFD2C5F0D2C06DCC14733C815E726FA01F5E854EEBE9C5C0C4219766FB61BDB4')throw Error('NOT_SAME binding');
const r=JSON.parse(bytes);let checks=0;
function check(f){const p=path.resolve(root,f.path);if(!p.startsWith(root+path.sep))throw Error('Outside kit');const b=fs.readFileSync(p);if(sha(b)!==f.sha256||(f.bytes!==undefined&&b.length!==f.bytes))throw Error('NOT_SAME '+f.path);checks++;return b;}
for(const f of r.files)check(f);
for(const f of [r.input,r.expected,r.actual,r.executor_source,r.executor_include,r.portable_runner])check(f);
for(const s of r.stages)check(s.source);
if(!check(r.actual).equals(check(r.expected)))throw Error('NOT_SAME full canonical output');
const run=JSON.parse(check(r.combined));if(run.verdict!=='IF_THEN'||run.vectors.find(v=>v.id==='V2').actual.sha256!==r.actual.sha256)throw Error('NOT_SAME promoted record');
console.log(JSON.stringify({binding:'SAME',checks,stages:r.stages.length,promoted_CONFORM:run.verdict,GPU:'NOT_RUN; EXISTING_EVIDENCE_REUSED',private_dependencies:r.dependencies.private_dependencies,release_blockers:r.release_blockers}));
