import ERRORS from '../../../../../error/index.js';
import { SCRIPT_ERRORS_MAP, getErrorWrapper } from '../helpers';

describe('p.response', () => {
  describe('Helpers', () => {
    describe('getErrorWrapper(error, type)', () => {
      it('Should return wrapper by error name', () => {
        const error = { name: 'RecordNotFoundError' };

        const result = getErrorWrapper(error);
        const expected = ERRORS[error.name];

        expect(result).toEqual(expected);
      });

      it('Should return wrapper by error type if error with name not found', () => {
        const error = { name: '' };
        const type = 'db_rule';

        const result = getErrorWrapper(error, type);
        const expected = SCRIPT_ERRORS_MAP[type];

        expect(result).toEqual(expected);
      });
    });
  });
});
