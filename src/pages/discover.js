import { getState, loadPreset } from '../state/store.js';

export function createDiscoverPage() {
  const container = document.createElement('section');
  container.className = 'discover-page';

  const header = document.createElement('div');
  header.className = 'page-header';
  const title = document.createElement('h2');
  title.textContent = 'Discover Presets';
  const info = document.createElement('p');
  info.textContent = 'Browse your saved presets and quickly jump back into the studio.';
  header.append(title, info);

  const grid = document.createElement('div');
  grid.className = 'preset-grid';

  const renderPresets = () => {
    grid.innerHTML = '';
    const { presets } = getState();
    if (!presets.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No presets yet. Save one from the Studio to see it here!';
      grid.appendChild(empty);
      return;
    }

    for (const preset of presets) {
      const card = document.createElement('article');
      card.className = 'preset-card';
      const name = document.createElement('h3');
      name.textContent = preset.title;
      const meta = document.createElement('p');
      const date = new Date(preset.createdAt);
      meta.textContent = `Saved ${date.toLocaleString()} · Seed ${preset.seed}`;
      const button = document.createElement('button');
      button.className = 'btn';
      button.textContent = 'Load in Studio';
      button.addEventListener('click', () => {
        loadPreset(preset);
        window.location.hash = '#/';
      });
      card.append(name, meta, button);
      grid.appendChild(card);
    }
  };

  container.append(header, grid);
  renderPresets();

  return { element: container, update: renderPresets };
}
