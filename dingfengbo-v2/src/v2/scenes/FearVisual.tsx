import React from 'react';
import {Hero3D} from '../Hero3D';
import {GOLD, JADE, IVORY, MiddleDefs, ContactWater, HairlinePath, RainField, ramp, smooth, mix, PULSE, svgStyle, labelStyle, VisualProps} from './middle-helpers';

const steps = [{x:410,y:634},{x:770,y:588},{x:1125,y:610},{x:1480,y:569}];
export const FearVisual = ({frame}: VisualProps) => {
  const p1=smooth(ramp(frame,43,66));
  const p2=smooth(ramp(frame,109,132));
  const p3=smooth(ramp(frame,175,198));
  const x=410+360*p1+355*p2+355*p3;
  const y=634-46*p1+22*p2-41*p3;
  const leap=105*(Math.sin(p1*Math.PI)+Math.sin(p2*Math.PI)+Math.sin(p3*Math.PI));
  const orbit=smooth(ramp(frame,5,39));
  return <>
    <svg style={svgStyle} viewBox="0 0 1920 1080">
      <MiddleDefs id="fear"/>
      <RainField frame={frame} density={94} opacity={.23} bounds={[200,220,1500,480]}/>
      <HairlinePath d="M245 671 Q410 620 770 588 T1125 610 Q1320 585 1670 550" progress={.11+.27*p1+.25*p2+.37*p3} width={2.6} opacity={.83}/>
      <g opacity={.36*(1-smooth(ramp(frame,35,69)))}>
        <ellipse cx="820" cy="450" rx="424" ry="172" transform={`rotate(${-18+orbit*18} 820 450)`} stroke={GOLD} fill="none" strokeDasharray="2 13"/>
        <path d="M1200 364l25 6-17 22" fill="none" stroke={GOLD}/>
      </g>
      {steps.map((p,i)=>{
        const done=ramp(frame,[0,66,132,198][i], [12,78,144,210][i]);
        return <g key={i}>
          <ellipse cx={p.x} cy={p.y+10} rx="116" ry="31" fill="url(#fear-jade)" opacity={done*.7}/>
          <ellipse cx={p.x} cy={p.y} rx="88" ry="23" fill="#172021" fillOpacity=".58" stroke={done>.05?JADE:GOLD} strokeOpacity={done>.05?.75:.26} strokeWidth="1.4"/>
          <ellipse cx={p.x} cy={p.y+5} rx="76" ry="18" stroke={GOLD} strokeOpacity=".12" fill="none"/>
          <circle cx={p.x} cy={p.y} r={3.4} fill={done>.05?IVORY:GOLD} opacity={.3+done*.7}/>
          <ContactWater frame={frame} at={[0,66,132,198][i]} x={p.x} y={p.y} id="fear" strength={i===0?.3:1}/>
        </g>;
      })}
      <path d="M410 634Q545 396 770 588Q919 375 1125 610Q1280 354 1480 569" pathLength="1" stroke={JADE} strokeDasharray=".004 .009" strokeOpacity={.12+.13*p3} fill="none"/>
      <ellipse cx={x} cy={y} rx={90-leap*.42} ry="27" fill="url(#fear-jade)" />
      <circle cx={x} cy={y-leap-8} r={8+PULSE(frame,66,5)*5+PULSE(frame,132,5)*5} fill={JADE} filter="url(#fear-bloom)"/>
      <circle cx={x} cy={y-leap-8} r="4" fill={IVORY}/>
      <g style={labelStyle}>
        <text x="410" y="738" textAnchor="middle" opacity={1-smooth(ramp(frame,76,119))} fill={GOLD}>允许暂停</text>
        <text x="1305" y="737" textAnchor="middle" opacity={smooth(ramp(frame,145,189))} fill={JADE}>下一步，仍由自己</text>
      </g>
    </svg>
    <div style={{position:'absolute',left:x-430,top:y-324-leap,width:850,height:480,opacity:.78+.22*smooth(ramp(frame,10,40))}}>
      <Hero3D kind="shoes" frame={frame} width={850} height={480} reveal={1} rotation={-.7+orbit*1.05+p3*.22} scale={.88} warm={.18} energy={.25+PULSE(frame,66,7)*.7+PULSE(frame,132,7)*.7}/>
    </div>
  </>;
};
