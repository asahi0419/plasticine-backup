import db from '../../../../../../data-layer/orm/index.js';

export default async () => {
  const settings = await db.model('setting').select('alias', 'value');

  return settings.reduce((result, { alias, value }) => {
    result[alias] = value;
    return result;
  }, {});
};
