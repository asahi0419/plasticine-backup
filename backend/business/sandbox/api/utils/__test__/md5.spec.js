describe('Sandbox', () => {
  describe('utils.md5(data)', () => {
    it('Should md5 hash by data', async () => {
      const data = 'data';

      const result = await sandbox.vm.utils.md5(data);
      const expected = '8d777f385d3dfec8815d20f7496026dc';

      expect(result).toEqual(expected);
    });
  });
});
