/**
 *
 * @param {string} path
 * @param {*} value
 * @param {*} prevValue
 * @param {Object} translator
 * @param {Object} elements
 */
const render = (path, value, prevValue, translator, elements) => {
  const {
    form,
    inputElement,
    btnSubmit,
    pElement,
    bottomContainer,
    ulElementFeeds,
    ulElementPosts,
    modalHeading,
    modalBody,
    btnReadMore,
  } = elements;

  if (path === 'feeds') {
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

  if (path === 'posts') {
    console.log('change posts');
    ulElementPosts.innerHTML = '';
    const posts = [...value].map((post) => {
      const liElement = document.createElement('li');
      liElement.classList
        .add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
      const postLink = document.createElement('a');
      postLink.setAttribute('href', post.link);
      postLink.setAttribute('target', '_blank');
      if (post.isRead) {
        postLink.classList.add('fw-normal', 'text-dark');
      } else {
        postLink.classList.add('fw-bold');
      }
      if (post.isShowing) {
        modalHeading.textContent = post.title;
        modalBody.textContent = post.description;
        btnReadMore.setAttribute('href', post.link);
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

  if (path === 'rssForm.uiValid') {
    inputElement.classList.toggle('is-invalid');
    if (!value) {
      pElement.classList.remove('text-success');
      pElement.classList.add('text-danger');
    }
  }

  if (path === 'rssForm.processingState') {
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

  if (path === 'rssForm.feedback' && value !== prevValue) {
    pElement.textContent = translator.t(value);
  }
};

export default render;
