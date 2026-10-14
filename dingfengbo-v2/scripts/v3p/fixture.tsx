import React from 'react';

// A standalone moving-vector fixture. Used only with --fixture, never for delivery.
export function FrameSvg({frame, fps = 30}: {frame: number; fps?: number}) {
  const t = frame / fps;
  return <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
    <rect width="1920" height="1080" fill="#e5d8b6" />
    <path d={`M 0 740 Q 600 ${620 + Math.sin(t) * 50} 1920 780 L 1920 1080 L 0 1080 Z`} fill="#899b87" />
    <circle cx={480 + Math.sin(t * 1.4) * 160} cy={410 + Math.cos(t * 1.2) * 110} r="86" fill="#9c553d" />
    <path d={`M ${1100 + Math.sin(t) * 35} 680 Q 1290 ${250 + Math.sin(t * 2) * 55} 1530 680`} stroke="#40594e" fill="none" strokeWidth="28" />
    <text x="960" y="160" textAnchor="middle" fontFamily="Noto Serif CJK SC" fontSize="62" fill="#292d29">定风波 · 原生逐帧测试</text>
    <text x="960" y="972" textAnchor="middle" fontFamily="Noto Sans CJK SC" fontSize="36" fill="#292d29">{`SOURCE ${t.toFixed(3)} s · FRAME ${frame}`}</text>
  </svg>;
}
