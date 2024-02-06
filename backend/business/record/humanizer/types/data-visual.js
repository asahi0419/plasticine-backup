import db from '../../../../data-layer/orm/index.js';
import humanizer from '../index.js';

export default (field, sandbox) => async (value) => {
  if (!field.__alias) return;

  const [dvfAlias, dtfAlias, dataModelAlias, dataFieldAlias] = field.__alias.replace('__dvf__', '').split('/');
  const dataModel = db.getModel(dataModelAlias);
  const dataField = await db.model('field').where({ model: dataModel.id, alias: dataFieldAlias }).getOne();

  return humanizer(dataField, sandbox)(value);
};
