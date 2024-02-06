describe('Sandbox', () => {
  describe('utils.CSVtoJSON(csvString)', () => {
    it('Should convert CSV string to JSON array', async () => {
      const csvString = 'a,b,c,d\n1,2,3,4';
      const result = await sandbox.vm.utils.CSVtoJSON(csvString);
      const expected = [{ a: '1', b: '2', c: '3', d: '4' }];

      expect(result).toEqual(expected);
    });
  });
});
