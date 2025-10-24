#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const electronPath = require('electron');

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = dirname(__dirname);

let electronProcess;
let shuttingDown = false;

function terminateProcesses() {
  if (shuttingDown) return;
  shuttingDown = true;
  if (electronProcess) {
    electronProcess.kill();
  }
  if (devServer && !devServer.killed) {
    devServer.kill();
  }
  process.exit();
}

const devServer = spawn(process.execPath, [join(projectRoot, 'scripts', 'dev-server.mjs')], {
  stdio: ['inherit', 'pipe', 'inherit'],
  env: { ...process.env, PORT: process.env.PORT || '5173' },
});

devServer.stdout.on('data', (chunk) => {
  const message = chunk.toString();
  process.stdout.write(message);
  if (message.includes('GLSL PlayLab dev server running')) {
    if (electronProcess) {
      return;
    }
    electronProcess = spawn(electronPath, [join(projectRoot, 'electron', 'main.mjs')], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        ELECTRON_START_URL: `http://localhost:${process.env.PORT || '5173'}`,
      },
    });

    electronProcess.on('exit', () => {
      terminateProcesses();
    });
  }
});

devServer.on('exit', (code) => {
  console.log(`Dev server exited with code ${code ?? 'null'}`);
  terminateProcesses();
});

process.on('SIGINT', terminateProcesses);
process.on('SIGTERM', terminateProcesses);
