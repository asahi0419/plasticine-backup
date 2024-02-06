const { record } = h;
const { manager } = record;

import Selector from '../../../../../../record/fetcher/selector.js';
import QueryBuilder from '../../../builder.js';
import ModelProxy from '../../../../model/index.js';

const getQueryBuilder = (model) => {
  t.selectorScope = new Selector(model, sandbox).getScope();
  t.modelProxy = new ModelProxy(model, sandbox);

  return new QueryBuilder(t.modelProxy, t.selectorScope);
};

beforeAll(async () => {
  const S = 'S';

  t.model = await manager('model').create(),
  t.field = await manager('field').create({ model: t.model.id, type: 'string' }),

  t.records = [
    await manager(t.model.alias).create({ [t.field.alias]: null }),

    await manager(t.model.alias).create({ [t.field.alias]: `` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}` }),

    await manager(t.model.alias).create({ [t.field.alias]: `   ` }),
    await manager(t.model.alias).create({ [t.field.alias]: `'` }),
    await manager(t.model.alias).create({ [t.field.alias]: `"` }),
    await manager(t.model.alias).create({ [t.field.alias]: `\`` }),
    await manager(t.model.alias).create({ [t.field.alias]: `,` }),
    await manager(t.model.alias).create({ [t.field.alias]: `;` }),
    await manager(t.model.alias).create({ [t.field.alias]: `|` }),
    await manager(t.model.alias).create({ [t.field.alias]: `/` }),
    await manager(t.model.alias).create({ [t.field.alias]: `\\` }),
    await manager(t.model.alias).create({ [t.field.alias]: `abc` }),
    await manager(t.model.alias).create({ [t.field.alias]: `ABC` }),

    await manager(t.model.alias).create({ [t.field.alias]: `${S}   ` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}'` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}"` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}\`` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S},` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S};` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}|` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}/` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}\\` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}abc` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}ABC` }),

    await manager(t.model.alias).create({ [t.field.alias]: `   ${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `'${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `"${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `\`${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `,${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `;${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `|${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `/${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `\\${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `abc${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `ABC${S}` }),

    await manager(t.model.alias).create({ [t.field.alias]: `${S}   ${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}'${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}"${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}\`${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S},${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S};${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}|${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}/${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}\\${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}abc${S}` }),
    await manager(t.model.alias).create({ [t.field.alias]: `${S}ABC${S}` }),
  ];
});

describe('Query Builder: Common cases [String]', () => {
  describe('ISNULL', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: 'ISNULL' });
      expect(result.length).toEqual(2);
      expect(result[0][t.field.alias]).toEqual(null);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: null });
      expect(result.length).toEqual(2);
      expect(result[0][t.field.alias]).toEqual(null);
    });
  });

  describe('ISNOTNULL', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: 'ISNOTNULL' });
      expect(result.length).toEqual(t.records.length - 2);
    });
  });

  describe('=', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: '' });
      expect(result.length).toEqual(0);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: '   ' });
      expect(result.length).toEqual(1);
      expect(result[0][t.field.alias]).toEqual('   ');

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: '\'' });
      expect(result.length).toEqual(1);
      expect(result[0][t.field.alias]).toEqual('\'');

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: '"' });
      expect(result.length).toEqual(1);
      expect(result[0][t.field.alias]).toEqual('"');

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: '`' });
      expect(result.length).toEqual(1);
      expect(result[0][t.field.alias]).toEqual('`');

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: ',' });
      expect(result.length).toEqual(1);
      expect(result[0][t.field.alias]).toEqual(',');

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: ';' });
      expect(result.length).toEqual(1);
      expect(result[0][t.field.alias]).toEqual(';');

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: '|' });
      expect(result.length).toEqual(1);
      expect(result[0][t.field.alias]).toEqual('|');

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: '/' });
      expect(result.length).toEqual(1);
      expect(result[0][t.field.alias]).toEqual('/');

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: '\\' });
      expect(result.length).toEqual(1);
      expect(result[0][t.field.alias]).toEqual('\\');

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: 'abc' });
      expect(result.length).toEqual(1);
      expect(result[0][t.field.alias]).toEqual('abc');

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: 'ABC' });

      expect(result.length).toEqual(1);
      expect(result[0][t.field.alias]).toEqual('ABC');
    });
  });

  describe('!=', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': '' } });
      expect(result.length).toEqual(t.records.length);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': '   ' } });
      expect(result.length).toEqual(t.records.length - 1);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': '\'' } });
      expect(result.length).toEqual(t.records.length - 1);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': '"' } });
      expect(result.length).toEqual(t.records.length - 1);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': '`' } });
      expect(result.length).toEqual(t.records.length - 1);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': ',' } });
      expect(result.length).toEqual(t.records.length - 1);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': ';' } });
      expect(result.length).toEqual(t.records.length - 1);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': '|' } });
      expect(result.length).toEqual(t.records.length - 1);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': '/' } });
      expect(result.length).toEqual(t.records.length - 1);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': '\\' } });
      expect(result.length).toEqual(t.records.length - 1);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': 'abc' } });
      expect(result.length).toEqual(t.records.length - 1);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { '!=': 'ABC' } });
      expect(result.length).toEqual(t.records.length - 1);
    });
  });

  describe('IN', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'IN': ['abc', 'ABC', '\'', '"', '`', ',', ';', '|', '/', '\\'] } });
      expect(result.length).toEqual(10);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'IN': [] } });
      expect(result.length).toEqual(0);
    });
  });

  describe('NOTIN', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTIN': ['abc', 'ABC'] } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTIN': [] } });
      expect(result.length).toEqual(t.records.length);
    });
  });

  describe('STARTSWITH', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': '' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': '   ' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': '\'' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': '"' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': '`' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': ',' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': ';' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': '|' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': '/' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': '\\' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': 'abc' } });
      expect(result.length).toEqual(4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'STARTSWITH': 'ABC' } });
      expect(result.length).toEqual(4);
    });
  });

  describe('DOESNOTSTARTWITH', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': '' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': '   ' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': '\'' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': '"' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': '`' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': ',' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': ';' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': '|' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': '/' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': '\\' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': 'abc' } });
      expect(result.length).toEqual(t.records.length - 4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTSTARTWITH': 'ABC' } });
      expect(result.length).toEqual(t.records.length - 4);
    });
  });

  describe('ENDSWITH', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': '' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': '   ' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': '\'' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': '"' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': '`' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': ',' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': ';' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': '|' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': '/' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': '\\' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': 'abc' } });
      expect(result.length).toEqual(4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'ENDSWITH': 'ABC' } });
      expect(result.length).toEqual(4);
    });
  });

  describe('DOESNOTENDWITH', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': '' } });
      expect(result.length).toEqual(2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': '   ' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': '\'' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': '"' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': '`' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': ',' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': ';' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': '|' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': '/' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': '\\' } });
      expect(result.length).toEqual(t.records.length - 2);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': 'abc' } });
      expect(result.length).toEqual(t.records.length - 4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'DOESNOTENDWITH': 'ABC' } });
      expect(result.length).toEqual(t.records.length - 4);
    });
  });

  describe('LIKE', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': '' } });
      expect(result.length).toEqual(t.records.length);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': '   ' } });
      expect(result.length).toEqual(4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': '\'' } });
      expect(result.length).toEqual(4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': '"' } });
      expect(result.length).toEqual(4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': '`' } });
      expect(result.length).toEqual(4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': ',' } });
      expect(result.length).toEqual(4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': ';' } });
      expect(result.length).toEqual(4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': '|' } });
      expect(result.length).toEqual(4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': '/' } });
      expect(result.length).toEqual(4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': '\\' } });
      expect(result.length).toEqual(4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': 'abc' } });
      expect(result.length).toEqual(8);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'LIKE': 'ABC' } });
      expect(result.length).toEqual(8);
    });
  });

  describe('NOTLIKE', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': '' } });
      expect(result.length).toEqual(0);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': '   ' } });
      expect(result.length).toEqual(t.records.length - 4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': '\'' } });
      expect(result.length).toEqual(t.records.length - 4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': '"' } });
      expect(result.length).toEqual(t.records.length - 4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': '`' } });
      expect(result.length).toEqual(t.records.length - 4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': ',' } });
      expect(result.length).toEqual(t.records.length - 4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': ';' } });
      expect(result.length).toEqual(t.records.length - 4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': '|' } });
      expect(result.length).toEqual(t.records.length - 4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': '/' } });
      expect(result.length).toEqual(t.records.length - 4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': '\\' } });
      expect(result.length).toEqual(t.records.length - 4);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': 'abc' } });
      expect(result.length).toEqual(t.records.length - 8);

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ [t.field.alias]: { 'NOTLIKE': 'ABC' } });
      expect(result.length).toEqual(t.records.length - 8);
    });
  });

  describe('Complex', () => {
    it("Should return correct result", async () => {
      let builder, result;

      builder = getQueryBuilder(t.model);
      result = await builder.raw().find({ created_by: 1, [t.field.alias]: { 'NOTLIKE': 'abc' } });
      expect(result.length).toEqual(39);
    });
  });
});
