let state = null;
const $ = selector => document.querySelector(selector);

async function api(path, body) {
  const response = await fetch(path, body === undefined ? {} : {
    method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`${payload.error || "REQUEST_FAILED"}: ${payload.because || path}`);
  return payload;
}

function showError(error) {
  const box = $("#error");
  box.textContent = error.message; box.classList.remove("hidden");
  setTimeout(() => box.classList.add("hidden"), 5000);
}

function layout(cells) {
  const order = ["player_near", "approach_gate", "enemy_approach", "health_low", "flee_gate", "enemy_flee", "patrol", "action_bus"];
  const positions = {};
  order.forEach((id, i) => positions[id] = {x: 10 + (i % 4) * 27, y: 25 + Math.floor(i / 4) * 50});
  cells.forEach((cell, i) => positions[cell.cell_id] ||= {x: 15 + (i % 4) * 25, y: 25 + Math.floor(i / 4) * 50});
  return positions;
}

function drawFabric() {
  const canvas = $("#fabric");
  const view = state.promoted;
  const cells = view.cells || [];
  const positions = layout(cells);
  canvas.innerHTML = "";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 1000 330");
  (view.routes || []).forEach(route => {
    const from = positions[route.source_cell], to = positions[route.target_cell];
    if (!from || !to) return;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", from.x * 10); line.setAttribute("y1", from.y * 3.3);
    line.setAttribute("x2", to.x * 10); line.setAttribute("y2", to.y * 3.3);
    svg.appendChild(line);
  });
  canvas.appendChild(svg);
  const phases = state.fabric_runtime.phases;
  cells.forEach(cell => {
    const node = document.createElement("div");
    const phase = phases[cell.cell_id] || "EMPTY";
    node.className = `cell phase-${phase.toLowerCase()}`;
    node.style.left = `${positions[cell.cell_id].x}%`; node.style.top = `${positions[cell.cell_id].y}%`;
    node.innerHTML = `<b>${cell.cell_id}</b><small>${cell.operator} × ${cell.witness}</small><em>${phase}</em>`;
    canvas.appendChild(node);
  });
  $("#runtime-phases").innerHTML = Object.entries(phases).sort().map(([id, phase]) => `<span class="phase-${phase.toLowerCase()}">${id}: ${phase}</span>`).join("");
}

function drawGame() {
  const game = state.game.state;
  const position = (sprite, point) => { sprite.style.left = `${10 + point[0] * 10}%`; sprite.style.top = `${50 - point[1] * 10}%`; };
  position($("#player"), game.player_position); position($("#enemy"), game.enemy_position);
  $("#logical-tick").textContent = state.game.logical_tick;
  $("#enemy-mode").textContent = game.enemy_mode;
  $("#enemy-health-readout").textContent = game.enemy_health;
  $("#last-effects").textContent = state.game.last_effect_batch?.effects?.map(effect => effect.value).join(", ") || "NONE";
  $("#run-status").textContent = state.game.reset_required ? "RESET REQUIRED" : "ACTIVE";
  $("#run-id").textContent = state.run_identity.run_id;
}

function render() {
  drawGame(); drawFabric();
  $("#game-event").textContent = state.last_event;
  $("#sample-calls").textContent = state.instrumentation.sample_calls;
  $("#step-calls").textContent = state.instrumentation.last_step_fabric_calls;
  $("#render-callbacks").textContent = state.instrumentation.render_callbacks;
  $("#fabric-status").textContent = state.fabric_runtime.run_status;
  $("#tick-receipt").textContent = state.game_loop_trace.ordered_tick_receipts.length ? JSON.stringify(state.game_loop_trace.ordered_tick_receipts.at(-1), null, 2) : "No tick yet.";
  $("#fabric-text").textContent = state.text_surfaces.PROMOTED;
  $("#proposal-state").textContent = state.proposal ? `${state.proposal.status}: ${state.proposal.proposer_explanation}` : "No candidate. Active run identity is fixed.";
  const proposalStatus = state.proposal?.status;
  $("#accept").disabled = proposalStatus !== "PROPOSED";
  $("#submit").disabled = proposalStatus !== "ACCEPTED_FOR_ADMISSION";
  $("#reject").disabled = !state.proposal;
  $("#advance-tick").disabled = state.game.reset_required;
}

async function action(path, body = {}) {
  try { state = await api(path, body); render(); } catch (error) { showError(error); }
}

$("#enemy-health").addEventListener("input", event => $("#staged-health").textContent = event.target.value);
$("#stage-controls").addEventListener("click", () => action("/api/game/controls", {player_near: $("#player-near").checked, enemy_health: Number($("#enemy-health").value)}));
$("#advance-tick").addEventListener("click", () => action("/api/game/tick"));
$("#render-frame").addEventListener("click", () => action("/api/game/render-frame"));
$("#replay").addEventListener("click", () => action("/api/game/replay"));
$("#reset-run").addEventListener("click", () => action("/api/game/reset"));
$("#propose").addEventListener("click", () => action("/api/propose", {text: $("#intent").value}));
$("#accept").addEventListener("click", () => action("/api/disposition/accept"));
$("#submit").addEventListener("click", () => action("/api/admission/submit"));
$("#reject").addEventListener("click", () => action("/api/disposition/reject"));

api("/api/state").then(payload => { state = payload; render(); }).catch(showError);
