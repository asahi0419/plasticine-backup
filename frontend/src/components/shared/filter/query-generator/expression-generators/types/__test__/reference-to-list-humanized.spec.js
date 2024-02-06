import generator from '../reference-to-list';

let value, result, expected, operator;
const field = { alias: 'field', name: 'Field', type: 'reference_to_list' };
const generate = (operator, value) => generator(field, operator, value, true);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Reference to list [humanized]', () => {
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
            operator = 'is';
            value = '1';
            expected = "Field = '1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = '1,2';
            expected = "Field = '1, 2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'is';
            value = [];
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = [1, 2];
            expected = "Field = '1, 2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'is';
            value = 'js:';
            expected = "Field = 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "Field = 'js:[1]'";
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
            value = '1';
            expected = "Field != '1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = '1,2';
            expected = "Field != '1, 2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'is_not';
            value = [];
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = [1, 2];
            expected = "Field != '1, 2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'is_not';
            value = 'js:';
            expected = "Field != 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "Field != 'js:[1]'";
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

        describe('contains one of', () => {
          it('undefined', () => {
            operator = 'contains_one_of';
            value = undefined;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'contains_one_of';
            value = null;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'contains_one_of';
            value = '';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains_one_of';
            value = '1';
            expected = "Field contains one of ('1')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains_one_of';
            value = '1,2';
            expected = "Field contains one of ('1', '2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'contains_one_of';
            value = [];
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains_one_of';
            value = [1, 2];
            expected = "Field contains one of ('1', '2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'contains_one_of';
            value = 'js:';
            expected = "Field contains one of 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "Field contains one of 'js:[1]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('contains', () => {
          it('undefined', () => {
            operator = 'in_having';
            value = undefined;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'in_having';
            value = null;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'in_having';
            value = '';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in_having';
            value = '1';
            expected = "Field contains ('1')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in_having';
            value = '1,2';
            expected = "Field contains ('1', '2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'in_having';
            value = [];
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in_having';
            value = [1, 2];
            expected = "Field contains ('1', '2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'in_having';
            value = 'js:';
            expected = "Field contains 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "Field contains 'js:[1]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('does_not_contain', () => {
          it('undefined', () => {
            operator = 'not_in_having';
            value = undefined;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'not_in_having';
            value = null;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'not_in_having';
            value = '';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in_having';
            value = '1';
            expected = "Field does not contain ('1')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in_having';
            value = '1,2';
            expected = "Field does not contain ('1', '2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'not_in_having';
            value = [];
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in_having';
            value = [1, 2];
            expected = "Field does not contain ('1', '2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'not_in_having';
            value = 'js:';
            expected = "Field does not contain 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "Field does not contain 'js:[1]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('in (strict)', () => {
          it('undefined', () => {
            operator = 'in_strict';
            value = undefined;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'in_strict';
            value = null;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'in_strict';
            value = '';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in_strict';
            value = '1';
            expected = "Field in (strict) ('1')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in_strict';
            value = '1,2';
            expected = "Field in (strict) ('1', '2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'in_strict';
            value = [];
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in_strict';
            value = [1, 2];
            expected = "Field in (strict) ('1', '2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'in_strict';
            value = 'js:';
            expected = "Field in (strict) 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "Field in (strict) 'js:[1]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('not in (strict)', () => {
          it('undefined', () => {
            operator = 'not_in_strict';
            value = undefined;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'not_in_strict';
            value = null;
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'not_in_strict';
            value = '';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in_strict';
            value = '1';
            expected = "Field not in (strict) ('1')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in_strict';
            value = '1,2';
            expected = "Field not in (strict) ('1', '2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'not_in_strict';
            value = [];
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in_strict';
            value = [1, 2];
            expected = "Field not in (strict) ('1', '2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'not_in_strict';
            value = 'js:';
            expected = "Field not in (strict) 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "Field not in (strict) 'js:[1]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
