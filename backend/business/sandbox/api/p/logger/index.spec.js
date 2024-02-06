import logger from '../../../../logger/index.js';
import { LoggerProxy, getMeta } from './index.js';

afterEach(() => jest.clearAllMocks());

describe('p.logger', () => {
  describe('LoggerProxy', () => {
    describe('constructor(user)', () => {
      it('Should properly run', () => {
        const { user } = sandbox;
        const proxy = new LoggerProxy(user);

        expect(proxy.user).toEqual(user);
      });
    });

    describe('info(message, tag)', () => {
      it('Should be able to log strings', () => {
        jest.spyOn(logger, 'info');

        const { user } = sandbox;

        const message = 'message';
        const proxy = new LoggerProxy(user);

        proxy.info(message)

        expect(logger.info).toBeCalledWith(message, expect.any(Object));
      });

      it('Should be able to log objects', () => {
        jest.spyOn(logger, 'info');

        const { user } = sandbox;

        const message = { message: 'message' };
        const proxy = new LoggerProxy(user);

        proxy.info(message)

        expect(logger.info).toBeCalledWith(JSON.stringify(message), expect.any(Object));
      });
    });

    describe('error(error, tag)', () => {
      it('Should properly run', () => {
        jest.spyOn(logger, 'error');

        const { user } = sandbox;

        const error = new Error();
        const proxy = new LoggerProxy(user);

        proxy.error(error)

        expect(logger.error).toBeCalledWith(error, expect.any(Object));
      });
    });

    describe('memoryUsage(tag)', () => {
      it('Should properly run', () => {
        jest.spyOn(logger, 'trace');

        const { user } = sandbox;

        const proxy = new LoggerProxy(user);
        const result = proxy.memoryUsage()

        expect(logger.trace).toBeCalledWith(expect.any(Object), expect.any(Object));
        expect(result).toHaveProperty('heapUsedKb', 'heapTotalKb', 'rss');
      });
    });
  });

  describe('getMeta(user)', () => {
    it('Should return log meta', () => {
      const { user } = sandbox;
      const tag = 'tag';

      const result = getMeta(user, tag);
      const expected = { user: user.id, tag };

      expect(result).toMatchObject(expected);
    });
  });
});
