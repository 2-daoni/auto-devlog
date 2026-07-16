import { Octokit } from "octokit";
import type { GithubReleaseSource } from "@/config/sources";
import type { CollectedItem } from "./rss";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/**
 * 지정한 repo의 최신 Release 목록(기본 5개)을 가져옵니다.
 * GITHUB_TOKEN이 없어도 동작하지만, rate limit(60회/시간)에 걸릴 수 있으니 토큰 설정을 권장합니다.
 */
export async function collectFromGithubRelease(
  source: GithubReleaseSource,
  perPage = 5
): Promise<CollectedItem[]> {
  try {
    const { data } = await octokit.rest.repos.listReleases({
      owner: source.owner,
      repo: source.repo,
      per_page: perPage,
    });

    return data.map((release) => ({
      sourceName: source.name,
      sourceUrl: release.html_url,
      originalTitle: release.name || release.tag_name,
      originalBody: release.body ?? "",
      publishedAt: release.published_at ? new Date(release.published_at) : null,
    }));
  } catch (err) {
    console.error(`[collectFromGithubRelease] ${source.name} 수집 실패:`, err);
    return [];
  }
}
