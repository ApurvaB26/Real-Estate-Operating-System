/**
 * File: js/data/rfis.js
 * Role: Demo RFIs and their grouping for the project RFI page.
 * Dependencies: Loaded by index.html as script 16 of 80. Its globals are used by js/features/assistant.js, js/features/project/rfis.js, js/features/record-drawer.js, js/features/row-actions.js.
 */

// Each group lists which statuses belong to it; a status not listed in any group would not show on screen
const rfiGroups = [
  { key: "pending", label: "Pending", tone: "", statuses: ["in-progress", "delayed"] },
  { key: "completed", label: "Completed", tone: "is-green", statuses: ["completed"] }
];

/* PROJECT RFIs */
// Demo data. Several rows share the id RFI-209, so rows are keyed by their position in this array (data-rfi-index), never by id
const rfiData = [
  {
    id: "RFI-209",
    query: "MCB Rating Clarification",
    blocking: true,
    received: "2h ago",
    files: 2,
    wing: "Wing 25",
    impact: "None",
    discipline: "Electrical",
    by: "Sachin Patil",
    status: "in-progress"
  },
  {
    id: "RFI-210",
    query: "MCB Rating Clarification",
    received: "2h ago",
    files: 2,
    wing: "Wing 25",
    impact: "None",
    discipline: "Electrical",
    by: "Sachin Patil",
    status: "in-progress"
  },
  {
    id: "RFI-211",
    query: "Issue Revised Infra Fire Layout",
    received: "2h ago",
    files: 2,
    wing: "Wing 25",
    impact: "None",
    discipline: "Electrical",
    by: "Sachin Patil",
    status: "delayed"
  },
  {
    id: "RFI-212",
    query: "MCB Rating Clarification",
    blocking: true,
    received: "2h ago",
    files: 2,
    wing: "Wing 25",
    impact: "None",
    discipline: "Electrical",
    by: "Sachin Patil",
    status: "in-progress"
  },
  {
    id: "RFI-213",
    query: "MCB Rating Clarification",
    blocking: true,
    received: "2h ago",
    files: 2,
    wing: "Wing 25",
    impact: "None",
    discipline: "Electrical",
    by: "Sachin Patil",
    status: "in-progress"
  },
  {
    id: "RFI-214",
    query: "Issue Revise Infra Fire Layout",
    wing: "Tower B",
    impact: "Cost",
    discipline: "Firefighting",
    by: "Rohit Patil",
    status: "completed"
  }
];
