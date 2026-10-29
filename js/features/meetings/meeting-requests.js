/**
 * File: js/features/meetings/meeting-requests.js
 * Role: Schedule dialog clash detection, online/offline choice, MOM-to-task conversion and time-change requests.
 * Dependencies: Loaded by index.html as script 78 of 80. Uses globals from js/components/layers.js, js/core/utils.js, js/data/meetings.js, js/data/task-rows.js, js/data/team.js, js/features/meetings/meetings-page.js and 3 more. Nothing else calls into it; it wires itself up on load.
 */

/* ---------- Meetings: clash detection, online/offline, MOM to task, time-change request ---------- */
// Wrap the original dialog and extend it with clash detection instead of rewriting it
const _openSchedule = openScheduleMeetingDialog;
openScheduleMeetingDialog = function () {
  _openSchedule();
  const form = $("#action-form-fields"); if (!form) return;
  form.insertAdjacentHTML("afterbegin", '<div class="cx-clash" id="cx-clash" aria-live="polite"></div><div class="cx-offline" id="cx-offline" hidden></div>');
  const run = () => {
    const date = $("#action-date")?.value, s = $("#action-start")?.value, en = $("#action-end")?.value, type = $("#action-type")?.value || "";
    const picked = $$('input[name="people"]:checked', form).map((i) => i.value), title = $("#action-title")?.value || "Meeting";
    const hits = [];
    if (date && s && en) {
      const a = new Date(`${date}T${s}`), b = new Date(`${date}T${en}`);
      meetings.forEach((m) => { if (a < m.end && b > m.start && (!m.invitees || m.invitees.length === 0 || m.invitees.some((x) => picked.includes(x)) || true)) hits.push(m); });
    }
    $("#cx-clash").innerHTML = hits.length
      ? `<div class="cx-banner is-warn">${icon("alert-triangle", 16)}<div><strong>Time clash.</strong> ${hits.slice(0, 2).map((m) => `${h(m.title)} (${formatTime(m.start)} - ${formatTime(m.end)})`).join(" and ")} overlap${hits.length === 1 ? "s" : ""} with this slot. Pick another time, or invite anyway: attendees can request a time change.</div></div>`
      : `<div class="cx-banner is-good">${icon("check", 16)}<div>No clashes in the calendars of the people you picked.</div></div>`;
    const off = type.startsWith("Offline"), box = $("#cx-offline");
    box.hidden = false;
    box.innerHTML = off
      ? `<div class="cx-banner is-info">${icon("layers", 16)}<div>Opens Google Calendar so you can pick a meeting room. The event syncs back into your Meeting Logs. <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}" target="_blank" rel="noopener">Open Google Calendar ↗</a></div></div>`
      : `<div class="cx-banner is-info">${icon("video", 16)}<div>${type.includes("Zoom") ? "A Zoom" : "A Google Meet"} link is created here and calendar invites (.ics) go to every attendee.</div></div>`;
  };
  form.addEventListener("input", run); form.addEventListener("change", run); setTimeout(run, 0);
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-resched]"); if (!b) return;
  const m = meetings.find((x) => x.id === b.closest(".meeting-card")?.dataset.meetingId);
  modal("Request time change", `<p class="cx-muted">${h(m?.title || "Meeting")} · the organiser gets your request and can accept or decline.</p>
    <div class="cx-row"><label class="cx-field">New date<input type="date" id="cx-rd" value="${formatDateInput(new Date(Date.now() + 86400000))}"></label><label class="cx-field">New start<input type="time" id="cx-rt" value="15:00"></label></div>
    <label class="cx-field">Reason<textarea id="cx-rr" rows="2">I have a site inspection at this time.</textarea></label>
    <div class="cx-row cx-end"><button class="cx-btn" type="button" data-cx-close>Cancel</button><button class="cx-primary" type="button" data-resched-send>${icon("send", 16)} Send request</button></div>`);
});
document.addEventListener("click", (e) => { if (e.target.closest("[data-resched-send]")) { closeLayer(); showToast("Time change request sent to the organiser."); } });
// Remembers which MOM lines already became tasks so a second click cannot duplicate them
const converted = new Set();
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-mom-tasks]"); if (!b) return;
  const entry = momEntries.find((x) => x.id === b.dataset.momTasks);
  const lines = entry.text.split(/\n*— Summary —/)[0].split(/\n+/).map((l) => l.trim()).filter(Boolean);
  drawer(`Convert to tasks · ${entry.subject}`, `<p class="cx-muted">Pick any point from the minutes and turn it into a task with an owner and a due date.</p>
    ${lines.map((l, i) => { const k = entry.id + i; return `<div class="cx-point" data-k="${k}"><p>${h(l)}</p>${converted.has(k) ? `<span class="cx-tag is-good">${icon("check", 13)} Task created</span>` : `<button class="cx-btn" type="button" data-point="${k}" data-text="${h(l)}">${icon("plus", 16)} Convert to task</button>`}</div>`; }).join("")}`);
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-point]"); if (!b) return;
  const box = b.closest(".cx-point");
  box.insertAdjacentHTML("beforeend", `<div class="cx-conv"><label class="cx-field">Owner<select>${teamMembers.map((m) => `<option>${h(m.name)}</option>`).join("")}</select></label><label class="cx-field">Due date<input type="date" value="${daysFromNow(7)}"></label><button class="cx-primary" type="button" data-point-create="${b.dataset.point}" data-text="${b.dataset.text}">${icon("check", 16)} Create task</button></div>`);
  b.remove();
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-point-create]"); if (!b) return;
  const box = b.closest(".cx-point"), owner = $("select", box).value, due = $("input", box).value;
  taskRows.push([b.dataset.text, "Lakeshore Gold-3", owner, due, "Medium", "MOM", "To do"]); converted.add(b.dataset.pointCreate);
  $(".cx-conv", box).replaceWith(Object.assign(document.createElement("span"), { className: "cx-tag is-good", innerHTML: `${icon("check", 13)} Task created for ${h(owner)}` }));
  showToast("Task created and added to the Task Board.");
});
