const PROFILE_KEY = "cpaProgressProfile";
const PROGRESS_KEY = "cpaRoadmapProgress";
const LEGACY_TOPICS_KEY = "cpaProgressTopics";
const STATUSES = ["Not Started", "In Progress", "Completed"];
const DAY_IN_MS = 86400000;
const REQUIRED_CPA_SECTIONS = 4;
const CORE_SECTIONS = ["FAR", "AUD", "REG"];
const DISCIPLINE_SECTIONS = ["TCP", "BAR", "ISC"];

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
let visibleCalendarDate = getDefaultCalendarDate();

function loadProfile() {
  const savedProfile = localStorage.getItem(PROFILE_KEY);

  if (!savedProfile) {
    return normalizeProfile({
      currentSection: "REG",
      selectedDiscipline: "TCP",
      passedSections: [],
      latestScore: "",
      targetScore: 75,
      examDate: "",
    });
  }

  try {
    return normalizeProfile({ targetScore: 75, passedSections: [], ...JSON.parse(savedProfile) });
  } catch {
    return normalizeProfile({
      currentSection: "REG",
      selectedDiscipline: "TCP",
      passedSections: [],
      latestScore: "",
      targetScore: 75,
      examDate: "",
    });
  }
}

function normalizeProfile(profileData) {
  const selectedDiscipline = DISCIPLINE_SECTIONS.includes(profileData.selectedDiscipline)
    ? profileData.selectedDiscipline
    : DISCIPLINE_SECTIONS.includes(profileData.currentSection)
      ? profileData.currentSection
      : "TCP";
  const normalizedProfile = {
    ...profileData,
    selectedDiscipline,
    passedSections: normalizePassedSections(profileData.passedSections || []),
  };
  const requiredSections = getRequiredSections(normalizedProfile);
  const currentSection = requiredSections.includes(profileData.currentSection) ? profileData.currentSection : selectedDiscipline || "REG";

  return {
    ...normalizedProfile,
    currentSection,
    passedSections: normalizedProfile.passedSections.filter((item) => requiredSections.includes(item.section)),
  };
}

function normalizePassedSections(passedSections) {
  return passedSections.map((item) => {
    if (typeof item === "string") {
      return { section: item, score: "" };
    }

    return {
      section: item.section,
      score: item.score === undefined || item.score === null ? "" : item.score,
    };
  });
}

function saveProfile() {
  profile = normalizeProfile(profile);
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
  const requiredSections = getRequiredSections(profile);

  return cpaRoadmap[profile.currentSection] && requiredSections.includes(profile.currentSection)
    ? profile.currentSection
    : profile.selectedDiscipline || "REG";
}

function getRequiredSections(profileData = profile) {
  const discipline = DISCIPLINE_SECTIONS.includes(profileData.selectedDiscipline) ? profileData.selectedDiscipline : "TCP";
  return [...CORE_SECTIONS, discipline];
}

function getPassedSectionScore(section) {
  const passedSection = profile.passedSections.find((item) => item.section === section);
  return passedSection ? passedSection.score : "";
}

function isSectionPassed(section) {
  return profile.passedSections.some((item) => item.section === section);
}

function calculateOverallCpaProgress() {
  const requiredSections = getRequiredSections(profile);
  const passedCount = requiredSections.filter((section) => isSectionPassed(section)).length;
  const percentage = Math.min(100, Math.round((passedCount / requiredSections.length) * 100));

  return {
    passedCount,
    requiredCount: requiredSections.length,
    totalRequired: requiredSections.length,
    percent: percentage,
    percentage,
  };
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

  document.querySelector("#discipline-section").value = profile.selectedDiscipline || "TCP";
  document.querySelector("#latest-score").value = profile.latestScore;
  document.querySelector("#target-score").value = profile.targetScore || 75;
  document.querySelector("#exam-date").value = profile.examDate || "";
  renderCurrentSectionOptions();
  renderPassedSectionInputs();

  document.querySelector("#discipline-section").addEventListener("change", function (event) {
    profile.selectedDiscipline = event.target.value;
    profile.passedSections = profile.passedSections.filter((item) => getRequiredSections(profile).includes(item.section));

    if (!getRequiredSections(profile).includes(profile.currentSection)) {
      profile.currentSection = profile.selectedDiscipline;
    }

    renderCurrentSectionOptions();
    renderPassedSectionInputs();
  });

  profileForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const selectedDiscipline = document.querySelector("#discipline-section").value;
    const draftProfile = { ...profile, selectedDiscipline };
    const requiredSections = getRequiredSections(draftProfile);

    const passedSections = Array.from(document.querySelectorAll('input[name="passedSections"]:checked')).map((checkbox) => {
      const scoreInput = document.querySelector(`[data-section-score="${checkbox.value}"]`);
      const scoreValue = scoreInput && scoreInput.value !== "" ? Number(scoreInput.value) : "";

      return {
        section: checkbox.value,
        score: Number.isNaN(scoreValue) ? "" : scoreValue,
      };
    });

    const currentSectionValue = document.querySelector("#exam-section").value;

    profile = {
      currentSection: requiredSections.includes(currentSectionValue) ? currentSectionValue : selectedDiscipline,
      selectedDiscipline,
      passedSections: passedSections.filter((item) => requiredSections.includes(item.section)),
      latestScore: getNumberValue("#latest-score"),
      targetScore: getNumberValue("#target-score", 75),
      examDate: document.querySelector("#exam-date").value,
    };

    saveProfile();
    window.location.href = "dashboard.html";
  });
}

function renderCurrentSectionOptions() {
  const currentSectionSelect = document.querySelector("#exam-section");

  if (!currentSectionSelect) {
    return;
  }

  const requiredSections = getRequiredSections(profile);
  const selectedValue = requiredSections.includes(profile.currentSection) ? profile.currentSection : profile.selectedDiscipline;
  currentSectionSelect.innerHTML = "";

  requiredSections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = section;
    option.selected = section === selectedValue;
    currentSectionSelect.append(option);
  });

  profile.currentSection = selectedValue;
}

function renderPassedSectionInputs() {
  const passedSectionsList = document.querySelector("#passed-sections-list");

  if (!passedSectionsList) {
    return;
  }

  passedSectionsList.innerHTML = "";

  getRequiredSections(profile).forEach((section) => {
    const row = document.createElement("div");
    row.className = "passed-section-row";

    const label = document.createElement("label");
    label.className = "checkbox-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "passedSections";
    checkbox.value = section;
    checkbox.checked = isSectionPassed(section);

    label.append(checkbox, section);

    const scoreInput = document.createElement("input");
    scoreInput.className = "passed-score-input";
    scoreInput.dataset.sectionScore = section;
    scoreInput.type = "number";
    scoreInput.min = "0";
    scoreInput.max = "100";
    scoreInput.placeholder = "Score";
    scoreInput.disabled = !checkbox.checked;
    scoreInput.value = getPassedSectionScore(section) || "";

    checkbox.addEventListener("change", function () {
      scoreInput.disabled = !checkbox.checked;

      if (!checkbox.checked) {
        scoreInput.value = "";
      }
    });

    row.append(label, scoreInput);
    passedSectionsList.append(row);
  });
}

function setupDashboardPage() {
  const roadmapList = document.querySelector("#roadmap-list");

  if (!roadmapList) {
    return;
  }

  document.querySelector("#dashboard-tab").addEventListener("click", function () {
    setActiveView("dashboard");
  });
  document.querySelector("#profile-tab").addEventListener("click", function () {
    setActiveView("profile");
  });
  document.querySelector("#study-map-tab").addEventListener("click", function () {
    setActiveView("study-map");
  });
  document.querySelector("#calendar-plan-tab").addEventListener("click", function () {
    setActiveView("calendar-plan");
  });
  document.querySelector("#settings-tab").addEventListener("click", function () {
    setActiveView("settings");
  });
  document.querySelectorAll("[data-view-target]").forEach((button) => {
    button.addEventListener("click", function () {
      setActiveView(button.dataset.viewTarget);
    });
  });
  document.querySelector("#generate-plan-button").addEventListener("click", function () {
    generateAndApplyStudyPlan();
  });
  document.querySelector("#apply-plan-button").addEventListener("click", applyGeneratedPlanToCalendar);
  document.querySelector("#calendar-prev-button").addEventListener("click", function () {
    changeCalendarMonth(-1);
  });
  document.querySelector("#calendar-next-button").addEventListener("click", function () {
    changeCalendarMonth(1);
  });
  document.querySelector("#reset-section-button").addEventListener("click", resetCurrentSectionProgress);
  document.querySelector("#reset-everything-button").addEventListener("click", resetEverything);

  renderDashboard();
  renderCalendarView();
  renderRoadmap();
}

function setActiveView(viewName) {
  const views = ["dashboard", "profile", "study-map", "calendar-plan", "settings"];

  views.forEach((view) => {
    const isActive = view === viewName;
    const tab = document.querySelector(`#${view}-tab`);
    const viewSection = document.querySelector(`#${view}-view`);

    if (tab) {
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-current", isActive ? "page" : "false");
    }

    if (viewSection) {
      viewSection.classList.toggle("is-active", isActive);
    }
  });
}

function renderDashboard() {
  const section = getCurrentSection();
  const daysUntilExam = calculateDaysUntilExam();
  const stats = getRoadmapStats(section);
  const overallProgress = calculateOverallCpaProgress();

  document.querySelector("#section-eyebrow").textContent = `${section} current section study plan`;
  document.querySelector("#days-until-exam-output").textContent =
    daysUntilExam === null ? "No exam date set" : `${daysUntilExam} days until exam`;
  document.querySelector("#overall-progress-output").textContent = `${overallProgress.percentage}%`;
  document.querySelector("#score-gap-output").textContent = `${calculateScoreGap()} points`;
  document.querySelector("#review-needed-output").textContent = stats.reviewCount;
  document.querySelector("#todays-focus-output").textContent = stats.nextPriority ? stats.nextPriority.title : "None yet";
  document.querySelector("#roadmap-section-label").textContent = section;
  document.querySelector("#roadmap-subtitle").textContent = isSectionPassed(section)
    ? `${section} marked as passed`
    : `${stats.completed} of ${stats.total} modules completed`;
  renderSidebarSummary(section, daysUntilExam, overallProgress);
  renderDashboardOverview(section, stats, overallProgress);
  renderProfileView();
}

function renderSidebarSummary(section, daysUntilExam, overallProgress) {
  const sectionOutput = document.querySelector("#sidebar-current-section-output");

  if (!sectionOutput) {
    return;
  }

  sectionOutput.textContent = section;
  document.querySelector("#sidebar-days-output").textContent = daysUntilExam === null ? "No date" : daysUntilExam;
  document.querySelector("#sidebar-progress-output").textContent = `${overallProgress.percentage}%`;
}

function renderDashboardOverview(section, stats, overallProgress) {
  const progressDetail = document.querySelector("#overall-progress-detail-output");

  if (!progressDetail) {
    return;
  }

  const scoreGap = calculateScoreGap();
  const latestScore = profile.latestScore === "" ? "Not entered" : profile.latestScore;
  const targetScore = profile.targetScore || 75;
  const sectionProgressText = isSectionPassed(section)
    ? `${section} · Passed`
    : `${section} · ${stats.completed} / ${stats.total} modules`;
  const sectionPercentText = isSectionPassed(section) ? "100% complete" : `${stats.progressPercent}% complete`;

  progressDetail.textContent = `${overallProgress.passedCount} / ${overallProgress.totalRequired} sections passed`;
  document.querySelector("#overall-progress-bar").style.width = `${overallProgress.percentage}%`;
  document.querySelector("#current-section-progress-output").textContent = sectionProgressText;
  document.querySelector("#current-section-percent-output").textContent = sectionPercentText;
  document.querySelector("#current-section-progress-bar").style.width = `${isSectionPassed(section) ? 100 : stats.progressPercent}%`;
  document.querySelector("#exam-readiness-output").textContent = `Latest ${latestScore} · Target ${targetScore}`;
  document.querySelector("#score-gap-output").textContent = `${scoreGap} points`;
  renderStudyMapPreview();
  renderCalendarPreview();
}

function renderStudyMapPreview() {
  const previewOutput = document.querySelector("#study-map-preview-output");

  if (!previewOutput) {
    return;
  }

  const modules = getSectionProgress(getCurrentSection())
    .filter((moduleItem) => !isCompletedEnough(moduleItem))
    .map((moduleItem) => ({ ...moduleItem, priorityScore: getStudyPlanPriority(moduleItem) }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3);

  renderPreviewList(previewOutput, modules, "No priority modules yet.");
}

function renderCalendarPreview() {
  const previewOutput = document.querySelector("#calendar-preview-output");

  if (!previewOutput) {
    return;
  }

  const todayKey = formatIsoDate(getToday());
  const modules = getSectionProgress(getCurrentSection())
    .filter((moduleItem) => moduleItem.plannedDate && moduleItem.plannedDate >= todayKey)
    .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
    .slice(0, 3);

  renderPreviewList(previewOutput, modules, "No planned modules yet.");
}

function renderPreviewList(container, modules, emptyText) {
  container.innerHTML = "";

  if (modules.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = emptyText;
    container.append(empty);
    return;
  }

  modules.forEach((moduleItem) => {
    const item = document.createElement("div");
    item.className = "preview-item";

    const title = document.createElement("strong");
    title.textContent = moduleItem.title;

    const meta = document.createElement("span");
    meta.textContent = moduleItem.plannedDate ? formatCompactDate(moduleItem.plannedDate) : normalizeStatus(moduleItem.status);

    item.append(title, meta);
    container.append(item);
  });
}

function renderProfileView() {
  const profileOutput = document.querySelector("#profile-view-output");

  if (!profileOutput) {
    return;
  }

  const section = getCurrentSection();
  const stats = getRoadmapStats(section);
  const overallProgress = calculateOverallCpaProgress();
  const requiredSections = getRequiredSections(profile);
  const daysUntilExam = calculateDaysUntilExam();
  const scoreGap = calculateScoreGap();
  const currentSectionProgressText = isSectionPassed(section)
    ? "Passed · 100% complete"
    : `${section}: ${stats.completed} / ${stats.total} modules completed · ${stats.progressPercent}%`;

  document.querySelector("#profile-current-section-pill").textContent = section;
  profileOutput.innerHTML = "";

  const profileItems = [
    ["Current Section", section],
    ["Selected Discipline", profile.selectedDiscipline],
    ["Target Exam Date", profile.examDate ? formatDisplayDate(profile.examDate) : "No date set"],
    ["Days Until Exam", daysUntilExam === null ? "No date set" : daysUntilExam],
    ["Latest Practice Score", profile.latestScore === "" ? "Not entered" : profile.latestScore],
    ["Target Score", profile.targetScore || 75],
    ["Score Gap", `${scoreGap} pts`],
  ];

  const summaryGrid = document.createElement("div");
  summaryGrid.className = "profile-summary";

  profileItems.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "profile-item";

    const labelElement = document.createElement("span");
    labelElement.textContent = label;

    const valueElement = document.createElement("strong");
    valueElement.textContent = value;

    item.append(labelElement, valueElement);
    summaryGrid.append(item);
  });

  const progressBlock = document.createElement("div");
  progressBlock.className = "profile-progress-block";
  progressBlock.append(
    createProfileTextSection(
      "Overall CPA Progress",
      `${overallProgress.passedCount} / ${overallProgress.totalRequired} sections passed · ${overallProgress.percent}% complete`
    ),
    createProfileTextSection("Current Section Progress", currentSectionProgressText)
  );

  const requiredBlock = createProfilePillSection(
    "Required Sections",
    requiredSections.map((requiredSection) => ({
      text: requiredSection,
      className: requiredSection === section ? "section-label profile-required-pill is-current" : "section-label profile-required-pill",
    }))
  );

  const requiredPassedSections = requiredSections
    .filter((requiredSection) => isSectionPassed(requiredSection))
    .map((requiredSection) => ({
      section: requiredSection,
      score: getPassedSectionScore(requiredSection),
    }));

  const passedBlock = document.createElement("section");
  passedBlock.className = "profile-detail-section";
  const passedHeading = document.createElement("h3");
  passedHeading.textContent = "Passed Sections";
  const passedList = document.createElement("div");
  passedList.className = "passed-pill-list";

  if (requiredPassedSections.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "No sections marked as passed yet.";
    passedList.append(empty);
  } else {
    requiredPassedSections.forEach((item) => {
      const pill = document.createElement("span");
      pill.className = "passed-pill";
      pill.textContent = item.score === "" ? item.section : `${item.section} — ${item.score}`;
      passedList.append(pill);
    });
  }

  passedBlock.append(passedHeading, passedList);

  const sectionStatusBlock = document.createElement("section");
  sectionStatusBlock.className = "profile-detail-section";
  const statusHeading = document.createElement("h3");
  statusHeading.textContent = "Section Status";
  const statusList = document.createElement("div");
  statusList.className = "section-status-list";

  requiredSections.forEach((requiredSection) => {
    statusList.append(createSectionStatusRow(requiredSection));
  });

  sectionStatusBlock.append(statusHeading, statusList);
  profileOutput.append(summaryGrid, progressBlock, requiredBlock, passedBlock, sectionStatusBlock);
}

function createProfileTextSection(title, text) {
  const section = document.createElement("section");
  section.className = "profile-detail-section";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const value = document.createElement("strong");
  value.className = "profile-progress-value";
  value.textContent = text;

  section.append(heading, value);
  return section;
}

function createProfilePillSection(title, pills) {
  const section = document.createElement("section");
  section.className = "profile-detail-section";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const list = document.createElement("div");
  list.className = "profile-pill-list";

  pills.forEach((pillData) => {
    const pill = document.createElement("span");
    pill.className = pillData.className;
    pill.textContent = pillData.text;
    list.append(pill);
  });

  section.append(heading, list);
  return section;
}

function createSectionStatusRow(section) {
  const row = document.createElement("div");
  row.className = "section-status-row";

  const title = document.createElement("strong");
  title.textContent = section;

  const detail = document.createElement("span");
  const badge = document.createElement("span");

  if (isSectionPassed(section)) {
    const score = getPassedSectionScore(section);
    badge.className = "profile-status-badge is-passed";
    badge.textContent = "Passed";
    detail.textContent = score === "" ? "100%" : `${score} · 100%`;
  } else if (section === getCurrentSection()) {
    const stats = getRoadmapStats(section);
    badge.className = "profile-status-badge is-current";
    badge.textContent = "Current";
    detail.textContent = `${stats.completed} / ${stats.total} modules · ${stats.progressPercent}%`;
  } else {
    badge.className = "profile-status-badge is-not-started";
    badge.textContent = "Not Started";
    detail.textContent = "";
  }

  const meta = document.createElement("div");
  meta.className = "section-status-meta";
  meta.append(badge);

  if (detail.textContent) {
    meta.append(detail);
  }

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "section-edit-button";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", function () {
    editProfileSection(section);
  });

  const actions = document.createElement("div");
  actions.className = "section-status-actions";
  actions.append(meta, editButton);

  row.append(title, actions);
  return row;
}

function editProfileSection(section) {
  if (!getRequiredSections(profile).includes(section)) {
    return;
  }

  profile.currentSection = section;
  expandedModuleId = null;
  saveProfile();
  renderDashboard();
  renderCalendarView();
  renderRoadmap();
  setActiveView("study-map");
}

function renderRoadmap() {
  const section = getCurrentSection();
  const roadmapList = document.querySelector("#roadmap-list");
  const modules = getSectionProgress(section);

  roadmapList.innerHTML = "";

  modules.forEach((moduleItem) => {
    const isExpanded = expandedModuleId === moduleItem.id;
    const isExam = isExamModule(moduleItem.title);
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

    const dateSummary = document.createElement("span");
    dateSummary.className = "module-summary-item";
    dateSummary.textContent = formatCompactDate(moduleItem.plannedDate);

    const editIndicator = document.createElement("span");
    editIndicator.className = "edit-indicator";
    editIndicator.textContent = isExpanded ? "Close" : "Edit";

    summaryButton.append(titleBlock, statusPill);

    if (isExam) {
      const scoreSummary = document.createElement("span");
      scoreSummary.className = `module-summary-item score-summary ${getScoreClass(moduleItem)}`;
      scoreSummary.textContent = getEnteredScore(moduleItem) === null ? "No score" : `Score: ${getEnteredScore(moduleItem)}`;
      summaryButton.append(scoreSummary);
    }

    summaryButton.append(dateSummary);

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

    controls.append(statusLabel);

    if (isExam) {
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
      controls.append(scoreLabel);
    }

    controls.append(dateLabel, reviewLabel);
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

function getExamDate() {
  return parseLocalDate(profile.examDate);
}

function getDefaultCalendarDate() {
  return getExamDate() || getToday();
}

function getFinalReviewDate() {
  const examDate = getExamDate();

  if (!examDate) {
    return null;
  }

  const finalReviewDate = addDays(examDate, -1);

  return finalReviewDate > getToday() ? finalReviewDate : null;
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

function formatCalendarDateKey(date) {
  return formatIsoDate(date);
}

function isSameDate(dateA, dateB) {
  if (!dateA || !dateB) {
    return false;
  }

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function getCalendarMonthDates(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = Array.from({ length: firstDay.getDay() }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    dates.push(new Date(year, month, day));
  }

  return dates;
}

function formatDisplayDate(dateString) {
  const date = parseLocalDate(dateString);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatCompactDate(dateString) {
  const date = parseLocalDate(dateString);

  if (!date) {
    return "No date";
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isCompletedEnough(moduleItem) {
  if (!isExamModule(moduleItem.title)) {
    return normalizeStatus(moduleItem.status) === "Completed" && !moduleItem.needsReview;
  }

  const score = getEnteredScore(moduleItem);
  return normalizeStatus(moduleItem.status) === "Completed" && score !== null && score >= 75 && !moduleItem.needsReview;
}

function getStudyPlanReasons(moduleItem) {
  const isExam = isExamModule(moduleItem.title);
  const score = isExam ? getEnteredScore(moduleItem) : null;
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

  if (isExam && moduleItem.title.includes("Mini Exam")) {
    reasons.push("Mini exam checkpoint");
  }

  if (isExam && moduleItem.title.includes("Simulated Exam")) {
    reasons.push("Simulated exam practice");
  }

  if (isExam && reasons.length === 0 && score === null) {
    reasons.push("No score entered");
  }

  return reasons;
}

function getStudyPlanPriority(moduleItem) {
  const isExam = isExamModule(moduleItem.title);
  const score = isExam ? getEnteredScore(moduleItem) : null;
  let priority = 0;

  if (moduleItem.needsReview) {
    priority += 5;
  }

  if (isExam && score !== null && score < 65) {
    priority += 4;
  } else if (isExam && score !== null && score >= 65 && score <= 74) {
    priority += 3;
  }

  if (normalizeStatus(moduleItem.status) === "Not Started") {
    priority += 3;
  }

  if (normalizeStatus(moduleItem.status) === "In Progress") {
    priority += 2;
  }

  if (isExam && moduleItem.title.includes("Mini Exam")) {
    priority += 2;
  }

  if (isExam && moduleItem.title.includes("Simulated Exam")) {
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
      const score = isExamModule(moduleItem.title) ? getEnteredScore(moduleItem) : null;
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

  const schedulableDates = Array.from({ length: Math.max(0, daysUntilExam - 1) }, (_, index) =>
    formatIsoDate(addDays(today, index + 1))
  );
  const reviewDays = schedulableDates.length >= 2 ? [schedulableDates[schedulableDates.length - 1]] : [];
  const moduleDates = reviewDays.length > 0 ? schedulableDates.slice(0, -1) : schedulableDates;
  const planDates = moduleDates.length > 0 ? moduleDates : [formatIsoDate(addDays(today, 1))];
  const planDays = planDates.map((date) => ({
    date,
    modules: [],
  }));

  const unscheduledWork = modulesNeedingWork.filter((moduleItem) => !moduleItem.plannedDate);

  unscheduledWork.forEach((moduleItem, index) => {
    const dayIndex = Math.min(index, planDays.length - 1);
    planDays[dayIndex].modules.push(moduleItem);
  });

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

  const successMessage = document.createElement("p");
  successMessage.className = "success-message";
  successMessage.textContent = "Study plan generated and added to Calendar View.";
  planOutput.append(successMessage);

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
  applyStudyPlanDates(generatedStudyPlan);
  saveProgress();
  visibleCalendarDate = getDefaultCalendarDate();
  renderStudyPlan(generatedStudyPlan);
  renderDashboard();
  renderCalendarView();
  renderRoadmap();
  setActiveView("calendar-plan");
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

function applyStudyPlanDates(plan) {
  if (!plan || plan.type !== "plan") {
    return;
  }

  const section = getCurrentSection();

  plan.planDays.forEach((day) => {
    day.modules.forEach((moduleItem) => {
      if (progress[section][moduleItem.id] && progress[section][moduleItem.id].plannedDate) {
        return;
      }

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

  applyStudyPlanDates(generatedStudyPlan);

  saveProgress();
  visibleCalendarDate = getDefaultCalendarDate();
  renderDashboard();
  renderCalendarView();
  renderRoadmap();
  setActiveView("calendar-plan");
}

function renderCalendarView() {
  renderCalendarGrid();
}

function changeCalendarMonth(offset) {
  visibleCalendarDate = new Date(visibleCalendarDate.getFullYear(), visibleCalendarDate.getMonth() + offset, 1);
  renderCalendarView();
}

function groupModulesByDate(modules = getSectionProgress(getCurrentSection())) {
  return modules
    .filter((moduleItem) => moduleItem.plannedDate)
    .reduce((groups, moduleItem) => {
      if (!groups[moduleItem.plannedDate]) {
        groups[moduleItem.plannedDate] = [];
      }

      groups[moduleItem.plannedDate].push({
        ...moduleItem,
        reasons: getStudyPlanReasons(moduleItem),
      });

      return groups;
    }, {});
}

function renderCalendarGrid() {
  const calendarOutput = document.querySelector("#calendar-output");
  const calendarGrid = document.querySelector("#calendar-grid");
  const monthLabel = document.querySelector("#calendar-month-label");
  const unscheduledOutput = document.querySelector("#calendar-unscheduled-output");

  if (!calendarOutput || !calendarGrid || !monthLabel || !unscheduledOutput) {
    return;
  }

  const section = getCurrentSection();
  const modules = getSectionProgress(section);
  const plannedModules = modules.filter((moduleItem) => moduleItem.plannedDate);
  const unscheduledModules = modules.filter(
    (moduleItem) => !moduleItem.plannedDate && (normalizeStatus(moduleItem.status) !== "Completed" || moduleItem.needsReview)
  );
  const modulesByDate = groupModulesByDate(modules);
  const year = visibleCalendarDate.getFullYear();
  const month = visibleCalendarDate.getMonth();
  const monthDates = getCalendarMonthDates(year, month);
  const examDate = getExamDate();
  const finalReviewDate = getFinalReviewDate();

  monthLabel.textContent = visibleCalendarDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  calendarGrid.innerHTML = "";
  unscheduledOutput.innerHTML = "";

  if (modules.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-message";
    emptyState.textContent = "No modules loaded for this section.";
    unscheduledOutput.append(emptyState);
    return;
  }

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((weekday) => {
    const weekdayCell = document.createElement("div");
    weekdayCell.className = "calendar-weekday";
    weekdayCell.textContent = weekday;
    calendarGrid.append(weekdayCell);
  });

  monthDates.forEach((date) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    if (!date) {
      cell.classList.add("is-empty");
      calendarGrid.append(cell);
      return;
    }

    if (isSameDate(date, examDate)) {
      cell.classList.add("is-exam-day");
    }

    if (isSameDate(date, getToday())) {
      cell.classList.add("is-today");
    }

    if (isSameDate(date, finalReviewDate)) {
      cell.classList.add("is-final-review");
    }

    const dayNumber = document.createElement("span");
    dayNumber.className = "calendar-day-number";
    dayNumber.textContent = date.getDate();
    cell.append(dayNumber);

    if (isSameDate(date, examDate)) {
      const examMarker = document.createElement("span");
      examMarker.className = "calendar-marker exam-marker";
      examMarker.textContent = "Exam Day";
      cell.append(examMarker);
    }

    if (isSameDate(date, finalReviewDate)) {
      const reviewMarker = document.createElement("span");
      reviewMarker.className = "calendar-marker review-marker";
      reviewMarker.textContent = "Final Review";
      cell.append(reviewMarker);
    }

    const dateKey = formatCalendarDateKey(date);
    const dayModules = modulesByDate[dateKey] || [];

    if (dayModules.length > 0) {
      const moduleList = document.createElement("div");
      moduleList.className = "calendar-cell-modules";

      dayModules.forEach((moduleItem) => {
        moduleList.append(createCalendarModuleItem(moduleItem));
      });

      cell.append(moduleList);
    }

    calendarGrid.append(cell);
  });

  if (plannedModules.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-message";
    emptyState.textContent = "No study plan yet. Click Generate Study Plan to create one.";
    unscheduledOutput.append(emptyState);
  }

  if (unscheduledModules.length > 0) {
    unscheduledOutput.append(
      createCalendarGroupElement(
        "Unscheduled Modules",
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

  const list = document.createElement("div");
  list.className = "calendar-module-list";
  modules.forEach((moduleItem) => {
    list.append(createCalendarModuleItem(moduleItem));
  });

  group.append(heading, list);
  return group;
}

function createCalendarDateElement(date, modules) {
  return createCalendarGroupElement(formatDisplayDate(date), modules);
}

function createCalendarModuleItem(moduleItem) {
  const item = document.createElement("div");
  const statusClass = getSimpleStatusClass(moduleItem.status);
  item.className = `calendar-module-item ${statusClass} status-${statusClass}`;

  const title = document.createElement("strong");
  title.textContent = moduleItem.title;

  const meta = document.createElement("span");
  meta.className = "calendar-module-meta";

  const statusPill = document.createElement("span");
  statusPill.className = `status-pill ${statusClass} status-${statusClass}`;
  statusPill.textContent = normalizeStatus(moduleItem.status) === "Completed" ? "✓ Completed" : normalizeStatus(moduleItem.status);
  meta.append(statusPill);

  if (moduleItem.needsReview) {
    const reviewPill = document.createElement("span");
    reviewPill.className = "review-pill";
    reviewPill.textContent = "Review";
    meta.append(reviewPill);
  }

  if (isExamModule(moduleItem.title)) {
    const score = document.createElement("span");
    score.className = `score-summary ${getScoreClass(moduleItem)}`;
    score.textContent = getEnteredScore(moduleItem) === null ? "No score" : `Score: ${getEnteredScore(moduleItem)}`;
    meta.append(score);
  }

  item.append(title, meta);
  return item;
}

setupProfilePage();
setupDashboardPage();
