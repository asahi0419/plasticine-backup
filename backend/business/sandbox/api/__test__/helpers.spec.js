import helpersNamespace from '../helpers/index.js';

describe('Sandbox', () => {
  describe('Api', () => {
    describe('Helpers', () => {
      it('Should return correct result', () => {
        const result = helpersNamespace(sandbox);

        expect(result.auth).toBeDefined();
      });
    });
  });
});
