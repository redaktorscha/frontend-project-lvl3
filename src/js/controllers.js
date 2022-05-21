/* eslint-disable no-console */
import { string } from 'yup';
import feedbackMessages from './feedbackMessages.js';

/**
 * @param {string} url
 * @param {Object} state
 */
const validateForm = (url, state) => {
  const {
    feeds, rssForm, feedbackField,
  } = state;
  const { validation } = feedbackMessages;
  const schema = string()
    .trim()
    .url('invalid')
    .notOneOf(feeds, 'exists');

  schema.validate(url)
    .then((result) => {
      feeds.push(result);
      rssForm.uiValid = true;
      feedbackField.uiType = 'positive'; // remove later
      feedbackField.message = feedbackMessages.network.success; // remove later
    })
    .catch((error) => {
      rssForm.uiValid = false;
      feedbackField.uiType = 'negative';
      feedbackField.message = validation[error.message];
    });
};

/**
 * @param {Event} event
 * @param {Object} state
 */
const handleSubmit = (event, state) => {
  event.preventDefault();
  const form = /** @type {HTMLFormElement} */(event.target);
  const formData = new FormData(form);
  const rssLink = String(formData.get('rss-link'));
  validateForm(rssLink, state);
};

export default handleSubmit;
