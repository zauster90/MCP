# GLSL PlayLab (Offline Edition)

GLSL PlayLab is a WebGL2 playground for crafting short shader loops, exploring presets, and following guided GLSL lessons. This repository contains an offline-friendly build that ships without third-party package dependencies so it can be executed in restricted environments.

## Getting started

```bash
npm install
npm run dev
```

The lightweight dev server will print a local URL (defaults to `http://localhost:5173`). Open it in a browser with WebGL2 support to access the studio.

### Available scripts

- `npm run dev` – start the zero-dependency static dev server
- `npm run build` – copy the source bundle into `dist/` for deployment
- `npm run test` – run syntax checks across all JavaScript sources

## Project layout

```
src/
  components/     Canvas renderer, editor, and shared UI primitives
  lessons/        Guided lesson content with checkpoints
  pages/          Route implementations for Studio, Discover, Learn, Exports, Settings
  shaders/        Base shader templates and safe mutation modules
  state/          Simple stores for app data and user settings
  styles/         Tailored design tokens and layout rules
  utils/          Deterministic RNG helpers
```

## What's included

- **Canvas Studio** – Textarea-based GLSL editor, WebGL2 preview, deterministic uniform controls, and preset saving.
- **Discover** – Local preset browser that jumps straight back into the studio.
- **Learn** – Eight comprehensive lessons with starter code, diffs, and explanations to explore shader fundamentals.
- **Exports dashboard** – Placeholder queue showing how offline export tracking will surface.
- **Settings** – Persisted client-side configuration for resolution, FPS, colour space, UI density, audio input, and backend exports.

This offline edition keeps the shader tooling deterministic while avoiding external registry fetches, making it suitable for constrained execution environments.
