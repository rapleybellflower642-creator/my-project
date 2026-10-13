import React from 'react';
import {Hero3D} from '../Hero3D';
import {GOLD, IVORY, JADE, MiddleDefs, ContactWater, RainField, ramp, smooth, mix, seed, svgStyle, labelStyle, VisualProps} from './middle-helpers';

export const CloakVisual = ({frame}: VisualProps) => {
  const weave=smooth(ramp(frame,13,132));
  const pullback=smooth(ramp(frame,16,154));
  const held=smooth(ramp(frame,130,184));
  return <>
    <svg style={svgStyle} viewBox="0 0 1920 1080">
      <MiddleDefs id="cloak"/>
      <ellipse cx="960" cy="500" rx="414" ry="290" fill="url(#cloak-light)" opacity={.23+.2*weave}/>
      <RainField frame={frame} density={90} opacity={.10+.17*held} bounds={[340,190,1240,585]}/>
      {Array.from({length:52},(_,i)=>{
        const isLeft=i%2===0;
        const z=seed(i+299);
        const sx=isLeft?190+z*270:1460+z*275;
        const sy=223+seed(i+19)*472;
        const endX=960+(isLeft?-1:1)*(135+z*170);
        const endY=390+seed(i+319)*340;
        const u=smooth(ramp(frame,8+(i%13)*3,119+(i%13)*3));
        const x=mix(sx,endX,u), y=mix(sy,endY,u);
        const cpX=mix(960+(isLeft?-440:440),endX+60*(isLeft?-1:1),u);
        return <path key={i} d={`M${x} ${y} Q${cpX} ${y-75+Math.sin(i)*24} ${endX} ${endY}`} stroke={i%5===0?IVORY:GOLD} strokeWidth={i%7===0?2:1} fill="none" opacity={(1-held)*(.15+z*.4)} pathLength="1" strokeDasharray="1" strokeDashoffset={1-smooth(ramp(frame,i%14,52+i%14))}/>;
      })}
      <g opacity={smooth(ramp(frame,128,168))}>
        <ellipse cx="960" cy="746" rx="307" ry="55" fill="none" stroke={GOLD} strokeOpacity=".18"/>
        <path d="M480 480H595l44-31 M1440 584H1331l-40-48" stroke={GOLD} strokeOpacity=".35" fill="none"/>
        <text x="460" y="488" textAnchor="end" style={{...labelStyle,fontSize:27}}>编织成形</text>
        <text x="1460" y="592" style={{...labelStyle,fontSize:27,fill:JADE}}>雨珠滑落</text>
      </g>
    </svg>
    <div style={{position:'absolute',left:420,top:190,width:1080,height:610,maskImage:'linear-gradient(to bottom,transparent 0%,black 9%,black 91%,transparent 100%)'}}>
      <Hero3D kind="cloak" frame={frame} width={1080} height={610} reveal={.045+weave*.955} rotation={-.48+pullback*.63} scale={mix(1.4,1.01,pullback)} warm={.2} energy={.25}/>
    </div>
    <svg style={svgStyle} viewBox="0 0 1920 1080">
      {Array.from({length:18},(_,i)=>{
        const p=((frame*1.12+i*37)%140)/140;
        const side=i%2===0?-1:1;
        const x=960+side*(68+124*p+seed(i+921)*92);
        const y=288+p*431;
        return <g key={i} opacity={held*(.16+seed(i+919)*.5)*Math.sin(p*Math.PI)}>
          <line x1={x} y1={y-15} x2={x+side*3} y2={y} stroke={IVORY} strokeWidth="1.2"/>
          <ellipse cx={x+side*3} cy={y+2} rx="2.3" ry="3.7" fill="#C4DCD1"/>
        </g>;
      })}
      <ContactWater frame={frame} at={166} x={1176} y={749} id="cloak" strength={.36}/>
      <ContactWater frame={frame} at={215} x={742} y={747} id="cloak" strength={.3}/>
      <path d="M960 744C961 763 961 780 962 799" fill="none" stroke={JADE} strokeWidth="1.5" opacity={held*.42}/>
    </svg>
  </>;
};
