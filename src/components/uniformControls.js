const formatLabel = (spec) => spec.label || spec.name;

const createSlider = (spec, value, onChange) => {
  const wrapper = document.createElement('label');
  wrapper.className = 'uniform-control';

  const title = document.createElement('span');
  title.className = 'uniform-label';
  title.textContent = formatLabel(spec);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = spec.min ?? 0;
  input.max = spec.max ?? 1;
  input.step = spec.step ?? 0.01;
  input.value = String(value);
  input.addEventListener('input', () => {
    const parsed = Number(input.value);
    onChange(spec.name, parsed);
    valueDisplay.textContent = parsed.toFixed(3);
  });

  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'uniform-value';
  valueDisplay.textContent = Number(value).toFixed(3);

  wrapper.appendChild(title);
  wrapper.appendChild(input);
  wrapper.appendChild(valueDisplay);
  return { element: wrapper, update: (nextValue) => {
    input.value = String(nextValue);
    valueDisplay.textContent = Number(nextValue).toFixed(3);
  }};
};

export function createUniformControls({ specs, values, onChange }) {
  const container = document.createElement('div');
  container.className = 'uniform-controls';
  const controlMap = new Map();

  const render = () => {
    container.innerHTML = '';
    controlMap.clear();
    for (const spec of specs) {
      const value = values[spec.name] ?? 0;
      if (spec.type === 'bool') {
        const wrapper = document.createElement('label');
        wrapper.className = 'uniform-control';
        const title = document.createElement('span');
        title.className = 'uniform-label';
        title.textContent = formatLabel(spec);
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = Boolean(value);
        checkbox.addEventListener('change', () => {
          onChange(spec.name, checkbox.checked ? 1 : 0);
        });
        wrapper.appendChild(title);
        wrapper.appendChild(checkbox);
        container.appendChild(wrapper);
        controlMap.set(spec.name, { update: (next) => { checkbox.checked = Boolean(next); } });
      } else {
        const slider = createSlider(spec, value, onChange);
        container.appendChild(slider.element);
        controlMap.set(spec.name, slider);
      }
    }
  };

  render();

  const api = {
    element: container,
    update(specsNext, valuesNext) {
      specs = specsNext;
      values = valuesNext;
      render();
    },
    updateValue(name, value) {
      const control = controlMap.get(name);
      control?.update(value);
    },
  };

  return api;
}
