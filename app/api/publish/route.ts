import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildFinalDraft } from "@/lib/publisher/draftExport";

/**
 * [8] 발행 단계 (B안: 반자동)
 * status가 SEO_CHECKED인 글들의 최종 초안(finalDraft)을 완성해 PUBLISHED 직전 상태로 만듭니다.
 * 실제 "발행 완료" 처리는 대시보드에서 사람이 초안을 확인하고 티스토리에 직접 올린 뒤
 * PATCH로 status를 PUBLISHED로 바꿔주는 흐름을 권장합니다 (아래 PATCH 핸들러 참고).
 */
export async function POST() {
  const targets = await prisma.post.findMany({ where: { status: "SEO_CHECKED" } });
  let drafted = 0;

  for (const post of targets) {
    const finalDraft = buildFinalDraft({
      titleKo: post.translationKo ?? post.originalTitle,
      summaryKo: post.summaryKo ?? "",
      codeExample: post.codeExample ?? "",
      sourceUrl: post.sourceUrl,
    });

    await prisma.post.update({
      where: { id: post.id },
      data: { finalDraft },
    });
    drafted++;
  }

  return NextResponse.json({ drafted });
}

/**
 * 사람이 티스토리에 수동 발행을 완료한 뒤, 대시보드에서 이 엔드포인트를 호출해
 * 해당 글의 상태를 PUBLISHED로 표시합니다.
 */
export async function PATCH(req: Request) {
  const { postId } = await req.json();
  const updated = await prisma.post.update({
    where: { id: postId },
    data: { status: "PUBLISHED" },
  });
  return NextResponse.json(updated);
}
