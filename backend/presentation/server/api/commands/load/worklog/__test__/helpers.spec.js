import { find } from 'lodash-es';
import { loadFields, loadItems, loadUsers, convertItemsByFieldsAudit, trimAuditData, patternAuditData } from '../helpers.js';

const { manager } = h.record;

beforeAll(async () => {
  t.model = await manager('model').create();
  t.extra_fields_attributes = {
    comment: await manager('extra_fields_attribute').create({ type: 'comment' }),
  },
  t.fields = {
    string: await manager('field').create({ model: t.model.id, type: 'string', extra_attributes: [t.extra_fields_attributes.comment.id] }),
    journal: await manager('field').create({ model: t.model.id, type: 'journal' }),
    rtl: await manager('field').create({ model: t.model.id, type: 'reference_to_list', options: '{"foreign_model":"action","foreign_label":"id"}', audit: 'audit_and_worklog' }),
  };
});

describe('Server API', () => {
  describe('Commands', () => {
    describe('Load', () => {
      describe('Worlog', () => {
        describe('Helpers', () => {
          describe('loadFields(model)', () => {
            it('Should load worklog fields', async () => {
              const result = await loadFields(t.model);

              expect(result.length).toEqual(2);
              expect(find(result, { alias: t.fields.rtl.alias })).toBeDefined();
              expect(find(result, { alias: t.fields.journal.alias })).toBeDefined();
            });
          });

          describe('loadItems(req)', () => {
            it('Should return correct result passing model without audit/worklog', async () => {
              const model = {};
              const params = {};
              const req = { model, params, sandbox };

              const result = await loadItems(req);
              expect(result).toEqual([]);
            });

            it('Should correct load worklog journal items', async () => {
              const { model } = t;

              const record = await manager(model.alias).create({ [t.fields.journal.alias]: 'Test' });
              await manager(model.alias).update(record, { [t.fields.rtl.alias]: [1, 2] });

              const params = { id: record.id };
              const req = { model, params, sandbox };

              const [ result1, result2 ] = await loadItems(req);

              if (process.env.NODE_ENV === 'test') {
                const [ expect1 ] = [
                  { created_by: sandbox.user.id, data: 'Test'},
                ];

                expect(result1).toMatchObject(expect1);
              } else {
                const [ expect1, expect2 ] = [
                  { created_by: sandbox.user.id, data: `Field '${t.fields.rtl.name}' changed from 'Null' to '1, 2'`},
                  { created_by: sandbox.user.id, data: 'Test'},
                ];

                expect(result1).toMatchObject(expect1);
                expect(result2).toMatchObject(expect2);
              }
            });
            it('Should correct load worklog comment items', async () => {
              const { model } = t;
              const record = await manager(model.alias).create();
              const modelAlias = 'worklog_' + model.id;

              await manager(modelAlias).create({
                related_record: record.id,
                related_field: t.fields.string.id,
                data: 'Comment',
              });

              const params = { id: record.id };
              const req = { model, params, sandbox, query: { field: t.fields.string.id } };

              const result = await loadItems(req);
              const expected = { created_by: sandbox.user.id, data: 'Comment' };

              expect(result.length).toEqual(1);
              expect(result[0]).toMatchObject(expected);
            });
          });
          describe('loadUsers(items)', () => {
            it('Should correct load worklog users', async () => {
              const { model } = t;

              const record = await manager(model.alias).create({ [t.fields.journal.alias]: 'Test' });
              await manager(model.alias).update(record, { [t.fields.rtl.alias]: [1] });

              const params = { id: record.id };
              const req = { model, params, sandbox };
              const items = await loadItems(req);

              const [ result ] = await loadUsers(items, sandbox);
              const expected = { __access: true, id: 1, name: 'System', surname: 'Administrator' };

              expect(result).toEqual(expected);
            });
          });
          describe('convertItemsByFieldsAudit(records, options)', () => {
            it('Should return correct result', async () => {
              const date = new Date();
              const records = [
                { id: 1, related_field: 1, created_at: date, created_by: 1, __humanAttributes: { related_field: 'Field 1' } },
                { id: 2, related_field: 2, created_at: date, created_by: 1, __humanAttributes: { related_field: 'Field 2' } },
              ];

              convertItemsByFieldsAudit(records);
              const expected = [
                { id: 1, created_at: date, created_by: 1, data: "Field 'Field 1' changed from '${from}' to '${to}'" },
                { id: 2, created_at: date, created_by: 1, data: "Field 'Field 2' changed from '${from}' to '${to}'" },
              ];

              expect(records).toEqual(expected);
            });
          });
          describe('trimAuditData(data, options)', () => {
            it('Should return correct result', async () => {
              let data, options, result, expected;

              data = undefined;
              options = undefined;
              result = trimAuditData(data, options);
              expected = 'undefined';
              expect(result).toEqual(expected);

              data = null;
              options = undefined;
              result = trimAuditData(data, options);
              expected = 'Null';
              expect(result).toEqual(expected);

              data = '';
              options = undefined;
              result = trimAuditData(data, options);
              expected = '';
              expect(result).toEqual(expected);

              data = '123456789';
              options = { audit_text_limit: 5 };
              result = trimAuditData(data, options);
              expected = '12345 ..';
              expect(result).toEqual(expected);
            });
          });
          describe('patternAuditData(record, options)', () => {
            it('Should return correct result', async () => {
              let record, options, result, expected;

              record = undefined;
              options = undefined;
              result = patternAuditData(record, options);
              expected = "Field '${related_field}' changed from '${from}' to '${to}'";
              expect(result).toEqual(expected);

              record = { from: 'from', to: 'to', related_field: '1', __humanAttributes: { from: 'from', to: 'to', related_field: 'Field' } };
              options = undefined;
              result = patternAuditData(record, options);
              expected = "Field 'Field' changed from 'from' to 'to'";
              expect(result).toEqual(expected);

              record = { from: 'from', to: 'to', related_field: '1', __humanAttributes: { from: 'from', to: 'to', related_field: 'Field' } };
              options = { audit_text_pattern: "${related_field} ${from} ${to} - ${related_field} ${from} ${to}" };
              result = patternAuditData(record, options);
              expected = "Field from to - Field from to";
              expect(result).toEqual(expected);
            });
          });
        });
      });
    });
  });
});
