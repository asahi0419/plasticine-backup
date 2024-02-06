import Promise from 'bluebird';

import timeoutFunction from '../timeout';

function TimeoutError(message = '') {
  this.name = 'TimeoutError';
  this.message = message;
}

function CustomError(message = '') {
  this.name = 'CustomError';
  this.message = message;
}

describe('p.timeout(fn, timeout, timeoutResult)', () => {
  it('Should properly run', async () => {
    jest.spyOn(Promise.prototype, 'timeout');

    const fn = () => null;
    const timeout = 1000;
    const timeoutResult = 'timeoutResult';

    await timeoutFunction(fn, timeout, timeoutResult);

    expect(Promise.prototype.timeout).toBeCalledWith(timeout);
  });

  it('Should return timeoutResult for timeout error', async () => {
    const fn = () => { throw new TimeoutError() };
    const timeout = 1000;
    const timeoutResult = 'timeoutResult';

    const result = await timeoutFunction(fn, timeout, timeoutResult);
    const expected = timeoutResult;

    expect(result).toEqual(expected);
  });

  it('Should throw error another error otherwise', async () => {
    const fn = () => { throw new CustomError() };
    const timeout = 1000;
    const timeoutResult = 'timeoutResult';

    await expect(timeoutFunction(fn, timeout, timeoutResult)).rejects.toMatchObject({ name: 'CustomError' });
  });
});
