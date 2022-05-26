/* eslint-disable no-console */
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
    .then((result) => {
      console.log('res', result);
      feeds.push(result);
      rssForm.uiValid = true;
      feedbackField.uiType = 'positive'; // remove later
      const feedbackTextPath = 'network.success'; // remove later
      feedbackField.message = translator.t(feedbackTextPath);
    })
    .catch((err) => {
      rssForm.uiValid = false;
      feedbackField.uiType = 'negative';
      const [currentError] = err.errors;
      console.log(currentError);
      feedbackField.message = translator.t(`validation.${currentError}`);
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
