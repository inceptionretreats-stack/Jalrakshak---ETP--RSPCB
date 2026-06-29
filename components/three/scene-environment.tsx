"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { TransitionRef } from "./types";

const PIPE_Z = -0.5;
const PIPE_Y = 0.4;
const PIPE_X0 = -8.5;
const PIPE_X1 = 7;
const BANK_Y = -1.55;

const NODES = [
  { key: "FM", label: "Flow Meter", x: -6, color: "#22d3ee" },
  { key: "ETP", label: "ETP Unit", x: -3, color: "#0ea5e9" },
  { key: "RO", label: "RO System", x: 0, color: "#6366f1" },
  { key: "MEE", label: "MEE System", x: 3, color: "#8b5cf6" },
  { key: "WATER", label: "Treated Water", x: 6, color: "#10b981" },
];

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/* ---------------- Atmosphere ---------------- */
function Atmosphere({ transition }: { transition: TransitionRef }) {
  const { scene } = useThree();
  const dir = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const c = useMemo(
    () => ({
      pollSky: new THREE.Color("#9a9678"),
      cleanSky: new THREE.Color("#bfe6ff"),
      warm: new THREE.Color("#f5e7c8"),
      bright: new THREE.Color("#ffffff"),
      tmp: new THREE.Color(),
      tmp2: new THREE.Color(),
      fog: new THREE.Fog("#9a9678", 34, 80),
    }),
    [],
  );

  useEffect(() => {
    scene.background = c.pollSky.clone();
    scene.fog = c.fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, c]);

  useFrame(() => {
    const t = transition.current.value;
    c.tmp.copy(c.pollSky).lerp(c.cleanSky, t);
    if (scene.background && (scene.background as THREE.Color).isColor) (scene.background as THREE.Color).copy(c.tmp);
    c.fog.color.copy(c.tmp);
    if (dir.current) {
      dir.current.intensity = THREE.MathUtils.lerp(0.55, 1.7, t);
      c.tmp2.copy(c.warm).lerp(c.bright, t);
      dir.current.color.copy(c.tmp2);
    }
    if (amb.current) amb.current.intensity = THREE.MathUtils.lerp(0.55, 0.95, t);
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.55} />
      <directionalLight ref={dir} position={[8, 13, 6]} intensity={0.55} color="#f5e7c8" />
      <hemisphereLight intensity={0.45} color="#bfe6ff" groundColor="#5f6a45" />
    </>
  );
}

/* ---------------- Sun ---------------- */
function Sun({ transition }: { transition: TransitionRef }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const c = useMemo(() => ({ dim: new THREE.Color("#dccfa6"), bright: new THREE.Color("#fff4cf"), tmp: new THREE.Color() }), []);
  useFrame(() => {
    if (!mat.current) return;
    c.tmp.copy(c.dim).lerp(c.bright, transition.current.value);
    mat.current.color.copy(c.tmp);
    mat.current.opacity = 0.5 + transition.current.value * 0.5;
  });
  return (
    <mesh position={[15, 10.5, -26]}>
      <circleGeometry args={[3, 40]} />
      <meshBasicMaterial ref={mat} color="#dccfa6" transparent opacity={0.5} fog={false} />
    </mesh>
  );
}

/* ---------------- Land: ground bank + smooth rolling hills ---------------- */
const HILLS = [
  // distant ridge (hazed by fog → depth)
  { x: -16, z: -30, r: 16, fy: 0.4, hue: 0.33, light: 0.6 },
  { x: 12, z: -32, r: 17, fy: 0.38, hue: 0.34, light: 0.62 },
  { x: 30, z: -29, r: 14, fy: 0.4, hue: 0.33, light: 0.58 },
  // mid ridge
  { x: -30, z: -15, r: 10, fy: 0.5, hue: 0.3, light: 0.42 },
  { x: -17, z: -16.5, r: 12, fy: 0.46, hue: 0.31, light: 0.46 },
  { x: -3, z: -17.5, r: 13, fy: 0.48, hue: 0.32, light: 0.5 },
  { x: 12, z: -16.5, r: 12, fy: 0.46, hue: 0.31, light: 0.45 },
  { x: 27, z: -15, r: 10, fy: 0.5, hue: 0.3, light: 0.43 },
  // near rises on the bank
  { x: 4, z: -12.5, r: 8.5, fy: 0.55, hue: 0.33, light: 0.34 },
  { x: -22, z: -12, r: 7.5, fy: 0.55, hue: 0.33, light: 0.33 },
];

function Land({ transition }: { transition: TransitionRef }) {
  const ground = useRef<THREE.MeshStandardMaterial>(null);
  const hillRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const c = useMemo(() => {
    const barrenGround = new THREE.Color("#857b54");
    const greenGround = new THREE.Color("#4f9a48");
    const hills = HILLS.map((h) => ({
      barren: new THREE.Color().setHSL(0.11, 0.22, h.light * 0.85),
      green: new THREE.Color().setHSL(h.hue, 0.42, h.light),
    }));
    return { barrenGround, greenGround, hills, tmp: new THREE.Color() };
  }, []);

  useFrame(() => {
    const t = transition.current.value;
    if (ground.current) {
      c.tmp.copy(c.barrenGround).lerp(c.greenGround, t);
      ground.current.color.copy(c.tmp);
    }
    c.hills.forEach((h, i) => {
      const m = hillRefs.current[i];
      if (!m) return;
      c.tmp.copy(h.barren).lerp(h.green, t);
      m.color.copy(c.tmp);
    });
  });

  return (
    <group>
      {/* raised green bank holding the plant — front edge (z=1) is the shoreline, river is in front */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, BANK_Y, -16]} receiveShadow>
        <planeGeometry args={[180, 34]} />
        <meshStandardMaterial ref={ground} color="#857b54" roughness={1} />
      </mesh>

      {/* smooth rolling hills along the horizon */}
      {HILLS.map((h, i) => (
        <mesh key={i} position={[h.x, 1 - h.r * h.fy, h.z]} scale={[1.5, h.fy, 1]}>
          <sphereGeometry args={[h.r, 36, 24]} />
          <meshStandardMaterial
            ref={(el) => {
              hillRefs.current[i] = el;
            }}
            color="#6f6a4a"
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Factory + smoke ---------------- */
function Factory({ transition }: { transition: TransitionRef }) {
  const smoke = useRef<THREE.Points>(null);
  const count = 130;
  const chimneys = useMemo(() => [[-12.6, 2.4, -4], [-10.8, 3, -4.2]], []);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const ch = chimneys[i % chimneys.length];
      positions[i * 3] = ch[0] + (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 1] = ch[1] + Math.random() * 7;
      positions[i * 3 + 2] = ch[2] + (Math.random() - 0.5) * 1.2;
      speeds[i] = 0.4 + Math.random() * 0.8;
    }
    return { positions, speeds };
  }, [chimneys]);

  useFrame((_, delta) => {
    const p = smoke.current;
    if (!p) return;
    const arr = p.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * 1.3;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] + i) * delta * 0.18;
      if (arr[i * 3 + 1] > 11) arr[i * 3 + 1] = 2.4;
    }
    p.geometry.attributes.position.needsUpdate = true;
    (p.material as THREE.PointsMaterial).opacity = Math.max(0, (1 - transition.current.value) * 0.5);
  });

  const Building = ({ x, w, h, d = 2.4 }: { x: number; w: number; h: number; d?: number }) => (
    <mesh position={[x, BANK_Y + h / 2, -4]} castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color="#8f95a3" roughness={0.85} flatShading />
    </mesh>
  );

  return (
    <group>
      <Building x={-12.8} w={3.4} h={4.4} />
      <Building x={-10.4} w={2.6} h={3.1} />
      <Building x={-8.5} w={2} h={2.3} d={1.8} />
      {/* roof gable */}
      <mesh position={[-12.8, BANK_Y + 4.4, -4]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[1.7, 1.7, 2.45]} />
        <meshStandardMaterial color="#727a8a" roughness={0.9} flatShading />
      </mesh>
      {/* chimneys */}
      {chimneys.map((ch, i) => (
        <mesh key={i} position={[ch[0], ch[1] - 1.1, ch[2]]} castShadow>
          <cylinderGeometry args={[0.32, 0.42, 2.8, 14]} />
          <meshStandardMaterial color="#5f646f" roughness={0.95} />
        </mesh>
      ))}
      <points ref={smoke}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={1.25} color="#74746c" transparent opacity={0.5} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  );
}

/* ---------------- Pipeline ---------------- */
function Pipeline({ transition }: { transition: TransitionRef }) {
  const nodeRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const flow = useRef<THREE.Points>(null);
  const pipeMat = useRef<THREE.MeshStandardMaterial>(null);
  const count = 70;

  const colors = useMemo(() => NODES.map((n) => new THREE.Color(n.color)), []);
  const gray = useMemo(() => new THREE.Color("#aab2c0"), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = PIPE_X0 + Math.random() * (PIPE_X1 - PIPE_X0);
      arr[i * 3 + 1] = PIPE_Y;
      arr[i * 3 + 2] = PIPE_Z;
    }
    return arr;
  }, []);
  const speeds = useMemo(() => Array.from({ length: count }, () => 1.4 + Math.random() * 1.6), []);

  useFrame((_, delta) => {
    const t = transition.current.value;
    NODES.forEach((_, i) => {
      const m = nodeRefs.current[i];
      if (!m) return;
      const active = clamp01((t - i * 0.16) / 0.18);
      tmp.copy(gray).lerp(colors[i], active);
      m.color.copy(tmp);
      m.emissive.copy(colors[i]);
      m.emissiveIntensity = active * 0.65;
    });
    if (pipeMat.current) pipeMat.current.emissiveIntensity = t * 0.22;

    const p = flow.current;
    if (p) {
      const arr = p.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        arr[i * 3] += speeds[i] * delta;
        if (arr[i * 3] > PIPE_X1) arr[i * 3] = PIPE_X0;
      }
      p.geometry.attributes.position.needsUpdate = true;
      const m = p.material as THREE.PointsMaterial;
      m.opacity = 0.25 + t * 0.65;
      tmp.copy(gray).lerp(colors[0], t);
      m.color.copy(tmp);
    }
  });

  return (
    <group>
      {/* horizontal pipe */}
      <mesh position={[(PIPE_X0 + PIPE_X1) / 2, PIPE_Y, PIPE_Z]}>
        <boxGeometry args={[PIPE_X1 - PIPE_X0 + 0.6, 0.32, 0.32]} />
        <meshStandardMaterial ref={pipeMat} color="#c2cad8" roughness={0.55} metalness={0.25} emissive="#22d3ee" emissiveIntensity={0} />
      </mesh>
      {/* factory feed (down from factory into pipe) */}
      <mesh position={[PIPE_X0, BANK_Y + 1.1, PIPE_Z]}>
        <boxGeometry args={[0.32, 2.4, 0.32]} />
        <meshStandardMaterial color="#c2cad8" roughness={0.55} metalness={0.25} />
      </mesh>
      {/* treated outfall sloping from the Treated node down into the river */}
      <mesh position={[6.5, -0.8, 2.6]} rotation={[0.34, 0, 0]}>
        <boxGeometry args={[0.32, 0.32, 7]} />
        <meshStandardMaterial color="#c2cad8" roughness={0.55} metalness={0.25} />
      </mesh>

      {/* nodes */}
      {NODES.map((n, i) => (
        <group key={n.key} position={[n.x, PIPE_Y + 0.5, PIPE_Z]}>
          <mesh castShadow>
            <boxGeometry args={[1.15, 1, 0.95]} />
            <meshStandardMaterial
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              color="#aab2c0"
              roughness={0.5}
              flatShading
            />
          </mesh>
          <Html position={[0, 1.05, 0]} center distanceFactor={13} zIndexRange={[8, 0]} pointerEvents="none">
            <span className="select-none whitespace-nowrap rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-700 shadow-sm">
              {n.key}
            </span>
          </Html>
        </group>
      ))}

      {/* flowing particles */}
      <points ref={flow}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.32} color="#aab2c0" transparent opacity={0.3} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  );
}

/* ---------------- Trees ---------------- */
function Trees({ transition }: { transition: TransitionRef }) {
  const foliage = useRef<THREE.InstancedMesh>(null);
  const count = 20;
  const data = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const right = i % 2 === 0;
        return {
          x: (right ? 1 : -1) * (10 + Math.random() * 8),
          z: -3 - Math.random() * 7,
          scale: 0.8 + Math.random() * 1,
          phase: Math.random() * 6,
        };
      }),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    const m = foliage.current;
    if (!m) return;
    const grow = THREE.MathUtils.smoothstep(transition.current.value, 0.25, 1);
    data.forEach((d, i) => {
      const s = d.scale * grow;
      const sway = Math.sin(state.clock.elapsedTime * 0.9 + d.phase) * 0.04;
      dummy.position.set(d.x, BANK_Y + s * 1.2, d.z);
      dummy.rotation.set(0, 0, sway);
      dummy.scale.set(Math.max(0.0001, s), Math.max(0.0001, s * 1.6), Math.max(0.0001, s));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={foliage} args={[undefined, undefined, count]} castShadow>
      <coneGeometry args={[1, 2.5, 9]} />
      <meshStandardMaterial color="#2f7d33" roughness={0.85} flatShading />
    </instancedMesh>
  );
}

/* ---------------- Fish (front water) ---------------- */
function Fish({ transition }: { transition: TransitionRef }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 9;
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 26,
        y: -2.05,
        z: 2 + Math.random() * 9,
        speed: 1 + Math.random() * 1.6,
        phase: Math.random() * 6,
      })),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const show = THREE.MathUtils.smoothstep(transition.current.value, 0.55, 1);
    const time = state.clock.elapsedTime;
    data.forEach((d, i) => {
      const x = ((d.x + time * d.speed + 18) % 36) - 18;
      dummy.position.set(x, d.y + Math.sin(time + d.phase) * 0.08, d.z);
      dummy.rotation.set(0, Math.PI / 2, Math.sin(time * 4 + d.phase) * 0.2);
      dummy.scale.setScalar(Math.max(0.0001, 0.5 * show));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.4, 1.1, 6]} />
      <meshStandardMaterial color="#f97316" roughness={0.6} flatShading />
    </instancedMesh>
  );
}

export function SceneEnvironment({ transition }: { transition: TransitionRef }) {
  return (
    <>
      <Atmosphere transition={transition} />
      <Sun transition={transition} />
      <Land transition={transition} />
      <Factory transition={transition} />
      <Pipeline transition={transition} />
      <Trees transition={transition} />
      <Fish transition={transition} />
    </>
  );
}
