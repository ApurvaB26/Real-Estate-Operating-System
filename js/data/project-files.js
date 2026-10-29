/**
 * File: js/data/project-files.js
 * Role: Demo project files and department list for the Files page.
 * Dependencies: Loaded by index.html as script 14 of 80. Its globals are used by js/features/document-viewer.js, js/features/project/files-fresh.js, js/features/project/files.js, js/features/project/overview-feed.js, js/features/project/workspace.js, js/features/record-drawer.js.
 */

// MEP Design is the user's own department, so its files sit in front; the rest are in folders
const fileDepartments = [
  { key: "MEP Design", full: "MEP Design" },
  { key: "Architectural", full: "Architecture & interiors" },
  { key: "Structural", full: "Structural design" },
  { key: "DCO", full: "Design Cost Optimisation" },
  { key: "Site Team", full: "Construction Management" }
];

const projectFiles = [
  {
    name: "Structural_L4_Slab_Reinforcement_v2.pdf",
    stage: "VFC",
    department: "Structural",
    location: "Structure · Wing 26 · L4",
    size: "14.2 MB",
    by: "Apurva B.",
    when: "Just Now"
  },
  {
    name: "HVAC_Equipment_Schedule_Datasheet_Chillers.xls",
    stage: "DD",
    department: "MEP Design",
    location: "HVAC · Wing 26 · L4",
    size: "14.2 MB",
    by: "Apurva B.",
    when: "2 hrs ago"
  },
  {
    name: "Fire_Strategy_NOC_Approval_Letter.pdf",
    stage: "DD",
    department: "Site Team",
    location: "Site Team · Wing 12",
    size: "2.1 MB",
    by: "Sanjay Rao",
    when: "1 day ago"
  },
  {
    name: "Plumbing_Single_Line_Diagram_R3.dwg",
    stage: "Tender",
    department: "MEP Design",
    location: "JV Consultant · Wing 25",
    size: "28.5 MB",
    by: "Rajesh K.",
    when: "2 hrs ago"
  },
  {
    name: "Electrical_Lighting_Layout_RevC.pdf",
    stage: "GFC",
    department: "MEP Design",
    location: "Electrical · Tower 26",
    size: "6.8 MB",
    by: "Sachin Patil",
    when: "2 hrs ago"
  },
  {
    name: "Drainage_Calculations_Tower16.xlsx",
    stage: "DD",
    department: "MEP Design",
    location: "Plumbing · Tower 16",
    size: "1.4 MB",
    by: "Neha Kapoor",
    when: "Yesterday"
  },
  {
    name: "Fire_Pump_Room_Layout.dwg",
    stage: "VFC",
    department: "MEP Design",
    location: "Fire · UGT 2",
    size: "19.3 MB",
    by: "Rohit Patil",
    when: "Yesterday"
  },
  {
    name: "UGT2_Site_Photos.zip",
    stage: "WIP",
    department: "Site Team",
    location: "Site Team · UGT 2",
    size: "48.0 MB",
    by: "Rohit Patil",
    when: "3 days ago"
  },
  {
    name: "Typical_Floor_Plan_Tower26_R4.dwg",
    stage: "GFC",
    department: "Architectural",
    location: "Architecture · Tower 26",
    size: "22.6 MB",
    by: "Ananya Rao",
    when: "2 days ago"
  },
  {
    name: "Facade_Elevations_East_R2.pdf",
    stage: "DD",
    department: "Architectural",
    location: "Facade · Tower 26",
    size: "9.4 MB",
    by: "Vikram Sethi",
    when: "4 days ago"
  },
  {
    name: "MEP_Cost_Plan_v3.xlsx",
    stage: "WIP",
    department: "DCO",
    location: "DCO · All Towers",
    size: "0.8 MB",
    by: "Kavita Nair",
    when: "Yesterday"
  },
  {
    name: "HVAC_Value_Engineering_Report.pdf",
    stage: "DD",
    department: "DCO",
    location: "DCO · MLCP",
    size: "3.2 MB",
    by: "Arjun Mehta",
    when: "Last week"
  }
];
