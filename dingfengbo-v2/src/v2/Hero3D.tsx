import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {
  GOLD, JADE, clamp, cloakLining, cloakProfile, dropGeometry,
  sandalSole, seed, studioEnvironment, tube,
} from './models/geometry';

/**
 * One transparent canvas per shot. Rotation is the Y angle in radians; scale is
 * the model multiplier. All movement is deterministic and driven by `frame`.
 * Contact choreography belongs to the scene: Opening drop hits on local 13,
 * Walk staff / shoes land on local 66 / 132. `energy` only adds a small impulse.
 * No useFrame, network assets, realtime physics, shadow maps or transmission.
 */
export type Hero3DProps = {
  kind: 'drop' | 'staff' | 'shoes' | 'gear' | 'cloak';
  frame: number;
  width?: number;
  height?: number;
  reveal?: number;
  energy?: number;
  warm?: number;
  rotation?: number;
  scale?: number;
  /** Optional separated Walk layout, with deterministic impacts at 66 / 132. */
  action?: 'walk';
};

type Rod = {from: THREE.Vector3; to: THREE.Vector3; width: number; color: string};
const vec = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function RodBatch({rods, roughness = 0.62}: {rods: Rod[]; roughness?: number}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const up = vec(0, 1, 0);
    rods.forEach((rod, i) => {
      const direction = rod.to.clone().sub(rod.from);
      dummy.position.copy(rod.from).add(rod.to).multiplyScalar(0.5);
      dummy.quaternion.setFromUnitVectors(up, direction.clone().normalize());
      dummy.scale.set(rod.width, direction.length(), rod.width * 0.83);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, new THREE.Color(rod.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [rods]);
  return <instancedMesh ref={ref} args={[undefined, undefined, rods.length]}>
    <cylinderGeometry args={[0.74, 1, 1, 5, 1]}/>
    <meshStandardMaterial color="white" roughness={roughness} metalness={0.08}/>
  </instancedMesh>;
}

function CameraAim({kind}: {kind: Hero3DProps['kind']}) {
  const {camera} = useThree();
  useLayoutEffect(() => {
    // Shoes need a more elevated view so the open toe and woven bridge read.
    if (kind === 'shoes') camera.position.set(0, 4.9, 7.1);
    else if (kind === 'gear') camera.position.set(0, 2.5, 9.8);
    else if (kind === 'staff') camera.position.set(0, 0.85, 9.6);
    else if (kind === 'cloak') camera.position.set(0, 1.0, 8.1);
    else camera.position.set(0, 0.45, 7.2);
    camera.lookAt(0, kind === 'gear' ? -0.10 : 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, kind]);
  return null;
}

function Drop({frame}: {frame: number}) {
  const geometry = useMemo(dropGeometry, []);
  const highlight = useMemo(() => tube([
    [-0.14, 1.30, 0.20], [-0.37, 0.78, 0.44], [-0.55, 0.20, 0.61],
    [-0.54, -0.39, 0.61], [-0.40, -0.89, 0.42],
  ], 0.018, 24, 6), []);
  return <group position={[0, -0.22, 0]} rotation={[0.02 * Math.sin(frame / 70), 0, -0.09]}>
    <mesh geometry={geometry}>
      <meshPhysicalMaterial color="#82bbae" roughness={0.045} metalness={0.67}
        clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={2.8}/>
    </mesh>
    <mesh geometry={highlight}>
      <meshBasicMaterial color="#e2f0df" transparent opacity={0.60}/>
    </mesh>
    <mesh geometry={geometry} position={[0.11, -0.18, 0.21]} scale={[0.63, 0.56, 0.64]}>
      <meshPhysicalMaterial color="#244940" roughness={0.06} metalness={0.91}
        clearcoat={1} transparent opacity={0.15} depthWrite={false}/>
    </mesh>
  </group>;
}

function BambooStaff() {
  const details = useMemo(() => {
    const rods: Rod[] = [];
    for (let segment = 0; segment < 9; segment++) {
      const bottom = -2.18 + segment * 0.49;
      for (let line = 0; line < 9; line++) {
        const a = (line / 9) * Math.PI * 2;
        const radius = 0.055 - segment * 0.0014;
        const bend = (y: number) => 0.06 * Math.sin((y + 2.18) * 0.45);
        rods.push({
          from: vec(Math.sin(a) * radius + bend(bottom), bottom + 0.08, Math.cos(a) * radius),
          to: vec(Math.sin(a) * radius + bend(bottom + 0.42), bottom + 0.42, Math.cos(a) * radius),
          width: 0.0024, color: line % 2 ? '#695333' : '#c4a975',
        });
      }
    }
    return rods;
  }, []);
  const nodeGeo = useMemo(() => new THREE.TorusGeometry(0.066, 0.012, 6, 14), []);
  const bodyGeo = useMemo(() => new THREE.CylinderGeometry(0.054, 0.061, 0.49, 12), []);
  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#9e834c', roughness: 0.54, metalness: 0.14,
  }), []);
  const nodeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#d7bc7b', roughness: 0.42, metalness: 0.2,
  }), []);
  return <group rotation={[0, 0, -0.075]}>
    {Array.from({length: 9}, (_, i) => {
      const y = -1.935 + i * 0.49;
      const x = 0.06 * Math.sin((y + 2.18) * 0.45);
      return <group key={i}>
        <mesh geometry={bodyGeo} material={bodyMaterial} position={[x, y, 0]} scale={[1 - i * 0.021, 1, 1 - i * 0.021]}/>
        <mesh geometry={nodeGeo} material={nodeMaterial} position={[x, y - 0.239, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1 - i * 0.021}/>
      </group>;
    })}
    <RodBatch rods={details}/>
    <mesh position={[0.047, 2.20, 0]}>
      <sphereGeometry args={[0.054, 12, 8]}/>
      <meshStandardMaterial color="#e0c18b" roughness={0.50}/>
    </mesh>
    <mesh position={[0, -2.19, 0]}>
      <cylinderGeometry args={[0.062, 0.041, 0.16, 12]}/>
      <meshStandardMaterial color="#554a36" roughness={0.48} metalness={0.30}/>
    </mesh>
  </group>;
}

function Sandal({mirror = false}: {mirror?: boolean}) {
  const sole = useMemo(sandalSole, []);
  const rods = useMemo(() => {
    const items: Rod[] = [];
    const colors = ['#c5aa71', '#dfc595', '#a78c55', '#d2b789'];
    // Dense cross weaving on the sole; the interleaved lengths expose structure.
    for (let row = 0; row < 37; row++) {
      const z = -0.85 + row * 0.047;
      const width = 0.37 * Math.sqrt(Math.max(0.12, 1 - Math.pow(z / 1.06, 4)));
      items.push({from: vec(-width, 0.144, z), to: vec(width, 0.15, z + 0.017), width: 0.013, color: colors[row % 4]});
    }
    for (let col = 0; col < 12; col++) {
      const x = -0.29 + col * 0.052;
      items.push({from: vec(x, 0.153, -0.79), to: vec(x * 1.02, 0.155, 0.84), width: 0.009, color: colors[(col + 1) % 4]});
    }
    // Two arched bands, each woven from separate narrow straw bundles.
    [-0.24, 0.43].forEach((z, band) => {
      for (let strand = 0; strand < 8; strand++) {
        for (let seg = 0; seg < 11; seg++) {
          const point = (step: number) => {
            const t = step / 11;
            return vec(-0.40 + t * 0.80, 0.19 + Math.pow(Math.sin(t * Math.PI), 0.76) * (band ? 0.36 : 0.49),
              z + (strand - 3.5) * 0.024 + Math.sin(t * Math.PI) * 0.05);
          };
          items.push({from: point(seg), to: point(seg + 1), width: 0.015, color: colors[(strand + seg + band) % 4]});
        }
      }
      // Cross ties make the bands read as woven rather than a smooth leather strap.
      for (let tie = 1; tie < 10; tie++) {
        const t = tie / 11;
        const x = -0.40 + t * 0.80;
        const y = 0.208 + Math.pow(Math.sin(t * Math.PI), 0.76) * (band ? 0.36 : 0.49);
        const shift = Math.sin(t * Math.PI) * 0.05;
        items.push({from: vec(x, y, z - 0.108 + shift), to: vec(x + 0.006, y, z + 0.109 + shift), width: 0.011, color: '#f0dba9'});
      }
    });
    // Double braided piping along the outer sole, broken into low-poly strands.
    for (let i = 0; i < 78; i++) {
      const a = (i / 78) * Math.PI * 2;
      const b = ((i + 1) / 78) * Math.PI * 2;
      const boundary = (q: number) => vec(Math.sin(q) * 0.395, 0.092 + Math.sin(q * 39) * 0.008, Math.cos(q) * 0.933);
      items.push({from: boundary(a), to: boundary(b), width: 0.019, color: colors[i % 4]});
    }
    return items;
  }, []);
  return <group scale={[mirror ? -1 : 1, 1, 1]}>
    <mesh geometry={sole} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#8a703f" roughness={0.88} metalness={0.02}/>
    </mesh>
    <RodBatch rods={rods}/>
  </group>;
}

function Shoes() {
  return <group rotation={[0, -0.13, 0]} scale={1.43}>
    <group position={[-0.62, -0.15, -0.05]} rotation={[0, 0.11, -0.02]}><Sandal/></group>
    <group position={[0.62, 0.13, 0.17]} rotation={[0.10, -0.18, 0.025]}><Sandal mirror/></group>
  </group>;
}

const FIBER_ROWS = 16;
const FIBER_COLS = 90;
const FIBER_COUNT = FIBER_ROWS * FIBER_COLS;
function WovenCloak({reveal, frame}: {reveal: number; frame: number}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const lining = useMemo(cloakLining, []);
  const collar = useMemo(() => tube(Array.from({length: 37}, (_, i) => {
    const a = 0.22 + (i / 36) * (Math.PI * 2 - 0.44);
    return [Math.sin(a) * 0.27, 1.44, Math.cos(a) * 0.20];
  }), 0.06, 40, 7), []);
  const cords = useMemo(() => [
    tube([[0.09, 1.35, 0.25], [0.17, 1.04, 0.53], [0.03, 0.93, 0.68], [-0.13, 0.95, 0.68], [-0.17, 1.04, 0.53], [-0.09, 1.35, 0.25]], 0.022, 28, 6),
    tube([[0.04, 0.98, 0.70], [0.08, 0.77, 0.74], [0.03, 0.64, 0.78]], 0.025, 12, 6),
  ], []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const up = vec(0, 1, 0);
    const colorA = new THREE.Color('#776044');
    const colorB = new THREE.Color('#dfc99b');
    for (let row = 0; row < FIBER_ROWS; row++) {
      for (let col = 0; col < FIBER_COLS; col++) {
        const i = row * FIBER_COLS + col;
        const noise = seed(i + 21);
        const a = 0.24 + ((col + (row % 2) * 0.5 + (seed(i + 3) - 0.5) * 0.36) / FIBER_COLS) * (Math.PI * 2 - 0.48);
        const t = clamp((row + (seed(i + 6) - 0.5) * 0.74) / FIBER_ROWS);
        const profile = cloakProfile(t);
        const len = 0.33 + seed(i + 10) * 0.22;
        const flutter = Math.sin(frame / 24 + i * 0.82) * 0.011 * (0.3 + t);
        const delay = noise * 0.17 + (1 - t) * 0.07;
        const r = clamp((reveal - delay) / (1 - delay));
        const eased = 1 - Math.pow(1 - r, 3);
        const explode = (1 - eased) * (1.7 + noise * 2.0);
        const radius = profile.radius + 0.035 + noise * 0.035 + explode;
        const start = vec(Math.sin(a) * radius,
          profile.y + (1 - eased) * (seed(i + 1) - 0.35) * 2.3,
          Math.cos(a) * radius * 0.70);
        const bottomProfile = cloakProfile(t + len / 3.0);
        const endRadius = bottomProfile.radius + 0.095 + noise * 0.045 + explode;
        const end = vec(
          Math.sin(a + flutter + (noise - 0.5) * 0.024) * endRadius,
          start.y - len * (0.85 + eased * 0.15),
          Math.cos(a + flutter + (noise - 0.5) * 0.024) * endRadius * 0.70,
        );
        dummy.position.copy(start).add(end).multiplyScalar(0.5);
        dummy.quaternion.setFromUnitVectors(up, end.clone().sub(start).normalize());
        dummy.scale.set(0.012 + noise * 0.010, start.distanceTo(end), 0.008 + seed(i + 8) * 0.007);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, colorA.clone().lerp(colorB, noise * 0.86 + 0.1));
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [frame, reveal]);
  return <group rotation={[0, 0, 0.02]} position={[0, 0.10, 0]}>
    <mesh geometry={lining}>
      <meshStandardMaterial color="#433524" side={THREE.DoubleSide} roughness={0.94}
        transparent opacity={clamp((reveal - 0.28) / 0.50)}/>
    </mesh>
    <instancedMesh ref={ref} args={[undefined, undefined, FIBER_COUNT]}>
      <cylinderGeometry args={[1, 0.34, 1, 4, 1]}/>
      <meshStandardMaterial color="white" roughness={0.67} metalness={0.06}/>
    </instancedMesh>
    <group scale={Math.max(0.001, reveal)}>
      <mesh geometry={collar}><meshStandardMaterial color={GOLD} roughness={0.62}/></mesh>
      {cords.map((geometry, i) => <mesh key={i} geometry={geometry}>
        <meshStandardMaterial color="#e0c58e" roughness={0.65}/>
      </mesh>)}
    </group>
  </group>;
}

function Scene({kind, frame, reveal = 1, energy = 0, warm = 0.45, rotation = 0, scale = 1, action}: Hero3DProps) {
  const environment = useMemo(studioEnvironment, []);
  const warmth = clamp(warm);
  const r = clamp(reveal);
  const appear = kind === 'cloak' ? 1 : 0.78 + r * 0.22;
  const impulse = Math.max(0, Math.min(1, energy));
  const bob = kind === 'staff' || kind === 'gear' ? 0 : Math.sin(frame / 53) * 0.018;
  return <>
    <CameraAim kind={kind}/>
    <primitive object={environment} attach="environment"/>
    <ambientLight intensity={0.32}/>
    <hemisphereLight args={['#d7e7d9', '#241b10', 0.65]}/>
    <directionalLight position={[-4, 5, 5]} color={warmth > 0.5 ? '#ffe1a7' : '#eadfc5'} intensity={2.6}/>
    <directionalLight position={[4, 1, -2]} color={JADE} intensity={2.3 - warmth * 0.8}/>
    <directionalLight position={[2, 4, -4]} color="#f7dfaf" intensity={2.8}/>
    <pointLight position={[-1.5, -1.5, 3]} color="#e7c78b" intensity={5 + warmth * 3}/>
    <group
      position={[Math.sin(frame * 1.7) * impulse * 0.025, bob + impulse * 0.016, 0]}
      rotation={[0, rotation, Math.sin(frame * 1.2) * impulse * 0.003]}
      scale={scale * appear}>
      {kind === 'drop' && <Drop frame={frame}/>}
      {kind === 'staff' && <BambooStaff/>}
      {kind === 'shoes' && <Shoes/>}
      {kind === 'gear' && action !== 'walk' && <>
        <group position={[-1.05, 0.20, -0.26]} rotation={[0, -0.16, -0.10]} scale={0.92}><BambooStaff/></group>
        <group position={[0.47, -1.38, 0.22]} rotation={[0.06, -0.19, 0]} scale={0.91}><Shoes/></group>
      </>}
      {kind === 'gear' && action === 'walk' && <>
        <group visible={frame >= 44}
          position={[-2.84, -0.70 + Math.pow(1 - clamp((frame - 48) / 18), 2) * 1.0, -0.26]}
          rotation={[0, -0.16, -0.10]} scale={0.92}><BambooStaff/></group>
        <group visible={frame >= 110}
          position={[2.50, -2.42 + Math.pow(1 - clamp((frame - 114) / 18), 2) * 1.15, 0.22]}
          rotation={[0.06, -0.19, 0]} scale={0.91}><Shoes/></group>
      </>}
      {kind === 'cloak' && <WovenCloak frame={frame} reveal={r}/>}
    </group>
  </>;
}

export const Hero3D: React.FC<Hero3DProps> = ({width = 1000, height = 700, reveal = 1, ...props}) => {
  const opacity = props.kind === 'cloak' ? 1 : clamp(reveal * 3);
  return <div style={{width, height, opacity, pointerEvents: 'none'}}>
    <ThreeCanvas width={width} height={height} dpr={1}
      camera={{fov: 34, near: 0.1, far: 60, position: [0, 1, 8]}}
      gl={{alpha: true, antialias: true, powerPreference: 'high-performance'}}
      onCreated={({gl}) => {
        gl.setClearColor('#000000', 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}>
      <Scene {...props} reveal={reveal}/>
    </ThreeCanvas>
  </div>;
};
