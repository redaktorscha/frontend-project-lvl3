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
 * @param {Object} validator
 */
const validateForm = (url, state, validator) => {
  console.log('url', url);
  const {
    data: {
      checkedLinks, feeds, posts,
    }, uiState: { rssForm, feedbackField },
  } = state;
  console.log('checkedLinks', checkedLinks);

  const schema = validator.string()
    .trim()
    .url('invalid')
    .notOneOf(checkedLinks, 'exists');

  schema.validate(url)
    .then((checkedUrl) => {
      console.log('checkedUrl', checkedUrl);
      const route = getRoute(checkedUrl);
      rssForm.submitDisabled = true; // ?
      feedbackField.uiState = null;
      return axios.get(route);
    })

    .then(({ data: { contents } }) => {
      parseDom(contents, feeds, posts);
      rssForm.uiValid = true;
      feedbackField.uiType = 'positive';
      feedbackField.message = 'network.success';
      rssForm.submitDisabled = false;
      checkedLinks.push(url);
    })

    .catch((err) => {
      console.log('err', err);
      feedbackField.uiType = 'negative';
      if (err.name === 'ValidationError') {
        rssForm.uiValid = false;
        const [currentError] = err.errors;
        feedbackField.message = `validation.${currentError}`;
      } else if (err.name === 'AxiosError') {
        feedbackField.message = 'network.fail';
      } else if (err.name === 'ParsingError') {
        feedbackField.message = 'parsing.fail';
      } else {
        feedbackField.message = 'network.fail';
        console.log(`Unknown error: ${err.message}`);
      }

      rssForm.submitDisabled = false;
    });
};

/**
 * @param {Event} event
 * @param {Object} state
 * @param {Object} validator
 */
const handleSubmit = (event, state, validator) => {
  event.preventDefault();
  const { uiState: { rssForm, feedbackField } } = state;
  rssForm.uiValid = true;
  feedbackField.uiState = null;
  const form = /** @type {HTMLFormElement} */(event.target);
  const formData = new FormData(form);
  const rssLink = String(formData.get('rss-link'));
  validateForm(rssLink, state, validator);
};

export default handleSubmit;
