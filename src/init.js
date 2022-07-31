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
 * @param {string} url
 * @param {Array<Object>} feeds
 * @returns {Promise}
 */
const validateUrl = (url, feeds) => {
  const feedsUrls = feeds.map((feed) => feed.url);
  const schema = yup.string()
    .trim()
    .required()
    .url()
    .notOneOf(feedsUrls);

  return schema
    .validate(url)
    .then(() => null)
    .catch((e) => e.message);
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
 * @param {Object} error
 * @returns {string}
 */
const getErrorTypeMessage = (error) => {
  if (error.isAxiosError) {
    return 'network';
  }
  if (error.isParsingError) {
    return 'noRss';
  }
  return 'unknown';
};

/**
 *
 * @param {string} url
 * @param {Object} state
 * @returns {Promise}
 */
const loadRss = (url, state) => {
  const {
    feeds, posts, rssForm,
  } = state;
  rssForm.processingState = 'sending';
  const route = getRoute(proxyUrl, url);
  return axios.get(route)
    .then((response) => {
      const { data: { contents } } = response;

      const id = _.uniqueId();

      const {
        title, description, items,
      } = parse(contents);

      const newFeed = {
        id, url, title, description,
      };

      const newPosts = processPosts(items, id);

      state.feeds = [newFeed, ...feeds];
      state.posts = [...newPosts, ...posts];

      rssForm.processingState = 'processed';
    })

    .catch((err) => {
      rssForm.processingState = 'failed';
      rssForm.feedback = getErrorTypeMessage(err);
    });
};

/**
 * @param {Event} event
 * @param {Object} state
 */
export const handleSubmit = (event, state) => {
  event.preventDefault();
  const rssLink = getRssLink(/** @type {HTMLFormElement} */(event.target));

  const { feeds, rssForm } = state;

  validateUrl(rssLink, feeds)
    .then((errorMessage) => {
      if (errorMessage) {
        rssForm.valid = false;
        rssForm.processingState = 'failed';
        rssForm.feedback = errorMessage;
      } else {
        rssForm.valid = true;
        rssForm.feedback = null;
        loadRss(rssLink, state);
      }
    });
};

/**
 *
 * @param {Object} state
 * @param {number} interval
 */
export const getNewPosts = (state, interval) => {
  const { feeds, posts } = state;

  const promises = feeds.map(({ id, url }) => {
    const route = getRoute(proxyUrl, url);
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
      })
      .catch(console.log);
  });

  Promise.all(promises);

  setTimeout(() => { getNewPosts(state, interval); }, interval);
};

export const handlePostsClick = (event, state) => {
  const targetElement = event.target;

  if (!('postId' in targetElement.dataset)) {
    return;
  }

  const { ui } = state;
  const { seenPosts } = ui;
  const { postId } = targetElement.dataset;

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
