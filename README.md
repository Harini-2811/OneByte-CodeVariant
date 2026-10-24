# Fix It First

**Throw it out? Fix it first.** A guided decision assistant that compares all five circular-economy paths (Repair, Reuse, Repurpose, Replace, Recycle) for any broken or worn-out item, and shows exactly why one comes out on top.

Built for **Code Variant — Build 01, Problem Statement 01: "Fix It First"**.

TRY IT HERE: [one-byte-code-variant.vercel.app/](https://one-byte-code-variant.vercel.app/)

---

## The problem

When something breaks, people rarely know whether to repair, reuse, repurpose, replace or recycle it, so most default to binning it and buying new. Existing tools each answer one question: repair guides assume you will repair, recycling maps assume you will recycle, resale apps assume you will replace. Nothing helps at the moment of failure, across all five options, with reasoning you can check.

## What Fix It First does

| Gap in existing tools | How Fix It First fills it |
|---|---|
| No unified five-path comparison | All five options hang side by side on the **Decision Rail**, ranked and scored |
| Opaque AI recommendations | A transparent **rules engine**: every point is itemised in a **Why?** ledger, and **How we score** shows the full rulebook |
| No help at the point of failure | A 90-second, tap-based **diagnosis wizard**, or describe the item in a sentence |
| Cost, time and effort ignored | Every option shows cost range, time, difficulty, effort and planet impact |
| Repurposing is an afterthought | Repurpose is a first-class path with ideas, materials, effort and safety notes |
| Electronics over-represented | 7 categories and 35 item types: electronics, appliances, furniture, clothing, cables, kitchenware, accessories |
| No lightweight history | **My shelf** keeps every item for the session, with stats, comparison and export, no login |

## The experience

The whole product is one metaphor: **a repair workbench**. Items are line-drawn on a green cutting mat, the technician's notes are handwritten, and verdicts hang as yellow repair tags.

1. **Home**: the headline repairs itself; one-click sample items (including a safety case) jump straight to a result; a quick "What broke today?" box recognises the item and symptom from plain words.
2. **Diagnose** (5 steps): category and item, age and condition, problems with severity, what matters to you, review. The item draws itself on the mat as you answer. Drafts save automatically.
3. **Diagnosing**: a short scan sequence while each path is weighed (and unsafe ones ruled out).
4. **Decision Rail**: five tags on a rail, ranked. Tap **Why?** for the itemised score. Change anything in **What if?** (DIY skill, budget, warranty, priority) and the tags physically re-rank live. Switch to a table view, share a link, or print.
5. **Work order**: a step-by-step plan for the chosen path, with a DIY or professional toggle for repairs, tools, questions to ask, links to find nearby services, repurpose idea cards and material-specific recycling guidance. Progress is saved.
6. **My shelf**: session stats (items diagnosed, kept in use, estimated CO₂e avoided, money kept vs buying new), filters, side-by-side comparison of up to 3 items, JSON export and clear.
7. **Common fixes**: a searchable pegboard of common problems, repurpose ideas and a "Recycle right" material guide. Any problem starts a pre-filled diagnosis.

### Safety first
Hazards (swollen battery, exposed wire, burning smell, flaking non-stick coating) trigger an immediate warning, **block Reuse and Repurpose**, rule out DIY repair, and steer towards professional repair or safe recycling.

## Surprise challenge: the Canvas Protocol

There are no action buttons anywhere in the app. Every action is done by dragging a data card into an Action Zone, and each one fits the workbench theme:

| Action | Card | Action Zone |
|---|---|---|
| Start a diagnosis | Blank ticket | The green bench on the home page |
| Start with a category | Category card on the pegboard | Workbench tile |
| Diagnose a sample item | Sample card | The green bench |
| Start from a description | Your typed note card | Workbench |
| Go to the next wizard step | "Step N answers" card | Next zone |
| Run the diagnosis | Intake ticket | Workbench |
| Diagnose a common problem | Problem card (Common fixes) | Workbench |
| Open a plan | Any option tag from the rail | Work order |
| Choose an option | Any option tag from the rail | My decision |
| Undo What-if changes | "My original answers" chip | Restore |
| Share or print a result | "This result" chip | Share link / Print |
| Print a plan | "This plan" chip | Print |
| Complete a plan step | Step card | Done (drag back to To do to undo) |
| Save your decision | Decision ticket | My shelf (drag back to undo) |
| Compare items | Shelf item | Compare tray (drag a chip out to remove it) |
| Delete an item | Shelf item | Scrap bin |
| Export the shelf | "My shelf" chip | Export JSON |

Navigation is plain text links, and answer choices (chips, sliders, inputs), view toggles, tabs and the theme switch stay as direct controls, because they are answers and settings rather than actions.

**Making it obvious:** every card has grip dots, short grey hints say what to drag where, zones pulse when a matching card is picked up, and every zone says what releasing will do.

How it works (`src/components/Canvas.tsx`, built on dnd-kit):
- **Mouse, touch and keyboard.** Keyboard users focus a card, press Space or Enter to pick it up, use the arrow keys to jump between zones, and press Space or Enter to drop it (Escape cancels).
- **Screen reader announcements** for pick-up, movement over zones, drop and cancel.
- **Clear affordances:** grip dots on every card; zones pulse in their path colour while a matching card is being dragged, glow when it is over them, explain what releasing will do, and stamp when the card lands. Zones that don't accept the card fade out.
- **Built for phones too:** press and hold to pick a card up. On small screens the page's zones slide into a dock at the bottom of the screen while you drag, tall cards travel as a small chip just above your finger so they never hide the target, and on Home the bench sits right above the cards.
- **Safety still applies:** options blocked for safety can't be picked up.

## The decision engine

`src/engine/engine.ts` is a pure, unit-tested function: `evaluate(answers) → result`.

- Each path starts from a **category baseline**.
- Rules for age, usage, condition, whether it works, warranty, each symptom × severity, safety, DIY skill, repair access, budget vs estimated repair cost (including the "repair costs over 60% of new" rule), time pressure and the user's top priority each **add or subtract points and record a plain-language reason**.
- Scores are clamped to 1–99; blocked paths are 0. The ranking, confidence (gap between the top two), cost/time/difficulty/effort/eco trade-offs and estimated CO₂e and money saved are returned together.
- Because it is pure, **What if?** simply re-runs it on every change.

Costs are typical Indian ranges in rupees and CO₂e figures are rounded, indicative footprints. The interface labels them as estimates.

## Design and motion

- **Palette**: workshop grey, ink green, cutting-mat green, caution-tag yellow. Path colours appear only on data.
- **Type**: Bricolage Grotesque (display), Atkinson Hyperlegible (body, chosen for readability), Caveat (technician notes only).
- **Light and dark mode**: follows the system, remembers the choice, never flashes on load, and switches with a circular reveal. Dark mode is a "workshop at night" palette, not inverted colours.
- **Motion**: headings rise line by line with a focus pull; sketches draw themselves; tags drop and swing onto the rail and re-rank with spring physics; scores count up. A calm ambient background (drifting grid, slow light, a lamp that follows the pointer) runs behind everything.
- **Accessibility**: semantic HTML, skip link, visible focus, keyboard-operable everything, ARIA for toggles, progress and live regions, sufficient contrast in both themes, and **all motion disabled under `prefers-reduced-motion`**.
- **Responsive**: from 360px phones to wide desktops; the rail becomes a vertical list on small screens.

## Tech

React 18 · TypeScript (strict) · Vite · React Router · Framer Motion · Vitest. No backend: state lives in `sessionStorage`, shared results travel in the URL.

```
src/
  data/         categories, items, symptoms, paths, guides, presets (all content is data)
  engine/       engine.ts (rules), format.ts, match.ts (plain-words matcher), engine.test.ts
  state/        session store (sessionStorage), share-link encoding
  components/   shell (header, theme, background, drag guide), Canvas (drag and drop), sketch, scoring guide, UI primitives
  pages/        Home, Diagnose, Analysing, Results, Plan, Shelf, Library, Misc (shared link, 404)
  styles/       app.css (design tokens and system)
```

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # engine unit tests
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
```

## Deploy

- **Vercel**: import the repo; framework "Vite". `vercel.json` already rewrites all routes to `index.html`.
- **Netlify**: build command `npm run build`, publish directory `dist`. `public/_redirects` handles routing.

## Adding to it

Content is data, so most changes need no UI work:
- New category, item or symptom → `src/data/categories.ts`
- New rule → one `add(path, points, reason)` line in `src/engine/engine.ts` (the reason shows up in the Why? ledger automatically)
- New plan steps, repurpose ideas, materials or common problems → `src/data/guides.ts`
- New page → `src/pages/` plus one `<Route>` in `src/App.tsx`
