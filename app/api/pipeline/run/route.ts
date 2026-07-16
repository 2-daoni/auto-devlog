import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * 전체 파이프라인을 순서대로 실행합니다: 수집 → 요약/번역 → 예제코드+SEO체크 → 초안 생성
 * GitHub Actions cron이 이 엔드포인트 하나만 호출하면 됩니다.
 *
 * 인증: CRON_SECRET 환경변수를 설정해두면, Authorization 헤더로 검증합니다.
 * (배포 URL이 공개되어 있으므로 아무나 호출하지 못하도록 최소한의 보호 장치를 둡니다.)
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const baseUrl = new URL(req.url).origin;
  const run = await prisma.pipelineRun.create({ data: {} });

  try {
    const collectRes = await fetch(`${baseUrl}/api/collect`, { method: "POST" }).then((r) => r.json());
    const summarizeRes = await fetch(`${baseUrl}/api/summarize`, { method: "POST" }).then((r) => r.json());
    const seoRes = await fetch(`${baseUrl}/api/seo-check`, { method: "POST" }).then((r) => r.json());
    const publishRes = await fetch(`${baseUrl}/api/publish`, { method: "POST" }).then((r) => r.json());

    await prisma.pipelineRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        collected: collectRes.collectedCount ?? 0,
        processed: publishRes.drafted ?? 0,
      },
    });

    await notifyDiscord(
      `✅ auto-devlog 파이프라인 실행 완료\n` +
        `수집: ${collectRes.collectedCount ?? 0} / 요약: ${summarizeRes.processed ?? 0} / ` +
        `SEO체크: ${seoRes.processed ?? 0} / 초안생성: ${publishRes.drafted ?? 0}`
    );

    return NextResponse.json({ collectRes, summarizeRes, seoRes, publishRes });
  } catch (err) {
    await prisma.pipelineRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), failed: 1, note: String(err) },
    });
    await notifyDiscord(`❌ auto-devlog 파이프라인 실패: ${String(err)}`);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function notifyDiscord(content: string) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch (err) {
    console.error("[notifyDiscord] 알림 전송 실패:", err);
  }
}
