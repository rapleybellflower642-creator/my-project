import React from 'react';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { const p = clamp(v); return p * p * (3 - 2 * p); };
const route = (p: number) => ({ x: 270 + 1370 * p, y: 580 + Math.sin(p * Math.PI * 1.65) * 63 });
const line = (points: {x: number; y: number}[]) => points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
const serif = 'Noto Serif CJK SC';
const sans = 'Noto Sans CJK SC';

/** A diagram of the preface, not a reconstruction of the number of companions. */
export const Rain: React.FC<{t: number}> = ({t}) => {
  const storm = smooth((t - 2.25) / 1.15);
  const late = smooth((t - 6.4) / 2.2);
  const progress = 0.11 + clamp(t / 10) * 0.64;
  const main = route(progress);
  const umbrellaP = Math.min(1.12, 0.53 + t * 0.18);
  const umbrella = route(umbrellaP);
  const fullRoute = line(Array.from({length: 70}, (_, i) => route(i / 69)));
  const traveled = line(Array.from({length: 60}, (_, i) => route((i / 59) * progress)));
  const companions = [0, 1, 2].map((i) => {
    const p = Math.min(0.93, progress + 0.055 + i * 0.041);
    const base = route(p);
    const escape = smooth((t - 2.65 - i * 0.11) / 2.45);
    return {x: base.x + escape * (80 + i * 42) + Math.sin(t * 5.3 + i * 2.1) * escape * 11,
      y: base.y + escape * [-125, 102, -194][i] + Math.sin(t * 7 + i * 1.7) * escape * 9};
  });
  return <g>
    <defs>
      <linearGradient id="v3g-rain-umbrella" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#f4e7ba"/><stop offset=".52" stopColor="#c5a866"/><stop offset="1" stopColor="#65543b"/>
      </linearGradient>
      <radialGradient id="v3g-rain-dot"><stop stopColor="#fff8da"/><stop offset=".4" stopColor="#dcc38a"/><stop offset="1" stopColor="#786440"/></radialGradient>
    </defs>
    <text x="960" y="248" fill="#d8bf83" fontFamily={serif} fontSize="80" textAnchor="middle" letterSpacing="9">沙湖道中</text>
    <text x="960" y="303" fill="#887d66" fontFamily={sans} fontSize="30" textAnchor="middle" letterSpacing="5">元丰五年 · 三月七日</text>
    <g transform={`translate(${late * -28} ${late * -14}) translate(960 560) scale(${1 + late * .045}) translate(-960 -560)`}>
      <path d={fullRoute} fill="none" stroke="#887d66" strokeWidth="1.5" opacity=".4"/>
      <path d={traveled} fill="none" stroke="#d8bf83" strokeWidth="3" opacity=".9"/>
      <path d={fullRoute} fill="none" stroke="#d8bf83" strokeWidth=".6" transform="translate(0 9)" opacity=".22"/>
      {Array.from({length: 50}, (_, i) => {
        const phase = ((t * (270 + i % 5 * 17) + i * 109) % 410) / 410;
        const x = 180 + (i * 157 % 1580) + phase * 85;
        const y = 345 + phase * 430;
        return <path key={`rain-${i}`} d={`M${x} ${y}l15 38`} fill="none" stroke={i % 4 === 0 ? '#d8bf83' : '#6b8e96'} strokeWidth={i % 4 === 0 ? 1.4 : 1} opacity={storm * (.1 + (i % 5) * .025)}/>;
      })}
      {Array.from({length: 6}, (_, i) => {
        const phase = (t * .77 + i * .29) % 1;
        return <ellipse key={`ripple-${i}`} cx={340 + i * 239} cy={728 + i % 2 * 28} rx={5 + phase * 47} ry={1 + phase * 9} fill="none" stroke="#6b8e96" strokeWidth="1" opacity={storm * (1 - phase) * .29}/>;
      })}
      {companions.map((p, i) => {
        const begin = route(Math.max(0, progress - .09 + i * .04));
        const mid = route(progress + .05 + i * .04);
        return <g key={`companion-${i}`}>
          <path d={`M${begin.x} ${begin.y}Q${mid.x - 35} ${mid.y} ${mid.x + 15} ${mid.y - 20 * storm}T${p.x - 50} ${p.y + 20 * (i % 2 ? -1 : 1)}L${p.x} ${p.y}`} fill="none" stroke="#ab573e" strokeWidth="1.6" opacity={storm * .64}/>
          <circle cx={p.x} cy={p.y} r="7.5" fill="#b79878"/><circle cx={p.x - 1.7} cy={p.y - 2} r="2.1" fill="#e9e4d6" opacity=".65"/>
        </g>;
      })}
      <text x={companions[2].x + 23} y={companions[2].y - 20} fontFamily={sans} fontSize="30" fill="#b5997a">同行</text>
      <g opacity={1 - smooth((t - 1.5) / 1.1)} transform={`translate(${umbrella.x} ${umbrella.y - 75}) rotate(-12)`}>
        <ellipse cx="0" cy="85" rx="60" ry="8" fill="#000" opacity=".32"/>
        <path d="M-72 0Q-58-56 0-65Q58-56 72 0Q48-15 25 0Q0-17-25 0Q-49-15-72 0Z" fill="url(#v3g-rain-umbrella)" stroke="#dec995" strokeWidth="1.7"/>
        <path d="M0-65Q-30-41-25 0M0-65Q29-41 25 0M0-65V4" fill="none" stroke="#7e6b46" strokeWidth="1.5"/>
        <path d="M0-70V-65M0 0V72Q0 91 16 86Q26 83 24 72" fill="none" stroke="#b9a471" strokeWidth="4" strokeLinecap="round"/>
        <text x="0" y="-96" textAnchor="middle" fill="#bba980" fontFamily={sans} fontSize="30">雨具先去</text>
      </g>
      <circle cx={main.x} cy={main.y} r="21" fill="#d8bf83" opacity=".05"/>
      <circle cx={main.x} cy={main.y} r="13" fill="url(#v3g-rain-dot)"/>
      <circle cx={main.x - 3} cy={main.y - 4} r="3.4" fill="#fff8dc"/>
      <path d={`M${main.x} ${main.y + 24}v22`} fill="none" stroke="#bda774" strokeWidth="1" opacity=".6"/>
      <text x={main.x} y={main.y + 83} textAnchor="middle" fill="#e3c991" fontFamily={sans} fontSize="33">苏轼</text>
      <g opacity={storm * .45} stroke="#887d66" strokeWidth="1.3" fill="none">
        <path d={`M180 384Q260 ${396 + Math.sin(t * 2.2) * 11} 316 350M230 384Q250 352 278 350Q271 379 230 384M286 367Q304 391 331 387Q325 365 286 367`}/>
        <path d={`M1740 398Q1650 ${378 + Math.sin(t * 2.4) * 9} 1606 351M1698 384Q1688 352 1662 349Q1664 374 1698 384M1649 365Q1624 387 1602 377Q1618 360 1649 365`}/>
      </g>
    </g>
    {['雨具先去', '同行皆狼狈', '余独不觉'].map((s, i) => <g key={s} opacity={.3 + .7 * smooth((t - [0, 2.8, 6.1][i]) / .8)}>
      <text x={[440, 960, 1480][i]} y="849" fill={i === 1 ? '#b3866f' : '#d8bf83'} fontFamily={serif} fontSize="38" textAnchor="middle" letterSpacing="4">{s}</text>
    </g>)}
  </g>;
};
