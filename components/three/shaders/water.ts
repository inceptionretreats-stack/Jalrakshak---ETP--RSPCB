export const waterVertexShader = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying float vWave;

void main() {
  vUv = uv;
  vec3 pos = position;
  float w = sin(pos.x * 0.5 + uTime * 1.2) * 0.17
          + sin(pos.y * 0.7 + uTime * 1.7) * 0.11
          + sin((pos.x + pos.y) * 0.3 - uTime * 0.9) * 0.07;
  pos.z += w;
  vWave = w;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const waterFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uTransition;
varying vec2 vUv;
varying float vWave;

void main() {
  // cartoon two-tone depth gradient
  vec3 pollutedTop = vec3(0.27, 0.29, 0.18);
  vec3 pollutedBot = vec3(0.13, 0.17, 0.13);
  vec3 cleanTop = vec3(0.36, 0.80, 0.93);
  vec3 cleanBot = vec3(0.09, 0.45, 0.78);

  float d = smoothstep(0.0, 1.0, vUv.y);
  vec3 polluted = mix(pollutedTop, pollutedBot, d);
  vec3 clean = mix(cleanTop, cleanBot, d);
  vec3 col = mix(polluted, clean, uTransition);

  // toon highlight band on wave crests
  float band = smoothstep(0.06, 0.085, vWave);
  col += band * 0.08;

  // flowing highlight stripes (stronger when clean)
  float stripe = smoothstep(0.92, 0.99, sin(vUv.x * 46.0 + uTime * 1.6) * 0.5 + 0.5);
  col += stripe * (0.25 + uTransition * 0.6) * 0.12 * vec3(1.0);

  // murky scum specks when polluted
  float scum = step(0.86, fract(sin(dot(floor(vUv * 60.0), vec2(12.9, 78.2))) * 43758.5));
  col = mix(col, col * 0.7 + vec3(0.12, 0.13, 0.05), scum * (1.0 - uTransition) * 0.5);

  gl_FragColor = vec4(col, 1.0);
}
`;
