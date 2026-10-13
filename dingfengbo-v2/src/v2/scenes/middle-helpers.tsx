import React from 'react';

export const GOLD = '#D6BB81';
export const IVORY = '#F2E8D2';
export const JADE = '#6EA99E';
export const AMBER = '#D59A51';
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ramp = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
export const smooth = (v: number) => {const t = clamp(v); return t * t * (3 - 2 * t);};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const seed = (i: number) => {const v = Math.sin(i * 127.1 + 31.7) * 43758.5453; return v - Math.floor(v);};
export const PULSE = (f: number, center: number, width = 10) => Math.exp(-Math.pow((f - center) / width, 2));
export type VisualProps = {frame: number; duration: number};
export const svgStyle: React.CSSProperties = {position: 'absolute', inset: 0, width: 1920, height: 1080, overflow: 'visible'};
export const labelStyle: React.CSSProperties = {fontFamily: 'DFBSans, sans-serif', fontSize: 29, letterSpacing: 3, fill: GOLD};

export const MiddleDefs = ({id}: {id: string}) => <defs>
  <linearGradient id={`${id}-gold`} x1="0" x2="1"><stop stopColor="#846C41"/><stop offset=".38" stopColor="#F2E8D2"/><stop offset=".66" stopColor="#D6BB81"/><stop offset="1" stopColor="#624F31"/></linearGradient>
  <linearGradient id={`${id}-cool`} x1="0" x2="1"><stop stopColor="#6EA99E" stopOpacity="0"/><stop offset=".52" stopColor="#A9D0CB"/><stop offset="1" stopColor="#6EA99E" stopOpacity="0"/></linearGradient>
  <radialGradient id={`${id}-light`}><stop stopColor="#D6BB81" stopOpacity=".46"/><stop offset=".3" stopColor="#B27B35" stopOpacity=".13"/><stop offset="1" stopColor="#D59A51" stopOpacity="0"/></radialGradient>
  <radialGradient id={`${id}-jade`}><stop stopColor="#B6DED1" stopOpacity=".5"/><stop offset=".26" stopColor="#6EA99E" stopOpacity=".12"/><stop offset="1" stopColor="#6EA99E" stopOpacity="0"/></radialGradient>
  <linearGradient id={`${id}-beam`} x1="1" y1="0" x2="0" y2="1"><stop stopColor="#F2E8D2" stopOpacity=".05"/><stop offset=".2" stopColor="#E3BE80" stopOpacity=".2"/><stop offset="1" stopColor="#D59A51" stopOpacity="0"/></linearGradient>
  <filter id={`${id}-bloom`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>
</defs>;

/** Water begins at the physical contact frame, never at a random timeline time. */
export const ContactWater = ({frame, at, x, y, id, strength = 1, color = JADE}: {frame: number; at: number; x: number; y: number; id: string; strength?: number; color?: string}) => {
  const age = frame - at;
  if (age < 0 || age > 58) return null;
  const life = clamp(age / 58);
  return <g opacity={(1 - life) * strength}>
    <ellipse cx={x} cy={y} rx={34 + age * 5.7} ry={9 + age * 1.14} fill="none" stroke={color} strokeWidth={1.8} />
    <ellipse cx={x} cy={y} rx={20 + age * 3.7} ry={4 + age * .72} fill="none" stroke={GOLD} strokeOpacity=".46" strokeWidth={1} />
    <ellipse cx={x} cy={y} rx={62 + age * 2} ry={23} fill={`url(#${id}-jade)`} />
    {Array.from({length: 24}, (_, i) => {
      const angle = seed(i + 8) * Math.PI * 2;
      const speed = 1.9 + seed(i + 90) * 4;
      const dx = Math.cos(angle) * speed * age;
      const dy = -Math.abs(Math.sin(angle)) * speed * age + .072 * age * age;
      return <ellipse key={i} cx={x + dx} cy={y + dy} rx={1 + seed(i + 60) * 1.8} ry={2.2 + Math.max(0, 1 - life * 3) * 3.3} fill={i % 4 === 0 ? IVORY : color} opacity={clamp(1 - age / 44)} transform={`rotate(${dx * .11}, ${x + dx}, ${y + dy})`} />;
    })}
  </g>;
};

export const RainField = ({frame, density = 72, opacity = .32, slant = -22, bounds = [220, 180, 1460, 630]}: {frame: number; density?: number; opacity?: number; slant?: number; bounds?: [number, number, number, number]}) => <g opacity={opacity}>
  {Array.from({length: density}, (_, i) => {
    const [x0, y0, w, h] = bounds;
    const x = x0 + seed(i * 3 + 199) * w;
    const y = y0 + ((seed(i * 7 + 244) * h + frame * (6 + seed(i + 432) * 10)) % h);
    const length = 10 + seed(i + 47) * 23;
    return <line key={i} x1={x} y1={y} x2={x + slant * length / 30} y2={y + length} stroke={i % 5 === 0 ? GOLD : '#8DABB1'} strokeWidth={i % 7 === 0 ? 1.6 : .85} opacity={.2 + seed(i + 81) * .55}/>;
  })}
</g>;

export const HairlinePath = ({d, progress = 1, color = GOLD, width = 2, opacity = 1}: {d: string; progress?: number; color?: string; width?: number; opacity?: number}) => <path d={d} pathLength="1" stroke={color} strokeWidth={width} fill="none" strokeDasharray="1" strokeDashoffset={1 - clamp(progress)} opacity={opacity} />;
