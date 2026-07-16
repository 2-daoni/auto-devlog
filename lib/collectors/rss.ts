import Parser from "rss-parser";
import type { RssSource } from "@/config/sources";

const parser = new Parser();

export type CollectedItem = {
  sourceName: string;
  sourceUrl: string;
  originalTitle: string;
  originalBody: string;
  publishedAt: Date | null;
};

/**
 * RSS 피드 하나를 읽어서 최신 글 목록을 표준 포맷으로 반환합니다.
 * 실패해도 전체 파이프라인이 멈추지 않도록 에러를 던지지 않고 빈 배열을 반환합니다.
 */
export async function collectFromRss(source: RssSource): Promise<CollectedItem[]> {
  try {
    const feed = await parser.parseURL(source.feedUrl);

    return (feed.items ?? []).map((item) => ({
      sourceName: source.name,
      sourceUrl: item.link ?? "",
      originalTitle: item.title ?? "(제목 없음)",
      // content:encoded가 있으면 본문 전체, 없으면 요약(contentSnippet)만 사용
      originalBody: item["content:encoded"] ?? item.content ?? item.contentSnippet ?? "",
      publishedAt: item.isoDate ? new Date(item.isoDate) : null,
    })).filter((item) => item.sourceUrl); // link 없는 항목 제외
  } catch (err) {
    console.error(`[collectFromRss] ${source.name} 수집 실패:`, err);
    return [];
  }
}
