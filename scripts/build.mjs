#!/usr/bin/env node
import { mkdir, readFile, readdir, rm, stat, writeFile, copyFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');
const distDir = join(projectRoot, 'dist');
const publicDir = join(projectRoot, 'public');

async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

async function copyDirectory(srcDir, destDir) {
  await ensureDir(destDir);
  const entries = await readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else if (entry.isFile()) {
      await ensureDir(dirname(destPath));
      await copyFile(srcPath, destPath);
    }
  }
}

async function copySource() {
  const srcDir = join(projectRoot, 'src');
  await copyDirectory(srcDir, join(distDir, 'src'));
}

async function copyIndex() {
  const srcIndex = join(projectRoot, 'index.html');
  const destIndex = join(distDir, 'index.html');
  await ensureDir(dirname(destIndex));
  const html = await readFile(srcIndex, 'utf8');
  await writeFile(destIndex, html);
}

async function copyPublic() {
  try {
    const stats = await stat(publicDir);
    if (stats.isDirectory()) {
      await copyDirectory(publicDir, join(distDir, 'public'));
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function cleanDist() {
  try {
    await rm(distDir, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function main() {
  await cleanDist();
  await ensureDir(distDir);
  await copyIndex();
  await copySource();
  await copyPublic();
  console.log('Build output written to', distDir);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
