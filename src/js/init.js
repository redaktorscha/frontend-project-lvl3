/* eslint-disable no-console */
import onChange from 'on-change';
import i18n from 'i18next';
import * as yup from 'yup';
import state from './state.js';
import en from '../locales/en.js';
import ru from '../locales/ru.js';
import render from './view.js';
import htmlElements from './htmlElements.js';
import handleSubmit from './controllers.js';

const defaultLanguage = 'en';
const resources = {
  en, ru,
};

export default () => {
  const { uiState: { rssForm, feedbackField }, localeState } = state;
  rssForm.uiValid = true;
  rssForm.submitDisabled = false;
  rssForm.processingState = 'filling';
  feedbackField.uiState = null;

  yup.setLocale({
    mixed: {
      default: 'something went wrong',
      notOneOf: 'exists',
    },
    string: {
      url: 'invalid',
    },
  });

  localeState.languageMode = defaultLanguage;
  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  }).then(() => {
    const watchedState = onChange(state, render);
    const { form } = htmlElements;
    form.addEventListener(
      'submit',
      (/** @type {Event} */ e) => handleSubmit(e, watchedState, i18nextInstance, yup),
    );
  }).catch((error) => console.log(`loading error: ${error.stack}`));
};
