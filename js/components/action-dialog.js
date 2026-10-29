/**
 * File: js/components/action-dialog.js
 * Role: Shared action dialog used by Remind, Respond, Add Deliverable, Transmittal, Add Member, Schedule Meeting and previews.
 * Dependencies: Loaded by index.html as script 20 of 80. Uses globals from js/components/date-picker.js, js/core/utils.js, js/data/team.js, js/features/profile.js, js/features/task-drawer.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/features/auth.js, js/features/focus-mode.js, js/features/library/makes.js, js/features/meetings/meetings-page.js, js/features/project/files.js, js/features/project/tracker-import.js and 6 more.
 */

/* SHARED ACTION DIALOG */
const actionBackdrop = document.getElementById("action-dialog-backdrop");

const actionForm = document.getElementById("action-form");

const actionFields = document.getElementById("action-form-fields");

const actionSubmit = document.getElementById("action-submit");

const actionCancel = document.getElementById("action-cancel");

let actionConfig = null;

// Element that had focus before the dialog opened; focus goes back to it on close (keyboard accessibility)
let actionReturnFocus = null;

const uploadIcon =
  icon("upload", 18);

// Builds one form field from a plain config object, so every Remind/Respond/Add dialog shares one form instead of its own markup
function actionFieldHtml(field) {
  // A 'row' groups fields side by side; it recurses so rows can nest
  if (field.type === "row") {
    return `<div class="task-row">${field.fields.map(actionFieldHtml).join("")}</div>`;
  }

  const id = `action-${field.name}`;
  const required = field.required ? " required" : "";
  const star = field.required ? " <span>*</span>" : "";

  if (field.type === "checkbox") {
    return `<label class="action-check"><input type="checkbox" name="${field.name}"${field.value ? " checked" : ""}> ${escapeHtml(field.label)}</label>`;
  }

  // Searchable people picker grouped by team (MEP first); field.exclude hides people already invited
  if (field.type === "people") {
    // Never offer yourself (or people already invited) in the picker
    const exclude = new Set([profileState.name, ...(field.exclude || [])]);
    const groups = teamGroups
      .map((group) => {
        const people = teamMembers.filter((member) => member.group === group.key && !exclude.has(member.name));
        if (!people.length) return "";
        return `
        <div class="people-group" data-people-group>
          <p class="people-group-title">${escapeHtml(group.label)}</p>
          ${people
            .map(
              (member) => `
            <label class="action-check people-option" data-people-option>
              <input type="checkbox" name="${field.name}" value="${escapeHtml(member.name)}">
              <span class="member-avatar">${escapeHtml(initialsOf(member.name))}</span>
              <span class="member-copy"><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.role)}</small></span>
            </label>`
            )
            .join("")}
        </div>`;
      })
      .join("");
    return `
      <fieldset class="form-field people-field">
        <legend>${escapeHtml(field.label)}</legend>
        <label class="colleague-search people-search">
          ${icon("search-lg")}
          <input type="search" data-people-search placeholder="Search people or teams..." aria-label="Search people">
        </label>
        <div class="people-list">${groups}<p class="no-colleagues" data-people-empty hidden>No one matches.</p></div>
        <p class="people-count" data-people-count aria-live="polite">No one selected</p>
      </fieldset>`;
  }

  if (field.type === "checklist") {
    return `
      <fieldset class="form-field action-checklist">
        <legend>${escapeHtml(field.label)}${star}</legend>
        ${field.options.map((option) => `<label class="action-check"><input type="checkbox" name="${field.name}" value="${escapeHtml(option)}"${field.value?.includes(option) ? " checked" : ""}> ${escapeHtml(option)}</label>`).join("")}
      </fieldset>`;
  }

  let control;
  if (field.type === "textarea") {
    control = `<textarea id="${id}" name="${field.name}" placeholder="${escapeHtml(field.placeholder || "")}"${required}>${escapeHtml(field.value || "")}</textarea>`;
  } else if (field.type === "select") {
    control = `<select id="${id}" name="${field.name}">${field.options.map((option) => `<option${option === field.value ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
  } else if (field.type === "file") {
    control = `<label class="task-upload" for="${id}"><span class="task-upload-text" data-default-label="Upload Files">Upload Files</span>${uploadIcon}</label>
      <input class="visually-hidden" id="${id}" name="${field.name}" type="file"${field.accept ? ` accept="${field.accept}"` : ""}>`;
  } else {
    const extra = [
      field.min !== undefined ? ` min="${field.min}"` : "",
      field.max !== undefined ? ` max="${field.max}"` : ""
    ].join("");
    control = `<input id="${id}" name="${field.name}" type="${field.type || "text"}" value="${escapeHtml(field.value ?? "")}" placeholder="${escapeHtml(field.placeholder || "")}"${extra}${required}>`;
  }

  return `<div class="form-field"><label for="${id}">${escapeHtml(field.label)}${star}</label>${control}</div>`;
}

// Flatten rows into a plain field list so submit can read values without caring about layout
const flattenFields = (fields = []) =>
  fields.flatMap((field) => (field.type === "row" ? flattenFields(field.fields) : [field]));

function openActionDialog(config) {
  actionConfig = config;
  // Remember where the user was so closing returns them there
  actionReturnFocus = document.activeElement;
  actionBackdrop.querySelector(".action-dialog").classList.toggle("is-wide", Boolean(config.wide));
  document.getElementById("action-dialog-title").textContent = config.title;
  const subtitle = document.getElementById("action-dialog-subtitle");
  subtitle.textContent = config.subtitle || "";
  subtitle.hidden = !config.subtitle;
  actionFields.innerHTML = `${config.body || ""}${(config.fields || []).map(actionFieldHtml).join("")}<p class="action-error" role="alert" hidden></p>`;
  // Dialog fields are created after page load, so upgrade their date inputs to the custom date picker here
  enhanceDateInputs(actionFields);
  actionSubmit.textContent = config.submitLabel || "Save";
  // submitLabel: null makes a read-only dialog with only a Cancel/Close button
  actionSubmit.hidden = config.submitLabel === null;
  actionCancel.textContent = config.cancelLabel || "Cancel";
  actionBackdrop.hidden = false;
  document.body.classList.add("project-dialog-open");
  (
    actionFields.querySelector("input:not([type='checkbox']):not([type='file']), textarea, select") ||
    (actionSubmit.hidden ? actionCancel : actionSubmit)
  ).focus();
}

function closeActionDialog() {
  if (actionBackdrop.hidden) return;
  actionBackdrop.hidden = true;
  actionConfig = null;
  // Keep page scroll locked if a side drawer is still open behind the dialog
  if (drawerBackdrop.hidden) document.body.classList.remove("project-dialog-open");
  actionReturnFocus?.focus?.();
}

function setActionError(message) {
  const error = actionFields.querySelector(".action-error");
  error.textContent = message;
  error.hidden = !message;
}

actionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!actionConfig) return;
  // Use the browser's built-in required-field messages
  if (!actionForm.reportValidity()) return;

  const formData = new FormData(actionForm);
  const values = {};
  flattenFields(actionConfig.fields).forEach((field) => {
    if (field.type === "checklist" || field.type === "people") values[field.name] = formData.getAll(field.name);
    else if (field.type === "checkbox") values[field.name] = formData.has(field.name);
    else if (field.type === "file")
      values[field.name] = formData.get(field.name)?.name ? formData.get(field.name) : null;
    else values[field.name] = String(formData.get(field.name) ?? "").trim();
  });

  setActionError("");
  // A handler can return false to keep the dialog open (for example after showing an error)
  if (actionConfig.onSubmit?.(values) === false) return;
  closeActionDialog();
});

actionFields.addEventListener("input", (e) => {
  const search = e.target.closest("[data-people-search]");
  if (!search) return;
  const query = search.value.trim().toLocaleLowerCase();
  const field = search.closest(".people-field");
  let matches = 0;
  field.querySelectorAll("[data-people-group]").forEach((group) => {
    // Typing a team name shows everyone in that team
    const groupMatches = group.querySelector(".people-group-title").textContent.toLocaleLowerCase().includes(query);
    let visibleInGroup = 0;
    group.querySelectorAll("[data-people-option]").forEach((option) => {
      option.hidden = !(groupMatches || option.textContent.toLocaleLowerCase().includes(query));
      if (!option.hidden) visibleInGroup += 1;
    });
    group.hidden = visibleInGroup === 0;
    matches += visibleInGroup;
  });
  field.querySelector("[data-people-empty]").hidden = matches !== 0;
});

actionFields.addEventListener("change", (e) => {
  const person = e.target.closest("[data-people-option] input");
  if (person) {
    const field = person.closest(".people-field");
    const count = field.querySelectorAll("[data-people-option] input:checked").length;
    field.querySelector("[data-people-count]").textContent = count ? `${count} selected` : "No one selected";
    return;
  }

  const input = e.target.closest("input[type='file']");
  if (!input) return;
  const label = actionFields.querySelector(`label[for="${input.id}"] .task-upload-text`);
  if (label) label.textContent = input.files[0]?.name || label.dataset.defaultLabel;
});

actionBackdrop.addEventListener("click", (e) => {
  if (e.target === actionBackdrop || e.target.closest("[data-close-action-dialog]")) closeActionDialog();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !actionBackdrop.hidden) closeActionDialog();
});

const detailList = (pairs) =>
  `<dl class="action-detail-list">${pairs
    .filter(([, value]) => value)
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join("")}</dl>`;
