import { getSetting } from '../../../../setting/index.js';

const BATCH_SIZE = 1000;

export const doIteration = async (queryBuilder, type, ...args) => {
  const { limiter: queryLimit, offset: originalOffset = 0 } = queryBuilder;
  const { cb = (r) => r, batchSize } = extractArgs(args, queryLimit);

  queryBuilder.setMode('iteration');

  let queryCount = queryLimit || await queryBuilder.count();
  let results = [];

  const next = async (offset, limit) => {
    let records = await queryBuilder.limit(limit, offset);

    if (type === 'feed') {
      await resolveResult(cb(records));
    } else {
      for (let record of records) {
        const result = await resolveResult(cb(record));
        if ((type === 'map') && result) results.push(result);
      }
    }

    queryCount = records.length ? (queryCount - records.length) : 0;

    const nextLimit = [queryCount, batchSize].sort((a, b) => a - b)[0];
    return queryCount > 0 && next(offset + limit, nextLimit);
  };

  const initialLimit = queryLimit && (queryLimit < batchSize) ? queryLimit : batchSize;
  await next(originalOffset, initialLimit);

  queryBuilder.setMode(null);

  if (type === 'map') return results;
}

export const extractArgs = (args, queryLimit) => {
  let cb, batchSize;

  if (args.length === 2 && typeof(args[0]) === 'number' && typeof(args[1]) === 'function') {
    batchSize = args[0];
    cb = args[1];
  }

  if (args.length === 1 && typeof(args[0]) === 'function') {
    cb = args[0];
  }

  const limits = getSetting('limits');

  batchSize = batchSize || queryLimit || limits.query_iterator || BATCH_SIZE;
  batchSize = [batchSize, limits.query_iterator_max].map(value => parseInt(value)).sort((a, b) => a - b)[0];

  return { cb, batchSize };
}

export const resolveResult = async (result) => {
  return result && typeof (result.then) === 'function' ? await result : result
}
