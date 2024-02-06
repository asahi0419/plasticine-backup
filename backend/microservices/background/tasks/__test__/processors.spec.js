import { omit } from 'lodash-es';

import logger from '../../../../business/logger/index.js';
import PlannedManager from '../../../../business/background/planned/index.js';
import * as HELPERS from '../../../../business/background/planned/performers/helpers/helpers.js';
import * as SESSION from '../../../../business/user/session.js';
import { getSetting } from '../../../../business/setting/index.js';

import autoLogoutProcessor from '../processors/auto-logout.js';
import fetchPlannedTasksProcessor from '../processors/fetch-planned-tasks.js';
import processPlannedTasksProcessor from '../processors/process-planned-tasks.js';

const { manager } = h.record;
const now = new Date();

afterEach(() => {
  jest.clearAllMocks();
});

describe('Microservices', () => {
  describe('Background', () => {
    describe('Processors', () => {
      describe('Autologout', () => {
        it('Should close old sessions', async () => {
          const min = getSetting('session.autologout_after_idle_min') + 1;
          const activity = new Date(new Date() - min * 60 * 1000);
          const attributes = { last_activity_at: activity };
          const session = omit(await manager('session').create(attributes), ['__type']);

          jest.spyOn(logger, 'info');
          jest.spyOn(SESSION, 'closeSession');

          await db.model('user').where({ id: sandbox.user.id }).update({ autologout: true });
          await autoLogoutProcessor();

          expect(logger.info).toBeCalledWith(`Autologout (1 sessions)`);
          expect(SESSION.closeSession).toBeCalledWith(session, { reason_to_close: 'auto' }, { ...sandbox.user, autologout: true });
        });
        it('Should not close new sessions', async () => {
          const min = getSetting('session.autologout_after_idle_min') - 1;
          const activity = new Date(new Date() - min * 60 * 1000);
          const attributes = { last_activity_at: activity };
          const session = omit(await manager('session').create(attributes), ['__type']);

          jest.spyOn(logger, 'info');
          jest.spyOn(SESSION, 'closeSession');
          await db.model('user').where({ id: sandbox.user.id }).update({ autologout: false });

          await autoLogoutProcessor();

          expect(logger.info).toBeCalledWith(`Autologout (0 sessions)`);
          expect(SESSION.closeSession).not.toBeCalledWith(session, { reason_to_close: 'auto' }, { ...sandbox.user, autologout: false });
        });
      });
      describe('Planned tasks fetcher', () => {
        it('Should enqueue escalation rules', async () => {
          const queue = { add: jest.fn() };
          const fetch = fetchPlannedTasksProcessor(queue);

          const attributes = { scheduled_on: now, escalation_rule: 1 };
          const task = omit(await manager('planned_task').create(attributes), ['__type', 'timeout_attempts']);

          jest.spyOn(queue, 'add');
          jest.spyOn(logger, 'info');
          jest.spyOn(HELPERS, 'changeStatus');

          await fetch();

          expect(logger.info).toBeCalledWith(`Fetching planned tasks (1 new)`);
          expect(HELPERS.changeStatus).toBeCalledWith(task, 'enqueued');
          expect(queue.add).toBeCalledWith(task);
          expect(logger.info).toBeCalledWith(`Added planned task #${task.id} to processing queue`);
        });
        it('Should enqueue scheduled tasks', async () => {
          const queue = { add: jest.fn() };
          const fetch = fetchPlannedTasksProcessor(queue);

          const attributes = { scheduled_on: now, scheduled_task: 1 };
          const task = omit(await manager('planned_task').create(attributes), ['__type', 'timeout_attempts']);

          jest.spyOn(queue, 'add');
          jest.spyOn(logger, 'info');
          jest.spyOn(HELPERS, 'changeStatus');

          await fetch();

          expect(logger.info).toBeCalledWith(`Fetching planned tasks (1 new)`);
          expect(HELPERS.changeStatus).toBeCalledWith(task, 'enqueued');
          expect(queue.add).toBeCalledWith(task);
          expect(logger.info).toBeCalledWith(`Added planned task #${task.id} to processing queue`);
        });
      });
      describe('Planned tasks processor', () => {
        it('Should process planned tasks', async () => {
          let task;

          jest.spyOn(PlannedManager.prototype, 'perform');
          jest.spyOn(logger, 'info');

          task = { id: 1, scheduled_task: 1 };
          await processPlannedTasksProcessor({ data: task });

          expect(logger.info).toBeCalledWith(`Start planned task #${task.id}`);
          expect(PlannedManager.prototype.perform).toBeCalledWith('process', task);

          task = { id: 2, escalation_rule: 1 };
          await processPlannedTasksProcessor({ data: task });

          expect(logger.info).toBeCalledWith(`Start planned task #${task.id}`);
          expect(PlannedManager.prototype.perform).toBeCalledWith('process', task);

          task = { id: 3 };
          await processPlannedTasksProcessor({ data: task });

          expect(logger.info).not.toBeCalledWith(`Start planned task #${task.id}`);
          expect(PlannedManager.prototype.perform).not.toBeCalledWith('process', task);
        });
        it('Should not process planned tasks with cancelled status', async () => {
          const task = { id: 1, status: 'cancelled' };

          jest.spyOn(PlannedManager.prototype, 'perform');
          jest.spyOn(logger, 'info');

          await processPlannedTasksProcessor({ data: task });

          expect(logger.info).not.toBeCalledWith(`Start planned task #${task.id}`);
          expect(PlannedManager.prototype.perform).not.toBeCalledWith(task);
        });
      });
    });
  });
});
