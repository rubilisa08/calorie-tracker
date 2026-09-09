# 칼로리 트래커

오늘 먹은 음식을 검색해서 섭취량만 입력하면 칼로리·탄수화물·단백질·지방을 자동 계산하고, 로그인 계정 기준으로 기록을 저장해 여러 기기에서 확인할 수 있는 웹 앱입니다.

문서: [PRD.md](PRD.md) · [TECH_SPEC.md](TECH_SPEC.md) · [MVP_SCOPE.md](MVP_SCOPE.md) · [DATA_ACCURACY.md](DATA_ACCURACY.md)

## 기술 스택
- HTML / CSS / Vanilla JavaScript (빌드 도구 없음)
- [Supabase](https://supabase.com) — 인증(이메일/비밀번호) + Postgres DB (RLS 적용)

## 로컬에서 실행하기
`fetch`로 `data/foods.json`을 불러오므로 `file://`로 직접 열면 동작하지 않습니다. 반드시 로컬 서버를 통해 열어주세요.

```bash
npx http-server . -p 8322 -c-1
```

## Supabase 설정
1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. `supabase/setup.sql`을 SQL Editor에서 실행 (logs 테이블 + RLS 정책 생성)
3. `Project Settings > API`에서 Project URL, anon(publishable) key 확인
4. `supabaseClient.js`에 해당 값 입력

## 알려진 제약사항 (MVP)
- 음식 데이터는 자체 조사한 약 164개 항목만 지원합니다 (배달음식·프랜차이즈·디저트·유행음식 메뉴 포함). 영양성분은 일반적인 평균값 기준 추정치이며, 164개 중 70개(원재료 위주)를 외부 공식 자료와 대조해 7개를 수정했습니다 — 검증 방법·범위·한계는 [DATA_ACCURACY.md](DATA_ACCURACY.md) 참고.
- 비밀번호 재설정, 소셜 로그인은 지원하지 않습니다.
- 기기 간 기록 동기화는 재접속/새로고침 시점에 반영됩니다 (실시간 아님).
- Supabase 무료 프로젝트는 일정 기간 미사용 시 자동 일시정지될 수 있습니다.

## 배포
GitHub Pages를 통해 정적 파일로 배포합니다 (백엔드는 Supabase 관리형 서비스 사용).
