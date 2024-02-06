import RulePerformer from '../rule.js';
import * as HELPERS from '../../helpers/helpers.js';
import * as EXECUTE from '../../helpers/execute.js';
import * as CALCULATE from '../../helpers/calculate.js';

const { manager } = h.record;
const now = new Date();

beforeAll(async () => {
  t.model = await manager('model').create();
  t.field = await manager('field').create({ model: t.model.id, type: 'string' });
  t.record = await manager(t.model.alias).create();

  t.createRule = (attributes = {}) => manager('escalation_rule').create({
    model: t.model.id,
    target_field: t.field.id,
    ...attributes,
  });
  t.createTask = (attributes = {}) => manager('planned_task').create({
    model: t.model.id,
    record: t.record.id,
    status: 'new',
    scheduled_on: now,
    ...attributes,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Business', () => {
  describe('Background', () => {
    describe('Planned Rules', () => {
      describe('RulePerformer', () => {
        describe('process(task)', () => {
          it('Should process tasks with active escalation rule', async () => {
            const rule = await t.createRule({ active: true });
            const task = await t.createTask({ escalation_rule: rule.id });

            jest.spyOn(HELPERS, 'changeStatus');
            jest.spyOn(EXECUTE, 'executeRuleScript');

            await new RulePerformer(rule, sandbox).process(task);

            expect(HELPERS.changeStatus).toBeCalledWith(task, 'in_progress');
            expect(HELPERS.changeStatus).toBeCalledWith(task, 'completed');
            expect(EXECUTE.executeRuleScript).toBeCalled();
          });
          it('Should process tasks with allowed escalation rule', async () => {
            const rule = await t.createRule({ condition_script: 'true' });
            const task = await t.createTask({ escalation_rule: rule.id });

            jest.spyOn(HELPERS, 'changeStatus');
            jest.spyOn(EXECUTE, 'executeRuleScript');

            await new RulePerformer(rule, sandbox).process(task);

            expect(HELPERS.changeStatus).toBeCalledWith(task, 'in_progress');
            expect(HELPERS.changeStatus).toBeCalledWith(task, 'completed');
            expect(EXECUTE.executeRuleScript).toBeCalled();
          });
          it('Should process tasks with reenabled escalation rule', async () => {
            const rule = await t.createRule({ re_enable_after: '1' });
            const task = await t.createTask({ escalation_rule: rule.id });

            jest.spyOn(HELPERS, 'changeStatus');
            jest.spyOn(EXECUTE, 'executeRuleScript');
            jest.spyOn(RulePerformer.prototype, 'reenable');

            await new RulePerformer(rule, sandbox).process(task);

            expect(HELPERS.changeStatus).toBeCalledWith(task, 'in_progress');
            expect(HELPERS.changeStatus).toBeCalledWith(task, 'completed');
            expect(EXECUTE.executeRuleScript).toBeCalled();
            expect(RulePerformer.prototype.reenable).toBeCalled();
          });
          it('Should not process tasks with not active escalation rule', async () => {
            const rule = await t.createRule({ active: false });
            const task = await t.createTask({ escalation_rule: rule.id });

            jest.spyOn(HELPERS, 'changeStatus');
            jest.spyOn(EXECUTE, 'executeRuleScript');

            await new RulePerformer(rule, sandbox).process(task);

            expect(HELPERS.changeStatus).not.toBeCalledWith(task, 'in_progress');
            expect(HELPERS.changeStatus).not.toBeCalledWith(task, 'completed');
            expect(EXECUTE.executeRuleScript).not.toBeCalledWith(rule);
          });
          it('Should not process tasks with not allowed escalation rule', async () => {
            const rule = await t.createRule({ condition_script: 'false' });
            const task = await t.createTask({ escalation_rule: rule.id });

            jest.spyOn(HELPERS, 'changeStatus');
            jest.spyOn(EXECUTE, 'executeRuleScript');

            await new RulePerformer(rule, sandbox).process(task);

            expect(HELPERS.changeStatus).not.toBeCalledWith(task, 'in_progress');
            expect(HELPERS.changeStatus).not.toBeCalledWith(task, 'completed');
            expect(EXECUTE.executeRuleScript).not.toBeCalledWith(rule);
          });
          it('Should not process tasks with not reenabled escalation rule', async () => {
            const rule = await t.createRule({ re_enable_after: '0' });
            const task = await t.createTask({ escalation_rule: rule.id });

            jest.spyOn(HELPERS, 'changeStatus');
            jest.spyOn(EXECUTE, 'executeRuleScript');
            jest.spyOn(RulePerformer.prototype, '__beforeAction');

            await new RulePerformer(rule, sandbox).process(task);

            expect(HELPERS.changeStatus).toBeCalledWith(task, 'in_progress');
            expect(HELPERS.changeStatus).toBeCalledWith(task, 'completed');
            expect(EXECUTE.executeRuleScript).toBeCalled();
            expect(RulePerformer.prototype.__beforeAction).not.toBeCalledWith('reenable');
          });
        });
        describe('reenable()', () => {
          it('Should reenable escalation rule if attribute is not 0', async () => {
            const rule = await t.createRule({ re_enable_after: '10', reenable_type: 'seconds' });
            const task = await t.createTask({ escalation_rule: rule.id, status: 'completed' });

            jest.spyOn(CALCULATE, 'calculateRuleReEnableTime');

            await new RulePerformer(rule, sandbox).reenable(task);
            const tasks = await db.model('planned_task').where({ status: 'new', escalation_rule: task.escalation_rule, model: task.model, record: task.record });

            expect(CALCULATE.calculateRuleReEnableTime).toBeCalledWith(rule, task);
            expect(tasks.length).toEqual(1);
          });
          it('Should not reenable escalation rule if attribute is 0', async () => {
            const rule = await t.createRule({ re_enable_after: '0' });
            const task = await t.createTask({ escalation_rule: rule.id });

            jest.spyOn(CALCULATE, 'calculateRuleReEnableTime');

            await new RulePerformer(rule, sandbox).reenable(task);
            const tasks = await db.model('planned_task').where({ status: 'new', escalation_rule: task.escalation_rule, model: task.model, record: task.record });

            expect(CALCULATE.calculateRuleReEnableTime).not.toBeCalled();
            expect(tasks.length).toEqual(1);
          });
        });
      });
    });
  });
});
