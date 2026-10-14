import React from 'react';
import {Artifact,Word,GOLD,out,smooth} from '../Common';
export const Who=({t}:{t:number})=>{
 const hit=62/30, turn=161/30, age=Math.round(t*30)/30-hit, expansion=smooth((t-turn)/1.15), impact=age<0?0:out((age+1/30)/.17), intro=out(t/.55);
 const w=expansion, cx=960-450*w, cy=495+80*w, s=.87-.1*w;
 return <g>
  <Artifact kind="cloak" x={cx} y={cy} size={900*s} angle={-3+2*smooth(t/8)} opacity={intro*(.18+.82*w)}/>
  {Array.from({length:70},(_,i)=>{const x=(i*137.3+180)%1590+90,y=((i*71.3+t*310)%800)+94;return <line key={i} x1={x} y1={y} x2={x-9} y2={y+28} stroke={i%5===0?GOLD:'#7d8a91'} strokeWidth={i%5===0?1.3:.7} opacity={(.15+.17*w)*intro}/>;})}
  <g opacity={impact*(1-w)} transform={`translate(960 515) scale(${1+.09*Math.exp(-Math.max(0,age)*8)*Math.cos(Math.max(0,age)*12)}) translate(-960 -515)`}>
   <text x="960" y="565" textAnchor="middle" fontSize="172" letterSpacing="13" fill="url(#g-gold)">谁怕？</text>
  </g>
  <g opacity={w}>
   <Word text="一蓑烟雨" t={t} delay={turn} x={965} y={430} size={98}/>
   <Word text="任平生。" t={t} delay={turn+.4} x={965} y={566} size={112}/>
   <path d="M973 651H1510" stroke={GOLD} strokeWidth="1" opacity=".32" strokeDasharray="537" strokeDashoffset={537*(1-out((t-turn-.6)/1))}/>
   <Word text="晴也走，雨也走。" t={t} delay={turn+1} x={975} y={729} size={36}/>
  </g>
 </g>;
};
