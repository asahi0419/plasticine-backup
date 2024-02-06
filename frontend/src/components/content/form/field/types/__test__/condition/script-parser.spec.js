import ScriptParser from '../../condition/script-parser';

describe('ScriptParser (Condition field)', () => {

  const fields = [
    { alias: 'some_integer', type: 'integer' },
    { alias: 'some_float', type: 'float' },
    { alias: 'some_boolean', type: 'boolean' },
    { alias: 'some_datetime', type: 'datetime' },
    { alias: 'some_string', type: 'string' },
    { alias: 'some_array_string', type: 'array_string' },
    { alias: 'some_reference', type: 'reference' },
    { alias: 'some_rtl', type: 'reference_to_list' },
  ];

  const scriptParser = new ScriptParser(fields);

  describe('Array', () => {
    const script = `
        p.record.getValue('some_array_string') == '1' && 
        p.record.getValue('some_array_string') != '2' && 
        !p.record.getValue('some_array_string') && 
        !!p.record.getValue('some_array_string') && 
        [\"1\",\"2\"].includes(p.record.getValue('some_array_string')) && 
        ![\"3\",\"4\"].includes(p.record.getValue('some_array_string')) && 
        p.record.getValue('some_array_string').startsWith('qwerty') && 
        p.record.getValue('some_array_string').endsWith('ytrewq') && 
        p.record.getValue('some_array_string').includes('www') && 
        !p.record.getValue('some_array_string').includes('qqq')
      `;
    const content = scriptParser.process(script);

    it('Should parse the content', () => {
      expect(content[0].items.length).toEqual(10);
    });
  });

  describe('Boolean', () => {
    const script = `
        (p.record.getValue('some_boolean') || !!p.record.getValue('some_boolean')) || 
        (!p.record.getValue('some_boolean') || !p.record.getValue('some_boolean'))
      `;
    const content = scriptParser.process(script);

    it('Should parse the content global OR', () => {
      expect(content.length).toEqual(2);
    });

    it('Should parse the content local OR', () => {
      expect(content[0].items.length).toEqual(2);
    });

  });

  describe('Datetime', () => {
    const script = `
        p.record.getValue('some_datetime') == new Date('2019-02-01T08:25:41.582Z') && 
        p.record.getValue('some_datetime') != new Date('2019-01-30T22:00:00.218Z') && 
        p.record.getValue('some_datetime') < new Date('2019-01-31T22:00:00.717Z') && 
        p.record.getValue('some_datetime') > new Date('2019-02-01T22:00:00.535Z') && 
        (new Date('2019-01-31T22:00:00.123Z') <= p.record.getValue('some_datetime') && p.record.getValue('some_datetime') <= new Date('2019-02-01T22:00:00.370Z'))
      `;
    const content = scriptParser.process(script);

    it('Should parse the content', () => {
      expect(content[0].items.length).toEqual(6);
    });
  });

  describe('Integer, Float', () => {
    const script = `
        p.record.getValue('some_integer') == 1 || 
        p.record.getValue('some_integer') != 2 || 
        p.record.getValue('some_integer') < 2 || 
        p.record.getValue('some_integer') > 2 || 
        p.record.getValue('some_integer') <= 2 || 
        p.record.getValue('some_integer') >= 2 || 
        [1,10,10].includes(p.record.getValue('some_integer')) || 
        ![2,20,200].includes(p.record.getValue('some_integer')) || 
        (10 <= p.record.getValue('some_integer') && p.record.getValue('some_integer') <= 20)
      `;
    const content = scriptParser.process(script);

    it('Should parse the content', () => {
      expect(content[0].items.length).toEqual(8);
    });

    it('Should parse the content "between"', () => {
      expect(content[1].items.length).toEqual(2);
    });
  });

  describe('Reference', () => {
    const script = `
        p.record.getValue('some_reference') == 27 || 
        p.record.getValue('some_reference') != 226 || 
        !p.record.getValue('some_reference') || 
        [27,55,1].includes(p.record.getValue('some_reference')) || 
        ![226,61].includes(p.record.getValue('some_reference')) || 
        p.record.getValue('some_reference') == p.currentUser.getValue('id') ||
        p.currentUser.isBelongsToWorkgroup(p.record.getValue('some_reference'))
      `;
    const content = scriptParser.process(script);

    it('Should parse the content', () => {
      expect(content[0].items.length).toEqual(7);
    });
  });

  describe('Reference to List', () => {
    const script = `
        p.record.getValue('some_rtl') == [27,55] || 
        [27,226].includes(p.record.getValue('some_rtl')) || 
        ![61].includes(p.record.getValue('some_rtl'))
      `;
    const content = scriptParser.process(script);

    it('Should parse the content', () => {
      expect(content[0].items.length).toEqual(3);
    });
  });

  describe('String', () => {
    const script = `
        p.record.getValue('some_string') == 'qwerty' && 
        ["qwqw"].includes(p.record.getValue('some_string')) && 
        !["nnnnn"].includes(p.record.getValue('some_string')) && 
        p.record.getValue('some_string').startsWith('qw') || 
        p.record.getValue('some_string').endsWith('ty') && 
        p.record.getValue('some_string').includes('ert') && 
        !p.record.getValue('some_string').includes('aaa') && 
        !!p.record.getValue('some_string') || 
        p.record.getValue('some_string') != 'qqqqq'
      `;
    const content = scriptParser.process(script);

    it('Should parse the content', () => {
      expect(content[0].items.length).toEqual(9);
    });
  });

  describe('currentUser', () => {
    const script = `
        p.currentUser.isBelongsToWorkgroup(1) && 
        !p.currentUser.isBelongsToWorkgroup(5) && 
        p.currentUser.isAdmin() || 
        p.currentUser.canAtLeastRead() || 
        p.currentUser.canAtLeastWrite()
      `;
    const content = scriptParser.process(script);

    it('Should parse the content', () => {
      expect(content[0].items.length).toEqual(5);
    });
  });
});
