/**
 * @param {Array<Object>} data
 * @param {Object} htmlElements
 */
const handleFeeds = (data, htmlElements) => {
  const { rssContainer, feedsList } = htmlElements;
  rssContainer.classList.remove('d-none');
  feedsList.innerHTML = '';
  const feeds = [...data].map((feed) => {
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
  feedsList.append(...feeds);
};

/**
 * @param {Array<Object>} data
 * @param {Object} htmlElements
 * @param {Set} seenPosts
 * @param {string} btnText
 */
const handlePosts = (data, htmlElements, seenPosts, btnText) => {
  const { postsList } = htmlElements;
  postsList.innerHTML = '';
  const posts = [...data].map(({
    title, id, link,
  }) => {
    const liElement = document.createElement('li');
    liElement.classList
      .add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    const postLink = document.createElement('a');
    postLink.setAttribute('href', link);
    postLink.setAttribute('target', '_blank');
    postLink.dataset.postId = id;

    if (seenPosts.has(id)) {
      postLink.classList.add('fw-normal', 'text-dark');
    } else {
      postLink.classList.add('fw-bold');
    }

    postLink.textContent = title;
    const postButton = document.createElement('button');
    postButton.dataset.postId = id;
    postButton.dataset.bsToggle = 'modal';
    postButton.dataset.bsTarget = '#modal';
    postButton.classList.add('btn', 'btn-primary');
    postButton.textContent = btnText;
    liElement.append(postLink, postButton);
    return liElement;
  });
  postsList.append(...posts);
};

/**
 * @param {string} postId
 * @param {Object} htmlElements
 */
const markPostAsRead = (postId, htmlElements) => {
  const { postsList } = htmlElements;
  const selector = `button[data-post-id="${postId}"]`;
  const linkElement = postsList.querySelector(selector).previousElementSibling;
  linkElement.classList.remove('fw-bold');
  linkElement.classList.add('fw-normal', 'text-dark');
};

/**
 * @param {Object} clickedPost
 * @param {Object} htmlElements
 */
const updateModalContents = (clickedPost, htmlElements) => {
  const {
    title, description, link,
  } = clickedPost;
  const {
    modalHeading, modalBody, btnReadMore,
  } = htmlElements;
  modalHeading.textContent = title;
  modalBody.textContent = description;
  btnReadMore.setAttribute('href', link);
};

/**
 * @param {boolean} isValid
 * @param {Object} htmlElements
 */

const showFormValidationStatus = (isValid, htmlElements) => {
  const { inputElement, feedbackField } = htmlElements;
  inputElement.classList.toggle('is-invalid');
  if (!isValid) {
    feedbackField.classList.remove('text-success');
    feedbackField.classList.add('text-danger');
  }
};

/**
 * @param {string} formState
 * @param {Object} htmlElements
 * @param {string} message
 */

const handleFormStateChange = (formState, htmlElements, message) => {
  const {
    btnSubmit, feedbackField, form, inputElement,
  } = htmlElements;
  switch (formState) {
    case 'pending':
      btnSubmit.setAttribute('disabled', 'disabled');
      break;
    case 'succeeded':
      btnSubmit.removeAttribute('disabled');
      feedbackField.classList.remove('text-danger');
      feedbackField.classList.add('text-success');
      feedbackField.textContent = message;
      form.reset();
      inputElement.focus();
      break;
    case 'failed':
      btnSubmit.removeAttribute('disabled');
      feedbackField.classList.remove('text-success');
      feedbackField.classList.add('text-danger');
      break;

    default:
      break;
  }
};

/**
 * @param {string} message
 * @param {Object} htmlElements
 */
const showErrorFeedbackMessage = (message, htmlElements) => {
  const { feedbackField } = htmlElements;
  feedbackField.textContent = message;
};

/**
 *
 * @param {string} path
 * @param {*} value
 * @param {*} prevValue
 * @param {Object} i18next
 * @param {Object} elements
 * @param {Object} state
 */
const render = (path, value, prevValue, i18next, elements, state) => {
  if (path === 'feeds') {
    handleFeeds(value, elements);
  }

  if (path === 'posts') {
    const { ui: { seenPosts } } = state;
    const localizedBtnText = i18next.t('ui.btnRead');
    handlePosts(value, elements, seenPosts, localizedBtnText);
  }

  if (path === 'currentPostId' && value !== prevValue) {
    const { posts } = state;
    const currentPost = posts.find(({ id }) => id === value);
    markPostAsRead(value, elements);
    updateModalContents(currentPost, elements);
  }

  if (path === 'rssForm.valid') {
    showFormValidationStatus(value, elements);
  }

  if (path === 'rssForm.processingState') {
    let localizedSuccessMessage = null;
    if (value === 'succeeded') {
      localizedSuccessMessage = i18next.t('success');
    }
    handleFormStateChange(value, elements, localizedSuccessMessage);
  }

  if (path === 'rssForm.feedback' && value !== prevValue) {
    const localizedErrorMessage = i18next.t(`errors.${value}`);
    showErrorFeedbackMessage(localizedErrorMessage, elements);
  }
};

export default render;
