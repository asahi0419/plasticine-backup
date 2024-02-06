import { isNil, isArray } from 'lodash-es';

import { isPatternMode, extractConcatenatedFields } from '../../../helpers/index.js';

function extractor(record, name) {
  let value = (record.__humanAttributes || {})[name] || record[name];
  if (isNil(value)) value = '';

  return value;
}

export default class ValueExtractor {
  constructor(label) {
    this.label = label;
    this.fields = extractConcatenatedFields(label)
  }

  extract(record) {
    let value = this.label;

    if (isPatternMode(value)) {
      this.fields.forEach((fieldAlias) => {
        let extracted = extractor(record, fieldAlias);
        if (isArray(extracted)) extracted = extracted.join(', ');
        value = value.replace(`{${fieldAlias}}`, extracted).trim();
      });
    } else {
      value = extractor(record, this.label);
    }

    return value || null;
  }
}
