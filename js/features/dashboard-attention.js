/**
 * File: js/features/dashboard-attention.js
 * Role: Dashboard project filter: scopes the greeting line, the RFI table and the deliverables table to one project.
 * Dependencies: Loaded by index.html as script 58 of 80. Uses globals from js/data/attention-projects.js. Nothing else calls into it; it wires itself up on load.
 */

/* DASHBOARD: GREETING SUMMARY
   Only projects that are overdue, due today or tomorrow count as needing you. */

let attentionFilter = "";

const attentionScope = () => attentionProjects.filter((p) => !attentionFilter || p.name === attentionFilter);

function attentionStats(p) {
  const items = p.items;
  const overdue = items.filter((i) => i.due < 0).length;
  const today = items.filter((i) => i.due === 0).length;
  const tomorrow = items.filter((i) => i.due === 1).length;
  return { overdue, today, tomorrow, status: overdue ? "delayed" : today || tomorrow ? "at-risk" : "" };
}

function attentionNeeds() {
  const scope = attentionScope();
  const needs = scope
    .map((p) => ({ p, s: attentionStats(p) }))
    .filter(({ s }) => s.status)
    .sort((a, b) => b.s.overdue - a.s.overdue || b.s.today - a.s.today || b.s.tomorrow - a.s.tomorrow);
  return { scope, needs };
}

// Greeting line names the real numbers behind the project filter
function updateGreetingSummary() {
  const el = document.getElementById("greeting-summary");
  if (!el) return;
  const { scope, needs } = attentionNeeds();
  if (!needs.length) {
    el.textContent = "Nothing is overdue or due soon. You are all caught up.";
    return;
  }
  const sum = (key) => needs.reduce((total, { s }) => total + s[key], 0);
  const parts = [
    [sum("overdue"), "overdue", "greeting-overdue"],
    [sum("today"), "due today", "greeting-today"],
    [sum("tomorrow"), "due tomorrow", "greeting-today"]
  ]
    .filter(([n]) => n)
    .map(([n, label, cls]) => `<strong class="${cls}">${n} ${label}</strong>`);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
  el.innerHTML = `Across ${scope.length} ${scope.length === 1 ? "project" : "projects"}, ${needs.length} ${needs.length === 1 ? "project needs" : "projects need"} you with ${list}.`;
}

const dashProjectFilter = document.getElementById("dash-project-filter");

attentionProjects.forEach((p) => dashProjectFilter.add(new Option(p.name, p.name)));

// Dashboard tables with a data-project-col attribute hold the project name in that column ("Skyline One • Tower B")
// A row is in scope when its project name starts the chosen project's name, so "Lakeshore • Phase 2" matches "Lakeshore Phase 2"
function dashRowInScope(row, column) {
  if (!attentionFilter) return true;
  const cell = row.cells[column];
  const name = cell ? cell.textContent.split("•")[0].trim() : "";
  return name !== "" && attentionFilter.startsWith(name);
}

// One place applies the filter to every dashboard section; sections that add or remove rows call it again afterwards
function renderDashboardScope() {
  document.querySelectorAll("#dashboard-view table[data-project-col]").forEach((table) => {
    const column = Number(table.dataset.projectCol);
    const rows = [...table.tBodies[0].rows];
    rows.forEach((row) => row.classList.toggle("dash-out", !dashRowInScope(row, column)));
    let empty = table.nextElementSibling;
    if (!empty || !empty.classList.contains("dash-empty")) {
      empty = document.createElement("p");
      empty.className = "dash-empty";
      table.after(empty);
    }
    empty.textContent = table.dataset.empty;
    empty.hidden = rows.some((row) => !row.classList.contains("dash-out"));
  });
  document.getElementById("dashboard-rfi-count").textContent =
    `${document.querySelectorAll("#rfiTable tbody tr:not(.dash-out)").length} Pending`;
  updateDeliverablesCount();
}

dashProjectFilter.addEventListener("change", () => {
  attentionFilter = dashProjectFilter.value;
  updateGreetingSummary();
  renderDashboardScope();
});

updateGreetingSummary();
renderDashboardScope();
