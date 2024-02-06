import moment from 'moment';

import TaskPerformer from '../task.js';
import * as HELPERS from '../../helpers/helpers.js';
import * as EXECUTE from '../../helpers/execute.js';
import * as VALIDATE from '../../helpers/validate.js';

const { manager } = h.record;
const now = new Date();

beforeAll(async () => {
  t.model = await manager('model').create();
  t.field = await manager('field').create({ model: t.model.id, type: 'string' });
  t.record = await manager(t.model.alias).create();

  t.createSTask = (attributes = {}) => manager('scheduled_task').create({
    model: t.model.id,
    target_field: t.field.id,
    ...attributes,
  });
  t.createPTask = (attributes = {}) => manager('planned_task').create({
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
    describe('Planned Manager', () => {
      describe('TaskPerformer', () => {
        describe('process(task)', () => {
          it('Should not process tasks with start_at in the past', async () => {
            const sche = await t.createSTask({ start_at: moment().subtract(1, 'day') });
            const task = await db.model('planned_task').where({ scheduled_task: sche.id, status: 'new' }).getOne();

            expect(task).not.toBeDefined();
          });
          it('Should process tasks with start_at in the past and reenable_type not equal no_reenable', async () => {
            const sche = await t.createSTask({ start_at: moment().subtract(1, 'day'), reenable_type: 'days' });
            const task = await db.model('planned_task').where({ scheduled_task: sche.id, status: 'new' }).getOne();

            expect(task).toBeDefined();
          });
          it('Should process tasks with start_at in the future', async () => {
            const sche = await t.createSTask({ start_at: moment().add(1, 'day') });
            const task = await db.model('planned_task').where({ scheduled_task: sche.id, status: 'new' }).getOne();

            expect(task).toBeDefined();
          });
          it('Should process tasks with active scheduled task', async () => {
            const sche = await t.createSTask({ start_at: moment().subtract(1, 'day'), reenable_type: 'minutes' });
            const task = await db.model('planned_task').where({ scheduled_task: sche.id, status: 'new' }).getOne();

            jest.spyOn(HELPERS, 'changeStatus');
            jest.spyOn(EXECUTE, 'executeTaskScript');

            await new TaskPerformer(sche, sandbox).process(task);

            expect(HELPERS.changeStatus).toBeCalledWith(task, 'in_progress');
            expect(HELPERS.changeStatus).toBeCalledWith(task, 'completed');
            expect(EXECUTE.executeTaskScript).toBeCalled();

            const pTasks = await db.model('planned_task').where({ scheduled_task: sche.id, status: 'new' });

            expect(pTasks).toHaveLength(0);
          });
          it('Should process tasks with reenabled scheduled task', async () => {
            const sche = await t.createSTask({ re_enable_after: 1 });
            const task = await t.createPTask({ scheduled_task: sche.id });

            jest.spyOn(HELPERS, 'changeStatus');
            jest.spyOn(EXECUTE, 'executeTaskScript');
            jest.spyOn(TaskPerformer.prototype, 'reenable');

            await new TaskPerformer(sche, sandbox).process(task);

            expect(HELPERS.changeStatus).toBeCalledWith(task, 'in_progress');
            expect(HELPERS.changeStatus).toBeCalledWith(task, 'completed');
            expect(EXECUTE.executeTaskScript).toBeCalled();
            expect(TaskPerformer.prototype.reenable).toBeCalled();
          });
          it('Should not process tasks with not active scheduled task', async () => {
            const sche = await t.createSTask({ active: false });
            const task = await t.createPTask({ scheduled_task: sche.id });

            jest.spyOn(HELPERS, 'changeStatus');
            jest.spyOn(EXECUTE, 'executeTaskScript');

            await new TaskPerformer(sche, sandbox).process(task);

            expect(HELPERS.changeStatus).not.toBeCalledWith(task, 'in_progress');
            expect(HELPERS.changeStatus).not.toBeCalledWith(task, 'completed');
            expect(EXECUTE.executeTaskScript).not.toBeCalledWith(sche);
          });
        });
        describe('reenable()', () => {
          it('Should not reenable scheduled task if no reeanable value', async () => {
            const sche = await t.createSTask();
            const task = await t.createPTask({ scheduled_task: sche.id });

            jest.spyOn(VALIDATE, 'validateTaskUniqueness');

            await new TaskPerformer(sche, sandbox).reenable();
            const tasks = await db.model('planned_task').where({ status: 'new', scheduled_task: task.scheduled_task, model: task.model, record: task.record });

            expect(VALIDATE.validateTaskUniqueness).toBeCalledWith(sche);
            expect(tasks.length).toEqual(1);
          });
        });
      });
    });
  });
});
