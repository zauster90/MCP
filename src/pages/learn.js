import { lessons } from '../lessons/data.js';

export function createLearnPage() {
  const container = document.createElement('section');
  container.className = 'learn-page';

  const header = document.createElement('div');
  header.className = 'page-header';
  const title = document.createElement('h2');
  title.textContent = 'Learn GLSL';
  const intro = document.createElement('p');
  intro.textContent = 'Hands-on checkpoints walk you through shader fundamentals. Use the studio to try variations.';
  header.append(title, intro);

  const list = document.createElement('div');
  list.className = 'lesson-list';

  for (const lesson of lessons) {
    const article = document.createElement('article');
    article.className = 'lesson-card';
    const name = document.createElement('h3');
    name.textContent = lesson.title;
    const summary = document.createElement('p');
    summary.textContent = lesson.summary;
    const starterLabel = document.createElement('h4');
    starterLabel.textContent = 'Starter Code';
    const starterCode = document.createElement('pre');
    starterCode.className = 'lesson-code';
    starterCode.textContent = lesson.codeStart;

    const checkpointList = document.createElement('ol');
    checkpointList.className = 'checkpoint-list';
    for (const checkpoint of lesson.checkpoints) {
      const item = document.createElement('li');
      const cpTitle = document.createElement('h5');
      cpTitle.textContent = checkpoint.title;
      const diff = document.createElement('pre');
      diff.className = 'lesson-diff';
      diff.textContent = checkpoint.diff;
      const explanation = document.createElement('p');
      explanation.textContent = checkpoint.explanation;
      item.append(cpTitle, diff, explanation);
      checkpointList.appendChild(item);
    }

    article.append(name, summary, starterLabel, starterCode, checkpointList);
    list.appendChild(article);
  }

  container.append(header, list);
  return { element: container, update: () => {} };
}
