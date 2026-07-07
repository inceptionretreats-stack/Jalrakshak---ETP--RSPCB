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
      <directionalLight
        ref={dir}
        position={[10, 16, 8]}
        intensity={0.55}
        color="#f5e7c8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-24, 24, 24, -24, 0.5, 70]} />
      </directionalLight>
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
    <group position={[15, 10.5, -26]}>
      {/* soft halo — fakes bloom (no post-processing available under Turbopack) */}
      <mesh position={[0, 0, -0.2]}>
        <circleGeometry args={[6, 48]} />
        <meshBasicMaterial color="#fff4cf" transparent opacity={0.16} fog={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <circleGeometry args={[3, 40]} />
        <meshBasicMaterial ref={mat} color="#dccfa6" transparent opacity={0.5} fog={false} />
      </mesh>
    </group>
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

      {/* low-poly rocks along the near shoreline */}
      {([[-7, -0.3, 0], [-2, 0.4, 1], [4, 0, 2], [9, 0.5, 0], [-11, 0.2, 1]] as const).map(([x, z, k], i) => (
        <mesh key={i} position={[x, BANK_Y + 0.16, z]} rotation={[0.3 * i, 0.7 * i, 0.1 * i]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.34 + k * 0.14, 0]} />
          <meshStandardMaterial color="#7c7f88" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Factory + smoke ---------------- */
const HALL = { x: -11.5, w: 7, h: 3.4, d: 3.4, z: -4 };
const HALL_T = BANK_Y + 0.5; // top of the plinth = base of the hall

function Factory({ transition }: { transition: TransitionRef }) {
  const smoke = useRef<THREE.Points>(null);
  const count = 90;
  const chimneyTops = useMemo<[number, number, number][]>(
    () => [
      [-13.3, BANK_Y + 4.3, -5],
      [-11.6, BANK_Y + 4.3, -5.2],
    ],
    [],
  );
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const ch = chimneyTops[i % chimneyTops.length];
      positions[i * 3] = ch[0] + (Math.random() - 0.5) * 0.9;
      positions[i * 3 + 1] = ch[1] + Math.random() * 6;
      positions[i * 3 + 2] = ch[2] + (Math.random() - 0.5) * 0.9;
      speeds[i] = 0.35 + Math.random() * 0.7;
    }
    return { positions, speeds };
  }, [chimneyTops]);

  useFrame((_, delta) => {
    const p = smoke.current;
    if (!p) return;
    const arr = p.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * 1.1;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] + i) * delta * 0.16;
      if (arr[i * 3 + 1] > BANK_Y + 13) arr[i * 3 + 1] = BANK_Y + 4.4;
    }
    p.geometry.attributes.position.needsUpdate = true;
    (p.material as THREE.PointsMaterial).opacity = Math.max(0, (1 - transition.current.value) * 0.42);
  });

  const windows: [number, number][] = [];
  for (let r = 0; r < 2; r++) for (let col = 0; col < 5; col++) windows.push([-14 + col * 1.25, HALL_T + 0.7 + r * 1.2]);

  return (
    <group>
      {/* plinth */}
      <mesh position={[HALL.x, BANK_Y + 0.25, HALL.z]} castShadow receiveShadow>
        <boxGeometry args={[HALL.w + 0.6, 0.5, HALL.d + 0.5]} />
        <meshStandardMaterial color="#6a6f7a" roughness={0.9} />
      </mesh>

      {/* main weaving hall */}
      <mesh position={[HALL.x, HALL_T + HALL.h / 2, HALL.z]} castShadow receiveShadow>
        <boxGeometry args={[HALL.w, HALL.h, HALL.d]} />
        <meshStandardMaterial color="#cdc7ba" roughness={0.92} />
      </mesh>

      {/* front window rows */}
      {windows.map(([wx, wy], i) => (
        <mesh key={i} position={[wx, wy, HALL.z + HALL.d / 2 + 0.02]}>
          <boxGeometry args={[0.62, 0.72, 0.08]} />
          <meshStandardMaterial color="#26323f" roughness={0.25} metalness={0.15} emissive="#33506b" emissiveIntensity={0.35} />
        </mesh>
      ))}

      {/* sawtooth north-light roof (classic textile mill) */}
      {[0, 1, 2, 3, 4].map((j) => (
        <group key={j} position={[-14.3 + j * 1.5, HALL_T + HALL.h, HALL.z]}>
          <mesh position={[0, 0.42, 0]} rotation={[0, 0, -0.62]} castShadow>
            <boxGeometry args={[1.5, 0.12, HALL.d + 0.1]} />
            <meshStandardMaterial color="#98a1b0" roughness={0.5} metalness={0.35} flatShading />
          </mesh>
          <mesh position={[-0.66, 0.42, 0]}>
            <boxGeometry args={[0.1, 0.86, HALL.d + 0.1]} />
            <meshStandardMaterial color="#7fd4e6" roughness={0.2} metalness={0.1} emissive="#22d3ee" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}

      {/* secondary lower block */}
      <mesh position={[-7.4, HALL_T + 1.1, -4.4]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 2.2, 2.8]} />
        <meshStandardMaterial color="#bcb6a9" roughness={0.92} />
      </mesh>

      {/* elevated water tank on legs */}
      <group position={[-6.4, 0, -5.2]}>
        {([[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]] as const).map(([lx, lz], i) => (
          <mesh key={i} position={[lx, BANK_Y + 1.1, lz]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 2.2, 6]} />
            <meshStandardMaterial color="#7f8895" roughness={0.6} metalness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, BANK_Y + 2.8, 0]} castShadow>
          <cylinderGeometry args={[0.95, 0.95, 1.2, 20]} />
          <meshStandardMaterial color="#9aa3b2" roughness={0.45} metalness={0.35} />
        </mesh>
        <mesh position={[0, BANK_Y + 3.65, 0]} castShadow>
          <coneGeometry args={[1.0, 0.7, 20]} />
          <meshStandardMaterial color="#8792a1" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      {/* silo */}
      <group position={[-9.2, 0, -5.6]}>
        <mesh position={[0, BANK_Y + 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.7, 3.4, 20]} />
          <meshStandardMaterial color="#c7ccd4" roughness={0.6} metalness={0.2} />
        </mesh>
        <mesh position={[0, BANK_Y + 3.75, 0]} castShadow>
          <coneGeometry args={[0.78, 0.7, 20]} />
          <meshStandardMaterial color="#aab2bd" roughness={0.6} metalness={0.2} />
        </mesh>
      </group>

      {/* chimneys — taller, with hazard band + cap */}
      {chimneyTops.map((ch, i) => (
        <group key={i} position={[ch[0], BANK_Y, ch[2]]}>
          <mesh position={[0, 2.15, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.44, 4.3, 16]} />
            <meshStandardMaterial color="#565b66" roughness={0.9} metalness={0.15} />
          </mesh>
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.33, 0.33, 0.42, 16]} />
            <meshStandardMaterial color="#d1495b" roughness={0.7} />
          </mesh>
          <mesh position={[0, 4.32, 0]} castShadow>
            <cylinderGeometry args={[0.46, 0.4, 0.24, 16]} />
            <meshStandardMaterial color="#3f434d" roughness={0.8} metalness={0.2} />
          </mesh>
        </group>
      ))}

      {/* softened smoke, fades out as the water cleans */}
      <points ref={smoke}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.95} color="#8a897f" transparent opacity={0.42} depthWrite={false} sizeAttenuation />
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
          {/* base plinth */}
          <mesh position={[0, -0.62, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.35, 0.26, 1.15]} />
            <meshStandardMaterial color="#4b5563" roughness={0.8} />
          </mesh>
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
          {/* small tank/stack detail so each node reads as equipment */}
          <mesh position={[0.28, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.5, 12]} />
            <meshStandardMaterial color="#9aa3b2" roughness={0.4} metalness={0.4} />
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

/* ---------------- Trees (trunk + layered pine) ---------------- */
function Trees({ transition }: { transition: TransitionRef }) {
  const trunk = useRef<THREE.InstancedMesh>(null);
  const lower = useRef<THREE.InstancedMesh>(null);
  const upper = useRef<THREE.InstancedMesh>(null);
  const count = 20;
  const data = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const right = i % 2 === 0;
        return {
          // keep left-bank trees clear of the factory (hall spans x≈-15..-8):
          // right bank ∈ [10,18], left bank ∈ [-20,-16.5]
          x: right ? 10 + Math.random() * 8 : -(16.5 + Math.random() * 3.5),
          z: -3 - Math.random() * 7,
          scale: 0.7 + Math.random() * 0.9,
          phase: Math.random() * 6,
        };
      }),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    if (!trunk.current || !lower.current || !upper.current) return;
    const grow = THREE.MathUtils.smoothstep(transition.current.value, 0.25, 1);
    data.forEach((d, i) => {
      const s = d.scale * grow;
      const sway = Math.sin(state.clock.elapsedTime * 0.9 + d.phase) * 0.04;
      const place = (mesh: THREE.InstancedMesh, yOff: number) => {
        dummy.position.set(d.x, BANK_Y + yOff * s, d.z);
        dummy.rotation.set(0, 0, sway);
        const c = Math.max(0.0001, s);
        dummy.scale.set(c, c, c);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      };
      place(trunk.current!, 0.45); // trunk (geo h 0.9)
      place(lower.current!, 1.7); // lower foliage
      place(upper.current!, 2.75); // upper foliage
    });
    trunk.current.instanceMatrix.needsUpdate = true;
    lower.current.instanceMatrix.needsUpdate = true;
    upper.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh ref={trunk} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.9, 6]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={lower} args={[undefined, undefined, count]} castShadow>
        <coneGeometry args={[1.05, 1.9, 10]} />
        <meshStandardMaterial color="#2f7d33" roughness={0.85} flatShading />
      </instancedMesh>
      <instancedMesh ref={upper} args={[undefined, undefined, count]} castShadow>
        <coneGeometry args={[0.75, 1.5, 10]} />
        <meshStandardMaterial color="#3f9a45" roughness={0.85} flatShading />
      </instancedMesh>
    </group>
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
