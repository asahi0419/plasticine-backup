import { keys, reduce, map } from 'lodash-es';

import pickAttributes from '../attributes-picker.js';

const SCHEMA_FIELDS = [
  { alias: 'test_array_string', type: 'array_string' },
  { alias: 'test_boolean', type: 'boolean' },
  { alias: 'test_condition', type: 'condition' },
  { alias: 'test_data_template', type: 'data_template' },
  { alias: 'test_data_visual', type: 'data_visual' },
  { alias: 'test_datetime', type: 'datetime' },
  { alias: 'test_fa_icon', type: 'fa_icon' },
  { alias: 'test_file', type: 'file' },
  { alias: 'test_float', type: 'float' },
  { alias: 'test_integer', type: 'integer' },
  { alias: 'test_reference', type: 'reference' },
  { alias: 'test_string', type: 'string' },
];

const VIRTUAL_FIELDS = [
  { alias: 'test_journal', type: 'journal' },
  { alias: 'test_reference_to_list', type: 'reference_to_list' },
  { alias: 'test_virtual', type: 'string', virtual: true }
];

const CROSS_FIELDS = [
  { alias: 'test_reference_to_list', type: 'reference_to_list' },
  { alias: 'test_global_reference', type: 'global_reference' },
];

const FIELDS = [ ...SCHEMA_FIELDS, ...VIRTUAL_FIELDS, ...CROSS_FIELDS ];

const ATTRIBUTES = reduce(FIELDS, (result, { alias }) => ({ ...result, [alias]: 'test' }), {});

describe('Record: Helpers', () => {
  describe('pickAttributes(record, fields, type)', () => {
    it('Should pick schema attributes', async () => {
      let schemaAttributes;

      schemaAttributes = pickAttributes(ATTRIBUTES, FIELDS, 'schema');
      expect(keys(schemaAttributes)).toEqual(map(SCHEMA_FIELDS, 'alias'));

      schemaAttributes = pickAttributes({ test_global_reference: 1 }, FIELDS, 'schema');
      expect(keys(schemaAttributes)).toEqual(['test_global_reference']);
      schemaAttributes = pickAttributes({ test_global_reference: null }, FIELDS, 'schema');
      expect(keys(schemaAttributes)).toEqual(['test_global_reference']);
      schemaAttributes = pickAttributes({ test_global_reference: {} }, FIELDS, 'schema');
      expect(keys(schemaAttributes)).toEqual([]);
    });
    it('Should pick virtual attributes', async () => {
      const virtualAttributes = pickAttributes(ATTRIBUTES, FIELDS, 'virtual');
      expect(keys(virtualAttributes)).toEqual(map(VIRTUAL_FIELDS, 'alias'));
    });
    it('Should pick cross attributes', async () => {
      const crossAttributes = pickAttributes(ATTRIBUTES, FIELDS, 'cross');
      expect(keys(crossAttributes)).toEqual(map(CROSS_FIELDS, 'alias'));
    });
  });
});
