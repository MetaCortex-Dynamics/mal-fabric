// CPU-only exact-source repack for an independent carrier qualification.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {sha} from './readback.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const prior='C:/Users/devon/Documents/Codex/2026-10-04/new-chat/review_flag_world_002/hardware_carrier_012/gpu';
const out=path.join(root,'ref012_indexed_qualification'),gpu=path.join(out,'gpu');
if(fs.existsSync(out))throw Error('PRESERVE_EXISTING_STAGE');
const raw=fs.readFileSync(path.join(prior,'source.mal')),mapRaw=fs.readFileSync(path.join(prior,'source-map.json')),map=JSON.parse(mapRaw);
const expected='A5729729A8636C16DA1AC84476C6B32E5CD443BE506BE7068CCB53FB57792A8F';
if(sha(raw)!==expected||map.source_sha256!==expected||sha(fs.readFileSync(map.source))!==expected)throw Error('ORIGINAL012_SOURCE_NOT_SAME');
const identity=p=>{const bytes=fs.readFileSync(p);return {path:path.resolve(p),bytes:bytes.length,sha256:sha(bytes)};};
const inputs=map.inputs||[];for(const r of inputs){const now=identity(r.path);if(now.sha256!==r.sha256||now.bytes!==r.size)throw Error('RETAINED_INPUT_NOT_SAME');}
fs.mkdirSync(out);const source=path.join(out,'source.mal');fs.writeFileSync(source,raw,{flag:'wx'});
const lowerer=path.join(root,'lower_compact_large.mjs');
const ordinary=inputs.find(r=>r.alias==='');
process.stdout.write(execFileSync(process.execPath,[lowerer,source,gpu,ordinary?.path||'-',...inputs.filter(r=>r.alias!=='').map(r=>r.alias+'='+r.path)],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024,windowsHide:true}));
const next=JSON.parse(fs.readFileSync(path.join(gpu,'source-map.json')));
if(next.source_sha256!==expected||next.inputs.length!==inputs.length)throw Error('REPACK_CUSTODY_NOT_SAME');
const record={scope:'EXACT_ORIGINAL012_SOURCE_REPACK_ONLY; NO_ADDED_LAW; GPU_NOT_RUN; PYTHON_NOT_RUN',original:{source:identity(path.join(prior,'source.mal')),source_map:identity(path.join(prior,'source-map.json')),image:identity(path.join(prior,'image.bin'))},source:identity(source),source_map:identity(path.join(gpu,'source-map.json')),image:identity(path.join(gpu,'image.bin')),inputs,lowerer:identity(lowerer),orchestrator:identity(fileURLToPath(import.meta.url)),source_bytes:'SAME',added_laws:0,bounds:{patterns:next.patterns.length,seeds:next.seeds.length,rules:next.rules.length},execution:'NOT_RUN'};
fs.writeFileSync(path.join(out,'BUILD.json'),JSON.stringify(record,null,2),{flag:'wx'});
console.log(JSON.stringify({gpu,source_sha256:expected,image_sha256:record.image.sha256,...record.bounds,execution:'NOT_RUN'}));
