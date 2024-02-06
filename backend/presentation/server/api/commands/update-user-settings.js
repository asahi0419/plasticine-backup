import { pickBy, mergeWith, isPlainObject, identity } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import Flags from '../../../../business/record/flags.js';
import { parseOptions } from '../../../../business/helpers/index.js';

const FLAGS = new Flags({ check_permission: false });

export default async (req, res) => {
  const { sandbox, model, record, user, body } = req;

  try {
    const attributes = getAttributes(req, model, record);
    const userSetting = await getUserSetting(sandbox, attributes);
    const options = mergeWith(parseOptions(userSetting.options), body.options, mergeStrategy);
    const result = await updateUserSetting(sandbox, userSetting, options);

    res.json({ data: result });
  } catch (error) {
    res.error(error);
  }
};

const getAttributes = (req, model, record) => {
  return pickBy({
    user: req.user.id,
    type: req.body.type,
    model: model.id,
    record_id: record.id,
  }, identity);
}

const getUserSetting = async (sandbox, attributes) => {
  const result =
    await db.model('user_setting').where(attributes).getOne() ||
    await db.model('user_setting', sandbox).createRecord(attributes, FLAGS);

  return result;
};

const updateUserSetting = async (sandbox, userSetting, options) => {
  return db.model('user_setting', sandbox).updateRecord(userSetting, { options }, FLAGS);
};

const mergeStrategy = (objValue, srcValue) => {
  if (isPlainObject(srcValue)) return mergeWith(objValue, srcValue, (o, s) => s);
  return srcValue;
};
