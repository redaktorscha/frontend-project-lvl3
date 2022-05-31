import axios from 'axios';

import _ from 'lodash';
/**
 *
 */
const getUpdates = (ms, links, client) => {
  const feeds = [];
  const posts = [];

  const allOrigins = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
  const getRoute = (url) => `${allOrigins}${url}`;
  const getTextContent = (element) => element.textContent.trim();

  const setTimer = (interval) => {
    const promises = links.map((rssLink) => {
      const route = getRoute(rssLink);
      return client.get(route).then(({ data: { contents } }) => {
        // const parsedDocument = parser.parseFromString(contents, 'text/xml');
        // const feedId = _.uniqueId();
        // const feedTitle = parsedDocument.querySelector('channel > title');
        // const feedDescription = parsedDocument.querySelector('channel > description');

        // feeds.push({
        //   id: feedId,
        //   title: getTextContent(feedTitle),
        //   description: getTextContent(feedDescription),
        // });

        // const postElements = parsedDocument.querySelectorAll('item');;

        // const newPosts = Array.from(postElements).map((postElement) => {
        //   const postId = _.uniqueId();
        //   const postTitle = postElement.querySelector('title');
        //   const link = postElement.querySelector('link');
        //   const postDescription = postElement.querySelector('description');
        //   return {
        //     id: postId,
        //     feedId, // ????
        //     title: getTextContent(postTitle),
        //     description: getTextContent(postDescription),
        //     link: getTextContent(link),
        //   };
        // });

        // posts.push(...newPosts);

      }).catch(console.log);
    });
    Promise.all(promises);
    setTimeout(() => { setTimer(interval); }, interval);
  };

  // setTimeout(() => { setTimer(ms); }, 0);
  setTimer(ms);
};

getUpdates(5000, ['https://lorem-rss.herokuapp.com/feed?unit=second&interval=5'], axios);
