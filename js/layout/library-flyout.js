/**
 * File: js/layout/library-flyout.js
 * Role: Sidebar Library flyout that opens on hover, focus or tap.
 * Dependencies: Loaded by index.html as script 61 of 80. Uses globals from js/core/router.js, js/features/library/library.js, js/utils/dom-helpers.js. Nothing else calls into it; it wires itself up on load.
 */

/* LIBRARY FLYOUT: hover / focus / tap the sidebar's Library item to jump straight to a Library page */
(() => {
  const trigger = document.querySelector('.nav-bar [data-view-target="library"]');
  if (!trigger) return;

  const pages = [
    ["policies", "Policies"],
    ["learnings", "Learnings"],
    ["boqs", "BOQs"],
    ["makes", "Approved Makes"],
    ["mas", "MAS Library"],
    ["drawings", "Standard Drawings"],
    ["books", "Reference Books"],
    ["catalogues", "Catalogues"]
  ];

  const flyout = document.createElement("div");
  flyout.className = "library-flyout";
  flyout.id = "library-flyout";
  flyout.hidden = true;
  flyout.innerHTML = `<div class="library-flyout-card" role="menu" aria-label="Library pages">${pages
    .map(
      ([key, label]) =>
        `<button class="library-flyout-item" type="button" role="menuitem" data-flyout-tab="${key}">${label}</button>`
    )
    .join("")}</div>`;
  document.body.appendChild(flyout);
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "library-flyout");

  const items = Array.from(flyout.querySelectorAll(".library-flyout-item"));
  let closeTimer = null;

  function open() {
    clearTimeout(closeTimer);
    if (!flyout.hidden) return;
    const onLibrary = !libraryView.hidden;
    items.forEach((item) => {
      const current = onLibrary && item.dataset.flyoutTab === currentLibraryTab;
      item.classList.toggle("active", current);
      if (current) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    flyout.hidden = false;
    const rect = trigger.getBoundingClientRect();
    flyout.style.left = `${rect.right}px`;
    flyout.style.top = `${Math.max(8, Math.min(rect.top - 8, window.innerHeight - flyout.offsetHeight - 8))}px`;
    trigger.setAttribute("aria-expanded", "true");
  }

  function close(restoreFocus = false) {
    clearTimeout(closeTimer);
    if (flyout.hidden) return;
    flyout.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  }

  const closeSoon = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => close(), 180);
  };

  trigger.addEventListener("mouseenter", open);
  trigger.addEventListener("mouseleave", closeSoon);
  flyout.addEventListener("mouseenter", () => clearTimeout(closeTimer));
  flyout.addEventListener("mouseleave", closeSoon);
  trigger.addEventListener("focus", open);

  // On touch the first tap opens the menu; tap Policies (or tap again) to open the Library
  let touchWasClosed = false;
  trigger.addEventListener(
    "pointerdown",
    (e) => {
      touchWasClosed = e.pointerType === "touch" && flyout.hidden;
    },
    true
  );
  trigger.addEventListener(
    "click",
    (e) => {
      if (!touchWasClosed) return;
      touchWasClosed = false;
      e.preventDefault();
      e.stopImmediatePropagation();
      open();
    },
    true
  );

  trigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      open();
      items[0].focus();
    } else if (e.key === "Escape") {
      close();
    }
  });

  flyout.addEventListener("keydown", (e) => {
    const index = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") items[(index + 1) % items.length].focus();
    else if (e.key === "ArrowUp") items[(index - 1 + items.length) % items.length].focus();
    else if (e.key === "Home") items[0].focus();
    else if (e.key === "End") items[items.length - 1].focus();
    else if (e.key === "Escape" || e.key === "ArrowLeft") close(true);
    else return;
    e.preventDefault();
  });

  flyout.addEventListener("focusout", (e) => {
    if (!flyout.contains(e.relatedTarget) && e.relatedTarget !== trigger) close();
  });
  trigger.addEventListener("blur", (e) => {
    if (!flyout.contains(e.relatedTarget)) closeSoon();
  });

  flyout.addEventListener("click", (e) => {
    const item = e.target.closest("[data-flyout-tab]");
    if (!item) return;
    const key = item.dataset.flyoutTab;
    close();
    renderRoute(key === "policies" ? "library" : `library/${key}`);
  });

  // Tapping anywhere else closes it
  document.addEventListener("click", (e) => {
    if (!flyout.contains(e.target) && !trigger.contains(e.target)) close();
  });
  window.addEventListener("resize", () => close());
})();
