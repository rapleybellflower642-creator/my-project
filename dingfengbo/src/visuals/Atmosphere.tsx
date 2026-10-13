import React, {useLayoutEffect, useMemo, useRef} from 'react';

export type AtmosphereProps = {
  /** Time in seconds. Every pixel is derived from this value, so seeking is safe. */
  t: number;
  rain?: number;
  warm?: number;
  mist?: number;
  wind?: number;
  /** Changes the stable particle seed. Keep constant within a continuous shot. */
  scene?: number;
};

const WIDTH = 1920;
const HEIGHT = 1080;
const TAU = Math.PI * 2;
const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const wrap = (n: number, period: number) => ((n % period) + period) % period;

// Integer hashing keeps a frame independent of frame order and browser timing.
const sample = (index: number, salt: number) => {
  let n = (Math.imul(index + 1, 374761393) + Math.imul(salt + 1, 668265263)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};

type Drop = {
  x: number;
  y: number;
  speed: number;
  length: number;
  width: number;
  opacity: number;
  phase: number;
  threshold: number;
  depth: number;
};

const makeDrops = (seed: number): Drop[] => {
  const specs = [
    {count: 330, speed: 540, length: 17, width: 0.58, opacity: 0.18},
    {count: 176, speed: 1070, length: 41, width: 1.15, opacity: 0.34},
    {count: 24, speed: 1910, length: 87, width: 3.2, opacity: 0.16},
  ];
  return specs.flatMap((layer, depth) =>
    Array.from({length: layer.count}, (_, i) => {
      const index = i + depth * 997;
      return {
        x: sample(index, seed + 1) * (WIDTH + 440) - 220,
        y: sample(index, seed + 2) * (HEIGHT + 320),
        speed: layer.speed * (0.66 + sample(index, seed + 3) * 0.72),
        length: layer.length * (0.62 + sample(index, seed + 4) * 0.72),
        width: layer.width * (0.75 + sample(index, seed + 5) * 0.65),
        opacity: layer.opacity * (0.48 + sample(index, seed + 6) * 0.8),
        phase: sample(index, seed + 7) * TAU,
        threshold: sample(index, seed + 8),
        depth,
      };
    }),
  );
};

/** Transparent atmosphere overlay; fixed 1080p internal resolution, scaled by its parent. */
export const Atmosphere: React.FC<AtmosphereProps> = ({
  t,
  rain = 0.7,
  warm = 0,
  mist = 0.45,
  wind = 1,
  scene = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seed = Math.round(scene) * 47 + 193;
  const drops = useMemo(() => makeDrops(seed), [seed]);

  // Layout effects finish before the browser paints or Remotion captures a frame.
  useLayoutEffect(() => {
    const ctx = canvasRef.current?.getContext('2d', {alpha: true});
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    const rainAmount = clamp(rain, 0, 1.4);
    const warmth = clamp(warm);
    const fog = clamp(mist);
    const breeze = clamp(wind, -3, 3);

    // Light is localized in the upper-right sky and long diagonal shafts.
    // No full-frame screen wash, so illustration contrast and typography survive.
    if (warmth > 0.001) {
      ctx.save();
      const bloom = ctx.createRadialGradient(1570, 10, 0, 1570, 10, 740);
      bloom.addColorStop(0, `rgba(255,231,168,${0.12 * warmth})`);
      bloom.addColorStop(0.34, `rgba(233,194,122,${0.052 * warmth})`);
      bloom.addColorStop(1, 'rgba(233,194,122,0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(830, 0, 1090, 750);
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 4; i++) {
        const rayWidth = [215, 100, 320, 78][i];
        const rayAlpha = [0.043, 0.052, 0.027, 0.037][i] * warmth;
        ctx.save();
        ctx.translate(1570 + i * 123, -180);
        ctx.rotate(0.40 + i * 0.07 + Math.sin(t * 0.12 + i) * 0.008);
        const shaft = ctx.createLinearGradient(-rayWidth, 0, rayWidth, 0);
        shaft.addColorStop(0, 'rgba(255,226,160,0)');
        shaft.addColorStop(0.28, `rgba(255,226,160,${rayAlpha * 0.4})`);
        shaft.addColorStop(0.5, `rgba(255,236,185,${rayAlpha})`);
        shaft.addColorStop(0.73, `rgba(255,226,160,${rayAlpha * 0.35})`);
        shaft.addColorStop(1, 'rgba(255,226,160,0)');
        ctx.fillStyle = shaft;
        ctx.beginPath();
        ctx.moveTo(-rayWidth * 0.09, 0);
        ctx.lineTo(rayWidth * 0.09, 0);
        ctx.lineTo(rayWidth, 1650);
        ctx.lineTo(-rayWidth, 1650);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    // Low-lying vapor is made of stretched radial falloffs, never a flat gray card.
    if (fog > 0.001) {
      ctx.save();
      for (let i = 0; i < 7; i++) {
        const phase = sample(i, seed + 40) * TAU;
        const centerX = wrap(i * 390 + t * (8 + i * 1.8) * breeze, WIDTH + 840) - 420;
        const centerY = 939 + Math.sin(t * 0.18 + phase) * 31 + (i % 3) * 75;
        const radiusX = 330 + sample(i, seed + 42) * 230;
        const radiusY = 70 + sample(i, seed + 43) * 52;
        const alpha = fog * (0.074 + sample(i, seed + 44) * 0.05);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(radiusX, radiusY);
        const gradient = ctx.createRadialGradient(0, 0, 0.05, 0, 0, 1);
        gradient.addColorStop(0, `rgba(191,207,196,${alpha})`);
        gradient.addColorStop(0.47, `rgba(176,199,190,${alpha * 0.57})`);
        gradient.addColorStop(1, 'rgba(176,199,190,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
      }
      ctx.restore();
    }

    if (rainAmount > 0.001) {
      ctx.save();
      ctx.lineCap = 'round';
      const density = clamp(rainAmount / 1.05, 0.025, 1);
      const intensity = Math.min(1.15, rainAmount / 0.8);
      // The analytic integral of the gust drives lateral positions continuously.
      const gustIntegral = (1 - Math.cos(t * 0.61)) / 0.61;
      const gustNow = Math.sin(t * 0.61);
      for (const drop of drops) {
        // Smooth activation prevents popping while a shot fades its rain amount.
        const visible = clamp((density - drop.threshold) * 14);
        if (visible <= 0) continue;
        const drift = breeze * (0.11 * t + 0.052 * gustIntegral);
        const sideOscillation = Math.sin(t * 0.73 + drop.phase) * (drop.depth + 1) * 9;
        const x = wrap(drop.x + drop.speed * drift + sideOscillation + 240, WIDTH + 480) - 240;
        const y = wrap(drop.y + t * drop.speed, HEIGHT + 320) - 150;
        const slant = breeze * (0.11 + gustNow * 0.052) + Math.cos(t * 0.73 + drop.phase) * 0.009;
        const opacity = drop.opacity * visible * intensity;
        ctx.lineWidth = drop.width;
        ctx.strokeStyle = `rgba(198,222,216,${opacity})`;
        if (drop.depth === 2) {
          // A broad quiet outer stroke gives the near plane optical softness,
          // without an expensive full-frame blur or a visible glass effect.
          ctx.lineWidth = drop.width * 2.8;
          ctx.strokeStyle = `rgba(219,235,226,${opacity * 0.2})`;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + slant * drop.length, y + drop.length);
          ctx.stroke();
          ctx.lineWidth = drop.width;
          ctx.strokeStyle = `rgba(219,235,226,${opacity * 0.62})`;
        }
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + slant * drop.length, y + drop.length);
        ctx.stroke();
      }

      // Small contact rings register the ground plane, with independent phases.
      for (let i = 0; i < 15; i++) {
        const life = wrap(t * (0.56 + sample(i, seed + 52) * 0.25) + sample(i, seed + 50), 1);
        const x = 80 + sample(i, seed + 51) * 1770;
        const y = 900 + sample(i, seed + 53) * 170;
        const radius = 2 + life * (11 + sample(i, seed + 54) * 14);
        ctx.strokeStyle = `rgba(202,224,216,${Math.sin(life * Math.PI) * 0.13 * Math.min(1, rainAmount)})`;
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius * 0.24, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Few sunlit motes, with slow drift and soft natural glints.
    if (warmth > 0.001) {
      ctx.save();
      for (let i = 0; i < 43; i++) {
        const phase = sample(i, seed + 60) * TAU;
        const x = wrap(sample(i, seed + 61) * 2300 + t * (5 + sample(i, seed + 62) * 10) * breeze, 2300) - 190;
        const y = wrap(sample(i, seed + 63) * 950 - t * (2 + sample(i, seed + 64) * 7), 1050) + 8;
        const oscillation = Math.sin(t * 0.7 + phase);
        const radius = 0.65 + sample(i, seed + 65) * 1.7;
        const shimmer = 0.2 + Math.pow(0.5 + Math.sin(t * 0.8 + phase) * 0.5, 3) * 0.65;
        const opacity = warmth * shimmer * (0.3 + (x / WIDTH) * 0.35);
        ctx.fillStyle = `rgba(250,222,154,${opacity})`;
        ctx.beginPath();
        ctx.arc(x + oscillation * 14, y + Math.cos(t * 0.47 + phase) * 8, radius, 0, TAU);
        ctx.fill();
        if (i % 9 === 0) {
          const glow = ctx.createRadialGradient(x + oscillation * 14, y, 0, x + oscillation * 14, y, radius * 4);
          glow.addColorStop(0, `rgba(254,233,173,${opacity * 0.17})`);
          glow.addColorStop(1, 'rgba(254,233,173,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(x + oscillation * 14 - radius * 4, y - radius * 4, radius * 8, radius * 8);
        }
      }
      ctx.restore();
    }
  }, [t, rain, warm, mist, wind, seed, drops]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      aria-hidden="true"
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}}
    />
  );
};

export default Atmosphere;
