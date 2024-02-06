import normalizeRecord from '../normalize-record.js';

describe('Record: Helpers', () => {
  describe('normalizeRecord(field, sandbox)', () => {
    it('Should process array string multiselect', () => {
      const record = {
        array_string: '1,2'
      };
      const service = {
        modelFields: [
          {
            alias: 'array_string',
            type: 'array_string',
            options: { multi_select: true },
          }
        ]
      };

      const result = normalizeRecord(record, service);
      const expected = {
        array_string: ['1', '2']
      };

      expect(result).toEqual(expected);
    });
  });
});
