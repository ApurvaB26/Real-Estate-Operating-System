/**
 * File: js/features/dashboard.js
 * Role: Dashboard: urgent tasks and project deliverables tables.
 * Dependencies: Loaded by index.html as script 27 of 80. Uses globals from js/core/utils.js, js/features/profile.js, js/core/icons.js. Its globals are used by js/features/assistant.js, js/features/open-items.js, js/features/project/workspace.js, js/features/task-dialog.js, js/features/task-drawer.js, js/main.js.
 */

const dashboardTasksBody = document.querySelector("#tasks-table tbody");

const taskCount = document.querySelector("#tasks-table").closest(".panel").querySelector(".panel-count");

function updateTaskCount() {
  const taskCheckboxes = Array.from(dashboardTasksBody.querySelectorAll(".task-checkbox"));
  const completed = taskCheckboxes.filter((checkbox) => checkbox.checked).length;
  taskCount.textContent = `${completed}/${taskCheckboxes.length}`;
}

dashboardTasksBody.addEventListener("change", (event) => {
  const checkbox = event.target.closest(".task-checkbox");
  if (!checkbox) return;
  checkbox.closest("tr").classList.toggle("done", checkbox.checked);
  updateTaskCount();
});

/* DELIVERABLES */
const deliverablesBody = document.querySelector("#deliverables-table tbody");

const deliverablesCount = document.querySelector("#dashboard-deliverables-panel .panel-count");

function updateDeliverablesCount() {
  // Rows of other projects are hidden by the dashboard project filter and must not count
  const checks = Array.from(deliverablesBody.querySelectorAll("tr:not(.dash-out) .task-checkbox"));
  const done = checks.filter((c) => c.checked).length;
  deliverablesCount.textContent = `${done}/${checks.length}`;
}

deliverablesBody.addEventListener("change", (e) => {
  const check = e.target.closest(".task-checkbox");
  if (!check) return;
  check.closest("tr").classList.toggle("done", check.checked);
  updateDeliverablesCount();
});

/* DASHBOARD + OPEN ITEMS: new tasks */
// Next id is the highest existing number + 1; 17 is the floor because the seeded demo rows already use up to T-17
function nextTaskId(ids) {
  return `T-${Math.max(17, ...ids.map((id) => Number(String(id).replace(/\D/g, "")) || 0)) + 1}`;
}

function addDashboardTask(task) {
  const due = dueInfo(task.targetDate);
  const priority = task.priority.toLowerCase();
  const row = document.createElement("tr");
  row.dataset.taskStatus = "Not Started";
  row.dataset.priority = priority;
  row.dataset.targetDate = task.targetDate;
  row.dataset.description = task.description;
  row.dataset.discipline = task.discipline;
  row.innerHTML = `
    <td><label class="custom-checkbox"><input class="task-checkbox" type="checkbox" aria-label="Complete ${escapeHtml(task.title)}"><span class="checkbox-box"></span></label></td>
    <td>${nextTaskId(Array.from(dashboardTasksBody.rows, (r) => r.cells[1].textContent))}</td>
    <td><strong>${escapeHtml(task.title)}</strong><span class="badge ${priority}">${escapeHtml(task.priority)}</span><span class="row-subtitle">${escapeHtml(task.discipline)}</span></td>
    <td class="cell-project">General</td>
    <td><span class="task-state not-started">Not Started</span></td>
    <td><span class="status ${due.cls}">${due.label}</span></td>
    <td>${escapeHtml(profileState.name)}</td>
    <td><button class="comment-btn" type="button">${icon("comment", 14)}Comment</button></td>`;
  // New tasks go to the top so the user sees what they just added
  dashboardTasksBody.prepend(row);
  updateTaskCount();
}

/* DASHBOARD DELIVERABLES: new rows */
function addDashboardDeliverable(values) {
  const due = dueInfo(values.due);
  const priority = values.priority.toLowerCase();
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><label class="custom-checkbox"><input class="task-checkbox" type="checkbox" aria-label="Complete ${escapeHtml(values.title)}"><span class="checkbox-box"></span></label></td>
    <td><strong>${escapeHtml(values.title)}</strong><span class="badge ${priority}">${escapeHtml(values.priority)}</span></td>
    <td>${escapeHtml(values.project)}</td>
    <td><span class="task-state not-started">Not Started</span></td>
    <td><span class="status ${due.cls}">${due.label}</span></td>
    <td></td>`;
  deliverablesBody.prepend(row);
  // The new row may belong to a project the filter is hiding
  renderDashboardScope();
}
