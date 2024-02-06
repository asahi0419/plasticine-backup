import lodash from 'lodash-es'

import db from '../../../../../data-layer/orm/index.js';

export async function findFirstAvailableResource(modelAlias, resourceAlias, sandbox, query) {
  const modelsTableName = db.model('model').tableName;
  const resourceTableName = db.model(resourceAlias).tableName;

  const scope = db.model(resourceAlias)
    .select([`${resourceTableName}.*`])
    .leftJoin(modelsTableName, `${resourceTableName}.model`, `${modelsTableName}.id`)
    .where(`${modelsTableName}.alias`, '=', modelAlias)
    .orderBy(`${resourceTableName}.order`, 'desc', { nulls: 'first' })

  if (query) {
    lodash.each(query, (value, column) => {
      scope.andWhere(`${resourceTableName}.${column}`, '=', value)
    })
  }

  const resources = await scope

  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    if (sandbox.executeScript(resource.condition_script, `${resourceAlias}/${resource.id}/condition_script`, { modelId: resource.model })) {
      return resource;
    }
  }

  return null;
};

export function prepareGoBackOptions(context = {}, options = {}) {
  const { params = {}, body = {}, modelProxy } = context.request || {};
  const { modelAlias, actionAlias } = params;

  if (modelProxy) {
    options.model = modelProxy.alias;
    if (modelProxy.alias == 'privilege' && body.model) {
      options.filter = encodeURIComponent(`\`model\`=${body.model}`);
    }
  }

  if (actionAlias === 'delete') {
    const { record = {} } = body;
    const { id: recordId } = record;

    if (recordId) options.removed_record = { modelAlias, recordId };
  }

  return options;
};
