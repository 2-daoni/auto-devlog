"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PublishButton({ postId, draft }: { postId: string; draft: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [marking, setMarking] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkPublished = async () => {
    setMarking(true);
    await fetch("/api/publish", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    router.refresh();
  };

  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={handleCopy}
        className="rounded-md border border-border bg-surface px-4 py-2 text-sm hover:border-accent transition-colors"
      >
        {copied ? "복사됨 ✓" : "초안 복사"}
      </button>
      <button
        onClick={handleMarkPublished}
        disabled={marking}
        className="rounded-md border border-green-400/40 px-4 py-2 text-sm text-green-400 hover:bg-green-400/10 transition-colors disabled:opacity-50"
      >
        {marking ? "처리 중..." : "티스토리에 올렸어요 (발행 완료 표시)"}
      </button>
    </div>
  );
}
