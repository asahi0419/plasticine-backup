import { map, filter, each, find, uniq, uniqBy, compact, set, pickBy, identity } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import Selector from './selector.js';
import Sorter from './sorter.js';
import Paginator from './paginator/index.js';
import humanizer from './humanizer/index.js';
import { getPermittedFields } from '../../security/permissions.js';
import { RecordNotFoundError } from '../../error/index.js';

import loadCounts from './loaders/count.js';
import loadRTLs from './loaders/rtl.js';
import loadGRCs from './loaders/grc.js';
import loadTemplates from './loaders/template.js';
import loadAssociations from './loaders/associations/index.js';
import loadExtraFields from './loaders/extra-fields.js';
import getExternalDataLoader from './loaders/external.js';

export default class {
  constructor(model, sandbox, params) {
    this.params = params;
    this.context = { fieldset: [] };
    this.result = { meta: {}, records: [], included: [] };

    this.__getModel = () => model;
    this.__getSandbox = () => sandbox;
  }

  get model() {
    return this.__getModel();
  }

  get sandbox() {
    return this.__getSandbox();
  }

  async fetch() {
    const loadExternalData = await getExternalDataLoader();
    const { id_required, sort = 'id', page, sql_debug } = this.params;

    this.fields = await getPermittedFields(this.model, this.sandbox, { filter: { virtual: false } });
    if (id_required && !find(this.fields, { alias: 'id' })) throw new RecordNotFoundError();

    let result = await selectWithFilter(this);
    
    if (![false, 'false'].includes(page)){
      result = applyPaginator(result.scope, page, this);
    }
    
    result = await applySorter(result.scope, sort, this);
    // result = cleanupScope(result.scope);
    
    let rows = await applyFieldsetLimiter(result.scope, this);
    
    if ([true, 'true'].includes(sql_debug)) {
      this.result.meta.sql = result.scope.toString();
    }
    
    rows = await translateRecords(rows, this);
    rows = await processRecords(rows, this);
    rows = await loadCounts(rows, this);
    rows = await loadExtraFields(rows, this);
    rows = await loadExternalData(rows, this, db);
    rows = await preloadRTLs(rows, this);
    rows = await preloadGRCs(rows, this);
    rows = await preloadTemplates(rows, this);
    
    await loadAssociations(this);
    await humanizer(this);
    await postProcess(this);
    
    return this.result;
  }
}

// function cleanupScope(scope) {
//   const statements = scope._statements;
//   const joinClauses = statements.filter(s => s.constructor.name === 'JoinClause');
//   const uniqJoins = uniqWith(joinClauses, isEqual);
//   const newStatements = statements.filter(s => s.constructor.name !== 'JoinClause')
//     .concat(uniqJoins);

//   scope._statements = newStatements;
//   return { scope };
// }

async function selectWithFilter({ model, sandbox, params, result }) {
  const options = {
    includeNotInserted: !!params.full_set,
    ignorePermissions: params.ignore_permissions,
    dateTruncPrecision: params.date_trunc,
  };

  const { scope } = await new Selector(model, sandbox, options)
    .getScope(params.filter, params.hidden_filter);

  result.meta.filter = params.filter;
  return { scope };
}

function applyPaginator(scope, page, { result: { meta } }) {
  const result = new Paginator().apply(page).to(scope);

  meta.total_size = result.totalCount;
  meta.page_size = result.pageSize;
  meta.page_number = result.pageNumber;

  return { scope: result.scope };
}

function applySorter(scope, sort, { model, fields, result, sandbox }) {
  result.meta.sort = sort;
  return new Sorter(model, fields, sandbox).apply(sort).to(scope);
}

function applyFieldsetLimiter(scope, { model, params, fields, context }) {
  const modelTableName = db.model(model).tableName;

  const availableFields = fields.filter(f => !db.schema.VIRTUAL_FIELDS.includes(f.type));
  const availableFieldsAliases = [ ...map(availableFields, 'alias'), '__inserted' ];
  const availableModelFieldsAliases = map(availableFieldsAliases, (field) => `${modelTableName}.${field}`);

  if (params.full_fieldset) return scope.select(availableModelFieldsAliases);

  context.fieldset = compact(((params.fields || {})[`_${model.alias}`] || '').split(','));
  const fieldset = context.fieldset.filter(f => availableFieldsAliases.includes(f));

  if (!fieldset.length) return scope.select(availableModelFieldsAliases);

  find(fields, { alias: 'id' }) && fieldset.push('id');
  scope.select(uniq(fieldset).map(field => `${modelTableName}.${field}`));

  return scope;
}

function translateRecords(records, fetcher) {
  const translatableFields = filter(fetcher.fields, { __translated: true });
  if (!translatableFields.length) return records;
  return fetcher.sandbox.translate(records, fetcher.model.alias, map(translatableFields, 'alias'));
}

function preloadRTLs(rows, fetcher) {
  const options = {
    sandbox: fetcher.sandbox,
    fieldset: fetcher.context.fieldset,
  };

  const fields = filter(fetcher.fields, { type: 'reference_to_list' });
  if (!fields.length) return rows;

  return loadRTLs(rows, fetcher.model, { ...options, fields })
    .then(({ rtlFields, preloadedRTLRecords }) => {
      fetcher.rtlFields = rtlFields;
      fetcher.preloadedRTLRecords = preloadedRTLRecords;

      return rows;
    });
}

function preloadGRCs(rows, fetcher) {
  const fields = filter(fetcher.fields, { type: 'global_reference' });
  if (!fields.length) return rows;

  return loadGRCs(rows, fetcher.model, { fieldset: fetcher.context.fieldset, sandbox: fetcher.sandbox })
    .then(() => {
      return rows;
    });
}

function preloadTemplates(rows, fetcher) {
  const fields = filter(fetcher.fields, { type: 'data_visual' });
  if (!fields.length) return rows;

  return loadTemplates(rows, fetcher.model, fetcher.sandbox, { fieldset: fetcher.context.fieldset })
    .then(({ preloadedTemplateRecords = [] }) => {
      fetcher.result.included = fetcher.result.included.concat(preloadedTemplateRecords);

      each(rows, (row) => {
        each(
          preloadedTemplateRecords,
          r => r &&
               set(row, `__relationships[${r.__type}].data[${r.id}]`, { id: r.id, type: r.__type }) &&
               (row.__relationships[r.__type].data = pickBy(row.__relationships[r.__type].data, identity))
        );
      });

      return rows;
    });
}

function processRecords(records, { model, result, params }) {
  result.meta.size = records.length;

  records.forEach((record) => {
    params.template && (record.__template = params.template);
    record.__type = model.alias;
    result.records.push(record);
  });

  return records;
}

function postProcess({ result }) {
  result.included = uniqBy(compact(result.included), o => `${o.__type}-${o.id}`);
}
