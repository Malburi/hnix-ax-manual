# 조직 설정 배포와 CI 게이트

> 팀마다 개발자 PC 를 돌며 규칙·양식·MCP 설정을 맞추지 않도록, 플랫폼에서 **조직 설정 묶음**을 배포하고 각 PC 가 받아 가게 합니다. 머지 요청마다 AX-NAVI 판정으로 막는 **CI 게이트**도 설정합니다. **대상**: 플랫폼 관리자, 빌드·형상 관리 담당. **메뉴**: 플랫폼 왼쪽 메뉴 › AX-NAVI › 조직 설정 · CI 저장소의 `.gitlab-ci.yml`.

묶음을 만들고 배포하는 플랫폼 화면(**AX-NAVI 조직 설정 — 규칙·양식·스킬·MCP 배포**)의 버튼 사용법은 [AX-NAVI 사용 허가 · 조직 설정](/admin/platform/axnavi.md)에 있습니다. 이 쪽은 **묶음에 무엇을 넣는지**와 **PC 가 어떻게 받는지**, CI 게이트를 다룹니다.

## 묶음에 넣는 것

| 파일 경로 | 내용 | 터미널(CLI 엔진)에서 | AX-NAVI IDE 에서 |
|---|---|---|---|
| `rules/<이름>.md` | 코딩 규칙 | 에이전트 지침에 `<조직 규칙>` 으로 붙음 | 전역 규칙 `~/.roo/rules/axnavi-org-<이름>.md` |
| `skills/<이름>/SKILL.md` | 팀 스킬(하위 파일 가능) | — | 전역 스킬 `~/.roo/skills/<이름>/` |
| `modes/<slug>.json` | 사용자 정의 모드 | — | 채팅 모드 목록에 추가(전역 `custom_modes.yaml`) |
| `templates/<종류>.md` | SDLC 양식(`project`·`srs`·`sdd`·`standards`·`quality`·`progress`) | 프로젝트 양식·`AXNAVI_TEMPLATES_DIR` 다음, 내장 양식 앞 | (엔진이 씀) |
| `mcp.json` | 조직 MCP 서버 | 따로 허용하지 않아도 씀. 같은 이름의 저장소 설정보다 우선 | (엔진이 씀) |
| `policy.json` | AI 연결 경로 정책 | 허용 경로는 **좁히기만**. 선호 경로·게이트웨이 주소는 PC 공용 정책이 비워 둔 경우에만 | 같음 |

경로 이름 규칙에 맞지 않는 파일(폴더 밖을 가리키는 경로 등)은 PC 가 넣지 않고 `넣을 수 없는 경로라 건너뜀` 으로 알립니다.

### 예시

```markdown
<!-- rules/coding.md -->
# 코딩 규칙
- SQL 은 바인드 변수로만 작성한다(문자열 결합 금지).
- 커밋 메시지·브랜치에 서비스 요청 번호를 넣는다(예: feature/SR-2026-0142).
```

```json
// mcp.json — 키 값은 적지 않고 ${환경변수} 로만
{ "mcpServers": { "hnix": { "type": "http", "url": "${HNIX_AX_SERVER}/mcp",
    "headers": { "Authorization": "Bearer ${HNIX_AX_KEY}" } } } }
```

```json
// policy.json
{ "allowedRoutes": ["subscription", "gateway"], "message": "외부 API 키 직접 사용은 허용하지 않습니다." }
```

```json
// modes/sr-fixer.json
{ "slug": "sr-fixer", "name": "서비스 요청 처리",
  "roleDefinition": "너는 통합ITO 운영 개발자다. 서비스 요청의 구현 명세를 읽고 영향 범위를 확인한 뒤 최소한으로 고친다.",
  "whenToUse": "서비스 요청 번호가 주어진 수정 작업",
  "customInstructions": "고치기 전에 pmsx__spec 으로 명세를, 영향도 도구로 범위를 확인한다. SQL 은 바인드 변수로만.",
  "groups": ["read", ["edit", { "fileRegex": "\\.(java|xml|jsp|js|ts|vue|sql)$", "description": "소스·매퍼만" }], "command", "mcp"] }
```

- 모드의 도구 묶음은 `read`·`edit`·`browser`·`command`·`mcp` 입니다. `["edit", { "fileRegex": "…" }]` 로 고칠 수 있는 파일을 좁힙니다.
- 사용자가 같은 이름으로 직접 만든 모드가 있으면 그쪽을 둡니다.

> **주의** `mcp.json` 의 인증 헤더·환경값에 키 값을 그대로 적으면 플랫폼이 배포를 거절합니다. `${환경변수}` 로만 씁니다.

## 배포 · 버전 · 겹치기

| 규칙 | 내용 |
|---|---|
| 대상 | **전사** 또는 **팀(워크스페이스)** |
| 초안과 배포 | 편집은 초안에 하고, **배포**할 때마다 버전이 하나 늘어 이력으로 남습니다 |
| 되돌리기 | 옛 버전으로 되돌리면 그 내용이 새 버전으로 다시 배포됩니다 |
| 우선순위 | 한 사람에게 묶음이 여럿 해당하면 우선순위가 **작을수록 먼저** 깔리고, 같은 파일은 뒤 묶음이 이깁니다. MCP 서버는 이름 단위로 합치고, 허용 경로는 교집합입니다 |
| 바뀐 것 없음 | 서버가 "바뀐 것 없음"으로 답해 PC 는 아무것도 다시 쓰지 않습니다 |
| 지우기 | 다음 배포본에서 빠진 파일·IDE 규칙·스킬·모드는 PC 에서도 지웁니다. 사용자가 직접 만든 규칙·스킬은 건드리지 않습니다(`axnavi-org-` 접두사와 받은 목록으로 구분) |
| 받아 간 기록 | 조직 설정 화면 아래에 누가(사용자·키·클라이언트) 어느 배포본을 언제 받았는지 남습니다 |

## 개발자 PC 가 받아 가는 방식

받는 것은 판정 엔진(`axnavi`)입니다. 엔진은 플랫폼 주소와 각자의 플랫폼 키로 `/api/v1/axnavi/bundle` 을 부릅니다.

| 필요한 것 | 값 |
|---|---|
| `HNIX_AX_SERVER` | 플랫폼 주소(예 `http://ax.corp.local:8700`) |
| `HNIX_AX_KEY` | 그 사람의 플랫폼 키(권한 범위는 상관없음) |

1. 두 환경 변수가 있으면 엔진이 시작할 때 **마지막으로 받은 지 10분이 지났을 때만** 자동으로 받습니다. 플랫폼에 닿지 않으면 지난 배포본을 그대로 쓰고 실행을 막지 않습니다.
2. 바로 받으려면 IDE 터미널에서 실행합니다.

   ```bash
   axnavi org pull
   # 받았습니다 — 공통 v3, 백엔드팀 v1 · 파일 6개 · IDE 규칙 1·스킬 1·모드 1
   axnavi org status    # 받은 배포본·받은 시각·서버
   axnavi doctor        # 조직 설정 상태도 함께
   ```

3. 결과에 따라 이렇게 보입니다.

   | 출력 | 뜻 |
   |---|---|
   | `받았습니다 — …` | 새 배포본을 깔았습니다 |
   | `바뀐 것이 없습니다 (…)` | 이미 최신입니다 |
   | `HNIX_AX_SERVER 와 HNIX_AX_KEY 가 없어 받지 않았습니다…` | 환경 변수를 넣어야 합니다 |
   | `받지 못했습니다: 서버가 401 로 답했습니다 — HNIX_AX_KEY 를 확인하세요.` | 키가 틀렸거나 꺼졌습니다 |

| PC 에 깔리는 곳 | 내용 |
|---|---|
| `~/.axnavi/org/` | 배포본 원본(정책·MCP·양식·규칙)과 상태 파일 — 위치는 `AXNAVI_ORG_DIR` 로 바꿈 |
| `~/.roo/rules/axnavi-org-*.md`, `~/.roo/skills/<이름>/` | IDE 전역 규칙·스킬 |
| IDE 전역 `custom_modes.yaml` | 사용자 정의 모드(표시 주석과 함께) |

| 끄기 | 환경 변수 |
|---|---|
| 자동 받기 끄기 | `AXNAVI_ORG_AUTO=0` |
| IDE 폴더(`~/.roo`)에 깔지 않기 | `AXNAVI_ORG_IDE=0` |

> **참고** IDE 로그인만으로는 `HNIX_AX_SERVER`·`HNIX_AX_KEY` 가 생기지 않습니다. 조직 설정을 받게 하려면 PC 에 두 환경 변수를 넣어 두거나(그룹 정책·로그인 스크립트), 개발자가 플랫폼에서 키를 발급받아 넣도록 안내합니다.

## CI 게이트 — GitLab 머지 요청

AX-NAVI CLI 저장소의 `docs/ci/` 에 GitLab 템플릿이 둘 있습니다. 둘 다 모델·API 키·외부 네트워크를 쓰지 않으므로 폐쇄망 러너에서 그대로 돕니다.

| 파일 | 하는 일 |
|---|---|
| `docs/ci/gitlab-axnavi-review.yml` | 머지 요청 변경 리뷰(GO·HOLD·STOP) + 선택: 야간 보안 점검 |
| `docs/ci/gitlab-axnavi-quality.yml` | 빌드·테스트 → 테스트 진행 상태 → 바뀐 줄 커버리지 게이트, 선택: 현대화 점검 |

### 판정과 파이프라인

| 종료 코드 | 판정 | 파이프라인 |
|---|---|---|
| 0 | GO | 통과 |
| 3 | HOLD | 경고(노란 느낌표)로 통과 — `allow_failure: exit_codes: [3]` |
| 4 | STOP | 실패 — 머지 차단 |
| 1 | 리뷰 자체가 돌지 못함(범위 오류 등) | 실패 |

> **주의** STOP 이 머지를 실제로 막으려면 GitLab 프로젝트 설정의 **파이프라인이 성공해야 머지**를 켜 둡니다.

### 변경 리뷰 job 넣기

1. 프로젝트 `.gitlab-ci.yml` 에서 템플릿을 include 합니다(또는 job 을 붙여 넣습니다).

   ```yaml
   include:
     - local: docs/ci/gitlab-axnavi-review.yml      # 공용 저장소면 project/file 로
     - local: docs/ci/gitlab-axnavi-quality.yml     # 테스트·커버리지 게이트도 쓸 때
   ```

2. 변수를 정합니다.

   | 변수 | 기본값 | 뜻 |
   |---|---|---|
   | `AXNAVI_PACKAGE` | `axnavi` | 사내 npm 미러의 패키지 이름 |
   | `AXNAVI_TGZ` | (비움) | 미러가 없을 때 오프라인 배포본(.tgz) 경로 |
   | `GIT_DEPTH` | `0` | 대상 브랜치와 비교하려면 이력이 필요합니다 |
   | `AXNAVI_VERIFY` | (비움) | 검증 근거. 테스트 job 을 `needs` 로 앞에 두면 `--tests-passed`, 여기서 돌리려면 `--verify "mvn -q -B test"`. 비우면 '검증 없음' HOLD 가 걸립니다 |
   | `AXNAVI_MR_TOKEN` | (비움) | 프로젝트 액세스 토큰(api 권한). 있으면 리포트를 머지 요청 댓글로 답니다 |

3. job 이 하는 일은 다음과 같습니다.

   ```yaml
   axnavi-review:
     stage: review
     image: node:22-bookworm-slim
     rules:
       - if: $CI_PIPELINE_SOURCE == "merge_request_event"
     before_script:
       - npm install -g ${AXNAVI_TGZ:-$AXNAVI_PACKAGE} --no-audit --no-fund
       - git fetch -q origin "$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"
       - axnavi index refresh || axnavi index build || true
     script:
       - BASE="origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"
       - eval axnavi review --diff "\"$BASE...HEAD\"" $AXNAVI_VERIFY --format md --out axnavi-review.md || CODE=$?
       - exit ${CODE:-0}
     allow_failure:
       exit_codes: [3]
   ```

   - 색인은 대상 브랜치별 캐시(`_workspace/index/`)로 재사용합니다. 색인이 있으면 리포트에 호출자·테이블·진입 화면까지 나옵니다.
   - `axnavi-review.md`·`.json` 은 산출물로 30일 남고, 머지 요청 화면에 **AX-NAVI review** 로 보입니다.
   - 같은 머지 요청에서 새로 넣은 `axnavi:allow` 억제 주석은 판정을 낮추지 못하고 HOLD 가 됩니다.

4. (선택) `axnavi-security-scan` job 은 **스케줄 파이프라인**에서만 돌며 기본 브랜치 전체를 점검해 `security_scan.md`·`.json` 을 90일 남깁니다. 기존 부채로 막지 않고 리포트만 남깁니다.

### 테스트·커버리지 게이트

| job | 하는 일 | 결과 |
|---|---|---|
| `build-test` | 빌드·테스트(JUnit XML·JaCoCo XML 남김) — 프로젝트에 맞게 명령만 바꿈 | 테스트 보고서 |
| `axnavi-test-status` | 저장소에 커밋한 `_workspace/tests/*.plan.json` 대비 진행 — 작성 필요 HOLD, 실패 STOP | `_workspace/reports/tests_*.md` |
| `axnavi-coverage` | 바뀐 줄 커버리지 — `AXNAVI_COVERAGE_MIN`(기본 60%)보다 낮으면 HOLD | `axnavi-coverage.md` |
| `axnavi-modernize` | (수동·스케줄) 현대화 레시피 점검 — `AXNAVI_RECIPE`(기본 `java17`) | `modernize_*.md` |

| 변수 | 기본값 |
|---|---|
| `AXNAVI_COVERAGE_MIN` | `60` — 처음에는 낮게 두고 올립니다 |
| `JUNIT_DIR` | `target/surefire-reports` (Gradle 이면 `build/test-results/test`) |
| `JACOCO_XML` | `target/site/jacoco/jacoco.xml` (Gradle 이면 `build/reports/jacoco/test/jacocoTestReport.xml`) |

> **참고** CI 러너의 AX-NAVI CLI 판은 플랫폼 서버에 깐 판과 맞춥니다. 판이 다르면 IDE 판정과 CI 판정이 어긋날 수 있습니다.

## 관련 쪽

- [AX-NAVI 관리 개요 — 서버 엔진](/admin/axnavi/README.md)
- [AX-NAVI 사용 허가 · 조직 설정](/admin/platform/axnavi.md)
- [변경 리뷰와 보안 점검](/user/axnavi/review.md)
- [SDLC 산출물과 단계 게이트](/user/axnavi/sdlc.md)
