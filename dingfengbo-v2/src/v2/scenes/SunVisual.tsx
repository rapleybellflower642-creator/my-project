import React from 'react';
import {Hero3D} from '../Hero3D';
import {GOLD, AMBER, IVORY, MiddleDefs, RainField, ramp, smooth, mix, seed, svgStyle, VisualProps} from './middle-helpers';

export const SunVisual = ({frame}: VisualProps) => {
  const light=smooth(ramp(frame,16,156));
  const full=smooth(ramp(frame,115,213));
  const beamx=mix(1730,1250,light);
  return <>
    <svg style={svgStyle} viewBox="0 0 1920 1080">
      <MiddleDefs id="sun"/>
      <RainField frame={frame} density={90} opacity={.24*(1-light)} slant={-35} bounds={[250,200,1430,545]}/>
      <g opacity={light}>
        <path d={`M${beamx} 174L1770 174L1042 800L251 800Z`} fill="url(#sun-beam)" style={{filter:'blur(11px)'}}/>
        <path d={`M${beamx+111} 176L${beamx+150} 176L660 791L452 791Z`} fill="#F4DFAE" opacity=".038" style={{filter:'blur(5px)'}}/>
        <path d={`M${beamx+227} 176L${beamx+257} 176L1240 797L1165 797Z`} fill="#F4DFAE" opacity=".04" style={{filter:'blur(4px)'}}/>
        {Array.from({length:19},(_,i)=>{
          const x=1220+i*30;
          return <line key={i} x1={x} y1={190+seed(i+756)*120} x2={x-430-light*320} y2="771" stroke={i%4===0?IVORY:AMBER} strokeOpacity={.013+seed(i+32)*.025} strokeWidth={i%5===0?4:1}/>;
        })}
        <ellipse cx="996" cy="733" rx="532" ry="80" fill="url(#sun-light)" opacity=".72"/>
        <path d="M347 736Q899 695 1594 737" stroke={GOLD} strokeWidth="1.2" strokeOpacity=".29" fill="none"/>
      </g>
      {Array.from({length:66},(_,i)=>{
        const x=437+seed(i+932)*1080+Math.sin(frame*.008+i)*19;
        const y=225+((seed(i+12)*529-frame*(.09+seed(i+25)*.18)+529)%529);
        const within=1-Math.abs(x/1920-y/1080-.32);
        return <circle key={i} cx={x} cy={y} r={.6+seed(i+771)*1.8} fill={i%5===0?IVORY:GOLD} opacity={light*Math.max(0,within)*(.06+seed(i+67)*.34)}/>;
      })}
    </svg>
    <div style={{position:'absolute',left:425,top:173,width:1080,height:616}}>
      <Hero3D kind="gear" frame={frame} width={1080} height={616} reveal={1} rotation={-.46+light*.72} scale={1.06} warm={.08+light*.92} energy={.17}/>
    </div>
    <svg style={svgStyle} viewBox="0 0 1920 1080">
      <g opacity={full*.65}>
        <path d="M316 742C575 743 763 741 965 740S1420 721 1656 691" stroke={GOLD} strokeWidth="1.8" fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={1-full}/>
        <circle cx={mix(635,1640,full)} cy={mix(741,694,full)} r="3.5" fill={IVORY}/>
        <ellipse cx="1230" cy="720" rx="272" ry="28" fill="url(#sun-light)"/>
      </g>
    </svg>
  </>;
};
