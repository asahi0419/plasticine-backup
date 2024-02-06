import db from '../../../../data-layer/orm/index.js';
import logger from '../../../../business/logger/index.js';

export default async (job) => {
  const timeStart = new Date();
  const models = await db.model('model').where({});

  await Promise.all(models.map(vacuumModel))

  logger.info(`Vacuum records (${(new Date() - timeStart) / 1000} sec)`);
};

function vacuumModel(model) {
  return db.model(model.alias)
    .where({ __inserted: false })
    .where('created_at', '<=', new Date(new Date() - 24 * 60 * 60 * 1000))
    .delete();
}
