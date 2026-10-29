/**
 * File: js/features/roles.js
 * Role: Adds the Site Team role to the role switcher and switches the site layout on and off. Who may create projects or upload MAS is the ROLE_RULES table in js/core/utils.js.
 * Dependencies: Loaded by index.html as script 69 of 80. Uses globals from js/features/site-portal.js, js/utils/dom-helpers.js. Its globals are used by js/features/site-portal.js.
 */

/* ---------- roles: Site Team pages ---------- */
const roleMenu = $("#role-switch-menu");
const siteOpt = document.createElement("button");
siteOpt.type = "button"; siteOpt.setAttribute("role", "menuitemradio"); siteOpt.setAttribute("aria-checked", "false"); siteOpt.dataset.role = "Site Team"; siteOpt.textContent = "Site Team";
roleMenu.append(siteOpt);
function applyRole(label) {
  role = label;
  // Site Team keeps the normal app layout and right rail; site-mode shows only its sidebar entries
  document.body.classList.toggle("site-mode", label === "Site Team");
  setSiteMode(label === "Site Team");
  // Right rail sections this role does not see (ROLE_RULES.railHidden in js/core/utils.js)
  const railHidden = ROLE_RULES.railHidden[label] || [];
  $$("[data-rail-section]").forEach((el) => { el.hidden = railHidden.includes(el.dataset.railSection); });
  $$("[data-role]", roleMenu).forEach((b) => b.setAttribute("aria-checked", String(b.textContent.trim() === label)));
}
roleMenu.addEventListener("click", (e) => { const o = e.target.closest("[data-role]"); if (o) applyRole(o.textContent.trim()); });
