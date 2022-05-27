/* eslint-disable no-console */
import axios from 'axios';
import _ from 'lodash';

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
  const { feeds, uiState: { rssForm, feedbackField } } = state;

  const schema = validator.string()
    .trim()
    .url('invalid')
    .notOneOf(feeds, 'exists');

  schema.validate(url)
    .then((checkedUrl) => axios.get(getRoute(checkedUrl)))
  // console.log('res', result);
    .then(({ data: { contents } }) => {
      const parser = new DOMParser();
      const parsedDocument = parser.parseFromString(contents, 'text/xml');
      if (!_.isNull(parsedDocument.querySelector('parsererror'))) {
        feedbackField.uiType = 'negative';
        feedbackField.message = translator.t('parsingFail');
        return;
      }

      // feeds.push(data.status.url);
      rssForm.uiValid = true;
      feedbackField.uiType = 'positive'; // remove later
      feedbackField.message = translator.t('network.success');
    })

    .catch((err) => {
      console.log('err', err);
      if (err.name === 'ValidationError') {
        rssForm.uiValid = false;
        feedbackField.uiType = 'negative';
        const [currentError] = err.errors;
        feedbackField.message = translator.t(`validation.${currentError}`);
      } else if (err.name === 'AxiosError') {
        feedbackField.uiType = 'negative';
        feedbackField.message = translator.t('network.fail');
      } else {
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
