/**
 * File: js/data/meetings.js
 * Role: Meeting seed data (until a calendar API is connected).
 * Dependencies: Loaded by index.html as script 22 of 80. Its globals are used by js/components/meeting-card.js, js/core/router.js, js/core/utils.js, js/data/inbox.js, js/features/assistant.js, js/features/meetings/meeting-requests.js and 3 more.
 */

/* MEETINGS SECTION */
// Demo meetings are placed relative to 'now' so there is always a live or upcoming one to show; real data would come from a calendar API
const inMinutes = (min) => new Date(Date.now() + min * 60000);

// Meetings on later days at a fixed local time
const onDay = (dayOffset, hours, minutes) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const meetings = [
  {
    id: "m1",
    start: inMinutes(12),
    end: inMinutes(102),
    title: "Elanor Coordination Meeting",
    type: "online",
    place: "Teams link",
    project: "Riverside Greens",
    attendees: 5,
    status: "join",
    joined: false
  },
  {
    id: "m2",
    start: inMinutes(150),
    end: inMinutes(210),
    title: "MEP Design Review",
    type: "in-person",
    place: "Belle, 36th Floor, OLP",
    project: "Skyline One",
    attendees: 8,
    status: "join",
    joined: false
  },
  {
    id: "m3",
    start: inMinutes(300),
    end: inMinutes(360),
    title: "Fire Strategy Call",
    type: "online",
    place: "Teams link",
    project: "Lakeshore",
    attendees: 12,
    status: "going",
    joined: false
  },
  {
    id: "m4",
    start: onDay(1, 10, 0),
    end: onDay(1, 11, 0),
    title: "HVAC Shop Drawing Review",
    type: "in-person",
    place: "Site office, Tower 26",
    project: "Riverside Greens",
    attendees: 6,
    status: "join",
    joined: false
  },
  {
    id: "m5",
    start: onDay(1, 15, 30),
    end: onDay(1, 16, 15),
    title: "Consultant Weekly Sync",
    type: "online",
    place: "Teams link",
    project: "Amberwood Residences",
    attendees: 9,
    status: "join",
    joined: false
  },
  {
    id: "m6",
    start: onDay(3, 11, 0),
    end: onDay(3, 12, 30),
    title: "Plumbing Riser Coordination",
    type: "in-person",
    place: "Belle, 36th Floor, OLP",
    project: "Skyline One",
    attendees: 7,
    status: "join",
    joined: false
  },
  // Past meetings: the Past tab is where minutes get written after the fact
  {
    id: "m7",
    start: onDay(-1, 16, 0),
    end: onDay(-1, 17, 0),
    title: "Site Progress Review",
    type: "in-person",
    place: "Site office, Tower 26",
    project: "Riverside Greens",
    attendees: 6,
    status: "join",
    joined: false
  },
  {
    id: "m8",
    start: onDay(-2, 11, 0),
    end: onDay(-2, 12, 0),
    title: "Fire Strategy Call",
    type: "online",
    place: "Teams link",
    project: "Lakeshore",
    attendees: 10,
    status: "join",
    joined: false
  },
  {
    id: "m9",
    start: onDay(-5, 10, 30),
    end: onDay(-5, 12, 0),
    title: "MEP Design Review",
    type: "in-person",
    place: "Belle, 36th Floor, OLP",
    project: "Skyline One",
    attendees: 8,
    status: "join",
    joined: false
  },
  {
    id: "m10",
    start: onDay(-7, 15, 0),
    end: onDay(-7, 16, 0),
    title: "Elanor Coordination Meeting",
    type: "online",
    place: "Teams link",
    project: "Riverside Greens",
    attendees: 5,
    status: "join",
    joined: false
  }
];

let meetingSeq = meetings.length;

// Other meetings whose time range overlaps this one (same date and slot); the card offers Request time change only when this is not empty
const findMeetingClashes = (m) => meetings.filter((other) => other.id !== m.id && m.start < other.end && m.end > other.start);
