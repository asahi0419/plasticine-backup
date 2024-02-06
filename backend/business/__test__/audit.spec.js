import { omit } from 'lodash-es';

const { manager } = h.record;

beforeAll(async () => {
  t.models = {
    self: await manager('model').create({ audit: 'create_delete' }),
    foreign: await manager('model').create(),
    db_rule: await manager('model').create(),
  };
  t.fields = {
    self: {
      string: await manager('field').create({
        type: 'string',
        model: t.models.self.id,
        audit: 'audit_and_worklog',
      }),
      rtl: await manager('field').create({
        type: 'reference_to_list',
        model: t.models.self.id,
        audit: 'audit_and_worklog',
        options: JSON.stringify({
          foreign_model: t.models.foreign.alias,
          foreign_label: 'id',
        }),
      }),
    },
    db_rule: {
      audit_record_id: await manager('field').create({
        type: 'integer',
        model: t.models.db_rule.id,
      }),
    }
  };
  t.records = {
    foreign: [
      await manager(t.models.foreign.alias).create(),
      await manager(t.models.foreign.alias).create(),
    ],
  };

  t.db_rules = {
    self: [
      await manager('db_rule').create({
        model: t.models.self.id,
        when_perform: 'after',
        on_insert: true,
        on_update: true,
        on_delete: true,
        script: `const auditModel = await p.getModel('audit_${t.models.self.id}');
const auditRecord = await auditModel.findOne({ related_record: p.record.getValue('id') }).order({ id: 'desc' });

const dbRuleModel = await p.getModel('${t.models.db_rule.alias}');
await dbRuleModel.setOptions({ check_permission: false }).insert({ ['${t.fields.db_rule.audit_record_id.alias}']: auditRecord.getValue('id') });`
      }),
    ],
  };

  t.audit = {
    selfModelAlias: `audit_${t.models.self.id}`,
  }
});

describe('AuditPerformer', () => {
  describe('Common cases', () => {
    describe('Create', () => {
      it('Should create correct audit record', async () => {
        let auditRecord;

        t.records.self = await manager(t.models.self.alias).create({});
        auditRecord = await db.model(t.audit.selfModelAlias).where({ related_record: t.records.self.id }).orderBy('id', 'desc').getOne();
        expect(auditRecord.id).toEqual(1);
        expect(auditRecord.from).toEqual(null);
        expect(auditRecord.to).toEqual(JSON.stringify(omit(t.records.self, ['__type'])));
      });

      it('Audit record should be accessible in after db rule', async () => {
        const dbRuleRecord = await db.model(t.models.db_rule.alias).where({ [t.fields.db_rule.audit_record_id.alias]: 1 }).getOne();
        expect(dbRuleRecord).toBeDefined();
      });
    });

    describe('Update', () => {
      it('Should affect only changed fields', async () => {
        let auditRecord;

        t.records.self = await manager(t.models.self.alias).update(t.records.self, {});
        auditRecord = await db.model(t.audit.selfModelAlias).where({ related_record: t.records.self.id }).orderBy('id', 'desc').getOne();
        expect(auditRecord.id).toEqual(1);
        expect(auditRecord.from).toEqual(null);
        expect(auditRecord.to).toEqual(JSON.stringify(omit(t.records.self, ['__type'])));

        t.records.self = await manager(t.models.self.alias).update(t.records.self, { [t.fields.self.string.alias]: 'test' });
        auditRecord = await db.model(t.audit.selfModelAlias).where({ related_record: t.records.self.id }).orderBy('id', 'desc').getOne();
        expect(auditRecord.id).toEqual(2);
        expect(auditRecord.from).toEqual(null);
        expect(auditRecord.to).toEqual('test');
      });

      it('Audit record should be accessible in after db rule', async () => {
        const dbRuleRecord = await db.model(t.models.db_rule.alias).where({ [t.fields.db_rule.audit_record_id.alias]: 2 }).getOne();
        expect(dbRuleRecord).toBeDefined();
      });
    });

    describe('Delete', () => {
      it('Should create correct audit record', async () => {
        let auditRecord;

        t.records.self = await manager(t.models.self.alias).destroy(t.records.self);
        auditRecord = await db.model(t.audit.selfModelAlias).where({ related_record: t.records.self.id }).orderBy('id', 'desc').getOne();
        expect(auditRecord.id).toEqual(3);
        expect(auditRecord.from).toEqual(null);
        expect(auditRecord.to).toEqual(JSON.stringify(omit(t.records.self, ['__type'])));
      });

      it('Audit record should be accessible in after db rule', async () => {
        const dbRuleRecord = await db.model(t.models.db_rule.alias).where({ [t.fields.db_rule.audit_record_id.alias]: 3 }).getOne();
        expect(dbRuleRecord).toBeDefined();
      });
    });
  });
});
