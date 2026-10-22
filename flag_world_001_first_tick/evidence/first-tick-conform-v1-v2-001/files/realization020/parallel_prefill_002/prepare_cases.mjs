// CPU-only capacity packing of retained generic matcher regression inputs.
// No application source changes, GPU launch, expected world output, or promotion.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {identity,packImage} from '../prefill_qualification_001/pack.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
const input=path.join(root,'block_replay_qualification_inputs_001');
const manifest=JSON.parse(fs.readFileSync(path.join(input,'MANIFEST.json')));
for(const bound of manifest.files){const actual=identity(bound.path);if(actual.sha256!==bound.sha256||actual.bytes!==bound.bytes)throw Error('REGRESSION_INPUT_NOT_SAME '+bound.path);}
const out=path.join(here,'cases');if(fs.existsSync(out))throw Error('PRESERVE_CASES');fs.mkdirSync(out);
const cases=manifest.cases.map(c=>({...c,packed:packImage(path.join(input,c.name),path.join(out,c.name))}));
const report={scope:'CPU_ONLY; USED_IMAGE_BYTES_SAME; NO_WORLD_SOURCE_CHANGE',source_manifest:identity(path.join(input,'MANIFEST.json')),packer:identity(path.join(root,'prefill_qualification_001/pack.mjs')),prepare:identity(fileURLToPath(import.meta.url)),cases};
fs.writeFileSync(path.join(out,'PREPARATION.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report,null,2));
