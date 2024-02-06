import {
  loadRecord,
  serializer,
  createFilterByScript,
  loadFields,
  loadExtraFieldsAttributes,
  loadActions,
  loadPageUserSettings,
  generateFilterFromDependsOn,
  extendFields,
} from '../helpers.js';

const { manager } = h.record;

jest.mock('../../../../../../business/helpers/index.js', () => ({ parseOptions: jest.fn().mockReturnValue({ options: 'options' }) }));

jest.mock('../../../../../../data-layer/orm/index.js', () => ({
  model: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue([{ fields: 'fields', readonly_when_script: true }]),
      whereIn: jest.fn().mockReturnValue([{ permissions: 'permissions' }]),
      getOne: jest.fn()
        .mockReturnValueOnce([{ fields: 'fields' }])
        .mockReturnValueOnce({})
        .mockReturnValueOnce({})
        .mockReturnValueOnce({})
        .mockReturnValueOnce({})
        .mockReturnValueOnce(false),
    }),
    whereIn: jest.fn()
      .mockReturnValue({
        where: jest.fn().mockReturnValue([{ data: 'data' }]),
      }),
    tableName: 'table',
  }),
  getModel: jest.fn().mockReturnValue({}),
  getField: jest.fn().mockReturnValue({ data: 'data' }),
}));

const executeScript = jest.fn()
  .mockReturnValueOnce(true)
  .mockReturnValueOnce(false)
  .mockReturnValueOnce(true);

const req = {
  translate: jest.fn().mockReturnValue([{ translate: 'translate' }])
};

describe('Server API', () => {
  describe('Commands: Load helpers', () => {
    describe('loadRecord(model, id, sandbox)', async () => {
      it(`Should load inserted record`, async () => {
        const model = db.getModel('form');
        const record = await loadRecord(model, 1, sandbox);

        expect(record).toBeDefined();
      });

      it(`Should load not inserted record`, async () => {
        const model = db.getModel('form');
        const form = await manager('form').build({ active: true }, true);
        const record = await loadRecord(model, form.id, sandbox);

        expect(record).toBeDefined();
      });
    });

    describe('serializer(input, type, options = {})', async () => {
      it(`Should return correct data from object input`, async () => {
        const input = { test: 'test' };
        const type = 'test';

        const { attributes: result } = await serializer(input, type, { req });
        const expected = input;

        expect(result).toEqual(expected);
      });

      it(`Should return correct data from array input`, async () => {
        const input = [{ test: 'test' }];
        const type = 'test';

        const [{ attributes: result }] = await serializer(input, type, { req });
        const [ expected ] = input;

        expect(result).toEqual(expected);
      });

      it(`Should transform action server_script`, async () => {
        const input = [{ server_script: 'test' }];
        const type = 'action';

        const [{ attributes: { server_script: result } }] = await serializer(input, type);
        const [{ server_script: expected }] = input;

        expect(result).toEqual(expected);
      });

      it(`Should transform page server_script`, async () => {
        const input = [{ server_script: 'test' }];
        const type = 'page';

        const [{ attributes: { server_script: result } }] = await serializer(input, type);
        const [{ server_script: expected }] = input;

        expect(result).toEqual(expected);
      });
    });

    describe('createFilterByScript(input, type, options = {})', async () => {
      it(`Should return correct data when filter returns true`, async () => {
        const expected = [{ test: 'test' }];

        const result = await createFilterByScript(null, null, { executeScript })([{ test: 'test' }]);

        expect(result).toEqual(expected);
      });

      it(`Should return correct data when filter returns false`, async () => {
        const expected = [];

        const result = await createFilterByScript(null, null, { executeScript })([{ test: 'test' }]);

        expect(result).toEqual(expected);
      });
    });

    describe('loadFields({ id }, sandbox, params = {})', async () => {
      it(`Should return correct data with filter = true`, async () => {
        const result = await loadFields({ id: 1 }, sandbox);

        expect(result.length).not.toEqual(0);
      });
    });

    describe('loadExtraFieldsAttributes(fields)', async () => {
      it(`Should return correct data`, async () => {
        const expected = [{ data: 'data' }];

        const result = await loadExtraFieldsAttributes([]);

        expect(result).toEqual(expected);
      });
    });

    describe('loadActions({ id }, types)', async () => {
      it(`Should return correct data`, async () => {
        const expected = [{ permissions: 'permissions' }];

        const result = await loadActions({});

        expect(result).toEqual(expected);
      });
    });

    describe('loadPageUserSettings(user, pageAlias)', async () => {
      it(`Should return correct data when userSetting exists`, async () => {
        const expected = {options: "options"};

        const result = await loadPageUserSettings({});

        expect(result).toEqual(expected);
      });

      it(`Should return correct data when userSetting don\'t exists`, async () => {
        const expected = {};

        const result = await loadPageUserSettings({});

        expect(result).toEqual(expected);
      });
    });

    describe('generateFilterFromDependsOn(dependsOn, fieldsMap)', () => {
      it(`Should return error stub if field with alias not found`, async () => {
        const alias = 'alias';
        const dependsOn = [ alias ];
        const fieldsMap = {};

        const result = generateFilterFromDependsOn(dependsOn, fieldsMap);
        const expected = `\`${alias}\` = 'ERROR_FILTER_DEPENDS_ON'`;

        expect(result).toEqual(expected);
      });

      it(`Should return correct result for reference`, async () => {
        const alias = 'alias';
        const dependsOn = [ alias ];
        const fieldsMap = { alias: { type: 'reference' } };

        const result = generateFilterFromDependsOn(dependsOn, fieldsMap);
        const expected = `\`${alias}\` = {${alias}}`;

        expect(result).toEqual(expected);
      });

      it(`Should return correct result for rtl`, async () => {
        const alias = 'alias';
        const dependsOn = [ alias ];
        const fieldsMap = { alias: { type: 'reference_to_list' } };

        const result = generateFilterFromDependsOn(dependsOn, fieldsMap);
        const expected = `\`__having__${alias}\` IN ({${alias}})`;

        expect(result).toEqual(expected);
      });

      it(`Should return correct result for array string`, async () => {
        const alias = 'alias';
        const dependsOn = [ alias ];
        const fieldsMap = { alias: { type: 'array_string' } };

        const result = generateFilterFromDependsOn(dependsOn, fieldsMap);
        const expected = `\`${alias}\` = '{${alias}}'`;

        expect(result).toEqual(expected);
      });

      it(`Should return correct result for array string [ms]`, async () => {
        const alias = 'alias';
        const dependsOn = [ alias ];
        const fieldsMap = { alias: { type: 'array_string', options: { multi_select: true } } };

        const result = generateFilterFromDependsOn(dependsOn, fieldsMap);
        const expected = `\`__having__${alias}\` IN ({${alias}})`;

        expect(result).toEqual(expected);
      });
    });

    describe('extendFields(fields, sandbox)', async () => {
      it(`Should not mutate initial fields`, async () => {
        const fields = await db.model('field').where({ model: db.getModel('model').id, type: 'reference' });
        const result = await extendFields(fields, sandbox);

        expect(result).not.toEqual(fields);
      });
    });
  });
});
