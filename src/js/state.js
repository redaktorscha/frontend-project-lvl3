const state = {
  data: {
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
    languageMode: 'ru',
  },
};

export default state;
