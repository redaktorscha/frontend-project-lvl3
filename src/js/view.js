/* eslint-disable no-console */
import htmlElements from './htmlElements.js';
/**
 *
 * @param {string} path
 * @param {*} value
 * @param {*} prevValue
 */
const render = (path, value, prevValue) => { // render (view)
  const {
    form, inputElement, pElement, bottomContainer, ulElementFeeds, ulElementPosts,
  } = htmlElements;
  if (path === 'data.feeds') {
    bottomContainer.classList.remove('d-none');
    ulElementFeeds.innerHTML = '';
    const feeds = [...value].map((feed) => {
      const liElement = document.createElement('li');
      liElement.classList.add('list-group-item', 'border-0');
      const feedHeading = document.createElement('h3');
      feedHeading.classList.add('h5', 'text-primary');
      feedHeading.textContent = feed.title;
      const feedDescription = document.createElement('p');
      feedDescription.classList.add('text-small');
      feedDescription.textContent = feed.description;
      liElement.append(feedHeading, feedDescription);
      return liElement;
    });
    ulElementFeeds.append(...feeds);
  }

  if (path === 'data.posts') {
    ulElementPosts.innerHTML = '';
    const posts = [...value].map((post) => {
      const liElement = document.createElement('li');
      liElement.classList
        .add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
      const postLink = document.createElement('a');
      postLink.setAttribute('href', post.link);
      postLink.classList.add('link-primary');
      postLink.textContent = post.title;
      const postButton = document.createElement('button');
      postButton.classList.add('btn', 'btn-primary');
      postButton.textContent = 'Read';
      liElement.append(postLink, postButton);
      return liElement;
    });
    ulElementPosts.append(...posts);
  }
  if (path === 'uiState.rssForm.uiValid') {
    inputElement.classList.toggle('invalid');
  }

  if (path === 'uiState.feedbackField.uiType') {
    if (value === 'negative') {
      pElement.classList.remove('text-success');
      pElement.classList.add('text-danger');
    }
    if (value === 'positive') {
      pElement.classList.remove('text-danger');
      pElement.classList.add('text-success');
    }
  }

  if (path === 'uiState.feedbackField.message' && value !== prevValue) {
    pElement.textContent = value;
  }

  form.reset();
  inputElement.focus();
};

export default render;
