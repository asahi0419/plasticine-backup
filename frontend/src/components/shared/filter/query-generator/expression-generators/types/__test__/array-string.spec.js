import generator from '../array-string';

let value, result, expected, operator;
const field = { alias: 'field', name: 'Field', type: 'array_string' };
const generate = (operator, value) => generator(field, operator, value);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Array (string)', () => {
      describe('Operators', () => {
        describe('is', () => {
          it('undefined', () => {
            operator = 'is';
            value = undefined;
            expected = "`field` = ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'is';
            value = null;
            expected = "`field` = ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'is';
            value = '';
            expected = "`field` = ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = 'test';
            expected = "`field` = 'test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = 'test1,test2';
            expected = "`field` = 'test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = "'test'";
            expected = "`field` = '\\'test\\''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = "'test1','test2'";
            expected = "`field` = '\\'test1\\',\\'test2\\''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'is';
            value = [];
            expected = "`field` = '[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = ['test1', 'test2'];
            expected = "`field` = '[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'is';
            value = 'js:';
            expected = "`field` = 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` = 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('is not', () => {
          it('undefined', () => {
            operator = 'is_not';
            value = undefined;
            expected = "`field` != ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'is_not';
            value = null;
            expected = "`field` != ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'is_not';
            value = '';
            expected = "`field` != ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = 'test';
            expected = "`field` != 'test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = 'test1,test2';
            expected = "`field` != 'test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = "'test'";
            expected = "`field` != '\\'test\\''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = "'test1','test2'";
            expected = "`field` != '\\'test1\\',\\'test2\\''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'is_not';
            value = [];
            expected = "`field` != '[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = ['test1', 'test2'];
            expected = "`field` != '[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'is_not';
            value = 'js:';
            expected = "`field` != 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` != 'js:\"value\"'";
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

        describe('in', () => {
          it('undefined', () => {
            operator = 'in';
            value = undefined;
            expected = "`field` IN ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'in';
            value = null;
            expected = "`field` IN ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'in';
            value = '';
            expected = "`field` IN ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = 'test';
            expected = "`field` IN ('test')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = 'test1,test2';
            expected = "`field` IN ('test1','test2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = "'test'";
            expected = "`field` IN ('\\'test\\'')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = "'test1','test2'";
            expected = "`field` IN ('\\'test1\\'','\\'test2\\'')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'in';
            value = [];
            expected = "`field` IN ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = ['test1', 'test2'];
            expected = "`field` IN ('test1','test2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'in';
            value = 'js:';
            expected = "`field` IN 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` IN 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('not in', () => {
          it('undefined', () => {
            operator = 'not_in';
            value = undefined;
            expected = "`field` NOT IN ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'not_in';
            value = null;
            expected = "`field` NOT IN ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'not_in';
            value = '';
            expected = "`field` NOT IN ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in';
            value = 'test';
            expected = "`field` NOT IN ('test')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in';
            value = 'test1,test2';
            expected = "`field` NOT IN ('test1','test2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in';
            value = "'test'";
            expected = "`field` NOT IN ('\\'test\\'')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in';
            value = "'test1','test2'";
            expected = "`field` NOT IN ('\\'test1\\'','\\'test2\\'')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'not_in';
            value = [];
            expected = "`field` NOT IN ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in';
            value = ['test1', 'test2'];
            expected = "`field` NOT IN ('test1','test2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'not_in';
            value = 'js:';
            expected = "`field` NOT IN 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` NOT IN 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('starts with', () => {
          it('undefined', () => {
            operator = 'starts_with';
            value = undefined;
            expected = "`field` LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'starts_with';
            value = null;
            expected = "`field` LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'starts_with';
            value = '';
            expected = "`field` LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'starts_with';
            value = 'test';
            expected = "`field` LIKE 'test%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'starts_with';
            value = 'test1,test2';
            expected = "`field` LIKE 'test1,test2%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'starts_with';
            value = "'test'";
            expected = "`field` LIKE '\\'test\\'%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'starts_with';
            value = "'test1','test2'";
            expected = "`field` LIKE '\\'test1\\',\\'test2\\'%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'starts_with';
            value = [];
            expected = "`field` LIKE '[]%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'starts_with';
            value = ['test1', 'test2'];
            expected = "`field` LIKE '[\"test1\",\"test2\"]%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'starts_with';
            value = 'js:';
            expected = "`field` LIKE 'js:%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` LIKE 'js:\"value\"%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('does not start with', () => {
          it('undefined', () => {
            operator = 'does_not_start_with';
            value = undefined;
            expected = "`field` NOT LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'does_not_start_with';
            value = null;
            expected = "`field` NOT LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'does_not_start_with';
            value = '';
            expected = "`field` NOT LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_start_with';
            value = 'test';
            expected = "`field` NOT LIKE 'test%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_start_with';
            value = 'test1,test2';
            expected = "`field` NOT LIKE 'test1,test2%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_start_with';
            value = "'test'";
            expected = "`field` NOT LIKE '\\'test\\'%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_start_with';
            value = "'test1','test2'";
            expected = "`field` NOT LIKE '\\'test1\\',\\'test2\\'%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'does_not_start_with';
            value = [];
            expected = "`field` NOT LIKE '[]%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_start_with';
            value = ['test1', 'test2'];
            expected = "`field` NOT LIKE '[\"test1\",\"test2\"]%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'does_not_start_with';
            value = 'js:';
            expected = "`field` NOT LIKE 'js:%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` NOT LIKE 'js:\"value\"%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('ends with', () => {
          it('undefined', () => {
            operator = 'ends_with';
            value = undefined;
            expected = "`field` LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'ends_with';
            value = null;
            expected = "`field` LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'ends_with';
            value = '';
            expected = "`field` LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'ends_with';
            value = 'test';
            expected = "`field` LIKE '%test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'ends_with';
            value = 'test1,test2';
            expected = "`field` LIKE '%test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'ends_with';
            value = "'test'";
            expected = "`field` LIKE '%\\'test\\''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'ends_with';
            value = "'test1','test2'";
            expected = "`field` LIKE '%\\'test1\\',\\'test2\\''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'ends_with';
            value = [];
            expected = "`field` LIKE '%[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'ends_with';
            value = ['test1', 'test2'];
            expected = "`field` LIKE '%[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'ends_with';
            value = 'js:';
            expected = "`field` LIKE '%js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` LIKE '%js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('does not end with', () => {
          it('undefined', () => {
            operator = 'does_not_end_with';
            value = undefined;
            expected = "`field` NOT LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'does_not_end_with';
            value = null;
            expected = "`field` NOT LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'does_not_end_with';
            value = '';
            expected = "`field` NOT LIKE '%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_end_with';
            value = 'test';
            expected = "`field` NOT LIKE '%test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_end_with';
            value = 'test1,test2';
            expected = "`field` NOT LIKE '%test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_end_with';
            value = "'test'";
            expected = "`field` NOT LIKE '%\\'test\\''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_end_with';
            value = "'test1','test2'";
            expected = "`field` NOT LIKE '%\\'test1\\',\\'test2\\''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'does_not_end_with';
            value = [];
            expected = "`field` NOT LIKE '%[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_end_with';
            value = ['test1', 'test2'];
            expected = "`field` NOT LIKE '%[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'does_not_end_with';
            value = 'js:';
            expected = "`field` NOT LIKE '%js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` NOT LIKE '%js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('contains', () => {
          it('undefined', () => {
            operator = 'contains';
            value = undefined;
            expected = "`field` LIKE '%%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'contains';
            value = null;
            expected = "`field` LIKE '%%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'contains';
            value = '';
            expected = "`field` LIKE '%%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains';
            value = 'test';
            expected = "`field` LIKE '%test%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains';
            value = 'test1,test2';
            expected = "`field` LIKE '%test1,test2%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains';
            value = "'test'";
            expected = "`field` LIKE '%\\'test\\'%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains';
            value = "'test1','test2'";
            expected = "`field` LIKE '%\\'test1\\',\\'test2\\'%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'contains';
            value = [];
            expected = "`field` LIKE '%[]%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains';
            value = ['test1', 'test2'];
            expected = "`field` LIKE '%[\"test1\",\"test2\"]%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'contains';
            value = 'js:';
            expected = "`field` LIKE '%js:%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` LIKE '%js:\"value\"%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('does not contain', () => {
          it('undefined', () => {
            operator = 'does_not_contain';
            value = undefined;
            expected = "`field` NOT LIKE '%%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'does_not_contain';
            value = null;
            expected = "`field` NOT LIKE '%%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'does_not_contain';
            value = '';
            expected = "`field` NOT LIKE '%%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_contain';
            value = 'test';
            expected = "`field` NOT LIKE '%test%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_contain';
            value = 'test1,test2';
            expected = "`field` NOT LIKE '%test1,test2%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_contain';
            value = "'test'";
            expected = "`field` NOT LIKE '%\\'test\\'%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_contain';
            value = "'test1','test2'";
            expected = "`field` NOT LIKE '%\\'test1\\',\\'test2\\'%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'does_not_contain';
            value = [];
            expected = "`field` NOT LIKE '%[]%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_contain';
            value = ['test1', 'test2'];
            expected = "`field` NOT LIKE '%[\"test1\",\"test2\"]%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'does_not_contain';
            value = 'js:';
            expected = "`field` NOT LIKE '%js:%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` NOT LIKE '%js:\"value\"%'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });
      });

      describe('Common cases', () => {
        describe('contains', () => {
          it('Should escape slash and quotation mark', () => {
            const operator = 'contains';

            let value = '\\sq\'';
            let result = generate(operator, value);
            let expected = "`field` LIKE '%\\\\sq\\'%'";
            expect(result).toEqual(expected);
          });
        });

        describe('starts with', () => {
          it('Should escape slash and quotation mark', () => {
            const operator = 'starts_with';

            let value = '\\sq';
            let result = generate(operator, value);
            let expected = "`field` LIKE '\\\\sq%'";
            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
