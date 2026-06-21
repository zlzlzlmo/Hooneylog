# 조회수 증가 API 서버측 어뷰징 방어 — 설계

날짜: 2026-06-21

## 배경 / 문제

`POST /api/views/[slug]` 는 호출될 때마다 `incrementView` 로 KV 카운터를
무조건 +1 한다. 어뷰징 방지는 클라이언트 `sessionStorage`(`view-counter.tsx`)
에만 있어, 새 탭/시크릿창/직접 POST 반복으로 특정 글 조회수를 무한히 부풀릴
수 있다. 서버에는 인증·레이트리밋·중복방지가 전혀 없다.

## 목표

같은 클라이언트의 반복 요청이 같은 글의 조회수를 거듭 올리지 못하도록
**해시 IP + slug 기준 24시간 dedup**을 서버에 추가한다. 저장소는 기존과 동일한
Vercel KV. 클라이언트 `sessionStorage` 로직은 보완재로 유지한다.

## 비목표 (YAGNI)

- 글로벌/분당 레이트리밋
- 봇 탐지, CAPTCHA
- 사용자 인증

## 구성 단위

### 1. `apps/web/src/lib/view-guard.ts` (신규, 순수함수)

- `getClientIp(headers: Headers): string`
  - `x-forwarded-for` 의 첫 IP → 없으면 `x-real-ip` → 없으면 `'unknown'`.
  - 쉼표/공백 트리밍.
- `hashIp(ip: string): string`
  - `sha256(salt + ip)` 의 hex 앞 16자.
  - salt = `process.env.VIEW_HASH_SALT ?? '<상수 폴백>'`.
  - 결정적이며 원본 IP 와 다른 값.

### 2. `apps/web/src/lib/views.ts` (확장)

- `markViewedOnce(slug: string, ipHash: string, ttlSec = 86400): Promise<boolean>`
  - `kv.set('views:seen:' + slug + ':' + ipHash, 1, { nx: true, ex: ttlSec })`
  - 반환: 새로 세팅됨(첫 조회) → `true`, 이미 존재(중복) → `false`.
  - KV 에러 시 **fail-open**(true 반환)하고 `console.error` 로그.
    정상 사용자의 조회를 잃지 않는 쪽을 택한다.

### 3. `apps/web/src/app/api/views/[slug]/route.ts` (POST 수정)

```ts
const ipHash = hashIp(getClientIp(request.headers));
const first  = await markViewedOnce(slug, ipHash);
const views  = first ? await incrementView(slug) : await getViewCount(slug);
return NextResponse.json({ views, counted: first });
```

## 데이터 / KV 키

| 키 | 값 | TTL |
|---|---|---|
| `views:seen:<slug>:<ipHash>` | `1` | 24h (자동 만료) |

기존 키(`views:post:*`, `views:total`, `views:today:*`)는 변경 없음.

## 에러 처리

- `markViewedOnce` KV 에러 → fail-open(조회 집계 유지), 로그.
- 기존 `incrementView`/`getViewCount` 의 graceful 동작(에러 시 0/그대로) 유지.

## 테스트 (TDD, vitest, `@vercel/kv` 모킹)

- `view-guard.test.ts`
  - `getClientIp`: 다중(`a, b`) → 첫 IP, 단일, `x-real-ip` 폴백, 누락 → `'unknown'`.
  - `hashIp`: 동일 입력 동일 출력, 원본 IP ≠ 해시, 다른 IP → 다른 해시, 16자.
- `views.test.ts` (추가)
  - `markViewedOnce`: NX 성공 → true, NX 실패(null) → false, `{nx,ex}` 옵션 전달, 에러 → fail-open(true).
- `route.test.ts` (신규)
  - 신규 방문 → `incrementView` 호출, `counted:true`.
  - 중복 방문 → `incrementView` 미호출 + `getViewCount` 반환, `counted:false`.

## 배포 메모

- `VIEW_HASH_SALT` 환경변수(선택). 미설정 시 상수 폴백으로 동작.
  설정하면 해시 추측 난이도가 올라간다.
