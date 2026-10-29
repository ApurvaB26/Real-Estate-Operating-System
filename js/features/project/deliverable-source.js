/**
 * File: js/features/project/deliverable-source.js
 * Role: Backfills Source and Date received on every deliverable and re-renders the tracker.
 * Dependencies: Loaded by index.html as script 75 of 80. Uses globals from js/features/project/deliverable-tracker.js. Its globals are used by js/features/project/model-viewer.js.
 */

/* ---------- Deliverables: backfill Source and Date received ---------- */
const sources = ["Client", "Architect", "Consultant", "Internal (Pool team)", "Site team"];
// ||= keeps real values and only fills demo rows that lack them
deliverableTracker.forEach((d, i) => { d.source ||= sources[i % sources.length]; d.received ||= `${String(1 + (i * 3) % 27).padStart(2, "0")} Oct 2026`; });
renderTracker();
