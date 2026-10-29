/**
 * File: js/features/projects.js
 * Role: Projects list: search, status and starred filters, project cards.
 * Dependencies: Loaded by index.html as script 28 of 80. Uses globals from js/features/project/workspace.js. Its globals are used by js/features/create-project.js, js/layout/topbar.js.
 */

const projectSearchInput = document.querySelector("#project-search");

const projectStatusFilter = document.querySelector("#project-status-filter");

const projectCards = Array.from(document.querySelectorAll("[data-project-card]"));

const emptyProjectsMessage = document.querySelector(".empty-projects");

function filterProjectCards() {
  const query = projectSearchInput.value.trim().toLocaleLowerCase();
  const selectedStatus = projectStatusFilter.value;
  let visibleCount = 0;

  projectCards.forEach((card) => {
    // Search matches any text on the card (name, location, status), not just the title
    const matchesSearch = card.textContent.toLocaleLowerCase().includes(query);
    const matchesStatus = selectedStatus === "all" || card.dataset.status === selectedStatus;
    const isVisible = matchesSearch && matchesStatus;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  emptyProjectsMessage.hidden = visibleCount !== 0;
}

projectSearchInput.addEventListener("input", filterProjectCards);

projectStatusFilter.addEventListener("change", filterProjectCards);

function addWorkspaceLink(card) {
  // Cards created later (Create Project) also call this, so skip cards that already have the link
  if (card.querySelector(".workspace-link")) return;
  card.insertAdjacentHTML(
    "beforeend",
    `
    <a class="workspace-link" href="#project-workspace">
      Open Project Workspace <span aria-hidden="true">→</span>
    </a>
  `
  );
}

document.querySelectorAll("[data-project-card]").forEach(addWorkspaceLink);

document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-project-card]");
  if (!card) return;
  e.preventDefault();
  openProject(card.querySelector("h2").textContent);
});
