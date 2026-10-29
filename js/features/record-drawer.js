/**
 * File: js/features/record-drawer.js
 * Role: Details drawer for RFIs, deliverables and transmittals.
 * Dependencies: Loaded by index.html as script 56 of 80. Uses globals from js/components/action-dialog.js, js/components/date-picker.js, js/components/layers.js, js/core/utils.js, js/data/project-files.js, js/data/rfis.js and 15 more. Its globals are used by js/features/document-viewer.js, js/features/project/transmittal-pdf.js, js/features/project/workspace.js, js/features/row-actions.js.
 */

/* DETAILS DRAWER: RFIs, deliverables and transmittals (same layout as the task drawer) */
const recordBackdrop = document.getElementById("record-drawer-backdrop");

const recordBody = document.getElementById("record-drawer-body");

const recordAttachmentInput = document.getElementById("record-attachment-input");

const dashboardRecords = new WeakMap();

// rows that only exist in the HTML get a record the first time they open
// Context of the open drawer: {heading, render(), footer(), actions}. One drawer shell serves RFIs, deliverables and transmittals; each type supplies its own render()
let recordCtx = null;

const recordSelect = (name, options, value) => `
  <span class="drawer-control">
    <select data-record-field="${name}" aria-label="${name}">
      ${(value && !options.includes(value) ? [value, ...options] : options).map((option) => `<option${option === value ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}
    </select>
    <span class="drawer-chevron" aria-hidden="true"></span>
  </span>`;

const recordReadonly = (value) => `<span class="drawer-control drawer-readonly">${escapeHtml(value || "—")}</span>`;

const recordDetail = (label, control) => `<div class="drawer-detail"><span>${label}</span>${control}</div>`;

function recordChips(items, emptyText) {
  return items.length
    ? items.map((item) => `<div class="drawer-item-chip"><span>${escapeHtml(item)}</span></div>`).join("")
    : `<p class="drawer-empty">${emptyText}</p>`;
}

function recordThread(thread, emptyText) {
  return thread.length
    ? thread
        .map(
          (entry) =>
            `<div class="drawer-comment"><strong>${escapeHtml(entry.by)}</strong> <small>${escapeHtml(entry.when)}</small><p>${escapeHtml(entry.text)}</p></div>`
        )
        .join("")
    : `<p class="drawer-empty">${emptyText}</p>`;
}

function recordSections(
  data,
  { threadTitle = "Comments", threadEmpty = "No comments yet.", placeholder = "Add a comment..." } = {}
) {
  return `
    <section class="drawer-section">
      <h4>Attachments</h4>
      <div class="drawer-item-list">${recordChips(data.attachments, "No attachments.")}</div>
      <button class="drawer-add-action" type="button" data-record-attach>+ Add attachment</button>
    </section>
    <section class="drawer-section">
      <h4>${threadTitle}</h4>
      <div class="drawer-comments">${recordThread(data.thread, threadEmpty)}</div>
      <form class="drawer-comment-form" data-record-thread>
        <input type="text" placeholder="${placeholder}" aria-label="${placeholder}" autocomplete="off">
        <button type="submit" aria-label="Send">
          ${icon("send-comment", 18)}
        </button>
      </form>
    </section>
    <section class="drawer-section">
      <h4>Activity</h4>
      <div class="drawer-activity-list">${data.activity.map((entry) => `<p class="drawer-activity-item">${escapeHtml(entry)}</p>`).join("")}</div>
    </section>`;
}

const recordFooter = document.getElementById("record-drawer-footer");

const defaultRecordFooter = recordFooter.innerHTML;

function openRecordDrawer(ctx) {
  recordCtx = ctx;
  document.getElementById("record-drawer-heading").textContent = ctx.heading;
  recordBody.innerHTML = ctx.render();
  recordFooter.innerHTML = ctx.footer ? ctx.footer() : defaultRecordFooter;
  enhanceDateInputs(recordBody);
  recordBody.scrollTop = 0;
  recordBackdrop.hidden = false;
  document.body.classList.add("project-dialog-open");
  recordBackdrop.querySelector(".drawer-close").focus();
}

// Remember and restore the scroll position, otherwise every edit would jump the user back to the top
function rerenderRecordDrawer() {
  const scroll = recordBody.scrollTop;
  recordBody.innerHTML = recordCtx.render();
  recordFooter.innerHTML = recordCtx.footer ? recordCtx.footer() : defaultRecordFooter;
  enhanceDateInputs(recordBody);
  recordBody.scrollTop = scroll;
}

function closeRecordDrawer() {
  if (recordBackdrop.hidden) return;
  recordBackdrop.hidden = true;
  recordCtx = null;
  // Keep page scroll locked if an action dialog is still open on top
  if (actionBackdrop.hidden) document.body.classList.remove("project-dialog-open");
}

/* RFI details */
function rfiDataForRow(row) {
  if (row.dataset.rfiIndex !== undefined) return rfiData[Number(row.dataset.rfiIndex)];
  if (row.matches("[data-oi-row]")) return openItemsConfig.rfis.rows[Number(row.dataset.oiIndex)];
  if (!dashboardRecords.has(row)) {
    const cells = Array.from(row.cells, (cell) => cell.textContent.trim());
    dashboardRecords.set(row, {
      id: cells[0],
      query: rowTitle(row),
      wing: cells[2],
      impact: cells[3],
      discipline: cells[4],
      by: cells[5],
      blocking: Boolean(row.querySelector(".badge.blocking")),
      received: "2h ago",
      files: 2
    });
  }
  return dashboardRecords.get(row);
}

function openRfiDrawer(row) {
  const data = rfiDataForRow(row);
  const closed = () => data.status === "completed" || data.group === "completed";
  data.attachments ||= Array.from({ length: data.files || 0 }, (_, i) => `${data.id}_markup_${i + 1}.pdf`);
  data.thread ||= [];
  data.activity ||= [`Raised by ${data.by}${data.received ? ` · ${data.received}` : ""}`];

  openRecordDrawer({
    data,
    heading: "RFI Details",
    render() {
      const status = closed() ? "Closed" : data.answered ? "Answered" : "Open";
      return `
        <p class="drawer-meta">${escapeHtml(data.id)} · ${escapeHtml(data.wing)} · Raised by ${escapeHtml(data.by)}</p>
        <h3 class="drawer-title">${escapeHtml(data.query)} ${data.blocking && !closed() ? '<span class="badge blocking">Blocking</span>' : ""}</h3>
        <p class="drawer-description">${escapeHtml(data.description || `Clarification requested for ${data.wing}: ${data.query}.${data.blocking ? " Work on this package is on hold until it's answered." : ""}`)}</p>
        <div class="drawer-detail-grid">
          ${recordDetail("Status", recordSelect("status", ["Open", "Answered", "Closed"], status))}
          ${recordDetail("Impact", recordSelect("impact", ["None", "Cost", "Time", "Cost & Time"], data.impact))}
          ${recordDetail("Discipline", recordSelect("discipline", ["Electrical", "Plumbing", "HVAC", "Firefighting"], data.discipline || data.disc))}
          ${recordDetail("Received", recordReadonly(data.received || "—"))}
        </div>
        ${recordSections(data, { threadTitle: "Responses", threadEmpty: "No responses yet.", placeholder: "Write a response..." })}`;
    },
    onThread() {
      data.answered = true;
      return `Response posted by ${profileState.name}`;
    },
    save(values) {
      const changes = [];
      if (values.impact !== data.impact) changes.push(`Impact changed to ${values.impact}`);
      if (values.discipline !== (data.discipline || data.disc))
        changes.push(`Discipline changed to ${values.discipline}`);
      data.impact = values.impact;
      if ("disc" in data) data.disc = values.discipline;
      else data.discipline = values.discipline;
      data.answered = values.status !== "Open";
      if (changes.length) data.activity.push(changes.join(" · "));

      if (values.status === "Closed" && !closed()) {
        data.activity.push(`Closed by ${profileState.name}`);
        closeRfi(row);
        return `${data.id} closed.`;
      }
      if (row.dataset.rfiIndex !== undefined) renderRfis();
      else if (row.matches("[data-oi-row]")) buildOpenItemsPanel("rfis");
      else {
        row.cells[3].textContent = values.impact;
        row.cells[4].textContent = values.discipline;
      }
      return `${data.id} updated.`;
    }
  });
}

/* Deliverable details */
function deliverableDataForRow(row) {
  if (row.dataset.trackerIndex !== undefined)
    return { source: "tracker", data: deliverableTracker[Number(row.dataset.trackerIndex)] };
  if (row.matches("[data-oi-row]"))
    return { source: "open-items", data: openItemsConfig.deliverables.rows[Number(row.dataset.oiIndex)] };
  if (!dashboardRecords.has(row)) {
    dashboardRecords.set(row, {
      title: rowTitle(row),
      project: row.cells[2].textContent.trim(),
      status: row.querySelector(".task-state")?.textContent.trim() || "Not Started",
      dueLabel: rowDueStatus(row)?.textContent.trim() || "",
      waiting: row
        .querySelector(".waiting-tag")
        ?.textContent.replace(/^[\s\S]*Waiting on\s*/i, "")
        .trim(),
      priority: rowPriorityBadge(row)?.textContent.trim()
    });
  }
  return { source: "dashboard", data: dashboardRecords.get(row) };
}

function openDeliverableDrawer(row) {
  const { source, data } = deliverableDataForRow(row);
  const inTracker = source === "tracker";
  const status = () => data.status || data.stateLabel || "Not Started";
  data.attachments ||=
    inTracker && data.status !== "Not Started" ? [`${data.docNo}_${data.stage.replace(/\s+/g, "")}.pdf`] : [];
  data.thread ||= [];
  data.activity ||= [inTracker ? `Added to tracker · owner ${data.owner || "unassigned"}` : "Deliverable created"];

  openRecordDrawer({
    data,
    heading: "Deliverable Details",
    render() {
      const meta = inTracker
        ? `${data.docNo} · ${data.tower} · ${data.floor}`
        : `${data.project || ""}${data.sub ? ` · ${data.sub}` : ""}`;
      const dueValue = data.due && /^\d{4}-/.test(data.due) ? data.due : "";
      const grid = inTracker
        ? `
          ${recordDetail("Status", recordSelect("status", trackerStatuses, status()))}
          ${recordDetail("Due date", `<span class="drawer-control date-control"><input type="date" data-record-field="due" value="${dueValue}" aria-label="Due date"></span>`)}
          ${recordDetail("Stage", recordSelect("stage", uniqueOptions(trackerStages, "stage"), data.stage))}
          ${recordDetail("Department", recordSelect("department", uniqueOptions(trackerDepartments, "department"), data.department))}
          ${recordDetail("Tower", recordSelect("tower", uniqueOptions(trackerTowers, "tower"), data.tower))}
          ${recordDetail("Floor", recordSelect("floor", uniqueOptions(trackerFloors, "floor").sort(trackerGroupSort("floor")), data.floor))}
          ${recordDetail(
            "Owner",
            recordSelect(
              "owner",
              teamMembers.filter((m) => m.group === "mep").map((m) => m.name),
              data.owner
            )
          )}`
        : `
          ${recordDetail("Status", recordSelect("status", [...trackerStatuses, "Delayed"], status()))}
          ${recordDetail("Due date", `<span class="drawer-control date-control"><input type="date" data-record-field="due" value="${dueValue}" aria-label="Due date"></span>`)}
          ${recordDetail("Currently", recordReadonly(data.dueLabel || "—"))}
          ${recordDetail("Priority", recordReadonly(data.priority))}`;
      return `
        <p class="drawer-meta">${escapeHtml(meta)}</p>
        <h3 class="drawer-title">${escapeHtml(data.title.replace(/<[^>]+>/g, ""))}</h3>
        ${data.waiting ? `<p class="drawer-description"><span class="waiting-tag">Waiting on ${escapeHtml(data.waiting.replace(/<[^>]+>/g, ""))}</span> — use Remind on the list to nudge them.</p>` : ""}
        <div class="drawer-detail-grid">${grid}</div>
        ${recordSections(data)}`;
    },
    save(values) {
      const changes = [];
      if (values.status !== status()) changes.push(`Status changed to ${values.status}`);
      if (values.due && values.due !== data.due) changes.push(`Due date set to ${formatLongDate(values.due)}`);

      if (inTracker) {
        ["stage", "department", "tower", "floor", "owner"].forEach((key) => {
          if (values[key] !== data[key]) changes.push(`${trackerFieldLabels[key]} changed to ${values[key]}`);
        });
        Object.assign(data, {
          status: values.status,
          due: values.due || data.due,
          stage: values.stage,
          department: values.department,
          tower: values.tower,
          floor: values.floor,
          owner: values.owner
        });
        if (changes.length) data.activity.push(changes.join(" · "));
        renderTracker();
        return `${data.docNo} updated.`;
      }

      const due = values.due ? dueInfo(values.due) : null;
      if (changes.length) data.activity.push(changes.join(" · "));
      if (source === "open-items") {
        data.stateLabel = values.status;
        data.state = deliverableStateClass[values.status] || "pending";
        if (due) Object.assign(data, { due: due.due, dueLabel: due.label });
        data.group = values.status === "Approved" ? "completed" : data.group === "completed" ? "pending" : data.group;
        buildOpenItemsPanel("deliverables");
      } else {
        data.status = values.status;
        const chip = row.querySelector(".task-state");
        chip.className = `task-state ${deliverableStateClass[values.status] || "pending"}`;
        chip.textContent = values.status;
        if (due) {
          data.due = values.due;
          data.dueLabel = due.label;
          const dueChip = rowDueStatus(row);
          dueChip.className = `status ${due.cls}`;
          dueChip.textContent = due.label;
        }
        const checkbox = row.querySelector(".task-checkbox");
        if (checkbox.checked !== (values.status === "Approved")) {
          checkbox.checked = values.status === "Approved";
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      return "Deliverable updated.";
    }
  });
}

/* Transmittal details: review drawings, confirm recipient, then approve & send */
const recordValues = () =>
  Object.fromEntries(
    Array.from(recordBody.querySelectorAll("[data-record-field]"), (field) => [field.dataset.recordField, field.value])
  );

// Copies edited drawer fields back into the transmittal; the 'in values' checks skip fields that are read-only (a sent transmittal has no inputs) and counts are clamped to 0 or more
function applyTransmittalFields(t) {
  const values = recordValues();
  if ("recipient" in values) t.recipient = values.recipient.trim();
  if ("recipientRole" in values) t.recipientRole = values.recipientRole.trim();
  if (values.source) t.source = values.source;
  if (values.purpose) t.purpose = values.purpose;
  if ("color" in values) t.copies.color = Math.max(0, Number(values.color) || 0);
  if ("bw" in values) t.copies.bw = Math.max(0, Number(values.bw) || 0);
}

function openTransmittalDrawer(row) {
  const t = transmittals[Number(row.dataset.transmittalIndex)];
  // Older records have no activity log yet; create one so the history timeline always has a first entry
  t.activity ||= [t.origin === "ifc" ? "Drafted automatically from an GFC upload" : `Created by ${t.by}`];
  if (t.status === "sent" && !t.activity.some((entry) => entry.startsWith("Sent")))
    t.activity.push(`Sent to ${t.recipient} on ${transmittalDate(t.sent)}`);
  let error = "";

  openRecordDrawer({
    data: t,
    heading: "Transmittal Details",
    render() {
      const pending = t.status === "pending";
      const defaults = transmittalDefaults(t.wing);
      const suggestions = recentRecipients().filter((name) => name !== t.recipient);
      const numberInput = (name, value, label) =>
        `<span class="drawer-control"><input type="number" min="0" data-record-field="${name}" value="${value}" aria-label="${label}"></span>`;
      return `
        <p class="drawer-meta">${t.no} · ${escapeHtml(t.wing)} · ${t.origin === "ifc" ? `Drafted from GFC upload on ${transmittalDate(t.created)}` : `Created by ${escapeHtml(t.by)}`}</p>
        <h3 class="drawer-title">${escapeHtml(transmittalSubject(t))} <span class="tr-chip ${pending ? "is-pending" : "is-sent"}">${pending ? "Pending" : "Sent"}</span></h3>
        ${
          pending
            ? `<p class="drawer-description">Check the drawings and recipient, then approve to send. ${t.recipient && defaults.basis ? `Recipient filled from history — ${escapeHtml(defaults.basis.no)} went to ${escapeHtml(defaults.basis.recipient)} on ${transmittalDate(defaults.basis.sent)}.` : ""}</p>`
            : `<p class="drawer-description">Sent to ${escapeHtml(t.recipient)} on ${transmittalDate(t.sent)}.</p>`
        }
        ${error ? `<p class="action-error" role="alert">${escapeHtml(error)}</p>` : ""}
        <div class="drawer-detail-grid">
          ${recordDetail(
            "Recipient",
            pending
              ? `<span class="drawer-control"><input type="text" data-record-field="recipient" value="${escapeHtml(t.recipient)}" placeholder="Who receives the drawings" aria-label="Recipient"></span>`
              : recordReadonly(t.recipient)
          )}
          ${recordDetail("Source", pending ? recordSelect("source", transmittalSources, t.source) : recordReadonly(t.source))}
          ${recordDetail("Colour copies", pending ? numberInput("color", t.copies.color, "Colour copies") : recordReadonly(String(t.copies.color)))}
          ${recordDetail("B&W copies", pending ? numberInput("bw", t.copies.bw, "Black and white copies") : recordReadonly(String(t.copies.bw)))}
          ${recordDetail("Purpose", pending ? recordSelect("purpose", transmittalPurposes, t.purpose) : recordReadonly(t.purpose))}
          ${recordDetail(
            "Recipient role",
            pending
              ? `<span class="drawer-control"><input type="text" data-record-field="recipientRole" value="${escapeHtml(t.recipientRole || "")}" placeholder="e.g. Site Manager" aria-label="Recipient role"></span>`
              : recordReadonly(t.recipientRole || "—")
          )}
        </div>
        ${
          pending && suggestions.length
            ? `
          <div class="recipient-suggestions">
            <span>Recently sent to:</span>
            ${suggestions.map((name) => `<button class="task-priority-filter" type="button" data-record-action="use-recipient" data-name="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join("")}
          </div>`
            : ""
        }
        <section class="drawer-section">
          <h4>Drawings (${t.drawings.length})</h4>
          <div class="tr-drawings">
            <table>
              <thead><tr><th>Drawing No.</th><th>Drawing Name</th><th>Rev.</th>${pending ? '<th><span class="visually-hidden">Remove</span></th>' : ""}</tr></thead>
              <tbody>
                ${t.drawings
                  .map(
                    (drawing, index) => `
                  <tr>
                    <td>${escapeHtml(drawing.no)}</td>
                    <td>${escapeHtml(drawing.name)}</td>
                    <td><span class="upload-type">${escapeHtml(drawing.rev)}</span></td>
                    ${pending ? `<td><button class="pdf-remove" type="button" data-record-action="remove-drawing" data-index="${index}" aria-label="Remove ${escapeHtml(drawing.name)}">×</button></td>` : ""}
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          ${pending ? '<button class="drawer-add-action" type="button" data-record-action="add-drawings">+ Add drawings from files</button>' : ""}
        </section>
        ${t.remarks ? `<section class="drawer-section"><h4>Remarks</h4><p class="drawer-comment">${escapeHtml(t.remarks)}</p></section>` : ""}
        <section class="drawer-section">
          <h4>Activity</h4>
          <div class="drawer-activity-list">${t.activity.map((entry) => `<p class="drawer-activity-item">${escapeHtml(entry)}</p>`).join("")}</div>
        </section>`;
    },
    footer() {
      const pending = t.status === "pending";
      return `
        ${pending ? '<button class="submit-project-btn drawer-save" type="button" data-record-action="approve">Approve &amp; Send</button>' : '<button class="submit-project-btn drawer-save" type="button" data-record-action="download">Download PDF</button>'}
        <div class="drawer-footer-links">
          ${pending ? '<button class="task-discard" type="button" data-record-save>Save draft</button>' : ""}
          <button class="task-discard" type="button" data-record-action="view-pdf">View PDF</button>
          <button class="task-discard" type="button" data-record-action="edit-pdf">Edit PDF</button>
          ${pending ? '<button class="task-discard" type="button" data-record-action="download">Download PDF</button>' : ""}
          <button class="task-discard" type="button" data-close-record-drawer>Close</button>
        </div>`;
    },
    actions: {
      "use-recipient"(button) {
        applyTransmittalFields(t);
        t.recipient = button.dataset.name;
        t.recipientRole =
          transmittalsSentNewestFirst().find((item) => item.recipient === t.recipient)?.recipientRole ||
          t.recipientRole;
        rerenderRecordDrawer();
      },
      "remove-drawing"(button) {
        applyTransmittalFields(t);
        const [removed] = t.drawings.splice(Number(button.dataset.index), 1);
        t.activity.push(`Removed ${removed.no} ${removed.name}`);
        rerenderRecordDrawer();
        renderTransmittals();
      },
      "add-drawings"() {
        applyTransmittalFields(t);
        openAddDrawingsDialog(t);
      },
      "view-pdf"() {
        if (t.status === "pending") applyTransmittalFields(t);
        closeRecordDrawer();
        showDocument("transmittal", t.no);
      },
      "edit-pdf"() {
        if (t.status === "pending") applyTransmittalFields(t);
        openTransmittalPdfEditor(t);
      },
      download() {
        if (t.status === "pending") applyTransmittalFields(t);
        downloadTransmittalPdf(t);
      },
      approve() {
        applyTransmittalFields(t);
        error = !t.recipient
          ? "Add a recipient before sending."
          : !t.drawings.length
            ? "Add at least one drawing before sending."
            : "";
        if (error) {
          rerenderRecordDrawer();
          recordBody.querySelector('[data-record-field="recipient"]')?.focus();
          return;
        }
        t.status = "sent";
        t.sent = toDateInput(new Date());
        t.approvedBy = profileState.name;
        t.activity.push(`Approved and sent to ${t.recipient} by ${profileState.name}`);
        renderTransmittals();
        closeRecordDrawer();
        showToast(
          `${t.no} sent to ${t.recipient} — ${t.drawings.length} drawing${t.drawings.length === 1 ? "" : "s"}, ${t.copies.color + t.copies.bw} copies.`
        );
      }
    },
    save() {
      applyTransmittalFields(t);
      t.activity.push(`Draft saved by ${profileState.name}`);
      renderTransmittals();
      return `${t.no} draft saved.`;
    }
  });
}

function openAddDrawingsDialog(t) {
  const included = new Set(t.drawings.map((drawing) => drawing.name.toLowerCase()));
  const options = projectFiles
    .filter((file) => /\.(dwg|dxf|pdf|rvt)$/i.test(file.name))
    .map((file) => ({ file, drawing: drawingFromFile(file.name, t.wing, t.drawings.length) }))
    .filter(({ drawing }) => !included.has(drawing.name.toLowerCase()));
  openActionDialog({
    title: `Add drawings to ${t.no}`,
    subtitle: "Drawing number, name and revision are read from each file.",
    fields: options.length
      ? [{ name: "files", label: "Project files", type: "checklist", options: options.map(({ file }) => file.name) }]
      : [],
    body: options.length
      ? ""
      : '<p class="action-dialog-text">Every drawing in Files is already on this transmittal.</p>',
    submitLabel: options.length ? "Add Drawings" : null,
    cancelLabel: options.length ? "Cancel" : "Close",
    onSubmit(values) {
      if (!values.files.length) {
        setActionError("Pick at least one file.");
        return false;
      }
      values.files.forEach((name) => t.drawings.push(drawingFromFile(name, t.wing, t.drawings.length)));
      t.activity.push(`Added ${values.files.length} drawing${values.files.length === 1 ? "" : "s"} from Files`);
      renderTransmittals();
      rerenderRecordDrawer();
    }
  });
}

// Decides which drawer a clicked row opens by matching the table it belongs to (the same row markup appears on the dashboard, Open Items and project tabs)
function openRecordForRow(row) {
  if (row.matches("#rfiTable tbody tr, #project-rfi-list tr[data-rfi-index], [data-open-panel='rfis'] tr[data-oi-row]"))
    openRfiDrawer(row);
  else if (
    row.matches(
      "#deliverables-table tbody tr, #tracker-list tr[data-tracker-index], [data-open-panel='deliverables'] tr[data-oi-row]"
    )
  )
    openDeliverableDrawer(row);
  else if (row.matches("#transmittal-list tr[data-transmittal-index]")) openTransmittalDrawer(row);
}

// Clicking a row (not its buttons or checkbox) opens its details
document.addEventListener("click", (e) => {
  // Only a click on the row itself opens details; its own buttons and checkbox keep their own meaning
  if (e.target.closest("button, a, input, select, label, .custom-checkbox")) return;
  const row = e.target.closest("tbody tr");
  if (row) openRecordForRow(row);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || !e.target.matches("tr[data-tracker-index], tr[data-transmittal-index]")) return;
  e.preventDefault();
  openRecordForRow(e.target);
});

recordBackdrop.addEventListener("click", (e) => {
  if (e.target === recordBackdrop || e.target.closest("[data-close-record-drawer]")) {
    closeRecordDrawer();
    return;
  }

  if (e.target.closest("[data-record-attach]")) {
    recordAttachmentInput.click();
    return;
  }

  const action = e.target.closest("[data-record-action]");
  if (action && recordCtx?.actions?.[action.dataset.recordAction]) {
    recordCtx.actions[action.dataset.recordAction](action);
    return;
  }

  if (e.target.closest("[data-record-save]") && recordCtx) {
    const values = Object.fromEntries(
      Array.from(recordBody.querySelectorAll("[data-record-field]"), (field) => [
        field.dataset.recordField,
        field.value
      ])
    );
    const message = recordCtx.save(values);
    closeRecordDrawer();
    showToast(message);
  }
});

recordBody.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-record-thread]");
  if (!form || !recordCtx) return;
  e.preventDefault();
  const input = form.querySelector("input");
  const text = input.value.trim();
  if (!text) return;
  // The thread lives on the record, so it is still there next time the drawer opens
  const { data } = recordCtx;
  data.thread.push({ by: profileState.name, when: "Just now", text });
  data.activity.push(recordCtx.onThread ? recordCtx.onThread() : `Comment added by ${profileState.name}`);
  rerenderRecordDrawer();
  recordBody.querySelector("[data-record-thread] input").focus();
});

recordAttachmentInput.addEventListener("change", () => {
  if (!recordCtx) return;
  const names = Array.from(recordAttachmentInput.files, (file) => file.name);
  recordCtx.data.attachments.push(...names);
  names.forEach((name) => recordCtx.data.activity.push(`Attachment added: ${name}`));
  recordAttachmentInput.value = "";
  rerenderRecordDrawer();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !recordBackdrop.hidden && actionBackdrop.hidden) closeRecordDrawer();
});
