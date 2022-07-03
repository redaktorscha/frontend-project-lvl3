/* eslint-disable no-console */
import _ from 'lodash';
import { parseDom, getFeed, getPosts } from './parser.js';

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

//  remove!!!
//  *
//  * @param {Array<Object>} posts
//  * @param {string} postId
//  * @param {Object} uiState
//  */
// const updateModalContents = (posts, postId, uiState) => {
//   const { modalBox } = uiState;
//   const [currentPost] = posts.filter((post) => post.id === postId);
//   const {
//     title, description, link,
//   } = currentPost;

//   modalBox.title = title;
//   modalBox.bodyText = description;
//   modalBox.readMoreLink = link;
// };

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
      console.log('response config url', response.config.url);
      const requestUrl = response.config.url;
      const originalUrl = requestUrl
        .replace('https://allorigins.hexlet.app/get?disableCache=true&url=', '');
      const { data: { contents } } = response;
      const parsedContents = parseDom(contents);
      const feedId = _.uniqueId();

      const newFeed = getFeed(parsedContents, originalUrl, feedId);
      data.feeds = [newFeed, ...feeds];
      // console.log('feeds:\n', feeds);

      const newPosts = getPosts(parsedContents, feedId);
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
  const { data, timer } = state;
  const { feeds, posts } = data; // remove timer
  if (feeds.length > 0) {
    const promises = feeds.map(({ id, rssLink }) => {
      const route = getRoute(allOriginsHexlet, rssLink);
      return httpClient
        .get(route)
        .then(({ data: { contents } }) => {
          const parsedContents = parseDom(contents);

          const addedPostsLinks = posts
            .filter((post) => post.feedId === id)
            .map((post) => post.link);

          const newPosts = getPosts(parsedContents, id);
          const filteredPosts = newPosts
            .filter(({ link }) => !addedPostsLinks.includes(link));

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

  timer.id = setTimeout(() => { getUpdates(state, httpClient, interval); }, interval);
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
