import { state } from "./state.js";
import { toast, escapeAttr } from "./utils.js";

/* ---------- 追加機能：サウンド（外部音源なし・Web Audioで生成） ---------- */
export const AUDIO={ctx:null,boss:null};
export const BGM={playing:false,url:""};
export function soundEnabled(){
  return !!(state.settings&&state.settings.sound);
}
export function ensureAudio(){
  if(!soundEnabled())return null;
  if(typeof window==='undefined')return null;
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return null;
  if(!AUDIO.ctx)AUDIO.ctx=new AudioCtx();
  if(AUDIO.ctx.state==='suspended'){
    AUDIO.ctx.resume().catch(()=>{});
  }
  return AUDIO.ctx;
}
export function playTone(ctx,freq,start,duration,type,volume,dest){
  const osc=ctx.createOscillator();
  const gain=ctx.createGain();
  osc.type=type||'sine';
  osc.frequency.setValueAtTime(freq,start);
  gain.gain.setValueAtTime(0.0001,start);
  gain.gain.linearRampToValueAtTime(volume,start+0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);
  osc.connect(gain);
  gain.connect(dest||ctx.destination);
  osc.start(start);
  osc.stop(start+duration+0.04);
}
export function playAnswerSound(isCorrect){
  const ctx=ensureAudio();
  if(!ctx)return;
  const t=ctx.currentTime+0.01;
  if(isCorrect){
    [[523.25,0,.16],[659.25,.07,.16],[783.99,.14,.22]].forEach(n=>playTone(ctx,n[0],t+n[1],n[2],'triangle',.09));
  }else{
    playTone(ctx,220,t,.2,'sawtooth',.065);
    playTone(ctx,164.81,t+.09,.22,'square',.045);
  }
}
export function playBossResultSound(victory){
  const ctx=ensureAudio();
  if(!ctx)return;
  const t=ctx.currentTime+0.02;
  if(victory){
    [[392,0,.16],[523.25,.08,.16],[659.25,.16,.18],[783.99,.27,.32]].forEach(n=>playTone(ctx,n[0],t+n[1],n[2],'triangle',.08));
  }else{
    playTone(ctx,146.83,t,.34,'sawtooth',.075);
    playTone(ctx,98,t+.12,.44,'square',.055);
  }
}
export function startBossTension(){
  const ctx=ensureAudio();
  if(!ctx||AUDIO.boss)return;
  const t=ctx.currentTime;
  const oscA=ctx.createOscillator();
  const oscB=ctx.createOscillator();
  const lfo=ctx.createOscillator();
  const lfoGain=ctx.createGain();
  const filter=ctx.createBiquadFilter();
  const gain=ctx.createGain();

  oscA.type='sawtooth';
  oscA.frequency.setValueAtTime(73.42,t);
  oscB.type='triangle';
  oscB.frequency.setValueAtTime(110,t);
  lfo.type='sine';
  lfo.frequency.setValueAtTime(5.2,t);
  lfoGain.gain.setValueAtTime(180,t);
  filter.type='lowpass';
  filter.frequency.setValueAtTime(360,t);
  filter.Q.setValueAtTime(8,t);
  gain.gain.setValueAtTime(0.0001,t);
  gain.gain.linearRampToValueAtTime(.03,t+.8);

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  oscA.connect(filter);
  oscB.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  [oscA,oscB,lfo].forEach(node=>node.start(t));
  AUDIO.boss={oscA,oscB,lfo,gain};
}
export function stopBossTension(){
  const boss=AUDIO.boss;
  if(!boss)return;
  const ctx=AUDIO.ctx;
  const t=ctx?ctx.currentTime:0;
  try{
    boss.gain.gain.cancelScheduledValues(t);
    boss.gain.gain.setTargetAtTime(0.0001,t,.08);
    [boss.oscA,boss.oscB,boss.lfo].forEach(node=>node.stop(t+.35));
  }catch(e){}
  AUDIO.boss=null;
}
export function syncBossTension(active){
  if(active&&soundEnabled())startBossTension();
  else stopBossTension();
}
export function cleanYouTubeParam(v){
  const m=String(v||"").match(/[A-Za-z0-9_-]+/);
  return m?m[0]:"";
}
export function cleanYouTubeVideoId(v){
  const m=String(v||"").match(/[A-Za-z0-9_-]{11}/);
  return m?m[0]:"";
}
export function parseYouTubeBgmUrl(raw){
  const text=String(raw||"").trim();
  if(!text)return null;
  if(/^[A-Za-z0-9_-]{11}$/.test(text))return {kind:"video",id:text,list:""};
  try{
    const source=/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text :
      (/^(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com|music\.youtube\.com)\//i.test(text) ? "https://"+text : text);
    const url=new URL(source);
    const host=url.hostname.replace(/^www\./,"").toLowerCase();
    let id="", list=cleanYouTubeParam(url.searchParams.get("list"));
    if(host==="youtu.be"){
      id=cleanYouTubeVideoId(url.pathname.split("/").filter(Boolean)[0]);
    }else if(host==="youtube.com"||host.endsWith(".youtube.com")){
      const parts=url.pathname.split("/").filter(Boolean);
      id=cleanYouTubeVideoId(url.searchParams.get("v"));
      if(!id&&(parts[0]==="embed"||parts[0]==="shorts"||parts[0]==="live")){
        id=cleanYouTubeVideoId(parts[1]);
      }
      if(!id&&parts[0]==="playlist"&&list){
        return {kind:"playlist",id:"",list};
      }
    }
    if(id)return {kind:"video",id,list};
    if(list)return {kind:"playlist",id:"",list};
  }catch(e){}
  return null;
}
export function youtubeEmbedSrc(parsed){
  const origin = (typeof location!=="undefined" && /^https?:$/.test(location.protocol))
    ? "&origin="+encodeURIComponent(location.origin)
    : "";
  if(parsed.kind==="playlist"){
    return "https://www.youtube.com/embed/videoseries?list="+encodeURIComponent(parsed.list)+"&autoplay=1&loop=1&rel=0&playsinline=1"+origin;
  }
  let q="autoplay=1&loop=1&playlist="+encodeURIComponent(parsed.id)+"&rel=0&playsinline=1";
  if(parsed.list)q+="&list="+encodeURIComponent(parsed.list);
  q+=origin;
  return "https://www.youtube.com/embed/"+encodeURIComponent(parsed.id)+"?"+q;
}
export function bgmDock(){
  if(typeof document==="undefined")return null;
  let dock=document.getElementById("bgmDock");
  if(!dock){
    dock=document.createElement("div");
    dock.id="bgmDock";
    dock.className="bgmDock";
    document.body.appendChild(dock);
  }
  return dock;
}
export function startYouTubeBgm(raw){
  const parsed=parseYouTubeBgmUrl(raw);
  if(!parsed){toast("YouTube URLを確認してね");return false;}
  if(typeof location!=="undefined" && location.protocol==="file:"){
    toast("YouTube BGMはGitHub Pagesで再生してね");
  }
  const dock=bgmDock();
  if(!dock)return false;
  const src=youtubeEmbedSrc(parsed);
  BGM.playing=true;
  BGM.url=String(raw||"").trim();
  dock.className="bgmDock show";
  dock.innerHTML=`<div class="bgmDockHead">
      <span>🎵 BGM</span>
      <button type="button" id="bgmDockStop">停止</button>
    </div>
    <iframe src="${escapeAttr(src)}" title="YouTube BGM" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  const stop=document.getElementById("bgmDockStop");
  if(stop)stop.addEventListener("click",stopYouTubeBgm);
  return true;
}
export function stopYouTubeBgm(){
  const dock=bgmDock();
  if(dock){
    dock.className="bgmDock";
    dock.innerHTML="";
  }
  BGM.playing=false;
  BGM.url="";
}
