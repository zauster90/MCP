const listeners = new Set();

const defaultUniformSpecs = [
  { name: 'u_time', type: 'float', default: 0, label: 'Time' },
  { name: 'u_speed', type: 'float', min: 0, max: 3, step: 0.01, default: 1, label: 'Speed', group: 'Motion' },
  { name: 'u_amp', type: 'float', min: 0, max: 5, step: 0.01, default: 1, label: 'Amplitude', group: 'Motion' },
  { name: 'u_seed', type: 'float', min: 0, max: 9999, step: 1, default: 42, label: 'Seed', group: 'Noise' },
];

const toUniformValues = (specs) => {
  const values = {};
  for (const spec of specs) {
    if (Array.isArray(spec.default)) {
      values[spec.name] = Number(spec.default[0] ?? 0);
    } else if (typeof spec.default === 'number') {
      values[spec.name] = spec.default;
    } else {
      values[spec.name] = 0;
    }
  }
  return values;
};

const state = {
  currentShader: '',
  uniformSpecs: defaultUniformSpecs.slice(),
  uniforms: toUniformValues(defaultUniformSpecs),
  presets: [],
  seed: 1337,
  selectedPresetId: undefined,
  lastCompileError: undefined,
};

export const getState = () => ({ ...state, uniforms: { ...state.uniforms }, uniformSpecs: state.uniformSpecs.map((u) => ({ ...u })) });

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notify = () => {
  const snapshot = getState();
  for (const listener of listeners) {
    listener(snapshot);
  }
};

export const setShader = (code) => {
  state.currentShader = code;
  notify();
};

export const setUniform = (name, value) => {
  state.uniforms[name] = value;
  notify();
};

export const setUniforms = (values) => {
  state.uniforms = { ...values };
  notify();
};

export const setUniformSpecs = (specs) => {
  state.uniformSpecs = specs.map((spec) => ({ ...spec }));
  state.uniforms = toUniformValues(specs);
  notify();
};

export const setSeed = (seed) => {
  state.seed = seed;
  state.uniforms = { ...state.uniforms, u_seed: seed };
  notify();
};

export const setCompileError = (message) => {
  state.lastCompileError = message;
  notify();
};

export const loadPreset = (preset) => {
  state.currentShader = preset.fragGLSL;
  state.uniformSpecs = preset.uniforms.map((spec) => ({ ...spec }));
  state.uniforms = toUniformValues(preset.uniforms);
  state.selectedPresetId = preset.id;
  state.seed = preset.seed;
  notify();
};

export const savePreset = (presetInput) => {
  const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const now = Date.now();
  const preset = {
    id,
    title: presetInput.title,
    description: presetInput.description,
    seed: presetInput.seed,
    fragGLSL: presetInput.fragGLSL,
    uniforms: presetInput.uniforms.map((spec) => ({ ...spec })),
    tags: presetInput.tags ? [...presetInput.tags] : undefined,
    createdAt: now,
    version: 1,
  };
  state.presets = [preset, ...state.presets];
  notify();
  return preset;
};

export const randomizeSeed = () => {
  const nextSeed = Math.floor(Math.random() * 10000);
  setSeed(nextSeed);
};

export const resetStore = () => {
  state.currentShader = '';
  state.uniformSpecs = defaultUniformSpecs.map((spec) => ({ ...spec }));
  state.uniforms = toUniformValues(state.uniformSpecs);
  state.presets = [];
  state.seed = 1337;
  state.selectedPresetId = undefined;
  state.lastCompileError = undefined;
  notify();
};

export const getDefaultUniformSpecs = () => defaultUniformSpecs.map((spec) => ({ ...spec }));
