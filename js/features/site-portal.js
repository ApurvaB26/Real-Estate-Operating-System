/**
 * File: js/features/site-portal.js
 * Role: Site Team role: GFC Drawings and RFIs pages in the shared app layout, the MAS Library link (the real Library page, view only, with the Upload Non - Standard MAS button in its header), hard copy requests and the drawing QR code.
 * Dependencies: Loaded by index.html as script 79 of 80. Uses globals from js/components/qr-code.js, js/core/router.js, js/components/layers.js, js/core/utils.js, js/features/library/library.js, js/features/roles.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/features/roles.js.
 */

/* ---------- Site Team pages ---------- */
// The site role uses the normal sidebar, top bar and page styles. These two pages are added to the router like Task Board and Reminders;
// the third page, MAS Library, is the real Library > MAS tab with the other library tabs hidden (see css/pages/site-portal.css)
const siteState = { hard: [] };
// id, title, revision the site holds, latest revision, issue date
const GFC = [["GFC-HV-A-05", "HVAC layout, Tower A L5", "D", "D", "24 Oct"], ["GFC-EL-B-02", "Power layout, Tower B L2", "C", "E", "27 Oct"], ["GFC-PL-A-01", "Plumbing riser, Tower A", "B", "B", "12 Oct"]];
const SITE_RFIS = [["RFI-209", "MCB rating clarification", "In Progress"], ["RFI-211", "Revised infra fire layout", "Delayed"], ["RFI-198", "Earthing pit location", "Completed"]];

const siteGfc = document.createElement("section");
siteGfc.className = "page-view cx-page site-page"; siteGfc.id = "site-gfc-view"; siteGfc.hidden = true; siteGfc.setAttribute("aria-label", "GFC Drawings");
const siteRfi = document.createElement("section");
siteRfi.className = "page-view cx-page site-page"; siteRfi.id = "site-rfi-view"; siteRfi.hidden = true; siteRfi.setAttribute("aria-label", "RFIs");
mainContent2.append(siteGfc, siteRfi);
pageSections["site-gfc"] = siteGfc; pageSections["site-rfi"] = siteRfi;

function renderSiteGfc() {
  siteGfc.innerHTML = `${pageIntro("GFC Drawings", "Latest issued revisions for Lakeshore Gold-3. Open a drawing to see its title block, or ask the Pool team for a printed copy of the latest revision.")}
    <div class="project-task-table-scroll"><table class="data-table project-task-table oi-table"><thead><tr><th>Drawing No.</th><th>Drawing</th><th>Latest revision</th><th>Issued</th><th>Action</th></tr></thead><tbody>
    ${GFC.map((g, i) => `<tr class="project-task-row"><td>${g[0]}</td><td><strong>${g[1]}</strong></td><td><span class="task-state completed">Rev ${g[3]}</span></td><td>${g[4]}</td><td><div class="site-row-actions"><button class="comment-btn" type="button" data-site-open="${i}">${icon("eye-view", 14)}Open</button><button class="comment-btn" type="button" data-site-hard="${i}">${icon("send-plane", 14)}Request hard copy</button></div></td></tr>`).join("")}
    </tbody></table></div>
    <section class="overview-panel"><header class="overview-panel-header"><h2>My hard copy requests</h2></header>
    ${siteState.hard.length
      ? `<div class="project-task-table-scroll"><table class="data-table project-task-table oi-table"><thead><tr><th>Drawing</th><th>Status</th></tr></thead><tbody>${siteState.hard.map((x) => `<tr class="project-task-row"><td>${escapeHtml(x)}</td><td><span class="task-state pending">Requested</span></td></tr>`).join("")}</tbody></table></div>`
      : '<p class="cx-muted">No hard copy requests yet.</p>'}
    </section>`;
}

function renderSiteRfi() {
  siteRfi.innerHTML = `${pageIntro("RFIs", "Questions you have raised from site for Lakeshore Gold-3.", `<button class="cx-primary btn-muted" type="button" disabled aria-disabled="true" title="Coming soon">${icon("plus", 16)} Raise RFI</button>`)}
    <div class="project-task-table-scroll"><table class="data-table project-task-table oi-table"><thead><tr><th>RFI</th><th>Query</th><th data-hf="site-rfi-status">Status</th></tr></thead><tbody>
    ${SITE_RFIS.map((r) => `<tr class="project-task-row"><td>${r[0]}</td><td><strong>${r[1]}</strong></td><td><span class="task-state ${r[2] === "Completed" ? "completed" : r[2] === "Delayed" ? "delayed" : "in-progress"}">${r[2]}</span></td></tr>`).join("")}
    </tbody></table></div>`;
}

// Same wrap-the-router pattern as js/features/extra-routes.js
const _showPageSite = showPage;
showPage = function (name) { _showPageSite(name); if (name === "site-gfc") renderSiteGfc(); if (name === "site-rfi") renderSiteRfi(); };
const _renderRouteSite = renderRoute;
renderRoute = function (path) { const [p] = path.split("/"); if (p === "site-gfc" || p === "site-rfi") { setCurrentView(p); return; } _renderRouteSite(path); };

// Sidebar entries for the site role; css/pages/site-portal.css shows them only in site mode and hides the other entries
const siteNavLink = (key, label, iconName) => {
  const a = document.createElement("a");
  a.href = `#${key}`; a.dataset.viewTarget = key; a.className = "site-nav";
  a.innerHTML = `${icon(iconName, 20)}${label}`;
  return a;
};
const siteNavBar = $(".nav-bar");
siteNavBar.querySelector('[data-view-target="dashboard"]').before(siteNavLink("site-gfc", "GFC Drawings", "tab-files"), siteNavLink("site-rfi", "RFIs", "tab-rfis"));

// The Library link opens the real MAS Library for the site role, so it is renamed while that role is active
const siteLibraryLink = siteNavBar.querySelector('[data-view-target="library"]');
const siteLibraryLabel = [...siteLibraryLink.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent.trim());
const siteLibraryOriginal = siteLibraryLabel.textContent;

// Called by roles.js whenever the role changes; only a real change moves the user, so the first call at start-up leaves the URL alone
let siteModeOn = false;
function setSiteMode(on) {
  if (on === siteModeOn) return;
  siteModeOn = on;
  siteLibraryLabel.textContent = on ? "\n      MAS Library\n    " : siteLibraryOriginal;
  document.getElementById("library-intro-title").textContent = on ? "MAS Library" : "Library";
  document.getElementById("library-intro-text").textContent = on ? "Access all your MAS templates, guidelines, and project files directly from here." : "Company standards, approved makes, MAS, drawings and reference books in one place.";
  if (on) { currentLibraryTab = "mas"; setCurrentView("site-gfc"); }
  else setCurrentView("dashboard");
}

document.addEventListener("click", (e) => {
  const open = e.target.closest("[data-site-open]");
  if (open) {
    const g = GFC[Number(open.dataset.siteOpen)];
    modal(`${g[0]} · ${g[1]}`, `<div class="site-sheet"><div class="site-sheet-meta"><strong>${g[1]}</strong><span>${g[0]} · Rev ${g[3]} · issued ${g[4]}</span></div><div class="site-sheet-title-block"><div class="site-qr">${qrSvg(`${g[0]} | Rev ${g[3]} | Lakeshore Gold-3`, 96)}</div><div class="site-sheet-id"><span>Title block</span><strong>${g[0]}</strong><small>Rev ${g[3]} · issued ${g[4]}</small></div></div></div>`);
    return;
  }
  const hard = e.target.closest("[data-site-hard]");
  if (hard) {
    const g = GFC[Number(hard.dataset.siteHard)];
    siteState.hard.unshift(`${g[0]} · Rev ${g[3]}`);
    renderSiteGfc();
    showToast("Hard copy requested. The Pool team has been notified.");
    return;
  }
  if (e.target.closest("[data-site-mas]")) {
    modal("Submit non-standard MAS", `<label class="cx-field">File<input type="text" value="Chiller_Alt_Make_MAS.pdf"></label><label class="cx-field">Project<select><option>Lakeshore Gold-3</option><option>Meridian</option></select></label><label class="cx-field">Note to the design team<textarea rows="3" placeholder="Why a non-standard make is needed"></textarea></label><button class="cx-primary cx-wide" type="button" data-site-mas-send>Send for review</button>`);
    return;
  }
  if (e.target.closest("[data-site-mas-send]")) { closeLayer(); showToast("Sent to the design team review queue. They were notified."); }
});

// Runs last so the page sections and role menu exist before the first role is applied
applyRole("Super Admin");
