/**
 * File: js/data/team.js
 * Role: Demo team groups and members shared by the Team page, People directory and chat.
 * Dependencies: Loaded by index.html as script 18 of 80. Uses globals from js/utils/dom-helpers.js. Its globals are used by js/components/action-dialog.js, js/features/meetings/meeting-requests.js, js/features/people-directory.js, js/features/project/team.js, js/features/project/workspace.js, js/features/record-drawer.js.
 */

/* PROJECT TEAM: your MEP team up front, other teams in folders that open in place */
// Consultants also carry consultantType (MEP or Architect); the Directory shows it with their consultancy (org) under their name
// Order matters: MEP Design is shown as open cards, every other group is a collapsible folder
const teamGroups = [
  { key: "mep", label: "MEP Design", full: "MEP Design Team" },
  { key: "architectural", label: "Architectural", full: "Architecture & interiors" },
  { key: "dco", label: "DCO", full: "Design Cost Optimisation" },
  { key: "site", label: "Site Team", full: "Construction Management" },
  { key: "consultants", label: "Consultants", full: "External MEP consultants" }
];

const teamMembers = [
  { name: "Apurva Bhadange", role: "MEP Engineer", org: "Halden", discipline: "MEP", group: "mep", tasks: 6 },
  { name: "Riya Shah", role: "MEP Designer", org: "Halden", discipline: "Plumbing", group: "mep", tasks: 7 },
  {
    name: "Fatima Khan",
    role: "Electrical Design Engineer",
    org: "Halden",
    discipline: "Electrical",
    group: "mep",
    tasks: 3
  },
  { name: "Neha Kapoor", role: "HVAC Design Engineer", org: "Halden", discipline: "HVAC", group: "mep", tasks: 4 },
  {
    name: "Ananya Rao",
    role: "Lead Architect",
    org: "Halden",
    discipline: "Architecture",
    group: "architectural",
    tasks: 5
  },
  {
    name: "Vikram Sethi",
    role: "Facade Architect",
    org: "Halden",
    discipline: "Architecture",
    group: "architectural",
    tasks: 2
  },
  {
    name: "Priya Shah",
    role: "Design Program Manager",
    org: "Halden",
    discipline: "Coordinated",
    group: "architectural",
    tasks: 4
  },
  { name: "Arjun Mehta", role: "DCO Lead", org: "Halden", discipline: "Cost", group: "dco", tasks: 2 },
  { name: "Kavita Nair", role: "Cost Analyst", org: "Halden", discipline: "Cost", group: "dco", tasks: 3 },
  { name: "Sachin Patil", role: "Project Manager", org: "Halden", discipline: "Construction", group: "site", tasks: 9 },
  { name: "Rohit Patil", role: "Site Engineer", org: "Halden", discipline: "Fire", group: "site", tasks: 5 },
  { name: "Imran Shaikh", role: "MEP Site Engineer", org: "Halden", discipline: "Electrical", group: "site", tasks: 4 },
  {
    name: "Sanjay Rao",
    role: "Fire Consultant",
    org: "Verdant Systems",
    discipline: "Fire",
    group: "consultants",
    consultantType: "MEP",
    tasks: 4
  },
  {
    name: "Rajesh K.",
    role: "Plumbing Consultant",
    org: "Verdant Systems",
    discipline: "Plumbing",
    group: "consultants",
    consultantType: "MEP",
    tasks: 2
  },
  {
    name: "Meera Joshi",
    role: "HVAC Consultant",
    org: "Verdant Systems",
    discipline: "HVAC",
    group: "consultants",
    consultantType: "MEP",
    tasks: 3
  },
  {
    name: "Karan Desai",
    role: "Electrical Consultant",
    org: "Verdant Systems",
    discipline: "Electrical",
    group: "consultants",
    consultantType: "MEP",
    tasks: 1
  }
];
