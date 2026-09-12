import { createShowcaseRenderer } from './scene.js';

const $ = selector => document.querySelector(selector);
const short = (value, length = 12) => (value || '—').slice(0, length);
let near = false;
let renderer = null;
let lastState = null;

async function api(path, body) {
  const response = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {'Content-Type': 'application/json'},
    body: body ? JSON.stringify(body) : undefined
  });
  const value = await response.json();
  if (!response.ok) throw Error(value.because || value.error);
  return value;
}

function setSurface(surface) {
  $('#game-view').classList.toggle('active', surface === 'GAME');
  $('#carrier-view').classList.toggle('active', surface === 'CARRIER');
  $('#game-tab').classList.toggle('active', surface === 'GAME');
  $('#carrier-tab').classList.toggle('active', surface === 'CARRIER');
  renderer?.show(surface === 'GAME');
}

function carrier(view) {
  const svg = $('#carrier-svg');
  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';
  const positions = {};
  const colors = {'□G':'#57d6a0','□S':'#58dce5','□F':'#ffb15c'};
  view.cells.forEach((cell, index) => {
    const angle = index / view.cells.length * Math.PI * 2;
    const x = 600 + 290 * Math.cos(angle), y = 330 + 230 * Math.sin(angle);
    positions[cell.cell_id] = {x, y};
    const dim = cell.location?.triad_position?.dimension || '□S';
    const group = document.createElementNS(ns, 'g');
    group.innerHTML = `<circle cx="${x}" cy="${y}" r="55" fill="#0c1b20" stroke="${colors[dim] || '#58dce5'}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="47" fill="none" stroke="#1f4047"/><text x="${x}" y="${y-7}" text-anchor="middle" fill="#edf8f7" font-size="13">${cell.operator}</text><text x="${x}" y="${y+14}" text-anchor="middle" fill="#7b9b9e" font-size="10">× ${cell.witness}</text><text x="${x}" y="${y+76}" text-anchor="middle" fill="${colors[dim] || '#58dce5'}" font-size="9">${cell.payload_phase} · ${dim}</text>`;
    svg.appendChild(group);
  });
  view.routes.forEach(route => {
    const a = positions[route.source_cell], b = positions[route.target_cell];
    if (!a || !b) return;
    const line = document.createElementNS(ns, 'line');
    Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'#315a61','stroke-width':'2'}).forEach(([key,value]) => line.setAttribute(key,value));
    svg.insertBefore(line, svg.firstChild);
  });
}

function draw(payload) {
  lastState = payload;
  const surface = payload.active_surface.surface;
  const snapshot = payload.snapshot;
  const render = payload.last_render || {};
  const view = render.view;
  setSurface(surface);
  if (view?.entities) renderer?.update(view);
  if (view?.cells) carrier(view);
  $('#behavior').textContent = view?.behavior_status || snapshot.committed_game_state.enemy_mode;
  $('#run-status').textContent = snapshot.run_status;
  $('#tick').textContent = `TICK ${snapshot.logical_tick_index}`;
  $('#snapshot-head').textContent = short(payload.snapshot_digest);
  $('#surface').textContent = surface;
  $('#run').textContent = short(snapshot.game_run_id);
  $('#fabric').textContent = short(snapshot.fabric_digest);
  $('#state').textContent = short(snapshot.fabric_state_digest);
  $('#proof-run').textContent = short(payload.showcase.run_id, 18);
  $('#proof-tick').textContent = snapshot.logical_tick_index;
  $('#proof-snapshot').textContent = short(payload.snapshot_digest, 18);
  $('#proof-game-run').textContent = short(snapshot.game_run_id, 18);
  $('#proof-surface').textContent = surface;
  $('#proof-asset').textContent = short(payload.showcase.asset.sha256, 18);
  const phases = snapshot.committed_fabric_state.payload_states || {};
  $('#phases').innerHTML = Object.entries(phases).map(([key,value]) => `<div class="phase ${value.phase}" title="${key}">${key}<br>${value.phase}</div>`).join('');
  document.body.dataset.captureReady = 'true';
  window.__showcaseState = payload;
}

async function toggleTo(surface) {
  if (lastState?.active_surface?.surface !== surface) draw(await api('/api/toggle', {}));
  return lastState;
}

$('#game-tab').onclick = () => toggleTo('GAME');
$('#carrier-tab').onclick = () => toggleTo('CARRIER');
$('#near').onclick = () => { near = !near; $('#near').textContent = near ? 'PLAYER NEAR' : 'PLAYER FAR'; };
$('#health').oninput = event => $('#health-value').textContent = event.target.value;
$('#advance').onclick = async () => {
  await api('/api/game/controls', {player_near: near, enemy_health: Number($('#health').value)});
  draw(await api('/api/game/tick', {}));
};

window.showcaseApi = {api, draw, toggleTo, state: () => lastState};

try {
  renderer = await createShowcaseRenderer(
    $('#three-stage'),
    capability => api('/api/capability', {capability}).catch(console.error),
    (status, backend) => {
      $('#asset-status').textContent = status;
      $('#backend').textContent = backend;
      document.body.dataset.assetReady = status === 'LOADED' ? 'true' : 'false';
    }
  );
} catch (error) {
  $('#asset-status').textContent = 'FALLBACK';
  $('#backend').textContent = error.message;
  document.body.dataset.assetReady = 'false';
  await api('/api/capability', {capability:'UNSUPPORTED'});
}
draw(await api('/api/state'));
