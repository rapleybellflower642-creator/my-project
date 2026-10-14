import React from 'react';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const x = clamp(n); return x * x * (3 - 2 * x); };
const phase = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

/** 90–100s. Ridge draws 0–1.7, sun crosses ridge at 3.0, light arrives at 4.1/4.8/5.5s. */
export const Sun: React.FC<{t: number}> = ({t}) => {
  const reveal = phase(t, .1, 1.7);
  const rise = phase(t, 1.2, 6.8);
  const warmth = phase(t, 3, 7.3);
  const title = phase(t, 2.7, 3.65);
  const sunX = 878 + rise * 306;
  const sunY = 604 - rise * 238;
  const rays = Array.from({length: 9}, (_, i) => ({
    x: 380 + i * 149,
    y: 754 + Math.sin(i * .65) * 39,
    strength: phase(t, 3.45 + i * .11, 5.2 + i * .13),
  }));
  const ridge = 'M226 683 C350 674 427 638 530 592 C602 560 671 548 741 527 C828 502 875 489 930 505 C998 522 1038 565 1126 577 C1213 590 1274 551 1366 573 C1462 596 1551 643 1700 662';
  return <g>
    <defs>
      <linearGradient id="v3g-sun-ridge" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#6b8e96" stopOpacity=".1"/>
        <stop offset=".28" stopColor="#a9a184"/>
        <stop offset=".54" stopColor="#e8cd8e"/>
        <stop offset=".8" stopColor="#aa8c4f"/>
        <stop offset="1" stopColor="#aa8c4f" stopOpacity=".1"/>
      </linearGradient>
      <radialGradient id="v3g-sun-halo">
        <stop stopColor="#f9dfa1" stopOpacity=".72"/>
        <stop offset=".08" stopColor="#e3c37d" stopOpacity=".38"/>
        <stop offset=".3" stopColor="#bf8e39" stopOpacity=".13"/>
        <stop offset="1" stopColor="#a2722d" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="v3g-sun-ground">
        <stop stopColor="#cfa95b" stopOpacity=".22"/>
        <stop offset=".35" stopColor="#bb923f" stopOpacity=".075"/>
        <stop offset="1" stopColor="#bb923f" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="v3g-sun-ray" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#efd49a" stopOpacity=".52"/>
        <stop offset=".32" stopColor="#d8bf83" stopOpacity=".18"/>
        <stop offset="1" stopColor="#d8bf83" stopOpacity=".015"/>
      </linearGradient>
      <clipPath id="v3g-sun-sky">
        <path d={`${ridge} L1800 160 H120 V683 Z`}/>
      </clipPath>
    </defs>

    <g clipPath="url(#v3g-sun-sky)">
      <ellipse cx={sunX} cy={sunY} rx={260 + warmth * 80} ry={214 + warmth * 65} fill="url(#v3g-sun-halo)" opacity={.5 + warmth * .5}/>
      <circle cx={sunX} cy={sunY} r="6.5" fill="#f7e9bf"/>
      <circle cx={sunX} cy={sunY} r="11" stroke="#e6c786" fill="none" strokeWidth=".8" opacity=".46"/>
    </g>

    {/* The actual ridge occludes the source, then light reaches successive foreground curves. */}
    <path d={ridge} fill="none" stroke="url(#v3g-sun-ridge)" strokeWidth="2.2" pathLength="1"
      strokeDasharray="1" strokeDashoffset={1 - reveal}/>
    <path d={ridge} fill="none" stroke="#c7a867" strokeWidth="9" opacity={warmth * .045}/>
    <g stroke="url(#v3g-sun-ray)" fill="none" strokeWidth="1.2">
      {rays.map((ray, i) => <path key={i}
        d={`M${sunX} ${sunY + 12} Q${(sunX + ray.x) / 2} ${520 + i * 5} ${ray.x} ${ray.y}`}
        pathLength="1" strokeDasharray="1" strokeDashoffset={1 - ray.strength} opacity={ray.strength * .57}/>) }
    </g>

    <ellipse cx="1050" cy="743" rx="720" ry="150" fill="url(#v3g-sun-ground)" opacity={warmth}/>
    {[0, 1, 2].map(i => {
      const lit = phase(t, 4.1 + i * .7, 6.1 + i * .7);
      const y = 700 + i * 54;
      const d = `M${320 - i * 42} ${y} Q960 ${y + 36 + i * 12} ${1610 + i * 24} ${y - 5}`;
      return <g key={i}>
        <path d={d} fill="none" stroke="#6b8e96" strokeOpacity={.23 * (1 - warmth)} strokeWidth="1"/>
        <path d={d} fill="none" stroke="#d8bf83" strokeWidth={1.4 - i * .15} opacity={lit * (.7 - i * .16)}
          pathLength="1" strokeDasharray="1" strokeDashoffset={1 - lit}/>
      </g>;
    })}

    <text x="960" y="270" textAnchor="middle" fontSize="76" fill="#e5cd96" letterSpacing="5"
      opacity={title} transform={`translate(0 ${12 * (1 - title)})`}>山头斜照却相迎</text>
    <g opacity={phase(t, 6.1, 7.1)}>
      <text x="960" y="872" textAnchor="middle" fontSize="34" letterSpacing="2" fill="#aea185">寒意还在，光已抵达。</text>
    </g>
  </g>;
};
