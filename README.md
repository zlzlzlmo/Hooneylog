# 후니로그 (Hooneylog)

> Notion을 CMS로 쓰는 개인 기술 블로그. 글은 Notion에서 쓰고, 사이트는 Next.js가 렌더링합니다.

**✅ 운영 중** · 🔗 [hooneylog.com](https://hooneylog.com)

## 개요

Notion 데이터베이스에 글을 작성하면 Notion API로 가져와 Markdown으로 변환·렌더링하는 기술 블로그입니다. 프론트엔드부터 배포·도메인(DNS) 설정까지 직접 구축해 운영 중입니다.

## 핵심 기능

- 📝 **Notion API 기반 콘텐츠 관리** — `@notionhq/client` · `notion-to-md`로 Notion 글을 자동 렌더링
- 🧮 **수식·다이어그램·코드** — KaTeX · Mermaid · Syntax Highlighting 지원
- 💬 **댓글** — GitHub 기반 giscus
- 📊 **운영 지표** — Vercel Analytics · Speed Insights · KV 캐싱

## 기술 스택

`TypeScript` · `Next.js` · `Notion API` · `Turborepo (모노레포)` · `Vercel` · `KaTeX / Mermaid` · `giscus`

## 구조 (Turborepo 모노레포)

- `apps/web` — 블로그 웹앱 (Next.js)
- `packages/*` — `shared-types` · `eslint-config` · `typescript-config`

## 실행

```bash
pnpm install
pnpm dev
```

---

<sub>made by **[신승훈](https://github.com/zlzlzlmo)** · [기술블로그](https://hooneylog.com) · zlzlzlmo60@gmail.com</sub>
