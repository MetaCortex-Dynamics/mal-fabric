// API custody only. No carrier, marking, agreement or commit law lives here.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const PROFILE = 'JTP_ARCHIVED_J17_001';
export const OPERATIONS = Object.freeze(['captureArchived', 'validateArchived', 'locate', 'seedInitial', 'commitInitial', 'verifyInitial']);
const READINGS = new Set(['IF_THEN', 'NOT-SAME', 'NO', 'MAYBE']);
const digest = b => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const inside = (root, name) => { const r = path.relative(root, name); return r !== '' && !r.startsWith('..' + path.sep) && r !== '..' && !path.isAbsolute(r); };
const plain = x => x !== null && typeof x === 'object' && !Array.isArray(x) && Object.getPrototypeOf(x) === Object.prototype;
const keys = (x, names) => plain(x) && Object.keys(x).length === names.length && names.every(n => Object.hasOwn(x, n));

export class Refusal extends Error {
  constructor(reading, code, message = code) {
    super(message);
    this.reading = reading;
    this.code = code;
  }
}
function refuse(reading, code, detail) { throw new Refusal(reading, code, detail); }
function classify(error) {
  if (error instanceof Refusal && READINGS.has(error.reading) && error.reading !== 'IF_THEN') return error;
  return new Refusal('MAYBE', 'CONTACT_FAILURE', error instanceof Error ? error.message : String(error));
}
function rootOf(name) {
  if (typeof name !== 'string' || !path.isAbsolute(name)) refuse('NO', 'ARTIFACT_DIRECTORY_REQUIRED');
  let root;
  try { root = fs.realpathSync.native(name); } catch (e) { refuse('MAYBE', 'ARTIFACT_DIRECTORY_UNAVAILABLE', e.code); }
  if (!fs.statSync(root).isDirectory()) refuse('NO', 'ARTIFACT_DIRECTORY_REQUIRED');
  return root;
}
function safeFile(root, relative) {
  // Forbid drive/UNC/ADS spellings and dot navigation on every platform.
  if (typeof relative !== 'string' || relative.length === 0 || /[\x00:]/.test(relative) || path.isAbsolute(relative) || /^[\\/]/.test(relative)) refuse('NO', 'PATH_OUTSIDE_ARTIFACT_DIRECTORY');
  const parts = relative.split(/[\\/]/);
  if (parts.some(p => !p || p === '.' || p === '..' || /[. ]$/.test(p))) refuse('NO', 'PATH_OUTSIDE_ARTIFACT_DIRECTORY');
  const file = path.resolve(root, ...parts);
  if (!inside(root, file)) refuse('NO', 'PATH_OUTSIDE_ARTIFACT_DIRECTORY');
  let at = root;
  for (const part of parts) {
    at = path.join(at, part);
    let stat;
    try { stat = fs.lstatSync(at); } catch (e) { refuse('MAYBE', 'MISSING_ARTIFACT', e.code); }
    if (stat.isSymbolicLink()) refuse('NO', 'LINK_PATH_NOT_ADMITTED');
  }
  if (!fs.statSync(file).isFile()) refuse('NO', 'ARTIFACT_NOT_FILE');
  if (!inside(root, fs.realpathSync.native(file))) refuse('NO', 'PATH_OUTSIDE_ARTIFACT_DIRECTORY');
  return file;
}
function readBlob(root, ref) {
  if (!keys(ref, ['path', 'bytes', 'sha256']) || !Number.isSafeInteger(ref.bytes) || ref.bytes < 0 || !/^[A-F0-9]{64}$/.test(ref.sha256)) refuse('NO', 'BLOB_REF_SCHEMA');
  const file = safeFile(root, ref.path);
  let fd;
  try {
    fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
    const bytes = fs.readFileSync(fd);
    // Recheck custody after the read. Callers must not mutate the directory concurrently.
    safeFile(root, ref.path);
    if (bytes.length !== ref.bytes || digest(bytes) !== ref.sha256) refuse('NOT-SAME', 'BLOB_BINDING_MISMATCH');
    return bytes;
  } finally { if (fd !== undefined) fs.closeSync(fd); }
}
function writeEvidence(root, name, bytes) {
  if (fs.realpathSync.native(root) !== root) throw Error('Evidence directory identity changed');
  const dest = path.join(root, name);
  const fd = fs.openSync(dest, 'wx');
  try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  return { path: name, bytes: bytes.length, sha256: digest(bytes) };
}

// The six source-backed adapters are injected. This boundary does not construct
// a Seed or Commit from expected outputs or call a GPU run on its own.
export function createBoundary({ evidenceDirectory, handlers = {} }) {
  // Initialization does no filesystem writes, so setup failures also reach invoke's recorder.
  return Object.freeze({
    async invoke(request, context) {
      const id = crypto.randomUUID();
      const operation = typeof request?.operation === 'string' ? request.operation : 'UNSPECIFIED';
      const diagnostic = { schema: 'GAP_DIAGNOSTIC_V1', invocation: id, requested_profile: typeof request?.profile === 'string' ? request.profile : null,
        operation, artifact_directory: typeof context?.artifactDirectory === 'string' ? context.artifactDirectory : null,
        resolved_artifact_directory: null, evidence_directory: typeof evidenceDirectory === 'string' ? evidenceDirectory : null,
        reading: 'MAYBE', code: 'NOT_STARTED', detail: '', retention: 'INLINE', retention_error: null };
      let result = null;
      let reason = null;
      const adapterEvidence = [];
      try {
        if (!keys(request, ['profile', 'operation', 'input'])) refuse('NO', 'REQUEST_SCHEMA');
        if (request.profile !== PROFILE) refuse('NO', 'UNSUPPORTED_PROFILE');
        if (!OPERATIONS.includes(operation)) refuse('NO', 'UNSUPPORTED_OPERATION');
        if (!keys(context, ['artifactDirectory'])) refuse('NO', 'DIRECTORY_CONTEXT_SCHEMA');
        const root = rootOf(context.artifactDirectory);
        diagnostic.resolved_artifact_directory = root;
        const evidenceRoot = rootOf(evidenceDirectory);
        // Evidence is out of band and cannot overwrite or extend the input tree.
        if (evidenceRoot === root || inside(root, evidenceRoot) || inside(evidenceRoot, root)) refuse('NO', 'EVIDENCE_DIRECTORY_OVERLAP');
        if (typeof handlers[operation] !== 'function') refuse('MAYBE', 'CONTACT_NOT_IMPLEMENTED');
        const input = structuredClone(request.input);
        const candidate = await handlers[operation](input, Object.freeze({
          artifactDirectory: root,
          readBlob: ref => readBlob(root, ref),
          retainEvidence: ref => { readBlob(evidenceRoot, ref); adapterEvidence.push(structuredClone(ref)); }
        }));
        if (candidate === null || candidate === undefined) refuse('MAYBE', 'MISSING_CONTACT_WITNESS');
        // A serializable value is needed before anything can be returned.
        result = JSON.parse(JSON.stringify(candidate));
        if (result === null) refuse('MAYBE', 'MISSING_CONTACT_WITNESS');
        diagnostic.reading = 'IF_THEN'; diagnostic.code = 'CONTACT_RETURNED';
      } catch (e) {
        reason = classify(e); result = null;
        diagnostic.reading = reason.reading; diagnostic.code = reason.code; diagnostic.detail = reason.message;
      }
      let evidence = [];
      try {
        const root = rootOf(evidenceDirectory);
        // Even malformed request contexts cannot direct evidence into the input tree.
        const declared = diagnostic.resolved_artifact_directory ?? (typeof context?.artifactDirectory === 'string' && path.isAbsolute(context.artifactDirectory) ? path.resolve(context.artifactDirectory) : null);
        if (declared && (root === declared || inside(declared, root) || inside(root, declared))) throw Error('Evidence directory overlaps artifacts');
        diagnostic.retention = 'FILE_AND_INLINE';
        evidence = [...adapterEvidence, writeEvidence(root, `${id}.diagnostic.json`, Buffer.from(JSON.stringify(diagnostic) + '\n'))];
      } catch (e) {
        // A storage failure is itself a refusal. The full diagnostic remains in
        // the returned envelope; do not claim it was durably persisted.
        result = null;
        diagnostic.retention = 'INLINE'; diagnostic.retention_error = e.message;
        if (!reason) { diagnostic.reading = 'MAYBE'; diagnostic.code = 'EVIDENCE_RETENTION_FAILED'; diagnostic.detail = 'Candidate withheld; evidence storage unavailable'; }
      }
      const obligations = diagnostic.reading === 'IF_THEN' ? [] : [`REASON:${diagnostic.code}`, `DIAGNOSTIC:${JSON.stringify(diagnostic)}`];
      return { profile: PROFILE, operation, reading: diagnostic.reading, result, evidence, obligations };
    }
  });
}
