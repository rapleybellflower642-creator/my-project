import React from 'react';
import {CanvasImage, staticFile} from 'remotion';
import {clamp, smooth} from '../design';

export const Landscape:React.FC<{name:string;t:number;duration:number;zoom?:number;pan?:number;warm?:number;mirror?:boolean}> = ({name,t,duration,zoom=0,pan=1,warm=0,mirror=false}) => {
  const p=clamp(t/duration);
  return <>
    <CanvasImage src={staticFile(`art/${name}.png`)} style={{position:'absolute',width:1920,height:1080,objectFit:'cover',scale:`${mirror?-1:1}`,transform:`scale(${1.055+zoom+.05*p}) translate(${pan*(p-.5)*40}px,${-p*10}px)`,filter:`saturate(${.82+warm*.17}) brightness(${.77+warm*.12})`}} />
    <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(3,23,26,.72) 0%,rgba(4,26,29,.34) 39%,rgba(4,24,28,.03) 70%)'}} />
    <div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,rgba(2,19,23,.48),transparent 35%,transparent 70%,rgba(3,19,23,.18))'}} />
  </>;
};

export const Bamboo:React.FC<{t:number;side?:'left'|'right';opacity?:number;wind?:number}> = ({t,side='right',opacity=.65,wind=1}) => {
  const flip=side==='left'?-1:1;
  return <svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity,pointerEvents:'none'}}>
    <g transform={`translate(${side==='left'?0:1920},0) scale(${flip},1) rotate(${Math.sin(t*.7)*1.8*wind})`} fill="#09292c" stroke="#183832">
      <path d="M0 -35 Q-86 145 -482 289" fill="none" strokeWidth="13" />
      {[0,1,2,3,4,5,6,7].map((n)=><g key={n} transform={`translate(${-45-n*49},${52+n*28}) rotate(${-10+n*4+Math.sin(t*1.2+n)*4*wind})`}>
        <path d="M0 0 Q-33 31 -31 120 Q-3 71 0 0Z" />
        <path d="M-5 8 Q-48 -13 -99 14 Q-39 32 -5 8Z" />
        <path d="M4 -4 Q26 34 4 89 Q-9 37 4 -4Z" />
      </g>)}
    </g>
  </svg>;
};

export const Ripples:React.FC<{t:number;strong?:boolean}> = ({t,strong=false}) => <svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
  {Array.from({length:strong?18:8},(_,i)=>{
    const period=1.7+(i%5)*.21;
    const age=((t+i*.37)%period)/period;
    const x=140+((i*379)%1610),y=770+((i*89)%230);
    return <g key={i} opacity={(1-age)*.33}>
      <ellipse cx={x} cy={y} rx={8+age*(strong?210:92)} ry={2+age*(strong?29:15)} fill="none" stroke="#c5ddd6" strokeWidth={1.1*(1-age)+.4}/>
      <ellipse cx={x} cy={y+1} rx={age*(strong?164:70)} ry={age*(strong?21:10)} fill="none" stroke="#7eaba7" strokeWidth=".7" />
    </g>;
  })}
</svg>;

export const DriftingLeaves:React.FC<{t:number;amount?:number}> = ({t,amount=4}) => <svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
  {Array.from({length:amount},(_,i)=>{
    const phase=(t*.11+i*.231)%1;
    return <g key={i} transform={`translate(${2050-phase*2350},${180+i*160+Math.sin(phase*9+i)*75}) rotate(${phase*480+i*50}) scale(${.45+(i%3)*.35})`} opacity={.32+(i%3)*.13}><path d="M-27 0 Q0 -16 32 0 Q0 10 -27 0Z" fill={i%2?'#aca26e':'#537164'}/><path d="M-21 0 L27 0" stroke="#718576" strokeWidth=".7" /></g>;
  })}
</svg>;

export const Flare:React.FC<{t:number;at:number;strength?:number}> = ({t,at,strength=1}) => {
  const p=clamp(1-Math.abs(t-at)/.65);
  if(p===0) return null;
  return <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 79% 22%,rgba(255,219,154,.55),rgba(218,186,119,.08) 40%,transparent 65%)',opacity:p*strength,mixBlendMode:'screen'}} />;
};

export const FallingDrop:React.FC<{t:number}> = ({t}) => {
  const q=clamp((t-1.15)/.56);
  return <svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}><defs><radialGradient id="drop"><stop stopColor="#eefffd" stopOpacity=".7"/><stop offset=".52" stopColor="#72a4a4" stopOpacity=".18"/><stop offset="1" stopColor="#e7fffd" stopOpacity=".9"/></radialGradient></defs>{t<1.8&&<ellipse cx={1149+q*13} cy={522+q*q*530} rx={6+q*3} ry={10+q*20} fill="url(#drop)" opacity={t>1.1?1:0}/>}</svg>;
};
