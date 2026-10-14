import React from 'react';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { const p = clamp(v); return p * p * (3 - 2 * p); };
const serif = 'Noto Serif CJK SC';
const sans = 'Noto Sans CJK SC';

/** External words pass by a stationary inner point; no numerical/medical claim. */
export const Listen: React.FC<{t: number}> = ({t}) => {
  const arrival = smooth(t / 1.5);
  const settle = smooth((t - 4.9) / 2.7);
  const release = smooth((t - 7.6) / 1.4);
  const wave = (row: number, side: number) => {
    const points: string[] = [];
    for (let i = 0; i <= 64; i++) {
      const x = side === 0 ? 155 + i * 10.9 : 1067 + i * 10.9;
      const near = Math.exp(-Math.pow((x - 960) / 255, 2));
      const baseY = 535 + (row - 2) * (39 + (1 - settle) * 15);
      const sideStep = row < 2 ? -1 : row > 2 ? 1 : side === 0 ? -1 : 1;
      const ripple = Math.sin(x * .017 - t * 2.7 + row * 1.2) * (11 + row * 2) * (1 - settle) * (1 - near * .4);
      const y = baseY + ripple + near * sideStep * (96 - Math.abs(row - 2) * 22) * (1 - release * .55);
      points.push(`${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };
  return <g>
    <defs>
      <linearGradient id="v3g-listen-left"><stop stopColor="#ab573e" stopOpacity=".04"/><stop offset=".45" stopColor="#b79b6b" stopOpacity=".65"/><stop offset="1" stopColor="#d8bf83" stopOpacity=".03"/></linearGradient>
      <linearGradient id="v3g-listen-right"><stop stopColor="#d8bf83" stopOpacity=".03"/><stop offset=".55" stopColor="#b79b6b" stopOpacity=".58"/><stop offset="1" stopColor="#ab573e" stopOpacity=".03"/></linearGradient>
      <radialGradient id="v3g-listen-core"><stop stopColor="#d8bf83" stopOpacity=".09"/><stop offset="1" stopColor="#d8bf83" stopOpacity="0"/></radialGradient>
    </defs>
    <text x="960" y="246" fill="#d8bf83" fontFamily={serif} fontSize="79" textAnchor="middle" letterSpacing="3">莫听穿林打叶声</text>
    <g opacity={arrival}>
      {Array.from({length: 5}, (_, row) => <g key={row}>
        <path d={wave(row, 0)} stroke="url(#v3g-listen-left)" strokeWidth={row === 2 ? 2 : 1.2} fill="none"/>
        <path d={wave(row, 1)} stroke="url(#v3g-listen-right)" strokeWidth={row === 2 ? 2 : 1.2} fill="none"/>
      </g>)}
      {[
        {word: '指责', x: 335, y: 419, start: .3, direction: 1},
        {word: '闲言', x: 1510, y: 442, start: 1.1, direction: -1},
        {word: '风雨', x: 295, y: 668, start: 2, direction: 1},
        {word: '失意', x: 1545, y: 653, start: 2.6, direction: -1},
      ].map(({word, x, y, start, direction}) => {
        const travel = smooth((t - start) / 4.8);
        const opacity = smooth((t - start) / .7) * (1 - smooth((t - start - 2.7) / 1.8));
        return <text key={word} x={x + travel * direction * 310} y={y + Math.sin(t * .55 + start) * 7} fontFamily={sans} fontSize="35" fill="#aa9374" opacity={opacity * .9} textAnchor="middle">{word}</text>;
      })}
      <circle cx="960" cy="535" r="193" fill="url(#v3g-listen-core)"/>
      <circle cx="960" cy="535" r={103 - release * 12} fill="#0b0e10" stroke="#d8bf83" strokeWidth="1.8" opacity=".9"/>
      <path d="M960 416a119 119 0 0 1 119 119M960 654a119 119 0 0 1-119-119" fill="none" stroke="#887d66" strokeWidth=".7" opacity={.32 * (1 - release)} transform={`rotate(${t * 4} 960 535)`}/>
      <text x="960" y="557" textAnchor="middle" fontFamily={serif} fontSize="67" fill="#e9e4d6">心</text>
      <g opacity={settle}>
        <path d="M204 535H797M1123 535H1716" fill="none" stroke="#d8bf83" strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - settle}/>
        <circle cx={204 + settle * 593} cy="535" r="3.4" fill="#f2dfad"/>
        <circle cx={1716 - settle * 593} cy="535" r="3.4" fill="#f2dfad"/>
      </g>
    </g>
    <g opacity={smooth((t - 3) / 1)}>
      <text x="650" y="816" fill="#b9aa8b" textAnchor="middle" fontFamily={sans} fontSize="38" letterSpacing="3">听见</text>
      <path d="M760 802H1155" fill="none" stroke="#887d66" strokeWidth="1" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - smooth((t - 4) / 2)}/>
      <text x="1300" y="816" fill="#d8bf83" textAnchor="middle" fontFamily={serif} fontSize="48" letterSpacing="5" opacity={smooth((t - 5.4) / 1)}>不内耗</text>
    </g>
  </g>;
};
