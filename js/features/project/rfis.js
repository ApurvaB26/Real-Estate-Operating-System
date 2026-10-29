/**
 * File: js/features/project/rfis.js
 * Role: Project RFIs tab.
 * Dependencies: Loaded by index.html as script 35 of 80. Uses globals from js/components/layers.js, js/core/utils.js, js/data/rfis.js, js/core/icons.js. Its globals are used by js/features/record-drawer.js, js/features/row-actions.js, js/main.js.
 */

const rfiList = document.getElementById("project-rfi-list");

const rfiSearch = document.getElementById("project-rfi-search");

const rfiDisciplineFilter = document.getElementById("rfi-discipline-filter");

const rfiFilterBtn = document.getElementById("rfi-filter-btn");

const rfiFilterMenu = document.getElementById("rfi-advanced-filters");

let rfiStatusFilter = "all";

// Keys of groups the user collapsed; kept outside render so collapsing survives re-filtering
const rfiCollapsed = new Set();

const rfiClipIcon =
  icon("paperclip", 12);

const rfiSendIcon = "send-plane";

const rfiEyeIcon = "eye-view";

function rfiMatches(r) {
  const q = rfiSearch.value.trim().toLocaleLowerCase();
  const statusOk = rfiStatusFilter === "all" || r.status === rfiStatusFilter;
  const disciplineOk = rfiDisciplineFilter.value === "all" || r.discipline === rfiDisciplineFilter.value;
  const text = `${r.id} ${r.query} ${r.discipline} ${r.by} ${r.wing}`.toLocaleLowerCase();
  return statusOk && disciplineOk && text.includes(q);
}

function rfiRowHtml(r) {
  const done = r.status === "completed";
  const sub = done ? "" : `<span class="row-subtitle">Received ${r.received} · ${rfiClipIcon} ${r.files} files</span>`;
  const blocking = r.blocking ? '<span class="badge blocking">Blocking</span>' : "";
  // The button label doubles as the row action key (view/respond) handled by row-actions.js
  const action = done ? { label: "View", icon: rfiEyeIcon } : { label: "Respond", icon: rfiSendIcon };

  return `
    <tr class="project-task-row${done ? " done" : ""}" data-rfi-index="${rfiData.indexOf(r)}">
      <td>${r.id}</td>
      <td><strong>${escapeHtml(r.query)}</strong>${blocking}${sub}</td>
      <td>${r.wing}</td>
      <td>${r.impact}</td>
      <td>${r.discipline}</td>
      <td>${r.by}</td>
      <td><button class="comment-btn" type="button" data-row-action="${action.label.toLowerCase()}">${icon(action.icon, 14)}${action.label}</button></td>
    </tr>`;
}

function renderRfis() {
  const html = rfiGroups
    .map((g) => {
      const rows = rfiData.filter((r) => g.statuses.includes(r.status) && rfiMatches(r));
      // Hide empty groups so filters do not leave bare headings
      if (!rows.length) return "";
      const open = !rfiCollapsed.has(g.key);
      return `
      <tr class="project-task-group-row"><th colspan="7">
        <button class="task-group-toggle" type="button" data-rfi-toggle="${g.key}" aria-expanded="${open}"><span class="task-group-chevron" aria-hidden="true"></span><span>${g.label}</span><span class="task-group-count ${g.tone}">${String(rows.length).padStart(2, "0")}</span></button>
      </th></tr>
      ${open ? rows.map(rfiRowHtml).join("") : ""}`;
    })
    .join("");

  rfiList.innerHTML =
    html || '<tr><td colspan="7" class="drawer-empty" style="padding:24px">No RFIs match these filters.</td></tr>';
}

document.querySelectorAll("[data-rfi-status]").forEach((chip) => {
  chip.addEventListener("click", () => {
    rfiStatusFilter = chip.dataset.rfiStatus;
    document.querySelectorAll("[data-rfi-status]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderRfis();
  });
});

rfiSearch.addEventListener("input", renderRfis);

rfiDisciplineFilter.addEventListener("change", renderRfis);

rfiFilterBtn.addEventListener("click", () => {
  const expanded = rfiFilterBtn.getAttribute("aria-expanded") === "true";
  rfiFilterBtn.setAttribute("aria-expanded", String(!expanded));
  rfiFilterMenu.hidden = expanded;
});

rfiList.addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-rfi-toggle]");
  if (!toggle) return;
  const key = toggle.dataset.rfiToggle;
  if (rfiCollapsed.has(key)) rfiCollapsed.delete(key);
  else rfiCollapsed.add(key);
  renderRfis();
});
