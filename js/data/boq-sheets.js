/**
 * File: js/data/boq-sheets.js
 * Role: Demo BOQ sheets for Library > BOQs.
 * Dependencies: Loaded by index.html as script 6 of 80. Its globals are used by js/features/document-viewer.js, js/features/library/boqs.js.
 */

/* BOQs (Library tab): view the bill of quantities like the spreadsheet, and download it as Excel */
const boqSheets = {
  "BOQ-PH-05": [
    {
      bill: "Bill No.1 - Drainage Installations",
      notes: [
        "Include for the supply, complete installation, Testing & Commissioning as detailed in the specifications, Drawings and as per approved make list to the complete satisfaction and approval of the Engineer and all concerned Statutory Authorities and under the following sections.",
        "Pipe work of waste, soil, condensate, vent, rainwater etc. including fittings, bends, elbows, rodding eyes/cleanout, end caps, supports, accessories etc. complete. All drainage outlet in toilet/utility/kitchen/deck area, drainage pipe shall be extended by 200mm from finished level."
      ],
      items: [
        {
          no: "1",
          desc: "Waste Pipes Inside the Toilet of UPVC SWR Type-B solvent joint as per IS 13592 for pipes 75 mm and above, UPVC Class-3/4/5 as per IS 4985 for pipes Below 75 mm",
          unit: "",
          qty: ""
        },
        {
          no: "2",
          desc: "Soil pipe of Low noise UPVC SWR solvent joint type for inside toilet - Underslung (2-4 LPS@20-26 dB respectively) as per standard EN1329, density (g/cm3): 1.3 to 1.9.\n110 mm dia Soil pipe (WC up-to vertical riser only)",
          unit: "RMT",
          qty: ""
        },
        {
          no: "3",
          desc: "Soil pipe of UPVC SWR Type-B IS 13592 solvent joint for inside sunken toilet\n110 mm dia Soil pipe (WC up-to vertical riser)",
          unit: "RMT",
          qty: ""
        },
        {
          no: "5.1",
          desc: "Soil, Waste, Rain water, Condensate drain down take pipe inside shaft of UPVC Class 3 solvent joint in accordance to IS4985",
          unit: "RMT",
          qty: ""
        },
        {
          no: "6.1",
          desc: "C.I. hubless pipe for Soil, waste, rain water pipes in accordance to IS:1536 for last one floor and Suspended ceiling diversion",
          unit: "RMT",
          qty: ""
        },
        {
          no: "7.1",
          desc: "HDPE PE100 PN 10 pipe for Soil, waste, rain water pipes in accordance to IS:14333 for last one floor and Suspended ceiling diversion",
          unit: "RMT",
          qty: ""
        },
        { no: "8.1", desc: "HDPE PN10 coupler", unit: "NOS", qty: "" }
      ]
    }
  ],
  "BOQ-HV-03": [
    {
      bill: "Bill No.1 - VRF System (Typical Residential Floor)",
      notes: [
        "Supply, installation, testing and commissioning of the VRF system complete with controls, as per specifications, drawings and the approved make list."
      ],
      items: [
        { no: "1", desc: "VRF outdoor unit, heat pump, 16 HP", unit: "NOS", qty: "4" },
        { no: "2", desc: "Ceiling cassette indoor unit, 1.5 TR", unit: "NOS", qty: "24" },
        { no: "3", desc: "Ductable indoor unit, 3 TR, with plenum and grilles", unit: "NOS", qty: "6" },
        {
          no: "4",
          desc: "Refrigerant copper piping with nitrile rubber insulation, all sizes",
          unit: "RMT",
          qty: "860"
        },
        { no: "5", desc: "Condensate drain piping, uPVC 25 mm, with insulation", unit: "RMT", qty: "420" },
        { no: "6", desc: "Wired remote controller", unit: "NOS", qty: "30" }
      ]
    }
  ],
  "BOQ-FF-02": [
    {
      bill: "Bill No.1 - Sprinkler & Hydrant System",
      notes: [
        "Supply, installation, testing and commissioning of the sprinkler and hydrant systems complete with supports, as per specifications and NBC requirements."
      ],
      items: [
        { no: "1", desc: "Pendant sprinkler, 68°C, K-80, quick response", unit: "NOS", qty: "1240" },
        { no: "2", desc: "MS ERW heavy class pipe, 25 mm to 150 mm, with fittings", unit: "RMT", qty: "3200" },
        { no: "3", desc: "Landing valve, SS internals, with instantaneous outlet", unit: "NOS", qty: "48" },
        { no: "4", desc: "First-aid hose reel drum with 30 m hose", unit: "NOS", qty: "48" },
        { no: "5", desc: "Fire brigade inlet, 4-way", unit: "NOS", qty: "2" }
      ]
    }
  ],
  "BOQ-EL-04": [
    {
      bill: "Bill No.1 - LT Panels",
      notes: [
        "Supply, installation, testing and commissioning of type-tested LT panels as per single line diagram and approved make list."
      ],
      items: [
        { no: "1", desc: "Main LT panel, 2500 A, Form 4b, with ACBs and metering", unit: "NOS", qty: "1" },
        { no: "2", desc: "Sub-distribution boards, floor-wise", unit: "NOS", qty: "12" }
      ]
    },
    {
      bill: "Bill No.2 - Cabling",
      notes: ["Laying, testing and termination of LT cables on cable trays, including glands and lugs."],
      items: [
        { no: "1", desc: "LT XLPE armoured cable, 3.5C x 300 sqmm, AL", unit: "RMT", qty: "640" },
        { no: "2", desc: "LT XLPE armoured cable, 4C x 16 sqmm, CU", unit: "RMT", qty: "2100" },
        { no: "3", desc: "Perforated cable tray, 300 mm, with supports", unit: "RMT", qty: "900" }
      ]
    }
  ]
};
