import db from '../../../../../data-layer/orm/index.js';

export default async (req, res) => {
  try {
    const fields = await db.model('field')
      .where({ __inserted: true, virtual: false })
      .whereIn('model', req.query.modelIds)
      .whereNotIn('alias', ['id', 'created_by', 'created_at', 'updated_by', 'updated_at']);

    res.json({ data: fields });
  } catch (error) {
    res.error(error);
  }
};
