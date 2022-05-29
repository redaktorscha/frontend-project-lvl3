/* eslint-disable no-console */
import axios from 'axios';
import parseDom from './parser.js';

/**
 * @param {string} url
 * @returns {string}
 */
const getRoute = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`;

/**
 * @param {string} url
 * @param {Object} state
 * @param {Object} translator
 * @param {Object} validator
 */
const validateForm = (url, state, translator, validator) => {
  const {
    data: {
      checkedLinks, feeds, posts,
    }, uiState: { rssForm, feedbackField },
  } = state;

  const schema = validator.string()
    .trim()
    .url('invalid')
    .notOneOf(checkedLinks, 'exists');

  schema.validate(url)
    .then((checkedUrl) => {
      checkedLinks.push(checkedUrl);
      const route = getRoute(checkedUrl);
      return axios.get(route);
    })

    .then(({ data: { contents } }) => {
      parseDom(contents, feeds, posts); // feeds.push()
      rssForm.uiValid = true;
      feedbackField.uiType = 'positive'; // remove later
      feedbackField.message = translator.t('network.success');
    })

    .catch((err) => {
      console.log('err', err);
      feedbackField.uiType = 'negative';
      if (err.name === 'ValidationError') {
        rssForm.uiValid = false;
        const [currentError] = err.errors;
        feedbackField.message = translator.t(`validation.${currentError}`);
      } else if (err.name === 'AxiosError') {
        feedbackField.message = translator.t('network.fail');
      } else if (err.name === 'ParsingError') {
        feedbackField.message = translator.t('parsing.fail');
      } else {
        feedbackField.message = translator.t('network.fail');
        console.log(`Unknown error: ${err.message}`);
      }
    });
};

/**
 * @param {Event} event
 * @param {Object} state
 * @param {Object} translator
 * @param {Object} validator
 */
const handleSubmit = (event, state, translator, validator) => {
  event.preventDefault();
  const form = /** @type {HTMLFormElement} */(event.target);
  const formData = new FormData(form);
  const rssLink = String(formData.get('rss-link'));
  validateForm(rssLink, state, translator, validator);
};

export default handleSubmit;
