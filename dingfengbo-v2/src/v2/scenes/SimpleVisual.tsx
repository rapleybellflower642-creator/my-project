import React from 'react';
import {Hero3D} from '../Hero3D';
import {GOLD, JADE, IVORY, MiddleDefs, ContactWater, HairlinePath, ramp, smooth, mix, svgStyle, labelStyle, VisualProps} from './middle-helpers';

const Horse = ({progress, opacity}: {progress: number; opacity: number}) => <g transform="translate(1250 410) scale(1.08)" opacity={opacity} stroke={GOLD} fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M-183 47 C-166 13 -149 -21 -110 -29 C-66 -37 -2 -13 34 -43 C55 -76 49 -122 80 -150 L112 -173 L127 -163 L155 -138 L170 -105 L157 -89 L133 -95 L118 -117 L102 -98 L94 -42 L109 10 L148 30 L174 82 L156 88 L127 47 L83 42 L60 66 L32 147 L9 151 L34 64 L-23 53 L-65 79 L-105 159 L-130 159 L-112 96 L-121 55 L-157 94 L-181 148 L-202 149 L-187 74 Z" pathLength="1" strokeDasharray="1" strokeDashoffset={1-progress} />
  <path d="M-166 -10 C-224 -58 -244 4 -248 46 M-163 0 C-218 -40 -227 22 -231 59 M80 -143 L68 -179 L93 -158 M118 -170 L119 -188 L130 -166 M44 -43 Q62 -63 71 -121 M-120 55 Q-63 62 -26 48 M37 -21 Q58 -4 68 38" strokeOpacity=".4"/>
  <circle cx="125" cy="-134" r="2" fill={IVORY}/>
  <path d="M95 -102 L144 -84 M92 -96 L130 -75 M-186 161H177" strokeOpacity=".24" />
</g>;

export const SimpleVisual = ({frame}: VisualProps) => {
  const focus = smooth(ramp(frame, 80, 177));
  const comparison = 1 - smooth(ramp(frame, 103, 182));
  const shift = mix(55, 430, focus);
  return <>
    <svg style={svgStyle} viewBox="0 0 1920 1080">
      <MiddleDefs id="simple"/>
      <ellipse cx={mix(610, 960, focus)} cy="695" rx={mix(330, 470, focus)} ry="91" fill="url(#simple-light)" opacity=".62"/>
      <path d="M245 697H1675" stroke={GOLD} strokeOpacity=".13"/>
      <path d="M1030 281V680" stroke={GOLD} strokeOpacity={comparison*.17} strokeDasharray="2 9"/>
      <Horse progress={smooth(ramp(frame, 8, 68))} opacity={comparison*.88}/>
      <g opacity={comparison * smooth(ramp(frame, 30, 64))}>
        <text x="1410" y="684" textAnchor="middle" style={labelStyle}>别人的速度</text>
        <path d="M1352 257H1452 M1402 257V285" fill="none" stroke={GOLD} strokeOpacity=".45"/>
        <text x="1267" y="265" textAnchor="end" style={{...labelStyle,fontSize:25,opacity:.62}}>更快</text>
        <text x="1512" y="265" style={{...labelStyle,fontSize:25,opacity:.62}}>更远</text>
      </g>
      <HairlinePath d="M280 720 C610 730 655 718 960 720 C1160 723 1430 714 1670 698" progress={smooth(ramp(frame, 106, 246))} color={JADE} width={2.1} opacity={focus*.8}/>
      <g opacity={smooth(ramp(frame, 142, 180))}>
        <circle cx={mix(430,1640,smooth(ramp(frame,149,258)))} cy="719" r="4" fill={IVORY}/>
        <text x="960" y="786" textAnchor="middle" style={{...labelStyle,fill:JADE,fontSize:31}}>自己的步调</text>
        <path d="M740 776H811 M1109 776H1180" stroke={GOLD} strokeOpacity=".45" />
      </g>
      <ContactWater frame={frame} at={132} x={870} y={714} id="simple" strength={.75}/>
      <ContactWater frame={frame} at={198} x={1100} y={714} id="simple" strength={.52}/>
    </svg>
    <div style={{position:'absolute',left:shift,top:171,width:1040,height:590}}>
      <Hero3D kind="gear" width={1040} height={590} frame={frame} reveal={smooth(ramp(frame,0,32))} rotation={-.35+focus*.63} scale={mix(.95,1.13,focus)} warm={.22+focus*.22} energy={.2}/>
    </div>
  </>;
};
