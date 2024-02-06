const { manager } = h.record;

beforeAll(async () => {
  t.model = await manager('model').create();
  t.field = await manager('field').create({ model: t.model.id, type: 'datetime' });
  t.record = await manager(t.model.alias).create();

  t.createRule = (attributes = {}) => manager('escalation_rule').create({
    model: t.model.id,
    target_field: t.field.id,
    ...attributes,
  });
});

describe('Business', () => {
  describe('Background', () => {
    describe('Planned Manager', () => {
      describe('BasePerformer', () => {
        describe('create(record)', () => {
          it('Should create tasks if rules exist', async () => {
            const rule = await t.createRule();
            const record = await manager(t.model.alias).create({ [t.field.alias]: new Date() });
            const result = await db.model('planned_task').where({ escalation_rule: rule.id }).getOne();

            expect(result).toBeDefined();
          });
          it('Should not create tasks if rules do not exist', async () => {
            const rule = await t.createRule();
            const record = await manager(t.model.alias).create();
            const result = await db.model('planned_task').where({ escalation_rule: rule.id }).getOne();

            expect(result).not.toBeDefined();
          });
        });
        describe('update(record)', () => {
          it('Should update tasks if rules exist', async () => {
            let result;

            const date1 = new Date(new Date() + 60 * 1000);
            const date2 = new Date(new Date() + 120 * 1000);

            const rule = await t.createRule();
            const record = await manager(t.model.alias).create({ [t.field.alias]: date1 });

            result = await db.model('planned_task').where({ escalation_rule: rule.id }).getOne();
            expect(result.scheduled_on).toEqual(date1);
            await manager(t.model.alias).update(record, { [t.field.alias]: date2 });
            result = await db.model('planned_task').where({ escalation_rule: rule.id }).getOne();
            expect(result.scheduled_on).toEqual(date2);
          });
        });
        describe('delete(record)', () => {
          it('Should delete tasks if rules exist', async () => {
            let result;

            const rule = await t.createRule();
            const record = await manager(t.model.alias).create({ [t.field.alias]: new Date() });

            result = await db.model('planned_task').where({ escalation_rule: rule.id }).getOne();
            expect(result).toBeDefined();
            await manager(t.model.alias).destroy(record);
            result = await db.model('planned_task').where({ escalation_rule: rule.id }).getOne();
            expect(result).not.toBeDefined();
          });
        });
      });
    });
  });
});
