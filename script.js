const PROFILE_KEY = "cpaProgressProfile";
const PROGRESS_KEY = "cpaRoadmapProgress";
const LEGACY_TOPICS_KEY = "cpaProgressTopics";
const STATUSES = ["Not Started", "In Progress", "Completed"];
const DAY_IN_MS = 86400000;

const cpaRoadmap = {
  FAR: [
    "F1 • Financial Reporting",
    "F2 • Financial Reporting and Disclosures",
    "Mini Exam 1",
    "F3 • Assets and Related Topics",
    "F4 • Liabilities",
    "Mini Exam 2",
    "F5 • Investments, Statement of Cash Flows, and Income Taxes",
    "F6 • NFP Accounting and Governmental Accounting",
    "Mini Exam 3",
    "Simulated Exam 1",
    "Simulated Exam 2",
  ],
  AUD: [
    "A1 • Audit Reports",
    "A2 • Engagement Quality and Acceptance, Planning, and Internal Control",
    "Mini Exam 1",
    "A3 • Risk, Evidence, and Sampling",
    "A4 • Performing Further Procedures, Forming Conclusions, and Communications",
    "Mini Exam 2",
    "A5 • Integrated Audits, Attestation Engagements, Compliance, and Government Audits",
    "A6 • Accounting and Review Service Engagements, Interim Reviews, and Ethics and Professional Responsibilities",
    "Mini Exam 3",
    "Simulated Exam 1",
    "Simulated Exam 2",
  ],
  REG: [
    "R1 • Federal Taxation of Individuals",
    "R2 • Property Taxation",
    "Mini Exam 1",
    "R3 • Entity Taxation",
    "R4 • Professional Responsibilities and Federal Tax Procedures",
    "Mini Exam 2",
    "R5 • Business Law: Part 1",
    "R6 • Business Law: Part 2",
    "Mini Exam 3",
    "Simulated Exam 1",
    "Simulated Exam 2",
  ],
  BAR: [
    "B1 • Risk Management and Economic Analysis",
    "B2 • Financial Management",
    "B3 • Operations Management",
    "Mini Exam 1",
    "B4 • Technical Accounting and Reporting",
    "B5 • Governmental Accounting",
    "Mini Exam 2",
    "Simulated Exam 1",
    "Simulated Exam 2",
  ],
  ISC: [
    "S1 • Regulations, Standards, and Frameworks",
    "S2 • Information Systems and Data Management",
    "Mini Exam 1",
    "S3 • Security and Confidentiality",
    "S4 • System and Organization Controls (SOC) Engagements",
    "Mini Exam 2",
    "Simulated Exam 1",
    "Simulated Exam 2",
  ],
  TCP: [
    "T1 • Tax Compliance and Planning for Individuals",
    "T2 • Tax Compliance and Planning for Corporations",
    "Mini Exam 1",
    "T3 • Tax Compliance and Planning for Flow-Through and Other Entities",
    "T4 • Property Transactions",
    "Mini Exam 2",
    "Simulated Exam 1",
    "Simulated Exam 2",
  ],
};

let profile = loadProfile();
let progress = loadProgress();
let generatedStudyPlan = null;
let expandedModuleId = null;

function loadProfile() {
  const savedProfile = localStorage.getItem(PROFILE_KEY);

  if (!savedProfile) {
    return {
      currentSection: "REG",
      passedSections: [],
      latestScore: "",
      targetScore: 75,
      examDate: "",
    };
  }

  try {
    return { targetScore: 75, passedSections: [], ...JSON.parse(savedProfile) };
  } catch {
    return {
      currentSection: "REG",
      passedSections: [],
      latestScore: "",
      targetScore: 75,
      examDate: "",
    };
  }
}

function saveProfile() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function loadProgress() {
  const savedProgress = localStorage.getItem(PROGRESS_KEY);

  if (!savedProgress) {
    return {};
  }

  try {
    return JSON.parse(savedProgress);
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function getNumberValue(selector, fallback = 0) {
  const element = document.querySelector(selector);
  const value = Number(element.value);
  return Number.isNaN(value) ? fallback : value;
}

function getCurrentSection() {
  return cpaRoadmap[profile.currentSection] ? profile.currentSection : "REG";
}

function getModuleId(section, index) {
  return `${section}-${index}`;
}

function getDefaultModuleProgress(section, index) {
  return {
    id: getModuleId(section, index),
    section,
    title: cpaRoadmap[section][index],
    status: "Not Started",
    score: "",
    needsReview: false,
    plannedDate: "",
  };
}

function normalizeStatus(status) {
  const labels = {
    "not-started": "Not Started",
    "in-progress": "In Progress",
    completed: "Completed",
  };

  return labels[status] || (STATUSES.includes(status) ? status : "Not Started");
}

function getStatusClass(status) {
  return normalizeStatus(status).toLowerCase().replace(/\s+/g, "-");
}

function getSimpleStatusClass(status) {
  return getStatusClass(status);
}

function isExamModule(title) {
  return title.includes("Mini Exam") || title.includes("Simulated Exam");
}

function getScoreClass(moduleItem) {
  if (!isExamModule(moduleItem.title)) {
    return "score-empty";
  }

  const score = getEnteredScore(moduleItem);

  if (score === null) {
    return "score-empty";
  }

  if (score < 65) {
    return "score-risk";
  }

  if (score <= 74) {
    return "score-warning";
  }

  return "score-good";
}

function getSectionProgress(section) {
  if (!progress[section]) {
    progress[section] = {};
  }

  cpaRoadmap[section].forEach((moduleTitle, index) => {
    const moduleId = getModuleId(section, index);

    if (!progress[section][moduleId]) {
      progress[section][moduleId] = getDefaultModuleProgress(section, index);
    } else {
      progress[section][moduleId] = {
        ...getDefaultModuleProgress(section, index),
        ...progress[section][moduleId],
        id: moduleId,
        section,
        title: moduleTitle,
        status: normalizeStatus(progress[section][moduleId].status),
      };
    }
  });

  return cpaRoadmap[section].map((moduleTitle, index) => progress[section][getModuleId(section, index)]);
}

function updateModuleProgress(moduleId, updates, shouldRenderRoadmap = false) {
  const section = getCurrentSection();
  if (!progress[section]) {
    progress[section] = {};
  }

  const shouldAutoPlan = "status" in updates || "score" in updates || "needsReview" in updates;

  progress[section][moduleId] = { ...progress[section][moduleId], ...updates };

  if (shouldAutoPlan) {
    generatedStudyPlan = generateStudyPlan();
    clearCalendarForCompletedPlan(generatedStudyPlan);
    applyStudyPlanDates(generatedStudyPlan);
    renderStudyPlan(generatedStudyPlan);
  }

  saveProgress();
  renderDashboard();
  renderCalendarView();

  if (shouldRenderRoadmap) {
    renderRoadmap();
  }
}

function formatStatus(status) {
  return normalizeStatus(status);
}

function calculateScoreGap() {
  return Number(profile.targetScore || 0) - Number(profile.latestScore || 0);
}

function calculateDaysUntilExam() {
  if (!profile.examDate) {
    return null;
  }

  const today = new Date();
  const examDate = new Date(`${profile.examDate}T00:00:00`);
  today.setHours(0, 0, 0, 0);

  return Math.ceil((examDate - today) / 86400000);
}

function getEnteredScore(moduleItem) {
  if (moduleItem.score === "" || moduleItem.score === null || moduleItem.score === undefined) {
    return null;
  }

  const score = Number(moduleItem.score);
  return Number.isNaN(score) ? null : score;
}

function getPriorityScore(moduleItem) {
  const score = isExamModule(moduleItem.title) ? getEnteredScore(moduleItem) : null;
  let priority = 0;

  if (moduleItem.needsReview) {
    priority += 3;
  }

  if (normalizeStatus(moduleItem.status) === "Not Started") {
    priority += 2;
  }

  if (normalizeStatus(moduleItem.status) === "In Progress") {
    priority += 1;
  }

  if (score !== null && score < 65) {
    priority += 3;
  } else if (score !== null && score >= 65 && score <= 74) {
    priority += 2;
  }

  return priority;
}

function getRoadmapStats(section) {
  const modules = getSectionProgress(section);
  const total = modules.length;
  const completed = modules.filter((moduleItem) => normalizeStatus(moduleItem.status) === "Completed").length;
  const scoredModules = modules
    .filter((moduleItem) => isExamModule(moduleItem.title))
    .map((moduleItem) => ({ ...moduleItem, enteredScore: getEnteredScore(moduleItem) }))
    .filter((moduleItem) => moduleItem.enteredScore !== null);
  const reviewCount = modules.filter((moduleItem) => moduleItem.needsReview).length;
  const averageScore =
    scoredModules.length === 0
      ? null
      : Math.round(scoredModules.reduce((sum, moduleItem) => sum + moduleItem.enteredScore, 0) / scoredModules.length);
  const weakestModule =
    scoredModules.length > 0
      ? [...scoredModules].sort((a, b) => a.enteredScore - b.enteredScore)[0]
      : [...modules].sort((a, b) => getPriorityScore(b) - getPriorityScore(a))[0];
  const nextPriority =
    modules
      .filter((moduleItem) => normalizeStatus(moduleItem.status) !== "Completed")
      .map((moduleItem) => ({ ...moduleItem, priorityScore: getPriorityScore(moduleItem) }))
      .sort((a, b) => b.priorityScore - a.priorityScore)[0] || null;

  return {
    total,
    completed,
    progressPercent: total === 0 ? 0 : Math.round((completed / total) * 100),
    averageScore,
    reviewCount,
    weakestModule,
    nextPriority,
  };
}

function setupProfilePage() {
  const profileForm = document.querySelector("#profile-form");

  if (!profileForm) {
    return;
  }

  document.querySelector("#exam-section").value = getCurrentSection();
  document.querySelector("#latest-score").value = profile.latestScore;
  document.querySelector("#target-score").value = profile.targetScore || 75;
  document.querySelector("#exam-date").value = profile.examDate || "";

  document.querySelectorAll('input[name="passedSections"]').forEach((checkbox) => {
    checkbox.checked = profile.passedSections.includes(checkbox.value);
  });

  profileForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const passedSections = Array.from(document.querySelectorAll('input[name="passedSections"]:checked')).map(
      (checkbox) => checkbox.value
    );

    profile = {
      currentSection: document.querySelector("#exam-section").value,
      passedSections,
      latestScore: getNumberValue("#latest-score"),
      targetScore: getNumberValue("#target-score", 75),
      examDate: document.querySelector("#exam-date").value,
    };

    saveProfile();
    window.location.href = "dashboard.html";
  });
}

function setupDashboardPage() {
  const roadmapList = document.querySelector("#roadmap-list");

  if (!roadmapList) {
    return;
  }

  document.querySelector("#study-map-tab").addEventListener("click", function () {
    setActiveView("study-map");
  });
  document.querySelector("#calendar-plan-tab").addEventListener("click", function () {
    setActiveView("calendar-plan");
  });
  document.querySelector("#generate-plan-button").addEventListener("click", function () {
    generateAndApplyStudyPlan();
  });
  document.querySelector("#apply-plan-button").addEventListener("click", applyGeneratedPlanToCalendar);
  document.querySelector("#reset-section-button").addEventListener("click", resetCurrentSectionProgress);
  document.querySelector("#reset-everything-button").addEventListener("click", resetEverything);

  renderDashboard();
  renderCalendarView();
  renderRoadmap();
}

function setActiveView(viewName) {
  const isStudyMap = viewName === "study-map";

  document.querySelector("#study-map-tab").classList.toggle("is-active", isStudyMap);
  document.querySelector("#calendar-plan-tab").classList.toggle("is-active", !isStudyMap);
  document.querySelector("#study-map-view").classList.toggle("is-active", isStudyMap);
  document.querySelector("#calendar-plan-view").classList.toggle("is-active", !isStudyMap);
}

function renderDashboard() {
  const section = getCurrentSection();
  const daysUntilExam = calculateDaysUntilExam();
  const stats = getRoadmapStats(section);

  document.querySelector("#section-eyebrow").textContent = `${section} current section study plan`;
  document.querySelector("#days-until-exam-output").textContent =
    daysUntilExam === null ? "No exam date set" : `${daysUntilExam} days until exam`;
  document.querySelector("#overall-progress-output").textContent = `${stats.progressPercent}%`;
  document.querySelector("#score-gap-output").textContent = `${calculateScoreGap()} points`;
  document.querySelector("#review-needed-output").textContent = stats.reviewCount;
  document.querySelector("#todays-focus-output").textContent = stats.nextPriority ? stats.nextPriority.title : "None yet";
  document.querySelector("#roadmap-section-label").textContent = section;
  document.querySelector("#roadmap-subtitle").textContent = `${stats.completed} of ${stats.total} modules completed`;
}

function renderRoadmap() {
  const section = getCurrentSection();
  const roadmapList = document.querySelector("#roadmap-list");
  const modules = getSectionProgress(section);

  roadmapList.innerHTML = "";

  modules.forEach((moduleItem) => {
    const isExpanded = expandedModuleId === moduleItem.id;
    const statusClass = getSimpleStatusClass(moduleItem.status);
    const row = document.createElement("article");
    row.className = `module-row roadmap-row ${statusClass} status-${statusClass}${isExpanded ? " is-expanded" : ""}`;

    const summaryButton = document.createElement("button");
    summaryButton.type = "button";
    summaryButton.className = "module-summary";
    summaryButton.setAttribute("aria-expanded", String(isExpanded));
    summaryButton.setAttribute("aria-controls", `${moduleItem.id}-details`);

    const titleBlock = document.createElement("span");
    titleBlock.className = "module-title-block";
    const title = document.createElement("span");
    title.className = "module-title";
    title.textContent = moduleItem.title;
    titleBlock.append(title);

    const statusPill = document.createElement("span");
    statusPill.className = `status-pill ${statusClass} status-${statusClass}`;
    statusPill.textContent = normalizeStatus(moduleItem.status) === "Completed" ? "✓ Completed" : normalizeStatus(moduleItem.status);

    const scoreSummary = document.createElement("span");
    scoreSummary.className = `module-summary-item score-summary ${getScoreClass(moduleItem)}`;
    scoreSummary.textContent = getEnteredScore(moduleItem) === null ? "No score" : `Score: ${getEnteredScore(moduleItem)}`;

    const dateSummary = document.createElement("span");
    dateSummary.className = "module-summary-item";
    dateSummary.textContent = formatCompactDate(moduleItem.plannedDate);

    const editIndicator = document.createElement("span");
    editIndicator.className = "edit-indicator";
    editIndicator.textContent = isExpanded ? "Close" : "Edit";

    summaryButton.append(titleBlock, statusPill, scoreSummary, dateSummary);

    if (moduleItem.needsReview) {
      const reviewSummary = document.createElement("span");
      reviewSummary.className = "review-pill review-chip";
      reviewSummary.textContent = "Review";
      summaryButton.append(reviewSummary);
    }

    summaryButton.append(editIndicator);
    summaryButton.addEventListener("click", function () {
      expandedModuleId = isExpanded ? null : moduleItem.id;
      renderRoadmap();
    });

    const details = document.createElement("div");
    details.id = `${moduleItem.id}-details`;
    details.className = "module-details";
    details.hidden = !isExpanded;

    const controls = document.createElement("div");
    controls.className = "roadmap-controls";

    const statusLabel = document.createElement("label");
    statusLabel.textContent = "Status";

    const statusSelect = document.createElement("select");
    statusSelect.setAttribute("aria-label", `Status for ${moduleItem.title}`);
    STATUSES.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = formatStatus(status);
      option.selected = moduleItem.status === status;
      statusSelect.append(option);
    });
    statusSelect.addEventListener("change", function (event) {
      updateModuleProgress(moduleItem.id, { status: event.target.value }, true);
    });
    statusLabel.append(statusSelect);

    const scoreLabel = document.createElement("label");
    scoreLabel.textContent = "Score";

    const scoreInput = document.createElement("input");
    scoreInput.type = "number";
    scoreInput.min = "0";
    scoreInput.max = "100";
    scoreInput.inputMode = "numeric";
    scoreInput.placeholder = "0";
    scoreInput.value = moduleItem.score;
    scoreInput.setAttribute("aria-label", `Practice score for ${moduleItem.title}`);
    scoreInput.addEventListener("change", function (event) {
      updateModuleProgress(moduleItem.id, { score: event.target.value }, true);
    });
    scoreLabel.append(scoreInput);

    const reviewLabel = document.createElement("label");
    reviewLabel.className = "checkbox-label roadmap-review";

    const reviewCheckbox = document.createElement("input");
    reviewCheckbox.type = "checkbox";
    reviewCheckbox.checked = moduleItem.needsReview;
    reviewCheckbox.addEventListener("change", function (event) {
      updateModuleProgress(moduleItem.id, { needsReview: event.target.checked }, true);
    });
    reviewLabel.append(reviewCheckbox, "Needs Review");

    const dateLabel = document.createElement("label");
    dateLabel.textContent = "Planned";

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = moduleItem.plannedDate || "";
    dateInput.setAttribute("aria-label", `Planned date for ${moduleItem.title}`);
    dateInput.addEventListener("change", function (event) {
      updateModuleProgress(moduleItem.id, { plannedDate: event.target.value }, true);
    });
    dateLabel.append(dateInput);

    controls.append(statusLabel, scoreLabel, dateLabel, reviewLabel);
    details.append(controls);
    row.append(summaryButton, details);
    roadmapList.append(row);
  });

  saveProgress();
}

function resetCurrentSectionProgress() {
  const section = getCurrentSection();
  progress[section] = {};
  generatedStudyPlan = null;
  saveProgress();
  renderDashboard();
  renderCalendarView();
  renderRoadmap();
  resetStudyPlanOutput();
}

function resetEverything() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(LEGACY_TOPICS_KEY);
  window.location.href = "index.html";
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function parseLocalDate(dateString) {
  if (!dateString) {
    return null;
  }

  return new Date(`${dateString}T00:00:00`);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString) {
  const date = parseLocalDate(dateString);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

function formatCompactDate(dateString) {
  const date = parseLocalDate(dateString);

  if (!date) {
    return "No date";
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isCompletedEnough(moduleItem) {
  const score = getEnteredScore(moduleItem);

  return normalizeStatus(moduleItem.status) === "Completed" && score !== null && score >= 75 && !moduleItem.needsReview;
}

function getStudyPlanReasons(moduleItem) {
  const score = getEnteredScore(moduleItem);
  const reasons = [];

  if (moduleItem.needsReview) {
    reasons.push("Needs review");
  }

  if (score !== null && score < 75) {
    reasons.push("Score below 75");
  }

  if (normalizeStatus(moduleItem.status) === "Not Started") {
    reasons.push("Not started");
  }

  if (normalizeStatus(moduleItem.status) === "In Progress") {
    reasons.push("In progress");
  }

  if (moduleItem.title.includes("Mini Exam")) {
    reasons.push("Mini exam checkpoint");
  }

  if (moduleItem.title.includes("Simulated Exam")) {
    reasons.push("Simulated exam practice");
  }

  if (reasons.length === 0 && score === null) {
    reasons.push("No score entered");
  }

  return reasons;
}

function getStudyPlanPriority(moduleItem) {
  const score = getEnteredScore(moduleItem);
  let priority = 0;

  if (moduleItem.needsReview) {
    priority += 5;
  }

  if (score !== null && score < 65) {
    priority += 4;
  } else if (score !== null && score >= 65 && score <= 74) {
    priority += 3;
  }

  if (normalizeStatus(moduleItem.status) === "Not Started") {
    priority += 3;
  }

  if (normalizeStatus(moduleItem.status) === "In Progress") {
    priority += 2;
  }

  if (score === null) {
    priority += 1;
  }

  if (moduleItem.title.includes("Mini Exam")) {
    priority += 2;
  }

  if (moduleItem.title.includes("Simulated Exam")) {
    priority += 3;
  }

  return priority;
}

function generateStudyPlan() {
  const section = getCurrentSection();
  const modules = getSectionProgress(section);

  if (modules.length === 0) {
    return { type: "message", message: "No modules are loaded for this section." };
  }

  if (!profile.examDate) {
    return { type: "message", message: "Set a target exam date in setup to generate a plan." };
  }

  const today = getToday();
  const examDate = parseLocalDate(profile.examDate);
  const daysUntilExam = Math.ceil((examDate - today) / DAY_IN_MS);

  if (daysUntilExam <= 0) {
    return { type: "message", message: "Exam date has passed or is today. Update your setup to generate a plan." };
  }

  const modulesNeedingWork = modules
    .filter((moduleItem) => !isCompletedEnough(moduleItem))
    .filter((moduleItem) => {
      const score = getEnteredScore(moduleItem);
      const status = normalizeStatus(moduleItem.status);

      return status === "Not Started" || status === "In Progress" || moduleItem.needsReview || (score !== null && score < 75);
    })
    .map((moduleItem) => ({
      ...moduleItem,
      priorityScore: getStudyPlanPriority(moduleItem),
      reasons: getStudyPlanReasons(moduleItem),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  if (modulesNeedingWork.length === 0) {
    return { type: "message", message: "You are on track. Use remaining time for final review." };
  }

  const reservedReviewDays = daysUntilExam >= 7 ? 2 : daysUntilExam >= 3 ? 1 : 0;
  const studyDayCount = Math.max(1, daysUntilExam - reservedReviewDays);
  const planDays = Array.from({ length: studyDayCount }, (_, index) => ({
    date: formatIsoDate(addDays(today, index)),
    modules: [],
  }));

  modulesNeedingWork.forEach((moduleItem, index) => {
    const dayIndex = Math.min(index, studyDayCount - 1);
    planDays[dayIndex].modules.push(moduleItem);
  });

  const reviewDays = Array.from({ length: reservedReviewDays }, (_, index) =>
    formatIsoDate(addDays(today, studyDayCount + index))
  );

  return {
    type: "plan",
    section,
    planDays,
    reviewDays,
  };
}

function resetStudyPlanOutput() {
  const planOutput = document.querySelector("#study-plan-output");

  if (!planOutput) {
    return;
  }

  planOutput.innerHTML = "";

  const emptyState = document.createElement("p");
  emptyState.className = "empty-message";
  emptyState.textContent = 'Click "Generate Study Plan" to create a plan from your current progress.';
  planOutput.append(emptyState);
}

function renderStudyPlan(plan) {
  const planOutput = document.querySelector("#study-plan-output");

  if (!planOutput) {
    return;
  }

  planOutput.innerHTML = "";

  if (!plan || plan.type === "message") {
    const message = document.createElement("p");
    message.className = "empty-message";
    message.textContent = plan ? plan.message : 'Click "Generate Study Plan" to create a plan from your current progress.';
    planOutput.append(message);
    return;
  }

  plan.planDays.forEach((day) => {
    if (day.modules.length > 0) {
      planOutput.append(createPlanDayElement(day.date, day.modules));
    }
  });

  if (plan.reviewDays.length > 0) {
    const reviewGroup = document.createElement("article");
    reviewGroup.className = "plan-day";

    const heading = document.createElement("h4");
    heading.textContent = "Final Review";

    const reviewList = document.createElement("ul");
    plan.reviewDays.forEach((date) => {
      const item = document.createElement("li");
      item.textContent = `${formatDisplayDate(date)}: Review weak modules and simulated exam results.`;
      reviewList.append(item);
    });

    reviewGroup.append(heading, reviewList);
    planOutput.append(reviewGroup);
  }
}

function generateAndApplyStudyPlan() {
  generatedStudyPlan = generateStudyPlan();
  clearCalendarForCompletedPlan(generatedStudyPlan);
  applyStudyPlanDates(generatedStudyPlan);
  saveProgress();
  renderStudyPlan(generatedStudyPlan);
  renderDashboard();
  renderCalendarView();
  renderRoadmap();
}

function createPlanDayElement(date, modules) {
  const dayGroup = document.createElement("article");
  dayGroup.className = "plan-day";

  const heading = document.createElement("h4");
  heading.textContent = formatDisplayDate(date);

  const list = document.createElement("ul");
  modules.forEach((moduleItem) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = moduleItem.title;

    const reason = document.createElement("span");
    reason.textContent = `Reason: ${moduleItem.reasons.join(", ")}`;

    item.append(title, reason);
    list.append(item);
  });

  dayGroup.append(heading, list);
  return dayGroup;
}

function clearSectionPlannedDates() {
  const section = getCurrentSection();

  getSectionProgress(section).forEach((moduleItem) => {
    progress[section][moduleItem.id] = {
      ...progress[section][moduleItem.id],
      plannedDate: "",
    };
  });
}

function clearCalendarForCompletedPlan(plan) {
  if (plan && plan.type === "message" && plan.message === "You are on track. Use remaining time for final review.") {
    clearSectionPlannedDates();
  }
}

function applyStudyPlanDates(plan) {
  if (!plan || plan.type !== "plan") {
    return;
  }

  const section = getCurrentSection();

  clearSectionPlannedDates();

  plan.planDays.forEach((day) => {
    day.modules.forEach((moduleItem) => {
      progress[section][moduleItem.id] = {
        ...progress[section][moduleItem.id],
        plannedDate: day.date,
      };
    });
  });
}

function applyGeneratedPlanToCalendar() {
  if (!generatedStudyPlan || generatedStudyPlan.type !== "plan") {
    generatedStudyPlan = generateStudyPlan();
    renderStudyPlan(generatedStudyPlan);
  }

  clearCalendarForCompletedPlan(generatedStudyPlan);
  applyStudyPlanDates(generatedStudyPlan);

  saveProgress();
  renderDashboard();
  renderCalendarView();
  renderRoadmap();
}

function renderCalendarView() {
  const calendarOutput = document.querySelector("#calendar-output");

  if (!calendarOutput) {
    return;
  }

  const section = getCurrentSection();
  const modules = getSectionProgress(section);
  const plannedModules = modules
    .filter((moduleItem) => moduleItem.plannedDate)
    .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
  const unscheduledModules = modules.filter((moduleItem) => !moduleItem.plannedDate);

  calendarOutput.innerHTML = "";

  if (modules.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-message";
    emptyState.textContent = "No modules loaded for this section.";
    calendarOutput.append(emptyState);
    return;
  }

  const modulesByDate = plannedModules.reduce((groups, moduleItem) => {
    if (!groups[moduleItem.plannedDate]) {
      groups[moduleItem.plannedDate] = [];
    }

    groups[moduleItem.plannedDate].push({
      ...moduleItem,
      reasons: getStudyPlanReasons(moduleItem),
    });

    return groups;
  }, {});

  Object.keys(modulesByDate).forEach((date) => {
    calendarOutput.append(createPlanDayElement(date, modulesByDate[date]));
  });

  if (unscheduledModules.length > 0) {
    calendarOutput.append(
      createCalendarGroupElement(
        "Unscheduled",
        unscheduledModules.map((moduleItem) => ({
          ...moduleItem,
          reasons: getStudyPlanReasons(moduleItem),
        }))
      )
    );
  }
}

function createCalendarGroupElement(titleText, modules) {
  const group = document.createElement("article");
  group.className = "plan-day";

  const heading = document.createElement("h4");
  heading.textContent = titleText;

  const list = document.createElement("ul");
  modules.forEach((moduleItem) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = moduleItem.title;

    const detail = document.createElement("span");
    detail.textContent = `Status: ${normalizeStatus(moduleItem.status)}`;

    item.append(title, detail);
    list.append(item);
  });

  group.append(heading, list);
  return group;
}

setupProfilePage();
setupDashboardPage();
