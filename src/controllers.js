/* eslint-disable no-console */
import _ from 'lodash';
import parse from './parser.js';

const allOriginsHexlet = 'https://allorigins.hexlet.app/get?disableCache=true';

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
      isRead: false,
      isShowing: false,
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
      rssForm.uiValid = true;
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

      console.log('newFeed', newFeed);

      const newPosts = processPosts(items, id);

      console.log('newPosts', newPosts);

      state.feeds = [newFeed, ...feeds];
      state.posts = [...newPosts, ...posts];

      rssForm.processingState = 'processed';
      rssForm.feedback = 'network.success';
    })

    .catch((err) => {
      console.log('err', err); // remove

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
 *
 * @param {Object} state
 * @param {Object} httpClient
 * @param {number} interval
 */
export const getNewPosts = (state, httpClient, interval) => {
  const { feeds, posts } = state;

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
      .catch(console.log); // add error handling
  });

  Promise.all(promises);

  setTimeout(() => { getNewPosts(state, httpClient, interval); }, interval);
};

export const handlePostsClick = (event, state) => {
  const targetElement = event.target;
  if (targetElement.tagName !== 'BUTTON' && targetElement.tagName !== 'A') {
    return;
  }

  const { posts } = state;
  let previousPost;
  let currentPost;
  if (targetElement.tagName === 'BUTTON') {
    [previousPost] = posts.filter(({ isShowing }) => isShowing);
    if (previousPost) {
      previousPost.isShowing = false;
    }
    const { postId } = targetElement.dataset;
    currentPost = getCurrentPost(posts, postId);
    currentPost.isShowing = true;
    currentPost.isRead = true;
  } else {
    const { postId } = targetElement.nextElementSibling.dataset;
    currentPost = getCurrentPost(posts, postId);
    currentPost.isRead = true;
  }

  state.posts.forEach(({ id }, arr, i) => {
    if (id === currentPost.id) {
      state.posts[i] = currentPost;
    }
  });
};
