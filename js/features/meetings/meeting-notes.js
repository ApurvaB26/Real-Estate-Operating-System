/**
 * File: js/features/meetings/meeting-notes.js
 * Role: Minutes of meeting dialog.
 * Dependencies: Loaded by index.html as script 53 of 80. Uses globals from js/core/router.js, js/core/utils.js, js/features/meetings/meetings-page.js, js/features/profile.js. Nothing else calls into it; it wires itself up on load.
 */

const notesDialogBackdrop = document.getElementById("notes-dialog-backdrop");

const notesSubjectInput = document.getElementById("notes-subject");

const notesDateInput = document.getElementById("notes-date");

let notesDialogReturnFocus = null;

function openNotesDialog(meetingCard) {
  notesDialogReturnFocus = document.activeElement;
  editingMeetingId = meetingCard.dataset.meetingId || null;
  notesSubjectInput.value = meetingCard.querySelector(".meeting-title").textContent;
  notesDateInput.value = meetingCard.dataset.date;
  loadMomIntoNotes();
  notesDialogBackdrop.hidden = false;
  document.body.classList.add("project-dialog-open");
  notesSubjectInput.focus();
}

function closeNotesDialog() {
  notesDialogBackdrop.hidden = true;
  document.body.classList.remove("project-dialog-open");
  notesDialogReturnFocus?.focus();
}

document.addEventListener("click", (event) => {
  const notesButton = event.target.closest('[data-action="notes"]');
  if (notesButton) {
    openNotesDialog(notesButton.closest(".meeting-card"));
    return;
  }

  if (event.target.closest("[data-close-notes-dialog]") || event.target === notesDialogBackdrop) {
    closeNotesDialog();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !notesDialogBackdrop.hidden) closeNotesDialog();
});

/* MINUTES OF MEETING DIALOG */
const notesForm = document.getElementById("notes-form");

const notesText = document.getElementById("notes-text");

const notesCount = document.getElementById("notes-count");

const notesRecording = document.getElementById("notes-recording");

const notesNotify = document.getElementById("notes-notify");

function updateNotesCount() {
  notesCount.textContent = `${notesText.value.length} character${notesText.value.length === 1 ? "" : "s"}`;
}

// Opening notes for a meeting picks up minutes already saved for it
// Minutes are matched to a meeting by subject + date; editingMomId records which saved entry is being edited so Save updates it instead of adding a duplicate
function loadMomIntoNotes() {
  const entry =
    (editingMeetingId && momEntries.find((m) => m.meetingId === editingMeetingId)) ||
    momEntries.find((m) => !m.meetingId && m.subject === notesSubjectInput.value && m.date === notesDateInput.value);
  editingMomId = entry?.id || null;
  notesText.value = entry?.text || "";
  notesNotify.checked = false;
  updateNotesCount();
}

function openMomEntry(id) {
  const entry = momEntries.find((m) => m.id === id);
  notesDialogReturnFocus = document.activeElement;
  editingMeetingId = entry.meetingId || null;
  notesSubjectInput.value = entry.subject;
  notesDateInput.value = entry.date;
  loadMomIntoNotes();
  notesDialogBackdrop.hidden = false;
  document.body.classList.add("project-dialog-open");
  notesText.focus();
}

document.getElementById("mom-rows").addEventListener("click", (e) => {
  const button = e.target.closest("[data-mom-edit]");
  if (button) openMomEntry(button.dataset.momEdit);
});

notesText.addEventListener("input", updateNotesCount);

document.querySelector("[data-pick-recording]").addEventListener("click", () => notesRecording.click());

notesRecording.addEventListener("change", () => {
  const file = notesRecording.files[0];
  if (!file) return;
  document.querySelector(".notes-option-label").textContent = file.name;
  showToast(`${file.name} attached to these minutes.`);
});

// Local summary of the typed notes: key points, decisions and action items
// Rule-based, runs in the browser (no AI call): sorts sentences into decisions, action items and key points by keywords
function summarizeNotes(text) {
  // Strip any earlier summary so pressing Summarise twice replaces it rather than stacking summaries
  const body = text.split(/\n*— Summary —/)[0].trim();
  const sentences = body
    .split(/\n+|(?<=[.!?])\s+/)
    .map((line) => line.replace(/^[\s\-•*\d.)]+/, "").trim())
    .filter((line) => line.length > 3);
  const decisions = sentences.filter((line) => /\b(agreed|decided|approved|confirmed|finali[sz]ed)\b/i.test(line));
  const actions = sentences.filter((line) => !decisions.includes(line) && actionItemPattern.test(line));
  const points = sentences.filter((line) => !decisions.includes(line) && !actions.includes(line)).slice(0, 4);
  const section = (title, lines) => (lines.length ? `\n${title}:\n${lines.map((line) => `• ${line}`).join("\n")}` : "");
  return {
    body,
    summary:
      `${section("Key points", points)}${section("Decisions", decisions)}${section("Action items", actions)}`.trim()
  };
}

document.querySelector("[data-summarize-notes]").addEventListener("click", () => {
  if (notesText.value.trim().length < 20) {
    showToast("Add a few lines of notes first, then summarise.");
    notesText.focus();
    return;
  }
  const { body, summary } = summarizeNotes(notesText.value);
  notesText.value = `${body}\n\n— Summary —\n${summary}`;
  updateNotesCount();
  showToast("Summary added below your notes.");
});

notesForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const subject = notesSubjectInput.value.trim() || "Untitled meeting";
  const date = notesDateInput.value || toDateInput(new Date());
  const text = notesText.value.trim();
  const existing = momEntries.find((m) => m.id === editingMomId);

  if (existing) {
    // Never move a shared entry back to draft: only 'notify participants' can raise the status
    Object.assign(existing, { subject, date, text, status: notesNotify.checked ? "shared" : existing.status });
  } else {
    momEntries.push({
      id: `mom${momEntries.length + 1}`,
      meetingId: editingMeetingId,
      subject,
      date,
      recordedBy: profileState.name,
      text,
      status: notesNotify.checked ? "shared" : "draft"
    });
  }

  closeNotesDialog();
  if (!meetingsView.hidden) {
    renderMom();
    renderMeetingsPage();
  }
  showToast(
    notesNotify.checked ? "Minutes saved and shared with participants." : "Minutes saved as a draft in the MOM Tracker."
  );
});
