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
 * @param {Array<Object>} feeds
 * @param {Array<Object>} posts
 */
const parseDom = (xmlString, feeds, posts) => { // naming?
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(xmlString, 'text/xml');
  if (!_.isNull(parsedDocument.querySelector('parsererror'))) {
    throw new ParsingError('failed to parse');
  }

  const feedTitle = parsedDocument.querySelector('channel > title');
  const feedDescription = parsedDocument.querySelector('channel > description');

  // update current feed
  const lastFeed = feeds[feeds.length - 1];

  lastFeed.title = getTextContent(feedTitle);
  lastFeed.description = getTextContent(feedDescription);
  const feedId = lastFeed.id;

  // add posts for current feed
  const postElements = parsedDocument.querySelectorAll('item');
  const newPosts = Array.from(postElements).map((postElement) => {
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
    };
  });

  posts.push(...newPosts);
};

export default parseDom;
