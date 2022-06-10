/* eslint-disable no-console */
import onChange from 'on-change';
import i18n from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import state from './state.js';
import en from '../locales/en.js';
import ru from '../locales/ru.js';
import render from './view.js';
import { handleSubmit, getUpdates, handlePostsClick } from './controllers.js';

const resources = {
  en, ru,
};

const msInterval = 5000;

export default async () => {
  const { localeState } = state;

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
    lng: localeState.languageMode,
    debug: false,
    resources,
  }).then(() => {
    const form = document.querySelector('form');
    const inputElement = document.querySelector('input[data-input="rss"]');
    const btnSubmit = document.querySelector('button[type="submit"]');
    const pElement = document.querySelector('p[data-element="feedback"]');
    const bottomContainer = document.querySelector('section[data-element="container-bottom"]');
    const ulElementFeeds = document.querySelector('ul[data-element="feeds"]');
    const ulElementPosts = document.querySelector('ul[data-element="posts"]');
    const modalBox = document.querySelector('div#modal');
    const modalHeading = document.querySelector('h5.modal-title');
    const modalBody = document.querySelector('div.modal-body');
    const btnReadMore = document.querySelector('.modal-footer > a.btn.btn-primary');

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
    const watchedState = onChange(state, (path, value, prevValue) => {
      render(path, value, prevValue, i18nextInstance, htmlElements);
    });

    watchedState.timer.id = setTimeout(() => {
      getUpdates(watchedState, axios, msInterval);
    }, msInterval);

    form.addEventListener(
      'submit',
      (/** @type {Event} */ e) => handleSubmit(e, watchedState, yup, axios),
    );

    ulElementPosts
      .addEventListener('click', (/** @type {Event} */ e) => handlePostsClick(e, watchedState));
  }).catch((error) => console.log(`loading error: ${error.stack}`));
};
