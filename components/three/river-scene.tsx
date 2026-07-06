"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { WaterPlane } from "./water-plane";
import { SceneEnvironment } from "./scene-environment";
import type { TransitionRef } from "./types";

function CameraRig({ transition }: { transition: TransitionRef }) {
  const { camera } = useThree();
  useFrame((state) => {
    const t = transition.current.value;
    const time = state.clock.elapsedTime;
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const narrow = aspect < 1.1; // portrait phones / narrow tablets
    // Widen the FOV (and ease back a touch) on narrow screens so the whole wide
    // factory→pipeline→river scene fits AND fills the frame — instead of shrinking
    // into a thin band with the factory cropped off the side.
    const targetFov = narrow ? THREE.MathUtils.clamp(44 / aspect, 40, 74) : 40;
    if (Math.abs(cam.fov - targetFov) > 0.15) {
      cam.fov = targetFov;
      cam.updateProjectionMatrix();
    }
    const wf = narrow ? THREE.MathUtils.clamp(1.5 / aspect, 1, 1.9) : 1;
    camera.position.x = Math.sin(time * 0.05) * 0.6;
    camera.position.y = (5.4 + Math.sin(time * 0.2) * 0.05) * (narrow ? 0.82 + 0.18 * wf : 1);
    camera.position.z = THREE.MathUtils.lerp(22, 20.5, t) * wf;
    // aim down so the horizon sits in the upper portion: text above, factory/pipeline mid, river across the foreground
    camera.lookAt(0, 2.4, -2);
  });
  return null;
}

export function RiverScene({ transition }: { transition: TransitionRef }) {
  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMappingExposure: 1.08 }}
      dpr={[1, 1.8]}
      camera={{ position: [0, 5.4, 22], fov: 40, near: 0.1, far: 140 }}
    >
      <CameraRig transition={transition} />
      <WaterPlane transition={transition} />
      <SceneEnvironment transition={transition} />
    </Canvas>
  );
}
