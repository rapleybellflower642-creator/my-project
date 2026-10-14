import React, {useId} from 'react';

/** Time is supplied by the parent scene in seconds. All motion is deterministic. */
export type HistoryArtProps = {
  t: number;
  mode: 'case' | 'exile' | 'farm' | 'manuscript' | 'portrait';
};

const G = '#d6bb81';
const J = '#6ea99e';
const INK = '#090d10';
const smooth = (v: number) => {
  const p = Math.max(0, Math.min(1, v));
  return p * p * (3 - 2 * p);
};
const come = (t: number, at = 0, span = .7) => smooth((t - at) / span);

/** An imagined Song scholar: cap, brow, moustache, beard and layered crossed collar. */
const Scholar: React.FC<{t: number; id: string; bust?: boolean; quiet?: boolean}> = ({t, id, bust, quiet}) => {
  const cloth = Math.sin(t * 1.8) * (quiet ? 1 : 5);
  return <g>
    <path d={`M-64 87 C-123 125 -143 157 -148 216 L-133 345 L-150 421 Q-45 451 77 437 L119 416 L100 275 L130 207 Q98 127 47 91Z`} fill={`url(#${id}-robe)`} stroke={G} strokeWidth="1.7"/>
    <path d={`M-63 97 Q-104 120 -111 154 L-114 330 L${-145 + cloth} 416 L-82 429 Q-58 317 -60 220Z`} fill="#18292b" stroke={J} strokeWidth="1.2"/>
    <path d={`M49 100 Q90 126 118 205 L82 245 L67 398 L${99 + cloth} 432 L29 439 L-3 263Z`} fill="#243030" stroke={G} strokeWidth="1.2"/>
    <path d="M-60 89 L-5 151 L49 95 L69 131 L-16 220 L-82 119Z" fill="#b6a779" stroke={G} strokeWidth="1.3"/>
    <path d="M-60 91 L-5 154 L-30 181 L-73 114Z" fill="#d6c798"/>
    <path d="M44 103 L-28 187 L-14 214 L62 129Z" fill="#788c7c"/>
    <path d="M-38 198 Q-32 289 -63 399 M12 239 Q17 324 46 404 M-89 280 Q-112 349 -110 408 M76 283 Q76 357 91 397" stroke={G} strokeWidth="1.1" opacity=".45" fill="none"/>
    <path d="M-74 223 Q-39 242 48 219 L48 237 Q-16 254 -76 239Z" fill="#665c40" stroke={G} strokeWidth="1.3"/>
    <path d={`M-130 176 Q-145 205 -135 243 Q-99 272 -42 235 L-26 213 Q-92 222 -130 176Z`} fill="#233335" stroke={G} strokeWidth="1.6"/>
    <path d="M104 180 Q130 203 108 234 L38 241 L16 216 Q51 211 104 180Z" fill="#354241" stroke={G} strokeWidth="1.6"/>
    <path d="M-45 218 Q-25 207 -7 213 L13 223 L28 218 L43 226 L27 239 L-12 237 L-43 232Z" fill="#ad9b72" stroke={G} strokeWidth="1.1"/>
    <path d="M-8 215 L4 231 M1 214 L13 230 M11 218 L21 229" stroke="#5c5642" strokeWidth="1.2"/>
    {!bust && <g fill="#44432f" stroke={G} strokeWidth="1.3"><path d="M-88 435 L-88 451 Q-99 463 -128 459 L-132 450 L-112 432Z"/><path d="M38 438 L39 450 Q67 453 77 447 L80 459 L27 466 L14 439Z"/></g>}
    <path d="M-30 55 L-31 105 Q-2 126 27 99 L24 56Z" fill="#a7966b" stroke={G} strokeWidth="1.3"/>
    <path d="M-48 8 Q-56 26 -46 51 L-26 77 Q4 98 30 67 L44 31 L34 -11 L-17 -24Z" fill={`url(#${id}-skin)`} stroke={G} strokeWidth="1.4"/>
    <path d="M-49 15 Q-66 5 -62 28 Q-60 44 -43 44 L-42 29 Q-52 16 -54 23" fill="#a38d60" stroke={G} strokeWidth="1.1"/>
    <path d="M36 9 Q48 6 48 26 Q45 39 37 39" fill="#a38d60" stroke={G} strokeWidth="1.1"/>
    <path d="M-47 7 L-39 39 L-34 15 L-22 -7 L17 -10 L35 13 L37 40 L44 16 L40 -17 L-39 -25Z" fill="#141f22"/>
    <path d="M-40 -6 Q-53 -43 -35 -62 L19 -67 Q35 -55 39 -20 L50 -7 Q12 9 -40 -6Z" fill="#111d20" stroke={G} strokeWidth="1.6"/>
    <path d="M-34 -61 Q-7 -43 24 -57 M-38 -10 Q-2 -1 39 -16 M-23 -55 L-19 -16 M3 -52 L10 -16" fill="none" stroke={G} strokeWidth="1.1" opacity=".6"/>
    <path d={`M-40 -5 Q-66 17 -73 ${76 + cloth} L-56 66 Q-60 18 -30 2Z`} fill="#18282a" stroke={G} strokeWidth="1"/>
    <path d="M-29 17 Q-17 8 -8 16 M7 15 Q20 8 29 15" stroke="#272a22" strokeWidth="3.7" strokeLinecap="round" fill="none"/>
    <path d="M-26 22 Q-17 17 -10 22 M9 20 Q18 16 25 19" stroke="#242923" strokeWidth="1.9" strokeLinecap="round" fill="none"/>
    <path d="M-2 18 Q-9 34 -4 40 L6 40 M11 45 Q-1 40 -15 47 M9 47 Q21 40 29 48" stroke="#474332" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M-31 47 Q-28 66 -9 68 Q8 77 28 51 L22 82 L4 115 L-15 95 L-31 91 L-41 57Z" fill="#283033" stroke="#b1a27c" strokeWidth="1.3"/>
    <path d="M-23 59 Q-10 68 -8 96 M-13 65 Q3 75 4 109 M7 67 Q18 57 17 84 M-32 57 L-25 78 M-17 66 L-14 91 M5 72 L9 92" stroke="#b5ab8f" strokeWidth="1.1" opacity=".65" fill="none"/>
    <path d="M-14 48 Q-1 42 9 47 Q22 42 28 47 L19 57 L7 52 L-4 58 L-20 57Z" fill="#202a2b"/>
    <path d="M-6 53 Q3 56 13 52" stroke="#a99971" strokeWidth="1" fill="none"/>
    <path d="M-30 35 L-20 39 M21 30 L28 34 M-29 5 Q-20 1 -11 4" stroke="#806f4b" strokeWidth="1" opacity=".8" fill="none"/>
  </g>;
};

const River: React.FC<{t: number; id: string}> = ({t, id}) => <g>
  <path d="M920 469 Q1052 346 1157 431 Q1300 310 1413 435 Q1558 300 1775 424 L1920 524 L1920 715 L894 715Z" fill={`url(#${id}-mountain)`}/>
  <path d="M978 508 Q1092 445 1197 470 Q1328 404 1442 471 Q1608 394 1883 505" fill="none" stroke={J} opacity=".2" strokeWidth="1.4"/>
  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <path key={i} d={`M${900 + (i % 3) * 70 + Math.sin(t * .35 + i) * 9} ${627 + i * 22} Q${1210 + i * 11} ${618 + i * 22} ${1690 + (i % 4) * 75} ${633 + i * 22}`} fill="none" stroke={i % 3 ? J : G} strokeWidth={i % 2 ? .8 : 1.2} opacity={.1 + (8 - i) * .012}/>) }
</g>;

export const HistoryArt: React.FC<HistoryArtProps> = ({t, mode}) => {
  const id = `history-${useId().replace(/:/g, '')}`;
  const enter = come(t, 0, .65);
  const second = come(t, 2.25, .75);
  const third = come(t, 4.4, .7);
  const drift = Math.sin(t * .36) * 5;
  return <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0, pointerEvents: 'none'}} aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-robe`} x1="0" x2="1" y1="0" y2=".3"><stop stopColor="#111d20"/><stop offset=".42" stopColor="#3b4640"/><stop offset=".7" stopColor="#202f31"/><stop offset="1" stopColor="#0d171a"/></linearGradient>
      <linearGradient id={`${id}-skin`}><stop stopColor="#948764"/><stop offset=".53" stopColor="#dfc793"/><stop offset="1" stopColor="#aa9369"/></linearGradient>
      <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#bfb18b"/><stop offset=".38" stopColor="#ddd0a7"/><stop offset="1" stopColor="#98835b"/></linearGradient>
      <linearGradient id={`${id}-mountain`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={J} stopOpacity=".16"/><stop offset="1" stopColor={J} stopOpacity="0"/></linearGradient>
      <radialGradient id={`${id}-halo`}><stop stopColor={G} stopOpacity=".11"/><stop offset=".62" stopColor={J} stopOpacity=".035"/><stop offset="1" stopColor={J} stopOpacity="0"/></radialGradient>
      <linearGradient id={`${id}-bar`}><stop stopColor="#05090b"/><stop offset=".5" stopColor="#273331"/><stop offset=".68" stopColor="#8d825d"/><stop offset=".77" stopColor="#29332e"/><stop offset="1" stopColor="#080d10"/></linearGradient>
      <clipPath id={`${id}-paper-clip`}><rect x="1080" y="215" width="610" height={545 * come(t, .25, 1.6)}/></clipPath>
      <clipPath id={`${id}-bust-clip`}><path d="M1030 138 H1800 V850 H1030Z"/></clipPath>
    </defs>
    <ellipse cx="1390" cy="510" rx="630" ry="430" fill={`url(#${id}-halo)`}/>

    {mode === 'portrait' && <g opacity={enter} clipPath={`url(#${id}-bust-clip)`}>
      <circle cx="1443" cy="400" r="255" fill="none" stroke={G} strokeWidth=".8" opacity=".12"/>
      <path d="M1170 536 C1030 373 1183 173 1396 162 C1592 154 1748 339 1706 515" fill="none" stroke={G} opacity=".4" strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - come(t, .2, 1.6)}/>
      <g transform={`translate(${1440 - second * 34} ${362 + second * 24}) scale(${1.4 + second * .2})`}><Scholar t={t} id={id} bust/></g>
      <path d={`M1737 ${628 + drift} Q1660 572 1626 650 T1516 702`} stroke={J} opacity=".18" fill="none"/>
      {[0, 1, 2].map(i => <path key={i} d={`M${1090 + i * 37} ${667 + i * 26} Q1320 ${706 + drift + i * 11} 1770 ${624 + i * 36}`} stroke={G} strokeWidth=".8" opacity=".1" fill="none"/>)}
    </g>}

    {mode === 'case' && <g opacity={enter}>
      <g opacity={1 - second * .63} transform={`translate(${second * 132} ${second * 34}) rotate(${-7 + second * 5} 1320 490)`}>
        <path d="M1080 215 L1634 228 L1622 756 L1062 735Z" fill={`url(#${id}-paper)`} stroke={G} strokeWidth="1.2"/>
        <path d="M1090 229 L1081 720 M1617 242 L1608 738 M1120 245 L1585 256" stroke="#695b3c" fill="none" opacity=".38"/>
        {[0,1,2,3,4,5,6].map(i => <path key={i} d={`M${1111 + i * 73} 260 L${1100 + i * 73} 704`} stroke="#6b6044" strokeWidth=".7" opacity=".22"/>)}
        <g clipPath={`url(#${id}-paper-clip)`} fill="#3a392e" fontFamily="DFBSerif, Noto Serif CJK SC, serif">
          <text x="1520" y="296" fontSize="42" letterSpacing="14" writingMode="vertical-rl">乌台诗案</text>
          <text x="1417" y="294" fontSize="28" letterSpacing="10" writingMode="vertical-rl" opacity=".66">元丰二年</text>
          <text x="1298" y="310" fontSize="31" letterSpacing="13" writingMode="vertical-rl" opacity=".7">文字风波</text>
          <text x="1186" y="348" fontSize="31" letterSpacing="16" writingMode="vertical-rl" opacity=".7">苏轼</text>
        </g>
        <path d="M1456 307 L1383 657 M1376 361 L1450 586" stroke="#743e32" strokeWidth="4.4" opacity={come(t, 1.3, .3)} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - come(t, 1.3, .3)}/>
        <g transform={`translate(1544 662) rotate(11) scale(${1.4 - come(t, 2.14, .08) * .4})`} opacity={come(t, 2.14, .06)}>
          <rect x="-46" y="-46" width="92" height="92" fill="none" stroke="#8f4935" strokeWidth="5"/><rect x="-38" y="-38" width="76" height="76" fill="none" stroke="#8f4935" strokeWidth="1.5"/>
          <text x="0" y="24" fill="#8f4935" fontSize="61" textAnchor="middle" fontFamily="DFBSerif, serif">案</text>
        </g>
      </g>
      <g opacity={second}>
        <g transform={`translate(${1355 - second * 30} 350) scale(.84)`}><Scholar t={t} id={id} quiet/></g>
        {[1076, 1218, 1360, 1502, 1644].map((x, i) => <g key={x} transform={`translate(${(1 - second) * (i - 2) * 18} 0)`}><rect x={x} y="188" width="18" height="620" fill={`url(#${id}-bar)`}/><path d={`M${x + 9} 208 V791`} stroke={G} opacity=".22" strokeWidth=".65"/></g>)}
        <rect x="1068" y="261" width="605" height="14" fill={`url(#${id}-bar)`}/><rect x="1068" y="690" width="605" height="14" fill={`url(#${id}-bar)`}/>
        <path d="M1076 812 H1706" stroke={J} opacity=".28"/>
      </g>
    </g>}

    {mode === 'exile' && <g opacity={enter}>
      <g transform={`translate(${-second * 28} 0)`}><River t={t} id={id}/>
        <g fill="#182a2b" stroke={G} strokeWidth="1" opacity=".6">
          <path d="M1280 476 V411 H1537 V471 M1260 412 H1559 L1519 394 H1300Z"/>
          <path d="M1380 397 V350 H1445 V397 M1362 351 L1410 329 L1463 351Z"/>
          <path d="M1420 478 V446 Q1408 428 1396 446 V478"/>
          <path d="M1320 414 V430 M1356 414 V430 M1469 414 V430 M1502 414 V430"/>
          <path d="M1140 482 V443 H1227 V482 M1125 444 L1186 416 L1240 444Z M1574 489 V451 H1662 V489 M1559 453 L1623 425 L1680 453Z" opacity=".57"/>
          <path d="M1077 487 H1765"/>
        </g>
        <path d="M1290 494 Q1410 510 1530 494 M1276 509 Q1410 529 1545 509 M1323 524 Q1408 541 1497 524" fill="none" stroke={G} opacity=".08"/>
      </g>
      <g opacity={1 - third * .66} transform={`translate(${1170 + come(t, 0, 7) * 132} ${601 + Math.sin(t * 1.4) * 3}) rotate(${Math.sin(t * 1.2) * .45})`}>
        <path d="M-184 82 Q-32 104 203 67 L162 110 Q-3 148 -151 114Z" fill="#2e3631" stroke={G} strokeWidth="2"/>
        <path d="M-173 84 Q-1 122 194 74 M-146 110 Q-9 140 154 108" fill="none" stroke={G} opacity=".47"/>
        <path d="M-121 79 Q-128 -23 -66 -43 Q-4 -35 4 90" fill="#243837" stroke={G} strokeWidth="1.4"/>
        <path d="M-99 83 Q-112 -5 -67 -40 M-74 89 Q-97 14 -67 -40 M-47 90 Q-64 13 -67 -40 M-21 90 Q-27 16 -67 -40" fill="none" stroke={J} opacity=".55"/>
        <g transform="translate(83 -75) scale(.35)"><Scholar t={t} id={id}/></g>
        <path d="M140 39 L219 144" stroke="#a48e5e" strokeWidth="3.4"/><path d="M200 119 L229 148 L219 155 L194 125Z" fill="#8b7c51"/>
        <path d="M-193 142 Q-147 150 -97 148 M127 147 Q197 135 259 146" fill="none" stroke={J} opacity=".52" strokeWidth="1.2"/>
      </g>
      <g opacity={third} transform={`translate(${1462 + (1 - third) * 36} 389) scale(.84)`}><Scholar t={t} id={id}/></g>
      <g opacity={second * .48} transform={`translate(${1665 + (1 - second) * 50} 216) rotate(5)`}>
        <path d="M-48 -12 L64 -7 L61 241 L-53 228Z" fill="#192b2b" stroke={G} strokeWidth="1"/>
        <text x="5" y="24" writingMode="vertical-rl" fill={G} fontFamily="DFBSerif, serif" fontSize="28" letterSpacing="9">不得签书公事</text>
      </g>
      <path d={`M1038 ${273 + drift} q12 -11 24 0 q12 -11 24 0 M1111 ${298 - drift} q9 -9 18 0 q9 -9 18 0`} fill="none" stroke={G} strokeWidth="1.3" opacity=".5"/>
    </g>}

    {mode === 'farm' && <g opacity={enter}>
      <path d="M949 459 Q1118 315 1289 417 Q1462 310 1700 391 L1917 556 V684 H933Z" fill={`url(#${id}-mountain)`}/>
      <g transform={`translate(${second * -19} 0)`}>
        <path d="M1499 540 V412 L1670 399 V534" fill="#172829" stroke={G} strokeWidth="1.4"/>
        <path d="M1467 422 L1539 329 L1692 389 L1716 432 L1578 388Z" fill="#343d31" stroke={G} strokeWidth="1.5"/>
        {[0,1,2,3,4,5,6,7,8].map(i => <path key={i} d={`M${1539 + i * 15} ${337 + i * 5.7} L${1484 + i * 26} ${416 + i * 1.2}`} stroke={G} strokeWidth="1" opacity=".35"/>)}
        <path d="M1533 535 V458 H1574 V537Z" fill="#090f12" stroke={G} strokeWidth="1"/><path d="M1603 448 H1638 V477 H1603Z M1620 448 V477 M1603 462 H1638" fill="none" stroke={G} opacity=".56"/>
        <path d="M1466 550 Q1630 567 1744 542" fill="none" stroke={J} opacity=".3"/>
        <path d="M1736 553 Q1721 451 1761 366 Q1742 404 1707 416 M1751 395 Q1804 374 1813 332 M1742 443 Q1784 425 1799 401" fill="none" stroke={J} strokeWidth="3" opacity=".44"/>
        {[0,1,2,3,4,5].map(i => <ellipse key={i} cx={1740 + Math.sin(i * 2) * 49} cy={359 + i * 11} rx={23 + i} ry="11" fill={J} opacity=".08"/>)}
      </g>
      <g opacity={.64} fill="none" stroke={G} strokeWidth="1.2">
        {[0,1,2,3,4,5].map(i => <path key={i} d={`M${950 + i * 17} ${631 + i * 30} Q${1187 + i * 16} ${530 + i * 37} ${1755 + i * 6} ${631 + i * 33}`} opacity={.16 + i * .026}/>)}
      </g>
      <g opacity={1 - third} transform={`translate(${1288 - second * 45} ${448 + Math.sin(t * 2.8) * 4}) rotate(${-13 + Math.sin(t * 2.8) * 3}) scale(.73)`}>
        <path d="M-60 105 Q-117 144 -93 229 L-138 377 L-38 388 L-18 290 L35 392 L130 380 L49 233 Q46 158 17 115Z" fill={`url(#${id}-robe)`} stroke={G} strokeWidth="1.7"/>
        <path d="M-50 124 L-8 180 L29 125 M-23 228 Q-31 293 -77 367 M8 253 Q41 323 79 370" fill="none" stroke={G} opacity=".6" strokeWidth="1.2"/>
        <path d="M-108 383 L-140 416 L-155 414 L-154 428 L-104 428 L-78 390 M85 383 L110 420 L141 422 L144 431 L91 432 L57 391" fill="#4b4b36" stroke={G} strokeWidth="1.4"/>
        <g transform="translate(-22 -19) rotate(14)">
          <path d="M-25 84 L-24 122 L14 132 L22 82Z" fill="#b6a075"/>
          <path d="M-44 16 Q-50 55 -26 80 L8 88 L31 60 L35 12Z" fill={`url(#${id}-skin)`} stroke={G} strokeWidth="1.3"/>
          <path d="M-45 20 L-54 -13 L-33 -40 L17 -40 L32 -20 L39 20 Q-8 28 -45 20Z" fill="#1b292b" stroke={G} strokeWidth="1.5"/>
          <path d="M-32 -35 L-21 12 M10 -33 L20 14 M-45 11 Q-5 19 32 9" fill="none" stroke={G} opacity=".5"/>
          <path d="M-28 36 L-11 32 M8 32 L24 34 M-3 39 L-6 53 L3 56" fill="none" stroke="#30332a" strokeWidth="2"/>
          <path d="M-32 59 Q-10 72 28 54 L17 87 L-3 112 L-24 89Z" fill="#253032" stroke={G} strokeWidth="1"/>
          <path d="M-19 69 L-12 93 M-7 74 L-3 106 M8 69 L5 91" fill="none" stroke="#a9a283" opacity=".7"/>
        </g>
        <path d="M-67 138 Q-9 155 50 182 L54 217 Q-3 225 -76 183Z" fill="#33443f" stroke={G} strokeWidth="1.5"/>
        <path d="M22 138 Q74 166 99 210 L76 228 Q37 188 7 176Z" fill="#263b37" stroke={G} strokeWidth="1.5"/>
        <path d="M42 187 Q70 186 69 199 L60 214 L45 211 M90 206 Q109 206 111 218 L96 230 L81 223Z" fill="#c2aa78" stroke={G} strokeWidth="1"/>
        <g transform={`rotate(${Math.sin(t * 2.8) * 7} 74 212)`}><path d="M40 133 L171 393" stroke="#a0905e" strokeWidth="6"/><path d="M161 379 L217 391 L204 412 L170 409Z" fill="#77817a" stroke={G} strokeWidth="1.2"/></g>
      </g>
      <g opacity={third} transform={`translate(${(1 - third) * 26} 0)`}>
        <g transform="translate(1315 416) scale(.76)"><Scholar t={t} id={id} quiet/></g>
        <path d="M1134 686 L1511 676 L1580 716 L1191 736Z" fill="#293632" stroke={G} strokeWidth="1.4"/>
        <path d="M1191 736 L1580 716 V728 L1191 748Z" fill="#162422" stroke={G} strokeWidth="1.2"/>
        <path d="M1210 748 L1204 822 M1548 730 L1557 803" stroke="#9d8c5e" strokeWidth="5"/>
        <path d="M1270 692 L1420 689 L1455 713 L1295 720Z" fill="#c5b38b" stroke={G} strokeWidth=".7"/>
        <path d="M1296 699 L1392 696 M1312 705 L1407 702 M1328 711 L1418 708" stroke="#454a36" opacity=".7" strokeWidth="1.2"/>
        <ellipse cx="1496" cy="700" rx="24" ry="8" fill="#0a1315" stroke={J} strokeWidth="1"/>
        <path d="M1418 687 L1479 705" stroke={G} strokeWidth="2.7"/><path d="M1418 687 L1401 683" stroke="#263331" strokeWidth="3.5"/>
      </g>
      <g opacity={second * .75} fill="none" stroke={J} strokeWidth="1.6">
        {[0,1,2,3,4,5,6].map(i => <path key={i} d={`M${1020 + i * 109} ${790 + (i % 2) * 23} l${Math.sin(t * 1.4 + i) * 4} -27 m0 10 q-17 -19 -23 -15 m22 10 q11 -22 23 -25`}/>)}
      </g>
    </g>}

    {mode === 'manuscript' && <g opacity={enter} transform={`translate(${-second * 27} ${drift}) rotate(${-5 + second * 4} 1400 490)`}>
      <path d="M1086 226 Q1382 204 1714 221 L1702 772 Q1412 793 1071 765Z" fill={`url(#${id}-paper)`} stroke={G} strokeWidth="1.2"/>
      <path d="M1097 239 Q1390 218 1701 235 M1083 754 Q1392 779 1689 761" stroke="#eee0b3" strokeWidth="2" opacity=".7" fill="none"/>
      {[0,1,2,3,4,5,6,7].map(i => <path key={i} d={`M${1112 + i * 80} 253 L${1100 + i * 80} 738`} stroke="#736347" strokeWidth=".9" opacity=".22"/>)}
      <path d="M1436 264 L1490 264 L1485 426 L1432 426Z" fill="#8c4933" opacity={third * .15}/>
      <g fill="#383b31" fontFamily="DFBSerif, Noto Serif CJK SC, serif" fontSize="31" letterSpacing="8" writingMode="vertical-rl">
        <text x="1649" y="273" opacity={come(t, .25, .4)}>三月七日，沙湖道中遇雨。</text>
        <text x="1558" y="276" opacity={come(t, .6, .5)}>雨具先去，同行皆狼狈，</text>
        <text x="1467" y="279" opacity={come(t, .95, .5)}>余独不觉。已而遂晴，</text>
        <text x="1376" y="282" opacity={come(t, 1.3, .5)}>故作此。</text>
        <text x="1259" y="286" opacity={come(t, 2.3, .4)} fontSize="40" letterSpacing="10">定风波</text>
        <text x="1173" y="524" opacity={come(t, 2.55, .4)} fontSize="29" letterSpacing="12">苏轼</text>
      </g>
      <path d="M1531 270 L1523 413 M1442 279 L1439 416" stroke="#8e4c34" strokeWidth="2.4" fill="none" opacity={come(t, 2.1, .3)} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - come(t, 2.1, .6)}/>
      <g transform="translate(1181 689) rotate(-4)" opacity={come(t, 2.7, .17)}><rect x="-32" y="-34" width="64" height="69" rx="1" fill="#914a35"/><rect x="-25" y="-27" width="50" height="55" fill="none" stroke="#d9c491" strokeWidth="1.1"/><text x="0" y="19" textAnchor="middle" fontFamily="DFBSerif, serif" fontSize="42" fill="#dec996">轼</text></g>
      <path d="M1747 307 L1739 671" stroke="#766542" strokeWidth="16"/><path d="M1744 306 L1736 670" stroke={G} strokeWidth="3"/><path d="M1739 665 Q1722 697 1737 727 Q1752 696 1748 665Z" fill="#1f2928" stroke={G} strokeWidth="1.4"/>
      <ellipse cx="1782" cy="752" rx="57" ry="23" fill="#131e20" stroke={G} strokeWidth="1.2"/><ellipse cx="1782" cy="747" rx="45" ry="14" fill={INK} stroke={J} strokeWidth=".65" opacity=".8"/>
      <path d="M1432 264 H1491 M1432 426 H1486" stroke="#8c4933" strokeWidth="2" opacity={third * .8}/>
    </g>}
  </svg>;
};
