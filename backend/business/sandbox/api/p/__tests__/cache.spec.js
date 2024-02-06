import cacheNamespace from '../cache/index.js';

const cache = cacheNamespace();

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('cache', () => {
        it('Should have proper attributes', async () => {
          expect(cache.set).toBeDefined();
          expect(cache.get).toBeDefined();
          expect(cache.del).toBeDefined();
          expect(cache.exists).toBeDefined();
        });

        describe('set(key, value, EX)', () => {
          it('Should set key value returning boolean result', async () => {
            const key = 'key';
            const value = 'value';

            const result = await cache.set(key, value);
            const expected = true;

            expect(result).toEqual(expected);
          });
          it('Should delete key value after ex ms', async () => {
            const key = 'key_ex';
            const value = 'value_ex';
            const ex = 5000;

            let result, expected;

            await cache.set(key, value, ex);

            result = await cache.get(key);
            expected = value;
            expect(result).toEqual(expected);

            await new Promise((resolve) => {
              setTimeout(resolve, ex + 1);
            });

            result = await cache.get(key);
            expected = null;
            expect(result).toEqual(expected);
          });
        });

        describe('get(key)', () => {
          it('Should return key value', async () => {
            const key = 'key';
            const value = 'value';

            const result = await cache.get(key);
            const expected = value;

            expect(result).toEqual(expected);
          });
          it('Should return null if key is not defined', async () => {
            const key = 'undefined_key';

            const result = await cache.get(key);
            const expected = null;

            expect(result).toEqual(expected);
          });
        });

        describe('del(key)', () => {
          it('Should return true if key existed', async () => {
            const key = 'key';

            const result = await cache.del(key);
            const expected = true;

            expect(result).toEqual(expected);
          });
          it('Should return false if key did not exist', async () => {
            const key = 'undefined_key';

            const result = await cache.del(key);
            const expected = false;

            expect(result).toEqual(expected);
          });
        });

        describe('exists(key)', () => {
          it('Should return true if key exists', async () => {
            const key = 'key';
            const value = 'value';

            await cache.set(key, value);

            const result = await cache.exists(key);
            const expected = true;

            expect(result).toEqual(expected);
          });
          it('Should return false if key does not exist', async () => {
            const key = 'undefined_key';

            const result = await cache.exists(key);
            const expected = false;

            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
