import optionsProxy from '../options';

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('currentUser', () => {
        describe('OptionsProxy', () => {
          it('Should have proper attributes', () => {
            expect(optionsProxy.options).toBeDefined();
          });

          describe('getOptions()', () => {
            it('Should return stringified options', () => {
              const result = optionsProxy.getOptions();
              const expected = '{}';

              expect(result).toEqual(expected);
            });
          });

          describe('setOptions(options)', () => {
            it('Should set options object', () => {
              let options = {};
              let result = optionsProxy.setOptions(options);
              let expected = options;

              expect(result.options).toEqual(expected);

              options = '{}';
              result = optionsProxy.setOptions(options);
              expected = {};

              expect(result.options).toEqual(expected);
            });
          });

          describe('getOption(key)', () => {
            it('Should return option key value', () => {
              const key = 'key';

              const result = optionsProxy.getOption(key);
              const expected = optionsProxy.options[key];

              expect(result).toEqual(expected);
            });
          });

          describe('setOption(key, value)', () => {
            it('Should set option key value', () => {
              const key = 'key';
              const value = 'value';

              const result = optionsProxy.setOption(key, value);
              const expected = value;

              expect(result.options[key]).toEqual(expected);
            });
          });
        });
      });
    });
  });
});
