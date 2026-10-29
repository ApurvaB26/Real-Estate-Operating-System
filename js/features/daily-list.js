/**
 * File: js/features/daily-list.js
 * Role: Dashboard daily task list and Quick Task Entry.
 * Dependencies: Loaded by index.html as script 59 of 80. Uses globals from js/core/utils.js, js/features/task-dialog.js. Nothing else calls into it; it wires itself up on load.
 */

/* DASHBOARD: QUICK TASK ENTRY
   A plain checklist for today. Items can be moved to the taskboard or marked done, one by one or in bulk. Stored in this browser; unfinished items carry over. */
const dailyBackdrop = document.getElementById("daily-dialog-backdrop");

const dailyKey = "reos-daily-list";

const dailyProjects = ["Riverside Greens", "Skyline One", "Amberwood Residences", "Crestview Towers"];

let dailyItems = [];

let dailyAdding = false;

let dailyUndo = null;

function dailyToday() {
  return new Date().toISOString().slice(0, 10);
}

function loadDailyItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(dailyKey) || "null");
    if (saved && saved.date === dailyToday()) {
      dailyItems = saved.items;
      return;
    }
    // New day: keep only what was not finished
    dailyItems = saved ? saved.items.filter((item) => !item.done) : [];
  } catch (e) {
    dailyItems = [];
  }
}

function saveDailyItems() {
  try {
    localStorage.setItem(dailyKey, JSON.stringify({ date: dailyToday(), items: dailyItems }));
  } catch (e) {
    /* storage unavailable */
  }
}

function renderDailyList() {
  const list = document.getElementById("daily-list");
  // Keep what is being typed in the inline row while the list redraws
  const typed = document.getElementById("daily-inline-input")?.value || "";
  const typedProject = document.getElementById("daily-inline-project")?.value || "";
  const hasItems = dailyItems.length > 0;
  const selected = dailyItems.filter((item) => item.selected).length;
  const form = document.getElementById("daily-form");
  // Nothing added yet: the entry row leads. Otherwise the list shows, with an inline row after "Add more".
  form.hidden = hasItems;
  document.getElementById("daily-hint").hidden = hasItems;
  document.getElementById("daily-bar").hidden = !hasItems;
  document.getElementById("daily-add-more").hidden = selected > 0;
  document.getElementById("daily-bulk-move").hidden = selected === 0;
  document.getElementById("daily-bulk-done").hidden = selected === 0;
  const all = document.getElementById("daily-select-all");
  all.checked = hasItems && selected === dailyItems.length;
  all.indeterminate = selected > 0 && selected < dailyItems.length;
  list.hidden = !hasItems;
  const showInline = dailyAdding && selected === 0;
  list.innerHTML =
    dailyItems
      .map(
        (item, i) => `
    <li class="daily-item${item.done ? " done" : ""}">
      <label class="daily-check"><input type="checkbox" data-daily-toggle="${i}" ${item.selected ? "checked" : ""}>
        <span><strong>${escapeHtml(item.text)}</strong>${item.project ? `<small>${escapeHtml(item.project)}</small>` : ""}</span></label>
      ${selected === 0 ? `<button class="daily-convert" type="button" data-daily-convert="${i}">Move to taskboard</button>` : ""}
      <button class="daily-remove" type="button" data-daily-remove="${i}" aria-label="Remove ${escapeHtml(item.text)}">&times;</button>
    </li>`
      )
      .join("") +
    (showInline
      ? `
    <li class="daily-item daily-inline">
      <input type="checkbox" disabled aria-hidden="true" tabindex="-1">
      <label class="visually-hidden" for="daily-inline-input">Add another item to today's list</label>
      <input id="daily-inline-input" type="text" placeholder="What more do you want to add in the list?" autocomplete="off" value="${escapeHtml(typed)}">
      <label class="visually-hidden" for="daily-inline-project">Project</label>
      <select id="daily-inline-project">${dailyProjectOptions(typedProject)}</select>
    </li>`
      : "");
}

function dailyProjectOptions(selectedName = "") {
  return (
    `<option value="">Select Project</option>` +
    dailyProjects
      .map(
        (name) =>
          `<option value="${escapeHtml(name)}"${name === selectedName ? " selected" : ""}>${escapeHtml(name)}</option>`
      )
      .join("")
  );
}

function openDailyList() {
  loadDailyItems();
  dailyItems.forEach((item) => {
    item.selected = false;
  });
  dailyAdding = false;
  document.getElementById("daily-project").innerHTML = dailyProjectOptions();
  document.getElementById("daily-date").textContent = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  renderDailyList();
  dailyBackdrop.hidden = false;
  if (!dailyItems.length) document.getElementById("daily-input").focus();
}

function closeDailyList() {
  dailyBackdrop.hidden = true;
}

document.getElementById("daily-open-btn").addEventListener("click", openDailyList);

document.getElementById("daily-close").addEventListener("click", closeDailyList);

dailyBackdrop.addEventListener("click", (e) => {
  if (e.target === dailyBackdrop) closeDailyList();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !dailyBackdrop.hidden) closeDailyList();
});

document.getElementById("daily-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("daily-input");
  const project = document.getElementById("daily-project");
  const text = input.value.trim();
  if (!text) return;
  dailyItems.push({ text, project: project.value, done: false, selected: false });
  input.value = "";
  saveDailyItems();
  renderDailyList();
  input.focus();
});

document.getElementById("daily-add-more").addEventListener("click", () => {
  dailyAdding = true;
  renderDailyList();
  document.getElementById("daily-inline-input").focus();
});

document.getElementById("daily-list").addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.target.id !== "daily-inline-input") return;
  e.preventDefault();
  const text = e.target.value.trim();
  if (!text) return;
  dailyItems.push({
    text,
    project: document.getElementById("daily-inline-project").value,
    done: false,
    selected: false
  });
  e.target.value = "";
  saveDailyItems();
  renderDailyList();
  document.getElementById("daily-inline-input").focus();
});

document.getElementById("daily-select-all").addEventListener("change", (e) => {
  dailyItems.forEach((item) => {
    item.selected = e.target.checked;
  });
  renderDailyList();
});

document.getElementById("daily-bulk-done").addEventListener("click", () => {
  const count = dailyItems.filter((item) => item.selected).length;
  dailyItems = dailyItems.filter((item) => !item.selected);
  saveDailyItems();
  renderDailyList();
  showToast(`${count} item${count === 1 ? "" : "s"} marked as done.`);
});

document.getElementById("daily-bulk-move").addEventListener("click", () => {
  // Demo only: the live app will create the tasks on the taskboard
  const count = dailyItems.filter((item) => item.selected).length;
  dailyItems = dailyItems.filter((item) => !item.selected);
  saveDailyItems();
  renderDailyList();
  showToast(`${count} item${count === 1 ? "" : "s"} moved to the taskboard.`);
});

document.getElementById("daily-clear").addEventListener("click", () => {
  if (!dailyItems.length) return;
  if (!window.confirm(`Clear all ${dailyItems.length} item${dailyItems.length === 1 ? "" : "s"} from today's list?`))
    return;
  dailyItems = [];
  saveDailyItems();
  renderDailyList();
});

document.getElementById("daily-list").addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-daily-toggle]");
  const remove = e.target.closest("[data-daily-remove]");
  const convert = e.target.closest("[data-daily-convert]");
  if (toggle) dailyItems[Number(toggle.dataset.dailyToggle)].selected = toggle.checked;
  else if (remove) dailyItems.splice(Number(remove.dataset.dailyRemove), 1);
  else if (convert) {
    // Hand the text to the normal task form; the item leaves the list once the task is made
    const index = Number(convert.dataset.dailyConvert);
    closeDailyList();
    openTaskDialog();
    document.getElementById("task-title").value = dailyItems[index].text;
    dailyItems.splice(index, 1);
  } else return;
  saveDailyItems();
  renderDailyList();
});
