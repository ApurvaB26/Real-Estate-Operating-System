/**
 * File: js/features/document-viewer.js
 * Role: Document page (BOQs, library documents, project files, transmittal PDFs) and document zoom.
 * Dependencies: Loaded by index.html as script 57 of 80. Uses globals from js/core/router.js, js/core/utils.js, js/data/boq-sheets.js, js/data/project-files.js, js/features/library/boqs.js, js/features/library/library.js and 8 more. Its globals are used by js/core/router.js, js/features/library/drawings.js, js/features/library/library.js, js/features/project/files.js, js/features/project/transmittal-pdf.js, js/features/record-drawer.js.
 */

const docBody = document.getElementById("doc-view-body");

pageSections.doc = docView;

// Page to return to when the user closes a document (the doc/ route itself is never a return target)
let docReturnRoute = "";

let docObjectUrl = null;

let currentDocument = null;

const downloadIcon =
  icon("download", 14);

const docButton = (action, label, primary = false) =>
  `<button class="${primary ? "project-task-add" : "task-advanced-filter-button"}" type="button" data-doc-action="${action}">${primary ? downloadIcon : ""}${label}</button>`;

const docRenderers = {
  library(key) {
    const [tabKey, index] = key.split("-");
    const tab = libraryTabs[tabKey];
    const doc = tab?.docs[Number(index)];
    if (!doc) return null;
    const crumbs = [
      { label: "Library", view: "library" },
      { label: tab.label, route: tabKey === "policies" ? "library" : `library/${tabKey}` },
      { label: doc.name }
    ];
    const meta = `${doc.no} · ${doc.version} · Updated ${formatLongDate(doc.updated)}`;

    if (tabKey === "boqs") {
      return {
        section: "library",
        crumbs,
        kicker: "BOQ",
        title: doc.name,
        meta,
        actions: docButton("download-boq", "Download Excel", true),
        body: boqSheetHtml(doc),
        context: { doc }
      };
    }

    const policy = tabKey === "policies";
    const pages = Number((doc.meta.match(/(\d+)\s*Pages/i) || [])[1]) || 1;
    return {
      section: "library",
      crumbs,
      kicker: policy ? "Policy · view only" : tab.label,
      title: doc.name,
      meta,
      // Policies can only be read here; everything else in the library can be downloaded
      actions: policy
        ? `<span class="doc-viewer-lock">${lockIcon} View only — policies can't be downloaded or printed</span>`
        : docButton("download-library", "Download", true),
      body: `
        <div class="doc-viewer doc-viewer-page">
          <div class="doc-viewer-bar"><span>Page 1 of ${pages}</span><span>${escapeHtml(doc.meta)}</span></div>
          ${libraryPageHtml(doc, tabKey)}
        </div>`,
      context: { doc }
    };
  },

  file(key) {
    const file = projectFiles[Number(key)];
    if (!file) return null;
    const project = currentProjectName();
    const kind = fileKind(file.name);
    let preview;
    if (file.file && (file.file.type === "application/pdf" || kind.kind === "pdf")) {
      docObjectUrl = URL.createObjectURL(file.file);
      preview = `<iframe class="doc-frame" src="${docObjectUrl}" title="${escapeHtml(file.name)}"></iframe>`;
    } else if (file.file && file.file.type.startsWith("image/")) {
      docObjectUrl = URL.createObjectURL(file.file);
      preview = `<div class="doc-image"><img src="${docObjectUrl}" alt="${escapeHtml(file.name)}"></div>`;
    } else {
      preview = `
        <div class="doc-unavailable">
          <span class="upload-file-icon ${kind.icon}">${kind.label}</span>
          <strong>${file.file ? `${kind.label} files can't be previewed in the browser` : "Preview isn't stored for this sample file"}</strong>
          <p>${kind.kind === "drawing" ? "Download it to open in AutoCAD or a DWG viewer." : "Download it to open on your computer."}</p>
        </div>`;
    }
    return {
      section: "projects",
      crumbs: [
        { label: "Projects", view: "projects" },
        { label: project, route: "project/overview" },
        { label: "Files", route: "project/files" },
        { label: file.name }
      ],
      kicker: `${kind.label} · ${file.stage}`,
      title: file.name,
      meta: `${file.location} · ${file.size} · Uploaded by ${file.by} · ${file.when}`,
      actions: docButton("download-file", "Download", true),
      body: preview,
      context: { file }
    };
  },

  transmittal(key) {
    const t = transmittals.find((item) => item.no === key);
    if (!t) return null;
    const project = currentProjectName();
    return {
      section: "projects",
      crumbs: [
        { label: "Projects", view: "projects" },
        { label: project, route: "project/overview" },
        { label: "Transmittals", route: "project/transmittals" },
        { label: `${t.no} PDF` }
      ],
      kicker: `Transmittal · ${t.status === "sent" ? `Sent ${transmittalDate(t.sent)}` : "Pending approval"}`,
      title: `${t.no} — ${t.wing}`,
      meta: `${t.drawings.length} drawing${t.drawings.length === 1 ? "" : "s"} · To ${t.recipient || "recipient not set"} · Source ${t.source}`,
      actions: `${t.status === "pending" ? docButton("review", "Review & Send") : ""}${docButton("edit-pdf", "Edit PDF")}${docButton("download-pdf", "Download PDF", true)}`,
      body: '<div class="doc-frame doc-frame-loading">Preparing PDF…</div>',
      context: { t },
      async after() {
        try {
          const pdf = await buildTransmittalPdf(t);
          if (currentDocument?.key !== `transmittal/${key}`) return;
          docObjectUrl = pdf.output("bloburl");
          docBody.innerHTML = `<iframe class="doc-frame" src="${docObjectUrl}" title="${t.no} PDF"></iframe>`;
          applyDocZoom();
        } catch (error) {
          docBody.innerHTML = `<div class="doc-unavailable"><strong>Couldn't show the PDF</strong><p>${escapeHtml(error.message)}</p></div>`;
        }
      }
    };
  }
};

function showDocument(kind, key) {
  const from = currentHash();
  if (!from.startsWith("doc/")) docReturnRoute = from;
  // Free the previous document's blob URL before opening another, to avoid leaking memory
  if (docObjectUrl) {
    URL.revokeObjectURL(docObjectUrl);
    docObjectUrl = null;
  }

  const view = docRenderers[kind]?.(String(key));
  // A shared link to a document that no longer exists lands back where the user came from, with a message
  if (!view) {
    showToast("That document isn't available any more.");
    renderRoute(docReturnRoute || "library");
    return;
  }

  currentDocument = { kind, key: `${kind}/${key}`, ...view.context };
  sidebarSection.doc = view.section;
  showPage("doc");
  document.getElementById("doc-view-kicker").textContent = view.kicker;
  document.getElementById("doc-view-title").textContent = view.title;
  document.getElementById("doc-view-meta").textContent = view.meta;
  document.getElementById("doc-view-actions").innerHTML = docZoomControls() + view.actions;
  docBody.innerHTML = view.body;
  docZoom = 100;
  applyDocZoom();
  renderBreadcrumb(view.crumbs);
  syncHash(`doc/${kind}/${key}`);
  view.after?.();
}

docView.addEventListener("click", (e) => {
  if (e.target.closest("[data-doc-back]")) {
    renderRoute(docReturnRoute || (currentDocument?.kind === "library" ? "library" : "project/overview"));
    return;
  }

  const button = e.target.closest("[data-doc-action]");
  if (!button || !currentDocument) return;
  const { doc, file, t } = currentDocument;
  const action = button.dataset.docAction;
  if (action === "download-boq") downloadBoq(doc, boqRows(boqSheets[doc.no] || []));
  else if (action === "download-library") showToast(`Downloading ${doc.no} — ${doc.name}…`);
  else if (action === "download-file") downloadProjectFile(file);
  else if (action === "download-pdf") downloadTransmittalPdf(t);
  else if (action === "edit-pdf") openTransmittalPdfEditor(t);
  else if (action === "review") {
    openProject(overviewPage.querySelector(".project-title").textContent, "transmittals");
    const row = document.querySelector(`#transmittal-list tr[data-transmittal-index="${transmittals.indexOf(t)}"]`);
    if (row) openTransmittalDrawer(row);
  }
});

// Search inside a BOQ: keep a bill's heading while any of its items match
docView.addEventListener("input", (e) => {
  const search = e.target.closest("[data-boq-search]");
  if (!search) return;
  const query = search.value.trim().toLocaleLowerCase();
  let bill = null;
  let billHasMatch = false;
  let matches = 0;
  const closeBill = () => {
    if (bill) bill.hidden = Boolean(query) && !billHasMatch;
  };
  Array.from(docView.querySelector(".boq-sheet tbody").rows).forEach((row) => {
    if (row.dataset.boqRow === "bill") {
      closeBill();
      bill = row;
      billHasMatch = false;
      return;
    }
    const ok = !query || (row.dataset.boqRow === "item" && row.textContent.toLocaleLowerCase().includes(query));
    row.hidden = !ok;
    if (ok && row.dataset.boqRow === "item") {
      billHasMatch = true;
      matches += 1;
    }
  });
  closeBill();
  docView.querySelector("[data-boq-empty]").hidden = !query || matches > 0;
});

// After a PDF edit, the open preview shows the new version
function refreshTransmittalPreview(t) {
  if (!docView.hidden && currentDocument?.key === `transmittal/${t.no}`) showDocument("transmittal", t.no);
}

/* DOCUMENT ZOOM: zoom the document itself, not the whole app */
let docZoom = 100;

const docZoomSteps = [50, 67, 75, 90, 100, 110, 125, 150, 175, 200, 250, 300];

function docZoomTarget() {
  return docBody.querySelector("iframe.doc-frame, .doc-page, .boq-sheet, .doc-image img");
}

function applyDocZoom() {
  const target = docZoomTarget();
  const label = document.getElementById("doc-zoom-value");
  if (label) label.textContent = `${docZoom}%`;
  document.querySelectorAll("[data-doc-zoom]").forEach((button) => {
    button.disabled = !target;
  });
  if (!target) return;
  if (target.tagName === "IFRAME") {
    // Changing the #zoom fragment is the only way to zoom the built-in PDF viewer; other content uses CSS zoom
    // Chrome's PDF viewer takes its zoom from the URL
    const base = target.src.split("#")[0];
    if (base) target.src = `${base}#zoom=${docZoom}`;
  } else {
    target.style.zoom = docZoom / 100;
  }
}

function setDocZoom(next) {
  docZoom = Math.min(300, Math.max(50, Math.round(next)));
  applyDocZoom();
}

// Zoom moves through fixed steps (50% to 300%) rather than a fixed percentage, so it feels the same at every level
function stepDocZoom(direction) {
  const next =
    direction > 0
      ? docZoomSteps.find((step) => step > docZoom)
      : [...docZoomSteps].reverse().find((step) => step < docZoom);
  setDocZoom(next ?? docZoom);
}

const docZoomControls = () => `
  <div class="doc-zoom" role="group" aria-label="Zoom document">
    <button type="button" data-doc-zoom="out" aria-label="Zoom out">−</button>
    <button type="button" class="doc-zoom-value" id="doc-zoom-value" data-doc-zoom="reset" aria-label="Reset zoom">100%</button>
    <button type="button" data-doc-zoom="in" aria-label="Zoom in">+</button>
  </div>`;

docView.addEventListener("click", (e) => {
  const button = e.target.closest("[data-doc-zoom]");
  if (!button) return;
  if (button.dataset.docZoom === "in") stepDocZoom(1);
  else if (button.dataset.docZoom === "out") stepDocZoom(-1);
  else setDocZoom(100);
});

// Ctrl/⌘ + wheel or + / − over a document zooms the document instead of the page
docBody.addEventListener(
  "wheel",
  (e) => {
    if (!(e.ctrlKey || e.metaKey) || !docZoomTarget()) return;
    e.preventDefault();
    setDocZoom(docZoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
  },
  { passive: false }
);

document.addEventListener("keydown", (e) => {
  if (docView.hidden || !(e.ctrlKey || e.metaKey) || !docZoomTarget()) return;
  if (e.key === "=" || e.key === "+") stepDocZoom(1);
  else if (e.key === "-") stepDocZoom(-1);
  else if (e.key === "0") setDocZoom(100);
  else return;
  e.preventDefault();
});
