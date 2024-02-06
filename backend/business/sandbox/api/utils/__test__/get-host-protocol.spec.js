describe('Sandbox', () => {
  describe('utils.getHostProtocol()', () => {
    it('Should return host protocol', async () => {
      const result = sandbox.vm.utils.getHostProtocol();
      const expected = process.env.APP_HOST_PROTOCOL;

      expect(result).toBeDefined();
      expect(result).toEqual(expected);
    });
  });
});
