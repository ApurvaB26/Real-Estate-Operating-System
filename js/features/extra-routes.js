/**
 * File: js/features/extra-routes.js
 * Role: Registers the Task Board and Reminder Log pages with the router by wrapping showPage and renderRoute.
 * Dependencies: Loaded by index.html as script 73 of 80. Uses globals from js/core/router.js, js/features/reminder-log.js, js/features/task-board.js. Nothing else calls into it; it wires itself up on load.
 */

/* ---------- routing for the two new pages ---------- */
// Registering the sections lets the router's existing show/hide logic treat them like built-in pages
pageSections.taskboard = taskBoard; pageSections.reminders = remPage;
// Wrap, don't edit, the original router functions so core/router.js stays untouched
const _showPage = showPage;
showPage = function (name) { _showPage(name); if (name === "taskboard") renderTaskBoard(); if (name === "reminders") { renderReminders(); } };
const _renderRoute = renderRoute;
renderRoute = function (path) { const [p] = path.split("/"); if (p === "taskboard" || p === "reminders") { setCurrentView(p); return; } _renderRoute(path); };
// A page opened directly on #taskboard or #reminders was routed before these pages existed, so route again
if (/^#(taskboard|reminders)$/.test(location.hash)) renderRoute(location.hash.slice(1));
