export function createErrorPanel() {
  const container = document.createElement('div');
  container.className = 'error-panel hidden';
  const title = document.createElement('h3');
  title.textContent = 'Shader Errors';
  const pre = document.createElement('pre');
  pre.className = 'error-log';
  container.appendChild(title);
  container.appendChild(pre);

  return {
    element: container,
    show(message) {
      if (!message) {
        container.classList.add('hidden');
        pre.textContent = '';
        return;
      }
      container.classList.remove('hidden');
      pre.textContent = message;
    },
  };
}
