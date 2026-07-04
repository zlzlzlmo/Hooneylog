# 빌드 스테이지: 모노레포 전체에서 trend-writer만 빌드·추출
FROM node:20-slim AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter trend-writer build
RUN pnpm --filter trend-writer deploy --prod /app

# 런타임 스테이지: 자립 패키지만
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
USER node
CMD ["node", "dist/index.js"]
