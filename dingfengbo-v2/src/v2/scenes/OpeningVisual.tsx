import React from 'react';
import {SVG, Defs, gold, ivory, jade, clamp, smooth, rnd, Ripples, Splash, VisualProps} from './early-helpers';

// The primary droplet makes contact at local frame 13 (0.433 s).
export const OpeningVisual: React.FC<VisualProps> = ({frame}) => {
  const contact = 13;
  const settle = smooth((frame - 85) / 65);
  const zoom = 1.19 - .19 * smooth((frame - 22) / 77);
  const dropY = 280 + 300 * (clamp(frame / contact) ** 2);
  const dropOpacity = 1 - smooth((frame - 12) / 4);
  const bend = frame < contact ? 0 : Math.exp(-(frame - contact) / 43) * 87;
  const movingX = 355 + 1160 * smooth((frame - 27) / 167);
  const path = Array.from({length: 121}, (_, i) => {
    const x = 230 + i * 12.15;
    const dist = (x - 960) / 240;
    const y = 622 + Math.exp(-dist * dist) * bend * Math.cos((frame - 13) * .14 - Math.sqrt(dist * dist + .045) * 1.7);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
  return <SVG>
    <Defs id="opening"/>
    <g transform={`translate(960 545) scale(${zoom}) translate(-960 -545)`}>
      <ellipse cx="960" cy="609" rx="600" ry="180" fill="url(#opening-light)"/>
      <ellipse cx="960" cy="628" rx="495" ry="51" stroke={gold} strokeWidth="1" fill="none" opacity=".1"/>
      <path d={path} fill="none" stroke={gold} strokeWidth="2.4" opacity=".85"/>
      <path d={path} fill="none" stroke={gold} strokeWidth="9" opacity=".055"/>
      <g opacity={dropOpacity} transform={`translate(960 ${dropY})`}>
        <path d="M0 -112 C-15 -82 -49 -36 -50 -3 C-52 30 -31 51 0 52 C33 52 51 31 50 -3 C50 -35 16 -82 0 -112Z" fill="url(#opening-water)" stroke="#CEE0CD" strokeWidth="1.5"/>
        <path d="M-17 -52 C-39 -19 -43 7 -23 28" fill="none" stroke="#F8F5DA" strokeWidth="4" strokeLinecap="round" opacity=".75"/>
        <path d="M20 -22 Q43 16 12 37" fill="none" stroke={gold} strokeWidth="3" opacity=".56"/>
        <ellipse cx="-12" cy="22" rx="14" ry="4" fill="#D4DAB8" opacity=".36"/>
      </g>
      <Ripples frame={frame} at={contact} x={960} y={622} id="opening-impact" strength={1.6}/>
      <Splash frame={frame} at={contact} x={960} y={620} power={1.25}/>
      <g opacity={Math.exp(-Math.max(0, frame - 13) / 7) * (frame >= 13 ? 1 : 0)}><ellipse cx="960" cy="620" rx="240" ry="65" fill="url(#opening-light)"/><ellipse cx="960" cy="620" rx="65" ry="8" fill={ivory}/></g>
      {Array.from({length: 23}, (_, i) => {
        const x = 250 + i * 64;
        const dy = Math.sin(frame * .1 + i * .9) * (1 - settle) * 32;
        return <g key={i} opacity={smooth((frame - 35 - i * 1.7) / 20) * .65}><circle cx={x} cy={622 + dy} r={i % 4 === 0 ? 3.5 : 1.8} fill={i < 12 ? gold : jade}/><path d={`M${x} ${628 + dy} V${635 + dy}`} stroke={gold} opacity=".3"/></g>;
      })}
      <g opacity={smooth((frame - 33) / 24)}>
        <circle cx={movingX} cy={622} r="32" fill="url(#opening-jade)"/>
        <circle cx={movingX} cy={622} r="5" fill={ivory}/>
        <path d={`M${movingX - 82} 622 H${movingX}`} stroke={jade} strokeWidth="3" opacity=".8"/>
      </g>
      {Array.from({length: 24}, (_, i) => {
        const phase = (frame * (1.2 + rnd(i) * .5) + i * 24) % 650;
        return <path key={i} d={`M${360 + rnd(i + 19) * 1200 - phase * .23} ${190 + phase} l-5 19`} stroke={ivory} strokeWidth=".8" opacity={.11 * (1 - smooth((frame - 132) / 65))}/>;
      })}
      <g opacity={smooth((frame - 158) / 36) * .6}>
        <ellipse cx="960" cy="530" rx={135 + smooth((frame - 158) / 45) * 80} ry={42 + smooth((frame - 158) / 45) * 140} fill="none" stroke={gold} strokeWidth="1"/>
      </g>
    </g>
  </SVG>;
};
