/**
 * File: js/features/library/boqs.js
 * Role: Library BOQs: spreadsheet view and Excel download.
 * Dependencies: Loaded by index.html as script 45 of 80. Uses globals from js/core/utils.js, js/core/vendor-loaders.js, js/data/boq-sheets.js, js/features/library/library.js, js/core/icons.js. Its globals are used by js/features/document-viewer.js.
 */

const boqItemCount = (sheet) => sheet.reduce((sum, bill) => sum + bill.items.length, 0);

// The list shows the real item count of each BOQ
libraryTabs.boqs.docs.forEach((doc) => {
  const sheet = boqSheets[doc.no];
  if (sheet)
    doc.meta = `Excel · ${boqItemCount(sheet)} line items · ${sheet.length} bill${sheet.length === 1 ? "" : "s"}`;
});

// Spreadsheet rows: bill title, preamble notes, then items (row numbers like the source sheet)
// Flattens bills into the same row order as the source spreadsheet: bill heading, its notes, then its items
function boqRows(sheet) {
  const rows = [];
  sheet.forEach((bill) => {
    rows.push({ kind: "bill", desc: bill.bill.toUpperCase() });
    bill.notes.forEach((note) => rows.push({ kind: "note", desc: note }));
    bill.items.forEach((item) => rows.push({ kind: "item", ...item }));
  });
  return rows;
}

function boqSheetHtml(doc) {
  const sheet = boqSheets[doc.no] || [];
  const rows = boqRows(sheet);
  return `
    <div class="doc-viewer boq-viewer">
      <div class="doc-viewer-bar">
        <span>${boqItemCount(sheet)} line items · ${sheet.length} bill${sheet.length === 1 ? "" : "s"}</span>
        <label class="policy-search boq-search">
          ${icon("search")}
          <input type="search" data-boq-search aria-label="Search this BOQ" placeholder="Search items...">
        </label>
      </div>
      <div class="boq-sheet-scroll">
        <table class="boq-sheet">
          <thead><tr><th class="boq-rownum"><span class="visually-hidden">Row</span></th><th class="boq-no">Item</th><th>Item Description</th><th class="boq-unit">Unit</th><th class="boq-qty">Quantity</th></tr></thead>
          <tbody>
            ${rows
              .map(
                (row, index) => `
              <tr class="boq-${row.kind}" data-boq-row="${row.kind}">
                <td class="boq-rownum">${index + 2}</td>
                <td class="boq-no">${escapeHtml(row.no || "")}</td>
                <td>${escapeHtml(row.desc).replace(/\n/g, "<br>")}</td>
                <td class="boq-unit">${escapeHtml(row.unit || "")}</td>
                <td class="boq-qty">${escapeHtml(row.qty || "")}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <p class="policy-empty" data-boq-empty hidden>No items match your search.</p>
      </div>
    </div>`;
}

async function downloadBoq(doc, rows) {
  const table = [
    ["Item", "Item Description", "Unit", "Quantity"],
    ...rows.map((row) => [row.no || "", row.desc, row.unit || "", row.qty || ""])
  ];
  // Replace characters Windows does not allow in file names
  const fileName = `${doc.no} ${doc.name}`.replace(/[\\/:*?"<>|]+/g, "-");
  try {
    const XLSX = await loadSheetJs();
    const sheet = XLSX.utils.aoa_to_sheet(table);
    sheet["!cols"] = [{ wch: 8 }, { wch: 90 }, { wch: 10 }, { wch: 12 }];
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "BOQ");
    XLSX.writeFile(book, `${fileName}.xlsx`);
    showToast(`Downloaded ${doc.no} as Excel.`);
  } catch {
    // The Excel library is loaded from a CDN on demand; if that fails, a CSV is the fallback so the download never dead-ends
    // Offline: CSV still opens in Excel
    downloadText(`${fileName}.csv`, toCsv(table));
    showToast(`Downloaded ${doc.no} as CSV (Excel reader unavailable offline).`);
  }
}
