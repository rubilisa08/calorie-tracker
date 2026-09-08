# 기술명세서 — 칼로리 트래커 MVP

관련 문서: [PRD.md](PRD.md)

## 0. 문서 정보
- 작성일: 2026-09-08
- 버전: v2.0 — Supabase Auth + DB 반영
- 전제: 회원가입/로그인은 Supabase Auth에 위임, 음식 기록(logs)은 Supabase Postgres DB에 사용자별로 저장

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
```

- `update` 정책은 MVP에서 기록 수정 기능이 없으므로 생성하지 않음(필요 시 추후 추가).
- RLS 없이 배포하면 **다른 사용자의 기록이 노출되는 심각한 보안 문제**가 발생하므로, 배포 전 반드시 RLS 활성화 + 정책 적용을 확인한다 (PRD 8.3 리스크 참고).

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

### 5.6 하루 총합 계산
- 로드된 오늘 기록 배열을 `reduce`하여 칼로리/탄/단/지 합계를 클라이언트에서 계산 (DB 집계 쿼리 없이 단순 합산으로 충분).

### 5.7 음식 검색 (변경 없음)
- `foods.json`을 앱 로드 시 1회 `fetch`하여 메모리 배열로 보관, `name.includes(query)`로 클라이언트 사이드 필터링.

### 5.8 날짜 기준
- `log_date`는 서버(UTC) 기준이 아니라 **클라이언트 로컬 날짜**를 문자열로 계산해 전달 (`new Date().toLocaleDateString('sv-SE')` 형태로 `YYYY-MM-DD` 생성) — 사용자가 실제로 인지하는 "오늘"과 일치시키기 위함.

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

---

## 11. 향후 확장 시 고려사항 (참고용, 이번 구현 범위 아님)
- 비밀번호 재설정: Supabase `resetPasswordForEmail` API + 이메일 템플릿 설정으로 비교적 쉽게 추가 가능.
- 소셜 로그인: Supabase Auth Providers(Google 등) 설정만으로 확장 가능, 프론트 코드 변경 최소화.
- 실시간 동기화: Supabase Realtime 구독(`supabase.channel(...)`)으로 기기 간 즉시 반영 가능.
- 외부 영양성분 API로 전환 시 `foods.json` 로딩 부분만 API 호출로 교체하면 되도록 검색/계산 로직과 데이터 소스를 분리해서 구현.
- 날짜별 히스토리: `log_date`로 이미 구조화되어 있으므로 조회 UI(달력, 기간 선택)만 추가하면 됨.
