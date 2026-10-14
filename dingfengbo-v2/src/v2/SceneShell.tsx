import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {AbsoluteFill,cancelRender,continueRender,delayRender,interpolate,staticFile,useCurrentFrame} from 'remotion';

export const PALETTE={black:'#090d10',gold:'#d6bb81',ivory:'#f2e8d2',jade:'#6ea99e',red:'#b95342',amber:'#d59a51'};
export const SERIF='DFBSerif,serif';
export const SANS='DFBSans,sans-serif';
export const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const smooth=(n:number)=>{const t=clamp(n);return t*t*(3-2*t)};
let fontPromise:Promise<void>|null=null;
export const FontGate=()=>{
 const [handle]=useState(()=>delayRender('Local Chinese fonts'));
 useEffect(()=>{if(!fontPromise)fontPromise=Promise.all([
  new FontFace('DFBSerif',`url("${staticFile('fonts/Serif.woff')}")`).load(),
  new FontFace('DFBSans',`url("${staticFile('fonts/Sans.woff')}")`).load(),
 ]).then(fonts=>{fonts.forEach(f=>document.fonts.add(f));});fontPromise.then(()=>continueRender(handle)).catch(cancelRender);},[handle]);
 return null;
};

export const Backdrop:React.FC<{frame:number;index?:number;warm?:number}>=({frame,index=0,warm=0})=>{
 const canvas=useRef<HTMLCanvasElement>(null);
 useLayoutEffect(()=>{
  const c=canvas.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;
  ctx.clearRect(0,0,1920,1080);
  for(let i=0;i<105;i++){
   const x=((i*197.731+frame*(.1+(i%7)*.03))%2070)-75;
   const y=((i*137.157-frame*(.045+(i%5)*.015))%1180+1180)%1180-50;
   const z=(i%9)/9;const a=.045+z*.11;
   ctx.beginPath();ctx.fillStyle=`rgba(222,197,143,${a})`;ctx.arc(x,y,.6+z*1.4,0,Math.PI*2);ctx.fill();
   if(i%17===0){ctx.strokeStyle=`rgba(229,207,157,${a*.4})`;ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();}
  }
 },[frame]);
 const x=48+Math.sin(frame/420+index*.7)*14;
 return <AbsoluteFill style={{background:PALETTE.black,overflow:'hidden'}}>
  <AbsoluteFill style={{background:`radial-gradient(ellipse at ${x}% 47%,rgba(${warm>.5?'130,91,40':'65,89,84'},${.14+warm*.1}),transparent 52%),radial-gradient(ellipse at 52% 88%,rgba(95,66,31,.16),transparent 47%),linear-gradient(155deg,#101416 0%,#090d10 48%,#0e1010 100%)`}}/>
  <AbsoluteFill style={{backgroundImage:`url(${staticFile('textures/grain.png')})`,opacity:.24,mixBlendMode:'soft-light'}}/>
  <div style={{position:'absolute',left:200,right:200,top:822,height:1,background:'linear-gradient(90deg,transparent,rgba(199,169,105,.12),transparent)'}}/>
  <canvas ref={canvas} width={1920} height={1080} style={{position:'absolute',inset:0}}/>
  <AbsoluteFill style={{boxShadow:'inset 0 0 160px 25px rgba(0,0,0,.38)'}}/>
 </AbsoluteFill>;
};

export type CaptionCard={from:number;to:number;lines:string[]};
type Props={index:number;start:number;duration:number;chapter:string;poem:string;cards:CaptionCard[];warm?:number;ending?:boolean;children:React.ReactNode};
export const SceneShell:React.FC<Props>=({index,start,duration,chapter,poem,cards,warm=0,ending=false,children})=>{
 const frame=useCurrentFrame();
 const globalFrame=start+frame;
 const headerIn=index===5?1:smooth((frame-3)/13);
 const exit= index===13?1:smooth((duration-frame)/7);
 const who=index===5?smooth((frame-42)/24):1;
 return <AbsoluteFill style={{overflow:'hidden',fontFamily:SERIF,color:PALETTE.ivory}}>
  <FontGate/><Backdrop frame={globalFrame} index={index} warm={warm}/>
  <div style={{position:'absolute',inset:0,opacity:exit}}>{children}</div>
  {!ending&&<>
   <div style={{position:'absolute',left:122,top:42,right:120,display:'flex',alignItems:'center',justifyContent:'space-between',fontFamily:SANS,fontSize:22,letterSpacing:4,color:'#a89f8c',opacity:.86}}>
    <span><span style={{color:PALETTE.gold,marginRight:18,fontFamily:SERIF,fontSize:27}}>{String(index+1).padStart(2,'0')}</span>{chapter}</span><span>{index===0||index===9?'定风波 · 现代释意':'苏轼 · 定风波'}</span>
   </div>
   <div style={{position:'absolute',top:83+(1-who)*270,left:120+(1-who)*570,fontSize:index===1?100:72+(1-who)*105,lineHeight:1.4,letterSpacing:index===5?10:5,color:PALETTE.gold,opacity:headerIn*exit,translate:`0 ${10*(1-headerIn)}px`,textShadow:'0 2px 18px rgba(178,132,51,.18)',whiteSpace:'pre-line'}}>{poem}</div>
   <div style={{position:'absolute',left:124,top:190,height:1,width:110*headerIn,background:PALETTE.gold,opacity:.32}}/>
  </>}
  {cards.map((card,i)=>{
   if(frame<card.from||frame>=card.to)return null;
   const a=smooth((frame-card.from)/9)*smooth((card.to-frame)/7);
   return <div key={i} style={{position:'absolute',left:150,right:150,bottom:91,textAlign:'center',fontFamily:SERIF,fontSize:46,lineHeight:1.52,letterSpacing:2.4,color:PALETTE.ivory,opacity:a,translate:`0 ${9*(1-a)}px`,textShadow:'0 2px 12px #050809'}}>{card.lines.map((line,j)=><div key={j}>{line}</div>)}</div>;
  })}
  {!ending&&<div style={{position:'absolute',left:122,right:122,bottom:49,height:1,background:'rgba(200,181,139,.13)'}}><div style={{width:`${globalFrame/3600*100}%`,height:1,background:PALETTE.gold,opacity:.62}}/></div>}
  {index>0&&frame<13&&<div style={{position:'absolute',top:-250,bottom:-250,left:-160+frame*175,width:70,background:'linear-gradient(90deg,transparent,rgba(220,191,127,.25),transparent)',rotate:'-24deg',opacity:(1-frame/13)*.6,filter:'blur(16px)'}}/>}
 </AbsoluteFill>;
};
