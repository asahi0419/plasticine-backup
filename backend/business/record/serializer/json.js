import { pick, pickBy, omit, has, isArray } from 'lodash-es';

const METADATA_ATTRIBUTES = [
  'id',
  '__inserted',
  '__type',
  '__relationships',
  '__humanAttributes',
  '__extraAttributes',
  '__extraFields',
  '__counts',
];

export default function (input) {
  if (isArray(input)) return input.map(recordSerializer);
  if (isFetcherResult(input)) {
    const { meta, records, included } = input;

    return {
      meta,
      data: records.map(recordSerializer),
      included: included.map(recordSerializer),
    };
  }

  return { data: recordSerializer(input) };
}

function isFetcherResult(input) {
  return has(input, 'meta') && has(input, 'records') && has(input, 'included');
}

export const recordSerializer = (record, cleanup = true) => {
  const metadata = pick(record, METADATA_ATTRIBUTES);
  const attributes = cleanup || cleanup === 0
    ? pickBy(record, (_, key) => !key.startsWith('__'))
    : omit(record, METADATA_ATTRIBUTES);

  return {
    id: metadata.id,
    type: metadata.__type,
    counts: metadata.__counts || {},
    inserted: metadata.__inserted,
    extra_fields: metadata.__extraFields || {},
    relationships: metadata.__relationships || {},
    extra_attributes: metadata.__extraAttributes || {},
    human_attributes: metadata.__humanAttributes || {},
    attributes,
  };
};
