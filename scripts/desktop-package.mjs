#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const electronBuilderCli = require.resolve('electron-builder/cli.js');

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = dirname(__dirname);

function run(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

async function buildDesktop() {
  await run(process.execPath, [join(projectRoot, 'scripts', 'build.mjs')], { cwd: projectRoot });
  await run(process.execPath, [electronBuilderCli], { cwd: projectRoot });
}

buildDesktop().catch((error) => {
  console.error(error);
  process.exit(1);
});
