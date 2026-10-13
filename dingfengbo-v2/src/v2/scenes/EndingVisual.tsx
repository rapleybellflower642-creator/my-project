import React from 'react';
import {L,LateSvg,LateDefs,VisualProps,phase,mix,HaloPoint,pointsPath,rnd} from './late-helpers';

export const EndingVisual=({frame,duration}:VisualProps)=>{
  const id='ending-v2';const settle=phase(frame,0,43);const progress=phase(frame,4,duration-12);const x=mix(760,1190,progress);
  const route=Array.from({length:121},(_,i)=>{const t=i/120;return {x:280+t*1360,y:715+Math.sin(t*6.28)*mix(51,10,settle)};});
  return <LateSvg><LateDefs id={id}/>
    <ellipse cx="980" cy="724" rx="620" ry="170" fill={`url(#${id}-halo)`} opacity=".3"/>
    <g opacity={(1-settle)*.3}>
      {[420,960,1500].map((xx,i)=><ellipse key={i} cx={xx} cy={650+settle*63} rx={180*(1-settle)} ry={130*(1-settle)} fill="none" stroke={i===0?L.jade:i===2?L.amber:L.gold} strokeWidth="1"/>)}
    </g>
    <path d={pointsPath(route)} fill="none" stroke={L.gold} strokeOpacity=".055" strokeWidth="12"/>
    <path d={pointsPath(route)} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.5" strokeOpacity=".75"/>
    <HaloPoint id={id} x={x} y={715+Math.sin((x-280)/1360*6.28)*mix(51,10,settle)} r={5.2}/>
    {Array.from({length:29},(_,i)=><circle key={i} cx={340+rnd(i+100)*1250+Math.sin(frame*.004+i)*6} cy={649+rnd(i)*153-frame*.023} r={.7+rnd(i+1)*1.2} fill={L.gold} opacity={.10+rnd(i+2)*.16}/>)}
  </LateSvg>;
};
