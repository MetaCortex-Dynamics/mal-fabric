import { createGameRenderer } from './scene.js';

const $ = selector => document.querySelector(selector);
const short = value => (value || '—').slice(0, 12);
let near = false;
let assetMode = new URLSearchParams(location.search).get('capture') === 'conventional' ? 'CONVENTIONAL_ASSET' : 'GAUSSIAN_ASSET';
let gameRenderer = null;

async function api(path, body) {
  const response = await fetch(path, {method: body ? 'POST' : 'GET', headers: {'Content-Type': 'application/json'}, body: body ? JSON.stringify(body) : undefined});
  const result = await response.json();
  if (!response.ok) throw Error(result.because || result.error);
  return result;
}

function setSurface(name) {
  $('#game-view').classList.toggle('active', name === 'GAME');
  $('#carrier-view').classList.toggle('active', name === 'CARRIER');
  $('#game-tab').classList.toggle('active', name === 'GAME');
  $('#carrier-tab').classList.toggle('active', name === 'CARRIER');
  $('#surface').textContent = name;
  gameRenderer?.show(name === 'GAME');
}

function setAsset(mode) {
  assetMode = mode;
  $('#gaussian-tab').classList.toggle('active', mode === 'GAUSSIAN_ASSET');
  $('#conventional-tab').classList.toggle('active', mode === 'CONVENTIONAL_ASSET');
  $('#asset-label').textContent = mode.replaceAll('_', ' ');
}

function carrier(view) {
  const svg = $('#carrier-svg'); svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg', by = {};
  view.cells.forEach((cell, index) => {
    const angle = index / view.cells.length * Math.PI * 2, x = 600 + 260 * Math.cos(angle), y = 330 + 230 * Math.sin(angle);
    by[cell.cell_id] = {x, y};
    const group = document.createElementNS(ns, 'g');
    group.innerHTML = `<circle cx="${x}" cy="${y}" r="52" fill="#102022" stroke="${cell.payload_phase === 'EMPTY' ? '#416064' : '#53e3d8'}" stroke-width="2"/><text x="${x}" y="${y-5}" text-anchor="middle" fill="#dce9eb" font-size="13">${cell.operator}</text><text x="${x}" y="${y+15}" text-anchor="middle" fill="#71888a" font-size="10">× ${cell.witness}</text><text x="${x}" y="${y+72}" text-anchor="middle" fill="#53e3d8" font-size="9">${cell.payload_phase}</text>`;
    svg.appendChild(group);
  });
  view.routes.forEach(route => {
    const a = by[route.source_cell], b = by[route.target_cell]; if (!a || !b) return;
    const line = document.createElementNS(ns, 'line');
    Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'#29484a','stroke-width':'2'}).forEach(([key,value]) => line.setAttribute(key,value));
    svg.insertBefore(line, svg.firstChild);
  });
}

function draw(payload) {
  const render = payload.last_render || payload;
  const view = render.view || payload.view;
  const surface = render.active_surface || payload.active_surface?.surface;
  const gaussian = render.gaussian;
  setSurface(surface);
  if (view?.entities) {
    gameRenderer?.update(view, gaussian, assetMode);
    $('#behavior').textContent = view.behavior_status;
    $('#behavior').classList.toggle('stalled', view.behavior_status === 'STALL');
  }
  if (view?.cells) carrier(view);
  const snapshot = payload.snapshot || {};
  $('#tick').textContent = `TICK ${snapshot.logical_tick_index ?? view?.logical_tick_index ?? 0}`;
  $('#run-status').textContent = snapshot.run_status || view?.behavior_status || 'READY';
  $('#snapshot').textContent = short(payload.snapshot_digest || view?.snapshot_digest);
  $('#run').textContent = short(snapshot.game_run_id);
  $('#fabric').textContent = short(snapshot.fabric_digest);
  $('#state').textContent = short(snapshot.fabric_state_digest);
  $('#asset').textContent = short(gaussian?.selected_asset_id);
  $('#decision').textContent = short(gaussian?.decision_digest);
  $('#load-state').textContent = gaussian?.load?.disposition || 'PENDING';
  const phases = snapshot.committed_fabric_state?.payload_states || {};
  $('#phases').innerHTML = Object.entries(phases).map(([key,value]) => `<div class="phase ${value.phase}" title="${key}">${key}<br>${value.phase}</div>`).join('');
  document.body.dataset.captureReady = 'true';
}

async function chooseAsset(mode) { setAsset(mode); draw(await api('/api/asset/mode', {mode})); }
$('#game-tab').onclick = async () => { if ($('#surface').textContent !== 'GAME') draw(await api('/api/toggle', {})); };
$('#carrier-tab').onclick = async () => { if ($('#surface').textContent !== 'CARRIER') draw(await api('/api/toggle', {})); };
$('#conventional-tab').onclick = () => chooseAsset('CONVENTIONAL_ASSET');
$('#gaussian-tab').onclick = () => chooseAsset('GAUSSIAN_ASSET');
$('#near').onclick = () => { near = !near; $('#near').textContent = near ? 'PLAYER NEAR' : 'PLAYER FAR'; };
$('#health').oninput = event => $('#health-value').textContent = event.target.value;
$('#advance').onclick = async () => { await api('/api/game/controls', {player_near: near, enemy_health: Number($('#health').value)}); draw(await api('/api/game/tick', {})); };
$('#blocked').onclick = async () => draw(await api('/api/game/blocked', {}));

try {
  gameRenderer = await createGameRenderer($('#three-stage'),
    capability => api('/api/capability', {capability}).catch(console.error),
    (state, backend) => { $('#load-state').textContent = state; $('#backend').textContent = backend; }
  );
  $('#backend').textContent = gameRenderer.capability;
} catch (error) {
  $('#load-state').textContent = 'FALLBACK';
  $('#backend').textContent = error.message;
  await api('/api/capability', {capability: 'UNSUPPORTED'});
}
await chooseAsset(assetMode);
