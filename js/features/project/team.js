/**
 * File: js/features/project/team.js
 * Role: Project Team tab.
 * Dependencies: Loaded by index.html as script 41 of 80. Uses globals from js/core/utils.js, js/data/team.js, js/features/task-dialog.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/features/project/files.js, js/features/project/workspace.js, js/main.js.
 */

const folderIcon =
  icon("folder-open", 18);


// Which folders the user expanded; separate from render so the state survives searches
const openTeamFolders = new Set();

const teamSearch = document.getElementById("project-team-search");

const teamExpandAll = document.getElementById("team-expand-all");

const teamCardHtml = (member) => `
  <article class="team-card">
    <span class="activity-avatar team-avatar">${escapeHtml(initialsOf(member.name))}</span>
    <div class="team-card-copy">
      <strong>${escapeHtml(member.name)}</strong>
      <span>${escapeHtml(member.role)}</span>
    </div>
    <div class="team-card-tags">
      <span class="activity-tag">${escapeHtml(member.org)}</span>
      <span class="activity-tag">${escapeHtml(member.discipline)}</span>
    </div>
    <footer class="team-card-footer">
      <small><strong>${member.tasks}</strong> open tasks</small>
      <span class="team-contact"><button class="comment-btn" type="button" data-chat-with="${escapeHtml(member.name)}">Chat</button><button class="comment-btn" type="button" data-call="${escapeHtml(member.name)}">Call</button></span><button class="comment-btn" type="button" data-assign-to="${escapeHtml(member.name)}">Assign Task</button>
    </footer>
  </article>`;

function renderTeam() {
  const query = teamSearch.value.trim().toLocaleLowerCase();
  const matches = (member, group) =>
    `${member.name} ${member.role} ${member.org} ${member.discipline} ${group.label} ${group.full}`
      .toLocaleLowerCase()
      .includes(query);
  let shown = 0;

  const mepGroup = teamGroups[0];
  const mep = teamMembers.filter((member) => member.group === mepGroup.key && matches(member, mepGroup));
  document.getElementById("team-mep-grid").innerHTML = mep.map(teamCardHtml).join("");
  document.getElementById("team-mep-count").textContent = String(mep.length).padStart(2, "0");
  document.getElementById("team-mep-grid").closest(".team-section").hidden = Boolean(query) && !mep.length;
  shown += mep.length;

  const folders = teamGroups
    .slice(1)
    .map((group) => {
      const all = teamMembers.filter((member) => member.group === group.key);
      const members = all.filter((member) => matches(member, group));
      if (query && !members.length) return "";
      shown += members.length;
      // A search opens every folder with a match so results are never hidden behind a click
      const open = openTeamFolders.has(group.key) || Boolean(query);
      const preview = all
        .slice(0, 4)
        .map((member) => `<i>${escapeHtml(initialsOf(member.name))}</i>`)
        .join("");
      return `
      <section class="team-folder${open ? " is-open" : ""}">
        <button class="team-folder-head" type="button" data-team-folder="${group.key}" aria-expanded="${open}" aria-controls="team-folder-${group.key}">
          <span class="team-folder-icon">${folderIcon}</span>
          <span class="team-folder-copy"><strong>${escapeHtml(group.label)}</strong><small>${escapeHtml(group.full)}</small></span>
          <span class="team-folder-avatars" aria-hidden="true">${preview}${all.length > 4 ? `<i>+${all.length - 4}</i>` : ""}</span>
          <span class="team-folder-count">${query ? `${members.length} of ${all.length}` : `${all.length} ${all.length === 1 ? "member" : "members"}`}</span>
          <span class="task-group-chevron" aria-hidden="true"></span>
        </button>
        <div class="team-grid team-folder-body" id="team-folder-${group.key}"${open ? "" : " hidden"}>
          ${members.length ? members.map(teamCardHtml).join("") : '<p class="pref-hint">No one in this team yet. Use Add Member to add someone.</p>'}
        </div>
      </section>`;
    })
    .join("");
  document.getElementById("team-folders").innerHTML = folders;
  document.getElementById("team-folders").closest(".team-section").hidden = !folders.trim();
  document.getElementById("project-team-empty").hidden = shown !== 0;

  const allOpen = teamGroups.slice(1).every((group) => openTeamFolders.has(group.key));
  teamExpandAll.textContent = allOpen ? "Collapse all teams" : "Expand all teams";
  teamExpandAll.setAttribute("aria-pressed", String(allOpen));

  setText("metric-team", teamMembers.length);
  setText("metric-firms", new Set(teamMembers.map((member) => member.org)).size);
}

document.getElementById("team-folders").addEventListener("click", (e) => {
  const head = e.target.closest("[data-team-folder]");
  if (!head) return;
  const key = head.dataset.teamFolder;
  if (openTeamFolders.has(key)) openTeamFolders.delete(key);
  else openTeamFolders.add(key);
  renderTeam();
  document.querySelector(`[data-team-folder="${key}"]`).focus();
});

teamExpandAll.addEventListener("click", () => {
  const allOpen = teamGroups.slice(1).every((group) => openTeamFolders.has(group.key));
  teamGroups.slice(1).forEach((group) => {
    if (allOpen) openTeamFolders.delete(group.key);
    else openTeamFolders.add(group.key);
  });
  renderTeam();
});

teamSearch.addEventListener("input", renderTeam);

document.addEventListener("click", (e) => {
  const button = e.target.closest("[data-assign-to]");
  if (button) openTaskDialog(button.dataset.assignTo);
});
