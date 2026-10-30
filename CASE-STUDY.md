# REOS: a workspace for MEP design teams on real estate projects

**Live demo:** https://portfolio-project1-six.vercel.app/
**My role:** Solo redesign: user research, Figma design and prototypes, information architecture improvements, front-end CSS (with Claude as an AI coding assistant), plus standardising the plumbing and fire pump calculations
**Original version:** Built by my team lead with Claude
**Built with:** HTML, CSS, vanilla JavaScript. No framework, no build step.
**Status:** Rolling out internally to about 100–150 people from 30 October 2026.

> This is the public portfolio version. Company, project and model data have been replaced with fictional examples.

---

## The problem

I'm an MEP engineer with 3.2 years of experience on large residential developments; I joined as a graduate engineer trainee. Working day to day inside the design team, I saw that our coordination ran mostly on memory and paper.

- **Tasks weren't really tracked.** People wrote them in personal diaries.
- **Deliverables lived in Excel**, but updating the sheet was manual, so it often didn't happen. Due dates ended up on sticky notes in diaries or stuck to desks.
- **There was no standard deliverables format.** Everyone built their own sheet from scratch, and that took a lot of time.
- **RFIs arrived only by email** and were stored inconsistently: some teams saved them to a shared drive, others didn't, and some stayed in personal Downloads folders. In a busy inbox, even urgent RFIs got missed.
- **Files were hard to find.** Folders weren't organised and files weren't saved consistently, so finding a document meant searching folder after folder.

**The cost was real.** On one project, the site team raised an RFI asking for approval of custom support brackets and a change in pipe sizing for a plumbing shaft. It got buried in email, the reply came late, and construction of that shaft was delayed.

## Who it is for

| User | What they need |
| --- | --- |
| MEP design lead | One view of what is late or due today across every project |
| MEP designers (HVAC, electrical, plumbing, fire) | Their own tasks, RFIs and deliverables in one place, not in diaries and inboxes |
| Site team | The latest issued drawings, and a way to raise RFIs that can't get lost |
| Consultants and other teams | The right documents and contacts, nothing more |

I talked to my team throughout the design. They kept describing the same frustrations: doing everything by hand, and constantly switching between email, Excel, drive folders and chat to piece together one answer.

## What I built

- **Dashboard that starts with what needs attention.** The greeting shows how many items are overdue or due today, followed by critical RFIs and today's deliverables.
- **Project workspace.** Overview, files, team, RFIs, deliverables tracker and transmittals for each project, so nobody has to dig through folders.
- **One standard deliverables tracker**, with Excel import so teams can bring in their existing sheets instead of retyping them.
- **RFIs as tracked records**, not emails, each with a status, an owner and a due date.
- **Transmittals that generate a PDF** in the browser.
- **Library.** Policies, BOQs, standard drawings, approved makes and the MAS (material approval) library, with status pills and pagination.
- **Meetings.** Schedule plus minutes, where an action point becomes a task in one click.
- **Focus mode, daily list, task board and reminder log** to replace the diary and sticky notes.
- **Role-based views.** A Site Team role sees a reduced app: GFC drawings, RFIs, the MAS library (view only) and a QR code on each drawing.
- **Reporting** with CSV export, a people directory, profile, notification preferences, and light/dark/system themes.

✏️ **ADD 3 to 4 SCREENSHOTS HERE:** dashboard, a project workspace, the library, and the site-team view.

## Process

The redesign took about **two months**. I designed every screen in **Figma first** and built clickable **Figma prototypes** to test the flows (navigation, drawers, dialogs) before writing any code. Then I worked through the CSS myself, adjusting spacing, colours, typography and component states until the built app matched my Figma designs exactly.

My team lead built the first version entirely with Claude. It worked, but:
- the code had no real structure
- every page tried to show everything at once
- nearly everything was clickable, so nothing stood out
- it wasn't pleasant to use

I took on the redesign on my own: there was no design team and no formal approval process, so I reviewed my own work and asked colleagues at the office for informal feedback along the way. I used Claude as a coding assistant, but the product decisions were mine: what each page is for, what to cut, how screens are prioritised in Figma, and improvements to the information architecture. I also tuned the CSS by hand to match the design.

Alongside the interface, I used my engineering background to **standardise the plumbing and fire pump calculations** and **update the plumbing BOQ**, so teams no longer each work out these numbers in their own format.

## Key decisions

### 1. Lead with "what needs me today", not with menus
In most tools you open a project and then go looking for what's late. REOS reverses that: the dashboard collects overdue and due-today items from every project, so the first screen answers "what should I do now?" This directly replaces the diary and the sticky notes.

### 2. Less on each screen
The first version's biggest problem was showing too much. In the redesign, each page has one job, secondary details open in drawers and dialogs, and only the main action on a page is visually prominent.

### 3. Different roles see different apps
Site engineers don't need trackers or BOQs; they need the current drawing and a way to ask a question. Instead of hiding buttons one by one, the Site Team role gets its own navigation inside the same layout. The app stays simple for them, and there's still only one codebase.

### 4. Meet teams where their data already is
Teams already had trackers in Excel. Instead of asking them to retype everything, the deliverables tracker imports spreadsheets directly, and transmittals export to the PDF format sites expect.

### 5. No framework, but structured
REOS uses plain HTML, CSS and JavaScript, so it opens anywhere with no build step. During the redesign, to keep about 23,000 lines manageable, the code was:
- split into `core`, `data`, `components`, `layout` and `features` folders, one file per feature, each with a header saying what it does and what it depends on
- given one design-token file for colours, fonts and spacing, which also makes theming possible
- set up to load heavy libraries (SheetJS for Excel, jsPDF for PDFs) only when a user first needs them
- given one `MutationObserver` that upgrades every new select and date input to the custom controls, so feature code never has to remember to
- made to escape all user-entered text before rendering it, to prevent HTML injection

**Trade-off:** scripts share one global scope and depend on load order. That was quick to build but gets harder as the app grows. Moving to ES modules is the next refactor.

## Results

REOS goes live to about **100–150 people** on 30 October 2026. I'll update this section with real usage and feedback after the rollout.

✏️ **AFTER LAUNCH, ADD:** how many people actually use it, what feedback you got, and anything that measurably improved (for example, RFIs answered on time, or no more personal deliverable sheets).

## What I would do next

- Move to ES modules (or React) so dependencies are explicit instead of depending on script order
- Make the layout fully responsive for site engineers on phones
- Add automated tests for the date, filter and permission logic
- Connect the AI RFI review (currently a design prototype with sample output) to a real model
- Persist all edits so the demo keeps changes between visits

## What I learned

✏️ **CHECK THESE ARE TRUE FOR YOU, AND EDIT THEM:**
- **AI can write code fast, but it doesn't make product decisions.** The first version showed that structure, priorities and "what to leave out" have to come from someone who understands the users.
- **Designing in Figma first saved time.** Settling the layout before coding meant far fewer rewrites.
- **Building for my own team made the problem concrete.** Every feature maps to something I had seen go wrong: a missed RFI, a lost file, a deadline on a sticky note.
