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
