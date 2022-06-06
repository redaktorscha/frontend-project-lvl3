/* eslint-disable no-console */
import htmlElements from './htmlElements.js';

/**
 *
 * @param {string} path
 * @param {*} value
 * @param {*} prevValue
 * @param {Object} translator
 */
const render = (path, value, prevValue, translator) => {
  const {
    form,
    inputElement,
    btnSubmit,
    pElement,
    bottomContainer,
    ulElementFeeds,
    ulElementPosts,
    modalBox,
    modalHeading,
    modalBody,
    btnReadMore,
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
      postLink.setAttribute('target', '_blank');
      if (post.isRead) {
        postLink.classList.add('link-primary', 'fw-normal', 'text-dark');
      } else {
        postLink.classList.add('link-primary', 'fw-bold');
      }
      postLink.textContent = post.title;
      const postButton = document.createElement('button');
      postButton.dataset.postId = post.id;
      postButton.dataset.bsToggle = 'modal';
      postButton.dataset.bsTarget = '#modal';
      postButton.classList.add('btn', 'btn-primary');
      postButton.textContent = translator.t('ui.btnRead');
      liElement.append(postLink, postButton);
      return liElement;
    });
    ulElementPosts.append(...posts);
  }

  if (path === 'uiState.rssForm.uiValid') {
    inputElement.classList.toggle('invalid');
    if (!value) {
      pElement.classList.remove('text-success');
      pElement.classList.add('text-danger');
    }
  }

  if (path === 'uiState.rssForm.processingState') {
    switch (value) {
      case 'sending':
        btnSubmit.setAttribute('disabled', 'disabled');
        break;
      case 'processed':
        btnSubmit.removeAttribute('disabled');
        pElement.classList.remove('text-danger');
        pElement.classList.add('text-success');
        form.reset();
        inputElement.focus();
        break;
      case 'failed':
        btnSubmit.removeAttribute('disabled');
        pElement.classList.remove('text-success');
        pElement.classList.add('text-danger');
        break;

      default:
        break;
    }
  }

  if (path === 'uiState.rssForm.feedback' && value !== prevValue) {
    pElement.textContent = translator.t(value);
  }

  if (path === 'uiState.modalBox.uiOpen') {
    modalBox.classList.toggle('show');
  }

  if (path === 'uiState.modalBox.title') {
    modalHeading.textContent = value;
  }

  if (path === 'uiState.modalBox.bodyText') {
    modalBody.textContent = value;
  }

  if (path === 'uiState.modalBox.readMoreLink') {
    btnReadMore.setAttribute('href', value);
  }

  if (path === 'data.currentPostId') {
    const selector = `button[data-post-id="${value}"]`;
    const linkElement = bottomContainer.querySelector(selector).previousElementSibling;
    linkElement.classList.remove('fw-bold');
    linkElement.classList.add('fw-normal', 'text-dark');
  }
};

export default render;
