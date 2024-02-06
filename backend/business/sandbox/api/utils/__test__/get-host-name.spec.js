describe('Sandbox', () => {
  describe('utils.getHostName()', () => {
    it('Should return host name', async () => {
      const result = sandbox.vm.utils.getHostName();
      const expected = process.env.APP_HOST_NAME;

      expect(result).toBeDefined();
      expect(result).toEqual(expected);
    });
  });
});
