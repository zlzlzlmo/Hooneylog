# 빌드 스테이지: 모노레포 전체에서 trend-writer만 빌드·추출
FROM node:26-slim AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter trend-writer build
# pnpm 10+ 는 inject-workspace-packages 가 아니면 --legacy 필요
RUN pnpm --filter trend-writer deploy --legacy --prod /app

# 런타임 스테이지: 자립 패키지만
FROM node:26-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
USER node
CMD ["node", "dist/index.js"]
