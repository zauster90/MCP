import { createAppShell } from './components/appShell.js';
import { createCanvasStudioPage } from './pages/canvasStudio.js';
import { createDiscoverPage } from './pages/discover.js';
import { createLearnPage } from './pages/learn.js';
import { createExportsPage } from './pages/exports.js';
import { createSettingsPage } from './pages/settings.js';
import { subscribe as subscribeStore, getState } from './state/store.js';

const routes = {
  '#/': createCanvasStudioPage,
  '#/discover': createDiscoverPage,
  '#/learn': createLearnPage,
  '#/exports': createExportsPage,
  '#/settings': createSettingsPage,
};

const resolveHash = (hash) => {
  if (!hash || hash === '#') return '#/';
  const normalized = hash.startsWith('#') ? hash : `#${hash}`;
  if (routes[normalized]) {
    return normalized;
  }
  return '#/';
};

const appRoot = document.getElementById('app');
if (!appRoot) {
  throw new Error('Missing root element');
}

const shell = createAppShell();
appRoot.appendChild(shell.element);

let currentPage = null;
let currentRoute = resolveHash(window.location.hash);

const mountRoute = (hash) => {
  const normalized = resolveHash(hash);
  if (normalized === currentRoute && currentPage) {
    shell.setActiveLink(normalized);
    return;
  }
  currentRoute = normalized;
  shell.setActiveLink(normalized);
  shell.main.innerHTML = '';
  const createPage = routes[normalized] || routes['#/'];
  currentPage = createPage();
  shell.main.appendChild(currentPage.element);
  currentPage.update(getState());
};

window.addEventListener('hashchange', () => {
  mountRoute(window.location.hash);
});

mountRoute(currentRoute);

subscribeStore((state) => {
  if (currentPage && typeof currentPage.update === 'function') {
    currentPage.update(state);
  }
});
