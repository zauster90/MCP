export const lessons = [
  {
    id: 'uv-basics',
    title: 'Working with UV Coordinates',
    summary: 'Learn how to normalise fragment coordinates and remap them into useful spaces.',
    codeStart: `void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  fragColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);
}`,
    checkpoints: [
      {
        title: 'Normalise to -1..1',
        diff: `- vec2 uv = gl_FragCoord.xy / u_resolution.xy;\n+ vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;`,
        explanation: 'Shifting the UV range to -1..1 centres the origin and simplifies radial effects.',
      },
      {
        title: 'Correct aspect ratio',
        diff: `+ uv.x *= u_resolution.x / u_resolution.y;`,
        explanation: 'Scaling the x axis by the aspect ratio prevents stretching when the canvas is not square.',
      },
    ],
  },
  {
    id: 'time',
    title: 'Animating with Time',
    summary: 'Drive periodic animation using the time uniform.',
    codeStart: `void main(){
  float wave = sin(u_time) * 0.5 + 0.5;
  fragColor = vec4(vec3(wave), 1.0);
}`,
    checkpoints: [
      {
        title: 'Modulate speed',
        diff: `- float wave = sin(u_time) * 0.5 + 0.5;\n+ float wave = sin(u_time * u_speed) * 0.5 + 0.5;`,
        explanation: 'Scaling u_time with u_speed exposes animation rate control to the UI.',
      },
      {
        title: 'Offset phase',
        diff: `+ wave = sin(u_time * u_speed + u_seed * 0.1) * 0.5 + 0.5;`,
        explanation: 'A seed-based phase offset helps produce deterministic but unique results.',
      },
    ],
  },
  {
    id: 'palette',
    title: 'Cosine Colour Palettes',
    summary: 'Use cosine palettes for smooth looping gradients.',
    codeStart: `vec3 palette(float t){
  return vec3(0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67))));
}

void main(){
  float t = sin(u_time);
  fragColor = vec4(palette(t), 1.0);
}`,
    checkpoints: [
      {
        title: 'Add parameters',
        diff: `- vec3 palette(float t){ ... }\n+ vec3 palette(float t){\n+  vec3 a = vec3(0.5);\n+  vec3 b = vec3(0.5);\n+  vec3 c = vec3(1.0);\n+  vec3 d = vec3(0.0, 0.33, 0.67);\n+  return a + b * cos(6.28318 * (c * t + d));\n+ }`,
        explanation: 'Express the palette in its canonical form so you can modulate the a/b/c/d vectors.',
      },
      {
        title: 'Drive with fbm',
        diff: `+ float t = fbm(vec2(u_time * 0.25));`,
        explanation: 'Using fbm to drive the palette yields organic colour variation.',
      },
    ],
  },
  {
    id: 'noise',
    title: 'Fractal Brownian Motion',
    summary: 'Layer simple noise functions to build rich procedural detail.',
    codeStart: `float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main(){
  float n = noise(gl_FragCoord.xy * 0.01);
  fragColor = vec4(vec3(n), 1.0);
}`,
    checkpoints: [
      {
        title: 'Build fbm',
        diff: `+ float fbm(vec2 p){\n+   float value = 0.0;\n+   float amp = 0.5;\n+   for(int i = 0; i < 4; i++){\n+     value += amp * noise(p);\n+     p *= 2.0;\n+     amp *= 0.5;\n+   }\n+   return value;\n+ }`,
        explanation: 'Summing noise at different scales produces fractal detail and soft motion.',
      },
      {
        title: 'Animate the sample position',
        diff: `+ float n = fbm((gl_FragCoord.xy + vec2(u_time * 30.0, 0.0)) * 0.01);`,
        explanation: 'Moving the sampling position over time creates flowing noise textures.',
      },
    ],
  },
  {
    id: 'sdf',
    title: 'Signed Distance Fields',
    summary: 'Render crisp procedural shapes using distance functions.',
    codeStart: `float sdCircle(vec2 p, float r){
  return length(p) - r;
}

void main(){
  vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
  float d = sdCircle(uv, 0.5);
  float m = smoothstep(0.01, -0.01, d);
  fragColor = vec4(vec3(m), 1.0);
}`,
    checkpoints: [
      {
        title: 'Animate radius',
        diff: `+ float radius = 0.35 + 0.15 * sin(u_time * u_speed);\n+ float d = sdCircle(uv, radius);`,
        explanation: 'Modulating the radius brings the SDF shape to life.',
      },
      {
        title: 'Add outline',
        diff: `+ float edge = smoothstep(0.01, 0.0, abs(d) - 0.01);\n+ vec3 col = mix(vec3(m), vec3(0.0, 0.8, 1.0), edge);`,
        explanation: 'Combining fill and edge masks creates stylised outlines.',
      },
    ],
  },
  {
    id: 'polar',
    title: 'Polar Coordinates',
    summary: 'Transform UVs to polar space for radial patterns.',
    codeStart: `vec2 polar(vec2 uv){
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  return vec2(r, a);
}

void main(){
  vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
  vec2 pa = polar(uv);
  float stripes = sin(pa.y * 6.0 + u_time);
  fragColor = vec4(vec3(0.5 + 0.5 * stripes), 1.0);
}`,
    checkpoints: [
      {
        title: 'Animate rotation',
        diff: `+ float stripes = sin(pa.y * 6.0 + u_time * u_speed);`,
        explanation: 'Multiplying the angular component by time rotates the pattern smoothly.',
      },
      {
        title: 'Add radial gradient',
        diff: `+ float glow = smoothstep(0.8, 0.0, pa.x);\n+ fragColor = vec4(vec3(glow * (0.5 + 0.5 * stripes)), 1.0);`,
        explanation: 'Fading towards the edge provides a nice vignette.',
      },
    ],
  },
  {
    id: 'warp',
    title: 'Domain Warping',
    summary: 'Warp coordinate space with fbm for complex motion.',
    codeStart: `vec2 warp(vec2 uv, float t){
  float nx = fbm(uv + vec2(0.0, t));
  float ny = fbm(uv + vec2(t, 0.0));
  return uv + vec2(nx, ny) * 0.25;
}

void main(){
  vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 1.5 - 0.75;
  vec2 w = warp(uv, u_time * 0.25);
  float n = fbm(w);
  fragColor = vec4(vec3(n), 1.0);
}`,
    checkpoints: [
      {
        title: 'Animate strength',
        diff: `+ float strength = mix(0.1, 0.4, 0.5 + 0.5 * sin(u_time * 0.5));\n+ return uv + vec2(nx, ny) * strength;`,
        explanation: 'Modulating warp strength keeps the motion lively while remaining deterministic.',
      },
      {
        title: 'Colour with palette',
        diff: `+ vec3 col = palette(n);\n+ fragColor = vec4(col, 1.0);`,
        explanation: 'Feeding the warped fbm value into a palette creates vivid visuals.',
      },
    ],
  },
  {
    id: 'time-loop',
    title: 'Looping Animations',
    summary: 'Ensure a shader loops seamlessly over 30 seconds.',
    codeStart: `float loopTime(float t, float duration){
  return mod(t, duration);
}

void main(){
  float t = loopTime(u_time, 30.0);
  float wave = sin(t * u_speed);
  fragColor = vec4(vec3(0.5 + 0.5 * wave), 1.0);
}`,
    checkpoints: [
      {
        title: 'Mirror time',
        diff: `+ float mirrored = abs(fract(t / 15.0) * 2.0 - 1.0);\n+ float wave = sin(mirrored * 3.14159);`,
        explanation: 'Mirroring the time parameter removes hard jumps when repeating the loop.',
      },
      {
        title: 'Expose duration uniform',
        diff: `+ uniform float u_duration;\n+ float t = loopTime(u_time, u_duration);`,
        explanation: 'Allowing the duration to change keeps exports deterministic yet flexible.',
      },
    ],
  },
];
