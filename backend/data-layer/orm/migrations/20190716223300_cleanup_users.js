/* eslint-disable */

import getTableName from './helpers/table-name.js';
const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex) => {
  const [ usersModel ] = await knex(modelsTableName).where({ alias: 'user' });
  const [ accountsModel ] = await knex(modelsTableName).where({ alias: 'account' });
  const [ scheduledTasksModel ] = await knex(modelsTableName).where({ alias: 'scheduled_task' });
  const [ plannedTasksModel ] = await knex(modelsTableName).where({ alias: 'planned_task' });

  const usersTableName = getTableName({ id: usersModel.id, type: 'core' });
  const accountsTableName = getTableName({ id: accountsModel.id, type: 'core' });

  const [ eUser ] = await knex(usersTableName).where({ surname: 'Escalation' });
  const [ sUser ] = await knex(usersTableName).where({ surname: 'Scheduled' });

  if (eUser) {
    await knex(usersTableName)
      .where({ surname: eUser.surname })
      .update({ surname: 'Planned tasks' });

    await knex(accountsTableName)
      .where({ email: 'escalations@free.man' })
      .update({ email: 'planned_tasks@free.man' });
  }

  if (sUser) {
    await knex(usersTableName).where({ surname: 'Scheduled' }).delete();
    await knex(accountsTableName).where({ email: 'scheduled_tasks@free.man' }).delete();
  }

  if (eUser && sUser) {
    if (scheduledTasksModel) {
      const scheduledTasksTableName = getTableName({ id: scheduledTasksModel.id, type: 'core' });

      await knex(scheduledTasksTableName).where({ created_by: sUser.id }).update({ created_by: eUser.id });
      await knex(scheduledTasksTableName).where({ updated_by: sUser.id }).update({ updated_by: eUser.id });
    }

    if (plannedTasksModel) {
      const plannedTasksTableName = getTableName({ id: plannedTasksModel.id, type: 'core' });

      await knex(plannedTasksTableName).where({ created_by: sUser.id }).update({ created_by: eUser.id });
      await knex(plannedTasksTableName).where({ updated_by: sUser.id }).update({ updated_by: eUser.id });
    }
  }
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
