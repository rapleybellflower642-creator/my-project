import React from 'react';
import {SVG, Defs, gold, ivory, smooth, rnd, VisualProps, Label} from './early-helpers';

export const HistoryVisual: React.FC<VisualProps> = ({frame}) => {
  const arrival = smooth(frame / 39);
  const paper = smooth((frame - 18) / 45);
  const path = smooth((frame - 58) / 83);
  const rotation = -9 + smooth(frame / 130) * 4;
  return <SVG>
    <Defs id="history"/>
    <ellipse cx="1030" cy="525" rx="680" ry="320" fill="url(#history-light)"/>
    <g opacity={arrival}>
      <ellipse cx="975" cy="496" rx={330 + (1 - arrival) * 170} ry={272 + (1 - arrival) * 110} fill="none" stroke={gold} strokeWidth="1.7" opacity=".52"/>
      <ellipse cx="975" cy="496" rx="338" ry="280" fill="none" stroke={gold} strokeWidth=".65" opacity=".25"/>
      <path d="M265 632 C445 632 513 560 675 570 S1025 703 1260 595 S1500 440 1655 451" pathLength="1" stroke="url(#history-gold)" strokeWidth="2" fill="none" strokeDasharray="1" strokeDashoffset={1 - path}/>
      <path d="M265 639 C445 639 513 567 675 577 S1025 710 1260 602 S1500 447 1655 458" pathLength="1" stroke={gold} strokeWidth=".8" fill="none" opacity=".18" strokeDasharray="1" strokeDashoffset={1 - path}/>
    </g>
    <g transform={`translate(985 485) rotate(${rotation}) scale(${.7 + paper * .3}) translate(-985 -485)`} opacity={paper} filter="url(#history-shadow)">
      <path d="M785 215 Q983 202 1188 219 L1200 747 Q992 758 780 742 Q792 480 785 215Z" fill="url(#history-paper)" stroke="#E3D2A8" strokeWidth="1.3"/>
      <path d="M794 221 Q801 477 789 735 M1180 225 Q1178 478 1191 739" stroke="#6B5633" strokeWidth="2" opacity=".3" fill="none"/>
      {Array.from({length: 110}, (_, i) => <path key={i} d={`M${798 + rnd(i) * 390} ${224 + i * 4.65} l${4 + rnd(i + 120) * 35} ${rnd(i + 55) * 3 - 1.5}`} stroke={i % 3 ? '#5B472A' : '#FFF3CD'} strokeWidth=".7" opacity=".1"/>)}
      {[858, 927, 996, 1065, 1134].map((x) => <line key={x} x1={x} y1="260" x2={x} y2="696" stroke="#86714B" opacity=".16"/>)}
      <text x="1125" y="283" writingMode="vertical-rl" fontFamily="DFBSerif, serif" fill="#463C27" fontSize="31" letterSpacing="6">三月七日沙湖道中遇雨</text>
      <text x="1045" y="283" writingMode="vertical-rl" fontFamily="DFBSerif, serif" fill="#55462F" fontSize="30" letterSpacing="7" opacity={.65 + smooth((frame - 30) / 55) * .35}>雨具先去同行皆狼狈</text>
      <text x="964" y="283" writingMode="vertical-rl" fontFamily="DFBSerif, serif" fill="#55462F" fontSize="30" letterSpacing="7" opacity={smooth((frame - 43) / 50)}>余独不觉已而遂晴</text>
      <text x="883" y="283" writingMode="vertical-rl" fontFamily="DFBSerif, serif" fill="#55462F" fontSize="30" letterSpacing="7" opacity={smooth((frame - 61) / 50)}>故作此词</text>
      <g transform="translate(864 646) rotate(-3)" opacity={smooth((frame - 93) / 16)}><rect width="53" height="58" fill="#9F4935" rx="2"/><rect x="5" y="5" width="43" height="48" fill="none" stroke="#DBC099" strokeWidth="1.1"/><text x="26.5" y="40" textAnchor="middle" fontFamily="DFBSerif, serif" fontSize="29" fill="#E6CF9C">轼</text></g>
      <path d="M797 217 Q985 208 1186 220" stroke={ivory} strokeWidth="2.2" opacity=".7"/>
    </g>
    <g opacity={smooth((frame - 60) / 25)}>
      <circle cx="405" cy="621" r="8" fill={gold}/><circle cx="405" cy="621" r="18" stroke={gold} fill="none" opacity=".55"/>
      <path d="M405 588 V505 H550" stroke={gold} fill="none" strokeWidth="1" opacity=".7"/>
      <Label x={425} y={486} text="黄州" anchor="start"/>
      <text x="401" y="441" fill={ivory} fontFamily="DFBSerif, serif" fontSize="75" letterSpacing="5">1082</text>
    </g>
    <g opacity={smooth((frame - 110) / 30)}>
      <circle cx="1543" cy="467" r="7" fill={gold}/><circle cx="1543" cy="467" r="17" stroke={gold} fill="none" opacity=".5"/>
      <path d="M1543 491 V573 H1362" stroke={gold} strokeWidth="1" opacity=".7" fill="none"/>
      <Label x={1522} y={620} text="沙湖道中" anchor="end"/>
      <g opacity=".45">{Array.from({length: 8}, (_, i) => <path key={i} d={`M${1455 + i * 22} 375 l-13 37`} stroke={ivory} strokeWidth="1.4"/>)}</g>
    </g>
  </SVG>;
};
