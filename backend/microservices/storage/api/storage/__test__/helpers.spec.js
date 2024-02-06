import * as HELPERS from '../helpers.js';

describe('Microservice', () => {
  describe('Storage', () => {
    describe('Api', () => {
      describe('Storage', () => {
        describe('Helpers', () => {
          describe('checkFileFormat(fileName, sandbox)', () => {
            it('Should correctly run', async () => {
              let result;

              result = await HELPERS.checkFileFormat('file.pdf', sandbox);
              expect(result).not.toBeDefined();

              result = HELPERS.checkFileFormat('file.exe', sandbox);
              await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError' });
            });
          });
        });
      });
    });
  });
});
