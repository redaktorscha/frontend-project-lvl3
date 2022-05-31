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
const parseDom = (xmlString, feeds, posts, checkedLinks) => {
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(xmlString, 'text/xml');
  if (!_.isNull(parsedDocument.querySelector('parsererror'))) {
    throw new ParsingError('failed to parse');
  }
  // getFeeds
  const feedTitle = parsedDocument.querySelector('channel > title');
  const feedDescription = parsedDocument.querySelector('channel > description');
  const feedId = _.uniqueId();

  feeds.push({
    id: feedId,
    rssLink: checkedLinks[checkedLinks.length - 1],
    title: getTextContent(feedTitle),
    description: getTextContent(feedDescription),
  });

  // get posts for current feed
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
