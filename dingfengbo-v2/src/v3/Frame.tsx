import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FontGate, PALETTE, SERIF, SANS, smooth} from '../v2/SceneShell';

export type Copy = {from: number; to: number; text: string};

/** Only narrative text is on screen. Production/music attribution lives in docs. */
export const Frame: React.FC<{
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  split?: boolean;
  warm?: number;
  copies?: Copy[];
  duration: number;
  unshaded?: boolean;
}> = ({children, title, eyebrow, split=false, warm=0, copies=[], duration, unshaded=false}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const t=frame/fps;
  const enter=smooth((t+.06)/.25);
  return <AbsoluteFill style={{background:PALETTE.black, color:PALETTE.ivory, fontFamily:SERIF, overflow:'hidden'}}>
    <FontGate/>
    <AbsoluteFill style={{background:warm>.5
      ? 'radial-gradient(ellipse at 70% 47%,#292719 0%,#0f1715 42%,#090d10 78%)'
      : 'radial-gradient(ellipse at 68% 49%,#162322 0%,#0c1315 44%,#090d10 80%)'}}/>
    {children}
    {!unshaded&&<AbsoluteFill style={{pointerEvents:'none', background:split
      ? 'linear-gradient(90deg,rgba(6,12,14,.92),rgba(6,12,14,.7) 31%,transparent 62%),linear-gradient(0deg,rgba(5,10,12,.9),transparent 22%)'
      : 'linear-gradient(180deg,rgba(5,10,12,.8),transparent 24%,transparent 73%,rgba(5,10,12,.93))'}}/>}
    {eyebrow&&<div style={{position:'absolute',left:112,top:split?237:61,fontFamily:SANS,fontSize:25,letterSpacing:6,color:PALETTE.jade,opacity:enter}}>{eyebrow}</div>}
    {title&&<div style={{position:'absolute',left:108,top:split?303:103,right:split?1000:92,fontSize:split?79:68,lineHeight:1.44,letterSpacing:split?3:5,whiteSpace:'pre-line',color:PALETTE.gold,opacity:enter,translate:`0 ${12*(1-enter)}px`,textShadow:'0 2px 18px #080d0e'}}>{title}</div>}
    {split&&<div style={{position:'absolute',left:114,top:617,height:2,width:interpolate(frame,[0,.65*fps],[0,92],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),background:PALETTE.gold,opacity:.65}}/>}
    {copies.map((copy,i)=>t>=copy.from&&t<copy.to?<div key={i} data-caption="true" style={{position:'absolute',left:120,right:120,bottom:92,textAlign:'center',fontSize:43,lineHeight:1.6,letterSpacing:2.2,whiteSpace:'pre-line',opacity:smooth((t-copy.from+.03)/.18)*smooth((copy.to-t)/.13),textShadow:'0 2px 12px #030809'}}>{copy.text}</div>:null)}
    <div style={{position:'absolute',left:112,bottom:53,height:1,width:90,background:PALETTE.gold,opacity:.25}}/>
    {t>duration-.12&&<AbsoluteFill style={{background:'#050a0c',opacity:smooth((t-duration+.12)/.12)*.35}}/>}
  </AbsoluteFill>;
};
