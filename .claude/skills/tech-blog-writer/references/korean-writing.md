# 한국어 기술블로그 작문 가이드

> tech-blog-writer 스킬이 초안 작성·교정 시 항상 로드하는 톤/구조 레퍼런스.
> 출처: docs/research/tech-blog-trends-2026.md §7 (2026-06 스냅샷).

## 7. 한국어 기술블로그 작문 가이드

> 한국 대표 기술블로그(토스/LINE/쏘카/카카오페이/44bits/우아한형제들 등) 관행 종합. ⚠️ 검증 단계에서 **환각·과장으로 확인된 항목은 제거**했고, 출처가 견고한 것만 남김.

### 톤 & 문체 (반드시 지킬 것)
- **존댓말 '~습니다'체가 디폴트.** 친절·겸손·구어체, 기술 우월감 배제. 초보자도 이해할 난이도로 풀어 쓰되 곁가지 개념은 외부 링크로 위임.
- **두괄식**: 핵심(결론)을 단락 맨 앞에, 근거는 뒤에.
- **4원칙**(LINE·토스 공통): 명확성 · 간결성 · 정확성 · 일관성.
- **번역투·군더더기 제거**: '작업을 수행합니다 → 합니다', '~를 통해 → ~로', 이중피동 금지, 능동태 우선, 짧은 문장.

### 글 구조 (핵심 골격)
- **회고형·문제해결 서사**: `문제 정의 → 해결 과정/시행착오 → 결론 → 독자 TIP`(쏘카 템플릿).
- **'왜(Why)'와 의사결정의 맥락**을 드러낸다. 결과만이 아니라 추정·소거·검증의 사고 과정과 **실패 사례**를 정직하게 포함 → '이 조건에서 재현, 이 순서로 해결'이 신뢰를 준다. (한국 기술블로그의 차별점)
- 첫머리에 **TL;DR/요약**, 소제목·이미지·다이어그램·코드 블록·여백으로 시각적 리듬.

### 분량 (스캔 가능하게)
- 44bits 권장: 본문 **4,000~10,000자(약 7분)**. ✅ (검증됨)
- 과도하게 길면 분할, 한 화면에 스캔 가능하게.
- ⚠️ "토스뱅크 평균 1,905자/정독 3분" 수치는 **출처 미확인(환각 의심)** → 인용하지 말 것.

### 제목
- **SEO 키워드(검색 자동완성·Google Trends) + 질문형/구체형 후킹** 결합(쏘카). 한글 자료 부족 키워드는 그대로 제목으로.
- ➕ **2026 보강: GEO/AEO(생성형·답변 엔진 최적화).** AI 검색(ChatGPT/Perplexity)이 인용하도록 통계·조사 방법·데이터 출처를 명시(추적 가능성), E-E-A-T 강화. SEO만으론 구버전 프레이밍.

### 운영 파이프라인
- `글감 리뷰(독자·목적·강조점) → 작성 → 동료/에디터 리뷰 → 보완 → 발행`(쏘카 6단계, LINE 자기검토→체크리스트→동료검토).
- AI는 초안·문장 다듬기 보조로 쓰되, **회고와 사실 검증은 사람이 책임**.

### ➕ 2026 보강 관행
- **AI 슬롭 회피**: AI 과의존으로 인한 일반론·환각 문장 경계. AI 사용 시 사람의 회고·검증 책임 명시.
- **키워드 스터핑 역효과**: LLM의 의미적 품질 평가 시대 → 키워드 반복은 저품질 신호. 자연스러운 의미 중심 작문.
- **재현 가능성 강조**: AI가 코드를 쉽게 생성하는 시대일수록, 사람 블로그의 차별점은 '실제 재현된 환경·버전·실패 로그'.

### ⚠️ 검증 정정 (인용 시 주의)
- "토스가 초안→AI 리뷰→테크니컬 라이터 제출 프로세스를 공개 문서화" → 실제론 **인포그랩 글의 6단계를 토스로 오귀속**. 토스 공개 근거 미확인.
- "ChatGPT=아이디어 / Perplexity=조사 / NotebookLM=정리 / Claude=다듬기" 도구 분담 → **어떤 인용 소스에도 없는 일반론**.
- 토스 'Easy to speak / Universal words'는 **UX Writing(앱 문구) 8원칙**이지 기술블로그 작법 아님 → 영역 혼동 주의.

### 핵심 용어
두괄식(top-heavy/lead-first) · 명확성·간결성·정확성·일관성(4원칙) · 번역투(translationese) · 이중피동(double passive) · 능동태(active voice) · 회고(retrospective) · 시행착오(trial and error) · 재현 절차(reproduction steps) · TL;DR/요약 먼저 · 존댓말('~습니다') · 구어체(easy-to-speak) · 글감 리뷰 · 동료 리뷰/테크니컬 에디팅 · 톤앤매너 · POWER Writing(Prepare-Organize-Write-Edit-Review) · GEO/AEO · E-E-A-T

### 추천 출처 (1차)
- 토스 technical-writing.dev — https://technical-writing.dev/
- toss/technical-writing(GitHub) — https://github.com/toss/technical-writing
- 토스 글쓰기 8원칙 — https://toss.tech/article/8-writing-principles-of-toss
- LINE Technical Writing Day — https://engineering.linecorp.com/ko/blog/technical-writing-day/
- 쏘카 기술블로그 운영법 — https://tech.socarcorp.kr/data/2023/02/15/how-to-organize-tech-blog.html
- 44bits 블로그 8가지 제안 — https://www.44bits.io/ko/post/8-suggestions-for-tech-programming-blog
- 개발자를 위한 글쓰기(wormwlrm) — https://wormwlrm.github.io/2020/02/23/Writing-for-developers.html
