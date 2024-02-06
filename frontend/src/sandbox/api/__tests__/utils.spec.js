import utilsNamespace from '../utils';

const utils = utilsNamespace();

describe('API: utils', () => {

  describe('utils.parameterizeString', () => {
    const value = 'Somme value with    special chars (!@#$%^&*(),.) tESt';
    const blackList = ['somme_value_with_special_chars_test', 'somme_value_with_special_chars_test_1'];

    it('Should generate parameterized value', () => {
      expect(utils.parameterizeString(value)).toEqual('somme_value_with_special_chars_test');
    });

    it('Should generate parameterized value using blackList', () => {
      expect(utils.parameterizeString(value, { blackList })).toEqual('somme_value_with_special_chars_test_2');
    });

    it('Should generate parameterized value with limited length', () => {
      expect(utils.parameterizeString(value, { length: 11 })).toEqual('somme_value');
    });
  });
});
