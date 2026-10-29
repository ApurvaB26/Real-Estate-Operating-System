/**
 * File: js/features/library/makes.js
 * Role: Library Approved Makes.
 * Dependencies: Loaded by index.html as script 46 of 80. Uses globals from js/components/action-dialog.js, js/core/utils.js, js/data/makes.js, js/features/library/pager.js, js/core/icons.js. Its globals are used by js/features/library/library.js, js/layout/topbar.js.
 */

/* APPROVED MAKES (Library tab): equipment types grouped by discipline */
const makesBrowser = document.getElementById("makes-browser");

const makesSearch = document.getElementById("makes-search");

let makesCategory = "all";

let makesPage = 1;

const makesPageSize = 20;

const collapsedMakeGroups = new Set();


const makeCrownIcon =
  icon("crown", { size: 13, className: "make-crown" });

// Rebuilds the grouped list from makesGroups on every change; each row keeps its index inside its group so 'View details' opens the right one even after filtering
function renderMakes() {
  const query = makesSearch.value.trim().toLocaleLowerCase();
  const sort = document.getElementById("makes-sort").value;
  // Matching rows per group, then one flat list so pages can run across groups
  const matched = makesGroups
    .filter((group) => makesCategory === "all" || group.key === makesCategory)
    .map((group) => {
      // Search looks in type, make names, code and notes
      const rows = group.items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) =>
          `${item.type} ${item.makes.join(" ")} ${item.code} ${item.notes}`.toLocaleLowerCase().includes(query)
        );
      if (sort === "updated") rows.sort((a, b) => b.item.updated.localeCompare(a.item.updated));
      if (sort === "type") rows.sort((a, b) => a.item.type.localeCompare(b.item.type));
      return { group, rows };
    })
    .filter(({ rows }) => rows.length);
  const flat = matched.flatMap(({ group, rows }) => rows.map((row) => ({ group, ...row })));
  const shown = flat.length;
  const pages = Math.max(1, Math.ceil(shown / makesPageSize));
  makesPage = Math.min(Math.max(makesPage, 1), pages);
  const pageRows = flat.slice((makesPage - 1) * makesPageSize, makesPage * makesPageSize);

  document.getElementById("makes-groups").innerHTML = matched
    .map(({ group, rows: allRows }) => {
      const rows = pageRows.filter((row) => row.group === group);
      if (!rows.length) return "";
      // A search always shows its matches, even in a collapsed group
      const open = Boolean(query) || !collapsedMakeGroups.has(group.key);
      return `
        <tr class="makes-group-row">
          <td colspan="6">
            <button class="makes-group-head" type="button" data-makes-toggle="${group.key}" aria-expanded="${open}">
              <span class="task-group-chevron" aria-hidden="true"></span>
              <span class="makes-group-title">${group.label}</span>
              <span class="makes-group-count" aria-label="${allRows.length} equipment type${allRows.length === 1 ? "" : "s"}">${String(allRows.length).padStart(2, "0")}</span>
            </button>
          </td>
        </tr>
        ${
          open
            ? rows
                .map(
                  ({ item, index }) => `
        <tr data-make-group="${group.key}" data-make-index="${index}" tabindex="0">
          <td><strong>${escapeHtml(item.type)}</strong></td>
          <td>${item.makes.map(escapeHtml).join(" / ")}</td>
          <td><span class="make-chip">${makeCrownIcon}${escapeHtml(item.preferred)}</span></td>
          <td>${escapeHtml(item.code || "-")}</td>
          <td>${escapeHtml(item.notes)}</td>
          <td>${formatLongDate(item.updated)}</td>
        </tr>`
                )
                .join("")
            : ""
        }`;
    })
    .join("");

  document.getElementById("makes-empty").hidden = shown !== 0;
  renderLibraryPager(document.getElementById("makes-pager"), makesPage, pages, (page) => {
    makesPage = page;
    renderMakes();
  });
}

function openMakeDetails(row) {
  const group = makesGroups.find((g) => g.key === row.dataset.makeGroup);
  const item = group.items[Number(row.dataset.makeIndex)];
  openActionDialog({
    title: item.type,
    subtitle: group.label,
    body: `
      <div class="make-chip-list">${item.makes.map((make) => `<span class="make-chip${make === item.preferred ? "" : " is-plain"}">${escapeHtml(make)}${make === item.preferred ? " · Preferred" : ""}</span>`).join("")}</div>
      ${detailList([
        ["IS Code", item.code || "—"],
        ["Last updated", formatLongDate(item.updated)],
        ["Notes", item.notes]
      ])}`,
    submitLabel: null,
    cancelLabel: "Close"
  });
}

document.querySelectorAll("[data-makes-category]").forEach((chip) => {
  chip.addEventListener("click", () => {
    makesCategory = chip.dataset.makesCategory;
    makesPage = 1;
    document.querySelectorAll("[data-makes-category]").forEach((c) => {
      c.classList.toggle("active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderMakes();
  });
});

makesSearch.addEventListener("input", () => {
  makesPage = 1;
  renderMakes();
});

document.getElementById("makes-sort").addEventListener("change", () => {
  makesPage = 1;
  renderMakes();
});

document.getElementById("makes-filter-button").addEventListener("click", (e) => {
  const menu = document.getElementById("makes-filter-menu");
  const isExpanded = e.currentTarget.getAttribute("aria-expanded") === "true";
  e.currentTarget.setAttribute("aria-expanded", String(!isExpanded));
  menu.hidden = isExpanded;
});

document.getElementById("makes-groups").addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-makes-toggle]");
  if (toggle) {
    const key = toggle.dataset.makesToggle;
    if (collapsedMakeGroups.has(key)) collapsedMakeGroups.delete(key);
    else collapsedMakeGroups.add(key);
    renderMakes();
    return;
  }
  const row = e.target.closest("tr[data-make-index]");
  if (row) openMakeDetails(row);
});

document.getElementById("makes-groups").addEventListener("keydown", (e) => {
  const row = e.target.closest("tr[data-make-index]");
  if (row && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    openMakeDetails(row);
  }
});
