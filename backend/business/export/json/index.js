import Promise from 'bluebird';
import { clone } from 'lodash-es';

import exportModel from './model.js';
import exportFields from './field.js';
import exportViews from './view.js';
import exportLayouts from './layout.js';
import templates from '../../model/templates.js';

export class ModelExporter {
  constructor(model) {
    this.model = model;

    this.result = clone(model);
    this.template = templates[model.template];
  }

  process(type = 'for_import') {
    this.type = type;
    let promise = Promise.bind();
    promise = promise.then(() => exportModel(this));
    promise = promise.then(() => exportFields(this));
    promise = promise.then(() => exportViews(this));
    promise = promise.then(() => exportLayouts(this));
    return promise.then(exporter => exporter.result);
  }
}
