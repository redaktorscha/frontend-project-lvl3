/* eslint-disable no-console */
import onChange from 'on-change';
import render from './view.js';

/**
 * @param {Object} stateObject
 * @returns {Object} watcher
 */
const init = (stateObject) => {
  const { rssForm, feedbackField } = stateObject;
  rssForm.uiValid = true;
  rssForm.submitDisabled = false;
  rssForm.processingState = 'filling';
  feedbackField.uiState = null;

  return onChange(stateObject, render);
};

export default init;
