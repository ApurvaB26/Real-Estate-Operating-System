/**
 * File: js/features/profile.js
 * Role: Profile, notification preferences and help.
 * Dependencies: Loaded by index.html as script 50 of 80. Uses globals from js/core/router.js, js/core/utils.js, js/data/inbox.js, js/layout/topbar.js, js/utils/dom-helpers.js. Its globals are used by js/components/action-dialog.js, js/core/router.js, js/features/assistant.js, js/features/auth.js, js/features/dashboard.js, js/features/meetings/meeting-notes.js and 10 more.
 */

const profileDefaults = {
  name: "Apurva Bhadange",
  email: "apurva.bhadange@example.com",
  phone: "",
  department: "MEP Design",
  location: "South Mumbai",
  manager: "",
  bio: ""
};

// Saved profile merged over the defaults, so fields added later still get a value for existing users
const profileState = loadStored("reos-profile", profileDefaults);

const profileForm = document.getElementById("profile-form");

// Greeting follows the local hour: morning 5-12, afternoon until 17, evening for the rest (late night included)
function greetingForHour(hour) {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
}

// One function updates every place the name shows, so there is no stale copy after a save
// Name, initials and department appear in the topbar, profile card, greeting and notes dialog
function applyProfile() {
  const initials = initialsOf(profileState.name);
  document.querySelector(".user-name").textContent = profileState.name;
  document.querySelector(".profile-trigger").textContent = initials;
  document.querySelector(".profile-card .profile-avatar").textContent = initials;
  document.querySelector(".profile-head strong").textContent = profileState.name;
  document.querySelector(".profile-card .profile-role").textContent = profileState.department;
  document.querySelector(".profile-card .profile-email").textContent = profileState.email;
  document.querySelector(".greeting-text h1").textContent = `${greetingForHour(new Date().getHours())}, ${firstName(profileState.name)}!`;
  document.querySelector(".notes-meta p span").textContent = profileState.name;
  document.getElementById("profile-page-avatar").textContent = initials;
  document.getElementById("profile-page-name").textContent = profileState.name;
  document.getElementById("profile-page-role").textContent = `${profileState.department} · ${currentRole.textContent}`;
  document.getElementById("profile-page-email").textContent = profileState.email;
  document.querySelector("[data-sign-in]").textContent = `Continue as ${profileState.name}`;
}

function fillProfileForm() {
  Object.entries(profileState).forEach(([key, value]) => {
    const field = profileForm.elements[key];
    if (field) field.value = value;
  });
}

function setProfileTab(tab) {
  const labels = { account: "Profile", notifications: "Notification Preferences", help: "Help & Support" };
  // Unknown #profile/<tab> in the URL falls back to the account tab
  if (!labels[tab]) tab = "account";
  document.querySelectorAll("[data-profile-tab]").forEach((button) => {
    const isActive = button.dataset.profileTab === tab;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-profile-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.profilePanel !== tab;
  });
  if (tab === "account") fillProfileForm();
  renderBreadcrumb([{ label: "Account", route: "profile/account" }, { label: labels[tab] }]);
  syncHash(`profile/${tab}`);
}

function showProfile(tab) {
  showPage("profile");
  setProfileTab(tab);
}

document.querySelectorAll("[data-profile-tab]").forEach((button) => {
  button.addEventListener("click", () => setProfileTab(button.dataset.profileTab));
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!profileForm.reportValidity()) return;
  Object.keys(profileDefaults).forEach((key) => {
    profileState[key] = profileForm.elements[key].value.trim();
  });
  store("reos-profile", profileState);
  applyProfile();
  showToast("Profile saved.");
});

document.querySelector("[data-profile-reset]").addEventListener("click", fillProfileForm);

// The profile page shows the current role, so refresh it after a role switch
roleSwitchMenu.addEventListener("click", () => applyProfile());

const prefEvents = [
  ["task-assigned", "Task assigned to me", true],
  ["task-due", "Task due or overdue", true],
  ["rfi-raised", "New RFI on my projects", true],
  ["rfi-response", "Response on an RFI I raised", true],
  ["deliverable", "Deliverable status changes", false],
  ["meeting", "Meeting reminders", true],
  ["mention", "Mentions and comments", false]
];

// Builds one '<event>-app' and '<event>-email' flag per event: in-app is on by default, email follows the event's default
const prefDefaults = Object.fromEntries(
  prefEvents.flatMap(([key, , email]) => [
    [`${key}-app`, true],
    [`${key}-email`, email]
  ])
);

const prefState = loadStored("reos-notification-prefs", { ...prefDefaults, digest: "08:00" });

const prefForm = document.getElementById("pref-form");

function renderPrefs() {
  const toggle = (name, label) => `
    <label class="pref-switch">
      <input type="checkbox" name="${name}"${prefState[name] ? " checked" : ""}>
      <span class="pref-switch-track" aria-hidden="true"></span>
      <span class="visually-hidden">${label}</span>
    </label>`;
  document.getElementById("pref-rows").innerHTML = prefEvents
    .map(
      ([key, label]) => `
    <tr>
      <td><strong>${label}</strong></td>
      <td>${toggle(`${key}-app`, `${label} in-app`)}</td>
      <td>${toggle(`${key}-email`, `${label} by email`)}</td>
    </tr>`
    )
    .join("");
  prefForm.elements.digest.value = prefState.digest;
}

prefForm.addEventListener("submit", (e) => {
  e.preventDefault();
  Object.keys(prefDefaults).forEach((name) => {
    prefState[name] = prefForm.elements[name].checked;
  });
  prefState.digest = prefForm.elements.digest.value;
  store("reos-notification-prefs", prefState);
  showToast("Notification preferences saved.");
});

document.getElementById("help-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form.reportValidity()) return;
  showToast(`Support request "${form.elements.subject.value.trim()}" sent. We'll reply by email.`);
  form.reset();
});
