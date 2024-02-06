import fieldSelector from '../field';

describe('Selectors', () => {
  describe('Field', () => {
    it('[Filter] Should return correct metadata', () => {
      const metadata = { field: [{ id: 1 }], model: { 1: { id: 1 } }, templates: [] };
      const model = {};
      const field = { type: 'filter' };
      const params = {};

      const result = fieldSelector(metadata, model, field, params);
      const expected = { fields: [{ id: 1 }], model: { id: 1 }, templates: [] };

      expect(result).toEqual(expected);
    });
    it('[Filter] Should return empty object if metadata is undefined', () => {
      const model = {};
      const field = { type: 'filter' };

      const result = fieldSelector(undefined, model, field);
      const expected = {};

      expect(result).toEqual(expected);
    });
  });
});
