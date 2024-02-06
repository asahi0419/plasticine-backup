// jsonapi-normalizer
// https://www.npmjs.com/package/jsonapi-normalizer

export default (response) => {
  let data;

  if (Array.isArray(response.data)) {
    data = response.data;
  } else {
    data = [ response.data ];
  }

  const included = response.included || [];

  const allResources = [...data, ...included];
  const result = {};
  const entities = {};

  allResources.forEach((entity, i) => {
    addResult(result, entity, i);
    addEntity(entities, entity, i);
  });

  return {
    result,
    entities,
  };
};

function addResult(result, entity, i) {
  const { type, id = i + 1 } = entity;
  if (!result[type]) result[type] = [];
  result[type].push(id);
}

function addEntity(entities, entity, i) {
  const {
    type, id = i + 1, attributes, human_attributes = {},
    extra_attributes, extra_fields, counts, inserted,
  } = entity;

  if (!entities[type]) entities[type] = {};

  entities[type][id] = {
    id,
    ...attributes,
    __metadata: {
      relationships: extractRelationships(entity),
      human_attributes,
      extra_attributes,
      extra_fields,
      counts,
      inserted,
    },
  };

  return entities;
}

function extractRelationships(entity) {
  const { relationships: responseRelationships } = entity;

  if (!responseRelationships) return undefined;

  const relationships = {};

  Object.keys(responseRelationships).map(type => {
    relationships[type] = duplicateRelationships(responseRelationships[type].data);
  });

  return relationships;
}

function duplicateRelationships(relationships) {
  if (Array.isArray(relationships)) {
    return [ ...relationships ];
  } else {
    return { ...relationships };
  }
}
