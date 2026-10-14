import React from 'react';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { const p = clamp(v); return p * p * (3 - 2 * p); };
const out = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const serif = 'Noto Serif CJK SC';
const sans = 'Noto Sans CJK SC';
const road = (p: number) => ({x: 270 + p * 1360, y: 734 - p * 210 + Math.sin(p * Math.PI * 2) * 57});
const pathTo = (p: number) => Array.from({length: 90}, (_, i) => {
  const at = road(p * i / 89); return `${i ? 'L' : 'M'}${at.x.toFixed(2)},${at.y.toFixed(2)}`;
}).join(' ');

export const Walk: React.FC<{t: number}> = ({t}) => {
  const progress = smooth((t - .55) / 8.1);
  const pushing = smooth((t - 6.8) / 3.2);
  const gold = road(progress);
  const chaos = 'M270 514C350 413 463 608 516 493S355 411 411 567S646 548 541 451S474 646 659 551L727 526';
  return <g>
    <defs>
      <linearGradient id="v3g-walk-gold" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#7d6945"/><stop offset=".65" stopColor="#d8bf83"/><stop offset="1" stopColor="#f6e8bc"/></linearGradient>
    </defs>
    <text x="960" y="246" fill="#d8bf83" fontFamily={serif} fontSize="79" textAnchor="middle" letterSpacing="3">何妨吟啸且徐行</text>
    <g transform={`translate(${pushing * -34} ${pushing * -8}) translate(960 580) scale(${1 + pushing * .055}) translate(-960 -580)`}>
      <g opacity={(1 - smooth((t - 2.3) / 2.8)) * .7}>
        <path d={chaos} fill="none" stroke="#ab573e" strokeWidth="1.7" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - smooth(t / 1.8)}/>
        <path d={chaos} fill="none" stroke="#ab573e" strokeWidth=".65" opacity=".3" transform="translate(0 8)"/>
        <text x="445" y="387" fill="#ab7863" fontFamily={sans} fontSize="32" textAnchor="middle">慌乱</text>
      </g>
      <path d={pathTo(1)} fill="none" stroke="#887d66" strokeWidth="1.2" opacity=".3"/>
      <path d={pathTo(progress)} fill="none" stroke="url(#v3g-walk-gold)" strokeWidth="2.5"/>
      <path d={pathTo(progress)} fill="none" stroke="#d8bf83" strokeWidth=".8" transform="translate(0 6)" opacity=".23"/>
      {Array.from({length: 12}, (_, i) => {
        const position = .045 + i * .076;
        const point = road(position);
        const before = road(position - .005), after = road(position + .005);
        const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
        const local = t - (.8 + i * .53);
        const appear = out(local / .25);
        const alternate = i % 2 ? 17 : -17;
        const scale = 1.16 - .16 * out(local / .35);
        return <g key={i} transform={`translate(${point.x} ${point.y}) rotate(${angle}) translate(0 ${alternate}) scale(${scale})`} opacity={appear * (.42 + .4 * (1 - smooth((t - 7.2) / 2.2)))}>
          <path d="M-11-3C-7-7 9-7 14-3C20 1 14 6 6 6L-5 5Q-14 5-11-3Z" fill="#d8bf83"/>
          <path d="M-10-2Q-2-4 7-3" fill="none" stroke="#fff1c4" strokeWidth=".8" opacity=".6"/>
        </g>;
      })}
      <circle cx={gold.x} cy={gold.y} r="5.5" fill="#f6e8bc" opacity={smooth(t / .5)}/>
      <circle cx={gold.x} cy={gold.y} r="12" fill="none" stroke="#d8bf83" strokeWidth=".7" opacity={.32 * smooth(t / .5)}/>
      <g transform="translate(1278 723)">
        {['何', '妨'].map((char, i) => {
          const enter = out((t - 3.5 - i * .28) / .8);
          return <text key={char} x={i * 106 - 60} y={(1 - enter) * 24} fill="#d8bf83" fontFamily={serif} fontSize="104" textAnchor="middle" opacity={enter}>{char}</text>;
        })}
        <text x="-6" y="65" fill="#a4987b" fontFamily={sans} fontSize="31" textAnchor="middle" letterSpacing="3" opacity={smooth((t - 5) / 1)}>有何不可</text>
      </g>
      <g opacity={smooth((t - 6) / 1.4)}>
        <path d="M420 811H610" stroke="#887d66" strokeWidth=".8"/>
        <text x="715" y="823" fontFamily={serif} fontSize="37" fill="#d8bf83" textAnchor="middle" letterSpacing="4">且徐行</text>
      </g>
    </g>
  </g>;
};
