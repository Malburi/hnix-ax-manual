# CLI

> AX-NAVI IDE 가 안에서 쓰는 판정 엔진을 터미널 명령 `axnavi` 로 직접 부립니다. 색인, 변경 리뷰, 보안 점검, 산출물, 단계 게이트, 테스트·커버리지, 현대화 레시피를 같은 엔진으로 돌립니다. **대상**: 개발자. **메뉴**: IDE 터미널(`` Ctrl+` ``).

IDE 에서 본 판정과 CI 머지 요청에서 받는 판정은 **같은 엔진**에서 나옵니다. 그래서 터미널에서 미리 돌려 보면 머지 요청 결과를 알 수 있습니다.

## 어디서 쓰나

| 상황 | 쓰는 것 |
|---|---|
| 평소에 코드를 보고 고친다 | IDE 의 채팅·버튼 |
| 리포트를 파일로 남기거나 옵션을 자세히 준다 | IDE 터미널의 `axnavi` |
| 단계 게이트 결과를 진행 기록서에 남긴다 | `axnavi gate <단계> --record` |
| 머지 요청마다 리뷰·보안 점검으로 막는다 | CI 러너의 `axnavi` — 관리자가 설정([조직 설정 배포와 CI 게이트](/admin/axnavi/profiles.md)) |

> **참고** 로그인한 AX-NAVI IDE 의 터미널에서는 `axnavi` 명령이 바로 통합니다. IDE 가 받아 둔 엔진을 PATH 앞에 붙여 두기 때문에 PC 에 CLI 나 Node.js 를 따로 깔지 않습니다. IDE 밖의 다른 터미널에서는 통하지 않습니다. '서버만' 좌석은 PC 에 엔진이 없어 `axnavi` 를 쓸 수 없습니다.

## 화면 구성

터미널에서 `axnavi --help` 를 치면 명령 목록이 나옵니다. IDE 명령과는 이렇게 대응합니다.

| IDE 명령 | CLI |
|---|---|
| AX-NAVI: 인덱스 만들기 (전수 색인) / 인덱스 갱신 (변경분) | `axnavi index build` / `axnavi index refresh` |
| AX-NAVI: 변경 리뷰 (작업 트리 / 스테이지 / 범위 지정) | `axnavi review` / `--staged` / `--diff origin/main..HEAD` |
| AX-NAVI: 보안 점검 (OWASP) | `axnavi scan security [경로]` |
| AX-NAVI: 단계 게이트 점검 | `axnavi gate <req\|design\|dev\|test>` |
| AX-NAVI: 환경 점검 (doctor) | `axnavi doctor` |

## 명령 한눈에

```text
axnavi                          대화형 모드
axnavi ask <요청>               한 번 묻고 답받기 (읽기 전용)
axnavi doctor                   실행 환경 진단 (실행 경로 · 과금 · 조직 정책)

axnavi index build|status|refresh   코드베이스 색인 (AI 불필요)
axnavi index coverage [경로]        색인 커버리지 진단서

axnavi review [--diff A..B]     변경 리뷰 GO/HOLD/STOP (종료 코드 0/3/4)
axnavi scan security [경로...]  보안 점검 (OWASP·CWE)

axnavi doc new <종류|all>       SDLC 산출물 양식 (project·srs·sdd·standards·quality·progress)
axnavi doc list                 산출물 현황
axnavi adr new "<제목>"          아키텍처 결정 기록 · axnavi adr list
axnavi gate <req|design|dev|test>  단계 게이트 (종료 코드 0/3/4)

axnavi test plan|scaffold|status  요청별 테스트 계획·골격·진행 상태
axnavi coverage [--diff A..B]    커버리지 — 전체와 바뀐 줄
axnavi modernize <레시피>        현대화 레시피 — java17·java21·jakarta·boot3·oracle-pg

axnavi mcp [list|trust|untrust]  저장소 .axnavi/mcp.json 확인·허용
axnavi org pull|status           조직 설정(플랫폼 배포본) 받기·상태
axnavi skill list · axnavi agent list
```

공통 옵션: `--root <경로>`(프로젝트 루트, 기본 현재 폴더), `--format md|json`, `--out <파일>`.

## 색인

```bash
axnavi index build      # 처음 — 화면 → 버튼 → 함수 → SQL → 테이블 전수 색인
axnavi index status     # 색인이 최신인지
axnavi index refresh    # 바뀐 파일만
```

색인은 `_workspace/index/` 에 생깁니다. AI 를 부르지 않습니다.

## 변경 리뷰와 보안 점검

```bash
axnavi review                                   # HEAD 대비 작업 트리
axnavi review --staged                          # 스테이지한 것만
axnavi review --diff origin/main..HEAD --verify "mvn -q test" --format md --out review.md
axnavi scan security                            # → _workspace/reports/security_scan.md
axnavi scan security src/ --fail-on high --format json
```

| 옵션 | 뜻 |
|---|---|
| `--verify "<명령>"` | 검증 명령(빌드·테스트)을 돌려 실패하면 STOP |
| `--tests-passed` | 앞 단계에서 테스트가 통과했다고 알림(CI 용) |
| `--fail-on <심각도>` | 보안 점검에서 그 심각도 이상이 있으면 종료 코드 1 |

판정 읽는 법은 [변경 리뷰와 보안 점검](/user/axnavi/review.md)에 있습니다.

## 산출물과 단계 게이트

```bash
axnavi doc new all
axnavi gate design
axnavi gate dev --record      # 판정을 진행 기록서 이력 표에 남김
```

자세한 내용은 [SDLC 산출물과 단계 게이트](/user/axnavi/sdlc.md)에 있습니다.

## 테스트 계획과 커버리지

PMS-X 서비스 요청 화면의 **구현 명세 내보내기**(JSON)에는 테스트 케이스와 관련 서버 소스가 들어 있습니다. 이것으로 AI 없이 테스트 계획과 골격을 만듭니다.

1. 계획: `axnavi test plan --spec <명세.json> [--framework junit5|vitest]` → `_workspace/tests/<요청 번호>.plan.json`
2. 골격: `axnavi test scaffold <요청 번호>` — 자바면 JUnit 5, 프런트만 있으면 Vitest. 케이스마다 `@Disabled("작성 필요")`(Vitest 는 `it.todo`)로 시작해 빌드가 깨지지 않습니다. 다시 만들면 없는 케이스만 덧붙이고 사람이 쓴 본문은 건드리지 않습니다.
3. 본문을 채웁니다(사람, 또는 채팅에 "SR-0012 테스트 채워줘").
4. 진행 상태: 테스트를 돌린 뒤 `axnavi test status [요청 번호] --junit <폴더>` — 실패가 있으면 STOP, 남은 케이스가 있으면 HOLD, 다 통과하면 GO.
5. 커버리지: `axnavi coverage --jacoco <xml> --diff origin/main..HEAD --min 60` — **이번에 바뀐 줄**의 커버리지와 테스트가 닿지 않은 줄 번호. 기준 미달이면 HOLD.

## 현대화 레시피

Java 8 → 17/21, Spring Boot 2 → 3, javax → jakarta, Oracle → PostgreSQL 전환을 규칙으로 훑어 **자동**(기계적 치환)과 **수동**(사람이 판단 + 안내)으로 나눕니다.

```bash
axnavi modernize java17                       # 점검만 — 리포트 _workspace/reports/modernize_java17.md
axnavi modernize java17 --apply --verify "mvn -q test"   # 자동 항목을 고치고 검증
axnavi modernize oracle-pg --draft            # 판단이 필요한 SQL 의 AI 초안(소스는 고치지 않음)
```

| 레시피 | 자동으로 고치는 예 | 사람이 볼 것의 예 |
|---|---|---|
| `java17` · `java21` | 빌드 대상 1.8 → 17/21, `new Integer(…)` → `Integer.valueOf(…)` | `sun.misc.BASE64*`, `javax.xml.bind`, `finalize()` |
| `jakarta` | Java EE `javax.*` → `jakarta.*` | `javax` 의존성 좌표 |
| `boot3` | Spring Boot 버전, 바뀐 설정 키, `javax` 의존성 좌표 | `WebSecurityConfigurerAdapter`, `antMatchers` |
| `oracle-pg` | `NVL` → `COALESCE`, `SYSDATE` → `LOCALTIMESTAMP`, `FROM DUAL` 제거 | 여러 줄 `DECODE`, `ROWNUM`, `(+)` 외부 조인, `CONNECT BY`, `MERGE` |

- `--apply` 는 고칠 파일에 커밋하지 않은 변경이 있으면 고치지 않습니다(`--force` 로 무시).
- EUC-KR 소스는 한글이 없는 줄만 고치고, 한글이 섞인 줄은 수동 항목으로 남깁니다.
- 종료 코드: 검증 실패 STOP, 수동 항목이 남으면 HOLD, 다 끝나면 GO.
- 권장 순서: `java17` → `boot3`(아니면 `jakarta`) → `oracle-pg`. 단계마다 `axnavi review` 로 다시 판정합니다.

## 대화형 모드와 환경 점검

- `axnavi` 만 치면 대화형 모드가 열립니다. `axnavi ask "<요청>"` 은 한 번 묻고 답만 받습니다(읽기 전용).
- `axnavi doctor` 는 실행 경로, **과금**(지금 누구에게 과금되는지), 조직 정책, 조직 설정 상태를 보여 줍니다.

```text
✓ 실행 경로  claude-cli · 구독 인증
✓ 과금       본인 Claude 로그인(Pro·Max·Team·Enterprise) — 본인 구독·좌석 한도
```

## 조직 설정 받기

관리자가 플랫폼에서 배포한 규칙·양식·스킬·MCP·정책 묶음을 받습니다.

```bash
axnavi org pull      # 받았습니다 — 공통 v3 · 파일 5개 · IDE 규칙 1·스킬 1·모드 1
axnavi org status    # 받은 배포본과 받은 시각
```

받으려면 환경 변수 `HNIX_AX_SERVER`(플랫폼 주소)와 `HNIX_AX_KEY`(내 플랫폼 키)가 있어야 합니다. 둘이 없으면 `HNIX_AX_SERVER 와 HNIX_AX_KEY 가 없어 받지 않았습니다` 로 끝납니다. 있으면 실행할 때 10분 간격으로 자동으로도 받습니다. 키 발급은 [LLM 게이트웨이 — 내 키와 모델](/user/platform/gateway.md)을 따릅니다.

## 자주 묻는 질문

| 질문 | 답 |
|---|---|
| `axnavi` 를 찾을 수 없다고 나와요 | IDE 가 로그인돼 있는지, IDE 에서 **새 터미널**을 열었는지 확인합니다. 로그인 전에 열어 둔 터미널은 닫고 다시 엽니다 |
| 종료 코드 1 이 나와요 | 판정이 아니라 실행 자체가 실패한 것입니다(범위 오류 등). 메시지를 읽고 `axnavi doctor` 를 실행합니다 |
| 더 자세한 CLI 설명은 | 대화형 모드·스킬은 AX-NAVI CLI 문서에 있습니다. 관리자에게 위치를 물어보세요 |

## 관련 쪽

- [변경 리뷰와 보안 점검](/user/axnavi/review.md)
- [SDLC 산출물과 단계 게이트](/user/axnavi/sdlc.md)
- [조직 설정 배포와 CI 게이트](/admin/axnavi/profiles.md)
