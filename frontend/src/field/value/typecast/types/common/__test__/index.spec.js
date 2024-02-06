import processor from '../';

describe('Field', () => {
  describe('Values', () => {
    describe('typecast processor(field, value, options)', () => {
      describe('Common', () => {
        it('Should return correct result', () => {
          const field = { type: 'string' };
          let result, expected, value;

          // from string
          value = 'string';
          expected = value;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from number
          value = 1;
          expected = value;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from float
          value = 1.1;
          expected = value;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from boolean
          value = true;
          expected = value;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = false;
          expected = value;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from array
          value = [];
          expected = value;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from object
          value = {};
          expected = value;
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
