# 토플 단어장

claude.ai 아티팩트였던 「이나의 토플 단어장」을 내 주소(GitHub Pages)로 옮긴 웹 앱. 집 맥 · 회사 맥 · 아이폰(홈 화면 추가)에서 같은 주소로 연다.

- **단어장 하나 = 공부하는 사람 한 명 + 응원하는 사람들.** 처음 들어오면 「내가 공부해요 / 다른 사람을 응원해요」와 이름을 정한다. 한 계정으로 단어장을 여러 개 만들 수 있다.
- **초대 링크** — 설정 → 단어장 → 「공부할 사람 초대 링크」 · 「응원할 사람 초대 링크」. 받은 사람은 구글로 로그인하면 그 단어장에 들어온다.
- **기능은 아티팩트와 같다** — 카드 넘기기(간격 반복) · 테스트 · 책 단어(사진) · 기록 · 응원 메시지 · 백업.
- **책 사진 읽기** — 사진을 Gemini(무료 등급)로 읽는다. 사진 한 장 = 요청 한 번. 무료 한도를 넘으면 「오늘 한도」 안내가 뜬다.

## 구조

| 아티팩트가 해 주던 것 | 여기서는 |
|---|---|
| 공유 데이터베이스 | Firebase Firestore (무료 Spark 요금제) — `spaces/{단어장 id}/…` 아래에 아티팩트와 같은 경로 |
| 사용자 구분 | Firebase 로그인(구글) |
| Claude 호출 | Cloudflare Worker(`worker/worker.js`) → Gemini API. API 키는 Worker에만 있다 |

`js/runtime.js`가 아티팩트의 `window.claude.use("db" | "user" | "sample")`를 그대로 흉내 낸다. 그래서 `js/app.js`는 아티팩트 코드와 거의 같다.

## 처음 한 번: 설정 (약 40분)

### 1. Firebase (로그인 · 데이터베이스)

1. https://console.firebase.google.com → **프로젝트 추가** → 이름 `toefl-vocab`. Google 애널리틱스는 꺼도 된다.
2. **빌드 → Authentication → 시작하기 → Sign-in method → Google** 사용 설정(지원 이메일 = 내 gmail) → 저장.
   - 같은 화면 **설정 → 승인된 도메인**에 `thyomoon.github.io` 추가.
3. **빌드 → Firestore Database → 데이터베이스 만들기**
   - 위치: `asia-northeast3 (서울)` — 공부하는 사람이 한국에 있으니까. 나중에 못 바꾼다.
   - **프로덕션 모드**로 시작 → 만든 뒤 **규칙** 탭에 `firestore.rules` 내용을 붙여넣고 **게시**.
4. **프로젝트 설정(톱니) → 일반 → 내 앱 → 웹(`</>`)** → 앱 닉네임 `toefl-vocab` → 등록. 나오는 `firebaseConfig`의 `apiKey` · `authDomain` · `projectId` · `appId`를 `js/config.js`의 `firebase`에 붙여넣는다. (이 값은 공개돼도 되는 값이다. 막는 건 규칙이 한다.)
5. https://console.cloud.google.com → 위에서 같은 프로젝트(`toefl-vocab`) 선택 → **API 및 서비스 → 사용자 인증 정보** → **Web client (auto created by Google Service)** 를 연다.
   - 승인된 JavaScript 원본: `https://thyomoon.github.io`
   - 승인된 리디렉션 URI: `https://thyomoon.github.io/toefl-vocab/` (끝의 `/`까지 똑같이)
   - 저장 → 이 화면의 **클라이언트 ID**를 `js/config.js`의 `googleClientId`에 붙여넣는다.
   - **OAuth 동의 화면**이 「테스트」 상태면 **앱 게시**를 누른다(이름 · 이메일만 쓰는 기본 범위라 심사가 없다). 안 그러면 테스트 사용자로 넣은 사람만 로그인된다.

### 2. Gemini API 키 (사진 읽기, 무료)

1. https://aistudio.google.com → **Get API key → API 키 만들기**. 결제 정보를 넣지 않으면 무료 등급으로만 돈다(돈이 나가지 않는다).
2. 키를 복사해 둔다. **이 키는 앱 코드에 넣지 않는다** — 다음 단계의 Worker에만 넣는다.
3. 무료 한도는 AI Studio의 **사용량 · 한도(Rate limit)** 화면에서 본다.
4. 무료 등급에서 보낸 사진은 구글이 모델 개선에 쓸 수 있다(책 페이지라 괜찮다고 봤다).

### 3. Cloudflare Worker (사진 읽기 중계 서버, 무료)

1. https://dash.cloudflare.com 가입 → **Workers & Pages → 만들기 → Worker** → 이름 `toefl-vocab-ocr` → 배포.
2. **코드 편집** → 기본 코드를 지우고 `worker/worker.js`를 통째로 붙여넣기 → 배포.
3. **설정 → 변수 및 비밀**
   - `GEMINI_API_KEY` — 종류 **비밀(Secret)**, 값 = 2단계 키
   - `FIREBASE_PROJECT_ID` — 텍스트, 값 = `toefl-vocab-ce51c` (1단계 `projectId`와 같게)
   - `ALLOWED_ORIGIN` — 텍스트, 값 = `https://thyomoon.github.io`
   - `MODEL` — (선택) 비우면 `gemini-flash-latest`. 품질이 아쉬우면 다른 모델 이름을 넣는다.
4. Worker 주소(`https://toefl-vocab-ocr.….workers.dev`)를 `js/config.js`의 `workerUrl`에 붙여넣는다.

### 4. GitHub Pages

1. VS Code로 이 폴더를 연다 → 소스 제어 → **GitHub에 게시** → 이름 `toefl-vocab`, **Public**(무료 계정의 Pages 조건). 코드만 올라가고 단어 · 기록은 올라가지 않는다. `original/`(옛 아티팩트 원본)은 올리지 않는다.
2. 저장소 **Settings → Pages** → Source `Deploy from a branch`, Branch `main` / `(root)` → Save.
3. 1~2분 뒤 `https://thyomoon.github.io/toefl-vocab/`가 열린다.

### 5. 아티팩트에서 기록 옮기기

1. **옛 아티팩트**를 열고 → 설정 → **백업 파일 저장 (JSON)**. (이나 진도 · 책 단어 · 응원 메시지 · 내 공부 기록이 다 들어 있다.)
2. **새 앱**에 구글로 로그인 → 「다른 사람을 응원해요」, 공부하는 사람 이름 `이나` → 단어장 만들기.
3. 설정 → **백업 파일에서 가져오기** → 1의 파일.
4. 설정 → 단어장 → **공부할 사람 초대 링크**를 이나에게 보낸다. 이나가 구글로 로그인하고 「시작하기」를 누르면 옛 진도가 그대로 이어진다(시험 날짜 · 홈 화면 추가 안내를 한 번 더 거친다).
5. 옮긴 것을 확인한 뒤에 아티팩트를 지운다.

## 고칠 때

- **코드를 바꾸면 `index.html`의 `?v=…` 숫자를 모두 새 값으로 바꾼다.** 안 바꾸면 폰이 옛 파일을 한동안 계속 쓴다.
- 미리보기(Firebase 없이, 이 브라우저에만 저장): `tests/preview.sh`
- 화면 찍기: `tests/preview.sh shot <폴더>` · 로그인 화면: `tests/preview.sh shot <폴더> gate`
- 자바스크립트 오류 확인: `tests/preview.sh check`
- `worker/worker.js`를 고치면 Cloudflare의 코드 편집 화면에 다시 붙여넣고 배포.

## 파일

| 파일 | 하는 일 |
|---|---|
| `index.html` · `css/style.css` | 화면 |
| `js/config.js` | Firebase 설정 · 구글 클라이언트 ID · Worker 주소 |
| `js/runtime.js` | 로그인 · 단어장 고르기/만들기/초대 · 아티팩트 API 흉내(Firestore, Gemini) |
| `js/app.js` | 단어장 앱 본체(아티팩트 코드에서 이름 · 초대 · 가져오기만 바꿈) |
| `js/words.js` | 내장 단어 목록(지금은 쓰지 않음 — 책 단어만 쓴다) |
| `ocr/` | 폰에서 도는 글자 인식(Tesseract). 사진을 서버로 보낼 수 없을 때를 위한 예비 — 지금 흐름에서는 쓰이지 않는다(인식한 글자를 정리하는 데도 Gemini가 필요하다) |
| `worker/worker.js` | 사진 읽기 중계 서버 |
| `firestore.rules` | 데이터베이스 규칙 — 단어장 멤버만 읽고 쓴다 |
| `report/monthly-report.js` | 월간 PDF 리포트(node). 아직 옛 아티팩트 내보내기 형식을 읽는다 |
| `original/artifact.html` | 옮기기 전 아티팩트 원본(저장소에는 안 올림) |

## 알아둘 것

- 하루의 기준은 한국 시각이다(아티팩트 그대로). 다른 나라에서 공부하는 사람이 생기면 바꿔야 한다.
- 「내 공부」 기록(응원하는 사람이 같은 단어로 공부한 기록)은 규칙상 같은 단어장 멤버도 읽을 수 있다 — 아티팩트 때와 같다.
