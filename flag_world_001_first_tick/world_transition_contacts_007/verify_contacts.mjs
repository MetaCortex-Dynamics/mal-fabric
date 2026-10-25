// Read-only custody verification. Not an engine, compiler or world transition.
import { readFileSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const packet = dirname(fileURLToPath(import.meta.url));
const digest = data => createHash("sha256").update(data).digest("hex").toUpperCase();
const manifestBytes = readFileSync(resolve(packet, "MANIFEST.json"));
const readoutBytes = readFileSync(resolve(packet, "READOUT.json"));
const manifest = JSON.parse(manifestBytes);
const readout = JSON.parse(readoutBytes);
const mismatches = [];
const results = [];

function checkBytes(id, path, expected) {
  try {
    const bytes = readFileSync(path);
    const sha256 = digest(bytes);
    const verdict = bytes.length === expected.bytes && sha256 === expected.sha256 ? "SAME" : "NOT_SAME";
    results.push({ id, path, bytes: bytes.length, sha256, verdict });
    if (verdict !== "SAME") mismatches.push({ id, path, expected, bytes: bytes.length, sha256 });
    return bytes;
  } catch (error) {
    mismatches.push({ id, path, diagnostic: error.message });
    return null;
  }
}

for (const contact of manifest.contacts) {
  const placed = checkBytes(contact.id, resolve(packet, contact.path), contact);
  const source = checkBytes(contact.id + "_ORIGINAL", contact.source, contact);
  if (placed && source && !placed.equals(source)) {
    mismatches.push({ id: contact.id, verdict: "NOT_SAME_ORIGINAL_COPY" });
  }
}
for (const binding of readout.bindings) checkBytes(binding.id, resolve(packet, binding.path), binding);
for (const finding of readout.source_findings) {
  if (!finding.contact || (!finding.quote && !finding.quote_fragment)) continue;
  const contact = manifest.contacts.find(entry => entry.id === finding.contact);
  const lines = readFileSync(resolve(packet, contact.path), "utf8").split(/\r?\n/);
  const excerpt = lines.slice(finding.lines[0] - 1, finding.lines[1]).join("\n");
  const match = finding.quote ? excerpt === finding.quote : excerpt.includes(finding.quote_fragment);
  if (!match) mismatches.push({ id: finding.contact, lines: finding.lines, verdict: "NOT_SAME_QUOTE" });
}

const world = JSON.parse(readFileSync(resolve(packet, readout.bindings.find(b => b.id === "G2").path)));
const counts = {
  links: world.chain.length,
  flags: world.field.length,
  THIS: world.field.filter(row => row[1] === "THIS").length,
  NO: world.field.filter(row => row[1] === "NO").length,
  overlaps: world.witness.length,
  SAME: world.witness.filter(row => row[2] === "SAME").length,
  NOT_SAME: world.witness.filter(row => row[2] === "NOT_SAME").length,
  pair_hash: world.chain.at(-1).record.pair_hash.toUpperCase(),
  chain_head: world.chain.at(-1).link.toUpperCase(),
  receipt_opened: world.receipt.opened.length,
  receipt_discharged: world.receipt.discharged.length
};
for (const [key, value] of Object.entries(counts)) {
  if (value !== readout.g2_observation[key]) mismatches.push({ id: "G2", key, expected: readout.g2_observation[key], observed: value });
}

const frozenPath = resolve(packet, manifest.frozen_evidence_check.manifest);
const frozenHash = digest(readFileSync(frozenPath));
if (frozenHash !== manifest.frozen_evidence_check.sha256) mismatches.push({ id: "FROZEN_MANIFEST", observed: frozenHash });

console.log(JSON.stringify({
  schema: "J17ContactCustodyVerificationV1",
  verdict: mismatches.length ? "NOT_SAME" : "SAME",
  manifest_sha256: digest(manifestBytes),
  readout_sha256: digest(readoutBytes),
  verifier_sha256: digest(readFileSync(fileURLToPath(import.meta.url))),
  source_copy_pairs: manifest.contacts.length,
  bound_files: readout.bindings.length,
  quoted_line_checks: readout.source_findings.filter(f => f.quote || f.quote_fragment).length,
  frozen_manifest_sha256: frozenHash,
  g2: counts,
  results,
  mismatches,
  effects: "READ_ONLY; no runtime execution, commit, push, or worldline append."
}, null, 2));
process.exitCode = mismatches.length ? 1 : 0;
