/**
 * File: js/features/project/rfi-ai-review.js
 * Role: Adds the AI draft review action to each RFI and handles accept/reject.
 * Dependencies: Loaded by index.html as script 77 of 80. Uses globals from js/components/layers.js, js/core/utils.js, js/core/icons.js. Nothing else calls into it; it wires itself up on load.
 */

/* ---------- RFIs: AI draft review ---------- */
const rfiList2 = $("#project-rfi-list");
function decorateRfis() {
  $$("tr.project-task-row", rfiList2).forEach((tr, i) => {
    if (tr.dataset.ai || i > 3) return; tr.dataset.ai = "1";
    const id = tr.cells[0]?.textContent.trim(); const last = tr.cells[tr.cells.length - 1];
    last.insertAdjacentHTML("beforeend", ` <button class="cx-ai" type="button" data-ai="${h(id)}">${icon("spark", 13)} AI draft ready</button>`);
  });
}
// The RFI list re-renders on every filter or edit and drops our buttons, so decorate again after each change
new MutationObserver(decorateRfis).observe(rfiList2, { childList: true }); decorateRfis();
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-ai]"); if (!b) return;
  const id = b.dataset.ai;
  drawer(`AI draft review · ${id}`, `<div class="cx-banner is-info">${icon("spark", 16)}<div><strong>AI draft.</strong> Prepared automatically when the RFI was uploaded. Nothing is final until you decide.</div></div>
    <details class="cx-acc" open><summary>Draft calculation</summary><p>Duct 800×400 at grid C4 needs 450 mm clear under the beam. Available: 380 mm. <strong>Shortfall: 70 mm.</strong></p></details>
    <details class="cx-acc" open><summary>Preliminary comments</summary><ul><li>Reroute the duct below the beam with a transition at C3.</li><li>Confirm ceiling height with the architect (schedule v1 shows 2.4 m).</li></ul></details>
    <details class="cx-acc" open><summary>Flagged discrepancies</summary><ul><li><span class="cx-tag is-warn">Check</span> Layout Rev C shows 380 mm; structural drawing v2 shows 420 mm.</li></ul></details>
    <div class="cx-row cx-end"><button class="cx-btn is-bad" type="button" data-ai-decide="Rejected" data-id="${h(id)}">${icon("x", 16)} Reject</button><button class="cx-primary" type="button" data-ai-decide="Approved" data-id="${h(id)}">${icon("check", 16)} Approve</button></div>`);
});
document.addEventListener("click", (e) => { const b = e.target.closest("[data-ai-decide]"); if (!b) return; closeLayer(); showToast(`${b.dataset.id} ${b.dataset.aiDecide.toLowerCase()}. Your decision is recorded with the AI draft.`); });
