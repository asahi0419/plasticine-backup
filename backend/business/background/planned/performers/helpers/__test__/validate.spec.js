import {
  validateRuleUniqueness,
  validateTaskUniqueness,
  validateRuleNextExecution,
  validateTaskNextExecution,
  validateRuleOffsets,
} from '../validate.js';

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

  t.createSTask = (attributes = {}) => manager('scheduled_task').create({
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
      describe('Performers Helpers - Validate', () => {
        describe('validateRuleUniqueness(task)', () => {
          it('Should validate task uniqueness', async () => {
            let rule = await t.createRule();
            let task = await t.createSTask({ model: t.model.id, record: t.record.id, escalation_rule: rule.id });
            let result = await validateRuleUniqueness(task);
            let expected = true;

            expect(result).toEqual(expected);

            await t.createPTask({ status: 'new', model: t.model.id, record: t.record.id, escalation_rule: rule.id });
            result = await validateRuleUniqueness(task);
            expected = false;

            expect(result).toEqual(expected);
          });
        });
        describe('validateTaskUniqueness(task)', () => {
          it('Should validate task uniqueness', async () => {
            const task = await t.createSTask({});
            let result, expected;

            result = await validateTaskUniqueness(task);
            expected = true;
            expect(result).toEqual(expected)

            await t.createPTask({ status: 'new', scheduled_task: task.id });
            result = await validateTaskUniqueness(task);
            expected = false;
            expect(result).toEqual(expected);

            await db.model('planned_task').where({ scheduled_task: task.id }).update({ status: 'enqueued' });
            result = await validateTaskUniqueness(task);
            expected = false;
            expect(result).toEqual(expected);

            await db.model('planned_task').where({ scheduled_task: task.id }).update({ status: 'in_progress' });
            result = await validateTaskUniqueness(task);
            expected = false;
            expect(result).toEqual(expected);

            await db.model('planned_task').where({ scheduled_task: task.id }).update({ status: 'completed' });
            result = await validateTaskUniqueness(task);
            expected = true;
            expect(result).toEqual(expected);
          });
        });
        describe('validateRuleNextExecution(rule)', () => {
          it('Should validate rule next execution', async () => {
            let rule = {};
            let result = validateRuleNextExecution(rule);
            let expected = undefined;

            expect(result).toEqual(expected);

            rule = { re_enable_after: 10 };
            result = validateRuleNextExecution(rule);
            expected = rule.re_enable_after;

            expect(result).toEqual(expected);
          });
        });
        describe('validateTaskNextExecution(task, sandbox)', () => {
          it('Should validate task next execution', async () => {
            let task = { reenable_type: 'no_reenable', run_counter: 1 };
            let result = validateTaskNextExecution(task, sandbox);
            let expected = false;

            expect(result).toEqual(expected);

            task = { reenable_type: 'no_reenable', start_at: new Date(new Date() - 60 * 1000) };
            result = validateTaskNextExecution(task, sandbox);
            expected = false;

            expect(result).toEqual(expected);

            task = { reenable_end: 'end_by_date', end_by_date: new Date(new Date() - 60 * 1000) };
            result = validateTaskNextExecution(task, sandbox);
            expected = false;

            expect(result).toEqual(expected);

            task = { reenable_end: 'end_by_count', end_by_count: 1, run_counter: 2 };
            result = validateTaskNextExecution(task, sandbox);
            expected = false;

            expect(result).toEqual(expected);

            task = {};
            result = validateTaskNextExecution(task, sandbox);
            expected = true;

            expect(result).toEqual(expected);
          });
        });
        describe('validateRuleOffsets(record, sandbox)', () => {
          it('Should validate rule offsets', async () => {
            let rule = await t.createRule();
            let result = await validateRuleOffsets(rule, sandbox);
            let expected = undefined;

            expect(result).toEqual(expected);

            rule = await t.createRule({ offset: t.field.alias });
            result = await validateRuleOffsets(rule, sandbox);
            expected = undefined;

            expect(result).toEqual(expected);

            rule = await t.createRule({ offset: t.field.alias, re_enable_after: '10' });
            result = await validateRuleOffsets(rule, sandbox);
            expected = undefined;

            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
