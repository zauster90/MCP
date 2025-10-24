const defaultSettings = {
  resolution: '1080p',
  fps: 30,
  colorSpace: 'srgb',
  uiDensity: 'comfortable',
  audioInput: 'off',
  backendExport: false,
};

const STORAGE_KEY = 'glsl-playlab-settings';

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch (error) {
    console.warn('Failed to load settings', error);
    return { ...defaultSettings };
  }
};

let settings = loadSettings();
const listeners = new Set();

const notify = () => {
  for (const listener of listeners) {
    listener(settings);
  }
};

export const getSettings = () => ({ ...settings });

export const updateSettings = (partial) => {
  settings = { ...settings, ...partial };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to persist settings', error);
  }
  notify();
};

export const subscribeSettings = (listener) => {
  listeners.add(listener);
  listener(settings);
  return () => listeners.delete(listener);
};

export const resetSettings = () => {
  settings = { ...defaultSettings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to persist settings', error);
  }
  notify();
};
