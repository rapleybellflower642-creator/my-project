import React from 'react';
import {staticFile} from 'remotion';
export const GOLD='#ead09a', WHITE='#f0eadb', MUTED='#b2a083', RED='#c66e50';
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(v:number)=>{const p=clamp(v);return p*p*(3-2*p);};
export const out=(v:number)=>1-Math.pow(1-clamp(v),3);
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export type SceneProps={shot:number;t:number;duration:number;global:number};
export const beatPulse=(t:number)=>Math.exp(-Math.max(0,((t-.417)%.549614+.549614)%.549614)*15);
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
 const p=out((t-delay+.025)/.22);return <text x={x} y={y+20*(1-p)} fontSize={size} textAnchor={anchor} fill={color} opacity={p} letterSpacing={tracking}>{text}</text>;
};
export const BackgroundDefs=()=> <defs>
 <radialGradient id="g-background" cx="52%" cy="39%" r="75%"><stop stopColor="#2c241b"/><stop offset=".42" stopColor="#141411"/><stop offset="1" stopColor="#06090c"/></radialGradient>
 <radialGradient id="g-gold-halo"><stop stopColor="#bd8e45" stopOpacity=".21"/><stop offset=".5" stopColor="#a07539" stopOpacity=".055"/><stop offset="1" stopColor="#846132" stopOpacity="0"/></radialGradient>
 <radialGradient id="g-floor"><stop stopColor="#b28a48" stopOpacity=".34"/><stop offset="1" stopColor="#8b6730" stopOpacity="0"/></radialGradient>
 <linearGradient id="g-gold" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#fff0bc"/><stop offset=".4" stopColor="#e3c388"/><stop offset="1" stopColor="#947343"/></linearGradient>
 <linearGradient id="g-fiber" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#4d391c"/><stop offset=".3" stopColor="#c6a467"/><stop offset=".5" stopColor="#e9d59b"/><stop offset=".75" stopColor="#a17f47"/><stop offset="1" stopColor="#322817"/></linearGradient>
 <linearGradient id="g-bottom" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#06090c" stopOpacity="0"/><stop offset="1" stopColor="#06090c" stopOpacity=".8"/></linearGradient>
 </defs>;
export const StaticBackdrop=()=> <g>
 <BackgroundDefs/>
 <rect width="1920" height="1080" fill="url(#g-background)"/>
 <ellipse cx="1040" cy="380" rx="900" ry="680" fill="url(#g-gold-halo)" opacity=".5"/>
 {/* Stretch the square grain to the entire frame: SVG's default `meet` made visible vertical seams. */}
 <image href={staticFile('textures/grain.png')} width="1920" height="1080" preserveAspectRatio="none" opacity=".018"/>
 <rect y="860" width="1920" height="220" fill="url(#g-bottom)"/>
 </g>;
export const Backdrop=({t,background=true}:{t:number;background?:boolean})=> <g>{background?<StaticBackdrop/>:<BackgroundDefs/>}
 {Array.from({length:44},(_,i)=>{const x=(i*211.47+Math.sin(i*9.3)*90+t*(i%2?3.6:-2.4)+1920)%1920,y=(i*137.77-t*(4+i%4)+2160)%1080;return <circle key={i} cx={x} cy={y} r={i%5===0?1.7:.9} fill={i%3?GOLD:'#a4bbc1'} opacity={.09+.075*(.5+.5*Math.sin(t*.8+i))}/>;})}
 </g>;
export const Subtitle=({text,t,start,end}:{text:string;t:number;start:number;end:number})=> <g opacity={smooth((t-start+.025)/.09)*smooth((end-t)/.08)}>
 <text x="960" y="1000" textAnchor="middle" fontSize="44" fill={WHITE} letterSpacing="1.1">{text}</text>
 </g>;
