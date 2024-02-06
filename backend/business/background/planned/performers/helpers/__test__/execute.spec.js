import {
  executeRuleCondition,
  executeRuleScript,
  executeTaskScript
} from '../execute.js';

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
      describe('Performers Helpers - Execute', () => {
        describe('executeRuleCondition(rule, sandbox)', () => {
          it('Should execute rule condition', async () => {
            const rule = await t.createRule();
            jest.spyOn(sandbox, 'executeScript');
            await executeRuleCondition(rule, sandbox, t.model);
            expect(sandbox.executeScript).toBeCalledWith(rule.condition_script, `escalation_rule/${rule.id}/condition_script`, { modelId: t.model.id });
          });
        });
        describe('executeRuleScript(task, rule, sandbox)', () => {
          it('Should execute rule script', async () => {
            const task = await t.createPTask();
            const rule = await t.createRule();
            jest.spyOn(sandbox, 'executeScript');
            await executeRuleScript(task, rule, sandbox);
            expect(sandbox.executeScript).toBeCalledWith(rule.script, `escalation_rule/${rule.id}/script`);
          });
        });
        describe('executeTaskScript(task, sandbox)', () => {
          it('Should execute task script', async () => {
            const task = await t.createSTask();
            jest.spyOn(sandbox, 'executeScript');
            await executeTaskScript(task, sandbox);
            expect(sandbox.executeScript).toBeCalledWith(task.script, `scheduled_task/${task.id}/script`);
          });
        });
      });
    });
  });
});
