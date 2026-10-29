/**
 * File: js/layout/zoom-scale.js
 * Role: Detects 67% browser zoom and toggles the class that shrinks the sidebar.
 * Dependencies: Loaded by index.html as script 80 of 80. Nothing else calls into it; it wires itself up on load.
 */

/* Detect 67% browser zoom (outer window width / CSS width) and shrink the sidebar to match 50% zoom */
(() => {
  // outerWidth/innerWidth approximates browser zoom: ~0.67 means the page is at 67%
  const set = () => { const z = window.outerWidth / window.innerWidth; document.documentElement.classList.toggle("zoom-67", z > 0.6 && z < 0.75); };
  set(); window.addEventListener("resize", set);
})();
