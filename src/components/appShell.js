const NAV_LINKS = [
  { path: '#/', label: 'Studio' },
  { path: '#/discover', label: 'Discover' },
  { path: '#/learn', label: 'Learn' },
  { path: '#/exports', label: 'Exports' },
  { path: '#/settings', label: 'Settings' },
];

export function createAppShell() {
  const container = document.createElement('div');
  container.className = 'app-shell';

  const header = document.createElement('header');
  header.className = 'app-header';
  const title = document.createElement('h1');
  title.textContent = 'GLSL PlayLab';
  const nav = document.createElement('nav');
  nav.className = 'app-nav';
  const navList = document.createElement('ul');
  navList.className = 'app-nav-list';

  for (const link of NAV_LINKS) {
    const item = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.href = link.path;
    anchor.textContent = link.label;
    anchor.className = 'app-nav-link';
    item.appendChild(anchor);
    navList.appendChild(item);
  }

  nav.appendChild(navList);
  header.appendChild(title);
  header.appendChild(nav);

  const main = document.createElement('main');
  main.className = 'app-main';

  container.appendChild(header);
  container.appendChild(main);

  const setActiveLink = (hash) => {
    for (const link of navList.querySelectorAll('a')) {
      if (link.getAttribute('href') === hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  };

  return { element: container, main, setActiveLink };
}
