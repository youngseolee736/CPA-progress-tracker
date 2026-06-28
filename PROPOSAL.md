# PROPOSAL

## What I'm building
A CPA study progress tracker tailored to Becker materials that helps candidates schedule study modules, record practice exam scores, and generate prioritized study plans.

## Who it's for / Why
For CPA candidates using Becker (for example, a working professional preparing for the CPA). This tool reduces friction in balancing topic study with simulated exams and helps focus review on weak areas.

## The state it tracks
- User profile (selected discipline, target score, exam date)
- Roadmap modules (section, module title, planned date)
- Module progress (status: Not Started / In Progress / Completed)
- Practice exam scores and review flags (`needsReview`)
- Generated study plan (dates assigned to modules)

## Core features
1. Add / edit planned dates and status for Becker modules.
2. Record practice scores for mini and simulated exams; mark items that need review.
3. Compute derived progress (weighted: learning 80% / exams 20%) and show overview.
4. Generate an automated study plan that schedules prioritized modules before the target exam date.
5. Calendar and roadmap views with the ability to reset state; data persisted in `localStorage`.

## What I don't know yet
- Exact mapping of Becker content to the roadmap (user may want to customize module names).
- Any preferred UI/visual design constraints (colors, fonts, density).
- Whether to support exporting/importing progress as JSON or CSV.

---

# CPA Progress Tracker Proposal

## What I'm Building

I am building a CPA Progress Tracker, a simple web app that helps users organize CPA exam topics and track their study progress over time.

## Who It's For / Why

This app is for CPA exam candidates who want a lightweight way to see what they have started, what they have completed, and what still needs review. Studying for the CPA exam involves many topics across different sections, so a tracker can make the study plan easier to manage.

## The State It Tracks

The app will track an array of CPA topic objects. Each topic may include:

- Topic name
- CPA exam section
- Current study status
- Whether the topic needs review
- A unique id for updating or deleting the topic

The app will also track filter state for section and status.

## Core Features

- Add a CPA study topic
- Choose the topic's CPA exam section
- Choose or update the topic's study status
- Mark a topic as needing review
- Filter topics by section or status
- Show dashboard summary counts
- Delete a topic
- Reset the full planner

## What I Don't Know Yet

- Whether I should save topics in localStorage or keep the app temporary during the first version
- Which CPA sections or labels will be most useful for the final user experience
- Whether the dashboard should show percentages in addition to counts
- How detailed each topic card should become
