/** @type {import('next').NextConfig} */
const nextConfig = {
  // Playwright 등 Node 전용 패키지를 서버 컴포넌트/route handler에서 쓰기 위한 설정
  experimental: {
    serverComponentsExternalPackages: ["playwright"],
  },
};

module.exports = nextConfig;
