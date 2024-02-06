import { jest } from '@jest/globals';

import cache from '../presentation/shared/cache/index.js';
import cleaner from './cleaner.js';

beforeAll(async () => {
  await cache.start();
  await cleaner.init();
});

afterAll(async () => {
  await cleaner.clear();
  cache.stop();
});

jest.setTimeout(30000);
