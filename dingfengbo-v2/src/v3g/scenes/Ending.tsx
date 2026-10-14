import React from 'react';
import {Word,GOLD,WHITE,out,smooth} from '../Common';
export const Ending=({t}:{t:number})=>{
 const p=smooth(t/2.1), sweep=out(t/2.5);
 return <g>
  <defs><radialGradient id="end-halo"><stop stopColor="#d4b56b" stopOpacity=".2"/><stop offset="1" stopColor="#a58146" stopOpacity="0"/></radialGradient></defs>
  <ellipse cx="960" cy="535" rx={400+120*p} ry="330" fill="url(#end-halo)"/>
  <path d={`M350 ${650+35*(1-p)}C540 ${555+85*p} 738 ${744-104*p} 960 640S1370 ${575+65*p} 1570 640`} stroke={GOLD} fill="none" strokeWidth="1.7" opacity=".62" strokeDasharray="1300" strokeDashoffset={1300*(1-sweep)}/>
  <circle cx={350+1220*smooth((t-.5)/5)} cy="640" r={3.7} fill="#f4e7ba" opacity={out(t/.3)}/>
  <Word text="也无风雨，也无晴。" t={t} delay={.35} x={960} y={484} size={104} anchor="middle" tracking={4}/>
  <Word text="苏轼《定风波》" t={t} delay={1.6} x={960} y={563} size={32} anchor="middle" color={WHITE} tracking={5}/>
 </g>;
};
