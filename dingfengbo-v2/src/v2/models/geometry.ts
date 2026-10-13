import * as THREE from 'three';

/** Procedural models are self contained: no remote meshes or texture requests. */
export const GOLD = '#D6BB81';
export const JADE = '#6EA99E';
export const seed = (n: number) => {
  const x = Math.sin(n * 91.73 + 18.91) * 19283.7123;
  return x - Math.floor(x);
};
export const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function studioEnvironment() {
  // Soft boxes reflected in polished surfaces, generated synchronously per canvas.
  const width = 256;
  const height = 128;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const v = y / height;
      const box = (cx: number, cy: number, sx: number, sy: number) =>
        Math.exp(-Math.pow((u - cx) / sx, 6) - Math.pow((v - cy) / sy, 6));
      const left = box(0.19, 0.4, 0.055, 0.28);
      const right = box(0.73, 0.36, 0.025, 0.31);
      const top = box(0.43, 0.19, 0.24, 0.04);
      const rim = box(0.93, 0.44, 0.023, 0.17);
      const p = (y * width + x) * 4;
      data[p] = Math.min(255, 9 + left * 235 + right * 146 + top * 170 + rim * 220);
      data[p + 1] = Math.min(255, 13 + left * 220 + right * 222 + top * 159 + rim * 150);
      data[p + 2] = Math.min(255, 15 + left * 192 + right * 207 + top * 133 + rim * 81);
      data[p + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function dropGeometry() {
  // Bottom-up lathe: rounded belly, slender lifted point.
  const profile = [
    [0, -1.34], [0.24, -1.3], [0.53, -1.15], [0.76, -0.89],
    [0.89, -0.54], [0.91, -0.2], [0.85, 0.14], [0.69, 0.49],
    [0.48, 0.88], [0.26, 1.31], [0.09, 1.77], [0, 2.0],
  ];
  const curve = new THREE.SplineCurve(profile.map(([x, y]) => new THREE.Vector2(x, y)));
  return new THREE.LatheGeometry(curve.getPoints(42), 48);
}

export function sandalSole() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.2, -0.89);
  shape.bezierCurveTo(-0.40, -0.76, -0.44, -0.28, -0.41, 0.2);
  shape.bezierCurveTo(-0.44, 0.63, -0.30, 0.92, -0.08, 0.99);
  shape.bezierCurveTo(0.12, 1.05, 0.41, 0.87, 0.43, 0.6);
  shape.bezierCurveTo(0.49, 0.24, 0.31, -0.20, 0.3, -0.58);
  shape.bezierCurveTo(0.32, -0.82, 0.01, -1.01, -0.2, -0.89);
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.11, bevelEnabled: true, bevelSize: 0.034,
    bevelThickness: 0.025, bevelSegments: 2, curveSegments: 12,
  });
}

export function tube(points: number[][], radius: number, segments = 24, radial = 6) {
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    segments, radius, radial, false,
  );
}

export const cloakProfile = (t: number) => {
  // The shoulder is a rounded anatomical arc, distinct from the hanging skirt.
  // Smooth interpolation avoids a stack of rigid cones at the fiber row edges.
  const stops = [[0, 0.24], [0.08, 0.61], [0.19, 0.98], [0.31, 1.02],
    [0.48, 1.06], [0.69, 1.20], [0.87, 1.35], [1.0, 1.46]];
  const q = clamp(t);
  let radius = stops[stops.length - 1][1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (q >= stops[i][0] && q <= stops[i + 1][0]) {
      const a = (q - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
      const s = a * a * (3 - 2 * a);
      radius = stops[i][1] + (stops[i + 1][1] - stops[i][1]) * s;
      break;
    }
  }
  const y = 1.48 - q * 3.0;
  return {y, radius};
};

export function cloakLining() {
  const positions: number[] = [];
  const indices: number[] = [];
  const rows = 20;
  const cols = 64;
  for (let row = 0; row <= rows; row++) {
    const {y, radius} = cloakProfile(row / rows);
    for (let col = 0; col <= cols; col++) {
      const a = 0.27 + (col / cols) * (Math.PI * 2 - 0.54);
      positions.push(Math.sin(a) * radius, y, Math.cos(a) * radius * 0.70);
      if (row < rows && col < cols) {
        const i = row * (cols + 1) + col;
        indices.push(i, i + 1, i + cols + 1, i + 1, i + cols + 2, i + cols + 1);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
