# --- 第一階段：依賴安裝 ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# --- 第二階段：建置專案 ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 確保 next.config.ts 中有設定 output: 'standalone'
RUN npm run build

# --- 第三階段：執行環境 ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# 建立非 root 使用者 (安全性最佳實踐)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 複製建置產物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# [關鍵新增] 建立 videos 目錄並設定權限
# 因為我們要在這裡掛載 Volume，必須確保 nextjs 使用者有權限讀取/寫入(如果需要的話)
# 雖然主要由後端寫入，但前端需要讀取權限
RUN mkdir -p /app/public/videos && chown nextjs:nodejs /app/public/videos

USER nextjs

EXPOSE 3000

ENV PORT 3000
# 啟動 standalone server
CMD ["node", "server.js"]