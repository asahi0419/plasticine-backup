import externalNamespace from '../external/index.js';

describe('Sandbox', () => {
  describe('Api', () => {
    describe('External', () => {
      it('Should return correct result', () => {
        const result = externalNamespace(sandbox);

        expect(result.external).toBeDefined();
      });
    });
  });
});
