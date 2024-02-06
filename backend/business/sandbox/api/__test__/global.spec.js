import globalNamespace from '../global/index.js';

describe('Sandbox', () => {
  describe('Api', () => {
    describe('Global', () => {
      it('Should return correct result', () => {
        let result;

        const prevContext = { fn: function () { return this } };
        const nextContext = { fn: function () { return this }, vr: 'vr' };

        result = Object.assign({}, prevContext, globalNamespace(prevContext));
        expect(result.fn().fn).toBeDefined();
        expect(result.fn().vr).not.toBeDefined();

        result = Object.assign({}, nextContext, globalNamespace(prevContext, nextContext));
        expect(result.fn().fn).toBeDefined();
        expect(result.fn().vr).toBeDefined();
      });
    });
  });
});
