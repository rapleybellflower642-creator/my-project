import React from 'react';

export type Action = 'walk' | 'stand' | 'rushing' | 'farm' | 'cold' | 'lookback' | 'chant' | 'write' | 'resolve';
export type CharacterProps = {t: number; x: number; y: number; scale?: number; action?: Action; facing?: 1 | -1; warm?: number; seed?: number; noStaff?: boolean};

/** Seconds and unscaled pixels. Matching the scene's travel speed keeps support feet planted. */
export const CHARACTER_TIMING = {
  walk: {period: 1.6, footfallInterval: .8, speed: 70, support: .62},
  rushing: {period: .9, footfallInterval: .45, speed: 180, support: .56},
  farm: {period: 3.6, impact: 2.52},
} as const;

type P = [number, number];
const TAU = Math.PI * 2;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => {const p = clamp(n); return p * p * (3 - 2 * p);};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const mul = (a: P, n: number): P => [a[0] * n, a[1] * n];
const norm = (a: P): P => {const d = Math.hypot(...a) || 1; return [a[0] / d, a[1] / d];};
const pt = (p: P) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
const rotate = (p: P, deg: number, origin: P = [0, 0]): P => {
  const a = deg * Math.PI / 180, x = p[0] - origin[0], y = p[1] - origin[1];
  return [origin[0] + x * Math.cos(a) - y * Math.sin(a), origin[1] + x * Math.sin(a) + y * Math.cos(a)];
};
const keys = (p: number, values: [number, number][]) => {
  for (let i = 1; i < values.length; i++) if (p <= values[i][0]) {
    const [a, x] = values[i - 1], [b, y] = values[i];
    return mix(x, y, ease((p - a) / (b - a)));
  }
  return values[values.length - 1][1];
};

/** Two fixed limb lengths make knees bend, instead of stretching rubber legs. */
const knee = (hip: P, ankle: P, direction = 1): P => {
  const a = 111, b = 111;
  const d = Math.min(a + b - .01, Math.max(1, Math.hypot(ankle[0] - hip[0], ankle[1] - hip[1])));
  const v = norm([ankle[0] - hip[0], ankle[1] - hip[1]]);
  const along = (a * a - b * b + d * d) / (2 * d);
  const out = Math.sqrt(Math.max(0, a * a - along * along));
  return [hip[0] + v[0] * along + v[1] * out * direction, hip[1] + v[1] * along - v[0] * out * direction];
};

const Sleeve: React.FC<{s: P; e: P; w: P; far?: boolean; id: string; narrow?: boolean}> = ({s, e, w, far, id, narrow}) => {
  const u = norm([e[0] - s[0], e[1] - s[1]]), v = norm([w[0] - e[0], w[1] - e[1]]);
  const n: P = [-u[1], u[0]], m: P = [-v[1], v[0]];
  const a = add(s, mul(n, 21)), b = add(s, mul(n, -21));
  const c = add(e, mul(n, 27)), d = add(e, mul(n, -27));
  const f = add(w, mul(m, narrow ? 12 : 16)), g = add(w, mul(m, narrow ? -12 : -16));
  const droop: P = [e[0] * .4 + w[0] * .6, e[1] * .4 + w[1] * .6 + (narrow ? 17 : 34)];
  return <g>
    <path d={`M ${pt(a)} Q ${pt(c)} ${pt(f)} L ${pt(g)} Q ${pt(droop)} ${pt(d)} Q ${pt(b)} ${pt(a)} Z`} fill={`url(#${id}-${far ? 'far' : 'sleeve'})`} stroke="#142e2d" strokeWidth="1.65" strokeLinejoin="round"/>
    <path d={`M ${pt(add(s, mul(n, -9)))} Q ${pt(add(e, mul(n, -12)))} ${pt(add(w, mul(m, -5)))}`} fill="none" stroke={far ? '#729386' : '#a9b7a1'} opacity=".35" strokeWidth="1.6"/>
    <path d={`M ${pt(add(e, mul(n, 11)))} Q ${pt(droop)} ${pt(add(w, mul(m, 10)))}`} fill="none" stroke="#102e2b" opacity=".6" strokeWidth="2"/>
    <path d={`M ${pt(f)} L ${pt(g)}`} stroke="#b2ae8b" strokeWidth="5.5"/>
    <path d={`M ${pt(add(f, mul(v, -5)))} L ${pt(add(g, mul(v, -5)))}`} stroke="#233c35" strokeWidth="2"/>
  </g>;
};

const Hand: React.FC<{p: P; angle?: number; id: string; closed?: boolean}> = ({p, angle = 0, id, closed}) => <g transform={`translate(${pt(p)}) rotate(${angle})`}>
  <path d={closed ? 'M -10 -8 Q -8 -15 -1 -12 L 8 -9 Q 15 -7 13 2 L 8 10 Q 3 14 -3 8 L -10 5 Z' : 'M -9 -10 Q -5 -14 -1 -9 L 1 -3 L 4 -9 Q 8 -12 10 -7 L 12 8 Q 10 16 4 15 L -4 9 L -10 4 Z'} fill={`url(#${id}-skin)`} stroke="#776a4e" strokeWidth="1.1"/>
  <path d={closed ? 'M 1 -7 L 10 -3 M -1 -2 L 9 2 M 0 4 L 7 7' : 'M 1 -2 L 4 9 M 6 -3 L 8 8'} fill="none" stroke="#8d7858" strokeWidth=".95" strokeLinecap="round"/>
</g>;

/** One continuous design, animated with separate feet, knees, hips, sleeves, neck and eyes. */
export const Character: React.FC<CharacterProps> = ({t, x, y, scale = 1, action = 'stand', facing = 1, warm = 0, seed = 0, noStaff = false}) => {
  const time = Math.max(0, t);
  const moving = action === 'walk' || action === 'rushing';
  const rushing = action === 'rushing';
  // The three hurrying companions share the visual language, but are distinct people.
  const companion = rushing && seed >= 2;
  const companionVariant = Math.floor(Math.abs(seed)) % 3;
  const companionColors = [
    ['#233c40', '#597479', '#374f55', '#193237', '#809293'],
    ['#3a3b2c', '#7b795a', '#555942', '#2b362a', '#969780'],
    ['#333c32', '#6d7758', '#4b5d45', '#25392c', '#8f9878'],
  ][companionVariant];
  const robeColors = companion ? companionColors : ['#173a39', '#42675d', '#314f49', '#122d2d', '#6e8878'];
  const beardScale = companion ? [.3, .5, .17][companionVariant] : 1;
  const capScale = companion ? [.78, .55, .64][companionVariant] : 1;
  const timing = rushing ? CHARACTER_TIMING.rushing : CHARACTER_TIMING.walk;
  const phase = (time / timing.period) % 1;
  const wave = Math.sin(TAU * phase);
  const breath = Math.sin(time * 1.75 + seed * .43);
  const cloth = Math.sin((time - .13) * (moving ? TAU / timing.period : 1.7) + seed * .4);
  const farmP = (time % CHARACTER_TIMING.farm.period) / CHARACTER_TIMING.farm.period;
  const farmBend = action === 'farm' ? keys(farmP, [[0, 15], [.14, 19], [.43, -3], [.56, -5], [.7, 27], [.78, 24], [1, 15]]) : 0;
  const farmLoad = action === 'farm' ? keys(farmP, [[0, 0], [.4, 1], [.56, 1], [.7, 0], [1, 0]]) : 0;
  const coldIn = action === 'cold' ? ease(time / .75) : 0;
  // Eyes lead at .35s, neck at .7s, shoulders at 1.05s; all settle forward after 4.8s.
  const glance = action === 'lookback' ? ease((time - .35) / .7) * (1 - ease((time - 4.0) / .8)) : 0;
  const turn = action === 'lookback' ? ease((time - .7) / 1.05) * (1 - ease((time - 4.35) / 1.05)) : 0;
  const shoulderTurn = action === 'lookback' ? ease((time - 1.05) / 1.05) * (1 - ease((time - 4.65) / 1.05)) : 0;
  const settled = action === 'resolve' ? ease((time - .2) / 2.25) : 0;
  const chantLift = action === 'chant' ? ease(time / 1.2) : 0;
  const writing = action === 'write';
  const bodyBob = moving ? -3.4 * Math.sin(TAU * phase * 2 - .5) : -breath * .75 + (action === 'farm' ? farmLoad * -3 + farmBend * .12 : 0);
  const lean = rushing ? 9 + wave * .6 : action === 'farm' ? farmBend : writing ? 7 : coldIn * 4.5 + (1 - settled) * 1.5 - chantLift * 1.8;
  const shiver = coldIn * (Math.sin(time * 24) + Math.sin(time * 17)) * .38;
  const hipShift = moving ? Math.sin(TAU * phase - .45) * 2 : shoulderTurn * -3 + shiver;
  const torsoTransform = `translate(${hipShift} ${bodyBob}) rotate(${lean} 0 -240)`;
  const toLocal = (p: P): P => rotate([p[0] - hipShift, p[1] - bodyBob], -lean, [0, -240]);
  const fromLocal = (p: P): P => add(rotate(p, lean, [0, -240]), [hipShift, bodyBob]);
  const waistL = fromLocal([-43, -255]), waistR = fromLocal([47, -255]);
  const id = `dfb-person-${action}-${String(seed).replace(/[^\w]/g, '')}-${String(x).replace(/[^\w]/g, '')}-${String(y).replace(/[^\w]/g, '')}`;
  const u = (name: string) => `url(#${id}-${name})`;

  const foot = (offset: number, side: number) => {
    const q = (phase + offset) % 1;
    const stride = timing.speed * timing.period * timing.support / 2;
    const support = q < timing.support;
    const swing = clamp((q - timing.support) / (1 - timing.support));
    const fx = moving ? (support ? stride - q * timing.period * timing.speed : mix(-stride, stride, ease(swing))) : side * (action === 'farm' ? 39 : 22);
    const lift = moving && !support ? Math.pow(Math.sin(Math.PI * swing), .9) * (rushing ? 42 : 24) : 0;
    const angle = moving ? (support ? 14 * ease((q / timing.support - .76) / .24) : 14 * (1 - ease(swing / .5)) - 8 * Math.sin(Math.PI * ease((swing - .6) / .4))) : 0;
    const ankle = rotate([0, -15], angle, [24, 0]);
    return {x: fx, y: -lift, angle, support, ankle: [fx + ankle[0], -lift + ankle[1]] as P};
  };
  const farFoot = foot(.5, -1), nearFoot = foot(0, 1);

  let farS: P = [-37 + shoulderTurn * 8, -353 - coldIn * 5];
  let nearS: P = [32 - shoulderTurn * 8, -351 - coldIn * 6];
  let farE: P = [-54 - wave * (moving ? 9 : 0), -303];
  let farW: P = [-45 - wave * (moving ? 25 : 0), -253 + breath];
  let nearE: P = [57, -305];
  let nearW: P = [80, -266];
  const staffVisible = !noStaff && !['farm', 'rushing', 'write', 'cold'].includes(action);
  const staffSupport = phase < .62;
  const staffSwing = clamp((phase - .62) / .38);
  const staffTip: P = [moving ? 125 - (staffSupport ? phase * 1.6 * 70 : mix(.62 * 1.6 * 70, 0, ease(staffSwing))) : 105, moving && !staffSupport ? -19 * Math.sin(Math.PI * staffSwing) : 0];
  const staffTop: P = [staffTip[0] - 14 + (moving ? Math.sin(TAU * phase) * 4 : 0), -326 + bodyBob];
  const staffGrip: P = [mix(staffTip[0], staffTop[0], .813), mix(staffTip[1], staffTop[1], .813)];
  let hoeOrigin: P = [74, -240];
  let hoeAngle = 58;
  if (action === 'farm') {
    const contactY = -13 - Math.sin(58 * Math.PI / 180) * 270;
    hoeOrigin = [keys(farmP, [[0, 74], [.14, 65], [.43, 111], [.56, 111], [.7, 74], [.78, 74], [1, 74]]), keys(farmP, [[0, -247], [.14, -249], [.43, -347], [.56, -350], [.7, contactY], [.78, contactY], [1, -247]])];
    hoeAngle = keys(farmP, [[0, 56], [.14, 50], [.43, -148], [.56, -154], [.7, 58], [.78, 58], [1, 56]]);
    const direction: P = [Math.cos(hoeAngle * Math.PI / 180), Math.sin(hoeAngle * Math.PI / 180)];
    nearW = toLocal(hoeOrigin);
    farW = toLocal(add(hoeOrigin, mul(direction, 77)));
    nearE = [nearW[0] - 33, Math.min(-282, nearW[1] + 13)];
    farE = [farW[0] - 35, Math.min(-304, farW[1] + 27)];
  } else if (rushing) {
    nearE = [76 + wave * 3, -374]; nearW = [40, -452 + wave * 2];
    farE = [-60 - wave * 9, -305]; farW = [-35 - wave * 20, -261];
  } else if (action === 'cold') {
    nearE = [mix(49, 53, coldIn), -300 - coldIn * 6]; nearW = [mix(39, -27, coldIn), mix(-247, -348, coldIn)];
    farE = [-49, -301]; farW = [mix(-45, 28, coldIn), mix(-253, -340, coldIn)];
  } else if (writing) {
    const strokeP = (time % 2.8) / 2.8;
    nearW = [106 + Math.sin(strokeP * TAU) * 8, -285 + Math.sin(strokeP * TAU * 2) * 3 - 10 * ease((strokeP - .78) / .12) * (1 - ease((strokeP - .92) / .08))];
    nearE = [63, -291]; farE = [-26, -291]; farW = [40, -254];
  } else if (staffVisible) {
    nearW = toLocal(staffGrip); nearE = [nearW[0] * .56 + 11, -304 + wave * 2];
  } else {
    nearE = [49 + wave * (moving ? 8 : 0), -301];
    nearW = [39 + wave * (moving ? 21 : 0), -247 + breath];
  }

  const hemLag = moving ? cloth * 8 : Math.sin(time * 1.8 + seed) * 2.5;
  const hemFront = moving ? Math.max(0, wave) * 6 : 0;
  const headPitch = rushing ? 9 : action === 'farm' ? 10 - farmLoad * 13 : writing ? 12 : coldIn * 7 - chantLift * 7 - settled * 5 - turn * 2;
  const headX = -1 - turn * 6, headY = -386 - coldIn * -3 - chantLift * (1 + breath * .7);
  const faceYaw = 1 - 1.72 * turn;
  const faceX = faceYaw * 9;
  const eyeLine = -41 + (writing ? 2 : 0) - settled * 1.8;
  const blinkP = (time + seed * .59) % 5.1;
  const blink = Math.max(0, 1 - Math.abs(blinkP - 3.81) / .085);
  const beardLag = cloth * (moving ? 1.5 : .75) + farmBend * -.1;
  const hoeBlade = add(hoeOrigin, [Math.cos(hoeAngle * Math.PI / 180) * 270, Math.sin(hoeAngle * Math.PI / 180) * 270]);
  const dustAge = (time % 3.6) - 2.52;

  const renderLeg = (f: ReturnType<typeof foot>, far: boolean) => {
    const h: P = [hipShift + (far ? -13 : 16), -231 + bodyBob];
    const k = knee(h, f.ankle);
    return <g clipPath={`url(#${id}-lower-legs)`}>
      <path d={`M ${pt(h)} L ${pt(k)} L ${pt(f.ankle)}`} fill="none" stroke="#172e2b" strokeWidth="27" strokeLinecap="round" strokeLinejoin="round"/>
      <path d={`M ${pt(h)} L ${pt(k)} L ${pt(f.ankle)}`} fill="none" stroke={far ? '#4b6456' : '#718270'} strokeWidth="21" strokeLinecap="round" strokeLinejoin="round"/>
      <path d={`M ${pt(add(k, [-5, 3]))} L ${pt(add(f.ankle, [-4, -6]))}`} fill="none" stroke="#b9b698" strokeWidth="1.5" opacity=".45"/>
      <g transform={`translate(${f.x} ${f.y}) rotate(${f.angle} 24 0)`}>
        <path d="M -10 -35 L 10 -35 L 12 -12 L -11 -10 Z" fill={far ? '#89937b' : '#b6b499'}/>
        <path d="M -11 -25 L 11 -25 M -10 -19 L 11 -20" stroke="#697763" strokeWidth="1.4"/>
        <path d="M -12 -12 Q -6 -22 6 -15 L 16 -9 Q 21 -7 31 -7 Q 37 -7 38 -1 L 34 1 L -14 1 Z" fill={far ? '#776e4c' : '#a59462'} stroke="#263b2e" strokeWidth="1.5"/>
        <path d="M -12 -1 L 35 -1 M -4 -15 L 8 -2 M 5 -13 L 17 -2 M 13 -9 L 24 -2" fill="none" stroke="#dbca91" strokeWidth="1.3" opacity=".65"/>
      </g>
    </g>;
  };

  return <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`} data-character-action={action}>
    <defs>
      <linearGradient id={`${id}-robe`} x1="0" y1="0" x2="1" y2=".2"><stop stopColor={robeColors[0]}/><stop offset=".31" stopColor={robeColors[1]}/><stop offset=".61" stopColor={robeColors[2]}/><stop offset="1" stopColor={robeColors[3]}/></linearGradient>
      <linearGradient id={`${id}-sleeve`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={robeColors[4]}/><stop offset=".45" stopColor={companion ? robeColors[1] : '#42695e'}/><stop offset="1" stopColor={companion ? robeColors[3] : '#213e39'}/></linearGradient>
      <linearGradient id={`${id}-far`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={companion ? robeColors[2] : '#45675b'}/><stop offset="1" stopColor={companion ? robeColors[3] : '#1a3833'}/></linearGradient>
      <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2=".1"><stop stopColor="#98896b"/><stop offset=".47" stopColor="#ceba94"/><stop offset="1" stopColor="#e5cda3"/></linearGradient>
      <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#183332"/><stop offset=".43" stopColor="#293d35"/><stop offset="1" stopColor="#0b2223"/></linearGradient>
      <clipPath id={`${id}-lower-legs`}><path d="M -150 -79 H 180 V 70 H -150 Z"/></clipPath>
    </defs>
    <ellipse cx="11" cy="4" rx={moving ? 69 : 77} ry="8" fill="#051110" opacity=".45"/>
    {renderLeg(farFoot, true)}
    {renderLeg(nearFoot, false)}
    {/* Tool geometry lives in ground coordinates: its contact is independent of breathing. */}
    {staffVisible && <g>
      <path d={`M ${pt(staffTop)} L ${pt(staffTip)}`} stroke="#374331" strokeWidth="7" strokeLinecap="round"/>
      <path d={`M ${pt(staffTop)} L ${pt(staffTip)}`} stroke="#b5a46c" strokeWidth="4.4" strokeLinecap="round"/>
      <path d={`M ${pt(add(staffTop, [-1, 0]))} L ${pt(add(staffTip, [-1, -2]))}`} stroke="#ead49a" strokeWidth=".9" opacity=".65"/>
      {[.08, .24, .43, .62, .82, .95].map((v, i) => <path key={i} d={`M ${mix(staffTop[0], staffTip[0], v) - 3} ${mix(staffTop[1], staffTip[1], v)} l 6 -1`} stroke="#566243" strokeWidth="1.8"/>)}
    </g>}
    {action === 'farm' && <g>
      <path d={`M ${pt(add(hoeOrigin, mul(norm([hoeBlade[0] - hoeOrigin[0], hoeBlade[1] - hoeOrigin[1]]), -19)))} L ${pt(hoeBlade)}`} stroke="#584c32" strokeWidth="8" strokeLinecap="round"/>
      <path d={`M ${pt(hoeOrigin)} L ${pt(hoeBlade)}`} stroke="#b49b64" strokeWidth="4" strokeLinecap="round"/>
      <g transform={`translate(${pt(hoeBlade)}) rotate(${hoeAngle - 58})`}>
        <path d="M -7 -6 L 14 -10 L 20 -6 L 18 13 L -12 13 L -18 8 Z" fill="#738176" stroke="#263e36" strokeWidth="2"/>
        <path d="M -15 10 L 17 10" stroke="#c7c7aa" strokeWidth="2.1"/>
        <path d="M -4 -9 L 1 4 L 8 2 L 5 -11 Z" fill="#574e36"/>
      </g>
    </g>}
    <g transform={torsoTransform}>
      <Sleeve s={farS} e={farE} w={farW} far id={id}/>
      <Hand p={farW} id={id} angle={action === 'farm' ? hoeAngle - lean : action === 'cold' ? -60 : -16} closed={action === 'farm'}/>
    </g>
    {/* The hip stays over the support; lower cloth follows a delayed, smaller motion. */}
    <path d={`M ${pt(waistL)} Q -43 -200 ${-73 + hemLag} -66 Q -59 -58 -40 -65 Q -23 -54 -7 -62 Q 16 -54 34 -66 Q 53 -60 ${68 + hemLag * .5} ${-70 - hemFront} Q 46 -171 ${pt(waistR)} Z`} fill={u('robe')} stroke="#173932" strokeWidth="1.8"/>
    <path d={`M -28 -247 Q -26 -151 ${-50 + hemLag * .5} -66 M -4 -245 Q -13 -144 -7 -64 M 25 -249 Q 17 -142 34 -68`} stroke="#95aa91" strokeWidth="1.8" opacity=".38" fill="none"/>
    <path d={`M -38 -225 Q -41 -137 ${-60 + hemLag * .6} -67 M 8 -244 Q -1 -144 8 -63 M 37 -224 Q 36 -138 53 -68`} stroke="#0d2929" strokeWidth="4" opacity=".54" fill="none"/>
    <path d={`M ${-68 + hemLag} -65 Q -46 -56 -37 -63 Q -20 -54 -6 -61 Q 17 -55 34 -65 Q 55 -61 ${65 + hemLag * .5} ${-70 - hemFront}`} stroke="#b5b38c" strokeWidth="1.1" opacity=".5" fill="none"/>
    <g transform={torsoTransform}>
      <path d={`M -24 -373 Q ${-53 + shoulderTurn * 7} -366 ${-54 + shoulderTurn * 9} -335 L -43 -258 Q 0 -242 48 -258 L ${53 - shoulderTurn * 10} -335 Q ${49 - shoulderTurn * 8} -357 20 -372 Z`} fill={u('robe')} stroke="#173a34" strokeWidth="1.7"/>
      <path d="M -17 -391 L -19 -361 Q -4 -346 18 -363 L 19 -391 Z" fill={u('skin')} stroke="#8b8061" strokeWidth="1"/>
      <path d="M -24 -372 L 6 -339 L 24 -370 L 37 -360 L -5 -308 L -38 -357 Z" fill="#c4bea0" stroke="#71806a" strokeWidth="1.25"/>
      <path d="M -25 -368 L 5 -335 L -4 -324 L -34 -357 Z" fill="#e0d5b6"/>
      <path d="M 23 -369 L -12 -322 L -3 -310 L 34 -358 Z" fill="#a1ad95"/>
      <path d="M 28 -365 L -8 -319 M -26 -360 L 0 -332" stroke="#617c68" strokeWidth="1.6" fill="none"/>
      <path d="M -28 -332 Q -20 -296 -28 -265 M 6 -313 Q 3 -294 -4 -270 M 32 -332 Q 32 -301 26 -270" fill="none" stroke="#8fa78e" strokeWidth="1.5" opacity=".39"/>
      <path d="M -46 -266 Q -1 -252 48 -266 L 48 -252 Q 0 -240 -46 -253 Z" fill="#233e34" stroke="#617c60" strokeWidth="1.3"/>
      <path d="M -40 -262 Q 1 -253 42 -263" stroke="#b6b08a" strokeWidth="1.7" opacity=".58" fill="none"/>
      <path d={`M 4 -252 Q ${-5 + cloth * 1.2} -225 ${-3 + cloth} -208 M 11 -253 Q ${22 + cloth * 1.1} -230 ${15 + cloth * 1.5} -216`} stroke="#b5a377" strokeWidth="3" fill="none"/>
      <path d="M 2 -260 Q -9 -267 -12 -259 Q -10 -251 3 -253 Q 19 -266 24 -258 Q 23 -252 10 -254" stroke="#baaa7e" strokeWidth="2.1" fill="none"/>
      <g transform={`translate(${headX} ${headY}) rotate(${headPitch})`}>
        {/* The silhouette stays continuous during the turn; features travel across the face. */}
        <path d={`M -29 -69 Q -38 -45 -27 -16 Q -19 6 -2 10 Q 20 11 30 -10 Q 36 -32 28 -66 Q 2 -88 -29 -69 Z`} fill={u('skin')} stroke="#786f54" strokeWidth="1.45"/>
        <path d={`M ${-29 + turn * 2} -61 Q -36 -38 -26 -14 L -20 -10 L -22 -35 Q -17 -48 -14 -64 Z`} fill="#233b31"/>
        <path d="M -30 -33 Q -42 -38 -38 -21 Q -35 -11 -27 -14 L -26 -24 Q -33 -31 -33 -23" fill="#b6a383" stroke="#8c805e" strokeWidth="1.2"/>
        <path d="M 27 -36 Q 36 -39 35 -26 Q 33 -15 28 -16" fill="#bdac85" stroke="#8c805e" strokeWidth="1.1"/>
        <path d={`M ${faceX - 18} -48 Q ${faceX - 10} -52 ${faceX - 3} -47 M ${faceX + 8} -48 Q ${faceX + 16} -51 ${faceX + 23} -46`} fill="none" stroke="#364334" strokeWidth="3.1" strokeLinecap="round"/>
        <g transform={`translate(${faceX} ${eyeLine})`}>
          <path d={`M -17 0 Q -10 ${-2.4 * (1 - blink)} -3 0 M 9 0 Q 16 ${-2.7 * (1 - blink)} 23 0`} stroke="#424635" strokeWidth="1.75" fill="none" strokeLinecap="round"/>
          <ellipse cx={-9 - glance * 2.7 + settled * 1.2} cy={-.5 - settled * .4} rx="1.7" ry={Math.max(.2, 2.1 * (1 - blink))} fill="#24392e"/>
          <ellipse cx={17 - glance * 3 + settled * .8} cy={-.6 - settled * .4} rx="1.8" ry={Math.max(.2, 2.2 * (1 - blink))} fill="#24392e"/>
          <path d="M -18 5 L -13 6 M 19 5 L 25 4" stroke="#9e9270" strokeWidth=".9" fill="none"/>
        </g>
        <path d={`M ${faceX + 4} -39 Q ${faceX + 3 + faceYaw * 6} -28 ${faceX + 6 + faceYaw * 7} -25 Q ${faceX + 9} -20 ${faceX + 1} -22`} fill="none" stroke="#9a865f" strokeWidth="1.5" strokeLinecap="round"/>
        <path d={`M ${faceX - 16} -29 Q ${faceX - 14} -20 ${faceX - 10} -18 M ${faceX + 22} -27 L ${faceX + 20} -21`} fill="none" stroke="#a9956f" strokeWidth="1"/>
        <g transform={`translate(0 ${-19 * (1 - beardScale)}) scale(1 ${beardScale})`}>
        <path d={`M -24 -21 Q -19 -3 -7 -7 Q 7 -1 26 -15 Q 26 10 ${13 + beardLag} 45 Q 5 58 ${1 + beardLag} 57 Q -3 39 -14 30 Q -28 20 -28 -5 Z`} fill="#243c32" stroke="#314c3d" strokeWidth="1.1"/>
        <path d={`M -20 -5 Q -13 14 ${-7 + beardLag} 29 M -9 2 Q -1 24 ${1 + beardLag} 47 M 2 4 Q 7 24 ${5 + beardLag} 49 M 14 0 Q 18 17 ${11 + beardLag} 35 M -23 0 Q -24 12 -17 18 M 21 -4 Q 24 8 19 18`} stroke="#9da487" strokeWidth="1.05" opacity=".6" fill="none"/>
        </g>
        <path d={`M ${faceX - 14} -16 Q ${faceX - 3} -23 ${faceX + 5} -18 Q ${faceX + 16} -23 ${faceX + 25} -17 L ${faceX + 20} -10 Q ${faceX + 10} -9 ${faceX + 5} -14 Q ${faceX - 2} -8 ${faceX - 14} -10 Z`} fill="#2d4032"/>
        <path d={`M ${faceX - 4} -10 Q ${faceX + 5} ${-7 + (action === 'chant' ? (1 + Math.sin(time * 4.2)) * 1.1 : 0)} ${faceX + 13} -11`} fill="none" stroke="#b6a888" strokeWidth="1.1"/>
        {/* Soft tied Dongpo cloth cap, with visible wrapping and a delayed hanging tie. */}
        <g transform={`translate(0 ${-64 * (1 - capScale)}) scale(1 ${capScale})`}>
        <path d={companion && companionVariant === 1 ? 'M -34 -66 L -37 -104 L 8 -112 L 31 -94 L 34 -68 Q 2 -58 -34 -66 Z' : 'M -34 -66 L -34 -93 Q -25 -113 -1 -114 Q 22 -113 31 -97 L 34 -68 Q 2 -58 -34 -66 Z'} fill={u('cap')} stroke="#64816a" strokeWidth="1.5"/>
        <path d="M -27 -97 Q -4 -107 22 -99 M -20 -102 Q -24 -85 -24 -69 M 2 -108 Q 7 -92 8 -67 M 22 -97 L 27 -71" fill="none" stroke="#8c9a7c" opacity=".49" strokeWidth="1.2"/>
        <path d="M -36 -74 Q -1 -62 35 -72 L 35 -63 Q 0 -54 -37 -66 Z" fill="#294338" stroke="#7b8e71" strokeWidth="1.1"/>
        <path d={`M -34 -68 Q -43 -43 ${-41 + cloth * .7} -19 L ${-34 + cloth * .5} -23 Q -33 -47 -26 -64 Z`} fill="#254035" stroke="#45614d" strokeWidth="1"/>
        <path d="M -31 -88 Q -16 -93 -10 -92" stroke="#c9bc8b" strokeWidth=".8" opacity=".28" fill="none"/>
        </g>
        <path d="M 26 -59 Q 32 -42 29 -29 M 28 -23 L 27 -17" fill="none" stroke="#f0d29e" strokeWidth="1.6" opacity={clamp(warm) * .7}/>
      </g>
      <Sleeve s={nearS} e={nearE} w={nearW} id={id} narrow={rushing}/>
      {action === 'cold' ? <path d={`M ${nearW[0] - 11} ${nearW[1] - 6} Q ${nearW[0] - 4} ${nearW[1] - 13} ${nearW[0] + 5} ${nearW[1] - 5}`} stroke="#cebf99" strokeWidth="5" strokeLinecap="round" fill="none"/> : <Hand p={nearW} id={id} closed={staffVisible || writing || action === 'farm'} angle={rushing ? -70 : action === 'farm' ? hoeAngle - lean : writing ? -20 : 0}/>}
      {writing && <g transform={`translate(${pt(nearW)}) rotate(${8 + Math.sin(time * 2.24) * 3})`}>
        <path d="M 7 -48 L 9 17" stroke="#b99b60" strokeWidth="4.5" strokeLinecap="round"/>
        <path d="M 9 17 Q 16 24 11 36 Q 5 28 6 17 Z" fill="#1b302b"/>
        <path d="M 8 -46 L 9 12" stroke="#e1c58e" strokeWidth=".9"/>
        <path d="M 5 15 L 12 15" stroke="#5f6347" strokeWidth="3"/>
      </g>}
      <path d="M 36 -345 Q 51 -333 50 -314 M 45 -291 L 44 -268" stroke="#f0d5a2" strokeWidth="2" opacity={clamp(warm) * .52} fill="none"/>
    </g>
    {action === 'farm' && dustAge >= 0 && dustAge < .62 && <g opacity={(1 - dustAge / .62) * .48}>
      {[0, 1, 2, 3, 4, 5, 6].map(i => <ellipse key={i} cx={216 + (i - 3) * (5 + dustAge * 31)} cy={-1 - Math.sin((i + 1) * .8) ** 2 * dustAge * 34} rx={2 + dustAge * 6 + i % 2} ry={1.1 + dustAge * 2.1} fill={i % 2 ? '#9e906a' : '#baaa7c'}/>)}
    </g>}
  </g>;
};
