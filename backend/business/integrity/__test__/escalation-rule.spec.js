import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: Escalation rule', () => {
  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent planned escalations found', async () => {
      const model = await manager('model').create();
      const field = await db.model('field').where({ model: model.id, alias: 'created_by' }).getOne();
      const escalationRule = await manager('escalation_rule').create({ model: model.id, target_field: field.id });
      const plannedTask = await manager('planned_task').create({
        model: model.id,
        record: 1,
        scheduled_on: '2018-08-08 21:32:39.473',
        status: 'new',
        escalation_rule: escalationRule.id,
      });

      const result = new IntegrityManager(escalationRule, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['planned_task'] } });
    });
  });
});
