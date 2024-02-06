import * as HELPERS from '../helpers.js';

describe('Server API', () => {
  describe('Commands', () => {
    describe('Load', () => {
      describe('Models', () => {
        describe('Helpers', () => {
          describe('getAccessible(model, records, sandbox)', () => {
            describe('Model', () => {
              it(`Should return correct data`, async () => {
                const model = 'model';
                const records = [
                  { id: 1, access_script: 'true && true' },
                  { id: 2, access_script: 'false' }
                ];

                const result = HELPERS.getAccessible(model, records, sandbox);
                const expected = [{ id: 1, access_script: 'true' }];

                expect(result).toEqual(expected);
              });
            });

            describe('View', () => {
              it(`Should return correct data`, async () => {
                const model = 'view';
                const records = [
                  { id: 1, condition_script: 'true && true' },
                  { id: 2, condition_script: 'false' }
                ];

                const result = HELPERS.getAccessible(model, records, sandbox);
                const expected = [{ id: 1, condition_script: 'true' }];

                expect(result).toEqual(expected);
              });
            });
          })
        });
      });
    });
  });
});
