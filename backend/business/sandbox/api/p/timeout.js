import Promise from 'bluebird';

export default async (fn, timeout, timeoutResult) => {
  try {
    return await new Promise(resolve => resolve(fn())).timeout(timeout);
  } catch (err) {
    if (err.name === 'TimeoutError') return timeoutResult;
    throw err;
  }
};
