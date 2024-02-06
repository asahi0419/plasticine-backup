import Promise from 'bluebird';
import moment from 'moment';

import * as HELPERS from '../planned-tasks.js';
import { sandboxFactory } from '../../../../../business/sandbox/factory.js';
import PlannedManager from '../../../../../business/background/planned/index.js';

const { manager } = h.record;

const NOW_1 = moment();
const NOW_2 = moment(NOW_1).add(1, 'day');

beforeAll(async () => {
  const user = await db.model('user').where({ name: 'System', surname: 'Planned tasks' }).getOne();
  t.manager = db.model('planned_task', await sandboxFactory(user));

  t.model = await manager('model').create();
  t.field = await manager('field').create({ model: t.model.id, type: 'datetime' });
  t.record = await manager(t.model.alias).create({ [t.field.alias]: NOW_2 });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Microservices', () => {
  describe('Background', () => {
    describe('Sync', () => {
      describe('Planned tasks', () => {
        describe('syncS', () => {
          it('Should properly run', async () => {
            const scheduledTask = {
              start_at: new Date(),
              id: 1,
            };

            jest.spyOn(Promise, 'each');
            jest.spyOn(PlannedManager.prototype, 'perform');

            await HELPERS.syncS(sandbox, [scheduledTask]);

            expect(Promise.each).toBeCalledWith([scheduledTask], expect.any(Function));
            expect(PlannedManager.prototype.perform).toBeCalledWith('create');
          });
        });

        describe('syncE', () => {
          it('Should properly run', async () => {
            const escalationRule = await manager('escalation_rule').create({
              target_field: t.field.id,
              model: t.model.id,
            });
            const plannedTask = await manager('planned_task').create({
              escalation_rule: escalationRule.id,
            });

            jest.spyOn(Promise, 'each');
            jest.spyOn(PlannedManager.prototype, 'perform');

            await HELPERS.syncE(sandbox, [escalationRule], [plannedTask]);

            expect(Promise.each).toBeCalledWith([plannedTask], expect.any(Function));
            expect(PlannedManager.prototype.perform).toBeCalledWith('reenable', plannedTask);
          });
        });
      });
    });
  });
});
