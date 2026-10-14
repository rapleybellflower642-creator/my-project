import React from 'react';
import {Artifact,Word,out,smooth,mix,GOLD,WHITE} from '../Common';
export const Hook=({t}:{t:number})=>{
 const arrival=out(t/1.1), shift=smooth((t-3.05)/1.1), x=mix(960,1330,shift), y=773-(567-360)*(850-100*shift)/720-125*(1-arrival);
 const impact=Math.max(0,t-1.1), ripple=smooth(impact/.7)*(1-smooth((impact-.6)/.6));
 return <g>
  <ellipse cx={x} cy="773" rx={280+110*shift} ry="65" fill="url(#g-floor)" opacity={arrival}/>
  <ellipse cx={x} cy="772" rx={120+impact*170} ry={18+impact*22} fill="none" stroke={GOLD} strokeWidth="1.5" opacity={ripple*.5}/>
  <Artifact kind="seal" index={29*smooth(t/3)} x={x} y={y} size={850-100*shift} opacity={out(t/.45)}/>
  <g opacity={smooth((t-.8)/.8)*(1-shift)}>
   <path d="M603 660L529 700H357" fill="none" stroke={GOLD} strokeOpacity=".38"/>
   <text x="356" y="747" fontSize="31" fill={GOLD}>身份 · 荣辱</text>
  </g>
  <g opacity={shift}>
   <Word text="跌到谷底，" t={t} delay={3.25} x={170} y={435} size={103}/>
   <Word text="他为何不慌？" t={t} delay={3.65} x={170} y={585} size={103}/>
   <path d="M176 650H650" stroke={GOLD} opacity=".25" strokeDasharray="474" strokeDashoffset={474*(1-out((t-4)/.9))}/>
   <text x="176" y="712" fontSize="32" fill={WHITE} opacity={out((t-4.5)/.7)}>苏轼 · 黄州</text>
  </g>
 </g>;
};
export const TitleScene=({t}:{t:number})=>{
 const p=out(t/1.1);
 return <g>
  <Artifact kind="scroll" index={7*smooth(t/3.2)} x={960} y={472} size={1230} opacity={.12*p} angle={-8}/>
  <g transform={`translate(960 458) scale(${1.07-.07*p}) translate(-960 -458)`} opacity={p}>
   <text x="960" y="540" textAnchor="middle" fontSize="188" letterSpacing="19" fill="url(#g-gold)">定风波</text>
  </g>
  <path d="M540 653C715 653 814 603 960 614S1224 654 1380 634" fill="none" stroke={GOLD} strokeWidth="1.7" strokeDasharray="880" strokeDashoffset={880*(1-out((t-.35)/1.4))} opacity=".66"/>
  <Word text="莫听穿林打叶声" t={t} delay={.8} x={960} y={733} size={40} anchor="middle" tracking={9}/>
 </g>;
};
