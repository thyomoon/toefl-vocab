/* 토플 단어장 사진 읽기 중계 서버 (Cloudflare Worker).
   앱이 보낸 프롬프트와 책 사진을 Gemini에 넘기고 JSON 답을 돌려준다. API 키는 여기(비밀 변수)에만 둔다.
   로그인한 사람(Firebase ID 토큰)만 쓸 수 있다.
   변수: GEMINI_API_KEY (비밀) · FIREBASE_PROJECT_ID · ALLOWED_ORIGIN (예: https://thyomoon.github.io) · MODEL (선택) */
const JWKS_URL="https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
let jwks=null,jwksAt=0;

export default {
  async fetch(req,env){
    const origin=req.headers.get("origin")||"";
    const allowed=String(env.ALLOWED_ORIGIN||"").split(",").map(s=>s.trim()).filter(Boolean);
    const cors={"access-control-allow-origin":allowed.includes(origin)?origin:(allowed[0]||"*"),"access-control-allow-headers":"content-type, authorization","access-control-allow-methods":"POST, OPTIONS","vary":"origin"};
    const reply=(o,status=200)=>new Response(JSON.stringify(o),{status,headers:{...cors,"content-type":"application/json"}});
    const fail=(code,status,text)=>reply({error:{code,text}},status);
    if(req.method==="OPTIONS")return new Response(null,{headers:cors});
    if(req.method!=="POST")return fail("method_not_allowed",405);
    if(allowed.length&&!allowed.includes(origin))return fail("not_granted",403);
    const tok=(req.headers.get("authorization")||"").replace(/^Bearer /,"");
    if(!await verify(tok,env.FIREBASE_PROJECT_ID).catch(()=>false))return fail("session_expired",401);

    let body;try{body=await req.json()}catch{return fail("bad_request",400)}
    const parts=[{text:String(body.prompt||"").slice(0,40000)}];
    if(body.image&&body.image.data)parts.push({inline_data:{mime_type:body.image.mime||"image/jpeg",data:body.image.data}});
    const model=env.MODEL||"gemini-flash-latest";
    const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent",{method:"POST",
      headers:{"content-type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},
      body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:{responseMimeType:"application/json",temperature:0.2,maxOutputTokens:32768}})});
    if(r.status===429)return fail("rate_limited",429);
    if(!r.ok){const t=await r.text();return fail(r.status===400&&/image/i.test(t)?"image_rejected":"upstream_error",502,t.slice(0,500))}
    const d=await r.json();
    const c=d.candidates&&d.candidates[0];
    if(!c)return fail(d.promptFeedback&&d.promptFeedback.blockReason?"refused":"empty_completion",502);
    const text=((c.content&&c.content.parts)||[]).filter(p=>!p.thought).map(p=>p.text||"").join("");
    if(!text.trim())return fail(c.finishReason==="SAFETY"?"refused":"empty_completion",502);
    // a reply cut off by the length limit comes back as invalid_json with the text, and the app keeps the finished entries
    try{return reply({json:JSON.parse(text)})}catch{return fail("invalid_json",502,text)}
  }
};

/* Firebase ID token: RS256, signed by Google's securetoken keys, issued for this project and not expired */
async function verify(tok,project){
  const [h,p,s]=String(tok).split(".");if(!s||!project)return false;
  const head=JSON.parse(text(h)),pay=JSON.parse(text(p)),now=Date.now()/1000;
  if(head.alg!=="RS256"||pay.aud!==project||pay.iss!=="https://securetoken.google.com/"+project||!(pay.exp>now)||!(pay.iat<=now+300)||!pay.sub)return false;
  let jwk=(await keys(false)).find(k=>k.kid===head.kid);
  if(!jwk)jwk=(await keys(true)).find(k=>k.kid===head.kid);
  if(!jwk)return false;
  const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
  return crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,bytes(s),new TextEncoder().encode(h+"."+p));
}
async function keys(fresh){
  if(fresh||!jwks||Date.now()-jwksAt>3600e3){jwks=(await (await fetch(JWKS_URL)).json()).keys||[];jwksAt=Date.now()}
  return jwks;
}
function bytes(s){s=s.replace(/-/g,"+").replace(/_/g,"/");s+="===".slice((s.length+3)%4);return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
function text(s){return new TextDecoder().decode(bytes(s))}
