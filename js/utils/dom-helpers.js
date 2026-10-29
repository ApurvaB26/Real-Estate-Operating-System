/**
 * File: js/utils/dom-helpers.js
 * Role: Shorthand DOM helpers and current-role state shared by the later feature files.
 * Dependencies: Loaded by index.html as script 66 of 80. Uses globals from js/core/utils.js. Its globals are used by js/components/action-dialog.js, js/components/date-picker.js, js/components/layers.js, js/components/meeting-card.js, js/components/select.js, js/core/router.js and 24 more.
 */

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
// Short alias: every template string below escapes user text with h()
const h = escapeHtml;
// Page title and one-line description, with an optional actions slot (primary button) on the right: one shared block for every JS-built page (styles: css/components/page-intro.css)
const pageIntro = (title, text, actions = "") => `<header class="page-intro"><div><h1 class="page-intro-title">${title}</h1><p class="page-intro-text">${text}</p></div>${actions ? `<div class="page-intro-actions">${actions}</div>` : ""}</header>`;
const mainContent2 = $(".main-content");
const ov = document.getElementById("overview-page");
const initials = (n) => initialsOf(n);
// Current demo role; roles.js changes it and site-portal.js reads it
let role = "Super Admin";
