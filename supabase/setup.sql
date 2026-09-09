-- 칼로리 트래커 MVP — Supabase 초기 설정
-- Supabase 대시보드 > SQL Editor 에서 전체 내용을 붙여넣고 실행하세요.

-- 1. 기록(logs) 테이블 생성
create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id text not null,
  food_name text not null,
  amount_g numeric not null check (amount_g > 0),
  calories numeric not null check (calories >= 0),
  carbs numeric not null check (carbs >= 0),
  protein numeric not null check (protein >= 0),
  fat numeric not null check (fat >= 0),
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

-- 6-1. 정책: 본인 기록만 수정 가능 (오늘 기록의 섭취량 수정 기능, TECH_SPEC.md 3.4/5.13)
--      delete 정책과 동일하게 "본인 것인지"만 DB에서 강제하고, "오늘 기록만" 제한은
--      UI에서 처리한다 (과거 기록 화면엔 수정/삭제 버튼 자체가 없음, delete 정책과 동일한 설계).
create policy "update own logs"
  on logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. 마이그레이션: 이미 위 create table로 logs를 만들어둔 프로젝트라면
--    아래를 추가로 한 번 실행해 음수/조작된 값이 저장되지 않도록 제약을 걸어주세요.
--    (RLS는 "누구 것인지"만 보장할 뿐 "값이 정상적인지"는 막지 않기 때문에 필요합니다.)
do $$
begin
  alter table logs add constraint logs_calories_nonneg check (calories >= 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table logs add constraint logs_carbs_nonneg check (carbs >= 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table logs add constraint logs_protein_nonneg check (protein >= 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table logs add constraint logs_fat_nonneg check (fat >= 0);
exception
  when duplicate_object then null;
end $$;

-- 8. 마이그레이션: 이미 배포된 프로젝트에 "본인 기록 수정" 정책이 없다면 추가.
--    (오늘 기록의 섭취량을 삭제 후 재입력이 아니라 바로 수정할 수 있게 하는 기능용)
do $$
begin
  create policy "update own logs"
    on logs for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;
