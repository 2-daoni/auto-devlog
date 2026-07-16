import Link from "next/link";
import { prisma } from "@/lib/db";

// 상태별 뱃지 색상 (Tailwind 클래스는 정적으로 존재해야 하므로 매핑 테이블로 관리)
const statusStyle: Record<string, string> = {
  COLLECTED: "text-muted border-border",
  SUMMARIZED: "text-accent border-accent/40",
  TRANSLATED: "text-accent border-accent/40",
  CODE_ADDED: "text-accent border-accent/40",
  SEO_CHECKED: "text-yellow-300 border-yellow-300/40",
  PUBLISHED: "text-green-400 border-green-400/40",
  FAILED: "text-red-400 border-red-400/40",
};

export const dynamic = "force-dynamic"; // 항상 최신 DB 상태를 보여줌

export default async function DashboardPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const counts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">파이프라인 현황</h1>
          <p className="text-muted mt-1 text-sm">최근 50건 기준</p>
        </div>
        <div className="flex gap-2 text-xs">
          {Object.entries(counts).map(([status, count]) => (
            <span
              key={status}
              className={`rounded-full border px-3 py-1 ${statusStyle[status] ?? "text-muted border-border"}`}
            >
              {status} {count}
            </span>
          ))}
        </div>
      </header>

      <div className="divide-y divide-border rounded-lg border border-border bg-surface">
        {posts.length === 0 && (
          <p className="text-muted p-6 text-sm">
            아직 수집된 글이 없습니다. <code className="text-accent">POST /api/pipeline/run</code>을 호출해보세요.
          </p>
        )}
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/dashboard/drafts/${post.id}`}
            className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {post.translationKo ?? post.originalTitle}
              </p>
              <p className="text-muted mt-1 text-xs">
                {post.sourceName} · {new Date(post.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
                statusStyle[post.status] ?? "text-muted border-border"
              }`}
            >
              {post.status}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
