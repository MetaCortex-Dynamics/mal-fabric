// Byte custody / native build transport only. No W9 classification occurs here.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const repo = 'C:/Dev/MaL-Cog';
const ref = '269421f8f3d9a7de59751d59ba7d2a7f5042e5c7';
const names = [
  'v3/g1_native/src/native_discharger.c',
  'v3/g1_native/src/program_eval.c',
  'v3/g1_native/include/malcog_native.h',
  'v3/g1_native/build/build_windows.ps1',
  'v3/software_fpga/threejs_projection_001_committed_4d_world_sections/bytes.mal',
  'v3/spec_system/002_successor/v0.3.1/SPEC_MAL_SPECIFICATION_SYSTEM_002_v0.3.1_PROPOSED.mal',
  'v3/spec_system/002_successor/v0.3.1/RECEIPT_PROMOTE_SPEC_MAL_SPECIFICATION_SYSTEM_002_v0.3.1.md',
  'v3/spec_system/002_vectors/v0.3.0/REALIZATION_CHECK_FORM_W1_W8_010.mal',
  'v3/spec_system/002_vectors/v0.3.0/RECEIPT_PROMOTE_CHECK_FORM_W1_W8_010.md',
];
const digest = bytes => createHash('sha256').update(bytes).digest('hex').toUpperCase();
const records = [];
for (const name of names) {
  const bytes = execFileSync('git', ['-C', repo, 'show', `${ref}:${name}`], {maxBuffer: 4*1024*1024});
  const dest = path.join(root, 'dependencies', name);
  fs.mkdirSync(path.dirname(dest), {recursive:true});
  if (fs.existsSync(dest)) {
    if (!fs.readFileSync(dest).equals(bytes)) throw new Error(`NOT_SAME existing dependency: ${name}`);
  } else fs.writeFileSync(dest, bytes, {flag:'wx'});
  records.push({source_repository:repo, source_commit:ref, source_path:name, path:`dependencies/${name}`, size:bytes.length, sha256:digest(bytes)});
}
const manifest = {kind:'BYTE_EXACT_NATIVE_RUNTIME_CUSTODY', scope:'Transport and unchanged native evaluator; W9 law application is additive .mal source.', files:records};
const output = path.join(root, 'DEPENDENCIES.json');
const bytes = Buffer.from(JSON.stringify(manifest,null,2)+'\n');
if (fs.existsSync(output) && !fs.readFileSync(output).equals(bytes)) throw new Error('NOT_SAME dependency manifest');
if (!fs.existsSync(output)) fs.writeFileSync(output,bytes,{flag:'wx'});
console.log(JSON.stringify({files:records.length, manifest_sha256:digest(bytes)}));
