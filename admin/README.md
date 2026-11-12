# 관리자 매뉴얼 안내

> HNIX AX 를 설치하고, 계정·권한·연동·정책을 정하고, 매일 운영하는 사람을 위한 매뉴얼입니다. **대상**: 시스템 관리자, 감사자(보기만), 제품별 관리자(PMS-X 관리자, AX-DataLake 관리자).

## 관리자는 누구인가

제품마다 관리자 역할이 따로 있습니다. 한 사람이 여러 역할을 맡을 수 있습니다.

| 제품 | 관리자 역할 | 할 수 있는 일 |
|---|---|---|
| AX Platform | **시스템 관리자** | 모델 연결·정책·에이전트·창구·연동·사용자·승인 결정 등 모든 설정 |
| AX Platform | **감사자** | 관리 화면을 모두 볼 수 있지만 바꾸지 못합니다(사용량·감사 로그 점검용) |
| PMS-X | **관리자**(시스템) | 프로젝트·사용자·기준 정보·AI 설정·라이선스 |
| PMS-X | 프로젝트 **PM** | 자기 프로젝트의 멤버·인력 편성·작업 배분 |
| AX-DataLake | **관리자** | 수집·온톨로지·거버넌스·사용자 |
| AX-DataLake | **엔지니어** | 수집·작업 실행(관리 설정은 못 함) |

## 처음 설치부터 운영까지 순서

| # | 할 일 | 쪽 |
|---|---|---|
| 1 | 서버 한 대에 네 제품 설치 | [서버 설치 — 서버판 꾸러미](/admin/install-server.md) |
| 2 | 관리자 비밀번호 바꾸기, 접속 대역 정하기 | 같은 쪽 '처음 할 설정' |
| 3 | 사용자 일괄 등록, 사내 AD·SSO 로그인 | [계정 · 권한 · 로그인 연동](/admin/accounts.md) |
| 4 | 모델 정하기(사내 CPU·GPU 서버·외부 API) | [LLM 게이트웨이 설정](/admin/platform/gateway.md) |
| 5 | 도구 정책·승인 규칙 | [MCP 허브 · 정책 · 승인](/admin/platform/hub.md) |
| 6 | 개발자 PC 에 IDE 배포, 사용 허가 | [개인 PC 배포](/admin/install-pc.md) · [AX-NAVI 사용 허가](/admin/platform/axnavi.md) |
| 7 | 문서함·현업 창구·에이전트 준비 | [문서함](/admin/platform/docs.md) · [현업 창구](/admin/platform/desk.md) · [에이전트](/admin/platform/agents.md) |
| 8 | 고객 ITSM·모니터링·업무 시스템 연동 | [연동](/admin/platform/integrations.md) |
| 9 | PMS-X 프로젝트·기준 정보 | [PMS-X 관리 개요](/admin/pmsx/README.md) |
| 10 | AX-DataLake 수집·거버넌스 | [AX-DataLake 관리 개요](/admin/datalake/README.md) |
| 11 | 연결 상태 한 번에 확인 | [사용자 · 워크스페이스 · 감사 · 현장 점검](/admin/platform/system.md) |
| 12 | 백업·판 올리기·장애 대응 | [운영](/admin/operations.md) · [문제 해결](/admin/troubleshooting.md) |

## 매일·매주 할 일

| 언제 | 할 일 | 어디서 |
|---|---|---|
| 매일 | 승인함 확인(대기 건수 배지) | 플랫폼 **승인함** |
| 매일 | 알림 종 — 모델·MCP 서버 연결 문제, 창구 접수 | 플랫폼 머리띠 **알림** |
| 매일 | 백업이 돌았는지 | `server.ps1 status`, 백업 폴더 → [운영](/admin/operations.md) |
| 매주 | 현업 창구 '매뉴얼 보강 대기' 처리 | 플랫폼 **현업 창구** |
| 매주 | 사용량·비용·정책 차단 추이 | 플랫폼 **AI 사용 현황** |
| 매월 | 감사 로그 점검, 퇴사자·이동자 계정 정리, AX-NAVI 좌석 회수 | 플랫폼 **감사 로그 · 사용자 · AX-NAVI 관리**, PMS-X·레이크 사용자 |
| 판이 나올 때 | 백업 → 새 설치 파일 덮어 설치 | [운영 — 판 올리기](/admin/operations.md) |

## 보안 원칙

- **설정 파일은 관리자만 읽게** — `server.config.json`, `run\secrets.json`, 플랫폼 `config\` 폴더에는 비밀번호·키가 들어 있습니다. 설치가 관리자·SYSTEM 만 읽게 잠급니다. 복사본을 메일·메신저로 보내지 마세요.
- **백업에는 시크릿을 푸는 열쇠(`*.master.key`)가 함께 들어 있습니다.** 백업 사본은 DB 와 같은 수준으로 보관합니다.
- **시연 계정 비밀번호는 바꿉니다.** 설치에는 시연 계정(`admin`, `op.seo` 등)이 들어 있습니다. 사내망에 열기 전에 모두 바꾸세요 → [서버 설치 — 처음 할 설정](/admin/install-server.md)
- **기밀 데이터는 사내 모델로만.** 게이트웨이의 데이터 등급 규칙을 바꿀 때는 보안 담당자와 함께 정하세요 → [LLM 게이트웨이 설정](/admin/platform/gateway.md)
- 개인 Claude 구독은 각자 자기 PC 의 Claude Code 로만 씁니다. 서버가 구독 자격을 대신 쓰거나 중계하지 않습니다.
