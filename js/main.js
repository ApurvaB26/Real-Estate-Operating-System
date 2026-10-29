/**
 * File: js/main.js
 * Role: Start-up: first render of every view, then open the page the URL points at.
 * Dependencies: Loaded by index.html as script 65 of 80. Uses globals from js/components/date-picker.js, js/components/select.js, js/core/router.js, js/features/dashboard.js, js/features/focus-mode.js, js/features/open-items.js and 9 more. Nothing else calls into it; it wires itself up on load.
 */

// Order matters: scripts above only define things; this is the first place anything renders, so every function it calls already exists
renderRailCalendar();

setTheme(localStorage.getItem("reos-theme-choice") || "system");

updateDeliverablesCount();

Object.keys(openItemsConfig).forEach(buildOpenItemsPanel);

renderRfis();

/* INITIAL RENDER */
applyRolePermissions();

enhanceSelects();

// Dialogs and drawers add selects and date inputs after load; watching the DOM upgrades them to the custom controls automatically, so feature code never has to
new MutationObserver((mutations) => {
  mutations.forEach((mutation) =>
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      enhanceSelects(node);
      enhanceDateInputs(node);
    })
  );
}).observe(document.body, { childList: true, subtree: true });

enhanceDateInputs();

renderRailDate();

applyProfile();

renderPrefs();

renderFiles();

renderTeam();

renderMilestones();

renderActivity();

renderOverviewActivity();

renderTracker();

renderTransmittals();

renderNotifications();

renderSchedule();

updateFocusCounts();

updateTaskCount();

// Open whatever page the URL points at (#reporting, #library/boqs, #project/files...)
// Mark the current URL as already handled so renderRoute below does not fire a second time from the hashchange listener
lastSyncedHash = currentHash();

renderRoute(lastSyncedHash);
