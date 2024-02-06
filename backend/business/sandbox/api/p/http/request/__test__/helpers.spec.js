import * as HELPERS from '../helpers';

const DEFAULTS = {
  request: jest.fn(),
};

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('http', () => {
        describe('Helpers', () => {
          describe('generalRequest(request, method, url, options)', () => {
            it('Should be properly called [defaults]', async () => {
              const method = 'method';
              const url = 'url';

              jest.spyOn(DEFAULTS, 'request');
              HELPERS.generalRequest(DEFAULTS.request, method, url);
              expect(DEFAULTS.request).toBeCalledWith({ method, url });
            });

            it('Should be properly called [get]', async () => {
              const method = 'get';
              const url = 'url';
              const options = { data: {} };

              jest.spyOn(DEFAULTS, 'request');
              HELPERS.generalRequest(DEFAULTS.request, method, url, options);
              expect(DEFAULTS.request).toBeCalledWith({ method, url, params: {} });
            });

            it('Should be properly called [post]', async () => {
              const method = 'post';
              const url = 'url';
              const options = { data: {} };

              jest.spyOn(DEFAULTS, 'request');
              HELPERS.generalRequest(DEFAULTS.request, method, url, options);
              expect(DEFAULTS.request).toBeCalledWith({ method, url, data: {} });
            });

            it('Should be properly called [put]', async () => {
              const method = 'put';
              const url = 'url';
              const options = { data: {} };

              jest.spyOn(DEFAULTS, 'request');
              HELPERS.generalRequest(DEFAULTS.request, method, url, options);
              expect(DEFAULTS.request).toBeCalledWith({ method, url, data: {} });
            });

            it('Should be properly called [delete]', async () => {
              const method = 'delete';
              const url = 'url';
              const options = { data: {} };

              jest.spyOn(DEFAULTS, 'request');
              HELPERS.generalRequest(DEFAULTS.request, method, url, options);
              expect(DEFAULTS.request).toBeCalledWith({ method, url, data: {} });
            });

            it('Should be able to receive any options', async () => {
              const method = 'method';
              const url = 'url';
              const options = { option1: '', option2: '' };

              jest.spyOn(DEFAULTS, 'request');
              HELPERS.generalRequest(DEFAULTS.request, method, url, options);
              expect(DEFAULTS.request).toBeCalledWith({ method, url, ...options });
            });

            it('Should throw execption if url is not string', async () => {
              const method = 'method';
              const url = [];

              const func = () => HELPERS.generalRequest(DEFAULTS.request, method, url);
              expect(func).toThrow();
            });

            it('Should throw execption if options is not object', async () => {
              const method = 'method';
              const url = '';
              const options = '';

              const func = () => HELPERS.generalRequest(DEFAULTS.request, method, url, options);
              expect(func).toThrow();
            });
          });
        });
      });
    });
  });
});
