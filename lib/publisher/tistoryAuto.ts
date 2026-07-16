/**
 * A안(완전 자동 발행) - Phase 6에서 구현 예정.
 *
 * 티스토리 Open API가 2024년 2월 종료되어, 공식 API로는 발행이 불가능합니다.
 * 이 모듈은 Playwright로 브라우저를 직접 조작해
 * "카카오 로그인 → 글쓰기 페이지 이동 → 제목/본문 입력 → 발행"을 자동화하는 용도입니다.
 *
 * 주의:
 * - 로그인 시 캡차/2단계 인증이 뜨면 완전 자동화가 막힐 수 있습니다.
 * - 티스토리 에디터 UI가 바뀌면 셀렉터를 다시 맞춰야 합니다.
 * - 계정 정책 위반 소지가 있으니 과도한 빈도의 자동 발행은 피하는 게 안전합니다.
 *
 * 현재는 B안(초안 export 후 수동 발행)을 기본 흐름으로 사용하고,
 * 파이프라인이 안정화된 후 아래 함수를 실제로 구현하는 것을 권장합니다.
 */
export async function publishToTistory(_params: {
  title: string;
  contentMarkdown: string;
}): Promise<{ success: boolean; postUrl?: string }> {
  throw new Error(
    "publishToTistory는 아직 구현되지 않았습니다. Phase 6에서 Playwright 기반으로 구현 예정입니다."
  );
}
