// @ts-nocheck
/* eslint-disable max-len */
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import nock from 'nock';
import { test, it, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import init from '../src/js/init.js';
import localeRu from '../src/locales/ru.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @param {string} filename
 * @returns {string}
 */
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

/**
 * @param {string} file
 * @returns {Promise<string>}
 */
const readFixture = async (file) => {
  const string = await readFile(getFixturePath(file), 'utf-8');
  return string.trim();
};

const testData = {
  htmlString: null,
  xmlStringValid: null,
  xmlStringInvalid: 'lorem ipsum',
  urlInvalid: 'xx',
  urlRssValid: 'https://lorem-rss.herokuapp.com/feed',
  urlRssInvalid: 'https://example.com/',
  feedDescription: 'This is a constantly updating lorem ipsum feed',
  firstPostTitle: 'Lorem ipsum 2022-06-10T19:35:25Z',
};

const htmlElements = {
};

beforeAll(async () => {
  testData.htmlString = await readFixture('index');
  testData.xmlStringValid = await readFixture('xml-valid');
});

beforeEach(async () => {
  const { htmlString } = testData;
  document.body.innerHTML = htmlString;
  await init();
  htmlElements.btnSubmit = screen.getByTestId('submit');
  htmlElements.formInput = screen.getByTestId('input');
  htmlElements.modal = screen.getByTestId('modal');
  htmlElements.feedbackField = screen.getByTestId('feedback');
  htmlElements.modalTitle = screen.getByTestId('modal-title');
});

afterEach(nock.cleanAll);

afterAll(nock.restore);

describe('submits form successfully', () => {
  it('should display what user types', async () => {
    const { formInput } = htmlElements;
    const { urlRssValid } = testData;

    const user = userEvent.setup();
    await user.type(formInput, urlRssValid);
    expect(await formInput).toHaveValue(urlRssValid);
  });

  it('should show positive feedback message', async () => {
    const {
      formInput, btnSubmit, feedbackField,
    } = htmlElements;
    const { urlRssValid, xmlStringValid } = testData;
    nock(urlRssValid)
      .get('/')
      .reply(200, {
        contents: xmlStringValid,
      });

    const user = userEvent.setup();
    await user.type(formInput, urlRssValid);
    await user.click(btnSubmit);
    expect(await screen.findByText(localeRu.translation.network.success)).toBeVisible();
    expect(await feedbackField.classList.contains('text-success')).toBe(true);
  });

  it('should show feed description', async () => {
    const { formInput, btnSubmit } = htmlElements;
    const {
      urlRssValid, xmlStringValid, feedDescription,
    } = testData;
    nock(urlRssValid)
      .get('/')
      .reply(200, {
        contents: xmlStringValid,
      });

    const user = userEvent.setup();
    await user.type(formInput, urlRssValid);
    await user.click(btnSubmit);
    expect(await screen.findByText(feedDescription)).toBeVisible();
  });
});

describe('posts preview', () => {
  it('should open modal window when clicking preview button', async () => {
    const {
      formInput, btnSubmit, modal,
    } = htmlElements;
    const { urlRssValid, xmlStringValid } = testData;

    const user = userEvent.setup();
    await user.type(formInput, urlRssValid);
    await user.click(btnSubmit);
    nock(urlRssValid)
      .get('/')
      .reply(200, {
        contents: xmlStringValid,
      });
    let btnPost;
    await waitFor(() => {
      [btnPost] = screen.getAllByRole('button', {
        name: localeRu.translation.ui.btnRead,
      });
    });
    await user.click(btnPost);
    expect(await modal).toBeVisible();
  });

  test('clicked post title should match modal window title', async () => {
    const {
      formInput, btnSubmit, modalTitle,
    } = htmlElements;
    const {
      urlRssValid, xmlStringValid, firstPostTitle,
    } = testData;
    nock(urlRssValid)
      .get('/')
      .reply(200, {
        contents: xmlStringValid,
      });

    const user = userEvent.setup();
    await user.type(formInput, urlRssValid);
    await user.click(btnSubmit);
    let btnPost;
    await waitFor(() => {
      [btnPost] = screen.getAllByRole('button', {
        name: localeRu.translation.ui.btnRead,
      });
    });
    await user.click(btnPost);
    expect(await modalTitle).toHaveTextContent(firstPostTitle);
  });
});

describe('invalid, empty or existing input value', () => {
  const {
    urlInvalid, urlRssInvalid, urlRssValid, xmlStringValid, xmlStringInvalid,
  } = testData;

  test('invalid url', async () => {
    const { formInput, btnSubmit } = htmlElements;
    const user = userEvent.setup();
    await user.type(formInput, urlInvalid);
    await user.click(btnSubmit);
    expect(await screen.findByText(localeRu.translation.validation.invalid)).toBeVisible();
    expect(await formInput.classList.contains('invalid')).toBe(true);
  });

  test('empty url', async () => {
    const { btnSubmit, feedbackField } = htmlElements;
    const user = userEvent.setup();
    await user.click(btnSubmit);
    expect(await screen.findByText(localeRu.translation.validation.empty)).toBeVisible();
    expect(await feedbackField.classList.contains('text-danger')).toBe(true);
  });

  test('invalid rss', async () => {
    const {
      formInput, btnSubmit, feedbackField,
    } = htmlElements;
    const user = userEvent.setup();
    await user.type(formInput, urlRssInvalid);
    await user.click(btnSubmit);
    nock(urlRssInvalid)
      .get('/')
      .reply(200, {
        contents: xmlStringInvalid,
      });
    expect(await screen.findByText(localeRu.translation.parsing.fail)).toBeVisible();
    expect(await feedbackField.classList.contains('text-danger')).toBe(true);
  });

  test('existing rss', async () => {
    const {
      formInput, btnSubmit, feedbackField,
    } = htmlElements;
    const user = userEvent.setup();
    await user.type(formInput, urlRssValid);
    await user.click(btnSubmit);
    nock(urlRssValid)
      .get('/')
      .reply(200, {
        contents: xmlStringValid,
      });

    await user.type(formInput, urlRssValid);
    await user.click(btnSubmit);

    expect(await screen.findByText(localeRu.translation.validation.exists)).toBeVisible();
    expect(await feedbackField.classList.contains('text-danger')).toBe(true);
  });
});
