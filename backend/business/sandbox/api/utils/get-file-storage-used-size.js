import db from '../../../../data-layer/orm/index.js';

export default (sandbox) => async () => {
  try {
    const [ result ] = await db.model('attachment').where({ __inserted: true }).sum('file_size');

    return result.sum / (1024 * 1024);
  } catch (error) {
    logger.error(error);
  }
};
