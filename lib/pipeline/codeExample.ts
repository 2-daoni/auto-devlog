import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * 요약된 내용을 바탕으로, 글의 핵심 개념을 보여주는 간단한 예제 코드를 생성합니다.
 * 실제 코드가 필요 없는 소식(정책 발표 등)인 경우 빈 문자열을 반환하도록 프롬프트에 명시합니다.
 */
export async function generateCodeExample(title: string, summaryKo: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `아래는 개발 블로그 글의 한글 요약이야. 이 글의 핵심 개념을 보여주는 짧은 예제 코드를 만들어줘.

규칙:
- 실행 가능한 최소한의 예제로 작성 (10~20줄 이내)
- 코드에 한글 주석을 달아 설명
- 마크다운 코드 블록(\`\`\`)으로 감싸서 출력
- 만약 이 글이 코드로 예시를 들 수 없는 내용(정책 발표, 통계 등)이라면 "SKIP"이라고만 출력

제목: ${title}

요약:
${summaryKo}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const text = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";
  return text === "SKIP" ? "" : text;
}
