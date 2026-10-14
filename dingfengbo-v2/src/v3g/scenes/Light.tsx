import React from 'react';
import {Artifact,Word,GOLD,WHITE,MUTED,RED,out,smooth} from '../Common';
export const Light=({t}:{t:number})=>{
 const detail=1-smooth((t-1.7)/.5), comparison=smooth((t-1.9)/.65), release=smooth((t-5.6)/1.8);
 return <g>
  <Word text="竹杖芒鞋" t={t} x={140} y={243} size={78}/>
  <g opacity={detail}>
   <ellipse cx="1020" cy="797" rx="360" ry="65" fill="url(#g-floor)"/>
   <Artifact kind="sandals" index={7*smooth(t/1.6)} x={1040} y={502} size={820}/>
  </g>
  <g opacity={comparison}>
   <Word text="轻胜马。" t={t} delay={2.2} x={510} y={243} size={78}/>
   <g transform={`translate(${-25*release} ${32*release})`} opacity={1-.72*release}>
    <Artifact kind="seal" index={22} x={493} y={519} size={450}/>
    <text x="493" y="754" textAnchor="middle" fontSize="38" fill={MUTED}>身份 · 体面 · 执着</text>
    {Array.from({length:6},(_,i)=><path key={i} d={`M${370+i*45} 630Q${345+i*58} 737 ${360+i*53} 842`} fill="none" stroke={i%2?RED:MUTED} strokeWidth="1.6" opacity={(1-release)*.5} strokeDasharray="6 7"/>)}
   </g>
   <path d="M815 560H1090" stroke={GOLD} opacity=".25" strokeDasharray="280" strokeDashoffset={280*(1-out((t-3)/.9))}/>
   <circle cx={815+275*out((t-3)/1.3)} cy="560" r="4" fill={GOLD} opacity={1-release}/>
   <g transform={`translate(0 ${-30*release})`}>
    <path d="M1130 645C1195 535 1234 410 1335 451S1451 644 1601 497" fill="none" stroke="url(#g-gold)" strokeWidth="3" strokeDasharray="650" strokeDashoffset={650*(1-out((t-3.1)/1.8))}/>
    {Array.from({length:7},(_,i)=><path key={i} d={`M${1120+i*34} ${720+i*5}Q${1270+i*18} ${566-i*24} ${1550+i*20} ${568-i*28}`} fill="none" stroke={GOLD} strokeWidth=".8" opacity={release*(.19-i*.018)}/>)}
    <Word text="轻" t={t} delay={3.3} x={1340} y={685} size={105} anchor="middle"/>
    <text x="1340" y="779" textAnchor="middle" fontSize="35" fill={WHITE} opacity={out((t-4.2)/.7)}>心无牵绊，行有余地</text>
   </g>
  </g>
 </g>;
};
