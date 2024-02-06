import { loadPackets } from '../index.js';

describe('Server API', () => {
  describe('Commands', () => {
    describe('Init', () => {
      describe('loadPackets(req, authenticated)', () => {
        it('Should return packet object for authenticated user', async () => {
          const req = { sandbox, i18n: { store: { data: {} } } };
          const authenticated = true;
          const errors = [];

          const result = await loadPackets(req, authenticated, errors);
          const expected = {};

          expect(result.translations).toBeDefined();
          expect(result.settings).toBeDefined();
          expect(result.pages).toBeDefined();
          expect(result.components).not.toBeDefined();
          expect(result.errors).not.toBeDefined();
        });

        it('Should return packet object for non authenticated user', async () => {
          sandbox.vm.p.currentUser.user.email = 'guest@free.man';
          const req = { sandbox, i18n: { store: { data: {} } } };
          const authenticated = false;
          const errors = [];

          const result = await loadPackets(req, authenticated, errors);
          const expected = {};

          expect(result.translations).toBeDefined();
          expect(result.settings).toBeDefined();
          expect(result.pages).not.toBeDefined();
          expect(result.components).not.toBeDefined();
          expect(result.errors).not.toBeDefined();
        });

        it('Should return packet object with errors if exists', async () => {
          sandbox.vm.p.currentUser.user.email = 'guest@free.man';
          const req = { sandbox, i18n: { store: { data: {} } } };
          const authenticated = false;
          const errors = [{}];

          const result = await loadPackets(req, authenticated, errors);
          const expected = {};

          expect(result.translations).toBeDefined();
          expect(result.settings).toBeDefined();
          expect(result.pages).not.toBeDefined();
          expect(result.components).not.toBeDefined();
          expect(result.errors).toEqual(errors);
        });
      });
    });
  });
});
