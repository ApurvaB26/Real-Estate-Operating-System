/**
 * File: js/features/library/drawings.js
 * Role: Library > Standard Drawings tab: discipline folders, drawing files and preview.
 * Dependencies: Loaded by index.html as script 48 of 80. Uses globals from js/core/utils.js, js/data/drawing-folders.js, js/features/document-viewer.js, js/features/library/library.js, js/core/icons.js. Its globals are used by js/features/library/library.js.
 */

/* STANDARD DRAWINGS (Library tab): folders by discipline, each holding drawing files */
const drawingsBrowser = document.getElementById("drawings-browser");

const drawingsSearch = document.getElementById("drawings-search");

const drawingsList = document.getElementById("drawings-list");

let drawingsCategory = "all";

const collapsedDrawingGroups = new Set();

// The preview page reads from libraryTabs, so keep a flat copy of every drawing there
libraryTabs.drawings.docs = [];

drawingFolders.forEach((folder) => {
  folder.files = folder.files.map(([name, type, size, daysAgo], i) => {
    const file = {
      name,
      type,
      size,
      updated: iso(daysAgo),
      folder: folder.key,
      index: libraryTabs.drawings.docs.length
    };
    libraryTabs.drawings.docs.push({
      no: `SD-${folder.prefix}-${101 + i}`,
      name,
      meta: `${type.toUpperCase()} · ${size}`,
      version: `R${(i % 4) + 1}`,
      updated: file.updated,
      category: folder.category
    });
    return file;
  });
});

// One table like Approved Makes: a header row per discipline folder, then its drawings
function renderDrawings() {
  const query = drawingsSearch.value.trim().toLocaleLowerCase();
  let shown = 0;
  drawingsList.innerHTML = drawingFolders
    .filter((folder) => drawingsCategory === "all" || folder.category === drawingsCategory)
    .map((folder) => {
      const files = folder.files.filter((file) => `${file.name} ${file.type}`.toLocaleLowerCase().includes(query));
      if (!files.length) return "";
      shown += files.length;
      // A search always shows its matches, even in a collapsed group
      const open = Boolean(query) || !collapsedDrawingGroups.has(folder.key);
      return `
        <tr class="makes-group-row">
          <td colspan="6">
            <button class="makes-group-head" type="button" data-drawings-toggle="${folder.key}" aria-expanded="${open}">
              <span class="task-group-chevron" aria-hidden="true"></span>
              <span class="makes-group-title">${escapeHtml(folder.name)}</span>
              <span class="makes-group-count" aria-label="${files.length} drawing${files.length === 1 ? "" : "s"}">${String(files.length).padStart(2, "0")}</span>
            </button>
          </td>
        </tr>
        ${
          open
            ? files
                .map(
                  (file) => `
        <tr data-drawing-index="${file.index}" tabindex="0">
          <td>${escapeHtml(libraryTabs.drawings.docs[file.index].no)}</td>
          <td><strong>${escapeHtml(file.name)}</strong></td>
          <td>${file.type.toUpperCase()}</td>
          <td>${escapeHtml(file.size)}</td>
          <td>${formatLongDate(file.updated)}</td>
          <td>
            <div class="drawings-file-actions">
              <button class="drawings-btn" type="button" data-drawing-action="open" aria-label="Open ${escapeHtml(file.name)}">Open</button>
              <button class="drawings-btn is-primary" type="button" data-drawing-action="download" aria-label="Download ${escapeHtml(file.name)}"><span aria-hidden="true">⇩</span> Download</button>
            </div>
          </td>
        </tr>`
                )
                .join("")
            : ""
        }`;
    })
    .join("");
  document.getElementById("drawings-empty").hidden = shown !== 0;
}

drawingsSearch.addEventListener("input", renderDrawings);

document.querySelectorAll("[data-drawings-category]").forEach((chip) => {
  chip.addEventListener("click", () => {
    drawingsCategory = chip.dataset.drawingsCategory;
    document.querySelectorAll("[data-drawings-category]").forEach((c) => {
      c.classList.toggle("active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderDrawings();
  });
});

drawingsList.addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-drawings-toggle]");
  if (toggle) {
    const key = toggle.dataset.drawingsToggle;
    if (collapsedDrawingGroups.has(key)) collapsedDrawingGroups.delete(key);
    else collapsedDrawingGroups.add(key);
    renderDrawings();
    return;
  }
  const row = e.target.closest("tr[data-drawing-index]");
  if (!row) return;
  const index = Number(row.dataset.drawingIndex);
  const action = e.target.closest("[data-drawing-action]");
  if (action && action.dataset.drawingAction === "download") showToast(`Downloading ${libraryTabs.drawings.docs[index].name}…`);
  else showDocument("library", `drawings-${index}`);
});

drawingsList.addEventListener("keydown", (e) => {
  const row = e.target.closest("tr[data-drawing-index]");
  if (row && e.target === row && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    showDocument("library", `drawings-${row.dataset.drawingIndex}`);
  }
});
