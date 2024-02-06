import processor from '../';

describe('Field', () => {
  describe('Values', () => {
    describe('typecast processor(field, value, options)', () => {
      describe('Boolean', () => {
        it('Should return correct result', () => {
          const field = { type: 'integer' };
          let result, expected, value;

          // from string
          value = 'true';
          expected = true;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = 'false';
          expected = false;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = 'string';
          expected = false;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from integer
          value = 1;
          expected = true;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = 0;
          expected = false;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from float
          value = 1.1;
          expected = true;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = 0.0;
          expected = false;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from boolean
          value = true;
          expected = true;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = false;
          expected = false;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from array
          value = [];
          expected = false;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = [ undefined ];
          expected = false;
          result = processor(field, value);
          value = [1];
          expected = true;
          result = processor(field, value);

          // from object
          value = {};
          expected = undefined;
          result = processor(field, value);
          expect(result).toEqual(expected);

          // from date
          value = new Date();
          expected = true;
          result = processor(field, value);
          expect(result).toEqual(expected);
          value = new Date('string');
          expected = false;
          result = processor(field, value);
          expect(result).toEqual(expected);
        });
      });
    });
  });
});
