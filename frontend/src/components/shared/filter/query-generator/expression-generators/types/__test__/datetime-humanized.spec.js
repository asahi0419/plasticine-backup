import moment from 'moment';

import generator from '../datetime';
import { DEFAULT_DATE_FORMAT } from '../../../../../../../constants';

let value, result, expected, operator;
const field = { alias: 'field', name: 'Field', type: 'datetime' };
const generate = (operator, value) => generator(field, operator, value, true);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Datetime', () => {
      describe('Operators', () => {
        describe('on', () => {
          it('string', () => {
            operator = 'on';
            value = '';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'on';
            value = 'test';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toBeDefined();
            operator = 'on';
            value = new Date();
            expected = `Field on '${moment(value).format(DEFAULT_DATE_FORMAT)}'`;
          });
          it('js', () => {
            operator = 'on';
            value = 'js:';
            expected = "Field on 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field on 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('between', () => {
          it('pass', () => {
            operator = 'between';
            value = [];
            expected = undefined;
            result = generate(operator, value);
            operator = 'between';
            value = [new Date(), new Date()];
            expected = `Field between '${value[0]}' and on '${value[1]}'`;
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
