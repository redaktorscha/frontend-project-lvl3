/* eslint-disable no-console */
import htmlElements from './htmlElements.js';
/**
 *
 * @param {string} path
 * @param {*} value
 * @param {*} prevValue
 */
const render = (path, value, prevValue) => { // render (view)
  const {
    form, inputElement, pElement,
  } = htmlElements;
  if (path === 'rssForm.uiValid') {
    if (!value) {
      inputElement.classList.add('invalid');
    } else {
      inputElement.classList.remove('invalid');
    }
  }

  if (path === 'feedbackField.uiType') {
    if (!value) {
      pElement.classList.add('d-none');
      return;
    }
    if (value === 'negative') {
      pElement.classList.remove('d-none', 'text-success');
      pElement.classList.add('text-danger');
    }
    if (value === 'positive') {
      pElement.classList.remove('d-none', 'text-danger');
      pElement.classList.add('text-success');
    }
  }

  if (path === 'feedbackField.message' && value !== prevValue) {
    pElement.textContent = value;
  }

  form.reset();
  inputElement.focus();
};

export default render;
