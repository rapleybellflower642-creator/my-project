import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Hero3D} from './Hero3D';
import {Backdrop,FontGate,PALETTE,SERIF,SANS} from './SceneShell';
export const Cover=()=> <AbsoluteFill style={{background:PALETTE.black}}>
 <FontGate/><Backdrop frame={900} warm={.5}/>
 <svg width={1920} height={1080} style={{position:'absolute',inset:0}}>
  <defs><linearGradient id="cover-path"><stop stopColor="#d6bb81" stopOpacity="0"/><stop offset=".4" stopColor="#d6bb81"/><stop offset="1" stopColor="#6ea99e"/></linearGradient></defs>
  <path d="M110 824 C480 830 588 696 820 731 C1090 772 1275 948 1820 676" fill="none" stroke="url(#cover-path)" strokeWidth={3}/>
  {[0,1,2,3,4].map(i=><ellipse key={i} cx={1350} cy={768} rx={210+i*49} ry={44+i*15} fill="none" stroke="#d6bb81" strokeOpacity={.18-i*.024}/>) }
 </svg>
 <div style={{position:'absolute',left:790,top:140}}><Hero3D kind="gear" frame={100} width={1110} height={760} rotation={-.35} warm={.6} scale={1.13}/></div>
 <div style={{position:'absolute',left:135,top:206,fontFamily:SANS,fontSize:27,letterSpacing:7,color:'#ac9b7d'}}>苏轼 · 人生的步调</div>
 <div style={{position:'absolute',left:120,top:302,fontFamily:SERIF,fontSize:176,letterSpacing:16,color:PALETTE.gold,textShadow:'0 2px 28px #97714522'}}>定风波</div>
 <div style={{position:'absolute',left:133,top:588,fontFamily:SERIF,fontSize:48,letterSpacing:5,color:PALETTE.ivory}}>风雨有时，脚步由你。</div>
 <div style={{position:'absolute',left:138,top:959,fontFamily:SANS,fontSize:24,letterSpacing:4,color:'#a29884'}}>一蓑烟雨任平生</div>
</AbsoluteFill>;
