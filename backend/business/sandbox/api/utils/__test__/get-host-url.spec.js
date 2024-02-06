describe('Sandbox', () => {
  describe('utils.getHostURL()', () => {
    it('Should return host URL', async () => {
      const result = sandbox.vm.utils.getHostURL();
      const expected = `${process.env.APP_HOST_PROTOCOL}://${process.env.APP_HOST_NAME}`;

      expect(result).toBeDefined();
      expect(result).toEqual(expected);
    });
  });
});
