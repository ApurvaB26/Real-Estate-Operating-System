/**
 * File: js/features/create-project.js
 * Role: Create Project dialog: dropdowns, team picker, attachment, location search and submit.
 * Dependencies: Loaded by index.html as script 29 of 80. Uses globals from js/components/date-picker.js, js/core/utils.js, js/features/projects.js, js/layout/right-rail.js, js/layout/topbar.js, js/utils/dom-helpers.js, js/core/icons.js. Nothing else calls into it; it wires itself up on load.
 */

const projectDialogBackdrop = document.querySelector("#project-dialog-backdrop");

const projectDialog = projectDialogBackdrop.querySelector(".project-dialog");

const projectForm = document.querySelector("#project-form");

// Every Create Project button (Projects page toolbar and the project header) opens the same dialog
const openProjectDialogButtons = document.querySelectorAll("[data-open-project-dialog]");

const projectNameInput = document.querySelector("#project-name");

const projectDescription = document.querySelector("#project-description");

const characterCount = document.querySelector(".character-count");

const attachmentInput = document.querySelector("#project-attachment");

const attachmentDropzone = document.querySelector(".attachment-dropzone");

const attachmentFilename = document.querySelector(".attachment-filename");

const teamPicker = document.querySelector(".team-picker");

const teamMemberInputs = Array.from(teamPicker.querySelectorAll('input[type="checkbox"]'));

const teamSelectionCount = document.querySelector(".team-selection-count");

const teamSelectionFraction = document.querySelector(".team-selection-fraction");

const colleagueSearchInput = document.querySelector(".colleague-search-input");

const teamMemberRows = Array.from(teamPicker.querySelectorAll(".team-options > label:not(.colleague-search)"));

const noColleaguesMessage = teamPicker.querySelector(".no-colleagues");

const customSelects = Array.from(projectDialog.querySelectorAll(".custom-select"));

const clearTeamSelectionButton = document.querySelector(".clear-team-selection");

const teamDoneButton = document.querySelector(".team-done-btn");

const datePickers = Array.from(projectDialog.querySelectorAll(".date-picker"));

let dialogReturnFocus = null;

function openProjectDialog() {
  dialogReturnFocus = document.activeElement;
  projectDialogBackdrop.hidden = false;
  document.body.classList.add("project-dialog-open");
  projectNameInput.focus();
}

// Reset the open popups and the team search so the dialog is clean the next time it opens
function closeProjectDialog() {
  projectDialogBackdrop.hidden = true;
  document.body.classList.remove("project-dialog-open");
  teamPicker.open = false;
  datePickers.forEach((datePicker) => {
    datePicker.open = false;
  });
  colleagueSearchInput.value = "";
  filterTeamMembers();
  dialogReturnFocus?.focus();
}

function updateCharacterCount() {
  characterCount.textContent = `${projectDescription.value.length} / 500`;
}

function updateTeamSelection() {
  const selectedMembers = teamMemberInputs.filter((input) => input.checked);
  teamSelectionCount.textContent = `${selectedMembers.length} ${selectedMembers.length === 1 ? "member" : "members"} selected`;
  teamSelectionFraction.textContent = `${selectedMembers.length} / ${teamMemberInputs.length}`;
}

function filterTeamMembers() {
  const query = colleagueSearchInput.value.trim().toLocaleLowerCase();
  let visibleCount = 0;

  teamMemberRows.forEach((row) => {
    const matches = row.textContent.toLocaleLowerCase().includes(query);
    row.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  noColleaguesMessage.hidden = visibleCount !== 0;
}

function setAttachment(file) {
  if (!file) return;
  attachmentFilename.textContent = file.name;
  attachmentDropzone.setAttribute("aria-label", `Selected file: ${file.name}`);
}

function getDropdownValueInput(dropdown) {
  const inputId = `project-${dropdown.dataset.select}`;
  return document.getElementById(inputId);
}

function selectDropdownOption(dropdown, option) {
  const input = getDropdownValueInput(dropdown);
  const value = option.dataset.value;

  input.value = value;
  dropdown.querySelector(".select-value").textContent = value;
  dropdown.querySelectorAll("[data-value]").forEach((item) => {
    item.setAttribute("aria-selected", String(item === option));
  });
  dropdown.open = false;
}

function filterDropdownOptions(searchInput) {
  const dropdown = searchInput.closest(".custom-select");
  const options = Array.from(dropdown.querySelectorAll(".select-menu [data-value]"));
  const emptyState = dropdown.querySelector(".no-options");
  const query = searchInput.value.trim().toLocaleLowerCase();
  let matchCount = 0;

  options.forEach((option) => {
    const matches = option.textContent.toLocaleLowerCase().includes(query);
    option.hidden = !matches;
    if (matches) matchCount += 1;
  });

  emptyState.hidden = matchCount !== 0;
}

datePickers.forEach(setupDatePicker);

openProjectDialogButtons.forEach((button) => button.addEventListener("click", openProjectDialog));

projectDialogBackdrop.querySelectorAll("[data-close-project-dialog]").forEach((button) => {
  button.addEventListener("click", closeProjectDialog);
});

projectDialogBackdrop.addEventListener("click", (event) => {
  if (event.target === projectDialogBackdrop) closeProjectDialog();
});

document.addEventListener("keydown", (event) => {
  if (projectDialogBackdrop.hidden) return;

  if (event.key === "Escape") {
    event.preventDefault();
    const openDetails = Array.from(projectDialog.querySelectorAll("details[open]"));
    if (openDetails.length) {
      openDetails[openDetails.length - 1].open = false;
      return;
    }
    closeProjectDialog();
    return;
  }

  if (event.key !== "Tab") return;
  const focusableElements = Array.from(
    projectDialog.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => element.offsetParent !== null);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
});

projectDescription.addEventListener("input", updateCharacterCount);

teamMemberInputs.forEach((input) => input.addEventListener("change", updateTeamSelection));

colleagueSearchInput.addEventListener("input", filterTeamMembers);

attachmentInput.addEventListener("change", () => setAttachment(attachmentInput.files[0]));

customSelects.forEach((dropdown) => {
  dropdown.querySelectorAll("[data-value]").forEach((option) => {
    option.addEventListener("click", () => selectDropdownOption(dropdown, option));
  });

  const search = dropdown.querySelector(".dropdown-search input");
  if (search) search.addEventListener("input", () => filterDropdownOptions(search));
});

document.querySelectorAll(".category-option").forEach((option) => {
  option.addEventListener("mouseenter", () => {
    option.closest(".category-options").dataset.hoveredValue = option.dataset.value;
  });
  option.addEventListener("mouseleave", () => {
    delete option.closest(".category-options").dataset.hoveredValue;
  });
});

clearTeamSelectionButton.addEventListener("click", () => {
  teamMemberInputs.forEach((input) => {
    input.checked = false;
  });
  updateTeamSelection();
});

teamDoneButton.addEventListener("click", () => {
  teamPicker.open = false;
  teamPicker.querySelector("summary").focus();
});

["dragenter", "dragover"].forEach((eventName) => {
  attachmentDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    attachmentDropzone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  attachmentDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    attachmentDropzone.classList.remove("is-dragging");
  });
});

attachmentDropzone.addEventListener("drop", (event) => {
  const [file] = event.dataTransfer.files;
  setAttachment(file);
});

// Builds the card from the submitted form. New projects start On Track at 0%, and text is inserted with textContent below, not into the template string, so project names cannot inject HTML
function createProjectCard(data) {
  const name = data.get("projectName");
  const code = data.get("projectCode");
  const segment = data.get("category");
  const tier = data.get("tier");
  const location = String(data.get("location") || "").split(",")[0];
  const meta = [code, segment, tier, location].filter(Boolean).join(" • ");

  const card = document.createElement("article");
  card.className = "project-card";
  card.dataset.projectCard = "";
  card.dataset.status = "on-track";

  card.innerHTML = `
    <div class="project-card-top">
      <span class="project-building-icon" aria-hidden="true">▥</span>
      <span class="project-state on-track"><i></i> On Track</span>
    </div>
    <div class="project-card-title"><h2></h2><p class="project-meta"></p></div>
    <div class="project-card-progress"><div class="project-progress-label"><span>Project Progress</span><strong>0%</strong></div><div class="project-progress"><span style="width:0%"></span></div></div>
    <div class="project-card-deliverables"><div class="project-due"><strong>0</strong><span>deliverables due in the next 30 days</span></div><div class="project-metrics"><span>${icon("check-circle", 12)}<strong>0</strong> RFIs</span><span>${icon("check-circle", 12)}<strong>0</strong> GFCs</span><span>${icon("check-circle", 12)}<strong>0</strong> Tenders</span></div></div>
    <div class="project-milestone milestone-inactive"><span class="milestone-icon" aria-hidden="true">${icon("calendar", 12)}</span><strong>No active milestone</strong></div>
    <p class="project-updated">Updated just now</p>
  `;

  card.querySelector("h2").textContent = name;
  card.querySelector(".project-meta").textContent = meta;

  addWorkspaceLink(card);
  document.getElementById("project-grid").prepend(card);
}

projectForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const missingDropdown = customSelects.find((dropdown) => {
    const value = getDropdownValueInput(dropdown).value;
    return (dropdown.dataset.select === "category" || dropdown.dataset.select === "tier") && !value;
  });

  if (missingDropdown) {
    missingDropdown.open = true;
    missingDropdown.querySelector("summary").focus();
    return;
  }

  if (!projectForm.reportValidity()) return;

  createProjectCard(new FormData(projectForm));

  closeProjectDialog();

  projectForm.reset();
  customSelects.forEach((dropdown) => {
    dropdown.open = false;
    getDropdownValueInput(dropdown).value = "";
    dropdown.querySelector(".select-value").textContent =
      {
        category: "Select project segment",
        tier: "Select project category",
        manager: "Select project manager"
      }[dropdown.dataset.select] || "Select Consultant";
    dropdown.querySelectorAll("[data-value]").forEach((option) => option.removeAttribute("aria-selected"));
    const search = dropdown.querySelector(".dropdown-search input");
    if (search) {
      search.value = "";
      filterDropdownOptions(search);
    }
  });
  datePickers.forEach((datePicker) => {
    datePicker.open = false;
    syncDatePickerLabel(datePicker);
    datePicker.viewDate = new Date();
  });
  colleagueSearchInput.value = "";
  filterTeamMembers();
  attachmentFilename.textContent = "";
  attachmentDropzone.removeAttribute("aria-label");
  updateCharacterCount();
  updateTeamSelection();

  const confirmation = document.createElement("div");
  confirmation.className = "project-toast";
  confirmation.setAttribute("role", "status");
  confirmation.textContent = "Project details submitted successfully.";
  document.body.append(confirmation);
  window.setTimeout(() => confirmation.remove(), 3500);
});

document.addEventListener("click", (event) => {
  projectDialog.querySelectorAll("details[open]").forEach((details) => {
    if (!details.contains(event.target)) details.open = false;
  });
});

/* PROJECT LOCATION SEARCH
   Uses Google Places when a Maps key is set below; otherwise suggestions come from OpenStreetMap. */
// Keep empty to use the free OpenStreetMap search; adding a key switches suggestions to Google Places
const GOOGLE_MAPS_API_KEY = "";

// Google Cloud key with "Places API (New)" enabled
const locationInput = document.getElementById("project-location");

const locationSuggestions = document.getElementById("location-suggestions");

const locationHint = document.getElementById("location-hint");

let locationTimer = null;

// Counter used to ignore slow responses: only the newest search may update the suggestion list
let locationRequest = 0;

let locationResults = [];

let googlePlacesPromise = null;

function loadGooglePlaces() {
  googlePlacesPromise ||= new Promise((resolve, reject) => {
    // Google's loader calls this global when its script is ready, which resolves the promise
    window.__reosMapsReady = () => google.maps.importLibrary("places").then(resolve, reject);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly&loading=async&callback=__reosMapsReady`;
    script.onerror = () => {
      googlePlacesPromise = null;
      reject(new Error("Google Maps didn't load"));
    };
    document.head.append(script);
  });
  return googlePlacesPromise;
}

async function searchPlaces(query) {
  if (GOOGLE_MAPS_API_KEY) {
    const { AutocompleteSuggestion } = await loadGooglePlaces();
    const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: query,
      // Restrict suggestions to India, where all projects are
      includedRegionCodes: ["in"]
    });
    return suggestions
      .filter((s) => s.placePrediction)
      .map(({ placePrediction: place }) => ({
        main: place.mainText?.text || place.text.text,
        secondary: place.secondaryText?.text || "",
        value: place.text.text,
        placeId: place.placeId
      }));
  }
  const response = await fetch(
    // Free fallback search, also limited to India; the app sends only the text the user typed
    `https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=in&q=${encodeURIComponent(query)}`,
    {
      headers: { "Accept-Language": "en" }
    }
  );
  if (!response.ok) throw new Error(`Search failed (${response.status})`);
  return (await response.json()).map((place) => {
    const parts = place.display_name.split(", ");
    return {
      main: parts[0],
      secondary: parts.slice(1, 4).join(", "),
      value: place.display_name,
      lat: place.lat,
      lng: place.lon
    };
  });
}

function setLocationOpen(open) {
  locationSuggestions.hidden = !open;
  locationInput.setAttribute("aria-expanded", String(open));
}

function renderLocationSuggestions(active = -1) {
  locationSuggestions.innerHTML = locationResults
    .map(
      (place, index) => `
    <button class="person-option location-option${index === active ? " is-active" : ""}" type="button" role="option" data-location-index="${index}" aria-selected="${index === active}">
      <span class="region-pin" aria-hidden="true">⌖</span>
      <span><strong>${escapeHtml(place.main)}</strong><small>${escapeHtml(place.secondary)}</small></span>
    </button>`
    )
    .join("");
  setLocationOpen(locationResults.length > 0);
}

function chooseLocation(place) {
  locationInput.value = place.value;
  document.getElementById("project-location-lat").value = place.lat || "";
  document.getElementById("project-location-lng").value = place.lng || "";
  locationInput.dataset.placeId = place.placeId || "";
  setLocationOpen(false);
}

locationInput.addEventListener("input", () => {
  clearTimeout(locationTimer);
  document.getElementById("project-location-lat").value = "";
  document.getElementById("project-location-lng").value = "";
  const query = locationInput.value.trim();
  if (query.length < 3) {
    setLocationOpen(false);
    return;
  }
  const request = ++locationRequest;
  // OpenStreetMap asks for no more than one search a second
  locationTimer = setTimeout(
    async () => {
      locationHint.textContent = "Searching…";
      try {
        const results = await searchPlaces(query);
        if (request !== locationRequest) return;
        locationResults = results;
        renderLocationSuggestions();
        locationHint.textContent = results.length
          ? GOOGLE_MAPS_API_KEY
            ? "Suggestions from Google Maps"
            : "Suggestions from OpenStreetMap · add a Google Maps key to use Google"
          : "No matches — you can keep what you typed.";
      } catch {
        if (request !== locationRequest) return;
        setLocationOpen(false);
        locationHint.textContent = "Couldn't load suggestions — you can still type the location.";
      }
    },
    GOOGLE_MAPS_API_KEY ? 300 : 600
  );
});

locationInput.addEventListener("keydown", (e) => {
  if (locationSuggestions.hidden) return;
  const options = Array.from(locationSuggestions.querySelectorAll("[data-location-index]"));
  const active = options.findIndex((option) => option.classList.contains("is-active"));
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    renderLocationSuggestions(
      e.key === "ArrowDown" ? Math.min(options.length - 1, active + 1) : Math.max(0, active - 1)
    );
  } else if (e.key === "Enter" && active >= 0) {
    e.preventDefault();
    chooseLocation(locationResults[active]);
  } else if (e.key === "Escape") {
    e.stopPropagation(); // close the list, not the dialog
    setLocationOpen(false);
  }
});

locationSuggestions.addEventListener("click", (e) => {
  const option = e.target.closest("[data-location-index]");
  if (option) chooseLocation(locationResults[Number(option.dataset.locationIndex)]);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".location-field")) setLocationOpen(false);
});

projectForm.addEventListener("reset", () => {
  setLocationOpen(false);
  locationHint.textContent = "";
});
