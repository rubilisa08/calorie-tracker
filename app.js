// Supabase 클라이언트는 supabaseClient.js 에서 생성된 전역 `sbClient` 변수를 사용
const client = sbClient;

// ---- DOM refs ----
const authView = document.getElementById("auth-view");
const trackerView = document.getElementById("tracker-view");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const authMessage = document.getElementById("auth-message");
const showSignupLink = document.getElementById("show-signup");
const showLoginLink = document.getElementById("show-login");

const userEmailEl = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");
const todayDateEl = document.getElementById("today-date");

const sumCaloriesEl = document.getElementById("sum-calories");
const sumCarbsEl = document.getElementById("sum-carbs");
const sumProteinEl = document.getElementById("sum-protein");
const sumFatEl = document.getElementById("sum-fat");

const foodSearchInput = document.getElementById("food-search");
const searchResultsEl = document.getElementById("search-results");
const selectedFoodBox = document.getElementById("selected-food");
const selectedFoodNameEl = document.getElementById("selected-food-name");
const selectedFoodBaseEl = document.getElementById("selected-food-base");
const amountInput = document.getElementById("amount-input");
const previewEl = document.getElementById("preview");
const addBtn = document.getElementById("add-btn");

const logListEl = document.getElementById("log-list");
const logEmptyEl = document.getElementById("log-empty");

const goalDisplayEl = document.getElementById("goal-display");
const editGoalBtn = document.getElementById("edit-goal-btn");
const openCalendarBtn = document.getElementById("open-calendar-btn");
const goalForm = document.getElementById("goal-form");
const goalInput = document.getElementById("goal-input");
const cancelGoalBtn = document.getElementById("cancel-goal-btn");

const calendarView = document.getElementById("calendar-view");
const backToTrackerBtn = document.getElementById("back-to-tracker-btn");
const calendarGoalDisplayEl = document.getElementById("calendar-goal-display");
const prevMonthBtn = document.getElementById("prev-month-btn");
const nextMonthBtn = document.getElementById("next-month-btn");
const calendarTitleEl = document.getElementById("calendar-title");
const calendarGridEl = document.getElementById("calendar-grid");
const dayDetailEl = document.getElementById("day-detail");
const dayDetailTitleEl = document.getElementById("day-detail-title");
const dayDetailListEl = document.getElementById("day-detail-list");
const dayDetailEmptyEl = document.getElementById("day-detail-empty");

// ---- 상태 ----
let foods = [];
let selectedFood = null;
let currentLogs = [];
let currentUser = null;
let currentGoal = null; // 하루 목표 칼로리 (kcal), 미설정 시 null

const today = new Date();
let calendarYear = today.getFullYear();
let calendarMonth = today.getMonth() + 1; // 1~12
let monthlyTotals = {}; // { "YYYY-MM-DD": totalCalories }

// ---- 유틸 ----
function round1(n) {
  return Math.round(n * 10) / 10;
}

function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function calcNutrition(food, amountG) {
  const ratio = amountG / 100;
  return {
    calories: Math.round(food.caloriesPer100g * ratio),
    carbs: round1(food.carbsPer100g * ratio),
    protein: round1(food.proteinPer100g * ratio),
    fat: round1(food.fatPer100g * ratio),
  };
}

function showAuthMessage(text) {
  authMessage.textContent = text;
  authMessage.hidden = !text;
}

// 비밀번호 정책: 8자 이상 + 대문자/소문자/숫자/특수문자 중 3종류 이상 포함
// (실제 최종 검증과 유출 비밀번호 차단은 Supabase Auth 설정에서 서버 측으로 강제됨)
function checkPasswordPolicy(password) {
  if (password.length < 8) {
    return "비밀번호는 8자 이상이어야 해요.";
  }

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/];
  const matched = classes.filter((re) => re.test(password)).length;

  if (matched < 3) {
    return "비밀번호에 대문자·소문자·숫자·특수문자 중 3종류 이상을 포함해주세요.";
  }

  return null;
}

// ---- 음식 데이터 로드 ----
async function loadFoods() {
  const res = await fetch("data/foods.json");
  foods = await res.json();
}

// ---- 음식 검색 ----
function renderSearchResults(query) {
  const trimmed = query.trim();
  searchResultsEl.innerHTML = "";

  if (!trimmed) return;

  const matches = foods.filter((f) => f.name.includes(trimmed)).slice(0, 10);

  if (matches.length === 0) {
    const li = document.createElement("li");
    li.className = "search-empty";
    li.textContent = "검색 결과가 없어요. 다른 이름으로 검색해보세요.";
    searchResultsEl.appendChild(li);
    return;
  }

  for (const food of matches) {
    const li = document.createElement("li");

    const name = document.createElement("span");
    name.textContent = food.name;

    const meta = document.createElement("span");
    meta.className = "result-meta";
    meta.textContent = `${food.caloriesPer100g}kcal/100g`;

    li.appendChild(name);
    li.appendChild(meta);
    li.addEventListener("click", () => selectFood(food));
    searchResultsEl.appendChild(li);
  }
}

function selectFood(food) {
  selectedFood = food;
  foodSearchInput.value = food.name;
  searchResultsEl.innerHTML = "";

  selectedFoodBox.hidden = false;
  selectedFoodNameEl.textContent = food.name;
  selectedFoodBaseEl.textContent = `100g당 ${food.caloriesPer100g}kcal · 탄${food.carbsPer100g}g · 단${food.proteinPer100g}g · 지${food.fatPer100g}g`;

  amountInput.value = food.commonServingG;
  updatePreview();
}

function updatePreview() {
  const amount = Number(amountInput.value);

  if (!selectedFood || !amount || amount <= 0) {
    previewEl.textContent = "";
    addBtn.disabled = true;
    return;
  }

  const n = calcNutrition(selectedFood, amount);
  previewEl.textContent = `→ 예상: ${n.calories}kcal / 탄${n.carbs}g · 단${n.protein}g · 지${n.fat}g`;
  addBtn.disabled = false;
}

function resetFoodInput() {
  selectedFood = null;
  foodSearchInput.value = "";
  searchResultsEl.innerHTML = "";
  selectedFoodBox.hidden = true;
  previewEl.textContent = "";
  addBtn.disabled = true;
}

// ---- 오늘의 기록 (Supabase) ----
async function loadTodayLogs() {
  const today = getLocalDateString();
  const { data, error } = await client
    .from("logs")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("log_date", today)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  currentLogs = data;
  renderLogs();
}

function renderLogs() {
  logListEl.innerHTML = "";
  logEmptyEl.hidden = currentLogs.length !== 0;

  for (const log of currentLogs) {
    const li = document.createElement("li");
    li.className = "log-item";

    const nameBox = document.createElement("div");
    nameBox.className = "log-name";
    nameBox.innerHTML = `<span class="log-food">${log.food_name}</span><span class="log-amount">${log.amount_g}g</span>`;

    const nutritionBox = document.createElement("div");
    nutritionBox.className = "log-nutrition";
    nutritionBox.innerHTML = `<span class="log-calories">${log.calories}kcal</span><br>탄${log.carbs} · 단${log.protein} · 지${log.fat}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => deleteLog(log.id));

    li.appendChild(nameBox);
    li.appendChild(nutritionBox);
    li.appendChild(deleteBtn);
    logListEl.appendChild(li);
  }

  renderSummary();
}

function renderSummary() {
  const totals = currentLogs.reduce(
    (acc, log) => {
      acc.calories += Number(log.calories);
      acc.carbs += Number(log.carbs);
      acc.protein += Number(log.protein);
      acc.fat += Number(log.fat);
      return acc;
    },
    { calories: 0, carbs: 0, protein: 0, fat: 0 }
  );

  sumCaloriesEl.textContent = Math.round(totals.calories);
  sumCarbsEl.textContent = round1(totals.carbs);
  sumProteinEl.textContent = round1(totals.protein);
  sumFatEl.textContent = round1(totals.fat);
}

async function addLog() {
  const amount = Number(amountInput.value);
  if (!selectedFood || !amount || amount <= 0) return;

  const n = calcNutrition(selectedFood, amount);

  const { error } = await client.from("logs").insert({
    user_id: currentUser.id,
    food_id: selectedFood.id,
    food_name: selectedFood.name,
    amount_g: amount,
    calories: n.calories,
    carbs: n.carbs,
    protein: n.protein,
    fat: n.fat,
    log_date: getLocalDateString(),
  });

  if (error) {
    console.error(error);
    alert("기록 추가에 실패했어요. 잠시 후 다시 시도해주세요.");
    return;
  }

  resetFoodInput();
  await loadTodayLogs();
}

async function deleteLog(id) {
  const { error } = await client.from("logs").delete().eq("id", id);
  if (error) {
    console.error(error);
    alert("삭제에 실패했어요. 잠시 후 다시 시도해주세요.");
    return;
  }
  await loadTodayLogs();
}

// ---- 목표 칼로리 ----
function renderGoalDisplay() {
  const text = currentGoal ? `목표: ${currentGoal}kcal` : "목표가 설정되지 않았어요";
  goalDisplayEl.textContent = text;
  calendarGoalDisplayEl.textContent = text;
}

function loadGoal(user) {
  currentGoal = user.user_metadata?.daily_calorie_goal ?? null;
  renderGoalDisplay();
}

async function saveGoal(value) {
  const { data, error } = await client.auth.updateUser({ data: { daily_calorie_goal: value } });
  if (error) {
    console.error(error);
    alert("목표 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    return;
  }
  currentGoal = data.user.user_metadata?.daily_calorie_goal ?? null;
  renderGoalDisplay();
  if (!calendarView.hidden) renderCalendar();
}

// ---- 캘린더 ----
function getMonthRange(year, month) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end, lastDay };
}

async function loadMonthLogs(year, month) {
  const { start, end } = getMonthRange(year, month);
  const { data, error } = await client
    .from("logs")
    .select("log_date, calories")
    .eq("user_id", currentUser.id)
    .gte("log_date", start)
    .lte("log_date", end);

  if (error) {
    console.error(error);
    monthlyTotals = {};
    return;
  }

  monthlyTotals = {};
  for (const row of data) {
    monthlyTotals[row.log_date] = (monthlyTotals[row.log_date] || 0) + Number(row.calories);
  }
}

function getDayStatus(dateStr) {
  const total = monthlyTotals[dateStr];
  if (total == null) return "none";
  if (currentGoal == null) return "logged";
  return total > currentGoal ? "over" : "within";
}

async function renderCalendar() {
  calendarTitleEl.textContent = `${calendarYear}년 ${calendarMonth}월`;
  await loadMonthLogs(calendarYear, calendarMonth);

  calendarGridEl.innerHTML = "";

  const firstWeekday = new Date(calendarYear, calendarMonth - 1, 1).getDay(); // 0=일
  const { lastDay } = getMonthRange(calendarYear, calendarMonth);
  const todayStr = getLocalDateString();

  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "day-cell day-empty-slot";
    calendarGridEl.appendChild(empty);
  }

  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const status = getDayStatus(dateStr);

    const cell = document.createElement("div");
    cell.className = "day-cell";
    if (status !== "none") cell.classList.add("day-has-log");
    if (status === "over") cell.classList.add("day-over");
    if (dateStr === todayStr) cell.classList.add("day-today");

    const numberEl = document.createElement("span");
    numberEl.className = "day-number";
    numberEl.textContent = day;
    cell.appendChild(numberEl);

    if (status !== "none") {
      const calEl = document.createElement("span");
      calEl.className = "day-calories";
      calEl.textContent = `${monthlyTotals[dateStr]}kcal`;
      cell.appendChild(calEl);
    }

    cell.addEventListener("click", () => openDayDetail(dateStr));
    calendarGridEl.appendChild(cell);
  }
}

async function openDayDetail(dateStr) {
  const { data, error } = await client
    .from("logs")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("log_date", dateStr)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  dayDetailEl.hidden = false;
  dayDetailTitleEl.textContent = `${dateStr} (총 ${monthlyTotals[dateStr] || 0}kcal)`;
  dayDetailListEl.innerHTML = "";
  dayDetailEmptyEl.hidden = data.length !== 0;

  for (const log of data) {
    const li = document.createElement("li");
    li.className = "log-item";

    const nameBox = document.createElement("div");
    nameBox.className = "log-name";
    nameBox.innerHTML = `<span class="log-food">${log.food_name}</span><span class="log-amount">${log.amount_g}g</span>`;

    const nutritionBox = document.createElement("div");
    nutritionBox.className = "log-nutrition";
    nutritionBox.innerHTML = `<span class="log-calories">${log.calories}kcal</span><br>탄${log.carbs} · 단${log.protein} · 지${log.fat}`;

    // 조회 전용 — 삭제 버튼 없음 (오늘이 아닌 날짜의 기록은 수정/삭제 불가)
    li.appendChild(nameBox);
    li.appendChild(nutritionBox);
    dayDetailListEl.appendChild(li);
  }
}

function switchToCalendarView() {
  trackerView.hidden = true;
  calendarView.hidden = false;
  dayDetailEl.hidden = true;
  calendarYear = today.getFullYear();
  calendarMonth = today.getMonth() + 1;
  renderCalendar();
}

function switchToTrackerView() {
  calendarView.hidden = true;
  trackerView.hidden = false;
}

// ---- 화면 전환 ----
function showAuthView() {
  authView.hidden = false;
  trackerView.hidden = true;
  showAuthMessage("");
}

async function showTrackerView(user) {
  currentUser = user;
  authView.hidden = true;
  calendarView.hidden = true;
  trackerView.hidden = false;

  userEmailEl.textContent = user.email;
  todayDateEl.textContent = getLocalDateString();

  loadGoal(user);
  goalForm.hidden = true;
  resetFoodInput();
  await loadTodayLogs();
}

// ---- 인증 이벤트 ----
showSignupLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.hidden = true;
  signupForm.hidden = false;
  showSignupLink.hidden = true;
  showLoginLink.hidden = false;
  showAuthMessage("");
});

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.hidden = false;
  signupForm.hidden = true;
  showSignupLink.hidden = false;
  showLoginLink.hidden = true;
  showAuthMessage("");
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showAuthMessage("");

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    showAuthMessage("로그인에 실패했어요: " + error.message);
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showAuthMessage("");

  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const passwordConfirm = document.getElementById("signup-password-confirm").value;

  if (password !== passwordConfirm) {
    showAuthMessage("비밀번호가 일치하지 않아요.");
    return;
  }

  const policyError = checkPasswordPolicy(password);
  if (policyError) {
    showAuthMessage(policyError);
    return;
  }

  const { data, error } = await client.auth.signUp({ email, password });
  if (error) {
    // 유출된 비밀번호(HaveIBeenPwned 연동) 등 서버 측 정책 위반도 이 메시지로 표시됨
    showAuthMessage("회원가입에 실패했어요: " + error.message);
    return;
  }

  if (!data.session) {
    showAuthMessage("가입 확인 이메일을 보냈어요. 메일함을 확인한 뒤 로그인해주세요.");
  }
});

logoutBtn.addEventListener("click", async () => {
  await client.auth.signOut();
});

// ---- 트래커 이벤트 ----
foodSearchInput.addEventListener("input", () => {
  if (selectedFood && foodSearchInput.value !== selectedFood.name) {
    selectedFood = null;
    selectedFoodBox.hidden = true;
    previewEl.textContent = "";
    addBtn.disabled = true;
  }
  renderSearchResults(foodSearchInput.value);
});

amountInput.addEventListener("input", updatePreview);

addBtn.addEventListener("click", addLog);

// ---- 목표 칼로리 이벤트 ----
editGoalBtn.addEventListener("click", () => {
  goalInput.value = currentGoal ?? "";
  goalForm.hidden = false;
});

cancelGoalBtn.addEventListener("click", () => {
  goalForm.hidden = true;
});

goalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const value = Number(goalInput.value);
  if (!value || value <= 0) return;
  await saveGoal(value);
  goalForm.hidden = true;
});

// ---- 캘린더 이벤트 ----
openCalendarBtn.addEventListener("click", switchToCalendarView);
backToTrackerBtn.addEventListener("click", switchToTrackerView);

prevMonthBtn.addEventListener("click", () => {
  calendarMonth -= 1;
  if (calendarMonth < 1) {
    calendarMonth = 12;
    calendarYear -= 1;
  }
  dayDetailEl.hidden = true;
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  calendarMonth += 1;
  if (calendarMonth > 12) {
    calendarMonth = 1;
    calendarYear += 1;
  }
  dayDetailEl.hidden = true;
  renderCalendar();
});

// ---- 인증 상태 감지 ----
client.auth.onAuthStateChange((event, session) => {
  if (session) {
    showTrackerView(session.user);
  } else {
    currentUser = null;
    showAuthView();
  }
});

// ---- 시작 ----
loadFoods();
