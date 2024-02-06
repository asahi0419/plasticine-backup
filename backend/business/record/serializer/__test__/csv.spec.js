import csv from '../csv.js';

describe('Record: Serialized', () => {
  describe('CSV', () => {
    it('Should join array values', async () => {
      const value = 'string';
      const record = { alias: [value] };
      const result = await csv({ records: [ record ] }, { model: db.getModel('model') });

      expect(result.includes('[')).toEqual(false);
      expect(result.includes(']')).toEqual(false);
      expect(result.includes(value)).toEqual(true);
    });
    it('Should have fields names in header', async () => {
      const value = 'string';
      const model = db.getModel('model');
      const fields = ['alias'];
      const record = { alias: model.alias };
      const result = await csv({ records: [ record ] }, { model, fields });

      expect(result.includes('Alias')).toEqual(true);
    });
  });
});
