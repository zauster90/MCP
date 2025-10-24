# GLSL PlayLab (Offline + Desktop Edition)

GLSL PlayLab is a WebGL2 playground for crafting short shader loops, exploring presets, and following guided GLSL lessons. This
repository now ships both a lightweight browser build and an Electron wrapper so you can run the studio as a standalone desktop
application or package platform-specific executables.

## Getting started

Follow the detailed instructions below to set up GLSL PlayLab using either the Visual Studio IDE or a pure command-line workflow.
Both paths share the same prerequisites, so start by installing the required tooling before you pick your preferred environment.

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
4. **Allow npm to download Electron artifacts on the first install**
   - The desktop build depends on Electron and Electron Builder packages that are fetched during `npm install`. The downloads can be several hundred megabytes; once cached, subsequent installs work offline.

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
   - Run `npm install` to download Electron/Electron Builder and register local scripts.
4. **Configure npm scripts**
   - In **Task Runner Explorer**, expand the **npm** node. You should see `dev`, `build`, `test`, `desktop:dev`, and `desktop:package` scripts.
   - Right-click `dev` or `desktop:dev` and choose **Run** (or **Set as Default** to reuse later). Visual Studio will start the requested process and stream logs to the Output window.
5. **Launch the browser studio**
   - When the terminal shows a URL (defaults to `http://localhost:5173`), click it or paste it into a WebGL2-capable browser.
   - Use **Debug → Stop Debugging** or press `Shift+F5` to stop the dev server when you are done.
6. **Launch the desktop studio**
   - Run `desktop:dev` from Task Runner Explorer. This script spins up the dev server and then opens the Electron shell automatically. Close the Electron window to stop both processes.
7. **Create packaged executables**
   - Run `desktop:package` to build the static bundle and invoke Electron Builder. The generated installers and binaries land in `release/`.
8. **Run build/test tasks**
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
   This downloads Electron and Electron Builder along with their native binaries. Expect the first installation to take a few minutes.
3. **Start the browser development server**
   ```bash
   npm run dev
   ```
   The server prints the local address (normally `http://localhost:5173`). Open it in your browser to access the studio.
4. **Run the desktop development shell**
   ```bash
   npm run desktop:dev
   ```
   The script starts the dev server (if not already running) and launches the Electron wrapper pointing at it. Close the Electron window to exit.
5. **Run tests**
   ```bash
   npm run test
   ```
   Executes syntax checks and sanity tests against the JavaScript sources.
6. **Build the offline bundle**
   ```bash
   npm run build
   ```
   Emits a production-ready static site into `dist/`. You can host this folder with any static file server or share it as-is.
7. **Package desktop executables**
   ```bash
   npm run desktop:package
   ```
   Runs the static build and then invokes Electron Builder to create platform installers/binaries in `release/`.

### Quick reference

If you already know your way around npm, the following commands are the essentials:

```bash
npm install
npm run desktop:dev   # Desktop shell (starts the dev server automatically)
# or
npm run dev           # Browser-only development server
```

### Available scripts

- `npm run dev` – start the zero-dependency static dev server
- `npm run build` – copy the source bundle into `dist/` for deployment
- `npm run test` – run syntax checks across all JavaScript sources
- `npm run desktop:dev` – launch the Electron wrapper against the live dev server
- `npm run desktop:package` – build static assets and produce installers via Electron Builder

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
electron/         Desktop entry point and preload bridge
scripts/          Local dev server, build/test tooling, and desktop helpers
```

## What's included

- **Canvas Studio** – Textarea-based GLSL editor, WebGL2 preview, deterministic uniform controls, and preset saving.
- **Discover** – Local preset browser that jumps straight back into the studio.
- **Learn** – Eight comprehensive lessons with starter code, diffs, and explanations to explore shader fundamentals.
- **Exports dashboard** – Placeholder queue showing how offline export tracking will surface.
- **Settings** – Persisted client-side configuration for resolution, FPS, colour space, UI density, audio input, and backend exports.
- **Electron desktop shell** – Launches the same GLSL tooling as a native window and supports packaging installers for Windows, macOS, and Linux.

This edition keeps the shader tooling deterministic while adding an officially supported desktop executable path for creators who prefer native app distribution.
