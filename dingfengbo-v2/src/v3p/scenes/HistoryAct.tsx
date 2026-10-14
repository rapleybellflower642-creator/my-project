import React from 'react';
import {getLength} from '@remotion/paths';
import {Artifact, GOLD, WHITE, RED, clamp, out, smooth, SceneProps} from '../Common';

const pop = (t: number, at = 0, span = .18) => out((t - at) / span);
const draw = (t: number, at = 0, span = .55) => clamp((t - at) / span);
const ink = '#33291c';
const historyRoute = 'M710 253C1150 190 1045 544 1430 704S1585 744 1690 780';
const historyRouteLength = getLength(historyRoute);
// Keep all five move-to branches: the root must not gain connecting segments.
const cultivateRoot = 'M1090 590C1070 638 1124 663 1090 750M1089 632L1009 692 980 760M1100 659L1180 716 1200 794M1095 702L1040 795M1180 715L1238 729';
const cultivateRootLength = getLength(cultivateRoot);

function Label({children, x, y, size = 38, color = GOLD, anchor = 'start', opacity = 1}: {
  children: React.ReactNode; x: number; y: number; size?: number; color?: string;
  anchor?: 'start' | 'middle' | 'end'; opacity?: number;
}) {
  return <text x={x} y={y} fontSize={size} fill={color} textAnchor={anchor} opacity={opacity}>{children}</text>;
}

function QuickText({text, x, y, size = 96, t, at = 0, color = GOLD}: {
  text: string; x: number; y: number; size?: number; t: number; at?: number; color?: string;
}) {
  const p = pop(t, at);
  return <g opacity={p} transform={`translate(${22 * (1 - p)} 0)`}>
    <Label x={x} y={y} size={size} color={color}>{text}</Label>
  </g>;
}

function Lines({d, t, at = 0, span = .6, color = GOLD, width = 3, opacity = 1}: {
  d: string; t: number; at?: number; span?: number; color?: string; width?: number; opacity?: number;
}) {
  const length = getLength(d);
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round"
    strokeDasharray={`${length} ${length}`} strokeDashoffset={length * (1 - draw(t, at, span))} opacity={opacity}/>;
}

function Paper({x, y, width = 600, height = 670, angle = -7, children, folded = false}: {
  x: number; y: number; width?: number; height?: number; angle?: number; children?: React.ReactNode; folded?: boolean;
}) {
  return <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <defs><linearGradient id="p-history-paper" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ead6a9"/><stop offset=".5" stopColor="#c9ac76"/><stop offset="1" stopColor="#a3814d"/></linearGradient></defs>
    <path d={`M${-width / 2 + 15} ${-height / 2 + 18}H${width / 2 + 20}V${height / 2 + 26}H${-width / 2 + 15}Z`} fill="#000" opacity=".48"/>
    <path d={`M${-width / 2} ${-height / 2}H${width / 2}L${width / 2 - 8} ${height / 2}H${-width / 2 + 5}Z`} fill="url(#p-history-paper)" stroke="#edd9aa" strokeWidth="2"/>
    <path d={`M${-width / 2 + 30} ${-height / 2 + 30}H${width / 2 - 30}V${height / 2 - 30}H${-width / 2 + 30}Z`} fill="none" stroke="#715832" strokeWidth="2"/>
    {folded && <path d={`M${width / 2 - 100} ${-height / 2}L${width / 2 - 108} ${height / 2}L${width / 2 - 67} ${height / 2 - 5}L${width / 2 - 60} ${-height / 2}Z`} fill="#8c6b3a" opacity=".32"/>}
    {children}
  </g>;
}

function Stamp({x, y, t, at = .25, size = 160, text = '入狱', angle = -12}: {
  x: number; y: number; t: number; at?: number; size?: number; text?: string; angle?: number;
}) {
  const p = pop(t, at, .1);
  return <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${1 + .42 * (1 - p)})`} opacity={p}>
    <rect x={-size / 2} y={-size / 2} width={size} height={size} rx="3" fill={RED}/>
    <rect x={-size / 2 + 10} y={-size / 2 + 10} width={size - 20} height={size - 20} fill="none" stroke="#ecd2a4" strokeWidth="3"/>
    <text y={size * .13} fontSize={size * .32} textAnchor="middle" fill="#f5e3bc" letterSpacing="3">{text}</text>
  </g>;
}

function stepPoint(t: number): Pt {
  const distance = clamp(t / .75) * 1295;
  if (distance < 220) return {x: 600 + distance, y: 540};
  if (distance < 345) return {x: 820, y: 540 + distance - 220};
  if (distance < 565) return {x: 820 + distance - 345, y: 665};
  if (distance < 695) return {x: 1040, y: 665 + distance - 565};
  return {x: 1040 + distance - 695, y: 795};
}

function RainStreaks({t, count = 58, opacity = .45}: {t: number; count?: number; opacity?: number}) {
  return <g opacity={opacity}>{Array.from({length: count}, (_, i) => {
    const x = 170 + (i * 277.3) % 1640, y = 95 + (i * 159.7 + t * (410 + i % 6 * 35)) % 765;
    return <path key={i} d={`M${x} ${y}l-20 68`} stroke={i % 5 ? GOLD : WHITE} strokeWidth={i % 3 ? 2 : 3} opacity={.28 + (i % 5) * .11}/>;
  })}</g>;
}

/** Four separate viewpoints: impact → accusation → downpour → a composed figure. */
export function Hook({shot, t}: SceneProps) {
  if (shot === 0) {
    const fall = smooth(t / .4), impact = Math.max(0, t - .4);
    return <g>
      <Label x={135} y={195} size={48} color={WHITE}>如果人生</Label>
      <Label x={130} y={357} size={132}>突然坠落</Label>
      <path d="M145 420H610L695 505" fill="none" stroke={GOLD} strokeWidth="3"/>
      <circle cx="695" cy="505" r="6" fill={GOLD}/>
      <Artifact kind="seal" x={1250} y={425 - 175 * (1 - fall)} size={1450} index={Math.min(29, t * 18)}/>
      <ellipse cx="1250" cy="842" rx={330 + impact * 340} ry={25 + impact * 45} fill="none" stroke={GOLD} strokeWidth="3" opacity={clamp(1 - impact / .9) * (t >= .4 ? .8 : 0)}/>
      <path d="M730 845H1760" stroke={GOLD} strokeWidth="3" opacity=".55"/>
      {Array.from({length: 13}, (_, i) => <path key={i} d={`M${815 + i * 76} 845l${(i - 6) * impact * 20} ${-Math.sin(Math.min(1, impact) * Math.PI) * (22 + i % 4 * 18)}`} stroke={GOLD} strokeWidth="3" opacity={clamp(1 - impact / .75) * (t >= .4 ? 1 : 0)}/>)}
      <QuickText text="你会慌吗？" x={138} y={760} size={75} t={t} at={.38} color={WHITE}/>
    </g>;
  }
  if (shot === 1) return <g>
    <Paper x={1110} y={463} width={760} height={650} angle={-8 + 2 * out(t / .5)}>
      <Label x={-290} y={-188} size={64} color={ink}>乌台诗案</Label>
      {Array.from({length: 9}, (_, i) => <path key={i} d={`M${-270 + i * 65} -115v${205 + i % 3 * 55}`} stroke={ink} strokeWidth={i % 3 ? 5 : 9} opacity=".34"/>)}
      <Stamp x={184} y={128} t={t} at={-.1} size={205} text="入狱"/>
    </Paper>
    <Label x={140} y={310} size={62} color={WHITE}>曾经的文坛名士</Label>
    <QuickText x={135} y={470} size={133} text="一朝入狱" t={t} at={-.18}/>
    <Lines d="M145 536H675" t={t} at={.24} span={.16} color={RED} width={7}/>
    <Label x={145} y={799} size={40} color={WHITE}>1079 · 苏轼</Label>
  </g>;
  if (shot === 2) return <g>
    <RainStreaks t={t} count={85} opacity={.78}/>
    <circle cx="960" cy="505" r="295" fill="#0b0d0d" stroke={GOLD} strokeWidth="3"/>
    <circle cx="960" cy="505" r={300 + (t % .55) * 110} fill="none" stroke={GOLD} strokeWidth="2" opacity={.45 * (1 - t % .55 / .55)}/>
    <Label x={960} y={598} size={258} anchor="middle">慌？</Label>
    <Label x={156} y={217} size={52} color={WHITE}>雨迎面砸来</Label>
    <path d="M152 254H507L633 376" fill="none" stroke={GOLD} strokeWidth="3"/>
    <Label x={1720} y={833} size={52} anchor="end" color={WHITE}>脚步先乱了</Label>
  </g>;
  return <g>
    <RainStreaks t={t} count={50} opacity={.32}/>
    <Artifact kind="cloak" x={1370} y={470} size={1080} angle={-4 + .6 * Math.sin(t * 2.8)}/>
    <path d="M995 870Q1330 795 1690 869" fill="none" stroke={GOLD} strokeWidth="3"/>
    <Label x={140} y={250} size={64} color={WHITE}>跌到谷底</Label>
    <Label x={132} y={420} size={132}>他为何</Label>
    <QuickText x={132} y={606} size={163} text="不慌？" t={t} at={-.18}/>
    <Label x={145} y={831} size={45} color={WHITE}>答案，藏在一场雨里。</Label>
  </g>;
}

/** One typographic close-up followed by an open scroll, rather than a long title hold. */
export function TitleScene({shot, t}: SceneProps) {
  if (shot === 0) return <g>
    <RainStreaks t={t} count={61} opacity={.28}/>
    <circle cx="650" cy="500" r="356" fill="#0c0e0e" stroke={GOLD} strokeWidth="3"/>
    <circle cx="650" cy="500" r="376" fill="none" stroke={GOLD} strokeWidth="2" opacity=".35"/>
    <Label x={650} y={698} size={560} anchor="middle">定</Label>
    <Label x={1180} y={400} size={145}>风波</Label>
    <Label x={1190} y={514} size={44} color={WHITE}>苏轼 · 元丰五年</Label>
    <Lines d="M1140 650C1300 600 1510 700 1725 620" t={t} span={.5} width={4}/>
    <Label x={1190} y={790} size={44} color={WHITE}>风雨中，先定住自己。</Label>
  </g>;
  return <g>
    <Artifact kind="scroll" x={980} y={493} size={1570} index={4 + Math.min(3, t * 3)} angle={-3}/>
    <g transform={`translate(0 ${-7 * out(t / .2)})`}>
      <text x="970" y="580" textAnchor="middle" fontSize="220" fill="#42331d" letterSpacing="24">定风波</text>
      <text x="970" y="645" textAnchor="middle" fontSize="42" fill="#604a28" letterSpacing="6">莫听穿林打叶声</text>
    </g>
    <Label x={160} y={170} size={45} color={WHITE}>苏轼</Label>
    <Label x={1760} y={865} size={40} color={WHITE} anchor="end">1082 · 黄州</Label>
  </g>;
}

/** Six compositions, each tied to one historical fact or one clear consequence. */
export function History({shot, t}: SceneProps) {
  if (shot === 0) return <g>
    <Label x={145} y={190} size={90}>1079</Label>
    <Label x={140} y={340} size={110} color={WHITE}>因诗入狱</Label>
    <Label x={145} y={442} size={42}>乌台诗案</Label>
    <Paper x={1265} y={495} width={700} height={675} angle={-8}>
      <text x="10" y="120" fontSize="340" textAnchor="middle" fill={ink}>诗</text>
      <path d="M-270-260V245M270-260V245" stroke={ink} strokeWidth="2" opacity=".4"/>
      <Lines d="M-205-145L205 175M-195 185L218-135" t={t} at={.2} span={.17} color={RED} width={14}/>
    </Paper>
    <Lines d="M155 595H680L891 480" t={t} at={.4} width={4} span={.35}/>
    <QuickText text="诗文，被指为罪名。" x={145} y={781} size={54} t={t} at={.35} color={WHITE}/>
  </g>;
  if (shot === 1) return <g>
    <Paper x={735} y={505} width={780} height={620} angle={-13}>
      <Label x={-280} y={-140} size={83} color={ink}>乌台诗案</Label>
      {Array.from({length: 7}, (_, i) => <path key={i} d={`M${-260 + i * 81} -50v${185 + i % 2 * 30}`} stroke={ink} strokeWidth={i % 2 ? 4 : 8} opacity=".32"/>)}
    </Paper>
    <Paper x={1050 + 45 * (1 - out(t / .22))} y={500} width={660} height={620} angle={8 - 4 * out(t / .22)} folded>
      <Label x={-235} y={-135} size={63} color={ink}>审讯 · 入狱</Label>
      <path d="M-235-80H230M-235-60H145" stroke={ink} strokeWidth="3" opacity=".5"/>
      <Stamp x={112} y={113} t={t} at={-.1} size={228} text="入狱" angle={-10}/>
    </Paper>
    <Label x={1480} y={318} size={78} color={WHITE}>人生</Label>
    <Label x={1480} y={440} size={92}>骤然</Label>
    <QuickText x={1480} y={565} size={92} text="转向" t={t} at={.25}/>
    <Label x={145} y={165} size={49}>1079</Label>
    <path d="M1484 650H1740" stroke={GOLD} strokeWidth="4"/>
  </g>;
  if (shot === 2) {
    const route = draw(t, .1, .65);
    return <g>
      <Label x={135} y={260} size={187}>1080</Label>
      <Label x={145} y={379} size={74} color={WHITE}>贬居黄州</Label>
      <Label x={145} y={460} size={38}>元丰三年</Label>
      <g opacity=".25">{Array.from({length: 9}, (_, i) => <path key={i} d={`M${690 - i * 20} ${165 + i * 52}C${1070 + i * 23} ${62 + i * 78},${1090 - i * 25} ${480 + i * 17},${1760 - i * 12} ${405 + i * 53}`} fill="none" stroke={GOLD} strokeWidth="2"/>)}</g>
      <path d={historyRoute} fill="none" stroke={GOLD} strokeWidth="5" strokeDasharray={`${historyRouteLength} ${historyRouteLength}`} strokeDashoffset={historyRouteLength * (1 - route)}/>
      <circle cx="710" cy="253" r="12" fill={GOLD}/>
      <Label x={760} y={228} size={55} color={WHITE}>京城</Label>
      <g opacity={pop(t, .63)}><circle cx="1550" cy="751" r="14" fill={GOLD}/><circle cx="1550" cy="751" r="39" fill="none" stroke={GOLD} strokeWidth="3"/><Label x={1480} y={665} size={94}>黄州</Label></g>
      <Label x={145} y={825} size={47} color={WHITE}>离开京城，远赴江边。</Label>
    </g>;
  }
  if (shot === 3) return <g>
    <Artifact kind="seal" x={510} y={422} size={1320} index={7 + out(t / .5) * 8}/>
    <Label x={1070} y={238} size={47} color={WHITE}>名为</Label>
    <Label x={1060} y={371} size={110}>团练副使</Label>
    <path d="M1070 415H1745" stroke={GOLD} strokeWidth="3" opacity=".8"/>
    <Label x={1070} y={596} size={96} color={WHITE}>签署公事</Label>
    <Lines d="M1045 552L1750 606" t={t} at={0} span={.16} color={RED} width={11}/>
    <QuickText x={1070} y={742} size={78} text="不得" t={t} at={-.18} color={RED}/>
    <path d="M194 831H742M821 831H1745" stroke={GOLD} strokeWidth="4"/>
    <g transform={`translate(${16 * pop(t, .4)} 0)`}><path d="M742 831l22-31M800 863l21-32" fill="none" stroke={RED} strokeWidth="5"/></g>
  </g>;
  if (shot === 4) return <g>
    <Paper x={950} y={483} width={1390} height={660} angle={-3 + .5 * out(t / .3)}>
      <Label x={-591} y={-200} size={45} color={ink}>贬谪后的处境</Label>
      <path d="M-585-155H574" stroke="#715832" strokeWidth="2"/>
      <Label x={-575} y={-35} size={96} color={ink}>本州安置</Label>
      <Label x={-575} y={150} size={96} color={ink}>不得签书公事</Label>
      <Lines d="M-578 190H140" t={t} at={.25} span={.22} width={8} color={RED}/>
      <Stamp x={480} y={154} size={170} t={t} at={.45} text="贬谪" angle={-8}/>
    </Paper>
    <Label x={155} y={878} size={46} color={WHITE}>有官衔，却无法履行官职。</Label>
  </g>;
  return <g>
    <Artifact kind="seal" x={460} y={280 - 25 * out(t / .25)} size={790} angle={-7}/>
    <Label x={156} y={632} size={79} color={WHITE}>离开官场</Label>
    <path d="M600 540H820V665H1040V795H1640" fill="none" stroke={GOLD} strokeWidth="5"/>
    <circle cx={stepPoint(t).x} cy={stepPoint(t).y} r="9" fill={GOLD}/>
    <Label x={1035} y={325} size={56} color={WHITE}>眼前的难题</Label>
    <Label x={1020} y={584} size={230}>谋生</Label>
    <QuickText x={1120} y={871} size={44} text="从官场，到一片荒地。" t={t} at={.25} color={WHITE}/>
  </g>;
}

type Pt = {x: number; y: number};
const point = ({x, y}: Pt) => `${x},${y}`;
function field(u: number, v: number): Pt {
  return {x: 300 + v * 230 + u * (1120 + v * 130), y: 490 + v * 345 - u * (180 - v * 35)};
}

function Sprout({x, y, p, size = 1}: {x: number; y: number; p: number; size?: number}) {
  const k = clamp(p);
  return <g transform={`translate(${x} ${y}) scale(${size})`} opacity={clamp(k * 5)}>
    <path d={`M0 0Q-10 ${-80 * k} 3 ${-144 * k}`} stroke="#d4be87" strokeWidth="5" fill="none"/>
    <path d={`M0 ${-48 * k}C${-70 * k} ${-125 * k},${-98 * k} ${-76 * k},${-100 * k} ${-68 * k}Q${-40 * k} ${-19 * k} 0 ${-48 * k}Z`} fill="#9c8958" stroke="#e7d4a1" strokeWidth="2"/>
    <path d={`M0 ${-100 * k}C${75 * k} ${-188 * k},${112 * k} ${-125 * k},${116 * k} ${-107 * k}Q${58 * k} ${-66 * k} 0 ${-100 * k}Z`} fill="#b9a36b" stroke="#ead6a4" strokeWidth="2"/>
    <path d={`M-74 ${-69 * k}L0 ${-49 * k}M1 ${-100 * k}L89 ${-117 * k}`} stroke="#e2d7a0" strokeWidth="2" opacity={k}/>
  </g>;
}

function Soil({t, plants = false}: {t: number; plants?: boolean}) {
  const a = field(0, 0), b = field(1, 0), c = field(1, 1), d = field(0, 1);
  return <g>
    <defs><linearGradient id="p-soil" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#75603d"/><stop offset=".45" stopColor="#453b28"/><stop offset="1" stopColor="#2b2a20"/></linearGradient></defs>
    <path d={`M${point(a)}L${point(d)}L${d.x},${d.y + 35}L${a.x},${a.y + 26}Z`} fill="#3d3020" stroke="#9a7b4a" strokeWidth="2"/>
    <path d={`M${point(d)}L${point(c)}L${c.x},${c.y + 30}L${d.x},${d.y + 35}Z`} fill="#201e17" stroke="#81673e" strokeWidth="2"/>
    <polygon points={[a, b, c, d].map(point).join(' ')} fill="url(#p-soil)" stroke="#b5945a" strokeWidth="3"/>
    {Array.from({length: 8}, (_, i) => {
      const v = .055 + i * .12, p = field(.02, v), q = field(.98, v);
      return <g key={i}><path d={`M${point(p)}L${point(q)}`} stroke="#1c1b13" strokeWidth="12"/><path d={`M${p.x} ${p.y - 5}L${q.x} ${q.y - 5}`} stroke="#b49359" strokeWidth="3"/></g>;
    })}
    {Array.from({length: 100}, (_, i) => {const p = field(((i * 37 + 11) % 100) / 100, ((i * 53 + 19) % 100) / 100); return <ellipse key={i} cx={p.x} cy={p.y} rx={2 + i % 5} ry={1.2 + i % 3} fill={i % 3 ? '#d3ae6b' : '#11150f'} opacity=".42"/>;})}
    {plants && Array.from({length: 36}, (_, i) => {const p = field(.08 + i % 9 * .103, .13 + Math.floor(i / 9) * .235); return <Sprout key={i} x={p.x} y={p.y} p={.58 + .42 * pop(t, i * .016, .38)} size={.47 + Math.floor(i / 9) * .055}/>;})}
  </g>;
}

/** Soil strike, seed macro, growing root, then a populated field: four distinct scales. */
export function Cultivate({shot, t}: SceneProps) {
  if (shot === 0) {
    const p = 1 - .12 * Math.exp(-t * 13) * Math.sin(t * 34), hit = t;
    return <g>
      <Label x={143} y={182} size={77}>1081</Label>
      <Label x={140} y={314} size={105} color={WHITE}>躬耕东坡</Label>
      <Soil t={t}/>
      <g transform={`translate(1140 590) rotate(${-39 * (1 - p)} -120 -280)`}>
        <path d="M-225-445-207-453 14-10-2 0Z" fill="#b79a60" stroke="#f0d6a0" strokeWidth="2"/>
        <path d="M-76-34 64 0 70 30-74 0Z" fill="#a8a489" stroke="#e6dcb7" strokeWidth="3"/>
        <path d="M-74 0 70 30 51 75-88 44Z" fill="#565d50" stroke="#c2bfa1" strokeWidth="3"/>
        <path d="M-88 44 51 75" stroke="#f2e5bc" strokeWidth="5"/>
      </g>
      {Array.from({length: 22}, (_, i) => <ellipse key={i} cx={1140 + (i - 11) * hit * 40} cy={620 - (100 + i % 4 * 45) * hit + 340 * hit * hit} rx={4 + i % 4} ry={2 + i % 3} fill={GOLD} opacity={clamp(1 - hit / .65)}/>)}
      <QuickText x={1470} y={209} size={52} text="把日子种下" t={t} at={.31} color={WHITE}/>
    </g>;
  }
  if (shot === 1) {
    const fall = smooth((t - .08) / .34), root = draw(t, .44, .8);
    return <g>
      <Label x={145} y={221} size={109}>种下</Label>
      <Label x={150} y={311} size={46} color={WHITE}>先做眼前能做的事。</Label>
      <path d="M255 580Q450 548 650 583T1055 571T1690 582L1690 875H255Z" fill="#463924" stroke="#a78c57" strokeWidth="3"/>
      {Array.from({length: 72}, (_, i) => <ellipse key={i} cx={280 + i * 123.7 % 1390} cy={605 + i * 57.7 % 245} rx={3 + i % 4} ry={2 + i % 3} fill={i % 3 ? '#d2ad67' : '#1c1c12'} opacity=".34"/>)}
      <g transform={`translate(1090 ${315 + 244 * fall}) rotate(${25 - 42 * fall})`}>
        <ellipse rx="43" ry="69" fill="#c8a463" stroke="#f0d29a" strokeWidth="3"/>
        <path d="M2-51Q-16 0-1 50" fill="none" stroke="#735129" strokeWidth="5"/>
      </g>
      <path d={cultivateRoot} fill="none" stroke="#e8d4a4" strokeWidth="4" strokeDasharray={`${cultivateRootLength} ${cultivateRootLength}`} strokeDashoffset={cultivateRootLength * (1 - root)}/>
      <Lines d="M1410 390H1535V556" t={t} at={.48} span={.3} width={3}/>
      <QuickText x={1400} y={339} size={44} text="一粒种子" t={t} at={.42} color={WHITE}/>
    </g>;
  }
  if (shot === 2) {
    const p = .5 + .5 * out(t / .9);
    return <g>
      <Label x={145} y={207} size={99}>重新扎根</Label>
      <Label x={153} y={325} size={48} color={WHITE}>生活困顿时</Label>
      <Label x={153} y={402} size={48} color={WHITE}>就从土地里谋生。</Label>
      <path d="M220 797C630 768 1160 806 1730 780" stroke={GOLD} strokeWidth="4" fill="none"/>
      <Sprout x={1200} y={788} p={p} size={3.65}/>
      <path d="M1200 793L1153 838M1200 793L1227 854M1195 810L1110 857M1216 826L1289 863" fill="none" stroke={GOLD} strokeWidth="4"/>
      <Lines d="M189 586H650L848 686" t={t} at={.25} span={.4} width={3}/>
      <QuickText x={153} y={558} size={57} text="生长，还在继续。" t={t} at={.2}/>
    </g>;
  }
  return <g>
    <Soil t={t} plants/>
    <Label x={144} y={184} size={45} color={WHITE}>黄州 · 东坡</Label>
    <Label x={142} y={325} size={118}>东坡居士</Label>
    <Lines d="M1190 195H1730M1190 211H1540" t={t} span={.3} width={3}/>
    <QuickText x={1190} y={290} size={43} text="新的名字，新的自己。" t={t} at={.18} color={WHITE}/>
    <g opacity={pop(t, .4)}><circle cx="1680" cy="813" r="35" fill="#0f100e" stroke={GOLD} strokeWidth="3"/><Label x={1680} y={828} size={38} anchor="middle">生</Label></g>
  </g>;
}
