/**
 * B안(반자동): 최종 초안을 티스토리에 붙여넣기 좋은 형태(Markdown)로 조합합니다.
 * 실제 파일 저장/다운로드는 대시보드의 /dashboard/drafts/[id] 페이지에서 처리합니다.
 */
export function buildFinalDraft(params: {
  titleKo: string;
  summaryKo: string;
  codeExample: string;
  sourceUrl: string;
}): string {
  const { titleKo, summaryKo, codeExample, sourceUrl } = params;

  const parts = [
    `# ${titleKo}`,
    "",
    summaryKo,
  ];

  if (codeExample) {
    parts.push("", "## 예제 코드", "", codeExample);
  }

  parts.push("", "---", `> 원문: ${sourceUrl}`);

  return parts.join("\n");
}
