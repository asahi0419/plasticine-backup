import db from '../../../../data-layer/orm/index.js';

export default (model, recordIds) => {
  return db.model('planned_task').where({ model: model.id }).whereIn('record', recordIds).delete();
};
