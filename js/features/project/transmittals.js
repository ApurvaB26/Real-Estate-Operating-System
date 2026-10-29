/**
 * File: js/features/project/transmittals.js
 * Role: Project Transmittals tab (IFC uploads draft transmittals automatically).
 * Dependencies: Loaded by index.html as script 38 of 80. Uses globals from js/core/router.js, js/core/utils.js, js/data/inbox.js, js/features/open-items.js, js/features/profile.js, js/features/project/deliverable-tracker.js and 3 more. Its globals are used by js/features/document-viewer.js, js/features/project/files.js, js/features/project/transmittal-pdf.js, js/features/project/workspace.js, js/features/record-drawer.js, js/main.js.
 */

/* PROJECT TRANSMITTALS
   GFC uploads in Files draft a transmittal automatically; nothing is sent until someone reviews it. */
const transmittalWings = ["Wing 25", "Wing 32", "Signet B", "Tower 16", "Tower 26", "MLCP", "UGT 2"];

// Source = who produced the drawings (consultant or in-house)
const transmittalSources = ["DSG", "Urja", "Verdant Systems", "In-house"];

const transmittalPurposes = ["For construction", "For approval", "For information", "For tender"];

const transmittals = [
  {
    no: "TR-235",
    wing: "Wing 25",
    source: "DSG",
    recipient: "Pravin Kolapte",
    recipientRole: "Site Manager",
    purpose: "For construction",
    copies: { color: 1, bw: 6 },
    status: "pending",
    sent: null,
    created: daysFromNow(-1),
    origin: "ifc",
    by: "Apurva Bhadange",
    remarks: "",
    drawings: [
      { no: "LB-PH-W25-110", name: "Plumbing single line diagram", rev: "R3" },
      { no: "LB-PH-W25-111", name: "Toilet plumbing details — typical", rev: "R1" },
      { no: "LB-FF-W25-201", name: "Sprinkler layout — typical floor", rev: "R2" },
      { no: "LB-EL-W25-101", name: "Electrical lighting layout", rev: "Rev C" }
    ]
  },
  {
    no: "TR-236",
    wing: "Signet B",
    source: "Urja",
    recipient: "Pravin Kolapte",
    recipientRole: "Site Manager",
    purpose: "For construction",
    copies: { color: 1, bw: 6 },
    status: "pending",
    sent: null,
    created: daysFromNow(-1),
    origin: "ifc",
    by: "Apurva Bhadange",
    remarks: "",
    drawings: [
      { no: "SG-HV-B-301", name: "Ventilation layout — basement 1", rev: "R1" },
      { no: "SG-HV-B-302", name: "Ventilation layout — basement 2", rev: "R1" },
      { no: "SG-EL-B-120", name: "LT panel room layout", rev: "R0" },
      { no: "SG-EL-B-121", name: "Cable tray routing — podium", rev: "R2" },
      { no: "SG-FF-B-210", name: "Fire pump room layout", rev: "R4" },
      { no: "SG-PH-B-112", name: "Drainage layout — podium", rev: "R1" }
    ]
  },
  {
    no: "TR-237",
    wing: "Wing 32",
    source: "DSG",
    recipient: "Pravin Kolapte",
    recipientRole: "Site Manager",
    purpose: "For construction",
    copies: { color: 1, bw: 6 },
    status: "sent",
    sent: "2026-10-07",
    created: "2026-10-06",
    origin: "ifc",
    by: "Apurva Bhadange",
    remarks: "",
    drawings: [
      { no: "LB-EL-W32-101", name: "Electrical lighting layout", rev: "R2" },
      { no: "LB-FF-W32-201", name: "Fire tender layout", rev: "R1" }
    ]
  }
];

let transmittalFilter = "all";

const transmittalSearch = document.getElementById("transmittal-search");

const transmittalsSentNewestFirst = () =>
  transmittals.filter((t) => t.status === "sent" && t.recipient).sort((a, b) => b.sent.localeCompare(a.sent));

// Recipient, source and copies come from what was last sent for the same wing,
// then from what is sent most often; with no history the user fills them in
// Pre-fills a new transmittal from history so repeat senders type nothing; with no history the user fills it in
function transmittalDefaults(wing) {
  const sent = transmittalsSentNewestFirst();
  const sameWing = sent.find((t) => t.wing === wing);
  const counts = new Map();
  sent.forEach((t) => counts.set(t.recipient, (counts.get(t.recipient) || 0) + 1));
  const mostUsed = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const basis = sameWing || sent.find((t) => t.recipient === mostUsed?.[0]);
  return {
    recipient: basis?.recipient || "",
    recipientRole: basis?.recipientRole || "",
    source: basis?.source || "DSG",
    copies: basis ? { ...basis.copies } : { color: 1, bw: 6 },
    basis
  };
}

// Four most recent distinct recipients, used for one-click suggestions
const recentRecipients = () => [...new Set(transmittalsSentNewestFirst().map((t) => t.recipient))].slice(0, 4);

// Highest existing TR number + 1, so numbers never repeat even after deletions
function nextTransmittalNo() {
  return `TR-${Math.max(0, ...transmittals.map((t) => Number(t.no.replace(/\D/g, "")) || 0)) + 1}`;
}

// Drawing number, name and revision are read from the file name (and matched against the tracker)
// Reads drawing number, name and revision from a file name like 'LB-PH-W25-110_Plumbing_R3.pdf', then prefers the tracker's official title and doc number if it matches
function drawingFromFile(fileName, wing, index) {
  const base = fileName.replace(/\.[^.]+$/, "");
  const revMatch = base.match(/[_\s-](R(?:ev)?)[\s_-]?([A-Z]|\d{1,2})$/i);
  const rev = revMatch ? (/\d/.test(revMatch[2]) ? `R${revMatch[2]}` : `Rev ${revMatch[2].toUpperCase()}`) : "R0";
  const readable = (revMatch ? base.slice(0, revMatch.index) : base).replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  const numberMatch = base.match(/[A-Z]{2,}(?:-[A-Z0-9]+){2,}/);
  // Compare names with punctuation and case removed so 'Fire-Pump Room' matches 'fire pump room'
  const compact = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
  const tracked = deliverableTracker.find(
    (item) => compact(readable).includes(compact(item.title)) || compact(item.title).includes(compact(readable))
  );
  const wingCode = wing.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return {
    no: numberMatch?.[0] || tracked?.docNo || `${wingCode}-DWG-${String(index + 1).padStart(3, "0")}`,
    name: tracked?.title || readable.replace(numberMatch?.[0] || "", "").trim() || base,
    rev
  };
}

// Creates a Pending draft only; nothing is sent until someone reviews it, and a notification tells the user it is ready
function draftTransmittalFromIfc(files, wing) {
  const defaults = transmittalDefaults(wing);
  const transmittal = {
    no: nextTransmittalNo(),
    wing,
    source: defaults.source,
    recipient: defaults.recipient,
    recipientRole: defaults.recipientRole,
    purpose: "For construction",
    copies: defaults.copies,
    status: "pending",
    sent: null,
    created: toDateInput(new Date()),
    origin: "ifc",
    by: profileState.name,
    remarks: "",
    drawings: files.map((file, index) => drawingFromFile(file.name, wing, index)),
    activity: [
      `Drafted automatically from an GFC upload (${files.length} drawing${files.length === 1 ? "" : "s"})`,
      defaults.recipient ? `Recipient filled from history: ${defaults.recipient}` : "Recipient needed before sending"
    ]
  };
  transmittals.push(transmittal);
  renderTransmittals();
  notifications.unshift({
    id: `n-${transmittal.no}`,
    who: profileState.name,
    time: "Just now",
    title: `${transmittal.no} drafted for ${wing}`,
    body: `${files.length} GFC drawing${files.length === 1 ? "" : "s"} ready to review and send.`,
    project: overviewPage.querySelector(".project-title").textContent,
    route: "project/transmittals",
    unread: true
  });
  renderNotifications();
  return transmittal;
}

const transmittalDate = (iso) => (iso ? formatLongDate(iso).replace(/^(\d+) (\w{3})\w* (\d+)$/, "$1 $2 $3") : "—");

// Table style from the design: "07, Oct, 2026"
const transmittalTableDate = (iso) => transmittalDate(iso).replace(/^(\d+) (\w+) (\d+)$/, "$1, $2, $3");

function renderTransmittals() {
  const query = transmittalSearch.value.trim().toLocaleLowerCase();
  const visible = transmittals
    // Keep each row's original array index: after filtering and sorting it is the only stable handle for opening the right record
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) =>
        (transmittalFilter === "all" || item.status === transmittalFilter) &&
        `${item.no} ${item.wing} ${item.source} ${item.recipient} ${item.drawings.map((d) => `${d.no} ${d.name}`).join(" ")}`
          .toLocaleLowerCase()
          .includes(query)
    )
    .sort((a, b) => a.item.no.localeCompare(b.item.no, undefined, { numeric: true }));

  const sendIcon =
    icon("send-plane", 14);
  const eyeIcon =
    icon("eye-view", 14);

  document.getElementById("transmittal-list").innerHTML = visible
    .map(({ item, index }) => {
      const sent = item.status === "sent";
      return `
      <tr class="project-task-row transmittal-row${sent ? " is-sent" : ""}" data-transmittal-index="${index}" tabindex="0">
        <td>${item.no}</td>
        <td><strong>${escapeHtml(item.wing)}</strong></td>
        <td><strong>${pad2(item.drawings.length)}</strong></td>
        <td><strong>${pad2(item.copies.color + item.copies.bw)}</strong> <small class="copies-split">(${item.copies.color} Color + ${item.copies.bw} B&amp;W)</small></td>
        <td><strong>${escapeHtml(item.source)}</strong></td>
        <td>${item.recipient ? `<strong>${escapeHtml(item.recipient)}</strong>` : '<span class="waiting-tag">Add recipient</span>'}</td>
        <td><span class="tr-chip ${sent ? "is-sent" : "is-pending"}">${sent ? "Sent" : "Pending"}</span></td>
        <td>${sent ? `<span class="tr-date">${transmittalTableDate(item.sent)}</span>` : '<span class="tr-dash">—</span>'}</td>
        <td class="col-action">${
          sent
            ? `<button class="comment-btn" type="button" data-row-action="open">${eyeIcon}View</button>`
            : `<button class="comment-btn" type="button" data-row-action="open">${sendIcon}Review &amp; Send</button>`
        }</td>
      </tr>`;
    })
    .join("");
  document.getElementById("transmittal-empty").hidden = visible.length !== 0;

  setText("metric-transmittals", transmittals.length);
  setText("metric-transmittals-pending", transmittals.filter((item) => item.status === "pending").length);
}

document.querySelectorAll("[data-transmittal-status]").forEach((chip) => {
  chip.addEventListener("click", () => {
    transmittalFilter = chip.dataset.transmittalStatus;
    document.querySelectorAll("[data-transmittal-status]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderTransmittals();
  });
});

transmittalSearch.addEventListener("input", renderTransmittals);
