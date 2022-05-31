/* eslint-disable no-console */
import _ from 'lodash';
import parseDom from './parser.js';

const allOriginsHexlet = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

/**
 * @param {string} allOrigins
 * @param {string} url
 * @returns {string}
 */
const getRoute = (allOrigins, url) => `${allOrigins}${url}`;

const getTextContent = (element) => element.textContent.trim();

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
      parseDom(contents, feeds, posts, checkedLinks);

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
        console.log('hello from timer');
        const parser = new DOMParser();
        const parsedDocument = parser.parseFromString(contents, 'text/xml');
        const postElements = parsedDocument.querySelectorAll('item');
        const addedPostsLinks = posts
          .filter((post) => post.feedId === id)
          .map((post) => post.link);

        const newPosts = Array.from(postElements) // getPosts
          .map((postElement) => {
            const postId = _.uniqueId();
            const postTitle = postElement.querySelector('title');
            const link = postElement.querySelector('link');
            const postDescription = postElement.querySelector('description');
            return {
              id: postId,
              feedId: id,
              title: getTextContent(postTitle),
              description: getTextContent(postDescription),
              link: getTextContent(link),
            };
          })
          .filter(({ link }) => !addedPostsLinks.includes(link));
        if (!newPosts.length) {
          console.log('no new');
        }

        posts.push(...newPosts);
      })
      .catch(console.log);
  });

  Promise.all(promises);

  timer.id = setTimeout(() => { getUpdates(state, httpClient, interval); }, interval);
};
