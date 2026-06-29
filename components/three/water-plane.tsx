"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { waterVertexShader, waterFragmentShader } from "./shaders/water";
import type { TransitionRef } from "./types";

export function WaterPlane({ transition }: { transition: TransitionRef }) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTransition: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uTransition.value = transition.current.value;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.25, 10]}>
      <planeGeometry args={[150, 110, 100, 64]} />
      <shaderMaterial ref={mat} vertexShader={waterVertexShader} fragmentShader={waterFragmentShader} uniforms={uniforms} />
    </mesh>
  );
}
