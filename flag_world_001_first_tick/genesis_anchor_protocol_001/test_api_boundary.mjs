import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createBoundary, PROFILE, OPERATIONS, Refusal } from './api_boundary.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2];
if (!out || !path.isAbsolute(out) || fs.existsSync(out)) throw Error('Fresh absolute evidence output required');
fs.mkdirSync(out, { recursive: true });
const artifacts = path.join(out, 'artifacts'), evidence = path.join(out, 'evidence'), outside = path.join(out, 'outside');
for (const p of [artifacts, evidence, outside]) fs.mkdirSync(p);
const bytes = Buffer.from('API boundary test fixture; not a genesis event\n');
fs.writeFileSync(path.join(artifacts, 'input.bin'), bytes);
fs.writeFileSync(path.join(outside, 'outside.bin'), bytes);
const hash = b => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const ref = { path: 'input.bin', bytes: bytes.length, sha256: hash(bytes) };
const context = { artifactDirectory: artifacts };
const request = (operation = 'captureArchived', input = ref, profile = PROFILE) => ({ profile, operation, input });
const rows = [];
let calls = 0;
const read = (input, { readBlob }) => { calls++; return { fixture_sha256: hash(readBlob(input)) }; };
const boundary = createBoundary({ evidenceDirectory: evidence, handlers: Object.fromEntries(OPERATIONS.map(op => [op, read])) });
function diagnostic(result) { return JSON.parse(result.obligations.find(x => x.startsWith('DIAGNOSTIC:')).slice(11)); }
function checkEvidence(r) {
  for (const e of r.evidence) {
    const b = fs.readFileSync(path.join(evidence, e.path));
    assert.equal(b.length, e.bytes); assert.equal(hash(b), e.sha256);
  }
}
async function test(id, fn) { await fn(); rows.push({ id, execution: 'NEWLY_EXECUTED', reading: 'IF_THEN', scope: 'API_BOUNDARY_ONLY' }); }
async function rejected(req, ctx, reading, code, api = boundary) {
  const r = await api.invoke(req, ctx);
  assert.equal(r.profile, PROFILE); assert.equal(r.reading, reading); assert.equal(r.result, null);
  assert.equal(r.obligations[0], `REASON:${code}`); assert.equal(diagnostic(r).code, code);
  checkEvidence(r); return r;
}
for (const operation of OPERATIONS) {
  await test(`context-and-success-${operation}`, async () => {
    const r = await boundary.invoke(request(operation), context);
    assert.equal(r.reading, 'IF_THEN'); assert.equal(r.result.fixture_sha256, hash(bytes));
    assert.deepEqual(Object.keys(r), ['profile', 'operation', 'reading', 'result', 'evidence', 'obligations']);
    assert.equal(r.evidence.length, 1); checkEvidence(r);
    const d = JSON.parse(fs.readFileSync(path.join(evidence, r.evidence[0].path)));
    assert.equal(d.resolved_artifact_directory, fs.realpathSync.native(artifacts));
  });
}
await test('unsupported-profile-no-dispatch', async () => {
  const before = calls;
  const r = await rejected(request('captureArchived', ref, 'HSM_LIVE'), context, 'NO', 'UNSUPPORTED_PROFILE');
  assert.equal(calls, before); assert.equal(diagnostic(r).requested_profile, 'HSM_LIVE');
});
await test('later-event-not-dispatched', async () => {
  const before = calls; await rejected(request('applyLaterEvent'), context, 'NO', 'UNSUPPORTED_OPERATION'); assert.equal(calls, before);
});
await test('missing-request-retains-diagnostic', () => rejected(null, context, 'NO', 'REQUEST_SCHEMA'));
await test('extra-request-field', () => rejected({ ...request(), secret: 'not copied to diagnostics' }, context, 'NO', 'REQUEST_SCHEMA'));
await test('missing-context', () => rejected(request(), undefined, 'NO', 'DIRECTORY_CONTEXT_SCHEMA'));
await test('relative-root', () => rejected(request(), { artifactDirectory: 'relative' }, 'NO', 'ARTIFACT_DIRECTORY_REQUIRED'));
await test('missing-root', () => rejected(request(), { artifactDirectory: path.join(out, 'missing') }, 'MAYBE', 'ARTIFACT_DIRECTORY_UNAVAILABLE'));
for (const name of ['../outside/outside.bin', '..\\outside\\outside.bin', path.join(outside, 'outside.bin'), 'input.bin:stream', 'sub/../input.bin']) {
  await test('path-refusal-' + name, () => rejected(request('captureArchived', { ...ref, path: name }), context, 'NO', 'PATH_OUTSIDE_ARTIFACT_DIRECTORY'));
}
await test('junction-escape', async () => {
  fs.symlinkSync(outside, path.join(artifacts, 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  await rejected(request('captureArchived', { ...ref, path: 'escape/outside.bin' }), context, 'NO', 'LINK_PATH_NOT_ADMITTED');
});
await test('missing-blob', () => rejected(request('captureArchived', { ...ref, path: 'absent.bin' }), context, 'MAYBE', 'MISSING_ARTIFACT'));
await test('altered-blob-binding', () => rejected(request('captureArchived', { ...ref, sha256: 'A'.repeat(64) }), context, 'NOT-SAME', 'BLOB_BINDING_MISMATCH'));
await test('blob-schema', () => rejected(request('captureArchived', { ...ref, extra: 1 }), context, 'NO', 'BLOB_REF_SCHEMA'));
await test('missing-adapter', () => rejected(request(), context, 'MAYBE', 'CONTACT_NOT_IMPLEMENTED', createBoundary({ evidenceDirectory: evidence })));
for (const operation of OPERATIONS) {
  await test(`handler-failure-retention-${operation}`, () => rejected(request(operation), context, 'MAYBE', 'CONTACT_FAILURE', createBoundary({ evidenceDirectory: evidence, handlers: { [operation]: () => { throw Error('fixture handler stopped before producing a result'); } } })));
}
await test('explicit-handler-refusal', () => rejected(request(), context, 'NO', 'NON_GROUND_PREDECESSOR', createBoundary({ evidenceDirectory: evidence, handlers: { captureArchived: () => { throw new Refusal('NO', 'NON_GROUND_PREDECESSOR'); } } })));
await test('missing-witness', () => rejected(request(), context, 'MAYBE', 'MISSING_CONTACT_WITNESS', createBoundary({ evidenceDirectory: evidence, handlers: { captureArchived: () => null } })));
await test('nonserializable-result', () => rejected(request(), context, 'MAYBE', 'CONTACT_FAILURE', createBoundary({ evidenceDirectory: evidence, handlers: { captureArchived: () => 1n } })));
await test('evidence-overlap-no-input-write', async () => {
  const before = fs.readdirSync(artifacts);
  const r = await createBoundary({ evidenceDirectory: artifacts, handlers: { captureArchived: read } }).invoke(request(), context);
  assert.equal(r.reading, 'NO'); assert.equal(r.result, null); assert.equal(diagnostic(r).code, 'EVIDENCE_DIRECTORY_OVERLAP');
  assert.equal(diagnostic(r).retention, 'INLINE'); assert.deepEqual(fs.readdirSync(artifacts), before);
});
await test('evidence-unavailable-retains-inline', async () => {
  const r = await createBoundary({ evidenceDirectory: path.join(out, 'absent-evidence') }).invoke(null, context);
  assert.equal(r.result, null); assert.equal(r.reading, 'NO'); assert.equal(r.evidence.length, 0);
  assert.equal(diagnostic(r).code, 'REQUEST_SCHEMA'); assert.equal(diagnostic(r).retention, 'INLINE');
  assert.ok(diagnostic(r).retention_error);
});
await test('evidence-write-failure-withholds-candidate', async () => {
  const doomed = path.join(out, 'doomed'); fs.mkdirSync(doomed);
  const r = await createBoundary({ evidenceDirectory: doomed, handlers: { captureArchived: () => { fs.rmdirSync(doomed); return { fixture: 'must not escape' }; } } }).invoke(request(), context);
  assert.equal(r.reading, 'MAYBE'); assert.equal(r.result, null); assert.equal(r.evidence.length, 0);
  assert.equal(diagnostic(r).code, 'EVIDENCE_RETENTION_FAILED'); assert.equal(diagnostic(r).retention, 'INLINE');
});
assert.deepEqual(fs.readFileSync(path.join(artifacts, 'input.bin')), bytes);
assert.deepEqual(fs.readFileSync(path.join(outside, 'outside.bin')), bytes);
const manifest = JSON.parse(fs.readFileSync(path.join(here, 'bindings.json')));
const kit = path.resolve(here, '../verification_kit_001');
for (const x of manifest.bindings) {
  const b = fs.readFileSync(path.join(kit, x.path)); assert.equal(b.length, x.bytes); assert.equal(hash(b), x.sha256);
}
assert.equal(hash(fs.readFileSync(path.join(here, 'README.md'))), '70D374000A4A8E17E3C481F4B7C46415C01871813A4A70FF0634F57FC5057C3C');
const record = { schema: 'GAP_API_BOUNDARY_TEST_RECORD_V1', obligation: 'O_API_REALIZATION', review_items: [1, 2, 3],
  scope: 'Boundary behavior only; synthetic handlers are not source/executor conformance or a new genesis',
  node: process.version, platform: process.platform, release: os.release(),
  sources: ['api_boundary.mjs', 'test_api_boundary.mjs'].map(file => ({ file, sha256: hash(fs.readFileSync(path.join(here, file))) })),
  preserved_bindings: manifest.bindings.length, comparison: 'SAME', tests: rows, verdict: 'IF_THEN' };
fs.writeFileSync(path.join(out, 'RUN_RECORD.json'), JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ tests: rows.length, verdict: 'IF_THEN', record: path.join(out, 'RUN_RECORD.json'), sha256: hash(fs.readFileSync(path.join(out, 'RUN_RECORD.json'))) }));
