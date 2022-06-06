const state = {
  data: {
    checkedLinks: [],
    feeds: [],
    posts: [],
    currentPostId: null,
  },
  uiState: {
    rssForm: {
      uiValid: true,
      processingState: null,
      feedback: null,
    },
    modalBox: {
      title: null,
      bodyText: null,
      readMoreLink: null,
    },
  },
  localeState: {
    languages: ['en', 'ru'],
    languageMode: 'ru',
  },
  timer: {
    id: null,
  },
};

export default state;
