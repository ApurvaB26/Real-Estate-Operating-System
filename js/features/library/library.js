/**
 * File: js/features/library/library.js
 * Role: Library: tabs, document register, search, category filter and sort.
 * Dependencies: Loaded by index.html as script 43 of 80. Uses globals from js/core/router.js, js/core/utils.js, js/features/document-viewer.js, js/features/library/drawings.js, js/features/library/makes.js, js/features/library/mas.js, js/core/icons.js. Its globals are used by js/core/router.js, js/features/document-viewer.js, js/features/library/boqs.js, js/features/library/drawings.js, js/layout/library-flyout.js, js/layout/topbar.js.
 */

const policySearchInput = document.querySelector("#policy-search");

const policyList = document.querySelector("#policy-list");

const policyCategoryButtons = Array.from(document.querySelectorAll("[data-policy-category]"));

const policyEmptyMessage = document.querySelector("#policy-empty");

const policyFilterButton = document.querySelector(".policy-filter-button");

const policyFilterMenu = document.querySelector("#policy-filter-menu");

const policySortSelect = document.querySelector("#policy-sort");

let selectedPolicyCategory = "all";

function filterPolicies() {
  const query = policySearchInput.value.trim().toLocaleLowerCase();
  let visibleCount = 0;

  policyList.querySelectorAll("tr").forEach((row) => {
    const matchesCategory = selectedPolicyCategory === "all" || row.dataset.policyCategory === selectedPolicyCategory;
    const matchesSearch = row.textContent.toLocaleLowerCase().includes(query);
    row.hidden = !matchesCategory || !matchesSearch;
    if (!row.hidden) visibleCount += 1;
  });

  policyEmptyMessage.hidden = visibleCount !== 0;
}

policyCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedPolicyCategory = button.dataset.policyCategory;
    policyCategoryButtons.forEach((categoryButton) => {
      const isSelected = categoryButton === button;
      categoryButton.classList.toggle("active", isSelected);
      categoryButton.setAttribute("aria-pressed", String(isSelected));
    });
    filterPolicies();
  });
});

policySearchInput.addEventListener("input", filterPolicies);

policyFilterButton.addEventListener("click", () => {
  const isExpanded = policyFilterButton.getAttribute("aria-expanded") === "true";
  policyFilterButton.setAttribute("aria-expanded", String(!isExpanded));
  policyFilterMenu.hidden = isExpanded;
});

policySortSelect.addEventListener("change", () => {
  const rows = Array.from(policyList.querySelectorAll("tr"));
  rows.sort((first, second) =>
    policySortSelect.value === "name"
      ? first.cells[1]
          .querySelector("strong")
          .textContent.localeCompare(second.cells[1].querySelector("strong").textContent)
      : second.dataset.updated.localeCompare(first.dataset.updated)
  );
  policyList.replaceChildren(...rows);
});

/* LIBRARY TABS */
const libraryHeading = document.getElementById("library-ref-heading");

const policyBrowser = document.querySelector(".policy-browser");

let currentLibraryTab = "policies";

const libraryTabs = {
  policies: {
    label: "Policies",
    ref: "Policy No.",
    docs: Array.from(policyList.rows, (row) => ({
      no: row.cells[0].textContent.trim(),
      name: row.cells[1].querySelector("strong").textContent.trim(),
      meta: row.cells[1].querySelector("small").textContent.trim(),
      version: row.cells[2].textContent.trim(),
      updated: row.dataset.updated,
      category: row.dataset.policyCategory
    }))
  },
  learnings: {
    label: "Learnings",
    ref: "Ref No.",
    docs: [
      {
        no: "LL-014",
        name: "Chiller plant room access — lessons from Skyline One",
        meta: "Case note · 6 Pages",
        version: "v1.2",
        updated: iso(12),
        category: "hvac"
      },
      {
        no: "LL-013",
        name: "Avoiding sleeve misses in PT slabs",
        meta: "Checklist · 3 Pages",
        version: "v1.0",
        updated: iso(26),
        category: "general"
      },
      {
        no: "LL-011",
        name: "Fire NOC rework: common authority comments",
        meta: "Case note · 9 Pages",
        version: "v2.0",
        updated: iso(41),
        category: "fire"
      },
      {
        no: "LL-009",
        name: "STP odour complaints after handover",
        meta: "Post-occupancy review · 5 Pages",
        version: "v1.1",
        updated: iso(63),
        category: "phe"
      },
      {
        no: "LL-007",
        name: "Bus duct vs cable riser — cost and time comparison",
        meta: "Study · 12 Pages",
        version: "v1.0",
        updated: iso(90),
        category: "electrical"
      }
    ]
  },
  boqs: {
    label: "BOQs",
    ref: "BOQ No.",
    docs: [
      {
        no: "BOQ-HV-03",
        name: "HVAC — VRF system, typical residential floor",
        meta: "Excel · 412 line items",
        version: "v3.1",
        updated: iso(8),
        category: "hvac"
      },
      {
        no: "BOQ-PH-05",
        name: "Plumbing — internal water supply & drainage",
        meta: "Excel · 286 line items",
        version: "v2.4",
        updated: iso(19),
        category: "phe"
      },
      {
        no: "BOQ-FF-02",
        name: "Firefighting — sprinkler & hydrant system",
        meta: "Excel · 198 line items",
        version: "v2.0",
        updated: iso(33),
        category: "fire"
      },
      {
        no: "BOQ-EL-04",
        name: "Electrical — LT panels, cabling & lighting",
        meta: "Excel · 530 line items",
        version: "v4.2",
        updated: iso(47),
        category: "electrical"
      }
    ]
  },
  makes: {
    label: "Approved Makes",
    ref: "Make ID",
    docs: [
      {
        no: "AM-HV-01",
        name: "Chillers & VRF outdoor units",
        meta: "4 approved makes",
        version: "2026",
        updated: iso(15),
        category: "hvac"
      },
      {
        no: "AM-EL-02",
        name: "LT switchgear & MCBs",
        meta: "5 approved makes",
        version: "2026",
        updated: iso(15),
        category: "electrical"
      },
      {
        no: "AM-PH-03",
        name: "CPVC / uPVC pipes & fittings",
        meta: "3 approved makes",
        version: "2026",
        updated: iso(30),
        category: "phe"
      },
      {
        no: "AM-FF-04",
        name: "Fire pumps & sprinklers",
        meta: "4 approved makes",
        version: "2026",
        updated: iso(30),
        category: "fire"
      },
      {
        no: "AM-GN-05",
        name: "Lifts & escalators",
        meta: "3 approved makes",
        version: "2025",
        updated: iso(120),
        category: "general"
      }
    ]
  },
  mas: {
    label: "MAS Library",
    ref: "MAS No.",
    docs: [
      {
        no: "MAS-221",
        name: "Air-cooled screw chiller submittal",
        meta: "PDF · 38 Pages",
        version: "Rev B",
        updated: iso(5),
        category: "hvac"
      },
      {
        no: "MAS-219",
        name: "Diesel fire pump set",
        meta: "PDF · 22 Pages",
        version: "Rev A",
        updated: iso(14),
        category: "fire"
      },
      {
        no: "MAS-214",
        name: "LT panel — main distribution board",
        meta: "PDF · 41 Pages",
        version: "Rev C",
        updated: iso(28),
        category: "electrical"
      },
      {
        no: "MAS-209",
        name: "Hydro-pneumatic pumping system",
        meta: "PDF · 17 Pages",
        version: "Rev A",
        updated: iso(44),
        category: "phe"
      }
    ]
  },
  drawings: { label: "Standard Drawings", ref: "Drawing No.", docs: [] },
  books: {
    label: "Reference Books",
    ref: "Ref No.",
    docs: [
      {
        no: "RB-01",
        name: "National Building Code of India — Part 4 & 9",
        meta: "Reference · MEP extracts",
        version: "2016",
        updated: iso(200),
        category: "general"
      },
      {
        no: "RB-02",
        name: "ASHRAE Handbook — HVAC Applications",
        meta: "Reference",
        version: "2023",
        updated: iso(150),
        category: "hvac"
      },
      {
        no: "RB-03",
        name: "Plumbing Code — Uniform Plumbing Code India",
        meta: "Reference",
        version: "2020",
        updated: iso(240),
        category: "phe"
      }
    ]
  },
  catalogues: {
    label: "Catalogues",
    ref: "Cat. No.",
    docs: [
      {
        no: "CAT-118",
        name: "Light fixtures — common areas",
        meta: "PDF · 64 Pages",
        version: "2026",
        updated: iso(9),
        category: "electrical"
      },
      {
        no: "CAT-112",
        name: "Sanitaryware & CP fittings",
        meta: "PDF · 88 Pages",
        version: "2026",
        updated: iso(25),
        category: "phe"
      },
      {
        no: "CAT-107",
        name: "Grilles, diffusers & dampers",
        meta: "PDF · 46 Pages",
        version: "2025",
        updated: iso(80),
        category: "hvac"
      }
    ]
  }
};

// Each tab has its own page title and description, and an upload button that only Super Admin, L0 and L1 see. Site Team keeps its own MAS Library intro (set in site-portal.js)
const libraryIntro = {
  policies: { title: "Policies", text: "Company MEP policies, standards and guidelines that every project follows.", upload: "Upload Policy" },
  learnings: { title: "Learnings", text: "Lessons learned from past projects, so the same issues are not repeated.", upload: "Add Learning", isAdd: true },
  boqs: { title: "BOQs", text: "Standard bills of quantities by discipline, to view as a sheet or download.", upload: "Upload BOQ" },
  makes: { title: "Approved Makes", text: "Approved makes for each equipment type, with the preferred make marked.", upload: "Upload Make" },
  mas: { title: "MAS Library", text: "Material approval sheets on file for each standard item and approved make.", upload: "Upload MAS" },
  drawings: { title: "Standard Drawings", text: "Standard drawings by discipline, ready to open or download.", upload: "Upload Drawing" },
  books: { title: "Reference Books", text: "Codes, handbooks and reference material for MEP design.", upload: "Upload Book" },
  catalogues: { title: "Catalogues", text: "Manufacturer catalogues for fixtures, fittings and equipment.", upload: "Upload Catalogue" }
};

function updateLibraryIntro() {
  const intro = libraryIntro[currentLibraryTab];
  const uploadButton = document.getElementById("library-upload-btn");
  if (!intro || !uploadButton) return;
  const siteMode = document.body.classList.contains("site-mode");
  if (!siteMode) {
    document.getElementById("library-intro-title").textContent = intro.title;
    document.getElementById("library-intro-text").textContent = intro.text;
  }
  document.getElementById("library-upload-label").textContent = intro.upload;
  // Learnings are written up rather than uploaded, so that button says Add and shows a plus
  uploadButton.querySelector("svg").setAttribute("data-icon", intro.isAdd ? "plus" : "upload");
  uploadButton.querySelector("svg").replaceChildren();
  hydrateIcons?.(uploadButton);
  uploadButton.hidden = siteMode || !ROLE_RULES.uploadLibrary.includes(currentRole.textContent.trim());
}

document.getElementById("library-upload-btn").addEventListener("click", () => {
  const intro = libraryIntro[currentLibraryTab];
  openActionDialog({
    title: intro.upload,
    subtitle: intro.title,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "file", label: "File", type: "file" }
    ],
    submitLabel: intro.isAdd ? "Add" : "Upload",
    onSubmit: (values) => {
      // Demo only: the live app sends the file to document storage here
      showToast(`${values.title || "File"} ${intro.isAdd ? "added to" : "uploaded to"} ${intro.title}.`);
    }
  });
});

// The role changes after the menu click is handled, so wait a tick before reading it
roleSwitchMenu.addEventListener("click", () => setTimeout(updateLibraryIntro, 0));

// One table and one search box serve every document tab; switching tabs swaps the rows. 'Makes' is the exception and has its own browser
function setLibraryTab(key) {
  if (!libraryTabs[key]) key = "policies";
  currentLibraryTab = key;
  const tab = libraryTabs[key];

  document.querySelectorAll("[data-library-tab]").forEach((button) => {
    const isActive = button.dataset.libraryTab === key;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });

  libraryHeading.textContent = tab.ref;
  policyBrowser.setAttribute("aria-label", tab.label);
  policySearchInput.placeholder = `Search ${tab.label.toLowerCase()}...`;
  policySearchInput.setAttribute("aria-label", `Search ${tab.label.toLowerCase()}`);
  policyList.innerHTML = tab.docs
    .map(
      (doc, index) => `
    <tr data-policy-category="${doc.category}" data-updated="${doc.updated}" data-doc-index="${index}" tabindex="0">
      <td>${escapeHtml(doc.no)}</td>
      <td><strong>${escapeHtml(doc.name)}</strong><small>${escapeHtml(doc.meta)}</small></td>
      <td>${escapeHtml(doc.version)}</td>
      <td>${formatLongDate(doc.updated)}</td>
    </tr>`
    )
    .join("");

  // Re-apply the chosen sort to the freshly built rows
  if (policySortSelect.value === "name") policySortSelect.dispatchEvent(new Event("change"));
  filterPolicies();
  const showMakes = key === "makes";
  const showMas = key === "mas";
  const showDrawings = key === "drawings";
  policyBrowser.hidden = showMakes || showMas || showDrawings;
  drawingsBrowser.hidden = !showDrawings;
  makesBrowser.hidden = !showMakes;
  masBrowser.hidden = !showMas;
  if (showMakes) renderMakes();
  if (showMas) renderMas();
  if (showDrawings) renderDrawings();
  updateLibraryIntro();
  renderBreadcrumb([{ label: "Library", view: "library" }, { label: tab.label }]);
  // The default tab uses the plain #library URL; other tabs add their name
  syncHash(key === "policies" ? "library" : `library/${key}`);
}

function openLibraryDocument(row) {
  showDocument("library", `${currentLibraryTab}-${row.dataset.docIndex}`);
}

const lockIcon =
  icon("lock", 14);

// Placeholder content only: replace with the real file viewer when document storage is connected
// Sample first page of a library document until the real files are connected
function libraryPageHtml(doc, tabKey) {
  const kicker = tabKey === "policies" ? "MEP Policy" : libraryTabs[tabKey].label;
  return `
    <article class="doc-page" aria-label="${escapeHtml(doc.name)}, page 1">
      <p class="doc-page-kicker">${escapeHtml(kicker)} · ${escapeHtml(doc.no)}</p>
      <h3>${escapeHtml(doc.name)}</h3>
      <p class="doc-page-meta">Version ${escapeHtml(doc.version)} · Effective ${formatLongDate(doc.updated)} · Discipline: ${escapeHtml(doc.category.toUpperCase())}</p>
      <h4>1. Purpose</h4>
      <p>Sets out the minimum design and documentation requirements covered by this document, so every project applies them the same way.</p>
      <h4>2. Scope</h4>
      <p>Applies to all towers, podiums, basements and MLCPs at concept, design development, GFC and VFC stages, for in-house teams and appointed consultants.</p>
      <h4>3. Revision history</h4>
      <table class="doc-page-table">
        <thead><tr><th>Version</th><th>Date</th><th>Change</th></tr></thead>
        <tbody><tr><td>${escapeHtml(doc.version)}</td><td>${formatLongDate(doc.updated)}</td><td>Current issue</td></tr></tbody>
      </table>
      <p class="doc-page-note">Sample page — the document itself will display here once documents are connected.</p>
    </article>`;
}

// Close the Policies / Approved Makes Filters menus on an outside click or Escape
function closePolicyFilterMenus(except, restoreFocus = false) {
  document.querySelectorAll(".policy-filter-wrap").forEach((wrap) => {
    if (wrap === except) return;
    const menu = wrap.querySelector(".policy-filter-menu");
    const button = wrap.querySelector(".policy-filter-button");
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (restoreFocus) button.focus();
  });
}

document.addEventListener("click", (e) => closePolicyFilterMenus(e.target.closest(".policy-filter-wrap")));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePolicyFilterMenus(null, true);
});

document.querySelectorAll("[data-library-tab]").forEach((button) => {
  button.addEventListener("click", () => setLibraryTab(button.dataset.libraryTab));
});

policyList.addEventListener("click", (e) => {
  const row = e.target.closest("tr[data-doc-index]");
  if (row) openLibraryDocument(row);
});

policyList.addEventListener("keydown", (e) => {
  const row = e.target.closest("tr[data-doc-index]");
  if (row && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    openLibraryDocument(row);
  }
});
