/* eslint-disable no-console */
import onChange from 'on-change';
import i18n from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import resources from './locales/index.js';
import render from './view.js';
import { handleSubmit, getNewPosts, handlePostsClick } from './controllers.js';

const msInterval = 5000;

export default async () => {
  const initState = {
    feeds: [],
    posts: [],
    rssForm: {
      valid: true,
      processingState: null,
      feedback: null,
    },
    ui: {
      seenPosts: new Set(),
    },
    currentPostId: null,
  };

  const defaultLanguage = 'ru';

  yup.setLocale({
    mixed: {
      default: 'something went wrong',
      notOneOf: 'exists',
      required: 'empty',
    },
    string: {
      url: 'invalid',
    },
  });

  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then(() => {
    /**
 * @type {Object}
 * @property {HTMLFormElement} form
 * @property {HTMLInputElement} inputElement
 * @property {HTMLButtonElement} btnSubmit
 * @property {HTMLParagraphElement} feedbackField
 * @property {HTMLElement} rssContainer
 * @property {HTMLUListElement} feedsList
 * @property {HTMLUListElement} postsList
 * @property {HTMLHeadingElement} modalHeading
 * @property {HTMLDivElement} modalBody
 * @property {HTMLButtonElement} btnReadMore
 *
 */
    const htmlElements = {
      form: document.querySelector('form'),
      inputElement: document.querySelector('input[data-input="rss"]'),
      btnSubmit: document.querySelector('button[type="submit"]'),
      feedbackField: document.querySelector('p[data-element="feedback"]'),
      rssContainer: document.querySelector('section[data-element="container-bottom"]'),
      feedsList: document.querySelector('ul[data-element="feeds"]'),
      postsList: document.querySelector('ul[data-element="posts"]'),
      modalHeading: document.querySelector('h5.modal-title'),
      modalBody: document.querySelector('div.modal-body'),
      btnReadMore: document.querySelector('.modal-footer > a.btn.btn-primary'),
    };
    const watchedState = onChange(initState, (path, value, prevValue) => {
      render(path, value, prevValue, i18nextInstance, htmlElements, watchedState);
    });

    const { form, postsList } = htmlElements;

    setTimeout(() => {
      getNewPosts(watchedState, axios, msInterval);
    }, msInterval);

    form.addEventListener(
      'submit',
      (/** @type {Event} */ e) => handleSubmit(e, watchedState, yup, axios),
    );

    postsList
      .addEventListener('click', (/** @type {Event} */ e) => handlePostsClick(e, watchedState));
  }).catch((error) => { throw new Error(error.stack); });
};
