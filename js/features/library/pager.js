/**
 * File: js/features/library/pager.js
 * Role: Shared Library pagination footer used by the Library tabs.
 * Dependencies: Loaded by index.html as script 44 of 80. Uses globals from js/core/icons.js. Its globals are used by js/features/library/makes.js, js/features/library/mas.js.
 */

/* Shared Library pagination footer: "Page x of N" plus chevron and numbered controls */
function libraryPagerPages(page, pages) {
  if (pages <= 6) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  const out = [];
  keep.forEach((n, i) => {
    if (i && n - keep[i - 1] > 1) out.push("...");
    out.push(n);
  });
  return out;
}

function renderLibraryPager(el, page, pages, onPage) {
  el.hidden = pages <= 1;
  if (pages <= 1) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `
    <span class="lib-pager-status">Page ${page} of ${pages}</span>
    <nav class="lib-pager-nav" aria-label="Pagination">
      <button class="lib-pager-step" type="button" data-pager-page="${page - 1}" aria-label="Previous page"${page === 1 ? " disabled" : ""}>${icon("pager-prev", 14)}</button>
      ${libraryPagerPages(page, pages)
        .map((n) =>
          n === "..."
            ? '<span class="lib-pager-gap" aria-hidden="true">&hellip;</span>'
            : `<button class="lib-pager-num${n === page ? " active" : ""}" type="button" data-pager-page="${n}"${n === page ? ' aria-current="page"' : ""} aria-label="Page ${n}">${n}</button>`
        )
        .join("")}
      <button class="lib-pager-step" type="button" data-pager-page="${page + 1}" aria-label="Next page"${page === pages ? " disabled" : ""}>${icon("pager-next", 14)}</button>
    </nav>`;
  el.onclick = (e) => {
    const b = e.target.closest("[data-pager-page]");
    if (b && !b.disabled) onPage(Number(b.dataset.pagerPage));
  };
}
