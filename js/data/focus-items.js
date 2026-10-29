/**
 * File: js/data/focus-items.js
 * Role: Demo items shown in Focus mode.
 * Dependencies: Loaded by index.html as script 8 of 80. Its globals are used by js/features/assistant.js, js/features/focus-mode.js.
 */

/* FOCUS MODE */
// Demo queue; each item carries the action it needs (done / respond / remind) and the page where it lives
const focusItems = [
  {
    id: "f1",
    type: "Task",
    title: "Review Plumbing Schematics",
    where: "Skyline One • Wing 25",
    detail: "Plumbing · Assigned by Apurva Bhadange",
    due: "Overdue",
    dueCls: "overdue",
    action: "done",
    route: "open-items/tasks",
    state: "pending"
  },
  {
    id: "f2",
    type: "RFI",
    title: "MCB Rating Clarification",
    where: "Wing 25 · Electrical",
    detail: "Raised by Sachin Patil · 2 files · Blocking",
    due: "Blocking",
    dueCls: "overdue",
    action: "respond",
    route: "open-items/rfis",
    state: "pending"
  },
  {
    id: "f3",
    type: "Task",
    title: "Approved Revised Typical Floor1",
    where: "Skyline One • Wing 25",
    detail: "Coordinated · Assigned by Apurva Bhadange",
    due: "Due Today",
    dueCls: "due-today",
    action: "done",
    route: "open-items/tasks",
    state: "pending"
  },
  {
    id: "f4",
    type: "Deliverable",
    title: "Issue Fire Tender Package",
    where: "Skyline One • Tower B",
    detail: "Fire · Waiting on MEP Consultant",
    due: "Overdue",
    dueCls: "overdue",
    action: "remind",
    route: "open-items/deliverables",
    state: "pending"
  }
];
