/**
 * File: js/components/date-picker.js
 * Role: Shared calendar date picker (also replaces every native <input type="date">).
 * Dependencies: Loaded by index.html as script 19 of 80. Uses globals from js/components/layers.js, js/core/utils.js, js/layout/right-rail.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/components/action-dialog.js, js/features/create-project.js, js/features/record-drawer.js, js/main.js.
 */

function renderCalendar(datePicker) {
  const dateInput = document.getElementById(datePicker.dataset.datePicker);
  const selectedDate = parseDateInput(dateInput.value);
  const today = new Date();
  // viewDate is the month being browsed; it can differ from the selected date while the user pages through months
  const viewDate = datePicker.viewDate || selectedDate || today;
  const monthLabel = datePicker.querySelector(".calendar-month-label");
  const daysContainer = datePicker.querySelector(".calendar-days");
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  monthLabel.textContent = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(viewDate);

  const calendarDays = [];
  // Always 42 cells (6 weeks) so the panel height stays fixed; out-of-month days are greyed, not removed
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), index - firstWeekday + 1);
    const isOutsideMonth = date.getMonth() !== viewDate.getMonth();
    const isToday = formatDateInput(date) === formatDateInput(today);
    const isSelected = selectedDate && formatDateInput(date) === dateInput.value;
    const dayButton = document.createElement("button");
    dayButton.type = "button";
    dayButton.className = "calendar-day";
    if (isOutsideMonth) dayButton.classList.add("outside-month");
    if (isToday) dayButton.classList.add("is-today");
    if (isSelected) dayButton.classList.add("is-selected");
    dayButton.textContent = date.getDate();
    dayButton.setAttribute(
      "aria-label",
      new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }).format(date)
    );
    dayButton.setAttribute("aria-pressed", String(Boolean(isSelected)));
    dayButton.addEventListener("click", () => selectCalendarDate(datePicker, date));
    calendarDays.push(dayButton);
  }
  daysContainer.replaceChildren(...calendarDays);
}

// Measurements come back in screen pixels, but the panel's fixed top/left get scaled by the
// page zoom (--app-zoom), so convert everything to CSS pixels first
function positionCalendar(datePicker) {
  const panel = datePicker.querySelector(".calendar-panel");
  const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  const toCss = (rect) => ({
    left: rect.left / zoom,
    top: rect.top / zoom,
    bottom: rect.bottom / zoom,
    width: rect.width / zoom,
    height: rect.height / zoom
  });
  const triggerRect = toCss(datePicker.querySelector("summary").getBoundingClientRect());
  const panelRect = toCss(panel.getBoundingClientRect());
  const viewportWidth = window.innerWidth / zoom;
  const viewportHeight = window.innerHeight / zoom;
  const edgePadding = 12;
  const left = Math.min(Math.max(edgePadding, triggerRect.left), viewportWidth - panelRect.width - edgePadding);
  const roomBelow = viewportHeight - triggerRect.bottom - edgePadding;
  const roomAbove = triggerRect.top - edgePadding;
  const top =
    roomBelow >= panelRect.height || roomBelow >= roomAbove
      ? Math.min(triggerRect.bottom + 8, viewportHeight - panelRect.height - edgePadding)
      : Math.max(edgePadding, triggerRect.top - panelRect.height - 8);

  panel.style.setProperty("--calendar-panel-top", `${top}px`);
  panel.style.setProperty("--calendar-panel-left", `${left}px`);
}

function selectCalendarDate(datePicker, date) {
  const dateInput = document.getElementById(datePicker.dataset.datePicker);
  dateInput.value = formatDateInput(date);
  datePicker.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
  renderCalendar(datePicker);
  datePicker.open = false;
  dateInput.dispatchEvent(new Event("change", { bubbles: true }));
}

// One calendar for every date field: the Create Project pickers in the HTML, plus any
// native <input type="date"> that enhanceDateInputs() swaps for the same picker
const formatPickerDate = (date) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);

const allDatePickers = () => Array.from(document.querySelectorAll(".date-picker"));

function syncDatePickerLabel(datePicker) {
  const dateInput = document.getElementById(datePicker.dataset.datePicker);
  if (!dateInput) return;
  const date = parseDateInput(dateInput.value);
  datePicker.querySelector(".date-picker-value").textContent = date
    ? formatPickerDate(date)
    : datePicker.dataset.placeholder;
  datePicker.classList.toggle("has-value", Boolean(date));
}

// Code all over the app sets input.value directly; keep the picker label in step with it
// Wrapping the value setter is the only way to notice code assigning input.value, which fires no event
const nativeInputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");

function watchDateValue(dateInput, datePicker) {
  Object.defineProperty(dateInput, "value", {
    configurable: true,
    get() {
      return nativeInputValue.get.call(this);
    },
    set(value) {
      nativeInputValue.set.call(this, value);
      syncDatePickerLabel(datePicker);
    }
  });
  // Form reset restores values after the event fires, hence the setTimeout
  dateInput.form?.addEventListener("reset", () => setTimeout(() => syncDatePickerLabel(datePicker)));
}

function setupDatePicker(datePicker) {
  if (datePicker.dataset.ready) return;
  // Guard against wiring the same picker twice (the MutationObserver can see it again)
  datePicker.dataset.ready = "true";
  const dateInput = document.getElementById(datePicker.dataset.datePicker);

  datePicker.addEventListener("toggle", () => {
    if (datePicker.open) {
      allDatePickers().forEach((otherPicker) => {
        if (otherPicker !== datePicker) otherPicker.open = false;
      });
      const selectedDate = parseDateInput(dateInput.value);
      datePicker.viewDate = selectedDate || new Date();
      renderCalendar(datePicker);
      requestAnimationFrame(() => positionCalendar(datePicker));
    }
  });

  datePicker.querySelectorAll(".calendar-month-prev").forEach((button) => {
    button.addEventListener("click", () => {
      datePicker.viewDate = new Date(datePicker.viewDate.getFullYear(), datePicker.viewDate.getMonth() - 1, 1);
      renderCalendar(datePicker);
    });
  });

  datePicker.querySelector(".calendar-month-next").addEventListener("click", () => {
    datePicker.viewDate = new Date(datePicker.viewDate.getFullYear(), datePicker.viewDate.getMonth() + 1, 1);
    renderCalendar(datePicker);
  });

  datePicker.querySelector(".calendar-clear").addEventListener("click", () => {
    dateInput.value = "";
    datePicker.viewDate = new Date();
    renderCalendar(datePicker);
    datePicker.open = false;
    dateInput.dispatchEvent(new Event("change", { bubbles: true }));
  });

  datePicker.querySelector(".calendar-today").addEventListener("click", () => {
    selectCalendarDate(datePicker, new Date());
  });

  // A required date left empty opens its calendar instead of a hidden validation bubble
  dateInput.addEventListener("invalid", () => {
    datePicker.open = true;
    datePicker.querySelector("summary").focus();
  });

  // Clicking the field's label opens the calendar rather than the hidden native input
  Array.from(dateInput.labels || []).forEach((label) => {
    label.addEventListener("click", (event) => {
      if (datePicker.contains(event.target)) return;
      event.preventDefault();
      datePicker.open = !datePicker.open;
      datePicker.querySelector("summary").focus();
    });
  });

  watchDateValue(dateInput, datePicker);
  syncDatePickerLabel(datePicker);
}

const calendarSummaryIcon =
  icon("calendar-field");

const calendarPanelHtml = `
  <div class="calendar-panel">
    <div class="calendar-monthbar"><strong class="calendar-month-label"></strong><div><button class="calendar-month-prev" type="button" aria-label="Previous month">${icon("caret-up", 14)}</button><button class="calendar-month-next" type="button" aria-label="Next month">${icon("caret-down", 14)}</button></div></div>
    <div class="calendar-weekdays" aria-hidden="true"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
    <div class="calendar-days" role="grid" aria-label="Calendar dates"></div>
    <div class="calendar-footer"><button class="calendar-clear" type="button">Clear</button><button class="calendar-today" type="button">Today</button></div>
  </div>`;

let dateInputSeq = 0;

function enhanceDateInputs(root = document) {
  const dateInputs = root.matches?.('input[type="date"]')
    ? [root]
    : Array.from(root.querySelectorAll?.('input[type="date"]') || []);
  dateInputs
    .filter((input) => !input.classList.contains("date-value-input"))
    .forEach((dateInput) => {
      if (!dateInput.id) dateInput.id = `date-field-${++dateInputSeq}`;
      const label = (dateInput.getAttribute("aria-label") || dateInput.labels?.[0]?.textContent || "date")
        .replace("*", "")
        .trim();
      dateInput.classList.add("visually-hidden", "date-value-input");
      dateInput.tabIndex = -1;
      dateInput.setAttribute("aria-hidden", "true");

      const datePicker = document.createElement("details");
      datePicker.className = "date-picker";
      datePicker.dataset.datePicker = dateInput.id;
      // The native input stays in the page (hidden) as the source of truth for forms and validation
      datePicker.dataset.placeholder = dateInput.dataset.placeholder || "Select date";
      datePicker.innerHTML = `<summary aria-label="Choose ${escapeHtml(label.toLowerCase())}"><span class="date-picker-value"></span>${calendarSummaryIcon}</summary>${calendarPanelHtml}`;

      // Drawer fields wrap the input in a bordered control; the picker brings its own border
      const wrapper = dateInput.closest(".drawer-control");
      (wrapper || dateInput).after(datePicker);
      if (wrapper) wrapper.hidden = true;
      setupDatePicker(datePicker);
    });
}

document.addEventListener("click", (event) => {
  allDatePickers().forEach((datePicker) => {
    if (datePicker.open && !datePicker.contains(event.target)) datePicker.open = false;
  });
});

// Esc closes an open calendar first, before it can close the dialog or drawer underneath
window.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Escape") return;
    const openPicker = document.querySelector(".date-picker[open], .ui-select[open]");
    if (!openPicker) return;
    event.preventDefault();
    // Capture-phase handler: stops the same Esc from also closing the dialog or drawer behind the calendar
    event.stopImmediatePropagation();
    openPicker.open = false;
    openPicker.querySelector("summary").focus();
  },
  true
);

window.addEventListener("resize", () => {
  allDatePickers()
    .filter((datePicker) => datePicker.open)
    .forEach(positionCalendar);
});

document.addEventListener(
  "scroll",
  () => {
    allDatePickers()
      .filter((datePicker) => datePicker.open)
      .forEach(positionCalendar);
  },
  true
);
