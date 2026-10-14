import React from 'react';
import {GOLD, WHITE, RED, clamp, out} from '../Common';

export const snap=(t:number,delay=0,seconds=.24)=>out((t-delay)/seconds);
export const settle=(t:number,delay=0)=>{
  const p=clamp((t-delay)/.34);
  return p===1?1:1-Math.exp(-8*p)*Math.cos(9*p);
};
export const line=(points:{x:number;y:number}[])=>points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
export const Label=({x,y,children,size=42,color=GOLD,anchor='start',opacity=1}:{x:number;y:number;children:React.ReactNode;size?:number;color?:string;anchor?:'start'|'middle'|'end';opacity?:number})=><text x={x} y={y} fill={color} fontSize={size} textAnchor={anchor} opacity={opacity} letterSpacing={size>95?7:2}>{children}</text>;

/** Rain is in the scene's perspective, never a rectangular overlay. */
export const RainStrokes=({t,count=68,opacity=.7,top=80,bottom=870,speed=780,seed=0}:{t:number;count?:number;opacity?:number;top?:number;bottom?:number;speed?:number;seed?:number})=><g>
 {Array.from({length:count},(_,i)=>{
   const depth=(i%5)/4,phase=((t*speed*(.7+depth*.45)+i*113.31+seed*47)%(bottom-top))/(bottom-top);
   const x=20+(i*277.43+seed*21) % 1800+phase*125,y=top+phase*(bottom-top),len=25+depth*59;
   return <path key={i} d={`M${x} ${y}l${len*.48} ${len}`} stroke={i%6===0?GOLD:'#8ba4aa'} strokeWidth={1.7+depth*1.7} strokeLinecap="round" opacity={opacity*(.38+depth*.48)}/>;
 })}
</g>;

export const Ripple=({x,y,t,delay=0,scale=1,color=GOLD}:{x:number;y:number;t:number;delay?:number;scale?:number;color?:string})=>{
 const p=clamp((t-delay)/.65);return <g opacity={(1-p)*snap(t,delay,.05)}>
   <ellipse cx={x} cy={y} rx={(12+p*130)*scale} ry={(3+p*30)*scale} stroke={color} strokeWidth={3*(1-p)+1} fill="none"/>
   {[0,1,2,3,4,5].map(i=>{const a=-Math.PI*.9+i*Math.PI*.16;return <path key={i} d={`M${x+Math.cos(a)*p*90*scale} ${y+Math.sin(a)*p*65*scale}l${Math.cos(a)*13} ${Math.sin(a)*13}`} stroke={color} strokeWidth="3"/>;})}
 </g>;
};

/** Folded paper ribs and a hooked wooden shaft give the umbrella real volume. */
export const Umbrella=({x,y,size=1,angle=0}:{x:number;y:number;size?:number;angle?:number})=><g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`}>
 <defs><linearGradient id="p-umbrella-paper" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#eddeb0"/><stop offset=".43" stopColor="#b99a58"/><stop offset="1" stopColor="#564528"/></linearGradient></defs>
 <path d="M-425 80Q-335-227 0-280Q335-227 425 80Q354 29 282 89Q211 39 140 96Q70 46 0 101Q-70 46-140 96Q-211 39-282 89Q-354 29-425 80Z" fill="url(#p-umbrella-paper)" stroke="#f0d99a" strokeWidth="3"/>
 {[-282,-140,0,140,282].map((v,i)=><path key={v} d={`M0-280Q${v*.72} ${-130+(i%2)*20} ${v} ${v===0?101:96}`} fill="none" stroke="#554227" strokeWidth="3.5"/>)}
 {Array.from({length:16},(_,i)=>{const yy=-225+i*18;const width=270*Math.sqrt(Math.max(.03,1-Math.pow((yy+35)/280,2)))+85;return <path key={i} d={`M${-width} ${yy+35}Q0 ${yy-90} ${width} ${yy+35}`} stroke="#f1dfb0" strokeWidth="1" opacity=".27" fill="none"/>;})}
 <path d="M0-300V-280M0 100V406Q0 468 54 444Q87 430 68 392" stroke="#d7ba7c" strokeWidth="14" fill="none" strokeLinecap="round"/>
 <path d="M-4 110V402" stroke="#f4dba3" strokeWidth="3" fill="none" opacity=".65"/>
 <ellipse cx="0" cy="-280" rx="14" ry="8" fill="#f4dfac"/>
</g>;

export const Footprint=({x,y,scale=1,angle=0,left=false,opacity=1}:{x:number;y:number;scale?:number;angle?:number;left?:boolean;opacity?:number})=><g transform={`translate(${x} ${y}) rotate(${angle}) scale(${left?-scale:scale} ${scale})`} opacity={opacity}>
 <path d="M-15 23C-32 11-34-13-27-29C-21-45-5-59 7-58C21-58 31-39 28-20C25-1 11 3 10 20C10 36-5 36-15 23Z" fill={GOLD}/>
 <ellipse cx="-7" cy="57" rx="17" ry="22" fill={GOLD}/>
 <path d="M-17-22L15-33M-19-8L10-16" stroke="#52452e" strokeWidth="3" opacity=".65"/>
</g>;

export const BeamDot=({x,y,r=18,pulse=0}:{x:number;y:number;r?:number;pulse?:number})=><g>
 <circle cx={x} cy={y} r={r*2.3+pulse*8} fill={GOLD} opacity=".11"/>
 <circle cx={x} cy={y} r={r*1.45+pulse*3} fill="none" stroke={GOLD} strokeWidth="2" opacity=".65"/>
 <circle cx={x} cy={y} r={r} fill={GOLD}/><circle cx={x-r*.25} cy={y-r*.28} r={r*.27} fill={WHITE}/>
</g>;

export const Leaf=({x,y,angle=0,size=1,t=0}:{x:number;y:number;angle?:number;size?:number;t?:number})=><g transform={`translate(${x} ${y}) rotate(${angle+Math.sin(t*3+x)*1.5}) scale(${size})`}>
 <path d="M0 0C42-41 113-55 182-29C125-9 66 8 0 0Z" fill="#b29655" fillOpacity=".48" stroke={GOLD} strokeWidth="2.6"/>
 <path d="M0 0Q93-25 182-29" fill="none" stroke="#f0d89d" strokeWidth="2.1"/>
 {[0,1,2,3].map(i=><path key={i} d={`M${43+i*25} ${-9-i*3}l${18+i*2} ${-18+i*2}`} stroke={GOLD} strokeWidth="1.2" opacity=".75"/>)}
</g>;

export const TearShards=({t,x,y,color=GOLD,count=12}:{t:number;x:number;y:number;color?:string;count?:number})=>{
 const p=clamp(t/.5);return <g opacity={1-p}>{Array.from({length:count},(_,i)=>{const a=i/count*Math.PI*2,rad=25+p*(110+i%3*50);return <path key={i} d={`M${x+Math.cos(a)*rad} ${y+Math.sin(a)*rad}l${Math.cos(a)*22} ${Math.sin(a)*22}`} stroke={color} strokeWidth="3"/>;})}</g>;
};

export const Routes=({t,amount=1}:{t:number;amount?:number})=><g fill="none" stroke={RED} strokeWidth="3" opacity={amount}>
 {[0,1,2,3,4].map(i=><path key={i} d={`M${-140+i*37} ${800-i*100}C${600+i*45} ${70+i*30} ${570-i*54} ${890-i*23} ${1120-i*50} ${560-i*35}S${660+i*100} ${150+i*32} ${1720} ${220+i*132}`} transform={`translate(${Math.sin(t*4+i)*6} ${Math.sin(t*3.5+i)*9})`}/>) }
</g>;
