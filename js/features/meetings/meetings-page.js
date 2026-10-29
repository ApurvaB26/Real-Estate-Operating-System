/**
 * File: js/features/meetings/meetings-page.js
 * Role: Meetings page (All / Upcoming / Past pills, Filters popup with date range and projects, search) and MOM tracker list.
 * Dependencies: Loaded by index.html as script 52 of 80. Uses globals from js/components/action-dialog.js, js/components/layers.js, js/components/meeting-card.js, js/core/router.js, js/core/utils.js, js/data/meetings.js and 1 more. Its globals are used by js/core/router.js, js/features/assistant.js, js/features/meetings/meeting-notes.js, js/features/meetings/meeting-requests.js, js/layout/right-rail.js.
 */

/* MEETINGS PAGE + MOM TRACKER */
let meetingWhenFilter = "upcoming";

// Applied Filters popup state: an optional From/To day range and the ticked projects (none ticked means every project)
const meetingFilters = { from: "", to: "", projects: new Set() };

let momStatusFilter = "all";

const meetingsSearch = document.getElementById("meetings-search");

const momSearch = document.getElementById("mom-search");

function dayLabel(date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-GB", { weekday: "long" });
}

// Past cards show whether minutes exist yet, so missing MOMs stand out
function minutesChipFor(m) {
  if (m.end > Date.now()) return null;
  const entry = momEntries.find((e) => e.meetingId === m.id);
  if (!entry) return { text: "No minutes yet", cls: "soon" };
  return entry.status === "shared" ? { text: "Minutes shared", cls: "" } : { text: "Minutes in draft", cls: "" };
}

function renderMeetingsPage() {
  const now = Date.now();
  const when = meetingWhenFilter;
  const query = meetingsSearch.value.trim().toLocaleLowerCase();
  const from = parseDateInput(meetingFilters.from);
  const to = parseDateInput(meetingFilters.to);
  // To is inclusive: a meeting on that day still counts, so the limit is the start of the next day
  const toLimit = to && new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1);
  const visible = meetings
    .filter(
      (m) =>
        (when === "all" || (when === "past" ? m.end <= now : m.end > now)) &&
        (!from || m.start >= from) &&
        (!toLimit || m.start < toLimit) &&
        (!meetingFilters.projects.size || meetingFilters.projects.has(m.project)) &&
        `${m.title} ${m.place} ${m.project}`.toLocaleLowerCase().includes(query)
    )
    // Upcoming and live meetings first (soonest first), then ended ones (latest first)
    .sort((a, b) => {
      const aPast = a.end <= now;
      const bPast = b.end <= now;
      if (aPast !== bPast) return aPast ? 1 : -1;
      return aPast ? b.start - a.start : a.start - b.start;
    });

  // Map keeps insertion order, and the list is already sorted, so days appear chronologically
  const days = new Map();
  visible.forEach((m) => {
    const key = m.start.toDateString();
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(m);
  });

  document.getElementById("meeting-days").innerHTML = days.size
    ? Array.from(
        days.values(),
        (list) => `
      <section class="meeting-day">
        <h2 class="meeting-day-title">${dayLabel(list[0].start)} <span>${list[0].start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></h2>
        <div class="meeting-grid">${list.map((m) => createMeetingCard(m, "full", { minutesChip: minutesChipFor(m) })).join("")}</div>
      </section>`
      ).join("")
    : `<p class="schedule-empty">${when === "past" ? "No past meetings match these filters." : when === "upcoming" ? "No upcoming meetings match these filters." : "No meetings match these filters."}</p>`;
  updateMeetingsFilterBadge();
}

const momEntries = [
  {
    id: "mom1",
    meetingId: "m10",
    subject: "Elanor Coordination Meeting",
    date: iso(7),
    recordedBy: "Apurva Bhadange",
    text: "Agreed riser shaft sizes for Tower 26.\nSachin to issue revised shaft layout by Friday.\nConsultant to confirm chiller weights.",
    status: "shared"
  },
  {
    id: "mom2",
    meetingId: "m9",
    subject: "MEP Design Review",
    date: iso(5),
    recordedBy: "Sachin Patil",
    text: "Reviewed basement ventilation strategy.\nApproved jet fan layout for B1 and B2.\nNeha to follow up on fire damper schedule.\nRohit to share site photos of UGT 2.",
    status: "shared"
  },
  {
    id: "mom3",
    meetingId: "m8",
    subject: "Fire Strategy Call",
    date: iso(2),
    recordedBy: "Apurva Bhadange",
    text: "Authority comments on refuge floor discussed.\nVerdant to send revised fire strategy report.",
    status: "draft"
  }
];

let editingMomId = null;

// Minutes belong to a meeting by id, so renaming the subject keeps the link
let editingMeetingId = null;

// Heuristic for spotting action items in free-text minutes ('Sachin to issue…', 'follow-up', 'Action:'); used by both the counter and the summariser
const actionItemPattern =
  /\b(to|will)\s+(issue|send|share|confirm|follow|review|update|submit|prepare|check)|follow[- ]?up|action:|owner:/i;

const countActionItems = (text) => text.split(/\n+/).filter((line) => actionItemPattern.test(line)).length;

function renderMom() {
  const query = momSearch.value.trim().toLocaleLowerCase();
  const visible = momEntries
    .filter(
      (entry) =>
        (momStatusFilter === "all" || entry.status === momStatusFilter) &&
        `${entry.subject} ${entry.recordedBy} ${entry.text}`.toLocaleLowerCase().includes(query)
    )
    // ISO dates (YYYY-MM-DD) sort correctly as plain strings; newest first
    .sort((a, b) => b.date.localeCompare(a.date));

  document.getElementById("mom-rows").innerHTML = visible.length
    ? visible
        .map(
          (entry) => `
      <tr class="project-task-row">
        <td><strong>${escapeHtml(entry.subject)}</strong><span class="row-subtitle">${escapeHtml(entry.text.split("\n")[0] || "No notes yet")}</span></td>
        <td>${formatLongDate(entry.date)}</td>
        <td>${escapeHtml(entry.recordedBy)}</td>
        <td>${countActionItems(entry.text)}</td>
        <td><span class="task-state ${entry.status === "shared" ? "completed" : "pending"}">${entry.status === "shared" ? "Shared" : "Draft"}</span></td>
        <td><button class="comment-btn" type="button" data-mom-edit="${entry.id}">Edit</button> <button class="comment-btn" type="button" data-mom-tasks="${entry.id}">Convert to tasks</button></td>
      </tr>`
        )
        .join("")
    : '<tr><td colspan="6" class="drawer-empty mom-empty">No minutes match these filters.</td></tr>';
}

function setMeetingsTab(tab) {
  if (tab !== "mom") tab = "schedule";
  document.querySelectorAll("[data-meetings-tab]").forEach((button) => {
    const isActive = button.dataset.meetingsTab === tab;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-meetings-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.meetingsPanel !== tab;
  });
  if (tab === "mom") renderMom();
  else renderMeetingsPage();
  renderBreadcrumb([
    { label: "Dashboard", view: "dashboard" },
    { label: "Meetings", route: "meetings" },
    { label: tab === "mom" ? "MOM Tracker" : "Schedule" }
  ]);
  syncHash(tab === "mom" ? "meetings/mom" : "meetings");
}

function showMeetings(tab) {
  showPage("meetings");
  setMeetingsTab(tab);
}

document.querySelectorAll("[data-meetings-tab]").forEach((button) => {
  button.addEventListener("click", () => setMeetingsTab(button.dataset.meetingsTab));
});

document.querySelectorAll("[data-mom-status]").forEach((chip) => {
  chip.addEventListener("click", () => {
    momStatusFilter = chip.dataset.momStatus;
    document.querySelectorAll("[data-mom-status]").forEach((c) => {
      c.classList.toggle("active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderMom();
  });
});

document.querySelectorAll("[data-meeting-when]").forEach((chip) => {
  chip.addEventListener("click", () => {
    meetingWhenFilter = chip.dataset.meetingWhen;
    document.querySelectorAll("[data-meeting-when]").forEach((c) => {
      c.classList.toggle("active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderMeetingsPage();
  });
});

/* FILTERS POPUP: date range and projects, opened from the Filters button under the pills */
const meetingsFilterBtn = document.getElementById("meetings-filter-btn");

const meetingsFilterPop = document.getElementById("meetings-filter-pop");

const meetingsFromInput = document.getElementById("meetings-from");

const meetingsToInput = document.getElementById("meetings-to");

const meetingsFilterError = document.getElementById("meetings-filter-error");

// Badge counts the active parts: the date range (one) plus every ticked project
function updateMeetingsFilterBadge() {
  const count = (meetingFilters.from || meetingFilters.to ? 1 : 0) + meetingFilters.projects.size;
  const badge = document.getElementById("meetings-filter-count");
  badge.textContent = count;
  badge.hidden = !count;
  meetingsFilterBtn.classList.toggle("has-filters", count > 0);
}

// One checkbox per project that has meetings, built from the data so newly scheduled projects appear too
function renderMeetingsFilterProjects() {
  const projects = [...new Set(meetings.map((m) => m.project).filter(Boolean))].sort();
  document.getElementById("meetings-filter-projects").innerHTML = projects
    .map(
      (p) =>
        `<label class="meetings-filter-check"><input type="checkbox" name="meetings-project" value="${escapeHtml(p)}"${meetingFilters.projects.has(p) ? " checked" : ""}><span>${escapeHtml(p)}</span></label>`
    )
    .join("");
}

// The popup is fixed-position so no card clips it; measurements are in screen pixels, but fixed top/left are scaled by the page zoom, so convert to CSS pixels first
function positionMeetingsFilter() {
  const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  const button = meetingsFilterBtn.getBoundingClientRect();
  const width = meetingsFilterPop.offsetWidth;
  const viewportWidth = window.innerWidth / zoom;
  const viewportHeight = window.innerHeight / zoom;
  const top = button.bottom / zoom + 8;
  const left = Math.min(Math.max(12, button.left / zoom), viewportWidth - width - 12);
  meetingsFilterPop.style.top = `${top}px`;
  meetingsFilterPop.style.left = `${left}px`;
  meetingsFilterPop.style.maxHeight = `${Math.max(240, viewportHeight - top - 12)}px`;
}

function setMeetingsFilterOpen(open, returnFocus = false) {
  if (open) {
    // Always start from what is applied, so closing without Apply discards edits
    meetingsFromInput.value = meetingFilters.from;
    meetingsToInput.value = meetingFilters.to;
    meetingsFilterError.hidden = true;
    renderMeetingsFilterProjects();
  }
  meetingsFilterPop.hidden = !open;
  meetingsFilterBtn.setAttribute("aria-expanded", String(open));
  if (open) {
    positionMeetingsFilter();
    meetingsFilterPop.querySelector(".date-picker > summary, input")?.focus();
  } else if (returnFocus) {
    meetingsFilterBtn.focus();
  }
}

meetingsFilterBtn.addEventListener("click", () => setMeetingsFilterOpen(meetingsFilterPop.hidden));

meetingsFilterPop.querySelector("[data-meetings-filter-close]").addEventListener("click", () => setMeetingsFilterOpen(false, true));

document.getElementById("meetings-filter-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (meetingsFromInput.value && meetingsToInput.value && meetingsFromInput.value > meetingsToInput.value) {
    meetingsFilterError.hidden = false;
    return;
  }
  meetingFilters.from = meetingsFromInput.value;
  meetingFilters.to = meetingsToInput.value;
  meetingFilters.projects = new Set([...meetingsFilterPop.querySelectorAll("input[name=meetings-project]:checked")].map((box) => box.value));
  setMeetingsFilterOpen(false, true);
  renderMeetingsPage();
});

// Clear All resets the range and the ticks and applies that straight away; the popup stays open
document.getElementById("meetings-filter-clear").addEventListener("click", () => {
  meetingFilters.from = "";
  meetingFilters.to = "";
  meetingFilters.projects = new Set();
  meetingsFromInput.value = "";
  meetingsToInput.value = "";
  meetingsFilterError.hidden = true;
  renderMeetingsFilterProjects();
  renderMeetingsPage();
});

// composedPath still names the popup after a calendar day click removed the clicked button from the page
document.addEventListener("click", (e) => {
  if (meetingsFilterPop.hidden) return;
  const path = e.composedPath();
  if (!path.includes(meetingsFilterPop) && !path.includes(meetingsFilterBtn)) setMeetingsFilterOpen(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !meetingsFilterPop.hidden) setMeetingsFilterOpen(false, true);
});

window.addEventListener("resize", () => {
  if (!meetingsFilterPop.hidden) positionMeetingsFilter();
});

meetingsSearch.addEventListener("input", renderMeetingsPage);

momSearch.addEventListener("input", renderMom);

// Join / MOM Tracker on any meeting card (rail, rail overlay, meetings page)
document.addEventListener("click", (e) => {
  const button = e.target.closest('.meeting-card [data-action="join"], .meeting-card [data-action="mom"]');
  if (!button) return;
  const meeting = meetings.find((m) => m.id === button.closest(".meeting-card").dataset.meetingId);
  if (!meeting) return;

  if (button.dataset.action === "mom") {
    momSearch.value = meeting.title;
    showMeetings("mom");
    return;
  }

  const rejoining = meeting.joined;
  meeting.joined = true;
  renderSchedule();
  showToast(`${rejoining ? "Rejoining" : "Joining"} "${meeting.title}" on Teams…`);
});

// Reply menu on Going / Maybe / Can't go
function closeRsvpMenus(except) {
  document.querySelectorAll(".meeting-rsvp-menu:not([hidden])").forEach((menu) => {
    if (menu === except) return;
    menu.hidden = true;
    menu.previousElementSibling.setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("click", (e) => {
  const toggle = e.target.closest('.meeting-card [data-action="rsvp"]');
  const option = e.target.closest(".meeting-rsvp-menu [data-rsvp]");
  if (toggle) {
    const menu = toggle.nextElementSibling;
    closeRsvpMenus(menu);
    menu.hidden = !menu.hidden;
    toggle.setAttribute("aria-expanded", String(!menu.hidden));
    if (!menu.hidden) menu.querySelector('[aria-checked="true"]')?.focus();
    return;
  }
  if (option) {
    const meeting = meetings.find((m) => m.id === option.closest(".meeting-card").dataset.meetingId);
    meeting.rsvp = option.dataset.rsvp;
    renderSchedule();
    showToast(`Replied "${rsvpLabels[meeting.rsvp]}" to ${meeting.title}.`);
    return;
  }
  if (!e.target.closest(".meeting-rsvp")) closeRsvpMenus();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeRsvpMenus();
});

// Agenda: what the meeting will cover, written before it starts
document.addEventListener("click", (e) => {
  const button = e.target.closest('.meeting-card [data-action="agenda"]');
  if (!button) return;
  const meeting = meetings.find((m) => m.id === button.closest(".meeting-card").dataset.meetingId);
  openActionDialog({
    title: "Agenda",
    subtitle: `${meeting.title} · ${formatTime(meeting.start)} - ${formatTime(meeting.end)}`,
    fields: [{ name: "agenda", label: "Points to cover", type: "textarea", value: meeting.agenda || "" }],
    submitLabel: "Save Agenda",
    onSubmit(values) {
      meeting.agenda = values.agenda;
      showToast("Agenda saved.");
    }
  });
});
