/**
 * File: js/data/project-activity.js
 * Role: Demo milestones and recent activity for the Project Overview.
 * Dependencies: Loaded by index.html as script 12 of 80. Uses globals from js/utils/dom-helpers.js. Its globals are used by js/features/project/overview-feed.js.
 */

/* PROJECT MILESTONES (View All) */
// Demo milestones; the 'x/y' progress badge counts the entries marked complete
const projectMilestones = [
  { title: "Concept design sign-off", date: "14 Feb 2026", complete: true },
  { title: "Spatial Coordination", date: "24 Feb 2026", complete: true },
  { title: "Schematic MEP Design Freeze", date: "18 May 2026", complete: true },
  { title: "Facade Package Issue", date: "05 Sep 2026", complete: false },
  { title: "MEP Coordination Review", date: "12 Oct 2026", complete: false },
  { title: "Tender Drawings — Plumbing & Fire", date: "30 Nov 2026", complete: false },
  { title: "Fire Tender Package", date: "14 Feb 2027", complete: false },
  { title: "Testing & Commissioning Plan", date: "18 May 2027", complete: false }
];

/* PROJECT ACTIVITY (View All) */
const projectActivity = [
  {
    initials: "SK",
    tone: "",
    text: "SK uploaded <b>Electrical lighting layout Rev C</b>",
    when: "2 hours ago",
    tag: "Tower 26",
    fileName: "Electrical_Lighting_Layout_RevC.pdf"
  },
  {
    initials: "PC",
    tone: "avatar-slate",
    text: "PC raised <b>RFI-021 facade bracket tolerance</b>",
    when: "5 hours ago",
    tag: "MLCP"
  },
  {
    initials: "NM",
    tone: "avatar-brown",
    text: "NM completed <b>Drainage calculations Tower 16</b>",
    when: "Yesterday",
    tag: "Tower 16"
  },
  {
    initials: "RS",
    tone: "avatar-muted",
    text: "RS approved <b>Fire pump room layout</b>",
    when: "Yesterday",
    tag: "UGT 2"
  },
  {
    initials: "SP",
    tone: "avatar-slate",
    text: "SP moved <b>T-12 Approve Revised Typical Floor</b> to In Progress",
    when: "2 days ago",
    tag: "Wing 25"
  },
  { initials: "AB", tone: "", text: "AB sent <b>TR-237</b> to Pravin Kolapte", when: "3 days ago", tag: "Tower 26" },
  {
    initials: "RK",
    tone: "avatar-brown",
    text: "RK uploaded <b>Plumbing single line diagram R3</b>",
    when: "4 days ago",
    tag: "Wing 25",
    fileName: "Plumbing_Single_Line_Diagram_R3.dwg"
  },
  {
    initials: "SR",
    tone: "avatar-muted",
    text: "SR closed <b>RFI-211 infra fire layout</b>",
    when: "Last week",
    tag: "Tower 16"
  },
  {
    initials: "NK",
    tone: "avatar-slate",
    text: "NK scheduled <b>MEP Coordination Review</b>",
    when: "Last week",
    tag: "MLCP"
  },
  {
    initials: "AB",
    tone: "",
    text: "AB completed <b>Spatial Coordination</b> milestone",
    when: "Last month",
    tag: "All Towers"
  }
];
