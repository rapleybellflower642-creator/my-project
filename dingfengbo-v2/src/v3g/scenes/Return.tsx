import React from 'react';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const x = clamp(n); return x * x * (3 - 2 * x); };
const phase = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

/**
 * 100–111s. Pull back 0–3.4s; past nodes dim at 4.8/5.5/6.2s;
 * current point advances 4.5–8.8s; both arcs settle onto y=650 at 8–10.5s.
 */
export const Return: React.FC<{t: number}> = ({t}) => {
  const look = phase(t, 0, 3.4);
  const onward = phase(t, 4.5, 8.8);
  const release = phase(t, 6.3, 9.4);
  const merge = phase(t, 8, 10.5);
  const title = phase(t, .15, 1.05) * (1 - phase(t, 4.2, 5.1));
  const leaveWord = phase(t, 5, 6) * (1 - phase(t, 9.2, 10.5));
  const pointX = 1260 + onward * 355;
  const pointY = 650 - Math.sin(onward * Math.PI) * 28;
  const scale = 1.16 - look * .16;
  const nodes = [
    {x: 409, y: 515, text: '入狱', at: .25, dim: 4.8, labelY: 456},
    {x: 719, y: 686, text: '贬谪', at: 1.0, dim: 5.5, labelY: 770},
    {x: 1030, y: 513, text: '烟雨', at: 1.75, dim: 6.2, labelY: 454},
  ];
  const past = 'M249 582 C320 575 339 515 409 515 C531 515 544 686 719 686 C863 686 876 513 1030 513 C1152 513 1123 650 1260 650';
  return <g>
    <defs>
      <linearGradient id="v3g-return-past" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#887d66" stopOpacity=".14"/>
        <stop offset=".26" stopColor="#bca474" stopOpacity=".68"/>
        <stop offset=".72" stopColor="#ceb783"/>
        <stop offset="1" stopColor="#e3ca8e"/>
      </linearGradient>
      <linearGradient id="v3g-return-forward" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#d8bf83" stopOpacity=".22"/>
        <stop offset=".7" stopColor="#e6cd94" stopOpacity=".85"/>
        <stop offset="1" stopColor="#e6cd94" stopOpacity=".05"/>
      </linearGradient>
      <radialGradient id="v3g-return-light">
        <stop stopColor="#ffedbc" stopOpacity=".75"/>
        <stop offset=".13" stopColor="#e3c37f" stopOpacity=".27"/>
        <stop offset="1" stopColor="#d4ad60" stopOpacity="0"/>
      </radialGradient>
    </defs>

    <text x="960" y="270" textAnchor="middle" fontSize="76" fill="#d8bf83" letterSpacing="4"
      opacity={title} transform={`translate(0 ${9 * (1 - title)})`}>回首向来萧瑟处</text>
    <text x="960" y="326" textAnchor="middle" fontSize="96" fill="#e9e4d6" letterSpacing={18 - leaveWord * 9}
      opacity={leaveWord}>归去</text>

    <g transform={`translate(${960 - 960 * scale - (1 - look) * 65} ${600 - 600 * scale}) scale(${scale})`}>
      <g opacity={1 - release * .94}>
        <path d={past} fill="none" stroke="url(#v3g-return-past)" strokeWidth="1.8"/>
        <path d={past} fill="none" stroke="#e2c994" strokeWidth="8" opacity=".025"/>
        {nodes.map((n, i) => {
          const opacity = phase(t, n.at, n.at + .9) * (1 - phase(t, n.dim, n.dim + 1.2) * .93);
          return <g key={n.text} opacity={opacity}>
            <circle cx={n.x} cy={n.y} r="10" fill="#080b0d" stroke="#a99872" strokeWidth="1"/>
            <circle cx={n.x} cy={n.y} r="3" fill="#d8bf83"/>
            <path d={`M${n.x} ${n.y + (i === 1 ? 20 : -20)} V${n.labelY + (i === 1 ? -43 : 20)}`}
              fill="none" stroke="#887d66" strokeWidth="1" opacity=".48"/>
            <text x={n.x} y={n.labelY} textAnchor="middle" fontSize="38" letterSpacing="4" fill="#c7b899">{n.text}</text>
          </g>;
        })}
      </g>
      <path d="M1260 650 C1390 610 1460 648 1740 650" fill="none"
        stroke="url(#v3g-return-forward)" strokeWidth="1.6" opacity={1 - merge * .6}/>
      <g opacity={phase(t, 6.7, 7.65)} fill="none" strokeWidth="1.5">
        <path d={`M340 650 C650 ${650 - 110 * (1 - merge)} 1100 ${650 - 110 * (1 - merge)} 1580 650`}
          stroke="#d8bf83" opacity={.8 - merge * .25}/>
        <path d={`M340 650 C650 ${650 + 110 * (1 - merge)} 1100 ${650 + 110 * (1 - merge)} 1580 650`}
          stroke="#789399" opacity={.27 * (1 - merge)}/>
      </g>
      <circle cx={pointX} cy={pointY} r="47" fill="url(#v3g-return-light)"/>
      <circle cx={pointX} cy={pointY} r="4.7" fill="#f6e6b5"/>
      <circle cx={pointX} cy={pointY} r="9.6" fill="none" stroke="#d8bf83" strokeWidth=".8" opacity=".48"/>
    </g>
    <text x="960" y="853" textAnchor="middle" fill="#b3a88f" fontSize="34" letterSpacing="2"
      opacity={phase(t, 6.1, 7.2) * (1 - phase(t, 9.3, 10.6))}>走过的风雨，留在来路。</text>
  </g>;
};
