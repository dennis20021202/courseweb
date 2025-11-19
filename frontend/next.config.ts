import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 這是面試環境中 Docker 部署的關鍵設定！
  // 啟用此模式可以讓 Next.js 輸出一個最小化的伺服器，
  // 讓我們的 Dockerfile (第三階段 runner) 能更高效地運行。
  output: "standalone", 
  
  // 你原本啟用的配置
  reactCompiler: true,
};

export default nextConfig;