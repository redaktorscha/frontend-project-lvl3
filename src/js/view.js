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
  if (path === 'uiState.rssForm.uiValid') {
    inputElement.classList.toggle('invalid');
  }

  if (path === 'uiState.feedbackField.uiType') {
    if (value === 'negative') {
      pElement.classList.remove('text-success');
      pElement.classList.add('text-danger');
    }
    if (value === 'positive') {
      pElement.classList.remove('text-danger');
      pElement.classList.add('text-success');
    }
  }

  if (path === 'uiState.feedbackField.message' && value !== prevValue) {
    pElement.textContent = value;
  }

  form.reset();
  inputElement.focus();
};

export default render;
