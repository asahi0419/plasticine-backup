describe('Sandbox', () => {
  describe('utils.getEnvName()', () => {
    it('Should return env name', async () => {
      const result = sandbox.vm.utils.getEnvName();
      const expected = process.env.APP_ENV;

      expect(result).toBeDefined();
      expect(result).toEqual(expected);
    });
  });
});
