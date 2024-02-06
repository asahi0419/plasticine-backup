import lodash from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import { sandboxFactory } from '../../../business/sandbox/factory.js';
import Selector from '../../../business/record/fetcher/selector.js';
import ModelProxy from '../../../business/sandbox/api/model/index.js';
import QueryBuilder from '../../../business/sandbox/api/query/builder.js';
import { getSetting } from '../../../business/setting/index.js';
import { ParamsNotValidError, OverlimitTopologyViewNodesMax } from '../../../business/error/index.js';
import { checkAccess } from '../../../business/security/index.js';

// There are 3 "types": source, target, edge

export const build = async (req, res) => {
  try {
    const graph = await buildData(req.body, req);
    res.json({ data: { graph } });
  } catch(error) {
    if (error.name == 'OverlimitTopologyViewNodesMax') {
      res.json({ error });
    } else {
      res.error(error);
    }
  }
}

export const buildData = async (body, req = null) => {
  let result = {
    id: "gr0",
    properties: { edges_shape: 'rounded_elbow' },
    nodes: [],
    edges: []
  };

  await processJson(body, result, req);

  return result;
}

const getRecords = async (modelAlias, filter, sandbox) => {
  const where = lodash.isObject(filter) ? filter : {};
  const model = await db.getModel(modelAlias);
  const modelAccess = await checkAccess('model', model, sandbox);
  if (!modelAccess) return [];

  const modelProxy = new ModelProxy(model, sandbox);
  modelProxy.setOptions({preload_data: true});
  const selectorScope = new Selector(model, sandbox).defaultScope();
  const queryBuilder = new QueryBuilder(modelProxy, selectorScope);
  return await queryBuilder.limit(getLimit()).find(where);
}

const processJson = async (body, result, req) => {
  const { inJson, userEmail } = body;
  const sandbox = await sandboxFactory(userEmail);
  const sourceObj = getByType(inJson, 'source');
  const targetObj = getByType(inJson, 'target');
  const edge = getByType(inJson, 'edge');

  if (lodash.isEmpty(sourceObj)) { // case 1 - no sources, generate only by 'targets', ignore 'edges'
    await processRecords(lodash.keys(targetObj)[0], inJson, result, req, sandbox);
  } else {
    if (lodash.isEmpty(targetObj)) { // case 5 - no targets
      await processRecords(lodash.keys(sourceObj)[0], inJson, result, req, sandbox);
    } else {
      let sourceAlias = lodash.keys(sourceObj)[0];
      const { source = {} } = sourceObj[sourceAlias];
      if (lodash.isEmpty(source.ref)) { // case 2 - no refs
        // select source and target as nodes
        await processRecords(lodash.keys(sourceObj)[0], inJson, result, req, sandbox);
        await processRecords(lodash.keys(targetObj)[0], inJson, result, req, sandbox);
        if (!lodash.isEmpty(edge)) { // select and join edges with sources and targets
          await processRecords(lodash.keys(edge)[0], inJson, result, req, sandbox, sourceObj, targetObj);
        }
      } else { // case 3 - refs and edges
        // Select sources and join with targets
        await processRecords(lodash.keys(sourceObj)[0], inJson, result, req, sandbox, {}, targetObj);
        if (!lodash.isEmpty(edge)) {
          // Select and join edges with sources and targets
          await processRecords(lodash.keys(edge)[0], inJson, result, req, sandbox, sourceObj, targetObj);
        }
      }
    }
  }
}

const getByType = (inJson, type) => {
  const result = {};
  for (let modelAlias in inJson) {
    if (inJson[modelAlias].type === type) {
      result[modelAlias] = inJson[modelAlias];
    }
  }
  return result;
}

const processRecords = async (modelAlias, inJson, result, req, sandbox, sourceObj = {}, targetObj = {}) => {
  const { type, label, source = {}, target = {}, properties = {}, filter } = inJson[modelAlias];
  const records = await getRecords(modelAlias, filter, sandbox);
  if (lodash.isEmpty(records)) return;

  let sourceRecords = [];
  let sourceModelAlias;
  let targetRecords = [];
  let targetModelAlias;

  if ((type == 'source' && !lodash.isEmpty(source.ref)) || type == 'edge') {
    sourceModelAlias = getForeignAlias(records, source.ref, `source.ref in ${type}`);
    sourceRecords = await getRecordsByRef(records, sourceModelAlias, source.ref, sandbox);
    if (type == 'edge') {
      targetModelAlias = getForeignAlias(records, target.ref, `target.ref in ${type}`);
      targetRecords = await getRecordsByRef(records, targetModelAlias, target.ref, sandbox);
    }
  }

  for (let i in records) {
    let record = records[i];

    if (type == 'target') {
      generateNode(label, record, result, properties, req);
    } else if (type == 'source') {
      if (lodash.isEmpty(source.ref)) {
        generateNode(label, record, result, properties, req);
      } else {
        if (!lodash.isEmpty(targetObj[sourceModelAlias])) { // case 4 - if ref has proper target type defined
          const sourceRecord = sourceRecords[record.attributes[source.ref]];
          // join INNER by default
          if (!lodash.isEmpty(sourceRecord)) {
            generateNode(label, record, result, properties, req);
            generateNode(source.label, sourceRecord[0], result, targetObj[sourceModelAlias].properties, req);
          }
        }
      }
    } else if (type == 'edge') {
      const sourceRecord = sourceRecords[record.attributes[source.ref]];
      const targetRecord = targetRecords[record.attributes[target.ref]];

      if (!lodash.isEmpty(sourceObj[sourceModelAlias]) && !lodash.isEmpty(targetObj[targetModelAlias])) {
        // join INNER by default
        if (!lodash.isEmpty(sourceRecord) && !lodash.isEmpty(targetRecord)) {
          generateEdge(record, source.label, sourceRecord[0], target.label, targetRecord[0], properties, result);
        }
      }
    }
  }
}

const getForeignAlias = (records, ref, jsonType) => {
  const field = lodash.find(records[0].fields, { alias: ref });
  if (lodash.isEmpty(field)) {
    throw new ParamsNotValidError(`Wrong ${jsonType} in p.utils.buildGraphByModelData()`);
    return;
  }
  return field.foreign_model.alias;
}

const getRecordsByRef = async (records, foreignAlias, ref, sandbox) => {
  if (lodash.isEmpty(foreignAlias)) return;
  let foreignIds = lodash.map(records, ({attributes}) => attributes[ref]);
  foreignIds = lodash.filter(foreignIds, el => !lodash.isNull(el));
  const found = await getRecords(foreignAlias, `id in (${foreignIds})`, sandbox);
  return lodash.groupBy(found, 'id');
}

const generateNode = (labelForm, record, result, properties = {}, req) => {
  validateLimit(result, req);

  const id = formRecId(record);
  if (lodash.find(result.nodes, { id })) return;

  const label = generateLabel(labelForm, record);
  const text = { position: 'top', align: 'center', size: 10, color: '#606060', label, ...properties.text };
  const icon = { type: 'fa', source: 'home', color: '#416793', ...properties.icon };
  
  result.nodes.push({
    id,
    ref: {[record.model.id]: record.id},
    properties: { ...properties, text, icon }
  });
}

const generateEdge = (edgeRecord, sourceLab, sourceRec, targetLab, targetRec, properties = {}, result) => {
  const sourceId = formRecId(sourceRec);
  const targetId = formRecId(targetRec);
  const id = `${sourceId}-${targetId}`;

  if (lodash.find(result.edges, { id })) return;

  const label = `${generateLabel(sourceLab, sourceRec)} - ${generateLabel(targetLab, targetRec)}`;

  const { width = 2, line_start = 'no', line_end = 'no', color = '#606060' } = properties;
  const text = { position: 'top', size: 10, color: '#606060', label, ...properties.text };

  result.edges.push({
    id,
    ref: {[edgeRecord.model.id]: edgeRecord.id},
    properties: {
      source: sourceId,
      target: targetId,
      text,
      color,
      width,
      line_start,
      line_end
    }
  });
}

const formRecId = (rec) => {
  return `${rec.model.id}-${rec.id}`;
}

const generateLabel = (label, record) => {
  const fieldAliases = label.match(/{{(.*?)}}/g);
  let str = label;
  lodash.map(fieldAliases, el => {
    const fieldAlias = el.replace(/{{|}}/g, '');
    const val = recordHumanAttribute(fieldAlias, record);
    str = str.replace(el, val || '');
  });
  return str;
}

const recordHumanAttribute = (fieldAlias, record) => {
  return record.humanizedAttributes[fieldAlias] || record.attributes[fieldAlias];
}

const validateLimit = (result, req) => {
  const amount = result.nodes.length;
  const max = getLimit();
  if (amount > max) {
    throw new OverlimitTopologyViewNodesMax(req.t('static.overlimit_topology_view_nodes_max', { amount, max }));
  }
}

const getLimit = () => {
  const limits = getSetting('limits');
  return limits.topology_view_nodes_max;
}