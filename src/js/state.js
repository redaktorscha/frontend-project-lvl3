const state = {
  data: {
    checkedLinks: [],
    feeds: [],
    posts: [],
  },
  uiState: {
    rssForm: {
      uiValid: true,
      processingState: null,
      feedback: null,
    },
  },
  localeState: {
    languages: ['en', 'ru'],
    languageMode: 'en',
  },
};

export default state;
