import Promise from 'bluebird';
import { isString } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  return Promise.map(records, async (record) => {
    const manager = await db.model('privilege', sandbox).getManager(mode !== 'seeding');
    return processPrivilege({ ...record, model: model.id }, manager);
  });
};

async function processPrivilege(attributes, manager) {
  attributes.owner_id = await getOwnerId(attributes.owner_type, attributes.owner_id);

  const record = await db.model('privilege').where({
    model: attributes.model,
    level: attributes.level,
    owner_type: attributes.owner_type,
    owner_id: attributes.owner_id,
  }).getOne();

  if (!record) return manager.create(attributes);
}

async function getOwnerId(ownerType, ownerId) {
  if (!ownerId) return null;
  if (ownerType === 'user_group') return getUserGroupId(ownerId);

  return ownerId;
}

async function getUserGroupId(id) {
  if (!isString(id)) return id;
  const userGroup = await db.model('user_group').where({ alias: id }).getOne();
  return userGroup ? userGroup.id : 1;
}
