import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, cancelRender, staticFile, interpolate, Easing} from 'remotion';

export const C = {paper:'#e9e4d8',ink:'#173c40',fog:'#799693',gold:'#d7b576',red:'#b8553b'};
export const serif = 'DFBSerif, serif';
export const sans = 'DFBSans, sans-serif';
export const clamp = (x:number,a=0,b=1) => Math.max(a,Math.min(b,x));
export const smooth = (x:number) => {const q=clamp(x);return q*q*(3-2*q)};
let fontPromise:Promise<void>|null=null;
export const FontGate = () => {
  const [handle]=useState(()=>delayRender('Loading local Chinese fonts'));
  useEffect(()=>{
    if(!fontPromise) fontPromise=Promise.all([
      new FontFace('DFBSerif',`url("${staticFile('fonts/Serif.woff')}")`).load(),
      new FontFace('DFBSans',`url("${staticFile('fonts/Sans.woff')}")`).load(),
    ]).then(fonts=>{fonts.forEach(font=>document.fonts.add(font));});
    fontPromise.then(()=>continueRender(handle)).catch(cancelRender);
  },[handle]);
  return null;
};

export const TextCue:React.FC<{t:number;start:number;end:number;lines:string[];poem?:boolean;size?:number;center?:boolean;accent?:boolean;top?:number;vertical?:boolean}> = ({t,start,end,lines,poem=true,size=90,center=false,accent=false,top=352,vertical=false}) => {
  if(t<start || t>end) return null;
  const enter=smooth((t-start)/0.42);
  const exit=smooth((end-t)/0.32);
  return <div style={{position:'absolute',left:vertical?225:center?180:148,right:center?180:undefined,top,width:vertical?138:center?undefined:1100,height:vertical?750:undefined,writingMode:vertical?'vertical-rl':undefined,textAlign:center?'center':'left',color:accent?C.gold:C.paper,fontFamily:poem?serif:sans,fontSize:size,fontWeight:400,lineHeight:1.62,letterSpacing:poem?8:3,opacity:enter*exit,textShadow:'0 3px 22px rgba(0,18,20,.72)',translate:`0 ${20*(1-enter)}px`,filter:`blur(${3*(1-enter)}px)`}}>
    {lines.map((line,i)=><div key={i} style={{opacity:smooth((t-start-i*.13)/.36),clipPath:`inset(0 ${100*(1-smooth((t-start-i*.13)/.56))}% 0 0)`}}>{line}</div>)}
  </div>;
};

export const Frame:React.FC<{chapter:string;progress:number}> = ({chapter,progress}) => <>
  <div style={{position:'absolute',inset:0,pointerEvents:'none',boxShadow:'inset 0 0 180px 30px rgba(1,15,17,.45)'}} />
  <div style={{position:'absolute',left:0,right:0,top:0,height:54,background:'#071315'}} />
  <div style={{position:'absolute',left:0,right:0,bottom:0,height:54,background:'#071315'}} />
  <div style={{position:'absolute',left:148,top:113,fontFamily:sans,fontSize:25,letterSpacing:9,color:'#f2ead7',opacity:.76}}>{chapter}</div>
  <div style={{position:'absolute',right:132,top:111,fontFamily:serif,fontSize:24,letterSpacing:5,color:'#ede5d0',opacity:.68}}>苏轼 · 定风波</div>
  <div style={{position:'absolute',left:148,right:148,bottom:82,height:1,background:'rgba(236,225,198,.16)'}}><div style={{height:1,width:`${clamp(progress)*100}%`,background:'rgba(220,191,132,.8)'}} /></div>
</>;
