/**
 * File: js/features/task-dialog.js
 * Role: New Task dialog.
 * Dependencies: Loaded by index.html as script 30 of 80. Uses globals from js/core/router.js, js/core/utils.js, js/features/dashboard.js, js/features/open-items.js, js/features/project/workspace.js. Its globals are used by js/features/daily-list.js, js/features/project/team.js.
 */

const taskDialogBackdrop = document.querySelector("#task-dialog-backdrop");

const taskForm = document.querySelector("#task-form");

const taskAssigneeInput = document.querySelector("#task-assignee");

const taskAttachmentInput = document.querySelector("#task-attachment");

const taskUploadText = document.querySelector(".task-upload-text");

// assignee is pre-filled when opened from a person's card in the Team tab
function openTaskDialog(assignee = "") {
  taskDialogBackdrop.hidden = false;
  document.body.classList.add("project-dialog-open");
  taskAssigneeInput.value = assignee;
  document.querySelector("#task-title").focus();
}

function closeTaskDialog() {
  taskDialogBackdrop.hidden = true;
  document.body.classList.remove("project-dialog-open");
  taskForm.reset();
  taskUploadText.textContent = taskUploadText.dataset.defaultLabel;
}

document.querySelector('.add-btn[aria-label="Add task"]').addEventListener("click", () => openTaskDialog());

// Every "Create Task" / "Add Task" button (overview header, project tasks, open items)
document.addEventListener("click", (event) => {
  if (event.target.closest(".create-task-btn")) openTaskDialog();
});

taskAttachmentInput.addEventListener("change", () => {
  const names = Array.from(taskAttachmentInput.files, (file) => file.name);
  taskUploadText.textContent = names.length ? names.join(", ") : taskUploadText.dataset.defaultLabel;
});

taskDialogBackdrop.querySelectorAll("[data-close-task-dialog]").forEach((button) => {
  button.addEventListener("click", closeTaskDialog);
});

taskDialogBackdrop.addEventListener("click", (event) => {
  if (event.target === taskDialogBackdrop) closeTaskDialog();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !taskDialogBackdrop.hidden) closeTaskDialog();
});

document.querySelector(".assign-me").addEventListener("click", () => {
  taskAssigneeInput.value = "Apurva Bhadange";
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!taskForm.reportValidity()) return;

  const task = {
    title: document.getElementById("task-title").value.trim(),
    description: document.getElementById("task-description").value.trim(),
    priority: document.getElementById("task-priority").value,
    discipline: document.getElementById("task-discipline").value,
    targetDate: document.getElementById("task-date").value,
    assignee: taskAssigneeInput.value.trim()
  };

  // Whichever page is visible decides which list receives the task
  // The new task lands in the list the user is looking at
  if (!overviewPage.hidden) addProjectTask(task);
  else if (!openItemsPage.hidden) addOpenItemsTask(task);
  else if (!dashboardView.hidden) addDashboardTask(task);

  closeTaskDialog();
  showToast("Task created successfully.");
});
