import cache from '../../../../../presentation/shared/cache/index.js';

describe('Sandbox', () => {
  describe('utils.getMemoryCache(type)', () => {
    it('Should return correct result', async () => {
      let result, expected, type;

      type = 'models';
      result = sandbox.vm.utils.getMemoryCache(type);
      expected = cache.namespaces.core.get(type);

      expect(result).toBeDefined();
      expect(result).toEqual(expected);

      type = 'fields';
      result = sandbox.vm.utils.getMemoryCache(type);
      expected = cache.namespaces.core.get(type);

      expect(result).toBeDefined();
      expect(result).toEqual(expected);

      type = 'settings';
      result = sandbox.vm.utils.getMemoryCache(type);
      expected = cache.namespaces.core.get(type);

      expect(result).toBeDefined();
      expect(result).toEqual(expected);

      type = 'permissions';
      result = sandbox.vm.utils.getMemoryCache(type);
      expected = cache.namespaces.core.get(type);

      expect(result).toBeDefined();
      expect(result).toEqual(expected);

      type = 'core_locks';
      result = sandbox.vm.utils.getMemoryCache(type);
      expected = cache.namespaces.core.get(type);

      expect(result).toBeDefined();
      expect(result).toEqual(expected);
    });

    it('Should not be able to mutate', () => {
      let result, expected, type;

      type = 'models';
      result = sandbox.vm.utils.getMemoryCache(type);
      result.model = 'model';
      expected = cache.namespaces.core.get(type);

      expect(result).not.toEqual(expected);
    })
  });
});
