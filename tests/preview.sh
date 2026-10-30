#!/bin/zsh
# 서버 없이(file://) 화면 미리보기. 임시 폴더에 복사해서 연다.
#   tests/preview.sh              → 크롬에서 미리보기(이 브라우저에만 저장되는 모드)
#   tests/preview.sh supporter    → 검사하는(응원하는) 사람 화면으로 미리보기
#   tests/preview.sh shot DIR     → 폰 화면을 DIR/phone.png로 찍기
#   tests/preview.sh shot DIR gate → 로그인 화면(가짜 Firebase 설정)을 DIR/gate.png로 찍기
#   tests/preview.sh check        → 미리보기 · 로그인 화면을 열어 자바스크립트 오류만 출력(없으면 ok)
HERE="${0:A:h}"; ROOT="${HERE:h}"
TMP="${TMPDIR:-/tmp}/tv-preview"; rm -rf "$TMP"; mkdir -p "$TMP"
cp -R "$ROOT/css" "$ROOT/js" "$ROOT/index.html" "$ROOT/icon-32.png" "$ROOT/icon-180.png" "$TMP/"
sed -i '' 's|<link rel="manifest" href="manifest.webmanifest">||' "$TMP/index.html"
# gate.html: same page with a dummy Firebase config, so runtime.js runs and shows the sign-in screen
sed 's|src="js/config.js[^"]*"|src="js/config.gate.js"|' "$TMP/index.html" > "$TMP/gate.html"
sed 's|apiKey: ""|apiKey: "demo"|; s|projectId: ""|projectId: "demo-preview"|; s|authDomain: ""|authDomain: "demo-preview.firebaseapp.com"|; s|appId: ""|appId: "1:1:web:1"|' "$ROOT/js/config.js" > "$TMP/js/config.gate.js"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [[ "$1" == "shot" ]]; then
  OUT="${2:-$TMP}"; mkdir -p "$OUT"; PAGE="${3:-index}"; [[ "$PAGE" == "gate" ]] && NAME=gate || NAME=phone
  "$CH" --headless=new --hide-scrollbars --window-size=520,900 --virtual-time-budget=${BUDGET:-5000} --screenshot="$OUT/$NAME.png" "file://$TMP/$PAGE.html" 2>/dev/null
  echo "$OUT/$NAME.png"
elif [[ "$1" == "check" ]]; then
  fail=0
  for PAGE in index gate; do
    ERR=$("$CH" --headless=new --enable-logging=stderr --v=0 --virtual-time-budget=5000 --dump-dom "file://$TMP/$PAGE.html" 2>&1 >/dev/null | grep -i 'Uncaught\|SyntaxError\|ReferenceError\|TypeError' )
    if [[ -n "$ERR" ]]; then echo "$PAGE: $ERR"; fail=1; else echo "$PAGE: ok"; fi
  done
  exit $fail
elif [[ "$1" == "supporter" ]]; then
  open -a "Google Chrome" "file://$TMP/index.html?as=supporter"
else
  open -a "Google Chrome" "file://$TMP/index.html"
fi
