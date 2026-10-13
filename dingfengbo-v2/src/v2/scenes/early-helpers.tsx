import React from 'react';

export type VisualProps = {frame: number; duration: number};
export const gold = '#D6BB81';
export const ivory = '#F2E8D2';
export const jade = '#6EA99E';
export const red = '#B95342';
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const smooth = (v: number) => {const t = clamp(v); return t * t * (3 - 2 * t);};
export const easeOut = (v: number) => 1 - (1 - clamp(v)) ** 3;
export const rnd = (n: number) => {const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v);};
export const SVG: React.FC<React.PropsWithChildren<{style?: React.CSSProperties}>> = ({children, style}) => <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
export const Defs = ({id}: {id: string}) => <defs>
  <linearGradient id={`${id}-gold`} x1="0" x2="0.8" y1="0" y2="1"><stop stopColor="#665539"/><stop offset=".22" stopColor="#F3E6B8"/><stop offset=".47" stopColor="#A68C53"/><stop offset=".62" stopColor="#EAD7A0"/><stop offset="1" stopColor="#766448"/></linearGradient>
  <radialGradient id={`${id}-light`}><stop stopColor="#DBC48B" stopOpacity=".24"/><stop offset=".45" stopColor="#A48D58" stopOpacity=".06"/><stop offset="1" stopColor="#D6BB81" stopOpacity="0"/></radialGradient>
  <radialGradient id={`${id}-jade`}><stop stopColor="#A6D7C8" stopOpacity=".55"/><stop offset="1" stopColor="#6EA99E" stopOpacity="0"/></radialGradient>
  <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2=".8"><stop stopColor="#827146"/><stop offset=".09" stopColor="#DDCE9F"/><stop offset=".52" stopColor="#F0E2BC"/><stop offset=".9" stopColor="#CEB884"/><stop offset="1" stopColor="#8A7447"/></linearGradient>
  <linearGradient id={`${id}-water`} x1="0" x2="1" y1="0" y2=".9"><stop stopColor="#FAF7DD" stopOpacity=".93"/><stop offset=".18" stopColor="#A6C4BD" stopOpacity=".6"/><stop offset=".5" stopColor="#263F43" stopOpacity=".14"/><stop offset=".75" stopColor="#DBCF9F" stopOpacity=".7"/><stop offset="1" stopColor="#FFF8D9" stopOpacity=".9"/></linearGradient>
  <filter id={`${id}-glow`} filterUnits="userSpaceOnUse" x="100" y="160" width="1720" height="690"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="12" dy="25" stdDeviation="16" floodColor="#000" floodOpacity=".65"/></filter>
</defs>;

export const Ripples = ({frame, at, x, y, color = gold, strength = 1, id = 'r'}: {frame: number; at: number; x: number; y: number; color?: string; strength?: number; id?: string}) => {
  const t = frame - at;
  if (t < 0 || t > 115) return null;
  return <g>{Array.from({length: 5}, (_, i) => {
    const d = t - i * 7;
    if (d < 0) return null;
    const alpha = clamp(1 - d / 88) * strength * (.65 - i * .08);
    return <ellipse key={`${id}-${i}`} cx={x} cy={y} rx={14 + d * 4.1} ry={4 + d * .78} stroke={color} strokeWidth={i === 0 ? 2.2 : 1.2} fill="none" opacity={alpha}/>;
  })}</g>;
};

export const Splash = ({frame, at, x, y, color = ivory, power = 1, seed = 0}: {frame: number; at: number; x: number; y: number; color?: string; power?: number; seed?: number}) => {
  const t = frame - at;
  if (t < 0 || t > 65) return null;
  return <g>{Array.from({length: 64}, (_, i) => {
    const r = rnd(i + 19 + seed), theta = rnd(i + 321 + seed) * Math.PI * 2;
    const vx = Math.cos(theta) * (1.4 + r * 5.8) * power;
    const vy = -(2 + rnd(i + 193 + seed) * 7.5) * power;
    const px = x + vx * t, py = y + vy * t + .135 * t * t;
    return <ellipse key={i} cx={px} cy={py} rx={1.2 + r * 2.4} ry={2.2 + r * 2.5} fill={color} opacity={clamp(1 - t / 60) * (.25 + r * .65) * clamp((y + 16 - py) / 22)}/>;
  })}</g>;
};

export const Label = ({x, y, text, color = gold, opacity = 1, anchor = 'middle'}: {x: number; y: number; text: string; color?: string; opacity?: number; anchor?: 'middle' | 'start' | 'end'}) => <text x={x} y={y} textAnchor={anchor} fill={color} opacity={opacity} fontFamily="DFBSans, sans-serif" fontSize={32} letterSpacing={4}>{text}</text>;
