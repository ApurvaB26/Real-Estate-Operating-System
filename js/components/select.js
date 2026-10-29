/**
 * File: js/components/select.js
 * Role: Custom dropdowns: every native <select> becomes the Create Project dropdown.
 * Dependencies: Loaded by index.html as script 62 of 80. Uses globals from js/components/layers.js, js/core/utils.js, js/utils/dom-helpers.js. Its globals are used by js/main.js.
 */

/* CUSTOM DROPDOWNS: every native <select> becomes the same dropdown as Create Project.
   The hidden <select> stays the source of truth, so existing code reading .value keeps working. */
const nativeSelectValue = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");

let selectSeq = 0;

const selectForDropdown = (dropdown) => document.getElementById(dropdown.dataset.selectFor);

function syncDropdown(dropdown) {
  const select = selectForDropdown(dropdown);
  if (!select) return;
  const text = select.selectedOptions[0]?.textContent.trim() || "";
  dropdown.querySelector(".select-value").textContent = text;
  const label = dropdown.dataset.label;
  dropdown.querySelector("summary").setAttribute("aria-label", label ? `${label}: ${text}` : text);
}

function renderDropdownOptions(dropdown) {
  const select = selectForDropdown(dropdown);
  dropdown.querySelector(".ui-select-menu").innerHTML = Array.from(select.options)
    .map(
      (option, index) => `
    <button class="ui-select-option" type="button" role="option" data-option-index="${index}" aria-selected="${option.selected}"${option.disabled ? " disabled" : ""}>
      <span>${escapeHtml(option.textContent.trim())}</span>
      <span class="option-check" aria-hidden="true">✓</span>
    </button>`
    )
    .join("");
}

// Same idea as the calendar: measure in screen pixels, place in CSS pixels under the page zoom
function positionDropdownMenu(dropdown) {
  const menu = dropdown.querySelector(".ui-select-menu");
  const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  const trigger = dropdown.querySelector("summary").getBoundingClientRect();
  const menuHeight = menu.getBoundingClientRect().height / zoom;
  const viewportHeight = window.innerHeight / zoom;
  const viewportWidth = window.innerWidth / zoom;
  const top = trigger.top / zoom;
  const bottom = trigger.bottom / zoom;
  const width = Math.max(trigger.width / zoom, 160);
  // Open upward only when there is no room below and more room above
  const openUp = viewportHeight - bottom < menuHeight + 12 && top > viewportHeight - bottom;
  menu.style.setProperty("--select-menu-top", `${openUp ? top - menuHeight + 1 : bottom - 1}px`);
  menu.style.setProperty("--select-menu-left", `${Math.min(trigger.left / zoom, viewportWidth - width - 12)}px`);
  menu.style.setProperty("--select-menu-width", `${width}px`);
  dropdown.classList.toggle("opens-up", openUp);
}

// Called on load and by a MutationObserver (main.js) so selects created later get the custom dropdown too
function enhanceSelects(root = document) {
  const selects = root.matches?.("select") ? [root] : Array.from(root.querySelectorAll?.("select") || []);
  selects.forEach((select) => {
    // Skip selects already upgraded; multi-selects keep their native look
    if (select.dataset.enhanced || select.multiple) return;
    select.dataset.enhanced = "true";
    if (!select.id) select.id = `select-field-${++selectSeq}`;

    const dropdown = document.createElement("details");
    dropdown.className = "custom-select ui-select";
    dropdown.dataset.selectFor = select.id;
    dropdown.dataset.label = (select.getAttribute("aria-label") || select.labels?.[0]?.textContent || "")
      .replace("*", "")
      .trim();
    dropdown.innerHTML = `<summary aria-haspopup="listbox"><span class="select-value"></span><span class="select-chevron" aria-hidden="true"></span></summary><div class="select-menu ui-select-menu" role="listbox"></div>`;

    select.classList.add("visually-hidden");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    // Drawer fields wrap the select in a bordered control; the dropdown brings its own border
    const wrapper = select.closest(".drawer-control");
    (wrapper || select).after(dropdown);
    if (wrapper) wrapper.hidden = true;

    // Code elsewhere sets select.value directly; intercept it so the visible dropdown label stays in sync
    Object.defineProperty(select, "value", {
      configurable: true,
      get() {
        return nativeSelectValue.get.call(this);
      },
      set(value) {
        nativeSelectValue.set.call(this, value);
        syncDropdown(dropdown);
      }
    });
    select.addEventListener("change", () => syncDropdown(dropdown));
    select.form?.addEventListener("reset", () => setTimeout(() => syncDropdown(dropdown)));

    Array.from(select.labels || []).forEach((label) => {
      label.addEventListener("click", (event) => {
        if (dropdown.contains(event.target)) return;
        event.preventDefault();
        dropdown.open = !dropdown.open;
        dropdown.querySelector("summary").focus();
      });
    });

    dropdown.addEventListener("toggle", () => {
      if (!dropdown.open) return;
      document.querySelectorAll(".ui-select[open], .date-picker[open]").forEach((other) => {
        if (other !== dropdown) other.open = false;
      });
      renderDropdownOptions(dropdown);
      positionDropdownMenu(dropdown);
      requestAnimationFrame(() => positionDropdownMenu(dropdown));
      dropdown.querySelector('.ui-select-option[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    });

    syncDropdown(dropdown);
  });
}

function chooseDropdownOption(option) {
  const dropdown = option.closest(".ui-select");
  const select = selectForDropdown(dropdown);
  const index = Number(option.dataset.optionIndex);
  dropdown.open = false;
  dropdown.querySelector("summary").focus();
  if (select.selectedIndex === index) return;
  select.selectedIndex = index;
  syncDropdown(dropdown);
  // Fire input and change like a real native select, so existing listeners keep working
  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

document.addEventListener("click", (event) => {
  const option = event.target.closest(".ui-select-option");
  if (option) {
    chooseDropdownOption(option);
    return;
  }
  document.querySelectorAll(".ui-select[open]").forEach((dropdown) => {
    if (!dropdown.contains(event.target)) dropdown.open = false;
  });
});

// Arrow keys move through options; arrow down on a closed dropdown opens it
document.addEventListener("keydown", (event) => {
  const dropdown = event.target.closest?.(".ui-select");
  if (!dropdown || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  if (!dropdown.open) {
    dropdown.open = true;
    requestAnimationFrame(() =>
      (
        dropdown.querySelector('.ui-select-option[aria-selected="true"]') || dropdown.querySelector(".ui-select-option")
      )?.focus()
    );
    return;
  }
  const options = Array.from(dropdown.querySelectorAll(".ui-select-option:not(:disabled)"));
  const current = options.indexOf(document.activeElement);
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? options.length - 1
        : event.key === "ArrowDown"
          ? Math.min(options.length - 1, current + 1)
          : Math.max(0, current - 1);
  options[next]?.focus();
});

["resize", "scroll"].forEach((type) => {
  window.addEventListener(
    type,
    () => {
      document.querySelectorAll(".ui-select[open]").forEach(positionDropdownMenu);
    },
    true
  );
});
