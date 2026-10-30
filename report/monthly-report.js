#!/usr/bin/env node
/*
 * 이나의 토플 단어장 - monthly report (one A4 page PDF)
 *
 * usage:
 *   node monthly-report.js --db <export dir> --app <app html> --month YYYY-MM --out report.pdf [--today YYYY-MM-DD]
 *
 * <export dir> holds the app database exported with ArtifactData (out_dir):
 *   progress/main.json   meta/config.json   log/<YYYY-MM-DD>.json
 *   custom/<id>.json     snap/<YYYY-MM>.json (optional)
 * <app html> is the published app page; the built-in word list (const RAW=[...]) is read from it.
 * Needs Playwright with Chromium (PDF rendering) and a Korean font (Noto Sans CJK KR).
 */
const fs = require("fs");
const path = require("path");

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
if (!args.db || !args.app || !args.month || !args.out) {
  console.error("usage: node monthly-report.js --db DIR --app APP.html --month YYYY-MM --out OUT.pdf [--today YYYY-MM-DD]");
  process.exit(1);
}

/* ---------- dates ---------- */
const z = n => String(n).padStart(2, "0");
const ymd = d => d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
const parseD = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return ymd(d); };
const between = (a, b) => Math.round((parseD(b) - parseD(a)) / 864e5);
const md = s => { const d = parseD(s); return (d.getMonth() + 1) + "/" + d.getDate(); };
const kdate = s => { const d = parseD(s); return (d.getMonth() + 1) + "월 " + d.getDate() + "일"; };
const today = args.today || ymd(new Date());
const [Y, M] = args.month.split("-").map(Number);
const monthDays = []; for (let d = new Date(Y, M - 1, 1); d.getMonth() === M - 1; d.setDate(d.getDate() + 1)) monthDays.push(ymd(d));
const prevMonth = ymd(new Date(Y, M - 2, 1)).slice(0, 7);
const prevDays = []; for (let d = new Date(Y, M - 2, 1); d.getMonth() === (M + 10) % 12; d.setDate(d.getDate() + 1)) prevDays.push(ymd(d));
const lastDay = monthDays[monthDays.length - 1] < today ? monthDays[monthDays.length - 1] : today;
const covered = monthDays.filter(d => d <= lastDay);

/* ---------- data ---------- */
const readJ = p => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const readDir = dir => { const out = {}; try { for (const f of fs.readdirSync(dir)) if (f.endsWith(".json")) out[f.slice(0, -5)] = readJ(path.join(dir, f)); } catch {} return out; };
const unwrap = d => (d && d.data && !d.w && !d.r && !d.exam ? d.data : d) || {};
const prog = unwrap(readJ(path.join(args.db, "progress", "main.json")));
const cfg = unwrap(readJ(path.join(args.db, "meta", "config.json")));
const logs = Object.fromEntries(Object.entries(readDir(path.join(args.db, "log"))).map(([k, v]) => [k, unwrap(v)]));
const customRaw = Object.entries(readDir(path.join(args.db, "custom"))).map(([k, v]) => ({ ...unwrap(v), id: "c_" + k }));
const snap = unwrap(readJ(path.join(args.db, "snap", args.month + ".json")));
const html = fs.readFileSync(args.app, "utf8");
const rawMatch = /const RAW=(\[[\s\S]*?\n\]);/.exec(html);
const RAW = rawMatch ? JSON.parse(rawMatch[1]) : [];
const raw2Match = /const RAW2=(\[[\s\S]*?\n\]);/.exec(html);
const RAW2 = raw2Match ? JSON.parse(raw2Match[1]) : [];
const easyMatch = /const EASY=new Set\((\[[^\n]*?\])\);/.exec(html);
const EASY = new Set(easyMatch ? JSON.parse(easyMatch[1]) : []);
const words = [
  ...customRaw.filter(c => typeof c.w === "string").sort((a, b) => (a.at || 0) - (b.at || 0)),
  ...RAW.map((r, i) => ({ id: "a" + String(i + 1).padStart(3, "0"), w: r[0], pos: r[1], ko: r[2] })).filter(w => !EASY.has(w.w)),
  ...RAW2.map((r, i) => ({ id: "b" + String(i + 1).padStart(3, "0"), w: r[0], pos: r[1], ko: r[2] }))
];
const byId = Object.fromEntries(words.map(w => [w.id, w]));
const W = prog.w || {}, ST = prog.st || {}, DAYS = prog.days || {};
const exam = cfg.exam || "2026-12-30";

/* ---------- per-day stats ---------- */
function day(d) {
  const s = ST[d] || {};
  let nw = s.nw || 0, rv = s.rv || 0;
  if (!nw && !rv && DAYS[d]) rv = DAYS[d];
  const k = s.k || 0, u = s.u || 0, x = s.x || 0;
  return { d, nw, rv, cards: nw + rv, k, u, x, rated: k + u + x, tq: s.tq || 0, tc: s.tc || 0, s };
}
const allKeys = [...Object.keys(ST), ...Object.keys(DAYS), ...Object.keys(logs)].sort();
const appStart = allKeys[0] || lastDay;
const counted = covered.filter(d => d >= appStart);
const mdays = counted.map(day);
const pdays = prevDays.map(day);
const sum = (arr, f) => arr.reduce((a, x) => a + (typeof f === "function" ? f(x) : x[f] || 0), 0);
const studied = mdays.filter(x => x.cards || x.tq);
const pstudied = pdays.filter(x => x.cards || x.tq);
let best = 0, run = 0; for (const x of mdays) { if (x.cards || x.tq) { run++; best = Math.max(best, run); } else run = 0; }
const newWords = sum(mdays, "nw"), pNew = sum(pdays, "nw");
const tq = sum(mdays, "tq"), tc = sum(mdays, "tc"), ptq = sum(pdays, "tq"), ptc = sum(pdays, "tc");
const rated = sum(mdays, "rated"), known = sum(mdays, "k"), unsure = sum(mdays, "u"), nope = sum(mdays, "x");
const testAcc = tq ? Math.round(tc / tq * 100) : null, pTestAcc = ptq ? Math.round(ptc / ptq * 100) : null;

/* word states now */
const catOf = r => !r ? "unseen" : r.i === "skip" ? "skip" : r.b >= 4 ? "mastered" : r.b >= 2 ? "familiar" : "fresh";
const cats = { mastered: 0, familiar: 0, fresh: 0, skip: 0, unseen: 0 };
for (const w of words) cats[catOf(W[w.id])]++;
const CATL = [["mastered", "완벽히 외움", "#2E44C4"], ["familiar", "익숙해지는 중", "#8391DE"], ["fresh", "막 배운 단어", "#C9CFF2"], ["skip", "이미 알던 단어", "#FFE36B"], ["unseen", "아직 안 본 단어", "#EEF0F5"]];
const start = snap && snap.counts ? snap.counts : null;

/* test type accuracy for the month */
const TL = { syn: "유의어", en2ko: "뜻 고르기", ko2en: "영어 고르기", spell: "철자 쓰기", blank: "빈칸 채우기" };
const types = Object.keys(TL).map(k => { const q = sum(mdays, x => x.s["q_" + k] || 0), c = sum(mdays, x => x.s["c_" + k] || 0); return { k, label: TL[k], q, c, acc: q ? Math.round(c / q * 100) : null }; }).filter(t => t.q);
const weakType = types.filter(t => t.q >= 5).sort((a, b) => a.acc - b.acc)[0];

/* weeks (Mon-Sun) */
const weeks = [];
for (const x of mdays) { const dow = (parseD(x.d).getDay() + 6) % 7; if (!weeks.length || dow === 0) weeks.push([]); weeks[weeks.length - 1].push(x); }
const weekRows = weeks.map((w, i) => ({ label: md(w[0].d) + "–" + md(w[w.length - 1].d), days: w.filter(x => x.cards || x.tq).length, cards: sum(w, "cards"), kr: sum(w, "rated") ? Math.round(sum(w, "k") / sum(w, "rated") * 100) : null, ta: sum(w, "tq") ? Math.round(sum(w, "tc") / sum(w, "tq") * 100) : null }));

/* weak words: this month's "몰랐음" from the card log + test wrong answers so far */
const monthN = {};
for (const d of counted) { const r = (logs[d] || {}).r || {}; for (const id in r) if (r[id] === "N") monthN[id] = (monthN[id] || 0) + 1; }
const weak = words.map(w => { const r = W[w.id] || {}; const tw = (r.tm || [0, 0])[1] + (r.ts || [0, 0])[1] + (r.ty || [0, 0])[1];
  const no = monthN[w.id] || 0; return { w, r, tw, no, tm: (r.tm || [0, 0])[1], ts: (r.ts || [0, 0])[1], ty: (r.ty || [0, 0])[1], score: tw * 2 + no + (r.x || 0) * 0.5 }; })
  .filter(x => x.tw || x.no).sort((a, b) => b.score - a.score).slice(0, 10);

/* pace */
const unseen = cats.unseen;
const elapsed = Math.max(1, counted.length);
const avgNew = newWords / elapsed;
const goal = addDays(exam, -14);
const finish = avgNew >= 0.5 ? addDays(lastDay, Math.ceil(unseen / avgNew)) : null;
const daysToGoal = Math.max(1, between(lastDay, goal));
const needPerDay = Math.ceil(unseen / daysToGoal);

/* suggestions (rule based, up to 3) */
const sug = [];
const consistency = studied.length / elapsed;
if (consistency < 0.7) sug.push(["꾸준함", `${elapsed}일 중 ${studied.length}일 공부했어요. 바쁜 날은 복습만 10분이라도 하는 걸 목표로 해요.`]);
if (weakType && weakType.acc < 75) sug.push(["약한 유형", `${weakType.label} 정답률이 ${weakType.acc}%로 가장 낮아요. 이 유형 테스트를 주 3회 이상 풀어요.`]);
if (unseen && finish && finish > goal) sug.push(["페이스", `지금 속도면 남은 ${unseen}개를 ${kdate(finish)}에 끝내요. 목표(${kdate(goal)})에 맞추려면 하루 새 단어를 ${needPerDay}개로 늘려요.`]);
if (rated && nope / rated > 0.35) sug.push(["기억 유지", `카드에서 '몰랐음' 비율이 ${Math.round(nope / rated * 100)}%예요. 새 단어 양을 조금 줄이고 복습 비중을 늘려요.`]);
if (weak.length >= 3) sug.push(["집중 단어", `${weak.slice(0, 3).map(x => x.w.w).join(", ")} 등 자주 틀리는 단어는 예문을 소리 내 읽고 유의어와 묶어서 외워요.`]);
if (!tq) sug.push(["테스트", "이번 달에는 테스트 기록이 적어요. 카드로 본 단어를 주 2~3회 테스트로 확인해요."]);
if (sug.length < 3 && consistency >= 0.7) sug.push(["유지", `이번 달 ${studied.length}일 공부, 최장 ${best}일 연속. 지금 리듬을 그대로 이어가요.`]);
const suggestions = sug.slice(0, 3);

/* one-line summary */
const strong = testAcc != null && testAcc >= 80 ? "테스트 정답률이 좋아요" : weakType ? `${weakType.label}가 약점이에요` : rated && known / rated >= 0.6 ? "카드 기억률이 좋아요" : "기초를 쌓는 중이에요";
const summary = studied.length ? `${studied.length}일 공부, 새 단어 ${newWords}개. ${strong}.` : "이번 달에는 학습 기록이 거의 없어요.";

/* ---------- HTML ---------- */
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const delta = (a, b, unit = "") => (b == null || a == null || !pstudied.length) ? "" : a === b ? `<span class="dl eq">지난달과 같음</span>` : `<span class="dl ${a > b ? "up" : "down"}">${a > b ? "▲" : "▼"} ${Math.abs(a - b)}${unit} (지난달 ${b}${unit})</span>`;
const maxCards = Math.max(1, ...mdays.map(x => x.cards));
const first = parseD(monthDays[0]).getDay();
const cal = [];
for (let i = 0; i < first; i++) cal.push(`<i class="c blank"></i>`);
for (const d of monthDays) {
  const x = mdays.find(y => y.d === d); const n = x ? x.cards : 0; const lv = d < appStart ? "pre" : !x ? "future" : !n && !(x && x.tq) ? "l0" : n / maxCards > .66 ? "l3" : n / maxCards > .33 ? "l2" : "l1";
  cal.push(`<i class="c ${lv}"><b>${parseD(d).getDate()}</b>${n ? `<s>${n}</s>` : ""}</i>`);
}
const stackBar = counts => { const tot = Object.values(counts).reduce((a, b) => a + b, 0) || 1; return `<div class="sb">${CATL.filter(([k]) => counts[k]).map(([k, , c]) => `<i style="flex:${counts[k]};background:${c}"></i>`).join("")}</div>`; };
const pct = v => v == null ? "–" : v + "%";
const bar = (v, color) => v == null ? `<span class="na">기록 없음</span>` : `<span class="hb"><i style="width:${v}%;background:${color}"></i></span><span class="hv">${v}%</span>`;

const page = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
@page{size:A4;margin:13mm 13mm 12mm}
*{box-sizing:border-box}
body{margin:0;font-family:"Noto Sans CJK KR","Noto Sans KR","Apple SD Gothic Neo",sans-serif;color:#131933;font-size:9.6pt;line-height:1.45}
h1{font-size:19pt;margin:0;letter-spacing:-.01em}
h2{font-size:10.5pt;margin:0 0 5px;color:#131933}
.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #131933;padding-bottom:6px}
.top .sub{color:#5B6482;font-size:9pt}
.summary{margin:8px 0 9px;font-size:12pt;font-weight:700}
.summary mark{background:linear-gradient(transparent 55%,#FFE36B 55%);color:inherit}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:9px}
.kpi{border:1px solid #D8DDEA;border-radius:8px;padding:6px 8px}
.kpi b{display:block;font-size:15pt;line-height:1.15}
.kpi span{color:#5B6482;font-size:8.2pt}
.dl{display:block;font-size:7.6pt;color:#5B6482}.dl.up{color:#1D8A57}.dl.down{color:#C23E36}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:9px 12px}
.box{border:1px solid #D8DDEA;border-radius:8px;padding:8px 10px;break-inside:avoid}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.cal .h{font-size:7pt;color:#5B6482;text-align:center}
.c{height:21px;border-radius:4px;background:#F2F4F9;position:relative;display:block;font-style:normal}
.c b{position:absolute;left:3px;top:1px;font-size:6.5pt;font-weight:500;color:#5B6482}
.c s{position:absolute;right:3px;bottom:1px;font-size:6.5pt;text-decoration:none;font-weight:700}
.c.blank{background:none}.c.pre{background:none;border:1px solid #F0F2F7}.c.pre b{color:#C3C8D8}.c.future{background:#fff;border:1px dashed #D8DDEA}
.c.l0{background:#F2F4F9}.c.l1{background:#C9CFF2}.c.l2{background:#8391DE}.c.l3{background:#2E44C4}
.c.l2 b,.c.l3 b,.c.l2 s,.c.l3 s{color:#fff}
.note{color:#5B6482;font-size:8pt;margin:4px 0 0}
.sb{display:flex;gap:2px;height:11px;border-radius:4px;overflow:hidden;margin:3px 0}
.sb i{display:block}
.legend{display:grid;grid-template-columns:1fr auto auto;gap:1px 10px;font-size:8.4pt;margin-top:4px}
.legend .k{display:flex;align-items:center;gap:5px}.legend .k i{width:8px;height:8px;border-radius:2px;display:inline-block}
.legend .n{text-align:right;font-variant-numeric:tabular-nums}.legend .h{color:#5B6482;font-size:7.6pt;text-align:right}
table{width:100%;border-collapse:collapse;font-size:8.4pt}
th{text-align:left;font-weight:600;color:#5B6482;font-size:7.8pt;border-bottom:1px solid #D8DDEA;padding:2px 3px}
td{padding:3px 3px;border-bottom:1px solid #EEF0F5;vertical-align:middle;font-variant-numeric:tabular-nums}
.hb{display:inline-block;width:62px;height:6px;background:#EEF0F5;border-radius:3px;vertical-align:middle;margin-right:4px}.hb i{display:block;height:100%;border-radius:3px}
.hv{font-size:8pt}.na{color:#9AA2C1;font-size:7.8pt}
.w{font-family:"Noto Serif CJK KR","Noto Serif KR",Georgia,serif;font-weight:700;font-size:9.4pt}
.tag{display:inline-block;font-size:7pt;padding:0 5px;border-radius:8px;background:#FBEFD9;color:#8A5A0E;margin-right:2px}
.sug{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px}
.sug li{display:grid;grid-template-columns:62px 1fr;gap:6px}
.sug b{color:#2E44C4;font-size:8.4pt}
.memo{border:1px solid #131933;border-radius:8px;padding:7px 10px;min-height:88px;margin-top:9px;background:repeating-linear-gradient(transparent 0 19px,#E3E6EF 19px 20px)}
.memo h2{background:#fff;display:inline-block;padding-right:6px}
.foot{margin-top:6px;color:#9AA2C1;font-size:7pt;display:flex;justify-content:space-between}
</style></head><body>
<div class="top"><div><div class="sub">이나의 토플 단어장 · 월간 리포트</div><h1>${Y}년 ${M}월 단어 학습 리포트</h1></div>
<div class="sub" style="text-align:right">기간 ${kdate(monthDays[0])} – ${kdate(lastDay)}${lastDay < monthDays[monthDays.length - 1] ? " (진행 중)" : ""}<br>토플 시험 ${kdate(exam)} · 리포트 기준 D-${Math.max(0, between(lastDay, exam))}</div></div>
<p class="summary"><mark>${esc(summary)}</mark></p>
<div class="kpis">
 <div class="kpi"><b>${studied.length}<small style="font-size:9pt">/${elapsed}일</small></b><span>공부한 날${appStart > monthDays[0] ? ` (${md(appStart)} 시작)` : ""} · 최장 ${best}일 연속</span>${delta(studied.length, pstudied.length, "일")}</div>
 <div class="kpi"><b>${newWords}개</b><span>새로 본 단어</span>${delta(newWords, pNew, "개")}</div>
 <div class="kpi"><b>${cats.mastered}개</b><span>완벽히 외운 단어${start ? ` (월초 ${start.mastered}개)` : ""}</span>${start ? `<span class="dl ${cats.mastered >= start.mastered ? "up" : "down"}">${cats.mastered >= start.mastered ? "▲" : "▼"} ${Math.abs(cats.mastered - start.mastered)}개</span>` : ""}</div>
 <div class="kpi"><b>${pct(testAcc)}</b><span>테스트 정답률 · ${tq}문제</span>${delta(testAcc, pTestAcc, "%p")}</div>
</div>
<div class="grid">
 <div class="box"><h2>꾸준함 · 날짜별 카드 수</h2>
  <div class="cal">${["일", "월", "화", "수", "목", "금", "토"].map(h => `<span class="h">${h}</span>`).join("")}${cal.join("")}</div>
  <p class="note">진할수록 카드를 많이 넘긴 날이에요. 오른쪽 아래 숫자는 그날 넘긴 카드 수예요.${appStart > monthDays[0] ? ` 앱 사용은 ${kdate(appStart)}부터예요.` : ""}</p></div>
 <div class="box"><h2>단어 상태 (전체 ${words.length}개)</h2>
  ${start ? `<div class="note" style="margin:0">월초 ${esc(start.day || "")}</div>${stackBar(start)}` : ""}
  <div class="note" style="margin:0">${start ? "지금" : "리포트 기준"}</div>${stackBar(cats)}
  <div class="legend">${CATL.map(([k, l, c]) => `<span class="k"><i style="background:${c};${k === "unseen" ? "border:1px solid #D8DDEA" : ""}"></i>${l}</span><span class="n">${cats[k]}개</span><span class="h">${start ? (cats[k] - (start[k] || 0) >= 0 ? "+" : "") + (cats[k] - (start[k] || 0)) : ""}</span>`).join("")}</div>
  ${start ? "" : `<p class="note">월초 기록이 없어 이번 달은 리포트 시점 상태만 보여줘요.</p>`}</div>
 <div class="box"><h2>주별 흐름</h2>
  <table><tr><th>주</th><th>공부한 날</th><th>카드</th><th>카드 '알았음'</th><th>테스트 정답률</th></tr>
  ${weekRows.map(w => `<tr><td>${w.label}</td><td>${w.days}일</td><td>${w.cards}</td><td>${bar(w.kr, "#1D8A57")}</td><td>${bar(w.ta, "#2E44C4")}</td></tr>`).join("")}</table>
  <p class="note">이번 달 카드 응답: 알았음 ${rated ? Math.round(known / rated * 100) : 0}% · 애매 ${rated ? Math.round(unsure / rated * 100) : 0}% · 몰랐음 ${rated ? Math.round(nope / rated * 100) : 0}% (${rated}장)</p></div>
 <div class="box"><h2>테스트 유형별 정답률</h2>
  ${types.length ? `<table><tr><th>유형</th><th>문제</th><th>정답률</th></tr>${types.map(t => `<tr><td>${t.label}${weakType && t.k === weakType.k ? ` <span class="tag">가장 약함</span>` : ""}</td><td>${t.c}/${t.q}</td><td>${bar(t.acc, "#2E44C4")}</td></tr>`).join("")}</table>` : `<p class="note">이번 달 유형별 테스트 기록이 없어요.</p>`}
  <h2 style="margin-top:8px">페이스</h2>
  <p style="margin:0;font-size:8.6pt">${unseen ? (finish ? `하루 평균 새 단어 ${avgNew.toFixed(1)}개. 남은 ${unseen}개를 이 속도로 보면 <b>${kdate(finish)}</b>에 끝나요. 목표(시험 2주 전, ${kdate(goal)})${finish <= goal ? "보다 빨라요." : `보다 늦어요. 하루 ${needPerDay}개가 필요해요.`}` : `남은 새 단어 ${unseen}개. 목표(${kdate(goal)})까지 하루 ${needPerDay}개가 필요해요.`) : "단어장의 모든 단어를 한 번씩 봤어요. 복습과 테스트로 굳히는 단계예요."}</p></div>
</div>
<div class="grid" style="margin-top:9px">
 <div class="box"><h2>자주 틀리는 단어 Top ${weak.length || ""}</h2>
  ${weak.length ? `<table><tr><th>단어</th><th>뜻</th><th>틀린 곳</th></tr>${weak.map(x => `<tr><td class="w">${esc(x.w.w)}</td><td>${esc(x.w.ko || "")}</td><td>${[x.no ? `<span class="tag">카드 ${x.no}</span>` : "", x.tm ? `<span class="tag">뜻 ${x.tm}</span>` : "", x.ts ? `<span class="tag">철자 ${x.ts}</span>` : "", x.ty ? `<span class="tag">유의어 ${x.ty}</span>` : ""].join("")}</td></tr>`).join("")}</table><p class="note">카드: 이번 달 '몰랐음' 횟수 · 뜻/철자/유의어: 지금까지 테스트 오답 횟수</p>` : `<p class="note">이번 달 자주 틀린 단어가 없어요.</p>`}</div>
 <div class="box"><h2>다음 달 제안</h2>
  <ul class="sug">${suggestions.map(([t, b]) => `<li><b>${t}</b><span>${esc(b)}</span></li>`).join("")}</ul>
  <div class="memo"><h2>리뷰 메모</h2></div></div>
</div>
<div class="foot"><span>기록은 앱에서 넘긴 카드와 푼 테스트를 바탕으로 자동 계산했어요.</span><span>생성 ${kdate(today)}</span></div>
</body></html>`;

/* ---------- render ---------- */
(async () => {
  const htmlOut = args.out.replace(/\.pdf$/i, "") + ".html";
  fs.writeFileSync(htmlOut, page);
  let chromium;
  try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require(require.resolve("playwright", { paths: ["/usr/lib/node_modules", "/usr/local/lib/node_modules", process.cwd()] }))); }
  const opts = {}; if (fs.existsSync("/opt/pw-browsers/chromium")) { try { const st = fs.statSync("/opt/pw-browsers/chromium"); if (st.isFile()) opts.executablePath = "/opt/pw-browsers/chromium"; } catch {} }
  const browser = await chromium.launch(opts);
  const p = await browser.newPage();
  await p.goto("file://" + path.resolve(htmlOut));
  await p.pdf({ path: args.out, format: "A4", printBackground: true, margin: { top: "13mm", bottom: "12mm", left: "13mm", right: "13mm" } });
  const pages = await p.evaluate(() => Math.ceil(document.documentElement.scrollHeight / (1122 - 94)));
  await browser.close();
  console.log(JSON.stringify({ out: args.out, html: htmlOut, month: args.month, studied: studied.length, newWords, testAcc, weak: weak.length, estPages: pages }));
})();
