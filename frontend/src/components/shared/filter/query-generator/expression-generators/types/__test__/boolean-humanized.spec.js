import generator from '../boolean';

let value, result, expected, operator;
const field = { alias: 'field', name: 'Field', type: 'boolean' };
const generate = (operator, value) => generator(field, operator, value, true);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Boolean [humanized]', () => {
      describe('Operators', () => {
        describe('is', () => {
          it('undefined', () => {
            operator = 'is';
            value = undefined;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'is';
            value = null;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'is';
            value = '';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = 'true';
            expected = "`Field = true";
            result = generate(operator, value);
            operator = 'is';
            value = 'test';
            expected = "Field = false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = 'test1,test2';
            expected = "Field = false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = "'test'";
            expected = "Field = false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = "'test1','test2'";
            expected = "Field = false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'is';
            value = 0;
            expected = "Field = false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = 1;
            expected = "Field = true";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'is';
            value = 0.0;
            expected = "Field = false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = 0.1;
            expected = "Field = true";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'is';
            value = true;
            expected = "Field = true";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = false;
            expected = "Field = false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'is';
            value = [];
            expected = "Field = false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = ['test1', 'test2'];
            expected = "Field = true";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'is';
            value = {};
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'is';
            value = new Date();
            expected = "Field = true";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = new Date('test');
            expected = "Field = false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'is';
            value = 'js:';
            expected = "Field = 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field = 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('is not', () => {
          it('undefined', () => {
            operator = 'is_not';
            value = undefined;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'is_not';
            value = null;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'is_not';
            value = '';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = 'true';
            expected = "Field != true";
            result = generate(operator, value);
            operator = 'is_not';
            value = 'test';
            expected = "Field != false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = 'test1,test2';
            expected = "Field != false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = "'test'";
            expected = "Field != false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = "'test1','test2'";
            expected = "Field != false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'is_not';
            value = 0;
            expected = "Field != false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = 1;
            expected = "Field != true";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'is_not';
            value = 0.0;
            expected = "Field != false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = 0.1;
            expected = "Field != true";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'is_not';
            value = true;
            expected = "Field != true";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = false;
            expected = "Field != false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'is_not';
            value = [];
            expected = "Field != false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = ['test1', 'test2'];
            expected = "Field != true";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'is_not';
            value = {};
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'is_not';
            value = new Date();
            expected = "Field != true";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = new Date('test');
            expected = "Field != false";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'is_not';
            value = 'js:';
            expected = "Field != 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field != 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('is empty', () => {
          it('pass', () => {
            operator = 'is_empty';
            expected = "Field is empty";
            result = generate(operator);
            expect(result).toEqual(expected);
          });
        });

        describe('is not empty', () => {
          it('pass', () => {
            operator = 'is_not_empty';
            expected = "Field is not empty";
            result = generate(operator);
            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
