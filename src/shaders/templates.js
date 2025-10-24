export const BASE_TEMPLATE = `#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_speed;
uniform float u_amp;
uniform float u_seed;

float hash(float n){ return fract(sin(n)*43758.5453123); }

void main(){
  vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
  uv.x *= u_resolution.x/u_resolution.y;

  float t = u_time * u_speed;
  float s = sin(uv.x*3.14 + t) * cos(uv.y*3.14 - t);
  float n = hash(floor(uv.x*10.0 + u_seed) + floor(uv.y*10.0 + u_seed*2.0));
  float v = 0.5 + 0.5 * sin(6.2831*(s + n*0.15) + t*u_amp);

  vec3 col = vec3(0.5 + 0.5*cos(6.2831*(v + vec3(0.0,0.33,0.66))));
  gl_FragColor = vec4(col,1.0);
}`;

export const SAFE_MODULES = [
  {
    label: 'Cosine Palette',
    body: `vec3 palette(float t){
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.33, 0.67);
  return a + b * cos(6.28318 * (c * t + d));
}`,
  },
  {
    label: 'FBM Noise',
    body: `float noise(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float fbm(vec2 p){
  float value = 0.0;
  float amplitude = 0.5;
  for(int i = 0; i < 4; i++){
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}`,
  },
  {
    label: 'Domain Warp',
    body: `vec2 domainWarp(vec2 uv, float t){
  vec2 q = vec2(fbm(uv + vec2(0.0, 0.1 + t)), fbm(uv + vec2(1.0, 0.3 - t)));
  return uv + 0.5 * vec2(fbm(uv + q), fbm(uv - q));
}`,
  },
];
