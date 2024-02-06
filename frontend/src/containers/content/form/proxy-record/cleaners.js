import { isArray } from 'lodash/lang';
import { each } from 'lodash/collection';

import { parseOptions } from '../../../../helpers';

const cleanup = (reference) => (blankValue) => (field, dependsOnFieldAlias, dependsOnFieldValue, proxyRecord) => {
  const { depends_on } = reference;
  const { p } = proxyRecord.sandbox.api;

  if (isArray(depends_on) && depends_on.includes(dependsOnFieldAlias)) {
    const prevDependsOnFieldValue = p.record.getValue(dependsOnFieldAlias);
    if (prevDependsOnFieldValue === dependsOnFieldValue) return;

    const value = p.record.getField(field.alias).getRefValue(dependsOnFieldAlias)
    if (value === dependsOnFieldValue) return;

    proxyRecord.onChange(field.alias, blankValue);
  }
}

const dependentReferenceFieldCleaner = (blankValue) => {
  return (field, dependsOnFieldAlias, dependsOnFieldValue, proxyRecord) => {
    cleanup(parseOptions(field.options))(blankValue)(field, dependsOnFieldAlias, dependsOnFieldValue, proxyRecord);
  };
}

const dependentGlobalReferenceFieldCleaner = (blankValue) => {
  return (field, dependsOnFieldAlias, dependsOnFieldValue, proxyRecord) => {
    const { references = [] } = parseOptions(field.options);
    each(references, (reference) => cleanup(reference)(blankValue)(field, dependsOnFieldAlias, dependsOnFieldValue, proxyRecord));
  }
}

export const DEPENDENTABLE_CLEANERS = {
  reference: dependentReferenceFieldCleaner(null),
  reference_to_list: dependentReferenceFieldCleaner([]),
  global_reference: dependentGlobalReferenceFieldCleaner(null),
};
