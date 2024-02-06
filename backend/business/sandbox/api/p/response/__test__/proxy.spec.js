import logger from '../../../../../logger/index.js';
import ResponseProxy from '../proxy';

describe('p.response', () => {
  describe('ResponseProxy', () => {
    describe('constructor(response, request)', () => {
      it('Should properly run', () => {
        const { response, request } = sandbox;
        const proxy = new ResponseProxy(response, request);

        expect(proxy.response).toEqual(response);
        expect(proxy.request).toEqual(request);
      });
    });

    describe('json(payload)', () => {
      it('Should respond with payload', async () => {
        const json = jest.fn();
        const status = jest.fn(() => ({ json }));

        const proxy = new ResponseProxy({ status });
        const payload = 'payload';

        await proxy.json(payload);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith(payload);
      });
    });

    describe('error(error)', () => {
      it('Should create log error by current user', () => {
        logger.error = jest.fn();
        jest.spyOn(logger, 'error');

        const error = { name: 'Test error' };
        const json = jest.fn();
        const status = jest.fn(() => ({ json }));
        const proxy = new ResponseProxy({ status }, { user: sandbox.user, t: jest.fn() });

        proxy.error(new Error(error.name));

        expect(logger.error).toBeCalledWith(
          expect.objectContaining({
            description: error.name,
            user: sandbox.user.id,
          })
        );
      });
    });
  });
});
