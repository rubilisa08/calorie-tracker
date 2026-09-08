-- 칼로리 트래커 MVP — Supabase 초기 설정
-- Supabase 대시보드 > SQL Editor 에서 전체 내용을 붙여넣고 실행하세요.

-- 1. 기록(logs) 테이블 생성
create table if not exists logs (
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

-- 2. 조회 성능을 위한 인덱스 (user_id + log_date 조합으로 자주 조회함)
create index if not exists logs_user_date_idx on logs (user_id, log_date);

-- 3. Row Level Security 활성화 — 반드시 켜야 함 (끄면 모든 사용자의 기록이 서로 노출됨)
alter table logs enable row level security;

-- 4. 정책: 본인 기록만 조회 가능
create policy "select own logs"
  on logs for select
  using (auth.uid() = user_id);

-- 5. 정책: 본인 명의로만 기록 추가 가능
create policy "insert own logs"
  on logs for insert
  with check (auth.uid() = user_id);

-- 6. 정책: 본인 기록만 삭제 가능
create policy "delete own logs"
  on logs for delete
  using (auth.uid() = user_id);

-- update 정책은 만들지 않음: MVP는 기록 수정 기능이 없음 (TECH_SPEC.md 3.4 참고)
