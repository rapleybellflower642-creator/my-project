import React, {useId} from 'react';

export type JourneyMode = 'storm' | 'companions' | 'walk' | 'cold' | 'sun' | 'lookback' | 'freedom';

const GOLD = '#d6bb81';
const JADE = '#6ea99e';
const INK = '#090d10';
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const hash = (i: number) => ((i * 739 + 163) % 997) / 997;

type PersonProps = {
  t: number;
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  cold?: boolean;
  rushing?: boolean;
  back?: boolean;
  still?: boolean;
  warm?: number;
  muted?: boolean;
};

/** An ordinary scholar's robe and cloth cap: the preface says the rain gear went ahead. */
const Scholar: React.FC<PersonProps> = ({t, x, y, scale = 1, facing = 1, cold = false, rushing = false, back = false, still = false, warm = 0, muted = false}) => {
  const id = `scholar-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const p = t * (rushing ? 8.6 : 4.6);
  const gait = still ? 0 : Math.sin(p);
  const sway = still ? Math.sin(t * 1.8) * 1 : Math.sin(p) * 2;
  const wind = Math.sin(t * 3.2) * 7 + Math.sin(t * 1.7) * 4;
  const bob = still ? 0 : -Math.abs(Math.cos(p)) * (rushing ? 6 : 2.5);
  const coat = muted ? '#45524c' : '#637773';
  const headTurn = back ? -1 : 1;
  const skin = muted ? '#998f78' : '#c0ae88';
  const stroke = '#263a37';
  const coldPull = cold ? 2 + Math.sin(t * 2.7) * 3 : 0;
  return <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
    <defs>
      <linearGradient id={`${id}-robe`} x1="0" x2="1" y2="0.15">
        <stop stopColor="#293d3d"/><stop offset="0.32" stopColor={coat}/><stop offset="0.62" stopColor="#435c57"/><stop offset="1" stopColor="#243b38"/>
      </linearGradient>
      <linearGradient id={`${id}-sleeve`} x1="0" x2="1" y2="0.65"><stop stopColor="#7c8775"/><stop offset="0.5" stopColor="#50675d"/><stop offset="1" stopColor="#2a423c"/></linearGradient>
      <linearGradient id={`${id}-face`} x1="0" x2="1"><stop stopColor="#75816c"/><stop offset="0.6" stopColor={skin}/><stop offset="1" stopColor="#d3be97"/></linearGradient>
    </defs>
    <ellipse cx="7" cy="2" rx="81" ry="11" fill="#030807" opacity="0.65"/>
    <ellipse cx="13" cy="6" rx="112" ry="5" fill="#020706" opacity="0.24"/>
    {[0, 1].map((i) => {
      const phase = p + i * Math.PI;
      const stride = still ? (i ? 15 : -19) : Math.sin(phase) * (rushing ? 48 : 30);
      const lift = still ? 0 : Math.pow(Math.max(0, Math.cos(phase)), 1.8) * (rushing ? 24 : 12);
      const hip = i ? 21 : -20;
      const ankle = hip + stride;
      return <g key={i}>
        <path d={`M ${hip - 14} -151 Q ${hip + stride * 0.55 - 9} -78 ${ankle - 9} ${-20 - lift} L ${ankle + 11} ${-19 - lift} Q ${hip + stride * 0.6 + 13} -76 ${hip + 14} -153 Z`} fill={i ? '#4a5b4b' : '#293d35'} stroke={stroke} strokeWidth="2"/>
        <path d={`M ${ankle - 10} ${-26 - lift} l 23 1 l 2 23 l -25 -2 Z`} fill={i ? '#aaa88b' : '#747d64'}/>
        <path d={`M ${ankle - 12} ${-6 - lift} Q ${ankle - 7} ${-13 - lift} ${ankle + 7} ${-8 - lift} Q ${ankle + 17} ${-8 - lift} ${ankle + 28} ${-3 - lift} L ${ankle + 42} ${-1 - lift} Q ${ankle + 44} ${6 - lift} ${ankle + 33} ${7 - lift} L ${ankle - 13} ${5 - lift} Z`} fill={i ? '#a19363' : '#746f4d'} stroke="#29382c" strokeWidth="2"/>
        <path d={`M ${ankle + 3} ${-7 - lift} l 13 12 M ${ankle + 11} ${-5 - lift} l 13 10 M ${ankle - 8} ${3 - lift} l 43 1`} stroke="#c0b086" strokeWidth="1.7" opacity="0.65"/>
      </g>;
    })}
    <g transform={`translate(${cold ? Math.sin(t * 17) * 0.8 : 0} ${bob}) rotate(${rushing ? 9 + gait * 1.5 : sway * 0.35} 0 -230)`}>
      {/* Heavy lower folds remain grounded while the hem catches the moving air. */}
      <path d={`M -50 -345 Q -64 -292 -63 -250 Q -56 -180 ${-89 + wind} -77 Q -75 -68 -56 -74 Q -36 -57 -9 -69 Q 18 -59 39 -71 Q 62 -61 81 -81 Q 62 -157 63 -215 Q 77 -290 46 -346 Z`} fill={`url(#${id}-robe)`} stroke={stroke} strokeWidth="2.4"/>
      <path d={`M -35 -239 Q -37 -164 ${-63 + wind * 0.5} -76 M -11 -257 Q -23 -168 -12 -70 M 17 -260 Q 13 -163 28 -74 M 43 -260 Q 39 -170 62 -79`} fill="none" stroke="#a3ac96" strokeWidth="2.3" opacity="0.36"/>
      <path d={`M -52 -253 Q -52 -153 ${-72 + wind * 0.3} -77 M -4 -225 Q -11 -131 -3 -74 M 31 -244 Q 32 -149 45 -76`} fill="none" stroke="#183730" strokeWidth="5" opacity="0.65"/>
      <path d={`M ${-86 + wind} -78 Q -69 -70 -54 -78 Q -36 -64 -10 -74 Q 16 -64 38 -77 Q 61 -67 77 -83`} fill="none" stroke="#a3af93" strokeWidth="1.2" opacity="0.45"/>
      {/* Wrapped cross-collar, tied waist and a broad draping far sleeve. */}
      <path d={`M -22 -370 Q -65 -357 -83 -309 Q -94 -276 ${-93 + wind * 0.3} -245 Q -80 -225 -59 -236 L -42 -292 L 32 -274 L 67 -320 Q 57 -353 22 -369 Z`} fill={`url(#${id}-sleeve)`} stroke={stroke} strokeWidth="2"/>
      <path d="M -30 -364 L 16 -328 L 31 -349 L 15 -372 L -3 -356 L -17 -373 Z" fill="#b1b49a"/>
      <path d="M -30 -363 L 15 -326 L 45 -351 M -26 -354 L 11 -319 L 41 -339" stroke="#41584e" strokeWidth="2" fill="none"/>
      <path d="M -43 -320 Q -35 -292 -41 -265 M -67 -303 Q -77 -267 -72 -243 M 17 -323 Q 13 -301 6 -282" stroke="#a0a98e" opacity="0.45" strokeWidth="2" fill="none"/>
      <path d="M -56 -265 Q -3 -252 57 -266 L 55 -253 Q -2 -239 -57 -253 Z" fill="#253e32"/>
      <path d="M -49 -260 Q 5 -249 51 -261" stroke="#a0a486" opacity="0.5" fill="none" strokeWidth="1.6"/>
      <path d={`M 0 -252 Q ${-16 + wind * 0.3} -219 -6 -190 M 6 -252 Q ${23 + wind * 0.2} -225 16 -203`} fill="none" stroke="#aea077" strokeWidth="3"/>
      {/* A narrow black Dongpo-style cloth cap, long beard and expressive three-quarter face. */}
      <g transform={`translate(1 -383) scale(${headTurn} 1) rotate(${cold ? 5 : rushing ? 8 : -2})`}>
        <path d="M -25 -64 Q -10 -84 18 -72 Q 34 -64 35 -46 Q 30 -35 38 -24 L 46 -16 Q 46 -11 36 -10 L 33 6 Q 25 18 8 17 L 4 35 L -26 21 L -19 -4 Q -38 -20 -37 -40 Z" fill={`url(#${id}-face)`} stroke="#324338" strokeWidth="1.8"/>
        <path d="M -35 -47 Q -35 -66 -21 -73 Q -2 -84 23 -69 Q 32 -61 31 -49 Q 13 -56 7 -39 Q 0 -28 -8 -26 L -12 -4 L -28 -5 Q -24 -26 -34 -33 Z" fill="#1a2b26"/>
        <path d="M -17 -24 Q -8 -29 -5 -20 Q -3 -11 -12 -9 M -13 -21 l 2 7" fill="none" stroke="#76826a" strokeWidth="1.8"/>
        <path d="M 16 -34 q 9 -5 16 -1 M 19 -29 l 7 0 M 33 -18 l 4 3 M 24 0 q 5 2 9 -1" stroke="#495242" strokeWidth="1.7" fill="none" strokeLinecap="round"/>
        <path d="M 19 -5 Q 26 -1 35 -4 L 36 1 Q 26 5 17 0 Z" fill="#26352d"/>
        <path d={`M -13 -10 Q -15 12 -23 24 Q -14 29 -4 16 Q 7 27 28 11 Q 27 40 ${15 + wind * 0.2} 59 Q 1 48 -7 35 Q -25 31 -28 10 Z`} fill="#23362e"/>
        <path d={`M -7 15 Q -6 32 ${10 + wind * 0.12} 48 M 6 21 Q 6 37 ${17 + wind * 0.1} 50 M 21 16 Q 18 33 20 42 M -18 12 Q -20 24 -14 28`} stroke="#7c866b" strokeWidth="1.1" fill="none" opacity="0.52"/>
        <path d="M -39 -58 L -33 -99 Q -23 -115 4 -113 Q 25 -111 32 -96 L 35 -61 Q -2 -49 -39 -58 Z" fill="#152721" stroke="#4b6253" strokeWidth="2"/>
        <path d="M -32 -96 Q -1 -108 25 -96 M -28 -91 L -32 -64 M 6 -106 L 11 -62 M 24 -94 L 28 -66" stroke="#617260" strokeWidth="1.4" opacity="0.55" fill="none"/>
        <path d="M -41 -65 Q -5 -54 37 -63 L 36 -54 Q -3 -46 -42 -56 Z" fill="#293d30" stroke="#70806b" strokeWidth="1"/>
        <path d={`M -37 -58 Q -47 -26 ${-44 - wind * 0.4} -6 L ${-36 - wind * 0.3} -10 Q -35 -34 -29 -53`} fill="#293e33"/>
        <path d="M 32 -45 Q 36 -37 34 -30 M 35 -16 L 41 -14 M 33 -8 L 31 0" stroke="#f0d197" strokeWidth="2" fill="none" opacity={warm * 0.8}/>
      </g>
      {rushing ? <g>
        <path d="M 35 -351 Q 63 -340 71 -320 Q 73 -304 43 -309 Q 13 -326 1 -365 L 22 -382 Q 38 -361 44 -346 Z" fill={`url(#${id}-sleeve)`} stroke={stroke} strokeWidth="2"/>
        <path d="M 3 -365 L -7 -389 Q -3 -405 3 -405 L 13 -390 L 26 -382 L 17 -367 Z" fill={skin} stroke="#52614b" strokeWidth="1.3"/>
        <path d="M 42 -344 Q 59 -328 57 -315 M 22 -351 L 35 -326" stroke="#a0ad92" opacity="0.4" fill="none" strokeWidth="2"/>
      </g> : cold ? <g transform={`translate(0 ${coldPull})`}>
        <path d="M 43 -348 Q 70 -331 63 -303 Q 50 -276 18 -296 L -31 -331 L -19 -351 Q 10 -338 30 -322 Q 21 -339 43 -348 Z" fill={`url(#${id}-sleeve)`} stroke={stroke} strokeWidth="2"/>
        <path d="M -35 -341 Q -28 -356 -18 -357 L -10 -345 L -16 -333 Q -26 -330 -35 -341 Z" fill={skin}/>
        <path d="M -26 -349 l 8 8 M -29 -345 l 8 8 M 12 -317 Q 34 -294 52 -305" fill="none" stroke="#acb196" strokeWidth="2" opacity="0.6"/>
        <path d="M -26 -351 Q -31 -329 -12 -314" fill="none" stroke="#1d3830" strokeWidth="3"/>
      </g> : <g>
        {/* The staff stays a small part of a human action, never a separate object showcase. */}
        <g transform={`rotate(${still ? 0 : gait * 2} 93 -258)`}>
          <path d="M 99 -319 L 110 4" stroke="#a79e68" strokeWidth="5" strokeLinecap="round"/>
          <path d="M 100 -315 L 109 2" stroke="#d0ba7d" strokeWidth="1.2" opacity="0.7"/>
          {[-290, -245, -196, -145, -90, -34].map((yy) => <path key={yy} d={`M ${99 + (yy + 319) / 30} ${yy} l 6 1`} stroke="#364c32" strokeWidth="2"/>)}
        </g>
        <path d="M 38 -350 Q 62 -347 65 -316 Q 66 -289 76 -281 L 98 -281 L 103 -260 Q 75 -239 54 -259 Q 29 -285 27 -315 Z" fill={`url(#${id}-sleeve)`} stroke={stroke} strokeWidth="2"/>
        <path d="M 47 -329 Q 41 -294 59 -278 M 66 -274 Q 77 -261 95 -271" stroke="#a3ae93" strokeWidth="2" fill="none" opacity="0.55"/>
        <path d="M 94 -282 Q 99 -289 104 -286 L 110 -275 Q 110 -266 103 -264 L 98 -268 Z" fill={skin} stroke="#6c7355" strokeWidth="1.4"/>
        <path d="M 101 -280 l 7 3 M 102 -275 l 6 3" stroke="#626d52" strokeWidth="1"/>
      </g>}
      <path d="M 34 -350 Q 62 -337 64 -313 M 64 -213 Q 66 -141 78 -84" stroke="#ebd09a" strokeWidth="3" opacity={warm * 0.7} fill="none"/>
    </g>
  </g>;
};

const Bamboo: React.FC<{t: number; x: number; y: number; scale: number; flip?: boolean; opacity?: number}> = ({t, x, y, scale, flip = false, opacity = 1}) => <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) rotate(${Math.sin(t * 2.1 + x) * 1.1})`} opacity={opacity}>
  {[-17, 26, 67].map((base, j) => <g key={base}>
    <path d={`M ${base} 0 Q ${base + 6 + j * 14} -262 ${base + 45 + j * 12} -590`} stroke={j === 1 ? '#708c6b' : '#405e4e'} strokeWidth={8 - j * 1.7} fill="none"/>
    <path d={`M ${base + 2} 0 Q ${base + 9 + j * 14} -262 ${base + 48 + j * 12} -590`} stroke="#b2b081" strokeOpacity="0.34" strokeWidth="1.1" fill="none"/>
    {Array.from({length: 7}, (_, k) => {
      const yy = -65 - k * 72;
      const xx = base + (-yy / 590) * (45 + j * 12);
      return <g key={k}>
        <path d={`M ${xx - 5} ${yy} q 7 3 11 0`} fill="none" stroke="#a2b088" strokeOpacity="0.62" strokeWidth="2"/>
        {k > 1 && <g transform={`translate(${xx} ${yy}) rotate(${(k % 2 ? -1 : 1) * (35 + j * 9) + Math.sin(t * 3 + k) * 2.2})`}>
          <path d="M 0 0 Q 37 -21 92 -28" fill="none" stroke="#719373" strokeWidth="1.5"/>
          {[0, 1, 2, 3, 4].map((n) => <g key={n} transform={`translate(${13 + n * 16} ${-6 - n * 5})`}>
            <path d={`M 0 0 Q ${-2 + n} -18 ${5 + n * 2} -35 Q 12 -12 0 0 Z`} fill={n % 2 ? '#769679' : '#526f60'}/>
            <path d={`M 1 0 Q 10 10 ${30 - n} 12 Q 18 -2 1 0 Z`} fill={n % 2 ? '#405f4c' : '#729278'}/>
          </g>)}
        </g>}
      </g>;
    })}
  </g>)}
</g>;

const Pine: React.FC<{x: number; y: number; scale: number; t: number}> = ({x, y, scale, t}) => <g transform={`translate(${x} ${y}) scale(${scale})`}>
  <path d="M -18 0 Q 17 -98 10 -176 Q -1 -233 28 -278 Q 20 -204 31 -159 Q 41 -88 4 0 Z" fill="#2d4038" stroke="#6c7d5c" strokeWidth="2"/>
  <path d="M 18 -161 Q -46 -157 -86 -188 M 19 -182 Q 78 -211 130 -197 M 20 -233 Q -16 -251 -41 -243 M 25 -252 Q 77 -279 107 -260" fill="none" stroke="#596d50" strokeWidth="8" strokeLinecap="round"/>
  <path d="M 18 -160 Q -46 -157 -86 -188 M 19 -181 Q 78 -211 130 -197" fill="none" stroke="#9a9b6c" strokeWidth="1.6"/>
  {[-79, -38, 3, 52, 103, 135].map((cx, i) => <g key={cx} transform={`translate(${cx} ${-202 - Math.sin(i * 2) * 42}) rotate(${Math.sin(t * 1.7 + i) * 1.2})`}>
    <path d="M -59 7 Q -70 -2 -40 -12 Q -43 -29 -20 -26 Q -3 -45 11 -28 Q 37 -34 44 -20 Q 71 -20 68 -4 Q 44 9 8 12 Q -31 17 -59 7 Z" fill="#354e3e"/>
    {Array.from({length: 14}, (_, j) => <path key={j} d={`M ${-48 + j * 8} ${6 - Math.sin(j) * 4} l ${-6 + j % 4} ${-10 - (j % 3) * 4}`} stroke={j % 3 ? '#6b8060' : '#a0a273'} opacity="0.6" strokeWidth="1.3"/>)}
  </g>)}
</g>;

const Rain: React.FC<{t: number; intensity?: number; foreground?: boolean}> = ({t, intensity = 1, foreground = false}) => <g stroke={foreground ? '#bad1c4' : '#87a9a2'} strokeLinecap="round" opacity={intensity}>
  {Array.from({length: foreground ? 32 : 115}, (_, i) => {
    const speed = foreground ? 715 : 410 + (i % 7) * 29;
    const ry = ((hash(i * 7) * 900 + t * speed) % 850) + 100;
    const rx = ((hash(i * 13 + 3) * 2110 - t * speed * 0.33) % 2130 + 2130) % 2130 - 105;
    const length = foreground ? 39 + i % 22 : 13 + i % 17;
    return <path key={i} d={`M ${rx} ${ry} l ${-length * 0.29} ${length}`} strokeWidth={foreground ? 1.5 : 0.9} opacity={foreground ? 0.21 : 0.15 + (i % 4) * 0.04}/>;
  })}
</g>;

const Splashes: React.FC<{t: number; amount?: number}> = ({t, amount = 1}) => <g opacity={amount}>
  {Array.from({length: 26}, (_, i) => {
    const phase = (t * 1.25 + hash(i * 2)) % 1;
    const x = 200 + hash(i * 11) * 1510;
    const y = 704 + hash(i * 17) * 115;
    return <g key={i} opacity={(1 - phase) * 0.25}>
      <ellipse cx={x} cy={y} rx={4 + phase * 26} ry={1 + phase * 3.5} stroke={JADE} strokeWidth="1" fill="none"/>
      {phase < 0.22 && <path d={`M ${x - 4} ${y - 1} l -3 -5 M ${x + 4} ${y - 1} l 2 -4`} stroke="#b4c4ae" strokeWidth="1"/>}
    </g>;
  })}
</g>;

/** Full-size artwork layer; all scene motion is a pure function of local seconds. */
export const JourneyArt: React.FC<{t: number; mode: JourneyMode}> = ({t, mode}) => {
  const uid = `journey-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const u = (name: string) => `url(#${uid}-${name})`;
  const shot = Math.min(3, Math.floor(Math.max(0, t) / 2.2));
  const local = t - shot * 2.2;
  const sunny = mode === 'sun' || mode === 'freedom';
  const rain = mode === 'storm' ? 1 : mode === 'companions' ? 0.8 : mode === 'walk' ? 0.52 : mode === 'cold' ? 0.13 : mode === 'lookback' ? 0.09 : 0;
  const warm = sunny ? clamp((t + 0.4) / 2.3) : mode === 'lookback' ? 0.22 : 0;
  const lookback = mode === 'lookback';
  const freedom = mode === 'freedom';
  // Cuts alternate establishing, human action and widened consequence, at musical phrase speed.
  const personScale = mode === 'cold' ? [0.91, 1.04, 0.83, 0.91][shot] : freedom ? [0.71, 0.88, 0.63, 0.72][shot] : mode === 'sun' ? [0.88, 0.69, 0.95, 0.8][shot] : [0.84, 0.98, 0.78, 0.88][shot];
  const personX = mode === 'companions' ? [1010, 1250, 990, 1090][shot] : mode === 'cold' ? [1130, 990, 1210, 1130][shot] : lookback ? [1160, 990, 1230, 1160][shot] : freedom ? [1230, 1100, 1110, 1240][shot] : [1110, 1180, 1030, 1170][shot];
  const motionX = lookback || mode === 'cold' ? 0 : local * (mode === 'companions' ? 10 : 14);
  const mountainShift = (shot % 2 ? -55 : 0) - local * (sunny ? 6 : 3);
  const sunX = freedom ? 1320 : 1380;
  const sunY = freedom ? 361 : 326;
  const personY = freedom && shot === 2 ? 730 : 796;
  // Deliberate changes in shot size: establishing view, face/sleeve close-up,
  // wide landscape, then a medium moving shot. Text stays outside this camera.
  const lens = shot === 1 ? (mode === 'cold' ? 1.85 : 1.7) : shot === 2 ? .88 : shot === 3 ? 1.22 : 1;
  const camera = shot === 0 ? undefined : `translate(${shot===1?1170:1080} ${shot===1?465:490}) scale(${lens}) translate(${-personX-motionX} ${shot===1?-435:-490})`;
  return <svg width="1920" height="1080" viewBox="0 0 1920 1080" aria-hidden="true" style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    <defs>
      <linearGradient id={`${uid}-mountain`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={sunny ? '#45615a' : '#344e4c'} stopOpacity="0.85"/><stop offset="0.73" stopColor="#172d2d" stopOpacity="0.58"/><stop offset="1" stopColor={INK} stopOpacity="0"/></linearGradient>
      <linearGradient id={`${uid}-near`} x1="0" y1="0" x2="0.3" y2="1"><stop stopColor="#3d5d50"/><stop offset="0.4" stopColor="#1d3831"/><stop offset="1" stopColor="#0c1918"/></linearGradient>
      <linearGradient id={`${uid}-path`} x1="0.1" y1="1" x2="0.7" y2="0"><stop stopColor="#7b8067" stopOpacity="0.49"/><stop offset="0.6" stopColor={sunny ? '#b5a57c' : '#697e70'} stopOpacity="0.26"/><stop offset="1" stopColor="#a3a77d" stopOpacity="0.07"/></linearGradient>
      <linearGradient id={`${uid}-mist`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8ba99c" stopOpacity="0"/><stop offset="0.5" stopColor="#8ba99c" stopOpacity="0.06"/><stop offset="1" stopColor="#8ba99c" stopOpacity="0"/></linearGradient>
      <radialGradient id={`${uid}-sunlight`}><stop stopColor="#f4d192" stopOpacity="0.26"/><stop offset="0.24" stopColor="#ddc393" stopOpacity="0.12"/><stop offset="1" stopColor="#d0bc8b" stopOpacity="0"/></radialGradient>
      <linearGradient id={`${uid}-rays`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f2d198" stopOpacity="0.13"/><stop offset="1" stopColor="#d4be81" stopOpacity="0"/></linearGradient>
      <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="white" stopOpacity="0"/><stop offset="0.2" stopColor="white"/><stop offset="0.76" stopColor="white"/><stop offset="0.86" stopColor="white" stopOpacity="0"/></linearGradient>
      <mask id={`${uid}-safe`}><rect width="1920" height="1080" fill={u('fade')}/></mask>
      <linearGradient id={`${uid}-water`} x1="0" x2="1"><stop stopColor="#577f74" stopOpacity="0.04"/><stop offset="0.55" stopColor={sunny ? '#b4b08c' : JADE} stopOpacity="0.32"/><stop offset="1" stopColor="#49695a" stopOpacity="0.07"/></linearGradient>
    </defs>
    <g mask={u('safe')}>
      <g transform={camera}>
      {sunny && <g opacity={warm}>
        <ellipse cx={sunX} cy={sunY} rx="740" ry="480" fill={u('sunlight')}/>
        <path d={`M ${sunX - 90} ${sunY - 10} L 485 900 L 920 900 Z M ${sunX - 24} ${sunY} L 1120 960 L 1345 960 Z M ${sunX + 18} ${sunY} L 1510 940 L 1880 940 Z`} fill={u('rays')} opacity="0.8"/>
        <circle cx={sunX} cy={sunY} r={47 + warm * 6} fill="#dcc391" opacity="0.79"/>
        <path d={`M ${sunX - 42} ${sunY + 1} Q ${sunX} ${sunY - 19} ${sunX + 44} ${sunY + 2}`} stroke="#f3dba8" fill="none" strokeWidth="1" opacity="0.45"/>
      </g>}
      {/* Far peaks have irregular wet-ink contours and interior rock-face brushwork. */}
      <g transform={`translate(${mountainShift * 0.35} 0)`} opacity={sunny ? 0.73 : 0.5}>
        <path d="M -90 666 L -60 508 L 16 489 L 84 403 L 139 453 L 198 378 L 261 430 L 306 362 L 367 426 L 409 478 L 468 449 L 528 488 L 575 386 L 643 359 L 704 441 L 763 390 L 838 462 L 900 416 L 941 445 L 1003 529 L 1068 498 L 1134 419 L 1183 459 L 1238 416 L 1317 479 L 1367 395 L 1429 436 L 1482 375 L 1530 398 L 1593 343 L 1648 421 L 1699 397 L 1784 487 L 1855 438 L 1944 474 L 2010 663 Z" fill={u('mountain')}/>
        {Array.from({length: 33}, (_, i) => {
          const xx = -40 + i * 61;
          const yy = 439 + Math.sin(i * 1.76) * 51;
          return <path key={i} d={`M ${xx} ${yy} q ${12 + i % 11} 18 ${-8 + i % 23} 51 l ${16 - i % 17} 45 m 1 -57 l 17 25`} stroke={i % 3 ? '#839384' : '#1b3834'} strokeWidth={i % 3 ? 1 : 3} fill="none" opacity="0.18"/>;
        })}
      </g>
      <path d={`M -80 ${450 + Math.sin(t) * 4} Q 217 407 422 461 Q 680 489 869 439 Q 1155 396 1360 441 Q 1593 480 1980 431 L 1980 561 Q 1668 511 1428 558 Q 1180 590 944 538 Q 689 511 445 559 Q 176 592 -80 538 Z`} fill={u('mist')}/>
      {/* Lower mountains, weather streaks, river and a winding earth road establish a real place. */}
      <g transform={`translate(${mountainShift} 0)`}>
        <path d="M -120 710 Q -40 570 31 579 L 103 496 L 159 524 L 187 501 L 247 552 Q 282 573 346 620 L 383 572 L 437 561 L 521 633 L 578 595 L 639 608 L 732 712 Z" fill={u('near')} opacity="0.83"/>
        <path d="M 1288 726 L 1384 611 L 1450 599 L 1511 530 L 1560 546 L 1629 460 L 1689 486 L 1747 590 L 1821 607 L 1891 568 L 2010 699 L 2080 813 Z" fill={u('near')} opacity="0.79"/>
        <path d="M 82 518 L 73 564 L 29 633 M 158 542 L 128 602 L 147 631 M 243 573 L 208 621 L 229 652 M 1609 497 L 1602 549 L 1571 591 M 1679 509 L 1647 571 L 1670 609 M 1747 621 L 1740 657" fill="none" stroke="#78907a" strokeOpacity="0.19" strokeWidth="3"/>
        <path d="M 13 628 Q 98 592 163 629 M 122 665 Q 205 627 310 670 M 1520 644 Q 1601 609 1653 635 M 1660 664 Q 1751 648 1808 677" fill="none" stroke="#b1af81" strokeOpacity="0.16" strokeWidth="1.3"/>
      </g>
      <path d="M 178 697 Q 482 631 782 673 Q 1063 701 1265 657 Q 1462 620 1804 690 L 1940 836 Q 1536 784 1272 797 Q 975 823 703 758 Q 476 727 54 785 Z" fill={u('water')}/>
      {Array.from({length: 14}, (_, i) => {
        const yy = 681 + i * 8.2;
        const start = 250 + hash(i * 7) * 1240;
        return <path key={i} d={`M ${start + Math.sin(t * 1.2 + i) * 5} ${yy} q ${62 + i % 7 * 12} ${Math.sin(i) * 3} ${112 + i % 5 * 22} -1`} stroke={sunny ? '#b4bc97' : '#80a79a'} strokeWidth="1" opacity="0.14" fill="none"/>;
      })}
      {freedom && shot === 2 ? <path d="M 455 938 Q 736 776 850 749 Q 1013 656 1128 696 Q 1308 706 1450 814 L 1610 964 Z" fill="#263c32" stroke="#5b6f53" strokeWidth="1.5"/> : <path d="M -80 860 Q 331 751 625 780 Q 956 818 1334 713 Q 1483 674 1462 649 Q 1440 629 1339 632 Q 1483 628 1505 651 Q 1545 690 1406 735 Q 1262 794 1329 842 Q 1513 886 1928 870 L 1960 961 L -80 961 Z" fill={u('path')}/>}
      <path d="M -35 845 Q 314 756 624 786 Q 943 825 1327 721 M 1340 719 Q 1480 680 1479 654" stroke={sunny ? '#a29d70' : '#76927d'} strokeWidth="1.2" opacity="0.29" fill="none"/>
      <path d="M -20 921 Q 325 832 637 854 Q 1009 876 1285 795 Q 1265 833 1343 852 Q 1603 912 1940 875 L 1940 1040 L -20 1040 Z" fill="#0d1b18" opacity="0.84"/>
      {/* River rocks, moss, wild grass and low shrubs break up the broad ink washes. */}
      {[{x: 358, y: 748, s: 0.9}, {x: 701, y: 820, s: 0.58}, {x: 1453, y: 772, s: 1.1}, {x: 1708, y: 834, s: 0.8}].map(({x, y, s}, i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M -52 5 L -37 -19 L -11 -29 L 19 -23 L 50 -6 L 56 9 Q 2 22 -52 5 Z" fill="#31483e" stroke="#829077" strokeOpacity="0.4" strokeWidth="1.2"/>
        <path d="M -36 -16 L -7 -24 L 11 -10 L 45 -5 M -7 -24 L -15 5 M 11 -10 L 7 12" stroke="#83937d" strokeWidth="1.3" fill="none" opacity="0.4"/>
        <path d="M -31 -19 l 14 -4 M 17 -19 l 11 4" stroke="#7b9868" strokeWidth="4" opacity="0.44"/>
      </g>)}
      {Array.from({length: 22}, (_, i) => {
        const xx = 26 + hash(i * 3) * 1860;
        const yy = 811 + hash(i * 11) * 87;
        const bend = Math.sin(t * 2.6 + i) * 6;
        return <path key={i} d={`M ${xx} ${yy} q ${-9 + bend} -16 -18 -21 M ${xx} ${yy} q ${-3 + bend * 0.5} -19 3 -31 M ${xx} ${yy} q ${9 + bend} -15 22 -19`} fill="none" stroke={i % 3 ? '#4f7055' : '#8b956e'} strokeWidth={i % 3 ? 1.5 : 1.1} opacity="0.5"/>;
      })}
      {sunny && <Pine t={t} x={shot % 2 ? 210 : 315} y={743} scale={shot === 2 ? 0.92 : 1.22}/>}
      {!sunny && <Bamboo t={t} x={shot % 2 ? 162 : 235} y={864} scale={shot % 2 ? 1.13 : 0.93} opacity={0.7}/>}
      {(mode === 'storm' || mode === 'companions' || mode === 'walk') && <Bamboo t={t + 2} x={1881} y={885} scale={1.26} flip opacity={0.47}/>}
      {mode === 'companions' && <>
        <Scholar t={t + 0.7} x={570 + local * 63} y={752} scale={0.57} rushing muted/>
        <Scholar t={t + 1.85} x={735 + local * 75} y={768} scale={0.64} rushing muted/>
        <path d={`M ${536 + local * 63} 760 l -17 4 M ${718 + local * 75} 777 l -18 4`} stroke="#a2b9a2" strokeOpacity="0.2" strokeWidth="2"/>
      </>}
      {mode === 'storm' && <Scholar t={t + 0.5} x={672 + local * 52} y={748} scale={0.57} rushing muted/>}
      <Scholar t={t} x={personX + motionX} y={personY} scale={personScale} cold={mode === 'cold'} back={lookback && t > 1.1} still={lookback || (freedom && shot === 2)} warm={warm}/>
      {mode === 'cold' && <g opacity="0.37" fill="none" stroke="#abc4ba" strokeWidth="1.3">
        <path d={`M 1620 ${503 + Math.sin(t * 1.4) * 8} Q 1470 477 1421 489 Q 1380 505 1464 517`}/>
        <path d={`M 1790 ${610 + Math.sin(t * 1.4) * 8} Q 1581 562 1431 575`}/>
      </g>}
      {lookback && <g opacity={clamp((t - 2) / 2) * 0.37}>
        {/* The distant route holds the rain while the foreground opens to clear air. */}
        <path d="M 381 440 Q 468 409 555 440 Q 636 392 725 430 Q 804 420 869 462 L 847 507 Q 747 474 659 494 Q 512 474 402 503 Z" fill="#758c83" opacity="0.25"/>
        {Array.from({length: 23}, (_, i) => <path key={i} d={`M ${391 + i * 19} ${504 + ((t * 104 + i * 37) % 123)} l -5 17`} stroke={JADE} strokeWidth="1" opacity="0.43"/>)}
      </g>}
      {rain > 0 && <><Rain t={t} intensity={rain}/><Splashes t={t} amount={rain}/><Rain t={t} intensity={rain * 0.85} foreground/></>}
      {/* Branches briefly enter frame after a cut, supplying parallax and distinct framing. */}
      {shot === 1 && !sunny && <Bamboo t={t} x={-27 - local * 13} y={996} scale={1.63} opacity={0.43}/>}
      {sunny && <g stroke="#b8bd97" fill="none" strokeWidth="1.8" opacity="0.56">
        {[0, 1, 2].map((i) => <path key={i} d={`M ${877 + i * 61 + t * 13} ${386 + i % 2 * 18} q -8 ${-6 - Math.sin(t * 5 + i) * 4} -18 -3 m 18 3 q 8 ${-6 - Math.sin(t * 5 + i) * 4} 18 -3`}/>)}
      </g>}
      {mode === 'storm' && <path d="M 424 252 Q 704 226 928 269 Q 1214 225 1429 283 Q 1624 255 1860 284 L 1980 413 Q 1736 369 1556 393 Q 1278 361 1111 392 Q 858 352 654 387 Q 391 363 104 412 L -40 294 Q 142 265 424 252 Z" fill="#698680" opacity={0.035 + Math.max(0, Math.sin(t * 14) - 0.92) * 0.75}/>}
      {freedom && <path d="M 639 614 Q 840 585 998 603 Q 1205 624 1381 589 Q 1552 562 1755 587" stroke={GOLD} strokeWidth="1.1" opacity="0.11" fill="none"/>}
      </g>
    </g>
  </svg>;
};
