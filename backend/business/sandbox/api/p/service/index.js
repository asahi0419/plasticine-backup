import { uniq, map } from 'lodash-es';

import { referencedFields, modelReferences } from './helpers.js';

const referencedModelIds = (modelId) => referencedFields(modelId)
  .then(fields => map(fields, 'model'))
  .then(uniq);

const referencedFieldIds = (modelId) => referencedFields(modelId)
  .then(fields => map(fields, 'id'))
  .then(uniq);

export default (sandbox) => ({
  referencedModelIds,
  referencedFieldIds,
  modelReferences: modelReferences(sandbox),
});
