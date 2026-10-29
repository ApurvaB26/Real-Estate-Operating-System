/**
 * File: js/data/drawing-folders.js
 * Role: Demo discipline folders and drawing files for Library > Standard Drawings.
 * Dependencies: Loaded by index.html as script 7 of 80. Its globals are used by js/features/library/drawings.js.
 */

const drawingFolders = [
  {
    key: "pumps",
    name: "PUMPS",
    category: "phe",
    prefix: "PM",
    files: [
      ["Centrifugal pump base plate details", "dwg", "2.4 MB", 12],
      ["Typical sump pit with submersible pumps", "pdf", "1.8 MB", 21],
      ["Booster pump set arrangement", "dwg", "3.1 MB", 35],
      ["Pump room piping and valve layout", "dwg", "4.0 MB", 58]
    ]
  },
  {
    key: "plumbing",
    name: "PLUMBING",
    category: "phe",
    prefix: "PH",
    files: [
      ["Typical riser diagram plumbing", "dwg", "2.9 MB", 9],
      ["Toilet plumbing details", "dwg", "2.2 MB", 22],
      ["Underground drainage and manhole details", "pdf", "1.6 MB", 40],
      ["Overhead water tank connections", "dwg", "2.7 MB", 66]
    ]
  },
  {
    key: "infra",
    name: "INFRA",
    category: "general",
    prefix: "IN",
    files: [
      ["Typical road crossing and utility trench", "dwg", "3.3 MB", 18],
      ["Rainwater harvesting pit details", "pdf", "1.2 MB", 47],
      ["STP and UGT plant room layout", "dwg", "5.2 MB", 73]
    ]
  },
  {
    key: "hvac",
    name: "HVAC",
    category: "hvac",
    prefix: "HV",
    files: [
      ["HVAC duct support details", "dwg", "2.1 MB", 7],
      ["Typical AHU room arrangement", "dwg", "3.6 MB", 30],
      ["VRF refrigerant piping schematic", "pdf", "1.9 MB", 52],
      ["Chilled water plant room layout", "dwg", "4.8 MB", 84],
      ["Smoke extract shaft details", "pdf", "1.4 MB", 96]
    ]
  },
  {
    key: "firefighting",
    name: "FIREFIGHTING",
    category: "fire",
    prefix: "FF",
    files: [
      ["Fire pump room layout", "dwg", "3.8 MB", 11],
      ["Typical sprinkler layout per floor", "dwg", "4.4 MB", 29],
      ["Wet riser and landing valve details", "pdf", "1.7 MB", 45],
      ["Fire alarm riser diagram", "pdf", "1.3 MB", 68]
    ]
  },
  {
    key: "ev",
    name: "EV Charging",
    category: "electrical",
    prefix: "EV",
    files: [
      ["EV charger bay and DB layout", "pdf", "2.0 MB", 6],
      ["EV charging cable tray and conduit routing", "dwg", "2.8 MB", 24],
      ["EV charger foundation and bollard details", "dwg", "1.5 MB", 51]
    ]
  },
  {
    key: "electrical",
    name: "ELECTRICAL",
    category: "electrical",
    prefix: "EL",
    files: [
      ["Typical DB schedule and earthing details", "pdf", "1.9 MB", 10],
      ["Typical flat electrical layout, 2 BHK", "dwg", "3.5 MB", 20],
      ["LT panel room layout", "dwg", "4.1 MB", 38],
      ["Bus duct riser arrangement", "dwg", "2.6 MB", 62],
      ["Lightning protection and earth pit details", "pdf", "1.8 MB", 88]
    ]
  }
];
