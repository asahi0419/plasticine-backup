import db from '../../../../data-layer/orm/index.js';
import { RecordNotFoundError } from '../../../../business/error/index.js';

export default async (req = {}, res) => {
  const { body = {}, query = {}, model, sandbox } = req;
  const { data = {} } = body;
  const { attributes = {} } = data;

  try {
    let record;

    if (attributes.__inserted === false) {
      const manager = await db.model(model, sandbox).getManager()
      if (query.system_actions) manager.setSystemActions(query.system_actions)

      record = await manager.build(attributes, true, true);
    } else {
      if (attributes.id) {
        record = await db.model(model).where({ id: attributes.id }).getOne();
        if (!record) throw new RecordNotFoundError();
        record = await db.model(model, sandbox).updateRecord(record, attributes);
      } else {
        record = await db.model(model, sandbox).createRecord(attributes);
      }
    }

    res.serialize(record);
  } catch (error) {
    res.error(error);
  }
}
