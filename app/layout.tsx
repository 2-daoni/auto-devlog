import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "auto-devlog",
  description: "개발 소식 자동 수집·요약·번역 파이프라인 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-bg text-white min-h-screen">{children}</body>
    </html>
  );
}
