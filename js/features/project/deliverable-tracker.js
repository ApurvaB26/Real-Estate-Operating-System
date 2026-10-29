/**
 * File: js/features/project/deliverable-tracker.js
 * Role: Project Deliverables tab: design deliverable tracker.
 * Dependencies: Loaded by index.html as script 36 of 80. Uses globals from js/core/utils.js, js/features/open-items.js, js/features/profile.js. Its globals are used by js/features/project/deliverable-source.js, js/features/project/tracker-import.js, js/features/project/transmittals.js, js/features/project/workspace.js, js/features/record-drawer.js, js/main.js.
 */

const trackerStatuses = ["Not Started", "In Progress", "In Review", "Submitted", "Approved", "On Hold"];

// Maps each status text to its CSS class; unknown statuses fall back to 'pending' in the renderers. Submitted shares the 'in-review' colour and Approved/Completed share 'completed' on purpose
const deliverableStateClass = {
  "Not Started": "not-started",
  "In Progress": "in-progress",
  "In Review": "in-review",
  Submitted: "in-review",
  Approved: "completed",
  Completed: "completed",
  "On Hold": "on-hold",
  Delayed: "delayed",
  Pending: "pending"
};

const trackerStages = ["Concept", "Schematic Design", "Design Development", "Tender", "GFC", "VFC", "As-built"];

const trackerDepartments = ["Electrical", "Plumbing", "HVAC", "Fire Fighting", "ELV", "Coordinated"];

const trackerTowers = ["Tower 16", "Tower 26", "MLCP", "UGT 2"];

const trackerFloors = ["Basement 2", "Basement 1", "Ground", "Podium", "L1–L10", "L11–L20", "Terrace", "All floors"];

const trackerDimensions = { tower: "Tower", stage: "Stage", department: "Department", floor: "Floor" };

// 'let', not 'const': an Excel/CSV import (tracker-import.js) replaces the whole list
let deliverableTracker = [
  {
    docNo: "LB-EL-T26-101",
    title: "Electrical lighting layout Rev C",
    tower: "Tower 26",
    floor: "L1–L10",
    stage: "GFC",
    department: "Electrical",
    due: daysFromNow(0),
    status: "In Progress",
    owner: "Fatima Khan"
  },
  {
    docNo: "LB-EL-T26-102",
    title: "Small power & DB schedule",
    tower: "Tower 26",
    floor: "L11–L20",
    stage: "GFC",
    department: "Electrical",
    due: daysFromNow(9),
    status: "Not Started",
    owner: "Fatima Khan"
  },
  {
    docNo: "LB-FF-T26-201",
    title: "Fire tender package",
    tower: "Tower 26",
    floor: "All floors",
    stage: "Tender",
    department: "Fire Fighting",
    due: daysFromNow(-3),
    status: "In Progress",
    owner: "Apurva Bhadange",
    waiting: "MEP Consultant"
  },
  {
    docNo: "LB-HV-T26-301",
    title: "Typical floor ventilation layout",
    tower: "Tower 26",
    floor: "L1–L10",
    stage: "Design Development",
    department: "HVAC",
    due: daysFromNow(12),
    status: "In Review",
    owner: "Neha Kapoor"
  },
  {
    docNo: "LB-PH-T16-110",
    title: "Drainage calculations",
    tower: "Tower 16",
    floor: "L1–L10",
    stage: "Design Development",
    department: "Plumbing",
    due: daysFromNow(1),
    status: "Not Started",
    owner: "Riya Shah"
  },
  {
    docNo: "LB-PH-T16-111",
    title: "Plumbing single line diagram R3",
    tower: "Tower 16",
    floor: "All floors",
    stage: "Design Development",
    department: "Plumbing",
    due: daysFromNow(6),
    status: "Submitted",
    owner: "Riya Shah"
  },
  {
    docNo: "LB-EL-T16-120",
    title: "Terrace lightning protection layout",
    tower: "Tower 16",
    floor: "Terrace",
    stage: "Schematic Design",
    department: "Electrical",
    due: daysFromNow(-12),
    status: "Approved",
    owner: "Fatima Khan"
  },
  {
    docNo: "LB-HV-MLCP-301",
    title: "HVAC equipment schedule — chillers",
    tower: "MLCP",
    floor: "Basement 2",
    stage: "Design Development",
    department: "HVAC",
    due: daysFromNow(4),
    status: "Not Started",
    owner: "Neha Kapoor",
    waiting: "Architect"
  },
  {
    docNo: "LB-HV-MLCP-302",
    title: "Basement jet fan layout",
    tower: "MLCP",
    floor: "Basement 1",
    stage: "GFC",
    department: "HVAC",
    due: daysFromNow(-20),
    status: "Approved",
    owner: "Neha Kapoor"
  },
  {
    docNo: "LB-FF-MLCP-210",
    title: "Sprinkler layout — parking levels",
    tower: "MLCP",
    floor: "Basement 1",
    stage: "Tender",
    department: "Fire Fighting",
    due: daysFromNow(15),
    status: "In Progress",
    owner: "Apurva Bhadange"
  },
  {
    docNo: "LB-FF-UGT2-220",
    title: "Fire pump room layout",
    tower: "UGT 2",
    floor: "Basement 2",
    stage: "VFC",
    department: "Fire Fighting",
    due: daysFromNow(-30),
    status: "Approved",
    owner: "Apurva Bhadange"
  },
  {
    docNo: "LB-CO-ALL-001",
    title: "Concept MEP design report",
    tower: "All Towers",
    floor: "All floors",
    stage: "Concept",
    department: "Coordinated",
    due: daysFromNow(-60),
    status: "Approved",
    owner: "Apurva Bhadange"
  },
  {
    docNo: "LB-ELV-T26-401",
    title: "Access control & CCTV riser",
    tower: "Tower 26",
    floor: "Ground",
    stage: "Schematic Design",
    department: "ELV",
    due: daysFromNow(20),
    status: "On Hold",
    owner: "Fatima Khan"
  }
];

let trackerSource = "Sample tracker";

let trackerGroupBy = "tower";

// Always grouped by tower
let trackerQuick = "all";

const trackerFilters = { tower: "all", stage: "all", department: "all", floor: "all", status: "all" };

// Keys look like 'tower:Tower 26', so collapsing a group in one grouping does not collapse the same name in another
const collapsedTrackerGroups = new Set();

const trackerSearch = document.getElementById("tracker-search");

// Basements first, then ground, podium, numbered levels, terrace
// Builds a sort order for free-text floor names: basements (deepest first), ground, podium, numbered levels, terrace, then 'all floors'
function floorRank(floor) {
  const value = floor.toLowerCase();
  const number = Number((value.match(/\d+/) || [0])[0]);
  if (/basement|^b\d/.test(value)) return -100 - number;
  if (/ground|^g$|^gf/.test(value)) return 0;
  if (/podium|stilt|plinth/.test(value)) return 1;
  if (/terrace|roof|ohwt/.test(value)) return 1000;
  if (/all|typical/.test(value) && !/\d/.test(value)) return 2000;
  if (/\d/.test(value)) return 10 + number;
  return 1500;
}

const stageRank = (stage) => {
  const index = trackerStages.findIndex((s) => s.toLowerCase() === stage.toLowerCase());
  return index === -1 ? 100 : index;
};

function trackerGroupSort(dimension) {
  if (dimension === "floor") return (a, b) => floorRank(a) - floorRank(b) || a.localeCompare(b);
  if (dimension === "stage") return (a, b) => stageRank(a) - stageRank(b) || a.localeCompare(b);
  return (a, b) => a.localeCompare(b, undefined, { numeric: true });
}

const trackerDue = (item) =>
  // Approved work has no due date to chase, so it never shows as overdue
  item.status === "Approved" ? { label: "—", cls: "due-date", due: "" } : dueInfo(item.due);

function trackerQuickMatches(item) {
  if (trackerQuick === "mine") return item.owner === profileState.name;
  if (trackerQuick === "waiting") return Boolean(item.waiting) && item.status !== "Approved";
  if (trackerQuick === "overdue") return trackerDue(item).due === "overdue";
  if (trackerQuick === "week") return ["today", "tomorrow", "week"].includes(trackerDue(item).due);
  return true;
}

// Flat view order: overdue first, then soonest due date, approved last
function trackerFlatOrder(a, b) {
  const approvedA = a.item.status === "Approved",
    approvedB = b.item.status === "Approved";
  if (approvedA !== approvedB) return approvedA ? 1 : -1;
  return String(a.item.due).localeCompare(String(b.item.due));
}

function trackerMatches(item) {
  const query = trackerSearch.value.trim().toLocaleLowerCase();
  return (
    trackerQuickMatches(item) &&
    Object.entries(trackerFilters).every(([key, value]) => value === "all" || item[key] === value) &&
    `${item.docNo} ${item.title} ${item.owner || ""} ${item.tower} ${item.floor} ${item.stage} ${item.department}`
      .toLocaleLowerCase()
      .includes(query)
  );
}

function renderTrackerFilters() {
  const keys = ["tower", "floor", "stage", "department", "status"];
  const labels = { ...trackerDimensions, status: "Status" };
  document.getElementById("tracker-filters").innerHTML =
    keys
      .map((key) => {
        const values = [...new Set(deliverableTracker.map((item) => item[key]))].sort(
          key === "status" ? undefined : trackerGroupSort(key)
        );
        // If an import removes the selected value, reset that filter instead of showing an empty table
        if (trackerFilters[key] !== "all" && !values.includes(trackerFilters[key])) trackerFilters[key] = "all";
        return `
      <div class="tracker-filter">
        <label for="tracker-filter-${key}">${labels[key]}</label>
        <select id="tracker-filter-${key}" data-tracker-filter="${key}">
          <option value="all">All</option>
          ${values.map((value) => `<option${trackerFilters[key] === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}
        </select>
      </div>`;
      })
      .join("") +
    '<button class="clear-team-selection tracker-clear" type="button" data-tracker-clear-filters>Clear filters</button>';

  const active = Object.values(trackerFilters).filter((value) => value !== "all").length;
  const badge = document.getElementById("tracker-filter-count");
  badge.textContent = active;
  badge.hidden = active === 0;
}

function renderTracker() {
  const columns = [
    ["docNo", "Doc No."],
    ["title", "Deliverable"],
    ["tower", "Tower"],
    ["floor", "Floor"],
    ["stage", "Stage"],
    ["department", "Department"],
    ["source", "Source"],
    ["received", "Date Received"],
    ["due", "Due Date"],
    ["status", "Status"]
  ].filter(([key]) => key !== trackerGroupBy); // the grouped column would repeat the group header
  const flat = trackerGroupBy === "none";

  document.getElementById("tracker-head").innerHTML =
    `<tr>${columns.map(([, label]) => `<th scope="col">${label}</th>`).join("")}</tr>`;

  // Carry the original index through filtering; the row's data-tracker-index is how the details drawer finds the right deliverable
  const visible = deliverableTracker.map((item, index) => ({ item, index })).filter(({ item }) => trackerMatches(item));
  if (flat) visible.sort(trackerFlatOrder);
  const groups = new Map();
  visible.forEach((entry) => {
    const key = entry.item[trackerGroupBy] || "Unassigned";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  });

  const cell = (item, key) => {
    if (key === "title") {
      const parts = [
        item.owner ? escapeHtml(item.owner) : "",
        item.waiting ? `<span class="waiting-tag">Waiting on ${escapeHtml(item.waiting)}</span>` : ""
      ].filter(Boolean);
      return `<strong>${escapeHtml(item.title)}</strong>${parts.length ? `<span class="row-subtitle">${parts.join(" · ")}</span>` : ""}`;
    }
    if (key === "due") {
      const due = trackerDue(item);
      return `<span class="status ${due.cls}">${due.label}</span>`;
    }
    if (key === "status")
      return `<span class="task-state ${deliverableStateClass[item.status] || "pending"}">${escapeHtml(item.status)}</span>`;
    return escapeHtml(item[key] || "—");
  };

  const rowHtml = ({ item, index }) => `
        <tr class="project-task-row tracker-row${item.status === "Approved" ? " is-approved" : ""}" data-tracker-index="${index}" tabindex="0">
          ${columns.map(([colKey]) => `<td>${cell(item, colKey)}</td>`).join("")}
        </tr>`;
  const sortedKeys = flat ? [] : [...groups.keys()].sort(trackerGroupSort(trackerGroupBy));
  document.getElementById("tracker-list").innerHTML = flat
    ? visible.map(rowHtml).join("")
    : sortedKeys
        .map((key) => {
          const entries = groups.get(key);
          const approved = entries.filter(({ item }) => item.status === "Approved").length;
          const overdue = entries.filter(({ item }) => trackerDue(item).due === "overdue").length;
          const open = !collapsedTrackerGroups.has(`${trackerGroupBy}:${key}`);
          return `
      <tr class="project-task-group-row"><th colspan="${columns.length}">
        <button class="task-group-toggle" type="button" data-tracker-toggle="${escapeHtml(key)}" aria-expanded="${open}">
          <span class="task-group-chevron" aria-hidden="true"></span>
          <span>${escapeHtml(key)}</span>
          <span class="task-group-count">${String(entries.length).padStart(2, "0")}</span>
          <span class="tracker-group-meta">
            ${overdue ? `<span class="status overdue">${overdue} overdue</span>` : ""}
            <span class="report-meter" aria-hidden="true"><span style="width:${Math.round((approved / entries.length) * 100)}%"></span></span>
            ${approved}/${entries.length} approved
          </span>
        </button>
      </th></tr>
      ${
        open
          ? entries
              .map(
                ({ item, index }) => `
        <tr class="project-task-row tracker-row${item.status === "Approved" ? " is-approved" : ""}" data-tracker-index="${index}" tabindex="0">
          ${columns.map(([colKey]) => `<td>${cell(item, colKey)}</td>`).join("")}
        </tr>`
              )
              .join("")
          : ""
      }`;
        })
        .join("");

  document.getElementById("tracker-empty").hidden = visible.length !== 0;

  const approvedTotal = deliverableTracker.filter((item) => item.status === "Approved").length;
  const overdueTotal = deliverableTracker.filter((item) => trackerDue(item).due === "overdue").length;
  document.getElementById("tracker-summary").innerHTML = `
    <span><strong>${deliverableTracker.length}</strong> deliverables</span>
    <span><strong>${approvedTotal}</strong> approved</span>
    <span class="${overdueTotal ? "waiting-tag" : ""}"><strong>${overdueTotal}</strong> overdue</span>
    <span>${new Set(deliverableTracker.map((item) => item.tower)).size} towers · ${new Set(deliverableTracker.map((item) => item.floor)).size} floors · ${new Set(deliverableTracker.map((item) => item.stage)).size} stages · ${new Set(deliverableTracker.map((item) => item.department)).size} departments</span>
    <span class="tracker-source">Source: ${escapeHtml(trackerSource)}</span>`;

  renderTrackerFilters();
  renderOverviewDisciplines();
}

// The overview's "Deliverables by discipline" panel and header metric come from the tracker
const disciplineIcons = {
  Electrical: "ϟ",
  HVAC: "⌁",
  Mechanical: "⌁",
  Plumbing: "♨",
  "Fire Fighting": "♨",
  ELV: "◈",
  Coordinated: "◎"
};

function renderOverviewDisciplines() {
  const counts = { overdue: 0, week: 0, progress: 0, approved: 0 };
  deliverableTracker.forEach((item) => {
    if (item.status === "Approved") {
      counts.approved += 1;
      return;
    }
    const due = trackerDue(item).due;
    if (due === "overdue") counts.overdue += 1;
    else if (["today", "tomorrow", "week"].includes(due)) counts.week += 1;
    if (item.status === "In Progress" || item.status === "In Review") counts.progress += 1;
  });
  const tile = (n, label, tone) => `<div class="deliv-tile ${tone}"><strong>${n}</strong><span>${label}</span></div>`;
  const next = deliverableTracker
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.status !== "Approved")
    .sort(trackerFlatOrder)
    .slice(0, 3);

  document.getElementById("overview-discipline-list").innerHTML = `
    <div class="deliv-tiles">
      ${tile(counts.overdue, "Overdue", counts.overdue ? "is-overdue" : "")}
      ${tile(counts.week, "Due this week", "")}
      ${tile(counts.progress, "In progress", "")}
      ${tile(counts.approved, "Approved", "is-approved")}
    </div>
    <ul class="deliv-next" aria-label="Next deliverables due">
      ${next
        .map(({ item }) => {
          const due = trackerDue(item);
          return `
        <li><span class="deliv-next-title">${escapeHtml(item.title)}</span><span class="status ${due.cls}">${due.label}</span></li>`;
        })
        .join("")}
    </ul>`;

  document.getElementById("overview-discipline-count").textContent =
    `${counts.approved}/${deliverableTracker.length} approved`;
  setText("metric-deliverables", deliverableTracker.length);
  setText("metric-deliverables-overdue", counts.overdue);
}

document.querySelectorAll("[data-tracker-quick]").forEach((chip) => {
  chip.addEventListener("click", () => {
    trackerQuick = chip.dataset.trackerQuick;
    document.querySelectorAll("[data-tracker-quick]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderTracker();
  });
});

trackerSearch.addEventListener("input", renderTracker);

document.getElementById("tracker-filter-btn").addEventListener("click", (e) => {
  const button = e.currentTarget;
  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!expanded));
  document.getElementById("tracker-filters").hidden = expanded;
});

document.getElementById("tracker-filters").addEventListener("change", (e) => {
  const select = e.target.closest("[data-tracker-filter]");
  if (!select) return;
  trackerFilters[select.dataset.trackerFilter] = select.value;
  renderTracker();
});

document.getElementById("tracker-filters").addEventListener("click", (e) => {
  if (!e.target.closest("[data-tracker-clear-filters]")) return;
  Object.keys(trackerFilters).forEach((key) => {
    trackerFilters[key] = "all";
  });
  renderTracker();
});

document.getElementById("tracker-list").addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-tracker-toggle]");
  if (!toggle) return;
  const key = `${trackerGroupBy}:${toggle.dataset.trackerToggle}`;
  if (collapsedTrackerGroups.has(key)) collapsedTrackerGroups.delete(key);
  else collapsedTrackerGroups.add(key);
  renderTracker();
});
