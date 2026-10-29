/**
 * File: js/layout/right-rail.js
 * Role: Right rail: date header, Directory button, week strip with the month label that opens the month calendar, schedule list and the collapsed mini rail.
 * Dependencies: Loaded by index.html as script 26 of 80. Uses globals from js/components/meeting-card.js, js/core/router.js, js/core/utils.js, js/data/meetings.js, js/features/meetings/meetings-page.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/components/date-picker.js, js/features/create-project.js, js/features/meetings/meetings-page.js, js/features/project/workspace.js, js/features/reporting.js, js/main.js.
 */

/* RIGHT RAIL CALENDAR */
// The month label above the week strip opens the month calendar
const calendarBtn = document.getElementById("rail-month-btn");

const railCalendar = document.getElementById("rail-calendar");

let viewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

let selectedDate = null;

function renderRailCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayString = new Date().toDateString();

  railCalendar.querySelector(".calendar-month-label").textContent = viewDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });

  // Grid starts on the Sunday on/before the 1st; always 42 cells (6 weeks) so the calendar height never jumps between months
  const start = new Date(year, month, 1 - viewDate.getDay());
  // The week (Sunday to Saturday) holding the selected day stays full black; the rest of the month is dimmed
  const weekStart = new Date(railSelectedDay.getFullYear(), railSelectedDay.getMonth(), railSelectedDay.getDate() - railSelectedDay.getDay());
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);
  let html = "";

  for (let i = 0; i < 42; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);

    let classes = "calendar-day";
    if (day.getMonth() !== month) classes += " outside-month";
    if (day.toDateString() === todayString) classes += " is-today";
    if (day >= weekStart && day < weekEnd) classes += " in-selected-week";
    if (selectedDate && day.toDateString() === selectedDate) classes += " is-selected";

    html += `<button class="${classes}" type="button" data-date="${day.toDateString()}">${day.getDate()}</button>`;
  }

  railCalendar.querySelector(".calendar-days").innerHTML = html;
}

// Opening shows the month of the selected day with that day marked; closing from the keyboard returns focus to the label
function setRailCalendar(open, returnFocus = false) {
  if (open) {
    viewDate = new Date(railSelectedDay.getFullYear(), railSelectedDay.getMonth(), 1);
    selectedDate = railSelectedDay.toDateString();
    renderRailCalendar();
  }
  const strip = document.querySelector(".rail-week-strip");
  const from = strip.offsetHeight;
  railCalendar.hidden = !open;
  calendarBtn.setAttribute("aria-expanded", String(open));
  // The month calendar takes the place of the week strip while it is open, and the block grows or shrinks smoothly (skipped for reduced motion)
  strip.classList.toggle("is-expanded", open);
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const to = strip.offsetHeight;
    strip.style.height = `${from}px`;
    strip.style.overflow = "hidden";
    requestAnimationFrame(() => {
      strip.style.transition = "height 0.2s ease";
      strip.style.height = `${to}px`;
    });
    setTimeout(() => { strip.style.height = ""; strip.style.overflow = ""; strip.style.transition = ""; }, 240);
  }
  if (!open && returnFocus) calendarBtn.focus();
}

calendarBtn.addEventListener("click", () => setRailCalendar(railCalendar.hidden));

// The month title inside the open calendar folds it back into the week strip
railCalendar.querySelector(".calendar-month-label").addEventListener("click", () => setRailCalendar(false, true));

railCalendar.querySelector(".calendar-month-prev").addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  renderRailCalendar();
});

railCalendar.querySelector(".calendar-month-next").addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  renderRailCalendar();
});

railCalendar.querySelector(".calendar-days").addEventListener("click", (e) => {
  const dayBtn = e.target.closest(".calendar-day");
  if (!dayBtn) return;
  selectedDate = dayBtn.dataset.date;
  renderRailCalendar();
});

/* CLOSE CALENDAR ON OUTSIDE CLICK */
document.addEventListener("click", (e) => {
  // composedPath instead of contains(): the calendar re-renders its buttons on click, so e.target may already be detached from the DOM
  const path = e.composedPath();
  const clickedInside = path.includes(railCalendar) || path.includes(calendarBtn);

  if (!clickedInside && !railCalendar.hidden) setRailCalendar(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !railCalendar.hidden) setRailCalendar(false, true);
});

// Only one row can be expanded at a time; null means all rows are collapsed
// The one rail row the user has expanded into a compact card
let expandedRailMeeting = null;

function renderSchedule() {
  const showingToday = isToday(railSelectedDay);
  const dayLabelText = railSelectedDay.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
  const dayMeetings = meetings
    // For today hide meetings that have already ended; other days show their full list
    .filter((m) => sameDay(m.start, railSelectedDay) && (!showingToday || m.end > Date.now()))
    .sort((a, b) => a.start - b.start);

  // The first meeting still live or upcoming gets the full compact card
  const nextIndex = dayMeetings.findIndex((m) => m.end > Date.now());

  document.getElementById("schedule-title").textContent = showingToday ? "Meetings" : `Meetings · ${dayLabelText}`;
  document.getElementById("schedule-list").innerHTML = dayMeetings.length
    ? dayMeetings
        .map((m, index) => {
          if (index === nextIndex) return createMeetingCard(m, "compact");
          if (m.id === expandedRailMeeting) return createMeetingCard(m, "compact", { collapsible: true });
          return createMeetingRow(m);
        })
        .join("")
    : `<p class="schedule-empty">${showingToday ? "No upcoming meetings" : `No meetings on ${dayLabelText}`}</p>`;
  renderRailWeek();

  const todayCount = meetings.filter((m) => isToday(m.start)).length;
  setText("metric-meetings", todayCount);

  if (!meetingsView.hidden) renderMeetingsPage();
}

// Re-render every minute so a meeting moves from upcoming to live to finished without a page reload
setInterval(renderSchedule, 60000);

document.getElementById("schedule-list").addEventListener("click", (e) => {
  const row = e.target.closest("[data-meeting-row]");
  const collapse = e.target.closest("[data-meeting-collapse]");
  if (!row && !collapse) return;
  const id = row ? row.dataset.meetingRow : null;
  const previous = expandedRailMeeting;
  expandedRailMeeting = id;
  renderSchedule();
  // Re-rendering replaces the DOM, which would drop focus and break keyboard users
  // Keep keyboard focus on what was just opened or closed
  const list = document.getElementById("schedule-list");
  const focusTarget = id
    ? list.querySelector(`.meeting-card[data-meeting-id="${CSS.escape(id)}"]`)
    : list.querySelector(`[data-meeting-row="${CSS.escape(previous)}"]`);
  focusTarget?.focus();
});

/* COLLAPSED RIGHT RAIL ITEMS */
document.querySelectorAll(".rail-collapse-btn, .rail-expand-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".app").classList.toggle("rail-collapsed");
  });
});

// Icon names (js/core/icons.js) for each rail item's icon key
const railIconNames = { calendar: "calendar-lg", check: "circle-check", video: "video-camera", cube: "box", phone: "phone" };

// Static demo numbers until the reporting API is connected
const healthData = { completed: 38, progress: 24, delayed: 4 };

let overlayWeekOffset = 0;

const railOverlays = {
  calendar() {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay() + overlayWeekOffset * 7);

    const days = [...Array(7)]
      .map((_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        const isToday = d.toDateString() === today.toDateString();
        return `<span class="${isToday ? "is-today" : ""}">${String(d.getDate()).padStart(2, "0")}</span>`;
      })
      .join("");

    return `
    <div class="overlay-top overlay-top-calendar">
      <strong class="overlay-month">${sunday.toLocaleString("en-US", { month: "long", year: "numeric" })}</strong>
      <div class="overlay-arrows">
        <button class="overlay-week-prev" type="button" aria-label="Previous week">${icon("chevron-left", 16)}</button>
        <button class="overlay-week-next" type="button" aria-label="Next week">${icon("chevron-right", 16)}</button>
      </div>
    </div>
    <div class="overlay-week overlay-weekdays"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
    <div class="overlay-week">${days}</div>
  `;
  },

  meeting() {
    const next = meetings.filter((m) => m.end > Date.now()).sort((a, b) => a.start - b.start)[0];

    return `
      <div class="overlay-top"><strong>Next meeting</strong><a href="#meetings" class="rail-view-all" data-route="meetings">View All ↗</a></div>
      ${next ? createMeetingCard(next, "compact") : '<p class="schedule-empty">No upcoming meetings</p>'}
    `;
  },

  health() {
    const total = healthData.completed + healthData.progress + healthData.delayed;
    const row = (cls, label, n) =>
      `<div class="overlay-row"><span class="overlay-dot ${cls}"></span>${label}<strong>${n}</strong></div>`;

    return `
      <div class="overlay-top">
        <div><strong>Project health</strong><small>${total} Total Items</small></div>
        <a href="#reporting" class="rail-view-all" data-view-target="reporting">Details ↗</a>
      </div>
      ${row("success", "Completed", healthData.completed)}
      ${row("progress", "In progress", healthData.progress)}
      ${row("delayed", "Delayed", healthData.delayed)}
    `;
  }
};

// Computed once at load; the collapsed mini rail is not refreshed by the minute timer
const railToday = new Date();

const nextMeetingToday = meetings
  .filter((m) => m.end > Date.now() && isToday(m.start))
  .sort((a, b) => a.start - b.start)[0];

const railMiniItems = [
  {
    icon: "calendar",
    label: "Calendar",
    sub: `${railToday.toLocaleDateString("en-GB", { weekday: "short" })}, ${String(railToday.getDate()).padStart(2, "0")} · ${railToday.toLocaleDateString("en-GB", { month: "short" })}`,
    divider: true,
    overlay: "calendar"
  },
  { icon: "check", label: "Needs you first", pill: "4 pending", divider: true, red: true, route: "focus", section: "focus" },
  {
    icon: "video",
    label: "Meetings",
    count: String(meetings.filter((m) => isToday(m.start)).length).padStart(2, "0"),
    sub: nextMeetingToday ? formatTime(nextMeetingToday.start) : "—",
    overlay: "meeting",
    route: "meetings"
  },
  // Opens the Directory drawer (js/features/people-directory.js); same action as the phone button in the rail header
  { icon: "phone", label: "Directory", divider: true, action: "directory" },
  { icon: "cube", label: "Project health", pill: "4 delayed", divider: true, overlay: "health", route: "reporting", section: "health" }
];

function createRailMiniItem(item) {
  const routeAttrs = item.route
    ? ` data-route="${item.route}" role="link" tabindex="0" aria-label="Open ${item.label}"`
    : "";
  // data-rail-section lets roles.js hide this item (and its divider) for roles that may not see it (ROLE_RULES.railHidden)
  const sectionAttr = item.section ? ` data-rail-section="${item.section}"` : "";
  return `
    ${item.divider ? `<hr class="rail-mini-divider"${sectionAttr}>` : ""}
    <div class="rail-mini-item"${routeAttrs}${sectionAttr}${item.action === "directory" ? ' data-open-directory role="button" tabindex="0" aria-label="Open Directory"' : ""}>
      <span class="rail-mini-icon${item.red ? " red" : ""}">${icon(railIconNames[item.icon], 20)}</span>
      <span class="rail-mini-label">${item.label}${item.count ? ` <small class="rail-mini-count">${item.count}</small>` : ""}</span>
      ${item.sub ? `<span class="rail-mini-sub">${item.sub}</span>` : ""}
      ${item.pill ? `<span class="rail-mini-pill">${item.pill}</span>` : ""}
      ${item.overlay ? `<div class="rail-overlay">${railOverlays[item.overlay]()}</div>` : ""}
    </div>
  `;
}

document.getElementById("rail-mini-list").innerHTML = railMiniItems.map(createRailMiniItem).join("");

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".overlay-week-prev, .overlay-week-next");
  if (!btn) return;

  overlayWeekOffset += btn.classList.contains("overlay-week-next") ? 1 : -1;
  // Re-render only the hover overlay in place so it does not close while the user pages through weeks
  btn.closest(".rail-overlay").innerHTML = railOverlays.calendar();
});

let railSelectedDay = startOfDay(new Date());

let railWeekStart = weekStartOf(railSelectedDay);

function renderRailWeek() {
  const days = [...Array(7)].map((_, i) => {
    const day = new Date(railWeekStart);
    day.setDate(day.getDate() + i);
    return day;
  });
  document.getElementById("rail-week-month").textContent = days[3].toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
  document.getElementById("rail-week-days").innerHTML = days
    .map((day) => {
      const selected = sameDay(day, railSelectedDay);
      // Dot under the day tells the user a meeting exists there without opening it
      const hasMeetings = meetings.some((m) => sameDay(m.start, day));
      return `
      <button class="rail-day${selected ? " is-selected" : ""}${isToday(day) ? " is-today" : ""}" type="button" data-rail-day="${toDateInput(day)}" aria-pressed="${selected}"
        aria-label="${day.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}${hasMeetings ? ", has meetings" : ""}">
        <span class="rail-day-name">${day.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}</span>
        <span class="rail-day-num">${pad2(day.getDate())}</span>
        <i class="rail-day-dot"${hasMeetings ? "" : " hidden"}></i>
      </button>`;
    })
    .join("");
  // Today shortcut: only while the strip shows another week or another day than today is selected (hidden, so the row does not shift)
  document.getElementById("rail-today-btn").hidden = sameDay(railSelectedDay, new Date()) && days.some((day) => isToday(day));
}

// Same action as Today in the expanded calendar
document.getElementById("rail-today-btn").addEventListener("click", () => selectRailDay(new Date()));

function selectRailDay(date) {
  railSelectedDay = startOfDay(date);
  railWeekStart = weekStartOf(railSelectedDay);
  // Keep the popup month calendar and the week strip pointing at the same day
  selectedDate = railSelectedDay.toDateString(); // month calendar highlights the same day
  renderRailDate();
  renderSchedule();
  renderRailCalendar();
}

document.querySelector(".rail-week-strip").addEventListener("click", (e) => {
  const shift = e.target.closest("[data-rail-week]");
  if (shift) {
    railWeekStart.setDate(railWeekStart.getDate() + 7 * Number(shift.dataset.railWeek));
    renderRailWeek();
    return;
  }
  const day = e.target.closest("[data-rail-day]");
  if (day) selectRailDay(parseDateInput(day.dataset.railDay));
});

// Picking a day in the month calendar does the same
railCalendar.querySelector(".calendar-days").addEventListener("click", (e) => {
  const dayButton = e.target.closest(".calendar-day");
  if (!dayButton) return;
  selectRailDay(new Date(dayButton.dataset.date));
  setRailCalendar(false);
});

// Clear drops the picked day: the strip and schedule go back to today and the calendar stays open with only today outlined
railCalendar.querySelector(".calendar-clear").addEventListener("click", () => {
  selectRailDay(new Date());
  selectedDate = null;
  renderRailCalendar();
});

// Today jumps the strip and the schedule to today and closes the calendar
railCalendar.querySelector(".calendar-today").addEventListener("click", () => {
  selectRailDay(new Date());
  setRailCalendar(false);
});

/* RIGHT RAIL DATE */
// Reads railSelectedDay, declared just below; safe because this only runs after the whole file has loaded
function renderRailDate() {
  const now = railSelectedDay;
  const weekday = now.toLocaleDateString("en-GB", { weekday: "long" });
  const month = now.toLocaleDateString("en-GB", { month: "long" });
  document.getElementById("rail-date").textContent = `${weekday}, ${now.getDate()} ${month}`;
  document.getElementById("rail-week").textContent = `Week ${getIsoWeek(now)} · ${now.getFullYear()}`;
}
