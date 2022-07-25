import _ from 'lodash';
import onChange from 'on-change';
import i18n from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import resources from './locales/index.js';
import parse from './parser.js';
import render from './view.js';

const msInterval = 5000;

const proxyUrl = 'https://allorigins.hexlet.app';

/**
 * @param {HTMLFormElement} form
 * @returns {string}
 */
const getRssLink = (form) => {
  const formData = new FormData(form);
  return String(formData.get('rss-link'));
};

/**
 * @param {string} proxyBase
 * @param {string} url
 * @returns {string}
 */
export const getRoute = (proxyBase, url) => {
  const route = new URL('/get', proxyBase);
  route.searchParams.append('disableCache', 'true');
  route.searchParams.append('url', url);
  return route.href;
};

/**
 * @param {Array} posts
 * @param {string} feedId
 * @returns {Array}
 */
const processPosts = (posts, feedId) => posts
  .map((post) => ({
    ...post,
    ...{
      id: _.uniqueId(),
      feedId,
    },
  }));

/**
 * @param {string} newLink
 * @param {Array<string>} oldLinks
 * @returns {Promise}
 */
const validateUrl = (newLink, oldLinks) => {
  const schema = yup.string()
    .trim()
    .required()
    .url()
    .notOneOf(oldLinks);

  return schema
    .validate(newLink);
};

const handleSuccessfulValidation = (url, state) => {
  const { rssForm } = state;
  rssForm.valid = true;
  rssForm.processingState = 'sending';

  const route = getRoute(proxyUrl, url);
  return axios.get(route);
};

const handleSuccessfulHttpResponse = (response, state, rssLink) => {
  const { data: { contents } } = response;

  const {
    feeds, posts, rssForm,
  } = state;

  const id = _.uniqueId();

  const {
    title, description, items,
  } = parse(contents);

  const newFeed = {
    id, rssLink, title, description,
  };

  const newPosts = processPosts(items, id);

  state.feeds = [newFeed, ...feeds];
  state.posts = [...newPosts, ...posts];

  rssForm.processingState = 'processed';
  rssForm.feedback = 'network.success';
};

const handleError = (err, state) => {
  const { rssForm } = state;
  if (err.name === 'ValidationError') {
    rssForm.valid = false;
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
    rssForm.feedback = 'default.fail';
  }
};

/**
 * @param {Event} event
 * @param {Object} state
 */
export const handleSubmit = (event, state) => {
  event.preventDefault();

  const rssLink = getRssLink(/** @type {HTMLFormElement} */(event.target));

  const { feeds } = state;

  const existingFeedsLinks = feeds.map((feed) => feed.rssLink);

  validateUrl(rssLink, existingFeedsLinks)
    .then((checkedUrl) => handleSuccessfulValidation(checkedUrl, state))

    .then((response) => handleSuccessfulHttpResponse(response, state, rssLink))

    .catch((err) => handleError(err, state));
};

/**
 *
 * @param {Object} state
 * @param {number} interval
 */
export const getNewPosts = (state, interval) => {
  const { feeds, posts } = state;

  const promises = feeds.map(({ id, rssLink }) => {
    const route = getRoute(proxyUrl, rssLink);
    return axios
      .get(route)
      .then(({ data: { contents } }) => {
        const existingPostsLinks = posts
          .filter((post) => post.feedId === id)
          .map((post) => post.link);

        const { items } = parse(contents);
        const filteredPosts = items
          .filter(({ link }) => !existingPostsLinks.includes(link));

        if (filteredPosts.length === 0) {
          return;
        }
        const newPosts = processPosts(filteredPosts, id);
        state.posts = [...newPosts, ...posts];
      });
  });

  Promise.all(promises);

  setTimeout(() => { getNewPosts(state, interval); }, interval);
};

export const handlePostsClick = (event, state) => {
  const targetElement = event.target;
  if (targetElement.tagName !== 'BUTTON' && targetElement.tagName !== 'A') {
    return;
  }

  const { ui } = state;
  const { seenPosts } = ui;
  let postId;
  if (_.isNull(targetElement.getAttribute('data-post-id'))) {
    postId = targetElement.nextElementSibling.dataset.postId;
  } else {
    postId = targetElement.dataset.postId;
  }

  seenPosts.add(postId);
  state.currentPostId = postId;
};

export default async () => {
  const initState = {
    feeds: [],
    posts: [],
    rssForm: {
      valid: true,
      processingState: null,
      feedback: null,
    },
    ui: {
      seenPosts: new Set(),
    },
    currentPostId: null,
  };

  const defaultLanguage = 'ru';

  yup.setLocale({
    mixed: {
      notOneOf: 'notOneOf',
      required: 'required',
    },
    string: {
      url: 'url',
    },
  });

  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then(() => {
    /**
 * @type {Object}
 * @property {HTMLFormElement} form
 * @property {HTMLInputElement} inputElement
 * @property {HTMLButtonElement} btnSubmit
 * @property {HTMLParagraphElement} feedbackField
 * @property {HTMLElement} rssContainer
 * @property {HTMLUListElement} feedsList
 * @property {HTMLUListElement} postsList
 * @property {HTMLHeadingElement} modalHeading
 * @property {HTMLDivElement} modalBody
 * @property {HTMLButtonElement} btnReadMore
 *
 */
    const htmlElements = {
      form: document.querySelector('form'),
      inputElement: document.querySelector('input[data-input="rss"]'),
      btnSubmit: document.querySelector('button[type="submit"]'),
      feedbackField: document.querySelector('p[data-element="feedback"]'),
      rssContainer: document.querySelector('section[data-element="container-bottom"]'),
      feedsList: document.querySelector('ul[data-element="feeds"]'),
      postsList: document.querySelector('ul[data-element="posts"]'),
      modalHeading: document.querySelector('h5.modal-title'),
      modalBody: document.querySelector('div.modal-body'),
      btnReadMore: document.querySelector('.modal-footer > a.btn.btn-primary'),
    };
    const watchedState = onChange(initState, (path, value, prevValue) => {
      render(path, value, prevValue, i18nextInstance, htmlElements, watchedState);
    });

    const { form, postsList } = htmlElements;

    setTimeout(() => {
      getNewPosts(watchedState, msInterval);
    }, msInterval);

    form.addEventListener(
      'submit',
      (/** @type {Event} */ e) => handleSubmit(e, watchedState),
    );

    postsList
      .addEventListener('click', (/** @type {Event} */ e) => handlePostsClick(e, watchedState));
  }).catch((error) => { throw new Error(error.stack); });
};
