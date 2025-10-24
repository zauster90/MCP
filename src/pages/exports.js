export function createExportsPage() {
  const container = document.createElement('section');
  container.className = 'exports-page';

  const header = document.createElement('div');
  header.className = 'page-header';
  const title = document.createElement('h2');
  title.textContent = 'Exports';
  const info = document.createElement('p');
  info.textContent = 'Manage offline export jobs. This lightweight build lists requested renders and shows their progress.';
  header.append(title, info);

  const list = document.createElement('div');
  list.className = 'export-list';
  const empty = document.createElement('p');
  empty.className = 'empty-state';
  empty.textContent = 'Exports are queued from the Studio. The offline bundle does not include video encoding yet.';
  list.appendChild(empty);

  container.append(header, list);
  return { element: container, update: () => {} };
}
