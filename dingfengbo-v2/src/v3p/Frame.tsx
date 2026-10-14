import React from 'react';
import {Backdrop,StaticBackdrop,Subtitle,clamp,smooth,out} from './Common';
import {SHOTS,TEXT_CUES} from './timeline';
import {Hook,TitleScene,History,Cultivate} from './scenes/HistoryAct';
import {Rain,Listen,Walk,Light} from './scenes/MiddleAct';
import {Who,Cold,Sun,Return,Ending} from './scenes/ResolveAct';
const SCENES={hook:Hook,title:TitleScene,history:History,cultivate:Cultivate,rain:Rain,listen:Listen,walk:Walk,light:Light,who:Who,cold:Cold,sun:Sun,return:Return,ending:Ending};
export const StaticBackdropSvg=()=> <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><StaticBackdrop/></svg>;
export const FrameSvg=({frame,fps=30,background=true}:{frame:number;fps?:number;background?:boolean})=>{
 const time=frame/fps,sourceFrame=Math.round(time*30);
 const shot=SHOTS.find(s=>sourceFrame>=s.frame&&sourceFrame<s.frame+s.durationFrames)??SHOTS[SHOTS.length-1];
 const local=(sourceFrame-shot.frame)/30,duration=shot.durationFrames/30;
 const Scene=SCENES[shot.chapter];
 const cue=TEXT_CUES.find(c=>time>=c.from&&time<c.to);
 const progress=clamp(local/duration),settle=out(local/.18),direction=shot.shot%2?-1:1;
 const dx=shot.transition==='whip'?(1-settle)*42*direction:0;
 const zoom=1+.012*progress;
 return <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" fontFamily="Noto Serif CJK SC">
  <defs><clipPath id="scene-safe"><rect x="48" y="30" width="1824" height="900"/></clipPath></defs>
  <Backdrop t={time} background={background}/>
  <g clipPath="url(#scene-safe)">
   <g transform={`translate(${dx} 0) translate(960 480) scale(${zoom}) translate(-960 -480)`}>
    <Scene shot={shot.shot} t={local} duration={duration} global={time}/>
   </g>
   {shot.transition==='whip'&&local<.2&&<path d={`M${-600+settle*2900} -100l100 0 -280 1120 -100 0Z`} fill="#f6d89b" opacity={.065*(1-settle)}/>}
  </g>
  {cue&&<Subtitle text={cue.text} t={time} start={cue.from} end={cue.to}/>}
  <rect width="1920" height="1080" fill="#06090c" opacity={smooth((time-119.6)/.4)}/>
 </svg>;
};
