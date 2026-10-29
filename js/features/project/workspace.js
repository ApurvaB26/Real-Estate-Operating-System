/**
 * File: js/features/project/workspace.js
 * Role: Project workspace: section tabs, project tasks, and the header menu actions.
 * Dependencies: Loaded by index.html as script 34 of 80. Uses globals from js/components/action-dialog.js, js/components/layers.js, js/core/router.js, js/core/utils.js, js/data/meetings.js, js/data/project-files.js and 11 more. Its globals are used by js/core/router.js, js/features/dashboard-attention.js, js/features/document-viewer.js, js/features/meetings/meeting-requests.js, js/features/project/model-viewer.js, js/features/projects.js and 4 more.
 */

const projectHeader = overviewPage.querySelector(".project-header");

const projectHeaderCard = overviewPage.querySelector(".project-header-card");

const projectOverviewContent = document.getElementById("project-overview-content");

const projectTasksView = document.getElementById("project-tasks-view");

const projectRfisView = document.getElementById("project-rfis-view");

const projectTaskList = document.getElementById("project-task-list");

const projectTaskSearch = document.getElementById("project-task-search");

const projectTaskStatusFilter = document.getElementById("project-task-status-filter");

let projectTaskPriorityFilter = "all";

const projectSubViews = {
  tasks: projectTasksView,
  rfis: projectRfisView,
  transmittals: document.getElementById("project-transmittals-view"),
  deliverables: document.getElementById("project-deliverables-view"),
  files: document.getElementById("project-files-view"),
  team: document.getElementById("project-team-view"),
  milestones: document.getElementById("project-milestones-view"),
  activity: document.getElementById("project-activity-view")
};

const projectViewLabels = {
  tasks: "Tasks",
  rfis: "RFIs",
  deliverables: "Deliverables",
  transmittals: "Transmittals",
  files: "Files",
  team: "Team",
  milestones: "Milestones",
  activity: "Activity"
};

// One function shows exactly one of: the overview or a single sub-view (tasks, RFIs, files…). Unknown names fall back to overview
function setProjectView(viewName) {
  if (viewName !== "overview" && !projectSubViews[viewName]) viewName = "overview";
  const showOverview = viewName === "overview";
  projectHeader.hidden = !showOverview;
  projectHeaderCard.hidden = !showOverview;
  projectOverviewContent.hidden = !showOverview;
  Object.entries(projectSubViews).forEach(([key, view]) => {
    view.hidden = key !== viewName;
  });

  // They are reached from 'View All' links on the overview
  // Milestones and Activity have no tab of their own, so Overview stays highlighted
  const activeTab = viewName === "milestones" || viewName === "activity" ? "overview" : viewName;
  document.querySelectorAll("[data-project-view]").forEach((tab) => {
    const isActive = tab.dataset.projectView === activeTab;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  const name = overviewPage.querySelector(".project-title").textContent;
  const tabLabel = projectViewLabels[viewName];
  renderBreadcrumb(
    tabLabel
      ? [{ label: "Projects", view: "projects" }, { label: name, route: "project/overview" }, { label: tabLabel }]
      : [{ label: "Projects", view: "projects" }, { label: name }]
  );
  syncHash(`project/${viewName}`);
  document.querySelector(".main-content").scrollTop = 0;
}

function taskMatchesProjectFilters(row) {
  const query = projectTaskSearch.value.trim().toLocaleLowerCase();
  const priorityMatches = projectTaskPriorityFilter === "all" || row.dataset.priority === projectTaskPriorityFilter;
  const statusMatches = projectTaskStatusFilter.value === "all" || row.dataset.group === projectTaskStatusFilter.value;
  return priorityMatches && statusMatches && row.textContent.toLocaleLowerCase().includes(query);
}

// A row shows only if it matches the filters AND its group is expanded; a group header hides itself when none of its rows match
function filterProjectTasks() {
  const matchingGroups = new Set();

  projectTaskList.querySelectorAll("[data-task-row]").forEach((row) => {
    const matches = taskMatchesProjectFilters(row);
    const groupHeader = projectTaskList.querySelector(`[data-group-header="${row.dataset.group}"]`);
    const groupExpanded = groupHeader.querySelector(".task-group-toggle").getAttribute("aria-expanded") === "true";
    row.hidden = !matches || !groupExpanded;
    if (matches) matchingGroups.add(row.dataset.group);
  });

  projectTaskList.querySelectorAll("[data-group-header]").forEach((header) => {
    const group = header.dataset.groupHeader;
    const matchingCount = Array.from(projectTaskList.querySelectorAll(`[data-task-row][data-group="${group}"]`)).filter(
      taskMatchesProjectFilters
    ).length;
    header.hidden = matchingCount === 0;
    header.querySelector("[data-task-group-count]").textContent = String(matchingCount).padStart(2, "0");
  });
}

function updateProjectTaskCounts() {
  projectTaskList.querySelectorAll("[data-group-header]").forEach((header) => {
    const group = header.dataset.groupHeader;
    const count = projectTaskList.querySelectorAll(`[data-task-row][data-group="${group}"]`).length;
    header.querySelector("[data-task-group-count]").textContent = String(count).padStart(2, "0");
  });
}

// Four board groups from the six statuses: On Hold stays under In Progress, everything else unstarted is To do
function getProjectTaskGroup(status) {
  if (status === "Completed") return "completed";
  if (status === "In Review") return "in-review";
  if (status === "In Progress" || status === "On Hold") return "in-progress";
  return "todo";
}

// The row is built with textContent (not template strings) so a task title containing HTML cannot inject markup
function addProjectTask(data) {
  const nextId =
    Math.max(
      17,
      ...Array.from(projectTaskList.querySelectorAll("[data-task-row]"), (row) => {
        const id = Number(row.cells[1].textContent.replace(/\D/g, ""));
        // Rows without a numeric id count as 0, so the next id is never NaN
        return Number.isFinite(id) ? id : 0;
      })
    ) + 1;
  const priority = data.priority.toLocaleLowerCase();
  const row = document.createElement("tr");
  row.className = "project-task-row";
  row.dataset.taskRow = "";
  row.dataset.group = "todo";
  row.dataset.taskStatus = "Not Started";
  row.dataset.priority = priority;
  row.dataset.targetDate = data.targetDate;
  row.dataset.description = data.description;
  row.innerHTML = `
    <td><label class="custom-checkbox"><input class="task-checkbox" type="checkbox"><span class="checkbox-box"></span></label></td>
    <td></td><td><strong></strong><span class="row-subtitle"></span></td>
    <td><span class="badge"></span></td><td><span class="status due-date"></span></td>
    <td>Wing 25</td><td></td><td><button class="comment-btn project-task-action" type="button" data-open-task-details>Comment</button></td>
  `;
  row.cells[1].textContent = `T-${nextId}`;
  row.querySelector("td:nth-child(3) strong").textContent = data.title;
  row.querySelector(".row-subtitle").textContent = data.discipline;
  row.querySelector(".badge").classList.add(priority);
  row.querySelector(".badge").textContent = data.priority;
  row.cells[6].textContent = data.assignee;
  row.querySelector(".task-checkbox").setAttribute("aria-label", `Complete ${data.title}`);
  if (data.targetDate) updateTaskDueLabel(row, data.targetDate);
  // New tasks start in To do, at the top of that group
  projectTaskList.querySelector('[data-group-header="todo"]').after(row);
  updateProjectTaskCounts();
  filterProjectTasks();
}

document.querySelectorAll("[data-project-view]").forEach((tab) => {
  tab.addEventListener("click", () => setProjectView(tab.dataset.projectView));
});

document.querySelectorAll("[data-priority-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    projectTaskPriorityFilter = button.dataset.priorityFilter;
    document.querySelectorAll("[data-priority-filter]").forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle("is-active", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });
    filterProjectTasks();
  });
});

projectTaskSearch.addEventListener("input", filterProjectTasks);

projectTaskStatusFilter.addEventListener("change", filterProjectTasks);

document.querySelector(".task-advanced-filter-button").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const isExpanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!isExpanded));
  document.getElementById("task-advanced-filters").hidden = isExpanded;
});

projectTaskList.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-toggle-task-group]");
  if (!toggle) return;
  const isExpanded = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!isExpanded));
  filterProjectTasks();
});

projectTaskList.querySelectorAll(".task-checkbox").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const row = checkbox.closest("[data-task-row]");
    if (!row) return;
    row.dataset.taskStatus = checkbox.checked ? "Completed" : "In Progress";
    const oldGroup = row.dataset.group;
    row.dataset.group = getProjectTaskGroup(row.dataset.taskStatus);
    row.classList.toggle("done", checkbox.checked);
    const groupHeader = projectTaskList.querySelector(`[data-group-header="${row.dataset.group}"]`);
    // Ticking a task moves it under its new group's header, because groups are just ordered table rows
    groupHeader.after(row);
    updateProjectTaskCounts();
    filterProjectTasks();
    if (oldGroup !== row.dataset.group) addTaskActivity(row, `Status changed to ${row.dataset.taskStatus}`);
  });
});

projectTaskList.addEventListener("click", (event) => {
  const action = event.target.closest("[data-open-task-details]");
  if (!action || action.dataset.rowAction === "remind") return;
  const row = action.closest("[data-task-row]");
  if (row) {
    // Reuse the row's own click handler (opens the task drawer) instead of duplicating it, then focus the comment box
    row.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.getElementById("drawer-comment-input").focus();
  }
});

function openProject(name, tab = "overview") {
  showPage("overview");
  overviewPage.querySelector(".project-title").textContent = name;
  setProjectView(tab);
}

/* PROJECT MENU ACTIONS: Add Deliverable / Create Transmittal / Add Member / Schedule Meeting */
const disciplineOptions = ["Electrical", "Plumbing", "HVAC", "Fire", "Coordinated", "General"];

const consultantOptions = ["Verdant Systems", "Axis Structural", "Studio North", "TerraScope", "CivicLine Advisory"];

// Dropdown choices = the standard list plus any values an import added, so imported towers/departments are selectable too
const uniqueOptions = (defaults, key) =>
  [...new Set([...defaults, ...deliverableTracker.map((item) => item[key])])].filter(
    (value) => value && value !== "Unassigned"
  );

// Same dialog entry point for two places: from the dashboard it adds a simple row, from a project it adds a full tracker item (tower, floor, stage…)
function openAddDeliverableDialog(target) {
  if (target === "dashboard") {
    openActionDialog({
      title: "Add Deliverable",
      subtitle: "Adds to Project Deliverables on your dashboard",
      fields: [
        { name: "title", label: "Document name", required: true, placeholder: "e.g. Issue Revised Plumbing GFC" },
        {
          type: "row",
          fields: [
            {
              name: "project",
              label: "Project",
              type: "select",
              options: ["Skyline One • Tower B", "Amberwood Residences • Wing 25", "Lakeshore • Phase 2", "Riverside Greens • Tower 26"]
            },
            { name: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"], value: "Medium" }
          ]
        },
        { name: "due", label: "Due date", type: "date", required: true, value: daysFromNow(7) }
      ],
      submitLabel: "Add Deliverable",
      onSubmit(values) {
        addDashboardDeliverable(values);
        showToast(`Deliverable "${values.title}" added.`);
      }
    });
    return;
  }

  openActionDialog({
    title: "Add Deliverable",
    subtitle: overviewPage.querySelector(".project-title").textContent,
    fields: [
      {
        type: "row",
        fields: [
          { name: "title", label: "Document name", required: true, placeholder: "e.g. Riser shaft layout" },
          { name: "docNo", label: "Doc No.", placeholder: "Optional" }
        ]
      },
      {
        type: "row",
        fields: [
          { name: "tower", label: "Tower", type: "select", options: uniqueOptions(trackerTowers, "tower") },
          {
            name: "floor",
            label: "Floor",
            type: "select",
            options: uniqueOptions(trackerFloors, "floor").sort(trackerGroupSort("floor"))
          }
        ]
      },
      {
        type: "row",
        fields: [
          {
            name: "stage",
            label: "Stage",
            type: "select",
            options: uniqueOptions(trackerStages, "stage").sort(trackerGroupSort("stage"))
          },
          {
            name: "department",
            label: "Department",
            type: "select",
            options: uniqueOptions(trackerDepartments, "department")
          }
        ]
      },
      {
        type: "row",
        fields: [
          { name: "due", label: "Due date", type: "date", required: true, value: daysFromNow(14) },
          {
            name: "owner",
            label: "Owner",
            type: "select",
            options: teamMembers.filter((member) => member.group === "mep").map((member) => member.name),
            value: profileState.name
          }
        ]
      },
      {
        type: "row",
        fields: [
          {
            name: "source",
            label: "Source of deliverable",
            type: "select",
            options: [
              "Select source",
              "Client",
              "Architect",
              "Consultant",
              "Internal (Pool team)",
              "Site team",
              "Other"
            ],
            required: true
          },
          { name: "received", label: "Date received", type: "date", required: true, value: daysFromNow(0) }
        ]
      }
    ],
    submitLabel: "Add Deliverable",
    onSubmit(values) {
      if (values.source === "Select source") {
        setActionError("Choose where this deliverable came from.");
        return false;
      }
      deliverableTracker.unshift({
        ...values,
        // Doc number is optional in the dialog; a generated one keeps every deliverable referenceable
        docNo: values.docNo || `LB-NEW-${String(deliverableTracker.length + 1).padStart(3, "0")}`,
        status: "Not Started"
      });
      renderTracker();
      prependActivity({
        initials: initialsOf(profileState.name),
        text: `${initialsOf(profileState.name)} added <b>${escapeHtml(values.title)}</b>`,
        tag: escapeHtml(values.tower)
      });
      showToast(`Deliverable "${values.title}" added to ${values.tower} · ${values.floor}.`);
    }
  });
}

function openTransmittalDialog() {
  const firstWing = transmittalWings[0];
  const defaults = transmittalDefaults(firstWing);
  const drawingFiles = projectFiles.filter((file) => /\.(dwg|dxf|pdf|rvt)$/i.test(file.name)).map((file) => file.name);
  openActionDialog({
    title: "Create Transmittal",
    subtitle: "Saved as Pending — review and send it from the Transmittals list.",
    fields: [
      {
        type: "row",
        fields: [
          { name: "wing", label: "Wing", type: "select", options: transmittalWings, value: firstWing },
          { name: "source", label: "Source", type: "select", options: transmittalSources, value: defaults.source }
        ]
      },
      { name: "recipient", label: "Recipient", value: defaults.recipient, placeholder: "Who receives the drawings" },
      {
        type: "row",
        fields: [
          { name: "color", label: "Colour copies", type: "number", min: 0, value: defaults.copies.color },
          { name: "bw", label: "B&W copies", type: "number", min: 0, value: defaults.copies.bw }
        ]
      },
      { name: "files", label: "Drawings from Files", type: "checklist", options: drawingFiles }
    ],
    submitLabel: "Create & Review",
    onSubmit(values) {
      if (!values.files.length) {
        // Returning false below keeps the dialog open so the user can fix the problem
        setActionError("Pick at least one drawing to send.");
        return false;
      }
      const transmittal = {
        no: nextTransmittalNo(),
        wing: values.wing,
        source: values.source,
        recipient: values.recipient,
        recipientRole:
          transmittalsSentNewestFirst().find((item) => item.recipient === values.recipient)?.recipientRole || "",
        purpose: "For construction",
        copies: { color: Number(values.color) || 0, bw: Number(values.bw) || 0 },
        status: "pending",
        sent: null,
        created: toDateInput(new Date()),
        origin: "manual",
        by: profileState.name,
        remarks: "",
        drawings: values.files.map((name, index) => drawingFromFile(name, values.wing, index)),
        activity: [`Created by ${profileState.name}`]
      };
      transmittals.push(transmittal);
      renderTransmittals();
      prependActivity({
        initials: initialsOf(profileState.name),
        text: `${initialsOf(profileState.name)} drafted <b>${transmittal.no}</b> for ${escapeHtml(values.wing)}`,
        tag: `${values.files.length} dwgs`
      });
      // setTimeout waits until the dialog has finished closing, so focus and scroll are not fought over
      // Open the new draft for review once this dialog has closed
      setTimeout(() => {
        if (overviewPage.hidden || projectSubViews.transmittals.hidden)
          openProject(overviewPage.querySelector(".project-title").textContent, "transmittals");
        const row = document.querySelector(
          `#transmittal-list tr[data-transmittal-index="${transmittals.indexOf(transmittal)}"]`
        );
        if (row) openTransmittalDrawer(row);
      });
    }
  });

  // Only overwrite the recipient if the user has not typed their own
  // Recipient, source and copies follow the chosen wing's history
  document.getElementById("action-wing").addEventListener("change", (e) => {
    const wingDefaults = transmittalDefaults(e.target.value);
    if (
      !document.getElementById("action-recipient").value ||
      document.getElementById("action-recipient").value === defaults.recipient
    ) {
      document.getElementById("action-recipient").value = wingDefaults.recipient;
    }
    document.getElementById("action-source").value = wingDefaults.source;
  });
}

function openAddMemberDialog() {
  openActionDialog({
    title: "Add Member",
    subtitle: overviewPage.querySelector(".project-title").textContent,
    fields: [
      { name: "name", label: "Full name", required: true, placeholder: "e.g. Kavya Iyer" },
      {
        type: "row",
        fields: [
          { name: "role", label: "Role", placeholder: "e.g. Electrical Engineer", required: true },
          { name: "team", label: "Team", type: "select", options: teamGroups.map((group) => group.label) }
        ]
      },
      {
        type: "row",
        fields: [
          {
            name: "discipline",
            label: "Discipline",
            type: "select",
            options: ["MEP", ...disciplineOptions, "Architecture", "Cost", "Construction"]
          },
          { name: "org", label: "Organisation", type: "select", options: ["Halden", ...consultantOptions] }
        ]
      }
    ],
    submitLabel: "Add Member",
    onSubmit(values) {
      const group = teamGroups.find((g) => g.label === values.team).key;
      teamMembers.push({
        name: values.name,
        role: values.role,
        org: values.org,
        discipline: values.discipline,
        group,
        tasks: 0
      });
      openTeamFolders.add(group);
      renderTeam();
      prependActivity({
        initials: initialsOf(profileState.name),
        text: `${initialsOf(profileState.name)} added <b>${escapeHtml(values.name)}</b> to ${escapeHtml(values.team)}`,
        tag: escapeHtml(values.org)
      });
      showToast(`${values.name} added to ${values.team}.`);
    }
  });
}

// Guests may be separated by commas, semicolons, spaces or new lines, whichever the user pastes
const parseGuestEmails = (text) =>
  text
    .split(/[\s,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);

const validEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

function openScheduleMeetingDialog() {
  const onProject = !overviewPage.hidden;
  openActionDialog({
    title: "Schedule Meeting",
    subtitle: onProject ? overviewPage.querySelector(".project-title").textContent : "",
    fields: [
      { name: "title", label: "Meeting subject", required: true, placeholder: "e.g. Facade MEP Coordination" },
      {
        type: "row",
        fields: [
          { name: "date", label: "Date", type: "date", required: true, value: toDateInput(new Date()) },
          {
            name: "type",
            label: "Type",
            type: "select",
            options: ["Online · Google Meet", "Online · Zoom", "Offline · Google Calendar"]
          }
        ]
      },
      {
        type: "row",
        fields: [
          { name: "start", label: "Start", type: "time", required: true, value: "15:00" },
          { name: "end", label: "End", type: "time", required: true, value: "16:00" }
        ]
      },
      { name: "place", label: "Location / link", placeholder: "Teams link or meeting room" },
      { name: "people", label: "Invite people", type: "people" },
      { name: "guests", label: "Guests outside REOS", placeholder: "Emails, separated by commas" },
      {
        name: "message",
        label: "Invite message",
        type: "textarea",
        placeholder: "Agenda or anything attendees should prepare..."
      },
      { name: "send", label: "Send calendar invites now", type: "checkbox", value: true }
    ],
    submitLabel: "Schedule",
    onSubmit(values) {
      const start = new Date(`${values.date}T${values.start}`);
      const end = new Date(`${values.date}T${values.end}`);
      // Written as !(end > start) so an invalid date (NaN) is rejected too
      if (!(end > start)) {
        setActionError("End time must be after the start time.");
        return false;
      }
      const guests = parseGuestEmails(values.guests);
      const invalid = guests.filter((email) => !validEmail(email));
      if (invalid.length) {
        setActionError(`Check these guest emails: ${invalid.join(", ")}`);
        return false;
      }

      const online = values.type.startsWith("Online");
      const provider = values.type.includes("Zoom") ? "Zoom" : "Google Meet";
      const invited = values.people.length + guests.length;
      meetings.push({
        id: `m${++meetingSeq}`,
        start,
        end,
        title: values.title,
        type: online ? "online" : "in-person",
        place:
          values.place ||
          (online ? (provider === "Zoom" ? "Zoom link" : "Google Meet link") : "Room to be booked in Google Calendar"),
        project: onProject ? overviewPage.querySelector(".project-title").textContent : "General",
        attendees: invited + 1,
        joined: false,
        invitees: values.people,
        guests,
        status: "join"
      });
      renderSchedule();
      const when = `${start.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} at ${values.start}`;
      showToast(
        values.send && invited
          ? `"${values.title}" scheduled for ${when} · ${online ? provider + " link created, calendar invites (.ics) sent to " : "invites sent to "}${invited} ${invited === 1 ? "person" : "people"}.`
          : `"${values.title}" scheduled for ${when}.`
      );
    }
  });
}

document.addEventListener("click", (e) => {
  const button = e.target.closest("[data-project-action]");
  if (!button) return;
  button.blur();
  const action = button.dataset.projectAction;
  if (action === "add-deliverable")
    openAddDeliverableDialog(button.closest("#dashboard-deliverables-panel") ? "dashboard" : "project");
  else if (action === "transmittal") openTransmittalDialog();
  else if (action === "add-member") openAddMemberDialog();
  else if (action === "schedule-meeting") openScheduleMeetingDialog();
});
