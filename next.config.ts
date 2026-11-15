import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Позволяет собрать прод в отдельную папку, не мешая запущенному dev-серверу
  distDir: process.env.NEXT_DIST_DIR || ".next",
  transpilePackages: ["three"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
