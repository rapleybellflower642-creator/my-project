import React from 'react';
import {L,LateSvg,LateDefs,VisualProps,phase,mix,DropIcon,BambooIcon,CloakIcon,HaloPoint,pointsPath,rnd} from './late-helpers';

export const LookBackVisual=({frame}:VisualProps)=>{
  const id='lookback-v2';const retreat=phase(frame,10,220);const scale=mix(1.24,.92,retreat);
  const base=[{x:470,y:416},{x:914,y:490},{x:1385,y:617}];
  const route=Array.from({length:130},(_,i)=>{const t=i/129;return {x:230+t*1510,y:365+310*t+34*Math.sin(t*7)}});
  const routeD=pointsPath(route);
  const center=route[Math.round(mix(115,17,retreat))];
  return <LateSvg><LateDefs id={id}/>
    <g transform={`translate(${960-960*scale} ${530-530*scale}) scale(${scale})`}>
      <ellipse cx="1140" cy="565" rx="670" ry="250" fill={`url(#${id}-halo)`} opacity=".36"/>
      {[-30,30].map(off=><path key={off} d={pointsPath(route.map(p=>({x:p.x,y:p.y+off})))} fill="none" stroke={L.gold} strokeOpacity=".075" strokeWidth=".8"/>)}
      <path d={routeD} fill="none" stroke={L.gold} strokeWidth="13" strokeOpacity=".04"/>
      <path d={routeD} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="2.6"/>
      {base.map((p,i)=>{const reveal=phase(frame,8+i*43,50+i*43);const sc=.7+i*.22;return <g key={i} opacity={reveal} transform={`translate(${p.x} ${p.y})`}>
        <ellipse cy="18" rx={91*sc} ry={22*sc} fill={L.gold} fillOpacity=".025" stroke={L.gold} strokeOpacity=".31" strokeWidth="1"/>
        <ellipse cy="18" rx={115*sc} ry={28*sc} fill="none" stroke={L.gold} strokeOpacity=".11" strokeDasharray="3 6"/>
        <line x1="0" y1="0" x2="0" y2={-130*sc} stroke={L.gold} strokeOpacity=".16" strokeDasharray="2 8"/>
        <circle cy={-164*sc} r={102*sc} fill={L.dark} fillOpacity=".35" stroke={L.gold} strokeWidth=".8" strokeOpacity=".12"/>
        {i===0?<DropIcon id={id} y={-165*sc} scale={.91*sc}/>:i===1?<BambooIcon id={id} y={-159*sc} scale={.76*sc} angle={12}/>:<CloakIcon id={id} y={-163*sc} scale={1.1*sc}/>}
        <circle r="5" fill={i===1?L.jade:L.gold}/>
        <text y={74*sc} textAnchor="middle" fill={L.ivory} opacity=".6" fontFamily="DFBSerif" fontSize="28" letterSpacing="7">{['雨落','徐行','烟雨'][i]}</text>
      </g>})}
      <HaloPoint id={id} x={center.x} y={center.y} r={5} opacity={.9}/>
      {Array.from({length:46},(_,i)=>{const x=280+rnd(i+85)*1400;const y=280+rnd(i+190)*440;return <circle key={i} cx={x+Math.sin(frame*.006+i)*6} cy={y-frame*.018} r={.7+rnd(i)*1.7} fill={L.gold} opacity={(.09+rnd(i+2)*.2)*phase(frame,8,40)}/>})}
    </g>
  </LateSvg>;
};
