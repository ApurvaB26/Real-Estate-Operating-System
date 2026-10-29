# REOS (Real Estate Operating System) front end

Plain HTML, CSS and JavaScript. No build step: open `index.html` (Live Server works).
Every file starts with a header comment: `File`, `Role`, `Dependencies`.

## Folders

| Folder | What lives there |
| --- | --- |
| `css/base/` | Colour/font/spacing variables (`tokens.css`) and the reset |
| `css/layout/` | App shell, sidebar, top bar, right rail, library flyout, zoom scaling |
| `css/components/` | Reusable pieces: buttons, forms, select, date picker, dialogs, drawers, tables, cards, meeting card, document viewer, pager, daily list, shared layers |
| `css/pages/` | One file per page or page section (dashboard, projects, project tabs, library, reporting, profile, meetings, site portal ...) |
| `js/core/` | `icons.js` (every icon, loads first), helpers, lazy vendor loaders (SheetJS, jsPDF), the router |
| `js/utils/` | Small DOM helpers and the current-role state |
| `js/data/` | Demo data only (team, RFIs, files, notifications ...). Replace these with real API calls later |
| `js/components/` | Reusable behaviour: date picker, dialogs, toolbar, meeting card, select, layers |
| `js/layout/` | Sidebar, top bar (+ People), right rail, library flyout |
| `js/features/` | One file per feature or page. `project/` holds the project workspace tabs, `library/` the Library tabs, `meetings/` the meetings page |
| `js/main.js` | Start-up: runs last of the core files and wires everything together |

## How the files connect

* `index.html` loads every stylesheet and script directly. Scripts use `defer` and share one global scope, so **the order of the `<script>` tags is the dependency order**: `js/core/icons.js` first (every other script can call `icon()`), then core and data, then components and layout, then features, then `main.js`, then the add-on features (People, Task Board, Reminders, 3D model, Site Team portal, which build on the pages above).
* CSS **cascade order matters**: later `<link>` tags override earlier ones. Rules that share a class were kept in their original relative order, so some sections sit in a later file than you might expect (for example `pages/dashboard-attention.css`).
* A file's header lists which files it uses and which use it.

## Where do I change X?

* Colours, fonts, spacing: `css/base/tokens.css`
* A button/form/dialog/drawer look: `css/components/<name>.css`, its behaviour in `js/components/<name>.js`
* A page's look: `css/pages/<page>.css`; its behaviour in `js/features/<page>.js`
* Icons: `js/core/icons.js` (one named entry per icon; `index.html` uses `<svg data-icon="name">`, JS templates call `icon("name", size)`)
* Demo content: `js/data/`
* Sidebar / top bar / right rail: `css/layout/` and `js/layout/`

## Adding a new feature

1. Add `css/pages/<name>.css` and `js/features/<name>.js` with the header comment.
2. Link them in `index.html`: CSS after the stylesheets it overrides, JS before `main.js` (or after it if it patches existing pages).
3. Put its demo data in `js/data/<name>.js`, loaded before the feature.

For a table of every UI element and the exact file and class to edit, see `EDIT-GUIDE.md`.
