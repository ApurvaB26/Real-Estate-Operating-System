/**
 * File: js/features/project/files.js
 * Role: Project files: overview Recent Uploads and the Files tab.
 * Dependencies: Loaded by index.html as script 40 of 80. Uses globals from js/components/action-dialog.js, js/core/router.js, js/core/utils.js, js/data/project-files.js, js/features/document-viewer.js, js/features/profile.js and 4 more. Its globals are used by js/features/document-viewer.js, js/features/project/files-fresh.js, js/main.js.
 */

/* PROJECT FILES (Files tab; overview uploads show in Recent Activity) */
const overviewUploadInput = document.getElementById("overview-upload-input");

const projectFilesGrid = document.getElementById("project-files-grid");

const projectFileSearch = document.getElementById("project-file-search");

let projectFileStage = "all";

const fileStages = ["WIP", "DD", "Tender", "GFC", "VFC", "As-built"];


const openFileFolders = new Set();


function fileKind(name) {
  const extension = name.split(".").pop().toLowerCase();
  if (extension === "pdf") return { kind: "pdf", icon: "is-pdf", label: "PDF" };
  if (["xls", "xlsx", "csv"].includes(extension)) return { kind: "sheet", icon: "is-sheet", label: "XLS" };
  if (["dwg", "dxf", "rvt"].includes(extension)) return { kind: "drawing", icon: "is-drawing", label: "DWG" };
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension))
    return { kind: "other", icon: "is-drawing", label: "IMG" };
  return { kind: "other", icon: "", label: extension.slice(0, 4).toUpperCase() || "FILE" };
}

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function uploadCardHtml(file) {
  const kind = fileKind(file.name);
  const index = projectFiles.indexOf(file);
  return `
    <article class="upload-card" data-file-index="${index}">
      <header><span class="upload-file-icon ${kind.icon}" aria-hidden="true">${kind.label}</span><span class="upload-type">${file.fresh ? '<b class="just-added">JUST ADDED</b> ' : ""}${escapeHtml(file.stage)}</span></header>
      <strong>${escapeHtml(file.name)}</strong>
      <p>${escapeHtml(file.location)}</p>
      <small>${escapeHtml(file.size)} · Uploaded by ${escapeHtml(file.by)} · ${escapeHtml(file.when)}</small>
      <div class="upload-actions"><button type="button" data-file-action="open">Open</button>${file.stage === "MAS" || /MAS/i.test(file.name) ? "" : '<button type="button" class="upload-download" data-file-action="download"><span aria-hidden="true">⇩</span> Download</button>'}</div>
    </article>`;
}

function renderFiles() {
  const query = projectFileSearch.value.trim().toLocaleLowerCase();
  const matches = (file) =>
    (projectFileStage === "all" || file.stage === projectFileStage) &&
    `${file.name} ${file.location} ${file.by} ${file.department}`.toLocaleLowerCase().includes(query);
  const filtering = Boolean(query) || projectFileStage !== "all";

  // Stage quick filters, with how many files are at each stage
  const counts = new Map();
  projectFiles.forEach((file) => counts.set(file.stage, (counts.get(file.stage) || 0) + 1));
  const stages = [
    ...fileStages.filter((stage) => counts.has(stage)),
    ...[...counts.keys()].filter((stage) => !fileStages.includes(stage))
  ];
  document.getElementById("file-stage-filters").innerHTML = ["all", ...stages]
    .map(
      (stage) => `
    <button class="task-priority-filter${projectFileStage === stage ? " is-active" : ""}" type="button" data-file-stage="${escapeHtml(stage)}" aria-pressed="${projectFileStage === stage}">
      ${stage === "all" ? "All" : escapeHtml(stage)} <span class="chip-count">${stage === "all" ? projectFiles.length : counts.get(stage)}</span>
    </button>`
    )
    .join("");

  const mep = projectFiles.filter((file) => (file.department || "MEP Design") === "MEP Design" && matches(file));
  projectFilesGrid.innerHTML = mep.length
    ? mep.map(uploadCardHtml).join("")
    : '<p class="pref-hint">No MEP files match these filters.</p>';
  document.getElementById("files-mep-count").textContent = String(mep.length).padStart(2, "0");
  let shown = mep.length;

  const folders = fileDepartments
    .slice(1)
    .map((department) => {
      const all = projectFiles.filter((file) => file.department === department.key);
      const visible = all.filter(matches);
      if (filtering && !visible.length) return "";
      shown += visible.length;
      // A search or stage filter opens every folder with a match
      const open = openFileFolders.has(department.key) || filtering;
      return `
      <section class="team-folder${open ? " is-open" : ""}">
        <button class="team-folder-head" type="button" data-file-folder="${escapeHtml(department.key)}" aria-expanded="${open}">
          <span class="team-folder-icon">${folderIcon}</span>
          <span class="team-folder-copy"><strong>${escapeHtml(department.key)}</strong><small>${escapeHtml(department.full)}</small></span>
          <span class="team-folder-count">${filtering ? `${visible.length} of ${all.length}` : `${all.length} ${all.length === 1 ? "file" : "files"}`}</span>
          <span class="task-group-chevron" aria-hidden="true"></span>
        </button>
        <div class="upload-grid files-grid team-folder-body"${open ? "" : " hidden"}>
          ${visible.length ? visible.map(uploadCardHtml).join("") : '<p class="pref-hint">No files from this department yet.</p>'}
        </div>
      </section>`;
    })
    .join("");
  document.getElementById("file-folders").innerHTML = folders;
  document.getElementById("file-folders").closest(".team-section").hidden = !folders.trim();
  document.getElementById("project-files-empty").hidden = shown !== 0;
}

function downloadProjectFile(file) {
  if (file.file) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file.file);
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(link.href);
    return;
  }
  // Seeded demo files have no stored copy
  showToast(`Downloading ${file.name}…`);
}

function openFilePreview(file) {
  showDocument("file", projectFiles.indexOf(file));
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-overview-upload-trigger]")) {
    overviewUploadInput.click();
    return;
  }

  const fileButton = e.target.closest("[data-file-action]");
  if (!fileButton) return;
  const file = projectFiles[Number(fileButton.closest("[data-file-index]").dataset.fileIndex)];
  if (fileButton.dataset.fileAction === "open") openFilePreview(file);
  else downloadProjectFile(file);
});

// Uploads ask which wing and stage they belong to; GFC drawings draft a transmittal for that wing
overviewUploadInput.addEventListener("change", () => {
  const added = Array.from(overviewUploadInput.files);
  overviewUploadInput.value = "";
  if (!added.length) return;

  openActionDialog({
    title: `Upload ${added.length === 1 ? added[0].name : `${added.length} files`}`,
    subtitle: overviewPage.querySelector(".project-title").textContent,
    body: `<p class="action-dialog-text">Uploading as <b>GFC</b> drafts a transmittal for the wing automatically. Nothing is sent until you approve it.</p>`,
    fields: [
      {
        type: "row",
        fields: [
          { name: "wing", label: "Wing / Tower", type: "select", options: transmittalWings },
          {
            name: "stage",
            label: "Stage",
            type: "select",
            options: ["WIP", "DD", "Tender", "GFC", "VFC", "As-built"],
            value: "GFC"
          }
        ]
      },
      {
        name: "department",
        label: "Department",
        type: "select",
        options: fileDepartments.map((department) => department.key),
        value: "MEP Design"
      }
    ],
    submitLabel: "Upload",
    onSubmit(values) {
      // Short display name such as 'Apurva B.' for the Uploaded by column
      const uploader = `${firstName(profileState.name)} ${profileState.name.split(/\s+/)[1]?.[0] || ""}.`.replace(
        / \.$/,
        ""
      );
      // Reversed because each file is unshifted onto the top, so the final order matches the order the user picked
      [...added].reverse().forEach((file) => {
        projectFiles.unshift({
          name: file.name,
          stage: values.stage,
          department: values.department,
          location: values.wing,
          size: formatFileSize(file.size),
          by: uploader,
          when: "Just Now",
          file
        });
      });
      renderFiles();
      [...added]
        .reverse()
        .forEach((file) =>
          prependActivity({
            initials: initialsOf(profileState.name),
            text: `${initialsOf(profileState.name)} uploaded <b>${escapeHtml(file.name)}</b> (${values.stage})`,
            tag: escapeHtml(values.wing),
            fileName: file.name
          })
        );

      if (values.stage === "GFC") {
        const transmittal = draftTransmittalFromIfc(added, values.wing);
        showToast(`Uploaded. ${transmittal.no} drafted for ${values.wing} — review and send it from Transmittals.`);
      } else {
        showToast(added.length === 1 ? `${added[0].name} uploaded.` : `${added.length} files uploaded.`);
      }
    }
  });
});

document.getElementById("file-stage-filters").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-file-stage]");
  if (!chip) return;
  projectFileStage = chip.dataset.fileStage;
  renderFiles();
});

document.getElementById("file-folders").addEventListener("click", (e) => {
  const head = e.target.closest("[data-file-folder]");
  if (!head) return;
  const key = head.dataset.fileFolder;
  if (openFileFolders.has(key)) openFileFolders.delete(key);
  else openFileFolders.add(key);
  renderFiles();
  document.querySelector(`[data-file-folder="${key}"]`)?.focus();
});

projectFileSearch.addEventListener("input", renderFiles);
