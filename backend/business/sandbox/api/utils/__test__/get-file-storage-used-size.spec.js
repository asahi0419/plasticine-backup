describe('Sandbox', () => {
  describe('utils.getFileStorageUsedSize()', () => {
    it('Should return correct result', async () => {
      const result = await sandbox.vm.utils.getFileStorageUsedSize();

      expect(result).toBeDefined();
    });
  });
});
