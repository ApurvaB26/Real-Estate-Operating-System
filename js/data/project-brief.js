/**
 * File: js/data/project-brief.js
 * Role: Demo project brief and services for the Project Overview.
 * Dependencies: Loaded by index.html as script 13 of 80. Its globals are used by js/features/project/brief.js.
 */

const projectBrief = {
  typology: "Residential development",
  buildings: [
    {
      name: "Tower 16",
      floors: "G+34",
      plumbing: "UG tank 250 KL",
      fire: "Wet riser, sprinklers",
      electrical: "2 × 1600 kVA",
      hvac: "VRF"
    },
    {
      name: "Tower 26",
      floors: "G+38",
      plumbing: "UG tank 300 KL",
      fire: "Wet riser, sprinklers",
      electrical: "2 × 2000 kVA",
      hvac: "VRF"
    },
    {
      name: "MLCP",
      floors: "B2+G+7",
      plumbing: "Storm water pumps",
      fire: "Sprinklers, hydrants",
      electrical: "1 × 1250 kVA",
      hvac: "Jet fan ventilation"
    },
    {
      name: "UGT 2",
      floors: "B2",
      plumbing: "UG tank 150 KL",
      fire: "Fire pump room",
      electrical: "1 × 630 kVA",
      hvac: "Mechanical ventilation"
    }
  ]
};

const briefServices = [
  ["plumbing", "Plumbing"],
  ["fire", "Fire fighting"],
  ["electrical", "Electrical"],
  ["hvac", "HVAC"]
];
