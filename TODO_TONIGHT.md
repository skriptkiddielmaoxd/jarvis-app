# Tonight — UI cleanness & product feel (4–5h)

Focus: polish the Jarvis frontend in `desktop/ui` (Tailwind + shadcn/ui). Keep backend minimal — only frontend UX matters tonight.

Checklist (4–5 hours):

- [ ] Layout — header + two-panel cards

	- Files: `desktop/ui/src/App.jsx`
	- Tasks: responsive two-column layout, prominent header typography, card containers for input and output, spacing and elevation.

- [ ] Typography & spacing consistency

	- Files: `desktop/ui/src/App.jsx`, `desktop/ui/src/components/IntentInput.jsx`, `desktop/ui/src/components/OutputPanel.jsx`, `desktop/ui/src/components/HelpPanel.jsx`, `desktop/ui/src/components/ProjectSelector.jsx`
	- Tasks: harmonize font sizes/weights, consistent paddings/margins, line-height, and rhythm using Tailwind scale.

- [ ] Premium input flow

	- Files: `desktop/ui/src/components/IntentInput.jsx`
	- Tasks: example chips, character counter + remaining, max length, keyboard hint (Ctrl/Cmd+Enter), polished loading/disabled states, improved focus ring.

- [ ] Output panel polish

	- Files: `desktop/ui/src/components/OutputPanel.jsx`
	- Tasks: rendered/raw tabs, copy + download actions, toast feedback, scrollable markdown region, helpful empty state, sticky controls.

 [x] Help modal polish (COMPLETED)

	- Files: `desktop/ui/src/components/HelpPanel.jsx`
	- Tasks: quick-start, copyable examples, common errors, keyboard accessibility (Esc + focus restore), clearer headings and spacing.

 - [x] Final polish pass (COMPLETED)

	- Files: multiple

	- Tasks: dividers, empty/error states, subtle transitions, aria labels, and a final pass for spacing and consistency.

	Notes: Added focus rings and aria labels for keyboard users, consistent button focus/hover states, replaced inline toast with shared `Toast` component, small divider in `App.jsx`, and subtle transitions.

File-by-file edits to apply (minimal, high-impact):

- `App.jsx`: refactor to two-panel responsive grid, stronger header typography, dedicated output card, small error banner area.
- `components/HelpPanel.jsx`: clear quick-start, copyable example buttons, ensure Esc closes and focus restores, increase heading contrast.
- `components/IntentInput.jsx`: example chips, remaining counter, max-length, keyboard hint, improved textarea padding and focus ring.
- `components/ProjectSelector.jsx`: ensure consistent spacing and small helper text under selector; show concise warning area if loading fails.
- `components/OutputPanel.jsx`: add rendered/raw tabs, download button, toast notifications, scrollable content container, and empty state copy.
- `components/Toast.jsx` (new, small): reusable toast for copy/download feedback.

Place these checkboxes at the top of this file and treat them as tonight's priority — I will implement the file edits when you say "go".

---

Phase 1 — Hardening the UI + API boundary (≈1.25h)
# Tonight's TODOs

This file is a checklist of short, actionable tasks to finish the UI + backend polish. The top item is currently in-progress.

## Phase 1 — Hardening the UI + API boundary (≈1.25h)

- [x] Centralize API error handling (COMPLETED)

	Files: desktop/ui/src/api.js

	Goals: normalize backend errors into { type, message } and distinguish network-down, validation error, server error.

	Tests: stop backend and submit; send invalid intent; confirm UI messages differ.

	Note: Local sanity check completed — `/health`, `/projects`, and POST `/intent` succeeded and an artifact was written.

- [ ] Add global error banner

	Files: desktop/ui/src/App.jsx

	Behavior: appears at top, dismissible, used for backend-down and fatal errors.

- [ ] Add retry flow

	Button: “Retry last request”. Stores last intent + project in state and reuses same API call.

## Phase 2 — Project system UX polish (≈1h)

- [ ] Improve project selector UX

	File: desktop/ui/src/components/ProjectSelector.jsx — show description/tooltip if present; show warning if project config fails to load.

- [ ] Add “refresh projects” button

	Re-fetch `/projects` — useful when configs change without restart.

- [ ] Add project-specific help text

	If config contains help/description, show it under the selector.

## Phase 3 — Output usability (≈1h)

- [ ] Improve OutputPanel layout

	File: desktop/ui/src/components/OutputPanel.jsx — make markdown area scrollable; keep copy buttons sticky.

- [ ] Add “Save as file” button

	Downloads REQUEST-<timestamp>.md using the browser download API.

- [ ] Add minimal history

	Keep last 3–5 outputs in memory and allow selecting older ones.

## Phase 4 — First “shareable” pass (≈1h)

- [ ] Remove hardcoded personal paths & document .env

	Verify no personal paths are embedded and document `.env` usage.

- [ ] Add README.md skeleton

	What Jarvis is, how to run locally, example intent, project config format.

- [ ] Add projects/example.json

	Generic example project config (not tied to this repo).

## Phase 5 — Final sanity tests (≈30–45 min)

- [ ] Final sanity tests

	Fresh terminal run: stop everything, start server, start UI. Run through: load projects, submit valid intent, submit invalid intent, stop backend and retry, copy markdown, download file. Fix only major WTF moments.

---

## Work completed (recent edits)

- Updated layout and header for cleaner two-column product feel.
	- File: desktop/ui/src/App.jsx — responsive two-panel layout, improved header typography, dedicated output card.

- Polished the input experience (examples, counter, max length, keyboard hint).
	- File: desktop/ui/src/components/IntentInput.jsx — example chips, remaining counter, max length, improved textarea styling and accessibility.

- Improved output panel usability (tabs, download, toasts).
	- File: desktop/ui/src/components/OutputPanel.jsx — rendered/raw tabs, download button, copy -> toast flow, scrollable markdown area, empty state.

These are small, high-impact changes intended to improve the product feel while leaving backend behavior untouched.

