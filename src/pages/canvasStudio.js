import { CanvasRenderer } from '../components/canvasRenderer.js';
import { createShaderEditor } from '../components/editor.js';
import { createUniformControls } from '../components/uniformControls.js';
import { createErrorPanel } from '../components/errorPanel.js';
import { getState, setShader, setUniform, setSeed, savePreset, setCompileError } from '../state/store.js';
import { BASE_TEMPLATE, SAFE_MODULES } from '../shaders/templates.js';
import { mulberry32 } from '../utils/rng.js';

const applyTemplateFallback = () => {
  const state = getState();
  if (!state.currentShader) {
    setShader(BASE_TEMPLATE);
  }
};

const buildRandomShader = (seed) => {
  const rng = mulberry32(seed);
  const moduleCount = 2 + Math.floor(rng() * 3);
  const selected = [...SAFE_MODULES].sort(() => rng() - 0.5).slice(0, moduleCount);
  const header = `#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform float u_time;\nuniform vec2 u_resolution;\nuniform float u_speed;\nuniform float u_amp;\nuniform float u_seed;`;
  const modules = selected.map((module) => module.body).join('\n\n');
  const body = `void main(){\n  vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;\n  uv.x *= u_resolution.x / u_resolution.y;\n  float t = u_time * u_speed;\n  float strength = 0.5 + 0.5 * sin(t + u_seed * 0.1);\n  float v = strength;\n  fragColor = vec4(vec3(v), 1.0);\n}`;
  return `${header}\n\n${modules}\n\n${body}`;
};

export function createCanvasStudioPage() {
  applyTemplateFallback();
  const state = getState();

  const container = document.createElement('section');
  container.className = 'studio-page';

  const topBar = document.createElement('div');
  topBar.className = 'studio-topbar';

  const runButton = document.createElement('button');
  runButton.textContent = 'Run Shader';
  runButton.className = 'btn';
  runButton.addEventListener('click', () => {
    renderer.compile(currentShader, currentUniformSpecs);
  });

  const randomButton = document.createElement('button');
  randomButton.textContent = 'Randomize';
  randomButton.className = 'btn';
  randomButton.addEventListener('click', () => {
    const seed = Math.floor(Math.random() * 10000);
    setSeed(seed);
    const shader = buildRandomShader(seed);
    setShader(shader);
    editor.updateValue(shader);
    currentShader = shader;
    renderer.compile(shader, currentUniformSpecs);
  });

  const mutateButton = document.createElement('button');
  mutateButton.textContent = 'Mutate';
  mutateButton.className = 'btn';
  mutateButton.addEventListener('click', () => {
    const seed = Math.floor(Math.random() * 10000);
    setSeed(seed);
    const shader = buildRandomShader(seed ^ 0xdeadbeef);
    setShader(shader);
    editor.updateValue(shader);
    currentShader = shader;
    renderer.compile(shader, currentUniformSpecs);
  });

  const exportButton = document.createElement('button');
  exportButton.textContent = 'Export 30s';
  exportButton.className = 'btn';
  exportButton.addEventListener('click', () => {
    alert('Video export is not available in the offline build yet.');
  });

  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save Preset';
  saveButton.className = 'btn';
  saveButton.addEventListener('click', () => {
    const title = prompt('Preset title');
    if (!title) return;
    const stateNow = getState();
    savePreset({
      title,
      description: 'Saved from Canvas Studio',
      seed: stateNow.seed,
      fragGLSL: stateNow.currentShader,
      uniforms: stateNow.uniformSpecs,
      tags: ['custom'],
    });
    alert('Preset saved locally.');
  });

  topBar.append(runButton, randomButton, mutateButton, saveButton, exportButton);

  const workspace = document.createElement('div');
  workspace.className = 'studio-workspace';

  const editorColumn = document.createElement('div');
  editorColumn.className = 'studio-editor';
  const previewColumn = document.createElement('div');
  previewColumn.className = 'studio-preview';

  const editor = createShaderEditor({
    value: state.currentShader,
    onChange: (value) => {
      currentShader = value;
      setShader(value);
      renderer.compile(value, currentUniformSpecs);
    },
  });

  const canvas = document.createElement('canvas');
  canvas.className = 'studio-canvas';
  const renderer = new CanvasRenderer(canvas, {
    onCompileError: (message) => {
      setCompileError(message);
      currentError = message;
      errorPanel.show(message);
    },
  });

  let currentUniformSpecs = state.uniformSpecs;
  let currentUniforms = state.uniforms;
  let currentShader = state.currentShader;
  let currentError = state.lastCompileError;

  renderer.compile(currentShader, currentUniformSpecs);
  renderer.setUniforms(currentUniforms);
  renderer.start();

  const controls = createUniformControls({
    specs: currentUniformSpecs,
    values: currentUniforms,
    onChange: (name, value) => {
      setUniform(name, value);
      renderer.setUniforms({ ...getState().uniforms });
    },
  });

  const errorPanel = createErrorPanel();
  if (state.lastCompileError) {
    errorPanel.show(state.lastCompileError);
  }

  editorColumn.append(editor.element);
  previewColumn.append(canvas);

  workspace.append(editorColumn, previewColumn);

  container.append(topBar, workspace, controls.element, errorPanel.element);

  const update = (nextState) => {
    if (nextState.currentShader !== currentShader) {
      currentShader = nextState.currentShader;
      editor.updateValue(currentShader);
      renderer.compile(currentShader, nextState.uniformSpecs);
    }
    const specsChanged = nextState.uniformSpecs !== currentUniformSpecs;
    const uniformsChanged = nextState.uniforms !== currentUniforms;
    if (specsChanged || uniformsChanged) {
      currentUniformSpecs = nextState.uniformSpecs;
      currentUniforms = nextState.uniforms;
      controls.update(currentUniformSpecs, currentUniforms);
      renderer.setUniforms(currentUniforms);
    }
    if (nextState.lastCompileError !== currentError) {
      currentError = nextState.lastCompileError;
      errorPanel.show(currentError);
    }
  };

  return { element: container, update };
}
