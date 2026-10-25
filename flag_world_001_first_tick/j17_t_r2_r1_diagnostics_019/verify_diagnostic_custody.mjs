// Read-only custody audit. No native verdict or world state is constructed here.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const base = path.dirname(fileURLToPath(import.meta.url));
const records = [
  ['T', 'T/run_001/RUN_RECORD_T.json'],
  ['R2', 'R2/execution_001/finish_001/RUN_RECORD_R2_019.json'],
  ['R2_custody', 'R2/FINAL_BINDING.json'],
  ['R1', 'R1/run_003/RUN_RECORD_R1.json'],
  ['R1_custody', 'R1/run_003/FINAL_BINDING_R1.json'],
];
const checked = new Map(), visited = new Set(), mismatches = [];
// Data payloads and source maps are hash-checked, not parsed as new manifests.
const manifestName = /^(?:RUN_RECORD|FINAL_BINDING|QUALIFICATION|INPUTS|BINDINGS|PREPARED|PREFLIGHT|INVENTORY_RECORD|BATCH_|RECOVERY_CUSTODY|CUSTODY_).*\.json$/i;
const inside = p => {
  const relative = path.relative(base, p);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
};
async function identity(p) {
  p = path.resolve(p);
  if (!checked.has(p)) {
    const digest = crypto.createHash('sha256');
    let bytes = 0;
    for await (const chunk of fs.createReadStream(p)) {
      digest.update(chunk);
      bytes += chunk.length;
    }
    checked.set(p, {path:p, bytes, sha256:digest.digest('hex').toUpperCase()});
  }
  return checked.get(p);
}
async function compare(reference) {
  const actual = await identity(reference.path);
  if (actual.sha256 !== reference.sha256.toUpperCase() ||
      (reference.bytes !== undefined && reference.bytes !== actual.bytes)) {
    mismatches.push({expected:reference, actual});
  }
  if (inside(actual.path) && /\.OBSERVATIONS\.json$/i.test(actual.path) && !visited.has(actual.path)) {
    visited.add(actual.path);
    const observation = JSON.parse(fs.readFileSync(actual.path, 'utf8'));
    // Receipt rows are data; summary and proof-artifact identities are custody.
    await walk(observation.summary);
    await walk(observation.proofs_artifact);
  } else if (inside(actual.path) && manifestName.test(path.basename(actual.path)) && !visited.has(actual.path)) {
    visited.add(actual.path);
    await walk(JSON.parse(fs.readFileSync(actual.path, 'utf8')));
  }
}
async function walk(value) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) { for (const child of value) await walk(child); return; }
  if (typeof value.path === 'string' && typeof value.sha256 === 'string' && /^[0-9a-f]{64}$/i.test(value.sha256)) await compare(value);
  for (const child of Object.values(value)) await walk(child);
}
const outputs = [];
for (const [subject, relative] of records) {
  const bound = await identity(path.join(base, relative));
  await compare(bound);
  outputs.push({subject, ...bound});
}
await compare({
  path:path.resolve(base, '../j17_step_023/outputs/committed.world.json'),
  bytes:568805,
  sha256:'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059',
});
const result = {
  scope:'READ_ONLY_HASH_CUSTODY; NATIVE_DIAGNOSTIC_VERDICTS_REMAIN_IN_THEIR_OWN_RECORDS',
  verdict:mismatches.length ? 'NOT_SAME' : 'SAME',
  observer:await identity(fileURLToPath(import.meta.url)),
  records:outputs,
  checked_paths:checked.size,
  recursive_task_json:visited.size,
  mismatches,
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
if (mismatches.length) process.exitCode=1;
