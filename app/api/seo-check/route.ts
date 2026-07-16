import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCodeExample } from "@/lib/pipeline/codeExample";
import { checkSeo } from "@/lib/pipeline/seoCheck";

/**
 * [5]+[7] 예제코드 보강 + SEO 체크 단계
 * status가 TRANSLATED인 글들을 대상으로:
 *   1) 예제 코드 생성 (CODE_ADDED)
 *   2) 제목/본문 기준 SEO 룰 체크 (SEO_CHECKED)
 * 두 단계를 하나의 route로 묶은 이유: 둘 다 "발행 전 콘텐츠 보강" 성격이라 파이프라인 호출 횟수를 줄이기 위함.
 * 필요시 나중에 두 route로 분리해도 무방합니다.
 */
export async function POST() {
  const targets = await prisma.post.findMany({ where: { status: "TRANSLATED" } });
  let processed = 0;

  for (const post of targets) {
    try {
      const codeExample = await generateCodeExample(post.originalTitle, post.summaryKo ?? "");
      const titleKo = post.translationKo ?? post.originalTitle;
      const bodyForSeo = `${post.summaryKo ?? ""}\n\n${codeExample}`;
      const seoResult = checkSeo(titleKo, bodyForSeo);

      await prisma.post.update({
        where: { id: post.id },
        data: {
          codeExample,
          seoTitleLen: seoResult.titleLength,
          seoScore: seoResult.score,
          seoIssues: JSON.stringify(seoResult.issues),
          status: "SEO_CHECKED",
        },
      });
      processed++;
    } catch (err) {
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "FAILED", errorMessage: String(err) },
      });
    }
  }

  return NextResponse.json({ processed });
}
