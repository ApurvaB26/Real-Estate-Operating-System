/**
 * File: js/core/router.js
 * Role: Page switching, breadcrumb and the URL hash router.
 * Dependencies: Loaded by index.html as script 4 of 80. Uses globals from js/core/utils.js, js/data/meetings.js, js/features/document-viewer.js, js/features/focus-mode.js, js/features/library/library.js, js/features/meetings/meetings-page.js and 6 more. Its globals are used by js/features/document-viewer.js, js/features/extra-routes.js, js/features/focus-mode.js, js/features/library/library.js, js/features/meetings/meeting-notes.js, js/features/meetings/meetings-page.js and 12 more.
 */

const dashboardView = document.querySelector("#dashboard-view");

const projectsView = document.querySelector("#projects-view");

const libraryView = document.querySelector("#library-view");

// Sidebar views (dashboard, projects, library, reporting)
// Library keeps its own tab in the URL (#library/boqs), so it syncs the hash itself via setLibraryTab
function setCurrentView(viewName) {
  showPage(viewName);

  if (viewName === "library") {
    setLibraryTab(currentLibraryTab);
    return;
  }

  renderBreadcrumb([{ label: sidebarLabel(viewName) }]);
  syncHash(viewName === "dashboard" ? "" : viewName);
}

// Sidebar and breadcrumb links both carry data-view-target
document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-view-target]");
  if (!link) return;
  event.preventDefault();
  setCurrentView(link.dataset.viewTarget);
});

/* BREADCRUMB */
function renderBreadcrumb(trail) {
  const items = [{ label: "REOS", view: "dashboard" }, ...trail];

  document.getElementById("breadcrumb").innerHTML = items
    .map((item, i) =>
      i === items.length - 1
        ? `<span class="current">${escapeHtml(item.label)}</span>`
        : item.route
          ? `<a href="#${item.route}" data-route="${item.route}">${escapeHtml(item.label)}</a>`
          : `<a href="#${item.view}" data-view-target="${item.view}">${escapeHtml(item.label)}</a>`
    )
    .join("<span>›</span>");
}

function sidebarLabel(key) {
  const link = document.querySelector(`.nav-bar [data-view-target="${key}"]`);
  return link ? link.textContent.trim() : "Dashboard";
}

/* OPEN PROJECT OVERVIEW PAGE */
const overviewPage = document.getElementById("overview-page");

/* OPEN ITEMS PAGE */
const openItemsPage = document.getElementById("open-items-page");

// Rail items are divs with role="link"; let the keyboard open them too
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const linkLike = e.target.closest('[role="link"][data-route]');
  if (!linkLike || linkLike !== e.target) return;
  e.preventDefault();
  linkLike.click();
});

/* PAGE ROUTER */
const appShell = document.querySelector(".app");

const mainContent = document.querySelector(".main-content");

const reportingView = document.getElementById("reporting-view");

const profileView = document.getElementById("profile-view");

const focusView = document.getElementById("focus-view");

const meetingsView = document.getElementById("meetings-view");

const pageSections = {
  dashboard: dashboardView,
  projects: projectsView,
  library: libraryView,
  overview: overviewPage,
  "open-items": openItemsPage,
  reporting: reportingView,
  profile: profileView,
  focus: focusView,
  meetings: meetingsView
};

// Pages without a sidebar entry keep their parent highlighted
// Value '' (profile) means no sidebar item is highlighted at all
const sidebarSection = {
  overview: "projects",
  "open-items": "dashboard",
  focus: "dashboard",
  meetings: "dashboard",
  profile: ""
};

function showPage(name) {
  // Unknown names fall back to the dashboard so a bad URL never shows a blank screen
  if (!pageSections[name]) name = "dashboard";
  Object.entries(pageSections).forEach(([key, section]) => {
    section.hidden = key !== name;
  });
  appShell.classList.toggle("project-page-active", name !== "dashboard" && name !== "library");
  appShell.classList.toggle("library-page-active", name === "library");
  // The Meetings page has its own Schedule Meeting button, so the rail one is hidden there
  appShell.classList.toggle("meetings-page-active", name === "meetings");

  const navKey = name in sidebarSection ? sidebarSection[name] : name;
  document.querySelectorAll(".nav-bar [data-view-target]").forEach((link) => {
    const isCurrent = link.dataset.viewTarget === navKey;
    link.classList.toggle("active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  if (name === "reporting") renderReporting();
  mainContent.scrollTop = 0;
}

// The URL hash mirrors the page (#reporting, #library/boqs, #project/files) so links and Back work
// Remembers the hash the app set itself, so the hashchange listener ignores our own updates and only reacts to Back/Forward or typed URLs
let lastSyncedHash = null;

const currentHash = () => decodeURIComponent(location.hash.slice(1));

function syncHash(path) {
  lastSyncedHash = path;
  if (currentHash() !== path) location.hash = path;
}

function renderRoute(path) {
  const [page, sub, extra] = path.split("/");
  switch (page) {
    case "doc":
      showDocument(sub, extra);
      break;
    case "projects":
    case "reporting":
      setCurrentView(page);
      break;
    case "library":
      currentLibraryTab = libraryTabs[sub] ? sub : "policies";
      setCurrentView("library");
      break;
    case "open-items":
      showOpenItems(sub);
      break;
    // Reopen the project already shown; before one is chosen the title is the placeholder, so use the first card
    case "project": {
      const title = overviewPage.querySelector(".project-title").textContent;
      const fallback = document.querySelector("[data-project-card] h2").textContent;
      openProject(title === "Project name" ? fallback : title, sub);
      break;
    }
    case "profile":
      showProfile(sub);
      break;
    case "focus":
      showFocus();
      break;
    case "meetings":
      showMeetings(sub);
      break;
    default:
      setCurrentView("dashboard");
  }
}

window.addEventListener("hashchange", () => {
  const path = currentHash();
  if (path === lastSyncedHash) return;
  lastSyncedHash = path;
  renderRoute(path);
});

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-route]");
  if (!link) return;
  // (overlay buttons have their own handlers)
  // Collapsed-rail items show a hover overlay; clicks inside it belong to the overlay
  if (link.classList.contains("rail-mini-item") && e.target.closest(".rail-overlay")) return;
  e.preventDefault();
  setProfileOpen(false);
  renderRoute(link.dataset.route);
});

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-project-link]");
  if (!link) return;
  e.preventDefault();
  setProjectView(link.dataset.projectLink);
});

/* DOCUMENT PAGE: BOQs, library documents, project files and transmittal PDFs open on their own page */
const docView = document.getElementById("doc-view");
