# Jarvis Web UI Modernization Plan

## Overview
This document details a step-by-step plan to rework the Jarvis Web UI into a modern, maintainable frontend using React, Vite, Tailwind CSS, and shadcn/ui. The new UI will be integrated with the existing Express backend and designed for a desktop-app feel, suitable for Electron wrapping.

---

## 1. Scaffold React+Vite+Tailwind App (30–45 min)
- **Create new app**: Use `npm create vite@latest` in `/desktop/ui` (or `/client`) with the React template.
- **Initialize git**: If not already done, run `git init` in the new folder.
- **Install dependencies**:
  - Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
  - shadcn/ui: Follow [shadcn/ui setup guide](https://ui.shadcn.com/docs/installation)
- **Configure Tailwind**: Generate config files, update `tailwind.config.js` and `postcss.config.js`.
- **Test**: Run `npm run dev` and confirm the app loads and Tailwind styles apply.

---

## 2. Implement Project Selector & Intent Input (45–60 min)
- **Project selector**:
  - Fetch `/projects` from backend, populate dropdown.
  - Show loading/error states.
- **Intent input**:
  - Textarea with placeholder examples, character counter.
  - Disable submit until valid (e.g., min length).
- **Submit button**:
  - Show loading and error states.
- **Test**: Can select project, type intent, submit is disabled until valid.

---

## 3. Build Output Panel & UX Features (45–60 min)
- **Output panel**:
  - Show `request_path` (with copy button).
  - Show `request_markdown` (toggle raw/rendered view).
  - "Copy markdown" button.
  - "Open in GitHub" link (when possible).
- **UX improvements**:
  - Persist last selected project and intent in `localStorage`.
  - Keyboard shortcut: Ctrl+Enter to submit.
- **Test**: Output panel updates, copy works, persistence works.

---

## 4. Add Help/Onboarding Panel (30–45 min)
- **Help panel/page**:
  - Explain what Jarvis does (intent → artifact).
  - Example intents.
  - Common errors (GitHub auth, validation failures).
  - Link from main UI.
- **Test**: Help panel accessible, content clear.

---

## 5. Integrate Build with Express Server (30–45 min)
- **Build frontend**: Run `npm run build` to output static files.
- **Serve from Express**:
  - Update `/server/index.js` to serve built files at `/ui` (replace inline HTML).
- **Update Electron**:
  - Point Electron to load the built frontend instead of the old HTML string.
- **Test**: App loads via Electron and browser, all features work.

---

## 6. Definition of Done Review & Stretch Goals (30 min)
- **Review**:
  - All features work as described.
  - UX is clear and desktop-like.
  - Electron loads new UI.
  - No backend changes required.
- **Stretch goals** (if time remains):
  - Dark mode toggle.
  - Better error banners.
  - Animated transitions.
  - Settings panel.

---

## How to Ensure the Todo List is Followed
- The todo list is persisted and visible in your workspace.
- Before starting a task, mark it as "in-progress".
- After completing a task, mark it as "completed".
- Only one task should be "in-progress" at a time.
- I will always check and update the todo list before and after each step.
- You can review progress at any time by asking for the current todo list or status.
- If you want to reprioritize or add/remove tasks, just update the todo list and I will follow the new order.

---

## Summary Table
| Step | Task | Key Files/Folders |
|------|------|------------------|
| 1 | Scaffold app | /desktop/ui, tailwind.config.js |
| 2 | Project selector/input | /desktop/ui/src/components/ProjectSelector.jsx, IntentInput.jsx |
| 3 | Output panel/UX | /desktop/ui/src/components/OutputPanel.jsx |
| 4 | Help panel | /desktop/ui/src/components/HelpPanel.jsx |
| 5 | Integrate build | /server/index.js, /desktop/main.js |
| 6 | Review/stretch | All above |

---

## Notes
- No backend changes required except serving static files.
- All endpoints and data contracts remain the same.
- Local development and Electron desktop use are both supported.
