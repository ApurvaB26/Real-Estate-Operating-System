/**
 * File: js/features/reminder-log.js
 * Role: Reminder Log page and project Reminders tab with filters.
 * Dependencies: Loaded by index.html as script 72 of 80. Uses globals from js/components/layers.js, js/core/utils.js, js/data/reminder-rows.js, js/features/project/workspace.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/features/extra-routes.js, js/features/project/model-viewer.js.
 */

const remState = { project: "All", type: "All", q: "" };
function remHtml(scope) {
  const rows = remRows.filter((r) => (scope ? r[2] === scope : remState.project === "All" || r[2] === remState.project) && (remState.type === "All" || r[3] === remState.type) && r[1].toLowerCase().includes(remState.q.toLowerCase()));
  const types = ["All", ...new Set(remRows.map((r) => r[3]))], projects = ["All", ...new Set(remRows.map((r) => r[2]))];
  return `<div class="project-task-toolbar cx-rem-filters"><label>Date range<select><option>Last 30 days</option><option>Last 7 days</option></select></label>
    ${scope ? "" : `<label>Project<select data-rem="project">${projects.map((p) => `<option${remState.project === p ? " selected" : ""}>${h(p)}</option>`).join("")}</select></label>`}
    <label>Type<select data-rem="type">${types.map((p) => `<option${remState.type === p ? " selected" : ""}>${h(p)}</option>`).join("")}</select></label>
    <label>Recipient<input type="search" data-rem="q" placeholder="Search name" value="${h(remState.q)}"></label>
    <button class="project-task-add cx-export" type="button" data-rem-export>${icon("download-arrow", 14)} Export CSV (${rows.length})</button></div>
    <div class="project-task-table-scroll"><table class="data-table project-task-table oi-table"><thead><tr><th>Timestamp</th><th data-hf="remind-recipient">Recipient</th><th data-hf="remind-project">Project</th><th data-hf="remind-type">Type</th><th data-hf="remind-status">Status</th><th data-hf="remind-by">Sent by</th></tr></thead><tbody>
    ${rows.map((r) => `<tr class="project-task-row"><td>${r[0]}</td><td>${h(r[1])}</td><td>${h(r[2])}</td><td>${r[3]}</td><td><span class="task-state ${r[4] === "Sent" ? "completed" : "delayed"}">${r[4]}</span></td><td>${h(r[5])}</td></tr>`).join("") || '<tr><td colspan="6" class="drawer-empty">No reminders match these filters.</td></tr>'}</tbody></table></div>
    <p class="cx-muted">Showing ${rows.length} of ${remRows.length}. Read-only audit log. The export uses the filters above.</p>`;
}
const remPage = document.createElement("section");
remPage.className = "page-view cx-page"; remPage.id = "reminders-view"; remPage.hidden = true; remPage.setAttribute("aria-label", "Reminder Log");
mainContent2.append(remPage);
const remProject = document.createElement("section");
remProject.className = "project-tasks-view cx-page"; remProject.id = "project-reminders-view"; remProject.hidden = true; remProject.setAttribute("aria-label", "Project reminders");
// Project-level Reminders view is a sibling of the other project sub-views, placed after Team
$("#project-team-view").after(remProject);
function renderReminders() {
  remPage.innerHTML = `${pageIntro("Reminder Log", "Every reminder sent to stakeholders, by the system or by a person. You see reminders for your own projects.")}<div id="rem-body">${remHtml(null)}</div>`;
  remProject.innerHTML = `<div id="rem-proj">${remHtml($(".project-title", ov).textContent)}</div>`;
}
function remEvents(e) {
  const t = e.target;
  if (t.dataset?.rem) { remState[t.dataset.rem] = t.value; const pos = t.selectionStart; renderReminders(); const i = document.querySelector(`#${t.closest("#rem-proj") ? "rem-proj" : "rem-body"} [data-rem="${t.dataset.rem}"]`); if (t.dataset.rem === "q" && i) { i.focus(); i.setSelectionRange(pos, pos); } }
  if (t.closest?.("[data-rem-export]") && e.type === "click") showToast("Export CSV downloads the filtered rows in the live app. Downloads are switched off in this preview.");
}
remPage.addEventListener("input", remEvents); remPage.addEventListener("change", remEvents); remPage.addEventListener("click", remEvents);
remProject.addEventListener("input", remEvents); remProject.addEventListener("change", remEvents); remProject.addEventListener("click", remEvents);
const tab = document.createElement("button");
tab.className = "project-nav-tab"; tab.type = "button"; tab.dataset.projectView = "reminders";
tab.innerHTML = `${icon("bell", 16)}<span>Reminders</span>`;
$('[data-project-view="team"]', ov).after(tab);
// Plug the new tab into the project workspace's sub-view tables
projectSubViews.reminders = remProject; projectViewLabels.reminders = "Reminders";
