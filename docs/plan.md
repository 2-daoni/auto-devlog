# auto-devlog 기획 문서

## 1. 프로젝트 개요
개발 관련 주요 블로그/릴리즈 노트를 자동으로 수집 → 요약 → 한글 번역 → 예제코드 보강 → SEO 체크 → 티스토리 업로드까지 자동화하는 개인 사이드 프로젝트.

- 목적: 최신 개발 소식을 놓치지 않고 트래킹, 동시에 블로그 콘텐츠 자산 축적
- 레포지토리: `auto-devlog` (생성 완료)

## 2. ⚠️ 중요 전제 (기술 조사 결과)
**티스토리 Open API는 2024년 2월 공식 종료되었습니다.** 따라서 "REST API 호출로 업로드"는 불가능하며, 대신 아래 셋 중 하나를 선택해야 합니다.

| 방식 | 설명 | 장점 | 단점 |
|---|---|---|---|
| A. Selenium/Playwright 브라우저 자동화 | 로그인→글쓰기 페이지 이동→입력→발행을 코드로 시뮬레이션 | 실제 티스토리에 그대로 업로드 가능 | 로그인 보안(캡차, 2단계 인증), UI 변경에 취약, 유지보수 부담 |
| B. 반자동(초안 생성 + 수동 발행) | 파이프라인은 자동, 최종 발행 버튼만 사람이 클릭 | 안정적, 검수 가능 | 완전 자동화 아님 |
| C. 플랫폼 변경 | GitHub Pages(Jekyll/Hugo), Velog 등 API/Git 기반 플랫폼 사용 | 완전 자동화 용이, 안정적 | 티스토리 트래픽/애드센스 자산을 못 씀 |

👉 **추천: 초기엔 B(반자동)로 시작 → 안정화되면 A(Selenium) 도입.** 처음부터 완전 자동 발행을 목표로 하면 로그인 실패, 계정 정지 리스크로 프로젝트가 중간에 막힐 가능성이 높습니다.

## 3. 수집 대상 소스
- React Blog
- Next.js Blog
- Vercel Blog
- Chrome Developers
- MDN (Web Docs Blog)
- TypeScript Blog
- GitHub Release (특정 repo 지정 필요, 예: react, next.js 등)
- CSS-Tricks

대부분 RSS 피드를 제공하므로 1차는 RSS 기반 수집을 우선 검토합니다.

## 4. 파이프라인 (End-to-End Flow)

```
[1] 소스 수집 (RSS/스크래핑)
        ↓
[2] 중복/신규 필터링 (이미 처리한 글 DB 체크)
        ↓
[3] 원문 요약 (LLM API)
        ↓
[4] 한글 번역 (LLM API, 요약과 동시 처리 가능)
        ↓
[5] 예제 코드 보강 (관련 코드 스니펫 생성/삽입)
        ↓
[6] 티스토리 포스팅 포맷으로 변환 (Markdown → HTML)
        ↓
[7] SEO 체크 (제목 길이, 메타 설명, 키워드, 이미지 alt 등)
        ↓
[8] 업로드 (반자동 초안 저장 or Selenium 자동 발행)
        ↓
[9] 결과 로깅 + 알림 (Discord/Slack webhook)
```

## 5. 기술 스택
- **언어/프레임워크**: TypeScript + Next.js (App Router)
  - Next.js는 단순 배치 스크립트 실행기가 아니라, **파이프라인 실행 + 관리용 대시보드** 역할을 겸함
  - 각 파이프라인 단계는 `app/api/*/route.ts` (Route Handler) 또는 Server Action으로 구현
  - 대시보드 화면에서 "수집된 글 목록 / 요약·번역 결과 / SEO 체크 결과 / 발행 대기 초안"을 확인하고, 반자동(B안) 발행 시 여기서 "초안 다운로드" 또는 "복사" 버튼 제공
- **수집**: `rss-parser`(RSS), Playwright(Node) — GitHub Release는 `octokit`(GitHub REST API 공식 SDK)
- **요약/번역**: Anthropic API (`@anthropic-ai/sdk`)
- **DB/저장소**: SQLite + Prisma ORM (처리 이력 관리, 중복 방지) — 배포 환경에 따라 추후 Postgres(Vercel Postgres 등)로 교체 가능
- **SEO 체크**: 자체 유틸 함수(제목 글자수, 메타디스크립션 길이, 키워드 밀도 체크) — 별도 유료 API 불필요
- **업로드**: Playwright(Node) — A안(자동 발행) 도입 시. B안(반자동)이면 생략하고 초안 export만
- **스케줄링**: GitHub Actions (cron)에서 배포된 API Route를 주기적으로 호출 (예: `POST /api/pipeline/run`)
- **알림**: Discord Webhook (수집/발행 결과 알림)
- **배포**: Vercel (Next.js와 궁합 good, 단 Playwright는 서버리스 함수 타임아웃/용량 제약이 있어 A안 도입 시 별도 Node 서버 or GitHub Actions 러너에서 실행 고려)

## 6. 폴더 구조 (제안, Next.js App Router 기준)
```
auto-devlog/
├── app/
│   ├── api/
│   │   ├── pipeline/run/route.ts   # 전체 파이프라인 실행 엔드포인트 (cron이 호출)
│   │   ├── collect/route.ts        # [1] 수집
│   │   ├── summarize/route.ts      # [3] 요약
│   │   ├── translate/route.ts      # [4] 번역
│   │   ├── seo-check/route.ts      # [7] SEO 체크
│   │   └── publish/route.ts        # [8] 발행 (A안) / 초안 생성 (B안)
│   ├── dashboard/
│   │   ├── page.tsx                 # 전체 현황 (수집/처리/발행 상태)
│   │   └── drafts/[id]/page.tsx     # 개별 초안 상세/미리보기
│   └── layout.tsx
├── lib/
│   ├── collectors/
│   │   ├── rss.ts
│   │   └── githubRelease.ts        # octokit 사용
│   ├── pipeline/
│   │   ├── summarize.ts
│   │   ├── translate.ts
│   │   ├── codeExample.ts
│   │   └── seoCheck.ts
│   ├── publisher/
│   │   ├── draftExport.ts          # B안: md/html 초안 생성
│   │   └── tistoryAuto.ts          # A안: Playwright 자동 발행 (추후)
│   └── db.ts                       # Prisma client
├── prisma/
│   └── schema.prisma                # Post, ProcessLog 등 모델 정의
├── config/
│   └── sources.ts                   # 수집 소스 목록 (8개 사이트 RSS/URL)
├── .github/workflows/
│   └── daily.yml                    # 스케줄러: /api/pipeline/run 주기 호출
└── README.md
```

## 7. 개발 로드맵 (지금 레포만 만든 상태 기준)

### Phase 0 — 준비 (지금 여기)
- [x] 레포지토리 생성 (`auto-devlog`)
- [x] 기술 스택 확정 (Next.js + TypeScript)
- [ ] `npx create-next-app@latest --typescript` 로 프로젝트 초기화
- [ ] `config/sources.ts`에 8개 소스 RSS/URL 정리
- [ ] Prisma 초기 설정 (`schema.prisma`에 Post/ProcessLog 모델 정의)

### Phase 1 — 수집기 (Collector) 만들기
- [ ] RSS 지원 소스 먼저 연동 (React, Next.js, Vercel, MDN, CSS-Tricks 등)
- [ ] GitHub Release는 GitHub REST API(`/repos/{owner}/{repo}/releases`)로 별도 처리
- [ ] 수집 결과를 Prisma(SQLite)로 저장, 이미 처리한 글 필터링 로직 추가
- **완료 기준**: `/api/collect` 호출 시 소스별 최신 글 목록이 DB에 저장됨

### Phase 2 — 요약 + 번역 파이프라인
- [ ] LLM API 연동, 프롬프트 설계 (원문 → 한글 요약 + 핵심 포인트 bullet)
- [ ] 번역 품질 검수용 샘플 10건 테스트
- **완료 기준**: 원문 URL 하나 넣으면 한글 요약본이 나옴

### Phase 3 — 예제코드 보강
- [ ] 요약 내용 기반으로 관련 예제 코드 스니펫 생성 프롬프트 설계
- [ ] 코드가 실제로 유효한지 간단 검증(문법 체크 정도)
- **완료 기준**: 요약글 + 예제코드가 포함된 완성된 포스팅 초안 생성

### Phase 4 — SEO 체크
- [ ] 제목 글자수(권장 30자 내외), 메타 설명, 태그/키워드 체크 스크립트 작성
- [ ] 체크리스트 통과 못하면 경고만 출력 (자동 수정은 다음 단계로 미룸)
- **완료 기준**: 포스팅 초안에 대해 SEO 점검 리포트 출력

### Phase 5 — 업로드 (B안 먼저)
- [ ] 완성된 초안을 대시보드(`/dashboard/drafts/[id]`)에서 확인, Markdown/HTML로 다운로드
- [ ] 수동으로 티스토리에 복붙 발행
- [ ] 1~2주 운영해보며 품질/빈도 확인
- **완료 기준**: 실제로 블로그에 몇 개 포스팅 발행

### Phase 6 — 자동 발행 고도화 (A안, 선택)
- [ ] Playwright로 로그인/글쓰기/발행 자동화 스크립트 작성
- [ ] 로그인 세션 유지, 실패 시 알림 처리
- **완료 기준**: 사람 개입 없이 초안 → 발행까지 자동 진행

### Phase 7 — 스케줄링 & 운영
- [ ] GitHub Actions로 매일/매주 실행되도록 설정
- [ ] Discord/Slack 알림 연동 (성공/실패, 신규 글 몇 건 처리했는지)
- [ ] 운영하며 프롬프트/필터링 로직 지속 개선

## 8. 리스크 및 고려사항
- 티스토리 계정 자동 로그인은 캡차·보안정책으로 막힐 수 있음 → B안(반자동)을 기본값으로 잡는 걸 권장
- LLM 요약/번역 품질 편차 → 초반엔 사람이 검수하는 프로세스 유지
- 저작권: 원문 전체 복붙이 아니라 요약 + 링크 형태로 구성 필요
- 소스 사이트 구조 변경 시 크롤러 깨질 수 있음 → RSS 우선 사용으로 리스크 최소화