# 기술명세서 — 칼로리 트래커 MVP

관련 문서: [PRD.md](PRD.md)

## 0. 문서 정보
- 작성일: 2026-09-08
- 버전: v3.0 — 목표 칼로리 + 월간 캘린더 반영
- 전제: 회원가입/로그인은 Supabase Auth에 위임, 음식 기록(logs)은 Supabase Postgres DB에 사용자별로 저장, 목표 칼로리는 Supabase Auth user metadata에 저장

### v3.0 변경 요약 (PRD v4.0 대응)
- 목표 칼로리(하루 총 칼로리 단일 값)를 Supabase Auth의 `user_metadata`에 저장 — 별도 테이블/RLS 불필요.
- 캘린더 화면을 위한 월 단위 로그 조회 쿼리 및 날짜별 색상(초과=노란색/이내=기본색) 판정 로직 추가.
- 과거 날짜는 조회 전용이며 `logs` 테이블에 `update` 정책을 추가하지 않는 기존 방침을 유지.

---

## 1. 아키텍처 개요

```
[브라우저]
  ├─ index.html        (로그인/회원가입 화면 + 트래커 메인 화면)
  ├─ style.css
  ├─ app.js            (화면 전환/검색/계산/렌더링 로직)
  ├─ supabaseClient.js (Supabase 클라이언트 초기화, URL + anon key)
  └─ data/foods.json   (자체 음식 DB, 정적 파일 — 로그인 불필요)
        │
        │ fetch (최초 1회, 메모리 캐시)
        ↓
  ┌─────────────────────────────┐
  │        Supabase             │
  │  ┌────────────┐ ┌─────────┐ │
  │  │ Auth        │ │ Postgres│ │
  │  │ (회원가입/   │ │  logs   │ │
  │  │  로그인/세션)│ │  테이블 │ │
  │  └────────────┘ └─────────┘ │
  │        RLS: auth.uid() 기준  │
  └─────────────────────────────┘
```

- 프론트엔드는 정적 파일로 GitHub Pages에 배포.
- 인증(회원가입/로그인/로그아웃/세션 유지)은 전부 **Supabase Auth**가 처리 — 비밀번호 해싱/저장, 토큰 발급/검증을 우리 코드가 직접 다루지 않는다.
- 음식 기록(logs)은 **Supabase Postgres DB**에 사용자 계정 기준으로 저장 → 기기 간 동기화 가능.
- 음식 데이터베이스(`foods.json`)는 로그인 여부와 무관한 공용 참고 데이터이므로 정적 파일로 유지 (DB로 옮기지 않음 — 조회 전용, 사용자별 분리 불필요).
- [todo_supabase](../todo_supabase) 프로젝트와 동일하게 **빌드 도구 없이(no Node/Ruby build step)** Supabase JS SDK를 CDN으로 로드하는 방식 사용.

---

## 2. 기술 스택
- HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- 인증 + DB: **Supabase** (Auth: 이메일/비밀번호, DB: Postgres, 자동 REST API)
- 클라이언트 라이브러리: `@supabase/supabase-js` (CDN `<script>` 태그로 로드, npm/빌드 불필요)
- 배포: GitHub Pages (프론트엔드 정적 파일만)
- 로컬 개발 서버: `npx http-server` (todo_supabase와 동일 방식)

---

## 3. 데이터 모델

### 3.1 음식 데이터베이스 — `data/foods.json` (변경 없음, 정적 파일)
모든 영양성분은 **100g 기준**으로 정규화하여 저장한다.

```json
[
  {
    "id": "rice_white",
    "name": "흰쌀밥",
    "category": "주식",
    "caloriesPer100g": 130,
    "carbsPer100g": 28.1,
    "proteinPer100g": 2.5,
    "fatPer100g": 0.3,
    "commonServingG": 210,
    "commonServingLabel": "1공기"
  }
]
```
필드 설명은 이전 버전과 동일 (id, name, category, caloriesPer100g, carbsPer100g, proteinPer100g, fatPer100g, commonServingG, commonServingLabel).

초기 데이터 규모: 약 80~100개.

### 3.2 인증 — Supabase Auth
- 별도 `users` 테이블을 직접 만들지 않고 Supabase의 내장 `auth.users` 테이블을 사용한다.
- 회원가입: `supabase.auth.signUp({ email, password })`
- 로그인: `supabase.auth.signInWithPassword({ email, password })`
- 로그아웃: `supabase.auth.signOut()`
- 현재 세션 확인: `supabase.auth.getSession()` / 세션 변경 구독: `supabase.auth.onAuthStateChange(...)`
- 이메일 인증(컨펌 메일) 사용 여부는 Supabase 프로젝트 대시보드 설정에 따름 (MVP는 개발/개인 사용 목적이므로 **이메일 인증 비활성화** 권장 → 가입 즉시 로그인 가능, 필요 시 나중에 활성화).

### 3.3 기록 데이터 — Supabase `logs` 테이블

```sql
create table logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id text not null,
  food_name text not null,
  amount_g numeric not null check (amount_g > 0),
  calories numeric not null,
  carbs numeric not null,
  protein numeric not null,
  fat numeric not null,
  log_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index logs_user_date_idx on logs (user_id, log_date);
```

필드 설명:
| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 기록 고유 ID (자동 생성) |
| `user_id` | uuid | 소유 사용자 (auth.users 참조, RLS 핵심 컬럼) |
| `food_id` | text | `foods.json`의 음식 `id` |
| `food_name` | text | 기록 시점의 음식명 (스냅샷, foods.json이 나중에 바뀌어도 과거 기록 유지) |
| `amount_g` | numeric | 섭취량(g) |
| `calories`, `carbs`, `protein`, `fat` | numeric | 계산된 영양성분 (스냅샷 저장 — 매번 재계산하지 않음) |
| `log_date` | date | 기록 날짜 (사용자 로컬 날짜 기준 문자열을 클라이언트에서 계산해 전달) |
| `created_at` | timestamptz | 생성 시각 (정렬용) |

### 3.4 Row Level Security (RLS) — 필수

```sql
alter table logs enable row level security;

create policy "select own logs"
  on logs for select
  using (auth.uid() = user_id);

create policy "insert own logs"
  on logs for insert
  with check (auth.uid() = user_id);

create policy "delete own logs"
  on logs for delete
  using (auth.uid() = user_id);

create policy "update own logs"
  on logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- `update` 정책은 delete 정책과 동일한 설계 — DB는 "본인 것인지"만 강제하고, "오늘 기록만 수정 가능"은 UI에서 강제한다(과거 날짜 상세 화면엔 수정/삭제 버튼 자체를 렌더링하지 않음, 6.8/5.13 참고). 캘린더에서 과거 날짜를 조회 전용으로 두는 PRD 8.1 제약과 UI 레벨에서 일치시킨 것.
- RLS 없이 배포하면 **다른 사용자의 기록이 노출되는 심각한 보안 문제**가 발생하므로, 배포 전 반드시 RLS 활성화 + 정책 적용을 확인한다 (PRD 8.3 리스크 참고).
- RLS는 "누구 것인지"만 보장할 뿐 "값이 정상적인지"는 보장하지 않는다 — 프론트엔드는 항상 정상 계산해서 보내지만, 브라우저 devtools로 API를 직접 호출하면 음수/조작된 영양성분 값도 저장될 수 있다. 이를 막기 위해 `calories`, `carbs`, `protein`, `fat`에도 `amount_g`와 동일하게 `check (... >= 0)` 제약을 추가했다 ([supabase/setup.sql](supabase/setup.sql) 참고, 이미 배포한 프로젝트는 파일 하단의 마이그레이션 블록 실행 필요).

### 3.5 목표 칼로리 — Supabase Auth user metadata
새 테이블을 만들지 않고, 각 사용자의 `auth.users` 레코드에 딸린 `user_metadata`(JSON)에 목표 칼로리를 저장한다.

```js
// 설정/변경
await client.auth.updateUser({ data: { daily_calorie_goal: 1800 } });

// 조회 (현재 세션에서 바로 확인 가능, 별도 쿼리 불필요)
const { data: { user } } = await client.auth.getUser();
const goal = user.user_metadata.daily_calorie_goal ?? null; // 미설정 시 null
```

- `user_metadata`는 **본인만 자신의 것을 수정**할 수 있고(Supabase Auth가 세션의 소유자 검증을 내부적으로 처리), 다른 사용자의 값을 읽거나 쓸 방법이 없으므로 별도의 RLS 설정이 필요 없다.
- 값이 없으면(`null`/`undefined`) "목표 미설정" 상태로 간주 — PRD US-12, US-14의 "목표 미설정 시 노란색 표시 안 함" 조건과 연결된다.
- 목표를 변경해도 과거 `logs` 데이터 자체는 바뀌지 않으며, 캘린더가 매번 "현재 목표값"과 비교해 색상을 계산하므로 자연히 소급 적용된다 (PRD 8.1/8.3에 이미 알려진 제약으로 명시됨 — 별도 이력 테이블을 만들지 않는 가장 단순한 구현).

---

## 4. 파일/폴더 구조

```
calorie_tracker/
├── PRD.md
├── TECH_SPEC.md
├── MVP_SCOPE.md
├── index.html
├── style.css
├── app.js
├── supabaseClient.js   (Supabase URL + anon key, 클라이언트 초기화)
├── data/
│   └── foods.json
├── supabase/
│   └── setup.sql       (logs 테이블 생성 + RLS 정책, todo_supabase의 setup.sql과 동일 패턴)
└── README.md           (배포 링크, 사용법, Supabase 설정 방법, 알려진 제약사항)
```

`supabaseClient.js` 예시:
```js
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJ..."; // anon(public) key — 클라이언트에 노출되어도 안전 (RLS로 보호됨)

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```
- anon key는 공개되어도 안전하도록 설계된 키이며(RLS가 실제 보호막), **service_role key는 절대 프론트엔드 코드에 넣지 않는다** (todo_supabase에서 지켰던 원칙과 동일).

---

## 5. 핵심 로직

### 5.1 인증 상태에 따른 화면 전환
```js
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    showTrackerScreen(session.user);
    loadTodayLogs(session.user.id);
  } else {
    showLoginScreen();
  }
});
```

### 5.2 영양성분 계산 (변경 없음)
```js
function calcNutrition(food, amountG) {
  const ratio = amountG / 100;
  return {
    calories: Math.round(food.caloriesPer100g * ratio),
    carbs: round1(food.carbsPer100g * ratio),
    protein: round1(food.proteinPer100g * ratio),
    fat: round1(food.fatPer100g * ratio),
  };
}
```

### 5.3 오늘 기록 조회
```js
async function loadTodayLogs(userId) {
  const today = getLocalDateString(); // YYYY-MM-DD
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', today)
    .order('created_at', { ascending: true });
  // data를 리스트로 렌더링, 에러 시 안내 메시지
}
```
- `user_id` 조건은 RLS로도 강제되지만, 명시적으로 쿼리에 포함해 의도를 명확히 하고 불필요한 조회를 줄인다.

### 5.4 기록 추가
```js
async function addLog(userId, food, amountG, nutrition) {
  const { error } = await supabase.from('logs').insert({
    user_id: userId,
    food_id: food.id,
    food_name: food.name,
    amount_g: amountG,
    calories: nutrition.calories,
    carbs: nutrition.carbs,
    protein: nutrition.protein,
    fat: nutrition.fat,
    log_date: getLocalDateString(),
  });
  // 성공 시 목록 다시 로드 또는 로컬 상태에 즉시 반영
}
```

### 5.5 기록 삭제
```js
async function deleteLog(logId) {
  const { error } = await supabase.from('logs').delete().eq('id', logId);
  // RLS의 delete 정책이 본인 소유 행만 삭제되도록 보장
}
```

### 5.5-1 기록 수정 (오늘 기록의 섭취량만)
삭제 후 재검색·재입력하지 않아도, 오늘 기록 항목을 클릭 한 번으로 인라인 수정 모드로 전환해 섭취량만 바로 고칠 수 있다.
```js
async function updateLog(logId, foodData, amountG) {
  const n = calcNutrition(foodData, amountG); // foods.json의 현재 100g당 값으로 재계산
  const { error } = await supabase
    .from('logs')
    .update({ amount_g: amountG, calories: n.calories, carbs: n.carbs, protein: n.protein, fat: n.fat })
    .eq('id', logId);
  // RLS의 update 정책이 본인 소유 행만 수정되도록 보장
}
```
- 수정 시 영양성분은 기록 당시 값이 아니라 **현재 `foods.json`의 100g당 값**으로 다시 계산한다 (addLog와 동일한 계산 경로 재사용).
- 편집 UI를 그릴 때 `food_id`가 현재 `foods.json`에 없는 경우(음식 데이터가 나중에 제거된 경우) 수정 버튼을 비활성화하고 삭제만 허용한다 — 재계산에 필요한 100g당 값을 알 수 없기 때문.
- 오늘이 아닌 날짜의 기록에는 애초에 이 버튼을 렌더링하지 않는다(6.8 참고, PRD 8.1과 일치).

### 5.5-2 음식 직접 입력 (2026-09-09 추가)
`foods.json`의 164개 목록에 없는 음식을 위한 수동 기록 경로. **PRD 3.2의 "사용자가 새 음식을 직접 등록하는 기능"(Won't Have)과는 다르다** — `foods.json`이라는 공용 데이터베이스에 영구 등록되는 게 아니라, 그날의 `logs`에 1회성으로 저장되는 기록일 뿐이며 검색 결과에는 나타나지 않는다.
- 입력 항목: 음식 이름(필수), 칼로리(필수), 탄수화물/단백질/지방(선택 — 비워두면 0으로 저장).
- 100g당 값 기반 비례 계산을 하지 않으므로 `amount_g`는 의미가 없어 더미 값 `1`을 저장한다.
- `food_id`는 `foods.json`과 겹치지 않도록 `custom_<uuid>` 형태로 생성 — 검색/캘린더 로직은 `food_id`를 `foods` 배열에서 찾아 이모지·수정 가능 여부를 판단하므로(5.5-1), 커스텀 기록은 자동으로 "수정 불가"(삭제 후 재입력만 가능) 상태가 된다.
```js
async function addManualLog(name, calories, carbs, protein, fat) {
  const { error } = await supabase.from('logs').insert({
    user_id, food_id: `custom_${crypto.randomUUID()}`, food_name: name,
    amount_g: 1, calories, carbs, protein, fat, log_date: getLocalDateString(),
  });
}
```

### 5.5-3 "몇 인분/개" 개수 단위 입력 (2026-09-09 추가)
찌개·국밥·디저트·프랜차이즈 음식처럼 그램으로 재는 게 부자연스러운 음식을 위해, `foods.json` 항목에 `unitType: "count"`를 표시하면 그램 입력 대신 "몇 인분/조각/개"를 입력받는다. **국·찌개, 배달·프랜차이즈, 디저트, 유행음식 4개 카테고리(84개)에 소급 적용**했고, 신규 추가 음식도 카테고리별로 이 값을 부여한다. `주식·단백질·채소·과일·유제품·음료`처럼 실제로 그램 단위 정밀 기록이 의미 있는 카테고리는 그대로 그램 입력(`unitType` 필드 없음, 기본값)을 유지한다.

- DB 스키마 변경 없음 — `logs.amount_g`는 항상 그램으로 저장하고, `commonServingG × 입력한 개수`로 환산해서 넣는다. 화면에 표시할 때만 반대로 `amount_g ÷ commonServingG`로 되돌려 "1.5인분"처럼 보여준다(`formatAmountDisplay`).
- `commonServingLabel`(예: `"1인분"`, `"2줄"`)은 수량이 포함된 서술형 문자열이라, 입력값 뒤에 그대로 이어붙이면 `"1.51인분"`처럼 숫자가 겹친다. 앞의 숫자(분수 포함, 예: `"1/4모"`)를 정규식으로 떼어낸 단위 이름만 별도로 뽑아 쓴다(`getUnitName`).
- 검색 결과 리스트도 `unitType`에 따라 `"165kcal/100g"` 대신 `"495kcal/1인분"`으로 표시한다 — 100g 기준 숫자만 보고 "떡볶이가 165kcal밖에 안 되네"라고 오해하는 걸 막기 위함 (실사용자가 실제로 겪은 혼동).
```js
function getAmountGrams(food, inputValue) {
  const value = Number(inputValue);
  if (!value || value <= 0) return 0;
  return food.unitType === "count" ? value * food.commonServingG : value;
}

function getUnitName(label) {
  return label.replace(/^[0-9]+(\.[0-9]+)?(\/[0-9]+)?/, "") || label;
}
```

### 5.6 하루 총합 계산 및 목표까지 남은 칼로리
- 로드된 오늘 기록 배열을 `reduce`하여 칼로리/탄/단/지 합계를 클라이언트에서 계산 (DB 집계 쿼리 없이 단순 합산으로 충분).
- 합계 계산 직후 `renderGoalRemaining(totalCalories)`를 호출해 목표 대비 잔여/초과 칼로리를 한 줄로 표시한다 (목표 미설정 시 표시하지 않음). 캘린더의 월 단위 초과 표시(5.11)와 달리, 트래커 화면에서 실시간으로 "오늘" 기준 즉각적인 피드백을 준다.
```js
function renderGoalRemaining(totalCalories) {
  if (currentGoal == null) { /* 표시 안 함 */ return; }
  const diff = currentGoal - Math.round(totalCalories);
  // diff >= 0 → "목표까지 {diff}kcal 남았어요"
  // diff < 0  → "목표를 {|diff|}kcal 초과했어요" (강조 스타일)
}
```

### 5.7 음식 검색 — 초성 검색 지원
- `foods.json`을 앱 로드 시 1회 `fetch`하여 메모리 배열로 보관.
- 기본은 `name.includes(query)` 부분 문자열 매칭이지만, 입력값이 초성(ㄱ~ㅎ)으로만 이루어진 경우(`isChosungOnlyQuery`) 음식명에서 초성만 추출한 문자열(`getChosung`)과 비교해 매칭한다. 예: "ㄱㅊㅈㄲ" 입력 시 "김치찌개"가 검색됨.
- 완성형 한글(가~힣) 한 글자당 초성 하나를 추출하고, 한글이 아닌 문자(영문/숫자/공백 등)는 그대로 통과시킨다.

### 5.8 날짜 기준
- `log_date`는 서버(UTC) 기준이 아니라 **클라이언트 로컬 날짜**를 문자열로 계산해 전달 (`new Date().toLocaleDateString('sv-SE')` 형태로 `YYYY-MM-DD` 생성) — 사용자가 실제로 인지하는 "오늘"과 일치시키기 위함.
- 앱을 켜둔 채로 자정을 넘기면 화면이 어제 날짜 그대로 남는 문제가 있어, 다음 자정(+5초 여유)까지의 시간을 계산해 `setTimeout`으로 예약하고 그 시점에 오늘의 기록/캘린더를 다시 불러오도록 처리했다 (`scheduleMidnightRefresh`, [app.js](app.js) 참고). 매번 갱신 후 다음 자정을 다시 예약하는 재귀 방식이다.

### 5.9 목표 칼로리 설정/조회
```js
async function saveGoal(calorieGoal) {
  const { error } = await client.auth.updateUser({ data: { daily_calorie_goal: calorieGoal } });
  // 성공 시 화면의 목표 표시 및 캘린더 색상 즉시 재계산
}

function getGoal(user) {
  return user.user_metadata?.daily_calorie_goal ?? null;
}
```

### 5.10 월별 로그 조회 (캘린더용)
한 번의 쿼리로 해당 월 전체 로그를 가져온 뒤, 클라이언트에서 날짜별로 묶어 합산한다 (하루씩 31번 조회하지 않음).

```js
function getMonthRange(year, month) {
  // month: 1~12
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate(); // 해당 월의 마지막 날짜
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

async function loadMonthLogs(userId, year, month) {
  const { start, end } = getMonthRange(year, month);
  const { data, error } = await client
    .from("logs")
    .select("log_date, calories")
    .eq("user_id", userId)
    .gte("log_date", start)
    .lte("log_date", end);

  if (error) {
    console.error(error);
    return {};
  }

  // { "2026-09-01": 1650, "2026-09-02": 1900, ... } 형태로 날짜별 합계 생성
  const dailyTotals = {};
  for (const row of data) {
    dailyTotals[row.log_date] = (dailyTotals[row.log_date] || 0) + Number(row.calories);
  }
  return dailyTotals;
}
```

### 5.11 날짜별 색상 판정
```js
function getDayStatus(dateStr, dailyTotals, goal) {
  const total = dailyTotals[dateStr];
  if (total == null) return "none";          // 기록 없음 → 무강조
  if (goal == null) return "logged";         // 목표 미설정 → 칼로리 숫자만 표시
  return total > goal ? "over" : "within";   // 초과 → 노란색 / 이내 → 기본색
}
```
- `over` → CSS 클래스 `.day-over` (노란색 배경)
- `within` / `logged` → 기본 스타일
- `none` → 날짜 숫자만, 칼로리 표시 없음

### 5.12 특정 날짜 상세 조회 (읽기 전용)
```js
async function loadLogsForDate(userId, dateStr) {
  const { data, error } = await client
    .from("logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", dateStr)
    .order("created_at", { ascending: true });
  // 오늘 날짜가 아니면 렌더링 시 삭제 버튼을 생성하지 않음 (PRD US-15)
}
```

---

## 6. 화면별 상세 설계

### 6.1 로그인 / 회원가입 화면
- 이메일 input, 비밀번호 input (회원가입 시 비밀번호 확인 input 추가)
- 로그인/회원가입 버튼, 화면 전환 링크
- 에러 메시지 표시 영역 (Supabase 에러 메시지를 사용자 친화적 문구로 매핑)

### 6.2 트래커 메인 화면 — 헤더
- 로그인된 사용자 이메일 표시
- 로그아웃 버튼
- 오늘 날짜 표시

### 6.3 상단 요약 영역 (변경 없음)
- 총 칼로리(kcal), 총 탄수화물(g), 총 단백질(g), 총 지방(g)

### 6.4 입력 영역 (변경 없음)
- 검색 input, 검색 결과 리스트, 섭취량 input, 계산 미리보기, "기록에 추가" 버튼
- 추가 시 Supabase insert 호출 → 성공 시 리스트 갱신

### 6.5 기록 리스트 영역
- 오늘 추가한 항목을 `created_at` 순으로 렌더링
- 각 행: 음식명 · 섭취량(g) · 칼로리 · 탄/단/지 · 삭제(×) 버튼 → 삭제 시 Supabase delete 호출

### 6.6 목표 칼로리 입력
- 트래커 헤더 또는 요약 영역 근처에 목표 칼로리 표시 + "수정" 버튼(또는 숫자 입력 필드 + 저장 버튼)
- 목표 미설정 시 "목표를 설정해보세요" 안내와 함께 입력 유도
- 저장 시 `saveGoal()` 호출 (5.9) → 성공 시 화면 표시 갱신, 캘린더가 열려 있다면 색상도 재계산

### 6.7 캘린더 화면
- 상단: "◀ / YYYY년 M월 / ▶" 이동 컨트롤, 현재 목표 칼로리 표시
- 요일 헤더(일~토) + 날짜 그리드 (해당 월 1일의 요일에 맞춰 앞쪽 빈 칸 채움)
- 각 날짜 칸: 날짜 숫자 + (기록 있으면) 총 칼로리 숫자, `getDayStatus()` 결과에 따라 클래스 부여
- 오늘 날짜 칸은 테두리 등으로 별도 강조
- 월 이동 시 `loadMonthLogs()`를 다시 호출해 그리드 갱신
- 트래커 화면과 캘린더 화면은 같은 페이지 내 뷰 전환(탭/버튼)으로 처리, 별도 라우팅 라이브러리 없이 `hidden` 속성으로 토글

### 6.8 날짜 상세 조회 (읽기 전용)
- 캘린더의 날짜 칸 클릭 시 모달 또는 화면 하단 영역에 `loadLogsForDate()` 결과를 표시
- 오늘 날짜가 아니면 삭제 버튼을 렌더링하지 않음 (조회 전용, PRD US-15/8.1)
- 기록이 없는 날짜 클릭 시 "이 날은 기록이 없어요" 안내

---

## 7. 배포 계획
- `github-pages-deploy` 체크리스트를 따라 프론트엔드 정적 파일 배포 (기존 `rubilisa08/my-product_MVP` 저장소 사용).
- Supabase 프로젝트는 사용자가 직접 [supabase.com](https://supabase.com)에서 생성 (계정 생성/가입은 본인이 진행).
- 프로젝트 생성 후 `supabase/setup.sql`을 Supabase SQL Editor에서 실행하여 `logs` 테이블 + RLS 정책 적용.
- Supabase 프로젝트 설정(Authentication → Providers)에서 이메일 인증 여부 확인/설정.
- `supabaseClient.js`에 발급받은 프로젝트 URL과 anon key 입력 (anon key는 공개 저장소에 커밋해도 안전 — RLS가 실질적 보호).

## 8. 로컬 개발 환경
- `.claude/launch.json`에 아래 항목 추가:
```json
{
  "name": "calorie_tracker",
  "runtimeExecutable": "npx",
  "runtimeArgs": ["http-server", "calorie_tracker", "-p", "8322"],
  "port": 8322
}
```
- `fetch('data/foods.json')` 및 Supabase 클라이언트 호출은 `file://` 직접 열람 시 제약이 있을 수 있으므로 로컬 서버를 통해 확인한다.

---

## 9. 보안 체크리스트 (todo_supabase 경험 반영)
- [ ] `logs` 테이블 RLS 활성화 및 select/insert/delete 정책 적용 확인
- [ ] anon(public) key만 프론트엔드에 사용, service_role key는 어디에도 포함하지 않음
- [ ] 배포 전 서로 다른 두 계정으로 로그인해 상대방 기록이 보이지 않는지 교차 확인
- [ ] `amount_g > 0` 등 DB 레벨 체크 제약으로 최소한의 서버 측 검증 확보 (프론트 검증에만 의존하지 않음)
- [ ] Supabase 무료 티어 제한(DB 용량, 대역폭, 장기 미사용 시 자동 일시정지) README에 명시

---

## 10. 테스트 계획 (수동)
| 시나리오 | 기대 결과 |
|---|---|
| 신규 이메일로 회원가입 | 가입 성공, (설정에 따라) 즉시 로그인 또는 이메일 인증 안내 |
| 이미 가입된 이메일로 재가입 | 에러 안내 |
| 잘못된 비밀번호로 로그인 | 에러 안내, 로그인 실패 |
| 로그인 후 음식 기록 추가 | Supabase `logs`에 저장되고 리스트에 즉시 반영 |
| 기록 추가 후 로그아웃 → 재로그인 | 동일 계정으로 로그인 시 기존 기록이 그대로 조회됨 |
| 계정 A로 기록 추가 후, 계정 B로 로그인 | 계정 B 화면에 계정 A의 기록이 보이지 않음 (RLS 검증) |
| 다른 브라우저/기기에서 같은 계정 로그인 | 동일한 오늘의 기록이 조회됨 (동기화 확인) |
| 항목 삭제 | 리스트에서 제거되고 총합이 즉시 재계산됨, DB에서도 삭제 확인 |
| 세션 만료/로그아웃 상태에서 새로고침 | 로그인 화면으로 전환 |
| 자정 넘겨서 접속 | 새 날짜 기준 빈 기록으로 시작, 이전 날짜 데이터는 DB에 유지 |
| 목표 칼로리 설정 후 새로고침 | 설정한 값이 그대로 유지됨 (user_metadata 조회) |
| 목표 미설정 상태에서 캘린더 진입 | 어떤 날짜도 노란색으로 표시되지 않음, 칼로리 숫자만 표시 |
| 목표보다 높은 칼로리를 기록한 날 | 해당 날짜 칸이 노란색으로 표시됨 |
| 목표를 낮춘 뒤 과거 달력 재조회 | 기존에 "이내"였던 날짜가 새 목표 기준으로 "초과"(노란색)로 바뀔 수 있음 (의도된 동작, PRD 8.1) |
| 이전/다음 달 이동 | 해당 월의 로그를 다시 조회해 그리드가 올바르게 갱신됨 |
| 기록 없는 날짜 클릭 | "이 날은 기록이 없어요" 안내 표시 |
| 오늘이 아닌 날짜의 상세 조회 화면 | 삭제 버튼이 보이지 않음 (조회 전용) |

---

## 11. 향후 확장 시 고려사항 (참고용, 이번 구현 범위 아님)
- 비밀번호 재설정: Supabase `resetPasswordForEmail` API + 이메일 템플릿 설정으로 비교적 쉽게 추가 가능.
- 소셜 로그인: Supabase Auth Providers(Google 등) 설정만으로 확장 가능, 프론트 코드 변경 최소화.
- 실시간 동기화: Supabase Realtime 구독(`supabase.channel(...)`)으로 기기 간 즉시 반영 가능.
- 외부 영양성분 API로 전환 시 `foods.json` 로딩 부분만 API 호출로 교체하면 되도록 검색/계산 로직과 데이터 소스를 분리해서 구현.
- 탄/단/지 개별 목표: `user_metadata`에 `daily_carbs_goal` 등 필드를 추가하고 캘린더 색상 판정 로직을 다중 조건으로 확장하면 됨.
- 목표 변경 이력 관리: 지금은 목표를 하나의 값으로만 저장해 과거 판정에도 소급 적용되므로, 특정 시점 기준으로 고정하려면 `goal_history` 같은 별도 테이블(적용 시작일 포함)이 필요함.
- 과거 기록 수정 허용: `logs`에 `update` RLS 정책을 추가하고 UI에서 오늘 여부에 따른 버튼 숨김 조건(6.8)을 제거하면 됨.
- 사진 기반 음식 인식: 지금의 "정적 프론트엔드 + Supabase" 구조에 서버리스 함수(Supabase Edge Function 등)를 추가해, 이미지 업로드 → Edge Function이 비전 AI API를 호출(API 키는 서버 측에만 보관) → 인식된 음식명/추정 영양성분을 검색 결과처럼 반환 → 사용자가 확인/수정 후 기존 "기록에 추가" 흐름에 그대로 태우는 방식으로 확장 가능.
