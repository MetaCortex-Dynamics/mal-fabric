import { createBeautyRenderer } from './scene.js';

const $ = selector => document.querySelector(selector);
const gameView = $('#game-view');
const carrierView = $('#carrier-view');
const loading = $('#loading');
let renderer = null;
let state = null;
let surface = 'GAME';
let actionPending = false;

async function api(path, body = null) {
  const response = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {'Content-Type': 'application/json'},
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const value = await response.json();
  if (!response.ok) throw new Error(value.because || value.error || `HTTP_${response.status}`);
  return value;
}

function short(value, n = 18) {
  const text = String(value ?? '—');
  return text.length > n ? `${text.slice(0, n)}…` : text;
}

function committedSnapshot(payload) {
  const snapshot = payload?.snapshot;
  if (!snapshot) throw new Error('COMMITTED_SNAPSHOT_REQUIRED');
  return snapshot;
}

function setSurface(next) {
  surface = next === 'CARRIER' ? 'CARRIER' : 'GAME';
  gameView.classList.toggle('active', surface === 'GAME');
  carrierView.classList.toggle('active', surface === 'CARRIER');
  renderer?.setVisible(surface === 'GAME');
  // No API call. Surface state is intentionally presentation-local.
}

function carrier(payload) {
  const snapshot = committedSnapshot(payload);
  const carrierState = snapshot.carrier || {};
  const cells = Array.isArray(carrierState.cells) ? carrierState.cells : [];
  const routes = Array.isArray(carrierState.routes) ? carrierState.routes : [];
  const svg = $('#carrier-svg');
  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';
  const positions = new Map();
  const colors = {'□G':'#57d6a0','□S':'#58dce5','□F':'#ffb15c'};
  const enemyAction = String(snapshot.enemy?.action || '').toUpperCase();

  cells.forEach((cell, index) => {
    const angle = (index / Math.max(cells.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const radiusX = Math.min(390, 220 + cells.length * 5);
    const radiusY = Math.min(245, 150 + cells.length * 3);
    const x = 600 + radiusX * Math.cos(angle);
    const y = 330 + radiusY * Math.sin(angle);
    const id = String(cell.cell_id ?? `cell_${index}`);
    positions.set(id, {x,y});
    const dim = cell.location?.triad_position?.dimension || cell.triad || '□S';
    const operator = String(cell.operator || cell.label || id);
    const witness = String(cell.witness || '');
    const phase = String(cell.payload_phase || cell.phase || '');
    const active = phase && !/EMPTY|IDLE/i.test(phase) || (enemyAction && operator.toUpperCase().includes(enemyAction));
    const group = document.createElementNS(ns, 'g');
    group.setAttribute('class', `carrier-cell${active ? ' active' : ''}`);
    group.innerHTML = `<circle cx="${x}" cy="${y}" r="47" fill="#0b181b" stroke="${colors[dim] || '#58dce5'}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="39" fill="none" stroke="#19373b"/><text x="${x}" y="${y-5}" text-anchor="middle" fill="#e9f5f3" font-size="12">${operator}</text><text x="${x}" y="${y+14}" text-anchor="middle" fill="#759a98" font-size="9">${witness}</text><text x="${x}" y="${y+66}" text-anchor="middle" fill="${colors[dim] || '#58dce5'}" font-size="9">${phase || dim}</text>`;
    svg.appendChild(group);
  });

  routes.forEach(route => {
    const a = positions.get(String(route.source_cell));
    const b = positions.get(String(route.target_cell));
    if (!a || !b) return;
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    const active = !!route.active || /ACTIVE|ADMITTED|COMPLETED/i.test(String(route.phase || ''));
    line.setAttribute('class', `carrier-route${active ? ' active' : ''}`);
    svg.insertBefore(line, svg.firstChild);
  });

  $('#carrier-id').textContent = `${short(snapshot.game_run_id, 12)} · tick ${snapshot.logical_tick_index}`;
  const fields = [
    ['RUN', snapshot.game_run_id],
    ['TICK', snapshot.logical_tick_index],
    ['SNAPSHOT', snapshot.snapshot_digest],
    ['JOINT', snapshot.joint_state_digest],
    ['ENEMY', `${snapshot.enemy?.entity_id || 'enemy'} · ${snapshot.enemy?.action || '—'}`],
  ];
  $('#carrier-proof').innerHTML = fields.map(([label,value]) => `<div class="proof-item"><span>${label}</span><code>${short(value, 24)}</code></div>`).join('');
}

function draw(payload) {
  state = payload;
  const snapshot = committedSnapshot(payload);
  renderer?.applySnapshot(snapshot);
  carrier(payload);
  window.__beautyPassState = payload;
  document.body.dataset.tick = String(snapshot.logical_tick_index);
  document.body.dataset.snapshotDigest = String(snapshot.snapshot_digest || '');
}

const keyActions = new Map([
  ['KeyW','MOVE_N'], ['ArrowUp','MOVE_N'],
  ['KeyS','MOVE_S'], ['ArrowDown','MOVE_S'],
  ['KeyA','MOVE_W'], ['ArrowLeft','MOVE_W'],
  ['KeyD','MOVE_E'], ['ArrowRight','MOVE_E'],
]);

async function submitAction(action) {
  if (actionPending) return;
  actionPending = true;
  try {
    draw(await api('/api/action', {player_action: action}));
  } catch (error) {
    loading.textContent = error.message;
    loading.classList.add('error');
    throw error;
  } finally {
    actionPending = false;
  }
}

window.addEventListener('keydown', event => {
  if (event.code === 'Tab' || event.code === 'KeyC') {
    event.preventDefault();
    if (event.repeat) return;
    setSurface(surface === 'GAME' ? 'CARRIER' : 'GAME');
    return;
  }
  const action = keyActions.get(event.code);
  if (!action) return;
  event.preventDefault();
  if (event.repeat) return;
  submitAction(action).catch(console.error);
});

try {
  renderer = await createBeautyRenderer($('#three-stage'), message => {
    loading.textContent = message.replaceAll('_', ' ').toLowerCase();
  });
  draw(await api('/api/state'));
  setSurface('GAME');
  loading.classList.add('ready');
} catch (error) {
  console.error(error);
  loading.textContent = error.message;
  loading.classList.add('error');
}
