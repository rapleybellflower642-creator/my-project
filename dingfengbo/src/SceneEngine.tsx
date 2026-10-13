import React from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';
import {FontGate,TextCue,Frame,C,serif,sans,clamp,smooth} from './design';
import {Landscape,Bamboo,Ripples,DriftingLeaves,Flare,FallingDrop} from './visuals/Scenery';
import {Traveler} from './visuals/Traveler';
import {Atmosphere} from './visuals/Atmosphere';

export type SceneProps={mode:string;chapter:string;start:number;duration:number;poem:string[];meaning:string[];switchAt?:number};
export const SceneEngine:React.FC<SceneProps> = ({mode,chapter,start,duration,poem,meaning,switchAt=4.25}) => {
  const frame=useCurrentFrame();const {fps}=useVideoConfig();
  const t=frame/fps;const globalT=start+t;const p=clamp(t/duration);
  let art='rain-forest',rain=.65,warm=0,mist=.3,zoom=.025,actorScale=.45,actorX=1430+p*45,actorY=936,actor=true;
  let walking=true,cold=false,back=false,wind=1,pan=1;
  if(mode==='opening') {art=t<1.85?'leaf-macro':t<3.85?'water-macro':'rain-forest';actor=t>=3.85;actorScale=.42;rain=t<3.85?.3:.9;zoom=t<1.85?.015:t<3.85?.01:.16;}
  if(mode==='history'){actorScale=.31;actorX=1438+p*35;actorY=838;zoom=.05;rain=.5;}
  if(mode==='listen'){art=t<3.05?'leaf-macro':'rain-forest';actor=t>=3.05;rain=1.15;zoom=t<3.05?.1:.05;actorScale=.51;}
  if(mode==='walk'){art=t<3.7?'water-macro':'rain-forest';zoom=.035;actorScale=t<3.7?2.15:.52;actorY=t<3.7?954:952;actorX=t<3.7?1460+p*110:1440+p*42;rain=.78;}
  if(mode==='simple'){art=t<3.0?'water-macro':t<5.3?'rain-forest':'mountain-rain';actorScale=t<3?1.9:t<5.3?.74:.3;actorY=t<3?956:930;actorX=t<3?1480:1460;rain=.62;zoom=t<3?.1:.025;}
  if(mode==='fear'){art='mountain-rain';rain=1.22;wind=1.4;actorScale=.53-.14*smooth(t/5);actorX=1400+p*100;zoom=.16-.14*smooth(t/4);mist=.4;}
  if(mode==='cloak'){art=t<3.0?'rain-forest':'mountain-rain';rain=.95;actorScale=t<3?1.24:.42;actorY=t<3?1250:946;actorX=1455;zoom=t<3?.17:.025;mist=.36;}
  if(mode==='cold'){art='rain-forest';rain=.46;wind=1.6;cold=true;walking=false;actorScale=.73;actorX=1460;actorY=992;zoom=.12;mist=.24;}
  if(mode==='sun'){art='warm-mountain';rain=.17*(1-p);warm=smooth(t/3);actorScale=.44;actorX=1440;actorY=930;zoom=.06;mist=.25;}
  if(mode==='weather'){art=t<3.1?'rain-forest':t<6.2?'mountain-rain':'warm-mountain';rain=t<6.2?.35:.05;warm=t<6.2?.13:.8;actorScale=.34;actorY=911;actorX=1435;zoom=.035;}
  if(mode==='lookback'){art='mountain-rain';rain=.08;mist=.45;actorScale=.34;actorY=921;walking=false;back=true;pan=-1;zoom=.03;warm=.12;}
  if(mode==='home'){art='warm-mountain';rain=.035;warm=.48;mist=.48;actorScale=.32-p*.05;actorX=1440+p*65;actorY=919-p*34;zoom=.03;}
  if(mode==='freedom'){art='warm-mountain';rain=.03;warm=.76;mist=.28;actorScale=.45-.2*smooth(t/6);actorX=1470;actorY=951-p*92;zoom=.18*(1-smooth(t/6));}
  if(mode==='end'){art='warm-mountain';rain=.025;warm=.75;actorScale=.21;actorX=1515+p*20;actorY=843;zoom=.008;mist=.2;}
  const vertical=mode==='cloak'||mode==='lookback';
  const firstSize = vertical?80:mode==='fear'?224:mode==='home'?190:mode==='history'?68:mode==='opening'?98:mode==='cold'?87:94;
  const firstTop = vertical?208:mode==='fear'?312:mode==='home'?315:mode==='opening'?334:350;
  const secondStart=mode==='history'?4.6:switchAt+.2;
  return <AbsoluteFill style={{backgroundColor:C.ink,overflow:'hidden'}}>
    <FontGate/>
    <Landscape name={art} t={t} duration={duration} zoom={zoom} pan={pan} warm={warm}/>
    {mode==='sun' && <div style={{position:'absolute',inset:0,background:'linear-gradient(120deg,rgba(231,190,118,.19),transparent 65%)',opacity:smooth(t/2.5),mixBlendMode:'screen'}}/>}
    {actor && <Traveler t={globalT} x={actorX} y={actorY} scale={actorScale} walking={walking} cold={cold} back={back} facing={mode==='lookback'?-1:1} warm={warm}/ >}
    <Atmosphere t={globalT} rain={rain} warm={warm} mist={mist} wind={wind} scene={0}/>
    {(mode==='opening'||mode==='walk'||mode==='fear')&&<Ripples t={globalT} strong={art==='water-macro'}/>}
    {mode==='opening'&&t<1.85&&<FallingDrop t={t}/>}
    {mode!=='end' && <DriftingLeaves t={globalT} amount={mode==='cold'?6:mode==='fear'?7:3}/>}
    {['history','listen','walk','cold','home'].includes(mode)&&<Bamboo t={globalT} opacity={mode==='cold'?.65:.4} wind={wind}/>}
    {['fear','sun','freedom'].includes(mode)&&<Flare t={t} at={mode==='sun'?1.2:.38} strength={mode==='fear'?.28:.7}/>}
    {mode==='fear'&&<svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.13*smooth(t/.4)*(1-smooth((t-3)/2)),pointerEvents:'none'}}><circle cx="1420" cy="762" r={90+t*280} fill="none" stroke="#e5d6b6" strokeWidth={2}/></svg>}
    <Frame chapter={chapter} progress={globalT/120}/>
    {mode!=='end' && <>
      <TextCue t={t} start={mode==='opening'?.2:.48} end={switchAt} lines={poem} size={firstSize} top={firstTop} poem={!['history','opening','weather'].includes(mode)} accent={mode==='fear'||mode==='home'} vertical={vertical}/>
      {mode==='history'? <>
        <TextCue t={t} start={4.8} end={duration-.1} lines={['定风波']} size={176} top={329} accent/>
        <div style={{position:'absolute',left:157,top:617,fontFamily:serif,fontSize:35,letterSpacing:11,color:C.paper,opacity:smooth((t-5.35)/.5)*(1-smooth((t-duration+.45)/.4))}}>一场雨，一段人生。</div>
      </> : <TextCue t={t} start={secondStart} end={duration-.14} lines={meaning} poem={false} size={mode==='opening'?78:70} top={382}/>}
    </>}
    {mode==='end'&& <>
      <div style={{position:'absolute',left:152,top:269,fontFamily:serif,fontSize:174,letterSpacing:24,color:C.paper,textShadow:'0 4px 32px rgba(3,20,23,.6)',opacity:smooth(t/.5),translate:`0 ${24*(1-smooth(t/.6))}px`}}>定风波</div>
      <div style={{position:'absolute',left:167,top:550,fontFamily:serif,fontSize:57,letterSpacing:7,color:C.gold,opacity:smooth((t-.55)/.55)}}>风雨有时，脚步由你。</div>
      <div style={{position:'absolute',left:170,top:710,fontFamily:sans,fontSize:24,letterSpacing:3,color:C.paper,opacity:.62*smooth((t-1)/.6)}}>苏轼词作意象改编 · 配乐《算力小曲》</div>
      <div style={{position:'absolute',left:776,top:303,width:55,height:94,border:'2px solid #b8553b',fontFamily:serif,fontSize:28,lineHeight:1.38,textAlign:'center',paddingTop:8,color:'#cf8065',opacity:smooth((t-.35)/.5)}}>苏<br/>轼</div>
    </>}
  </AbsoluteFill>;
};
