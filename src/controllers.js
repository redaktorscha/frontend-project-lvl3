/* eslint-disable no-console */
import _ from 'lodash';
import parse from './parser.js';

const allOriginsHexlet = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

/**
 *
 * @param {Array<Object>} posts
 * @param {string} postId
 * @returns {Object}
 */
const getCurrentPost = (posts, postId) => {
  const [currentPost] = posts.filter(({ id }) => id === postId);
  return currentPost;
};

/**
 * @param {string} allOrigins
 * @param {string} url
 * @returns {string}
 */
export const getRoute = (allOrigins, url) => `${allOrigins}${url}`;

/**
 * @param {string} url
 * @param {Object} state
 * @param {Object} validator
 * @param {Object} httpClient
 */
const addRss = (url, state, validator, httpClient) => {
  const { data, uiState: { rssForm } } = state;
  const { feeds, posts } = data;

  const existingFeedsLinks = feeds.map((feed) => feed.rssLink);

  const schema = validator.string()
    .trim()
    .required()
    .url()
    .notOneOf(existingFeedsLinks);

  schema.validate(url)
    .then((checkedUrl) => {
      rssForm.uiValid = true;
      rssForm.processingState = 'sending';

      const route = getRoute(allOriginsHexlet, checkedUrl);
      return httpClient.get(route);
    })

    .then((response) => {
      const requestUrl = response.config.url;
      const originalUrl = requestUrl
        .replace(allOriginsHexlet, '');
      const { data: { contents } } = response;

      const id = _.uniqueId();
      const { newFeed, newPosts } = parse(contents, originalUrl, id);

      data.feeds = [newFeed, ...feeds];

      data.posts = [...newPosts, ...posts];

      rssForm.processingState = 'processed';
      rssForm.feedback = 'network.success';
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
 * @param {Object} httpClient
 */
export const handleSubmit = (event, state, validator, httpClient) => {
  event.preventDefault();
  const form = /** @type {HTMLFormElement} */(event.target);
  const formData = new FormData(form);
  const rssLink = String(formData.get('rss-link'));
  addRss(rssLink, state, validator, httpClient);
};

/**
 *
 * @param {Object} state
 * @param {Object} httpClient
 * @param {number} interval
 */
export const getUpdates = (state, httpClient, interval) => {
  const { data } = state;
  const { feeds, posts } = data;
  if (feeds.length > 0) {
    const promises = feeds.map(({ id, rssLink }) => {
      const route = getRoute(allOriginsHexlet, rssLink);
      return httpClient
        .get(route)
        .then(({ data: { contents } }) => {
          const existingPostsLinks = posts
            .filter((post) => post.feedId === id)
            .map((post) => post.link);

          const { newPosts } = parse(contents, rssLink, id);
          const filteredPosts = newPosts
            .filter(({ link }) => !existingPostsLinks.includes(link));

          if (filteredPosts.length === 0) {
            console.log('no new');
          } else {
            console.log(`got ${filteredPosts.length} new posts`);
          }

          data.posts = [...filteredPosts, ...posts];
        })
        .catch(console.log);
    });

    Promise.all(promises);
  }

  setTimeout(() => { getUpdates(state, httpClient, interval); }, interval);
};

export const handlePostsClick = (event, state) => {
  const targetElement = event.target;
  if (targetElement.tagName !== 'BUTTON' && targetElement.tagName !== 'A') {
    return;
  }

  const { data } = state;
  const { posts } = data;
  let currentPost;
  if (targetElement.tagName === 'BUTTON') {
    const { postId } = targetElement.dataset;
    currentPost = getCurrentPost(posts, postId);
    currentPost.isShowing = true;
    currentPost.isRead = true;
  } else {
    const { postId } = targetElement.nextElementSibling.dataset;
    currentPost = getCurrentPost(posts, postId);
    currentPost.isRead = true;
  }

  data.posts.forEach(({ id }, arr, i) => {
    if (id === currentPost.id) {
      data.posts[i] = currentPost;
    }
  });
};
