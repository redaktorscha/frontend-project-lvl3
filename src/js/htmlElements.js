const form = document.querySelector('form');
const inputElement = form.querySelector('input[data-input="rss"]');
const btnSubmit = form.querySelector('button[type="submit"]');
const pElement = document.querySelector('p[data-element="feedback"]');
const bottomContainer = document.querySelector('section[data-element="container-bottom"]');
const ulElementFeeds = document.querySelector('ul[data-element="feeds"]');
const ulElementPosts = document.querySelector('ul[data-element="posts"]');
const modalBox = document.querySelector('div#modal');
const modalHeading = modalBox.querySelector('h5.modal-title');
const modalBody = modalBox.querySelector('div.modal-body');
const btnReadMore = modalBox.querySelector('.modal-footer > a.btn.btn-primary');

/**
 * @type {Object}
 * @property {HTMLFormElement} form
 * @property {HTMLInputElement} inputElement
 * @property {HTMLButtonElement} btnSubmit
 * @property {HTMLParagraphElement} pElement
 * @property {HTMLElement} bottomContainer
 * @property {HTMLUListElement} ulElementFeeds
 * @property {HTMLUListElement} ulElementPosts
 * @property {HTMLDivElement} modalBox
 * @property {HTMLHeadingElement} modalHeading
 * @property {HTMLDivElement} modalBody
 * @property {HTMLButtonElement} btnReadMore
 *
 */
const htmlElements = {
  form,
  inputElement,
  btnSubmit,
  pElement,
  bottomContainer,
  ulElementFeeds,
  ulElementPosts,
  modalBox,
  modalHeading,
  modalBody,
  btnReadMore,
};

export default htmlElements;
