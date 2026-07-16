# auto-devlog

개발 관련 블로그/릴리즈 노트를 자동 수집 → 요약 → 한글 번역 → 예제코드 보강 → SEO 체크까지 처리하고,
티스토리에 올릴 최종 초안을 만들어주는 파이프라인 + 관리용 대시보드입니다.

> 티스토리 Open API는 2024년 2월 공식 종료되어, 현재는 **초안 자동 생성 → 사람이 직접 발행(반자동)** 방식으로 동작합니다.
> 자세한 배경과 로드맵은 `auto-devlog-기획서.md` 참고.

## 시작하기

```bash
npm install
cp .env.example .env   # 값 채워넣기 (ANTHROPIC_API_KEY 필수)
npx prisma migrate dev --name init
npm run dev
```

`http://localhost:3000/dashboard` 접속.

## 파이프라인 수동 실행

```bash
curl -X POST http://localhost:3000/api/pipeline/run
```

또는 대시보드에서 각 단계를 개별 호출하며 디버깅:

```bash
curl -X POST http://localhost:3000/api/collect
curl -X POST http://localhost:3000/api/summarize
curl -X POST http://localhost:3000/api/seo-check
curl -X POST http://localhost:3000/api/publish
```

## 상태(status) 흐름

```
COLLECTED → TRANSLATED → SEO_CHECKED → (finalDraft 생성됨) → PUBLISHED
                                              ↳ 대시보드에서 사람이 직접 티스토리에 올린 뒤 "발행 완료" 버튼 클릭
```

## 폴더 구조

- `config/sources.ts` — 수집 대상 소스 목록 (RSS 주소는 실제 값으로 재검증 필요)
- `lib/collectors/` — RSS / GitHub Release 수집기
- `lib/pipeline/` — 요약, 번역, 예제코드 생성, SEO 체크
- `lib/publisher/` — 초안 조합(B안) / Playwright 자동 발행(A안, 추후 구현)
- `app/api/` — 각 단계별 Route Handler
- `app/dashboard/` — 현황 목록 + 초안 상세/발행 처리 화면
- `.github/workflows/daily.yml` — 매일 아침 파이프라인 자동 실행

## TODO (다음 작업)

1. `config/sources.ts`의 RSS 주소 실제 값으로 검증 (사이트 개편으로 바뀌었을 수 있음)
2. `.env` 값 채우고 `npm run dev`로 로컬에서 `/api/collect` 단독 테스트
3. Vercel에 배포 후 `DEPLOY_URL`, `CRON_SECRET`을 GitHub Actions secrets에 등록
4. 1~2주 반자동 운영 후 품질 확인되면 `lib/publisher/tistoryAuto.ts`(Phase 6) 구현 검토
