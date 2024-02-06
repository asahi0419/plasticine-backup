import Promise from 'bluebird';
import {
  cloneDeep,
  each,
  find,
  isArray,
  isEmpty,
  isNumber,
  isObject,
  isPlainObject,
  isString,
  keys,
  map,
  pick,
  pickBy,
  reduce,
} from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import Flags from '../../../record/flags.js';
import logger from '../../../logger/index.js';
import Applicator from './applicator.js';
import ModelProxy, { wrapRecord, wrapRecords } from '../model/index.js';

export default class Builder {
  constructor(modelProxy, selectorScope) {
    this.modelProxy = modelProxy;
    this.model = modelProxy.model;
    this.sandbox = modelProxy.sandbox;

    this.selectorScope = selectorScope;

    this.finders = [];
    this.joins = [];
    this.serviceJoins = [];
    this.orderings = [];
    this.groupings = [];
    this.agregates = [];
    this.columns = [];
    this.updaters = [];
    this.selectedFields = [];
    this.deletion = false;

    this.options = {};

    this.cloned = false;
    this.selectRaw = false;
    this.selectFirst = false;

    this.setFlags(this.modelProxy.flags);
  }

  setFlags(flags = Flags.default()) {
    this.flags = flags;
    return this;
  }

  clone() {
    const clonedBuilder = new Builder(this.modelProxy, this.selectorScope);

    clonedBuilder.finders = cloneDeep(this.finders);
    clonedBuilder.joins = cloneDeep(this.joins);
    clonedBuilder.orderings = cloneDeep(this.orderings);
    clonedBuilder.groupings = cloneDeep(this.groupings);
    clonedBuilder.agregates = cloneDeep(this.agregates);
    clonedBuilder.limiter = cloneDeep(this.limiter);
    clonedBuilder.offset = cloneDeep(this.offset);
    clonedBuilder.columns = cloneDeep(this.columns);
    clonedBuilder.updaters = cloneDeep(this.updaters);
    clonedBuilder.deletion = this.deletion;
    clonedBuilder.cloned = true;

    return clonedBuilder;
  }

  first() {
    this.selectFirst = true;
    return this;
  }

  find(params = {}, model = null) {
    if (isObject(params)) {
      addFinder(this, 'and', params, model);
      this.selectFirst = false;
    }
    return this;
  }

  findOne(params = {}, model = null) {
    if (isObject(params)) {
      addFinder(this, 'and', params, model);
      this.selectFirst = true;
    }
    return this;
  }

  orFind(params = {}, model = null) {
    if (isObject(params)) {
      addFinder(this, 'or', params, model);
      this.selectFirst = false;
    }
    return this;
  }

  update(params = {}, model = null) {
    this.modelProxy.__checkActionPermissions('update');
    if (isObject(params)) {
      addUpdater(this, params, model);
    }
    return this;
  }

  join(leftModel, leftFieldAlias, rightModel, rightFieldAlias) {
    if (leftModel && leftFieldAlias && rightModel && rightFieldAlias) {
      addJoin(this, leftModel, leftFieldAlias, rightModel, rightFieldAlias);
    }
    return this;
  }

  order(options, model = null) {
    if (isObject(options)) {
      addOrderings(this, options, model);
    }
    return this;
  }

  group(fieldAlias, agregates = {}, model = null) {
    if (fieldAlias) {
      addGrouping(this, fieldAlias, model, agregates);
    }
    return this;
  }

  fields(fieldAliases, model = null) {
    if (isArray(fieldAliases)) {
      addColumns(this, fieldAliases, model);
    }
    return this;
  }

  limit(value, offset = null) {
    if (isNumber(value)) {
      this.limiter = value;
    }
    if (isNumber(offset)) {
      this.offset = offset;
    }
    return this;
  }

  setOptions(options) {
    if (isObject(options)) {
      this.flags = new Flags(options);
    }
    return this;
  }

  distinct(fieldAliases) {
    return new Applicator(this).distinct(fieldAliases);
  }

  count() {
    return new Applicator(this).count();
  }

  fetchRawRecords() {
    return new Applicator(this).fetch();
  }

  delete() {
    this.modelProxy.__checkActionPermissions('delete');
    this.deletion = true;
    return this;
  }

  raw() {
    this.selectRaw = true;
    return this;
  }

  transacting(trx) {
    this.trx = trx;
    return this;
  }

  setMode(mode) {
    this.mode = mode;
    return this;
  }

  dateTrunc(precision) {
    this.dateTrunc = precision;
    return this;
  }

  then(/* onFulfilled, onRejected */) {
    if (this.mode !== 'iteration') {
      if (!(this.updaters.length || this.selectFirst)) {
        logger.info(
          'find(...).then will be deprecated soon. Please use p.iterEach or p.iterMap.',
          { user: this.sandbox.user.id }
        );
      }
    }

    if (this.deletion) {
      return new Applicator(this).delete().then(...arguments);
    }

    if (this.updaters.length) {
      return new Applicator(this).update().then(...arguments);
    }

    return this.fetchRawRecords()
      .then(async (result) => {
        const fieldset =
          (find(this.columns, { modelAlias: this.model.alias }) || {})
            .fieldAliases || [];
        const wrapper = this.selectFirst ? wrapRecord : wrapRecords;
        const [agregate] = this.agregates || [];

        if (isEmpty(result)) return Promise.resolve(result);
        if (agregate) return Promise.resolve(result);

        if (this.joins.length) {
          result = groupRecordsByJoinedModels(result, this.joins, this.columns);
          result = await preloadJoinGroupsData(result, this.sandbox);
          if (this.selectRaw) return result;

          result = ungroupRecordsByJoinedModels(result, this.modelProxy);
          result = await wrapper(this.modelProxy, {
            preload_virtual_attrubutes: false,
            preload_cross_attrubutes: false,
          })(result);
        } else {
          result = await wrapper(this.modelProxy, {
            fieldset,
            select_raw: this.selectRaw,
          })(result);

          if (this.selectRaw)
            return fieldset.length ? applyFieldset(result, fieldset) : result;
        }

        return result;
      })
      .then(...arguments);
  }
}

const addFinder = (builder, type, params, model = null) => {
  builder.finders.push({
    type,
    params,
    modelAlias: extractModelAlias(model) || builder.model.alias,
  });
};

const addUpdater = (builder, params, model = null) => {
  builder.updaters.push({
    params,
    modelAlias: extractModelAlias(model) || builder.model.alias,
  });
};

const addJoin = (
  builder,
  leftModel,
  leftFieldAlias,
  rightModel,
  rightFieldAlias
) => {
  const lModelAlias = extractModelAlias(leftModel);
  const rModelAlias = extractModelAlias(rightModel);

  if (!builder.columns.length) {
    builder.columns = [
      { fieldAliases: db.getFieldsAliases(lModelAlias), modelAlias: lModelAlias },
      { fieldAliases: db.getFieldsAliases(rModelAlias), modelAlias: rModelAlias }
    ];
  }

  builder.joins.push({
    left: {
      modelAlias: lModelAlias,
      fieldAlias: leftFieldAlias,
    },
    right: {
      modelAlias: rModelAlias,
      fieldAlias: rightFieldAlias,
    },
  });
};

const addOrderings = (builder, params, model = null) => {
  each(params, (direction, fieldAlias) =>
    builder.orderings.push({
      modelAlias: extractModelAlias(model) || builder.model.alias,
      fieldAlias,
      direction,
    })
  );
};

const addGrouping = (builder, fieldAlias, model = null, agregates = {}) => {
  builder.groupings.push({
    modelAlias: extractModelAlias(model) || builder.model.alias,
    fieldAlias,
  });

  each(agregates, (agr, fieldAs) => {
    let agrFunc = Object.keys(agr)[0].toUpperCase();
    let val = agr[agrFunc];
    let fieldAlias = isPlainObject(val) ? Object.keys(val)[0] : val;
    let modelAlias = isPlainObject(val)
      ? extractModelAlias(val[fieldAlias])
      : builder.model.alias;
    builder.agregates.push({
      fieldAs,
      agrFunc,
      fieldAlias,
      modelAlias,
    });
  });
};

const addColumns = (builder, fieldAliases = [], model = null) => {
  builder.selectedFields.push({
    fieldAliases,
    modelAlias: extractModelAlias(model) || builder.model.alias,
  });

  builder.columns = builder.selectedFields;
};

export const extractModelAlias = (model) => {
  if (!model) return;
  if (isString(model)) return model;
  return model.alias;
};

export const groupRecordsByJoinedModels = (
  result,
  joins = [],
  columns = []
) => {
  const applyFieldset = (record, fieldset) => {
    return fieldset.length ? pick(record, fieldset) : record;
  };
  const applyMapper = (record) => {
    const result = {};

    each(joins, ({ left, right }) => {
      const rModel = db.getModel(right.modelAlias);
      const lModel = db.getModel(left.modelAlias);

      const joinKey = `__j`;
      const lJoinKey = `${joinKey}_${lModel.id}_`;

      const rModelAttributesRaw = pickBy(
        record,
        (v, k) => !k.startsWith(joinKey)
      );
      const lModelAttributesRaw = pickBy(record, (v, k) =>
        k.startsWith(lJoinKey)
      );

      const rModelAttributes = rModelAttributesRaw;
      const lModelAttributes = reduce(
        lModelAttributesRaw,
        (a, v, k) => ({ ...a, [k.replace(lJoinKey, '')]: v }),
        {}
      );

      const rModelFieldset =
        (find(columns, { modelAlias: right.modelAlias }) || {}).fieldAliases ||
        [];
      const lModelFieldset =
        (find(columns, { modelAlias: left.modelAlias }) || {}).fieldAliases ||
        [];

      result[rModel.alias] = {
        ...applyFieldset(rModelAttributes, rModelFieldset),
        ...(result[rModel.alias] || {}),
      };
      result[lModel.alias] = {
        ...applyFieldset(lModelAttributes, lModelFieldset),
        ...(result[lModel.alias] || {}),
      };
    });

    return result;
  };

  return isPlainObject(result) ? applyMapper(result) : map(result, applyMapper);
};

function ungroupRecordsByJoinedModels(result, modelProxy) {
  return map(result, (group) => {
    return reduce(
      group,
      (gres, record, key) => {
        if (key === modelProxy.model.alias) return { ...gres, ...record };
        const model = db.getModel(key);
        return {
          ...gres,
          ...reduce(
            record,
            (jres, value, key) => {
              return { ...jres, [`__j_${model.id}_${key}`]: value };
            },
            {}
          ),
        };
      },
      {}
    );
  });
}

async function preloadJoinGroupsData(input, sandbox) {
  const result = [];
  const models = {};

  each(input, (group) => {
    each(group, (record, modelAlias) => {
      models[modelAlias] = models[modelAlias] || [];
      models[modelAlias].push(record);
    });
  });

  await Promise.each(keys(models), async (modelAlias) => {
    const model = db.getModel(modelAlias);
    const modelProxy = new ModelProxy(model, sandbox);
    const wrapper = wrapRecords(modelProxy, { select_raw: true });

    models[modelAlias] = await wrapper(models[modelAlias]);
  });

  each(models, (records, modelAlias) => {
    each(records, (record, i) => {
      result[i] = result[i] || {};
      result[i][modelAlias] = record;
    });
  });

  return result;
}

function applyFieldset(result, fieldset) {
  return isPlainObject(result)
    ? pick(result, fieldset)
    : map(result, (r) => pick(r, fieldset));
}
