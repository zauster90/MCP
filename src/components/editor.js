export function createShaderEditor({ value, onChange }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'editor-wrapper';

  const textarea = document.createElement('textarea');
  textarea.className = 'editor-input';
  textarea.value = value;
  textarea.spellcheck = false;
  textarea.autocomplete = 'off';
  textarea.autocorrect = 'off';
  textarea.addEventListener('input', () => {
    onChange(textarea.value);
  });

  wrapper.appendChild(textarea);
  return { element: wrapper, updateValue: (next) => { textarea.value = next; } };
}
