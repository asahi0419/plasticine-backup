describe('Sandbox', () => {
  describe('utils.cleanupFileStorage()', () => {
    it('Should return correct result', async () => {
      const result = await sandbox.vm.utils.cleanupFileStorage();

      expect(result.checked_amount).toBeDefined();
      expect(result.incomplete_deleted).toBeDefined();
      expect(result.total_files_size).toBeDefined();
      expect(result.unrelated_deleted).toBeDefined();
    });
  });
});
