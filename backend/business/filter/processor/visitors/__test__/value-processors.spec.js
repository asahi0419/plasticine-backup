import processValue from '../value-processors.js';
import * as processor from '../value-processors/types/common.js';

describe('Filter', () => {
  describe('Processor', () => {
    describe('Visitors', () => {
      describe('processValue', () => {
        it('[Filter] Should return processed value', async () => {
          const field = { type: 'filter' };
          const operator = '=';
          const value = 'test';
          const context = {};

          processor.default = jest.fn();

          await processValue(field, operator, value, context);

          expect(processor.default).toBeCalledWith(field, operator, value, context);
        });
      });
    });
  });
});
