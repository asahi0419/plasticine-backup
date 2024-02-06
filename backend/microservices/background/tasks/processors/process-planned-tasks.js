import db from '../../../../data-layer/orm/index.js';
import logger from '../../../../business/logger/index.js';
import PlannedManager from '../../../../business/background/planned/index.js';
import { sandboxFactory } from '../../../../business/sandbox/factory.js';

export default async (job = {}) => {
  const task = job.data;

  if (!task.scheduled_task && !task.escalation_rule) return;
  if (task.status === 'cancelled') return;

  try {
    const user = await db.model('user').where({ id: task.created_by }).getOne() ||
                 await db.model('user').where({ name: 'System', surname: 'Planned tasks' }).getOne();
    const sandbox = await sandboxFactory(user);

    const type = task.scheduled_task ? 'scheduled_task' : 'escalation_rule';
    const exec = { ...await db.model(type).where({ id: task[type] }).getOne(), __type: type };

    const startTime = new Date();
    logger.info(`Start planned task #${task.id}`);

    await new PlannedManager(exec, sandbox).perform('process', task);

    const endTime = (new Date() - startTime) / 1000;
    logger.info(`Finish planned task #${task.id}: ${endTime} sec`);
  } catch (error) {
    logger.error(error);
  }
};
