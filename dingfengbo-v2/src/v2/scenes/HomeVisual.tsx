import React from 'react';
import {L,LateSvg,LateDefs,VisualProps,phase,mix,rnd,BambooIcon,HaloPoint,limit} from './late-helpers';

export const HomeVisual=({frame}:VisualProps)=>{
  const id='home-v2';const gather=phase(frame,16,102);const contact=phase(frame,111,131);const fall=mix(-105,0,contact)-Math.sin(phase(frame,131,147)*Math.PI)*8;
  const ring=(frame-131)/44;const pointX=1015+phase(frame,197,246)*244;
  return <LateSvg><LateDefs id={id}/>
    <ellipse cx="1040" cy="560" rx={mix(850,520,gather)} ry="340" fill={`url(#${id}-halo)`} opacity={mix(.25,.76,gather)}/>
    {Array.from({length:15},(_,i)=>{const y=225+i*35;const left=i%2===0;const endX=left?230:1670;const c1x=left?560:1370;const p=phase(frame,i*2+3,95+i*2);return <g key={i} opacity={(1-p)*.48}>
      <path d={`M960 637 C${c1x} ${700-y*.1} ${c1x} ${y+40} ${endX} ${y}`} fill="none" stroke={i%4===0?L.jade:L.gold} strokeWidth={i%3===0?1.7:.8} pathLength="1" strokeDasharray="1" strokeDashoffset={-p}/>
      <circle cx={mix(endX,960,p)} cy={mix(y,637,p)} r={1.5+rnd(i)*2} fill={L.gold}/>
    </g>})}
    <g opacity={phase(frame,65,110)}>
      <ellipse cx="1040" cy="650" rx="295" ry="42" fill="#040605" opacity=".55"/>
      <path d="M455 649 C635 649 780 631 960 637 S1200 664 1460 653" fill="none" stroke={L.gold} strokeWidth="1.1" strokeOpacity=".2"/>
      <path d="M945 637 C1050 638 1100 666 1243 657" fill="none" stroke={L.gold} strokeWidth="13" strokeOpacity=".07"/>
      <path d="M945 637 C1050 638 1100 666 1243 657" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1-phase(frame,131,210)}/>
      <circle cx="960" cy="637" r="19" fill={L.dark} stroke={L.gold} strokeOpacity=".66" strokeWidth="1.2"/><circle cx="960" cy="637" r="5" fill={L.ivory}/>
      <g opacity={phase(frame,79,118)}><BambooIcon id={id} x={978} y={490+fall} scale={1.65} angle={mix(-5,7,phase(frame,105,140))}/></g>
      {ring>0&&ring<2&&[0,.25,.5].map((delay,i)=>{const p=limit(ring-delay);return <ellipse key={i} cx="961" cy="638" rx={12+p*230} ry={2+p*35} fill="none" stroke={L.gold} strokeWidth={1.5-p} opacity={(1-p)*.6}/>})}
      <g opacity={phase(frame,165,188)}><circle cx="1250" cy="657" r="15" fill={L.dark} stroke={L.jade} strokeWidth="1.4"/><path d="M1247 652 L1254 657 L1247 662" fill="none" stroke={L.jade} strokeWidth="1.5"/></g>
      <HaloPoint id={id} x={pointX} y={637+20*phase(frame,197,246)} r={4} opacity={phase(frame,182,197)} color={L.jade}/>
      <text x="960" y="750" textAnchor="middle" fill={L.gold} opacity=".62" fontFamily="DFBSerif" fontSize="31" letterSpacing="10">此刻</text>
    </g>
  </LateSvg>;
};
