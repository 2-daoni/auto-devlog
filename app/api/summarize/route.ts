import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { summarizeToKorean } from "@/lib/pipeline/summarize";
import { translateTitleToKorean } from "@/lib/pipeline/translate";

/**
 * [3]+[4] 요약 + 제목 번역 단계
 * status가 COLLECTED인 글들을 대상으로 처리합니다.
 */
export async function POST() {
  const targets = await prisma.post.findMany({ where: { status: "COLLECTED" } });
  let processed = 0;

  for (const post of targets) {
    try {
      const [summaryKo, titleKo] = await Promise.all([
        summarizeToKorean(post.originalTitle, post.originalBody),
        translateTitleToKorean(post.originalTitle),
      ]);

      await prisma.post.update({
        where: { id: post.id },
        data: {
          summaryKo,
          translationKo: titleKo,
          status: "TRANSLATED",
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
