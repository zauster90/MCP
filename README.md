# GLSL PlayLab (Offline Edition)

GLSL PlayLab is a WebGL2 playground for crafting short shader loops, exploring presets, and following guided GLSL lessons. This repository contains an offline-friendly build that ships without third-party package dependencies so it can be executed in restricted environments.

## Getting started

Follow the detailed instructions below to set up GLSL PlayLab using either the Visual Studio IDE or a pure command-line workflow. Both paths share the same prerequisites, so start by installing the required tooling before you pick your preferred environment.

### Prerequisites (all environments)

1. **Install Node.js LTS**
   - Download the current Long-Term Support (LTS) release of Node.js (which includes npm) from [https://nodejs.org](https://nodejs.org).
   - On Windows, run the installer and keep the default options. On macOS/Linux, use your platform installer or package manager.
   - Confirm the install in a terminal/PowerShell window: `node --version` and `npm --version` should both print versions.
2. **Clone or download this repository**
   - Using Git: `git clone https://github.com/<your-org>/glsl-playlab-offline.git`
   - Or download the ZIP archive from your hosting provider and extract it to a working directory.
3. **Verify WebGL2 support**
   - Launch your target browser and visit [https://get.webgl.org/webgl2/](https://get.webgl.org/webgl2/) to make sure your GPU/driver combination supports WebGL2. GLSL PlayLab requires WebGL2 for rendering.

Once these prerequisites are in place, choose one of the environment-specific guides below.

### Visual Studio (Windows/macOS) setup

This flow uses the full Visual Studio IDE with the Node.js development workload enabled.

1. **Install Visual Studio with JavaScript/Node.js tooling**
   - Open the Visual Studio Installer and select the **Node.js development** workload (on macOS choose “.NET with C# and web development”; it bundles Node tooling).
   - Complete the installation and launch Visual Studio.
2. **Open the project folder**
   - From the start screen choose **Open a local folder** and point Visual Studio at the cloned `glsl-playlab-offline` directory.
   - Visual Studio reads `package.json` and configures npm integration automatically.
3. **Restore dependencies**
   - Open the built-in **Terminal** (`View → Terminal`) or use **Task Runner Explorer**.
   - Run `npm install` to extract the vendored dependencies from `package-lock.json`.
4. **Configure npm scripts**
   - In **Task Runner Explorer**, expand the **npm** node. You should see `dev`, `build`, and `test` scripts.
   - Right-click `dev` and choose **Run** (or **Set as Default** to reuse later). Visual Studio will start the development server and stream logs to the Output window.
5. **Launch the app**
   - When the terminal shows a URL (defaults to `http://localhost:5173`), click it or paste it into a WebGL2-capable browser.
   - Use **Debug → Stop Debugging** or press `Shift+F5` to stop the dev server when you are done.
6. **Run build/test tasks**
   - Trigger `npm run build` or `npm run test` from Task Runner Explorer or the terminal to produce a production bundle (`dist/`) or run lint checks, respectively.

### Command-line workflow (Windows/macOS/Linux)

This path works entirely from a terminal such as Windows Terminal, PowerShell, macOS Terminal, or any POSIX shell.

1. **Navigate to the project directory**
   ```bash
   cd path/to/glsl-playlab-offline
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
   This unpacks the local package tarballs described in `package-lock.json`. No internet connection is required beyond the initial repository download.
3. **Start the development server**
   ```bash
   npm run dev
   ```
   The server prints the local address (normally `http://localhost:5173`). Open it in your browser to access the studio.
4. **Run tests**
   ```bash
   npm run test
   ```
   Executes syntax checks and sanity tests against the JavaScript sources.
5. **Build the offline bundle**
   ```bash
   npm run build
   ```
   Emits a production-ready static site into `dist/`. You can host this folder with any static file server or share it as-is.

### Quick reference

If you already know your way around npm, the following commands are the essentials:

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
