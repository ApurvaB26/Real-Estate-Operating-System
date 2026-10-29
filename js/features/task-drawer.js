/**
 * File: js/features/task-drawer.js
 * Role: Task details drawer and its more-options menu.
 * Dependencies: Loaded by index.html as script 31 of 80. Uses globals from js/components/action-dialog.js, js/components/layers.js, js/core/utils.js, js/features/dashboard.js, js/features/open-items.js, js/features/project/workspace.js. Its globals are used by js/components/action-dialog.js, js/features/assistant.js, js/features/project/workspace.js, js/features/record-drawer.js, js/features/row-actions.js.
 */

/* TASK DETAILS DRAWER */
const drawerBackdrop = document.getElementById("task-drawer-backdrop");

const drawerStatus = document.querySelector('[data-drawer-select="status"]');

const drawerPriority = document.querySelector('[data-drawer-select="priority"]');

const drawerDueDate = document.getElementById("drawer-due-date");

const drawerDiscipline = document.getElementById("drawer-discipline");

const drawerCommentsList = document.getElementById("drawer-comments-list");

const drawerCommentForm = document.getElementById("drawer-comment-form");

const drawerDependencyList = document.getElementById("drawer-dependency-list");

const drawerDependencyForm = document.getElementById("drawer-dependency-form");

const drawerAttachmentList = document.getElementById("drawer-attachment-list");

const drawerAttachmentInput = document.getElementById("drawer-attachment-input");

const drawerActivityList = document.getElementById("drawer-activity-list");

// The table row whose details are open. The drawer reads and writes the row's data-* attributes, so the row itself is the source of truth
let activeTaskRow = null;

function closeDrawer() {
  drawerBackdrop.hidden = true;
}

// Comments are stored as JSON in the row's data-comments attribute (demo persistence, lost on reload)
function renderDrawerComments() {
  const comments = JSON.parse(activeTaskRow.dataset.comments || "[]");
  if (!comments.length) {
    drawerCommentsList.innerHTML = '<p class="drawer-empty">No comments yet.</p>';
    return;
  }

  drawerCommentsList.replaceChildren(
    ...comments.map((comment) => {
      const item = document.createElement("p");
      item.className = "drawer-comment";
      item.textContent = comment;
      return item;
    })
  );
}

function setDrawerSelect(dropdown, value) {
  const options = Array.from(dropdown.querySelectorAll(".drawer-select-option"));
  // so compare case-insensitively
  // Rows store priority in lower case ("medium"), the options in title case
  const selectedOption =
    options.find((option) => option.dataset.value.toLowerCase() === String(value).toLowerCase()) || options[0];
  dropdown.dataset.value = selectedOption.dataset.value;
  dropdown.querySelector(".drawer-selected-value").textContent = selectedOption.dataset.value;
  dropdown.querySelector(".drawer-selected-dot").className = `drawer-selected-dot ${selectedOption.dataset.color}`;
  options.forEach((option) => option.setAttribute("aria-selected", String(option === selectedOption)));
}

// Tolerates older saved shapes (a single object or a legacy key) so earlier data still opens
function getDrawerItems(row, key, legacyKey) {
  const storedItems = row.dataset[key];
  if (storedItems) {
    try {
      const parsedItems = JSON.parse(storedItems);
      if (Array.isArray(parsedItems)) return parsedItems;
      if (parsedItems) return [parsedItems];
    } catch {
      return [storedItems];
    }
  }
  return row.dataset[legacyKey] ? [row.dataset[legacyKey]] : [];
}

function addTaskActivity(row, message) {
  const activity = getDrawerItems(row, "activity", "");
  activity.push(message);
  row.dataset.activity = JSON.stringify(activity);
  renderDrawerActivity(row);
}

function renderDrawerActivity(row) {
  const activity = getDrawerItems(row, "activity", "");
  if (!activity.length) activity.push("Task created");
  row.dataset.activity = JSON.stringify(activity);
  drawerActivityList.replaceChildren(
    ...activity.map((message) => {
      const item = document.createElement("p");
      item.className = "drawer-activity-item";
      item.textContent = message;
      return item;
    })
  );
}

function renderDrawerDependencies(row) {
  const dependencies = getDrawerItems(row, "dependencies", "dependency");
  if (!dependencies.length) {
    drawerDependencyList.innerHTML = '<p class="drawer-empty">No dependencies recorded.</p>';
    return;
  }

  drawerDependencyList.replaceChildren(
    ...dependencies.map((dependency) => {
      const item = document.createElement("div");
      item.className = "drawer-item-chip";
      const text = document.createElement("span");
      text.textContent = dependency;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.setAttribute("aria-label", `Remove dependency ${dependency}`);
      remove.dataset.removeDependency = dependency;
      remove.textContent = "×";
      item.append(text, remove);
      return item;
    })
  );
}

function renderDrawerAttachments(row) {
  const attachments = getDrawerItems(row, "attachments", "");
  if (!attachments.length) {
    drawerAttachmentList.innerHTML = '<p class="drawer-empty">No attachments.</p>';
    return;
  }

  drawerAttachmentList.replaceChildren(
    ...attachments.map((attachment, index) => {
      const item = document.createElement("div");
      item.className = "drawer-item-chip";
      const text = document.createElement("span");
      text.textContent = attachment;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.setAttribute("aria-label", `Remove attachment ${attachment}`);
      remove.dataset.removeAttachment = String(index);
      remove.textContent = "×";
      item.append(text, remove);
      return item;
    })
  );
}

drawerStatus.addEventListener("click", (event) => {
  const option = event.target.closest(".drawer-select-option");
  if (!option) return;
  setDrawerSelect(drawerStatus, option.dataset.value);
  drawerStatus.open = false;
});

drawerPriority.addEventListener("click", (event) => {
  const option = event.target.closest(".drawer-select-option");
  if (!option) return;
  setDrawerSelect(drawerPriority, option.dataset.value);
  drawerPriority.open = false;
});

document.querySelectorAll(".drawer-custom-select").forEach((dropdown) => {
  dropdown.addEventListener("toggle", () => {
    if (dropdown.open) {
      document.querySelectorAll(".drawer-custom-select").forEach((otherDropdown) => {
        if (otherDropdown !== dropdown) otherDropdown.open = false;
      });
    }
  });
});

// so look them up by class, not by column index
// The priority badge and due chip sit in different columns in each table
const rowPriorityBadge = (row) => row.querySelector(".badge:not(.blocking)");

const rowDueStatus = (row) => row.querySelector(".status");

// Date-only compare against local midnight; Math.round absorbs daylight-saving hour shifts
function updateTaskDueLabel(row, dateValue) {
  const status = rowDueStatus(row);
  if (!status) return;
  if (!dateValue) {
    status.textContent = "Not set";
    status.className = "status due-date";
    return;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const dueDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const difference = Math.round((dueDate - today) / 86400000);
  const dateParts = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).formatToParts(dueDate);
  const farDateLabel = `${dateParts.find((part) => part.type === "weekday").value}. ${dateParts.find((part) => part.type === "month").value} ${dateParts.find((part) => part.type === "day").value}`;
  status.textContent =
    difference < 0 ? "Overdue" : difference === 0 ? "Due Today" : difference === 1 ? "Due Tomorrow" : farDateLabel;
  status.className = `status ${difference < 0 ? "overdue" : difference === 0 ? "due-today" : difference === 1 ? "due-tomorrow" : "due-date"}`;
}

document.addEventListener("click", (e) => {
  const row = e.target.closest(
    '.table-scroll tbody tr, .project-task-table:not(.oi-table) tbody tr, [data-open-panel="tasks"] tr[data-oi-row]'
  );
  // A click on a row, or on its Comment button, opens the drawer; checkboxes and other buttons do not
  // Remind / Respond / View buttons have their own dialogs; only Comment opens the drawer
  const commentBtn = e.target.closest('.comment-btn:not([data-row-action]), [data-row-action="comment"]');

  // Row click opens the drawer. The Comment button opens it too.
  if (row && row.cells.length > 2 && (commentBtn || !e.target.closest(".custom-checkbox, button"))) {
    const cells = row.querySelectorAll("td");
    const id = cells[1].textContent.trim();
    const title = row.querySelector("strong").textContent;
    // Dashboard rows show the project; project/open-item rows show the wing
    const project = (row.querySelector(".cell-project") || cells[5]).textContent.trim();
    const assignedBy = cells[6].textContent.trim();
    const checkbox = row.querySelector(".task-checkbox");
    const badge = rowPriorityBadge(row);
    activeTaskRow = row;

    document.getElementById("drawer-meta").textContent = `${id} · ${project} · Assigned by ${assignedBy}`;
    document.getElementById("drawer-title").textContent = title;
    document.getElementById("drawer-description").textContent = row.dataset.description || "No description provided.";
    setDrawerSelect(drawerStatus, row.dataset.taskStatus || (checkbox.checked ? "Completed" : "In Progress"));
    setDrawerSelect(drawerPriority, row.dataset.priority || badge?.textContent.trim() || "Medium");
    drawerDueDate.value = row.dataset.targetDate || "";
    drawerDiscipline.value =
      row.dataset.discipline || cells[2].querySelector(".row-subtitle")?.textContent.trim() || "General";
    renderDrawerDependencies(row);
    renderDrawerAttachments(row);
    renderDrawerActivity(row);
    drawerDependencyForm.hidden = true;
    drawerDependencyForm.reset();
    renderDrawerComments();
    drawerBackdrop.hidden = false;

    if (commentBtn) {
      const commentInput = document.getElementById("drawer-comment-input");
      commentInput.scrollIntoView({ block: "center" });
      commentInput.focus();
    }
    return;
  }

  if (e.target.closest("[data-close-drawer]") || e.target === drawerBackdrop) closeDrawer();
});

drawerCommentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("drawer-comment-input");
  const comment = input.value.trim();
  if (!comment || !activeTaskRow) return;

  const comments = JSON.parse(activeTaskRow.dataset.comments || "[]");
  comments.push(comment);
  activeTaskRow.dataset.comments = JSON.stringify(comments);
  addTaskActivity(activeTaskRow, `Comment added: ${comment}`);
  input.value = "";
  renderDrawerComments();
});

document.querySelector("[data-add-dependency]").addEventListener("click", () => {
  drawerDependencyForm.hidden = false;
  document.getElementById("drawer-dependency-input").focus();
});

document.querySelector("[data-cancel-dependency]").addEventListener("click", () => {
  drawerDependencyForm.reset();
  drawerDependencyForm.hidden = true;
});

drawerDependencyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("drawer-dependency-input");
  const dependency = input.value.trim();
  if (!dependency || !activeTaskRow) return;

  const dependencies = getDrawerItems(activeTaskRow, "dependencies", "dependency");
  dependencies.push(dependency);
  activeTaskRow.dataset.dependencies = JSON.stringify(dependencies);
  delete activeTaskRow.dataset.dependency;
  renderDrawerDependencies(activeTaskRow);
  addTaskActivity(activeTaskRow, `Dependency added: ${dependency}`);
  drawerDependencyForm.reset();
  drawerDependencyForm.hidden = true;
});

document.querySelector("[data-add-attachment]").addEventListener("click", () => drawerAttachmentInput.click());

drawerAttachmentInput.addEventListener("change", () => {
  if (!activeTaskRow) return;
  const attachments = getDrawerItems(activeTaskRow, "attachments", "");
  const addedAttachments = Array.from(drawerAttachmentInput.files, (file) => file.name);
  activeTaskRow.dataset.attachments = JSON.stringify([...attachments, ...addedAttachments]);
  renderDrawerAttachments(activeTaskRow);
  addedAttachments.forEach((name) => addTaskActivity(activeTaskRow, `Attachment added: ${name}`));
  drawerAttachmentInput.value = "";
});

document.addEventListener("click", (event) => {
  const dependencyButton = event.target.closest("[data-remove-dependency]");
  if (dependencyButton && activeTaskRow) {
    const dependency = dependencyButton.dataset.removeDependency;
    const dependencies = getDrawerItems(activeTaskRow, "dependencies", "dependency").filter(
      (item) => item !== dependency
    );
    activeTaskRow.dataset.dependencies = JSON.stringify(dependencies);
    delete activeTaskRow.dataset.dependency;
    renderDrawerDependencies(activeTaskRow);
    addTaskActivity(activeTaskRow, `Dependency removed: ${dependency}`);
  }

  const attachmentButton = event.target.closest("[data-remove-attachment]");
  if (attachmentButton && activeTaskRow) {
    const index = Number(attachmentButton.dataset.removeAttachment);
    const attachments = getDrawerItems(activeTaskRow, "attachments", "");
    const [removedAttachment] = attachments.splice(index, 1);
    activeTaskRow.dataset.attachments = JSON.stringify(attachments);
    renderDrawerAttachments(activeTaskRow);
    if (removedAttachment) addTaskActivity(activeTaskRow, `Attachment removed: ${removedAttachment}`);
  }
});

document.querySelector(".drawer-save").addEventListener("click", () => {
  if (!activeTaskRow) return;

  const checkbox = activeTaskRow.querySelector(".task-checkbox");
  const priorityBadge = rowPriorityBadge(activeTaskRow);
  const discipline = activeTaskRow.querySelector("td:nth-child(3) .row-subtitle");
  const previousStatus = activeTaskRow.dataset.taskStatus || (checkbox.checked ? "Completed" : "In Progress");
  const previousPriority = activeTaskRow.dataset.priority || priorityBadge?.textContent.trim() || "Medium";
  const previousDate = activeTaskRow.dataset.targetDate || "";
  const previousDiscipline = activeTaskRow.dataset.discipline || discipline?.textContent.trim() || "General";
  const changes = [];

  if (previousStatus !== drawerStatus.dataset.value) changes.push(`Status changed to ${drawerStatus.dataset.value}`);
  if (previousPriority.toLowerCase() !== drawerPriority.dataset.value.toLowerCase())
    changes.push(`Priority changed to ${drawerPriority.dataset.value}`);
  if (previousDate !== drawerDueDate.value)
    changes.push(drawerDueDate.value ? `Target date set to ${drawerDueDate.value}` : "Target date cleared");
  if (previousDiscipline !== drawerDiscipline.value) changes.push(`Discipline changed to ${drawerDiscipline.value}`);

  activeTaskRow.dataset.taskStatus = drawerStatus.dataset.value;
  activeTaskRow.dataset.priority = drawerPriority.dataset.value.toLocaleLowerCase();
  activeTaskRow.dataset.targetDate = drawerDueDate.value;
  activeTaskRow.dataset.discipline = drawerDiscipline.value;
  checkbox.checked = drawerStatus.dataset.value === "Completed";
  activeTaskRow.classList.toggle("done", checkbox.checked);
  if (priorityBadge) {
    priorityBadge.className = `badge ${drawerPriority.dataset.value.toLocaleLowerCase()}`;
    priorityBadge.textContent = drawerPriority.dataset.value;
  }
  // Dashboard rows also show a status chip
  const stateChip = activeTaskRow.querySelector(".task-state");
  if (stateChip) {
    stateChip.className = `task-state ${drawerStatus.dataset.value.toLocaleLowerCase().replace(/\s+/g, "-")}`;
    stateChip.textContent = drawerStatus.dataset.value;
  }
  if (discipline) discipline.textContent = drawerDiscipline.value;
  updateTaskDueLabel(activeTaskRow, drawerDueDate.value);
  if (changes.length) addTaskActivity(activeTaskRow, changes.join(" · "));
  if (activeTaskRow.matches("[data-task-row]")) {
    activeTaskRow.dataset.group = getProjectTaskGroup(drawerStatus.dataset.value);
    projectTaskList.querySelector(`[data-group-header="${activeTaskRow.dataset.group}"]`).after(activeTaskRow);
    updateProjectTaskCounts();
    filterProjectTasks();
  } else {
    updateTaskCount();
  }
  closeDrawer();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !drawerBackdrop.hidden) closeDrawer();
});

/* TASK DRAWER: more options menu */
const drawerMoreBtn = document.querySelector(".drawer-more-btn");

const drawerMoreMenu = document.getElementById("drawer-more-menu");

function setDrawerMenuOpen(open) {
  drawerMoreMenu.hidden = !open;
  drawerMoreBtn.setAttribute("aria-expanded", String(open));
}

drawerMoreBtn.addEventListener("click", () => setDrawerMenuOpen(drawerMoreMenu.hidden));

document.addEventListener("click", (e) => {
  if (!e.target.closest(".drawer-more-wrap")) setDrawerMenuOpen(false);
});

// After editing or deleting a task, refresh every place that counts or filters tasks
function refreshTaskLists() {
  updateTaskCount();
  updateProjectTaskCounts();
  filterProjectTasks();
}

drawerMoreMenu.addEventListener("click", (e) => {
  const item = e.target.closest("[data-drawer-action]");
  if (!item || !activeTaskRow) return;
  setDrawerMenuOpen(false);
  const row = activeTaskRow;
  const id = row.cells[1].textContent.trim();
  const title = rowTitle(row);

  // Clipboard can be blocked (permissions, non-secure page); fall back to showing the id in a toast
  if (item.dataset.drawerAction === "copy") {
    navigator.clipboard
      ?.writeText(id)
      .then(() => showToast(`Copied ${id}.`))
      .catch(() => showToast(`Task ID: ${id}`));
    return;
  }

  // Duplicate goes through the same add function the New Task dialog uses, for whichever list the task lives in
  if (item.dataset.drawerAction === "duplicate") {
    const copy = {
      title: `${title} (copy)`,
      description: row.dataset.description || "",
      priority: drawerPriority.dataset.value,
      discipline: drawerDiscipline.value,
      targetDate: drawerDueDate.value,
      assignee: row.cells[6].textContent.trim()
    };
    if (row.matches("[data-task-row]")) addProjectTask(copy);
    else if (row.matches("[data-oi-row]")) addOpenItemsTask(copy);
    else addDashboardTask(copy);
    closeDrawer();
    showToast(`Duplicated ${id}.`);
    return;
  }

  openActionDialog({
    title: `Delete ${id}?`,
    subtitle: title,
    body: '<p class="action-dialog-text">The task, its comments and attachments will be removed for everyone on the project.</p>',
    submitLabel: "Delete Task",
    onSubmit() {
      if (row.matches("[data-oi-row]")) {
        openItemsConfig.tasks.rows.splice(Number(row.dataset.oiIndex), 1);
        buildOpenItemsPanel("tasks");
      } else {
        row.remove();
      }
      refreshTaskLists();
      closeDrawer();
      showToast(`${id} deleted.`);
    }
  });
});
