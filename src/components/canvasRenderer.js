const FULLSCREEN_TRIANGLE = new Float32Array([
  -1, -1,
  3, -1,
  -1, 3,
]);

const HEADER_LINE_COUNT = 6;

const adjustErrorLog = (message) =>
  message.replace(/0:(\d+):/g, (_, line) => {
    const parsed = Number(line);
    const adjusted = Math.max(1, parsed - HEADER_LINE_COUNT);
    return `0:${adjusted}:`;
  });

export class CanvasRenderer {
  constructor(canvas, { onCompileError } = {}) {
    this.canvas = canvas;
    this.onCompileError = onCompileError;
    this.frame = null;
    this.program = null;
    this.gl = null;
    this.uniformLocations = new Map();
    this.uniformSpecMap = {};
    this.startTime = null;
    this.mouse = [0, 0];
    this.uniforms = {};
    this.setupContext();
    this.attachMouseHandlers();
  }

  setupContext() {
    const gl = this.canvas.getContext('webgl2');
    if (!gl) {
      this.onCompileError?.('WebGL2 is not supported in this browser.');
      return;
    }
    this.gl = gl;

    const buffer = gl.createBuffer();
    if (!buffer) {
      this.onCompileError?.('Failed to create WebGL buffer.');
      return;
    }
    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_TRIANGLE, gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    if (!vao) {
      this.onCompileError?.('Failed to create vertex array.');
      return;
    }
    this.vao = vao;
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  attachMouseHandlers() {
    const handleMove = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = rect.height - (event.clientY - rect.top);
      this.mouse = [x, y];
    };
    this.canvas.addEventListener('mousemove', handleMove);
    this.canvas.addEventListener('touchmove', (event) => {
      if (!event.touches.length) return;
      const touch = event.touches[0];
      handleMove(touch);
    });
  }

  resize() {
    const gl = this.gl;
    if (!gl) return;
    const ratio = window.devicePixelRatio || 1;
    const width = Math.floor(this.canvas.clientWidth * ratio);
    const height = Math.floor(this.canvas.clientHeight * ratio);
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  compile(shaderSource, uniformSpecs) {
    if (!this.gl) return;
    const gl = this.gl;
    this.uniformSpecMap = {};
    for (const spec of uniformSpecs) {
      this.uniformSpecMap[spec.name] = spec;
    }

    const sanitizedSource = shaderSource
      .replace(/#version\s+\d+\s+es?/gi, '')
      .replace(/precision\s+highp\s+float\s*;/gi, '')
      .replace(/out\s+vec4\s+fragColor\s*;/gi, '')
      .trim();

    const vertexShaderSource = `#version 300 es
      layout(location = 0) in vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `#version 300 es
      precision highp float;
      out vec4 fragColor;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      ${sanitizedSource.replace(/gl_FragColor/g, 'fragColor')}
    `;

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      if (!shader) {
        throw new Error('Unable to create shader.');
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(info ?? 'Shader compile error.');
      }
      return shader;
    };

    const buildProgram = () => {
      const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
      const program = gl.createProgram();
      if (!program) {
        throw new Error('Unable to create shader program.');
      }
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.bindAttribLocation(program, 0, 'a_position');
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(info ?? 'Program link error.');
      }
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return program;
    };

    try {
      const program = buildProgram();
      if (this.program) {
        gl.deleteProgram(this.program);
      }
      this.program = program;
      gl.useProgram(program);
      this.uniformLocations = new Map();
      for (const spec of uniformSpecs) {
        const location = gl.getUniformLocation(program, spec.name);
        if (location) {
          this.uniformLocations.set(spec.name, location);
        }
      }
      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
      const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
      const timeLocation = gl.getUniformLocation(program, 'u_time');
      if (resolutionLocation) this.uniformLocations.set('u_resolution', resolutionLocation);
      if (mouseLocation) this.uniformLocations.set('u_mouse', mouseLocation);
      if (timeLocation) this.uniformLocations.set('u_time', timeLocation);
      this.startTime = null;
      this.onCompileError?.(undefined);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : String(error);
      const formatted = adjustErrorLog(rawMessage);
      this.onCompileError?.(formatted);
    }
  }

  setUniforms(uniforms) {
    this.uniforms = { ...uniforms };
  }

  renderFrame(time) {
    if (!this.gl || !this.program) {
      this.frame = requestAnimationFrame((t) => this.renderFrame(t));
      return;
    }
    const gl = this.gl;

    if (this.startTime === null) {
      this.startTime = time;
    }

    this.resize();

    const elapsed = (time - this.startTime) / 1000;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const resolution = [this.canvas.width, this.canvas.height];
    this.applyUniform('u_resolution', resolution);
    this.applyUniform('u_mouse', this.mouse);
    this.applyUniform('u_time', elapsed);

    for (const [name, value] of Object.entries(this.uniforms)) {
      if (name === 'u_time' || name === 'u_resolution' || name === 'u_mouse') continue;
      this.applyUniform(name, value);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.frame = requestAnimationFrame((t) => this.renderFrame(t));
  }

  applyUniform(name, value) {
    if (!this.gl || !this.program) return;
    const gl = this.gl;
    const location = this.uniformLocations.get(name);
    if (!location) return;
    const spec = this.uniformSpecMap[name];
    if (spec && spec.type && spec.type.startsWith('vec')) {
      const arr = Array.isArray(value) ? value : [value, value, value, value].slice(0, Number(spec.type.slice(-1)));
      gl[`uniform${spec.type.slice(-1)}fv`](location, arr);
      return;
    }
    if (typeof value === 'number') {
      gl.uniform1f(location, value);
    }
  }

  start() {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
    }
    this.frame = requestAnimationFrame((t) => this.renderFrame(t));
  }

  dispose() {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    if (this.gl) {
      if (this.program) {
        this.gl.deleteProgram(this.program);
      }
      if (this.buffer) {
        this.gl.deleteBuffer(this.buffer);
      }
      if (this.vao) {
        this.gl.deleteVertexArray(this.vao);
      }
    }
  }
}
