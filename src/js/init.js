/* eslint-disable no-console */
import onChange from 'on-change';
import i18n from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import state from './state.js';
import en from '../locales/en.js';
import ru from '../locales/ru.js';
import render from './view.js';
import htmlElements from './htmlElements.js';
import { handleSubmit, getUpdates, handlePostsClick } from './controllers.js';

const resources = {
  en, ru,
};

const msInterval = 5000;

export default () => {
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
    debug: true,
    resources,
  }).then(() => {
    const watchedState = onChange(state, (path, value, prevValue) => {
      render(path, value, prevValue, i18nextInstance);
    });

    watchedState.timer.id = setTimeout(() => {
      getUpdates(watchedState, axios, msInterval);
    }, msInterval);

    const { form, ulElementPosts } = htmlElements;
    form.addEventListener(
      'submit',
      (/** @type {Event} */ e) => handleSubmit(e, watchedState, yup, axios),
    );

    ulElementPosts
      .addEventListener('click', (/** @type {Event} */ e) => handlePostsClick(e, watchedState));
  }).catch((error) => console.log(`loading error: ${error.stack}`));
};
