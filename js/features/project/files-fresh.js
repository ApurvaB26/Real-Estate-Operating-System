/**
 * File: js/features/project/files-fresh.js
 * Role: Marks recently added files and pins them to the top of the Files page.
 * Dependencies: Loaded by index.html as script 76 of 80. Uses globals from js/data/project-files.js, js/features/project/files.js. Nothing else calls into it; it wires itself up on load.
 */

/* ---------- Files: JUST ADDED (since last visit) pinned to the top ---------- */
projectFiles.forEach((f) => { f.fresh = /just now|hrs? ago/i.test(f.when); });
// Array.sort is stable, so within each group the original order is kept
projectFiles.sort((a, b) => Number(b.fresh) - Number(a.fresh));
renderFiles();
