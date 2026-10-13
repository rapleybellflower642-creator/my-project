import React from 'react';
import {Hero3D} from '../Hero3D';
import {GOLD, IVORY, AMBER, MiddleDefs, ramp, smooth, seed, svgStyle, labelStyle, VisualProps} from './middle-helpers';

export const ColdVisual = ({frame}: VisualProps) => {
  const chill=smooth(ramp(frame,13,84));
  const care=smooth(ramp(frame,151,225));
  const warm=.32-chill*.24+care*.19;
  const tremor=Math.sin(frame*.36)*chill*(1-care*.6);
  return <>
    <svg style={svgStyle} viewBox="0 0 1920 1080">
      <MiddleDefs id="cold"/>
      <ellipse cx={981+tremor*4} cy="548" rx={222-chill*85+care*69} ry={233-chill*65+care*53} fill="url(#cold-light)" opacity={.55-chill*.32+care*.25}/>
      <path d="M464 747 Q960 672 1457 745" stroke={GOLD} strokeOpacity=".15" fill="none"/>
    </svg>
    <div style={{position:'absolute',left:460,top:164,width:1010,height:650,opacity:.79}}>
      <Hero3D kind="cloak" frame={frame} width={1010} height={650} reveal={1} rotation={.08+chill*.18-care*.11} scale={1.22} warm={warm} energy={.09+chill*.11}/>
    </div>
    <svg style={svgStyle} viewBox="0 0 1920 1080">
      <path d={`M${949+tremor*3} 403 Q970 454 ${997+tremor*3} 604 L939 604 Q957 498 949 403Z`} fill={AMBER} opacity={.08-chill*.055+care*.065}/>
      {Array.from({length:29},(_,i)=>{
        const x=605+i*25;
        const sway=Math.sin(frame*.15+i*.5)*(3+chill*7)*(1-care*.48);
        const y=265+Math.sin(i*.42)*44;
        return <path key={i} d={`M${x} ${y} Q${x-43+sway} ${y+155} ${x+16+sway} ${y+368}`} stroke={i%4===0?IVORY:GOLD} strokeOpacity={.07+seed(i+642)*.1} strokeWidth={i%3===0?1.8:.8} fill="none"/>;
      })}
      {Array.from({length:9},(_,i)=>{
        const y=301+i*45;
        const phase=(frame*4.9+i*91)%1600;
        return <path key={i} d={`M${100+phase} ${y} Q${250+phase} ${y-42} ${448+phase} ${y+18} Q${610+phase} ${y+74} ${760+phase} ${y+16}`} stroke="url(#cold-cool)" strokeWidth={i%3===0?2:1} opacity={chill*(1-care*.45)*.22} fill="none"/>;
      })}
      <g opacity={smooth(ramp(frame,45,88))*(1-smooth(ramp(frame,163,204)))}>
        <path d="M444 466H586l59 25" fill="none" stroke="#9EC0BF" strokeOpacity=".4"/>
        <text x="424" y="477" textAnchor="end" style={{...labelStyle,fontSize:28,fill:'#A6BEBD'}}>风仍会冷</text>
      </g>
      <g opacity={care}>
        <path d="M1285 581l43 33H1460" fill="none" stroke={AMBER} strokeOpacity=".53"/>
        <text x="1490" y="624" style={{...labelStyle,fontSize:28,fill:GOLD}}>添一点照料</text>
        <path d="M985 591Q1070 566 1214 604" fill="none" stroke={AMBER} strokeWidth="2" opacity=".44"/>
      </g>
      <path d={`M${950+tremor*4} 581 Q${966+tremor*8} ${550+chill*18} ${999+tremor*6} 575`} stroke={IVORY} strokeWidth="2" opacity={.47-chill*.27+care*.28} fill="none"/>
    </svg>
  </>;
};
