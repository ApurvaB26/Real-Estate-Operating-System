/**
 * File: js/features/open-items.js
 * Role: Open Items page: grouped Tasks, RFIs and Deliverables tabs.
 * Dependencies: Loaded by index.html as script 32 of 80. Uses globals from js/core/router.js, js/core/utils.js, js/features/dashboard.js, js/features/profile.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/core/router.js, js/features/assistant.js, js/features/focus-mode.js, js/features/project/deliverable-tracker.js, js/features/project/transmittals.js, js/features/record-drawer.js and 5 more.
 */

function setOpenItemsTab(tab) {
  document.querySelectorAll("[data-open-tab]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.openTab === tab);
  });
  document.querySelectorAll("[data-open-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.openPanel !== tab;
  });

  const label = { deliverables: "Deliverables", rfis: "RFIs", tasks: "Tasks" }[tab];
  renderBreadcrumb([{ label: "Dashboard", view: "dashboard" }, { label: "Open Items" }, { label }]);
  syncHash(`open-items/${tab}`);
}

function showOpenItems(tab) {
  if (!openItemsConfig[tab]) tab = "tasks";
  showPage("open-items");
  setOpenItemsTab(tab);
}

document.addEventListener("click", (e) => {
  const tab = e.target.closest("[data-open-tab]");
  if (tab) setOpenItemsTab(tab.dataset.openTab);
});

/* OPEN ITEMS PANELS */
const oiBadge = (p) => `<span class="badge ${p.toLowerCase()}">${p}</span>`;

const oiDue = (label, due) => {
  const cls = { overdue: "overdue", today: "due-today", tomorrow: "due-tomorrow" }[due] || "due-date";
  return `<span class="status ${cls}">${label}</span>`;
};

const oiTitle = (title, sub, extra = "") => `<strong>${title}</strong>${extra}<span class="row-subtitle">${sub}</span>`;

const oiAction = (label) => {
  const iconName = { Comment: "comment", Remind: "send-plane", Respond: "send-plane", View: "eye-view" }[label];
  return `<button class="comment-btn" type="button" data-row-action="${label.toLowerCase()}">${icon(iconName, 14)}${label}</button>`;
};

const waiting = (who) =>
  ` · <span class="waiting-tag">${icon("waiting-alert", 12)}Waiting on ${who}</span>`;

// Each tab is described by data: columns, groups, filters and rows. One generic builder (buildItemsPanel) renders all three, so adding a tab means adding config, not code
const openItemsConfig = {
  tasks: {
    title: "Your Tasks",
    checkbox: true,
    addLabel: "Add Task",
    filter: { label: "Priority", value: (r) => r.priority },
    groups: [
      { key: "todo", label: "To do", tone: "" },
      { key: "in-progress", label: "In Progress", tone: "is-blue" },
      { key: "in-review", label: "In Review", tone: "is-red" },
      { key: "completed", label: "Completed", tone: "is-green" }
    ],
    columns: [
      { label: "ID", cell: (r) => r.id },
      { label: "Task", cell: (r) => oiTitle(r.title, r.sub + (r.waiting ? waiting(r.waiting) : "")) },
      { label: "Priority", hf: true, cell: (r) => oiBadge(r.priority) },
      { label: "Due Date", cell: (r) => (r.group === "completed" ? "—" : oiDue(r.dueLabel, r.due)) },
      { label: "Wing No.", hf: true, cell: (r) => r.wing },
      { label: "Assigned By", hf: true, cell: (r) => r.by },
      { label: "Action", cell: (r) => oiAction(r.action) }
    ],
    rows: [
      {
        id: "T-12",
        title: "Approve Revised Typical Floor",
        sub: "Plumbing",
        priority: "High",
        due: "today",
        dueLabel: "Due Today",
        wing: "Wing 25",
        by: "Apurva Bhadange",
        group: "todo",
        action: "Comment"
      },
      {
        id: "T-13",
        title: "Approve Revised Typical Floor",
        sub: "Plumbing",
        priority: "Medium",
        due: "today",
        dueLabel: "Due Today",
        wing: "Wing 25",
        by: "Apurva Bhadange",
        group: "todo",
        action: "Comment"
      },
      {
        id: "T-14",
        title: "Approve Revised Typical Floor",
        sub: "Plumbing",
        priority: "Medium",
        due: "overdue",
        dueLabel: "Overdue",
        wing: "Wing 25",
        by: "Sachin Patil",
        group: "in-progress",
        action: "Comment"
      },
      {
        id: "T-15",
        title: "Approve Revised Typical Floor",
        sub: "Plumbing",
        priority: "Low",
        due: "today",
        dueLabel: "Due Today",
        wing: "Wing 25",
        by: "Sachin Patil",
        group: "in-progress",
        action: "Comment"
      },
      {
        id: "T-16",
        title: "Approve Revised Typical Floor",
        sub: "Plumbing",
        priority: "Low",
        due: "tomorrow",
        dueLabel: "Due Tomorrow",
        wing: "Wing 25",
        by: "Sachin Patil",
        group: "in-progress",
        action: "Comment"
      },
      {
        id: "T-17",
        title: "Approve Revised Typical Floor",
        sub: "Firefighting",
        waiting: "MEP Consultant",
        priority: "Medium",
        due: "overdue",
        dueLabel: "Overdue",
        wing: "Wing 25",
        by: "Sachin Patil",
        group: "in-review",
        action: "Remind"
      },
      {
        id: "T-18",
        title: "Approve Revised Typical Floor",
        sub: "Firefighting",
        waiting: "MEP Consultant",
        priority: "Medium",
        due: "overdue",
        dueLabel: "Overdue",
        wing: "Wing 25",
        by: "Sachin Patil",
        group: "in-review",
        action: "Remind"
      },
      {
        id: "T-19",
        title: "Approve Revised Typical Floor",
        sub: "General",
        priority: "High",
        due: "",
        wing: "Wing 21",
        by: "Sachin Patil",
        group: "completed",
        action: "Comment"
      },
      {
        id: "T-20",
        title: "Approve Revised Typical Floor",
        sub: "General",
        priority: "Low",
        due: "",
        wing: "Wing 21",
        by: "Sachin Patil",
        group: "completed",
        action: "Comment"
      }
    ]
  },

  rfis: {
    title: "RFIs",
    checkbox: false,
    towers: true,
    filter: { label: "Discipline", value: (r) => r.disc },
    groups: [
      { key: "pending", label: "Pending", tone: "" },
      { key: "completed", label: "Completed", tone: "is-green" }
    ],
    columns: [
      { label: "RFI ID", cell: (r) => r.id },
      {
        label: "Query",
        cell: (r) =>
          oiTitle(
            r.query,
            `Received ${r.received} · 📎 ${r.files} files`,
            r.blocking ? '<span class="badge blocking">Blocking</span>' : ""
          )
      },
      { label: "Wing No.", hf: true, cell: (r) => r.wing },
      { label: "Impact", hf: true, cell: (r) => r.impact },
      { label: "Discipline", hf: true, cell: (r) => r.disc },
      { label: "Raised By", hf: true, cell: (r) => r.by },
      { label: "Action", cell: (r) => oiAction(r.action) }
    ],
    rows: [
      {
        id: "RFI-209",
        query: "MCB Rating Clarification",
        blocking: true,
        received: "2h ago",
        files: 2,
        wing: "Wing 25",
        impact: "None",
        disc: "Electrical",
        by: "Sachin Patil",
        due: "today",
        group: "pending",
        action: "Respond"
      },
      {
        id: "RFI-210",
        query: "MCB Rating Clarification",
        received: "2h ago",
        files: 2,
        wing: "Wing 25",
        impact: "None",
        disc: "Electrical",
        by: "Sachin Patil",
        due: "tomorrow",
        group: "pending",
        action: "Respond"
      },
      {
        id: "RFI-211",
        query: "Issue Revised Infra Fire Layout",
        received: "2h ago",
        files: 2,
        wing: "Wing 25",
        impact: "None",
        disc: "Electrical",
        by: "Sachin Patil",
        due: "overdue",
        group: "pending",
        action: "Respond"
      },
      {
        id: "RFI-212",
        query: "MCB Rating Clarification",
        blocking: true,
        received: "2h ago",
        files: 2,
        wing: "Wing 25",
        impact: "None",
        disc: "Electrical",
        by: "Sachin Patil",
        due: "week",
        group: "pending",
        action: "Respond"
      },
      {
        id: "RFI-213",
        query: "MCB Rating Clarification",
        blocking: true,
        received: "2h ago",
        files: 2,
        wing: "Wing 25",
        impact: "None",
        disc: "Electrical",
        by: "Sachin Patil",
        due: "week",
        group: "pending",
        action: "Respond"
      },
      {
        id: "RFI-214",
        query: "Issue Revise Infra Fire Layout",
        received: "3d ago",
        files: 1,
        wing: "Tower B",
        impact: "Cost",
        disc: "Firefighting",
        by: "Rohit Patil",
        due: "",
        group: "completed",
        action: "View"
      }
    ]
  },

  // The Deliverables design wasn't in your screenshots, so this layout is my guess
  deliverables: {
    title: "Deliverables",
    checkbox: true,
    filter: { label: "Status", value: (r) => r.stateLabel },
    groups: [
      { key: "pending", label: "Pending", tone: "" },
      { key: "completed", label: "Completed", tone: "is-green" }
    ],
    columns: [
      {
        label: "Document Name",
        cell: (r) => oiTitle(r.title, r.sub + (r.waiting ? waiting(r.waiting) : ""), oiBadge(r.priority))
      },
      { label: "Project Name", hf: true, cell: (r) => r.project },
      { label: "Status", hf: true, cell: (r) => `<span class="task-state ${r.state}">${r.stateLabel}</span>` },
      { label: "Due Date", cell: (r) => (r.group === "completed" ? "—" : oiDue(r.dueLabel, r.due)) },
      { label: "Action", cell: (r) => (r.action ? oiAction(r.action) : "") }
    ],
    rows: [
      {
        title: "Issue Fire Tender Package",
        sub: "Fire",
        waiting: "MEP Consultant",
        priority: "High",
        project: "Skyline One • Tower B",
        state: "delayed",
        stateLabel: "Delayed",
        due: "overdue",
        dueLabel: "Overdue",
        group: "pending",
        action: "Remind"
      },
      {
        title: "Issue Coordinated Typical Floor GFC",
        sub: "Coordinated",
        priority: "Medium",
        project: "Amberwood Residences • Wing 25",
        state: "in-progress",
        stateLabel: "In Progress",
        due: "today",
        dueLabel: "Due Today",
        group: "pending"
      },
      {
        title: "Issue Revised Infra Fire Layout",
        sub: "Fire",
        waiting: "Architect",
        priority: "Medium",
        project: "Lakeshore • Phase 2",
        state: "pending",
        stateLabel: "Pending",
        due: "tomorrow",
        dueLabel: "Due Tomorrow",
        group: "pending",
        action: "Remind"
      }
    ]
  }
};

function buildOpenItemsPanel(key) {
  const panel = document.querySelector(`[data-open-panel="${key}"]`);
  if (panel) buildItemsPanel(panel, openItemsConfig[key], `oi-${key}`);
}

// Grouped table with due-date chips, search, a Filters menu and an optional tower menu.
// Shared by the Open Items tabs and the project Deliverables tab. Rebuilding keeps the filters.
// Rebuilding the whole panel after any data change is simple and safe; filter choices live in panel.itemsState so they survive the rebuild
function buildItemsPanel(panel, cfg, key) {
  const colCount = cfg.columns.length + (cfg.checkbox ? 1 : 0);
  const state = panel.itemsState || { due: "all", filter: "all", tower: "all", query: "" };
  panel.itemsState = state;
  // Remember each row's index in cfg.rows: checkbox changes write back to the right data row even when the table is filtered
  const indexed = cfg.rows.map((r, index) => ({ r, index }));
  const filterValues = cfg.filter ? [...new Set(cfg.rows.map(cfg.filter.value))] : [];
  const towerValues = cfg.towers ? [...new Set(cfg.rows.map((r) => r.wing))] : [];
  const dueChips = [
    ["all", "All"],
    ["overdue", "Overdue"],
    ["today", "Due Today"],
    ["tomorrow", "Due Tomorrow"],
    ["week", "Due in next 7 days"]
  ];

  const rowHtml = (r, index) => `
    <tr class="project-task-row oi-row${r.group === "completed" ? " done" : ""}" data-oi-row data-oi-index="${index}" data-group="${r.group}" data-origin="${r.origin || (r.group === "completed" ? cfg.groups[0].key : r.group)}" data-due="${r.due || ""}" data-filter-value="${escapeHtml(cfg.filter ? cfg.filter.value(r) : "")}" data-wing="${escapeHtml(r.wing || "")}">
      ${cfg.checkbox ? `<td><label class="custom-checkbox"><input class="task-checkbox oi-check" type="checkbox" aria-label="Complete ${escapeHtml(r.title)}" ${r.group === "completed" ? "checked" : ""}><span class="checkbox-box"></span></label></td>` : ""}
      ${cfg.columns.map((c) => `<td>${c.cell(r)}</td>`).join("")}
    </tr>`;

  const groupHtml = (g) => `
    <tr class="project-task-group-row" data-oi-group="${g.key}"><th colspan="${colCount}">
      <button class="task-group-toggle" type="button" aria-expanded="true"><span class="task-group-chevron" aria-hidden="true"></span><span>${g.label}</span><span class="task-group-count ${g.tone}" data-oi-count></span></button>
    </th></tr>
    ${indexed
      .filter(({ r }) => r.group === g.key)
      .map(({ r, index }) => rowHtml(r, index))
      .join("")}`;

  panel.classList.add("project-tasks-view");
  panel.innerHTML = `
    <div class="project-task-toolbar">
      <div class="task-priority-filters" role="group" aria-label="Filter by due date">
        ${dueChips.map(([value, label]) => `<button class="task-priority-filter${state.due === value ? " is-active" : ""}" type="button" data-oi-due="${value}" aria-pressed="${state.due === value}">${label}</button>`).join("")}
      </div>
      <span class="oi-divider"></span>
      ${
        cfg.filter
          ? `
      <div class="task-advanced-filter-wrap">
        <button class="task-advanced-filter-button" type="button" aria-expanded="false" aria-controls="${key}-filters" data-oi-filter-toggle>
          ${icon("filter-lines", 14)}Filters
        </button>
        <div class="task-advanced-filters" id="${key}-filters" hidden>
          <label for="${key}-filter-select">${cfg.filter.label}</label>
          <select id="${key}-filter-select" data-oi-filter>
            <option value="all">All</option>
            ${filterValues.map((value) => `<option${state.filter === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}
          </select>
        </div>
      </div>`
          : ""
      }
      <label class="project-task-search">
        ${icon("search")}
        <input type="search" data-oi-search aria-label="Search ${cfg.title}" placeholder="Search ${cfg.title.toLowerCase()}...">
      </label>
      ${cfg.addLabel ? `<button class="project-task-add create-task-btn" type="button"><span aria-hidden="true">+</span> ${cfg.addLabel}</button>` : ""}
      ${cfg.addAction ? `<button class="project-task-add" type="button" data-project-action="${cfg.addAction.action}"><span aria-hidden="true">+</span> ${cfg.addAction.label}</button>` : ""}
      ${
        cfg.towers
          ? `
      <div class="tower-dropdown oi-tower-dropdown">
        <button class="tower-filter" type="button" aria-expanded="false" data-oi-tower-toggle><span class="tower-filter-label">${state.tower === "all" ? "All Towers" : escapeHtml(state.tower)}</span><span class="select-chevron" aria-hidden="true"></span></button>
        <div class="tower-menu" hidden>
          <div class="tower-row"><button class="tower-name" type="button" data-oi-tower="all">All Towers</button></div>
          ${towerValues.map((wing) => `<div class="tower-row"><button class="tower-name" type="button" data-oi-tower="${escapeHtml(wing)}">${escapeHtml(wing)}</button></div>`).join("")}
        </div>
      </div>`
          : ""
      }
    </div>

    <div class="project-task-table-scroll">
      <table class="data-table project-task-table oi-table">
        <thead><tr>${cfg.checkbox ? '<th scope="col" aria-label="Complete"></th>' : ""}${cfg.columns.map((c, i) => `<th scope="col"${c.hf ? ` data-hf="${key}-${i}"` : ""}>${c.label}</th>`).join("")}</tr></thead>
        <tbody>${cfg.groups.map(groupHtml).join("")}</tbody>
      </table>
      <p class="policy-empty" data-oi-empty hidden>No items match these filters.</p>
    </div>
    <footer class="project-task-pagination">Page 1 of 1</footer>`;

  const body = panel.querySelector("tbody");
  const search = panel.querySelector("[data-oi-search]");
  const filterSelect = panel.querySelector("[data-oi-filter]");
  const towerMenu = panel.querySelector(".tower-menu");
  // Which due buckets each chip accepts; 'next 7 days' includes today and tomorrow too
  const dueMatches = {
    all: null,
    overdue: ["overdue"],
    today: ["today"],
    tomorrow: ["tomorrow"],
    week: ["today", "tomorrow", "week"]
  };
  search.value = state.query;

  function refresh() {
    state.query = search.value;
    const q = search.value.trim().toLocaleLowerCase();
    const allowed = dueMatches[state.due];
    let total = 0;
    cfg.groups.forEach((g) => {
      const header = body.querySelector(`[data-oi-group="${g.key}"]`);
      const open = header.querySelector(".task-group-toggle").getAttribute("aria-expanded") === "true";
      let matching = 0;
      body.querySelectorAll(`[data-oi-row][data-group="${g.key}"]`).forEach((row) => {
        const ok =
          (!allowed || allowed.includes(row.dataset.due)) &&
          (state.filter === "all" || row.dataset.filterValue === state.filter) &&
          (state.tower === "all" || row.dataset.wing === state.tower) &&
          row.textContent.toLocaleLowerCase().includes(q);
        // A row is hidden if it fails a filter OR its group is collapsed
        row.hidden = !ok || !open;
        if (ok) matching += 1;
      });
      header.hidden = matching === 0;
      header.querySelector("[data-oi-count]").textContent = String(matching).padStart(2, "0");
      total += matching;
    });
    panel.querySelector("[data-oi-empty]").hidden = total !== 0;
  }

  panel.querySelectorAll("[data-oi-due]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.due = chip.dataset.oiDue;
      panel.querySelectorAll("[data-oi-due]").forEach((c) => {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      refresh();
    });
  });

  search.addEventListener("input", refresh);

  panel.querySelector("[data-oi-filter-toggle]")?.addEventListener("click", (e) => {
    const button = e.currentTarget;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.nextElementSibling.hidden = expanded;
  });

  filterSelect?.addEventListener("change", () => {
    state.filter = filterSelect.value;
    refresh();
  });

  panel.querySelector("[data-oi-tower-toggle]")?.addEventListener("click", (e) => {
    towerMenu.hidden = !towerMenu.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!towerMenu.hidden));
  });

  towerMenu?.addEventListener("click", (e) => {
    const option = e.target.closest("[data-oi-tower]");
    if (!option) return;
    state.tower = option.dataset.oiTower;
    panel.querySelector(".oi-tower-dropdown .tower-filter-label").textContent = option.textContent;
    towerMenu.hidden = true;
    refresh();
  });

  body.addEventListener("click", (e) => {
    const toggle = e.target.closest(".task-group-toggle");
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", String(toggle.getAttribute("aria-expanded") !== "true"));
    refresh();
  });

  body.addEventListener("change", (e) => {
    const check = e.target.closest(".oi-check");
    if (!check) return;
    const row = check.closest("[data-oi-row]");
    const item = cfg.rows[Number(row.dataset.oiIndex)];
    row.classList.toggle("done", check.checked);
    // Remember the group a task came from (origin) so un-ticking sends it back where it was
    row.dataset.group = check.checked ? "completed" : row.dataset.origin;
    item.group = row.dataset.group;
    item.origin = row.dataset.origin;
    body.querySelector(`[data-oi-group="${row.dataset.group}"]`).after(row);
    refresh();
  });

  refresh();
}

function addOpenItemsTask(task) {
  const due = dueInfo(task.targetDate);
  const rows = openItemsConfig.tasks.rows;
  rows.unshift({
    id: nextTaskId(rows.map((r) => r.id)),
    // Rows hold ready-made HTML, so user text is escaped when stored
    title: escapeHtml(task.title),
    sub: escapeHtml(task.discipline),
    priority: task.priority,
    due: due.due,
    dueLabel: due.label,
    wing: "Wing 25",
    by: escapeHtml(profileState.name),
    group: "todo",
    action: "Comment"
  });
  buildOpenItemsPanel("tasks");
}
