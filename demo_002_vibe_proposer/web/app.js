let state = null;

const $ = selector => document.querySelector(selector);

async function api(path, body) {
  const options = body === undefined ? {} : {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body),
  };
  const response = await fetch(path, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(`${payload.error}: ${payload.because || path}`);
  return payload;
}

function showError(error) {
  const box = $("#error");
  box.textContent = error.message;
  box.classList.remove("hidden");
  setTimeout(() => box.classList.add("hidden"), 5000);
}

function locationRegion(cell) {
  const triad = cell.location?.triad_position;
  return triad?.dimension || triad?.target || "□S";
}

function layout(view) {
  const groups = {"□G": [], "□S": [], "□F": []};
  (view?.cells || []).forEach(cell => (groups[locationRegion(cell)] || groups["□S"]).push(cell));
  const positions = {};
  Object.entries(groups).forEach(([region, cells], column) => {
    cells.sort((a, b) => a.cell_id.localeCompare(b.cell_id));
    cells.forEach((cell, index) => {
      const saved = state.presentation[cell.cell_id];
      positions[cell.cell_id] = saved || {x: 16.7 + column * 33.3, y: 18 + index * Math.min(70, 310 / Math.max(1, cells.length - 1))};
    });
  });
  return positions;
}

function line(svg, source, target, className, routeId) {
  if (!source || !target) return;
  const element = document.createElementNS("http://www.w3.org/2000/svg", "line");
  element.setAttribute("x1", source.x * 10); element.setAttribute("y1", source.y * 3.9);
  element.setAttribute("x2", target.x * 10); element.setAttribute("y2", target.y * 3.9);
  element.setAttribute("class", className);
  element.dataset.routeId = routeId;
  svg.appendChild(element);
}

function renderFabric() {
  const canvas = $("#fabric");
  canvas.innerHTML = '<span class="region" style="left:15%">□G · GENERATIVE</span><span class="region" style="left:47%">□S · STRUCTURAL</span><span class="region" style="left:80%">□F · FUNCTIONAL</span>';
  const promoted = state.promoted;
  const candidate = state.candidate || promoted;
  const before = layout(promoted);
  const after = layout(candidate);
  const diff = state.geometric_diff || {added_routes: [], removed_routes: [], moved_cells: [], added_cells: []};
  const addedRoutes = new Set(diff.added_routes.map(route => route.route_id));
  const removedRoutes = new Set(diff.removed_routes.map(route => route.route_id));
  const moved = new Set(diff.moved_cells.map(cell => cell.cell_id));
  const addedCells = new Set(diff.added_cells.map(cell => cell.cell_id));

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 1000 390");
  promoted.routes.forEach(route => line(svg, before[route.source_cell], before[route.target_cell], removedRoutes.has(route.route_id) ? "removed" : "", route.route_id));
  candidate.routes.filter(route => addedRoutes.has(route.route_id)).forEach(route => line(svg, after[route.source_cell], after[route.target_cell], "added", route.route_id));
  canvas.appendChild(svg);

  if (state.candidate) {
    promoted.cells.filter(cell => moved.has(cell.cell_id)).forEach(cell => {
      const node = document.createElement("div");
      node.className = "cell ghost"; node.style.left = `${before[cell.cell_id].x}%`; node.style.top = `${before[cell.cell_id].y}%`;
      node.innerHTML = `<b>${cell.cell_id}</b><small>promoted · ${locationRegion(cell)}</small>`; canvas.appendChild(node);
    });
  }
  candidate.cells.forEach(cell => {
    const node = document.createElement("div");
    node.className = `cell ${moved.has(cell.cell_id) ? "moved" : ""} ${addedCells.has(cell.cell_id) ? "added" : ""}`;
    node.style.left = `${after[cell.cell_id].x}%`; node.style.top = `${after[cell.cell_id].y}%`;
    node.innerHTML = `<b>${cell.cell_id}</b><small>${cell.operator} × ${cell.witness} · ${locationRegion(cell)}</small>`;
    canvas.appendChild(node);
  });

  const pills = [];
  diff.added_routes.forEach(route => pills.push(`<span class="diff-pill added">+ CONNECT ${route.source_cell} → ${route.target_cell}</span>`));
  diff.removed_routes.forEach(route => pills.push(`<span class="diff-pill removed">− DISCONNECT ${route.source_cell} → ${route.target_cell}</span>`));
  diff.moved_cells.forEach(cell => pills.push(`<span class="diff-pill moved">↔ MOVE ${cell.cell_id}</span>`));
  $("#diff-list").innerHTML = pills.join("") || "No semantic difference from promoted geometry.";
}

function renderHistory() {
  const records = state.proposal_history;
  $("#history").innerHTML = records.length ? records.map(record => `
    <div class="history-row"><b>#${record.proposal_seq}</b><span title="${record.proposal_id}">${record.proposal_id}</span><span class="state">${record.admission_outcome || record.disposition || "PROPOSED"}</span></div>
  `).join("") : "No proposals yet.";
}

function render() {
  $("#event").textContent = state.last_event;
  $("#proposal-status").textContent = state.proposal?.status || state.parse.status;
  $("#drc").textContent = state.candidate?.drc?.verdict || "—";
  $("#promoted-digest").textContent = state.promoted.canonical_digest;
  $("#runtime").textContent = state.runtime?.run_status || "NOT STARTED";
  $("#promoted-text").textContent = state.text_surfaces.PROMOTED;
  $("#candidate-text").textContent = state.text_surfaces.CANDIDATE || "No candidate. Promoted FabricSpec remains authoritative.";
  $("#explanation").textContent = state.proposal?.proposer_explanation || "The proposer may describe a change, but it cannot commit one.";
  const status = state.proposal?.status;
  $("#accept").disabled = status !== "PROPOSED";
  $("#modify").disabled = status !== "PROPOSED";
  $("#reject").disabled = !status;
  $("#submit").disabled = status !== "ACCEPTED_FOR_ADMISSION";
  $("#start").disabled = Boolean(state.proposal);
  $("#tick").disabled = Boolean(state.proposal) || !state.runtime;
  renderFabric();
  renderHistory();
}

async function action(path, body = {}) {
  try { state = await api(path, body); render(); } catch (error) { showError(error); }
}

$("#propose").addEventListener("click", () => action("/api/propose", {text: $("#intent").value}));
$("#reset").addEventListener("click", () => action("/api/reset"));
$("#accept").addEventListener("click", () => action("/api/disposition/accept"));
$("#reject").addEventListener("click", () => action("/api/disposition/reject"));
$("#submit").addEventListener("click", () => action("/api/admission/submit"));
$("#start").addEventListener("click", () => action("/api/runtime/start"));
$("#tick").addEventListener("click", () => action("/api/runtime/tick"));
$("#modify").addEventListener("click", () => action("/api/disposition/modify", {
  surface: "VISUAL",
  projection: {
    kind: "DRAG", cell_id: "health_low",
    from_location: {triad_position: {kind: "INTERIOR", dimension: "□S"}, containment_path: ["behavior", "behavior_block", "visible_fabric"]},
    to_location: {triad_position: {kind: "INTERIOR", dimension: "□F"}, containment_path: ["behavior", "behavior_block", "visible_fabric"]},
  },
}));

api("/api/state").then(payload => { state = payload; render(); }).catch(showError);
