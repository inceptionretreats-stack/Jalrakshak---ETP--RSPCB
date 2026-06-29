"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ScrollOverlay } from "./scroll-overlay";
import { StaticHeroBackground } from "./static-hero-background";
import { HomeContent } from "./home/home-content";
import { usePrefersReducedMotion, useWebGLSupported } from "@/lib/hooks/use-capabilities";

const RiverScene = dynamic(() => import("@/components/three/river-scene").then((m) => m.RiverScene), {
  ssr: false,
  loading: () => <StaticHeroBackground />,
});

export function LandingExperience() {
  const transition = useRef({ value: 0 });
  const sceneRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const webgl = useWebGLSupported();
  const use3D = webgl !== false && !reduced;

  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start start", "end end"] });
  // complete the transformation while the canvas is still pinned (~66% of the section)
  const t = useTransform(scrollYProgress, [0, 0.66], [0, 1], { clamp: true });
  useMotionValueEvent(t, "change", (v) => {
    transition.current.value = Math.max(0, Math.min(1, v));
  });

  const goHome = () => homeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="overflow-x-clip">
      <section ref={sceneRef} className="relative h-[320vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="absolute inset-0">
            {use3D ? <RiverScene transition={transition} /> : <StaticHeroBackground clean />}
          </div>
          <ScrollOverlay progress={t} onEnter={goHome} onSkip={goHome} />
        </div>
      </section>

      <div ref={homeRef} className="relative z-30 bg-background">
        <HomeContent />
      </div>
    </div>
  );
}
