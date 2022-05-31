/* eslint-disable no-console */
import axios from 'axios';
import _ from 'lodash';
import parseDom from './parser.js';

const allOriginsHexlet = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

const getTextContent = (element) => element.textContent.trim();

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
const addRss = (url, state, validator) => {
  const { data: { feeds, posts }, uiState: { rssForm } } = state;

  const rssLinks = feeds.map((feed) => feed.rssLink); // already added feeds

  // validate form
  const schema = validator.string()
    .trim()
    .url('invalid')
    .notOneOf(rssLinks, 'exists');

  schema.validate(url)
    .then((checkedUrl) => {
      rssForm.uiValid = true;
      rssForm.processingState = 'sending';

      // add feed
      feeds.push({
        id: _.uniqueId(),
        rssLink: checkedUrl,
        title: null,
        description: null,
      });

      // first http-request
      const route = getRoute(allOriginsHexlet, checkedUrl);
      return axios.get(route);
    })

    .then(({ data: { contents } }) => {
      parseDom(contents, feeds, posts);

      rssForm.processingState = 'processed';
      rssForm.feedback = 'network.success';
    })

    .then(() => {
      const promises = feeds.map(({ id, rssLink }) => {
        const route = getRoute(allOriginsHexlet, rssLink);
        return axios.get(route).then(({ data: { contents } }) => {
          const parser = new DOMParser();
          const parsedDocument = parser.parseFromString(contents, 'text/xml');
          const postElements = parsedDocument.querySelectorAll('item');

          const addedPostsLinks = posts
            .filter((post) => post.feedId === id)
            .map((post) => post.link);

          const newPosts = Array.from(postElements)
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

          posts.push(...newPosts);
        }).catch(console.log); // ??
      });
      Promise.all(promises);
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
 */
const handleSubmit = (event, state, validator) => {
  event.preventDefault();
  const form = /** @type {HTMLFormElement} */(event.target);
  const formData = new FormData(form);
  const rssLink = String(formData.get('rss-link'));
  addRss(rssLink, state, validator);
};

export default handleSubmit;
