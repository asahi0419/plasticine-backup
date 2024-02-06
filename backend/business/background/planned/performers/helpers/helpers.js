import db from '../../../../../data-layer/orm/index.js';
import { sandboxFactory } from '../../../../sandbox/factory.js';

export const createRecordManager = async () => {
  const user = await db.model('user').where({ name: 'System', surname: 'Planned tasks' }).getOne();
  const sandbox = await sandboxFactory(user);

  return db.model('planned_task', sandbox).getManager(false);
};

export const changeStatus = async (record, status) => {
  const manager = await createRecordManager();

  return manager.update(record, { status });
};

export const processError = (error, ErrorClass) => {
  if (error.name === 'ScriptTimeoutError') {
    throw error;
  } else {
    throw new ErrorClass(error.message, error.stack);
  }
}

export const isFieldAlias = RegExp.prototype.test.bind(/^[a-zA-Z_]+$/);

export const executeByUser = async (task, record, fieldId) => {
  const field = await db.model('field').where({ id: fieldId, __inserted: true }).getOne();

  if (!field) return;
  if (!record[field.alias]) return;

  const user = await db.model('user').where({ id: record[field.alias] }).getOne();
  if (user) task.created_by = user.id;
};
