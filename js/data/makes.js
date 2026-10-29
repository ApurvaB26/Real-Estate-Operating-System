/**
 * File: js/data/makes.js
 * Role: Demo approved makes grouped by discipline for Library > Approved Makes.
 * Dependencies: Loaded by index.html as script 10 of 80. Its globals are used by js/features/library/makes.js.
 */

const makesGroups = [
  {
    key: "electrical",
    label: "Electrical",
    items: [
      {
        type: "APFC Panel",
        makes: ["Schneider", "ABB", "L&T", "Epcos"],
        preferred: "Schneider",
        code: "IS 26852",
        notes: "Automatic, thyristor switched",
        updated: "2026-07-15"
      },
      {
        type: "Battery",
        makes: ["Exide", "Amara Raja", "Luminos"],
        preferred: "Exide",
        code: "",
        notes: "SMF/VRLA",
        updated: "2026-07-10"
      },
      {
        type: "Bus Duct",
        makes: ["C&S", "Schneider", "ABB"],
        preferred: "C&S",
        code: "",
        notes: "Sandwich type, AL conductor",
        updated: "2026-07-08"
      },
      {
        type: "Cables (LT)",
        makes: ["Polycab", "Finolex", "Havells"],
        preferred: "Polycab",
        code: "IS 7098",
        notes: "AL/CU XLPE FRLS armoured",
        updated: "2026-07-02"
      },
      {
        type: "DG Set",
        makes: ["Cummins", "Kirloskar", "Caterpillar"],
        preferred: "Cummins",
        code: "IS 4772",
        notes: "1500RPM, AMF panel, acoustic enclosure",
        updated: "2026-06-28"
      },
      {
        type: "LT Panel",
        makes: ["Schneider", "Siemens", "L&T"],
        preferred: "Schneider",
        code: "IS/IEC 61439",
        notes: "Type-tested, Form 4b",
        updated: "2026-06-24"
      },
      {
        type: "Light Fixtures",
        makes: ["Philips", "Wipro", "Havells"],
        preferred: "Philips",
        code: "IS 10322",
        notes: "LED, 4000K in common areas",
        updated: "2026-06-18"
      }
    ]
  },
  {
    key: "plumbing",
    label: "Plumbing",
    items: [
      {
        type: "Pipes (CPVC)",
        makes: ["Ashirvad", "Supreme", "Prince"],
        preferred: "Ashirvad",
        code: "IS 15778",
        notes: "SDR 11, hot & cold water",
        updated: "2026-07-15"
      },
      {
        type: "Pipes (uPVC SWR)",
        makes: ["Supreme", "Finolex", "Prince"],
        preferred: "Supreme",
        code: "IS 13592",
        notes: "Type B, ring-fit joints",
        updated: "2026-07-05"
      },
      {
        type: "Booster Pumps",
        makes: ["Grundfos", "Wilo", "KSB"],
        preferred: "Grundfos",
        code: "",
        notes: "VFD hydropneumatic system",
        updated: "2026-06-30"
      },
      {
        type: "Sanitaryware",
        makes: ["Kohler", "Jaquar", "Roca"],
        preferred: "Kohler",
        code: "IS 2556",
        notes: "Wall-hung WCs",
        updated: "2026-06-21"
      },
      {
        type: "CP Fittings",
        makes: ["Grohe", "Jaquar", "Kohler"],
        preferred: "Grohe",
        code: "IS 8931",
        notes: "Chrome finish, aerated outlets",
        updated: "2026-06-21"
      }
    ]
  },
  {
    key: "firefighting",
    label: "Firefighting",
    items: [
      {
        type: "Sprinklers",
        makes: ["Tyco", "Viking", "HD Fire"],
        preferred: "Tyco",
        code: "IS 15105",
        notes: "UL/FM listed, 68°C bulb",
        updated: "2026-07-12"
      },
      {
        type: "Fire Pumps",
        makes: ["Kirloskar", "Grundfos", "Mather+Platt"],
        preferred: "Kirloskar",
        code: "IS 12469",
        notes: "Main, diesel standby and jockey sets",
        updated: "2026-07-01"
      },
      {
        type: "Fire Alarm Panel",
        makes: ["Notifier", "Siemens", "Bosch"],
        preferred: "Notifier",
        code: "IS 2189",
        notes: "Addressable, networkable",
        updated: "2026-06-26"
      },
      {
        type: "Hydrant Valves",
        makes: ["Newage", "HD Fire", "Minimax"],
        preferred: "Newage",
        code: "IS 5290",
        notes: "Landing valve, SS internals",
        updated: "2026-06-20"
      },
      {
        type: "GI Pipes",
        makes: ["Tata", "Jindal", "Apollo"],
        preferred: "Tata",
        code: "IS 1239",
        notes: "Heavy class, ERW",
        updated: "2026-06-12"
      }
    ]
  },
  {
    key: "hvac",
    label: "HVAC",
    items: [
      {
        type: "Chillers",
        makes: ["Carrier", "Daikin", "Trane"],
        preferred: "Carrier",
        code: "",
        notes: "Water-cooled screw",
        updated: "2026-07-14"
      },
      {
        type: "VRF Systems",
        makes: ["Daikin", "Mitsubishi", "Hitachi"],
        preferred: "Daikin",
        code: "",
        notes: "Heat pump, inverter outdoor units",
        updated: "2026-07-09"
      },
      {
        type: "AHU",
        makes: ["Zeco", "Edgetech", "Blue Star"],
        preferred: "Zeco",
        code: "",
        notes: "Double-skin, 50 mm PUF panels",
        updated: "2026-06-29"
      },
      {
        type: "GI Ducting",
        makes: ["Tata", "JSW"],
        preferred: "Tata",
        code: "IS 277",
        notes: "Factory-fabricated, Pittsburgh lock",
        updated: "2026-06-22"
      },
      {
        type: "Jet Fans",
        makes: ["Systemair", "Kruger", "Nicotra"],
        preferred: "Systemair",
        code: "",
        notes: "Reversible, 300°C / 2 h rated",
        updated: "2026-06-15"
      }
    ]
  }
];
