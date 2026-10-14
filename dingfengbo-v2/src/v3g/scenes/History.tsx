import React from 'react';
import {staticFile} from 'remotion';

const G = '#d8bf83';
const W = '#e9e4d6';
const M = '#887d66';
const R = '#ab573e';
const serif = 'Noto Serif CJK SC, serif';
const sans = 'Noto Sans CJK SC, sans-serif';
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (n: number) => { const x = clamp(n); return x * x * (3 - 2 * x); };
const reveal = (t: number, at: number, duration = .65) => ease((t - at) / duration);

/** Rendered brass seal; normalized alpha bounds preserve the contact at 19.82 s. */
function OfficialSeal({t}: {t: number}) {
  const fall = reveal(t, 8.12, .7);
  const contact = Math.exp(-Math.max(0, t - 8.82) * 9) * Math.sin(Math.max(0, t - 8.82) * 30);
  return <g opacity={reveal(t, 7.9)}>
    <ellipse cx="1188" cy="609" rx={185 + 30 * (1 - fall)} ry={25 + 10 * (1 - fall)} fill="url(#h-seal-shadow)" opacity={.22 + .62 * fall}/>
    <g transform={`translate(1188 ${398 - 135 * (1 - fall) - 5 * contact})`}>
      <image href={staticFile('v3g/assets/seal/000.png')} x="-300" y="-257.4" width="600" height="600"/>
    </g>
  </g>;
}

/** 11–23 s: a case file becomes an exile route, then an unusable official seal. */
export function History({t}: {t: number}) {
  const p1 = 1 - reveal(t, 3.7, .7);
  const p2 = reveal(t, 3.7, .7) * (1 - reveal(t, 7.55, .65));
  const p3 = reveal(t, 7.55, .65);
  const pageOpen = reveal(t, .2, 1.15);
  const pageShift = reveal(t, 3.75, .9);
  const stamp = reveal(t, 1.78, .18);
  const stampShock = Math.sin(Math.max(0, t - 1.96) * 27) * Math.exp(-Math.max(0, t - 1.96) * 7);
  const route = reveal(t, 4.35, 1.5);
  const broken = reveal(t, 9.05, .7);
  const timeline = reveal(t, .3, 1.1);
  const alpha = reveal(t, 0, .55);

  return <g opacity={alpha}>
    <defs>
      <linearGradient id="h-paper" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#ddd0ab"/><stop offset=".48" stopColor="#a89975"/><stop offset="1" stopColor="#6f634a"/>
      </linearGradient>
      <linearGradient id="h-page-fold" x1="0" x2="1"><stop stopColor="#c1ad80"/><stop offset=".5" stopColor="#e5d6ae"/><stop offset="1" stopColor="#746344"/></linearGradient>
      <radialGradient id="h-seal-shadow"><stop stopColor="#000"/><stop offset=".48" stopColor="#000" stopOpacity=".75"/><stop offset="1" stopColor="#000" stopOpacity="0"/></radialGradient>
      <radialGradient id="h-aura"><stop stopColor="#b68c43" stopOpacity=".1"/><stop offset="1" stopColor="#b68c43" stopOpacity="0"/></radialGradient>
    </defs>

    <ellipse cx="1190" cy="480" rx="540" ry="330" fill="url(#h-aura)"/>
    <g fontFamily={serif} fill={G} fontSize="46" letterSpacing="4">
      <text x="150" y="120" opacity={p1}>1079</text>
      <text x="150" y="120" opacity={p2 + p3}>1080</text>
    </g>

    <g opacity={p1} transform={`translate(${(1 - reveal(t, .15)) * 24} 0)`}>
      <text x="180" y="338" fill={W} fontFamily={serif} fontSize="88" letterSpacing="4">因诗入狱</text>
      <path d="M183 378H508" stroke={G} strokeWidth="1.3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - reveal(t, .7, .7)} opacity=".65"/>
      <text x="183" y="455" fill={R} fontFamily={serif} fontSize="56" letterSpacing="6" opacity={reveal(t, .85)}>乌台诗案</text>
      <text x="185" y="531" fill={M} fontFamily={sans} fontSize="31" opacity={reveal(t, 1.35)}>一场文字之祸，人生骤然转向。</text>
    </g>
    <g opacity={p2} transform={`translate(${(1 - reveal(t, 3.7)) * 20} 0)`}>
      <text x="180" y="338" fill={W} fontFamily={serif} fontSize="88" letterSpacing="4">贬居黄州</text>
      <path d="M183 378H508" stroke={G} strokeWidth="1.3" opacity=".65"/>
      <text x="183" y="455" fill={G} fontFamily={serif} fontSize="50" letterSpacing="3">离开京城，远赴江边。</text>
      <text x="185" y="531" fill={M} fontFamily={sans} fontSize="31">元丰三年 · 黄州</text>
    </g>
    <g opacity={p3} transform={`translate(${(1 - reveal(t, 7.55)) * 20} 0)`}>
      <text x="180" y="328" fill={W} fontFamily={serif} fontSize="70" letterSpacing="2">名为团练副使</text>
      <text x="182" y="440" fill={R} fontFamily={serif} fontSize="72" letterSpacing="3" opacity={reveal(t, 8.9, .55)}>不得签署公事</text>
      <text x="185" y="525" fill={M} fontFamily={sans} fontSize="32" opacity={reveal(t, 9.45)}>有官衔，却无法履行官职。</text>
    </g>

    <g opacity={(1 - p3) * reveal(t, .15)} transform={`translate(${1170 - pageShift * 100} ${458 - pageShift * 22}) rotate(${-7 - pageShift * 5}) scale(${.95 - .17 * pageShift})`}>
      <ellipse cy="268" rx="250" ry="31" fill="#000" opacity=".6"/>
      <path d="M-205-235 190-235 207 244-199 245Z" fill="#1a1712" transform="translate(15 20)"/>
      <path d="M-205-235 190-235 207 244-199 245Z" fill="url(#h-paper)" stroke="#d7c69b" strokeWidth="1.3"/>
      <path d="M-185-212H169L184 220H-177Z" fill="none" stroke="#6b5940" strokeWidth="1.5"/>
      {Array.from({length: 9}, (_, i) => <path key={i} d={`M${-145 + i * 33} -96V${152 - (i % 3) * 28}`} stroke="#4b3d2a" strokeWidth={i % 3 === 0 ? 4 : 2} opacity=".3"/>)}
      <text x="2" y="-134" textAnchor="middle" fill="#3a3022" fontFamily={serif} fontSize="49" letterSpacing="10">乌台诗案</text>
      <path d={`M-205,-235 L${-205 + 132 * pageOpen},-254 L${-197 + 132 * pageOpen},225 L-199,245Z`} fill="url(#h-page-fold)" stroke="#66563c" strokeWidth="1" opacity={1 - .35 * pageOpen}/>
      <path d="M-205-235-199 245" stroke="#f0dfb0" strokeWidth="2" opacity=".8"/>
      <g opacity={stamp} transform={`translate(104 ${117 + 3 * stampShock}) rotate(8) scale(${1 + (1 - stamp) * .4})`}>
        <rect x="-50" y="-54" width="100" height="108" rx="2" fill={R} opacity=".86"/>
        <rect x="-42" y="-46" width="84" height="92" fill="none" stroke="#e8b99b" strokeWidth="2.5"/>
        <text textAnchor="middle" y="-5" fill="#ead5b2" fontFamily={serif} fontSize="32">案</text>
        <text textAnchor="middle" y="33" fill="#ead5b2" fontFamily={serif} fontSize="32">卷</text>
      </g>
    </g>

    <g opacity={p2}>
      <path d="M1258 349C1500 345 1540 505 1430 630S1260 705 1275 690" fill="none" stroke={G} strokeWidth="2.2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - route}/>
      <circle cx="1258" cy="349" r="5" fill={G}/>
      <circle cx="1280" cy="689" r={11 + 13 * reveal(t, 5.85)} fill="none" stroke={G} opacity={reveal(t, 5.65) * .7}/>
      <circle cx="1280" cy="689" r="5" fill={G} opacity={reveal(t, 5.65)}/>
      <text x="1332" y="704" fill={G} fontFamily={serif} fontSize="47" letterSpacing="5" opacity={reveal(t, 5.8)}>黄州</text>
      <text x="1310" y="311" fill={M} fontFamily={sans} fontSize="29" opacity={reveal(t, 4.1)}>京城</text>
    </g>

    <g opacity={p3}>
      <OfficialSeal t={t}/>
      <path d="M1040 669H1163M1215 669H1356" fill="none" stroke={G} strokeWidth="2" opacity=".8"/>
      <path d="M1163 669H1215" fill="none" stroke={G} strokeWidth="2" opacity={1 - broken}/>
      <path d={`M1163 669l${16 * broken} ${-12 * broken}m36 ${12 * broken}l${-14 * broken} ${15 * broken}`} stroke={R} strokeWidth="2.2" fill="none" opacity={broken}/>
      <circle cx="1040" cy="669" r="4" fill={G}/><circle cx="1356" cy="669" r="4" fill={M}/>
      <text x="1185" y="744" textAnchor="middle" fill={M} fontFamily={sans} fontSize="30" letterSpacing="3" opacity={reveal(t, 9.65)}>官衔与实权，被切断了联系。</text>
    </g>

    <g opacity={timeline}>
      <path d="M230 785H1690" stroke="#544b38" strokeWidth="1.4"/>
      <path d={`M230 785H${230 + 730 * reveal(t, 3.7, 1.2) + 730 * reveal(t, 7.55, 1.2)}`} stroke={G} strokeWidth="2"/>
      {[{x: 230, title: '因诗入狱', a: 1}, {x: 960, title: '贬居黄州', a: reveal(t, 3.7)}, {x: 1690, title: '有职无权', a: reveal(t, 7.55)}].map(({x, title, a}) => <g key={x} opacity={.25 + a * .75}>
        <circle cx={x} cy="785" r="6" fill={a > .1 ? G : M}/>
        <circle cx={x} cy="785" r="13" fill="none" stroke={G} opacity={a * .5}/>
        <text x={x} y="842" textAnchor="middle" fill={a > .1 ? G : M} fontFamily={sans} fontSize="30" letterSpacing="2">{title}</text>
      </g>)}
    </g>
  </g>;
}
