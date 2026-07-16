import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * 원문(영문)을 받아 한글 요약(핵심 bullet 3~5개 + 한 줄 총평)을 생성합니다.
 * 저작권 문제를 피하기 위해 원문을 그대로 옮기지 않고 반드시 재구성하도록 프롬프트에 명시합니다.
 */
export async function summarizeToKorean(title: string, body: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `다음은 개발 관련 블로그 글입니다. 이 글을 한국 개발자 대상으로 한글로 요약해줘.

규칙:
- 원문을 그대로 옮기지 말고 반드시 자신의 언어로 재구성할 것
- 핵심 포인트 3~5개를 bullet로 정리
- 마지막에 "왜 중요한가" 한 줄 총평 추가
- 마크다운 형식으로 출력

제목: ${title}

본문:
${body.slice(0, 6000)}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}
