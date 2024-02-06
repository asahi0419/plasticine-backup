import lodash from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import * as HELPERS from '../../../../helpers/index.js';

const isSet = (v) => lodash.compact(v).length;

const getClearingClause = (modelTableName) => (operator = '') => {
  const exception = operator.includes('not') ? '!=' : '=';
  return db.client.raw(`${modelTableName}.id ${exception} -1`);
};

export default async (field, operator, value) => {
  const result = {
    froms: [],
    where: [],
  };

  const rtlTableName = db.model('rtl').tableName;
  const asRTLTableName = rtlTableName + '_' + Math.random().toString().slice(2, 8);
  const modelTableName = field.__parentField ? db.model(field.__parentField.model).tableName : db.model(field.model).tableName;

  const from = db.client.rtlFromClause(field, modelTableName, rtlTableName, asRTLTableName);

  if (isSet(value)) {
    if (['=', '!=', 'in'].includes(operator) || field.__mode) {
      from.columns = [ db.client.raw(`array_agg(${asRTLTableName}.target_record_id order by ${asRTLTableName}.target_record_id asc) as source_field_${asRTLTableName}`) ];
    }

    result.froms.push(from);

    if (!field.__mode) {
      if (operator === 'in') result.where.push(db.client.raw(`source_field_${asRTLTableName} && array[${value}]`));
      if (['=', '!='].includes(operator)) result.where.push(db.client.raw(`source_field_${asRTLTableName} ${operator} array[${value.sort((a, b) => a - b)}]`));
    }

    if (field.__mode === 'strict') {
      if (operator === 'in')     result.where.push(db.client.raw(`source_field_${asRTLTableName} <@ array[${value}]`));
      if (operator === 'not in') result.where.push(db.client.raw(`not source_field_${asRTLTableName} <@ array[${value}]`));
    }

    if (field.__mode === 'having') {
      if (operator === 'in')     result.where.push(db.client.raw(`source_field_${asRTLTableName} @> array[${value}]`));
      if (operator === 'not in') result.where.push(db.client.raw(`not source_field_${asRTLTableName} @> array[${value}]`));
    }

    if (['like', 'not like'].includes(operator)) {
      if ((value === '%%') || (value === '%')) {
        if (operator.includes('not')) {
          result.where.push(getClearingClause(modelTableName)());
        }

        return result;
      }

      const { foreign_model, foreign_label } = HELPERS.parseOptions(field.options);
      const tables = {
        self: db.model(field.model).tableName,
        foreign: db.model(foreign_model).tableName,
        rtl: db.model('rtl').tableName,
      };

      let label = `joining.${foreign_label}`;
      if (HELPERS.isPatternMode(foreign_label)) {
        const labels = HELPERS.extractConcatenatedFields(foreign_label);
        const fields = lodash.map(labels, (l) => `joining.${l}`);
        const columns = lodash.compact(foreign_label.replace(/{(\w+)}/g, '{}$1{}').split('{}')).map((item) => labels.includes(item) ? `joining.${item}` : `'${item}'`);
        const symbols = lodash.filter(columns, (c) => !fields.includes(c));

        label = symbols.length ? `concat(${columns.join(',')})` : fields.join(" || ' ' || ");
      }

      const aggFunc = (c) => `string_agg(__label_${c}::text, ', ' order by __label_${c}) AS ${c}`;

      const from = {
        tableName: tables.self,
        columns: [field.alias, 'joining_id'],
        joins: [{
          tableName: function () {
            this.select([`id`, `selection.${field.alias}`, `selection.joining_id`]).from(function () {
              this.select([`${tables.self}.id`, db.client.raw(aggFunc('joining_id')), db.client.raw(aggFunc(field.alias))]).from(function () {
                this.select([`${tables.self}.*`, db.client.raw(`joining.id as __label_joining_id`), db.client.raw(`${label} as __label_${field.alias}`)])
                  .from(tables.self).as(tables.self)
                  .leftJoin(tables.rtl, `${tables.self}.id`, `${tables.rtl}.source_record_id`)
                  .leftJoin(function () {
                    this.select([`${tables.foreign}.*`]).from(tables.foreign).as('joining')
                  }, `joining.id`, `${tables.rtl}.target_record_id`)
                  .where(`${tables.rtl}.source_field`, field.id)
              }).as('selection').groupBy([`${tables.self}.id`])
            }).as('joined')
          },
          onItems: [{ left: `${tables.self}.id`, right: `joined.id` }],
        }],
        groupBy: [`${tables.self}.id`, field.alias, 'joining_id'],
      }

      if (operator === 'like') {
        result.where.push(db.client.raw(`
          (
            ${field.alias}
            ${operator.replace('like', db.client.caseInsensitiveLikeClause())}
            '${value}'
          ) OR
          (
            joining_id::text
            ${operator.replace('like', db.client.caseInsensitiveLikeClause())}
            '${value}'
          )
        `));
      } else {
        result.where.push(db.client.raw(`
          ((
            ${field.alias}
            ${operator.replace('like', db.client.caseInsensitiveLikeClause())}
            '${value}'
          ) OR ${field.alias} is null AND joining_id is null) OR
          ((
            joining_id::text
            ${operator.replace('like', db.client.caseInsensitiveLikeClause())}
            '${value}'
          ) AND ${field.alias} is null AND joining_id is not null)
        `));
      }

      result.froms.push(from);
    }
  } else if (lodash.isNull(value)) {
    if (operator === '=') operator = 'is';
    if (operator === '!=') operator = 'is not';
    from.where = [ db.client.raw(`${asRTLTableName}.source_record_id ${operator} ${value}`) ];
    result.froms.push(from);
  } else {
    result.where.push(getClearingClause(modelTableName)(operator));
  }

  return result;
};