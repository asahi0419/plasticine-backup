import generator from '../string';

let value, result, expected, operator;
const field = { alias: 'field', name: 'Field', type: 'string' };
const generate = (operator, value) => generator(field, operator, value, true);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('String [humanized]', () => {
      describe('Operators', () => {
        describe('is', () => {
          it('undefined', () => {
            operator = 'is';
            value = undefined;
            expected = "Field = ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'is';
            value = null;
            expected = "Field = ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'is';
            value = '';
            expected = "Field = ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = 'test';
            expected = "Field = 'test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = 'test1,test2';
            expected = "Field = 'test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = "'test'";
            expected = "Field = \"'test'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = "'test1','test2'";
            expected = "Field = \"'test1','test2'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'is';
            value = 0;
            expected = "Field = '0'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'is';
            value = 0.1;
            expected = "Field = '0.1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'is';
            value = true;
            expected = "Field = 'true'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = false;
            expected = "Field = 'false'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'is';
            value = [];
            expected = "Field = '[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = ['test1', 'test2'];
            expected = "Field = '[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'is';
            value = {};
            expected = "Field = '{}'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'is';
            value = new Date();
            expected = "Field = " + `'${value}'`;
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
            expected = "Field != ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'is_not';
            value = null;
            expected = "Field != ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'is_not';
            value = '';
            expected = "Field != ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = 'test';
            expected = "Field != 'test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = 'test1,test2';
            expected = "Field != 'test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = "'test'";
            expected = "Field != \"'test'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = "'test1','test2'";
            expected = "Field != \"'test1','test2'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'is_not';
            value = 0;
            expected = "Field != '0'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'is_not';
            value = 0.1;
            expected = "Field != '0.1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'is_not';
            value = true;
            expected = "Field != 'true'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is_not';
            value = false;
            expected = "Field != 'false'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'is_not';
            value = [];
            expected = "Field != '[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = ['test1', 'test2'];
            expected = "Field != '[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'is_not';
            value = {};
            expected = "Field != '{}'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'is_not';
            value = new Date();
            expected = "Field != " + `'${value}'`;
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

        describe('in', () => {
          it('undefined', () => {
            operator = 'in';
            value = undefined;
            expected = "Field in ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'in';
            value = null;
            expected = "Field in ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'in';
            value = '';
            expected = "Field in ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = 'test';
            expected = "Field in ('test')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = 'test1,test2';
            expected = "Field in ('test1','test2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = "'test'";
            expected = "Field in (\"'test'\")";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = "'test1','test2'";
            expected = "Field in (\"'test1'\",\"'test2'\")";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'in';
            value = 0;
            expected = "Field in ('0')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'in';
            value = 0.1;
            expected = "Field in ('0.1')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'in';
            value = true;
            expected = "Field in ('true')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = false;
            expected = "Field in ('false')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'in';
            value = [];
            expected = "Field in ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = ['test1', 'test2'];
            expected = "Field in ('test1','test2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'in';
            value = {};
            expected = "Field in ('{}')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'in';
            value = new Date();
            expected = "Field in " + `('${value}')`;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'in';
            value = 'js:';
            expected = "Field in 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field in 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:["value1","value2"]';
            expected = "Field in 'js:[\"value1\",\"value2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('not in', () => {
          it('undefined', () => {
            operator = 'not_in';
            value = undefined;
            expected = "Field not in ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'not_in';
            value = null;
            expected = "Field not in ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'not_in';
            value = '';
            expected = "Field not in ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in';
            value = 'test';
            expected = "Field not in ('test')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in';
            value = 'test1,test2';
            expected = "Field not in ('test1','test2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in';
            value = "'test'";
            expected = "Field not in (\"'test'\")";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in';
            value = "'test1','test2'";
            expected = "Field not in (\"'test1'\",\"'test2'\")";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'not_in';
            value = 0;
            expected = "Field not in ('0')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'not_in';
            value = 0.1;
            expected = "Field not in ('0.1')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'not_in';
            value = true;
            expected = "Field not in ('true')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in';
            value = false;
            expected = "Field not in ('false')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'not_in';
            value = [];
            expected = "Field not in ('')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'not_in';
            value = ['test1', 'test2'];
            expected = "Field not in ('test1','test2')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'not_in';
            value = {};
            expected = "Field not in ('{}')";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'not_in';
            value = new Date();
            expected = "Field not in " + `('${value}')`;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'not_in';
            value = 'js:';
            expected = "Field not in 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field not in 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:["value1","value2"]';
            expected = "Field not in 'js:[\"value1\",\"value2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('starts with', () => {
          it('undefined', () => {
            operator = 'starts_with';
            value = undefined;
            expected = "Field starts with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'starts_with';
            value = null;
            expected = "Field starts with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'starts_with';
            value = '';
            expected = "Field starts with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'starts_with';
            value = 'test';
            expected = "Field starts with 'test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'starts_with';
            value = 'test1,test2';
            expected = "Field starts with 'test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'starts_with';
            value = "'test'";
            expected = "Field starts with \"'test'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'starts_with';
            value = "'test1','test2'";
            expected = "Field starts with \"'test1','test2'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'starts_with';
            value = 0;
            expected = "Field starts with '0'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'starts_with';
            value = 0.1;
            expected = "Field starts with '0.1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'starts_with';
            value = true;
            expected = "Field starts with 'true'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = false;
            expected = "Field starts with 'false'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'starts_with';
            value = [];
            expected = "Field starts with '[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'starts_with';
            value = ['test1', 'test2'];
            expected = "Field starts with '[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'starts_with';
            value = {};
            expected = "Field starts with '{}'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'starts_with';
            value = new Date();
            expected = "Field starts with " + `'${value}'`;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'starts_with';
            value = 'js:';
            expected = "Field starts with 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field starts with 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('does not start with', () => {
          it('undefined', () => {
            operator = 'does_not_start_with';
            value = undefined;
            expected = "Field does not start with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'does_not_start_with';
            value = null;
            expected = "Field does not start with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'does_not_start_with';
            value = '';
            expected = "Field does not start with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_start_with';
            value = 'test';
            expected = "Field does not start with 'test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_start_with';
            value = 'test1,test2';
            expected = "Field does not start with 'test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_start_with';
            value = "'test'";
            expected = "Field does not start with \"'test'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_start_with';
            value = "'test1','test2'";
            expected = "Field does not start with \"'test1','test2'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'does_not_start_with';
            value = 0;
            expected = "Field does not start with '0'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'does_not_start_with';
            value = 0.1;
            expected = "Field does not start with '0.1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'does_not_start_with';
            value = true;
            expected = "Field does not start with 'true'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = false;
            expected = "Field does not start with 'false'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'does_not_start_with';
            value = [];
            expected = "Field does not start with '[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_start_with';
            value = ['test1', 'test2'];
            expected = "Field does not start with '[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'does_not_start_with';
            value = {};
            expected = "Field does not start with '{}'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'does_not_start_with';
            value = new Date();
            expected = "Field does not start with " + `'${value}'`;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'does_not_start_with';
            value = 'js:';
            expected = "Field does not start with 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field does not start with 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('ends with', () => {
          it('undefined', () => {
            operator = 'ends_with';
            value = undefined;
            expected = "Field ends with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'ends_with';
            value = null;
            expected = "Field ends with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'ends_with';
            value = '';
            expected = "Field ends with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'ends_with';
            value = 'test';
            expected = "Field ends with 'test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'ends_with';
            value = 'test1,test2';
            expected = "Field ends with 'test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'ends_with';
            value = "'test'";
            expected = "Field ends with \"'test'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'ends_with';
            value = "'test1','test2'";
            expected = "Field ends with \"'test1','test2'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'ends_with';
            value = 0;
            expected = "Field ends with '0'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'ends_with';
            value = 0.1;
            expected = "Field ends with '0.1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'ends_with';
            value = true;
            expected = "Field ends with 'true'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = false;
            expected = "Field ends with 'false'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'ends_with';
            value = [];
            expected = "Field ends with '[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'ends_with';
            value = ['test1', 'test2'];
            expected = "Field ends with '[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'ends_with';
            value = {};
            expected = "Field ends with '{}'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'ends_with';
            value = new Date();
            expected = "Field ends with " + `'${value}'`;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'ends_with';
            value = 'js:';
            expected = "Field ends with 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field ends with 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('does not end with', () => {
          it('undefined', () => {
            operator = 'does_not_end_with';
            value = undefined;
            expected = "Field does not end with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'does_not_end_with';
            value = null;
            expected = "Field does not end with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'does_not_end_with';
            value = '';
            expected = "Field does not end with ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_end_with';
            value = 'test';
            expected = "Field does not end with 'test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_end_with';
            value = 'test1,test2';
            expected = "Field does not end with 'test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_end_with';
            value = "'test'";
            expected = "Field does not end with \"'test'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_end_with';
            value = "'test1','test2'";
            expected = "Field does not end with \"'test1','test2'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'does_not_end_with';
            value = 0;
            expected = "Field does not end with '0'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'does_not_end_with';
            value = 0.1;
            expected = "Field does not end with '0.1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'does_not_end_with';
            value = true;
            expected = "Field does not end with 'true'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = false;
            expected = "Field does not end with 'false'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'does_not_end_with';
            value = [];
            expected = "Field does not end with '[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_end_with';
            value = ['test1', 'test2'];
            expected = "Field does not end with '[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'does_not_end_with';
            value = {};
            expected = "Field does not end with '{}'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'does_not_end_with';
            value = new Date();
            expected = "Field does not end with " + `'${value}'`;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'does_not_end_with';
            value = 'js:';
            expected = "Field does not end with 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field does not end with 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('contains', () => {
          it('undefined', () => {
            operator = 'contains';
            value = undefined;
            expected = "Field contains ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'contains';
            value = null;
            expected = "Field contains ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'contains';
            value = '';
            expected = "Field contains ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains';
            value = 'test';
            expected = "Field contains 'test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains';
            value = 'test1,test2';
            expected = "Field contains 'test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains';
            value = "'test'";
            expected = "Field contains \"'test'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains';
            value = "'test1','test2'";
            expected = "Field contains \"'test1','test2'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'contains';
            value = 0;
            expected = "Field contains '0'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'contains';
            value = 0.1;
            expected = "Field contains '0.1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'contains';
            value = true;
            expected = "Field contains 'true'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = false;
            expected = "Field contains 'false'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'contains';
            value = [];
            expected = "Field contains '[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'contains';
            value = ['test1', 'test2'];
            expected = "Field contains '[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'contains';
            value = {};
            expected = "Field contains '{}'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'contains';
            value = new Date();
            expected = "Field contains " + `'${value}'`;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'contains';
            value = 'js:';
            expected = "Field contains 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field contains 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('does not contain', () => {
          it('undefined', () => {
            operator = 'does_not_contain';
            value = undefined;
            expected = "Field does not contain ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('null', () => {
            operator = 'does_not_contain';
            value = null;
            expected = "Field does not contain ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('string', () => {
            operator = 'does_not_contain';
            value = '';
            expected = "Field does not contain ''";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_contain';
            value = 'test';
            expected = "Field does not contain 'test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_contain';
            value = 'test1,test2';
            expected = "Field does not contain 'test1,test2'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_contain';
            value = "'test'";
            expected = "Field does not contain \"'test'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_contain';
            value = "'test1','test2'";
            expected = "Field does not contain \"'test1','test2'\"";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('number', () => {
            operator = 'does_not_contain';
            value = 0;
            expected = "Field does not contain '0'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('float', () => {
            operator = 'does_not_contain';
            value = 0.1;
            expected = "Field does not contain '0.1'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('boolean', () => {
            operator = 'does_not_contain';
            value = true;
            expected = "Field does not contain 'true'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = false;
            expected = "Field does not contain 'false'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('array', () => {
            operator = 'does_not_contain';
            value = [];
            expected = "Field does not contain '[]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'does_not_contain';
            value = ['test1', 'test2'];
            expected = "Field does not contain '[\"test1\",\"test2\"]'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'does_not_contain';
            value = {};
            expected = "Field does not contain '{}'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('date', () => {
            operator = 'does_not_contain';
            value = new Date();
            expected = "Field does not contain " + `'${value}'`;
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'does_not_contain';
            value = 'js:';
            expected = "Field does not contain 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field does not contain 'js:\"value\"'";
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
            let expected = "Field contains '\\sq''";
            expect(result).toEqual(expected);
          });
        });

        describe('starts with', () => {
          it('Should escape slash and quotation mark', () => {
            const operator = 'starts_with';

            let value = '\\sq';
            let result = generate(operator, value);
            let expected = "Field starts with '\\sq'";
            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
