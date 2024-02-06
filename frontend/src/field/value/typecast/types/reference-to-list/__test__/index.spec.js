import processor from '../';

describe('Field', () => {
  describe('Values', () => {
    describe('typecast processor(field, value, options)', () => {
      describe('Reference to list', () => {
        it('Should return correct result', () => {
          const field = { type: 'reference_to_list' };
          let result, expected, value;

          // from string
          value = 'string';
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = '[]';
          expected = [];
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = '[1]';
          expected = [1];
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = '["1"]';
          expected = [1];
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from number
          value = 1;
          expected = [1];
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from float
          value = 1.1;
          expected = [1];
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from boolean
          value = true;
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = false;
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from array
          value = [];
          expected = [];
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from object
          value = {};
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from date
          value = new Date();
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);
        });
      });
    });
  });
});
