/**
 * File: js/components/meeting-card.js
 * Role: Meeting status, cards and one-line rows (used by the rail and the Meetings page).
 * Dependencies: Loaded by index.html as script 23 of 80. Uses globals from js/core/utils.js, js/data/meetings.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/features/meetings/meetings-page.js, js/layout/right-rail.js.
 */

// One status system for every meeting card and row: the chip says when, the action says what you can do
function getMeetingState(m, now = Date.now()) {
  const start = m.start.getTime();
  const end = m.end.getTime();
  const minutes = Math.ceil((start - now) / 60000);
  const live = now >= start && now < end;
  const ended = now >= end;
  const today = m.start.toDateString() === new Date(now).toDateString();

  let chip = null;
  if (live) chip = { text: "Live now", cls: "live" };
  // Never show 'In 0 min'; round up to at least 1
  else if (!ended && minutes < 60) chip = { text: `In ${Math.max(1, minutes)} min`, cls: "soon" };
  else if (!ended && today) chip = { text: `In ${Math.floor(minutes / 60)} h`, cls: "" };

  let action = null;
  if (!ended) {
    // Online meetings always offer Join; in-person meetings take a reply (Going / Maybe / Can't go)
    if (m.type === "online") action = { kind: "join", label: live && m.joined ? "Rejoin" : "Join", primary: true };
    else action = { kind: "rsvp" };
  }
  return { chip, action };
}

const meetingIcons = {
  video:
    icon("video-camera", 14),
  pin: icon("map-pin-meeting", 14),
  people:
    icon("users-group", 14),
  collapse:
    icon("caret-up-thin", 16),
  expand:
    icon("caret-down", 16),
  clock:
    icon("clock", 14)
};

// Your reply to an invite; the action button shows it until the meeting can be joined
const rsvpLabels = { going: "Going", maybe: "Maybe", declined: "Can't go" };

const meetingRsvp = (m) => m.rsvp || "going";

// formatDateInput, not toDateInput: the rail overlay renders a card before the shared helpers load
const meetingDate = (m) => formatDateInput(m.start);

const meetingChipHtml = (chip) =>
  chip ? `<span class="meeting-status ${chip.cls}"><i></i>${escapeHtml(chip.text)}</span>` : "";

function meetingActionHtml(m, action) {
  if (!action) return "";
  if (action.kind === "rsvp") {
    const rsvp = meetingRsvp(m);
    const options = Object.entries(rsvpLabels)
      .map(
        ([value, label]) =>
          `<button type="button" role="menuitemradio" data-rsvp="${value}" aria-checked="${value === rsvp}">${label}</button>`
      )
      .join("");
    // In-person meetings keep Directions, now inside the reply menu
    const directions =
      m.type === "in-person"
        ? `<a role="menuitem" href="${escapeHtml(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.place)}`)}" target="_blank" rel="noopener noreferrer">${meetingIcons.pin}Directions</a>`
        : "";
    return `<span class="meeting-rsvp">
      <button class="meeting-action is-primary" type="button" data-action="rsvp" aria-haspopup="menu" aria-expanded="false" aria-label="Your reply: ${rsvpLabels[rsvp]}. Change reply">${meetingIcons.expand}${rsvpLabels[rsvp]}</button>
      <span class="meeting-rsvp-menu" role="menu" hidden>${options}${directions}</span>
    </span>`;
  }
  return `<button class="meeting-action${action.primary ? " is-primary" : ""}" type="button" data-action="join" aria-label="${action.label} ${escapeHtml(m.title)}">${meetingIcons.video}${action.label}</button>`;
}

// "full" is the Meetings page card (with attendees, Notes and MOM Tracker); "compact" is the rail card
function createMeetingCard(m, variant = "full", options = {}) {
  const state = getMeetingState(m);
  const { action } = state;
  const chip = state.chip || options.minutesChip || null;
  const full = variant === "full";
  const attendees = m.attendees
    ? `<span class="meeting-attendees" aria-label="${Number(m.attendees)} invited">${meetingIcons.people}${Number(m.attendees)}</span>`
    : "";
  const collapse = options.collapsible
    ? `<button class="meeting-collapse" type="button" data-meeting-collapse aria-label="Collapse ${escapeHtml(m.title)}">${meetingIcons.collapse}</button>`
    : "";
  // Before it starts you prepare (Agenda); once it is on or over you record (Notes)
  const started = m.start.getTime() <= Date.now();
  // Asking for another time only makes sense when this meeting overlaps another one
  const clashes = findMeetingClashes(m).length > 0;
  // Rail (compact) cards reveal these on hover or keyboard focus; full cards always show them
  const tools =
    variant !== "overlay"
      ? `<div class="meeting-tools">
        ${
          started
            ? `<button class="meeting-tool" type="button" data-action="notes">
          ${icon("pencil", 14)}
          Notes
        </button>`
            : '<button class="meeting-tool" type="button" data-action="agenda">Agenda</button>' +
              (clashes ? '<button class="meeting-tool" type="button" data-resched>Request time change</button>' : '')
        }
        <button class="meeting-tool" type="button" data-action="mom">MOM Tracker</button>
      </div>`
      : "";

  return `
    <article class="meeting-card${full ? "" : " is-compact"}${collapse ? " is-expanded" : ""}" tabindex="0" data-meeting-id="${escapeHtml(m.id)}" data-date="${meetingDate(m)}">
      <div class="meeting-card-body">
        <div class="meeting-card-top">
          ${meetingChipHtml(chip)}
          ${attendees}
        </div>
        <strong class="meeting-title">${escapeHtml(m.title)}</strong>
        <p class="meeting-meta">
          ${meetingIcons.clock}
          <span><span class="meeting-time">${formatTime(m.start)} - ${formatTime(m.end)}</span> <span class="meeting-place">${escapeHtml(m.place)}</span></span>
        </p>
        ${tools}
      </div>
      <div class="meeting-card-side">${collapse}${meetingActionHtml(m, action)}</div>
    </article>`;
}

// One-line row for the rail's other meetings; clicking it expands into the compact card
function createMeetingRow(m) {
  const { chip } = getMeetingState(m);
  return `
    <button class="meeting-row" type="button" data-meeting-row="${escapeHtml(m.id)}" aria-expanded="false" aria-label="${escapeHtml(m.title)} at ${formatTime(m.start)}${chip ? `, ${escapeHtml(chip.text)}` : ""}. Show details">
      <span class="meeting-row-time">${meetingIcons.clock}${formatTime(m.start)}</span>
      <span class="meeting-row-title">${escapeHtml(m.title)}</span>
      ${chip ? `<span class="meeting-status ${chip.cls}">${escapeHtml(chip.text)}</span>` : ""}
      <span class="meeting-row-chevron" aria-hidden="true">›</span>
    </button>`;
}
