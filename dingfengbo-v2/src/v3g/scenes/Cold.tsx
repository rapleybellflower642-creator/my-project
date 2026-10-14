import React from 'react';
import {staticFile} from 'remotion';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const x = clamp(n); return x * x * (3 - 2 * x); };
const phase = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

/**
 * 82–90s. Local events: wind 1.15s, steam bends 1.6s, warmth recedes
 * 2.0s, 微冷 settles 2.9–3.8s. No jitter: only one continuous change.
 * The 720px 3D cup has alpha bounds (170,166)–(550,466).
 * At scale 25/19 its visible bounds are (1070,395)–(1570,789.74).
 */
export const Cold: React.FC<{t: number}> = ({t}) => {
  const wind = phase(t, 1.15, 3.9);
  const chill = phase(t, 2, 5.2);
  const word = phase(t, 2.9, 3.8);
  const title = phase(t, 0.15, 0.9);
  const cupX = 1320;
  const cupScale = 25 / 19;
  const cupImageX = 1070 - 170 * cupScale;
  const cupImageY = 395 - 166 * cupScale;
  const steam = Array.from({length: 6}, (_, i) => {
    const baseX = 1195 + i * 43;
    const sway = Math.sin(t * 0.78 + i * 1.65) * 8;
    const drift = wind * (145 + i * 10);
    return {
      d: `M ${baseX} 599 C ${baseX - 22 + sway} 548 ${baseX + 27 + drift * .22} 510 ${baseX + drift * .35} 470 S ${baseX - 26 + drift * .75} 399 ${baseX + drift} ${350 + i * 7}`,
      opacity: (.14 + (i % 2) * .06) * (1 - chill * .62),
    };
  });
  return <g>
    <defs>
      <radialGradient id="v3g-cold-ambient">
        <stop offset="0" stopColor="#b48c42" stopOpacity=".17"/>
        <stop offset=".48" stopColor="#745d30" stopOpacity=".055"/>
        <stop offset="1" stopColor="#745d30" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="v3g-cold-chill">
        <stop offset="0" stopColor="#71949c" stopOpacity=".095"/>
        <stop offset="1" stopColor="#71949c" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="v3g-cold-wind">
        <stop stopColor="#6b8e96" stopOpacity="0"/>
        <stop offset=".35" stopColor="#6b8e96" stopOpacity=".14"/>
        <stop offset=".7" stopColor="#9eb6b6" stopOpacity=".5"/>
        <stop offset="1" stopColor="#6b8e96" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <ellipse cx="1320" cy="580" rx="550" ry="350" fill="url(#v3g-cold-ambient)" opacity={1 - chill * .65}/>
    <ellipse cx="1320" cy="560" rx="560" ry="340" fill="url(#v3g-cold-chill)" opacity={chill}/>

    <g opacity={title} transform={`translate(0 ${10 * (1 - title)})`}>
      <text x="250" y="322" fill="#d8bf83" fontSize="58" letterSpacing="3">料峭春风吹酒醒</text>
      <path d="M250 353 H730" stroke="#887d66" strokeOpacity=".35" strokeWidth="1"/>
    </g>
    <text x="246" y="515" fill="#e9e4d6" fontSize="112" letterSpacing={18 - word * 12}
      opacity={word} transform={`translate(${word * 4} ${9 * (1 - word)})`}>微冷</text>
    <g opacity={word * .58}>
      <path d="M254 569 H308" stroke="#d8bf83" strokeWidth="1.4"/>
    </g>

    <ellipse cx={cupX} cy="790" rx="226" ry="17" fill="#000" opacity=".62"/>
    <ellipse cx={cupX} cy="791" rx="127" ry="2.5" fill="#bca374" opacity={.15 - chill * .07}/>
    <image href={staticFile('v3g/assets/cup/000.png')} x={cupImageX} y={cupImageY}
      width={720 * cupScale} height={720 * cupScale}/>

    {/* The steam deforms before fading: the cold air visibly acts upon it. */}
    <g fill="none" stroke="#d8bf83" strokeLinecap="round">
      {steam.map((s, i) => <path key={i} d={s.d} strokeWidth={1.5 + (i % 2) * .4} opacity={s.opacity}/>)}
    </g>
    <g fill="none" stroke="url(#v3g-cold-wind)" strokeWidth="1.25" opacity={wind * .8}>
      {[0, 1, 2].map(i => <path key={i}
        d={`M ${740 + i * 38} ${456 + i * 38} C 1010 ${432 + i * 39} 1220 ${489 + i * 18} 1530 ${424 + i * 29} S 1750 ${439 + i * 23} 1790 ${414 + i * 29}`}
        pathLength="1" strokeDasharray={`${.58 + wind * .42} 1`} strokeDashoffset={-(t * .028 + i * .07) % .15}/>) }
    </g>

    <path d="M1030 821 Q1320 832 1608 821" stroke="#887d66" strokeOpacity=".15" fill="none"/>
  </g>;
};
