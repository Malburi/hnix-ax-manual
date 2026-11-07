# 계정 · 권한 · 로그인 연동

> 세 웹 제품의 계정을 만들고, 역할(권한)을 정하고, 사내 AD·SSO 로 로그인하게 하는 법입니다. 퇴사·이동 때 정리하는 법도 함께 다룹니다. **대상**: 시스템 관리자.

## 제품별 역할

| 제품 | 역할 | 볼 수 있는 것 / 할 수 있는 것 |
|---|---|---|
| AX Platform | **시스템 관리자** | 모든 설정과 결정 |
| | **감사자** | 모든 화면·기록을 보지만 바꾸지 못함 |
| | **사용자** | 내 키·내 기록, 내 워크스페이스의 문서·에이전트, 팀 단위 사용량 |
| PMS-X | 시스템 **관리자** | 모든 프로젝트와 관리 메뉴 |
| | 프로젝트 역할 — **PM · PL · 분석가 · 개발자 · 품질 · 운영자 · 고객 · 협력사** | 멤버인 프로젝트만 보입니다. 메뉴·버튼은 역할에 따라 다릅니다 → [PMS-X 화면 구성과 역할](/user/pmsx/README.md) |
| AX-DataLake | **관리자** | 수집·온톨로지·거버넌스·사용자 |
| | **엔지니어** | 수집·작업 실행, 모든 행 조회 |
| | **분석가** | 조회만. 자기 **소속**의 행만 보고, 개인정보 열은 가려져 보입니다 |

AX-NAVI IDE 는 계정이 따로 없습니다. **플랫폼 계정으로 로그인**하고, 플랫폼 관리자가 **사용 허가**를 줘야 씁니다 → [AX-NAVI 사용 허가 · 조직 설정](/admin/platform/axnavi.md)

## 사용자 한꺼번에 등록하기 (서버판)

엑셀 명단 하나로 세 제품 계정과 PMS-X 프로젝트 멤버를 한 번에 만듭니다.

1. 설치 폴더의 `users.example.csv` 를 복사해 엑셀로 엽니다.
2. 한 줄에 한 사람씩 채웁니다.

| 칸 | 넣는 값 | 비우면 |
|---|---|---|
| 아이디 | 로그인 ID(영문·숫자·`.` `-` `_`) | 꼭 필요 |
| 이름 | 화면에 보일 이름 | 꼭 필요 |
| 이메일 | 알림용(선택) | |
| 소속 | 레이크 분석가가 볼 행의 소속 코드(예 `HD01`) | |
| 플랫폼 | `사용자` · `감사자` · `관리자` | 플랫폼 계정을 만들지 않음 |
| PMS-X | `PM` · `PL` · `분석가` · `개발자` · `품질` · `운영자` · `고객` · `협력사` | PMS-X 계정을 만들지 않음 |
| PMS-X 프로젝트 | 넣을 프로젝트 이름의 일부 | SM(운영) 프로젝트에 넣음 |
| 레이크 | `분석가` · `엔지니어` · `관리자` | 레이크 계정을 만들지 않음 |
| 비밀번호 | 처음 비밀번호 | 만들어 결과 파일에 적음(세 제품 같은 값) |

```csv
아이디,이름,이메일,소속,플랫폼,PMS-X,PMS-X 프로젝트,레이크,비밀번호
kim.dev,김개발,,HD01,사용자,개발자,,,
lee.ops,이운영,,HD01,사용자,운영자,,분석가,
park.pm,박책임,,HD02,관리자,PM,,엔지니어,
```

3. 'CSV UTF-8' 또는 그냥 'CSV' 로 저장합니다(둘 다 읽습니다).
4. 먼저 확인만 합니다.

```powershell
cd C:\HNIX-AX
powershell -ExecutionPolicy RemoteSigned -File server.ps1 users -Csv users.csv -Dry
```

5. 틀린 칸이 있으면 **아무것도 만들지 않고** 고칠 곳을 알려 줍니다. 고친 뒤 `-Dry` 없이 다시 돌립니다.
6. 결과는 `run\accounts-<시각>.csv` 에 남습니다. **만든 비밀번호가 들어 있으니** 각자에게 나눠 준 뒤 파일을 지우세요.

> **참고** 이미 있는 계정은 건드리지 않습니다(PMS-X 프로젝트 멤버만 빠졌으면 넣습니다). 같은 명단을 다시 돌려도 됩니다. 각자 첫 로그인 뒤 비밀번호를 바꾸게 안내하세요 → [로그인과 화면 공통 사용법](/user/login.md)

## 한 명씩 등록·수정하기

| 제품 | 어디서 |
|---|---|
| AX Platform | 왼쪽 메뉴 **사용자 · 워크스페이스** › 사용자 → [사용자 · 워크스페이스 · 감사 · 현장 점검](/admin/platform/system.md) |
| PMS-X | 관리 메뉴의 사용자, 프로젝트 멤버는 프로젝트 관리 → [프로젝트와 멤버](/admin/pmsx/projects.md) |
| AX-DataLake | 관리 › 사용자 → [AX-DataLake 관리 개요](/admin/datalake/README.md) |

## 사내 계정으로 로그인 (AX Platform)

AX Platform 은 사내 **AD(LDAP)** 와 **SSO(OpenID Connect — Keycloak · Entra ID · ADFS · Okta 등)** 를 지원합니다. 처음 로그인하는 사람은 계정이 저절로 만들어져 기본 워크스페이스에 들어가고, 정해 둔 그룹의 구성원은 시스템 관리자가 됩니다. 로컬 계정(비밀번호)은 그대로 함께 쓸 수 있습니다.

설정은 플랫폼 설정 폴더(서버판: `C:\HNIX-AX\apps\platform\hnix-ax-*\config\`)의 **`hnix-ax.local.yaml`** 에 적습니다. 파일이 없으면 새로 만듭니다. 서버판 설치(`server.ps1 install`)는 `hnix-ax.yaml` 을 다시 쓰지만 `hnix-ax.local.yaml` 은 그대로 두고, 그 값이 먼저 적용됩니다.

### AD(LDAP)

```yaml
auth:
  ldap:
    enabled: true
    url: ldaps://ad.corp.local                 # ldap:// 도 되지만 ldaps 권장
    baseDn: DC=corp,DC=local
    userFilter: (sAMAccountName={0})           # {0} 자리에 로그인 ID
    bindDn: CN=svc-hnixax,OU=Service,DC=corp,DC=local
    bindPassword: ${env:HNIX_AX_LDAP_PASSWORD} # 비밀번호는 환경 변수로
    adminGroups: [CN=AX-Admins,OU=Groups,DC=corp,DC=local]
```

- 서비스 계정으로 사용자를 찾고, 사용자 본인 비밀번호로 확인합니다. 빈 비밀번호는 거절합니다.
- `adminGroups` 구성원은 처음 로그인할 때 시스템 관리자가 됩니다. 그룹에서 빠져도 자동으로 강등하지 않으니, 권한을 거둘 때는 화면에서 역할을 바꾸세요.
- 디렉터리가 응답하지 않으면 잠시 로그인이 안 되지만 실패 횟수에는 넣지 않습니다.

### SSO(OpenID Connect)

```yaml
auth:
  oidc:
    enabled: true
    issuer: https://sso.corp.local/realms/hnix     # Keycloak 은 /realms/<이름> 까지
    clientId: hnix-ax
    clientSecret: ${env:HNIX_AX_OIDC_SECRET}       # 기밀 클라이언트면
    redirectUri: https://ax.corp.local/api/v1/auth/oidc/callback   # 리버스 프록시 뒤면 꼭
    loginClaim: preferred_username                 # 로그인 ID 로 쓸 값(AD 계정과 같으면 같은 사람)
    groupsClaim: groups
    adminGroups: [ito-admin]
    autoCreate: true
    label: 사내 SSO 로그인                            # 로그인 화면 버튼 글자
```

SSO 쪽(IdP)에는 이 플랫폼을 클라이언트로 등록하고 돌아올 주소(`.../api/v1/auth/oidc/callback`)를 넣습니다.

### 반영과 확인

1. 비밀번호 환경 변수(`HNIX_AX_LDAP_PASSWORD` 등)를 서버의 **시스템 환경 변수**로 넣습니다.
2. 플랫폼 서비스를 다시 시작합니다(`server.ps1 stop` → `server.ps1 start`).
3. 로그인 화면에서 사내 계정으로 로그인해 봅니다. SSO 를 켰으면 **사내 SSO 로그인** 버튼이 보입니다.
4. 관리자 그룹 사람이 **시스템 관리자**로 들어오는지 사용자 목록에서 확인합니다.

> **PMS-X** 는 AD 비밀번호로 로그인하게 할 수 있지만 계정은 먼저 등록해 둬야 합니다(일괄 등록 명단에 넣으세요). **AX-DataLake** 는 로컬 계정만 씁니다.

## 잠김·비밀번호 분실

| 제품 | 잠김 | 비밀번호 분실 |
|---|---|---|
| AX Platform | 5번 틀리면 15분 잠김(저절로 풀림) | 관리자가 사용자 화면에서 새 비밀번호를 정해 줍니다 |
| PMS-X | 5번 틀리면 잠김 — 관리자가 사용자 관리에서 잠금 해제 | 관리자가 비밀번호 초기화 |
| AX-DataLake | — | 관리자가 사용자 화면에서 새 비밀번호 |

## 퇴사·이동 때 정리

| 할 일 | 어디서 |
|---|---|
| 플랫폼 계정 **사용 중지** | 사용자 · 워크스페이스 › 사용자 — 기록은 남고 로그인만 막힙니다 |
| AX-NAVI 좌석 회수 | AX-NAVI 관리 › 사용 허가 — 회수하면 그 사람의 모든 기기와 연결 키가 바로 꺼집니다 |
| 발급한 게이트웨이 키 | 회수·사용 중지 때 함께 막히지만, 외부 도구에 준 키가 있으면 LLM 게이트웨이 › 내 키 목록(관리자는 전체)에서 확인 |
| PMS-X 프로젝트 멤버 철수일, 계정 잠금 | PMS-X 프로젝트 멤버·사용자 관리 |
| 레이크 계정 | AX-DataLake 관리 › 사용자 |
| 워크스페이스 구성원 정리 | 사용자 · 워크스페이스 › 워크스페이스 |

## 관련 쪽
- [사용자 · 워크스페이스 · 감사 · 현장 점검](/admin/platform/system.md)
- [AX-NAVI 사용 허가 · 조직 설정](/admin/platform/axnavi.md)
- [프로젝트와 멤버(PMS-X)](/admin/pmsx/projects.md)
- [거버넌스 — 권한 · 가림 · 행 제한(레이크)](/admin/datalake/governance.md)
