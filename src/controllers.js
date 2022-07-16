/* eslint-disable no-console */
import _ from 'lodash';
import parse from './parser.js';

const allOriginsHexlet = 'https://allorigins.hexlet.app/get?disableCache=true';

/**
 * @param {string} allOrigins
 * @param {string} url
 * @returns {string}
 */
export const getRoute = (allOrigins, url) => {
  const allOriginsUrl = new URL(allOrigins);
  allOriginsUrl.searchParams.append('url', url);
  return allOriginsUrl.href;
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
 * @param {Event} event
 * @param {Object} state
 * @param {Object} validator
 * @param {Object} httpClient
 */
export const handleSubmit = (event, state, validator, httpClient) => {
  event.preventDefault();
  const form = /** @type {HTMLFormElement} */(event.target);
  const formData = new FormData(form);
  const rssLink = String(formData.get('rss-link'));

  const {
    feeds, posts, rssForm,
  } = state;

  const existingFeedsLinks = feeds.map((feed) => feed.rssLink);

  const schema = validator.string()
    .trim()
    .required()
    .url()
    .notOneOf(existingFeedsLinks);

  schema.validate(rssLink)
    .then((checkedUrl) => {
      rssForm.valid = true;
      rssForm.processingState = 'sending';

      const route = getRoute(allOriginsHexlet, checkedUrl);
      return httpClient.get(route);
    })

    .then((response) => {
      const { data: { contents } } = response;

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
    })

    .catch((err) => {
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
        rssForm.feedback = 'network.fail';
      }
    });
};

/**
 *
 * @param {Object} state
 * @param {Object} httpClient
 * @param {number} interval
 */
export const getNewPosts = (state, httpClient, interval) => {
  const {
    feeds, posts, rssForm,
  } = state;

  const promises = feeds.map(({ id, rssLink }) => {
    const route = getRoute(allOriginsHexlet, rssLink);
    return httpClient
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
      .catch((err) => {
        if (err.name === 'AxiosError') {
          rssForm.processingState = 'failed';
          rssForm.feedback = 'network.fail';
        } else if (err.name === 'ParsingError') {
          rssForm.processingState = 'failed';
          rssForm.feedback = 'parsing.fail';
        } else {
          rssForm.processingState = 'failed';
          rssForm.feedback = 'network.fail';
        }
      });
  });

  Promise.all(promises);

  setTimeout(() => { getNewPosts(state, httpClient, interval); }, interval);
};

export const handlePostsClick = (event, state) => {
  const targetElement = event.target;
  if (targetElement.tagName !== 'BUTTON' && targetElement.tagName !== 'A') {
    return;
  }

  const { ui } = state;
  const { seenPosts } = ui;
  let postId;
  if (targetElement.tagName === 'BUTTON') {
    postId = targetElement.dataset.postId;
  } else {
    postId = targetElement.nextElementSibling.dataset.postId;
  }

  seenPosts.add(postId);
  state.currentPostId = postId;
};
