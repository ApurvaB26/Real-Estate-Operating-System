/**
 * File: js/layout/sidebar.js
 * Role: Left sidebar collapse.
 * Dependencies: Loaded by index.html as script 24 of 80. Nothing else calls into it; it wires itself up on load.
 */

/* COLLAPSE SIDEBAR */
// Only toggles a class; sidebar.css does the actual resizing, so widths stay editable in CSS
document.querySelector(".collapse-btn").addEventListener("click", () => {
  document.querySelector(".app").classList.toggle("sidebar-collapsed");
});
