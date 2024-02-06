import Promise from 'bluebird';
import { map, omit } from 'lodash-es';

export default function exportModel(exporter) {
  if (exporter.type == 'for_import') {
    exporter.result = omit(exporter.result, map(exporter.template.fields, 'alias'));
    // TODO: process inherits_model
  }

  return Promise.resolve(exporter);
}
