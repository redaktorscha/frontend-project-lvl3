// @ts-nocheck
/* eslint-disable max-len */
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { jest, it, expect } from '@jest/globals';
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

let htmlString;

beforeAll(async () => {
  htmlString = await readFixture('index');
});

beforeEach(async () => {
  document.body.innerHTML = htmlString;
  await init();
});

it('loads static html', async () => {
  expect(await screen.findByText('RSS агрегатор')).toBeInTheDocument();
});

it('shows invalid message if input field is empty', async () => {
  const user = userEvent.setup();
  const formInput = screen.getByRole('textbox');
  const btnSubmit = screen.getByRole('button');
  await user.click(btnSubmit);
  expect(formInput.classList.contains('invalid')).toBe(true);
});
