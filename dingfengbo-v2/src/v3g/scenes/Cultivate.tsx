import React from 'react';

const G = '#d8bf83';
const W = '#e9e4d6';
const M = '#887d66';
const serif = 'Noto Serif CJK SC, serif';
const sans = 'Noto Sans CJK SC, sans-serif';
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => { const v = clamp(n); return v * v * (3 - 2 * v); };
const enter = (t: number, at: number, duration = .7) => ease((t - at) / duration);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
type Pt = {x: number; y: number};
function land(u: number, v: number): Pt {
  const left = {x: lerp(740, 1030, v), y: lerp(520, 806, v)};
  const right = {x: lerp(1260, 1685, v), y: lerp(380, 590, v)};
  return {x: lerp(left.x, right.x, u), y: lerp(left.y, right.y, u)};
}
const point = ({x, y}: Pt) => `${x},${y}`;

function Hoe({t}: {t: number}) {
  // Lift, accelerate into soil, then remove the tool. One deliberate action.
  const windup = enter(t, .75, .7);
  const down = enter(t, 1.62, .7);
  const release = enter(t, 2.6, 1.1);
  const angle = -23 - 30 * windup + 53 * down - 35 * release;
  const visible = enter(t, .3, .7) * (1 - enter(t, 3.2, .8));
  return <g opacity={visible} transform={`translate(${1155 + 180 * release} ${642 - 120 * release}) rotate(${angle} -154 -325)`}>
    <path d="M-210-441-196-445 4-18-10-8Z" fill="url(#c-wood)" stroke="#9e8050" strokeWidth="1.2"/>
    <path d="M-205-438-4-15" stroke="#d0b57d" strokeWidth="2.4" opacity=".65"/>
    <path d="M-47-35 37-10 44 7-44-15Z" fill="#735c3c" stroke="#a28d65"/>
    <path d="M-44-15 44 7 37 31-46 11Z" fill="url(#c-metal)" stroke="#b6a77d" strokeWidth="1.4"/>
    <path d="M-46 11 37 31 31 39-49 19Z" fill="#3d3b32" stroke="#777462"/>
    <path d="M-43 11 36 30" stroke="#ede0b7" strokeWidth="2"/>
    <path d="M-27-24-18-38-1-34 3-17" stroke="#aea184" strokeWidth="6" fill="none"/>
  </g>;
}

function Sprout({x, y, p, variant}: {x: number; y: number; p: number; variant: number}) {
  const height = 34 + (variant % 4) * 8;
  const leaf = ease((p - .22) / .78);
  return <g transform={`translate(${x} ${y})`} opacity={clamp(p * 4)}>
    <ellipse cy="2" rx="11" ry="3.7" fill="#14170f" opacity=".75"/>
    <path d={`M0 0Q${2 + variant % 3} ${-height * p * .52} ${4 - variant % 4} ${-height * p}`} fill="none" stroke="#a0aa73" strokeWidth="2.5" strokeLinecap="round"/>
    <path d={`M${2 - variant % 2} ${-height * p * .42}Q${-23 * leaf} ${-height * p * .95} ${-29 * leaf} ${-height * p * .55}Q${-15 * leaf} ${-height * p * .3} 2 ${-height * p * .42}Z`} fill="url(#c-leaf)"/>
    <path d={`M3 ${-height * p * .7}Q${31 * leaf} ${-height * p * 1.35} ${33 * leaf} ${-height * p * .86}Q${15 * leaf} ${-height * p * .55} 3 ${-height * p * .7}Z`} fill="url(#c-leaf)"/>
    <path d={`M1 ${-height * p * .42}L${-21 * leaf} ${-height * p * .62}M3 ${-height * p * .7}L${26 * leaf} ${-height * p * .95}`} stroke="#c1bd81" strokeWidth=".8" opacity=".65"/>
  </g>;
}

/** 23–32 s: bare soil, one strike, one seed, and a field slowly taking root. */
export function Cultivate({t}: {t: number}) {
  const fade = enter(t, 0, .6);
  const stage1 = 1 - enter(t, 3.05);
  const stage2 = enter(t, 3.05) * (1 - enter(t, 6.2));
  const stage3 = enter(t, 6.2);
  const bed = enter(t, .1, 1.05);
  const hit = Math.max(0, t - 2.32);
  const shock = hit > 0 ? Math.sin(hit * 34) * Math.exp(-hit * 11) * 2.2 : 0;
  const seedP = clamp((t - 4.05) / .9);
  const seedFall = seedP * seedP;
  const seedBounceT = Math.max(0, t - 4.95);
  const seedBounce = Math.abs(Math.sin(seedBounceT * 13)) * Math.exp(-seedBounceT * 10) * 17;
  const seedOpacity = enter(t, 3.85, .25) * (1 - enter(t, 5.25, .5));
  const base = [land(0,0), land(1,0), land(1,1), land(0,1)];
  const mainSeed = land(.52, .53);

  return <g opacity={fade}>
    <defs>
      <linearGradient id="c-soil" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#171b15"/><stop offset=".42" stopColor="#393527"/><stop offset="1" stopColor="#605238"/></linearGradient>
      <linearGradient id="c-soil-side" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#403425"/><stop offset="1" stopColor="#131410"/></linearGradient>
      <linearGradient id="c-ridge" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7c6a46"/><stop offset=".3" stopColor="#50452e"/><stop offset="1" stopColor="#211f17"/></linearGradient>
      <linearGradient id="c-wood" x1="0" x2="1"><stop stopColor="#59432b"/><stop offset=".4" stopColor="#b29661"/><stop offset=".72" stopColor="#7b603b"/><stop offset="1" stopColor="#3d3020"/></linearGradient>
      <linearGradient id="c-metal" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a2a18b"/><stop offset=".45" stopColor="#565a4d"/><stop offset="1" stopColor="#262e29"/></linearGradient>
      <linearGradient id="c-leaf" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b5ba87"/><stop offset=".35" stopColor="#7d9267"/><stop offset="1" stopColor="#3a5741"/></linearGradient>
      <radialGradient id="c-glow"><stop stopColor="#d2b76e" stopOpacity=".13"/><stop offset="1" stopColor="#d2b76e" stopOpacity="0"/></radialGradient>
      <radialGradient id="c-seed"><stop offset=".1" stopColor="#eed6a0"/><stop offset=".5" stopColor="#bea064"/><stop offset="1" stopColor="#66502c"/></radialGradient>
    </defs>

    <text x="150" y="120" fill={G} fontFamily={serif} fontSize="46" letterSpacing="4">1081</text>
    <ellipse cx="1260" cy="633" rx="550" ry="310" fill="url(#c-glow)" opacity={.45 + .55 * stage3}/>
    <g opacity={stage1} transform={`translate(${(1 - enter(t, .1)) * 20} 0)`}>
      <text x="180" y="338" fill={W} fontFamily={serif} fontSize="86" letterSpacing="3">生活困顿</text>
      <text x="184" y="418" fill={M} fontFamily={sans} fontSize="33">从官场，到一片荒地。</text>
    </g>
    <g opacity={stage2} transform={`translate(${(1 - enter(t, 3.05)) * 20} 0)`}>
      <text x="180" y="338" fill={W} fontFamily={serif} fontSize="86" letterSpacing="3">躬耕东坡</text>
      <text x="184" y="418" fill={G} fontFamily={sans} fontSize="33">把日子，一寸寸种下。</text>
    </g>
    <g opacity={stage3} transform={`translate(${(1 - enter(t, 6.2)) * 20} 0)`}>
      <text x="180" y="326" fill={W} fontFamily={serif} fontSize="73" letterSpacing="3">重新安顿自己</text>
      <text x="184" y="418" fill={G} fontFamily={serif} fontSize="47" letterSpacing="5">东坡居士</text>
      <path d="M184 455H515" stroke={G} strokeWidth="1.3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - enter(t, 6.85, .8)} opacity=".5"/>
    </g>

    <g transform={`translate(0 ${34 * (1 - bed) + shock})`} opacity={bed}>
      <ellipse cx="1235" cy="795" rx="470" ry="48" fill="#000" opacity=".6"/>
      <path d={`M${point(base[0])}L${point(base[3])}L${base[3].x},${base[3].y + 35}L${base[0].x},${base[0].y + 24}Z`} fill="url(#c-soil-side)"/>
      <path d={`M${point(base[3])}L${point(base[2])}L${base[2].x},${base[2].y + 27}L${base[3].x},${base[3].y + 35}Z`} fill="url(#c-soil-side)"/>
      <polygon points={base.map(point).join(' ')} fill="url(#c-soil)" stroke="#766344" strokeWidth="1.2"/>
      {Array.from({length: 6}, (_, i) => {
        const v = .085 + i * .157;
        const a = land(.025, v), b = land(.975, v), c = land(.975, v + .047), d = land(.025, v + .047);
        return <g key={i}>
          <path d={`M${point(a)}Q${(a.x + b.x) / 2},${(a.y + b.y) / 2 - 7} ${point(b)}L${point(c)}Q${(c.x + d.x) / 2},${(c.y + d.y) / 2 + 3} ${point(d)}Z`} fill="url(#c-ridge)" stroke="#403a29" strokeWidth="1"/>
          <path d={`M${a.x},${a.y - 2}Q${(a.x + b.x) / 2},${(a.y + b.y) / 2 - 8} ${b.x},${b.y - 2}`} stroke="#a18b5b" strokeWidth="1.2" opacity=".55"/>
          <path d={`M${point(d)}Q${(c.x + d.x) / 2},${(c.y + d.y) / 2 + 3} ${point(c)}`} stroke="#181b14" strokeWidth="3" opacity=".6"/>
        </g>;
      })}
      {Array.from({length: 85}, (_, i) => {
        const a = land(((i * 37 + 11) % 100) / 100, ((i * 53 + 19) % 100) / 100);
        return <ellipse key={i} cx={a.x} cy={a.y} rx={1.6 + i % 4} ry={.8 + (i % 3) * .7} fill={i % 3 ? '#b49c6a' : '#11170f'} opacity={i % 3 ? .3 : .6}/>;
      })}
      <g opacity={enter(t, 2.32, .1) * (1 - enter(t, 3.1, .6))}>
        {Array.from({length: 13}, (_, i) => {
          const velocity = (i - 6) * 30;
          const dt = Math.min(hit, 1.4);
          const lift = (75 + (i % 4) * 35) * dt - 150 * dt * dt;
          return <path key={i} d="M-4-3 4-2 6 3-2 5Z" transform={`translate(${1155 + velocity * dt} ${665 - lift}) rotate(${i * 39 + hit * 120})`} fill={i % 3 ? '#9c8151' : '#5b4b32'} opacity={clamp(1 - hit / 1.2)}/>;
        })}
      </g>
      <ellipse cx={mainSeed.x} cy={mainSeed.y + 3} rx={13 + seedP * 4} ry="5" fill="#080c08" opacity={seedOpacity * .7}/>
      <g transform={`translate(${mainSeed.x - 65 * (1 - seedP)} ${mainSeed.y - 280 * (1 - seedFall) - seedBounce}) rotate(${seedP * 140 - 55})`} opacity={seedOpacity}>
        <ellipse rx="10" ry="18" fill="url(#c-seed)" stroke="#d2b578" strokeWidth="1"/>
        <path d="M1-13Q-4 0 0 13" stroke="#705333" strokeWidth="1.2" opacity=".65"/>
      </g>
      {Array.from({length: 24}, (_, i) => {
        const row = Math.floor(i / 6), col = i % 6;
        const a = land(.13 + col * .145, .17 + row * .22);
        const distance = Math.abs(col - 2.5) * .11 + Math.abs(row - 1.5) * .16;
        const p = enter(t, 5.3 + distance, 1.65);
        return <Sprout key={i} x={a.x} y={a.y} p={p} variant={i}/>;
      })}
      <Hoe t={t}/>
    </g>

    <g opacity={enter(t, 7.3, .7)}>
      <path d="M575 720H725L837 680" fill="none" stroke={G} strokeWidth="1.3" opacity=".55" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - enter(t, 7.3, 1)}/>
      <circle cx="837" cy="680" r="4" fill={G}/>
      <text x="180" y="727" fill={M} fontFamily={sans} fontSize="33" letterSpacing="2">在黄州，生出新的自己。</text>
    </g>
  </g>;
}
