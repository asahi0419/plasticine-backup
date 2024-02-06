import pNamespace from '../p/index.js';

describe('Sandbox', () => {
  describe('Api', () => {
    describe('P', () => {
      it('Should return correct result', () => {
        const result = pNamespace(sandbox);

        expect(result.client).toBeDefined();
        expect(result.globalStore).toBeDefined();
        expect(result.encryptor).toBeDefined();
        expect(result.currentUser).toBeDefined();
        expect(result.response).toBeDefined();
        expect(result.actions).toBeDefined();
        expect(result.cache).toBeDefined();
        expect(result.log).toBeDefined();
        expect(result.ws).toBeDefined();
        expect(result.http).toBeDefined();
        expect(result.service).toBeDefined();
        expect(result.internalVariables).toBeDefined();
        expect(result.getSetting).toBeDefined();
        expect(result.getRequest).toBeDefined();
        expect(result.getScope).toBeDefined();
        expect(result.getUserObject).toBeDefined();
        expect(result.authUser).toBeDefined();
        expect(result.generateAuthToken).toBeDefined();
        expect(result.getModel).toBeDefined();
        expect(result.sendMail).toBeDefined();
        expect(result.iterEach).toBeDefined();
        expect(result.iterMap).toBeDefined();
        expect(result.iterFeed).toBeDefined();
        expect(result.translate).toBeDefined();
        expect(result.timeout).toBeDefined();
      });
    });
  });
});
