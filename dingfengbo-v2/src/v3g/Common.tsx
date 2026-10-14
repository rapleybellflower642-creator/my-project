import React from 'react';
import {staticFile} from 'remotion';
export const GOLD='#d8bf83', WHITE='#e9e4d6', MUTED='#887d66', RED='#ab573e';
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(v:number)=>{const p=clamp(v);return p*p*(3-2*p);};
export const out=(v:number)=>1-Math.pow(1-clamp(v),3);
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const ASSET_COUNTS={seal:30,scroll:8,cup:8,sandals:8,cloak:1};
export type AssetKind=keyof typeof ASSET_COUNTS;
export const assetPath=(kind:AssetKind,index=0)=>`/v3g/assets/${kind}/${Math.max(0,Math.min(ASSET_COUNTS[kind]-1,Math.round(index))).toString().padStart(3,'0')}.png`;
export const Artifact=({kind,index=0,x,y,size=760,opacity=1,angle=0}:{kind:AssetKind;index?:number;x:number;y:number;size?:number;opacity?:number;angle?:number})=>{
 const position=Math.max(0,Math.min(ASSET_COUNTS[kind]-1,index)),lo=Math.floor(position),hi=Math.ceil(position),blend=position-lo;
 return <g opacity={opacity} transform={`rotate(${angle} ${x} ${y})`}>
  <image href={staticFile(assetPath(kind,lo).slice(1))} x={x-size/2} y={y-size/2} width={size} height={size}/>
  {hi!==lo&&<image href={staticFile(assetPath(kind,hi).slice(1))} x={x-size/2} y={y-size/2} width={size} height={size} opacity={blend}/>}
 </g>;
};
export const Word=({text,t,x,y,size=84,delay=0,anchor='start',color=GOLD,tracking=1}:{text:string;t:number;x:number;y:number;size?:number;delay?:number;anchor?:'start'|'middle'|'end';color?:string;tracking?:number})=>{
 const p=out((t-delay)/.65);return <text x={x} y={y+14*(1-p)} fontSize={size} textAnchor={anchor} fill={color} opacity={p} letterSpacing={tracking}>{text}</text>;
};
export const Backdrop=({t}:{t:number})=><g>
 <defs>
  <radialGradient id="g-background" cx="46%" cy="35%" r="75%"><stop stopColor="#201b15"/><stop offset=".44" stopColor="#0e1011"/><stop offset="1" stopColor="#05080b"/></radialGradient>
  <radialGradient id="g-gold-halo"><stop stopColor="#bd8e45" stopOpacity=".25"/><stop offset=".5" stopColor="#a07539" stopOpacity=".06"/><stop offset="1" stopColor="#846132" stopOpacity="0"/></radialGradient>
  <radialGradient id="g-floor"><stop stopColor="#9b773d" stopOpacity=".28"/><stop offset="1" stopColor="#8b6730" stopOpacity="0"/></radialGradient>
  <linearGradient id="g-gold" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#fff0bc"/><stop offset=".4" stopColor="#d8bf83"/><stop offset="1" stopColor="#8b6b3c"/></linearGradient>
  <linearGradient id="g-fiber" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#4d391c"/><stop offset=".3" stopColor="#b79554"/><stop offset=".5" stopColor="#e4c883"/><stop offset=".75" stopColor="#9c783e"/><stop offset="1" stopColor="#322817"/></linearGradient>
  <linearGradient id="g-bottom" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#06090c" stopOpacity="0"/><stop offset=".7" stopColor="#06090c" stopOpacity=".5"/><stop offset="1" stopColor="#06090c" stopOpacity=".8"/></linearGradient>
 </defs>
 <rect width="1920" height="1080" fill="url(#g-background)"/>
 <ellipse cx={850+Math.sin(t*.08)*140} cy="390" rx="820" ry="560" fill="url(#g-gold-halo)" opacity=".5"/>
 <image href={staticFile('textures/grain.png')} width="1920" height="1080" opacity=".025"/>
 {Array.from({length:38},(_,i)=>{const x=(i*211.47+Math.sin(i*9.3)*90+t*(i%2?1.7:-1.1)+1920)%1920,y=(i*137.77-t*(2+i%4)+2160)%1080;return <circle key={i} cx={x} cy={y} r={i%5===0?1.8:.8} fill={i%3?GOLD:'#90a0a5'} opacity={.05+.055*(.5+.5*Math.sin(t*.35+i))}/>;})}
 <rect y="855" width="1920" height="225" fill="url(#g-bottom)"/>
 </g>;
export const Subtitle=({text,t,start,end}:{text:string;t:number;start:number;end:number})=><g opacity={smooth((t-start)/.17)*smooth((end-t)/.15)}><text x="960" y="992" textAnchor="middle" fontSize="44" fill={WHITE} letterSpacing="1.3">{text}</text></g>;
