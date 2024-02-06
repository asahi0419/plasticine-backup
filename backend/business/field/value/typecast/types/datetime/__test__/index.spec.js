import processor from '../index.js';

describe('Field', () => {
  describe('Values', () => {
    describe('typecast processor(field, value, options)', () => {
      describe('Datetime', () => {
        it('Should return correct result', () => {
          const field = { type: 'datetime' };
          let result, expected, value;

          // from string
          value = 'string';
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from number
          value = 1;
          expected = new Date(value);
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from float
          value = 1.1;
          expected = new Date(value);
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
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from object
          value = {};
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from date
          value = new Date();
          expected = value;
          result = processor(field, value);
          expect(result).toEqual(expected);
        });
      });
    });
  });
});
