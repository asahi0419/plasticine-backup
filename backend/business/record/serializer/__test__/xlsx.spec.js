import xlsx from '../xlsx.js';

describe('Record: Serialized', () => {
  describe('XLSX', () => {
    it('Should join array values', async () => {
      const value = 'string';
      const record = { alias: [value] };
      const result = await xlsx({ records: [ record ] }, { model: db.getModel('model') });

      expect(result.includes('[')).toEqual(false);
      expect(result.includes(']')).toEqual(false);
      expect(result.includes(value)).toEqual(true);
    });
  });
});
