/* 처음 한 번 채우는 값. README의 「처음 한 번: 설정」 참고.
   비어 있으면 앱은 미리보기 모드(이 브라우저에만 저장)로 열린다. */
window.CONFIG = {
  // Firebase 콘솔 → 프로젝트 설정 → 내 앱(웹) → SDK 설정의 firebaseConfig를 그대로 붙여넣는다
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    appId: ""
  },
  // Google Cloud 콘솔 → 사용자 인증 정보 → 「Web client (auto created by Google Service)」의 클라이언트 ID
  googleClientId: "",
  // 사진 읽기 중계 서버(Cloudflare Worker) 주소. 비우면 사진 읽기를 쓸 수 없다
  workerUrl: ""
};
