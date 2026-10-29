/**
 * File: js/features/reporting.js
 * Role: Reporting page.
 * Dependencies: Loaded by index.html as script 49 of 80. Uses globals from js/core/utils.js, js/layout/right-rail.js, js/utils/dom-helpers.js, js/core/icons.js. Its globals are used by js/core/router.js.
 */

/* REPORTING */
// Demo numbers until the reporting API exists; the table, KPIs and CSV all read from this one list
const reportProjects = [
  { name: "Riverside Greens", progress: 65, tasks: 18, rfis: 9, delayed: 1, status: "on-track" },
  { name: "Skyline One", progress: 48, tasks: 24, rfis: 6, delayed: 2, status: "at-risk" },
  { name: "Amberwood Residences", progress: 72, tasks: 15, rfis: 4, delayed: 0, status: "on-track" },
  { name: "Lakeshore Phase 2", progress: 31, tasks: 21, rfis: 11, delayed: 3, status: "at-risk" },
  { name: "Upper Thane Towers", progress: 84, tasks: 9, rfis: 2, delayed: 0, status: "on-track" },
  { name: "Riverside Retail", progress: 25, tasks: 12, rfis: 5, delayed: 0, status: "on-hold" }
];

// Tasks closed per bucket; the period picks how many buckets and their unit
const reportPeriods = {
  30: { unit: "week", values: [11, 14, 9, 16, 13] },
  90: { unit: "week", values: [8, 12, 10, 7, 13, 15, 11, 9, 14, 16, 12, 13, 17] },
  365: { unit: "month", values: [34, 41, 38, 45, 52, 47, 39, 55, 58, 49, 61, 57] }
};

const reportDisciplines = [
  { icon: "ϟ", name: "Electrical", done: 18, total: 25 },
  { icon: "⌁", name: "Mechanical", done: 13, total: 20 },
  { icon: "♨", name: "Plumbing", done: 9, total: 20 },
  { icon: "♨", name: "Fire", done: 7, total: 12 },
  { icon: "❄", name: "HVAC", done: 11, total: 16 }
];

const statusLabels = { "on-track": "On Track", "at-risk": "At Risk", "on-hold": "On Hold" };

// Labels count back from this week/month so the last bar is always 'now'
function bucketLabels(unit, count) {
  const labels = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    if (unit === "month") {
      labels.push(new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleDateString("en-GB", { month: "short" }));
    } else {
      labels.push(`W${getIsoWeek(new Date(now.getTime() - i * 7 * 86400000))}`);
    }
  }
  return labels;
}

function renderReporting() {
  const period = reportPeriods[document.getElementById("report-period").value];
  const closed = period.values.reduce((sum, value) => sum + value, 0);
  const openRfis = reportProjects.reduce((sum, project) => sum + project.rfis, 0);
  const delayed = reportProjects.reduce((sum, project) => sum + project.delayed, 0);
  // healthData comes from the right rail so both places always show the same health numbers
  const onTime = Math.round((healthData.completed / (healthData.completed + healthData.delayed)) * 100);

  const kpiIcons = {
    check: icon("circle-check", 16),
    folder: icon("box", 16),
    alert: icon("alert-circle", 16),
    doc: icon("clock-circle", 16)
  };
  const kpi = (icon, value, label, tag, tone) => `
    <div class="kpi-card">
      <div class="kpi-top"><div class="kpi-icon ${icon}">${kpiIcons[icon]}</div></div>
      <strong>${value}</strong>
      <div class="kpi-bottom"><span>${label}</span><span class="kpi-tag ${tone}">${tag}</span></div>
    </div>`;
  document.getElementById("report-kpis").innerHTML = [
    kpi("check", closed, "Tasks closed", `${period.values.length} ${period.unit}s`, "positive"),
    kpi("folder", `${onTime}%`, "Deliverables on time", `${healthData.delayed} delayed`, "negative"),
    kpi("alert", openRfis, "Open RFIs", "6 blocking", "negative"),
    kpi(
      "doc",
      delayed,
      "Delayed items",
      `across ${reportProjects.filter((p) => p.delayed).length} projects`,
      "negative"
    )
  ].join("");

  document.getElementById("report-project-rows").innerHTML = reportProjects
    .map(
      (project) => `
    <tr>
      <td><strong>${project.name}</strong></td>
      <td>
        <span class="report-meter" role="img" aria-label="${project.progress}% complete"><span style="width:${project.progress}%"></span></span>
        <small class="report-meter-value">${project.progress}%</small>
      </td>
      <td>${project.tasks}</td>
      <td>${project.rfis}</td>
      <td>${project.delayed ? `<span class="status overdue">${project.delayed}</span>` : "0"}</td>
      <td><span class="project-state ${project.status}">${statusLabels[project.status]}</span></td>
    </tr>`
    )
    .join("");

  // Weekly / monthly throughput: one series, so no legend; hover or focus a bar for its value
  // Bars are scaled to 85% of the chart height so the tallest bar leaves room for its value label
  const labels = bucketLabels(period.unit, period.values.length);
  const max = Math.max(...period.values);
  const chart = document.getElementById("report-throughput");
  chart.setAttribute("role", "list");
  chart.setAttribute("aria-label", `Tasks closed per ${period.unit}`);
  chart.innerHTML = period.values
    .map(
      (value, index) => `
    <div class="tp-col" role="listitem">
      <span class="tp-bar-wrap">
        ${index === period.values.length - 1 ? `<b class="tp-value">${value}</b>` : ""}
        <span class="tp-bar" style="height:${Math.round((value / max) * 85)}%" tabindex="0" data-tip="${labels[index]}: ${value} tasks" aria-label="${labels[index]}: ${value} tasks closed"></span>
      </span>
      <small>${labels[index]}</small>
    </div>`
    )
    .join("");
  document.getElementById("report-throughput-total").textContent = `${closed} total`;

  // Segment widths use flex-grow with the raw values, so they stay proportional with no percentage maths in CSS
  const total = healthData.completed + healthData.progress + healthData.delayed;
  const segments = [
    ["success", "Completed", healthData.completed],
    ["progress", "In progress", healthData.progress],
    ["delayed", "Delayed", healthData.delayed]
  ];
  document.getElementById("report-status-total").textContent = `${total} items`;
  document.getElementById("report-status-stack").innerHTML = segments
    .map(
      ([tone, label, value]) => `
    <span class="status-segment ${tone}" style="flex-grow:${value}" tabindex="0" data-tip="${label}: ${value} (${Math.round((value / total) * 100)}%)" aria-label="${label}: ${value} items"></span>`
    )
    .join("");
  document.getElementById("report-status-legend").innerHTML = segments
    .map(
      ([tone, label, value]) => `
    <div class="overlay-row"><span class="overlay-dot ${tone}"></span>${label}<small class="status-percent">${Math.round((value / total) * 100)}%</small><strong>${value}</strong></div>`
    )
    .join("");

  const done = reportDisciplines.reduce((sum, d) => sum + d.done, 0);
  const all = reportDisciplines.reduce((sum, d) => sum + d.total, 0);
  document.getElementById("report-discipline-total").textContent = `${done}/${all}`;
  document.getElementById("report-discipline-list").innerHTML = reportDisciplines
    .map(
      (d) => `
    <div class="discipline-item">
      <span class="discipline-icon">${d.icon}</span><span class="discipline-name">${d.name}</span>
      <span class="discipline-progress" role="img" aria-label="${d.done} of ${d.total} issued"><span style="width:${Math.round((d.done / d.total) * 100)}%"></span></span><span class="discipline-total"><strong>${d.done}</strong> /${d.total}</span>
    </div>`
    )
    .join("");
}

document.getElementById("report-period").addEventListener("change", renderReporting);

document.getElementById("report-export").addEventListener("click", () => {
  const rows = reportProjects.map((p) => [
    p.name,
    `${p.progress}%`,
    p.tasks,
    p.rfis,
    p.delayed,
    statusLabels[p.status]
  ]);
  downloadText(
    "reos-project-health.csv",
    toCsv([["Project", "Progress", "Tasks", "RFIs", "Delayed", "Status"], ...rows])
  );
});
