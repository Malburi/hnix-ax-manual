# 운영 — 백업 · 업그레이드 · 점검

> 서버판으로 설치한 HNIX AX 를 매일 돌보는 법입니다 — 서비스 다루기, 상태 점검, 백업과 되살리기, 판 올리기, 로그. **대상**: 시스템 관리자(서버 관리자 권한).

아래 명령은 모두 설치 폴더(기본 `C:\HNIX-AX`)의 관리자 PowerShell 에서 실행합니다.

```powershell
cd C:\HNIX-AX
powershell -ExecutionPolicy RemoteSigned -File server.ps1 <동작>
```

## 서비스 다루기

| 동작 | 하는 일 |
|---|---|
| `status` | 서비스 상태·응답·접속 주소를 한 화면에 |
| `stop` | 모두 멈춤 |
| `start` | 모두 시작(PostgreSQL 먼저). 서비스는 부팅 때 저절로 시작합니다 |
| `install` | 설치·설정 반영(다시 돌려도 됨 — 빠진 것만 채움) |
| `backup` | DB 백업을 지금 한 번 |
| `users -Csv <파일> [-Dry]` | 사용자 일괄 등록 → [계정](/admin/accounts.md) |
| `uninstall [-RemoveData]` | 서비스·방화벽 규칙 내림(데이터는 남김, `-RemoveData` 면 지움) |

Windows 서비스 이름: `hnix-ax`(플랫폼) · `ax-datalake` · `pmsx` · `hnix-ax-ollama` · `hnix-ax-postgresql`. 서비스 관리자(services.msc)에서도 보입니다.

## 상태 점검

| 무엇을 | 어디서 | 얼마나 자주 |
|---|---|---|
| 세 제품이 떠 있는가 | `server.ps1 status` | 매일 |
| 제품끼리 잘 이어졌는가 | 플랫폼 **현장 연결 점검** › **다시 점검**(기록만 읽음) / **연결 시험 포함 점검**(실제로 붙어 봄) | 매주, 설정을 바꾼 뒤 |
| 모델·MCP 서버 연결 문제 | 플랫폼 머리띠 **알림**, **LLM 게이트웨이 › 개요**의 모델 연결 상태 | 매일 |
| 전체 흐름 자동 점검 | `tools\node\node.exe scripts\smoke.mjs` — 21단계(시험 기록이 서버에 남습니다) | 판을 올린 뒤 |
| 플랫폼 준비 상태(분산기용) | `http://<서버>:8700/readyz` — DB 까지 닿아야 200 | 감시 도구에 등록 |

## 백업

| 무엇 | 언제·어디 |
|---|---|
| DB(네 개) | 매일 02:00 자동(예약 작업 'HNIX AX PostgreSQL 백업'), `backups\postgresql\<날짜-시각>\`, 최근 14개. 바꾸려면 `server.config.json` 의 `database.backupTime` · `backupKeep` 후 `install` |
| 시크릿 열쇠 | 같은 백업 폴더에 `*.master.key` · `secrets.json` 이 함께 들어갑니다 — 이 열쇠가 없으면 저장된 모델 키·연결 비밀번호를 풀 수 없습니다 |
| 파일 데이터 | DB 에 들지 않는 파일 — PMS-X 첨부·캡처 `apps\pmsx\pmsx-*\data-demo`, 레이크 데이터 `apps\datalake\ax-datalake-*\data\lake`. 서비스를 멈추고 폴더째 복사 |
| 설정 | `server.config.json`, `run\secrets.json`, 플랫폼 `config\hnix-ax.local.yaml`(있으면) |

> **주의** 백업은 서버 밖 저장소에 한 번 더 복사하세요. 열쇠가 들어 있으니 DB 와 같은 수준으로 보관합니다(접근 권한 제한).

**지금 한 번 백업**: `server.ps1 backup` — 판 올리기·큰 설정 변경 전에 꼭.

## 되살리기

한 제품의 DB 만 되살릴 때:

1. 그 제품 서비스를 멈춥니다(서비스 관리자에서 해당 서비스만, 또는 `server.ps1 stop`).
2. 백업 폴더의 덤프로 되살립니다.

```powershell
$env:PGPASSWORD = '<server.config.json 의 database.password>'
apps\pgsql\bin\pg_restore -h 127.0.0.1 -p 5432 -U postgres --clean --if-exists -d pmsx backups\postgresql\20261106-0200\pmsx.dump
```

| DB 이름 | 제품 |
|---|---|
| `hnix_ax` | AX Platform |
| `pmsx` | PMS-X |
| `axdl` · `axdl_lake` | AX-DataLake(관리 정보 · 레이크 데이터) |

3. 서비스를 시작합니다.

**서버를 새로 깔아 되살릴 때**: 새 서버에 같은 판을 설치 → `server.ps1 stop` → 네 DB 를 되살림 → 같은 백업의 `platform.master.key` · `datalake.master.key` 를 각 제품의 `data\master.key` 로 넣음 → 파일 데이터 폴더를 복사 → `server.ps1 start`.

## 판 올리기

1. `server.ps1 backup` 으로 지금 백업합니다.
2. 새 `HNIX-AX-Server-Setup-<날짜>.exe` 를 **같은 위치**에 덮어 설치합니다. `server.config.json` 과 DB(`data\pgsql`)는 그대로 둡니다.
3. 제품 판이 바뀌었으면(예: PMS-X 1.3.6 → 1.3.7) 설치가 새 판 폴더를 만듭니다. `server.ps1 stop` 뒤 옛 판 폴더의 파일 데이터(레이크 `data`, PMS-X `data-demo`)를 새 판 폴더로 옮기고 `server.ps1 install` 을 다시 돌립니다.
4. DB 구조는 각 제품이 새 판으로 처음 뜰 때 스스로 올립니다.
5. 플랫폼 **현장 연결 점검**과 자동 점검(`smoke.mjs`)으로 확인합니다.
6. 개인 PC 는 새 `HNIX-AX-PC-Setup` 을 배포합니다 → [개인 PC 배포](/admin/install-pc.md)

> **참고** 판이 바뀌면 사용자 브라우저에 옛 화면이 남아 있을 수 있습니다. 플랫폼은 옛 화면 파일을 못 받으면 저절로 새로 읽습니다. 이상하면 Ctrl+F5 를 안내하세요.

## 로그

| 제품 | 위치 |
|---|---|
| AX Platform | `apps\platform\hnix-ax-*\logs` |
| AX-DataLake | `apps\datalake\ax-datalake-*\logs` |
| PMS-X | `apps\pmsx\pmsx-*\logs` |
| PostgreSQL | `data\pgsql\log` |

화면에서 보는 기록:

| 기록 | 어디서 |
|---|---|
| 누가 무엇을 바꿨나 | 플랫폼 **감사 로그**, PMS-X 관리 › 감사 로그, 레이크 감사 기록 |
| 모델 호출 하나하나 | 플랫폼 **LLM 게이트웨이 › 요청 로그**(본문은 저장하지 않음) |
| 도구 호출 | 플랫폼 **MCP 허브 › 호출 기록** |
| 에이전트·흐름 실행 | **에이전트**·**자동화 흐름**의 실행 기록과 실행 디버거 |

## 설정을 바꿀 때

| 바꿀 것 | 어디서 | 반영 |
|---|---|---|
| 주소·포트·접속 대역·모델·DB 백업 시각 | `server.config.json` | `server.ps1 install` |
| LDAP·SSO·보안 헤더·음성 상한 같은 플랫폼 고급 설정 | 플랫폼 `config\hnix-ax.local.yaml` | 플랫폼 서비스 다시 시작 |
| 모델 연결·별칭·라우트·예산·개인정보 규칙 | 플랫폼 화면 **LLM 게이트웨이** | 바로 |
| 도구 정책·승인 | 플랫폼 화면 **MCP 허브** | 바로 |
| PMS-X 기준 정보·AI 설정 | PMS-X 관리 화면 | 바로 |

## 관련 쪽
- [서버 설치 — 서버판 꾸러미](/admin/install-server.md)
- [문제 해결](/admin/troubleshooting.md)
- [사용자 · 워크스페이스 · 감사 · 현장 점검](/admin/platform/system.md)
