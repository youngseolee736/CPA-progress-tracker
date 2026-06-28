# PRD — Becker-based CPA Study Tracker

## Overview
Purpose: a lightweight, front-end-only study tracker for CPA candidates using Becker. The app helps users plan Becker modules, record practice exam scores, and generate prioritized study plans before a target exam date.

Audience: students and professionals preparing for the CPA exam using Becker materials.

Constraints: vanilla JavaScript only, no external APIs or CDNs, static files deployable to GitHub Pages. Data persisted locally using `localStorage`.

## Goals
- Make it easy to track module progress and practice exam performance.
- Produce a prioritized, date-based study plan that schedules high-priority items before the exam date.
- Provide calendar and roadmap views to visualize schedule and progress.

## Core Features (Priority)
1. Roadmap (module list): add / edit / remove modules; set `plannedDate`; change `status` (Not Started / In Progress / Completed); mark `needsReview`.
2. Score recording & analysis: enter scores for mini and simulated exams; compute averages and highlight weak modules.
3. Automatic study plan generation: generate dates for prioritized modules using weighted scoring (Learning 80% / Exams 20%) and days until exam.
4. Calendar view: show planned modules by date and quick access to edit entries.
5. Profile/Settings: set `selectedDiscipline`, `examDate`, `targetScore`, and passed sections.

## Views
- Roadmap: grouped by section; each row shows title, status pill, planned date, Edit button, and simulated-note for simulated exams.
- Calendar: month/week navigation; shows modules assigned to dates.
- Study Plan (Plan): list of scheduled plan-days after generation with reasons for selection.
- Profile / Settings: inputs for exam date, target score, discipline, and passed sections.

## Data Model

- Profile (object)
  - `selectedDiscipline` (string)
  - `examDate` (string, ISO date)
  - `targetScore` (number)
  - `passedSections` (array of {section, score})

- Module (per-section)
  - `id` (string) — unique, e.g., "REG-3"
  - `section` (string)
  - `title` (string)
  - `plannedDate` (string, ISO date or empty)
  - `status` ("Not Started"|"In Progress"|"Completed")
  - `score` (number|string — empty if none)
  - `needsReview` (boolean)

- Progress store
  - Saved in `localStorage` under a single key; structure mirrors roadmap by section.

## Interactions
- Add module: form input -> append to roadmap state -> re-render roadmap.
- Edit module: open inline editor or modal -> save changes -> recalc study-plan metrics.
- Set planned date: date input -> update module -> reflect in calendar view.
- Change status: select dropdown -> update -> affect completion percent & plan generation.
- Enter score: number input for exam modules -> update average/weaknesses -> mark `needsReview` if below threshold.
- Generate plan: button -> compute prioritized list -> output plan-days with assigned dates -> apply to module plannedDates (optional per-user confirmation).
- Reset: clear localStorage and restore defaults.

## Derived Outputs & Calculations
- Per-section progress: weighted percent where Learning modules = 80% weight; Exam modules = 20% weight.
- Average score: arithmetic mean of entered exam scores (rounded).
- Priority score for modules: composite of `needsReview`, status, and exam score gaps. Used to order items for scheduling.

## Accessibility & UX
- Use semantic HTML elements and labels for form fields.
- Buttons and interactive elements must be keyboard-focusable.
- Color usage must not be the only means of conveying status (also use text/pills).

## Acceptance Criteria
- Runs entirely in browser with only HTML/CSS/JS files.
- At least 3 distinct interaction types implemented (form submit, button click, date input, select, etc.).
- Derived outputs update on state change (percentages, averages, generated plan).
- App persists state in `localStorage` and provides a reset option.
- Deployed to GitHub Pages with README linking repo and live site.

## Milestones
1. Milestone 0 — Proposal & PRD: `PROPOSAL.md` and this `PRD.md` (done).
2. Iteration 1 — Skeleton: HTML/CSS layout, Roadmap list, add/edit module, localStorage persistence, deploy initial version.
3. Iteration 2 — Core features: score input + analysis, generate plan algorithm (80/20 weighting), calendar view, profile/settings.
4. Iteration 3 — Polish: accessibility checks, reset, export/import optional, responsive styling, tests and weekly logs.

## Risks & Unknowns
- Mapping Becker content precisely — user customization is required.
- Plan generation edge-cases when the exam date is close or modules exceed available days.

## Next Steps
1. I will generate the initial code scaffold (index.html, style.css, script.js) and wire the Roadmap view.
2. Implement persistence and milestone 1 features; push to a new public GitHub repo and enable Pages.
# CPA Progress Tracker PRD

## Product Overview

CPA Progress Tracker is a static web app that helps CPA exam candidates manage study topics and monitor progress. The app uses vanilla HTML, CSS, and JavaScript and runs directly in the browser.

## Target User

The target user is a CPA exam candidate who wants a simple, focused way to track study topics across CPA exam sections.

## Problem Statement

CPA exam preparation includes many topics across multiple sections. Without a tracker, it can be difficult to remember what has been started, completed, or flagged for review.

## Goals

- Help users organize CPA study topics in one place
- Make progress visible through summary statistics
- Let users update topic status as they study
- Support quick filtering by section and status
- Keep the app simple enough to use without setup

## Non-Goals

- User accounts or authentication
- Backend storage
- External APIs
- Frameworks, libraries, or package managers
- Full exam scheduling or calendar planning
- Official CPA exam content coverage

## User Stories

- As a CPA candidate, I want to add a study topic so I can track it.
- As a CPA candidate, I want to assign each topic to a section so I can organize my work.
- As a CPA candidate, I want to update a topic's status so my progress stays current.
- As a CPA candidate, I want to mark a topic for review so I know what needs more attention.
- As a CPA candidate, I want to filter topics so I can focus on one section or status at a time.
- As a CPA candidate, I want to see dashboard totals so I can understand my overall progress.

## State Design

The main state will be stored in JavaScript variables:

- `topics`: an array of topic objects
- `currentSectionFilter`: the active CPA section filter
- `currentStatusFilter`: the active status filter

Each topic object may include:

- `id`: unique topic identifier
- `name`: topic name
- `section`: CPA section value
- `status`: study status value
- `needsReview`: boolean review flag

## Interactions

- Submit the add topic form to create a new topic
- Change a status control to update progress
- Click a review control to toggle review state
- Click a delete control to remove a topic
- Change filters to update the visible topic list
- Click reset to clear the planner

## Derived Output

The app will calculate:

- Total number of topics
- Number of not started topics
- Number of in progress topics
- Number of completed topics
- Number of topics marked for review
- Filtered topic list based on current filter state

## Edge Cases

- User submits an empty topic name
- No topics have been added yet
- Filters produce no matching topics
- User resets the planner accidentally
- Topic names are very long
- Multiple topics have similar names

## Possible Extensions

- Save data with localStorage
- Add progress percentages
- Add due dates or target review dates
- Add notes for each topic
- Add priority levels
- Group topics by CPA exam section
- Export or print the study plan
