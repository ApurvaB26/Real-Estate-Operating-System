/**
 * File: js/features/row-actions.js
 * Role: Row actions shared by every table: Remind, Respond and View.
 * Dependencies: Loaded by index.html as script 33 of 80. Uses globals from js/components/action-dialog.js, js/core/utils.js, js/data/rfis.js, js/features/open-items.js, js/features/project/rfis.js, js/features/record-drawer.js and 1 more. Its globals are used by js/features/record-drawer.js.
 */

/* ROW ACTIONS: Remind / Respond / View */
function openRemindDialog(row, button) {
  const title = rowTitle(row);
  const waitingOn = row
    .querySelector(".waiting-tag")
    ?.textContent.replace(/^[\s\S]*Waiting on\s*/i, "")
    .trim();
  // Who to remind: the 'Waiting on' tag first, then the row's data-recipient, then (task rows only) the assignee column
  const recipient =
    waitingOn || row.dataset.recipient || (row.matches("[data-task-row]") ? row.cells[6].textContent.trim() : "");
  const due = rowDueStatus(row)?.textContent.trim() || "";
  // Wording adapts: status words read as-is, a plain date becomes 'it's due <date>'
  const duePhrase = /overdue|due today|due tomorrow/i.test(due)
    ? ` — it's ${due.toLowerCase()}`
    : due
      ? ` — it's due ${due}`
      : "";

  openActionDialog({
    title: "Send reminder",
    subtitle: title,
    fields: [
      {
        type: "row",
        fields: [
          { name: "to", label: "To", value: recipient, required: true, placeholder: "Person or team" },
          {
            name: "channel",
            label: "Send via",
            type: "select",
            options: ["Email", "Teams message", "In-app notification"]
          }
        ]
      },
      {
        name: "message",
        label: "Message",
        type: "textarea",
        required: true,
        value: `Hi ${recipient ? firstName(recipient) : "there"}, a quick nudge on "${title}"${duePhrase}. Could you share an update?`
      }
    ],
    submitLabel: "Send Reminder",
    onSubmit(values) {
      setButtonLabel(button, "Reminded");
      button.setAttribute("aria-label", `Reminder sent for ${title}`);
      if (row.matches("[data-task-row]")) addTaskActivity(row, `Reminder sent to ${values.to}`);
      showToast(`Reminder sent to ${values.to} by ${values.channel.toLowerCase()}.`);
    }
  });
}

// The same RFI row can appear in three places (project tab, Open Items, dashboard list), each backed by different data, so closing updates whichever source this row came from
function closeRfi(row) {
  if (row.dataset.rfiIndex !== undefined) {
    rfiData[Number(row.dataset.rfiIndex)].status = "completed";
    renderRfis();
    return;
  }

  if (row.matches("[data-oi-row]")) {
    const item = openItemsConfig.rfis.rows[Number(row.dataset.oiIndex)];
    item.group = "completed";
    item.action = "View";
    buildOpenItemsPanel("rfis");
    return;
  }

  // so a closed one is simply removed
  // Dashboard list only shows pending RFIs
  row.remove();
  renderDashboardScope();
}

function openRespondDialog(row, button) {
  const id = row.cells[0].textContent.trim();
  openActionDialog({
    title: `Respond to ${id}`,
    subtitle: rowTitle(row),
    fields: [
      {
        name: "response",
        label: "Response",
        type: "textarea",
        required: true,
        placeholder: "Clarification, design intent, or the revised drawing reference..."
      },
      {
        type: "row",
        fields: [
          { name: "impact", label: "Impact", type: "select", options: ["None", "Cost", "Time", "Cost & Time"] },
          { name: "attachment", label: "Attachment", type: "file" }
        ]
      },
      { name: "close", label: "Close this RFI after responding", type: "checkbox", value: true }
    ],
    submitLabel: "Send Response",
    onSubmit(values) {
      if (values.close) closeRfi(row);
      else setButtonLabel(button, "Responded");
      showToast(values.close ? `${id} answered and closed.` : `Response sent on ${id}.`);
    }
  });
}

// One delegated listener for every table's Remind/Respond/View button, including rows added later
document.addEventListener("click", (e) => {
  const button = e.target.closest("[data-row-action]");
  if (!button) return;
  const row = button.closest("tr");
  const action = button.dataset.rowAction;
  if (action === "remind") openRemindDialog(row, button);
  else if (action === "respond") openRespondDialog(row, button);
  else if (action === "view" || action === "open") openRecordForRow(row);
});
