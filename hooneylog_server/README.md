# HooneyLog Backend

> **NestJS 기반의 안정적이고 확장 가능한 백엔드 시스템**

HooneyLog 백엔드는 Notion API를 활용하여 게시물 데이터를 효율적으로 관리하고, 사용자 요청에 맞는 데이터를 제공하기 위해 설계되었습니다. NestJS 프레임워크를 기반으로 구축되었으며, 클린 코드와 모듈화된 구조를 바탕으로 확장성과 유지보수성을 높였습니다.

---

## 📌 **주요 기능**

- **게시물 관리**: Notion API를 사용하여 게시물 데이터 생성, 조회 및 관리.
- **API 설계**: 클린 아키텍처를 기반으로 한 RESTful API 설계.
- **블록 데이터 처리**: Notion 블록 데이터를 효율적으로 수집하고 반환.
- **환경 변수 관리**: 안전한 API 키 관리 및 배포 환경 구성.

---

## 🛠 **기술 스택**

- **백엔드 프레임워크**: NestJS
- **데이터 관리**: Notion API
- **배포**: Railway
- **언어 및 도구**: TypeScript, Node.js

---

## 📂 **프로젝트 구조**

```
backend/
├── src/
│   ├── common/                # 공통 인터페이스 및 유틸리티
│   │   ├── interface/         # 데이터 인터페이스
│   │   └── notionBlock/       # Notion 블록 처리 유틸리티
│   ├── notion/                # Notion API 관련 모듈
│   │   ├── notion.controller.ts # 컨트롤러 (라우팅 처리)
│   │   ├── notion.service.ts    # 서비스 (비즈니스 로직)
│   │   ├── notion.module.ts     # 모듈 설정
│   │   └── notion.controller.spec.ts # 테스트 파일
│   ├── app.controller.ts       # 기본 앱 컨트롤러
│   ├── app.module.ts           # 애플리케이션 루트 모듈
│   ├── app.service.ts          # 기본 앱 서비스
│   └── main.ts                 # 애플리케이션 엔트리포인트
├── .env                        # 환경 변수 파일
├── tsconfig.json               # TypeScript 설정
└── package.json                # 의존성 관리
```

---

## 🔗 **API 관리**

### **API 구조**

- **라우트**:

  - `/notion/all`: 모든 게시물 데이터 가져오기
  - `/notion/:id`: 특정 게시물 가져오기
  - `/notion/blocks/:id`: 특정 게시물의 블록 데이터 가져오기

- **컨트롤러**:

  ```typescript
  @Controller('notion')
  export class NotionController {
    constructor(private readonly notionService: NotionService) {}

    @Get('all')
    getAllPost() {
      return this.notionService.getAllPost();
    }

    @Get(':id')
    getPostById(@Param('id') id: string) {
      return this.notionService.getPostById(id);
    }

    @Get('blocks/:id')
    getBlocksById(@Param('id') id: string) {
      return this.notionService.getBlocksById(id);
    }
  }
  ```

- **서비스 로직**:

  ```typescript
  @Injectable()
  export class NotionService {
    private readonly notion: Client;
    private readonly databaseId = process.env.PUBLIC_NOTION_DATABASE ?? '';

    constructor() {
      this.notion = new Client({
        auth: process.env.PUBLIC_NOTION_KEY,
      });
    }

    // 모든 포스터 불러오기
    async getAllPost() {
      const response = await this.notion.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'status',
          select: { equals: 'published' },
        },
      });
      return response.results;
    }

    // 아이디 받아서 한개의 포스터 불러오기
    async getPostById(postId: string) {
      const posts = await this.getAllPost();
      return posts.find(({ id }) => id === postId);
    }

    // 해당 포스터의 block 값들 불러오기 (각종 요소들)
    async getBlocksById(blockId: string) {
      const blocks = [];
      let cursor;

      while (true) {
        const { results, next_cursor } = await this.notion.blocks.children.list(
          {
            block_id: blockId,
            start_cursor: cursor,
          },
        );
        blocks.push(...results);
        if (!next_cursor) break;
        cursor = next_cursor;
      }
      return blocks;
    }
  }
  ```

---

## 🧑‍💻 **설치 및 실행**

### 1. 레포지토리 클론

```bash
git clone https://github.com/zlzlzlmo/hooneylog-backend.git
cd hooneylog-backend
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 Notion API 키와 관련 정보를 입력

### 4. 개발 서버 실행

```bash
npm run start:dev
```

### 5. 테스트 실행

```bash
npm run test
```

### 6. 배포

백엔드는 **Railway**를 활용하여 배포.

---
