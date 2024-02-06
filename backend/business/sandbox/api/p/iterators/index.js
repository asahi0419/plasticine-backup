import { doIteration } from './helpers.js';

export const iterateEach = (queryBuilder, ...args) => {
  return doIteration(queryBuilder, 'each', ...args);
};

export const iterateMap = (queryBuilder, ...args) => {
  return doIteration(queryBuilder, 'map', ...args);
};

export const iterateFeed = (queryBuilder, ...args) => {
  return doIteration(queryBuilder, 'feed', ...args);
};
