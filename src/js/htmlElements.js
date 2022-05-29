const form = document.querySelector('form');
const inputElement = form.querySelector('input[data-input="rss"]');
const btnSubmit = form.querySelector('button[type="submit"]');
const pElement = document.querySelector('p[data-element="feedback"]');
const bottomContainer = document.querySelector('section[data-element="container-bottom"]');
const ulElementFeeds = document.querySelector('ul[data-element="feeds"]');
const ulElementPosts = document.querySelector('ul[data-element="posts"]');

/**
 * @type {Object}
 * @property {HTMLFormElement} form
 * @property {HTMLInputElement} inputElement
 * @property {HTMLButtonElement} btnSubmit
 * @property {HTMLParagraphElement} pElement
 * @property {HTMLElement} bottomContainer
 * @property {HTMLUListElement} ulElementFeeds
 * @property {HTMLUListElement} ulElementPosts
 */
const htmlElements = {
  form, inputElement, btnSubmit, pElement, bottomContainer, ulElementFeeds, ulElementPosts,
};

export default htmlElements;
