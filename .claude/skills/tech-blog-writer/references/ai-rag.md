# AI·RAG 트렌드·표준 레퍼런스 (2026)

> category=Artificial Intelligence 글을 쓸 때 로드. 출처: docs/research/tech-blog-trends-2026.md §5·§6 (2026-06 스냅샷).
> 버전·수치는 방향성 참고용 — 글에 넣기 전 워크플로의 경량 웹 검증 단계로 확인할 것.

## 5. AI 개발 — RAG

### 핵심 트렌드
- **Contextual Retrieval가 인덱싱 표준으로 정착** `mainstream` ✅
  (Anthropic 2024-09) 청크 임베딩 전 LLM으로 50~100토큰 문서 맥락 요약을 prepend. top-20 검색 실패율 Contextual Embeddings로 35%↓, +BM25 49%↓, +리랭킹 67%↓. 프롬프트 캐싱으로 전처리 비용 절감.
- **하이브리드 검색(Dense+BM25) + 리랭킹 2단계 파이프라인** `mainstream` ✅
  BM25(어휘) + dense(의미) 각 top-50 → RRF 융합 → 크로스 인코더 리랭커로 top-5 확정. '저위험·고수익' 개선.
- **Agentic RAG — 추론 기반 동적 검색** `growing→mainstream` ✅
  언제·무엇을·몇 번 검색할지 모델이 결정. ReAct가 기초 출발 패턴. ⚠️ 2026 자료 다수가 '엔터프라이즈 기본값'으로 서술 → mainstream에 근접. 원칙: '해결할 실패를 명확히 지칭할 수 있을 때만 복잡도 추가'.
- **GraphRAG 비용 문제 + LazyGraphRAG 부상** `growing` ✅
  GraphRAG: 글로벌/요약 질의에서 26%/57% 개선이나 인덱싱 비용 10~40배. LazyGraphRAG(2024-11, MIT): 인덱싱 시 LLM 미사용 → 비용을 벡터 수준으로, 글로벌 질의 쿼리비용 700배+ 절감.
- **임베딩 모델 세대 교체** `mainstream` ⚠️
  Cohere embed-v4(MTEB 65.2), Gemini Embedding 2(2026-03, 멀티모달 5모달리티·MRL·3072차원), BGE-M3. ⚠️ **누락 정정: 2026 실질 MTEB 1위는 Qwen3-Embedding-8B(70.6, 오픈웨이트)** — 리서처가 미언급. 'MTEB 점수만 보지 말고 자체 데이터로 테스트' 원칙.
- **벡터DB 하이브리드 검색 내장 보편화 + pgvector 약진** `mainstream` ✅
  Weaviate·Milvus 2.5+·Qdrant·LanceDB·Pinecone 모두 네이티브 하이브리드. 손익분기: ~50~100M 벡터.
- **RAG 평가 표준화 — RAGAS, LLM-as-judge, 골든 데이터셋** `mainstream` ✅
  RAGAS(faithfulness, context precision/recall, answer relevancy). LLM 심판은 길이/위치/자기선호 편향 → 사람 검증 골든셋으로 보정. retriever/generator 지표 분리.
- **Late chunking & ColBERT식 late-interaction** `emerging` ⚠️
  Late chunking(전체 임베딩 후 토큰 풀링), late-interaction(토큰 단위 점수). ⚠️ 'Jina-ColBERT-v2가 최강'은 과장 — jina-reranker-v3(2025-09)가 더 최신, ColPali/ColQwen 계열로 확장. 한 벤치마크선 recursive 512토큰(69%)이 semantic(54%) 앞섬.
- **RAG → Context Engineering 리브랜딩** `emerging` ✅
  롱컨텍스트·agentic 부상 속 'RAG는 죽었다' 담론 → 실제론 '컨텍스트 엔진'으로 진화. 정적 지식=RAG, 적응형/상태유지=에이전트 메모리로 양립.
- ➕ **멀티모달/비주얼 문서 RAG**(ColPali·ColQwen·ColNomic) — OCR 없이 PDF를 이미지째 검색. **2026 핵심 신흥 트렌드**.
- ➕ **Self-RAG / Corrective RAG**(자기 교정·반성형) · ➕ **RAFT**(Retrieval-Augmented Fine-Tuning).

### 업계 표준·베스트프랙티스
- 인덱싱: Contextual Retrieval 적용. 검색: 하이브리드 + RRF + 리랭킹 2단계.
- 청킹은 도메인별 선택(구조 인식/recursive 기본), 자체 데이터로 검증. 개선은 한 번에 하나씩, 리랭킹·하이브리드부터.
- Agentic RAG는 ReAct부터, 필요 입증 시에만 라우터/검증자/멀티에이전트. GraphRAG는 글로벌 질의 한정(비용 민감 시 LazyGraphRAG).
- 임베딩은 자체 코퍼스 벤치마크. 벡터DB는 규모(~50~100M)·비용 기준. 평가는 RAGAS로 retriever/generator 분리 + 골든셋 보정.

### 핵심 용어
RAG=검색 증강 생성 · Contextual Retrieval · Hybrid Search=하이브리드 검색 · BM25 · RRF=상호 순위 융합 · Reranking/Cross-encoder=리랭킹 · Chunking=청킹 · Late chunking · Late interaction/ColBERT · GraphRAG/LazyGraphRAG · Agentic RAG=에이전틱 RAG · ReAct · Self-RAG · RAPTOR · Multi-hop=멀티홉 · Multimodal RAG=멀티모달 RAG · MTEB · MRL(Matryoshka) · RAGAS · Faithfulness=충실성 · Context precision/recall · LLM-as-a-judge=LLM 심판 · Golden dataset=골든 데이터셋 · Context engineering · Provenance=출처 추적성

### 추천 출처
- Contextual Retrieval(Anthropic) — https://www.anthropic.com/news/contextual-retrieval
- LazyGraphRAG(Microsoft) — https://www.microsoft.com/en-us/research/blog/lazygraphrag-setting-a-new-standard-for-quality-and-cost/
- Agentic RAG 서베이 — https://arxiv.org/abs/2501.09136
- RAG 평가 — https://www.evidentlyai.com/llm-guide/rag-evaluation
- 청킹 전략 — https://www.firecrawl.dev/blog/best-chunking-strategies-rag
- 벡터DB 비교 — https://www.firecrawl.dev/blog/best-vector-databases

---

## 6. AI 개발 — LLM 앱 / 에이전트

### 핵심 트렌드
- **MCP가 에이전트 도구 연결의 사실상 표준** `mainstream` ✅
  (Anthropic 2024-11 오픈소스) OpenAI·Google·Microsoft 채택. 2025-12-09 Linux Foundation 산하 Agentic AI Foundation(AAIF)에 기증, OpenAI·Block 공동창립. 월 9700만 SDK 다운로드, 5800+ 공개 서버(전체 13,000+ 추정). ⚠️ 플래티넘 멤버에 GitHub 포함(AWS·Google·MS·Cloudflare·GitHub·Bloomberg).
- **프롬프트 → 컨텍스트 엔지니어링 패러다임 전환** `growing` ✅
  '최소한의 고신호 토큰 집합' 설계. 'context rot'(장문 성능 저하). "대부분의 에이전트 실패는 모델 실패가 아니라 컨텍스트 실패."
- **멀티에이전트 논쟁 수렴: 격리 컨텍스트 서브에이전트 오케스트레이션** `growing` ✅
  Cognition 'Don't Build Multi-Agents'(단일 스레드) vs Anthropic 병렬 서브에이전트(90.2% 향상, ~15배 토큰) 대립 → 2026-03 Cognition 'Managed Devins'로 수렴. 리드 에이전트가 계획, 3~5개 서브에이전트를 깨끗한 컨텍스트로 띄워 요약 반환.
- **Eval 주도 개발 + LLMOps 관측가능성** `growing` ✅
  LangChain 2025 조사: 프로덕션 운영 57%, 관측가능성 89% vs eval 52%(오프라인). 전체 트레이스 휴리스틱 + 10~20% 샘플 LLM-judge + 주기적 인간 주석 골든셋 + CI 게이트. 역량/회귀 eval 구분(에이전트판 TDD).
- **구조화 출력 보장: 제약 디코딩 보편화** `mainstream` ⚠️
  OpenAI Structured Outputs(2024-08), Anthropic 제약 디코딩(2025-11 beta). ⚠️ Anthropic은 2026-06 현재도 public beta(GA 아님). XGrammar(~40µs)·llguidance(~50µs)가 vLLM·SGLang·TensorRT-LLM 기본 백엔드. "정규식으로 JSON 파싱하던 시대는 끝".
- **에이전트 상호운용 A2A 표준화** `emerging` ✅
  (Google 2025-04 → Linux Foundation 2025-06) 150+ 조직. MCP='에이전트↔도구', A2A='에이전트↔에이전트'.
- **에이전트 프레임워크 지형 변화** `mainstream` ✅
  프로덕션 상태관리/관측=LangGraph 우위. CrewAI=프로토타이핑. **AutoGen은 유지보수 모드 → Microsoft Agent Framework로 통합.** Vercel AI SDK 5(Agent 클래스), OpenAI Agents SDK, Google ADK, PydanticAI, Mastra, DSPy로 다변화.
- **에이전트 신뢰성 격차 '재구축(rebuild) 시대'** `growing` ✅
  파일럿 78% vs 스케일 성공 14%, Gartner '2027년까지 40%+ 취소' 전망. 원인은 모델 역량 아닌 엔지니어링(크래시 생존·상태 보존·복구·비용). 70% 에이전트 3개 체인 → 34%(복합 실패).
- ➕ **에이전트 메모리**(에피소딕/시맨틱/프로시저럴 장기기억, 그래프 메모리, 세션 간 학습) — '단순 LLM을 자율 에이전트로 끌어올리는 정의적 특성'.
- ➕ **Anthropic Agent Skills(SKILL.md)** — 2025-10 출시, 2025-12 오픈 표준화(AAIF 기증). progressive disclosure로 절차/노하우 패키징. 'MCP=도구, Skills=절차'. (이 프로젝트가 쓰는 그 표준)
- ➕ **장시간 자율 실행**(long-horizon agents) — Claude Sonnet 4.5 30시간+ 자율 코딩, 백그라운드/ambient 에이전트.

### 업계 표준·베스트프랙티스
- 도구 연결=MCP 1차, 에이전트 협업=A2A. 컨텍스트 엔지니어링(컴팩션·구조화 노트·just-in-time 검색)으로 컨텍스트 예산 설계.
- 시스템 프롬프트는 XML/마크다운 헤더로 구획, 최소에서 시작해 실패 보며 보강. 도구는 자기완결·오류내성·용도 명확.
- 구조화 출력은 제약 디코딩으로 스키마 보장(정규식 파싱 금지). 관측가능성 기본 + eval CI 게이트.
- 멀티에이전트는 기본값 아님 — 무거운 병렬화·단일 컨텍스트 초과·복잡 도구 다수일 때만, 서브에이전트는 격리 컨텍스트.
- 비용 최우선 레버는 프롬프트 캐싱(정적 콘텐츠 앞, 가변 뒤). 추론 모델엔 명시 CoT 강제 말고 적응형.

### 핵심 용어
MCP=모델 컨텍스트 프로토콜 · A2A=에이전트 간 통신 · tool use/function calling=도구 사용 · context engineering=컨텍스트 엔지니어링 · context rot=컨텍스트 로트 · compaction=컴팩션 · just-in-time retrieval=적시 검색 · subagent=서브에이전트 · structured outputs=구조화 출력 · constrained decoding=제약 디코딩 · CFG=문맥자유문법 · LLM-as-a-judge · eval-driven development=평가 주도 개발 · capability/regression eval · observability/tracing=관측가능성 · LLMOps · agent memory=에이전트 메모리 · prompt caching=프롬프트 캐싱 · extended thinking=확장 사고 · compounding failure=복합 실패 · Agent Skills(SKILL.md)

### 추천 출처
- Effective Context Engineering(Anthropic) — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- 멀티에이전트 시스템(Anthropic) — https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them
- State of Agent Engineering(LangChain) — https://www.langchain.com/state-of-agent-engineering
- Structured Outputs(OpenAI) — https://openai.com/index/introducing-structured-outputs-in-the-api/
- A2A(Linux Foundation) — https://github.com/a2aproject/A2A
- Multi-agent research(Simon Willison) — https://simonwillison.net/2025/Jun/14/multi-agent-research-system/
