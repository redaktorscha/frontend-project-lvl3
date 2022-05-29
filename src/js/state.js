const state = {
  data: {
    checkedLinks: [],
    feeds: [],
    posts: [],
  },
  uiState: {
    rssForm: {
      uiValid: true,
      submitDisabled: false,
      processingState: null,
    },
    feedbackField: {
      uiState: null,
      message: null,
    },
  },
  localeState: {
    languages: ['en', 'ru'],
    languageMode: null,
  },
};

export default state;
