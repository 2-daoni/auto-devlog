import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PublishButton from "./PublishButton";

export const dynamic = "force-dynamic";

export default async function DraftDetailPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  const seoIssues: string[] = post.seoIssues ? JSON.parse(post.seoIssues) : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <a href="/dashboard" className="text-muted text-xs hover:text-white">
        ← 목록으로
      </a>

      <h1 className="mt-4 text-xl font-semibold">
        {post.translationKo ?? post.originalTitle}
      </h1>
      <p className="text-muted mt-1 text-sm">
        원문: <a href={post.sourceUrl} target="_blank" className="underline">{post.sourceUrl}</a>
      </p>

      {post.seoScore !== null && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-4 text-sm">
          <p className="font-medium">SEO 점수: {post.seoScore}/100</p>
          {seoIssues.length > 0 ? (
            <ul className="text-muted mt-2 list-disc pl-5">
              {seoIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mt-2">체크리스트를 모두 통과했습니다.</p>
          )}
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-medium text-muted mb-2">최종 초안 (Markdown)</h2>
        <pre className="whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed">
          {post.finalDraft ?? "아직 초안이 생성되지 않았습니다. /api/publish를 호출해주세요."}
        </pre>
      </section>

      {post.finalDraft && post.status !== "PUBLISHED" && (
        <PublishButton postId={post.id} draft={post.finalDraft} />
      )}
      {post.status === "PUBLISHED" && (
        <p className="mt-6 text-sm text-green-400">✅ 발행 완료로 표시된 글입니다.</p>
      )}
    </main>
  );
}
