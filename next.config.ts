import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Позволяет собрать прод в отдельную папку, не мешая запущенному dev-серверу
  distDir: process.env.NEXT_DIST_DIR || ".next",
  transpilePackages: ["three"],
  poweredByHeader: false,
  serverExternalPackages: ["pg"],
  // Метаданные у нас статичные — выводим их в <head> для всех, а не «потоком» в конце страницы
  // (иначе описание /order и /builder не видят часть сканеров и превью мессенджеров)
  htmlLimitedBots: /.*/,
  // Импорт только используемых частей из «бочковых» пакетов
  experimental: {
    optimizePackageImports: ["motion", "@react-three/drei"],
  },
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
