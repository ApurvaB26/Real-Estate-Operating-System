/**
 * File: js/core/vendor-loaders.js
 * Role: Lazy loaders for third-party libraries (SheetJS for Excel, jsPDF for transmittals).
 * Dependencies: Loaded by index.html as script 3 of 80. Its globals are used by js/features/library/boqs.js, js/features/project/tracker-import.js, js/features/project/transmittal-pdf.js.
 */

// Cached promise: the library is downloaded once, on first use, and shared by every caller
let sheetJsPromise = null;

function loadSheetJs() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  sheetJsPromise ||= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => {
      // Clear the cache on failure so the next click can retry the download
      sheetJsPromise = null;
      script.remove();
      reject(
        new Error("Couldn't load the Excel reader. Check your connection, or save the sheet as CSV and import that.")
      );
    };
    document.head.append(script);
  });
  return sheetJsPromise;
}

/* TRANSMITTAL PDF (built with jsPDF, loaded on first use) */
let jsPdfPromise = null;

function loadJsPdf() {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  jsPdfPromise ||= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = () => {
      jsPdfPromise = null;
      script.remove();
      reject(new Error("Couldn't load the PDF maker. Check your connection and try again."));
    };
    document.head.append(script);
  });
  return jsPdfPromise;
}
