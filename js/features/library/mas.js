/**
 * File: js/features/library/mas.js
 * Role: Library > MAS tab: standard items with their approved makes and completion status.
 * Dependencies: Loaded by index.html as script 47 of 80. Uses globals from js/core/utils.js, js/data/mas-disciplines.js, js/features/library/pager.js, js/layout/topbar.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/features/library/library.js, js/layout/topbar.js.
 */

/* MAS LIBRARY (Library tab): standard items with their approved makes.
   A make chip is green when its MAS is on file. Only Super Admin, L0 / HOD and L1 can upload a MAS. */
const masBrowser = document.getElementById("mas-browser");

const masSearch = document.getElementById("mas-search");


let masDiscipline = "all";

let masPage = 1;

const masPageSize = 10;

const masIconPending =
  icon("ban", { size: 14, className: "mas-icon" });

const masIconUpload =
  icon("upload", { size: 16, className: "mas-icon" });

const masMake = (name, onFile) => ({ name, onFile });

const masItems = [
  {
    sr: 1,
    discipline: "plumbing",
    item: "DWC HDPE pipes and fittings",
    owner: "Apurva Bhadange",
    makes: [masMake("Astral", true), masMake("Supreme", true), masMake("Finolex", false)]
  },
  {
    sr: 2,
    discipline: "plumbing",
    item: "CPVC pipes and fittings",
    owner: "Neha Kulkarni",
    makes: [masMake("Ashirvad", true), masMake("Supreme", false), masMake("Prince", false)]
  },
  {
    sr: 3,
    discipline: "plumbing",
    item: "uPVC SWR pipes and fittings",
    owner: "Apurva Bhadange",
    makes: [masMake("Supreme", true), masMake("Finolex", true), masMake("Prince", true)]
  },
  {
    sr: 4,
    discipline: "plumbing",
    item: "Hydro-pneumatic booster pumps",
    owner: "Rahul Deshmukh",
    makes: [masMake("Grundfos", false), masMake("Wilo", false), masMake("KSB", false)]
  },
  {
    sr: 1,
    discipline: "fire",
    item: "Pendant sprinklers",
    owner: "Neha Kulkarni",
    makes: [masMake("Tyco", true), masMake("Viking", true), masMake("HD Fire", false)]
  },
  {
    sr: 2,
    discipline: "fire",
    item: "Diesel fire pump set",
    owner: "Apurva Bhadange",
    makes: [masMake("Kirloskar", true), masMake("Grundfos", false)]
  },
  {
    sr: 3,
    discipline: "fire",
    item: "Addressable fire alarm panel",
    owner: "Rahul Deshmukh",
    makes: [masMake("Notifier", false), masMake("Siemens", false), masMake("Bosch", false)]
  },
  {
    sr: 1,
    discipline: "electrical",
    item: "LT panel, main distribution board",
    owner: "Apurva Bhadange",
    makes: [masMake("Schneider", true), masMake("Siemens", true), masMake("L&T", true)]
  },
  {
    sr: 2,
    discipline: "electrical",
    item: "LT cables, XLPE armoured",
    owner: "Rahul Deshmukh",
    makes: [masMake("Polycab", true), masMake("Finolex", false), masMake("Havells", false)]
  },
  {
    sr: 3,
    discipline: "electrical",
    item: "DG set with acoustic enclosure",
    owner: "Neha Kulkarni",
    makes: [masMake("Cummins", false), masMake("Kirloskar", false)]
  },
  {
    sr: 1,
    discipline: "hvac",
    item: "Water-cooled screw chiller",
    owner: "Neha Kulkarni",
    makes: [masMake("Carrier", true), masMake("Daikin", false), masMake("Trane", false)]
  },
  {
    sr: 2,
    discipline: "hvac",
    item: "VRF outdoor and indoor units",
    owner: "Apurva Bhadange",
    makes: [masMake("Daikin", true), masMake("Mitsubishi", true), masMake("Hitachi", true)]
  },
  {
    sr: 3,
    discipline: "hvac",
    item: "Air handling units (AHU)",
    owner: "Rahul Deshmukh",
    makes: [masMake("Zeco", false), masMake("Edgetech", false), masMake("Blue Star", false)]
  }
];

const masCanUpload = () => ROLE_RULES.uploadLibrary.includes(currentRole.textContent.trim());

function masMatches(entry, query) {
  const owner = document.getElementById("mas-owner").value;
  if (owner && entry.owner !== owner) return false;
  return !query || `${entry.item} ${entry.makes.map((m) => m.name).join(" ")}`.toLocaleLowerCase().includes(query);
}

function renderMas() {
  const query = masSearch.value.trim().toLocaleLowerCase();
  const canUpload = masCanUpload();
  const ownerSelect = document.getElementById("mas-owner");
  if (ownerSelect.options.length === 1)
    [...new Set(masItems.map((entry) => entry.owner))]
      .sort()
      .forEach((name) => ownerSelect.add(new Option(name, name)));

  document.getElementById("mas-tabs").innerHTML = masDisciplines
    .map(
      ([key, label]) =>
        `<button class="policy-category${key === masDiscipline ? " active" : ""}" type="button" data-mas-tab="${key}" aria-pressed="${key === masDiscipline}">${label}</button>`
    )
    .join("");

  const matches = masItems
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => (masDiscipline === "all" || entry.discipline === masDiscipline) && masMatches(entry, query));
  const pages = Math.max(1, Math.ceil(matches.length / masPageSize));
  masPage = Math.min(Math.max(masPage, 1), pages);
  const rows = matches.slice((masPage - 1) * masPageSize, masPage * masPageSize);
  document.getElementById("mas-rows").innerHTML = rows
    .map(
      ({ entry, index }) => `
      <tr>
        <td class="mas-check"><input class="mas-select" type="checkbox" aria-label="Select ${escapeHtml(entry.item)}"></td>
        <td><strong>${escapeHtml(entry.item)}</strong></td>
        <td><div class="mas-chips">${entry.makes
          .map((m, mi) =>
            m.onFile
              ? `<button class="mas-chip is-done" type="button" data-mas-download="${index}:${mi}" title="View MAS for ${escapeHtml(m.name)} (view only)">${escapeHtml(m.name)}</button>`
              : `<span class="mas-chip" title="MAS pending">${canUpload ? `<button class="mas-upload" type="button" data-mas-upload="${index}:${mi}" title="Upload MAS for ${escapeHtml(m.name)}" aria-label="Upload MAS for ${escapeHtml(m.name)}, ${escapeHtml(entry.item)}">${masIconUpload}</button>` : masIconPending}${escapeHtml(m.name)}</span>`
          )
          .join("")}</div></td>
        <td>${escapeHtml(entry.owner || "—")}</td>
      </tr>`
    )
    .join("");
  document.getElementById("mas-count").textContent = `${matches.length} ${matches.length === 1 ? "item" : "items"}`;
  document.getElementById("mas-empty").hidden = matches.length > 0;
  document.getElementById("mas-role-note").textContent = canUpload
    ? ""
    : "View only.";
  renderLibraryPager(document.getElementById("mas-pager"), masPage, pages, (page) => {
    masPage = page;
    renderMas();
  });
}

document.getElementById("mas-tabs").addEventListener("click", (e) => {
  const tab = e.target.closest("[data-mas-tab]");
  if (!tab) return;
  masDiscipline = tab.dataset.masTab;
  masPage = 1;
  renderMas();
});

document.getElementById("mas-owner").addEventListener("change", () => {
  masPage = 1;
  renderMas();
});

masSearch.addEventListener("input", () => {
  masPage = 1;
  renderMas();
});

document.getElementById("mas-filter-button").addEventListener("click", (e) => {
  const menu = document.getElementById("mas-filter-menu");
  const isExpanded = e.currentTarget.getAttribute("aria-expanded") === "true";
  e.currentTarget.setAttribute("aria-expanded", String(!isExpanded));
  menu.hidden = isExpanded;
});

document.getElementById("mas-rows").addEventListener("click", (e) => {
  const download = e.target.closest("[data-mas-download]");
  if (download) {
    const [i, mi] = download.dataset.masDownload.split(":").map(Number);
    showToast(`Opening MAS for ${masItems[i].makes[mi].name} in view-only mode. MAS cannot be downloaded.`);
    return;
  }
  const button = e.target.closest("[data-mas-upload]");
  if (!button || !masCanUpload()) return;
  const [index, makeIndex] = button.dataset.masUpload.split(":").map(Number);
  masItems[index].makes[makeIndex].onFile = true; // demo: the live app opens a file picker here
  renderMas();
  showToast(`MAS uploaded for ${masItems[index].makes[makeIndex].name}.`);
});

roleSwitchMenu.addEventListener("click", () => {
  if (!masBrowser.hidden) renderMas();
});
