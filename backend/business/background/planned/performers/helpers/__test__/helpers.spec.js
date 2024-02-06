import { changeStatus } from '../helpers.js';

const { manager } = h.record;

beforeAll(async () => {
  t.model = await manager('model').create();
  t.field = await manager('field').create({ model: t.model.id, type: 'string' });
  t.record = await manager(t.model.alias).create();

  t.createRule = (attributes = {}) => manager('escalation_rule').create({
    model: t.model.id,
    target_field: t.field.id,
    ...attributes,
  });

  t.createPTask = (attributes = {}) => manager('planned_task').create({
    ...attributes,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Business', () => {
  describe('Background', () => {
    describe('Planned Manager', () => {
      describe('Performers - Helpers', () => {
        describe('changeStatus(record, status)', () => {
          it('Should change record status', async () => {
            let rule = await t.createRule();
            let task = await t.createPTask({ scheduled_on: new Date(), model: t.model.id, record: t.record.id, escalation_rule: rule.id });
            let expected = 'new';

            expect(task.status).toEqual(expected);

            let result = await changeStatus(task, 'in_progress');
            expected = 'in_progress';

            expect(result.status).toEqual(expected);
          });
        });
      });
    });
  });
});
