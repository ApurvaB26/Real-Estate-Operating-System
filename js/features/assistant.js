/**
 * File: js/features/assistant.js
 * Role: AI assistant drawer (answers from the data on the page).
 * Dependencies: Loaded by index.html as script 54 of 80. Uses globals from js/core/utils.js, js/data/focus-items.js, js/data/meetings.js, js/data/rfis.js, js/features/dashboard.js, js/features/meetings/meetings-page.js and 3 more. Nothing else calls into it; it wires itself up on load.
 */

/* AI ASSISTANT */
const assistantBackdrop = document.getElementById("assistant-backdrop");

const assistantMessages = document.getElementById("assistant-messages");

const assistantInput = document.getElementById("assistant-input");

function addAssistantMessage(text, fromUser = false) {
  const message = document.createElement("div");
  message.className = `assistant-msg${fromUser ? " is-user" : ""}`;
  message.textContent = text;
  assistantMessages.append(message);
  message.scrollIntoView({ block: "end" });
}

function openTasksMatching(selector) {
  return Array.from(dashboardTasksBody.rows)
    .filter((row) => !row.classList.contains("done") && row.querySelector(selector))
    .map(
      (row) =>
        `• ${row.cells[1].textContent.trim()} ${rowTitle(row)} (${row.querySelector(".cell-project").textContent.trim()})`
    );
}

// Not a real AI yet: keyword rules answer from the tables already on the page, so the answers always match what the user sees
function assistantReply(question) {
  const q = question.toLowerCase();
  if (/overdue|late|delay|behind/.test(q)) {
    const overdue = openTasksMatching(".status.overdue");
    return overdue.length
      ? `You have ${overdue.length} overdue task${overdue.length === 1 ? "" : "s"}:\n${overdue.join("\n")}`
      : "Nothing on your dashboard is overdue right now.";
  }
  if (/rfi|block/.test(q)) {
    const blocking = rfiData.filter((r) => r.blocking && r.status !== "completed");
    return `${blocking.length} RFIs are marked blocking on Riverside Greens:\n${blocking.map((r) => `• ${r.id} ${r.query} — ${r.discipline}, ${r.wing}`).join("\n")}\nOpen the project's RFIs tab to respond.`;
  }
  if (/meeting|schedule|call|calendar/.test(q)) {
    const next = meetings.filter((m) => m.end > Date.now()).sort((a, b) => a.start - b.start)[0];
    return next
      ? `Your next meeting is "${next.title}" at ${formatTime(next.start)} (${dayLabel(next.start).toLowerCase()}), ${next.place}. ${next.attendees} people are invited.`
      : "You have no upcoming meetings.";
  }
  if (/deliverable|document|drawing/.test(q)) {
    const pending = Array.from(deliverablesBody.rows).filter((row) => !row.classList.contains("done"));
    return `${pending.length} deliverables are still open on your dashboard:\n${pending.map((row) => `• ${rowTitle(row)} — ${rowDueStatus(row)?.textContent.trim() || "no due date"}`).join("\n")}`;
  }
  if (/summar|day|today|focus|priorit/.test(q)) {
    const urgent = openTasksMatching(".status.overdue, .status.due-today").length;
    const todayMeetings = meetings.filter((m) => isToday(m.start) && m.end > Date.now());
    const pending = focusItems.filter((item) => item.state !== "done").length;
    return `Here's your day:\n• ${urgent} urgent task${urgent === 1 ? "" : "s"} due today or overdue\n• ${todayMeetings.length} meeting${todayMeetings.length === 1 ? "" : "s"} still to come${todayMeetings[0] ? `, next at ${formatTime(todayMeetings[0].start)}` : ""}\n• ${pending} decision${pending === 1 ? "" : "s"} waiting in focus mode`;
  }
  return 'I can answer questions about your tasks, RFIs, deliverables and meetings. Try "What\'s overdue?" or "When is my next meeting?"';
}

function askAssistant(question) {
  if (!question.trim()) return;
  addAssistantMessage(question, true);
  window.setTimeout(() => addAssistantMessage(assistantReply(question)), 250);
}

function openAssistant() {
  assistantBackdrop.hidden = false;
  if (!assistantMessages.children.length) {
    addAssistantMessage(
      `Hi ${firstName(profileState.name)}, I can look across your dashboard, projects and schedule. What do you need?`
    );
  }
  assistantInput.focus();
}

function closeAssistant() {
  assistantBackdrop.hidden = true;
}

document.querySelector("[data-open-assistant]").addEventListener("click", openAssistant);

assistantBackdrop.addEventListener("click", (e) => {
  if (e.target === assistantBackdrop || e.target.closest("[data-close-assistant]")) closeAssistant();
  const prompt = e.target.closest("[data-assistant-prompt]");
  if (prompt) askAssistant(prompt.dataset.assistantPrompt);
});

document.getElementById("assistant-form").addEventListener("submit", (e) => {
  e.preventDefault();
  askAssistant(assistantInput.value);
  assistantInput.value = "";
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !assistantBackdrop.hidden) closeAssistant();
});
