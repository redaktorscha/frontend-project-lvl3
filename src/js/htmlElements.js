const form = document.querySelector('form');
const inputElement = form.querySelector('input[data-input="rss"]');
const btnSubmit = form.querySelector('button[type="submit"]');
const pElement = document.querySelector('p[data-element="feedback"]');
const bottomContainer = document.querySelector('section[data-element="container-bottom"]');

/**
 * @type {Object}
 * @property {HTMLFormElement} form
 * @property {HTMLInputElement} inputElement
 * @property {HTMLButtonElement} btnSubmit
 * @property {HTMLParagraphElement} pElement
 * @property {HTMLElement} bottomContainer
 */
const htmlElements = {
  form, inputElement, btnSubmit, pElement, bottomContainer,
};

export default htmlElements;
