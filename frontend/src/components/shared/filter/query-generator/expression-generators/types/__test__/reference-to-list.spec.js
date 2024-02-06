import generator from '../reference-to-list';

let value, result, expected, operator;
const field = { alias: 'field', name: 'Field', type: 'reference_to_list' };
const generate = (operator, value) => generator(field, operator, value);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Reference to list', () => {
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
            expected = "`field` = '1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = '1,2';
            expected = "`field` = '1,2'";
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
            expected = "`field` = '1,2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'is';
            value = 'js:';
            expected = "`field` = 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "`field` = 'js:[1]'";
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
            expected = "`field` != '1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = '1,2';
            expected = "`field` != '1,2'";
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
            expected = "`field` != '1,2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'is_not';
            value = 'js:';
            expected = "`field` != 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "`field` != 'js:[1]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('is empty', () => {
          it('pass', () => {
            operator = 'is_empty';
            expected = "`field` IS NULL";
            result = generate(operator);
            expect(result).toEqual(expected);
          });
        });

        describe('is not empty', () => {
          it('pass', () => {
            operator = 'is_not_empty';
            expected = "`field` IS NOT NULL";
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
            expected = "`field` IN (1)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains_one_of';
            value = '1,2';
            expected = "`field` IN (1,2)";
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
            expected = "`field` IN (1,2)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'contains_one_of';
            value = 'js:';
            expected = "`field` IN 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "`field` IN 'js:[1]'";
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
            expected = "`__having__field` IN (1)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in_having';
            value = '1,2';
            expected = "`__having__field` IN (1,2)";
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
            expected = "`__having__field` IN (1,2)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'in_having';
            value = 'js:';
            expected = "`__having__field` IN 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "`__having__field` IN 'js:[1]'";
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
            expected = "`__having__field` NOT IN (1)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in_having';
            value = '1,2';
            expected = "`__having__field` NOT IN (1,2)";
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
            expected = "`__having__field` NOT IN (1,2)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'not_in_having';
            value = 'js:';
            expected = "`__having__field` NOT IN 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "`__having__field` NOT IN 'js:[1]'";
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
            expected = "`__strict__field` IN (1)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in_strict';
            value = '1,2';
            expected = "`__strict__field` IN (1,2)";
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
            expected = "`__strict__field` IN (1,2)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'in_strict';
            value = 'js:';
            expected = "`__strict__field` IN 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "`__strict__field` IN 'js:[1]'";
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
            expected = "`__strict__field` NOT IN (1)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in_strict';
            value = '1,2';
            expected = "`__strict__field` NOT IN (1,2)";
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
            expected = "`__strict__field` NOT IN (1,2)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'not_in_strict';
            value = 'js:';
            expected = "`__strict__field` NOT IN 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:[1]';
            expected = "`__strict__field` NOT IN 'js:[1]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
