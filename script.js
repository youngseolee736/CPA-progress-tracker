const topics = [];
let currentSectionFilter = "all";
let currentStatusFilter = "all";

const topicForm = document.querySelector("#topic-form");
const sectionFilter = document.querySelector("#section-filter");
const statusFilter = document.querySelector("#status-filter");
const resetButton = document.querySelector("#reset-button");

function addTopic(event) {
  event.preventDefault();
  // Future implementation: read form values, add a topic object, then re-render.
}

function deleteTopic(topicId) {
  // Future implementation: remove a topic by id, then re-render.
}

function updateTopicStatus(topicId, newStatus) {
  // Future implementation: update one topic's status, then re-render.
}

function toggleReview(topicId) {
  // Future implementation: switch a topic's review flag between true and false.
}

function calculateStats() {
  // Future implementation: derive totals from the topics array.
  return {
    total: topics.length,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    review: 0,
  };
}

function renderDashboard() {
  const stats = calculateStats();

  document.querySelector("#total-topics").textContent = stats.total;
  document.querySelector("#not-started-topics").textContent = stats.notStarted;
  document.querySelector("#in-progress-topics").textContent = stats.inProgress;
  document.querySelector("#completed-topics").textContent = stats.completed;
  document.querySelector("#review-topics").textContent = stats.review;
}

function renderTopics() {
  // Future implementation: filter topics and build topic cards in the topic list.
}

function resetPlanner() {
  // Future implementation: clear all topic data and reset filters.
}

topicForm.addEventListener("submit", addTopic);

sectionFilter.addEventListener("change", function (event) {
  currentSectionFilter = event.target.value;
  renderTopics();
});

statusFilter.addEventListener("change", function (event) {
  currentStatusFilter = event.target.value;
  renderTopics();
});

resetButton.addEventListener("click", resetPlanner);

renderDashboard();
renderTopics();
