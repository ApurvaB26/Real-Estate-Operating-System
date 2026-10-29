/**
 * File: js/features/project/overview-feed.js
 * Role: Project milestones and activity (View All pages).
 * Dependencies: Loaded by index.html as script 42 of 80. Uses globals from js/core/utils.js, js/data/project-activity.js, js/data/project-files.js, js/utils/dom-helpers.js. Its globals are used by js/features/project/files.js, js/features/project/tracker-import.js, js/features/project/workspace.js, js/main.js.
 */

let milestoneFilter = "all";

function renderMilestones() {
  const visible = projectMilestones.filter(
    (m) => milestoneFilter === "all" || (milestoneFilter === "complete" ? m.complete : !m.complete)
  );
  document.getElementById("project-milestone-list").innerHTML = visible
    .map(
      (m) => `
    <li class="milestone-item${m.complete ? " is-complete" : ""}">
      <span class="milestone-track"><i aria-hidden="true">${m.complete ? "✓" : ""}</i></span>
      <span class="milestone-copy"><strong>${escapeHtml(m.title)}</strong><small>${m.date}</small></span>
      <span class="milestone-status${m.complete ? " is-complete" : ""}">${m.complete ? "Completed" : "Upcoming"}</span>
    </li>`
    )
    .join("");
  document.getElementById("project-milestone-progress").textContent =
    `${projectMilestones.filter((m) => m.complete).length}/${projectMilestones.length}`;
}

document.querySelectorAll("[data-milestone-filter]").forEach((chip) => {
  chip.addEventListener("click", () => {
    milestoneFilter = chip.dataset.milestoneFilter;
    document.querySelectorAll("[data-milestone-filter]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderMilestones();
  });
});


let activityFilter = "all";

const activitySearch = document.getElementById("project-activity-search");

// File uploads carry fileName, which adds Open and Download (same actions as the Files tab)
const activityItemHtml = (item) => {
  const fileIndex = item.fileName ? projectFiles.findIndex((file) => file.name === item.fileName) : -1;
  const fileActions =
    fileIndex < 0
      ? ""
      : `
      <span class="activity-file-actions"><button type="button" data-file-action="open">Open</button><button type="button" data-file-action="download"><span aria-hidden="true">⇩</span> Download</button></span>`;
  return `
  <li class="activity-item${fileIndex < 0 ? "" : " has-file"}"${fileIndex < 0 ? "" : ` data-file-index="${fileIndex}"`}>
    <span class="activity-avatar ${item.tone || ""}">${escapeHtml(item.initials)}</span>
    <span class="activity-copy"><strong>${item.text}</strong><small><span aria-hidden="true">◷</span> ${escapeHtml(item.when)}</small>${fileActions}</span>
    <span class="activity-tag">${item.tag}</span>
  </li>`;
};

// Overview shows the latest five events, uploads included
function renderOverviewActivity() {
  document.getElementById("overview-activity-list").innerHTML = projectActivity
    .slice(0, 5)
    .map(activityItemHtml)
    .join("");
}

function renderActivity() {
  const tags = ["all", ...new Set(projectActivity.map((item) => item.tag))];
  document.getElementById("project-activity-filters").innerHTML = tags
    .map(
      (tag) => `
    <button class="task-priority-filter${activityFilter === tag ? " is-active" : ""}" type="button" data-activity-filter="${escapeHtml(tag)}" aria-pressed="${activityFilter === tag}">${tag === "all" ? "All" : tag}</button>`
    )
    .join("");

  const query = activitySearch.value.trim().toLocaleLowerCase();
  const visible = projectActivity.filter(
    (item) =>
      (activityFilter === "all" || item.tag === activityFilter) &&
      item.text
        // Strip the <b> tags before searching so a search for 'b' does not match markup
        .replace(/<[^>]+>/g, "")
        .toLocaleLowerCase()
        .includes(query)
  );
  document.getElementById("project-activity-list").innerHTML = visible.length
    ? visible.map(activityItemHtml).join("")
    : '<li class="policy-empty">No activity matches these filters.</li>';
}

// New project events show up first on the overview and in All Activity
function prependActivity(item) {
  // Defaults first, then the caller's values, so a caller can override tone or time
  const entry = { tone: "", when: "Just now", ...item };
  projectActivity.unshift(entry);
  renderOverviewActivity();
  renderActivity();
}

document.getElementById("project-activity-filters").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-activity-filter]");
  if (!chip) return;
  activityFilter = chip.dataset.activityFilter;
  renderActivity();
});

activitySearch.addEventListener("input", renderActivity);
