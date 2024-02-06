import { map, groupBy, keyBy } from 'lodash-es';

const STATIC_SPREADERS = {
  attachments: spreadAttachments,
};

export default function spreadAssociations(fetcher, associations) {
  const [
    habtmAssociations,
    hasManyAssociations,
    hasOneAssociations,
    staticAssociations,
  ] = associations;

  habtmAssociations.forEach(({ model, field, result, association }) => {
    const { records, included } = result;
    fetcher.result.included = fetcher.result.included.concat(included);

    if (!records.length) return;
    const recordsMap = keyBy(records, 'id');

    fetcher.result.records.forEach((record) => {
      const relatedRecordIds = record[field.alias];
      const relatedRecords = map(relatedRecordIds, id => recordsMap[id]);

      record.__relationships = record.__relationships || {};
      record.__relationships[relationshipAlias(association.alias, 'habtm')] = {
        data: map(relatedRecords, shrinkRecord(model)),
      };
      fetcher.result.included = fetcher.result.included.concat(relatedRecords);
    });
  });

  hasManyAssociations.forEach(({ model, field, result }) => {
    const { records, included } = result;
    fetcher.result.included = fetcher.result.included.concat(included);

    if (!records.length) return;
    const groupedRecords = groupBy(records, field.alias);

    fetcher.result.records.forEach((record) => {
      const relatedRecords = groupedRecords[record.id];
      record.__relationships = record.__relationships || {};
      record.__relationships[relationshipAlias(model.alias, 'has_many')] = {
        data: map(relatedRecords, shrinkRecord(model)),
      };
      fetcher.result.included = fetcher.result.included.concat(relatedRecords);
    });
  });

  hasOneAssociations.forEach(({ model, field, result, association }) => {
    const { records, included } = result;
    fetcher.result.included = fetcher.result.included.concat(included);

    if (!records.length) return;
    const recordsMap = keyBy(records, 'id');

    fetcher.result.records.forEach((record) => {
      const relatedRecord = recordsMap[record[field.alias]];

      if (relatedRecord) {
        record.__relationships = record.__relationships || {};
        record.__relationships[relationshipAlias(association.alias, 'has_one')] = {
          data: shrinkRecord(model)(relatedRecord),
        };
        fetcher.result.included.push(relatedRecord);
      }
    });
  });

  staticAssociations.forEach((data) => {
    const spreader = STATIC_SPREADERS[data.association.alias];
    if (spreader) spreader(fetcher, data);
  });
}

function spreadAttachments(fetcher, { result, crossRecords }) {
  const attachmentsMap = keyBy(result, 'id');
  const crossRecordsMap = groupBy(crossRecords, 'target_record_id');

  fetcher.result.records.forEach((record) => {
    const crossRecordGroup = crossRecordsMap[record.id];

    if (crossRecordGroup) {
      const recordAttachments = crossRecordGroup.map(({ source_record_id }) => attachmentsMap[source_record_id]);

      record.__relationships = record.__relationships || {};
      record.__relationships.attachment = {
        data: map(recordAttachments, shrinkRecord({ alias: 'attachment' })),
      };

      fetcher.result.included = fetcher.result.included
        .concat(recordAttachments.map(a => ({ ...a, __type: 'attachment' })));
    }
  });
}

function relationshipAlias(alias, type) {
  switch (type) {
    case 'has_many':
      return `<${alias}`;
    default:
      return alias;
  }
}

function shrinkRecord(model) {
  return function (record = {}) {
    const result = { id: record.id, type: model.alias };

    if (model.alias === 'attachment') {
      if (record.field) {
        result.field = record.field;
      }
    }

    return result;
  };
}
