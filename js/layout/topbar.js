/**
 * File: js/layout/topbar.js
 * Role: Top bar: global search, profile and role menu, theme, mail, notifications and role permissions.
 * Dependencies: Loaded by index.html as script 25 of 80. Uses globals from js/core/router.js, js/core/utils.js, js/data/inbox.js, js/features/library/library.js, js/features/library/makes.js, js/features/library/mas.js and 4 more. Its globals are used by js/core/router.js, js/features/auth.js, js/features/create-project.js, js/features/library/mas.js, js/features/profile.js, js/features/project/transmittals.js and 2 more.
 */

const searchInput = document.querySelector(".search input");

// The topbar search filters whatever list the current page shows
// Each page keeps its own filter, so the topbar copies the text into that page's search box and re-runs that page's filter
function filterTasks() {
  const query = searchInput.value.trim().toLocaleLowerCase();

  if (!projectsView.hidden) {
    projectSearchInput.value = searchInput.value;
    filterProjectCards();
    return;
  }

  if (!libraryView.hidden) {
    if (currentLibraryTab === "makes") {
      makesSearch.value = searchInput.value;
      renderMakes();
      return;
    }
    if (currentLibraryTab === "mas") {
      masSearch.value = searchInput.value;
      renderMas();
      return;
    }
    policySearchInput.value = searchInput.value;
    filterPolicies();
    return;
  }

  document
    // Fallback for pages without their own search: hide table rows that do not contain the text
    .querySelectorAll("#tasks-table tbody tr, #rfiTable tbody tr, #deliverables-table tbody tr")
    .forEach((row) => {
      row.hidden = !row.textContent.toLocaleLowerCase().includes(query);
    });
}

searchInput.addEventListener("input", filterTasks);

document.addEventListener("keydown", (event) => {
  // Ctrl/Cmd+K focuses search (preventDefault stops the browser's own shortcut)
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});

/* PROFILE MENU */
const profileTrigger = document.querySelector(".profile-trigger");

const profileCard = document.getElementById("profile-card");

const roleSwitchTrigger = document.querySelector(".role-switch-trigger");

const roleSwitchMenu = document.querySelector("#role-switch-menu");

const currentRole = document.querySelector(".current-role");

const roleOptions = Array.from(roleSwitchMenu.querySelectorAll("[data-role]"));

const themeOptions = Array.from(document.querySelectorAll("[data-theme-choice]"));

function setProfileOpen(open) {
  profileCard.hidden = !open;
  profileTrigger.setAttribute("aria-expanded", String(open));
}

function setRoleMenuOpen(open, focusSelected = false) {
  roleSwitchMenu.hidden = !open;
  roleSwitchTrigger.setAttribute("aria-expanded", String(open));
  if (open && focusSelected) {
    (roleOptions.find((option) => option.getAttribute("aria-checked") === "true") || roleOptions[0]).focus();
  }
}

// 'system' follows the OS setting; the raw choice is saved, not the resolved theme, so it keeps following the OS
function setTheme(choice) {
  const effectiveTheme =
    choice === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : choice;
  document.documentElement.dataset.theme = effectiveTheme;
  localStorage.setItem("reos-theme-choice", choice);
  themeOptions.forEach((option) => {
    const isSelected = option.dataset.themeChoice === choice;
    option.classList.toggle("active", isSelected);
    option.setAttribute("aria-pressed", String(isSelected));
  });
}

profileTrigger.addEventListener("click", () => setProfileOpen(profileCard.hidden));

roleSwitchTrigger.addEventListener("click", () => {
  setProfileOpen(false);
  setRoleMenuOpen(roleSwitchMenu.hidden, roleSwitchMenu.hidden);
});

roleSwitchMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-role]");
  if (!option) return;
  currentRole.textContent = option.dataset.role;
  roleOptions.forEach((roleOption) => {
    roleOption.setAttribute("aria-checked", String(roleOption === option));
  });
  setRoleMenuOpen(false);
});

roleSwitchMenu.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  const currentIndex = roleOptions.indexOf(document.activeElement);
  // Modulo wrap: ArrowDown on the last role goes to the first and vice versa (standard menu keyboard behaviour)
  const offset = event.key === "ArrowDown" ? 1 : -1;
  roleOptions[(currentIndex + offset + roleOptions.length) % roleOptions.length].focus();
});

document.addEventListener("click", (e) => {
  // Click outside the user menu closes both the profile card and the role menu
  if (!e.target.closest(".user-menu")) {
    setProfileOpen(false);
    setRoleMenuOpen(false);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    setProfileOpen(false);
    if (!roleSwitchMenu.hidden) {
      setRoleMenuOpen(false);
      roleSwitchTrigger.focus();
    }
  }
});

themeOptions.forEach((option) => {
  option.addEventListener("click", () => setTheme(option.dataset.themeChoice));
});

/* EMAIL OVERLAY */
const mailTrigger = document.querySelector(".mail-trigger");

const mailOverlay = document.getElementById("mail-overlay");

const mailList = document.getElementById("mail-list");


const mailInitials = (name) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

mailList.innerHTML = unreadEmails
  .map(
    (m) => `
  <li class="mail-item">
    <span class="mail-avatar">${mailInitials(m.name)}</span>
    <div class="mail-item-head">
      <strong class="mail-sender">${m.name}</strong>
      <span class="mail-time">${m.time}</span>
    </div>
    <div class="mail-item-body">
      <p class="mail-subject">${m.subject}</p>
      <p class="mail-preview">${m.preview}</p>
      <span class="mail-project">
        ${icon("map-pin-topbar", 12)}
        ${m.project}
      </span>
    </div>
  </li>`
  )
  .join("");

function setMailOpen(open) {
  mailOverlay.hidden = !open;
  mailTrigger.setAttribute("aria-expanded", String(open));
}

mailTrigger.addEventListener("click", () => {
  const opening = mailOverlay.hidden;
  setProfileOpen(false);
  setRoleMenuOpen(false);
  setMailOpen(opening);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".mail-menu")) setMailOpen(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !mailOverlay.hidden) {
    setMailOpen(false);
    mailTrigger.focus();
  }
});

/* NOTIFICATIONS */
const notifTrigger = document.querySelector(".notif-trigger");

const notifOverlay = document.getElementById("notif-overlay");

const notifList = document.getElementById("notif-list");


function renderNotifications() {
  const unread = notifications.filter((n) => n.unread).length;
  document.getElementById("notif-badge").hidden = unread === 0;
  notifTrigger.setAttribute("aria-label", unread ? `Notifications, ${unread} unread` : "Notifications");
  document.getElementById("notif-title").textContent = unread ? `${unread} unread` : "All caught up";
  notifList.innerHTML = notifications
    .map(
      (n) => `
    <li class="mail-item notif-item${n.unread ? " is-unread" : ""}" data-notif-id="${n.id}" tabindex="0" role="link">
      <span class="mail-avatar">${initialsOf(n.who)}</span>
      <div class="mail-item-head">
        <strong class="mail-sender">${n.who}</strong>
        <span class="mail-time">${n.time}</span>
      </div>
      <div class="mail-item-body">
        <p class="mail-subject">${escapeHtml(n.title)}</p>
        <p class="mail-preview">${escapeHtml(n.body)}</p>
        <span class="mail-project">${escapeHtml(n.project)}</span>
      </div>
    </li>`
    )
    .join("");
}

function setNotifOpen(open) {
  notifOverlay.hidden = !open;
  notifTrigger.setAttribute("aria-expanded", String(open));
}

notifTrigger.addEventListener("click", () => {
  const opening = notifOverlay.hidden;
  setMailOpen(false);
  setProfileOpen(false);
  setRoleMenuOpen(false);
  setNotifOpen(opening);
});

// Second listener on purpose: opening mail must close notifications (only one overlay open at a time)
mailTrigger.addEventListener("click", () => setNotifOpen(false));

// Mark as read first so the badge count updates before navigating
function openNotification(item) {
  item.unread = false;
  renderNotifications();
  setNotifOpen(false);
  renderRoute(item.route);
}

notifList.addEventListener("click", (e) => {
  const item = e.target.closest("[data-notif-id]");
  if (item) openNotification(notifications.find((n) => n.id === item.dataset.notifId));
});

notifList.addEventListener("keydown", (e) => {
  const item = e.target.closest("[data-notif-id]");
  if (item && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    openNotification(notifications.find((n) => n.id === item.dataset.notifId));
  }
});

document.getElementById("notif-mark-read").addEventListener("click", () => {
  notifications.forEach((n) => {
    n.unread = false;
  });
  renderNotifications();
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".notif-menu")) setNotifOpen(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !notifOverlay.hidden) {
    setNotifOpen(false);
    notifTrigger.focus();
  }
});

/* CREATE PROJECT: only these roles can start a project */
// RBAC for now: every role sees Create Project except Pool Team and Site Team (ROLE_RULES in js/core/utils.js; client-side only, the backend must enforce it too)
const createProjectButtons = document.querySelectorAll("[data-open-project-dialog]");

function applyRolePermissions() {
  const allowed = !ROLE_RULES.createProjectDenied.includes(currentRole.textContent.trim());
  createProjectButtons.forEach((button) => (button.hidden = !allowed));
}

// Runs after the earlier click handler has updated currentRole, because listeners fire in registration order
roleSwitchMenu.addEventListener("click", applyRolePermissions);
