import globalStoreNamespace from '../global-store';

const globalStore = globalStoreNamespace();

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('globalStore', () => {
        it('Should have proper attributes', () => {
          expect(globalStore.store).toBeDefined();
          expect(globalStore.set).toBeDefined();
          expect(globalStore.get).toBeDefined();
        });

        describe('set(key, value)', () => {
          it('Should set key value returning boolean result', () => {
            const key = 'key';
            const value = 'value';

            const result = globalStore.set(key, value);
            const expected = true;

            expect(result).toEqual(expected);
          });
        });

        describe('get(key)', () => {
          it('Should return key value', () => {
            const key = 'key';
            const value = 'value';

            const result = globalStore.get(key);
            const expected = value;

            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
