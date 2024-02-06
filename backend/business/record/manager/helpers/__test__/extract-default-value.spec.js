import extractDefaultValue from '../extract-default-value.js';

let field, result, expected;

describe('Record: Helpers', () => {
  describe('extractDefaultValue(field, sandbox)', () => {
    it('string', async () => {
      field = { type: 'string' }
      result = extractDefaultValue(field, sandbox);
      expected = undefined;
      expect(result).toEqual(expected);

      field = { type: 'string', options: JSON.stringify({ default: null }) }
      result = extractDefaultValue(field, sandbox);
      expected = null;
      expect(result).toEqual(expected);

      field = { type: 'string', options: JSON.stringify({ default: '' }) }
      result = extractDefaultValue(field, sandbox);
      expected = null;
      expect(result).toEqual(expected);

      field = { type: 'string', options: JSON.stringify({ default: 'string' }) }
      result = extractDefaultValue(field, sandbox);
      expected = 'string';
      expect(result).toEqual(expected);
    });

    it('array string', async () => {
      field = { type: 'array_string' }
      result = extractDefaultValue(field, sandbox);
      expected = undefined;
      expect(result).toEqual(expected);

      field = { type: 'array_string', options: JSON.stringify({ default: null }) }
      result = extractDefaultValue(field, sandbox);
      expected = null;
      expect(result).toEqual(expected);

      field = { type: 'array_string', options: JSON.stringify({ default: 'one', values: { one: 'One' } }) }
      result = extractDefaultValue(field, sandbox);
      expected = 'one';
      expect(result).toEqual(expected);
    });

    it('array string [ms]', async () => {
      field = { type: 'array_string', options: JSON.stringify({ default: 'one', values: { one: 'One' }, multi_select: true }) }
      result = extractDefaultValue(field, sandbox);
      expected = "'one'";
      expect(result).toEqual(expected);

      field = { type: 'array_string', options: JSON.stringify({ default: [], values: { one: 'One' }, multi_select: true }) }
      result = extractDefaultValue(field, sandbox);
      expected = null;
      expect(result).toEqual(expected);

      field = { type: 'array_string', options: JSON.stringify({ default: ['one'], values: { one: 'One' }, multi_select: true }) }
      result = extractDefaultValue(field, sandbox);
      expected = "'one'";
      expect(result).toEqual(expected);
    });

    it('boolean', async () => {
      field = { type: 'boolean' }
      result = extractDefaultValue(field, sandbox);
      expected = false;
      expect(result).toEqual(expected);

      field = { type: 'boolean', options: JSON.stringify({ default: true }) }
      result = extractDefaultValue(field, sandbox);
      expected = true;
      expect(result).toEqual(expected);

      field = { type: 'boolean', options: JSON.stringify({ default: null }) }
      result = extractDefaultValue(field, sandbox);
      expected = null;
      expect(result).toEqual(expected);
    });
  });
});
