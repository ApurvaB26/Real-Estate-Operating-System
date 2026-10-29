/**
 * File: js/features/people-directory.js
 * Role: Company directory drawer with presence, one-to-one chat and call actions.
 * Dependencies: Loaded by index.html as script 70 of 80. Uses globals from js/components/layers.js, js/core/utils.js, js/data/team.js, js/utils/dom-helpers.js, js/core/icons.js. Nothing else calls into it; it wires itself up on load.
 */

/* ---------- people (company directory) with chat and calls ---------- */
const presence = (i) => ["on", "on", "busy", "off", "on"][i % 5];
const presLabel = { on: "Available", busy: "In a meeting", off: "Offline" };
const chats = {};
// Pill pair: Halden is the internal team (org Halden), Consultants lists the other companies; exactly one is always active and the drawer opens on Halden
let peopleScope = "halden";
// Second line of a row: Halden people show designation and department; consultants show their consultancy and whether it is an MEP or Architect consultant
const personSub = (m) => (m.org === "Halden" ? `${m.role} · ${teamGroups.find((g) => g.key === m.group).label}` : `${m.org} · ${m.consultantType} Consultant`);
const peopleHtml = (q = "") => {
  const list = teamMembers.filter((m) => (m.org === "Halden") === (peopleScope === "halden") && `${m.name} ${personSub(m)}`.toLowerCase().includes(q.toLowerCase()));
  return list.map((m) => { const p = presence(teamMembers.indexOf(m)); return `
    <div class="cx-person"><span class="cx-av">${h(initials(m.name))}<i class="cx-pres is-${p}"></i></span>
      <div class="cx-grow"><strong>${h(m.name)}</strong><small>${h(personSub(m))}</small><small class="cx-p-${p}">${presLabel[p]}</small></div>
      <button class="cx-icon" type="button" data-chat-with="${h(m.name)}" aria-label="Chat with ${h(m.name)}">${icon("chat", 16)}</button>
      <button class="cx-icon" type="button" data-call="${h(m.name)}" aria-label="Call ${h(m.name)}">${icon("phone", 16)}</button></div>`; }).join("") || '<p class="cx-muted">No one matches.</p>';
};function openPeople() {
  peopleScope = "halden";
  const d = drawer("Directory", `<label class="cx-search">${icon("search-people", 16)}<input type="search" id="cx-people-q" placeholder="Search people, designations, departments" aria-label="Search people"></label>
    <div class="cx-chips" role="group" aria-label="Show people by company"><button class="cx-chip is-on" type="button" data-people-scope="halden" aria-pressed="true">Halden</button><button class="cx-chip" type="button" data-people-scope="consultants" aria-pressed="false">Consultants</button></div>
    <div id="cx-people-list">${peopleHtml()}</div>`);
  $("#cx-people-q", d).addEventListener("input", (e) => { $("#cx-people-list", d).innerHTML = peopleHtml(e.target.value); });
  d.querySelectorAll("[data-people-scope]").forEach((pill) => pill.addEventListener("click", () => {
    peopleScope = pill.dataset.peopleScope;
    d.querySelectorAll("[data-people-scope]").forEach((p) => { const on = p.dataset.peopleScope === peopleScope; p.classList.toggle("is-on", on); p.setAttribute("aria-pressed", String(on)); });
    $("#cx-people-list", d).innerHTML = peopleHtml($("#cx-people-q", d).value);
  }));
}
// The Directory button in the rail header and the Directory item in the collapsed rail both carry data-open-directory
document.addEventListener("click", (e) => { if (e.target.closest("[data-open-directory]")) openPeople(); });
document.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches?.(".rail-mini-item[data-open-directory]")) { e.preventDefault(); openPeople(); } });
function openChat(name) {
  const m = teamMembers.find((x) => x.name === name) || teamMembers[0];
  // Chat history lives only in memory for this demo; a first message is seeded so the thread is never empty
  const c = chats[name] ||= [{ me: 0, t: "Can you check the riser clash on L7 today?", w: "09:12" }];
  const d = drawer(m.name, `<div class="cx-row"><button class="cx-btn" type="button" data-cx-people>‹ Directory</button><span class="cx-grow"></span>
      <button class="cx-btn" type="button" data-call="${h(m.name)}">${icon("phone", 16)} Audio</button><button class="cx-btn" type="button" data-video="${h(m.name)}">${icon("video", 16)} Video</button></div>
    <small class="cx-muted">${h(personSub(m))} · ${presLabel[presence(teamMembers.indexOf(m))]}</small>
    <div class="cx-chat" id="cx-chat">${c.map((x) => `<div class="cx-msg ${x.me ? "me" : ""}">${h(x.t)}<small>${x.w}</small></div>`).join("")}</div>
    <form class="cx-compose" id="cx-compose"><input type="text" id="cx-msg" placeholder="Type a message" aria-label="Message"><button class="cx-primary" type="submit">${icon("send", 16)} Send</button></form>`, "cx-chat-drawer");
  $("#cx-compose", d).addEventListener("submit", (e) => {
    e.preventDefault(); const v = $("#cx-msg", d).value.trim(); if (!v) return;
    c.push({ me: 1, t: v, w: "now" }); openChat(name);
    // Canned reply after a short delay to mimic a colleague answering; re-render only if the chat is still open
    setTimeout(() => { c.push({ me: 0, t: "Thanks, checking now.", w: "now" }); if ($("#cx-chat")) openChat(name); }, 900);
  });
  const box = $("#cx-chat", d); box.scrollTop = box.scrollHeight;
}
document.addEventListener("click", (e) => {
  const chat = e.target.closest("[data-chat-with]"), call = e.target.closest("[data-call]"), vid = e.target.closest("[data-video]");
  if (e.target.closest("[data-cx-people]")) { openPeople(); return; }
  if (chat) openChat(chat.dataset.chatWith);
  else if (call) showToast(`Calling ${call.dataset.call}. An instant meeting link was sent to them.`);
  else if (vid) showToast(`Starting a video call with ${vid.dataset.video}.`);
});
