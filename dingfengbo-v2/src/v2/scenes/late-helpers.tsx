import React from 'react';

export type VisualProps = {frame:number;duration:number};
export const L = {gold:'#D6BB81', ivory:'#F2E8D2', jade:'#6EA99E', amber:'#D59A51', red:'#B95342', dark:'#090D10'};
export const limit=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const ease=(n:number)=>{const x=limit(n);return x*x*(3-2*x)};
export const phase=(f:number,start:number,end:number)=>ease((f-start)/(end-start));
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const rnd=(i:number)=>{const v=Math.sin(i*127.1+311.7)*43758.5453123;return v-Math.floor(v)};
export const TAU=Math.PI*2;
export const LateSvg:React.FC<{children:React.ReactNode;opacity?:number}>=({children,opacity=1})=><svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'hidden',opacity}}>{children}</svg>;
export const LateDefs=({id}:{id:string})=><defs>
  <linearGradient id={`${id}-gold`} x1="0" x2="1" y1="0" y2=".3"><stop offset="0" stopColor="#5A4930"/><stop offset=".22" stopColor="#D6BB81"/><stop offset=".48" stopColor="#FFF1C6"/><stop offset=".65" stopColor="#AC8452"/><stop offset="1" stopColor="#E1CA93"/></linearGradient>
  <linearGradient id={`${id}-bamboo`}><stop offset="0" stopColor="#3A3321"/><stop offset=".25" stopColor="#B8A36A"/><stop offset=".42" stopColor="#E6D49F"/><stop offset=".56" stopColor="#8A7448"/><stop offset="1" stopColor="#30291D"/></linearGradient>
  <linearGradient id={`${id}-drop`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#D5EAE5" stopOpacity=".95"/><stop offset=".33" stopColor="#619991" stopOpacity=".17"/><stop offset=".66" stopColor="#122F30" stopOpacity=".3"/><stop offset="1" stopColor="#DDE7CA" stopOpacity=".8"/></linearGradient>
  <radialGradient id={`${id}-halo`}><stop stopColor={L.gold} stopOpacity=".32"/><stop offset=".4" stopColor={L.amber} stopOpacity=".08"/><stop offset="1" stopColor={L.amber} stopOpacity="0"/></radialGradient>
  <radialGradient id={`${id}-jade`}><stop stopColor={L.jade} stopOpacity=".32"/><stop offset="1" stopColor={L.jade} stopOpacity="0"/></radialGradient>
  <filter id={`${id}-glow`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
</defs>;
export const DropIcon=({id,x=0,y=0,scale=1,opacity=1}:{id:string;x?:number;y?:number;scale?:number;opacity?:number})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <path d="M0 -63 C-12 -40 -39 -3 -39 20 A39 39 0 0 0 39 20 C39 -3 12 -40 0 -63Z" fill={`url(#${id}-drop)`} stroke={L.ivory} strokeOpacity=".62" strokeWidth="1.2"/>
  <path d="M-9 -30 C-22 -6 -28 10 -26 24" fill="none" stroke="#F0F9EA" strokeWidth="3" strokeLinecap="round" opacity=".75"/><path d="M-10 47 Q17 52 29 29" fill="none" stroke={L.gold} strokeWidth="1.3"/>
</g>;
export const BambooIcon=({id,x=0,y=0,scale=1,angle=0,opacity=1}:{id:string;x?:number;y?:number;scale?:number;angle?:number;opacity?:number})=><g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`} opacity={opacity}>
  <path d="M-6 86 L-8 -111 Q-8 -142 16 -141 Q39 -140 38 -119" fill="none" stroke="#151811" strokeWidth="19" strokeLinecap="round"/>
  <path d="M-6 86 L-8 -111 Q-8 -142 16 -141 Q39 -140 38 -119" fill="none" stroke={`url(#${id}-bamboo)`} strokeWidth="14" strokeLinecap="round"/>
  <path d="M-10 86 L-12 -111 Q-12 -139 14 -144" fill="none" stroke={L.ivory} strokeOpacity=".35" strokeWidth="1.1"/>
  {[-92,-43,7,55].map((y,i)=><g key={i}><path d={`M-15 ${y} Q-8 ${y+4} 0 ${y}`} fill="none" stroke="#E5CE91" strokeWidth="3.5"/><path d={`M-15 ${y+4} Q-8 ${y+7} 0 ${y+4}`} fill="none" stroke="#443A24" strokeWidth="2"/></g>)}
</g>;
export const CloakIcon=({id,x=0,y=0,scale=1,opacity=1}:{id:string;x?:number;y?:number;scale?:number;opacity?:number})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <path d="M-23 -64 Q0 -80 23 -64 L66 64 Q0 91 -66 64 Z" fill="#211F17" stroke={L.gold} strokeOpacity=".4"/>
  {Array.from({length:31},(_,i)=>{const u=(i-15)/15;return <path key={i} d={`M${u*20} ${-64+Math.abs(u)*10} Q${u*44} 0 ${u*64} ${66+8*Math.cos(u*3)}`} fill="none" stroke={i%3?L.gold:L.ivory} strokeOpacity={i%3?.43:.6} strokeWidth={i%3?1.4:1.8}/>})}
  {[-38,-13,12,37,60].map((y,i)=><path key={y} d={`M${-27-i*8} ${y} Q0 ${y+14} ${27+i*8} ${y}`} fill="none" stroke={L.amber} strokeOpacity=".5" strokeWidth="1.4"/>)}
  <path d="M-23 -64 Q0 -50 23 -64" fill="none" stroke={L.ivory} strokeWidth="4" strokeOpacity=".45"/>
</g>;
export const SunIcon=({x,y,r=36,frame=0,color=L.gold}:{x:number;y:number;r?:number;frame?:number;color?:string})=><g transform={`translate(${x} ${y})`}>
  <circle r={r} fill="none" stroke={color} strokeWidth="1.8"/><circle r={r-7} fill={color} opacity=".055"/>
  {Array.from({length:12},(_,i)=>{const a=i*TAU/12+frame*.001;return <line key={i} x1={Math.cos(a)*(r+13)} y1={Math.sin(a)*(r+13)} x2={Math.cos(a)*(r+24)} y2={Math.sin(a)*(r+24)} stroke={color} strokeOpacity=".6" strokeWidth="1.6"/>})}
</g>;
export const CloudIcon=({x,y,scale=1,color=L.jade}:{x:number;y:number;scale?:number;color?:string})=><g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M-63 14 C-82 14 -82 -20 -60 -24 C-55 -59 -12 -60 1 -38 C21 -60 58 -45 58 -16 C84 -10 77 20 56 20 L-56 20" fill={color} fillOpacity=".035" stroke={color} strokeOpacity=".8" strokeWidth="1.8"/></g>;
export const HaloPoint=({x,y,r=5,id,opacity=1,color=L.ivory}:{x:number;y:number;r?:number;id:string;opacity?:number;color?:string})=><g opacity={opacity}>
  <circle cx={x} cy={y} r={r*6} fill={`url(#${id}-halo)`}/><circle cx={x} cy={y} r={r*1.8} fill="none" stroke={L.gold} strokeOpacity=".26"/><circle cx={x} cy={y} r={r} fill={color}/>
</g>;
export type V3={x:number;y:number;z:number};
export type P2={x:number;y:number;s:number};
export const project=(p:V3,angle:number,zoom=1,cy=510):P2=>{
  const x=p.x*Math.cos(angle)-p.z*Math.sin(angle);
  const z=p.x*Math.sin(angle)+p.z*Math.cos(angle);
  const tilt=.10;const y=p.y*Math.cos(tilt)-z*Math.sin(tilt);
  const depth=z*Math.cos(tilt)+p.y*Math.sin(tilt);
  const s=1200/(1700+depth);
  return {x:960+x*s*zoom,y:cy+y*s*zoom,s:s*zoom};
};
export const pointsPath=(pts:{x:number;y:number}[],closed=false)=>pts.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')+(closed?' Z':'');
