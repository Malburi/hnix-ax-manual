# 시스템 — AI · 연동 · 알림 · 감사

> PMS-X 서버 설정으로 AI 기능을 켜고, 메일·메신저 알림과 메일·경보 접수를 연결하며, 감사 로그와 라이선스를 관리합니다. **대상**: 시스템 관리자(서버 설정·라이선스), PM·PMO(감사 로그·시스템 정보 조회). **메뉴**: 관리 › 라이선스·시스템 정보 · 감사 로그 / 서버의 `config\application-prod.yml`.

화면에서 바꾸는 것과 서버 설정으로 바꾸는 것이 나뉩니다.

| 항목 | 바꾸는 곳 |
|---|---|
| 라이선스 키 | 화면 — 관리 › 라이선스·시스템 정보 (또는 설정 파일) |
| 감사 로그 조회 | 화면 — 관리 › 감사 로그 |
| 내 알림 받는 곳·받을 일 | 화면 — 관리 › 알림 설정 (사용자 각자) |
| AI 켜기 · 게이트웨이 주소 | 서버 설정 `pmsx.ai.*` / 환경 변수 `PMSX_AI_*` |
| 메일 발송 · 메신저 웹훅 | 서버 설정 `spring.mail.*` · `pmsx.notification.webhook-url` |
| 메일 접수 키 | 서버 설정 `PMSX_SM_INBOUND_MAIL_KEY` |
| LDAP·AD 로그인 | 서버 설정 `pmsx.auth.ldap.*` — [계정 · 권한 · 로그인 연동](/admin/accounts.md) |

서버 설정 파일은 설치 폴더의 `config\application-prod.yml`이며, 값은 환경 변수(`PMSX_…`)로도 줄 수 있습니다. 바꾼 뒤에는 PMS-X 서비스를 다시 시작해야 반영됩니다([운영 — 백업 · 업그레이드 · 점검](/admin/operations.md)).

## 라이선스·시스템 정보

<figure><img src="img/pmsx/a-system-info.png" alt="라이선스·시스템 정보 — 버전·빌드 일시·실행 프로필·데이터베이스·Java·사용자 수, 라이선스 상태와 라이선스 키 등록 칸"><figcaption>관리 › 라이선스·시스템 정보</figcaption></figure>

| 영역 | 내용 |
|---|---|
| **시스템 정보** | **버전 · 빌드 일시 · 실행 프로필 · 데이터베이스 · Java · 사용자**(활성 n명 / 전체 n명) |
| **라이선스** | **유효/무효**, **고객사 · 발급일 · 만료일**(n일 남음 / 만료됨) · **최대 사용자** · **기능**. 상세는 시스템 관리자만 봅니다 |
| **라이선스 키 등록** | 시스템 관리자만 |

**라이선스 키 등록하기**

1. 발급받은 키 전체(`payload.서명` 형식)를 **라이선스 키** 칸에 붙여 넣습니다.
2. **등록**을 누릅니다. 서버가 오프라인으로 서명을 검증합니다.

| 결과 메시지 | 뜻 |
|---|---|
| 라이선스를 등록했습니다. | 정상 |
| 키는 등록했지만 유효하지 않은 라이선스입니다. 사유를 확인하세요. | 만료 등. 라이선스 영역의 사유 확인 |
| 서명이 올바르지 않은 키입니다. | 키가 잘렸거나 다른 제품 키 |

> **주의** 라이선스가 없거나 만료되면 **시스템 관리자 외에는 로그인할 수 없습니다**. 로그인 화면과 화면 상단에 "라이선스가 유효하지 않습니다." 배너가 뜨고, 시스템 관리자에게는 **라이선스 관리** 링크가 보입니다. 만료일 전에 갱신하세요.

## AI 설정

PMS-X의 AI 기능(요청 분류·배정 추천, 지식 문서 초안, 버튼·함수 설명 초안)은 **기본으로 꺼져 있습니다**. 켜면 HNIX AX Platform의 LLM 게이트웨이(OpenAI 호환)로만 호출하고, 끈 상태에서는 외부 호출이 없습니다. 사용자 화면에서 달라지는 점은 [AI 보조 기능](/user/pmsx/ai.md)을 보세요.

**켜는 조건**

1. AX Platform이 설치되어 있고 PMS-X 서버에서 게이트웨이 주소로 접속할 수 있어야 합니다.
2. AX Platform에서 PMS-X용 게이트웨이 키를 발급받습니다([LLM 게이트웨이 설정](/admin/platform/gateway.md)).
3. 쓸 모델 별칭이 게이트웨이에 있어야 합니다(기본 `hnix-smart`).

**설정**

```yaml
# config\application-prod.yml
pmsx:
  ai:
    enabled: true                       # 기본 false
    base-url: http://ax-platform:8700/v1  # AX Platform 게이트웨이 주소 (예)
    api-key: ${PMSX_AI_API_KEY}         # 키는 환경 변수로 — 파일에 적지 않기
    model: hnix-smart                   # 모델 별칭
    data-class: internal                # public | internal | confidential | restricted
```

| 환경 변수 | 설정 키 | 기본값 |
|---|---|---|
| `PMSX_AI_ENABLED` | `pmsx.ai.enabled` | `false` |
| `PMSX_AI_BASE_URL` | `pmsx.ai.base-url` | (없음) |
| `PMSX_AI_API_KEY` | `pmsx.ai.api-key` | (없음) |
| `PMSX_AI_MODEL` | `pmsx.ai.model` | `hnix-smart` |
| `PMSX_AI_DATA_CLASS` | `pmsx.ai.data-class` | `internal` |

- **data-class**를 `restricted`로 두면 게이트웨이가 사내(로컬) 모델만 씁니다. 고객 데이터 반출이 엄격한 현장은 `restricted`를 권합니다.
- 응답 대기 시간은 60초입니다. 게이트웨이가 응답하지 않으면 분류 추천과 설명 초안은 규칙 기반 결과로 대신합니다.
- 서비스를 다시 시작한 뒤, 서비스 요청 화면에 **AI 분류 추천** 버튼이 보이면 켜진 것입니다.

> **주의** 게이트웨이 키를 설정 파일이나 문서에 평문으로 남기지 마세요. 환경 변수로 주고, 키가 새면 AX Platform에서 폐기하고 다시 발급합니다.

> **참고** **라이선스·시스템 정보** 화면에는 AI 켜짐 여부가 표시되지 않습니다. 위의 버튼 이름으로 확인합니다.

## 알림 — 메일·메신저

화면 알림(종 모양)은 늘 쌓입니다. 메일과 메신저는 서버 설정이 있어야 나가고, 사용자가 **관리 › 알림 설정**에서 **메일**·**메신저 웹훅**을 켠 사람에게만 갑니다.

| 받는 곳 | 서버 설정 |
|---|---|
| 메일 | `spring.mail.host` · `port` · `username` · `password`(SMTP), 보내는 주소 `PMSX_NOTIFY_MAIL_FROM`. 설정이 없으면 서버 로그에만 남습니다. 사용자의 **이메일**이 등록되어 있어야 합니다 |
| 메신저 웹훅 | `PMSX_NOTIFY_WEBHOOK_URL` — 사내 메신저(Teams·Slack 호환) 수신 웹훅 주소 |

알림이 생기는 일: 작업 배정 · 검토 요청 · 승인 · 반려 · 기한 임박(이틀 전) · 기한 지남 · 결함 배정 · 이슈 에스컬레이션 · 작업일지 반려 · 언급 · 위키 수정, 그리고 SM의 처리 기한 임박·초과, 운영 자산 만료(30·7·1일 전).

## 연동 — 메일 접수와 경보 접수

### 메일로 서비스 요청 접수

메일 게이트웨이가 받은 메일을 PMS-X 서비스 요청으로 만듭니다.

1. 서버에 접수 키를 정합니다: 환경 변수 `PMSX_SM_INBOUND_MAIL_KEY`. 비워 두면 메일 접수는 꺼져 있습니다.
2. 메일 게이트웨이가 `POST /api/v1/sm/inbound-mail`로 보내게 합니다. 헤더 `X-PMSX-KEY`에 접수 키를 넣습니다.

| 본문 필드 | 내용 |
|---|---|
| `projectCode` | 프로젝트 ID 또는 SM 프로젝트의 시스템 코드(예: `HR`) |
| `from` · `subject` · `body` | 보낸 사람·제목·본문 |
| `messageId` | 같은 메일이 두 번 오면 한 번만 등록 |

- 보낸 주소가 PMS-X 사용자 이메일과 같으면 그 사용자가 요청자가 됩니다.
- 접수된 요청은 목록에 ✉ 표시와 채널 "메일"로 보입니다.

### 모니터링 경보 접수

<figure><img src="img/pmsx/a-system-alerts.png" alt="장애 화면 위쪽의 경보 목록 — 심각도·횟수와 연결된 장애"><figcaption>운영 (SM) › 장애 화면 위의 경보 목록</figcaption></figure>

모니터링 도구(Zabbix, Prometheus Alertmanager 등)의 경보를 장애나 서비스 요청으로 만듭니다.

1. PMS-X에 경보용 **서비스 계정**을 만들고, SM 프로젝트에 **운영 담당**(또는 PM·PL)으로 참여시킵니다. 별도 API 키는 없습니다.
2. 모니터링 도구가 그 계정으로 로그인해 `POST /api/v1/projects/{프로젝트ID}/alerts`(한 건) 또는 `.../alerts/batch`(여러 건)로 보내게 합니다.

| 필드 | 내용 |
|---|---|
| `source` · `fingerprint` | 출처와 경보 지문. 같은 (프로젝트·출처·지문)이 열려 있으면 새로 만들지 않고 횟수만 올립니다 |
| `severity` | `critical` 장애 1등급 · `major` 장애 2등급 · `minor` 요청 P2 · `warning` 요청 P3 · `info` 기록만 |
| `status` | 해소(`resolved`)면 장애 복구 시각·타임라인, 요청 내부 코멘트로 남김 |
| `title` · `description` · `startedAt` · `systemCode` · `labels` | 제목·설명·발생 시각·시스템 코드·라벨 |

> **참고** 종료와 원인 분석(RCA)은 사람이 합니다. 고객 ITSM 쪽과의 연동은 AX Platform에서 다룹니다 — [고객 ITSM · 업무 시스템 · 알림 연동](/admin/platform/integrations.md).

## 감사 로그

<figure><img src="img/pmsx/a-system-audit.png" alt="감사 로그 — 시작일·종료일·행위·검색 조건과 일시·사용자·행위·대상·상세·IP 목록"><figcaption>관리 › 감사 로그 — 개인정보 접근 추적</figcaption></figure>

1. **관리 › 감사 로그**를 엽니다(시스템 관리자·PMO·PM).
2. **시작일 · 종료일 · 행위**와 **대상·상세·아이디 검색**을 넣고 **조회**를 누릅니다.
3. **일시 · 사용자 · 행위 · 대상 · 상세 · IP**를 봅니다.
4. **엑셀 내보내기**로 보관용 파일을 받습니다.

| 행위 | 기록되는 때 |
|---|---|
| 로그인 · 로그인 실패 · 로그아웃 | 인증(상세에 LOCAL/LDAP) |
| 화면 접근 | 화면을 열 때(경로) |
| 소스 조회 | As-Is 뷰어에서 소스를 볼 때 |
| 다운로드 · 업로드 | 산출물·엑셀·첨부·수집 결과 |
| 등록 · 수정 · 삭제 | 데이터 변경 |
| 라이선스 | 라이선스 등록 |

## 관련 쪽

- [PMS-X 관리 개요](/admin/pmsx/README.md)
- [AI 보조 기능 (사용자)](/user/pmsx/ai.md)
- [LLM 게이트웨이 설정](/admin/platform/gateway.md) · [고객 ITSM · 업무 시스템 · 알림 연동](/admin/platform/integrations.md)
- [서버 설치 — 서버판 꾸러미](/admin/install-server.md) · [계정 · 권한 · 로그인 연동](/admin/accounts.md)
