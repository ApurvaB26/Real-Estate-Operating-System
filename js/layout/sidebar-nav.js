/**
 * File: js/layout/sidebar-nav.js
 * Role: Adds the Task Board and Reminders links to the sidebar.
 * Dependencies: Loaded by index.html as script 68 of 80. Uses globals from js/core/icons.js. Nothing else calls into it; it wires itself up on load.
 */

/* ---------- sidebar: Task Board and Reminder Log ---------- */
const navLink = (key, label, iconName) => {
  const a = document.createElement("a");
  a.href = `#${key}`; a.dataset.viewTarget = key;
  a.innerHTML = `${icon(iconName, 20)}${label}`;
  return a;
};
const navBar = $(".nav-bar");
navBar.querySelector('[data-view-target="projects"]').after(navLink("taskboard", "Task Board", "board"));
navBar.append(navLink("reminders", "Reminders", "bell"));
