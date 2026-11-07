# 서버 설치 — 서버판 꾸러미

> 회사 서버 한 대에 AX Platform · PMS-X · AX-DataLake · 사내 모델 · DB 를 설치하고 서로 잇습니다. 여러 사람이 각자 PC 의 브라우저와 AX-NAVI IDE 로 접속해 씁니다. **대상**: 시스템 관리자(서버 관리자 권한 필요).

## 설치되는 것

```text
[사용자 PC]                         [서버 1대]
 브라우저 ───────────────────────▶ AX Platform  :8700  게이트웨이 · MCP 허브 · 에이전트
 AX-NAVI IDE ───────────────────▶ PMS-X        :8080  프로젝트 · 서비스 요청 · As-Is 분석
                                   AX-DataLake  :8790  레이크 · 온톨로지 · 거버넌스
                                   사내 모델     :11434 Ollama (서버 안에서만)
                                   PostgreSQL   :5432  세 제품의 DB (서버 안에서만)
```

| 서버 꾸러미 안 | 내용 |
|---|---|
| 제품 셋 | AX Platform 0.9.0(Node 포함), AX-DataLake 0.3.1(Node·SQL 엔진 포함), PMS-X 1.3.7(Java 21 포함, 시연 데이터) |
| DB | PostgreSQL 18 — 세 제품 DB 를 한곳에, 매일 백업 |
| 사내 모델 | Ollama CPU 판 — 문서 검색용 임베딩과 대화 모델 |
| AX-NAVI CLI · 연습 저장소 | 허브의 AX-NAVI 도구와 자동 점검용 |
| `server.ps1` · `server.config.json` | 설치·시작·멈춤·상태·백업·사용자 등록, 설정 파일 하나 |
| 개인 PC 설치 파일 | `HNIX-AX-PC-Setup-<판>.exe` — 개발자가 플랫폼 '내 연결 설정'에서 받아 갑니다 |

## 1. 받을 것

GitHub `Malburi/hnix-ax-platform` 저장소(비공개) › **Releases** › **서버판 꾸러미** 에서 받습니다.

| 파일 | 크기 | 쓰임 |
|---|---|---|
| `HNIX-AX-Server-Setup-<날짜>.exe` | 약 800MB | 서버 설치 프로그램(코드 서명) |
| `ollama-model-qwen2.5-3b.zip` · `ollama-model-nomic-embed-text-latest.zip` | 약 1.8GB · 260MB | **꼭 필요** — 대화 모델·임베딩 모델 |
| `ollama-model-qwen3.5-4b.zip.001`·`.002` | 약 3.2GB | **권장** — AX-NAVI IDE 용 코드 모델(`hnix-code`). 없으면 IDE 채팅에 '모델 응답 불완전'이 날 수 있습니다 |
| `ollama-model-qwen3.5-2b.zip.001`·`.002` | 약 2.6GB | 선택 — 가벼운 대화 모델 |
| `SHA256SUMS.txt` | | 받은 파일이 온전한지 대조 |

> **주의** 2GB 가 넘는 모델은 `.zip.001`·`.002` 조각으로 나뉘어 있습니다. 조각을 **모두** 받아 설치 파일과 **같은 폴더**에 두세요. 설치가 이어 붙입니다.

## 2. 서버 준비

| 항목 | 기준 |
|---|---|
| OS | Windows Server 2019 이상(또는 Windows 10/11 64비트) |
| 메모리 | 32GB 권장, 최소 16GB(IDE 코드 모델까지 쓰면 32GB) |
| 디스크 | 여유 100GB 권장, 최소 20GB |
| 네트워크 | 사용자 PC → 서버 8700·8080·8790 포트 |
| 권한 | 서버 관리자 — 서비스 등록·방화벽 때문에 설치 프로그램이 묻습니다 |
| 주소 | 사용자가 칠 서버 이름(예 `ax.corp.local`) 또는 고정 IP |

## 3. 설치

1. 설치 파일과 모델 파일을 한 폴더에 두고 `HNIX-AX-Server-Setup-<날짜>.exe` 를 실행합니다.
2. 설치 위치는 기본 `C:\HNIX-AX` 를 권합니다(짧은 영문 경로 — 긴 경로는 Windows 경로 길이 제한에 걸릴 수 있습니다).
3. **접속 주소와 포트**를 넣습니다. 비우면 이 서버의 IP 를 씁니다. **접속 허용 대역**(예 `10.20.30.0/24`)을 넣으면 그 대역만 방화벽을 엽니다.
4. **설치를 마치면 바로 서버 설치·시작**을 켜 둔 채 마칩니다. 진행 창이 열려 아래 순서를 끝까지 돕니다(처음에는 10분 넘게 걸립니다).

| 순서 | 하는 일 |
|---|---|
| 1 | 패키지를 `apps\` · `tools\` · `work\` 에 풉니다 |
| 2 | PostgreSQL 18 을 Windows 서비스로 — 127.0.0.1 에서만, 제품마다 계정·DB, 매일 02:00 백업 예약 |
| 3 | 사내 모델 Ollama 를 서비스로 — 127.0.0.1 에서만, 모델 넣기 |
| 4 | AX Platform — 서비스, 관리자·점검용 계정 |
| 5 | 게이트웨이 — 모델 별칭 `hnix-local` · `hnix-smart` · `hnix-embed` · `hnix-code`, 제품끼리 쓰는 키 |
| 6 | AX-DataLake — 서비스, AI 질문은 플랫폼 게이트웨이로, 시연 테이블·온톨로지·거버넌스 |
| 7 | PMS-X — 서비스, 시연 데이터, AI 보조는 게이트웨이로 |
| 8 | MCP 허브 — PMS-X · AX-NAVI · 레이크 도구, 승인 정책, 에이전트, 문서 |
| 9 | Windows 방화벽 — 세 포트만 엽니다(PostgreSQL·Ollama 는 열지 않음) |
| 10 | 개인 PC 설치 파일을 플랫폼 내려받기 폴더에 |

**화면 없이 설치(배포 도구)**

```powershell
HNIX-AX-Server-Setup-<날짜>.exe /VERYSILENT /ADDRESS=ax.corp.local /SUBNETS=10.20.30.0/24
# 포트를 바꾸려면 /PLATFORMPORT= /PMSXPORT= /DATALAKEPORT=
```

> **참고** 설치는 다시 돌려도 됩니다. 있는 것은 그대로 두고 빠진 것만 채웁니다. 관리자 권한 없이 시험만 하려면 설치 프로그램에서 '현재 사용자만'을 고르세요(서비스·방화벽 없이 지금 사용자로 띄웁니다).

## 4. 설치 확인

1. 설치 폴더의 `server.config.json` 을 엽니다. `platform.admin` 에 플랫폼 관리자 아이디·비밀번호가 있습니다(처음 설치가 만들어 적습니다).
2. **다른 PC** 의 브라우저로 `http://<접속 주소>:8700` 에 관리자로 로그인합니다.
3. 왼쪽 메뉴 **현장 연결 점검** › **연결 시험 포함 점검** — 문제 0 이면 제품끼리 잘 이어진 것입니다 → [현장 점검](/admin/platform/system.md)
4. 서버에서 상태를 봅니다.

```powershell
cd C:\HNIX-AX
powershell -ExecutionPolicy RemoteSigned -File server.ps1 status   # 서비스·응답·접속 주소
tools\node\node.exe scripts\smoke.mjs                             # 자동 점검 21단계(시험 기록이 남습니다)
```

## 5. 처음 할 설정

| 할 일 | 방법 |
|---|---|
| 플랫폼 관리자 비밀번호 바꾸기 | 플랫폼 오른쪽 위 **비밀번호 바꾸기** |
| PMS-X 시연 계정 비밀번호 바꾸기 | PMS-X 오른쪽 위 이름 › **비밀번호 변경**. `admin` · `op.seo`(허브가 PMS-X 를 읽는 서비스 계정)를 바꿨으면 `server.config.json` 의 `pmsx.adminPassword` · `serviceAccountPassword` 에도 적고 `server.ps1 install` 을 다시 돌립니다 |
| 접속 대역 | `server.config.json` 의 `allowedSubnets`(예 `["10.20.30.0/24"]`) → `server.ps1 install` |
| 사용자 등록 | [계정 · 권한 · 로그인 연동](/admin/accounts.md) |
| 사내 AD · SSO 로그인 | 같은 쪽 '사내 계정으로 로그인' |
| 대화 모델 바꾸기 | 아래 6번 |
| AX-NAVI 사용 허가 | [AX-NAVI 사용 허가 · 조직 설정](/admin/platform/axnavi.md) |

### server.config.json 주요 항목

| 항목 | 뜻 |
|---|---|
| `address` · `ports` | 사용자가 칠 주소와 세 제품 포트 |
| `allowedSubnets` | 방화벽을 열 원격 대역(비우면 사내망 어디서나) |
| `platform.admin` | 플랫폼 관리자 계정(처음 설치가 비밀번호를 만들어 적음) |
| `pmsx.heap` | PMS-X 메모리(기본 `2g`) |
| `database.port` · `backupTime` · `backupKeep` | DB 포트, 매일 백업 시각(기본 02:00), 남길 백업 수(기본 14) |
| `model.chatModel` · `codeModel` · `embedModel` | 대화·IDE 코드·임베딩 모델 |
| `model.contextLength` | 사내 모델 문맥 길이(기본 32768 — 줄이지 마세요) |
| `model.gpu.baseUrl` · `model` | 사내 GPU 모델 서버(OpenAI 호환)가 있으면 그 주소와 모델 |

> **주의** 이 파일을 고친 뒤에는 `server.ps1 install` 을 다시 돌려야 반영됩니다. 설치는 플랫폼 설정 파일(`apps\platform\hnix-ax-*\config\hnix-ax.yaml`)을 새로 씁니다. 그 파일에 직접 넣는 설정(LDAP · SSO · 보안 등)은 **같은 폴더의 `hnix-ax.local.yaml`** 에 두세요. 설치가 지우지 않고, 그 값이 먼저 적용됩니다(AX Platform 0.9.0 부터).

## 6. 모델 고르기

사내망에서는 인터넷으로 모델을 받을 수 없으므로 릴리스의 `ollama-model-*` 파일로 넣습니다.

| 모델 | CPU 답 속도(짧은 답) | 메모리 | 쓰임 |
|---|---|---|---|
| `qwen2.5:3b`(기본) | 약 8초 | 약 2.5GB | 흐름 확인용 |
| `qwen3.5:2b` | 약 13초 | 약 3GB | 가벼운 대안 |
| `qwen3.5:4b` | 약 18초 | 약 4GB | 한국어 답이 가장 자연스러움. IDE 코드 모델 기본값 |

1. 모델 파일(조각 모두)을 설치 폴더의 `packages\` 에 넣습니다.
2. `server.config.json` 의 `model.chatModel` 을 바꿉니다(예 `qwen3.5:4b`).
3. `server.ps1 install` 을 다시 돌립니다. 게이트웨이 별칭 `hnix-local` · `hnix-smart` 가 새 모델로 바뀝니다.

품질이 중요하면 사내 GPU 모델 서버를 `model.gpu` 에 넣거나, 설치 전에 환경 변수 `ANTHROPIC_API_KEY` 로 조직 API 키를 줍니다. 어느 경우든 **기밀 등급 데이터는 게이트웨이가 사내 모델로만** 보냅니다. 모델 연결·별칭은 설치 뒤에도 화면에서 바꿀 수 있습니다 → [LLM 게이트웨이 설정](/admin/platform/gateway.md)

> **참고** CPU 서버에서 IDE 의 첫 질문은 1~3분 걸릴 수 있습니다(긴 지시문을 읽느라). 여러 사람이 IDE 를 쓰면 GPU 서버를 권합니다.

## 7. 보안 프로그램이 막을 때

설치 파일과 그 안의 실행 파일·스크립트는 코드 서명되어 있습니다. 그래도 사내 백신·EDR 이 막으면 보안 담당자에게 릴리스의 `AX-NAVI-IDE-<판>-보안검토.md`(설치 위치·프로세스·통신 대상·인증서 지문)와 `AX-NAVI-IDE-<판>-hashes.csv` 를 주고 **게시자(코드 서명 인증서) 기준 예외**를 요청하세요. 판이 바뀌어도 다시 등록하지 않아도 됩니다.

## 8. 제거

'앱 및 기능' › **HNIX AX 서버** › 제거 — 서비스·방화벽 규칙·백업 예약을 내리고 프로그램을 지웁니다. DB(`data\pgsql`) · 제품 데이터 · 백업 · `server.config.json` 은 남깁니다. 모두 지우려면 제거 전에 `server.ps1 uninstall -RemoveData`(백업 폴더는 그래도 남습니다).

## 관련 쪽
- [운영 — 백업 · 업그레이드 · 점검](/admin/operations.md)
- [계정 · 권한 · 로그인 연동](/admin/accounts.md)
- [개인 PC 배포 — IDE·연결](/admin/install-pc.md)
- [문제 해결](/admin/troubleshooting.md)
