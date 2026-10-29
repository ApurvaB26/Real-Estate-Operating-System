/**
 * File: js/components/toolbar.js
 * Role: List toolbars: close Filters popovers and tower menus on outside click.
 * Dependencies: Loaded by index.html as script 21 of 80. Nothing else calls into it; it wires itself up on load.
 */

// Close any open Filters popover or tower menu when clicking elsewhere
document.addEventListener("click", (e) => {
  document.querySelectorAll(".task-advanced-filter-wrap").forEach((wrap) => {
    // Skip the popover the click happened inside; every other open one closes
    if (wrap.contains(e.target)) return;
    const menu = wrap.querySelector(".task-advanced-filters");
    if (menu) menu.hidden = true;
    wrap.querySelector(".task-advanced-filter-button")?.setAttribute("aria-expanded", "false");
  });
  document.querySelectorAll(".oi-tower-dropdown").forEach((dropdown) => {
    if (dropdown.contains(e.target)) return;
    dropdown.querySelector(".tower-menu").hidden = true;
    dropdown.querySelector(".tower-filter").setAttribute("aria-expanded", "false");
  });
});
