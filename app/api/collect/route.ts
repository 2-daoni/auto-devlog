import { NextResponse } from "next/server";
import { sources } from "@/config/sources";
import { collectFromRss } from "@/lib/collectors/rss";
import { collectFromGithubRelease } from "@/lib/collectors/githubRelease";
import { prisma } from "@/lib/db";

/**
 * [1] 수집 단계
 * 모든 소스를 순회하며 최신 글을 가져오고, sourceUrl 기준으로 이미 DB에 있는 건 건너뜁니다(중복 방지).
 */
export async function POST() {
  let collectedCount = 0;

  for (const source of sources) {
    const items =
      source.type === "rss"
        ? await collectFromRss(source)
        : await collectFromGithubRelease(source);

    for (const item of items) {
      const exists = await prisma.post.findUnique({ where: { sourceUrl: item.sourceUrl } });
      if (exists) continue;

      await prisma.post.create({
        data: {
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          originalTitle: item.originalTitle,
          originalBody: item.originalBody.slice(0, 20000), // 과도하게 긴 본문 방지
          publishedAt: item.publishedAt,
          status: "COLLECTED",
        },
      });
      collectedCount++;
    }
  }

  return NextResponse.json({ collectedCount });
}
