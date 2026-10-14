import React from 'react';
import {Backdrop,Subtitle,smooth} from './Common';
import {CHAPTERS,TEXT_CUES} from './timeline';
import {Hook,TitleScene} from './scenes/Opening';
import {History} from './scenes/History';
import {Cultivate} from './scenes/Cultivate';
import {Rain} from './scenes/Rain';
import {Listen} from './scenes/Listen';
import {Walk} from './scenes/Walk';
import {Light} from './scenes/Light';
import {Who} from './scenes/Who';
import {Cold} from './scenes/Cold';
import {Sun} from './scenes/Sun';
import {Return} from './scenes/Return';
import {Ending} from './scenes/Ending';
const SCENES={hook:Hook,title:TitleScene,history:History,cultivate:Cultivate,rain:Rain,listen:Listen,walk:Walk,light:Light,who:Who,cold:Cold,sun:Sun,return:Return,ending:Ending};
export const FrameSvg=({frame,fps=30}:{frame:number;fps?:number})=>{
 const t=frame/fps, chapter=CHAPTERS.find(c=>t>=c.from&&t<c.to)??CHAPTERS[CHAPTERS.length-1];
 const Scene=SCENES[chapter.id], local=t-chapter.from;
 const cue=TEXT_CUES.find(c=>t>=c.from&&t<c.to);
 const entrance=chapter.from===0?1:smooth(local/.16), exit=chapter.to===120?1:smooth((chapter.to-t)/.16);
 return <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" fontFamily="Noto Serif CJK SC">
  <Backdrop t={t}/>
  <g opacity={entrance*exit}><Scene t={local}/></g>
  {cue&&<Subtitle text={cue.text} t={t} start={cue.from} end={cue.to}/>}
  <rect width="1920" height="1080" fill="#05080b" opacity={smooth((t-118.6)/1.4)}/>
 </svg>;
};
