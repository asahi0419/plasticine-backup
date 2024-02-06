import sync from '../sync';
import logger from '../../../../business/logger/index.js';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Microservices', () => {
  describe('Background', () => {
    describe('Sync', () => {
      it('Should properly run', async () => {
        jest.spyOn(logger, 'info');
        await sync();
        expect(logger.info).toBeCalledWith('Sync completed');
      });
    });
  });
});
