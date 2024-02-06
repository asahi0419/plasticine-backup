import extractChangedAttributes from '../extract-changed-attributes.js';

const FIELDS = [
  { alias: 'array_string', type: 'array_string' },
  { alias: 'array_string_ms', type: 'array_string', options: JSON.stringify({ multi_select: true }) },
  { alias: 'integer', type: 'integer' },
  { alias: 'float', type: 'float' },
  { alias: 'boolean', type: 'boolean' },
  { alias: 'string', type: 'string' },
  { alias: 'datetime', type: 'datetime' },
  { alias: 'reference_to_list', type: 'reference_to_list' },
];

describe('Record: Helpers', () => {
  describe('extractChangedAttributes(record, attributes, fields)', () => {
    it('Should extract changed attributes', async () => {
      let record, attributes, result, expected;

      record = { wrong_field: null };
      attributes = { wrong_field: 'wrong_field' };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { wrong_field: 'wrong_field' };
      attributes = { wrong_field: null };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      // array_string | reference_to_list

      record = { array_string: [] };
      attributes = { array_string: [] };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { array_string: [] };
      attributes = { array_string: [1] };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { array_string: [1] };
      expect(result).toEqual(expected);

      // array_string_ms

      record = { array_string_ms: null };
      attributes = { array_string_ms: [] };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { array_string_ms: [] };
      attributes = { array_string_ms: ['one'] };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { array_string_ms: ['one'] };
      expect(result).toEqual(expected);

      record = { array_string_ms: ['one'] };
      attributes = { array_string_ms: [] };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { array_string_ms: [] };
      expect(result).toEqual(expected);

      record = { array_string_ms: ['one'] };
      attributes = { array_string_ms: ['one'] };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { array_string_ms: ['one'] };
      attributes = { array_string_ms: "'one'" };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { array_string_ms: "'one'" };
      attributes = { array_string_ms: ['one'] };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      // boolean

      record = { boolean: false };
      attributes = { boolean: false };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { boolean: false };
      attributes = { boolean: true };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { boolean: true };
      expect(result).toEqual(expected);

      // integer | reference | global_reference

      record = { integer: 1 };
      attributes = { integer: 1 };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { integer: 1 };
      attributes = { integer: 2 };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { integer: 2 };
      expect(result).toEqual(expected);

      // float

      record = { float: 1.1 };
      attributes = { float: 1.1 };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { float: 1.1 };
      attributes = { float: 2.1 };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { float: 2.1 };
      expect(result).toEqual(expected);

      // string | fa_icon | file | data_template | data_visual | condition | filter | color

      record = { string: 'string' };
      attributes = { string: 'string' };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { string: 'string' };
      attributes = { string: 'string changed' };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { string: 'string changed' };
      expect(result).toEqual(expected);

      // datetime

      const datetime = new Date();

      record = { datetime };
      attributes = { datetime };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { datetime };
      attributes = { datetime: new Date('December 17, 1995 03:24:00') };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { datetime: new Date('December 17, 1995 03:24:00') };
      expect(result).toEqual(expected);

      // reference_to_list

      const reference_to_list = [];

      record = { reference_to_list };
      attributes = { reference_to_list };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { reference_to_list };
      attributes = {};
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = {};
      attributes = { reference_to_list };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { reference_to_list };
      attributes = { reference_to_list: [ 1 ] };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { reference_to_list: [ 1 ] };
      expect(result).toEqual(expected);

      // exta attributes

      record = {};
      attributes = { __extraAttributes: { attribute: {} } };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { datetime };
      attributes = { __extraAttributes: { attribute: { key: 'value' } } };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { __extraAttributes: { attribute: { key: 'value' } } };
      expect(result).toEqual(expected);

      record = {};
      attributes = { __extraAttributes: { attribute: {} } };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { datetime };
      attributes = { __extraAttributes: { attribute: { key: null } } };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { __extraAttributes: { attribute: { key: null } } };
      expect(result).toEqual(expected);

      // humanized attributes

      record = {};
      attributes = { __humanizedAttributes: { attribute: {} } };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { datetime };
      attributes = { __humanizedAttributes: { attribute: { key: 'value' } } };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { __humanizedAttributes: { attribute: { key: 'value' } } };
      expect(result).toEqual(expected);

      record = {};
      attributes = { __humanizedAttributes: { attribute: {} } };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = {};
      expect(result).toEqual(expected);

      record = { datetime };
      attributes = { __humanizedAttributes: { attribute: { key: null } } };
      result = extractChangedAttributes(record, attributes, FIELDS);
      expected = { __humanizedAttributes: { attribute: { key: null } } };
      expect(result).toEqual(expected);
    });
  });
});
