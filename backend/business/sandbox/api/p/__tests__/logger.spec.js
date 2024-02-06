import LoggerProxy from '../logger/proxy';
import loggerNamespace from '../logger/index.js';

describe('p.log', () => {
  it('Should return logger proxy instance', () => {
    const result = loggerNamespace(sandbox);
    const expected = new LoggerProxy(sandbox.user);

    expect(result).toEqual(expected);
  });
});
