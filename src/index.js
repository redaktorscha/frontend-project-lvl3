import 'bootstrap';
import './styles/main.scss';
import init from './js/init.js';
import state from './js/state.js';
import htmlElements from './js/htmlElements.js';

import handleSubmit from './js/controllers.js';

const watchedState = init(state);
const { form } = htmlElements;
form.addEventListener('submit', (/** @type {Event} */ e) => handleSubmit(e, watchedState));
