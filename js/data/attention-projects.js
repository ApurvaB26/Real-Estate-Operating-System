/**
 * File: js/data/attention-projects.js
 * Role: Demo project data behind the dashboard greeting line.
 * Dependencies: Loaded by index.html as script 5 of 80. Its globals are used by js/features/dashboard-attention.js.
 */

// Items are what is pending; due is days from today (-2 = two days late)
const attentionProjects = [
  { name: "Skyline One", items: [{ due: -1 }, { due: -3 }, { due: 0 }, { due: 1 }] },
  { name: "Amberwood Residences", items: [{ due: 0 }, { due: 1 }, { due: 0 }] },
  { name: "Lakeshore Phase 2", items: [{ due: 1 }, { due: 1 }] },
  { name: "Crestview Towers", items: [{ due: 4 }] }
];
