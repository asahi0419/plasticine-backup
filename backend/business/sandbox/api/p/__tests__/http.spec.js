import http from '../http';

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('http', () => {
        it('Should have proper attributes', async () => {
          expect(http().get).toBeDefined();
          expect(http().post).toBeDefined();
          expect(http().put).toBeDefined();
          expect(http().delete).toBeDefined();
          expect(http().Agent).toBeDefined();
        });
      });
    });
  });
});
