#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');

async function collectJsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJsFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function runNodeCheck(file) {
  return new Promise((resolvePromise, rejectPromise) => {
    execFile('node', ['--check', file], (error, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (error) {
        rejectPromise(error);
      } else {
        resolvePromise();
      }
    });
  });
}

async function main() {
  const files = await collectJsFiles(join(projectRoot, 'src'));
  const scriptFiles = await collectJsFiles(join(projectRoot, 'scripts'));
  const allFiles = [...files, ...scriptFiles];
  for (const file of allFiles) {
    await runNodeCheck(file);
  }
  console.log('Syntax check complete for', allFiles.length, 'JavaScript files.');
}

main().catch((error) => {
  console.error('Test run failed:', error.message || error);
  process.exit(1);
});
