import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * 범용 한글 번역 유틸. summarize.ts가 본문 요약+번역을 한번에 처리하므로,
 * 이 함수는 주로 "포스팅 제목"처럼 짧은 텍스트를 자연스러운 한글로 옮길 때 사용합니다.
 */
export async function translateTitleToKorean(title: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `다음 개발 블로그 글 제목을 자연스러운 한글 블로그 제목으로 번역해줘. 번역문만 출력하고 다른 설명은 붙이지 마.

제목: ${title}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text.trim() : title;
}
