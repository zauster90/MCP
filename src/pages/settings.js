import { getSettings, updateSettings, resetSettings } from '../state/settings.js';

const createSelect = (label, name, options, value, onChange) => {
  const wrapper = document.createElement('label');
  wrapper.className = 'setting-control';
  const span = document.createElement('span');
  span.textContent = label;
  const select = document.createElement('select');
  for (const option of options) {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    if (String(option.value) === String(value)) {
      opt.selected = true;
    }
    select.appendChild(opt);
  }
  select.addEventListener('change', () => {
    onChange(name, select.value);
  });
  wrapper.append(span, select);
  return wrapper;
};

const createToggle = (label, name, checked, onChange) => {
  const wrapper = document.createElement('label');
  wrapper.className = 'setting-control';
  const span = document.createElement('span');
  span.textContent = label;
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => {
    onChange(name, input.checked);
  });
  wrapper.append(span, input);
  return wrapper;
};

export function createSettingsPage() {
  const container = document.createElement('section');
  container.className = 'settings-page';

  const header = document.createElement('div');
  header.className = 'page-header';
  const title = document.createElement('h2');
  title.textContent = 'Settings';
  const info = document.createElement('p');
  info.textContent = 'Tune export defaults, UI density, and offline behaviour. Settings persist locally in your browser.';
  header.append(title, info);

  const form = document.createElement('div');
  form.className = 'settings-form';

  const applySettings = (settings) => {
    form.innerHTML = '';
    form.append(
      createSelect(
        'Resolution',
        'resolution',
        [
          { value: '720p', label: '1280×720 (720p)' },
          { value: '1080p', label: '1920×1080 (1080p)' },
          { value: '1440p', label: '2560×1440 (1440p)' },
        ],
        settings.resolution,
        (name, value) => updateSettings({ [name]: value })
      ),
      createSelect(
        'Frame Rate',
        'fps',
        [
          { value: 24, label: '24 fps' },
          { value: 30, label: '30 fps' },
          { value: 60, label: '60 fps' },
        ],
        settings.fps,
        (name, value) => updateSettings({ [name]: Number(value) })
      ),
      createSelect(
        'Color Space',
        'colorSpace',
        [
          { value: 'srgb', label: 'sRGB' },
          { value: 'display-p3', label: 'Display P3' },
        ],
        settings.colorSpace,
        (name, value) => updateSettings({ [name]: value })
      ),
      createSelect(
        'UI Density',
        'uiDensity',
        [
          { value: 'comfortable', label: 'Comfortable' },
          { value: 'compact', label: 'Compact' },
        ],
        settings.uiDensity,
        (name, value) => updateSettings({ [name]: value })
      ),
      createSelect(
        'Audio Input',
        'audioInput',
        [
          { value: 'off', label: 'Off' },
          { value: 'mic', label: 'Microphone' },
        ],
        settings.audioInput,
        (name, value) => updateSettings({ [name]: value })
      ),
      createToggle('Use backend exporter', 'backendExport', settings.backendExport, (name, value) => updateSettings({ [name]: value }))
    );
  };

  applySettings(getSettings());

  const resetButton = document.createElement('button');
  resetButton.className = 'btn';
  resetButton.textContent = 'Reset Settings';
  resetButton.addEventListener('click', () => {
    resetSettings();
    applySettings(getSettings());
  });

  container.append(header, form, resetButton);
  return { element: container, update: () => applySettings(getSettings()) };
}
