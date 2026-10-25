// Read-only observation of retained evidence; not a realization or runtime input.
// No selection, world write, promotion, or link is emitted by this audit.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const requireWitness = (test, name) => { if (!test) throw new Error('NOT_SAME: ' + name); };
const custody = [];
function bytesBound(relative, expected) {
  const absolute = path.resolve(base, relative);
  const bytes = fs.readFileSync(absolute);
  const observed = hash(bytes);
  requireWitness(observed === expected, relative + ' identity');
  custody.push({ path: absolute, bytes: bytes.length, sha256: observed, comparison: 'SAME' });
  return bytes;
}
const read = (relative, expected) => JSON.parse(bytesBound(relative, expected));
const program = read('j17_step_023/outputs/program.json', '6A2A2B384638C6983C20F708D059B6538AB4AAA9D1F468F460A961EBEF7FC529');
const prior = read('j17_step_023/outputs/fabric.successor.json', 'D41166EC3BC832AFA306D05E2F5E57E960FA635A1C4916A50381F3DB6A167C47');
const next = read('j17_world_fold_derivation_002/qualification_002/uncommitted.runtime.json', '55F9E49A428BA9662DE5DDBD59F65E1DBDFA5B4B7C6CCC549EDEC1952308A966');
const world = read('j17_step_023/outputs/committed.world.json', 'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059');
const record = read('j17_step_023/RUN_RECORD_023.json', '6A07ACE68BD15DA5F084269FA7FDD57021EC89B30EAE44ED4BF9F9B697B79B0D');
const binding = read('j17_world_fold_binding_003/BINDINGS.json', '2CABCE82A8CC23012ED1EDC5725BAB8C0FAD0207A15C4014231D8B559E5A4C6B');
bytesBound('j17_step_023/source/program.mal', '6FEA9C9B2FE462FC9E794C7E12F43DDDBAEE8A12BA947AB25DE60153FDE27B55');
bytesBound('j17_step_023/source/runtime_step.mal', '46F7260047664C7D31F54A74BAD2BB7356D72271AB8A1D7A2F57D8353B8A714D');
bytesBound('j17_step_023/source/commit_readout.mal', '23B480274497D854E6E6CE8ED9DE887F443E40D3FDBA2033B3A8EB892023AEE7');
bytesBound('j17_world_fold_derivation_002/source/runtime_reentry.mal', '609716E78664E5295C886BEF7C1678E65177D2EBD813B337D7CC3C7F0FD10584');
bytesBound('C:/Users/devon/Desktop/MaL/Markdowns/FABRIC_EXECUTION_SPEC_v0.3.0-candidate.md', '5BB1497AA3D791150F0416FEDA4E393695A9302B42030ADD0A7D22C08CCBEAC0');
bytesBound('C:/Users/devon/Desktop/MaL/MaLv3/SPEC_J17_WORLD_FOLD_EFFECT_001_v0.1.0_PROPOSED.mal', 'E2A87BDC3E5A7AAC7B246F3CBBAF77F141689FCF6270D537ACC059F9E6BB9E9E');
bytesBound('C:/Users/devon/Desktop/MaL/Markdowns/RECEIPT_PROMOTE_SPEC_J17_WORLD_FOLD_EFFECT_001_v0.1.0.md', 'E674B00C04B0B8119BFFD4596A756467B8054C9A6CF6741E3B2869365B7ECD9A');

// Reproduce the existing observation spelling only. No ordering supplies a role.
function siteTerm(site) {
  if (site.startsWith('C:')) return 'TOGETHER_ALONE(' + site.slice(2).split('|').join(',') + ')';
  if (site.startsWith('D:')) return site.slice(2);
  throw new Error('Unsupported site observation: ' + site);
}
const group = parts => 'TOGETHER_ALONE(' + parts.join(',') + ')';
const flagTerm = ([v, e, t]) => group([siteTerm(v), group(e.map(siteTerm)), group(t.map(siteTerm))]);
const markerRows = new Map(world.field.map(([flag, reading]) => ['SOURCE_MARKER(GENESIS,' + flagTerm(flag) + ')', { flag, reading }]));
const cells = new Map(program.cells.map(c => [c.cell_id, c]));
const markers = program.cells.filter(c => c.operator === 'THIS');
const comparators = program.cells.filter(c => c.operator === 'SAME_NOT_SAME');
requireWitness(cells.size === 18 && markers.length === 12 && comparators.length === 6, 'program cell coverage');
requireWitness(program.routes.length === 12, 'route coverage');
requireWitness(Object.keys(prior.payload_states).length === 18 && Object.keys(next.payload_states).length === 18, 'payload coverage');

const markerAudit = markers.map(c => {
  const located = markerRows.get(c.cell_id);
  requireWitness(located !== undefined, 'marker located by exact occurrence identity');
  const incoming = program.routes.filter(r => r.target_cell === c.cell_id);
  const outgoing = program.routes.filter(r => r.source_cell === c.cell_id);
  requireWitness(incoming.length === 0 && outgoing.length === 1, 'marker route inventory');
  requireWitness(prior.payload_states[c.cell_id].result === located.reading, 'marker result equals snapshot reading');
  return { cell_id: c.cell_id, ...located, incoming_routes: incoming.map(r => r.route_id), outgoing_routes: outgoing.map(r => r.route_id) };
});
const pairAudit = comparators.map(c => {
  const incoming = program.routes.filter(r => r.target_cell === c.cell_id);
  const outgoing = program.routes.filter(r => r.source_cell === c.cell_id);
  const left = incoming.filter(r => r.target_role === 'LEFT');
  const right = incoming.filter(r => r.target_role === 'RIGHT');
  requireWitness(incoming.length === 2 && left.length === 1 && right.length === 1 && outgoing.length === 0, 'comparator join and sink');
  requireWitness(incoming.every(r => r.source_role === 'RESULT' && cells.get(r.source_cell)?.operator === 'THIS'), 'marker RESULT to comparator input');
  const operands = [left[0], right[0]].map(r => ({ role: r.target_role, route_id: r.route_id, ...markerRows.get(r.source_cell) }));
  const [f, g] = operands.map(o => o.flag);
  requireWitness(f[0] === g[0] && same(f[2], g[2]) && !same(f[1], g[1]), 'GAMMA incidence of comparison operands');
  const retained = record.program.comparison_readings.find(r => r.cell === c.cell_id);
  requireWitness(retained !== undefined, 'retained comparison witness');
  requireWitness(same(retained.flag_pair, [f, g]) || same(retained.flag_pair, [g, f]), 'flag spelling matches retained witness');
  requireWitness(prior.payload_states[c.cell_id].result === 'SAME' && operands[0].reading === operands[1].reading, 'comparison result');
  return { cell_id: c.cell_id, incidence: 'GAMMA', operands, result: 'SAME', outgoing_routes: [], displacement_instruction: 'NOT_EMITTED', prior_fact: retained.fact, prior_rule: retained.rule, prior_support: retained.support };
});
for (const c of program.cells) {
  const p = prior.payload_states[c.cell_id], n = next.payload_states[c.cell_id];
  requireWitness(p.phase === 'COMPLETED' && n.phase === 'DISCHARGED', 'payload lifecycle');
  requireWitness(n.result_ref.toUpperCase() === hash(JSON.stringify(p.result)), 'retained result custody');
}
requireWitness(same(prior.pending_input_buffers, next.pending_input_buffers), 'retained buffers');
requireWitness(same(prior.route_states, next.route_states), 'retained routes');
requireWitness(next.pending_input_buffers.length === 6, 'buffer inventory');
requireWitness(prior.pending_admissions.length === 0 && next.pending_admissions.length === 0, 'no pending admissions');
requireWitness(prior.outstanding_obligations.length === 0 && next.outstanding_obligations.length === 0, 'runtime obligation inventory');

const output = {
  record: 'J17_ROUTE_RESULT_CROSS_TERM_004',
  scope: 'Read-only observation of qualified outputs; not a GPU execution, whole-fold certificate or world commit.',
  custody,
  audit_source_sha256: hash(fs.readFileSync(fileURLToPath(import.meta.url))),
  coordinate_binding: 'Exact occurrence identity joined to flag coordinates and independently checked against the retained six comparison witnesses. LEFT/RIGHT are role names, not a from/to displacement interpretation.',
  counts: { marker_occurrences: 12, comparator_occurrences: 6, routes: 12, marker_to_comparator_routes: 12, comparator_to_marker_routes: 0, route_targets_at_markers: 0, snapshot_admitted_cells: 0, snapshot_completed_cells: 18, successor_discharged_cells: 18, retained_result_refs: 18, retained_buffers: 6, receipts_before: prior.receipts.length, receipts_after: next.receipts.length },
  markers: markerAudit,
  comparisons: pairAudit,
  proof: [
    'The snapshot payload inventory is exhaustive and every phase is COMPLETED; FABEX sections 2-3 restrict evaluation to snapshot ADMITTED cells.',
    'runtime_reentry.mal:99-102 excludes new evaluation and propagation for these COMPLETED cells. Thus newly emitted route values in this step form the empty set; this is antecedent exclusion, not a missing-file inference.',
    'Every existing route carries a marker RESULT into comparator LEFT or RIGHT. Comparators are sinks. No marker receives a comparator result.',
    'The six comparison pairs have GAMMA incidence and equal readings. Geometry identifies overlap endpoints; it does not turn LEFT/RIGHT into producer source/target or turn a SAME result into a lift instruction.',
    'Under this bounded program effect the section is retained, all 12 walls are retained and opened/discharged walls are empty, while payload custody advances. This is not a claim that all world-fold effects have been enumerated.'
  ],
  verdicts: { new_route_emissions: 'IF_THEN_EMPTY', routed_displacement_instructions: 'IF_THEN_EMPTY', bounded_section_projection: 'SAME', runtime_state_comparison: 'NOT_SAME', requested_whole_fold_equivalence: 'MAYBE', link_3: 'NOT_COMMITTED' },
  whole_fold_boundary: 'Promoted SPEC_J17_WORLD_FOLD_EFFECT_001:64-66 excludes A3 substitution; :101-102 says repeating the THIS/SAME program does not witness HELD under FOLD. A complete fold-equivalence derivation is not supplied by the empty routed-emission set alone.',
  previous_binding_unchanged: binding.record,
  new_law: 'NONE', promotion: 'NONE', gpu_run: 'NOT_RUN', board_action: 'NONE', git_commit_or_push: 'NONE'
};
process.stdout.write(JSON.stringify(output, null, 2) + '\n');
