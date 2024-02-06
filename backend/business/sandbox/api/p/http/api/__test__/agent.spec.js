import http from 'http';
import https from 'https';

import getAgent from '../agent';

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('http', () => {
        describe('Agent', () => {
          it('Should return instance of http.Agent', async () => {
            const agent = getAgent();

            expect(agent).toBeInstanceOf(http.Agent);
          });

          it('Should return instance of https.Agent [setting.https = true]', async () => {
            const options = {};
            const agent = getAgent(options, true);

            expect(agent).toBeInstanceOf(https.Agent);
          });

          it('Should call http.Agent with options', async () => {
            jest.spyOn(http, 'Agent');

            const options = {};
            const agent = getAgent(options);

            expect(http.Agent).toBeCalledWith(options);
          });

          it('Should throw execption if options is not object', async () => {
            const options = '';

            const func = () => getAgent(options);
            expect(func).toThrow();
          });
        });
      });
    });
  });
});
