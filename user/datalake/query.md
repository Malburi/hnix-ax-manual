# 질의 · AI 질문

> SQL 작업창에서 레이크 테이블을 SQL 로 조회하거나, 말로 물어 AI 가 SQL 을 쓰게 합니다. 결과는 CSV 로 받습니다. **대상**: 분석가, 데이터 엔지니어. **메뉴**: 데이터 › SQL 작업창.

## 화면 구성

<figure><img src="img/datalake/u-sql.png" alt="SQL 작업창 — 위에 '말로 물어보세요' 입력칸과 AI 에게 묻기 버튼, 가운데 조회 버튼·예시 버튼·실행 기록·실행(Ctrl+Enter)과 SQL 입력칸, 아래 결과 2행과 '가림·행 제한 적용됨' 꼬리표, CSV 받기"><figcaption>분석가가 <code>hr.staff</code> 를 조회한 결과. 이름·주민등록번호·전화가 가려지고 HD01 행만 나옵니다.</figcaption></figure>

| 영역 | 하는 일 |
|---|---|
| AI 질문 칸 | `말로 물어보세요 — 예: 지난달 계열사별 수주 금액 합계` 와 **AI 에게 묻기**. 관리자가 AI 질문을 켰을 때만 보입니다 |
| **조회** / **작업 SQL** | 조회는 누구나, 작업 SQL 은 엔지니어·관리자만 보입니다 |
| 예시 버튼 | **시점 조회**, **JSON 열 꺼내기**, **시간대별 집계** — 누르면 입력칸에 예시 SQL 이 들어갑니다 |
| **실행 기록** | 오른쪽에 내 실행 기록 100건이 열립니다 |
| **실행 (Ctrl+Enter)** | 입력칸의 SQL 을 실행합니다 |
| 결과 | 행 수(`잘림 — 더 있습니다`), 걸린 시간, `가림·행 제한 적용됨` 꼬리표, **CSV 받기** |

## SQL 로 조회하기

1. 왼쪽 메뉴 **SQL 작업창**을 누릅니다. 카탈로그의 **SQL 로 열기**로 들어와도 됩니다.
2. **조회**가 골라져 있는지 확인합니다.
3. 입력칸에 SQL 을 씁니다. 테이블은 `스키마.테이블` 로 씁니다.

   ```sql
   SELECT severity, count(*) AS 건수
   FROM ito.incident
   WHERE opened_at >= now() - INTERVAL 30 DAY
   GROUP BY 1
   ORDER BY 1
   ```

4. **실행 (Ctrl+Enter)** 를 누르거나 `Ctrl+Enter` 를 칩니다.
5. 결과 표를 봅니다. 가린 열·행 제한이 걸렸으면 `가림·행 제한 적용됨` 이 붙습니다.
6. 파일로 받으려면 **CSV 받기** — `result.csv` 로 저장됩니다.

> **참고** 입력칸의 SQL 은 이 브라우저에 저장돼, 다시 열면 그대로 남아 있습니다.

### 조회에서 지켜지는 규칙

| 규칙 | 어기면 |
|---|---|
| `SELECT` **한 문장**만 | 거부됩니다 |
| 레이크 테이블·뷰만 읽음 | 파일 읽기·외부 DB 함수는 거부됩니다 |
| 조회 권한이 있는 테이블만 | `거부` 로 남습니다 |
| 가림·행 제한 | 별칭·`WITH`·하위 조회·`JOIN`·시점 조회 어디서 불러도 똑같이 걸립니다 |
| 결과 행 수 상한(기본 1만 행) | 넘으면 `잘림 — 더 있습니다` |

오류가 나면 결과 자리에 빨간 칸으로 원인이 나옵니다(예 `Binder Error: Referenced column "org" not found`). 열 이름은 카탈로그 **열** 탭에서 확인합니다.

### 자주 쓰는 SQL

| 하고 싶은 것 | 예 |
|---|---|
| 어제 이 시각의 모습(시점 조회) | `SELECT * FROM ito.incident AT (TIMESTAMP => now() - INTERVAL 1 DAY) LIMIT 100` |
| 특정 시점 번호의 모습 | `SELECT * FROM ito.incident AT (VERSION => 12)` |
| JSON 열에서 값 꺼내기 | `SELECT json_extract_string(payload, '$.user.id') AS user_id, count(*) FROM ops.alert_events GROUP BY 1` |
| 수집 시각별 건수(실시간 수집 테이블) | `SELECT date_trunc('hour', _ingested_at) AS 시각, count(*) FROM ops.alert_events GROUP BY 1 ORDER BY 1` |
| 문서 조각 찾기 | `SELECT title, heading, text FROM docs.ops_manual WHERE text ILIKE '%급여 배치%'` |

## 실행 기록 다시 쓰기

<figure><img src="img/datalake/u-sql-history.png" alt="오른쪽에 열린 내 실행 기록 — 성공·거부·오류 꼬리표, 시각·조회/작업·걸린 시간, SQL 본문"><figcaption>내 실행 기록. 누르면 그 SQL 이 입력칸에 들어갑니다.</figcaption></figure>

1. **실행 기록**을 누릅니다.
2. 목록에서 **성공 · 거부 · 오류**, 시각, 조회/작업, 걸린 시간, SQL 을 봅니다. 오류였으면 오류 내용도 보입니다.
3. 다시 쓸 줄을 누르면 입력칸에 들어가고 기록 창이 닫힙니다.

한눈에 보기의 **내 최근 조회**에서 눌러도 같습니다.

## AI 에게 묻기

말로 물으면 AI 가 SQL 을 쓰고 실행해 결과와 SQL 을 함께 보여 줍니다.

<figure><img src="img/datalake/u-sql-ask.png" alt="AI 에게 묻기 — '상태별 주문 건수와 금액 합계' 질문, 설명 줄과 hnix-local 모델 꼬리표, 작업창에 들어간 SQL 과 결과 4행, 가림·행 제한 적용됨"><figcaption>AI 질문의 예(이전 판 화면). 설명 줄에 쓴 모델이 보이고, 만든 SQL 은 아래 작업창에 들어갑니다.</figcaption></figure>

1. 위 칸에 질문을 씁니다. 예: `장애 등급별 건수`, `지난달 계열사별 수주 금액 합계`.
2. **AI 에게 묻기**를 누르거나 `Enter`.
3. 잠시 뒤 설명 줄이 나옵니다.

   | 설명 줄의 표시 | 뜻 |
   |---|---|
   | 모델 이름(예 `hnix-local`) | 이번에 쓴 모델 |
   | `기밀 — 사내 모델만` | 기밀 등급 테이블이 섞여 사내 모델만 썼습니다 |
   | `한 번 고쳐 씀` | 처음 SQL 이 오류라 AI 가 한 번 고쳤습니다 |

4. 만든 SQL 은 아래 작업창에 들어가 있습니다. **확인하고**, 필요하면 고쳐 **실행**합니다.

> **참고** AI 에는 **내가 볼 수 있는 테이블의 구조·설명만** 보냅니다(질문과 가까운 테이블 8개까지). 데이터 값은 보내지 않습니다.

> **주의** AI 가 만든 SQL 도 사람이 쓴 SQL 과 똑같이 검사를 거칩니다. 권한 밖 테이블·가린 값은 보지 못하고, 쓰기 SQL 은 막힙니다. 숫자는 반드시 SQL 을 읽어 보고 맞는지 확인하세요. 질문은 조회 이력에 함께 남습니다.

AI 에게 묻기 칸이 보이지 않으면 관리자가 AI 질문을 켜지 않은 것입니다.

## 작업 SQL — 엔지니어·관리자

데이터 엔지니어와 관리자는 **작업 SQL** 로 테이블·뷰를 만들고 고칩니다.

1. **작업 SQL** 을 고릅니다. `테이블·뷰 만들기, 고치기, 지우기 — 여러 문장을 차례로 실행합니다` 가 보입니다.
2. SQL 을 씁니다.

   ```sql
   CREATE OR REPLACE TABLE mart.incident_daily AS
   SELECT date_trunc('day', opened_at) AS 일자, severity, count(*) AS 건수
   FROM ito.incident GROUP BY 1, 2;
   ```

3. **실행**하면 **실행한 문장** 칸에 문장마다 종류와 바뀐 행 수가 나옵니다.

- 파일 복사·설정 변경은 막힙니다.
- 읽은 테이블 → 쓴 테이블이 [계보](/user/datalake/lineage.md)에 `작업 SQL` 로 남습니다.
- 실행 기록에서 작업 SQL 줄을 누르면 작업 SQL 모드로 돌아갑니다.

> **주의** 작업 SQL 은 레이크 데이터를 바꿉니다. 운영 테이블을 지우거나 덮어쓰기 전에 시점 번호를 확인해 두세요. 보관 기간 안이면 시점 조회로 예전 모습을 볼 수 있습니다.

## API·BI 도구에서 조회

같은 조회를 BI 도구나 스크립트에서 하려면 **내 API 키**에서 **조회** 범위 키를 만들어 `POST /api/v1/query` 를 부릅니다. 키는 내 권한 그대로 움직입니다([AX-DataLake 관리 개요](/admin/datalake/README.md)).

## 관련 쪽

- [화면 구성과 데이터 찾기](/user/datalake/README.md)
- [계보와 영향 범위](/user/datalake/lineage.md)
- [거버넌스 — 권한 · 가림 · 행 제한](/admin/datalake/governance.md)
