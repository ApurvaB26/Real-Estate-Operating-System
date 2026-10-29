/**
 * File: js/components/header-filter.js
 * Role: Column filters on table headers: a th marked data-hf="<unique key>" becomes a button that opens a checklist of that column's values and hides the other rows.
 * Dependencies: Loaded by index.html as script 63 of 80. Uses globals from js/core/icons.js; styles are in css/components/header-filter.css. Nothing else calls into it; it wires itself up on load.
 */

// Chosen values per header key. Kept here instead of on the table because some pages rebuild the whole table on every data change
const headerFilters = new Map();

const headerFilterCaret = icon("caret-down", 14);

const headerFilterPop = document.createElement("div");
headerFilterPop.className = "hf-pop";
headerFilterPop.setAttribute("role", "dialog");
headerFilterPop.hidden = true;
document.body.append(headerFilterPop);

// The header button that opened the popover, or null when it is closed
let headerFilterOpenBtn = null;

function headerFilterText(cell) {
  return (cell.dataset.hfValue || cell.textContent).replace(/\s+/g, " ").trim() || "(blank)";
}

// Data rows only: group headings and "no results" rows have no cell in this column
function headerFilterRows(table, column) {
  return [...table.tBodies]
    .flatMap((body) => [...body.rows])
    .filter((row) => row.cells.length > column && row.cells[column].tagName === "TD" && row.cells[column].colSpan === 1);
}

function applyHeaderFilters(table) {
  const heads = [...table.querySelectorAll("th[data-hf]")];
  heads.forEach((th) => th.classList.toggle("hf-active", headerFilters.has(th.dataset.hf)));
  [...table.tBodies].forEach((body) =>
    [...body.rows].forEach((row) => {
      const hidden = heads.some((th) => {
        const chosen = headerFilters.get(th.dataset.hf);
        const cell = row.cells[th.cellIndex];
        return chosen && cell && cell.tagName === "TD" && !chosen.has(headerFilterText(cell));
      });
      row.classList.toggle("hf-hidden", hidden);
    })
  );
}

function closeHeaderFilter(returnFocus) {
  if (!headerFilterOpenBtn) return;
  headerFilterOpenBtn.setAttribute("aria-expanded", "false");
  if (returnFocus) headerFilterOpenBtn.focus();
  headerFilterOpenBtn = null;
  headerFilterPop.hidden = true;
}

// Fixed-position, so no table card or panel (overflow: hidden) can clip it. Opens below the header if it fits, else above, else on the roomier side; the list scrolls inside the capped height
function positionHeaderFilter() {
  const gap = 4;
  const edge = 8;
  const rect = headerFilterOpenBtn.getBoundingClientRect();
  const below = window.innerHeight - rect.bottom - gap - edge;
  const above = rect.top - gap - edge;
  headerFilterPop.style.maxHeight = "none";
  const wanted = headerFilterPop.offsetHeight;
  const openBelow = wanted <= below || below >= above;
  const room = Math.max(120, openBelow ? below : above);
  headerFilterPop.style.maxHeight = `${room}px`;
  const height = Math.min(wanted, room);
  headerFilterPop.style.top = `${openBelow ? rect.bottom + gap : rect.top - gap - height}px`;
  headerFilterPop.style.left = `${Math.max(edge, Math.min(rect.left, window.innerWidth - headerFilterPop.offsetWidth - edge))}px`;
}

function openHeaderFilter(button) {
  const th = button.closest("th");
  const table = th.closest("table");
  const label = button.querySelector("span").textContent;
  // Rows hidden by the dashboard project filter are not offered as choices
  const values = [
    ...new Set(headerFilterRows(table, th.cellIndex).filter((row) => !row.classList.contains("dash-out")).map((row) => headerFilterText(row.cells[th.cellIndex])))
  ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const chosen = headerFilters.get(th.dataset.hf);

  headerFilterPop.setAttribute("aria-label", `Filter by ${label}`);
  headerFilterPop.innerHTML = "";
  const title = document.createElement("div");
  title.className = "hf-title";
  title.textContent = label;
  const list = document.createElement("div");
  list.className = "hf-list";
  values.forEach((value) => {
    const row = document.createElement("label");
    row.className = "hf-option";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.value = value;
    box.checked = !chosen || chosen.has(value);
    const text = document.createElement("span");
    text.textContent = value;
    row.append(box, text);
    list.append(row);
  });
  if (!values.length) list.innerHTML = '<p class="hf-empty">Nothing to filter yet.</p>';
  const showAll = document.createElement("button");
  showAll.type = "button";
  showAll.className = "hf-all";
  showAll.textContent = "Show all";
  headerFilterPop.append(title, list, showAll);

  headerFilterPop.hidden = false;
  headerFilterOpenBtn = button;
  positionHeaderFilter();
  button.setAttribute("aria-expanded", "true");
  // preventScroll: the scroll listener below would otherwise treat the focus jump as the page moving and close the popover
  (list.querySelector("input") || showAll).focus({ preventScroll: true });
}

// Wrap each marked header's text in a button once; rebuilt tables get the same treatment and their saved choice is re-applied
function syncHeaderFilters() {
  const tables = new Set();
  document.querySelectorAll("th[data-hf]").forEach((th) => {
    const table = th.closest("table");
    tables.add(table);
    if (th.dataset.hfReady) return;
    th.dataset.hfReady = "1";
    const label = document.createElement("span");
    label.textContent = th.textContent.trim();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hf-btn";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");
    button.append(label);
    button.insertAdjacentHTML("beforeend", `${headerFilterCaret}<i class="hf-dot" aria-hidden="true"></i>`);
    th.replaceChildren(button);
  });
  tables.forEach(applyHeaderFilters);
  // The table was rebuilt while its popover was open
  if (headerFilterOpenBtn && !headerFilterOpenBtn.isConnected) closeHeaderFilter(false);
}

// Runs inside the observer callback (before the next paint), so a rebuilt table never flashes unfiltered
new MutationObserver(syncHeaderFilters).observe(document.body, { childList: true, subtree: true });

document.addEventListener("click", (e) => {
  const button = e.target.closest(".hf-btn");
  if (button) {
    const wasOpen = headerFilterOpenBtn === button;
    closeHeaderFilter(false);
    if (!wasOpen) openHeaderFilter(button);
    return;
  }
  if (e.target.closest(".hf-all")) {
    if (!headerFilterOpenBtn) return;
    const key = headerFilterOpenBtn.closest("th").dataset.hf;
    headerFilters.delete(key);
    headerFilterPop.querySelectorAll("input").forEach((box) => (box.checked = true));
    applyHeaderFilters(headerFilterOpenBtn.closest("table"));
    return;
  }
  if (!e.target.closest(".hf-pop")) closeHeaderFilter(false);
});

headerFilterPop.addEventListener("change", () => {
  if (!headerFilterOpenBtn) return;
  const th = headerFilterOpenBtn.closest("th");
  const boxes = [...headerFilterPop.querySelectorAll("input")];
  const chosen = new Set(boxes.filter((box) => box.checked).map((box) => box.value));
  // Every box ticked means no filter, so the header dot goes away
  if (chosen.size === boxes.length) headerFilters.delete(th.dataset.hf);
  else headerFilters.set(th.dataset.hf, chosen);
  applyHeaderFilters(th.closest("table"));
});

headerFilterPop.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  const items = [...headerFilterPop.querySelectorAll("input, .hf-all")];
  const next = items.indexOf(document.activeElement) + (e.key === "ArrowDown" ? 1 : -1);
  const target = items[(next + items.length) % items.length];
  target.focus();
  target.scrollIntoView({ block: "nearest" });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && headerFilterOpenBtn) {
    e.stopPropagation();
    closeHeaderFilter(true);
  }
}, true);

// The popover is fixed-position, so it would drift away from its header if the page moved under it
window.addEventListener("scroll", (e) => { if (!headerFilterPop.contains(e.target)) closeHeaderFilter(false); }, true);
window.addEventListener("resize", () => { if (headerFilterOpenBtn) positionHeaderFilter(); });
window.addEventListener("hashchange", () => closeHeaderFilter(false));

syncHeaderFilters();
