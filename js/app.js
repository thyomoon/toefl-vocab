
/* ============ helpers */
const $=s=>document.querySelector(s);
function el(tag,props,...kids){const e=document.createElement(tag);if(props)for(const k in props){const v=props[k];if(v==null||v===false)continue;if(k==="class")e.className=v;else if(k.startsWith("on")&&typeof v==="function")e.addEventListener(k.slice(2),v);else if(k==="svg")e.innerHTML=v;else if(k==="value")e.value=v;else if(k==="checked")e.checked=!!v;else e.setAttribute(k,v===true?"":v)}for(const c of kids.flat(9)){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(String(c)))}return e}
/* the study day follows Korea time (Ina's clock) on every device; calendar math on parsed dates stays local */
const KST=9*3600e3;
function kst(ms=Date.now()){return new Date(ms+KST)}            // read with getUTC* getters
function kstHour(){return kst().getUTCHours()}
function kstDayStart(s){const[y,m,d]=s.split("-").map(Number);return Date.UTC(y,m-1,d)-KST}
function ymd(d){const z=n=>String(n).padStart(2,"0");if(d&&d._local)return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate());const k=kst(d?d.getTime():Date.now());return k.getUTCFullYear()+"-"+z(k.getUTCMonth()+1)+"-"+z(k.getUTCDate())}
function parseD(s){const[y,m,d]=s.split("-").map(Number);const x=new Date(y,m-1,d);x._local=true;return x}
function addDays(s,n){const d=parseD(s);d.setDate(d.getDate()+n);return ymd(d)}
function daysBetween(a,b){return Math.round((parseD(b)-parseD(a))/864e5)}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function str(v,n){return String(v==null?"":v).trim().slice(0,n)}
function synNode(s){const out=[];s.syn.forEach((x,i)=>{if(i)out.push(", ");out.push(s.key&&s.key.includes(x)?el("b",{class:"keysyn"},x):x)});return out}
function wordBody(w,opts){
  const o=opts||{};const sv=Array.isArray(w.senses)&&w.senses.length?w.senses:null;
  if(!sv)return [w.ex?el("div",null,el("div",{class:"exen",lang:"en"},exNode(w.ex)),el("div",{class:"exko"},w.exKo||"")):null,
    el("dl",{class:"kv"},w.fam?[el("dt",null,"단어 가족"),el("dd",{lang:"en"},w.fam)]:null,w.syn?[el("dt",null,"비슷한 말"),el("dd",{lang:"en"},w.syn)]:null,w.book&&o.src?[el("dt",null,"출처"),el("dd",null,w.book+(w.kb===false?" (뜻은 보충)":""))]:null)];
  const multi=sv.length>1;
  return [el("div",{class:"senses"},sv.map((s,i)=>el("div",{class:"sense"},
      el("div",{class:"sense-head"},multi?el("span",{class:"sense-no num"},(i+1)+"."):null,el("span",{class:"sense-ko"},s.ko),s.pos?el("span",{class:"pos-inline"},s.pos):null),
      s.syn.length?el("div",{class:"sense-syn",lang:"en"},synNode(s)):null,
      s.ex?el("div",{class:"exen",lang:"en"},exNode(s.ex)):null,s.exKo?el("div",{class:"exko"},s.exKo):null))),
    w.fam?el("dl",{class:"kv"},el("dt",null,"단어 가족"),el("dd",{lang:"en"},w.fam)):null,
    w.note?el("div",{class:"notebox"},el("b",null,"참고"),el("p",null,w.note)):null];
}
function exNode(ex){const out=[];String(ex||"").split(/\[(.+?)\]/).forEach((p,i)=>out.push(i%2?el("mark",null,p):p));return out}
function exTarget(ex){const m=/\[(.+?)\]/.exec(ex||"");return m?m[1]:null}
function lsGet(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
function ago(t){const s=(Date.now()-t)/1000;if(s<60)return"방금";if(s<3600)return Math.floor(s/60)+"분 전";if(s<86400)return Math.floor(s/3600)+"시간 전";const d=Math.floor(s/86400);return d===1?"어제":d+"일 전"}
function fmtExam(s){const d=parseD(s);return (d.getMonth()+1)+"월 "+d.getDate()+"일"}
/* original illustration: a cat playing with alphabet blocks */
const CAT_SVG="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"59 33.6 177 165.4\" role=\"img\" aria-label=\"나란히 앉아 있는 하얀 고양이와 까만 고양이\"><g stroke=\"#1B1835\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M192.3 186 C222.5 186 226.4 165.7 214.6 159.9\" fill=\"none\" stroke-width=\"9.6\"/><path d=\"M192.3 186 C222.5 186 226.4 165.7 214.6 159.9\" fill=\"none\" stroke=\"#2A2733\" stroke-width=\"4.8\"/><path d=\"M144.6 90.7 L146.2 66.1 L160.2 79.2 Q170 76 179.8 79.2 L193.8 66.1 L195.4 90.7 Q202 104.7 192.1 118.6 Q202.8 134.1 205.4 160.9 Q207.4 183.5 195.6 187 L144.4 187 Q132.6 183.5 134.6 160.9 Q137.2 134.1 147.9 118.6 Q138 104.7 144.6 90.7 Z\" fill=\"#2A2733\"/><path d=\"M150.3 75.1 l3.3 6.6 M189.7 75.1 l-3.3 6.6\" stroke=\"#6B6585\" stroke-width=\"1.6\"/><path d=\"M80 69.6 L82 39.6 L99 55.6 Q111 51.6 123 55.6 L140 39.6 L142 69.6 Q150 86.6 138 103.6 Q150 122.5 153.1 155.2 Q155.5 182.7 141.4 187 L80.6 187 Q66.5 182.7 68.9 155.2 Q72 122.5 84 103.6 Q72 86.6 80 69.6 Z\" fill=\"#FFFFFF\"/><path d=\"M87 50.6 l4 8 M135 50.6 l-4 8\" stroke=\"#F2B8C6\" stroke-width=\"2\"/><path d=\"M130 186 C156 194 201 192 209 183 C215 178 210 172 204 176\" fill=\"none\" stroke-width=\"10\"/><path d=\"M130 186 C156 194 201 192 209 183 C215 178 210 172 204 176\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"5.6\"/></g></svg>";
function catArt(cls){return el("div",{class:"catart "+(cls||""),svg:CAT_SVG})}
const ICON={
 trash:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>',
 download:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
 shuffle:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/></svg>',
 arrow:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
 test:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 2.5 2.5L16 9"/></svg>',
 book:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/></svg>',
 camera:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/></svg>',
 close:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
 chart:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 chat:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
 sound:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
};
function icon(n){return el("span",{svg:ICON[n],style:"display:contents"})}

/* ============ state */
const DEF_CFG={exam:"2026-12-12",daily:10,learnerId:null};
const INT=[0,1,3,7,14,30,60];
const S={mode:"init",db:null,user:null,sample:null,canImg:false,me:null,isOwner:false,
  cfg:{...DEF_CFG},cfgExists:false,ctx:"ina",ctxs:{ina:{log:{},prog:{w:{},days:{},st:{}},progExists:false},me:{log:{},prog:{w:{},days:{},st:{}},progExists:false,got:false}},custom:[],customAll:[],trash:[],cheers:[],
  got:{cfg:false,prog:false},role:"learner",tab:"home",preview:[],sheet:false,readOnly:false,supportChoice:false};
/* S.prog / S.log / S.progExists point at the active context: "ina" (shared, Ina's) or "me" (Taylor's own, private) */
for(const k of ["prog","log","progExists"])Object.defineProperty(S,k,{get(){return S.ctxs[S.ctx][k]},set(v){S.ctxs[S.ctx][k]=v},configurable:true});
const PREF=Object.assign({dir:"en",speak:false,book:"",tn:10,asSupport:false},lsGet("tv-pref",{}));
function savePref(){lsSet("tv-pref",PREF)}
/* names come from the word book (js/runtime.js); preview mode keeps the original two */
function nameL(){return window.RT?RT.learnerName():"이나"}
/* particle after a name, batchim form first: josa("이나","이/가") → "이나가", josa("민준","아/야") → "민준아" */
function josa(n,pair){const [a,b]=pair.split("/");const c=n.charCodeAt(n.length-1);return n+(c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28>0?a:b)}

// a book word replaces the built-in word with the same spelling (deleting the book word brings the built-in one back)
let _awKey=null,_aw=null;
function allWords(){const key=S.custom;if(key!==_awKey){const mine=new Set(S.custom.map(c=>c.w.toLowerCase()));_aw=[...S.custom,...BUILTIN.filter(b=>!mine.has(b.w.toLowerCase()))];_awKey=key}return _aw}
function byId(id){return WMAP.get(id)||S.custom.find(c=>c.id===id)}
function recOf(id){return S.prog.w[id]}

/* local (preview) persistence */
function loadLocal(){const d=lsGet("tv-local",null);if(d){S.cfg={...DEF_CFG,...(d.cfg||{})};S.prog={w:d.prog?.w||{},days:d.prog?.days||{},st:d.prog?.st||{}};setCustomAll(d.custom||[]);S.cheers=d.cheers||[];S.log=d.log||{}}}
/* only the learner's side is kept; the supporter preview's own study (내 공부) is not saved */
function saveLocal(){if(S.mode!=="local")return;lsSet("tv-local",{cfg:S.cfg,prog:S.ctxs.ina.prog,custom:S.customAll||S.custom,cheers:S.cheers,log:S.ctxs.ina.log})}

/* ============ plan */
/* daily load: the day's new words (setting, default 10) always come, whatever the review pile;
   reviews (lowest box, most overdue first) are capped at REVIEW_CAP a day, the rest waits for tomorrow */
const REVIEW_CAP=50;
function todayPlan(){
  const t=ymd(),P=S.prog.w,W=allWords();let due=[],fresh=[];let intro=0,done=0,reviewed=0;
  for(const w of W){const r=P[w.id];if(!r)continue;if(r.l===t&&r.i!=="skip")done++;if(r.i===t)intro++;else if(r.l===t&&r.i!=="skip")reviewed++;if(r.d&&r.d<=t&&r.l!==t)due.push(w.id)}
  due.sort((a,b)=>((P[a].b||0)-(P[b].b||0))||String(P[a].d).localeCompare(String(P[b].d)));
  const daily=Number(S.cfg.daily)||10;
  const quota=Math.max(0,REVIEW_CAP-reviewed);
  const deferred=Math.max(0,due.length-quota);due=due.slice(0,quota);
  const left=Math.max(0,daily-intro);
  for(const w of W){if(fresh.length>=left)break;if(!P[w.id])fresh.push(w.id)}
  return {due,fresh,done,deferred,remaining:[...due,...fresh]};
}
function lastMark(r){const h=r&&r.h||"";return h?h[h.length-1]:(r&&r.b>0?"K":"")}
// 외운 단어 = words whose latest card answer was 알았음 (애매·몰랐음 excluded)
// words already done today but missed in a test today and not re-carded since
function retestToday(){const t=ymd(),P=S.prog.w,out=[];for(const w of allWords()){const r=P[w.id];if(r&&r.tw===t&&r.l===t&&lastMark(r)==="T")out.push(w.id)}return out}
function testedToday(){return ((S.prog.st[ymd()]||{}).tq||0)>0}
function learnedCount(){let n=0,k=0;const live=new Set(allWords().map(w=>w.id));for(const id in S.prog.w){if(!live.has(id))continue;const r=S.prog.w[id];if(r.i==="skip")k++;else if(r.s>0&&lastMark(r)==="K")n++}return {n,k}}
function streak(){const days=S.prog.days||{};let d=ymd();if(!(days[d]>0))d=addDays(d,-1);let n=0;while(days[d]>0){n++;d=addDays(d,-1)}return n}
function doneToday(){const t=ymd();let n=0;for(const id in S.prog.w)if(S.prog.w[id].l===t)n++;return n}

/* ============ progress writes (batched, one write at a time) */
let pending={},inflight={},flushing=false,flushTimer=null,stDirty=false,stInflight=false,logDirty=false,pendingCtx="ina",inflightCtx="ina";
function markCtx(){if(pendingCtx!==S.ctx){if(!flushing&&(Object.keys(pending).length||stDirty||logDirty))flush();pendingCtx=S.ctx}}
function bump(f,n=1){markCtx();const t=ymd();const cur={...(S.prog.st[t]||{})};cur[f]=(cur[f]||0)+n;S.prog.st={...S.prog.st,[t]:cur};stDirty=true;schedule()}
function queueRec(id,rec){markCtx();S.prog.w[id]=rec;const t=ymd();S.prog.days={...S.prog.days,[t]:doneToday()};pending[id]=rec;schedule()}
function schedule(ms=1200){clearTimeout(flushTimer);flushTimer=setTimeout(flush,ms)}
async function flush(){
  if(S.mode==="local"){pending={};saveLocal();return}
  if(S.mode!=="remote"||S.readOnly)return;
  if(flushing){schedule();return}
  const batch=pending;if(!Object.keys(batch).length&&!stDirty&&!logDirty)return;
  const C=pendingCtx,X=S.ctxs[C];inflightCtx=C;
  pending={};inflight=batch;flushing=true;const hadSt=stDirty;stDirty=false;stInflight=hadSt;const hadLog=logDirty;logDirty=false;
  const t=ymd();let done=0;for(const id in X.prog.w)if(X.prog.w[id].l===t)done++;const days={[t]:done};
  const base=C==="me"?"data/users/"+S.me+"/prog":"progress/main";
  try{
    const ref=S.db.doc(base);
    const body={w:batch,days};if(hadSt)body.st={[t]:X.prog.st[t]||{}};
    if(Object.keys(batch).length||hadSt){if(X.progExists)await ref.update(body);
    else{await ref.set({w:{...X.prog.w},days:{...X.prog.days,...days},st:{...X.prog.st}});X.progExists=true}}
    if(hadLog){try{await S.db.doc((C==="me"?base+"/log/":"log/")+t).set({r:{...((X.log[t]||{}).r||{})}})}catch(e){logDirty=true;throw e}}
  }catch(e){
    if(e&&(e.code==="invalid_argument"||e.code==="revoked"||e.code==="not_granted")){S.readOnly=true;toast("이 계정은 기록을 저장할 수 없어. 초대 링크로 다시 들어와 줘")}
    else{pending={...batch,...pending};if(hadSt)stDirty=true;toast("저장이 조금 늦어지고 있어. 곧 다시 저장할게");setTimeout(()=>schedule(0),5000)}
  }finally{inflight={};stInflight=false;flushing=false;if(Object.keys(pending).length||stDirty||logDirty)schedule()}
}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")flush()});
/* switch study context only after the other context's changes are saved */
async function setCtx(c){
  if(S.ctx===c)return;
  if(S.mode==="remote"){clearTimeout(flushTimer);for(let i=0;i<40&&(flushing||Object.keys(pending).length||stDirty||logDirty);i++){if(!flushing)await flush();else await new Promise(r=>setTimeout(r,100))}}
  S.ctx=c;S.preview=[];
}
function ctxForTab(k){return S.role==="supporter"&&(k==="mine"||k==="mytest")?"me":"ina"}
async function goTab(k){await setCtx(ctxForTab(k));S.tab=k;window.scrollTo(0,0);render()}

function rate(id,kind){
  const t=ymd();const old=recOf(id);
  const r=old?{b:0,d:t,i:"",l:"",s:0,x:0,...old}:{b:0,d:t,i:t,l:"",s:0,x:0};
  if(old&&old.i==="skip"&&kind!=="skip")r.i="";
  r.s=(r.s||0)+1;r.l=t;
  if(kind==="know"){r.b=Math.min((r.b||0)+1,6);r.d=addDays(t,INT[r.b])}
  else if(kind==="unsure"){r.b=Math.max(r.b||0,1);r.d=addDays(t,1)}
  else if(kind==="no"){r.b=0;r.d=addDays(t,1);r.x=(r.x||0)+1}
  else if(kind==="skip"){r.b=6;r.d=addDays(t,60);r.i="skip"}
  r.h=((r.h||"")+({know:"K",unsure:"U",no:"N",skip:"S"}[kind]||"")).slice(-12);
  markCtx();S.log[t]={r:{...((S.log[t]||{}).r||{}),[id]:({know:"K",unsure:"U",no:"N",skip:"S"}[kind])}};logDirty=true;
  queueRec(id,r);
  bump(kind==="know"?"k":kind==="unsure"?"u":kind==="no"?"x":"sk");
  if(kind!=="skip")bump(old?"rv":"nw");
}
/* test answers: meaning (tm) vs spelling (ts) record [right, wrong]; cf = word picked by mistake */
function logTest(id,type,ok,picked){
  const r=recOf(id);bump("tq");if(ok)bump("tc");bump("q_"+type);if(ok)bump("c_"+type);if(!r)return;
  const key=type==="en2ko"||type==="ko2en"?"tm":type==="syn"?"ty":"ts";const arr=(r[key]||[0,0]).slice();arr[ok?0:1]++;
  const n={b:0,d:ymd(),i:"",l:"",s:0,x:0,...r,[key]:arr};
  if(ok&&(r.tw||r.tw===undefined))n.tw="";
  if(!ok){n.x=(r.x||0)+1;n.b=Math.max(0,(r.b||0)-2);n.d=ymd();n.tw=ymd();n.h=((r.h||"")+"T").slice(-12);if(key==="tm"&&typeof picked==="string"&&picked!==id)n.cf=picked}
  queueRec(id,n);
}

/* ============ config, cheers, custom words */
/* settings: coalesced, one write at a time, local choice stays on screen until the store confirms it */
let cfgPending={},cfgInflight={},cfgBusy=false;
function saveCfg(patch){
  S.cfg={...S.cfg,...patch};Object.assign(cfgPending,patch);
  if(S.mode==="local"){cfgPending={};saveLocal();render();return}
  render();pumpCfg();
}
async function pumpCfg(){
  if(cfgBusy||!Object.keys(cfgPending).length)return;
  cfgBusy=true;const patch=cfgPending;cfgPending={};cfgInflight=patch;
  try{const ref=S.db.doc("meta/config");if(S.cfgExists)await ref.update(patch);else{await ref.set({...S.cfg});S.cfgExists=true}
    if(!Object.keys(cfgPending).length)toast(patch.exam?"시험 날짜를 "+fmtExam(patch.exam)+"로 저장했어":"설정 저장했어")}
  catch(e){cfgPending={...patch,...cfgPending};toast("설정을 저장하지 못했어. 인터넷 연결을 확인해줘");cfgBusy=false;cfgInflight={};return}
  cfgBusy=false;cfgInflight={};pumpCfg();
}
async function postCheer(text,kind="msg",extra={}){
  text=str(text,200);if(!text)return;
  const doc={by:S.me||"local",text,kind,day:ymd(),at:Date.now(),reacts:{},...extra};
  if(S.mode==="local"){S.cheers.unshift({id:"l"+Date.now(),...doc});saveLocal();render();return}
  try{await S.db.collection("cheers").add(doc)}catch(e){toast("응원을 못 보냈어. 인터넷 연결을 확인해줘")}
}
async function toggleReact(c){
  const me=S.me||"local";const on=c.reacts&&c.reacts[me];
  if(S.mode==="local"){c.reacts={...(c.reacts||{}),[me]:on?null:"👏"};saveLocal();render();return}
  try{await S.db.doc("cheers/"+c.id).update({reacts:{[me]:on?null:"👏"}})}catch(e){toast("반응을 못 남겼어")}
}
async function addCustom(list){
  const now=Date.now();let k=0;
  for(const c of list){
    const doc={w:c.w,...(c.no?{no:c.no}:{}),...(c.senses&&c.senses.length?{senses:c.senses,note:c.note||"",ph:c.ph||"",stars:c.stars||0}:{}),kb:c.kb!==false,pos:c.pos,ko:c.ko,ex:c.ex,exKo:c.exKo,fam:c.fam,syn:c.syn,book:"내 책",by:S.me||"local",at:now+(k++)};
    if(S.mode==="local"){const id="l"+now+"_"+k;setCustomAll([...(S.customAll||[]),{id:"c_"+id,docId:id,...doc}])}
    else{try{await timed(S.db.collection("custom").add(doc),20000)}catch(e){toast(e&&e.code==="quota_exceeded"?"단어장 저장 공간이 가득 찼어":"단어를 저장하지 못했어. 인터넷 연결을 확인해줘");break}}
  }
  if(S.mode==="local"){saveLocal();render()}
}
/* delete = move to trash (restorable); purge = gone for good */
function setCustomAll(list){S.customAll=list;S.custom=list.filter(c=>!c.deleted);S.trash=list.filter(c=>c.deleted).sort((a,b)=>(b.delAt||0)-(a.delAt||0))}
async function setDeleted(c,flag){
  const patch={deleted:flag,delAt:flag?Date.now():0};
  if(S.mode==="local"){setCustomAll(S.customAll.map(x=>x.id===c.id?{...x,...patch}:x));saveLocal();render();return true}
  try{await S.db.doc("custom/"+c.docId).update(patch);return true}catch(e){toast(flag?"삭제하지 못했어":"되돌리지 못했어");return false}
}
async function delCustom(c){if(await setDeleted(c,true))toast("'"+c.w+"'을(를) 휴지통으로 옮겼어")}
async function restoreCustom(c){if(await setDeleted(c,false))toast("'"+c.w+"'을(를) 되돌렸어")}
async function purgeCustom(c){
  if(S.mode==="local"){setCustomAll(S.customAll.filter(x=>x.id!==c.id));saveLocal();render();return}
  try{await S.db.doc("custom/"+c.docId).delete()}catch(e){toast("완전히 삭제하지 못했어")}
}

/* ============ automatic messages to Taylor (learner's device writes them, once per key) */
const AUTO={
 done:["🎉 {a} 오늘 분량 끝! · 카드 {n}장","✅ 오늘도 완료! 단어 {n}개 넘겼어","📚 {l} 오늘 할 일 끝. {n}개 클리어","🌙 오늘 몫 {n}개 완료. 내일도 같이 하자","💪 오늘 {n}개, 약속 지켰다!"],
 streak:["🔥 {s}일 연속 공부 중!","🔥 벌써 {s}일째 하루도 안 빠졌어","🔥 연속 {s}일 달성. 꾸준함이 제일 무서운 거야","🔥 {s}일 연속! 이제 습관이 됐네"],
 total:["🏅 외운 단어가 {t}개를 넘었어","🏅 누적 {t}개 돌파!","🏅 단어장에 {t}개가 쌓였어. 시험장 무기가 늘고 있어"],
 master:["⭐ 완벽히 외운 단어 {m}개 달성","⭐ 이제 {m}개는 눈 감고도 알아"],
 test:["💯 테스트 {n}문제 만점!","🎯 테스트 {c}/{n}. 거의 다 맞혔어!","📝 테스트 {c}/{n} 완료"],
 dday:["⏳ 토플까지 D-{d}. 지금까지 {t}개 외웠어","⏳ D-{d}! 누적 {t}개, 페이스 좋다","⏳ 시험까지 {d}일 남았어. 외운 단어 {t}개"]
};
function fill(t,v){return t.replace(/\{(\w)\}/g,(_,k)=>v[k]!=null?v[k]:"")}
function autoCheer(key,kind,vars){
  if(S.role!=="learner")return;
  if(S.cheers.some(c=>c.key===key)||autoSent.has(key))return;autoSent.add(key);
  const list=AUTO[kind];let t=pick(list);if(kind==="test")t=vars.c===vars.n?list[0]:vars.c>=vars.n-2?list[1]:list[2];
  postCheer(fill(t,{...vars,a:josa(nameL(),"이/가"),l:nameL()}),"auto",{key});
}
const autoSent=new Set();
function masteredCount(){let m=0;for(const id in S.prog.w){const r=S.prog.w[id];if(r.i!=="skip"&&r.b>=4)m++}return m}
function milestoneChecks(){
  const t=ymd();const s=streak();const n=learnedCount().n;const m=masteredCount();
  if([3,5,7,10,14,21,30,45,60,75].includes(s)&&S.prog.days[t]>0)autoCheer("streak-"+s+"-"+t,"streak",{s});
  const tm=Math.floor(n/50)*50;if(tm>=50)autoCheer("total-"+tm,"total",{t:tm});
  const mm=Math.floor(m/25)*25;if(mm>=25)autoCheer("master-"+mm,"master",{m:mm});
}
/* first open of each month saves that month's starting word states (used by the monthly PDF report) */
async function monthSnapshot(){
  if(S.mode!=="remote"||S.readOnly||!S.cfg.learnerId)return;
  const m=ymd().slice(0,7);const ref=S.db.doc("snap/"+m);
  try{const cur=await ref.get();if(cur.exists)return;
    const c={mastered:0,familiar:0,fresh:0,skip:0,unseen:0};for(const w of allWords())c[catOf(recOf(w.id))]++;
    await ref.set({month:m,at:Date.now(),day:ymd(),counts:c,total:allWords().length,custom:S.custom.length})}catch(e){}
}
function ddayCheck(){
  if(S.role!=="learner")return;const d=daysBetween(ymd(),S.cfg.exam);
  if([60,45,30,21,14,7,3,1].includes(d))autoCheer("dday-"+d+"-"+S.cfg.exam,"dday",{d,t:learnedCount().n});
}

/* ============ toast */
let toastT=null;
function toast(msg){let t=$("#toast");if(!t){t=el("div",{id:"toast",class:"toast",role:"status"});document.body.append(t)}t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},3200)}

/* ============ render root */
function capture(){const a=document.activeElement;const vals={};document.querySelectorAll("#app input[id],#app textarea[id],#layer input[id],#layer textarea[id]").forEach(i=>{if(i.type!=="checkbox"&&i.type!=="file"&&i.type!=="date")vals[i.id]=i.value});return {focus:a&&a.id,vals,sel:a&&a.selectionStart}}
function restore(k){for(const id in k.vals){const i=document.getElementById(id);if(i&&i.value!==k.vals[id]&&!i.dataset.fresh)i.value=k.vals[id]}if(k.focus){const f=document.getElementById(k.focus);if(f){f.focus();try{if(k.sel!=null)f.setSelectionRange(k.sel,k.sel)}catch{}}}}
/* Korean typing: only the results list is redrawn while typing, so the input keeps its IME composition */
function refreshResults(){const old=$("#bkResults");if(!old||S.tab!=="book"){render();return}const nr=viewBook().querySelector("#bkResults");if(nr)old.replaceWith(nr)}
function render(){
  if(SES.active)return;
  if(BK.composing&&document.activeElement&&document.activeElement.id==="bkSearch"){BK.deferred=true;return}
  const k=capture();
  const app=$("#app");
  let view;const ready=S.mode==="local"||(S.mode==="remote"&&S.got.cfg&&S.got.prog);
  if(!ready)view=el("div",{class:"wrap"},el("div",{class:"center"},el("div",{class:"rowline",style:"justify-content:flex-start;gap:10px"},el("div",{class:"spin"}),el("span",{class:"muted"},"단어장 여는 중…"))));
  else if(S.role==="claim"||(S.role==="learner"&&!S.cfg.onboarded&&S.mode==="remote"))view=viewOnboarding();
  else if(S.role==="supporter")view=S.tab==="book"?viewBook():S.tab==="trend"?viewTrend():S.tab==="mine"?viewHome():S.tab==="mytest"?viewTest():viewSupport();
  else view=S.tab==="test"?viewTest():S.tab==="book"?viewBook():S.tab==="trend"?viewTrend():viewHome();
  app.replaceChildren(view,ready&&S.role!=="claim"&&!(S.role==="learner"&&!S.cfg.onboarded&&S.mode==="remote")?tabbar():"");
  $("#layer").replaceChildren(S.wordSheet?viewWordSheet():S.editWord&&S.tab==="book"?viewEditSheet():S.trashSheet&&S.tab==="book"?viewTrashSheet():S.sheet?viewSheet():S.wrongSheet&&(S.tab==="test"||S.tab==="mytest")?viewWrongSheet():S.daySheet!=null&&(S.tab==="home"||S.tab==="mine")?viewDaySheet():"");
  restore(k);
}

function header(title){
  const left=daysBetween(ymd(),S.cfg.exam);
  return el("div",{class:"top"},
    el("div",{class:"dday"},el("span",{class:"lab"},title),el("span",{class:"big num"},left>0?"D-"+left:left===0?"D-DAY":"시험 끝"),el("span",{class:"lab"},"토플 시험 · "+fmtExam(S.cfg.exam))),
    el("button",{class:"iconbtn","aria-label":"설정",onclick:()=>{S.sheet=true;render()}},icon("gear")));
}
function tabbar(){
  const items=S.role==="supporter"?[["home",nameL()+" 진도","home"],["mine","내 공부","test"],["trend","기록","chart"],["book","책 단어","book"]]:[["home","홈","home"],["test","테스트","test"],["book","책 단어","book"],["trend","기록","chart"]];
  return el("nav",{class:"tabs","aria-label":"메뉴"},el("div",{class:"in"},items.map(([k,l,ic])=>el("button",{class:(S.tab===k||(k==="mine"&&S.tab==="mytest"))?"on":"","aria-current":S.tab===k?"page":null,onclick:()=>goTab(k)},el("span",{class:"ic"},icon(ic)),l))));
}

/* ============ learner home */
function ensurePreview(rem){
  const valid=S.preview.filter(id=>rem.includes(id));
  if(valid.length===S.preview.length&&valid.length===Math.min(5,rem.length)&&valid.length)return;
  S.preview=shuffle(rem).slice(0,5);
}
function viewHome(){
  const plan=todayPlan();const rem=plan.remaining;ensurePreview(rem);
  const total=plan.done+rem.length;const pct=total?Math.round(plan.done/total*100):100;
  const {n,k}=learnedCount();
  let card;
  if(!allWords().length){
    card=el("div",{class:"stack"},el("div",{class:"startcard"},el("div",{class:"donebox"},catArt("small"),el("span",{class:"big"},"아직 단어가 없어"),
      el("span",{class:"muted"},S.role==="learner"&&!S.isOwner?"책 페이지를 넣으면 여기서 바로 시작할 수 있어.":"책 단어 탭에서 페이지 사진을 올려줘.")),
      el("button",{class:"go",onclick:()=>goTab("book")},el("span",null,"책 단어 넣으러 가기"),icon("arrow"))));
  }else if(rem.length){
    card=el("div",{class:"stack"},el("div",{class:"startcard"},
      el("div",{class:"startlogo","aria-hidden":"true",svg:CAT_SVG}),
      el("button",{class:"go",onclick:()=>startSession(rem,"today")},el("span",{style:"display:flex;flex-direction:column;align-items:flex-start;gap:2px"},"단어 넘기기 시작",el("span",{class:"sub num"},"오늘 "+rem.length+"개 남음"+(plan.deferred?" · 복습 "+plan.deferred+"개는 내일로":""))),icon("arrow"))));
  }else{
    card=el("div",{class:"stack"},el("div",{class:"startcard"},el("div",{class:"donebox"},catArt("small"),el("span",{class:"big"},"오늘 분량 끝!"),el("span",{class:"muted"},plan.done+"개 봤어. 내일 다시 만날 단어들 챙겨둘게.")),
      el("button",{class:"go",onclick:()=>startExtra()},el("span",null,"추가로 복습하기"),icon("arrow"))));
  }
  const mine=S.ctx==="me";
  const rt=retestToday();
  const retestBtn=rt.length?el("button",{class:"retest",onclick:()=>startSession(rt,"retest")},el("span",null,"테스트에서 틀린 단어 ",el("b",{class:"num"},rt.length+"개")," 다시 보기"),icon("arrow")):null;
  const hr=kstHour();
  const nudge=!mine&&S.role==="learner"&&hr>=22&&plan.done>0&&!testedToday()?el("button",{class:"nudge",onclick:()=>goTab("test")},
    el("b",null,hr>=23?"🌙 11시야! 자기 전에 테스트 한 번만":"⏰ 10시야! 오늘 외운 거 테스트해 볼까?"),
    el("span",null,"오늘 단어는 다 봤는데 테스트를 아직 안 봤어. 10문제면 금방이야 →")):null;
  return el("main",{class:"wrap"},header(mine?"내 단어장":nameL()+"의 단어장"),mine?el("p",{class:"small muted",style:"margin:0"},josa(nameL(),"과/와")+" 같은 단어를 외워요. 내 기록은 "+nameL()+" 진도에 섞이지 않아요."):null,nudge,card,retestBtn,
    el("section",{class:"panel","aria-label":"진도"},
      el("button",{class:"rowline daybtn",onclick:()=>{S.daySheet=0;BK.open=null;BK.pages.day=0;render()},"aria-haspopup":"dialog"},el("h2",null,"오늘"),el("span",{class:"num small"},plan.done+" / "+total+" · 본 단어 보기 ›")),
      el("div",{class:"bar",role:"progressbar","aria-valuenow":pct,"aria-valuemin":0,"aria-valuemax":100},el("i",{style:"width:"+pct+"%"})),
      el("div",{class:"stats"},stat(streak()+"일","연속 학습"),stat(n,"외운 단어"),stat(k,"이미 알던 단어"))),
    mine?el("button",{class:"btn block",onclick:()=>goTab("mytest")},"테스트 보기"):cheerBox(),
    S.mode==="local"?el("p",{class:"note"},"미리보기 모드야. 기록은 이 브라우저에만 저장돼."):null);
}
function stat(v,l){return el("div",{class:"stat"},el("b",null,String(v)),el("span",null,l))}

/* ============ cheers tab: Taylor writes, Ina reads. Auto messages come from Ina's progress */
const CH={show:20};
/* only Taylor can send messages now, so every "msg" is Taylor's (also while Taylor tests as the learner) */
function isTaylorMsg(c){return c.kind==="msg"}
function isAuto(c){return c.kind==="auto"||c.kind==="done"}
function seenAt(){return Number(lsGet("tv-seen",0))||0}
function unreadCount(){const t=seenAt();return S.cheers.filter(c=>(S.role==="learner"?isTaylorMsg(c):isAuto(c))&&(c.at||0)>t).length}
function dayLabel(ms){const d=ymd(new Date(ms));const t=ymd();if(d===t)return "오늘";if(d===addDays(t,-1))return "어제";const x=parseD(d);return (x.getMonth()+1)+"월 "+x.getDate()+"일"}
/* one line on the home screen: Ina sees Taylor's latest message; Taylor sees Ina's latest news and can send a line */
const LN={open:false};
function oneLine(c,label){
  if(!c)return null;const unread=(c.at||0)>seenAt();setTimeout(()=>lsSet("tv-seen",Date.now()),0);
  return el("button",{class:"oneline"+(unread?" unread":"")+(LN.open?" open":""),onclick:()=>{LN.open=!LN.open;render()},"aria-expanded":LN.open?"true":"false"},
    el("span",{class:"who"},label),el("span",{class:"txt"},c.text),el("span",{class:"tm"},ago(c.at||0)));
}
function taylorBanner(){return oneLine(S.cheers.filter(isTaylorMsg).sort((a,b)=>(b.at||0)-(a.at||0))[0],"💬 응원")}
/* small cheer box on home: 2 latest messages from Taylor + 2 latest automatic news; Taylor (owner/supporter) can send */
/* cheer box: today's messages and alerts only, as status rows (newest at the bottom); box fits two rows and scrolls */
const CB={top:0,atBottom:true};
function cheerBox(){
  const start=kstDayStart(ymd());
  const list=S.cheers.filter(c=>(isTaylorMsg(c)||isAuto(c))&&(c.at||0)>=start).sort((a,b)=>(a.at||0)-(b.at||0));
  const canSend=S.role==="supporter"||S.isOwner||S.mode==="local";
  const seen=seenAt();setTimeout(()=>lsSet("tv-seen",Date.now()),0);
  const mineView=S.role==="supporter"||S.isOwner||S.mode==="local";
  const row=c=>{const auto=isAuto(c);return el("li",{class:"cb-row "+(auto?"news":"msg")+((c.at||0)>seen&&!auto&&!mineView?" unread":"")},
    el("span",{class:"cb-tag"},auto?"🔔 알림":"💬 "+(c.by&&c.by===S.cfg.learnerId?nameL():"응원")),el("span",{class:"txt"},auto?c.text.replace(/^\S+\s/,""):c.text))};
  const send=()=>{const i=$("#cheerIn");if(!i)return;const v=i.value.trim();if(!v)return;i.value="";i.dataset.fresh="1";
    if(S.mode!=="local"){S.cheers=[{id:"tmp"+Date.now(),by:S.me,text:v,kind:"msg",at:Date.now()},...S.cheers];CB.atBottom=true;render()}
    postCheer(v).catch(()=>{});setTimeout(()=>{delete i.dataset.fresh},0)};
  if(list.length)setTimeout(()=>{const t=$("#cbScroll");if(t)t.scrollTop=CB.atBottom?t.scrollHeight:CB.top},0);
  return el("section",{class:"panel cheerbox","aria-label":"응원"},
    el("h2",null,josa(nameL(),"을/를")+" 위한 응원"),
    list.length?el("ul",{class:"cb-list cb-scroll",id:"cbScroll",onscroll:e=>{const t=e.currentTarget;CB.top=t.scrollTop;CB.atBottom=t.scrollHeight-t.scrollTop-t.clientHeight<6}},list.map(row)):
      el("p",{class:"cb-empty"},canSend?"오늘은 아직 메시지가 없네. 오늘 분량을 끝내면 알림이 여기에 올라올 거야.":"오늘 내 응원이랑 학습 알림이 여기에 올라올 거야."),
    canSend?el("form",{class:"composer slim",onsubmit:e=>{e.preventDefault();send()}},
      el("input",{id:"cheerIn",placeholder:"칭찬과 격려 많이 해줄게. 힘내자!",maxlength:"120",autocomplete:"off","aria-label":nameL()+"에게 보낼 메시지"}),
      el("button",{class:"btn primary",type:"submit"},"보내기")):null);
}

/* ============ supporter home */
function viewSupport(){
  const plan=todayPlan();const total=plan.done+plan.remaining.length;const pct=total?Math.round(plan.done/total*100):0;
  const {n,k}=learnedCount();const days=S.prog.days||{};
  const strip=[];for(let i=13;i>=0;i--){const d=addDays(ymd(),-i);const c=days[d]||0;strip.push(el("i",{class:(c>=40?"l3":c>=15?"l2":c>0?"l1":"")+(i===0?" today":""),title:d+" · "+c+"개"}))}
  const noLearner=!S.cfg.learnerId;
  return el("main",{class:"wrap"},header(nameL()+" 응원하기"),
    noLearner?el("section",{class:"panel"},el("h2",null,josa(nameL(),"을/를")+" 기다리는 중"),el("p",{class:"muted small",style:"margin:0"},josa(nameL(),"이/가")+" 초대 링크로 들어와서 '시작하기'를 누르면 진도가 여기에 보여요."),
      inviteBtn("learner",nameL()+"에게 보낼 초대 링크"),
      S.isOwner?el("button",{class:"btn block",onclick:()=>claim()},"내가 먼저 학습 화면 써보기"):null):
    el("section",{class:"panel","aria-label":nameL()+"의 진도"},
      el("button",{class:"rowline daybtn",onclick:()=>{S.daySheet=0;BK.open=null;BK.pages.day=0;render()},"aria-haspopup":"dialog"},el("h2",null,nameL()+"의 오늘"),el("span",{class:"num small"},plan.done+" / "+total+" · 본 단어 보기 ›")),
      el("div",{class:"bar"},el("i",{style:"width:"+pct+"%"})),
      el("div",{class:"stats"},stat(streak()+"일","연속 학습"),stat(n,"외운 단어"),stat(k,"이미 알던 단어")),
      el("div",{class:"rowline small muted"},el("span",null,"최근 2주"),el("span",null,"진할수록 많이 본 날")),
      el("div",{class:"strip","aria-label":"최근 2주 학습량"},strip)),
    noLearner?null:cheerBox());
}

/* ============ claim */
async function claim(){
  if(S.mode!=="remote")return;
  const prev=S.cfg.learnerId;
  try{const ref=S.db.doc("meta/config");const patch={learnerId:S.me,onboarded:false};
    if(S.cfgExists)await ref.update(patch);else await ref.set({...S.cfg,...patch});S.cfgExists=true;Object.assign(S.cfg,patch)}
  catch(e){toast("시작하지 못했어. 초대 링크로 다시 들어와 줘");return}
  if(prev&&prev!==S.me){try{const q=await S.db.collection("cheers").get();for(const d of q.docs)await S.db.doc("cheers/"+d.id).delete();S.cheers=[]}catch(e){}}
  OB.step=2;decideRole();S.tab="home";render();
}
/* ============ onboarding: 1 welcome → 2 exam date → 3 first book photos */
const OB={step:1};
function obFrame(step,body){
  return el("main",{class:"wrap onb"},
    step>1&&S.isOwner?el("button",{class:"reshuffle",style:"align-self:flex-end",onclick:()=>{PREF.asSupport=true;savePref();decideRole();S.tab="home";render()}},"응원 화면 보기"):null,
    el("div",{class:"obsteps","aria-label":"단계 "+step+" / 4"},[1,2,3,4].map(i=>el("i",{class:i<=step?"on":""}))),
    body);
}
function finishOnboarding(){BK.last=null;BK.err="";OB.step=1;saveCfg({onboarded:true});S.tab="home";window.scrollTo(0,0)}
function viewOnboarding(){
  const step=S.role==="claim"?1:Math.max(2,OB.step);
  if(step===1)return obFrame(1,el("div",{class:"center"},
    catArt("big"),
    el("h1",{class:"hero"},josa(nameL(),"아/야")+", ",el("span",{class:"hl"},"영어공부하자!")),
    el("p",{class:"muted",style:"margin:0"},"하루에 단어 카드 몇 장씩만 같이 넘겨보자. 아는 건 오른쪽, 모르는 건 왼쪽으로 밀면 돼. 시험 날짜랑 단어책만 알려주면 바로 시작할 수 있어."),
    el("button",{class:"btn primary block",style:"padding:16px;font-size:17px",onclick:claim},"시작하기"),
    S.isOwner?el("button",{class:"btn block",onclick:()=>{S.supportOnly=true;decideRole();render()}},"응원 화면으로 가기"):null));
  if(step===2){const left=daysBetween(ymd(),S.cfg.exam);
    return obFrame(2,el("div",{class:"center"},
      el("h1",{class:"hero"},"토플 시험은 ",el("span",{class:"hl"},"언제")," 보는 걸로 할까?"),
      el("p",{class:"muted",style:"margin:0"},"날짜를 정하면 남은 날에 맞춰서 하루 분량을 챙겨줄게. 날짜는 나중에 바꿀 수도 있으니까 너무 걱정하지 마."),
      el("div",{class:"field"},el("label",{for:"obExam"},"시험 날짜"),el("input",{id:"obExam",type:"date",value:S.cfg.exam,min:ymd(),onchange:e=>{const v=e.target.value;if(/^\d{4}-\d{2}-\d{2}$/.test(v)&&v!==S.cfg.exam)saveCfg({exam:v})}})),
      el("div",{class:"obdday"},el("b",{class:"num"},left>0?"D-"+left:left===0?"D-DAY":"날짜를 확인해줘"),el("span",null,fmtExam(S.cfg.exam)+"까지 · 하루 새 단어 "+S.cfg.daily+"개")),
      el("div",{class:"field"},el("label",{for:"obDaily"},"하루에 몇 개씩 외울까?"),el("select",{id:"obDaily",onchange:e=>saveCfg({daily:Number(e.target.value)})},[10,20,30,50].map(v=>{const o=el("option",{value:String(v)},v+"개");if(Number(S.cfg.daily)===v)o.selected=true;return o})),el("span",{class:"small muted"},"더 많이 외우고 싶으면 나한테 말해줘. 추가해줄게!")),
      el("button",{class:"btn primary block",style:"padding:16px;font-size:17px",disabled:left<0,onclick:()=>{OB.step=3;window.scrollTo(0,0);render()}},"다음")));}
  if(step===4)return viewObInstall();
  const added=BK.last?BK.last.added.length:0;
  return obFrame(3,el("div",{class:"center"},
    el("h1",{class:"hero"},"공부할 ",el("span",{class:"hl"},"단어책"),", 찍어줄래?"),
    el("p",{class:"muted",style:"margin:0"},"책 페이지를 찍으면 단어, 비슷한 말, 뜻, 예문이랑 번역까지 책에 있는 그대로 정리해서 넣어둘게."),
    el("div",{class:"obstar",role:"note"},el("b",null,"★ 꼭 읽어줘!"),
      el("p",null,"페이지 ",el("strong",null,"전체가 정면으로")," 나오게, 밝은 곳에서 찍어줘."),
      el("p",null,"사진 읽기는 ",el("strong",null,"하루 횟수 제한"),"이 있어. 막히면 내일 다시 올려줘.")),
    el("input",{type:"file",accept:"image/*",multiple:true,id:"obPhoto",hidden:true,onchange:e=>{const f=e.target.files;const copy=f?[...f]:[];e.target.value="";onPhotos(copy)}}),
    el("button",{class:"photo",disabled:BK.busy,onclick:()=>{if(!S.sample){BK.err=noSampleMsg();render();return}$("#obPhoto").click()}},icon("camera"),el("span",null,el("b",null,added?"페이지 더 찍기":"책 페이지 찍기"),el("span",null,"찍거나 앨범에서 여러 장 골라도 돼"))),
    BK.busy?el("div",{class:"panel",role:"status"},el("div",{class:"rowline",style:"justify-content:flex-start;gap:10px"},el("div",{class:"spin"}),el("span",null,BK.prog&&BK.prog.n>1?"사진 "+BK.prog.i+"/"+BK.prog.n+" · ":"",el("span",{id:"bkStage"},BK.stage||"준비 중"))),el("button",{class:"btn block",onclick:()=>BK.ctl&&BK.ctl.abort()},"그만하기")):null,
    BK.err?el("p",{class:"note",style:"color:var(--bad);border-color:var(--bad)",role:"alert"},BK.err):null,
    added?el("p",{class:"obdone"},"✓ 단어 "+added+"개 넣었어!"+(BK.last.skipped?" (이미 있던 "+BK.last.skipped+"개는 뺐어)":"")):null,
    el("button",{class:"btn primary block",style:"padding:16px;font-size:17px",disabled:BK.busy||!added,onclick:obNext4},"다음"),
    added?null:el("button",{class:"btn block",disabled:BK.busy,onclick:obNext4},"나중에 할래")));
}
function obNext4(){BK.last=null;BK.err="";OB.step=4;window.scrollTo(0,0);render()}
const SHARE_SVG='<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
const PLUS_SVG='<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
function viewObInstall(){
  const standalone=(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
  const step=(n,body,ic)=>el("li",null,el("span",{class:"obn"},String(n)),el("div",null,body),ic?el("span",{class:"obic",svg:ic}):null);
  return obFrame(4,el("div",{class:"center"},
    catArt("small"),
    el("h1",{class:"hero"},"홈 화면에 ",el("span",{class:"hl"},"앱처럼")," 놓아줘"),
    el("p",{class:"muted",style:"margin:0"},"홈 화면에 추가해두면 바로 열 수 있어. 훨씬 편할 거야."),
    standalone?el("p",{class:"obdone"},"✓ 이미 홈 화면에서 열었네! 이대로 쓰면 돼."):
    el("ol",{class:"obhow"},
      step(1,["이 링크를 ",el("b",null,"사파리"),"로 열어줘"]),
      step(2,["화면 아래 ",el("b",null,"공유 버튼"),"을 눌러줘"],SHARE_SVG),
      step(3,["목록을 내려서 ",el("b",null,"홈 화면에 추가"),"를 눌러줘"],PLUS_SVG),
      step(4,["이제 ",el("b",null,"홈 화면"),"에서 바로 열면 끝!"])),
    el("button",{class:"btn primary block",style:"padding:16px;font-size:17px",onclick:finishOnboarding},"공부 시작하기")));
}
/* ============ settings sheet */
let confirmReset=false;
function viewSheet(){
  const close=()=>{S.sheet=false;confirmReset=false;render()};
  const learner=S.role==="learner";
  return el("div",{class:"scrim",onclick:e=>{if(e.target===e.currentTarget)close()}},el("div",{class:"sheet",role:"dialog","aria-label":"설정"},
    el("div",{class:"rowline"},el("h2",null,"설정"),el("button",{class:"iconbtn","aria-label":"닫기",onclick:close},icon("close"))),
    el("div",{class:"field"},el("label",{for:"examDate"},"토플 시험 날짜"),el("input",{id:"examDate",type:"date",value:S.cfg.exam,onchange:e=>{const v=e.target.value;if(/^\d{4}-\d{2}-\d{2}$/.test(v)&&v!==S.cfg.exam)saveCfg({exam:v})}}),el("span",{class:"small muted"},"저장된 날짜: "+fmtExam(S.cfg.exam)+" (D-"+Math.max(0,daysBetween(ymd(),S.cfg.exam))+")")),
    learner?el("div",{class:"field"},el("label",{for:"daily"},"하루 새 단어"),el("select",{id:"daily",onchange:e=>saveCfg({daily:Number(e.target.value)})},[10,20,30,50].map(v=>{const o=el("option",{value:String(v)},v+"개");if(Number(S.cfg.daily)===v)o.selected=true;return o}))):null,
    learner?el("div",{class:"field"},el("label",null,"카드 앞면"),el("div",{class:"seg",role:"group"},[["en","영어"],["ko","한국어"],["mix","섞기"]].map(([v,l])=>el("button",{class:PREF.dir===v?"on":"",onclick:()=>{PREF.dir=v;savePref();render()}},l)))):null,
    learner&&"speechSynthesis" in window?el("div",{class:"field"},el("label",null,"카드가 나올 때 발음 자동 재생"),el("div",{class:"seg",role:"group"},[[true,"켜기"],[false,"끄기"]].map(([v,l])=>el("button",{class:PREF.speak===v?"on":"",onclick:()=>{PREF.speak=v;savePref();render()}},l)))):null,
    S.mode==="remote"&&S.isOwner&&S.cfg.learnerId===S.me?el("div",{class:"field"},el("label",null,"화면 보기 (테스트용)"),el("div",{class:"seg",role:"group"},[[false,nameL()+" 화면"],[true,"응원 화면"]].map(([v,l])=>el("button",{class:!!PREF.asSupport===v?"on":"",onclick:()=>{PREF.asSupport=v;savePref();S.sheet=false;decideRole();S.tab="home";render()}},l))),el("span",{class:"small muted"},"이 기기에서만 바뀌고, 기록은 그대로예요.")):null,
    S.mode==="remote"&&S.isOwner?el("div",{class:"field"},el("label",null,"학습자 연결"),
      el("p",{class:"small",style:"margin:0"},!S.cfg.learnerId?"아직 연결된 학습자가 없어요.":S.cfg.learnerId===S.me?"지금은 내 계정이 학습자로 연결돼 있어요 (테스트용).":josa(nameL(),"이/가")+" 학습자로 연결돼 있어요."),
      S.cfg.learnerId?(confirmReset?el("div",{style:"display:flex;flex-direction:column;gap:8px"},
          el("p",{class:"small",style:"margin:0;color:var(--bad)"},"연결을 끊으면 다음에 링크를 여는 사람이 학습자가 돼요. 학습 기록(외운 단어, 날짜별 기록, 테스트 결과)도 지울까요? 책 단어 목록은 어느 쪽이든 남아요."),
          el("button",{class:"btn danger block",onclick:async()=>{await saveCfg({learnerId:null,onboarded:false});try{await S.db.doc("progress/main").delete();S.ctxs.ina.prog={w:{},days:{},st:{}};S.ctxs.ina.progExists=false;for(const c of ["log","snap"]){const q=await S.db.collection(c).get();for(const d of q.docs)await S.db.doc(c+"/"+d.id).delete()}S.ctxs.ina.log={}}catch{}confirmReset=false;S.sheet=false;decideRole();render()}},"연결 끊고 기록도 지우기"),
          el("button",{class:"btn block",onclick:async()=>{await saveCfg({learnerId:null,onboarded:false});confirmReset=false;S.sheet=false;decideRole();render()}},"연결만 끊기 (기록 유지)"),
          el("button",{class:"btn block",onclick:()=>{confirmReset=false;render()}},"취소"))
        :el("button",{class:"btn block",onclick:()=>{confirmReset=true;render()}},"학습자 연결 해제…")):null):null,
    S.mode==="remote"&&window.RT?viewBookSettings():null,
    el("div",{class:"field"},el("label",null,"기록 백업"),
      el("button",{class:"btn block withicon",disabled:BKP.busy,onclick:doBackup},icon("download"),BKP.busy?"백업 파일 만드는 중…":"백업 파일 저장 (JSON)"),
      S.mode==="remote"&&S.isOwner?[el("input",{type:"file",accept:".json,application/json",id:"importIn",hidden:true,onchange:e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(f)importBackup(f)}}),
        el("button",{class:"btn block",disabled:BKP.busy,onclick:()=>$("#importIn").click()},"백업 파일에서 가져오기")]:null,
      el("span",{class:"small muted"},BKP.msg||"외운 기록, 책 단어, 응원 메시지를 파일 하나로 저장해. 가끔 한 번씩 받아두면 안심이야.")),
    el("p",{class:"small muted",style:"margin:0"},"단어장: 책 사진으로 넣은 Hackers TOEFL Vocabulary 단어. 뜻·유의어·예문·번역은 책 그대로야.")));
}

/* ============ word book (space): invites, other books, sign out */
function inviteBtn(as,label){
  return el("button",{class:"btn block",onclick:async()=>{const url=RT.invite(as);
    try{if(navigator.share){await navigator.share({title:"토플 단어장",url});return}}catch(e){if(e&&e.name==="AbortError")return}
    try{await navigator.clipboard.writeText(url);toast("초대 링크를 복사했어")}catch{prompt("이 링크를 보내줘",url)}}},label);
}
function viewBookSettings(){
  const others=RT.spaces.filter(s=>s.id!==RT.sid);
  return el("div",{class:"field"},el("label",null,"단어장"),
    S.isOwner?el("p",{class:"small muted",style:"margin:0"},"공부하는 사람 이름"):null,
    S.isOwner?el("form",{class:"composer slim",onsubmit:e=>{e.preventDefault();const v=$("#lnameIn").value.trim().slice(0,20);if(v&&v!==nameL())RT.renameLearner(v).then(()=>{toast("이름을 바꿨어");render()},()=>toast("이름을 바꾸지 못했어"))}},
      el("input",{id:"lnameIn",value:nameL(),maxlength:"20","aria-label":"공부하는 사람 이름"}),el("button",{class:"btn",type:"submit"},"이름 저장")):null,
    S.cfg.learnerId?null:inviteBtn("learner","공부할 사람 초대 링크"),
    inviteBtn("supporter","응원할 사람 초대 링크"),
    others.map(s=>el("button",{class:"btn block",onclick:()=>RT.switchTo(s.id)},(s.learnerName||"단어장")+"의 단어장으로 바꾸기")),
    el("button",{class:"btn block",onclick:()=>RT.newSpace()},"새 단어장 만들기"),
    el("button",{class:"btn block",onclick:()=>RT.signOut()},"로그아웃"));
}

/* ============ backup */
/* bring a backup file back in (also the file saved from the old claude.ai artifact).
   The learner link is not carried over: the learner opens the invite link and presses 시작하기 again */
async function importBackup(file){
  let d;try{d=JSON.parse(await file.text())}catch{toast("백업 파일을 읽지 못했어");return}
  if(!d||d.app!=="toefl-vocab"){toast("단어장 백업 파일이 아니야");return}
  BKP.busy=true;BKP.msg="";render();
  let n=0;const put=(p,v)=>S.db.doc(p).set(v).then(()=>{n++});
  try{
    const jobs=[];
    if(d.config){const {learnerId,...rest}=d.config;jobs.push(put("meta/config",{...rest,learnerId:S.cfg.learnerId||null,onboarded:S.cfg.learnerId?!!S.cfg.onboarded:false}))}
    if(d.progress)jobs.push(put("progress/main",d.progress));
    for(const c of ["log","custom","cheers","snap"])for(const id in d[c]||{})jobs.push(put(c+"/"+id,d[c][id]));
    if(d.myStudy){if(d.myStudy.progress)jobs.push(put("data/users/"+S.me+"/prog",d.myStudy.progress));for(const id in d.myStudy.log||{})jobs.push(put("data/users/"+S.me+"/prog/log/"+id,d.myStudy.log[id]))}
    await Promise.all(jobs);BKP.msg="가져왔어: 문서 "+n+"개";
  }catch(e){BKP.msg="가져오다 멈췄어 ("+n+"개까지). 다시 하면 처음부터 덮어써."}
  BKP.busy=false;render();
}
const BKP={busy:false,msg:""};
async function collectBackup(){
  const out={app:"toefl-vocab",version:1,exportedAt:new Date().toISOString(),mode:S.mode};
  if(S.mode!=="remote"){out.config=S.cfg;out.progress=S.prog;out.log=S.log;out.custom=S.customAll;out.cheers=S.cheers;return out}
  const db=S.db;const docs=async p=>{const q=await db.collection(p).get();const o={};for(const d of q.docs)o[d.id]=d.data();return o};
  const one=async p=>{const s=await db.doc(p).get();return s.exists?s.data():null};
  const [config,progress,log,custom,cheers,snap]=await Promise.all([one("meta/config"),one("progress/main"),docs("log"),docs("custom"),docs("cheers"),docs("snap").catch(()=>({}))]);
  Object.assign(out,{config,progress,log,custom,cheers,snap});
  const mine=await one("data/users/"+S.me+"/prog").catch(()=>null);
  if(mine){out.myStudy={progress:mine,log:await docs("data/users/"+S.me+"/prog/log").catch(()=>({}))}}
  return out;
}
async function doBackup(){
  if(BKP.busy)return;BKP.busy=true;BKP.msg="";render();
  const name="toefl-backup-"+ymd()+".json";
  try{
    const json=JSON.stringify(await collectBackup(),null,1);
    const dl=window.claude&&typeof claude.use==="function"?await claude.use("downloads"):null;
    if(dl){await dl.save({filename:name,data:json});BKP.msg="저장했어: "+name}
    else{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([json],{type:"application/json"}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);BKP.msg="저장했어: "+name}
  }catch(e){const c=e&&e.code;BKP.msg=c==="declined"?"저장 취소했어.":c==="rate_limited"?"저장 창이 이미 열려 있어. 조금 있다 다시 눌러줘.":"백업을 못 만들었어. 조금 있다 다시 해줘."}
  BKP.busy=false;render();
}
/* ============ study session */
const SES={active:false,q:[],pos:0,flipped:false,mode:"today",seen:0,front:"en",startDone:0};
function startSession(ids,mode,firstId){
  if(!ids.length){toast("볼 단어가 없어");return}
  let q=mode==="extra"?[...ids]:shuffle(ids);
  // new words spread out between reviews
  if(mode==="today"){const nw=q.filter(id=>!recOf(id)),rv=q.filter(id=>recOf(id));q=[];let a=0,b=0;while(a<nw.length||b<rv.length){if(b<rv.length)q.push(rv[b++]);if(b<rv.length)q.push(rv[b++]);if(a<nw.length)q.push(nw[a++])}}
  if(firstId){q=q.filter(x=>x!==firstId);q.unshift(firstId)}
  Object.assign(SES,{active:true,q,pos:0,flipped:false,mode,seen:0,startDone:doneToday(),checked:false,round:1,rStart:0,rDone:0,rSkip:0,pending:[]});
  SES.front=frontFor();
  renderSession();
}
function startExtra(){
  const P=S.prog.w;const ids=allWords().filter(w=>P[w.id]&&P[w.id].i!=="skip").map(w=>w.id);
  if(!ids.length){toast("아직 복습할 단어가 없어");return}
  // ① today's 몰랐음·애매 → ② older words still at 몰랐음·애매 → ③ least-settled words (low box, seen longest ago)
  const t=ymd();const weak=r=>{const m=lastMark(r);return m==="N"||m==="U"||m==="T"||!!r.tw};
  const t1=[],t2=[],t3=[];for(const id of shuffle(ids)){const r=P[id];if(weak(r))(r.l===t?t1:t2).push(id);else t3.push(id)}
  t2.sort((a,b)=>(lastMark(P[a])==="N"?0:1)-(lastMark(P[b])==="N"?0:1));
  t3.sort((a,b)=>((P[a].b||0)-(P[b].b||0))||String(P[a].l||"").localeCompare(String(P[b].l||"")));
  const sorted=[...t1,...t2,...t3].slice(0,20);
  startSession(sorted,"extra");
}
function frontFor(){return PREF.dir==="mix"?(Math.random()<.5?"en":"ko"):PREF.dir}
function endSession(){SES.active=false;flush();$("#layer").replaceChildren(S.sheet?viewSheet():"");render()}
function speak(t){try{if(!("speechSynthesis" in window))return;const u=new SpeechSynthesisUtterance(t);u.lang="en-US";u.rate=.9;speechSynthesis.cancel();speechSynthesis.speak(u)}catch{}}

function renderSession(){
  const layer=$("#layer");
  if(SES.pos>=SES.q.length){layer.replaceChildren(viewSessionEnd());return}
  const id=SES.q[SES.pos];const w=byId(id);
  if(!w){SES.pos++;renderSession();return}
  const fresh=!recOf(id);
  const total=Math.max(1,SES.q.length-SES.rStart-SES.rSkip);const again=SES.round>1;const pct=Math.round(SES.rDone/total*100);
  const card=el("div",{class:"card"+(SES.flipped?" flipped":""),tabindex:"0","aria-label":"단어 카드. 탭하면 뒤집혀"},
    el("span",{class:"stamp yes"},"알았음"),el("span",{class:"stamp no"},"몰랐음"),
    SES.flipped?(fresh?el("span",{class:"tag"},"새 단어"):w.src!=="awl"?el("span",{class:"tag"},"책 단어"):null):null,
    el("div",{class:"front"},
      SES.front==="en"||SES.flipped?el("span",{class:"word",lang:"en"},w.w):el("span",{class:"kofront"},w.ko),
      ),
    SES.flipped?el("div",{class:"back"},
      el("div",{class:"rowline"},w.senses&&w.senses.length?el("span",{class:"ph"},w.ph?"["+w.ph+"]":""):el("span",{class:"ko"},w.ko,w.pos?el("span",{class:"pos-inline"}," "+w.pos):null),"speechSynthesis" in window?el("button",{class:"speak","aria-label":"발음 듣기",onclick:e=>{e.stopPropagation();speak(w.w)}},icon("sound")):null),
      wordBody(w,{src:true})):null);card.append(el("div",{class:"cardlogo","aria-hidden":"true",svg:CAT_SVG}));
  attachSwipe(card,id);
  const rates=el("div",{class:"rates"},
    el("button",{class:"no",onclick:()=>doRate(id,"no")},"몰랐음",el("small",null,"← 다시 보기")),
    el("button",{class:"mid",onclick:()=>doRate(id,"unsure")},"애매",el("small",null,"내일 다시")),
    el("button",{class:"yes",onclick:()=>doRate(id,"know")},"알았음",el("small",null,"→ 간격 늘리기")));
  layer.replaceChildren(el("div",{class:"session",role:"dialog","aria-label":"단어 카드"},el("div",{class:"in"},
    el("div",{class:"shead"},el("button",{class:"iconbtn","aria-label":"그만하기",onclick:endSession},icon("close")),el("div",{class:"bar"},el("i",{style:"width:"+pct+"%"})),again?el("span",{class:"againpill num"},SES.round+"바퀴째 · "+(SES.rDone+1)+"/"+total):el("span",{class:"num small muted"},(SES.rDone+1)+"/"+total)),
    el("div",{class:"deck"},card),
    rates,
    el("button",{class:"skipknown",onclick:()=>doRate(id,"skip")},"이미 아는 단어야 (빼기)"))));
  if(PREF.speak&&!SES.flipped&&SES.front==="en")speak(w.w);
}
function flip(){SES.flipped=!SES.flipped;renderSession();if(SES.flipped&&PREF.speak&&SES.front==="ko"){const w=byId(SES.q[SES.pos]);if(w)speak(w.w)}}
function doRate(id,kind){
  const wasNew=!recOf(id);
  rate(id,kind);SES.seen++;
  if(kind==="skip")SES.rSkip++;else SES.rDone++;
  // 몰랐음·애매 wait until the whole round is done, then come back as a new round in a fresh order
  if((kind==="no"||kind==="unsure")&&!SES.pending.includes(id))SES.pending.push(id);
  if(kind==="skip"&&wasNew&&SES.mode==="today"){const inQ=new Set(SES.q);const nx=allWords().find(w=>!recOf(w.id)&&!inQ.has(w.id));if(nx)SES.q.push(nx.id)}
  SES.pos++;
  if(SES.pos>=SES.q.length&&SES.pending.length){let nx=shuffle(SES.pending);if(nx.length>1&&nx[0]===id){nx.push(nx.shift())}
    SES.q.push(...nx);SES.round++;SES.rStart=SES.pos;SES.rDone=0;SES.rSkip=0;SES.pending=[]}SES.flipped=false;SES.front=frontFor();
  if(navigator.vibrate)try{navigator.vibrate(8)}catch{}
  renderSession();
}
function attachSwipe(card,id){
  let sx=0,sy=0,dx=0,dy=0,down=false,pid=null;
  const yes=card.querySelector(".stamp.yes"),no=card.querySelector(".stamp.no");
  card.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;down=true;pid=e.pointerId;sx=e.clientX;sy=e.clientY;dx=dy=0;card.setPointerCapture(pid);card.style.transition="none"});
  card.addEventListener("pointermove",e=>{if(!down)return;dx=e.clientX-sx;dy=e.clientY-sy;card.style.transform="translateX("+dx+"px) rotate("+dx/18+"deg)";yes.style.opacity=Math.max(0,Math.min(1,dx/90));no.style.opacity=Math.max(0,Math.min(1,-dx/90))});
  const up=()=>{if(!down)return;down=false;card.style.transition="transform .2s";
    if(dx>90){card.style.transform="translateX(120%) rotate(12deg)";setTimeout(()=>doRate(id,"know"),150)}
    else if(dx<-90){card.style.transform="translateX(-120%) rotate(-12deg)";setTimeout(()=>doRate(id,"no"),150)}
    else{card.style.transform="";yes.style.opacity=0;no.style.opacity=0;if(Math.abs(dx)<8&&Math.abs(dy)<8)flip()}};
  card.addEventListener("pointerup",up);card.addEventListener("pointercancel",()=>{down=false;card.style.transform=""});
  card.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();flip()}else if(e.key==="ArrowRight")doRate(id,"know");else if(e.key==="ArrowLeft")doRate(id,"no");else if(e.key==="ArrowDown")doRate(id,"unsure")});
  setTimeout(()=>card.focus({preventScroll:true}),0);
}
function viewSessionEnd(){
  const plan=todayPlan();const finished=SES.mode==="today"&&plan.remaining.length===0;
  if(S.role==="learner"&&!SES.checked){SES.checked=true;
    if(finished){const me=S.me||"local";const already=S.cheers.some(c=>(c.kind==="done"||c.key==="done-"+ymd())&&c.day===ymd()&&c.by===me);if(!already)autoCheer("done-"+ymd(),"done",{n:plan.done})}
    milestoneChecks();
  }
  return el("div",{class:"session"},el("div",{class:"in",style:"justify-content:center;gap:18px"},
    finished?catArt("big"):null,
    el("h1",{class:"endbig"},finished?"오늘 분량 끝!":"잘했어!"),
    el("p",{class:"muted",style:"margin:0"},SES.seen+"번 넘겼어. "+(finished?"나한테 완료 알림 보냈어.":plan.remaining.length?"오늘 남은 단어 "+plan.remaining.length+"개는 언제든 이어서 보면 돼.":"")),
    el("div",{class:"stats"},stat(plan.done,"오늘 본 단어"),stat(streak()+"일","연속 학습"),stat(learnedCount().n,"외운 단어")),
    el("button",{class:"btn primary block",style:"padding:15px",onclick:endSession},"홈으로")));
}

/* ============ trend tab */
const TR={sel:{},off:{},cat:null};
const NS="http://www.w3.org/2000/svg";
function sv(tag,attrs,...kids){const e=document.createElementNS(NS,tag);for(const k in attrs||{})if(attrs[k]!=null)e.setAttribute(k,attrs[k]);for(const c of kids.flat())if(c!=null)e.append(c.nodeType?c:document.createTextNode(String(c)));return e}
// study volume = distinct words rated that day (from the day log, one mark per word): new if first introduced that day, else review; split by 알았음
function dayVol(d){const L=(S.log[d]||{}).r;if(!L)return null;const o={nwk:0,nwo:0,rvk:0,rvo:0};for(const id in L){const m=L[id];if(m==="S")continue;const r=S.prog.w[id];const isNew=!!r&&r.i===d;const k=m==="K";o[(isNew?"nw":"rv")+(k?"k":"o")]++}return o}
function dayStats(d){const st=S.prog.st[d]||{};let nw=st.nw||0,rv=st.rv||0;if(!nw&&!rv&&S.prog.days[d])rv=S.prog.days[d];
  const dv=dayVol(d);let vol=dv||{nwk:0,nwo:nw,rvk:0,rvo:rv};if(dv){nw=dv.nwk+dv.nwo;rv=dv.rvk+dv.rvo}const rated=(st.k||0)+(st.u||0)+(st.x||0);return {nw,rv,vol,k:st.k||0,u:st.u||0,x:st.x||0,rated,tq:st.tq||0,tc:st.tc||0}}
function md(d){const x=parseD(d);return (x.getMonth()+1)+"/"+x.getDate()}
/* bar chart: one scale, gridlines, tap/hover a day to read its values */
function barChart(key,days,series,opts){
  const W=340,H=150,L=30,R=6,T=10,B=22;const n=days.length;const bw=(W-L-R)/n;
  const tot=days.map(d=>series.reduce((a,s)=>a+(d.v[s.k]||0),0));
  let max=opts.max||Math.max(4,...tot);if(!opts.max){const step=max<=10?5:max<=40?10:max<=100?25:50;max=Math.ceil(max/(2*step))*2*step}
  const y=v=>T+(H-T-B)*(1-v/max);
  const sel=TR.sel[key]!=null?TR.sel[key]:n-1;
  const svg=sv("svg",{viewBox:"0 0 "+W+" "+H,class:"chart",role:"img","aria-label":opts.label});
  [0,max/2,max].forEach(g=>{svg.append(sv("line",{x1:L,x2:W-R,y1:y(g),y2:y(g),class:"ch-grid"}),sv("text",{x:L-6,y:y(g)+3.5,class:"ch-lab","text-anchor":"end"},opts.fmt?opts.fmt(g):Math.round(g)))});
  days.forEach((d,i)=>{
    const x=L+i*bw+bw*0.2,w=bw*0.6;let acc=0;const segs=series.filter(s=>(d.v[s.k]||0)>0);
    segs.forEach((s,j)=>{const v=d.v[s.k];const y1=y(acc+v),y0=y(acc);acc+=v;const top=j===segs.length-1;const h=Math.max(1,y0-y1-(top?0:2));
      svg.append(sv("rect",{x,y:y1+(top?0:2),width:w,height:h,rx:top?Math.min(4,w/2):0,class:"ch-bar "+s.cls+(i===sel?" sel":"")}))});
    if(i%Math.ceil(n/5)===(n-1)%Math.ceil(n/5))svg.append(sv("text",{x:x+w/2,y:H-6,class:"ch-lab","text-anchor":"middle"},md(d.d)));
    const hit=sv("rect",{x:L+i*bw,y:T,width:bw,height:H-T-B,class:"ch-hit",tabindex:"0"},sv("title",null,md(d.d)+" "+series.filter(s=>s.label).map(s=>s.label+" "+(opts.fmt?opts.fmt(d.v[s.k]||0):(d.v[s.k]||0))).join(", ")));
    const pickIt=()=>{if(TR.sel[key]!==i){TR.sel[key]=i;render()}};hit.addEventListener("click",pickIt);hit.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse")pickIt()});hit.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pickIt()}});
    svg.append(hit);
  });
  const sd=days[sel];
  return el("div",{class:"chartbox"},
    el("div",{class:"legend"},series.filter(s=>!s.nolegend).map(s=>el("span",{class:"lg"},el("i",{class:s.cls}),s.label)),opts.note?el("span",{class:"lg"},el("i",{class:"lgdark"}),opts.note):null),
    el("div",{class:"readout num"},md(sd.d)+" · "+(opts.readout?opts.readout(sd):series.map(s=>s.label+" "+(opts.fmt?opts.fmt(sd.v[s.k]||0):(sd.v[s.k]||0))).join(" · "))),
    svg);
}
function firstDay(){let f=ymd();for(const d of [...Object.keys(S.prog.st||{}),...Object.keys(S.prog.days||{})])if(d<f)f=d;return f}
function windowDays(key){const off=TR.off[key]||0;const end=addDays(ymd(),-14*off);const out=[];for(let i=13;i>=0;i--){const d=addDays(end,-i);const x=dayStats(d);const pk=x.rated?Math.round(x.k/x.rated*100):0,pu=x.rated?Math.round(x.u/x.rated*100):0;out.push({d,x,v:{nw:x.nw,rv:x.rv,...x.vol,tp:x.tq?Math.round(x.tc/x.tq*100):0,pk,pu,px:x.rated?100-pk-pu:0}})}return out}
function chartNav(key,days){
  const off=TR.off[key]||0;const canPrev=days[0].d>firstDay();
  const go=d=>{TR.off[key]=Math.max(0,off+d);delete TR.sel[key];render()};
  return el("div",{class:"chnav"},el("button",{class:"pg","aria-label":"이전 2주",disabled:!canPrev,onclick:()=>go(1)},"‹"),el("span",{class:"num small"},md(days[0].d)+" – "+md(days[13].d)+(off===0?" (최근)":"")),el("button",{class:"pg","aria-label":"다음 2주",disabled:off===0,onclick:()=>go(-1)},"›"));
}
const CATHELP={
 mastered:"카드에서 '알았음'을 4번 이상 연속으로 누른 단어야. 다음 복습이 2주 → 1달 → 2달 뒤로 늘어나. 테스트에서 틀리면 두 단계 내려가.",
 familiar:"'알았음'을 2~3번 연속으로 누른 단어야. 3일, 7일 뒤에 다시 나와. 한두 번 더 맞히면 '완벽히 외움'으로 올라가.",
 fresh:"처음 본 단어, '알았음'을 1번 누른 단어, 아니면 '몰랐음'을 눌러서 처음부터 다시 시작하는 단어야. 다음 날 다시 나와.",
 skip:"새 단어 카드에서 '이미 아는 단어야'를 눌러서 뺀 단어야. 60일 뒤에 카드랑 테스트에 다시 나오고, 그때 카드에서 누른 결과에 따라 다른 상태로 옮겨가."};
/* tooltip: shows on hover or tap, disappears after 5 seconds */
let tipTimer=null;
function hideTip(line){const t=line&&line.querySelector(".tipbox");if(t)t.classList.remove("show")}
function showTip(line){if(!line.isConnected){setTimeout(()=>{const t=document.getElementById(line.querySelector(".tipbox").id);if(t)showTip(t.parentNode)},0);return}document.querySelectorAll(".tipbox.show").forEach(t=>t.classList.remove("show"));const t=line.querySelector(".tipbox");if(!t)return;t.classList.add("show");clearTimeout(tipTimer);tipTimer=setTimeout(()=>t.classList.remove("show"),5000)}
const CATS=[["mastered","완벽히 외움","lv3"],["familiar","익숙해지는 중","lv2"],["fresh","막 배운 단어","lv1"],["skip","이미 알던 단어","lvk"]];
function catOf(r){if(!r)return "unseen";if(r.i==="skip")return "skip";if(r.b>=4)return "mastered";if(r.b>=2)return "familiar";return "fresh"}
function viewTrend(){
  const P=S.prog.w;const W=allWords();const groups={mastered:[],familiar:[],fresh:[],skip:[],unseen:[]};
  for(const w of W)groups[catOf(P[w.id])].push(w);
  const total=W.length-groups.unseen.length;const t=ymd();
  const vol=windowDays("vol"),tst=windowDays("tst"),rat=windowDays("rat");const anyRat=rat.some(d=>d.x.rated);
  const anyVol=Object.keys(S.prog.st||{}).length||Object.keys(S.prog.days||{}).length;
  const wk=off=>{const o={days:0,nw:0,rv:0,k:0,rated:0,tq:0,tc:0};for(let i=0;i<7;i++){const x=dayStats(addDays(t,-(off+i)));if(x.nw+x.rv>0)o.days++;o.nw+=x.nw;o.rv+=x.rv;o.k+=x.k;o.rated+=x.rated;o.tq+=x.tq;o.tc+=x.tc}return o};
  const cur=wk(0),prev=wk(7);
  const anyTest=tst.some(d=>d.x.tq);
  return el("main",{class:"wrap"},header(S.role==="supporter"?nameL()+"의 학습 기록":"학습 기록"),
    weekPanel(cur,prev),
    el("section",{class:"panel","aria-label":"단어 상태"},
      el("div",{class:"rowline"},el("h2",null,"단어 상태"),el("span",{class:"num small muted"},"본 단어 "+total+"개")),
      el("div",{class:"stackbar",role:"img","aria-label":CATS.map(c=>c[1]+" "+groups[c[0]].length+"개").join(", ")},CATS.filter(c=>groups[c[0]].length).map(c=>el("i",{class:c[2],style:"flex:"+groups[c[0]].length}))),
      el("ul",{class:"lglist"},CATS.map(([k,l,cls])=>{const n=groups[k].length;const open=TR.cat===k;
        return el("li",{class:"catrow"},el("div",{class:"catline",onmouseenter:e=>showTip(e.currentTarget),onmouseleave:e=>hideTip(e.currentTarget)},
            el("button",{class:"cat"+(open?" open":"")+(n?"":" empty"),"aria-expanded":n?(open?"true":"false"):null,"aria-describedby":"help-"+k,onclick:()=>{if(n){TR.cat=open?null:k;BK.open=null;render()}const line=document.getElementById("help-"+k);if(line)showTip(line.parentNode)}},el("i",{class:cls}),el("span",null,l),el("b",{class:"num"},n+"개"),el("span",{class:"chev","aria-hidden":"true"},n?(open?"▴":"▾"):"")),
            el("span",{class:"tipbox",role:"tooltip",id:"help-"+k},CATHELP[k])),
          open?el("div",{class:"catlist"},scrollList("cat:"+k,groups[k])):null)}))),
    el("section",{class:"panel","aria-label":"학습량"},
      el("h2",null,"2주 학습량"),
      anyVol?[barChart("vol",vol,[{k:"nwk",label:"새 단어",cls:"s1"},{k:"nwo",cls:"s1l",nolegend:1},{k:"rvk",label:"복습",cls:"s2"},{k:"rvo",cls:"s2l",nolegend:1}],{label:"2주 하루 학습량",note:"진한 부분은 알았음",readout:sd=>"새 단어 "+((sd.v.nwk||0)+(sd.v.nwo||0))+" (알았음 "+(sd.v.nwk||0)+") · 복습 "+((sd.v.rvk||0)+(sd.v.rvo||0))+" (알았음 "+(sd.v.rvk||0)+")"}),chartNav("vol",vol)]:el("p",{class:"muted small",style:"margin:0"},"기록은 오늘부터 쌓여. 카드를 넘기면 여기에 하루 학습량이 그려질 거야.")),
    el("section",{class:"panel","aria-label":"카드 응답 비율"},
      el("h2",null,"카드 응답 비율"),el("span",{class:"small muted"},"카드에서 알았음·애매·몰랐음을 누른 비율이야."),
      anyRat||(TR.off.rat||0)>0?barChart("rat",rat,[{k:"pk",label:"알았음",cls:"sk"},{k:"pu",label:"애매",cls:"su"},{k:"px",label:"몰랐음",cls:"sx"}],{max:100,fmt:v=>Math.round(v)+"%",label:"2주 카드 응답 비율",readout:d=>d.x.rated?"알았음 "+d.v.pk+"% · 애매 "+d.v.pu+"% · 몰랐음 "+d.v.px+"% ("+d.x.rated+"장)":"카드 기록 없음"}):el("p",{class:"muted small",style:"margin:0"},"이 기간에는 카드 기록이 없어."),
      chartNav("rat",rat)),
    el("section",{class:"panel","aria-label":"테스트 정답률"},
      el("h2",null,"테스트 정답률"),el("span",{class:"small muted"},"하루에 여러 번 본 날은 그날 푼 문제 전체의 정답률이야."),
      anyTest||(TR.off.tst||0)>0?barChart("tst",tst,[{k:"tp",label:"정답률",cls:"s1"}],{max:100,fmt:v=>Math.round(v)+"%",label:"2주 테스트 정답률",readout:d=>d.x.tq?"정답률 "+d.v.tp+"% ("+d.x.tc+"/"+d.x.tq+"문제)":"테스트 없음"}):el("p",{class:"muted small",style:"margin:0"},"이 기간에는 본 테스트가 없어."),
      chartNav("tst",tst)));
}

/* this week vs the week before: rolling 7 days (today included) against the 7 days before that */
function weekPanel(cur,prev){
  const pct=(a,b)=>b?Math.round(a/b*100):null;
  const rows=[
    ["공부한 날",cur.days,prev.days,v=>v+"일","일"],
    ["새 단어",cur.nw,prev.nw,v=>v+"개","개"],
    ["복습한 단어",cur.rv,prev.rv,v=>v+"개","개"],
    ["'알았음' 비율",pct(cur.k,cur.rated),pct(prev.k,prev.rated),v=>v+"%","%p"],
    ["테스트 푼 문제",cur.tq,prev.tq,v=>v+"문제","문제"],
    ["테스트 정답률",pct(cur.tc,cur.tq),pct(prev.tc,prev.tq),v=>v+"%","%p"]];
  const has=prev.days>0;
  const diff=(a,b,u)=>{if(a==null||b==null)return el("span",{class:"cmp-d"},"–");const d=a-b;if(!d)return el("span",{class:"cmp-d"},"같음");return el("span",{class:"cmp-d "+(d>0?"up":"down")},(d>0?"▲ ":"▼ ")+Math.abs(d)+u)};
  // one plain sentence with the changes that matter most
  const bits=[];
  if(has){
    const dd=cur.days-prev.days;if(dd)bits.push("공부한 날이 "+Math.abs(dd)+"일 "+(dd>0?"늘었어":"줄었어"));
    const dn=cur.nw-prev.nw;if(Math.abs(dn)>=5)bits.push("새 단어는 "+Math.abs(dn)+"개 "+(dn>0?"더":"덜")+" 봤어");
    const kc=pct(cur.k,cur.rated),kp=pct(prev.k,prev.rated);if(kc!=null&&kp!=null&&Math.abs(kc-kp)>=5)bits.push("'알았음' 비율은 "+Math.abs(kc-kp)+"%p "+(kc>kp?"올랐어":"내려갔어"));
    const tcr=pct(cur.tc,cur.tq),tpr=pct(prev.tc,prev.tq);if(tcr!=null&&tpr!=null&&Math.abs(tcr-tpr)>=5)bits.push("테스트 정답률은 "+Math.abs(tcr-tpr)+"%p "+(tcr>tpr?"올랐어":"내려갔어"));
  }
  const summary=!has?"그 전 7일 기록이 아직 없어서, 일주일 더 공부하면 지난주와 비교해서 보여줄게.":bits.length?"지난주보다 "+bits.join(". ")+".":"지난주랑 거의 비슷한 페이스야. 꾸준히 잘하고 있어.";
  return el("section",{class:"panel","aria-label":"지난주와 비교"},
    el("div",{class:"rowline"},el("h2",null,"지난주와 비교"),el("span",{class:"num small muted"},"연속 학습 "+streak()+"일")),
    el("p",{class:"tip"},summary),
    el("table",{class:"cmp"},el("thead",null,el("tr",null,el("th",null,""),el("th",null,"최근 7일"),el("th",null,"그 전 7일"),el("th",null,"변화"))),
      el("tbody",null,rows.map(([l,a,b,f,u])=>el("tr",null,el("th",{scope:"row"},l),el("td",{class:"num"},a==null?"–":f(a)),el("td",{class:"num muted"},b==null||!has?"–":f(b)),el("td",{class:"num"},has?diff(a,b,u):el("span",{class:"cmp-d"},"–")))))),
    el("span",{class:"small muted"},"최근 7일은 오늘까지, 그 전 7일은 8~14일 전이야. 오늘은 아직 진행 중이라 숫자가 더 늘 수 있어."));
}

/* ============ tests */
/* today's test summary + weak-word feedback (test tab) */
const TLABEL={syn:"유의어",en2ko:"뜻 고르기",ko2en:"영어 고르기",spell:"철자 쓰기",blank:"빈칸 채우기"};
/* words seen on a given day (card log, plus older days from each word's last-seen date) */
function dayWords(d){const r=((S.log[d]||{}).r)||{};const ids=new Set(Object.keys(r));for(const id in S.prog.w)if(S.prog.w[id].l===d)ids.add(id);return [...ids].filter(byId).map(id=>({id,res:r[id]||""}))}
function viewDaySheet(){
  const off=S.daySheet||0;const d=addDays(ymd(),-off);const list=dayWords(d);
  const cnt={K:0,U:0,N:0,S:0};list.forEach(x=>{if(cnt[x.res]!=null)cnt[x.res]++});
  const close=()=>{S.daySheet=null;BK.open=null;SC.day=0;render()};
  const go=n=>{S.daySheet=Math.max(0,off+n);BK.open=null;SC.day=0;render()};
  const label=off===0?"오늘":off===1?"어제":off===2?"그제":fmtExam(d);
  const first=firstDay();
  return el("div",{class:"scrim",onclick:e=>{if(e.target===e.currentTarget)close()}},el("div",{class:"sheet listsheet",role:"dialog","aria-label":label+" 본 단어"},
    el("div",{class:"rowline"},el("h2",null,label+" 본 단어 "+list.length+"개"),el("button",{class:"iconbtn","aria-label":"닫기",onclick:close},icon("close"))),
    el("div",{class:"chnav"},el("button",{class:"pg","aria-label":"전날",disabled:d<=first,onclick:()=>go(1)},"‹"),el("span",{class:"num small"},md(d)+" ("+"일월화수목금토"[parseD(d).getDay()]+")"),el("button",{class:"pg","aria-label":"다음날",disabled:off===0,onclick:()=>go(-1)},"›")),
    list.length?el("div",{class:"wtags"},cnt.K?el("span",{class:"st ok"},"알았음 "+cnt.K):null,cnt.U?el("span",{class:"st learn"},"애매 "+cnt.U):null,cnt.N?el("span",{class:"st new",style:"background:var(--bad-soft);color:var(--bad)"},"몰랐음 "+cnt.N):null,cnt.S?el("span",{class:"st new"},"이미 앎 "+cnt.S):null):null,
    list.length?scrollList("day",list.map(x=>byId(x.id)),id=>{const r=(list.find(x=>x.id===id)||{}).res;return r==="K"?["ok","알았음"]:r==="U"?["learn","애매"]:r==="N"?["no","몰랐음"]:r==="S"?["new","이미 앎"]:statusOf(id)}):el("p",{class:"muted"},"이 날은 본 단어가 없어."),
    list.length&&S.role==="learner"?el("button",{class:"btn block",onclick:()=>{const ids=list.map(x=>x.id);S.daySheet=null;render();startSession(ids,"extra")}},"이 날 단어 다시 보기"):null));
}
function viewWordSheet(){
  const w=byId(S.wordSheet);const close=()=>{S.wordSheet=null;render()};if(!w)return "";
  return el("div",{class:"scrim",onclick:e=>{if(e.target===e.currentTarget)close()}},el("div",{class:"sheet wordsheet",role:"dialog","aria-label":w.w+" 카드"},
    el("div",{class:"rowline"},el("span",{lang:"en",style:"font-family:var(--f-word);font-weight:700;font-size:32px;line-height:1.1;overflow-wrap:anywhere;min-width:0"},w.w),el("button",{class:"iconbtn","aria-label":"닫기",onclick:close},icon("close"))),
    el("div",{class:"rowline"},el("span",{class:"ko"},w.ko,w.pos?el("span",{class:"pos-inline"}," "+w.pos):null),"speechSynthesis" in window?el("button",{class:"speak","aria-label":"발음 듣기",onclick:()=>speak(w.w)},icon("sound")):null),
    wordBody(w,{src:true})));
}
function wrongTodayIds(){return allWords().filter(w=>{const r=recOf(w.id);return r&&(r.tw?true:r.tw===undefined&&(r.h||"").includes("T"))}).map(w=>w.id)}
function viewWrongSheet(){
  const ids=wrongTodayIds();const close=()=>{S.wrongSheet=false;BK.open=null;render()};
  return el("div",{class:"scrim",onclick:e=>{if(e.target===e.currentTarget)close()}},el("div",{class:"sheet listsheet",role:"dialog","aria-label":"오늘 틀린 단어"},
    el("div",{class:"rowline"},el("h2",null,"다시 맞혀야 할 단어 "+ids.length+"개"),el("button",{class:"iconbtn","aria-label":"닫기",onclick:close},icon("close"))),
    el("p",{class:"small muted",style:"margin:0"},"테스트에서 틀린 단어야. 카드로 복습해도 남아 있고, 테스트에서 맞혀야 목록에서 빠져."),
    ids.length?scrollList("wrongToday",ids.map(byId).filter(Boolean)):el("p",{class:"muted"},"다시 맞혀야 할 단어가 없어!"),
    ids.length?el("div",{style:"display:flex;gap:8px"},
      el("button",{class:"btn primary",style:"flex:1",onclick:()=>{S.wrongSheet=false;startTest("mix",ids)}},"이 단어로 테스트"),
      el("button",{class:"btn",style:"flex:1",onclick:()=>{S.wrongSheet=false;render();startSession(ids,"wrong")}},"카드로 복습")):null));
}
function todayTestPanel(){
  const st=S.prog.st[ymd()]||{};const q=st.tq||0,c=st.tc||0;
  const wrongToday=wrongTodayIds().length;
  const types=Object.keys(TLABEL).filter(k=>st["q_"+k]);
  let weakest=null;for(const k of types){const acc=(st["c_"+k]||0)/st["q_"+k];if(st["q_"+k]>=3&&(!weakest||acc<weakest[1]))weakest=[k,acc]}
  return el("section",{class:"panel","aria-label":"오늘의 테스트"},
    el("h2",null,"오늘의 테스트"),
    q?[el("div",{class:"stats"},stat(q+"문제","오늘 푼 문제"),stat(Math.round(c/q*100)+"%","정답률"),el("button",{class:"stat tapstat",disabled:!wrongToday,onclick:()=>{S.wrongSheet=true;BK.open=null;render()},"aria-haspopup":"dialog"},el("b",null,wrongToday+"개"),el("span",null,wrongToday?"틀린 단어 ›":"틀린 단어"))),
      el("ul",{class:"typebars"},types.map(k=>{const tq=st["q_"+k],tc=st["c_"+k]||0;const pct=Math.round(tc/tq*100);
        return el("li",null,el("span",{class:"tl"},TLABEL[k]),el("span",{class:"bar"},el("i",{style:"width:"+pct+"%"})),el("span",{class:"num tv"},pct+"% · "+tc+"/"+tq))})),
      weakest&&weakest[1]<0.8?el("p",{class:"tip"},"오늘은 "+TLABEL[weakest[0]]+" 정답률이 제일 낮아 ("+Math.round(weakest[1]*100)+"%). 이 유형으로 한 번 더 풀어 보자."):null]
    :[el("p",{class:"muted small",style:"margin:0"},"오늘은 아직 테스트를 안 봤어. 테스트를 보면 푼 문제 수, 정답률, 유형별 결과가 여기에 쌓여."),
      wrongToday?el("button",{class:"btn block",onclick:()=>{S.wrongSheet=true;BK.open=null;render()}},"다시 맞혀야 할 단어 "+wrongToday+"개 ›"):null]);
}
function weakWords(){
  const out=[];
  for(const w of allWords()){const r=recOf(w.id);if(!r||r.i==="skip")continue;
    const tm=(r.tm||[0,0])[1],ts=(r.ts||[0,0])[1],ty=(r.ty||[0,0])[1],no=(r.h||"").split("N").length-1;
    const score=(tm+ts+ty)*2+no;if(score>=2)out.push({w,r,tm,ts,ty,no,score})}
  return out.sort((a,b)=>b.score-a.score);
}
function weakPanel(){
  const list=weakWords();const pages=Math.max(1,Math.ceil(list.length/10));let pg=Math.min(BK.pages.weak||0,pages-1);BK.pages.weak=pg;const top=list.slice(pg*10,pg*10+10);
  const sum=list.reduce((a,x)=>({tm:a.tm+x.tm,ts:a.ts+x.ts,ty:a.ty+x.ty}),{tm:0,ts:0,ty:0});
  let advice=null;
  if(list.length){const m=Math.max(sum.tm,sum.ts,sum.ty);
    advice=m===0?"카드에서 '몰랐음'이 반복되는 단어들이야. 예문을 소리 내서 읽고, 어근(단어 가족)이랑 같이 묶어서 외워 봐.":
      m===sum.ts?"뜻은 아는데 철자에서 많이 틀려. 철자 쓰기랑 빈칸 채우기로 직접 써 보는 연습을 늘려 봐.":
      m===sum.ty?"유의어에서 많이 틀려. 카드 뒷면의 '비슷한 말'을 같이 읽고, 유의어 고르기를 자주 풀어 봐.":
      "뜻을 헷갈리는 단어가 많아. 헷갈린 단어랑 나란히 놓고 차이를 확인해 봐."}
  return el("section",{class:"panel","aria-label":"자주 틀리는 단어"},
    el("div",{class:"rowline"},el("h2",null,"자주 틀리는 단어"),list.length?el("span",{class:"num small muted"},list.length+"개"):null),
    list.length?[el("p",{class:"tip"},advice),
      el("ul",{class:"booklist"},top.map(x=>{const cf=x.r.cf&&byId(x.r.cf);
        const tags=[x.tm?"뜻 "+x.tm:null,x.ts?"철자 "+x.ts:null,x.ty?"유의어 "+x.ty:null,x.no?"몰랐음 "+x.no:null].filter(Boolean);
        return el("li",{class:"bw"},el("button",{class:"weak",onclick:()=>{S.wordSheet=x.w.id;render()},"aria-haspopup":"dialog"},el("span",{class:"w",lang:"en"},x.w.w),el("span",{class:"ko"},x.w.ko),
          el("span",{class:"wtags"},el("span",{class:"wt num"},tags.map((t,i)=>[i?el("br"):null,t])))))})),
      el("p",{class:"small muted",style:"margin:0"},"오른쪽 숫자: 뜻·철자·유의어는 테스트에서 틀린 횟수, 몰랐음은 카드에서 누른 횟수야. 단어를 누르면 카드 뒷면이 보여."),
      pages>1?el("div",{class:"pager"},el("button",{class:"pg","aria-label":"이전 10개",disabled:pg===0,onclick:()=>{BK.pages.weak=pg-1;render()}},"‹"),el("span",{class:"num"},(pg+1)+" / "+pages),el("button",{class:"pg","aria-label":"다음 10개",disabled:pg>=pages-1,onclick:()=>{BK.pages.weak=pg+1;render()}},"›")):null,
      el("div",{style:"display:flex;gap:8px"},
        el("button",{class:"btn primary",style:"flex:1",onclick:()=>startTest("mix",top.map(x=>x.w.id))},"이 단어로 테스트"),
        el("button",{class:"btn",style:"flex:1",onclick:()=>startSession(top.map(x=>x.w.id),"wrong")},"카드로 복습"))]
    :el("p",{class:"muted small",style:"margin:0"},"아직 자주 틀리는 단어가 없어. 테스트에서 틀리거나 카드에서 '몰랐음'을 누른 단어가 여기에 모여."));
}


const TST={active:false,type:"mix",qs:[],i:0,score:0,wrong:[],answered:null,lock:false};
const TTYPES=[["syn","유의어 고르기","단어의 유의어를 모두 고르기"],["en2ko","뜻 고르기","영어 단어 → 한국어 뜻"],["ko2en","영어 고르기","한국어 뜻 → 영어 단어"],["spell","철자 쓰기","뜻을 보고 영어 단어 전체를 입력"],["blank","빈칸 채우기","문장 속 빈칸에 단어 쓰기 (철자·형태 연습)"]];
/* a Korean meaning as comparable stems: "거대한, 엄청난" → ["거대","엄청난"→"엄청나"…] (endings like 한/하다/적인/스러운 dropped) */
function koKeys(ko){return String(ko||"").replace(/\([^)]*\)|\[[^\]]*\]/g,"").split(/[;,·\/~]|\d+\./).map(x=>x.replace(/[^가-힣]/g,"").replace(/(스러운|스럽게|하다|하게|하는|적인|되다|되는|이다|한|히|적|의|함|된|다)$/,"")).filter(Boolean)}
function koClose(a,b){return a.some(x=>b.some(y=>x===y||Math.min(x.length,y.length)>=2&&(x.includes(y)||y.includes(x))))}
function synList(w){return String(w.syn||"").split(/[,;]/).map(x=>x.trim().toLowerCase()).filter(x=>x&&x.length<=25&&/^[a-z][a-z \-']*$/.test(x)&&x!==w.w.toLowerCase())}
function canSyn(w){return synList(w).length>=2}
function testPool(){const P=S.prog.w;const t=ymd();let pool=allWords().filter(w=>{const r=P[w.id];return r&&r.s>0&&(r.i!=="skip"||r.d<=t)});return pool.length>=4?pool:null}
function makeQ(w,type){
  if(type==="blank"&&!exTarget(w.ex))type="spell";
  if(type==="syn"&&!canSyn(w))type="en2ko";
  const q={id:w.id,type};
  if(type==="syn"){
    const mine=synList(w);const right=shuffle(mine).slice(0,Math.min(5,mine.length));const mineSet=new Set(mine);
    const pool=[];for(const x of shuffle(allWords())){if(x.id===w.id)continue;const ls=synList(x);if(ls.some(y=>mineSet.has(y)))continue;for(const y of ls)if(!mineSet.has(y)&&!pool.includes(y)&&y!==w.w)pool.push(y);if(pool.length>=12)break}
    const nD=Math.max(4,8-right.length);q.right=right;q.opts=shuffle([...right,...pool.slice(0,nD)]);q.picked=[];
  }
  if(type==="en2ko"||type==="ko2en"){
    const others=shuffle(allWords().filter(x=>x.id!==w.id&&x.ko!==w.ko&&x.w!==w.w));
    const same=others.filter(x=>x.pos===w.pos);const pool=[...same,...others.filter(x=>x.pos!==w.pos)];
    // skip wrong answers whose meaning overlaps the answer or another option (거대한 / 거대한, 엄청난), or that are listed synonyms
    const wSyn=new Set(synList(w)),lw=w.w.toLowerCase(),taken=[koKeys(w.ko)];
    const close=x=>wSyn.has(x.w.toLowerCase())||synList(x).includes(lw)||taken.some(k=>koClose(k,koKeys(x.ko)));
    const ds=[];for(const x of pool){if(ds.length>=3)break;if(!close(x)){ds.push(x);taken.push(koKeys(x.ko))}}
    for(const x of pool){if(ds.length>=3)break;if(!ds.includes(x)&&!ds.some(d=>d.ko===x.ko))ds.push(x)} // small word lists: fall back to "not the same text"
    q.opts=shuffle([w,...ds]).map(x=>({id:x.id,label:type==="en2ko"?x.ko:x.w}));
  }
  if(type==="blank"){const t=exTarget(w.ex);q.shown="";q.answer=t.toLowerCase()}
  if(type==="spell")q.answer=w.w.toLowerCase();
  return q;
}
function startTest(type,ids){
  const pool=ids?ids.map(byId).filter(Boolean):testPool();if(!pool||!pool.length){toast("카드로 단어를 4개 이상 보면 테스트할 수 있어");return}
  const P=S.prog.w;const N=ids?Math.min(30,pool.length):Math.min(Number(PREF.tn)||10,pool.length);
  let src=type==="syn"?pool.filter(canSyn):pool;if(!src.length){toast("유의어가 있는 단어가 아직 없어");return}
  const picks=shuffle(src).sort((a,b)=>((P[b.id]||{}).x||0)-((P[a.id]||{}).x||0)).slice(0,N);
  const types=TTYPES.map(t=>t[0]);
  Object.assign(TST,{run:(TST.run||0)+1,posted:false,active:true,type,qs:shuffle(picks).map(w=>makeQ(w,type==="mix"?pick(types):type)),i:0,score:0,wrong:[],answered:null});
  render();
}
function ansId(){return "ans"+TST.i+"_"+(TST.run||0)}
function answer(val){
  const q=TST.qs[TST.i];if(TST.answered)return;
  let ok;if(q.type==="en2ko"||q.type==="ko2en")ok=val===q.id;else if(q.type==="syn"){const a=new Set(q.picked);ok=a.size===q.right.length&&q.right.every(x=>a.has(x))}else ok=String(val||"").trim().toLowerCase()===q.answer;
  TST.answered={ok,val};if(ok)TST.score++;else TST.wrong.push(q.id);logTest(q.id,q.type,ok,val)
  render();
}
function viewTest(){
  if(!TST.active){
    const pool=testPool();
    return el("main",{class:"wrap"},header(S.ctx==="me"?"내 테스트":"테스트"),
      S.ctx==="me"?el("button",{class:"reshuffle",style:"align-self:flex-start",onclick:()=>goTab("mine")},"‹ 내 공부로"):null,
      todayTestPanel(),
      el("section",{class:"panel","aria-label":"새 테스트"},
        el("h2",null,"새 테스트"),
        el("p",{class:"muted small",style:"margin:0"},pool?"카드로 본 단어 "+pool.length+"개에서 나와. 자주 틀린 단어가 먼저 나와."+(pool.length<PREF.tn?" (지금은 최대 "+pool.length+"문제)":""):"카드로 단어를 4개 이상 넘기면 테스트를 볼 수 있어."),
        el("div",{class:"tgrid"},
          el("div",{class:"mixrow"},
            el("button",{class:"tcard wide",onclick:()=>startTest("mix"),disabled:!pool},el("b",null,"섞어서 테스트"),el("span",null,"다섯 가지 유형이 골고루 나와")),
            el("select",{id:"tnSel",class:"tnsel","aria-label":"문제 수",onchange:e=>{PREF.tn=Number(e.target.value);savePref();render()}},[10,20,30].map(n=>{const o=el("option",{value:String(n)},n+"개");if(Number(PREF.tn)===n)o.selected=true;return o}))),
          TTYPES.map(([k,l,d])=>el("button",{class:"tcard",onclick:()=>startTest(k),disabled:!pool},el("b",null,l),el("span",null,d))))),
      weakPanel());
  }
  if(TST.i>=TST.qs.length)return viewTestEnd();
  const q=TST.qs[TST.i];const w=byId(q.id);const A=TST.answered;
  let body;
  if(q.type==="en2ko"||q.type==="ko2en"){
    body=[el("div",{class:"prompt"+(q.type==="ko2en"?" ko":""),lang:q.type==="en2ko"?"en":null},q.type==="en2ko"?w.w:w.ko),
      el("div",{class:"opts"},q.opts.map(o=>el("button",{class:"opt"+(q.type==="ko2en"?" en":"")+(A?(o.id===q.id?" right":o.id===A.val?" wrong":""):""),disabled:!!A,onclick:()=>answer(o.id)},o.label)))];
  }else if(q.type==="syn"){
    body=[el("div",{class:"prompt",lang:"en"},w.w),el("div",{class:"muted small",style:"text-align:center"},"유의어 "+q.right.length+"개를 모두 골라 봐"),
      el("div",{class:"synopts",role:"group"},q.opts.map(o=>{const on=q.picked.includes(o);const isR=q.right.includes(o);
        return el("button",{class:"synopt"+(A?(isR&&on?" right":isR?" missed":on?" wrong":""):on?" on":""),disabled:!!A,"aria-pressed":on?"true":"false",lang:"en",onclick:()=>{q.picked=on?q.picked.filter(x=>x!==o):[...q.picked,o];render()}},o)})),
      !A?el("button",{class:"btn primary block",disabled:!q.picked.length,onclick:()=>answer(null)},"확인 ("+q.picked.length+"/"+q.right.length+")"):null];
  }else if(q.type==="spell"){
    body=[el("div",{class:"prompt ko"},w.ko),el("div",{class:"muted small",style:"text-align:center"},w.pos+" · 영어로 써 봐"),
      el("form",{onsubmit:e=>{e.preventDefault();answer($("#"+ansId()).value)},style:"display:flex;flex-direction:column;gap:10px"},
        el("input",{id:ansId(),class:"ans",autocomplete:"off",autocapitalize:"off",spellcheck:"false",lang:"en",disabled:!!A,"aria-label":"영어 단어 입력",value:A?A.val:""}),
        !A?el("button",{class:"btn primary block",type:"submit"},"확인"):null)];
  }else{
    const parts=String(w.ex).split(/\[(.+?)\]/);
    body=[el("div",{class:"muted small"},"빈칸에 들어갈 단어를 써 봐 (문장에 맞는 형태로)"),
      el("form",{onsubmit:e=>{e.preventDefault();answer($("#"+ansId()).value)},style:"display:flex;flex-direction:column;gap:12px"},
        el("div",{class:"sent",lang:"en"},parts[0],el("b",null,q.shown),el("input",{id:ansId(),class:"blankin",size:"12",autocomplete:"off",autocapitalize:"off",spellcheck:"false",disabled:!!A,"aria-label":"나머지 철자",value:A?A.val:""}),parts[2]||""),
        el("div",{class:"exko"},"해석: "+(w.exKo||"")),
        !A?el("button",{class:"btn primary block",type:"submit"},"확인"):null)];
  }
  const fb=A?el("div",{class:"feedback "+(A.ok?"ok":"ng")},el("b",null,A.ok?"정답!":"정답: "+(q.type==="syn"?q.right.join(", "):q.type==="blank"?q.shown+q.answer:q.type==="spell"?w.w:(q.type==="en2ko"?w.ko:w.w))),
    el("span",{class:"ex",lang:"en"},w.w+" — "+w.ko),w.ex?el("span",{class:"ex small",lang:"en"},exNode(w.ex)):null):null;
  setTimeout(()=>{const a=$("#"+ansId());if(a&&!A&&document.activeElement!==a)a.focus({preventScroll:true})},0);
  return el("main",{class:"wrap",style:"min-height:100dvh"},
    el("div",{class:"shead"},el("button",{class:"iconbtn","aria-label":"테스트 그만하기",onclick:()=>{TST.active=false;render()}},icon("close")),el("div",{class:"bar"},el("i",{style:"width:"+Math.round(TST.i/TST.qs.length*100)+"%"})),el("span",{class:"num small muted"},(TST.i+1)+"/"+TST.qs.length)),
    el("section",{class:"q"},body,fb,A?el("button",{class:"btn primary block",onclick:()=>{TST.i++;TST.answered=null;render()}},TST.i+1<TST.qs.length?"다음 문제":"결과 보기"):null),
    el("div",{class:"testlogo","aria-hidden":"true",svg:CAT_SVG}));
}
function viewTestEnd(){
  const wrongW=[...new Set(TST.wrong)].map(byId).filter(Boolean);
  if(!TST.posted){TST.posted=true;if(TST.score>=TST.qs.length-3)autoCheer("test-"+Date.now(),"test",{c:TST.score,n:TST.qs.length})}
  return el("main",{class:"wrap"},
    el("h1",{class:"endbig num"},TST.score+" / "+TST.qs.length),
    el("p",{class:"muted",style:"margin:0"},TST.score===TST.qs.length?"전부 맞혔어!":"틀린 단어는 오늘 카드에 다시 나올 거야."),
    wrongW.length?el("section",{class:"panel"},el("h2",null,"틀린 단어"),el("ul",{class:"booklist"},wrongW.map(w=>el("li",{class:"bw"},el("div",{style:"display:flex;gap:10px;align-items:baseline;padding:10px 2px"},el("span",{class:"w",lang:"en"},w.w),el("span",{class:"ko",style:"white-space:normal"},w.ko)))))):null,
    wrongW.length?el("button",{class:"btn primary block",onclick:()=>{TST.active=false;startSession(wrongW.map(w=>w.id),"wrong")}},"틀린 단어 카드로 보기"):null,
    el("button",{class:"btn block",onclick:()=>startTest(TST.type)},"같은 유형 다시 풀기"),
    el("button",{class:"btn block",onclick:()=>{TST.active=false;render()}},"테스트 목록"));
}

/* ============ book words */
const BK={q:"",pages:{},stage:"",busy:false,prog:null,err:"",ctl:null,open:null,confirmDel:null,last:null};
const PHOTO_PROMPT=`이 사진은 영어 단어책(또는 영어 교재) 한 페이지입니다. 한국인 학습자가 토플(목표 밴드 4.5)을 준비하며 이 페이지의 단어를 외우려고 합니다.
표 형식 페이지 안내: 보통 한 행에 [표제어 | 영어 유의어 목록 | 한국어 뜻]이 있습니다. 표제어는 각 행의 맨 왼쪽 칸에 있고, 같은 행의 한국어 뜻과 짝을 이룹니다. 가운데 칸의 영어 유의어가 길어서 다음 줄로 넘어간 단어(예: incontrovertible, boldness)는 표제어가 아닙니다. "give rise to", "no wonder" 같은 숙어도 표제어면 그대로 포함하세요. 표제어는 책에 인쇄된 형태 그대로 쓰세요. encroachment를 encroach로 바꾸는 것처럼 원형으로 고치지 마세요. 예문에만 나오는 단어는 표제어가 아닙니다.
번호 규칙: 표제어 옆에 책이 붙인 번호(1, 2, 3…)가 있으면 그 번호를 "n"에 정수로 적으세요. 번호가 붙은 책이면 번호가 붙은 표제어만 넣고, 번호 순서대로 빠진 번호가 없는지 확인하세요. 한 표제어 안의 1. 2. 3. 뜻 번호는 표제어 번호가 아닙니다. 책에 표제어 번호가 아예 없으면 "n"은 null로 하세요.
단어 블록형 페이지 안내(예: Hackers Voca): 번호와 표제어가 왼쪽 색 띠 안에 있고(옆의 *** 별표는 중요도), 그 아래에 발음기호와 파생어(예: n. exploitation)가 작게 있습니다. 같은 줄 가운데에는 품사(v. / adj. / phr.)와 영어 유의어 목록이, 같은 줄 오른쪽 끝에는 작은 글씨의 한국어 뜻이 있습니다. 한 표제어에 1. 2. 3.처럼 뜻이 여러 개 있으면 한 단어로 합쳐서, 각 줄의 한국어 뜻을 "; "로 이어 "ko"에 넣고(최대 3개), 유의어는 첫 번째 뜻 것부터 모든 뜻에서 고르고, "pos"는 첫 뜻의 품사(숙어는 "phr.")로 하세요. 표제어 아래 영어 문장은 책 예문이고, "최신출제 포인트" 상자는 참고 설명이며, 페이지 맨 아래 왼쪽의 단어 목록과 한국어 문장들은 예문 번역 모음입니다. 이것들은 새 표제어가 아니니 따로 넣지 마세요. 파생어는 "fam"에 넣으세요. 맨 위 DAY 제목, 책 이름, 쪽번호는 무시하세요.
해야 할 일:
1) 페이지에 나온 학습 대상 영어 단어를 빠짐없이, 페이지에 나온 순서 그대로 찾으세요(최대 60개). 다 찾았는지 행 수를 세어 확인하세요. 표제어, 굵은 글씨, 번호가 붙은 단어, 형광펜이나 밑줄 표시가 있는 단어가 대상입니다. 예문 속 일반 단어는 빼세요.
2) 각 단어에 대해 책에 적힌 한국어 뜻을 그대로 "ko"에 옮기세요(핵심 뜻 1~3개로 짧게). 책에 한국어 뜻이 없거나 읽을 수 없으면 직접 쓰고 "kb"를 false로 하세요.
3) 책에 영어 유의어가 있으면 그중 핵심 3~5개를 "syn"에 넣으세요. 책에 없는 정보는 채우세요: 품사, 단어 가족(파생어), 유의어(책에 없을 때). 예문은 쓰지 마세요(따로 만듭니다). 답을 짧게 유지하세요.
JSON 배열만 답하세요. 형식:
[{"n":3,"w":"책에 인쇄된 표제어 그대로(소문자)","kb":true,"ko":"책의 한국어 뜻","pos":"n. / v. / adj. / adv. 등","fam":"파생어 쉼표로 구분(없으면 빈 문자열)","syn":"영어 유의어 3~5개"}]
학습 단어가 보이지 않으면 [] 만 답하세요.`;
/* a reply cut off by the length limit still holds the finished objects: keep them */
function salvageArray(t){const s=String(t||"");const st=s.indexOf("[");if(st<0)return null;const out=[];let depth=0,inStr=false,esc=false,from=-1;
  for(let i=st+1;i<s.length;i++){const ch=s[i];if(inStr){if(esc)esc=false;else if(ch==="\\")esc=true;else if(ch==='"')inStr=false;continue}
    if(ch==='"'){inStr=true;continue}if(ch==="{"){if(depth===0)from=i;depth++}else if(ch==="}"){depth--;if(depth===0&&from>=0){try{out.push(JSON.parse(s.slice(from,i+1)))}catch{}from=-1}}}
  return out.length?out:null}
const EX_PROMPT=`한국인 학습자가 토플(목표 밴드 4.5)을 준비하며 아래 영어 단어들을 외웁니다. 각 단어마다 토플 학술 지문(과학, 역사, 사회, 환경 등)에 나올 법한 자연스러운 새 예문을 한 문장씩 쓰고 한국어로 번역하세요. 주어진 한국어 뜻에 맞는 의미로 쓰고, 예문 속 그 단어(변형 포함)를 [대괄호]로 한 번 감싸세요.
JSON 배열만 답하세요. 형식: [{"w":"단어","ex":"예문","exKo":"번역"}]
단어 목록:
`;
/* every Claude call gets a time limit so a stuck reply can't keep the spinner going forever */
const BOOK_GUIDE=`이 자료는 한국인 학습자가 토플(목표 밴드 4.5)을 준비하며 외우는 영어 단어책(Hackers TOEFL Vocabulary 형식) 페이지입니다. 사진이 두 쪽이면 왼쪽 쪽부터 오른쪽 쪽 순서로 읽으세요.
페이지 구성:
- 표제어: 왼쪽 색 띠 안에 번호와 함께 있습니다(예: "9 conversely ***"). 별표(*)는 중요도입니다. 그 아래에 발음기호([kənvə́ːrsli])와 파생어(예: adj. converse, n. prominence)가 작게 있습니다.
- 같은 줄 가운데: 품사(v. / adj. / adv. / n. / phr.)와 영어 유의어 목록. 유의어 중 청록색(밝은 파랑-초록) 글씨는 중요한 유의어이고, 검정 글씨는 일반 유의어입니다.
- 같은 줄 오른쪽 끝: 작은 글씨의 한국어 뜻.
- 그 아래 영어 문장: 책 예문.
- 한 표제어에 뜻이 여러 개면 "1. 2. 3."으로 줄이 나뉘고, 줄마다 품사·유의어·한국어 뜻·예문이 따로 있습니다.
- "최신출제 포인트" 회색 상자: 참고 내용입니다.
- 페이지 맨 아래: 왼쪽에 표제어 목록, 오른쪽에 예문의 한국어 번역이 예문 순서대로 한 줄씩 있습니다(뜻이 여러 개인 단어는 번역도 여러 줄).
- 맨 위 DAY 제목, 책 이름, 쪽번호, QR 코드는 무시하세요.`;
const LIST_PROMPT=BOOK_GUIDE+`
할 일: 이 페이지의 표제어를 번호 순서대로 빠짐없이 적으세요. "n"은 표제어 바로 왼쪽에 인쇄된 숫자를 그대로 쓰세요. 순서를 세어서 번호를 새로 매기지 마세요(두 쪽이면 보통 왼쪽 쪽 번호가 더 작습니다). 책에 인쇄된 형태 그대로 쓰세요(encroachment를 encroach로 바꾸지 말 것, "no wonder" 같은 숙어 포함). 뜻 번호(1. 2.)는 표제어 번호가 아닙니다.
JSON 배열만 답하세요. 형식: [{"n":9,"w":"conversely"}]
표제어가 없으면 [] 만 답하세요.`;
const DETAIL_PROMPT=BOOK_GUIDE+`
할 일: 아래 지정한 번호의 표제어를 책에 적힌 그대로 옮기세요. 내용을 지어내거나 바꾸지 말고, 책에 없는 칸은 빈 문자열이나 빈 배열로 두세요.
- "w": 표제어(소문자, 인쇄된 형태 그대로), "n": 표제어 바로 왼쪽에 인쇄된 번호 그대로(정수), "stars": 별 개수, "ph": 발음기호(대괄호 없이), "fam": 파생어(예: "adj. converse, n. conversion")
- "senses": 뜻마다 하나씩, 책 순서대로. 각 항목:
  "pos": 품사, "syn": 그 줄의 유의어 전부(순서대로), "key": 그중 청록색 유의어만(색을 구분할 수 없으면 []), "ko": 그 줄 오른쪽의 한국어 뜻 그대로, "ex": 그 뜻의 책 예문 그대로(예문 속 표제어와 그 변형은 [대괄호]로 한 번 감싸기), "exKo": 페이지 맨 아래에서 그 예문에 해당하는 한국어 번역 그대로
- "note": "최신출제 포인트" 상자 내용 그대로(없으면 "")
JSON 배열만 답하세요. 형식:
[{"n":9,"w":"conversely","stars":3,"ph":"kənvə́ːrsli","fam":"adj. converse","senses":[{"pos":"adv.","syn":["on the other hand","contrarily"],"key":["on the other hand"],"ko":"반대로","ex":"Texting is growing more popular, while, [conversely], phone calls are becoming less common.","exKo":"휴대폰 문자 메시지는 ... 덜 흔해지고 있다."}],"note":""}]`;
/* read a page: first the headword list (short reply), then the details 4 entries at a time */
async function readPage(opts,tail){
  // Gemini can answer the whole page in one reply, so ask once (keeps a page to one request of the free daily quota);
  // the headword list + 4-at-a-time path below is the fallback when that comes back empty
  BK.stage="단어와 뜻을 읽는 중";const st1=$("#bkStage");if(st1)st1.textContent=BK.stage;
  let all=null;
  try{all=await ask(DETAIL_PROMPT+"\n이번에는 이 페이지의 표제어 전부를 번호 순서대로 답하세요. 한국어 뜻(\"ko\")은 모든 뜻 줄의 오른쪽 끝에 인쇄돼 있으니 비우지 말고 옮기세요."+tail,opts,240000)}
  catch(e){if(e&&e.code==="invalid_json")all=salvageArray(e.text);else if(isBusy(e)||!(e&&(e.code==="timeout"||e.code==="upstream_error")))throw e}
  if(Array.isArray(all)&&all.length){
    // a long one-shot reply tends to leave the small Korean meanings blank; ask again for just those headwords
    const hasKo=o=>Array.isArray(o&&o.senses)?o.senses.some(x=>x&&String(x.ko||"").trim()):!!String(o&&o.ko||"").trim();
    const miss=all.filter(o=>o&&typeof o.w==="string"&&!hasKo(o)).map(o=>o.w.trim());
    for(let k=0;k<miss.length&&k<24;k+=6){const b=miss.slice(k,k+6);BK.stage="빠진 뜻 다시 읽는 중 ("+Math.min(k+6,miss.length)+"/"+miss.length+")";const t=$("#bkStage");if(t)t.textContent=BK.stage;
      let r=null;try{r=await ask(DETAIL_PROMPT+"\n이번에는 표제어 "+b.map(x=>'"'+x+'"').join(", ")+"만 답하세요. 각 뜻 줄의 오른쪽 끝에 작은 글씨로 인쇄된 한국어 뜻을 \"ko\"에 꼭 옮기세요."+tail,opts,150000)}
      catch(e){if(e&&e.code==="invalid_json")r=salvageArray(e.text);else if(e&&(e.code==="rate_limited"||e.code==="cancelled"))break}
      for(const o of Array.isArray(r)?r:[]){if(!o||typeof o.w!=="string"||!hasKo(o))continue;const i=all.findIndex(x=>x&&typeof x.w==="string"&&x.w.trim().toLowerCase()===o.w.trim().toLowerCase());if(i>=0)all[i]={...o,n:all[i].n??o.n}}
      if(BK.ctl&&BK.ctl.signal.aborted)break}
    return all;
  }
  BK.stage="표제어 목록 읽는 중";const st0=$("#bkStage");if(st0)st0.textContent=BK.stage;
  let list=null;
  try{list=await ask(LIST_PROMPT+tail,opts,120000)}catch(e){if(e&&e.code==="invalid_json")list=salvageArray(e.text);else throw e}
  const nums=[...new Set((Array.isArray(list)?list:[]).map(o=>{const k=parseInt(o&&o.n,10);return Number.isFinite(k)&&k>0?k:null}).filter(Boolean))].sort((a,b)=>a-b);
  const words=[...new Set((Array.isArray(list)?list:[]).map(o=>o&&typeof o.w==="string"?o.w.trim():"").filter(Boolean))];
  const one=async(batch,byWord)=>{let r=null;try{r=await ask(DETAIL_PROMPT+(batch?(byWord?"\n이번에는 표제어 "+batch.map(x=>'"'+x+'"').join(", ")+"만 답하세요.":"\n이번에는 표제어 번호 "+batch.join(", ")+"번만 답하세요."):"")+tail,opts,150000)}
    catch(e){if(e&&e.code==="invalid_json")r=salvageArray(e.text);else if(e&&(e.code==="timeout"||e.code==="upstream_error"))r=null;else throw e}return Array.isArray(r)?r:[]};
  const out=[];
  if(nums.length<Math.max(2,words.length/2)){ // numbers unreadable: go by headword instead
    if(words.length<2)return await one(null);
    for(let k=0;k<words.length;k+=4){const b=words.slice(k,k+4);BK.stage="단어 정리하는 중 ("+Math.min(k+4,words.length)+"/"+words.length+")";const t=$("#bkStage");if(t)t.textContent=BK.stage;
      out.push(...await one(b,true));if(BK.ctl&&BK.ctl.signal.aborted)break}
    return out;
  }
  for(let k=0;k<nums.length;k+=4){const b=nums.slice(k,k+4);BK.stage="단어 정리하는 중 ("+Math.min(k+4,nums.length)+"/"+nums.length+")";const t=$("#bkStage");if(t)t.textContent=BK.stage;
    out.push(...await one(b));if(BK.ctl&&BK.ctl.signal.aborted)break}
  return out;
}
/* Gemini 503/500 = its servers are busy for a moment (not our quota): wait and try again a few times */
function isBusy(e){return !!e&&e.code==="upstream_error"&&/Gemini (500|503)|high demand|overloaded|UNAVAILABLE/i.test(String(e.text||""))}
function wait(ms,signal){return new Promise(r=>{const t=setTimeout(r,ms);if(signal)signal.addEventListener("abort",()=>{clearTimeout(t);r()},{once:true})})}
async function ask(input,opts,ms){const c=new AbortController();const outer=BK.ctl&&BK.ctl.signal;const relay=()=>c.abort();if(outer)outer.addEventListener("abort",relay);let timedOut=false;const t=setTimeout(()=>{timedOut=true;c.abort()},ms);
  try{for(let k=0;;k++){
    try{return await S.sample.json(input,{...opts,signal:c.signal})}
    catch(e){if(!isBusy(e)||k>=3||c.signal.aborted)throw e;
      const prev=BK.stage;BK.stage="Gemini 서버가 붐벼서 잠시 뒤 다시 시도하는 중 ("+(k+1)+"/3)";const st=$("#bkStage");if(st)st.textContent=BK.stage;
      await wait([5000,15000,30000][k],c.signal);BK.stage=prev;const st2=$("#bkStage");if(st2)st2.textContent=prev}}}
  catch(e){if(timedOut)throw Object.assign(new Error("timeout"),{code:"timeout"});if(outer&&outer.aborted)throw Object.assign(new Error("cancelled"),{code:"cancelled"});throw e}
  finally{clearTimeout(t);if(outer)outer.removeEventListener("abort",relay)}}
function timed(p,ms){let t;return Promise.race([p,new Promise((_,rej)=>{t=setTimeout(()=>rej(Object.assign(new Error("timeout"),{code:"timeout"})),ms)})]).finally(()=>clearTimeout(t))}
async function fillExamples(cands,signal){
  const need=cands.filter(c=>!c.ex);
  for(let i=0;i<need.length;i+=8){
    const part=need.slice(i,i+8);BK.stage="예문 채우는 중 ("+Math.min(i+8,need.length)+"/"+need.length+")";const t=$("#bkStage");if(t)t.textContent=BK.stage;
    let arr=null;
    try{arr=await ask(EX_PROMPT+JSON.stringify(part.map(c=>({w:c.w,pos:c.pos,ko:c.ko}))),{},90000)}
    catch(e){if(e&&e.code==="cancelled")throw e;if(signal&&signal.aborted)return;arr=e&&e.code==="invalid_json"?salvageArray(e.text):null}
    if(!Array.isArray(arr))continue;
    for(const o of arr){if(!o||typeof o.w!=="string")continue;const c=part.find(x=>x.w===o.w.trim().toLowerCase());if(!c)continue;
      let ex=str(o.ex,300);if(ex&&!/\[.+?\]/.test(ex)){const re=new RegExp("\\b("+c.w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\w*)","i");ex=ex.replace(re,"[$1]")}
      c.ex=ex;c.exKo=str(o.exKo,300)}
  }
}
/* numbered books: keep only entries that carry the book's own number; report gaps */
function byNumber(arr){return {arr:Array.isArray(arr)?arr:[],gaps:[],dropped:0,droppedWords:[]};
}
function byNumberOld(arr){
  if(!Array.isArray(arr))return {arr,gaps:[],dropped:0};
  const num=o=>{const v=o&&o.n;const k=typeof v==="number"?v:parseInt(v,10);return Number.isFinite(k)&&k>0&&k<2000?k:null};
  const withN=arr.filter(o=>num(o)!==null);
  if(withN.length<Math.max(2,arr.length/2))return {arr,gaps:[],dropped:0};
  const seen=new Set(),keep=[];for(const o of withN){const k=num(o);if(seen.has(k))continue;seen.add(k);keep.push(o)}
  keep.sort((a,b)=>num(a)-num(b));
  const ks=[...seen].sort((a,b)=>a-b),gaps=[];for(let k=ks[0];k<=ks[ks.length-1]&&gaps.length<20;k++)if(!seen.has(k))gaps.push(k);
  return {arr:keep,gaps,dropped:arr.length-keep.length,droppedWords:arr.filter(o=>num(o)===null).map(o=>o&&o.w).filter(Boolean)};
}
function normSenses(arr,w){
  if(!Array.isArray(arr))return [];const list=v=>(Array.isArray(v)?v:String(v||"").split(/[,;]/)).map(x=>String(x||"").trim()).filter(Boolean).slice(0,10);
  return arr.slice(0,4).map(s=>{if(!s)return null;let ex=str(s.ex,300);
    if(ex&&!/\[.+?\]/.test(ex)){const re=new RegExp("\\b("+w.split(" ")[0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\w*)","i");ex=ex.replace(re,"[$1]")}
    const syn=list(s.syn).map(x=>x.slice(0,40));const keyL=list(s.key).map(x=>x.toLowerCase());
    return {pos:str(s.pos,14),syn,key:syn.filter(x=>keyL.includes(x.toLowerCase())),ko:str(s.ko,80),ex,exKo:str(s.exKo,300)}}).filter(s=>s&&(s.ko||s.syn.length||s.ex));
}
function normCands(arr,also){
  if(!Array.isArray(arr))return [];
  const have=new Set(S.custom.map(w=>w.w.toLowerCase()));if(also)for(const x of also)have.add(x);
  const seen=new Set();const out=[];
  for(const o of arr){
    if(!o||typeof o.w!=="string")continue;const w=o.w.trim().toLowerCase().replace(/\s+/g," ").slice(0,40);if(!w||seen.has(w)||!/[a-z]/.test(w))continue;seen.add(w);
    let ex=str(o.ex,300);
    if(ex&&!/\[.+?\]/.test(ex)){const re=new RegExp("\\b("+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\w*)","i");ex=ex.replace(re,"[$1]")}
    const nn=typeof o.n==="number"?o.n:parseInt(o.n,10);
    const senses=normSenses(o.senses,w);
    if(senses.length){const allSyn=[...new Set(senses.flatMap(s=>s.syn))];
      out.push({w,no:Number.isFinite(nn)&&nn>0&&nn<2000?nn:null,kb:true,pos:str(senses[0].pos,14),ko:str(senses.map(s=>s.ko).filter(Boolean).join("; "),160),ex:senses[0].ex,exKo:senses[0].exKo,fam:str(o.fam,140),syn:str(allSyn.join(", "),300),
        senses,note:str(o.note,600),ph:str(o.ph,60).replace(/^\[|\]$/g,""),stars:Math.max(0,Math.min(3,parseInt(o.stars,10)||0)),dup:have.has(w)});continue}
    out.push({w,no:Number.isFinite(nn)&&nn>0&&nn<2000?nn:null,kb:o.kb!==false,pos:str(o.pos,14),ko:str(o.ko,80),ex,exKo:str(o.exKo,300),fam:str(o.fam,140),syn:str(o.syn,160),dup:have.has(w)});
  }
  return out.slice(0,60);
}
function errCopy(e){const c=e&&e.code;return c==="timeout"?"너무 오래 걸려서 멈췄어. 이 사진만 다시 올려줘.":c==="not_granted"||c==="sampling_disabled"?"사진 읽기 서버에 연결하지 못했어.":c==="rate_limited"?"오늘 사진 읽기 한도를 다 쓴 것 같아. 조금 뒤나 내일 다시 해줘.":c==="images_unavailable"?"사진을 보내지 못했어. 다시 해줘.":c==="image_rejected"?"이 사진은 못 읽겠어. JPG나 PNG 사진으로 해줘.":c==="invalid_json"||c==="empty_completion"?"단어를 정리하지 못했어. 다시 찍어줘.":c==="refused"?"이 사진은 처리할 수 없어. 단어가 잘 보이게 다시 찍어줘.":c==="session_expired"?"다시 로그인하고 해줘.":isBusy(e)?"Gemini 서버가 지금 붐벼서 몇 번 다시 해봤는데도 안 됐어. 한도 문제는 아니야. 10~30분 뒤에 다시 올려줘.":"사진 읽기에 실패했어. 다시 해줘."+(c==="upstream_error"&&e.text?" ("+String(e.text).slice(0,160)+")":"")}
const OCR_PROMPT=`아래 텍스트는 영어 단어책(또는 영어 교재) 한 페이지를 폰에서 글자 인식(OCR)으로 읽은 결과입니다. 인식 오류(깨진 글자, 줄바꿈 섞임, 한글 오타)가 있을 수 있으니 문맥으로 바로잡아 주세요. 한국인 학습자가 토플(목표 밴드 4.5)을 준비하며 이 페이지의 단어를 외우려고 합니다.
표 형식 페이지 안내: 보통 한 행에 [표제어 | 영어 유의어 목록 | 한국어 뜻]이 있습니다. 표제어는 각 행의 맨 왼쪽 칸에 있고, 같은 행의 한국어 뜻과 짝을 이룹니다. 가운데 칸의 영어 유의어가 길어서 다음 줄로 넘어간 단어(예: incontrovertible, boldness)는 표제어가 아닙니다. "give rise to", "no wonder" 같은 숙어도 표제어면 그대로 포함하세요. 표제어는 책에 인쇄된 형태 그대로 쓰세요. encroachment를 encroach로 바꾸는 것처럼 원형으로 고치지 마세요. 예문에만 나오는 단어는 표제어가 아닙니다.
번호 규칙: 표제어 옆에 책이 붙인 번호(1, 2, 3…)가 있으면 그 번호를 "n"에 정수로 적으세요. 번호가 붙은 책이면 번호가 붙은 표제어만 넣고, 번호 순서대로 빠진 번호가 없는지 확인하세요. 한 표제어 안의 1. 2. 3. 뜻 번호는 표제어 번호가 아닙니다. 책에 표제어 번호가 아예 없으면 "n"은 null로 하세요.
단어 블록형 페이지 안내(예: Hackers Voca): 번호와 표제어가 왼쪽 색 띠 안에 있고(옆의 *** 별표는 중요도), 그 아래에 발음기호와 파생어(예: n. exploitation)가 작게 있습니다. 같은 줄 가운데에는 품사(v. / adj. / phr.)와 영어 유의어 목록이, 같은 줄 오른쪽 끝에는 작은 글씨의 한국어 뜻이 있습니다. 한 표제어에 1. 2. 3.처럼 뜻이 여러 개 있으면 한 단어로 합쳐서, 각 줄의 한국어 뜻을 "; "로 이어 "ko"에 넣고(최대 3개), 유의어는 첫 번째 뜻 것부터 모든 뜻에서 고르고, "pos"는 첫 뜻의 품사(숙어는 "phr.")로 하세요. 표제어 아래 영어 문장은 책 예문이고, "최신출제 포인트" 상자는 참고 설명이며, 페이지 맨 아래 왼쪽의 단어 목록과 한국어 문장들은 예문 번역 모음입니다. 이것들은 새 표제어가 아니니 따로 넣지 마세요. 파생어는 "fam"에 넣으세요. 맨 위 DAY 제목, 책 이름, 쪽번호는 무시하세요.
OCR에서는 왼쪽 색 띠 안의 표제어가 빠지거나 깨질 수 있습니다. 그럴 때는 페이지 맨 아래 왼쪽 목록의 단어, 예문마다 반복되는 단어, 유의어 줄의 순서로 표제어를 복원하세요. 오른쪽 한국어 뜻이 깨져서 알아볼 수 없으면 직접 쓰고 "kb"를 false로 하세요.
해야 할 일:
1) 이 페이지의 학습 대상 영어 단어(표제어)를 빠짐없이, 페이지에 나온 순서 그대로 찾으세요(최대 60개). 다 찾았는지 행 수를 세어 확인하세요. 예문 속 일반 단어나 머리말·쪽번호는 빼세요.
2) 각 단어에 대해 책에 적힌 한국어 뜻을 "ko"에 옮기세요(핵심 뜻 1~3개로 짧게, OCR 오타는 고쳐서). 텍스트에 그 단어의 한국어 뜻이 없거나 알아볼 수 없으면 직접 쓰고 "kb"를 false로 하세요.
3) 책에 영어 유의어가 있으면 그중 핵심 3~5개를 "syn"에 넣으세요. 책에 없는 정보는 채우세요: 품사, 단어 가족(파생어), 유의어(책에 없을 때). 예문은 쓰지 마세요(따로 만듭니다). 답을 짧게 유지하세요.
JSON 배열만 답하세요. 형식:
[{"n":3,"w":"책에 인쇄된 표제어 그대로(소문자)","kb":true,"ko":"책의 한국어 뜻","pos":"n. / v. / adj. / adv. 등","fam":"파생어 쉼표로 구분(없으면 빈 문자열)","syn":"영어 유의어 3~5개"}]
학습 단어를 찾을 수 없으면 [] 만 답하세요.

OCR 텍스트:
`;
let ocrWorker=null;
function loadScript(src){return new Promise((res,rej)=>{const x=document.createElement("script");x.src=src;x.onload=res;x.onerror=()=>rej(new Error("엔진 파일을 불러오지 못함: "+src));document.head.append(x)})}
let ocrLog=null;
async function getOcr(){
  if(ocrWorker)return ocrWorker;
  if(!window.Tesseract)await loadScript("ocr/tesseract.min.js");
  const base=new URL("ocr/",location.href).href;
  ocrWorker=await Tesseract.createWorker(["eng","kor"],1,{workerPath:base+"worker.min.js",corePath:base+"core",langPath:base+"lang",workerBlobURL:false,cacheMethod:"none",logger:m=>{if(ocrLog)ocrLog(m)}});
  return ocrWorker;
}
async function prepImage(file,mode){
  let src;
  try{src=await createImageBitmap(file,{imageOrientation:"from-image"})}
  catch{src=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error("사진을 열 수 없음"));im.src=URL.createObjectURL(file)})}
  // small screenshots get upscaled (tiny Korean glosses), big photos get capped; then gray + Otsu threshold so tinted bands drop out
  const w=src.width,h=src.height,sc=Math.max(Math.min(2600/Math.max(w,h),3),0.2);
  const c=document.createElement("canvas");c.width=Math.round(w*sc);c.height=Math.round(h*sc);
  const g=c.getContext("2d",{willReadFrequently:true});g.imageSmoothingQuality="high";
  if(mode==="teal"){ // headwords and Korean glosses sit on teal bars: keep only dark ink, drop the teal and the paper
    g.drawImage(src,0,0,c.width,c.height);try{const im=g.getImageData(0,0,c.width,c.height),d=im.data;for(let i=0;i<d.length;i+=4){const v=Math.min(d[i+1],d[i+2])<110?0:255;d[i]=d[i+1]=d[i+2]=v}g.putImageData(im,0,0)}catch{}return c}
  g.filter="grayscale(1)";g.drawImage(src,0,0,c.width,c.height);g.filter="none";
  try{const im=g.getImageData(0,0,c.width,c.height),d=im.data,hist=new Array(256).fill(0);for(let i=0;i<d.length;i+=4)hist[d[i]]++;
    const tot=d.length/4;let sum=0;for(let i=0;i<256;i++)sum+=i*hist[i];let sB=0,wB=0,best=0,th=160;
    for(let t=0;t<256;t++){wB+=hist[t];if(!wB)continue;const wF=tot-wB;if(!wF)break;sB+=t*hist[t];const mB=sB/wB,mF=(sum-sB)/wF,v=wB*wF*(mB-mF)*(mB-mF);if(v>best){best=v;th=t}}
    th=Math.min(th+12,215);for(let i=0;i<d.length;i+=4){const v=d[i]<th?0:255;d[i]=d[i+1]=d[i+2]=v}g.putImageData(im,0,0)}catch{}
  return c;
}
async function ocrFile(file){
  ocrLog=m=>{const st=m.status||"";const pc=Math.round((m.progress||0)*100);BK.stage=st.includes("recogniz")?"사진 속 글자 읽는 중 "+pc+"%":"글자 인식 준비 중 (처음 한 번은 1분 정도 걸려)";const t=$("#bkStage");if(t)t.textContent=BK.stage};
  const worker=await getOcr();
  await worker.setParameters({tessedit_pageseg_mode:"3",preserve_interword_spaces:"1"});
  const canvas=await prepImage(file);
  const {data}=await worker.recognize(canvas);
  // second pass for the colored bars (book number + headword, Korean meaning)
  let bar="";try{await worker.setParameters({tessedit_pageseg_mode:"11",preserve_interword_spaces:"1"});const r2=await worker.recognize(await prepImage(file,"teal"));bar=String(r2.data&&r2.data.text||"").replace(/\n{2,}/g,"\n").trim()}catch{}
  ocrLog=null;const main=String(data&&data.text||"").trim();
  return bar?main+"\n\n[2차 인식: 색 띠 안의 글자만(표제어 번호·표제어·한국어 뜻). 순서가 섞여 있을 수 있음]\n"+bar:main;
}
async function onPhotos(fileList){
  const files=[...fileList].slice(0,10);if(!files.length)return;
  if(!S.sample){BK.err=noSampleMsg();render();return}
  BK.busy=true;BK.err="";BK.numbered=0;BK.filled=0;BK.last={added:[],skipped:0,book:"내 책"};BK.ctl=new AbortController();
  const addedSet=new Set();
  try{
  for(let i=0;i<files.length;i++){
    BK.prog={i:i+1,n:files.length};render();
    try{
      let arr=null;
      if(S.canImg){
        BK.stage="단어와 뜻을 읽는 중";render();
        try{arr=await readPage({images:files[i]},"")}
        catch(e){if(e&&e.code==="images_unavailable")S.canImg=false;else throw e}
      }
      if(arr===null){
        BK.stage="글자 인식 엔진 준비 중";render();
        let text;
        try{text=await timed(ocrFile(files[i]),180000)}
        catch(e){BK.err="사진 속 글자를 못 읽었어. ("+String(e&&e.message||e).slice(0,120)+")";break}
        if(BK.ctl.signal.aborted)break;
        if(text.replace(/\s/g,"").length<15){BK.err=(files.length>1?(i+1)+"번째 사진: ":"")+"글자가 거의 안 보여. 밝은 곳에서 정면으로, 가까이 찍어줘.";continue}
        BK.stage="단어와 뜻을 정리하는 중";render();
        arr=await readPage({},"\n\n(사진 대신 폰 글자 인식(OCR) 결과입니다. 인식 오류는 문맥으로 바로잡되, 색은 알 수 없으니 \"key\"는 []로 두세요. 표제어 번호와 한국어 뜻은 [2차 인식] 부분에 \"1 exploit\", \"보충하다\"처럼 따로 나옵니다. 번호는 반드시 거기 적힌 숫자를 쓰세요. 몇 개만 안 보이면 앞뒤 번호 사이에 확실히 끼는 경우(예: 3과 5 사이)에만 채우고, 그 밖에는 \"n\"을 null로 두세요. 1부터 순서대로 새로 매기지 마세요.)\nOCR 텍스트:\n"+text.slice(0,12000));
      }
      const bn=byNumber(arr);arr=bn.arr;
      if(bn.droppedWords&&bn.droppedWords.length)BK.err=(BK.err?BK.err+"\n":"")+(files.length>1?(i+1)+"번째 사진: ":"")+"책 번호를 못 읽어서 뺀 단어: "+bn.droppedWords.slice(0,8).join(", ")+". 그 줄이 잘 보이게 다시 찍어줘.";
      if(bn.gaps.length)BK.err=(BK.err?BK.err+"\n":"")+(files.length>1?(i+1)+"번째 사진: ":"")+bn.gaps.join(", ")+"번 단어를 못 읽었어. 그 부분이 잘 보이게 다시 찍어줘.";
      const cands=normCands(arr,addedSet);const fresh=cands.filter(c=>!c.dup);
      // words already in the list without a book number: just attach the number
      for(const c of cands){if(!c.dup||!c.no)continue;const ex=S.custom.find(x=>x.w.toLowerCase()===c.w&&!x.no);if(!ex)continue;ex.no=c.no;
        if(S.mode==="remote"){try{await timed(S.db.doc("custom/"+ex.docId).update({no:c.no}),20000);BK.numbered=(BK.numbered||0)+1}catch{}}else{BK.numbered=(BK.numbered||0)+1;saveLocal()}}
      // words already in the list with blank parts (meaning, example, synonyms…): fill only those from this read
      for(const c of cands){if(!c.dup)continue;const ex=S.custom.find(x=>x.w.toLowerCase()===c.w);if(!ex)continue;
        const patch=fillBlanks(ex,c);if(!patch)continue;
        Object.assign(ex,patch);BK.filled=(BK.filled||0)+1;
        if(S.mode==="remote"){try{await timed(S.db.doc("custom/"+ex.docId).update(patch),20000)}catch{}}else saveLocal()}
      BK.last.skipped+=cands.length-fresh.length;
      if(!cands.length)BK.err=(files.length>1?(i+1)+"번째 사진: ":"")+"단어를 못 찾았어. 단어가 잘 보이게 다시 찍어줘.";
      if(fresh.length){await addCustom(fresh);fresh.forEach(c=>{addedSet.add(c.w);BK.last.added.push(c.w)})}
    }catch(e){if(e&&e.code==="cancelled")break;BK.err=(BK.err?BK.err+"\n":"")+(files.length>1?(i+1)+"번째 사진: ":"")+errCopy(e);if(e&&e.code==="timeout")continue;if(e&&["not_granted","sampling_disabled","rate_limited","session_expired"].includes(e.code))break}
  }
  }finally{
  BK.busy=false;BK.prog=null;BK.ctl=null;render();
  }
}
function noSampleMsg(){return S.mode==="local"?"지금은 미리보기 모드라 사진 인식을 쓸 수 없어요.":"사진 읽기 서버가 아직 연결되지 않았어요. (js/config.js의 workerUrl)"}
function statusOf(id){const r=recOf(id);if(!r)return ["new","새 단어"];if(r.i==="skip")return ["ok","이미 앎"];if(r.b>=4)return ["ok","외움"];if(r.i&&/^\d{4}-/.test(r.i)&&r.i<ymd())return ["done","학습 완료"];return ["gray","학습 중"]}
function wordRow(c,tagFn,swipe){
  const [sc,sl]=tagFn?tagFn(c.id):statusOf(c.id);const open=BK.open===c.id;
  const canSwipe=swipe&&c.src!=="awl";const shown=canSwipe&&BK.swiped===c.id;
  const issues=c.docId&&S.tab==="book"?checkIssues(c):[];
  const head=el("button",{class:"bwhead",onclick:e=>{if(head.dataset.dragged){delete head.dataset.dragged;return}if(BK.swiped){BK.swiped=null;render();return}BK.open=open?null:c.id;render()},"aria-expanded":open?"true":"false"},el("span",{class:"w",lang:"en"},c.w),
    el("span",{class:"ko"},issues.length?el("b",{class:"chk"},"확인 필요"):null,c.ko||(issues.length?"뜻 없음":"")),el("span",{class:"st "+sc},sl));
  if(canSwipe)attachRowSwipe(head,c);
  return el("li",{class:"bw"+(canSwipe?" swipe":"")+(shown?" swiped":"")},
    canSwipe?el("div",{class:"swwrap"},el("button",{class:"swdel","aria-label":c.w+" 휴지통으로",tabindex:shown?"0":"-1",onclick:()=>{BK.swiped=null;BK.open=null;delCustom(c)}},"삭제"),head):head,
    open?el("div",{class:"detail"},c.senses&&c.senses.length?(c.ph?el("span",{class:"small muted",lang:"en"},"["+c.ph+"]"):null):el("span",{class:"small muted"},c.pos+(c.kb===false?" · 뜻: 보충":" · 뜻: 책")),issues.length?el("div",{class:"chkbox"},el("b",null,"사진에서 다 못 읽었을 수 있어. 책과 비교해 줘"),el("ul",null,issues.map(x=>el("li",null,x)))):null,
      wordBody(c),
      c.docId&&S.tab==="book"?el("div",{class:"chkbtns"},el("button",{class:"btn",onclick:()=>openEdit(c)},"뜻·예문 고치기"),
        issues.length?el("button",{class:"btn",onclick:()=>confirmChk(c)},"이대로 맞아"):null):null):null);
}
function noEditor(c){
  const inp=el("input",{type:"number",inputmode:"numeric",min:"1",max:"1999",value:c.no||"",placeholder:"번호","aria-label":c.w+" 책 번호",class:"noin"});
  const save=async()=>{const v=parseInt(inp.value,10);const no=Number.isFinite(v)&&v>0&&v<2000?v:null;if(no===(c.no||null))return;
    if(S.mode==="local"){c.no=no;saveLocal();render();return}
    try{await timed(S.db.doc("custom/"+c.docId).update({no:no===null?0:no}),20000);toast(no?"책 번호를 "+no+"번으로 바꿨어":"책 번호를 지웠어")}catch{toast("번호를 저장하지 못했어")}};
  return el("div",{class:"noedit"},el("label",null,"책 번호"),inp,el("button",{class:"btn",style:"padding:6px 12px;font-size:13px",onclick:save},"저장"));
}
function attachRowSwipe(head,c){
  let sx=0,sy=0,dx=0,down=false,horiz=null;const base=BK.swiped===c.id?-84:0;
  head.addEventListener("pointerdown",e=>{down=true;sx=e.clientX;sy=e.clientY;dx=0;horiz=null;head.style.transition="none"});
  head.addEventListener("pointermove",e=>{if(!down)return;const mx=e.clientX-sx,my=e.clientY-sy;
    if(horiz===null&&(Math.abs(mx)>8||Math.abs(my)>8))horiz=Math.abs(mx)>Math.abs(my);
    if(!horiz)return;dx=mx;head.style.transform="translateX("+Math.max(-110,Math.min(0,base+dx))+"px)";try{head.setPointerCapture(e.pointerId)}catch{}});
  const end=()=>{if(!down)return;down=false;head.style.transition="transform .18s";
    if(horiz){head.dataset.dragged="1";const open=base+dx<-42;BK.swiped=open?c.id:(BK.swiped===c.id?null:BK.swiped);head.style.transform="translateX("+(open?-84:0)+"px)";setTimeout(()=>render(),190)}else head.style.transform=""};
  head.addEventListener("pointerup",end);head.addEventListener("pointercancel",()=>{down=false;head.style.transform=""});
}
const PER=10;
/* newest upload first; words from one upload keep their page order */
function newestFirst(list){const bk=c=>Math.floor((c.at||0)/15000);return list.slice().sort((a,b)=>bk(b)-bk(a)||(a.at||0)-(b.at||0))}
/* popups: the whole list scrolls inside the sheet; header and close button stay put */
const SC={};
function scrollList(key,list,tagFn,swipe){
  const box=el("div",{class:"sheetscroll",onscroll:e=>{SC[key]=e.currentTarget.scrollTop}},el("ul",{class:"booklist"},list.map(c=>wordRow(c,tagFn,swipe))));
  requestAnimationFrame(()=>{if(SC[key])box.scrollTop=SC[key]});return box;
}
function pagedList(key,list,tagFn,swipe){
  const pages=Math.max(1,Math.ceil(list.length/PER));let pg=Math.min(BK.pages[key]||0,pages-1);BK.pages[key]=pg;
  const go=d=>{BK.pages[key]=Math.max(0,Math.min(pages-1,pg+d));BK.open=null;render()};
  return [el("ul",{class:"booklist"},list.slice(pg*PER,pg*PER+PER).map(c=>wordRow(c,tagFn,swipe))),
    pages>1?el("div",{class:"pager"},el("button",{class:"pg","aria-label":"이전 10개",disabled:pg===0,onclick:()=>go(-1)},"‹"),el("span",{class:"num"},(pg+1)+" / "+pages),el("button",{class:"pg","aria-label":"다음 10개",disabled:pg>=pages-1,onclick:()=>go(1)},"›")):null];
}
function searchHits(q){
  q=q.trim().toLowerCase();if(!q)return [];
  const score=w=>{const ww=w.w.toLowerCase();if(ww===q)return 0;if(ww.startsWith(q))return 1;if(ww.includes(q))return 2;if((w.ko||"").includes(q))return 3;if((w.syn||"").toLowerCase().includes(q)||(w.fam||"").toLowerCase().includes(q))return 4;return 9};
  return allWords().map(w=>[score(w),w]).filter(x=>x[0]<9).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
}
function trashBtn(){const n=(S.trash||[]).length;return el("button",{class:"trashbtn","aria-label":"휴지통"+(n?" "+n+"개":""),onclick:()=>{S.trashSheet=true;BK.trashConfirm=null;render()}},el("span",{svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>',style:"display:contents"}),n?el("span",{class:"num"},String(n)):null)}
function viewTrashSheet(){
  const close=()=>{S.trashSheet=false;BK.emptyConfirm=false;render()};const list=S.trash||[];
  return el("div",{class:"scrim",onclick:e=>{if(e.target===e.currentTarget)close()}},el("div",{class:"sheet listsheet",role:"dialog","aria-label":"휴지통"},
    el("div",{class:"rowline"},el("h2",null,"휴지통 "+list.length+"개"),el("button",{class:"iconbtn","aria-label":"닫기",onclick:close},icon("close"))),
    el("p",{class:"small muted",style:"margin:0"},"실수로 지운 단어는 되돌릴 수 있어. 학습 기록도 같이 돌아와. 뜻을 누르면 고칠 수 있어. 완전히 지우려면 단어를 왼쪽으로 밀어 봐."),
    list.length?el("div",{class:"sheetscroll",onscroll:e=>{SC.trash=e.currentTarget.scrollTop}},el("ul",{class:"booklist"},list.map(c=>{const shown=BK.swiped===c.id;
      const head=el("div",{class:"trashrow"},el("span",{class:"w",lang:"en"},c.w),
        el("button",{class:"ko trashedit","aria-label":c.w+" 고치기",onclick:()=>{if(head.dataset.dragged){delete head.dataset.dragged;return}openEdit(c)}},c.ko||"뜻 없음 · 눌러서 고치기"),
        el("button",{class:"btn primary",style:"padding:6px 10px;font-size:13px",onclick:()=>{if(head.dataset.dragged){delete head.dataset.dragged;return}restoreCustom(c)}},"되돌리기"));
      attachRowSwipe(head,c);
      return el("li",{class:"bw swipe"+(shown?" swiped":"")},el("div",{class:"swwrap"},el("button",{class:"swdel","aria-label":c.w+" 완전히 삭제",tabindex:shown?"0":"-1",onclick:()=>{BK.swiped=null;purgeCustom(c)}},"완전 삭제"),head))})))
    :el("p",{class:"muted"},"휴지통이 비었어."),
    list.length?(BK.emptyConfirm?el("div",{style:"display:flex;flex-direction:column;gap:8px"},
        el("p",{class:"small",style:"margin:0;color:var(--bad)"},list.length+"개가 완전히 지워지고 되돌릴 수 없어. 비울까?"),
        el("div",{style:"display:flex;gap:8px"},el("button",{class:"btn block",onclick:()=>{BK.emptyConfirm=false;render()}},"취소"),
          el("button",{class:"btn danger block",disabled:!!BK.emptying,onclick:()=>emptyTrash(list)},BK.emptying?"비우는 중…":"비우기")))
      :el("button",{class:"btn danger block withicon",onclick:()=>{BK.emptyConfirm=true;render()}},icon("trash"),"휴지통 비우기")):null));
}
/* edit a book word by hand: fixes meanings the photo reading missed or got wrong */
const ED={id:null,n:1,err:"",busy:false};
function editOf(){return (S.customAll||[]).find(c=>c.id===ED.id)}
function openEdit(c){ED.id=c.id;ED.n=Math.max(1,Array.isArray(c.senses)&&c.senses.length?c.senses.length:1);ED.err="";ED.busy=false;S.editWord=true;render()}
function closeEdit(){ED.id=null;S.editWord=false;render()}
function editSenses(c){return Array.isArray(c.senses)&&c.senses.length?c.senses:[{pos:c.pos||"",syn:String(c.syn||"").split(/,\s*/).filter(Boolean),key:[],ko:c.ko||"",ex:c.ex||"",exKo:c.exKo||""}]}
/* what the photo reading left blank or half-read; chk = someone checked it against the book */
function checkIssues(c){
  if(!c||c.chk)return [];const out=[];const ss=editSenses(c);const multi=ss.length>1;
  ss.forEach((s,i)=>{const p=multi?(i+1)+"번 뜻 ":"";const ex=String(s.ex||"").trim();
    const syn=Array.isArray(s.syn)?s.syn.filter(x=>String(x).trim()):String(s.syn||"").split(/[,;]/).filter(x=>x.trim());
    if(!String(s.ko||"").trim())out.push(p+"한국어 뜻 없음");
    if(!ex)out.push(p+"예문 없음");else{if(!/\[.+?\]/.test(ex))out.push(p+"예문에 단어 표시 없음");if(!String(s.exKo||"").trim())out.push(p+"예문 번역 없음")}
    if(!syn.length)out.push(p+"유의어 없음")});
  if(c.kb===false)out.push("뜻을 책에서 못 읽어 보충함");
  if(/판독|인식 상태/.test(c.note||""))out.push("참고 일부만 읽음");
  return out;
}
async function confirmChk(c){
  if(S.mode==="local"){setCustomAll(S.customAll.map(x=>x.id===c.id?{...x,chk:true}:x));saveLocal();render();return}
  try{await timed(S.db.doc("custom/"+c.docId).update({chk:true}),20000);toast("'"+c.w+"'을(를) 확인했어")}catch{toast("저장하지 못했어")}
}
/* a re-read of the same page fills only the blank parts; checked or hand-fixed words are left alone */
function fillBlanks(old,c){
  if(old.chk)return null;
  const blank=v=>v==null||(Array.isArray(v)?!v.length:!String(v).trim());
  const os=editSenses(old),ns=editSenses(c);
  const merged=os.map((s,i)=>{const n=ns[i];if(!n)return s;const o={...s};
    for(const k of ["pos","ko","ex","exKo"])if(blank(o[k])&&!blank(n[k]))o[k]=n[k];
    if(blank(o.syn)&&!blank(n.syn)){o.syn=n.syn;o.key=n.key||[]}return o});
  for(let i=os.length;i<ns.length&&i<4;i++)merged.push(ns[i]);
  const patch={};
  if(JSON.stringify(merged)!==JSON.stringify(os)){
    const d={ko:merged.map(s=>s.ko).filter(Boolean).join("; ").slice(0,160),syn:[...new Set(merged.flatMap(s=>s.syn||[]))].join(", ").slice(0,300),pos:merged[0].pos,ex:merged[0].ex,exKo:merged[0].exKo};
    for(const k in d)if(d[k]!==old[k])patch[k]=d[k];
    if(Array.isArray(old.senses)&&old.senses.length||merged.length>1)patch.senses=merged}
  for(const k of ["fam","note","ph"])if(blank(old[k])&&!blank(c[k]))patch[k]=c[k];
  if(!old.stars&&c.stars)patch.stars=c.stars;
  return Object.keys(patch).length?patch:null;
}
function edField(id,label,value,opts){const o=opts||{};return el("div",{class:"field"},el("label",{for:id},label),
  o.area?el("textarea",{id,rows:"2",value:value||"",placeholder:o.ph||null,lang:o.en?"en":null}):el("input",{id,value:value||"",placeholder:o.ph||null,autocomplete:"off",autocapitalize:o.en?"off":null,spellcheck:"false",lang:o.en?"en":null}))}
function viewEditSheet(){
  const c=editOf();if(!c)return "";const ss=editSenses(c);const multi=ED.n>1;
  const v=id=>{const i=document.getElementById(id);return i?i.value.trim():""};
  const senseBox=i=>{const s=ss[i]||{pos:"",syn:[],ko:"",ex:"",exKo:""};const p="ed_s"+i+"_";
    return el("div",{class:"edsense"},multi?el("div",{class:"rowline"},el("b",{class:"small"},"뜻 "+(i+1)),
        i===ED.n-1&&i>0?el("button",{class:"reshuffle",onclick:()=>{ED.n--;render()}},"이 뜻 빼기"):null):null,
      el("div",{class:"edgrid"},edField(p+"ko","한국어 뜻",s.ko,{ph:"예: 반대로"}),edField(p+"pos","품사",s.pos,{ph:"adj.",en:true})),
      edField(p+"syn","유의어 (쉼표로 구분)",(s.syn||[]).join(", "),{en:true}),
      edField(p+"ex","예문 (단어를 [대괄호]로 감싸면 강조돼)",s.ex,{area:true,en:true}),
      edField(p+"exKo","예문 번역",s.exKo,{area:true}))};
  const save=async()=>{
    const w=v("ed_w").toLowerCase().replace(/\s+/g," ").slice(0,40);
    if(!w||!/[a-z]/.test(w)){ED.err="영어 단어를 적어줘.";render();return}
    if((S.customAll||[]).some(x=>x.id!==c.id&&!x.deleted&&x.w.toLowerCase()===w)){ED.err="'"+w+"'은(는) 이미 단어장에 있어.";render();return}
    const old=editSenses(c);
    const senses=[];for(let i=0;i<ED.n;i++){const p="ed_s"+i+"_";const syn=v(p+"syn").split(/[,;]/).map(x=>x.trim()).filter(Boolean).slice(0,10).map(x=>x.slice(0,40));
      const keyL=((old[i]&&old[i].key)||[]).map(x=>x.toLowerCase());
      senses.push({pos:v(p+"pos").slice(0,14),syn,key:syn.filter(x=>keyL.includes(x.toLowerCase())),ko:v(p+"ko").slice(0,80),ex:v(p+"ex").slice(0,300),exKo:v(p+"exKo").slice(0,300)})}
    const kept=senses.filter(s=>s.ko||s.syn.length||s.ex);
    if(!kept.some(s=>s.ko)){ED.err="한국어 뜻을 적어줘.";render();return}
    const ko=kept.map(s=>s.ko).filter(Boolean).join("; ").slice(0,160);
    const patch={w,ko,pos:kept[0].pos,syn:[...new Set(kept.flatMap(s=>s.syn))].join(", ").slice(0,300),ex:kept[0].ex,exKo:kept[0].exKo,fam:v("ed_fam").slice(0,140)};
    if(Array.isArray(c.senses)&&c.senses.length||kept.length>1){patch.senses=kept;patch.note=v("ed_note").slice(0,600)}
    if(ko!==String(c.ko||"").trim())patch.kb=true; // a meaning typed from the book is the book's meaning
    patch.chk=true; // fixed by hand: no longer needs checking
    if(S.mode==="local"){setCustomAll(S.customAll.map(x=>x.id===c.id?{...x,...patch}:x));saveLocal();toast("'"+w+"'을(를) 고쳤어");closeEdit();return}
    ED.busy=true;ED.err="";render();
    try{await timed(S.db.doc("custom/"+c.docId).update(patch),20000);toast("'"+w+"'을(를) 고쳤어");closeEdit()}
    catch(e){ED.busy=false;ED.err="저장하지 못했어. 인터넷 연결을 확인해줘.";render()}};
  return el("div",{class:"scrim",onclick:e=>{if(e.target===e.currentTarget)closeEdit()}},el("div",{class:"sheet",role:"dialog","aria-label":c.w+" 고치기"},
    el("div",{class:"rowline"},el("h2",null,"단어 고치기"),el("button",{class:"iconbtn","aria-label":"닫기",onclick:closeEdit},icon("close"))),
    c.deleted?el("p",{class:"small muted",style:"margin:0"},"휴지통에 있는 단어야. 고친 뒤 휴지통에서 「되돌리기」를 누르면 단어장에 다시 들어가."):null,
    edField("ed_w","영어 단어",c.w,{en:true}),
    Array.from({length:ED.n},(_,i)=>senseBox(i)),
    ED.n<4?el("button",{class:"btn block",onclick:()=>{ED.n++;render()}},"뜻 하나 더 넣기"):null,
    edField("ed_fam","단어 가족 (파생어)",c.fam,{en:true,ph:"예: n. conversion"}),
    Array.isArray(c.senses)&&c.senses.length||multi?edField("ed_note","참고 (최신출제 포인트)",c.note,{area:true}):null,
    ED.err?el("p",{class:"note",style:"color:var(--bad);border-color:var(--bad);margin:0",role:"alert"},ED.err):null,
    el("div",{style:"display:flex;gap:8px"},el("button",{class:"btn block",onclick:closeEdit},"취소"),
      el("button",{class:"btn primary block",disabled:ED.busy,onclick:save},ED.busy?"저장하는 중…":"저장"))));
}
async function emptyTrash(list){
  BK.emptying=true;render();
  if(S.mode==="local"){const ids=new Set(list.map(c=>c.id));setCustomAll(S.customAll.filter(x=>!ids.has(x.id)));saveLocal()}
  else{let fail=0;for(const c of [...list]){try{await timed(S.db.doc("custom/"+c.docId).delete(),20000)}catch{fail++}}if(fail)toast(fail+"개는 지우지 못했어")}
  BK.emptying=false;BK.emptyConfirm=false;render();
}
function viewBook(){
  const learner=S.role==="learner";
  const groups=new Map();for(const c of S.custom){const b=c.book||"내 책";if(!groups.has(b))groups.set(b,[]);groups.get(b).push(c)}
  const fileIn=el("input",{type:"file",accept:"image/*",multiple:true,id:"photoIn",hidden:true,onchange:e=>{const f=e.target.files;const copy=f?[...f]:[];e.target.value="";onPhotos(copy)}});
  let status=null;
  if(BK.busy)status=el("section",{class:"panel",role:"status"},
    el("div",{class:"rowline",style:"justify-content:flex-start;gap:10px"},el("div",{class:"spin"}),el("span",null,BK.prog&&BK.prog.n>1?"사진 "+BK.prog.i+"/"+BK.prog.n+" · ":"",el("span",{id:"bkStage"},BK.stage||"준비 중"))),
    el("span",{class:"small muted"},"사진 한 장에 1분쯤 걸려. 화면 끄거나 다른 앱으로 넘어가지 말고 조금만 기다려줘."),
    el("button",{class:"btn block",onclick:()=>BK.ctl&&BK.ctl.abort()},"그만하기"));
  else if(BK.last&&(BK.last.added.length||BK.last.skipped)){
    const set=new Set(BK.last.added);const rows=S.custom.filter(c=>set.has(c.w)&&(c.book||"내 책")===BK.last.book);
    status=el("section",{class:"panel"},
      el("div",{class:"rowline"},el("h2",null,BK.last.added.length?"새 단어 "+BK.last.added.length+"개 넣었어":"새로 넣을 단어가 없어"),el("button",{class:"reshuffle",onclick:()=>{BK.last=null;render()}},"닫기")),
      BK.last.skipped?el("span",{class:"small muted"},"이미 단어장에 있는 "+BK.last.skipped+"개는 건너뛰었어."):null,
      BK.numbered?el("span",{class:"small muted"},"이미 있던 단어 "+BK.numbered+"개에 책 번호를 붙였어."):null,
      BK.filled?el("span",{class:"small muted"},"빈 칸이 있던 단어 "+BK.filled+"개의 빈 칸을 채웠어."):null,
      rows.length?el("ul",{class:"booklist"},rows.slice(0,3).map(wordRow)):BK.last.added.length?el("span",{class:"small muted"},"단어장에 반영하는 중…"):null,
      rows.length>3?el("span",{class:"small muted"},"외 "+(rows.length-3)+"개는 아래 목록 첫 페이지에 있어."):null);
  }
  return el("main",{class:"wrap"},header(learner?"책 단어":"책 단어 추가하기"),fileIn,
    el("button",{class:"photo",disabled:BK.busy,onclick:()=>{if(!S.sample){BK.err=noSampleMsg();render();return}$("#photoIn").click()}},icon("camera"),el("span",null,el("b",null,"책 페이지 찍기"),el("span",null,"찍거나 앨범에서 여러 장 골라도 돼. 단어랑 책의 뜻을 읽고, 예문·파생어·유의어까지 채워서 바로 단어장에 넣어줄게"))),
    !S.sample&&S.mode!=="init"&&!BK.err?el("p",{class:"note"},noSampleMsg()):null,
    BK.err?el("p",{class:"note",style:"color:var(--bad);border-color:var(--bad)",role:"alert"},BK.err):null,
    status,
    el("div",{class:"field"},el("label",{for:"bkSearch"},"단어 찾기"),el("div",{class:"searchbox"},el("input",{id:"bkSearch",type:"search",placeholder:"영어 단어나 한국어 뜻으로 검색",value:BK.q,autocomplete:"off",autocapitalize:"off",spellcheck:"false",oninput:e=>{BK.q=e.target.value;const x=$("#bkClear");if(x)x.hidden=!BK.q;BK.pages.search=0;BK.open=null;refreshResults()},oncompositionstart:()=>{BK.composing=true},oncompositionend:e=>{BK.composing=false;BK.q=e.target.value;refreshResults();if(BK.deferred){BK.deferred=false;render()}}}),el("button",{type:"button",id:"bkClear",class:"sclear","aria-label":"검색어 지우기",hidden:!BK.q,onclick:()=>{BK.q="";BK.open=null;const s=$("#bkSearch");if(s){s.value="";s.focus()}$("#bkClear").hidden=true;refreshResults()}},icon("close")))),
    el("div",{id:"bkResults",style:"display:contents"},BK.q.trim()?(()=>{const hits=searchHits(BK.q);return el("section",{class:"panel","aria-label":"검색 결과"},
      el("div",{class:"bookhead"},el("h3",null,"검색 결과"),el("span",{class:"num small muted"},hits.length+"개")),
      hits.length?scrollList("search",hits):el("p",{class:"muted small",style:"margin:0"},"'"+BK.q.trim()+"'에 맞는 단어가 없어."))})():
    S.custom.length?(()=>{const flagged=S.custom.filter(c=>checkIssues(c).length);if(!flagged.length)BK.onlyChk=false;
      return el("section",{class:"panel"},
      el("div",{class:"bookhead"},el("h3",null,"내가 추가한 단어"),el("span",{class:"bh-right"},el("span",{class:"num small muted"},S.custom.length+"개",(()=>{const s=kstDayStart(ymd());const n=S.custom.filter(c=>(c.at||0)>=s).length;return n?el("b",{class:"newcount"}," · 오늘 +"+n):null})()," · 최근 추가 순"),trashBtn())),
      flagged.length?el("button",{class:"chkfilter"+(BK.onlyChk?" on":""),"aria-pressed":BK.onlyChk?"true":"false",onclick:()=>{BK.onlyChk=!BK.onlyChk;BK.open=null;SC.book=0;render()}},
        BK.onlyChk?"전체 보기":"확인 필요 "+flagged.length+"개만 보기"):null,
      scrollList("book",newestFirst(BK.onlyChk?flagged:S.custom),null,true),
      el("p",{class:"small muted",style:"margin:0"},"단어를 왼쪽으로 밀면 삭제 버튼이 나와."))})()
    :el("section",{class:"panel"},el("div",{class:"bookhead"},el("h2",null,"아직 책 단어가 없어"),trashBtn()),el("p",{class:"muted small",style:"margin:0"},"책 페이지를 찍으면 단어가 책 이름별로 여기에 모여. 추가한 단어는 매일 카드에 새 단어로 먼저 나와."))));
}

/* ============ boot */
function decideRole(){
  if(S.mode!=="remote"){S.role="learner";S.ctx="ina";return}
  const L=S.cfg.learnerId;
  if(L&&L===S.me)S.role=S.isOwner&&PREF.asSupport?"supporter":"learner";
  else if(L)S.role="supporter";
  else S.role=S.supportOnly?"supporter":"claim";
  if(S.role==="supporter"&&S.tab==="test")S.tab="home";
  if(S.role!=="supporter"){if(S.tab==="mine"||S.tab==="mytest")S.tab="home";S.ctx="ina"}else if(S.tab!=="mine"&&S.tab!=="mytest")S.ctx="ina";
}
function onErr(e){if(e&&e.code==="revoked")toast("이 페이지 접근 권한이 바뀌었어")}
function applyProg(C,snap){const X=S.ctxs[C];X.progExists=snap.exists;const d=snap.exists?snap.data():{};const w={...(d.w||{})};
  if(inflightCtx===C)for(const id in inflight)w[id]=inflight[id];if(pendingCtx===C)for(const id in pending)w[id]=pending[id];
  const st={...(d.st||{})};const t0=ymd();if((stDirty||stInflight)&&pendingCtx===C)st[t0]=X.prog.st[t0]||st[t0];X.prog={w,days:{...(d.days||{})},st}}
function applyLog(C,q){const X=S.ctxs[C];const t=ymd();const keep=logDirty&&pendingCtx===C?X.log[t]:null;const L={};for(const d of q.docs)L[d.id]=d.data();if(keep)L[t]=keep;X.log=L;if(S.ctx===C)render()}
function subscribe(){
  const db=S.db;
  db.doc("meta/config").onSnapshot(s=>{S.cfgExists=s.exists;S.cfg={...DEF_CFG,...(s.exists?s.data():{}),...cfgInflight,...cfgPending};S.got.cfg=true;decideRole();render()},onErr);
  db.doc("progress/main").onSnapshot(s=>{applyProg("ina",s);S.got.prog=true;render()},onErr);
  db.doc("data/users/"+S.me+"/prog").onSnapshot(s=>{applyProg("me",s);S.ctxs.me.got=true;if(S.ctx==="me")render()},onErr);
  db.collection("data/users/"+S.me+"/prog/log").onSnapshot(q=>applyLog("me",q),onErr);
  db.collection("log").onSnapshot(q=>applyLog("ina",q),onErr);
  db.collection("custom").onSnapshot(q=>{setCustomAll(q.docs.map(d=>({...d.data(),id:"c_"+d.id,docId:d.id})).filter(c=>typeof c.w==="string").sort((a,b)=>(a.at||0)-(b.at||0)));render()},onErr);
  db.collection("cheers").orderBy("at","desc").limit(500).onSnapshot(q=>{S.cheers=q.docs.map(d=>({...d.data(),id:d.id}));CB.atBottom=CB.atBottom;if(!S.ddayChecked&&S.got.cfg&&S.got.prog){S.ddayChecked=true;ddayCheck();monthSnapshot()}render()},onErr);
}
async function boot(){
  if(!(window.claude&&typeof window.claude.use==="function")){S.mode="local";loadLocal();
    // preview only: ?as=supporter shows the supporter screens (a learner is pretended to be linked)
    if(new URLSearchParams(location.search).get("as")==="supporter"){S.role="supporter";S.cfg.learnerId=S.cfg.learnerId||"local"}
    render();return}
  render();
  const [db,user,sample]=await Promise.all([claude.use("db"),claude.use("user"),claude.use("sample")]);
  S.sample=sample;
  if(sample){try{const lim=await sample.limits();S.canImg=!!(lim&&lim.images)}catch{S.canImg=false}}
  const id=user?await user.id():null;
  if(!db||!id){S.mode="local";loadLocal();render();return}
  S.mode="remote";S.db=db;S.user=user;S.me=id;S.isOwner=await user.isOwner();S.supportOnly=window.RT&&RT.myRole()==="supporter";
  subscribe();render();
}
boot();
