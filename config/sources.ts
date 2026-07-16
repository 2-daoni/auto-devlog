// 수집 대상 소스 정의
// RSS 주소는 각 사이트 개편에 따라 바뀔 수 있으니, 실제 값은 브라우저에서 다시 확인 후 채워 넣어주세요.
// (feed 존재 여부: 대부분 /feed, /rss, /atom.xml 형태로 제공됨)

export type RssSource = {
  type: "rss";
  name: string;
  feedUrl: string;
};

export type GithubReleaseSource = {
  type: "github_release";
  name: string;
  owner: string;
  repo: string;
};

export type Source = RssSource | GithubReleaseSource;

export const sources: Source[] = [
  { type: "rss", name: "React Blog", feedUrl: "https://react.dev/rss.xml" },
  { type: "rss", name: "Next.js Blog", feedUrl: "https://nextjs.org/feed.xml" },
  { type: "rss", name: "Vercel Blog", feedUrl: "https://vercel.com/atom.xml" },
  { type: "rss", name: "Chrome Developers", feedUrl: "https://developer.chrome.com/feeds/blog.xml" },
  { type: "rss", name: "MDN Blog", feedUrl: "https://developer.mozilla.org/en-US/blog/rss.xml" },
  { type: "rss", name: "TypeScript Blog", feedUrl: "https://devblogs.microsoft.com/typescript/feed/" },
  { type: "rss", name: "CSS-Tricks", feedUrl: "https://css-tricks.com/feed/" },

  // GitHub Release는 RSS가 아니라 REST API(octokit)로 수집
  { type: "github_release", name: "React", owner: "facebook", repo: "react" },
  { type: "github_release", name: "Next.js", owner: "vercel", repo: "next.js" },
  { type: "github_release", name: "TypeScript", owner: "microsoft", repo: "TypeScript" },
];
