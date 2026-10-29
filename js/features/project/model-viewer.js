/**
 * File: js/features/project/model-viewer.js
 * Role: Project context bar, 3D model card with expand, and the Architectural Inputs scan flow.
 * Dependencies: Loaded by index.html as script 74 of 80. Uses globals from js/components/layers.js, js/core/utils.js, js/features/project/deliverable-source.js, js/features/project/workspace.js, js/features/reminder-log.js, js/core/icons.js. Its globals are used by js/components/layers.js.
 */

/* ---------- project pages: context bar, 3D model card, Architectural Inputs ---------- */
// Per-project 3D model files; projects without an entry show the empty state with an upload hint
const MODEL = {}; // Real project models are not included in this public demo
const ctx = document.createElement("div");
ctx.className = "cx-context"; ctx.hidden = true;
$(".project-nav-bar", ov).before(ctx);
const m3 = document.createElement("section");
m3.className = "m3d-card"; m3.id = "m3d-card"; m3.setAttribute("aria-label", "3D model");
$(".project-nav-bar", ov).after(m3);
let m3Key = null;
const archBtn = document.createElement("button");
archBtn.className = "cx-arch-btn"; archBtn.type = "button"; archBtn.dataset.archInputs = "1";
archBtn.innerHTML = `${icon("layers", 16)} Architectural Inputs <b>6</b>`;
$(".project-header-buttons", ov).prepend(archBtn);

function toggleExpand() {
  const on = m3.classList.toggle("is-expanded");
  document.body.classList.toggle("cx-noscroll", on);
  const b = $("[data-m3-expand]", m3); if (b) b.innerHTML = on ? `${icon("x", 16)} Close` : `${icon("expand", 16)} Expand`;
}
function modelSrc(key) {
  const el = document.getElementById("m-" + key); if (!el) return "";
  return el.textContent.replace(/<\\\/script/g, "<\/script").replace(/<\\!--/g, "<\x21--");
}
function refresh3d(name, viewName) {
  const show = viewName === "overview";
  m3.hidden = !show; ctx.hidden = show;
  const proj = name;
  ctx.innerHTML = `<strong>${h(proj)}</strong><span class="cx-ctx-state">${h($(".project-status", ov).textContent.trim())}</span><span class="cx-grow"></span><button class="cx-btn" type="button" data-arch-inputs="1">${icon("layers", 16)} Architectural Inputs (6)</button>${viewName === "deliverables" ? `<button class="cx-primary" type="button" data-project-action="add-deliverable">${icon("plus", 16)} Add Deliverable</button>` : ""}`;
  if (!show) return;
  const spec = MODEL[proj];
  const key = spec ? spec.key : "none:" + proj;
  if (m3Key === key) return;
  m3Key = key;
  if (!spec) {
    m3.innerHTML = `<header class="m3d-head"><h2>${icon("cube", 18)} 3D model</h2></header><div class="m3d-empty">${icon("cube", 28)}<div><strong>No 3D model uploaded for ${h(proj)} yet.</strong><p>Each building gets its own model. Upload one from the project menu and it appears here.</p></div></div>`;
    return;
  }
  m3.innerHTML = `<header class="m3d-head"><h2>${icon("cube", 18)} 3D model</h2><div class="cx-chips" id="m3-bld">${spec.buildings.map((b, i) => `<button class="cx-chip${i === 0 ? " is-on" : ""}" type="button" data-m3-bld="${i}">${h(b)}</button>`).join("")}</div><button class="cx-btn" type="button" data-m3-expand>${icon("expand", 16)} Expand</button></header><div class="m3d-stage" id="m3-stage"></div>`;
  const f = document.createElement("iframe");
  f.title = `3D model of ${proj}`; f.setAttribute("sandbox", "allow-scripts allow-same-origin"); f.src = spec.file;
  $("#m3-stage", m3).append(f);
}
m3.addEventListener("click", (e) => {
  if (e.target.closest("[data-m3-expand]")) toggleExpand();
  const b = e.target.closest("[data-m3-bld]");
  if (b) { $$("#m3-bld .cx-chip").forEach((c) => c.classList.toggle("is-on", c === b)); showToast(b.dataset.m3Bld === "0" ? "Showing this building." : "No model uploaded for this building yet."); }
});
// Wrap the workspace tab switcher so the 3D card and Reminders refresh whenever the tab changes
const _setProjectView = setProjectView;
setProjectView = function (viewName) { _setProjectView(viewName); if (viewName === "reminders") renderReminders(); refresh3d($(".project-title", ov).textContent, viewName); };
document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-arch-inputs]")) return;
  const rows = [["Tower A", [["Architect", "Core & shaft plan L1–L12", "v3", "18 Oct 2026"], ["Structure", "Beam layout L5–L10", "v2", "12 Oct 2026"], ["Architect", "Ceiling height schedule", "v1", "05 Oct 2026"]]],
    ["Tower B", [["Architect", "Core & shaft plan L1–L12", "v2", "14 Oct 2026"], ["Structure", "Slab openings", "v1", "09 Oct 2026"]]], ["Podium", [["Landscape", "Podium drainage zones", "v1", "02 Oct 2026"]]]];
  drawer("Architectural Inputs", `<p class="cx-muted">Grouped by building. Open a section to see versions, sources and received dates.</p>${rows.map(([b, items], i) => `<details class="cx-acc"${i === 0 ? " open" : ""}><summary>${b} <span class="cx-count">${items.length}</span></summary>${items.map((x) => `<div class="cx-person"><div class="cx-grow"><strong>${x[1]}</strong><small>${x[0]} · ${x[2]} · received ${x[3]}</small></div><button class="cx-btn" type="button" data-cx-toast="Opened ${h(x[1])}">${icon("eye", 16)} View</button></div>`).join("")}</details>`).join("")}<button class="cx-btn" type="button" data-cx-toast="Full page view opens here">${icon("expand", 16)} Open full view</button>`);
});
document.addEventListener("click", (e) => { const t = e.target.closest("[data-cx-toast]"); if (t) showToast(t.dataset.cxToast); });
