import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">auto-devlog</h1>
      <p className="text-muted text-sm">개발 소식 자동 수집 · 요약 · 번역 파이프라인</p>
      <Link
        href="/dashboard"
        className="rounded-md border border-border bg-surface px-4 py-2 text-sm hover:border-accent transition-colors"
      >
        대시보드로 이동 →
      </Link>
    </main>
  );
}
