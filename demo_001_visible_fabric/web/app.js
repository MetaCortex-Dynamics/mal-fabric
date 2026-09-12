const $ = (selector) => document.querySelector(selector);
let state = null;
let selectedRoute = null;
let wireSource = null;
let drag = null;

async function api(path, body = null) {
  const options = body === null ? {} : {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  };
  const response = await fetch(path, options);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.because || payload.error || "Request failed");
  }
  return payload;
}

function regionOf(cell) {
  const position = cell.location?.triad_position;
  return position?.kind === "INTERIOR" ? position.dimension : `□${position?.source || "S"}`;
}

function defaultPosition(cell, index, counts) {
  const region = regionOf(cell);
  const regionIndex = {"□G": 0, "□S": 1, "□F": 2}[region] ?? 1;
  const own = counts[region]++;
  const column = own % 2;
  const row = Math.floor(own / 2);
  return {x: regionIndex * 33.333 + 2.2 + column * 15.3, y: 62 + row * 111};
}

function candidateTouches(cellId) {
  if (!state.candidate) return false;
  return state.candidate.edits.some(edit =>
    edit.cell_id === cellId || edit.source_cell === cellId || edit.target_cell === cellId
  );
}

function renderCells() {
  const holder = $("#cells");
  holder.innerHTML = "";
  const counts = {"□G": 0, "□S": 0, "□F": 0};
  const phases = state.runtime?.phases || {};
  state.visible.cells.forEach((cell, index) => {
    const fallback = defaultPosition(cell, index, counts);
    const saved = state.presentation[cell.cell_id];
    const position = saved ? {x: saved.x, y: saved.y} : fallback;
    const node = document.createElement("div");
    node.className = `cell${candidateTouches(cell.cell_id) ? " candidate" : ""}`;
    node.dataset.cellId = cell.cell_id;
    node.dataset.phase = phases[cell.cell_id] || "EMPTY";
    node.dataset.region = regionOf(cell);
    node.style.left = `${position.x}%`;
    node.style.top = `${position.y}px`;
    const inputs = cell.ports.filter(port => port.direction === "IN");
    const output = cell.ports.find(port => port.direction === "OUT");
    node.innerHTML = `
      <div class="cell-phase"></div>
      <div class="cell-title">${cell.operator} × ${cell.witness}</div>
      <div class="cell-type">${cell.cell_id} · ${node.dataset.phase}</div>
      <div class="ports">
        ${inputs.map(port => `<span class="port in" data-role="${port.role}" data-direction="IN" title="${port.payload_type}"><i class="port-dot"></i>${port.role}</span>`).join("")}
        <span class="port out" data-role="${output.role}" data-direction="OUT" title="${output.payload_type}">${output.role}<i class="port-dot"></i></span>
      </div>`;
    node.addEventListener("pointerdown", beginDrag);
    node.querySelectorAll(".port").forEach(port => port.addEventListener("pointerdown", event => event.stopPropagation()));
    node.querySelectorAll(".port").forEach(port => port.addEventListener("click", choosePort));
    holder.appendChild(node);
  });
  requestAnimationFrame(renderRoutes);
}

function portPoint(cellId, direction, role) {
  const cell = document.querySelector(`.cell[data-cell-id="${cellId}"]`);
  const canvas = $("#fabric-canvas").getBoundingClientRect();
  const port = cell?.querySelector(`.port[data-direction="${direction}"][data-role="${role}"] .port-dot`);
  if (!port) return {x: 0, y: 0};
  const box = port.getBoundingClientRect();
  return {x: box.left + box.width / 2 - canvas.left, y: box.top + box.height / 2 - canvas.top};
}

function renderRoutes() {
  const svg = $("#routes");
  const canvas = $("#fabric-canvas").getBoundingClientRect();
  svg.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);
  svg.innerHTML = "";
  const candidateConnections = new Set((state.candidate?.edits || [])
    .filter(edit => edit.kind === "CONNECT")
    .map(edit => `${edit.source_cell}|${edit.target_cell}|${edit.target_role}`));
  state.visible.routes.forEach(route => {
    const a = portPoint(route.source_cell, "OUT", route.source_role);
    const b = portPoint(route.target_cell, "IN", route.target_role);
    const bend = Math.max(32, Math.abs(b.x - a.x) * .45);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${a.x} ${a.y} C ${a.x + bend} ${a.y}, ${b.x - bend} ${b.y}, ${b.x} ${b.y}`);
    path.setAttribute("class", `route${candidateConnections.has(`${route.source_cell}|${route.target_cell}|${route.target_role}`) ? " candidate" : ""}${selectedRoute === route.route_id ? " selected" : ""}`);
    path.dataset.routeId = route.route_id;
    path.addEventListener("click", () => { selectedRoute = route.route_id; $("#disconnect").disabled = false; renderRoutes(); });
    svg.appendChild(path);
  });
}

function beginDrag(event) {
  if (event.button !== 0) return;
  const cell = event.currentTarget;
  const canvas = $("#fabric-canvas").getBoundingClientRect();
  const box = cell.getBoundingClientRect();
  drag = {cell, startRegion: cell.dataset.region, dx: event.clientX - box.left, dy: event.clientY - box.top, canvas};
  cell.setPointerCapture(event.pointerId);
  cell.addEventListener("pointermove", moveDrag);
  cell.addEventListener("pointerup", endDrag, {once: true});
}

function moveDrag(event) {
  if (!drag) return;
  const left = Math.max(0, Math.min(drag.canvas.width - drag.cell.offsetWidth, event.clientX - drag.canvas.left - drag.dx));
  const top = Math.max(45, Math.min(drag.canvas.height - drag.cell.offsetHeight, event.clientY - drag.canvas.top - drag.dy));
  drag.cell.style.left = `${left}px`;
  drag.cell.style.top = `${top}px`;
  renderRoutes();
}

async function endDrag(event) {
  if (!drag) return;
  drag.cell.removeEventListener("pointermove", moveDrag);
  const left = parseFloat(drag.cell.style.left);
  const xPercent = left / drag.canvas.width * 100;
  const y = parseFloat(drag.cell.style.top);
  const region = ["□G", "□S", "□F"][Math.max(0, Math.min(2, Math.floor(xPercent / 33.333)))];
  const cellId = drag.cell.dataset.cellId;
  const startRegion = drag.startRegion;
  drag = null;
  try {
    if (region === startRegion) {
      const response = await api("/api/presentation", {cell_id: cellId, x: xPercent, y});
      state = response.state;
    } else {
      state = await api("/api/edit", {surface: "VISUAL", projection: {
        kind: "DRAG", cell_id: cellId,
        from_location: semanticLocation(startRegion), to_location: semanticLocation(region)
      }});
    }
    render();
  } catch (error) { showError(error); await refresh(); }
}

function semanticLocation(region) {
  return {triad_position: {kind: "INTERIOR", dimension: region}, containment_path: ["behavior", "behavior_block", "visible_fabric"]};
}

async function choosePort(event) {
  const port = event.currentTarget;
  const cellId = port.closest(".cell").dataset.cellId;
  if (port.dataset.direction === "OUT") {
    wireSource = {source_cell: cellId, source_role: port.dataset.role};
    $("#tool-help").textContent = `Source selected: ${cellId}.${port.dataset.role}. Choose an input port.`;
    return;
  }
  if (!wireSource) return;
  try {
    state = await api("/api/edit", {surface: "VISUAL", projection: {
      kind: "WIRE", ...wireSource, target_cell: cellId, target_role: port.dataset.role
    }});
    wireSource = null;
    render();
  } catch (error) { showError(error); }
}

function render() {
  $("#digest").textContent = `FabricSpec ${state.committed_digest.slice(0, 16)}…`;
  $("#canonical").textContent = state.visible.canonical_json;
  $("#behavior").textContent = state.behavior.description || "no admitted action relation";
  $("#event").textContent = state.last_event;
  $("#drc").textContent = state.visible.drc.verdict + (state.visible.drc.reason_code ? ` · ${state.visible.drc.reason_code}` : "");
  $("#admission").textContent = state.candidate ? state.candidate.state : "NO CANDIDATE";
  $("#run-status").textContent = state.runtime?.run_status || "NOT STARTED";
  const evidence = state.runtime?.blocked_reasons?.length
    ? {blocked_reasons: state.runtime.blocked_reasons}
    : state.runtime?.last_evidence || state.candidate?.admissions || {message: "Waiting for a governed action."};
  $("#evidence").textContent = JSON.stringify(evidence, null, 2);
  const actions = $("#candidate-actions");
  actions.classList.toggle("hidden", !state.candidate);
  if (state.candidate) {
    const badge = $("#candidate-badge");
    badge.textContent = state.candidate.state;
    badge.className = `badge ${state.candidate.state.toLowerCase()}`;
    $("#candidate-copy").textContent = `${state.candidate.edits.length} canonical edit${state.candidate.edits.length === 1 ? "" : "s"} · execution authority ${state.candidate.execution_authority}`;
    $("#accept").disabled = !state.candidate.authorized;
  }
  renderCells();
}

function showError(error) {
  $("#evidence").textContent = `FAIL CLOSED\n${error.message}`;
}

async function refresh() { state = await api("/api/state"); render(); }
async function action(path, body = {}) { try { state = await api(path, body); render(); } catch (error) { showError(error); } }

$("#propose").addEventListener("click", () => action("/api/propose", {prompt: $("#prompt").value}));
$("#accept").addEventListener("click", () => action("/api/candidate/accept"));
$("#reject").addEventListener("click", () => action("/api/candidate/reject"));
$("#reset").addEventListener("click", () => action("/api/reset"));
$("#start").addEventListener("click", () => action("/api/runtime/start"));
$("#tick").addEventListener("click", () => action("/api/runtime/tick"));
$("#run").addEventListener("click", () => action("/api/runtime/run", {max_steps: 12}));
$("#blocked").addEventListener("click", () => action("/api/runtime/blocked"));
$("#halted").addEventListener("click", () => action("/api/runtime/halted"));
$("#apply-text").addEventListener("click", () => {
  try { action("/api/edit", {surface: "TEXT", projection: JSON.parse($("#text-edit").value)}); }
  catch (error) { showError(error); }
});
$("#disconnect").addEventListener("click", async () => {
  if (!selectedRoute) return;
  await action("/api/edit", {surface: "VISUAL", projection: {kind: "DELETE_ROUTE", route_id: selectedRoute}});
  selectedRoute = null;
});
window.addEventListener("resize", renderRoutes);
refresh().catch(showError);
