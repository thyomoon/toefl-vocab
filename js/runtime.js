/* Stands in for the claude.ai artifact runtime the app was written against:
   window.claude.use("db" | "user" | "sample" | "downloads").
   db = Firestore scoped to spaces/{sid}/, user = Firebase Auth, sample = Gemini through the Worker.
   Before the app gets any of them, the gate signs the person in and picks a word book (space).
   With no Firebase config this file does nothing and the app runs in local preview mode. */
(function(){
const C=window.CONFIG||{};
if(!(C.firebase&&C.firebase.apiKey&&C.firebase.projectId))return;

firebase.initializeApp(C.firebase);
const auth=firebase.auth(),fs=firebase.firestore();
fs.settings({ignoreUndefinedProperties:true});
fs.enablePersistence({synchronizeTabs:true}).catch(()=>{});

const RT=window.RT={uid:null,sid:null,space:null,spaces:[]};
let resolveReady;const ready=new Promise(r=>{resolveReady=r});
const LS_SPACE="tv-space";

/* ============ small DOM helper (the app's el() is defined later, so the gate has its own) */
function h(tag,props,...kids){const e=document.createElement(tag);if(props)for(const k in props){const v=props[k];if(v==null||v===false)continue;if(k==="class")e.className=v;else if(k.startsWith("on"))e.addEventListener(k.slice(2),v);else if(k==="svg")e.innerHTML=v;else if(k==="value")e.value=v;else e.setAttribute(k,v===true?"":v)}for(const c of kids.flat(9)){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(String(c)))}return e}
function gate(...kids){
  let g=document.getElementById("gate");
  if(!g){g=h("div",{id:"gate",class:"gate"});document.body.append(g)}
  const art=typeof CAT_SVG==="string"?h("div",{class:"catart small",svg:CAT_SVG}):null;
  g.replaceChildren(h("main",{class:"wrap onb"},h("div",{class:"center"},art,...kids)));
}
function closeGate(){const g=document.getElementById("gate");if(g)g.remove()}
function rand(){const a=new Uint8Array(16);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,"0")).join("")}

/* ============ sign in: Google ID token (implicit redirect) → Firebase credential.
   No popup and no firebaseapp.com redirect, so it also works from the iPhone home screen. */
const REDIRECT=location.origin+location.pathname;
let redirecting=location.hash.includes("id_token=");
function signIn(){
  const nonce=rand(),state=rand();
  try{localStorage.setItem("tv-oauth",JSON.stringify({state,search:location.search}))}catch{}
  location.href="https://accounts.google.com/o/oauth2/v2/auth?"+new URLSearchParams({client_id:C.googleClientId,redirect_uri:REDIRECT,response_type:"id_token",scope:"openid email profile",nonce,state,prompt:"select_account"});
}
async function finishRedirect(){
  if(!location.hash.includes("id_token="))return;
  const p=new URLSearchParams(location.hash.slice(1));let saved={};
  try{saved=JSON.parse(localStorage.getItem("tv-oauth")||"{}");localStorage.removeItem("tv-oauth")}catch{}
  history.replaceState(null,"",REDIRECT+(saved.search||""));
  if(!saved.state||p.get("state")!==saved.state){redirecting=false;if(!auth.currentUser)showLogin("로그인하지 못했어. 다시 해줘.");return}
  await auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(p.get("id_token")));
}
function showLogin(msg){
  gate(h("h1",{class:"hero"},"토플 단어장"),
    h("p",{class:"muted",style:"margin:0"},"구글 계정으로 들어가면 어느 기기에서 열어도 같은 기록이 이어져."),
    msg?h("p",{class:"note",role:"alert"},msg):null,
    h("button",{class:"btn primary block",style:"padding:16px;font-size:17px",onclick:signIn},"구글로 로그인"));
}

/* ============ spaces: one word book = one learner + the people cheering them on */
async function loadSpaces(){
  const q=await fs.collection("spaces").where("memberUids","array-contains",RT.uid).get();
  RT.spaces=q.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
}
async function joinSpace(sid,as,name){
  const ref=fs.doc("spaces/"+sid);let s;
  try{s=await ref.get()}catch{s=null}
  if(!s||!s.exists)return "초대 링크가 맞지 않아. 링크를 다시 받아줘.";
  if((s.data().memberUids||[]).includes(RT.uid))return null;
  await ref.update({memberUids:firebase.firestore.FieldValue.arrayUnion(RT.uid),["members."+RT.uid]:{name,role:as}});
  return null;
}
function showCreate(name,canCancel){
  let mode="learner";
  const nameIn=h("input",{id:"gName",value:name,maxlength:"20",autocomplete:"off"});
  const learnerIn=h("input",{id:"gLearner",maxlength:"20",autocomplete:"off",placeholder:"예: 이나"});
  const learnerField=h("div",{class:"field",hidden:true},h("label",{for:"gLearner"},"공부하는 사람 이름"),learnerIn);
  const seg=h("div",{class:"seg",role:"group"});
  const drawSeg=()=>seg.replaceChildren(...[["learner","내가 공부해요"],["supporter","다른 사람을 응원해요"]].map(([v,l])=>h("button",{type:"button",class:mode===v?"on":"",onclick:()=>{mode=v;learnerField.hidden=v!=="supporter";drawSeg()}},l)));
  drawSeg();
  const err=h("p",{class:"note",role:"alert",hidden:true});
  const go=h("button",{class:"btn primary block",style:"padding:16px;font-size:17px",onclick:async()=>{
    const me=nameIn.value.trim(),learner=mode==="learner"?me:learnerIn.value.trim();
    if(!me||!learner){err.textContent="이름을 적어줘.";err.hidden=false;return}
    go.disabled=true;
    try{const ref=fs.collection("spaces").doc();
      await ref.set({ownerUid:RT.uid,memberUids:[RT.uid],members:{[RT.uid]:{name:me,role:mode}},learnerName:learner,ownerName:me,createdAt:Date.now()});
      history.replaceState(null,"",REDIRECT);await start(ref.id)}
    catch(e){go.disabled=false;err.textContent="만들지 못했어. 잠시 뒤 다시 해줘.";err.hidden=false}}},"단어장 만들기");
  gate(h("h1",{class:"hero"},"새 단어장 만들기"),
    h("div",{class:"field"},h("label",{for:"gName"},"내 이름"),nameIn),
    h("div",{class:"field"},h("label",null,"누가 공부하나요?"),seg),
    learnerField,err,go,
    canCancel?h("button",{class:"btn block",onclick:()=>{history.replaceState(null,"",REDIRECT);location.reload()}},"취소"):null);
}
async function start(sid){
  RT.sid=sid;
  const ref=fs.doc("spaces/"+sid);
  RT.space=(await ref.get()).data();
  ref.onSnapshot(s=>{if(s.exists){RT.space=s.data();setTitle()}},()=>{});
  try{localStorage.setItem(LS_SPACE,sid)}catch{}
  setTitle();closeGate();resolveReady();
}
function setTitle(){document.title=RT.learnerName()+"의 토플 단어장"}

auth.onAuthStateChanged(async u=>{
  if(!u){if(!redirecting)showLogin();return}
  if(RT.uid)return;
  RT.uid=u.uid;
  const myName=(u.displayName||(u.email||"").split("@")[0]||"").slice(0,20);
  const q=new URLSearchParams(location.search);
  try{
    const join=q.get("join");
    if(join){
      const msg=await joinSpace(join,q.get("as")==="supporter"?"supporter":"learner",myName);
      history.replaceState(null,"",REDIRECT);
      if(msg){gate(h("p",{class:"note",role:"alert"},msg),h("button",{class:"btn block",onclick:()=>location.reload()},"내 단어장으로"));return}
      await loadSpaces();await start(join);return;
    }
    await loadSpaces();
    if(q.get("new")||!RT.spaces.length){showCreate(myName,RT.spaces.length>0);return}
    let last=null;try{last=localStorage.getItem(LS_SPACE)}catch{}
    await start((RT.spaces.find(s=>s.id===last)||RT.spaces[0]).id);
  }catch(e){showLogin("단어장을 열지 못했어. 다시 로그인해줘. ("+(e&&e.code||e)+")");RT.uid=null}
});
finishRedirect().catch(e=>{redirecting=false;showLogin("로그인하지 못했어. 다시 해줘. ("+(e&&e.code||e)+")")});

/* ============ what the app reads from here */
RT.learnerName=()=>(RT.space&&RT.space.learnerName)||"학습자";
RT.ownerName=()=>(RT.space&&RT.space.ownerName)||"응원하는 사람";
RT.nameOf=uid=>{const m=RT.space&&RT.space.members&&RT.space.members[uid];return m&&m.name||null};
RT.myRole=()=>{const m=RT.space&&RT.space.members&&RT.space.members[RT.uid];return m&&m.role||"learner"};
RT.invite=as=>REDIRECT+"?"+new URLSearchParams({join:RT.sid,as});
RT.switchTo=sid=>{try{localStorage.setItem(LS_SPACE,sid)}catch{}location.href=REDIRECT};
RT.newSpace=()=>{location.href=REDIRECT+"?new=1"};
RT.signOut=async()=>{await auth.signOut();try{localStorage.removeItem(LS_SPACE)}catch{}location.href=REDIRECT};
RT.renameLearner=name=>fs.doc("spaces/"+RT.sid).update({learnerName:name});
RT.renameMe=name=>fs.doc("spaces/"+RT.sid).update({["members."+RT.uid+".name"]:name,...(RT.space.ownerUid===RT.uid?{ownerName:name}:{}),...(RT.myRole()==="learner"&&RT.space.ownerUid===RT.uid?{learnerName:name}:{})});

/* ============ db: the artifact store's API on Firestore, every path under spaces/{sid}/ */
const CODES={"permission-denied":"not_granted","resource-exhausted":"quota_exceeded","invalid-argument":"invalid_argument","unauthenticated":"session_expired"};
function mapErr(e){const o=new Error(e&&e.message||String(e));o.code=CODES[e&&e.code]||(e&&e.code)||"unknown";return o}
const guard=p=>p.catch(e=>{throw mapErr(e)});
const isPlain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
/* the artifact store merges one level deep on update ({w:{id:rec}} adds rec to w); Firestore replaces whole fields, so spell out field paths */
function mergeUpdate(ref,v){
  const FP=firebase.firestore.FieldPath,args=[];
  for(const k in v){const x=v[k];if(isPlain(x)){for(const s in x)args.push(new FP(k,s),x[s])}else args.push(new FP(k),x)}
  return args.length?ref.update(...args):Promise.resolve();
}
function scoped(sid){
  const P=p=>"spaces/"+sid+"/"+p;
  const listen=(r,f,e)=>r.onSnapshot(f,x=>e&&e(mapErr(x)));
  const query=q=>({get:()=>guard(q.get()),onSnapshot:(f,e)=>listen(q,f,e),orderBy:(...a)=>query(q.orderBy(...a)),limit:n=>query(q.limit(n))});
  return {
    doc:p=>{const r=fs.doc(P(p));return {get:()=>guard(r.get()),set:v=>guard(r.set(v)),update:v=>guard(mergeUpdate(r,v)),delete:()=>guard(r.delete()),onSnapshot:(f,e)=>listen(r,f,e)}},
    collection:p=>{const c=fs.collection(P(p));return {...query(c),add:v=>guard(c.add(v))}}
  };
}

/* ============ sample: page photos and prompts go to Gemini through the Worker (the API key lives there) */
async function toJpeg(file){
  let src;
  try{src=await createImageBitmap(file,{imageOrientation:"from-image"})}
  catch{src=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(Object.assign(new Error("image"),{code:"image_rejected"}));im.src=URL.createObjectURL(file)})}
  const sc=Math.min(1,2400/Math.max(src.width,src.height));
  const c=document.createElement("canvas");c.width=Math.round(src.width*sc);c.height=Math.round(src.height*sc);
  c.getContext("2d").drawImage(src,0,0,c.width,c.height);
  const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",0.88));
  const data=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result).split(",")[1]);fr.readAsDataURL(blob)});
  return {mime:"image/jpeg",data};
}
function codeErr(code,text){return Object.assign(new Error(code),{code,text})}
const sample=C.workerUrl?{
  limits:async()=>({images:true}),
  json:async(prompt,opts={})=>{
    const body={prompt};
    if(opts.images)body.image=await toJpeg(Array.isArray(opts.images)?opts.images[0]:opts.images);
    const tok=await auth.currentUser.getIdToken();
    let r;
    try{r=await fetch(C.workerUrl,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+tok},body:JSON.stringify(body),signal:opts.signal})}
    catch(e){throw codeErr(e&&e.name==="AbortError"?"cancelled":"upstream_error","서버에 닿지 못함")}
    const d=await r.json().catch(()=>({}));
    if(!r.ok||d.error)throw codeErr(d.error&&d.error.code||"upstream_error",d.error&&d.error.text||"HTTP "+r.status);
    return d.json;
  }
}:null;

const user={id:async()=>RT.uid,isOwner:async()=>!!RT.space&&RT.space.ownerUid===RT.uid};
window.claude={use:async name=>{await ready;return name==="db"?scoped(RT.sid):name==="user"?user:name==="sample"?sample:null}};
})();
