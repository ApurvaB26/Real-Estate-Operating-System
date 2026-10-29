/**
 * File: js/components/layers.js
 * Role: Opens and closes the shared drawer and modal layers and wires Escape and scrim clicks to close them.
 * Dependencies: Loaded by index.html as script 67 of 80. Uses globals from js/features/project/model-viewer.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/components/date-picker.js, js/components/select.js, js/features/meetings/meeting-requests.js, js/features/meetings/meetings-page.js, js/features/people-directory.js, js/features/project/model-viewer.js and 10 more.
 */

/* ---------- layers ---------- */
function closeLayer() { $$(".cx-layer").forEach((l) => l.remove()); }
function drawer(title, html, cls = "") {
  closeLayer();
  const d = document.createElement("div");
  d.className = "cx-layer";
  d.innerHTML = `<div class="cx-scrim" data-cx-close></div><aside class="cx-drawer ${cls}" role="dialog" aria-modal="true" aria-label="${h(title)}"><header><h2>${h(title)}</h2><button class="drawer-close" type="button" aria-label="Close drawer" data-cx-close>${icon("close", 16)}</button></header><div class="cx-body">${html}</div></aside>`;
  document.body.append(d);
  // Move focus into the drawer (the close button, not the scrim) so keyboard users land inside the dialog
  d.querySelector("[data-cx-close]:not(.cx-scrim)")?.focus();
  return d;
}
function modal(title, html) {
  closeLayer();
  const d = document.createElement("div");
  d.className = "cx-layer cx-center";
  d.innerHTML = `<div class="cx-scrim" data-cx-close></div><section class="cx-modal" role="dialog" aria-modal="true" aria-label="${h(title)}"><header><h2>${h(title)}</h2><button class="drawer-close" type="button" aria-label="Close dialog" data-cx-close>${icon("close", 16)}</button></header><div class="cx-body">${html}</div></section>`;
  document.body.append(d);
  return d;
}
document.addEventListener("click", (e) => { if (e.target.closest("[data-cx-close]")) closeLayer(); });
document.addEventListener("keydown", (e) => {
  // Escape closes the expanded 3D card first, then any open drawer or modal
  if (e.key !== "Escape") return;
  const card = $(".m3d-card.is-expanded");
  if (card) { toggleExpand(); return; }
  closeLayer();
});
