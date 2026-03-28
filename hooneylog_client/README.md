# HooneyLog

> **기록과 함께 성장하는 프론트엔드 개발자의 기술 블로그**

HooneyLog는 React와 TypeScript로 구축된 개인 기술 블로그로, Notion API와 통합하여 동적 데이터를 처리하며, 효율적인 데이터 관리 및 사용자 경험을 제공하는 플랫폼입니다.

---

## 📌 **주요 기능**

- **게시물 관리**: Notion API를 활용해 동적 게시물 데이터를 생성, 조회 및 관리.
- **API 통합**: Abstract Axios Service를 통한 재사용 가능한 API 호출 구조 구현.
- **태그 기반 검색**: 다양한 태그와 카테고리 필터링으로 게시물을 효율적으로 탐색 가능.
- **모던 UI/UX**: React와 SCSS Module을 활용해 사용자 친화적인 디자인 제공.

---

## 🛠 **기술 스택**

- **프론트엔드**: React, TypeScript, Next.js, SCSS Module
- **백엔드**: Notion API, Nest.js
- **API 관리**: Abstract Axios Service를 활용한 API 호출 구조
- **배포**: Vercel
- **기타 도구**: Axios, React Query

---

## 📂 **프로젝트 구조**

```
hooneylog/
├── assets/                    # 정적 파일 (이미지, 아이콘 등)
├── components/                # UI 컴포넌트
│   ├── blocks/                # Notion 블록 구성 컴포넌트
│   ├── elements/              # UI 요소 컴포넌트
│   ├── features/filter/       # 태그 및 필터 기능 컴포넌트
│   └── templates/             # 페이지 템플릿 컴포넌트
├── hooks/                     # 커스텀 훅
│   └── useIntersection.ts     # Intersection Observer 훅
├── lib/axios/                 # Axios 관련 유틸리티 및 API 클래스
│   ├── api.ts                 # Abstract Axios Service 정의
│   └── instance.ts            # Axios 인스턴스 설정
├── pages/                     # 주요 페이지
│   ├── post/                  # 게시물 상세 페이지
│   │   └── [slug].tsx         # Slug 기반 게시물 렌더링
│   ├── _app.tsx               # Next.js 애플리케이션 설정
│   ├── _document.tsx          # HTML 문서 설정
│   ├── 404.tsx                # 404 페이지
│   └── index.tsx              # 메인 페이지
├── services/notion/           # Notion API 관련 서비스
│   ├── notionApi.ts           # Notion API 호출 구현
│   └── endpoint.ts            # API 엔드포인트 관리
├── styles/                    # 스타일 파일
└── util/                      # 유틸리티 함수
```

---

## 🔗 **API 관리**

### **Abstract Axios Service**

- **구조화된 API 호출**: API 호출 로직을 추상화하여 재사용 가능한 구조 설계.
- **유형화된 엔드포인트**:
  ```typescript
  export const OEndpoint = {
    allNotion: '/notion/all',
    oneNotion: '/notion',
    blocksNotion: '/notion/blocks',
  } as const;
  ```
- **예제**:
  ```typescript
  class NotionService extends AbstractAxiosService {
    async getAllPost(): Promise<NotionPost[]> {
      return this.get(OEndpoint.allNotion);
    }
  }
  ```

### **Axios 인스턴스**
- **설정**:
  ```typescript
  export const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
  ```

---

## 🧑‍💻 **설치 및 실행**

### 1. 레포지토리 클론

```bash
git clone https://github.com/zlzlzlmo/hooneylog_client.git
cd hooneylog
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 백엔드 도메안 입력 필요

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 배포

```bash
npm run build
npm start
```