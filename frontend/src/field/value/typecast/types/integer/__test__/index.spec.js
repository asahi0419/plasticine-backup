import processor from '../';

describe('Field', () => {
  describe('Values', () => {
    describe('typecast processor(field, value, options)', () => {
      describe('Integer', () => {
        it('Should return correct result', () => {
          const field = { type: 'integer' };
          let result, expected, value;

          // from string
          value = '1';
          expected = 1;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = 'string';
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = '1string';
          expected = 1;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = 'string1';
          expected = 1;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = 'string1string';
          expected = 1;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = '-1';
          expected = -1;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = 'string';
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = '-1string';
          expected = -1;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = 'string-1';
          expected = -1;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = 'string-1string';
          expected = -1;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from integer
          value = 1;
          expected = 1;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from float
          value = 1.1;
          expected = 1;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from boolean
          value = true;
          expected = 1;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = false;
          expected = 0;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from array
          value = [];
          expected = 0;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = [1];
          expected = 1;
          result = processor(field, value);
          value = [1, 2];
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = ['1'];
          expected = 1;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = ['1', '2'];
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
          expected = +value;
          result = processor(field, value);
          expect(result).toEqual(expected);
        });
      });
    });
  });
});
