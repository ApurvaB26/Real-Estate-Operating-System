/**
 * File: js/core/utils.js
 * Role: Shared helpers: HTML escaping, dates, due labels, CSV/download, toasts, local storage and the ROLE_RULES permission table.
 * Dependencies: Loaded by index.html as script 2 of 80. Uses globals from js/data/meetings.js, js/utils/dom-helpers.js. Its globals are used by js/components/action-dialog.js, js/components/date-picker.js, js/components/meeting-card.js, js/components/select.js, js/core/router.js, js/features/assistant.js and 40 more.
 */

// Who may do what. Names are exactly the role menu labels in index.html; the menu's data-role equals its label, and the permission checks compare against the current role text.
// Client-side only for now: the backend must enforce the same rules
const ROLE_RULES = {
  // Every role can create projects except these two
  createProjectDenied: ["Pool Team", "Site Team"],
  // Library uploads (policies, makes, MAS, drawings and so on) and the MAS upload icons
  uploadLibrary: ["Super Admin", "L0", "L1", "HOD"],
  // Right rail sections a role does not see (the data-rail-section values in index.html and js/layout/right-rail.js: "focus" is the Needs you first card, "health" is Project health).
  // Site Team keeps the date, calendar and meetings only, so decisions and project counts stay hidden. Roles not listed see the whole rail
  railHidden: { "Site Team": ["focus", "health"] }
};

// Sets an element's text by id and does nothing if the element is not on the page.
// The header metric tiles (team, firms, deliverables, transmittals, meetings) were removed from the design; their counters call this so a missing tile cannot throw and stop start-up (it used to skip Recent Activity)
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Build the Date from parts: new Date('YYYY-MM-DD') parses as UTC and can show the previous day in local time
function parseDateInput(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ISO 8601 week number: weeks start Monday and week 1 is the one containing the year's first Thursday
function getIsoWeek(date) {
  const weekDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  weekDate.setDate(weekDate.getDate() + 3 - ((weekDate.getDay() + 6) % 7));
  const firstThursday = new Date(weekDate.getFullYear(), 0, 4);
  return 1 + Math.round(((weekDate - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
}

// Only one toast at a time so rapid actions do not stack messages
function showToast(message) {
  document.querySelectorAll(".project-toast").forEach((toast) => toast.remove());
  const toast = document.createElement("div");
  toast.className = "project-toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 3500);
}

// Every template string that injects user text must pass through this to avoid HTML injection
function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );
}

const formatTime = (d) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const isToday = (date) => date.toDateString() === new Date().toDateString();

/* SHARED HELPERS */
function dueInfo(dateValue) {
  if (!dateValue) return { due: "", label: "Not set", cls: "due-date" };
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Compare against midnight today so a task due today never counts as overdue
  const difference = Math.round((date - today) / 86400000);
  if (difference < 0) return { due: "overdue", label: "Overdue", cls: "overdue" };
  if (difference === 0) return { due: "today", label: "Due Today", cls: "due-today" };
  if (difference === 1) return { due: "tomorrow", label: "Due Tomorrow", cls: "due-tomorrow" };
  const label = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return { due: difference <= 7 ? "week" : "", label, cls: "due-date" };
}

const toDateInput = (date) => formatDateInput(date);

const initialsOf = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const firstName = (name) => name.split(/\s+/)[0] || name;

const rowTitle = (row) => row.querySelector("strong")?.textContent.trim() || "this item";

// Swap a button's text while keeping its icon
function setButtonLabel(button, label) {
  const textNode = Array.from(button.childNodes)
    .reverse()
    .find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) textNode.textContent = label;
  else button.append(label);
}

// Revoke the object URL after the click so the blob is not kept in memory
function downloadText(filename, text, type = "text/csv") {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

const toCsv = (rows) =>
  rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");

/* PROJECT DELIVERABLES: design deliverable tracker */
const daysFromNow = (days) => toDateInput(new Date(Date.now() + days * 86400000));

const pad2 = (value) => String(value).padStart(2, "0");

const iso = (daysAgo) => toDateInput(new Date(Date.now() - daysAgo * 86400000));

const formatLongDate = (isoDate) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
};

/* PROFILE & SETTINGS */
// Spread over the fallback so newly added settings get defaults for users with older saved data
function loadStored(key, fallback) {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") };
  } catch {
    return { ...fallback };
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing or a full quota can make setItem throw; the app keeps working without saving
    /* storage unavailable */
  }
}

/* RIGHT RAIL WEEK STRIP: pick a day to see its meetings */
const startOfDay = (date) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
};

const weekStartOf = (date) => {
  const day = startOfDay(date);
  day.setDate(day.getDate() - day.getDay());
  return day;
};

const sameDay = (a, b) => a.toDateString() === b.toDateString();
