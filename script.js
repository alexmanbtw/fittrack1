/* ============================================================
   FitTrack — логика приложения
   Vanilla JS + localStorage
   Сохранённые ключи: fittrack.workouts, fittrack.settings
   Новые ключи: fittrack.programs, fittrack.exercises, fittrack.goals, fittrack.body
   ============================================================ */

// --- Ключи хранилища ---
const STORAGE_KEY = "fittrack.workouts";
const SETTINGS_KEY = "fittrack.settings";
const PROGRAMS_KEY = "fittrack.programs";
const EXERCISES_KEY = "fittrack.exercises";
const GOALS_KEY = "fittrack.goals";
const BODY_KEY = "fittrack.body";

// --- Состояние ---
let workouts = [];
let settings = { userName: "" };
let programs = [];
let customExercises = [];
let goals = [];
let bodyEntries = [];
let currentRoute = "home";
let editingWorkoutId = null;
let editingProgramId = null;

// Группы мышц
const MUSCLE_GROUPS = ["Грудь", "Спина", "Плечи", "Бицепс", "Трицепс", "Ноги", "Пресс"];
const MUSCLE_KEYS = ["chest", "back", "shoulders", "biceps", "triceps", "legs", "abs"];

// ============================================================
// ВСТРОЕННАЯ БИБЛИОТЕКА УПРАЖНЕНИЙ
// ============================================================

const BUILTIN_EXERCISES = [
  { name: "Жим лёжа штангой", muscle: "chest", equipment: "Штанга", type: "compound", technique: "Ляг на скамью, хват чуть шире плеч. Опусти штангу до груди, выжми вверх. Лопатки сведены, стопы на полу." },
  { name: "Жим гантелей лёжа", muscle: "chest", equipment: "Гантели", type: "compound", technique: "Гантели по краям груди. Выжми вверх до выпрямления рук. Контролируй траекторию." },
  { name: "Отжимания на брусьях", muscle: "chest", equipment: "Брусья", type: "compound", technique: "Наклон корпуса вперёд. Опустись до параллели, выжми вверх. Локти в стороны." },
  { name: "Подтягивания", muscle: "back", equipment: "Турник", type: "compound", technique: "Хват чуть шире плеч. Тянись грудью к перекладине. Без раскачки." },
  { name: "Тяга штанги в наклоне", muscle: "back", equipment: "Штанга", type: "compound", technique: "Наклон 45 градусов. Тяги штангу к поясу. Спина прямая, лопатки сводятся." },
  { name: "Тяга верхнего блока", muscle: "back", equipment: "Тренажёр", type: "compound", technique: "Хват шире плеч. Тяги рукоять к верхней части груди. Без раскачки." },
  { name: "Армейский жим", muscle: "shoulders", equipment: "Штанга", type: "compound", technique: "Штанга на уровне ключиц. Выжми над головой до выпрямления. Корпус напрягён." },
  { name: "Махи гантелями в стороны", muscle: "shoulders", equipment: "Гантели", type: "isolation", technique: "Гантели по бокам. Подними до параллели плечам. Без рывков, локти слегка согнуты." },
  { name: "Подъём штанги на бицепс", muscle: "biceps", equipment: "Штанга", type: "isolation", technique: "Хват на ширине плеч. Поднимай штангу, без раскачки корпуса. Локти прижаты." },
  { name: "Подъём гантелей на бицепс", muscle: "biceps", equipment: "Гантели", type: "isolation", technique: "Поочерёдно или одновременно. Разворот кисти. Контролируй опускание." },
  { name: "Жим узким хватом", muscle: "triceps", equipment: "Штанга", type: "compound", technique: "Хват на ширине плеч. Опусти к нижней части груди. Локти прижаты к корпусу." },
  { name: "Разгибания на блоке", muscle: "triceps", equipment: "Тренажёр", type: "isolation", technique: "Локти прижаты. Разгибай руки до конца. Контролируй возврат." },
  { name: "Приседания со штангой", muscle: "legs", equipment: "Штанга", type: "compound", technique: "Штанга на трапециях. Приседай до параллели. Колени по направлению стоп. Спина прямая." },
  { name: "Жим ногами", muscle: "legs", equipment: "Тренажёр", type: "compound", technique: "Стопы на платформе шире плеч. Опускай до 90 градусов в коленях. Без блокировки коленей." },
  { name: "Румынская тяга", muscle: "legs", equipment: "Штанга", type: "compound", technique: "Ноги чуть согнуты. Наклон за счёт отведения таза. Штанга близко к ногам." },
  { name: "Выпады с гантелями", muscle: "legs", equipment: "Гантели", type: "compound", technique: "Шаг вперёд, опустись до 90 градусов. Колено задней ноги к полу. Чередуй ноги." },
  { name: "Скручивания", muscle: "abs", equipment: "Свой вес", type: "isolation", technique: "Ляг на пол, ноги согнуты. Поднимай корпус, напрягая пресс. Без рывков." },
  { name: "Планка", muscle: "abs", equipment: "Свой вес", type: "isolation", technique: "Упор на предплечья и носки. Тело прямое. Держи позицию." },
  { name: "Подъём ног в висе", muscle: "abs", equipment: "Турник", type: "isolation", technique: "Вис на турнике. Подними прямые ноги до параллели или выше. Без раскачки." },
];

// ============================================================
// ХРАНИЛИЩЕ
// ============================================================

function loadWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    workouts = raw ? JSON.parse(raw) : [];
  } catch (e) { workouts = []; }
}
function saveWorkouts() { localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts)); }

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    settings = raw ? JSON.parse(raw) : { userName: "" };
  } catch (e) { settings = { userName: "" }; }
}
function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

function loadPrograms() {
  try {
    const raw = localStorage.getItem(PROGRAMS_KEY);
    programs = raw ? JSON.parse(raw) : [];
  } catch (e) { programs = []; }
}
function savePrograms() { localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs)); }

function loadCustomExercises() {
  try {
    const raw = localStorage.getItem(EXERCISES_KEY);
    customExercises = raw ? JSON.parse(raw) : [];
  } catch (e) { customExercises = []; }
}
function saveCustomExercises() { localStorage.setItem(EXERCISES_KEY, JSON.stringify(customExercises)); }

function loadGoals() {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    goals = raw ? JSON.parse(raw) : [];
  } catch (e) { goals = []; }
}
function saveGoals() { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); }

function loadBodyEntries() {
  try {
    const raw = localStorage.getItem(BODY_KEY);
    bodyEntries = raw ? JSON.parse(raw) : [];
  } catch (e) { bodyEntries = []; }
}
function saveBodyEntries() { localStorage.setItem(BODY_KEY, JSON.stringify(bodyEntries)); }

// ============================================================
// УТИЛИТЫ
// ============================================================

function makeId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateShort(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
function formatNumber(n) {
  if (n == null || isNaN(n)) return "0";
  return n % 1 === 0 ? n.toString() : n.toFixed(1);
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function workoutVolume(workout) {
  return workout.exercises.reduce((sum, ex) => sum + ex.sets * ex.reps * ex.weight, 0);
}
function totalVolume() { return workouts.reduce((sum, w) => sum + workoutVolume(w), 0); }
function totalExercises() { return workouts.reduce((sum, w) => sum + w.exercises.length, 0); }
function sortedWorkouts() { return [...workouts].sort((a, b) => b.date.localeCompare(a.date)); }

// Все упражнения (встроенные + пользовательские)
function allExercises() {
  return [...BUILTIN_EXERCISES, ...customExercises];
}

// Находит описание упражнения по имени (для группы мышц)
function findExerciseMeta(name) {
  const all = allExercises();
  return all.find((e) => e.name.toLowerCase().trim() === name.toLowerCase().trim());
}

// Определяет группу мышц для упражнения из истории
function muscleOfExercise(name) {
  const meta = findExerciseMeta(name);
  if (meta) return meta.muscle;
  return null;
}

// ============================================================
// НАВИГАЦИЯ
// ============================================================

const landingEl = document.getElementById("landing");
const appEl = document.getElementById("app");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const burger = document.getElementById("burger");

function enterApp() {
  landingEl.classList.add("hidden");
  appEl.classList.remove("hidden");
  navigate("home");
}
function backToLanding() {
  appEl.classList.add("hidden");
  landingEl.classList.remove("hidden");
  closeSidebar();
}

function navigate(route) {
  currentRoute = route;
  document.querySelectorAll(".route").forEach((sec) => sec.classList.add("hidden"));
  const target = document.getElementById("route-" + route);
  if (target) target.classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.route === route);
  });

  if (route === "home") renderHome();
  if (route === "dashboard") renderDashboard();
  if (route === "workouts") renderWorkoutsRoute();
  if (route === "live") renderLiveRoute();
  if (route === "programs") renderProgramsRoute();
  if (route === "exercises") renderExercisesRoute();
  if (route === "analytics") renderAnalytics();
  if (route === "goals") renderGoalsRoute();
  if (route === "body") renderBodyRoute();
  if (route === "settings") renderSettings();

  closeSidebar();
  window.scrollTo(0, 0);
}

function openSidebar() { sidebar.classList.add("open"); sidebarOverlay.classList.add("show"); }
function closeSidebar() { sidebar.classList.remove("open"); sidebarOverlay.classList.remove("show"); }

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => navigate(btn.dataset.route));
});
document.querySelectorAll("[data-go]").forEach((btn) => {
  btn.addEventListener("click", () => navigate(btn.dataset.go));
});
document.getElementById("landing-enter").addEventListener("click", enterApp);
document.getElementById("hero-cta").addEventListener("click", enterApp);
document.getElementById("hero-demo").addEventListener("click", () => {
  document.getElementById("landing-features").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("back-to-landing").addEventListener("click", backToLanding);
burger.addEventListener("click", openSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

// ============================================================
// КАРТОЧКИ СТАТИСТИКИ
// ============================================================

function buildStatCard(icon, value, label, accent) {
  const div = document.createElement("div");
  div.className = "stat-card";
  div.innerHTML = `
    <div class="stat-icon">${icon}</div>
    <div class="stat-value ${accent ? "accent" : ""}">${value}</div>
    <div class="stat-label">${label}</div>`;
  return div;
}

function renderStatsInto(container, weekly) {
  container.innerHTML = "";
  if (weekly) {
    const wk = weeklyVolume(2);
    const thisW = wk[wk.length - 1];
    const prevW = wk[wk.length - 2] || { volume: 0, count: 0 };
    const latest = sortedWorkouts()[0];
    container.appendChild(buildStatCard("🏋️", thisW.count, "Тренировок за неделю", true));
    container.appendChild(buildStatCard("💪", totalExercises(), "Упражнений всего"));
    container.appendChild(buildStatCard("📊", formatNumber(thisW.volume), "Объём за неделю"));
    container.appendChild(buildStatCard("📅", latest ? formatDateShort(latest.date) : "—", "Последняя"));
  } else {
    const latest = sortedWorkouts()[0];
    container.appendChild(buildStatCard("🏋️", workouts.length, "Всего тренировок", true));
    container.appendChild(buildStatCard("💪", totalExercises(), "Упражнений"));
    container.appendChild(buildStatCard("📊", formatNumber(totalVolume()), "Объём, кг"));
    container.appendChild(buildStatCard("📅", latest ? formatDateShort(latest.date) : "—", "Последняя"));
  }
}

// ============================================================
// ЛИЧНЫЕ РЕКОРДЫ
// ============================================================

function computeRecords() {
  const map = {};
  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      const key = ex.name.toLowerCase().trim();
      if (!map[key] || ex.weight > map[key].weight) {
        map[key] = { name: ex.name, weight: ex.weight, sets: ex.sets, reps: ex.reps, workoutDate: w.date };
      }
    });
  });
  return Object.values(map).sort((a, b) => b.weight - a.weight);
}

function renderRecordsInto(container, asGrid) {
  const records = computeRecords();
  container.innerHTML = "";
  if (records.length === 0) {
    container.innerHTML = '<p class="empty-state">Пока нет рекордов. Добавь тренировку.</p>';
    return;
  }
  const top = records.slice(0, asGrid ? 6 : 5);
  if (asGrid) {
    top.forEach((r) => {
      const card = document.createElement("div");
      card.className = "record-card";
      card.innerHTML = `
        <div class="record-name">${escapeHtml(r.name)}</div>
        <div class="record-value">${formatNumber(r.weight)} кг</div>
        <div class="record-detail">${r.sets}×${r.reps} · ${formatDateShort(r.workoutDate)}</div>`;
      container.appendChild(card);
    });
  } else {
    top.forEach((r) => {
      const item = document.createElement("div");
      item.className = "record-item";
      item.innerHTML = `
        <span class="record-name">${escapeHtml(r.name)}</span>
        <span class="record-value">${formatNumber(r.weight)} кг</span>`;
      container.appendChild(item);
    });
  }
}

// ============================================================
// ПОСЛЕДНИЕ ТРЕНИРОВКИ
// ============================================================

function renderRecentInto(container, limit) {
  const sorted = sortedWorkouts().slice(0, limit);
  container.innerHTML = "";
  if (sorted.length === 0) {
    container.innerHTML = '<p class="empty-state">Тренировок пока нет.</p>';
    return;
  }
  sorted.forEach((w) => {
    const item = document.createElement("div");
    item.className = "recent-item";
    item.innerHTML = `
      <div class="recent-item-info">
        <h4>${escapeHtml(w.name)}</h4>
        <span>${formatDate(w.date)}</span>
      </div>
      <div class="recent-item-meta">
        <div class="meta-volume">${formatNumber(workoutVolume(w))} кг</div>
        <div class="meta-count">${w.exercises.length} упр.</div>
      </div>`;
    container.appendChild(item);
  });
}

// ============================================================
// КАЛЕНДАРЬ АКТИВНОСТИ
// ============================================================

function renderCalendar(container) {
  container.innerHTML = "";
  const days = 84; // 12 недель
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayMap = {};
  workouts.forEach((w) => {
    const d = w.date;
    if (!dayMap[d]) dayMap[d] = 0;
    dayMap[d] += workoutVolume(w);
  });

  const maxVol = Math.max(1, ...Object.values(dayMap));

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const vol = dayMap[key] || 0;
    let level = 0;
    if (vol > 0) {
      const ratio = vol / maxVol;
      if (ratio > 0.75) level = 4;
      else if (ratio > 0.5) level = 3;
      else if (ratio > 0.25) level = 2;
      else level = 1;
    }
    const cell = document.createElement("div");
    cell.className = "calendar-day" + (level > 0 ? " active-" + level : "");
    cell.setAttribute("data-tooltip", formatDateShort(key) + (vol > 0 ? ": " + formatNumber(vol) + " кг" : ""));
    container.appendChild(cell);
  }
}

// ============================================================
// СРАВНЕНИЕ НЕДЕЛЬ
// ============================================================

function renderCompareWeeks(container) {
  const wk = weeklyVolume(2);
  const thisW = wk[wk.length - 1];
  const prevW = wk[wk.length - 2] || { volume: 0, count: 0 };
  container.innerHTML = "";

  function deltaRow(label, current, previous) {
    const diff = current - previous;
    let cls = "same", txt = "= 0";
    if (diff > 0) { cls = "up"; txt = "+ " + formatNumber(diff); }
    else if (diff < 0) { cls = "down"; txt = formatNumber(diff); }
    const row = document.createElement("div");
    row.className = "compare-row";
    row.innerHTML = `
      <span class="compare-label">${label}</span>
      <div class="compare-values">
        <span class="compare-val">${formatNumber(current)}</span>
        <span class="compare-delta ${cls}">${txt}</span>
      </div>`;
    container.appendChild(row);
  }
  deltaRow("Тренировки", thisW.count, prevW.count);
  deltaRow("Объём, кг", thisW.volume, prevW.volume);
}

// ============================================================
// НАГРУЗКА ПО МЫШЦАМ
// ============================================================

function muscleBreakdown() {
  const totals = {};
  MUSCLE_KEYS.forEach((k) => (totals[k] = 0));
  let unknown = 0;

  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      const vol = ex.sets * ex.reps * ex.weight;
      const muscle = muscleOfExercise(ex.name);
      if (muscle && totals[muscle] != null) totals[muscle] += vol;
      else unknown += vol;
    });
  });

  const total = Object.values(totals).reduce((a, b) => a + b, 0) + unknown;
  const result = MUSCLE_KEYS.map((k, i) => ({
    key: k,
    label: MUSCLE_GROUPS[i],
    volume: totals[k],
    percent: total > 0 ? (totals[k] / total) * 100 : 0,
  })).filter((r) => r.volume > 0).sort((a, b) => b.volume - a.volume);

  if (unknown > 0) {
    result.push({ key: "other", label: "Другое", volume: unknown, percent: total > 0 ? (unknown / total) * 100 : 0 });
  }
  return result;
}

function renderMuscleBreakdown(container) {
  const data = muscleBreakdown();
  container.innerHTML = "";
  if (data.length === 0) {
    container.innerHTML = '<p class="empty-state">Нет данных. Добавь тренировки с упражнениями из библиотеки.</p>';
    return;
  }
  data.forEach((m) => {
    const row = document.createElement("div");
    row.className = "muscle-bar-row";
    row.innerHTML = `
      <div class="muscle-bar-head">
        <span class="muscle-bar-name">${m.label}</span>
        <span class="muscle-bar-val">${formatNumber(m.volume)} кг · ${m.percent.toFixed(0)}%</span>
      </div>
      <div class="muscle-bar-track">
        <div class="muscle-bar-fill" style="width: ${m.percent}%"></div>
      </div>`;
    container.appendChild(row);
  });
}

// ============================================================
// HOME
// ============================================================

function renderHome() {
  const name = settings.userName ? settings.userName : "";
  document.getElementById("home-title").textContent = name ? "Привет, " + name : "Главная";
  document.getElementById("home-subtitle").textContent = "Обзор твоей недели";

  renderStatsInto(document.getElementById("home-stats"), true);
  renderCalendar(document.getElementById("home-calendar"));
  renderCompareWeeks(document.getElementById("home-compare"));
  renderLatestWorkout(document.getElementById("home-latest"));
  renderRecordsInto(document.getElementById("home-records"), false);
}

function renderLatestWorkout(container) {
  const latest = sortedWorkouts()[0];
  container.innerHTML = "";
  if (!latest) {
    container.innerHTML = '<p class="empty-state">Тренировок пока нет.</p>';
    return;
  }
  const vol = workoutVolume(latest);
  const div = document.createElement("div");
  div.className = "latest-workout";
  div.innerHTML = `
    <div class="lw-name">${escapeHtml(latest.name)}</div>
    <div class="lw-date">${formatDate(latest.date)}</div>
    <div class="lw-stats">
      <div class="lw-stat"><div class="lw-stat-val">${latest.exercises.length}</div><div class="lw-stat-label">упражнений</div></div>
      <div class="lw-stat"><div class="lw-stat-val">${formatNumber(vol)}</div><div class="lw-stat-label">объём, кг</div></div>
    </div>
    <div class="lw-exercises">
      ${latest.exercises.slice(0, 5).map((ex) => `
        <div class="lw-ex"><strong>${escapeHtml(ex.name)}</strong>: ${ex.sets}×${ex.reps} по ${formatNumber(ex.weight)} кг</div>`).join("")}
    </div>`;
  container.appendChild(div);
}

// ============================================================
// DASHBOARD
// ============================================================

function renderDashboard() {
  const name = settings.userName ? settings.userName : " спортсмен";
  document.getElementById("dashboard-greeting").textContent = "Привет, " + name + "! Вот твой прогресс.";
  renderStatsInto(document.getElementById("dashboard-stats"));
  renderRecentInto(document.getElementById("dashboard-recent"), 5);
  renderRecordsInto(document.getElementById("dashboard-records"), true);
  const weekly = weeklyVolume(8);
  renderBarChart(document.getElementById("dashboard-activity"), weekly, "volume");
  renderMuscleBreakdown(document.getElementById("dashboard-muscles"));
}

// ============================================================
// ТРЕНИРОВКИ — форма и список (сохранено из предыдущей версии)
// ============================================================

const form = document.getElementById("workout-form");
const nameInput = document.getElementById("workout-name");
const dateInput = document.getElementById("workout-date");
const exercisesBlock = document.getElementById("exercises-block");
const addExerciseBtn = document.getElementById("add-exercise-btn");
const workoutList = document.getElementById("workout-list");
const formTitle = document.getElementById("form-title");
const formSubmit = document.getElementById("form-submit");
const cancelEditBtn = document.getElementById("cancel-edit");

function setDefaultDate() { dateInput.value = new Date().toISOString().slice(0, 10); }

function addExerciseRow(data) {
  const card = document.createElement("div");
  card.className = "exercise-card";
  card.innerHTML = `
    <label class="field">
      <span class="field-label">Упражнение</span>
      <input type="text" class="ex-name-input" placeholder="Жим лёжа" maxlength="60" value="${data ? escapeHtml(data.name) : ""}" />
    </label>
    <label class="field">
      <span class="field-label">Подходы</span>
      <input type="number" class="ex-sets-input" min="1" max="99" placeholder="3" value="${data ? data.sets : ""}" />
    </label>
    <label class="field">
      <span class="field-label">Повторения</span>
      <input type="number" class="ex-reps-input" min="1" max="999" placeholder="10" value="${data ? data.reps : ""}" />
    </label>
    <label class="field">
      <span class="field-label">Вес, кг</span>
      <input type="number" class="ex-weight-input" min="0" step="0.5" placeholder="60" value="${data ? data.weight : ""}" />
    </label>
    <button type="button" class="exercise-remove" title="Удалить упражнение">×</button>`;
  card.querySelector(".exercise-remove").addEventListener("click", () => card.remove());
  exercisesBlock.appendChild(card);
}

addExerciseBtn.addEventListener("click", () => addExerciseRow());

function collectExercises() {
  const cards = exercisesBlock.querySelectorAll(".exercise-card");
  const exercises = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const name = card.querySelector(".ex-name-input").value.trim();
    const sets = parseInt(card.querySelector(".ex-sets-input").value, 10);
    const reps = parseInt(card.querySelector(".ex-reps-input").value, 10);
    const weight = parseFloat(card.querySelector(".ex-weight-input").value);
    if (!name) { alert("Заполните название упражнения №" + (i + 1)); return null; }
    if (!sets || sets < 1) { alert("Укажите подходы для «" + name + "»"); return null; }
    if (!reps || reps < 1) { alert("Укажите повторения для «" + name + "»"); return null; }
    if (isNaN(weight) || weight < 0) { alert("Укажите вес для «" + name + "»"); return null; }
    exercises.push({ name, sets, reps, weight });
  }
  if (exercises.length === 0) { alert("Добавьте хотя бы одно упражнение"); return null; }
  return exercises;
}

function resetForm() {
  editingWorkoutId = null;
  form.reset();
  exercisesBlock.innerHTML = "";
  setDefaultDate();
  formTitle.textContent = "Добавить тренировку";
  formSubmit.textContent = "Сохранить тренировку";
  cancelEditBtn.classList.add("hidden");
}

function startEdit(id) {
  const workout = workouts.find((w) => w.id === id);
  if (!workout) return;
  editingWorkoutId = id;
  nameInput.value = workout.name;
  dateInput.value = workout.date;
  exercisesBlock.innerHTML = "";
  workout.exercises.forEach((ex) => addExerciseRow(ex));
  formTitle.textContent = "Редактировать тренировку";
  formSubmit.textContent = "Обновить тренировку";
  cancelEditBtn.classList.remove("hidden");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

cancelEditBtn.addEventListener("click", resetForm);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const date = dateInput.value;
  if (!name) { alert("Введите название тренировки"); return; }
  if (!date) { alert("Выберите дату"); return; }
  const exercises = collectExercises();
  if (!exercises) return;
  if (editingWorkoutId) {
    const idx = workouts.findIndex((w) => w.id === editingWorkoutId);
    if (idx >= 0) workouts[idx] = { ...workouts[idx], name, date, exercises };
  } else {
    workouts.push({ id: makeId(), name, date, exercises });
  }
  saveWorkouts();
  resetForm();
  renderWorkoutsRoute();
});

function deleteWorkout(id) {
  if (!confirm("Удалить эту тренировку?")) return;
  workouts = workouts.filter((w) => w.id !== id);
  saveWorkouts();
  if (editingWorkoutId === id) resetForm();
  renderWorkoutsRoute();
}

function renderWorkoutList() {
  const sorted = sortedWorkouts();
  workoutList.innerHTML = "";
  document.getElementById("workout-count").textContent = sorted.length > 0 ? sorted.length + " зап." : "";
  if (sorted.length === 0) {
    workoutList.innerHTML = '<p class="empty-state">Пока нет сохранённых тренировок. Добавьте первую выше.</p>';
    return;
  }
  sorted.forEach((workout) => {
    const item = document.createElement("div");
    item.className = "workout-item";
    const volume = workoutVolume(workout);
    item.innerHTML = `
      <div class="workout-head">
        <div class="workout-head-info">
          <h3>${escapeHtml(workout.name)}</h3>
          <span class="workout-date">${formatDate(workout.date)}</span>
        </div>
        <div class="workout-actions">
          <button class="btn-edit">Редактировать</button>
          <button class="btn-delete">Удалить</button>
        </div>
      </div>
      <p class="workout-summary">${workout.exercises.length} упр. · объём <strong>${formatNumber(volume)} кг</strong></p>
      <div class="exercise-list">
        ${workout.exercises.map((ex) => `
          <div class="exercise-row">
            <span class="ex-name">${escapeHtml(ex.name)}</span>
            <span class="ex-metric">подходы: <strong>${ex.sets}</strong></span>
            <span class="ex-metric">повт.: <strong>${ex.reps}</strong></span>
            <span class="ex-metric">вес: <strong>${formatNumber(ex.weight)} кг</strong></span>
          </div>`).join("")}
      </div>`;
    item.querySelector(".btn-edit").addEventListener("click", () => startEdit(workout.id));
    item.querySelector(".btn-delete").addEventListener("click", () => deleteWorkout(workout.id));
    workoutList.appendChild(item);
  });
}

function renderWorkoutsRoute() { renderWorkoutList(); }

// ============================================================
// LIVE WORKOUT
// ============================================================

let liveState = null; // { name, exercises: [{name, sets:[{weight,reps,done}]}], startTime, timerInterval, restInterval, restSeconds }

const liveSetup = document.getElementById("live-setup");
const liveActive = document.getElementById("live-active");
const liveFinished = document.getElementById("live-finished");
const liveNameInput = document.getElementById("live-name");
const liveProgramSelect = document.getElementById("live-program");
const liveExerciseSelect = document.getElementById("live-exercise-select");
const liveAddExerciseBtn = document.getElementById("live-add-exercise");
const liveExercisesContainer = document.getElementById("live-exercises");
const liveStartBtn = document.getElementById("live-start");
const liveActiveExercises = document.getElementById("live-active-exercises");
const liveActiveName = document.getElementById("live-active-name");
const liveActiveTime = document.getElementById("live-active-time");
const liveRestBox = document.getElementById("live-rest-box");
const liveRestTime = document.getElementById("live-rest-time");
const liveRestSkip = document.getElementById("live-rest-skip");
const liveFinishBtn = document.getElementById("live-finish");
const liveCancelBtn = document.getElementById("live-cancel");
const liveDoneBtn = document.getElementById("live-done");
const liveSummaryContent = document.getElementById("live-summary-content");

function renderLiveRoute() {
  // Сброс к начальному экрану если нет активной тренировки
  if (!liveState) {
    liveSetup.classList.remove("hidden");
    liveActive.classList.add("hidden");
    liveFinished.classList.add("hidden");
    // Заполняем выбор упражнений
    populateExerciseSelects();
    populateProgramSelect();
    liveExercisesContainer.innerHTML = "";
    liveNameInput.value = "";
  } else {
    liveSetup.classList.add("hidden");
    liveActive.classList.remove("hidden");
    liveFinished.classList.add("hidden");
    renderLiveActive();
  }
}

function populateExerciseSelects() {
  const all = allExercises();
  const options = all.map((e) => `<option value="${escapeHtml(e.name)}">${escapeHtml(e.name)}</option>`).join("");
  liveExerciseSelect.innerHTML = options;
  // Также для формы добавления кастомного упражнения
  const ceMuscle = document.getElementById("ce-muscle");
  if (ceMuscle && !ceMuscle.options.length) {
    ceMuscle.innerHTML = MUSCLE_KEYS.map((k, i) => `<option value="${k}">${MUSCLE_GROUPS[i]}</option>`).join("");
  }
}

function populateProgramSelect() {
  liveProgramSelect.innerHTML = '<option value="">Без программы</option>' +
    programs.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
}

liveAddExerciseBtn.addEventListener("click", () => {
  const name = liveExerciseSelect.value;
  if (!name) return;
  const item = document.createElement("div");
  item.className = "live-exercise-setup";
  item.innerHTML = `
    <div>
      <div class="les-name">${escapeHtml(name)}</div>
      <div class="les-hint">Будет добавлено в тренировку</div>
    </div>
    <button type="button" class="exercise-remove" style="height:36px;font-size:16px">×</button>`;
  item.querySelector(".exercise-remove").addEventListener("click", () => item.remove());
  item.dataset.name = name;
  liveExercisesContainer.appendChild(item);
});

liveStartBtn.addEventListener("click", () => {
  const name = liveNameInput.value.trim() || "Тренировка " + formatDateShort(new Date().toISOString().slice(0, 10));
  const exerciseEls = liveExercisesContainer.querySelectorAll(".live-exercise-setup");
  let exercises = [];
  if (exerciseEls.length > 0) {
    exercises = Array.from(exerciseEls).map((el) => ({
      name: el.dataset.name,
      sets: [
        { weight: 0, reps: 0, done: false },
        { weight: 0, reps: 0, done: false },
        { weight: 0, reps: 0, done: false },
      ],
    }));
  } else {
    alert("Добавьте хотя бы одно упражнение");
    return;
  }

  // Загружаем программу если выбрана
  const progId = liveProgramSelect.value;
  if (progId) {
    const prog = programs.find((p) => p.id === progId);
    if (prog && prog.days && prog.days.length > 0) {
      const day = prog.days[0];
      if (day.exercises && day.exercises.length > 0) {
        exercises = day.exercises.map((de) => ({
          name: de.name,
          sets: Array.from({ length: de.sets || 3 }, () => ({ weight: 0, reps: de.reps || 0, done: false })),
        }));
      }
    }
  }

  liveState = {
    name,
    exercises,
    startTime: Date.now(),
    timerInterval: null,
    restInterval: null,
    restSeconds: 0,
  };

  // Запускаем таймер
  liveState.timerInterval = setInterval(updateLiveTimer, 1000);
  liveSetup.classList.add("hidden");
  liveActive.classList.remove("hidden");
  liveActiveName.textContent = name;
  renderLiveActive();
});

function updateLiveTimer() {
  if (!liveState) return;
  const elapsed = Math.floor((Date.now() - liveState.startTime) / 1000);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  liveActiveTime.textContent = mm + ":" + ss;

  // Отдых
  if (liveState.restSeconds > 0) {
    liveState.restSeconds--;
    const rm = String(Math.floor(liveState.restSeconds / 60)).padStart(2, "0");
    const rs = String(liveState.restSeconds % 60).padStart(2, "0");
    liveRestTime.textContent = rm + ":" + rs;
    if (liveState.restSeconds <= 0) {
      liveRestBox.classList.add("hidden");
    }
  }
}

function startRestTimer(seconds) {
  liveState.restSeconds = seconds;
  liveRestBox.classList.remove("hidden");
  const rm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rs = String(seconds % 60).padStart(2, "0");
  liveRestTime.textContent = rm + ":" + rs;
}

liveRestSkip.addEventListener("click", () => {
  liveState.restSeconds = 0;
  liveRestBox.classList.add("hidden");
});

// Находит предыдущие результаты для упражнения
function previousResults(exerciseName) {
  const sorted = sortedWorkouts();
  for (const w of sorted) {
    const ex = w.exercises.find((e) => e.name.toLowerCase().trim() === exerciseName.toLowerCase().trim());
    if (ex) return { sets: ex.sets, reps: ex.reps, weight: ex.weight, date: w.date };
  }
  return null;
}

function renderLiveActive() {
  liveActiveExercises.innerHTML = "";
  liveState.exercises.forEach((ex, exIdx) => {
    const prev = previousResults(ex.name);
    const div = document.createElement("div");
    div.className = "live-active-exercise";
    div.innerHTML = `
      <div class="lae-head">
        <div>
          <h4>${escapeHtml(ex.name)}</h4>
          <div class="lae-prev">${prev ? "Прошлый раз: " + prev.sets + "×" + prev.reps + " по " + formatNumber(prev.weight) + " кг (" + formatDateShort(prev.date) + ")" : "Новое упражнение"}</div>
        </div>
        <button class="lae-remove">Убрать</button>
      </div>
      <div class="lae-set-header">
        <span>№</span><span>Вес</span><span>Повт</span><span>Готово</span><span></span>
      </div>
      <div class="lae-sets" data-exidx="${exIdx}"></div>
      <div class="lae-set-actions">
        <button type="button" class="btn btn-ghost lae-add-set">+ Подход</button>
      </div>
      <div class="lae-note">
        <input type="text" class="lae-note-input" placeholder="Заметка к упражнению..." maxlength="200" />
      </div>`;

    const setsContainer = div.querySelector(".lae-sets");
    renderLiveSets(setsContainer, exIdx);

    div.querySelector(".lae-add-set").addEventListener("click", () => {
      liveState.exercises[exIdx].sets.push({ weight: 0, reps: 0, done: false });
      renderLiveSets(setsContainer, exIdx);
    });

    div.querySelector(".lae-remove").addEventListener("click", () => {
      liveState.exercises.splice(exIdx, 1);
      renderLiveActive();
    });

    div.querySelector(".lae-note-input").addEventListener("change", (e) => {
      liveState.exercises[exIdx].note = e.target.value;
    });
    if (ex.note) div.querySelector(".lae-note-input").value = ex.note;

    liveActiveExercises.appendChild(div);
  });
}

function renderLiveSets(container, exIdx) {
  container.innerHTML = "";
  const ex = liveState.exercises[exIdx];
  ex.sets.forEach((set, setIdx) => {
    const row = document.createElement("div");
    row.className = "lae-set" + (set.done ? " done" : "");
    row.innerHTML = `
      <span class="lae-set-num">${setIdx + 1}</span>
      <input type="number" class="lae-set-weight" min="0" step="0.5" placeholder="вес" value="${set.weight || ""}" />
      <input type="number" class="lae-set-reps" min="0" placeholder="повт" value="${set.reps || ""}" />
      <button class="lae-set-toggle" title="Отметить выполнение">${set.done ? "✓" : "○"}</button>
      <button class="lae-set-del exercise-remove" style="height:32px;font-size:14px">×</button>`;

    row.querySelector(".lae-set-weight").addEventListener("input", (e) => {
      ex.sets[setIdx].weight = parseFloat(e.target.value) || 0;
    });
    row.querySelector(".lae-set-reps").addEventListener("input", (e) => {
      ex.sets[setIdx].reps = parseInt(e.target.value, 10) || 0;
    });
    row.querySelector(".lae-set-toggle").addEventListener("click", () => {
      ex.sets[setIdx].done = !ex.sets[setIdx].done;
      if (ex.sets[setIdx].done) {
        startRestTimer(90);
      }
      renderLiveSets(container, exIdx);
    });
    row.querySelector(".lae-set-del").addEventListener("click", () => {
      ex.sets.splice(setIdx, 1);
      renderLiveSets(container, exIdx);
    });

    container.appendChild(row);
  });
}

liveFinishBtn.addEventListener("click", () => {
  if (!liveState) return;
  // Проверяем, что есть хотя бы один выполненный подход
  const hasData = liveState.exercises.some((ex) => ex.sets.some((s) => s.done && s.weight > 0));
  if (!hasData) {
    if (!confirm("Нет отмеченных подходов с весом. Всё равно завершить?")) return;
  }

  // Останавливаем таймер
  clearInterval(liveState.timerInterval);
  liveState.restSeconds = 0;
  liveRestBox.classList.add("hidden");

  // Формируем тренировку для сохранения
  const exercises = liveState.exercises
    .filter((ex) => ex.sets.some((s) => s.done))
    .map((ex) => {
      const doneSets = ex.sets.filter((s) => s.done && s.weight > 0);
      if (doneSets.length === 0) return null;
      const totalReps = doneSets.reduce((sum, s) => sum + s.reps, 0);
      const avgWeight = doneSets.reduce((sum, s) => sum + s.weight, 0) / doneSets.length;
      return {
        name: ex.name,
        sets: doneSets.length,
        reps: Math.round(totalReps / doneSets.length),
        weight: Math.round(avgWeight * 10) / 10,
      };
    })
    .filter(Boolean);

  const today = new Date().toISOString().slice(0, 10);
  const workout = {
    id: makeId(),
    name: liveState.name,
    date: today,
    exercises,
  };

  if (exercises.length > 0) {
    workouts.push(workout);
    saveWorkouts();
  }

  // Показываем сводку
  const elapsed = Math.floor((Date.now() - liveState.startTime) / 1000);
  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;
  const vol = workoutVolume(workout);

  liveActive.classList.add("hidden");
  liveFinished.classList.remove("hidden");
  liveSummaryContent.innerHTML = `
    <div class="live-summary-stats">
      <div class="live-summary-stat"><div class="lss-val">${exercises.length}</div><div class="lss-label">упражнений</div></div>
      <div class="live-summary-stat"><div class="lss-val">${formatNumber(vol)}</div><div class="lss-label">объём, кг</div></div>
      <div class="live-summary-stat"><div class="lss-val">${mm}:${String(ss).padStart(2, "0")}</div><div class="lss-label">длительность</div></div>
      <div class="live-summary-stat"><div class="lss-val">${exercises.reduce((s, e) => s + e.sets, 0)}</div><div class="lss-label">подходов</div></div>
    </div>
    <div class="live-summary-exercises">
      ${exercises.map((e) => `<div class="live-summary-ex"><strong>${escapeHtml(e.name)}</strong>: ${e.sets}×${e.reps} по ${formatNumber(e.weight)} кг</div>`).join("")}
    </div>
    <p style="color:var(--text-muted);font-size:14px">Тренировка сохранена в историю.</p>`;

  liveState = null;
});

liveCancelBtn.addEventListener("click", () => {
  if (!confirm("Отменить тренировку? Данные не будут сохранены.")) return;
  clearInterval(liveState.timerInterval);
  liveState = null;
  liveRestBox.classList.add("hidden");
  renderLiveRoute();
});

liveDoneBtn.addEventListener("click", () => {
  liveFinished.classList.add("hidden");
  renderLiveRoute();
});

// ============================================================
// ПРОГРАММЫ
// ============================================================

const programForm = document.getElementById("program-form");
const programNameInput = document.getElementById("program-name");
const programTypeSelect = document.getElementById("program-type");
const programSubmit = document.getElementById("program-submit");
const programList = document.getElementById("program-list");
const programCount = document.getElementById("program-count");
const programTemplates = document.getElementById("program-templates");

const PROGRAM_TEMPLATES = [
  {
    name: "Full Body 3 дня",
    type: "fullbody",
    desc: "Три тренировки на всё тело в неделю. Базовая программа для начинающих.",
    days: [
      { name: "День A", exercises: [
        { name: "Приседания со штангой", sets: 4, reps: 8 },
        { name: "Жим лёжа штангой", sets: 4, reps: 8 },
        { name: "Тяга штанги в наклоне", sets: 4, reps: 8 },
      ]},
      { name: "День B", exercises: [
        { name: "Румынская тяга", sets: 4, reps: 8 },
        { name: "Жим гантелей лёжа", sets: 4, reps: 10 },
        { name: "Подтягивания", sets: 4, reps: 8 },
      ]},
    ],
  },
  {
    name: "Upper/Lower 4 дня",
    type: "upperlower",
    desc: "Четыре тренировки: два дня верха и два дня низа. Для среднего уровня.",
    days: [
      { name: "Верх A", exercises: [
        { name: "Жим лёжа штангой", sets: 4, reps: 6 },
        { name: "Тяга верхнего блока", sets: 4, reps: 8 },
        { name: "Армейский жим", sets: 3, reps: 8 },
        { name: "Подъём штанги на бицепс", sets: 3, reps: 10 },
      ]},
      { name: "Низ A", exercises: [
        { name: "Приседания со штангой", sets: 4, reps: 6 },
        { name: "Жим ногами", sets: 4, reps: 10 },
        { name: "Румынская тяга", sets: 3, reps: 8 },
      ]},
    ],
  },
  {
    name: "Push/Pull/Legs 6 дней",
    type: "ppl",
    desc: "Шесть тренировок: толкающие, тянущие, ноги. Для опытных.",
    days: [
      { name: "Push (толкай)", exercises: [
        { name: "Жим лёжа штангой", sets: 4, reps: 8 },
        { name: "Армейский жим", sets: 4, reps: 8 },
        { name: "Жим узким хватом", sets: 3, reps: 10 },
      ]},
      { name: "Pull (тяни)", exercises: [
        { name: "Подтягивания", sets: 4, reps: 8 },
        { name: "Тяга штанги в наклоне", sets: 4, reps: 8 },
        { name: "Подъём гантелей на бицепс", sets: 3, reps: 12 },
      ]},
      { name: "Legs (ноги)", exercises: [
        { name: "Приседания со штангой", sets: 4, reps: 6 },
        { name: "Румынская тяга", sets: 4, reps: 8 },
        { name: "Выпады с гантелями", sets: 3, reps: 12 },
      ]},
    ],
  },
];

function renderProgramTemplates() {
  programTemplates.innerHTML = "";
  PROGRAM_TEMPLATES.forEach((tmpl) => {
    const card = document.createElement("div");
    card.className = "program-card";
    card.innerHTML = `
      <div class="pc-type">${tmpl.type === "fullbody" ? "Full Body" : tmpl.type === "upperlower" ? "Upper/Lower" : "Push/Pull/Legs"}</div>
      <h4>${escapeHtml(tmpl.name)}</h4>
      <p class="pc-desc">${escapeHtml(tmpl.desc)}</p>
      <div class="pc-days">${tmpl.days.length} тренировочных дня</div>`;
    card.addEventListener("click", () => {
      // Клонируем шаблон в мои программы
      const prog = {
        id: makeId(),
        name: tmpl.name,
        type: tmpl.type,
        days: tmpl.days.map((d) => ({
          id: makeId(),
          name: d.name,
          exercises: d.exercises.map((e) => ({ ...e })),
        })),
      };
      programs.push(prog);
      savePrograms();
      renderProgramsRoute();
    });
    programTemplates.appendChild(card);
  });
}

programForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = programNameInput.value.trim();
  if (!name) return;
  const prog = {
    id: makeId(),
    name,
    type: programTypeSelect.value,
    days: [],
  };
  programs.push(prog);
  savePrograms();
  programForm.reset();
  renderProgramsRoute();
});

function deleteProgram(id) {
  if (!confirm("Удалить программу?")) return;
  programs = programs.filter((p) => p.id !== id);
  savePrograms();
  renderProgramsRoute();
}

function addProgramDay(id) {
  const prog = programs.find((p) => p.id === id);
  if (!prog) return;
  const dayName = "День " + (prog.days.length + 1);
  prog.days.push({ id: makeId(), name: dayName, exercises: [] });
  savePrograms();
  renderProgramsRoute();
}

function deleteProgramDay(progId, dayId) {
  const prog = programs.find((p) => p.id === progId);
  if (!prog) return;
  prog.days = prog.days.filter((d) => d.id !== dayId);
  savePrograms();
  renderProgramsRoute();
}

function addDayExercise(progId, dayId, name, sets, reps) {
  const prog = programs.find((p) => p.id === progId);
  if (!prog) return;
  const day = prog.days.find((d) => d.id === dayId);
  if (!day) return;
  day.exercises.push({ name, sets: parseInt(sets, 10) || 3, reps: parseInt(reps, 10) || 8 });
  savePrograms();
  renderProgramsRoute();
}

function deleteDayExercise(progId, dayId, idx) {
  const prog = programs.find((p) => p.id === progId);
  if (!prog) return;
  const day = prog.days.find((d) => d.id === dayId);
  if (!day) return;
  day.exercises.splice(idx, 1);
  savePrograms();
  renderProgramsRoute();
}

function renderProgramsRoute() {
  renderProgramTemplates();
  programCount.textContent = programs.length > 0 ? programs.length + " шт." : "";
  programList.innerHTML = "";

  if (programs.length === 0) {
    programList.innerHTML = '<p class="empty-state">Создай программу или выбери шаблон выше.</p>';
    return;
  }

  programs.forEach((prog) => {
    const item = document.createElement("div");
    item.className = "program-item";
    const typeLabel = prog.type === "fullbody" ? "Full Body" : prog.type === "upperlower" ? "Upper/Lower" : prog.type === "ppl" ? "Push/Pull/Legs" : "Своя";
    item.innerHTML = `
      <div class="program-item-head">
        <div>
          <h4>${escapeHtml(prog.name)}</h4>
          <div class="pi-type">${typeLabel} · ${prog.days.length} дней</div>
        </div>
        <div class="program-item-actions">
          <button class="pi-add-day">+ День</button>
          <button class="pi-start-live">Начать</button>
          <button class="pi-delete">Удалить</button>
        </div>
      </div>
      <div class="program-days"></div>`;

    const daysContainer = item.querySelector(".program-days");
    prog.days.forEach((day) => {
      const dayDiv = document.createElement("div");
      dayDiv.className = "program-day";
      dayDiv.innerHTML = `
        <div class="program-day-head">
          <h5>${escapeHtml(day.name)}</h5>
          <button class="pi-day-del exercise-remove" style="height:28px;font-size:12px">×</button>
        </div>
        <div class="program-day-ex-list">
          ${day.exercises.map((ex, i) => `
            <div class="program-day-ex">
              ${escapeHtml(ex.name)}: ${ex.sets}×${ex.reps}
              <button class="pi-ex-del exercise-remove" style="height:22px;font-size:10px;padding:0 6px;float:right" data-idx="${i}">×</button>
            </div>`).join("")}
        </div>
        <div class="program-day-form">
          <select class="pd-ex-select"></select>
          <div style="display:flex;gap:8px">
            <input type="number" class="pd-ex-sets" min="1" max="20" value="3" style="width:60px" placeholder="подх" />
            <input type="number" class="pd-ex-reps" min="1" max="100" value="8" style="width:60px" placeholder="повт" />
          </div>
          <button type="button" class="btn btn-ghost" style="padding:8px 14px">+</button>
        </div>`;

      // Заполняем выбор упражнений
      const sel = dayDiv.querySelector(".pd-ex-select");
      sel.innerHTML = allExercises().map((e) => `<option value="${escapeHtml(e.name)}">${escapeHtml(e.name)}</option>`).join("");

      dayDiv.querySelector(".program-day-form button").addEventListener("click", () => {
        addDayExercise(prog.id, day.id, sel.value, dayDiv.querySelector(".pd-ex-sets").value, dayDiv.querySelector(".pd-ex-reps").value);
      });
      dayDiv.querySelector(".pi-day-del").addEventListener("click", () => deleteProgramDay(prog.id, day.id));
      dayDiv.querySelectorAll(".pi-ex-del").forEach((btn) => {
        btn.addEventListener("click", () => deleteDayExercise(prog.id, day.id, parseInt(btn.dataset.idx, 10)));
      });

      daysContainer.appendChild(dayDiv);
    });

    item.querySelector(".pi-add-day").addEventListener("click", () => addProgramDay(prog.id));
    item.querySelector(".pi-delete").addEventListener("click", () => deleteProgram(prog.id));
    item.querySelector(".pi-start-live").addEventListener("click", () => {
      liveProgramSelect.value = prog.id;
      navigate("live");
    });

    programList.appendChild(item);
  });
}

// ============================================================
// БИБЛИОТЕКА УПРАЖНЕНИЙ
// ============================================================

const exSearchInput = document.getElementById("ex-search");
const muscleFilterContainer = document.getElementById("muscle-filter");
const exerciseLibraryGrid = document.getElementById("exercise-library");
const customExerciseForm = document.getElementById("custom-exercise-form");
let activeMuscleFilter = "all";

function renderMuscleFilter() {
  muscleFilterContainer.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.className = "muscle-chip" + (activeMuscleFilter === "all" ? " active" : "");
  allBtn.textContent = "Все";
  allBtn.addEventListener("click", () => { activeMuscleFilter = "all"; renderExercisesRoute(); });
  muscleFilterContainer.appendChild(allBtn);

  MUSCLE_KEYS.forEach((key, i) => {
    const btn = document.createElement("button");
    btn.className = "muscle-chip" + (activeMuscleFilter === key ? " active" : "");
    btn.textContent = MUSCLE_GROUPS[i];
    btn.addEventListener("click", () => { activeMuscleFilter = key; renderExercisesRoute(); });
    muscleFilterContainer.appendChild(btn);
  });
}

function renderExerciseLibrary() {
  const query = exSearchInput.value.toLowerCase().trim();
  const all = allExercises();
  let filtered = all;

  if (activeMuscleFilter !== "all") {
    filtered = filtered.filter((e) => e.muscle === activeMuscleFilter);
  }
  if (query) {
    filtered = filtered.filter((e) =>
      e.name.toLowerCase().includes(query) ||
      (e.equipment && e.equipment.toLowerCase().includes(query))
    );
  }

  exerciseLibraryGrid.innerHTML = "";
  if (filtered.length === 0) {
    exerciseLibraryGrid.innerHTML = '<p class="empty-state" style="grid-column:1/-1">Ничего не найдено.</p>';
    return;
  }

  filtered.forEach((ex) => {
    const muscleLabel = MUSCLE_GROUPS[MUSCLE_KEYS.indexOf(ex.muscle)] || ex.muscle;
    const isCustom = customExercises.some((ce) => ce.name === ex.name);
    const card = document.createElement("div");
    card.className = "exercise-card-lib";
    card.innerHTML = `
      <div class="el-name">${escapeHtml(ex.name)}</div>
      <div class="el-tags">
        <span class="el-tag muscle">${muscleLabel}</span>
        <span class="el-tag">${ex.type === "compound" ? "Базовое" : "Изолирующее"}</span>
        ${ex.equipment ? `<span class="el-tag">${escapeHtml(ex.equipment)}</span>` : ""}
      </div>
      ${ex.technique ? `<p class="el-technique">${escapeHtml(ex.technique)}</p>` : ""}
      ${isCustom ? '<div class="el-custom-badge">Моё упражнение</div>' : ""}`;
    exerciseLibraryGrid.appendChild(card);
  });
}

exSearchInput.addEventListener("input", renderExerciseLibrary);

customExerciseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("ce-name").value.trim();
  if (!name) return;
  // Проверяем дубликат
  const exists = allExercises().some((e) => e.name.toLowerCase().trim() === name.toLowerCase().trim());
  if (exists) { alert("Упражнение с таким названием уже есть"); return; }
  const ex = {
    name,
    muscle: document.getElementById("ce-muscle").value,
    equipment: document.getElementById("ce-equipment").value.trim(),
    type: document.getElementById("ce-type").value,
    technique: document.getElementById("ce-technique").value.trim(),
  };
  customExercises.push(ex);
  saveCustomExercises();
  customExerciseForm.reset();
  renderExercisesRoute();
});

function renderExercisesRoute() {
  renderMuscleFilter();
  renderExerciseLibrary();
}

// ============================================================
// АНАЛИТИКА — расчёты (сохранено + расширено)
// ============================================================

function weekStart(iso) {
  const d = new Date(iso);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function weeklyVolume(countWeeks) {
  const weeks = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisWeek = weekStart(today.toISOString().slice(0, 10));
  const result = [];
  for (let i = countWeeks - 1; i >= 0; i--) {
    const d = new Date(thisWeek);
    d.setDate(d.getDate() - i * 7);
    const key = d.toISOString().slice(0, 10);
    weeks[key] = { week: key, label: formatDateShort(key), volume: 0, count: 0 };
    result.push(weeks[key]);
  }
  workouts.forEach((w) => {
    const key = weekStart(w.date);
    if (weeks[key]) { weeks[key].volume += workoutVolume(w); weeks[key].count += 1; }
  });
  return result;
}

function filterByPeriod(days) {
  if (days === "all") return [...workouts];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return workouts.filter((w) => w.date >= cutoff.toISOString().slice(0, 10));
}

function weeklyMaxWeight(exerciseName, countWeeks) {
  const weeks = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisWeek = weekStart(today.toISOString().slice(0, 10));
  const result = [];
  for (let i = countWeeks - 1; i >= 0; i--) {
    const d = new Date(thisWeek);
    d.setDate(d.getDate() - i * 7);
    const key = d.toISOString().slice(0, 10);
    weeks[key] = { week: key, label: formatDateShort(key), maxWeight: 0 };
    result.push(weeks[key]);
  }
  const search = exerciseName.toLowerCase().trim();
  workouts.forEach((w) => {
    const key = weekStart(w.date);
    if (!weeks[key]) return;
    w.exercises.forEach((ex) => {
      if (ex.name.toLowerCase().trim() === search && ex.weight > weeks[key].maxWeight) {
        weeks[key].maxWeight = ex.weight;
      }
    });
  });
  return result;
}

function allExerciseNames() {
  const set = new Set();
  workouts.forEach((w) => w.exercises.forEach((ex) => set.add(ex.name)));
  return Array.from(set).sort();
}

function periodToWeeks(days) {
  if (days === "all") {
    if (workouts.length === 0) return 8;
    const sorted = sortedWorkouts();
    const oldest = new Date(sorted[sorted.length - 1].date);
    const now = new Date();
    const diffDays = Math.max(1, (now - oldest) / 86400000);
    return Math.max(8, Math.ceil(diffDays / 7) + 1);
  }
  return Math.max(4, Math.ceil(days / 7));
}

// ============================================================
// ГРАФИКИ — SVG (сохранено)
// ============================================================

function renderBarChart(container, data, valueKey) {
  container.innerHTML = "";
  const values = data.map((d) => d[valueKey]);
  const maxVal = Math.max(1, ...values);
  const width = container.clientWidth || 400;
  const height = container.clientHeight || 200;
  const padding = { top: 16, right: 12, bottom: 36, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barGap = 8;
  const barWidth = Math.max(12, (chartW / data.length) - barGap);

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "chart-svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("preserveAspectRatio", "none");

  const defs = document.createElementNS(svgNS, "defs");
  defs.innerHTML = `<linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>`;
  svg.appendChild(defs);

  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartH / gridLines) * i;
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", padding.left); line.setAttribute("x2", width - padding.right);
    line.setAttribute("y1", y); line.setAttribute("y2", y);
    line.setAttribute("stroke", "#2a3038"); line.setAttribute("stroke-width", "1");
    svg.appendChild(line);
    const val = Math.round(maxVal * (1 - i / gridLines));
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", padding.left - 8); text.setAttribute("y", y + 4);
    text.setAttribute("text-anchor", "end"); text.setAttribute("fill", "#5b6577");
    text.setAttribute("font-size", "11"); text.textContent = formatNumber(val);
    svg.appendChild(text);
  }

  data.forEach((d, i) => {
    const val = d[valueKey];
    const x = padding.left + (chartW / data.length) * i + barGap / 2;
    const barH = (val / maxVal) * chartH;
    const y = padding.top + chartH - barH;
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", x); rect.setAttribute("y", val > 0 ? y : padding.top + chartH - 2);
    rect.setAttribute("width", barWidth); rect.setAttribute("height", val > 0 ? barH : 2);
    rect.setAttribute("rx", "5"); rect.setAttribute("fill", "url(#barGrad)");
    rect.setAttribute("opacity", val > 0 ? "0.9" : "0.2");
    svg.appendChild(rect);
    if (i % 2 === 0 || data.length <= 8) {
      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", x + barWidth / 2); label.setAttribute("y", height - padding.bottom + 18);
      label.setAttribute("text-anchor", "middle"); label.setAttribute("fill", "#5b6577");
      label.setAttribute("font-size", "10"); label.textContent = d.label;
      svg.appendChild(label);
    }
  });
  container.appendChild(svg);
}

function renderLineChart(container, data, valueKey) {
  container.innerHTML = "";
  const values = data.map((d) => d[valueKey]);
  const maxVal = Math.max(1, ...values);
  const hasData = values.some((v) => v > 0);
  if (!hasData) { container.innerHTML = '<p class="chart-empty">Нет данных для этого упражнения</p>'; return; }

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 280;
  const padding = { top: 20, right: 20, bottom: 36, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "chart-svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("preserveAspectRatio", "none");

  const defs = document.createElementNS(svgNS, "defs");
  defs.innerHTML = `<linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="rgba(245,158,11,0.35)"/><stop offset="100%" stop-color="rgba(245,158,11,0)"/></linearGradient>`;
  svg.appendChild(defs);

  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartH / gridLines) * i;
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", padding.left); line.setAttribute("x2", width - padding.right);
    line.setAttribute("y1", y); line.setAttribute("y2", y);
    line.setAttribute("stroke", "#2a3038"); line.setAttribute("stroke-width", "1");
    svg.appendChild(line);
    const val = Math.round(maxVal * (1 - i / gridLines));
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", padding.left - 8); text.setAttribute("y", y + 4);
    text.setAttribute("text-anchor", "end"); text.setAttribute("fill", "#5b6577");
    text.setAttribute("font-size", "11"); text.textContent = formatNumber(val);
    svg.appendChild(text);
  }

  const points = data.map((d, i) => {
    const val = d[valueKey];
    const x = padding.left + (chartW / (data.length - 1 || 1)) * i;
    const y = padding.top + chartH - (val / maxVal) * chartH;
    return { x, y, val, label: d.label };
  });

  let areaPath = `M ${points[0].x} ${padding.top + chartH}`;
  points.forEach((p) => { areaPath += ` L ${p.x} ${p.y}`; });
  areaPath += ` L ${points[points.length - 1].x} ${padding.top + chartH} Z`;
  const area = document.createElementNS(svgNS, "path");
  area.setAttribute("d", areaPath); area.setAttribute("fill", "url(#lineGrad)");
  svg.appendChild(area);

  let linePath = "";
  points.forEach((p, i) => { linePath += (i === 0 ? "M" : " L") + ` ${p.x} ${p.y}`; });
  const line = document.createElementNS(svgNS, "path");
  line.setAttribute("d", linePath); line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#f59e0b"); line.setAttribute("stroke-width", "2.5");
  line.setAttribute("stroke-linecap", "round"); line.setAttribute("stroke-linejoin", "round");
  svg.appendChild(line);

  points.forEach((p, i) => {
    if (p.val === 0 && i > 0 && i < points.length - 1) return;
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y); dot.setAttribute("r", "4");
    dot.setAttribute("fill", "#f59e0b"); dot.setAttribute("stroke", "#0b0d10"); dot.setAttribute("stroke-width", "2");
    svg.appendChild(dot);
    if (i % 2 === 0 || data.length <= 8) {
      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", p.x); label.setAttribute("y", height - padding.bottom + 18);
      label.setAttribute("text-anchor", "middle"); label.setAttribute("fill", "#5b6577");
      label.setAttribute("font-size", "10"); label.textContent = p.label;
      svg.appendChild(label);
    }
  });
  container.appendChild(svg);
}

// ============================================================
// АНАЛИТИКА — рендер (расширено)
// ============================================================

const periodSelect = document.getElementById("analytics-period");
const compareSelect = document.getElementById("analytics-compare");
const exerciseSelect = document.getElementById("analytics-exercise");
const compareResult = document.getElementById("analytics-compare-result");

function renderAnalytics() {
  const days = periodSelect.value;
  const weeks = periodToWeeks(days);
  const volData = weeklyVolume(weeks);
  renderBarChart(document.getElementById("chart-volume"), volData, "volume");
  renderBarChart(document.getElementById("chart-count"), volData, "count");

  const names = allExerciseNames();
  const prevValue = exerciseSelect.value;
  exerciseSelect.innerHTML = names.length
    ? names.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("")
    : '<option value="">Нет упражнений</option>';
  if (prevValue && names.includes(prevValue)) exerciseSelect.value = prevValue;
  else if (names.length) exerciseSelect.value = names[0];
  renderWeightChart();

  renderMuscleBreakdown(document.getElementById("analytics-muscles"));
  renderRecordsInto(document.getElementById("analytics-records"), true);

  // Сравнение периодов
  if (compareSelect.value === "prev") {
    renderPeriodComparison(days);
  } else {
    compareResult.classList.add("hidden");
  }
}

function renderPeriodComparison(days) {
  const current = filterByPeriod(days);
  let prevDays;
  if (days === "all") { compareResult.classList.add("hidden"); return; }
  prevDays = parseInt(days, 10) * 2;
  const allInPrev = filterByPeriod(prevDays);
  const currentStart = new Date();
  currentStart.setDate(currentStart.getDate() - parseInt(days, 10));
  const prevWorkouts = allInPrev.filter((w) => w.date < currentStart.toISOString().slice(0, 10));

  const currVol = current.reduce((s, w) => s + workoutVolume(w), 0);
  const prevVol = prevWorkouts.reduce((s, w) => s + workoutVolume(w), 0);
  const currCount = current.length;
  const prevCount = prevWorkouts.length;

  function delta(curr, prev) {
    const d = curr - prev;
    if (prev === 0) return curr > 0 ? '<span class="cp-delta up">новый</span>' : '<span class="cp-delta">нет данных</span>';
    const pct = ((d / prev) * 100).toFixed(0);
    const cls = d > 0 ? "up" : d < 0 ? "down" : "";
    return `<span class="cp-delta ${cls}">${d > 0 ? "+" : ""}${pct}%</span>`;
  }

  compareResult.classList.remove("hidden");
  compareResult.innerHTML = `
    <div class="cp-row"><span class="cp-label">Тренировок: ${currCount} / ${prevCount}</span>${delta(currCount, prevCount)}</div>
    <div class="cp-row"><span class="cp-label">Объём: ${formatNumber(currVol)} / ${formatNumber(prevVol)} кг</span>${delta(currVol, prevVol)}</div>`;
}

function renderWeightChart() {
  const name = exerciseSelect.value;
  if (!name) {
    document.getElementById("chart-weights").innerHTML = '<p class="chart-empty">Добавьте упражнения с весами</p>';
    return;
  }
  const days = periodSelect.value;
  const weeks = periodToWeeks(days);
  const data = weeklyMaxWeight(name, weeks);
  renderLineChart(document.getElementById("chart-weights"), data, "maxWeight");
}

periodSelect.addEventListener("change", renderAnalytics);
compareSelect.addEventListener("change", renderAnalytics);
exerciseSelect.addEventListener("change", renderWeightChart);

// ============================================================
// ЦЕЛИ И ДОСТИЖЕНИЯ
// ============================================================

const goalForm = document.getElementById("goal-form");
const goalList = document.getElementById("goal-list");
const achievementList = document.getElementById("achievement-list");

goalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("goal-name").value.trim();
  const type = document.getElementById("goal-type").value;
  const target = parseFloat(document.getElementById("goal-target").value);
  const deadline = parseInt(document.getElementById("goal-deadline").value, 10) || 0;
  if (!name || !target) return;
  goals.push({
    id: makeId(),
    name,
    type,
    target,
    deadline,
    created: new Date().toISOString().slice(0, 10),
    done: false,
  });
  saveGoals();
  goalForm.reset();
  renderGoalsRoute();
});

function deleteGoal(id) {
  goals = goals.filter((g) => g.id !== id);
  saveGoals();
  renderGoalsRoute();
}

// Вычисляет текущее значение цели
function goalCurrentValue(goal) {
  if (goal.type === "weight") {
    // Максимальный вес в упражнении, название которого совпадает с целью
    const records = computeRecords();
    const rec = records.find((r) => r.name.toLowerCase().trim() === goal.name.toLowerCase().trim());
    return rec ? rec.weight : 0;
  }
  if (goal.type === "volume") {
    return totalVolume();
  }
  if (goal.type === "frequency") {
    const wk = weeklyVolume(2);
    return wk[wk.length - 1] ? wk[wk.length - 1].count : 0;
  }
  if (goal.type === "custom") {
    return 0; // пользователь отслеживает вручную
  }
  return 0;
}

function renderGoalsRoute() {
  goalList.innerHTML = "";
  if (goals.length === 0) {
    goalList.innerHTML = '<p class="empty-state">Целей пока нет. Создай первую выше.</p>';
  } else {
    goals.forEach((goal) => {
      const current = goalCurrentValue(goal);
      const pct = Math.min(100, (current / goal.target) * 100);
      const isDone = pct >= 100;
      const item = document.createElement("div");
      item.className = "goal-item";
      const typeLabel = { weight: "Рабочий вес", volume: "Объём", frequency: "Частота", custom: "Своя" }[goal.type];
      const unit = goal.type === "frequency" ? " трен." : goal.type === "volume" ? " кг" : goal.type === "weight" ? " кг" : "";
      let deadlineText = "";
      if (goal.deadline > 0) {
        const dl = new Date(goal.created);
        dl.setDate(dl.getDate() + goal.deadline);
        const daysLeft = Math.ceil((dl - new Date()) / 86400000);
        deadlineText = daysLeft > 0 ? "Осталось " + daysLeft + " дн." : "Срок истёк";
      }
      item.innerHTML = `
        <div class="goal-item-head">
          <div>
            <h4>${escapeHtml(goal.name)}</h4>
            <div class="gi-type">${typeLabel}</div>
          </div>
          <button class="gi-delete">Удалить</button>
        </div>
        <div class="goal-progress-row">
          <span class="gp-current">${formatNumber(current)}${unit}</span>
          <span class="gp-target">Цель: ${formatNumber(goal.target)}${unit}</span>
        </div>
        <div class="goal-progress-track">
          <div class="goal-progress-fill ${isDone ? "done" : ""}" style="width:${pct}%"></div>
        </div>
        <div class="goal-deadline">${isDone ? "Цель достигнута!" : deadlineText}</div>`;
      item.querySelector(".gi-delete").addEventListener("click", () => deleteGoal(goal.id));
      goalList.appendChild(item);
    });
  }
  renderAchievements();
}

// Достижения — автоматически вычисляются
function renderAchievements() {
  const achievements = [
    { id: "first", icon: "🎯", name: "Первая тренировка", desc: "Запиши первую тренировку", check: () => workouts.length >= 1 },
    { id: "five", icon: "💪", name: "5 тренировок", desc: "Запиши 5 тренировок", check: () => workouts.length >= 5 },
    { id: "ten", icon: "🔥", name: "10 тренировок", desc: "Запиши 10 тренировок", check: () => workouts.length >= 10 },
    { id: "twentyfive", icon: "⚡", name: "25 тренировок", desc: "Запиши 25 тренировок", check: () => workouts.length >= 25 },
    { id: "fifty", icon: "🏆", name: "50 тренировок", desc: "Запиши 50 тренировок", check: () => workouts.length >= 50 },
    { id: "vol10k", icon: "📊", name: "10 000 кг", desc: "Общий объём 10 000 кг", check: () => totalVolume() >= 10000 },
    { id: "vol50k", icon: "📈", name: "50 000 кг", desc: "Общий объём 50 000 кг", check: () => totalVolume() >= 50000 },
    { id: "pr5", icon: "🏅", name: "5 рекордов", desc: "5 упражнений с рекордами", check: () => computeRecords().length >= 5 },
    { id: "body1", icon: "📏", name: "Body Tracker", desc: "Запиши параметры тела", check: () => bodyEntries.length >= 1 },
    { id: "body5", icon: "📋", name: "5 измерений", desc: "5 записей тела", check: () => bodyEntries.length >= 5 },
    { id: "prog1", icon: "📑", name: "Программист", desc: "Создай программу", check: () => programs.length >= 1 },
    { id: "goal1", icon: "🎯", name: "Целеполагание", desc: "Поставь цель", check: () => goals.length >= 1 },
  ];

  achievementList.innerHTML = "";
  achievements.forEach((a) => {
    const unlocked = a.check();
    const card = document.createElement("div");
    card.className = "achievement-card" + (unlocked ? " unlocked" : "");
    card.innerHTML = `
      <div class="achievement-icon">${a.icon}</div>
      <h5>${a.name}</h5>
      <p>${a.desc}</p>`;
    achievementList.appendChild(card);
  });
}

// ============================================================
// BODY TRACKER
// ============================================================

const bodyForm = document.getElementById("body-form");
const bodyDateInput = document.getElementById("body-date");
const bodyHistory = document.getElementById("body-history");
const bodyCount = document.getElementById("body-count");

bodyDateInput.value = new Date().toISOString().slice(0, 10);

function sortedBody() {
  return [...bodyEntries].sort((a, b) => b.date.localeCompare(a.date));
}

bodyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = bodyDateInput.value;
  if (!date) { alert("Выберите дату"); return; }
  const entry = {
    id: makeId(),
    date,
    weight: parseFloat(document.getElementById("body-weight").value) || null,
    chest: parseFloat(document.getElementById("body-chest").value) || null,
    waist: parseFloat(document.getElementById("body-waist").value) || null,
    arm: parseFloat(document.getElementById("body-arm").value) || null,
    thigh: parseFloat(document.getElementById("body-thigh").value) || null,
  };
  // Проверим, что хотя бы одно поле заполнено
  if (entry.weight == null && entry.chest == null && entry.waist == null && entry.arm == null && entry.thigh == null) {
    alert("Заполните хотя бы одно измерение");
    return;
  }
  bodyEntries.push(entry);
  saveBodyEntries();
  bodyForm.reset();
  bodyDateInput.value = new Date().toISOString().slice(0, 10);
  renderBodyRoute();
});

function deleteBodyEntry(id) {
  if (!confirm("Удалить запись?")) return;
  bodyEntries = bodyEntries.filter((e) => e.id !== id);
  saveBodyEntries();
  renderBodyRoute();
}

function renderBodyRoute() {
  const sorted = sortedBody();
  bodyCount.textContent = sorted.length > 0 ? sorted.length + " зап." : "";
  bodyHistory.innerHTML = "";

  if (sorted.length === 0) {
    bodyHistory.innerHTML = '<p class="body-empty">Записей пока нет. Добавьте первое измерение выше.</p>';
  } else {
    sorted.forEach((e) => {
      const row = document.createElement("div");
      row.className = "body-entry";
      row.innerHTML = `
        <span class="be-date">${formatDateShort(e.date)}</span>
        <span class="be-metric"><strong>${e.weight != null ? formatNumber(e.weight) + " кг" : "-"}</strong></span>
        <span class="be-metric">Гр: <strong>${e.chest != null ? e.chest : "-"}</strong></span>
        <span class="be-metric">Тл: <strong>${e.waist != null ? e.waist : "-"}</strong></span>
        <span class="be-metric">Рк: <strong>${e.arm != null ? e.arm : "-"}</strong></span>
        <span class="be-metric">Бд: <strong>${e.thigh != null ? e.thigh : "-"}</strong></span>
        <button class="be-delete">Удалить</button>`;
      row.querySelector(".be-delete").addEventListener("click", () => deleteBodyEntry(e.id));
      bodyHistory.appendChild(row);
    });
  }

  // Графики
  renderBodyCharts();
}

function renderBodyCharts() {
  const sorted = [...bodyEntries].sort((a, b) => a.date.localeCompare(b.date));

  // Масса тела
  const weightData = sorted.filter((e) => e.weight != null).map((e) => ({
    label: formatDateShort(e.date), weight: e.weight,
  }));
  if (weightData.length > 0) {
    renderLineChart(document.getElementById("chart-body-weight"), weightData, "weight");
  } else {
    document.getElementById("chart-body-weight").innerHTML = '<p class="chart-empty">Нет данных о массе тела</p>';
  }

  // Обхваты — нужна мульти-линейная диаграмма, используем bar chart для упрощения
  const measContainer = document.getElementById("chart-body-measurements");
  const measData = sorted.filter((e) => e.chest != null || e.waist != null || e.arm != null).map((e) => ({
    label: formatDateShort(e.date),
    volume: (e.chest || 0) + (e.waist || 0) + (e.arm || 0) + (e.thigh || 0),
    count: 1,
  }));
  if (measData.length > 0) {
    renderBarChart(measContainer, measData, "volume");
  } else {
    measContainer.innerHTML = '<p class="chart-empty">Нет данных об обхватах</p>';
  }
}

// ============================================================
// НАСТРОЙКИ (сохранено + расширено)
// ============================================================

const settingsNameInput = document.getElementById("settings-name");

function renderSettings() {
  settingsNameInput.value = settings.userName || "";
  const storageItems = [
    localStorage.getItem(STORAGE_KEY) || "[]",
    localStorage.getItem(PROGRAMS_KEY) || "[]",
    localStorage.getItem(EXERCISES_KEY) || "[]",
    localStorage.getItem(GOALS_KEY) || "[]",
    localStorage.getItem(BODY_KEY) || "[]",
  ];
  const totalBytes = storageItems.reduce((s, str) => s + str.length, 0);
  document.getElementById("settings-info").innerHTML = `
    <strong>Тренировок:</strong> ${workouts.length}<br>
    <strong>Программ:</strong> ${programs.length}<br>
    <strong>Своих упражнений:</strong> ${customExercises.length}<br>
    <strong>Целей:</strong> ${goals.length}<br>
    <strong>Записей тела:</strong> ${bodyEntries.length}<br>
    <strong>Размер данных:</strong> ${(totalBytes / 1024).toFixed(1)} КБ`;
}

document.getElementById("save-settings").addEventListener("click", () => {
  settings.userName = settingsNameInput.value.trim();
  saveSettings();
  renderSettings();
  alert("Настройки сохранены!");
});

document.getElementById("export-data").addEventListener("click", () => {
  const data = {
    workouts, settings, programs, customExercises, goals, bodyEntries,
    exported: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fittrack-export-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("clear-data").addEventListener("click", () => {
  if (!confirm("Удалить ВСЕ данные? Это действие нельзя отменить.")) return;
  if (!confirm("Точно удалить все тренировки, программы, цели и измерения?")) return;
  workouts = []; programs = []; customExercises = []; goals = []; bodyEntries = [];
  settings = { userName: "" };
  saveWorkouts(); saveSettings(); savePrograms(); saveCustomExercises(); saveGoals(); saveBodyEntries();
  renderSettings();
  alert("Все данные удалены.");
});

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

loadWorkouts();
loadSettings();
loadPrograms();
loadCustomExercises();
loadGoals();
loadBodyEntries();
setDefaultDate();
