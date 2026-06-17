# 백엔드 트렌드·표준 레퍼런스 (2026)

> category=Backend 글을 쓸 때 로드. 출처: docs/research/tech-blog-trends-2026.md §3·§4 (2026-06 스냅샷).
> 버전·수치는 방향성 참고용 — 글에 넣기 전 워크플로의 경량 웹 검증 단계로 확인할 것.

## 3. 백엔드 — 아키텍처 / API

### 핵심 트렌드
- **모듈러 모놀리스 표준화 — '마이크로서비스부터 시작하지 마라'** `mainstream` ✅
  담론이 '진영 싸움'에서 '맥락에 맞게 고른다'로 이동. 모듈러 모놀리스(단일 배포 + 명확한 내부 모듈 경계)가 기본 출발점, 필요 시 경계 따라 서비스 분리(점진 진화). ⚠️ Amazon Prime Video 사례는 2023년 건이라 '2025~2026 증거'로는 낡음 — 재탕 사례임을 명시.
- **이벤트드리븐 핵심 패턴: Outbox + 멱등 컨슈머 + DLQ** `mainstream` ✅
  (1) Outbox로 dual-write 해결, (2) at-least-once 전제 하 멱등 컨슈머, (3) 모니터링되는 DLQ. Event Sourcing·CQRS·Saga는 실제 필요할 때만.
- **Kafka 4.0 ZooKeeper 완전 제거(KRaft 단일화)** `mainstream` ✅
  2025-03-18 릴리스. 운영 복잡도 하락. 경량 대안: Redpanda, NATS/JetStream, 클라우드 네이티브 SNS+SQS/Pub-Sub.
- **서버리스 진화: '서버리스 서버'(Fluid Compute / Durable Objects)** `growing→mainstream` ✅
  Vercel Fluid Compute(2025-04 신규 기본값): 인스턴스가 다중 요청 동시 처리, 유휴 CPU 미과금(Active CPU), 비용 최대 95% 절감. Cloudflare Durable Objects: 단일 인스턴스 보장 + 내장 SQLite로 엣지 상태 관리. AI 워크로드가 견인.
- **엣지/서버사이드 WebAssembly(WASI)** `growing` ✅
  마이크로초~밀리초급 콜드스타트. 주요 플랫폼이 V8 계열 엣지 런타임으로 수렴. ⚠️ 일부 수치(AI 추론 80% 로컬 등)는 2차 출처 의존, 인용 주의.
- **API 스타일 다극화: 용도별 분담** `mainstream` ✅
  공개=REST(OpenAPI 3.1/3.2 계약 우선), TS 풀스택=tRPC v11(RSC·TanStack Query 네이티브), 내부 서비스 간=gRPC/Connect RPC(buf), 대규모 그래프=GraphQL Federation v2. "성능보다 맥락·타입안전성·생태계"가 최신 프레이밍.
- **이벤트 API 표준화: AsyncAPI 3.0 + OpenAPI 3.2 + Arazzo** `growing` ✅
  계약 우선 문화 확산. OpenAPI 3.2.0(2025-09), Arazzo로 멀티스텝 워크플로 기술.
- **인증 새 기준선: RFC 9700(PKCE 의무화) + 패스키** `mainstream` ⚠️
  정정: **OAuth 2.1은 2026-06 현재 IETF draft**(정식 RFC 아님). PKCE 의무화의 규범 근거는 **RFC 9700**(2025-01 published BCP). 모든 클라이언트 PKCE 필수, 리프레시 토큰 단일사용 회전, redirect URI 완전일치, implicit/password grant 제거. 패스키(WebAuthn) 주류화.
- **캐싱: Redis 라이선스 U턴(AGPLv3) + Valkey 부상** `growing` ✅
  Redis 8(2025-05)에서 AGPLv3 추가로 OSI 오픈소스 복귀. BSD 포크 Valkey(Linux Foundation/AWS/Google)가 안전한 대안으로 정착.
- ➕ **MCP 기반 에이전트 대응 백엔드** — REST API를 '에이전트가 호출하는 도구'로 노출하는 설계가 신규 과제(섹션 6 참고). 2026 백엔드 최대 누락 주제로 지적됨.
- ➕ **Durable Execution / 워크플로 엔진**(Temporal·Restate·DBOS·Inngest) — crash-safe·exactly-once·자동 재개. Saga/오케스트레이션의 실무 대안.
- ➕ **Diskless 스트리밍**(WarpStream·AutoMQ) — S3 등 오브젝트 스토리지 직접 쓰기로 비용·운영 재정의.

### 업계 표준·베스트프랙티스
- 모듈러 모놀리스로 시작, 모듈 경계 따라 필요 시 분리. EDA는 단순 Pub/Sub부터, Outbox+멱등+DLQ 3종 세트.
- API는 용도별 분담(위 참고). 신규 인증은 RFC 9700 기준선(PKCE 필수), 패스키 1순위 검토.
- 캐싱은 레이어 분리(앱 데이터=Redis/Valkey, HTTP/풀페이지=CDN/엣지) + TTL + 명시적 무효화.

### 핵심 용어
Modular Monolith=모듈러 모놀리스 · Microservices consolidation=마이크로서비스 통합/회귀 · EDA=이벤트 기반 아키텍처 · Outbox pattern=아웃박스 패턴 · Idempotent consumer=멱등 컨슈머 · DLQ=데드레터 큐 · CQRS · Event Sourcing=이벤트 소싱 · Saga(choreography/orchestration) · KRaft · tRPC · Connect RPC · GraphQL Federation v2 · AsyncAPI · OAuth 2.1(draft) · PKCE · Refresh token rotation · Passkey/WebAuthn · Fluid Compute · Durable Objects · WASI · Valkey=밸키

### 추천 출처
- Event-Driven Architecture(Encore) — https://encore.dev/resources/event-driven-architecture
- Vercel Fluid Compute — https://vercel.com/blog/introducing-fluid-compute
- Cloudflare Durable Objects — https://www.cloudflare.com/products/durable-objects/
- OAuth 2.0 보안(RFC 9700) — https://www.scalekit.com/blog/oauth-2-0-best-practices-rfc9700
- Redis/Valkey 라이선스 — https://www.infoq.com/news/2025/05/redis-agpl-license
- API 스타일 비교 — https://pockit.tools/blog/rest-graphql-trpc-grpc-api-comparison-2026/

---

## 4. 백엔드 — 런타임 / 데이터 / 인프라

### 핵심 트렌드
- **Node.js 네이티브 TypeScript 실행(타입 스트리핑)** `growing` ⚠️
  Node 24부터 .ts 타입 스트리핑(amaro) 기본 활성화 → 빌드 단계 없이 TS 직접 실행. ⚠️ Node 26은 2026-06 현재 Current(LTS는 2026-10 예정), 권한 모델은 experimental → maturity는 'mainstream'보다 'growing'이 정확.
- **JS 런타임 3파전: Node 우세, Bun 실전 채택 가속** `growing` ⚠️
  ⚠️ 정정: Bun은 Anthropic '후원'이 아니라 **인수**(2025-12-02, Anthropic 최초 인수). 2026-05부터 Zig→Rust 재작성 중. Deno 2는 npm 완전 호환. 실측(DB+로직 포함)에선 세 런타임 ~12,000 RPS로 비슷 → 합성 벤치마크 격차는 과장.
- **PostgreSQL 18: 비동기 I/O(AIO) + UUIDv7** `mainstream` ✅
  2025-09-25. io_uring 기반 AIO(특정 시나리오 최대 3배), `uuidv7()`, 가상 생성 컬럼, OAuth 2.0 인증, B-tree 스킵 스캔. UUIDv7이 분산 PK 표준화.
- **pgvector가 RAG 벡터 검색 기본값** `mainstream` ✅
  pgvectorscale과 함께 ~50M 벡터까지 안정 처리, 메타데이터 필터링을 SQL 한 쿼리·한 트랜잭션으로 결합. 5천만~1억 벡터·<10ms·고급 하이브리드 필요 시에만 전용 엔진(Qdrant 등).
- **TypeScript ORM: Prisma 우세 + Drizzle 이동 가속** `growing` ✅
  Drizzle(~33KB, 쿼리엔진 부재)이 엣지/서버리스 기본 추천. Prisma 7(2025-11)은 Rust→TS/WASM 엔진으로 번들 ~14MB→~1.6MB, 엣지 지원하며 격차 좁힘.
- **OpenTelemetry, 4번째 시그널 Profiles 추가** `growing` ✅
  2026-03-26 Profiles 퍼블릭 알파(traces·metrics·logs·profiles 통합). GenAI(LLM) 관측 시맨틱 컨벤션 정비. ⚠️ Profiles는 알파라 핵심 워크로드엔 아직 부적합.
- **플랫폼 엔지니어링 / IDP 주류화** `mainstream` ✅
  Gartner 2026년 80% 도입 전망(2025년 55% 채택). 골든 패스 제공 IDP, Backstage(CNCF) 대표. K8s는 '구현 디테일'로 추상화.
- **디스크리스(Diskless) Kafka 전환** `emerging` ✅
  오브젝트 스토리지 오프로드. KIP-1150(2026-03 승인), AutoMQ·WarpStream·Confluent Freight·StreamNative Ursa. ⚠️ 디스크리스 토픽은 트랜잭션·컴팩션 미지원 등 제약.
- **Go 컨테이너 인식 런타임 + Rust 임계영역 채택** `mainstream` ✅
  Go 1.25: 컨테이너 CPU 제한 맞춰 GOMAXPROCS 자동 설정, 실험적 Green Tea GC. Rust는 Tokio+Axum 0.8로 웹 생태계 통합. 원칙: '대부분 Go, 임계영역만 Rust'.
- **IaC: OpenTofu 부상 + Pulumi** `growing` ✅
  Terraform BSL 전환 이후 OpenTofu(Linux Foundation, Terraform 호환)가 라이선스 리스크 회피용으로 부상. Pulumi는 범용 언어 IaC.
- ➕ **WASI 0.3 + 컴포넌트 모델의 백엔드 런타임화** — native async 표준화 막바지(1-5ms 콜드스타트).
- ➕ **Durable Execution 엔진**(DBOS=Postgres in-process, Restate, Inngest, Hatchet) — 'Postgres is enough' 흐름.

### 업계 표준·베스트프랙티스
- 신규 Node 백엔드는 Node 24 LTS, 네이티브 TS 실행 검토. 런타임은 합성 RPS 아닌 실제 부하·생태계로 결정.
- Postgres 기본 DB, 분산 PK는 UUIDv7, 고I/O는 PG18 AIO. RAG는 pgvector로 시작.
- ORM은 엣지/서버리스=Drizzle 또는 Prisma 7(WASM), 스키마 우선=Prisma.
- 관측성은 OTel(OTLP) + 시맨틱 컨벤션(service.name, trace/span ID 주입), LLM은 GenAI 컨벤션.
- K8s 직접 노출 대신 IDP/골든 패스(Backstage)로 추상화. IaC는 OpenTofu 마이그레이션 평가.

### 핵심 용어
Type stripping=타입 스트리핑 · Permission Model · AIO/io_uring=비동기 I/O · UUIDv7 · pgvector/pgvectorscale · HNSW · OpenTelemetry/OTLP · Four signals(traces·metrics·logs·profiles)=4대 시그널 · GenAI observability · Platform engineering=플랫폼 엔지니어링 · IDP=내부 개발자 플랫폼 · Golden path=골든 패스 · Backstage · Diskless Kafka=디스크리스 카프카 · KIP-1150 · OpenTofu=오픈토푸 · Container-aware GOMAXPROCS · Green Tea GC · Tokio/Axum · Durable Execution=지속 실행

### 추천 출처
- PostgreSQL 18 — https://www.postgresql.org/about/news/postgresql-18-released-3142/
- OTel Profiles — https://opentelemetry.io/blog/2026/profiles-alpha/
- Go container-aware GOMAXPROCS — https://go.dev/blog/container-aware-gomaxprocs
- Drizzle vs Prisma — https://encore.dev/articles/drizzle-vs-prisma
- Valkey — https://redis.io/blog/what-is-valkey/
- Kafka KIP-1150 — https://www.automq.com/blog/kafka-kip-1150-diskless-topics-better-solution
