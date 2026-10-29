/**
 * File: js/features/task-board.js
 * Role: Task Board page with All/Mine/Today/Overdue filters and search.
 * Dependencies: Loaded by index.html as script 71 of 80. Uses globals from js/components/layers.js, js/data/task-rows.js, js/features/profile.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/features/extra-routes.js.
 */

// Read the name when asked, not at load, so the Mine filter follows profile edits
const mineName = () => profileState.name;
function taskBoardHtml(f = "all", q = "") {
  const rows = taskRows.filter((r) => (f === "all" || (f === "mine" && r[2] === mineName()) || (f === "today" && r[3] === "Today") || (f === "over" && /overdue/.test(r[3])) || (f === "mom" && r[5] === "MOM")) && r.join(" ").toLowerCase().includes(q.toLowerCase()));
  return `<div class="project-task-toolbar"><div class="task-priority-filters" role="group" aria-label="Filter tasks">${[["all", "All"], ["mine", "Mine"], ["today", "Due today"], ["over", "Overdue"], ["mom", "From MOM"]].map(([k, l]) => `<button class="task-priority-filter${f === k ? " is-active" : ""}" type="button" data-tb-filter="${k}" aria-pressed="${f === k}">${l}</button>`).join("")}</div>
    <label class="project-task-search">${icon("search")}<input id="tb-search" type="search" placeholder="Search tasks..." aria-label="Search tasks" value="${h(q)}"></label></div>
    <div class="project-task-table-scroll"><table class="data-table project-task-table oi-table"><thead><tr><th>Task</th><th data-hf="board-project">Project</th><th data-hf="board-owner">Owner</th><th>Due</th><th data-hf="board-priority">Priority</th><th data-hf="board-source">Source</th><th data-hf="board-status">Status</th></tr></thead><tbody>
    ${rows.map((r) => `<tr class="project-task-row"><td><strong>${h(r[0])}</strong></td><td>${h(r[1])}</td><td>${h(r[2])}</td><td>${/overdue/.test(r[3]) ? `<span class="status overdue">${h(r[3])}</span>` : h(r[3])}</td><td>${r[4]}</td><td><span class="cx-src is-${r[5].replace(" ", "")}">${r[5]}</span></td><td><span class="task-state ${r[6] === "Overdue" ? "delayed" : "pending"}">${r[6]}</span></td></tr>`).join("") || '<tr><td colspan="7" class="drawer-empty">No tasks match.</td></tr>'}</tbody></table></div>`;
}
const taskBoard = document.createElement("section");
taskBoard.className = "page-view cx-page"; taskBoard.id = "taskboard-view"; taskBoard.hidden = true; taskBoard.setAttribute("aria-label", "Task Board");
mainContent2.append(taskBoard);
let tbFilter = "all";
function renderTaskBoard() {
  const q = $("#tb-search")?.value || "";
  taskBoard.innerHTML = `${pageIntro("Task Board", "Tasks across all your projects, including tasks created from minutes of meeting and your daily list.")}<div id="tb-body">${taskBoardHtml(tbFilter, q)}</div>`;
}
taskBoard.addEventListener("click", (e) => { const b = e.target.closest("[data-tb-filter]"); if (b) { tbFilter = b.dataset.tbFilter; renderTaskBoard(); } });
taskBoard.addEventListener("input", (e) => { if (e.target.id === "tb-search") { const v = e.target.value; renderTaskBoard(); const i = $("#tb-search"); i.focus(); i.setSelectionRange(v.length, v.length); } });
