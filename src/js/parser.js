import _ from 'lodash';

class ParsingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParsingError';
  }
}

/**
 * @param {Element} element
 * @returns {string}
 */
const getTextContent = (element) => element.textContent.trim();

/**
 * @param {string} xmlString
 * @returns {Document}
 */
export const parseDom = (xmlString) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xmlString, 'text/xml');
  if (!_.isNull(document.querySelector('parsererror'))) {
    throw new ParsingError('failed to parse');
  }
  return document;
};

/**
 *
 * @param {Document} document
 * @param {string} rssLink
 * @param {string} id
 * @returns {Object}
 */
export const getFeed = (document, rssLink, id) => {
  const feedTitle = document.querySelector('channel > title');
  const feedDescription = document.querySelector('channel > description');
  return {
    id,
    rssLink,
    title: getTextContent(feedTitle),
    description: getTextContent(feedDescription),
  };
};

/**
 *
 * @param {Document} document
 * @param {string} feedId
 * @returns {Array<Object>}
 */
export const getPosts = (document, feedId) => {
  const postElements = document.querySelectorAll('item');
  const posts = Array
    .from(postElements)
    .map((postElement) => {
      const postId = _.uniqueId();
      const postTitle = postElement.querySelector('title');
      const link = postElement.querySelector('link');
      const postDescription = postElement.querySelector('description');

      return {
        id: postId,
        feedId,
        title: getTextContent(postTitle),
        description: getTextContent(postDescription),
        link: getTextContent(link),
        isRead: false,
        isShowing: false,
      };
    });
  return posts;
};
