/**
 * File: js/features/project/tracker-import.js
 * Role: Import the deliverable tracker from Excel or CSV.
 * Dependencies: Loaded by index.html as script 37 of 80. Uses globals from js/components/action-dialog.js, js/core/router.js, js/core/utils.js, js/core/vendor-loaders.js, js/features/profile.js, js/features/project/deliverable-tracker.js and 4 more. Its globals are used by js/features/record-drawer.js.
 */

/* TRACKER IMPORT (Excel / CSV) */
// Header names people commonly use for each tracker column
const trackerColumnAliases = {
  docNo: [
    "doc no",
    "document no",
    "document number",
    "drawing no",
    "drawing number",
    "dwg no",
    "sheet no",
    "ref no",
    "reference no",
    "doc id",
    "number"
  ],
  title: [
    "document",
    "document name",
    "document title",
    "drawing",
    "drawing name",
    "drawing title",
    "deliverable",
    "deliverable name",
    "title",
    "description",
    "name"
  ],
  tower: ["tower", "wing", "building", "block", "tower wing"],
  floor: ["floor", "level", "storey", "floor level", "floors"],
  stage: ["stage", "design stage", "phase", "submission stage"],
  department: ["department", "dept", "discipline", "service", "services", "trade"],
  due: ["due", "due date", "target date", "planned date", "submission date", "target", "planned submission"],
  status: ["status", "current status", "state"],
  owner: ["owner", "responsible", "assigned to", "prepared by", "in charge"]
};

const trackerFieldLabels = {
  docNo: "Doc No.",
  title: "Document",
  tower: "Tower",
  floor: "Floor",
  stage: "Stage",
  department: "Department",
  due: "Due date",
  status: "Status",
  owner: "Owner"
};

const normalizeHeader = (header) =>
  String(header ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function matchTrackerColumns(headerRow) {
  const headers = headerRow.map(normalizeHeader);
  const mapping = {};
  const used = new Set();
  // Exact header matches first, then headers that contain a known name ("Drawing Title (Rev)")
  [(header, alias) => header === alias, (header, alias) => alias.length > 3 && header.includes(alias)].forEach(
    (test) => {
      Object.entries(trackerColumnAliases).forEach(([field, aliases]) => {
        if (mapping[field] !== undefined) return;
        const index = headers.findIndex(
          (header, i) => header && !used.has(i) && aliases.some((alias) => test(header, alias))
        );
        if (index !== -1) {
          mapping[field] = index;
          used.add(index);
        }
      });
    }
  );
  const unmatched = headerRow.filter((header, i) => String(header).trim() && !used.has(i)).map(String);
  return { mapping, unmatched };
}

// Hand-written parser (no library) so CSV import works offline; it handles quoted commas, doubled quotes and both \n and \r\n line ends
function parseCsv(text) {
  const firstLine = text.split(/\r?\n/, 1)[0];
  // Guess the separator by whichever one splits the first line into most pieces; Excel in some regions exports with ';'
  const delimiter = [",", ";", "\t"].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(value);
      value = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value || row.length) rows.push([...row, value]);
  return rows;
}

async function readTrackerRows(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (extension === "csv" || extension === "txt") return parseCsv(await file.text());
  if (extension === "xlsx" || extension === "xls") {
    const XLSX = await loadSheetJs();
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: true, defval: "" });
  }
  throw new Error("Use an .xlsx, .xls or .csv file.");
}

function parseTrackerDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return toDateInput(value);
  if (typeof value === "number" && value > 20000 && value < 80000) {
    // Excel stores dates as day counts; read them as UTC so the local timezone cannot shift the day
    const date = new Date(Math.round(value - 25569) * 86400000);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  }
  const text = String(value ?? "").trim();
  if (!text) return "";
  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) return toDateInput(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/); // day-first, as used on Indian sites
  if (match) {
    const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
    return toDateInput(new Date(year, Number(match[2]) - 1, Number(match[1])));
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? "" : toDateInput(parsed);
}

// Order matters: 'pending' must be tested before 'approv…' and 'issued for construction' before plain 'issued', because the first matching rule wins
function normalizeTrackerStatus(value) {
  const text = String(value ?? "").toLowerCase();
  if (!text.trim()) return "Not Started";
  if (/not\s*started|yet to|pending|to do|todo/.test(text)) return "Not Started";
  if (/approv|complete|done|closed|issued for construction|accepted/.test(text)) return "Approved";
  if (/review|comment/.test(text)) return "In Review";
  if (/submit|issued/.test(text)) return "Submitted";
  if (/hold/.test(text)) return "On Hold";
  if (/progress|wip|ongoing|started|drafting/.test(text)) return "In Progress";
  return "Not Started";
}

// Maps abbreviations people type (SD, DD, GFC) to the app's standard stage names so filters and grouping stay clean
function normalizeStage(value) {
  const text = String(value ?? "").trim();
  const key = text.toLowerCase().replace(/[^a-z]/g, "");
  const known = {
    sd: "Schematic Design",
    schematic: "Schematic Design",
    schematicdesign: "Schematic Design",
    dd: "Design Development",
    designdevelopment: "Design Development",
    gfc: "GFC",
    vfc: "VFC",
    tender: "Tender",
    concept: "Concept",
    conceptdesign: "Concept",
    asbuilt: "As-built"
  };
  return known[key] || text || "Unassigned";
}

function normalizeDepartment(value) {
  const text = String(value ?? "").trim();
  const key = text.toLowerCase().replace(/[^a-z]/g, "");
  const known = {
    el: "Electrical",
    ele: "Electrical",
    elec: "Electrical",
    electrical: "Electrical",
    ph: "Plumbing",
    phe: "Plumbing",
    plb: "Plumbing",
    plumbing: "Plumbing",
    hvac: "HVAC",
    mech: "HVAC",
    mechanical: "HVAC",
    ff: "Fire Fighting",
    fire: "Fire Fighting",
    fps: "Fire Fighting",
    firefighting: "Fire Fighting",
    elv: "ELV",
    coordinated: "Coordinated",
    coord: "Coordinated"
  };
  return known[key] || text || "Unassigned";
}

function trackerItemsFromRows(rows) {
  // The header may sit below a title block ("Project X - MEP Deliverables"), so take the row
  // in the first 10 that matches the most column names and includes a document column
  let headerIndex = -1;
  let bestScore = 0;
  rows.slice(0, 10).forEach((row, index) => {
    const { mapping } = matchTrackerColumns(row);
    const score = Object.keys(mapping).length;
    if (mapping.title !== undefined && score > bestScore) {
      headerIndex = index;
      bestScore = score;
    }
  });
  if (headerIndex === -1) {
    throw new Error(
      'Couldn\'t find a document name column. Add a header such as "Document Name" or "Drawing Title" — or start from the template.'
    );
  }
  const { mapping, unmatched } = matchTrackerColumns(rows[headerIndex]);
  const get = (row, field) => (mapping[field] === undefined ? "" : row[mapping[field]]);
  const items = [];
  let skipped = 0;

  rows.slice(headerIndex + 1).forEach((row) => {
    if (!row.some((value) => String(value).trim())) return; // blank line
    const title = String(get(row, "title")).trim();
    if (!title) {
      skipped += 1;
      return;
    }
    items.push({
      // Rows without a doc number get a generated IMP-### so every deliverable still has a unique reference
      docNo: String(get(row, "docNo")).trim() || `IMP-${String(items.length + 1).padStart(3, "0")}`,
      title,
      tower: String(get(row, "tower")).trim() || "Unassigned",
      floor: String(get(row, "floor")).trim() || "Unassigned",
      stage: normalizeStage(get(row, "stage")),
      department: normalizeDepartment(get(row, "department")),
      due: parseTrackerDate(get(row, "due")),
      status: normalizeTrackerStatus(get(row, "status")),
      owner: String(get(row, "owner")).trim()
    });
  });

  return { items, skipped, matched: Object.keys(mapping).map((field) => trackerFieldLabels[field]), unmatched };
}

async function importTrackerFile(file, replace) {
  try {
    actionSubmit.disabled = true;
    actionSubmit.textContent = "Reading file…";
    const { items, skipped, matched, unmatched } = trackerItemsFromRows(await readTrackerRows(file));
    if (!items.length) throw new Error("The file has a header row but no deliverables under it.");

    // Replace swaps the whole tracker; Add appends to the existing list
    deliverableTracker = replace ? items : [...deliverableTracker, ...items];
    trackerSource = `${file.name} · imported ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
    Object.keys(trackerFilters).forEach((key) => {
      trackerFilters[key] = "all";
    });
    collapsedTrackerGroups.clear();
    renderTracker();
    prependActivity({
      initials: initialsOf(profileState.name),
      text: `${initialsOf(profileState.name)} imported <b>${items.length} deliverables</b> from ${escapeHtml(file.name)}`,
      tag: "Tracker"
    });
    closeActionDialog();

    const count = (key) => new Set(items.map((item) => item[key])).size;
    openActionDialog({
      title: `Imported ${items.length} deliverable${items.length === 1 ? "" : "s"}`,
      subtitle: file.name,
      body: detailList([
        ["Towers", String(count("tower"))],
        ["Floors", String(count("floor"))],
        ["Stages", String(count("stage"))],
        ["Departments", String(count("department"))],
        ["Columns read", matched.join(", ")],
        ["Columns ignored", unmatched.join(", ")],
        ["Rows skipped", skipped ? `${skipped} without a document name` : ""]
      ]),
      submitLabel: null,
      cancelLabel: "View tracker"
    });
  } catch (error) {
    setActionError(error.message);
  } finally {
    actionSubmit.disabled = false;
    if (actionConfig) actionSubmit.textContent = actionConfig.submitLabel || "Save";
  }
}

const trackerTemplate = [
  ["Doc No", "Document Name", "Tower", "Floor", "Stage", "Department", "Due Date", "Status", "Owner"],
  [
    "LB-EL-T26-101",
    "Electrical lighting layout",
    "Tower 26",
    "L1–L10",
    "GFC",
    "Electrical",
    daysFromNow(14),
    "In Progress",
    "Fatima Khan"
  ],
  [
    "LB-PH-T16-110",
    "Drainage calculations",
    "Tower 16",
    "Basement 1",
    "DD",
    "Plumbing",
    daysFromNow(21),
    "Not Started",
    "Riya Shah"
  ],
  [
    "LB-FF-UGT2-220",
    "Fire pump room layout",
    "UGT 2",
    "Basement 2",
    "VFC",
    "Fire Fighting",
    daysFromNow(-5),
    "Approved",
    "Apurva Bhadange"
  ]
];

function openTrackerImportDialog() {
  openActionDialog({
    title: "Import deliverable tracker",
    subtitle: overviewPage.querySelector(".project-title").textContent,
    body: `
      <p class="action-dialog-text">Upload the design deliverable list as Excel or CSV. Columns are matched by their header: a <b>Document / Drawing name</b> column is required; Doc No., Tower, Floor, Stage, Department, Due date, Status and Owner are read when present.</p>
      <button class="comment-btn tracker-template-btn" type="button" data-tracker-template>
        ${icon("download", 14)}
        Download CSV template
      </button>`,
    fields: [
      { name: "file", label: "Tracker file (.xlsx, .xls, .csv)", type: "file", accept: ".xlsx,.xls,.csv" },
      {
        name: "mode",
        label: "Import as",
        type: "select",
        options: ["Replace the current tracker", "Add to the current tracker"]
      }
    ],
    submitLabel: "Import",
    onSubmit(values) {
      if (!values.file) {
        setActionError("Choose a file to import.");
        return false;
      }
      importTrackerFile(values.file, values.mode.startsWith("Replace"));
      return false; // the import closes the dialog once the file is read
    }
  });
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-tracker-import]")) openTrackerImportDialog();
  if (e.target.closest("[data-tracker-template]"))
    downloadText("deliverable-tracker-template.csv", toCsv(trackerTemplate));
});
