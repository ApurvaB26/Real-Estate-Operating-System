/**
 * File: js/features/project/brief.js
 * Role: Project Overview > Project Brief card.
 * Dependencies: Loaded by index.html as script 60 of 80. Uses globals from js/core/utils.js, js/data/project-brief.js. Nothing else calls into it; it wires itself up on load.
 */

/* PROJECT OVERVIEW: PROJECT BRIEF
   One compact panel that works for any number of buildings. Apartments are left out on purpose; floors and MEP parameters lead. */

let briefSelected = "all";


function renderProjectBrief() {
  const selector = document.getElementById("brief-selector");
  const body = document.getElementById("brief-body");
  if (!selector || !body) return;
  const buildings = projectBrief.buildings;
  document.getElementById("brief-summary").textContent =
    `${projectBrief.typology} · ${buildings.length} ${buildings.length === 1 ? "building" : "buildings"}`;

  // Chips for a handful of buildings; a dropdown once they would crowd the panel
  const options = [["all", "All buildings"], ...buildings.map((b) => [b.name, b.name])];
  selector.innerHTML =
    buildings.length > 6
      ? `<label class="visually-hidden" for="brief-select">Building</label><select id="brief-select" class="brief-select">${options.map(([v, l]) => `<option value="${escapeHtml(v)}"${briefSelected === v ? " selected" : ""}>${escapeHtml(l)}</option>`).join("")}</select>`
      : options
          .map(
            ([v, l]) =>
              `<button class="task-priority-filter${briefSelected === v ? " is-active" : ""}" type="button" data-brief-building="${escapeHtml(v)}" aria-pressed="${briefSelected === v}">${escapeHtml(l)}</button>`
          )
          .join("");

  const picked = buildings.find((b) => b.name === briefSelected);
  if (!picked) {
    body.innerHTML = `
      <div class="brief-table-wrap"><table class="brief-table">
        <thead><tr><th scope="col">Building</th><th scope="col">Floors</th>${briefServices.map(([, label]) => `<th scope="col">${label}</th>`).join("")}</tr></thead>
        <tbody>${buildings.map((b) => `<tr><th scope="row">${escapeHtml(b.name)}</th><td>${escapeHtml(b.floors)}</td>${briefServices.map(([key]) => `<td>${escapeHtml(b[key])}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></div>`;
    return;
  }
  body.innerHTML = `
    <div class="brief-tiles">
      <div class="brief-tile brief-floors"><span>Floors</span><strong>${escapeHtml(picked.floors)}</strong></div>
      ${briefServices.map(([key, label]) => `<div class="brief-tile"><span>${label}</span><strong>${escapeHtml(picked[key])}</strong></div>`).join("")}
    </div>`;
}

document.getElementById("brief-selector").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-brief-building]");
  if (!chip) return;
  briefSelected = chip.dataset.briefBuilding;
  renderProjectBrief();
});

document.getElementById("brief-selector").addEventListener("change", (e) => {
  if (e.target.id !== "brief-select") return;
  briefSelected = e.target.value;
  renderProjectBrief();
});

renderProjectBrief();
