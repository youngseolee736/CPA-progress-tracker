# CPA Progress Tracker

A static front-end app for planning CPA exam study topics, tracking progress, and identifying what needs review.

## Live Site

GitHub Pages link: https://youngseolee736.github.io/CPA-progress-tracker/

## Repository

Repository link: https://github.com/youngseolee736/CPA-progress-tracker


## How to Use the App

1. Add a CPA topic with its exam section and starting status.
2. Use the dashboard to review overall progress.
3. Filter topics by CPA section or study status.
4. Mark topics for review when they need more attention.
5. Reset the planner when you want to start over.

## Features
- Add CPA study topics
- Track topic section and status
- Filter topics by section and status
- View dashboard summary stats
- Mark topics for review
- Delete individual topics
- Reset all planner data
- Empty-state message when no topics match the current view

## JavaScript Concepts Used

- Arrays and objects
- State variables
- Functions
- DOM selection and updates
- Event listeners
- Form handling
- Conditional rendering
- Derived calculations from state

## What I Learned
Through this project, I learned how to use vanilla JavaScript to manage application state and update the page based on user interactions. The app stores CPA profile data, section progress, module status, exam scores, review needs, and planned dates in JavaScript. 

I learned how to use localStorage to save data in the browser. This lets the app remember the user's profile, passed CPA sections, scores, module progress, and calendar plan even after the page is refreshed. I also learned why objects and arrays need to be converted with `JSON.stringify()` before saving and restored with `JSON.parse()` when loading them back.

I also learned how to separate raw input from derived output. For example, the app calculates overall CPA progress, current section progress, score gap, review count, today's focus, and calendar study plan from the saved state instead of showing only static values.

I also learned that UI/UX design is part of front-end development. The first version looked too much like a basic form, so I redesigned it into a study dashboard with sidebar navigation, progress cards, an accordion-style study map, and a calendar view. This made the app easier to use and more like a real study planning tool.
