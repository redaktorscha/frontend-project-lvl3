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
  const {
    data: {
      checkedLinks, feeds, posts,
    }, uiState: { rssForm },
  } = state;
  console.log('checkedLinks', checkedLinks);

  const schema = validator.string()
    .trim()
    .url('invalid')
    .notOneOf(checkedLinks, 'exists');

  schema.validate(url)
    .then((checkedUrl) => {
      rssForm.uiValid = true;
      rssForm.processingState = 'sending';

      const route = getRoute(checkedUrl);
      return axios.get(route);
    })

    .then(({ data: { contents } }) => {
      parseDom(contents, feeds, posts);

      rssForm.processingState = 'processed';
      rssForm.feedback = 'network.success';
      checkedLinks.push(url);
    })

    .catch((err) => {
      console.log('err', err);

      if (err.name === 'ValidationError') {
        rssForm.uiValid = false;
        const [currentError] = err.errors;
        rssForm.feedback = `validation.${currentError}`;
      } else if (err.name === 'AxiosError') {
        rssForm.processingState = 'failed';
        rssForm.feedback = 'network.fail';
      } else if (err.name === 'ParsingError') {
        rssForm.processingState = 'failed';
        rssForm.feedback = 'parsing.fail';
      } else {
        rssForm.processingState = 'failed';
        rssForm.feedback = 'network.fail';
        console.log(`Unknown error: ${err.message}`);
      }
    });
};

/**
 * @param {Event} event
 * @param {Object} state
 * @param {Object} validator
 */
const handleSubmit = (event, state, validator) => {
  event.preventDefault();
  const form = /** @type {HTMLFormElement} */(event.target);
  const formData = new FormData(form);
  const rssLink = String(formData.get('rss-link'));
  validateForm(rssLink, state, validator);
};

export default handleSubmit;
