import json from '../json.js';

describe('Record: Serialized', () => {
  describe('JSON', () => {
    it('Should set default attributes', () => {
      const record = {};

      const result = json(record).data;
      const expected = {
        attributes: {},
        counts: {},
        extra_attributes: {},
        extra_fields: {},
        human_attributes: {},
        relationships: {},
      };

      expect(result).toMatchObject(expected);
    });
  });
});
