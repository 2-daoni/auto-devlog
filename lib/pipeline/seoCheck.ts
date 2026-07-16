export type SeoCheckResult = {
  score: number; // 0~100
  issues: string[]; // 통과 못한 항목 설명
  titleLength: number;
};

const TITLE_MIN = 15;
const TITLE_MAX = 40; // 한글 기준, 검색 결과에서 안 잘리는 권장 범위
const META_MIN = 50;
const META_MAX = 160;

/**
 * 별도 유료 SEO API 없이, 티스토리/구글 검색에 흔히 권장되는 규칙을 자체 체크합니다.
 * - 제목 길이
 * - 메타 설명(요약 앞부분을 메타 설명으로 가정) 길이
 * - 본문 내 키워드(제목 핵심 단어) 등장 여부
 * - 이미지 alt 텍스트 존재 여부 (마크다운 ![]() 문법 기준)
 */
export function checkSeo(title: string, bodyMarkdown: string): SeoCheckResult {
  const issues: string[] = [];
  let score = 100;

  const titleLength = title.length;
  if (titleLength < TITLE_MIN || titleLength > TITLE_MAX) {
    issues.push(`제목 길이가 권장 범위(${TITLE_MIN}~${TITLE_MAX}자)를 벗어남: 현재 ${titleLength}자`);
    score -= 20;
  }

  const metaCandidate = bodyMarkdown.replace(/\n/g, " ").slice(0, 200).trim();
  if (metaCandidate.length < META_MIN || metaCandidate.length > META_MAX) {
    issues.push(
      `메타 설명으로 쓸 도입부 길이가 권장 범위(${META_MIN}~${META_MAX}자)를 벗어남: 현재 ${metaCandidate.length}자`
    );
    score -= 15;
  }

  // 제목에서 핵심 키워드(2글자 이상 단어) 추출 후 본문에 등장하는지 체크
  const keywords = title.split(/\s+/).filter((w) => w.length >= 2);
  const missingKeywords = keywords.filter((k) => !bodyMarkdown.includes(k));
  if (missingKeywords.length > 0) {
    issues.push(`본문에 제목 키워드가 등장하지 않음: ${missingKeywords.join(", ")}`);
    score -= 10;
  }

  const hasImage = /!\[[^\]]*\]\([^)]+\)/.test(bodyMarkdown);
  const imagesWithoutAlt = (bodyMarkdown.match(/!\[\s*\]\([^)]+\)/g) ?? []).length;
  if (hasImage && imagesWithoutAlt > 0) {
    issues.push(`alt 텍스트 없는 이미지 ${imagesWithoutAlt}개 발견`);
    score -= 10;
  }

  return {
    score: Math.max(score, 0),
    issues,
    titleLength,
  };
}
