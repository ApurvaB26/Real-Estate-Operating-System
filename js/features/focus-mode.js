/**
 * File: js/features/focus-mode.js
 * Role: Focus mode (Needs you first).
 * Dependencies: Loaded by index.html as script 51 of 80. Uses globals from js/components/action-dialog.js, js/core/router.js, js/core/utils.js, js/data/focus-items.js, js/features/open-items.js. Its globals are used by js/core/router.js, js/main.js.
 */

const focusActionLabels = { done: "Mark Done", respond: "Respond", remind: "Send Reminder" };

// Also updates the right-rail pill, so the count stays the same in both places
function updateFocusCounts() {
  const pending = focusItems.filter((item) => item.state !== "done").length;
  const label = `${pending} Pending Decision${pending === 1 ? "" : "s"}`;
  document.getElementById("focus-pending-tag").textContent = label;
  document.getElementById("focus-hero-tag").textContent = label;
  document.getElementById("focus-progress-bar").style.width =
    `${Math.round(((focusItems.length - pending) / focusItems.length) * 100)}%`;
  const pill = document.querySelector('.rail-mini-item[data-route="focus"] .rail-mini-pill');
  if (pill) pill.textContent = `${pending} pending`;
}

function renderFocus() {
  // Snoozed items sink below pending ones; done items go last and stay visible as 'Cleared'
  const order = { pending: 0, snoozed: 1, done: 2 };
  const items = [...focusItems].sort((a, b) => order[a.state] - order[b.state]);
  const remaining = items.filter((item) => item.state !== "done");

  document.getElementById("focus-list").innerHTML =
    (remaining.length
      ? ""
      : `
    <section class="overview-panel focus-empty">
      <h2>All clear</h2>
      <p>Nothing is waiting on you right now. New decisions will show up here.</p>
      <button class="project-task-add" type="button" data-route="dashboard">Back to dashboard</button>
    </section>`) +
    items
      .map(
        (item) => `
    <article class="overview-panel focus-item${item.state === "done" ? " is-done" : ""}${item.state === "snoozed" ? " is-snoozed" : ""}" data-focus-id="${item.id}">
      <header class="focus-item-head">
        <span class="upload-type">${item.type}</span>
        <span class="status ${item.dueCls}">${item.state === "done" ? "Cleared" : item.state === "snoozed" ? "Snoozed" : item.due}</span>
      </header>
      <strong class="focus-item-title">${escapeHtml(item.title)}</strong>
      <p class="focus-item-meta">${escapeHtml(item.where)} · ${escapeHtml(item.detail)}</p>
      ${
        item.state === "done"
          ? ""
          : `
      <div class="focus-item-actions">
        <button class="project-task-add" type="button" data-focus-action="${item.action}">${focusActionLabels[item.action]}</button>
        ${item.state === "pending" ? '<button class="comment-btn" type="button" data-focus-action="snooze">Snooze</button>' : ""}
        <button class="comment-btn" type="button" data-route="${item.route}">Open</button>
      </div>`
      }
    </article>`
      )
      .join("");
  updateFocusCounts();
}

function showFocus() {
  showPage("focus");
  renderFocus();
  renderBreadcrumb([{ label: "Dashboard", view: "dashboard" }, { label: "Focus mode" }]);
  syncHash("focus");
}

// Shared finish step so Mark Done, Respond and Remind all clear an item the same way
function clearFocusItem(item, message) {
  item.state = "done";
  renderFocus();
  showToast(message);
}

document.getElementById("focus-list").addEventListener("click", (e) => {
  const button = e.target.closest("[data-focus-action]");
  if (!button) return;
  const item = focusItems.find((entry) => entry.id === button.closest("[data-focus-id]").dataset.focusId);
  const action = button.dataset.focusAction;

  if (action === "snooze") {
    item.state = "snoozed";
    renderFocus();
    // Snooze only reorders; nothing is deleted, so it cannot be lost
    showToast(`Snoozed "${item.title}" to the end of your queue.`);
  } else if (action === "done") {
    clearFocusItem(item, `"${item.title}" marked done.`);
  } else if (action === "respond") {
    openActionDialog({
      title: "Respond to RFI",
      subtitle: item.title,
      fields: [
        {
          name: "response",
          label: "Response",
          type: "textarea",
          required: true,
          placeholder: "Clarification or the revised detail reference..."
        }
      ],
      submitLabel: "Send Response",
      onSubmit() {
        clearFocusItem(item, `Response sent on "${item.title}".`);
      }
    });
  } else if (action === "remind") {
    openActionDialog({
      title: "Send reminder",
      subtitle: item.title,
      fields: [
        {
          name: "message",
          label: "Message",
          type: "textarea",
          required: true,
          value: `Hi, a quick nudge on "${item.title}" — it's overdue. Could you share an update?`
        }
      ],
      submitLabel: "Send Reminder",
      onSubmit() {
        clearFocusItem(item, "Reminder sent.");
      }
    });
  }
});
