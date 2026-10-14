import React from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';

export type ShotData={id:string;index:number;scene:string;duration:number;motion:string;weather:string;alternate?:boolean;};
export const Shot=({shot}:{shot:ShotData})=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 const t=frame/fps,p=Math.min(1,frame/Math.max(1,shot.duration-1));
 const direction=shot.index%2===0?1:-1;
 const shift=(12-24*p)*direction;
 const sx=shot.motion==='walk'?-40+80*p:0;
 const sy=shot.motion==='walk'?3*Math.sin(t*4):2*Math.sin(t*1.3);
 const weather=shot.weather==='light-rain'?'rain':shot.weather;
 const speed=weather==='rain'?750:35;
 const source=(layer:string)=>staticFile(`v4/art/${shot.scene}-${layer}.png`);
 return <AbsoluteFill style={{background:'#1b3737',overflow:'hidden'}}>
  <Img src={source('background')} style={{position:'absolute',width:1920,height:1080,transform:`translateX(${shift}px) scale(1.035)`}}/>
  <Img src={source('subject')} style={{position:'absolute',width:1920,height:1080,transform:`translate(${sx}px,${sy}px)`,opacity:shot.alternate&&Math.floor(t*2.4)%2===1?0:1}}/>
  {shot.alternate&&<Img src={source('subject-alt')} style={{position:'absolute',width:1920,height:1080,transform:`translate(${sx}px,${sy}px)`,opacity:Math.floor(t*2.4)%2}}/>}
  <Img src={source('foreground')} style={{position:'absolute',width:1920,height:1080,transform:`translateX(${(6-12*p)*direction}px)`}}/>
  {weather!=='none'&&<Img src={staticFile(`v4/fx/${weather}.png`)} style={{position:'absolute',width:1920,height:2160,left:0,top:-1080+(t*speed)%1080,opacity:shot.weather==='light-rain'?.45:1}}/>}
  <Img src={staticFile(`v4/text/${shot.id}.png`)} style={{position:'absolute',width:1920,height:1080,opacity:Math.min(1,t/.18)}}/>
 </AbsoluteFill>;
};

export const CoverV4=()=> <AbsoluteFill style={{background:'#18342f'}}>
 <Img src={staticFile('v4/art/sunset-background.png')} style={{position:'absolute',width:1920,height:1080}}/>
 <Img src={staticFile('v4/art/sunset-subject.png')} style={{position:'absolute',width:1920,height:1080}}/>
 <Img src={staticFile('v4/text/cover.png')} style={{position:'absolute',width:1920,height:1080}}/>
</AbsoluteFill>;
