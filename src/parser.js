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
 * @returns {Object}
 */
export default (xmlString) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xmlString, 'text/xml');
  if (!_.isNull(document.querySelector('parsererror'))) {
    throw new ParsingError('failed to parse');
  }

  const documentTitle = document.querySelector('channel > title');
  const documentDescription = document.querySelector('channel > description');
  const documentElements = document.querySelectorAll('item');
  const items = Array
    .from(documentElements)
    .map((element) => {
      const itemTitle = element.querySelector('title');
      const itemLink = element.querySelector('link');
      const itemDescription = element.querySelector('description');

      return {
        title: getTextContent(itemTitle),
        description: getTextContent(itemDescription),
        link: getTextContent(itemLink),
      };
    });

  return {
    title: getTextContent(documentTitle),
    description: getTextContent(documentDescription),
    items,
  };
};
