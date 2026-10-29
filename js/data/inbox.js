/**
 * File: js/data/inbox.js
 * Role: Demo unread emails and notifications for the top-bar mail and bell menus.
 * Dependencies: Loaded by index.html as script 9 of 80. Uses globals from js/data/meetings.js. Its globals are used by js/features/profile.js, js/features/project/transmittals.js, js/layout/topbar.js.
 */

// Demo data until a mail integration exists; text is trusted so it is not escaped
const unreadEmails = [
  {
    name: "Arjun Mehta",
    time: "8 min ago",
    subject: "Need decision on facade bracket detail",
    preview: "We are holding the package until this detail is confirmed by the facade consultant.",
    project: "Riverside HQ"
  },
  {
    name: "Priya Nair",
    time: "32 min ago",
    subject: "Approval required: MEP routing report",
    preview: "Could you review the two highlighted clashes before the coordination call tomorrow?",
    project: "Northline Campus"
  },
  {
    name: "Maya Chen",
    time: "1 hr ago",
    subject: "Authority response has arrived",
    preview: "The fire strategy comments are now in the shared folder for your review.",
    project: "Harbour Point"
  },
  {
    name: "Klara Singh",
    time: "2 hr ago",
    subject: "Door hardware schedule — your input needed",
    preview: "The access control team has updated their requirements for the main lobby doors.",
    project: "Northline Campus"
  }
];

const notifications = [
  {
    id: "n1",
    who: "Sachin Patil",
    time: "5 min ago",
    title: "RFI-209 is now blocking",
    body: "MCB rating clarification is holding the Wing 25 electrical package.",
    project: "Riverside Greens",
    route: "project/rfis",
    unread: true
  },
  {
    id: "n2",
    who: "Sanjay Rao",
    time: "40 min ago",
    title: "Uploaded Fire_Strategy_NOC_Approval_Letter.pdf",
    body: "The fire NOC approval letter is in the project files.",
    project: "Riverside Greens",
    route: "project/files",
    unread: true
  },
  {
    id: "n3",
    who: "Priya Shah",
    time: "2 hr ago",
    title: "Assigned you T-13",
    body: "Approved Revised Typical Floor1 is due today.",
    project: "Skyline One",
    route: "open-items/tasks",
    unread: true
  },
  {
    id: "n4",
    who: "Neha Kapoor",
    time: "Yesterday",
    title: "MEP Design Review rescheduled",
    body: "The new time is on your schedule.",
    project: "Skyline One",
    route: "meetings",
    unread: false
  },
  {
    id: "n5",
    who: "Rohit Patil",
    time: "Yesterday",
    title: "Closed RFI-211",
    body: "Issue Revise Infra Fire Layout was answered and closed.",
    project: "Lakeshore",
    route: "open-items/rfis",
    unread: false
  }
];
