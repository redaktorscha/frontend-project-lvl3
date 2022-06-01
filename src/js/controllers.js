/* eslint-disable no-console */
import _ from 'lodash';
import { parseDom, getFeed, getPosts } from './parser.js';

const allOriginsHexlet = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

/**
 * @param {string} allOrigins
 * @param {string} url
 * @returns {string}
 */
const getRoute = (allOrigins, url) => `${allOrigins}${url}`;

/**
 * @param {string} url
 * @param {Object} state
 * @param {Object} validator
 */
const addRss = (url, state, validator, httpClient) => {
  const {
    data: {
      checkedLinks, feeds, posts,
    }, uiState: { rssForm },
  } = state;

  // validate form
  const schema = validator.string()
    .trim()
    .url('invalid')
    .notOneOf(checkedLinks, 'exists');

  schema.validate(url)
    .then((checkedUrl) => {
      rssForm.uiValid = true;
      rssForm.processingState = 'sending';

      checkedLinks.push(checkedUrl);

      // load feed contents
      const route = getRoute(allOriginsHexlet, checkedUrl);
      return httpClient.get(route);
    })

    .then(({ data: { contents } }) => {
      const parsedContents = parseDom(contents);
      const feedId = _.uniqueId();

      const newFeed = getFeed(parsedContents, checkedLinks, feedId);
      feeds.push(newFeed);

      const newPosts = getPosts(parsedContents, feedId);
      posts.push(...newPosts);

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
  const { data: { feeds, posts }, timer } = state;
  if (feeds.length === 0) {
    console.log('no feeds');
  }

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
          .filter(({ link }) => !addedPostsLinks.includes(link)); // only new

        if (filteredPosts.length === 0) { // remove later
          console.log('no new');
        } else {
          console.log(`got ${filteredPosts.length} new posts`);
        }

        posts.push(...filteredPosts);
      })
      .catch(console.log); // ?
  });

  Promise.all(promises);

  timer.id = setTimeout(() => { getUpdates(state, httpClient, interval); }, interval);
};
