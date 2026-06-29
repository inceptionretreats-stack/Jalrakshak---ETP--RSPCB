import type { MutableRefObject } from "react";

/** Shared 0→1 cinematic transition value mutated by GSAP, read in useFrame. */
export type TransitionRef = MutableRefObject<{ value: number }>;
