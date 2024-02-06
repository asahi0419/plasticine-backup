import { omit, pick, isObject, isArray } from 'lodash-es';

import { extendModelWithTemplate } from './helpers.js';
import importModel from './model.js';
import importFields from './field.js';
import importDbRules from './db-rule.js';
import importLayouts from './layout.js';
import importAppearances from './appearance.js';
import importFilters from './filter.js';
import importViews from './view.js';
import importActions from './action.js';
import importForms from './form.js';
import importPermissions from './permission.js';
import importPrivileges from './privilege.js';
import importCharts from './chart.js';
import importRecords from './record.js';
import importUiRules from './ui-rule.js';
import importEscalationRules from './escalation-rule.js';
import importScheduledTasks from './scheduled-task.js';

export const METADATA_SECTIONS = [
  'fields',
  'db_rules',
  'ui_rules',
  'views',
  'layouts',
  'filters',
  'actions',
  'forms',
  'permissions',
  'privileges',
  'records',
  'appearances',
  'charts',
  'escalation_rules',
  'scheduled_task',
];

export default class ModelImporter {
  constructor(sandbox, mode = 'base') {
    this.sandbox = sandbox;
    this.mode = mode;
  }

  async process(data = {}, sections = METADATA_SECTIONS) {
    if (!this.validate('data', data)) return false;
    if (!this.validate('sections', sections)) return false;

    const compiledData = extendModelWithTemplate(data);
    const metadata = pick(compiledData, sections);

    this.model = await importModel(omit(compiledData, METADATA_SECTIONS), this);

    await importFields(metadata.fields, this);
    await importDbRules(metadata.db_rules, this);
    await importLayouts(metadata.layouts, this);
    await importAppearances(metadata.appearances, this);
    await importFilters(metadata.filters, this);
    await importViews(metadata.views, this);
    await importUiRules(metadata.ui_rules, this);
    await importActions(metadata.actions, this);
    await importForms(metadata.forms, this);
    await importPermissions(metadata.permissions, this);
    await importPrivileges(metadata.privileges, this);
    await importCharts(metadata.charts, this);
    await importEscalationRules(metadata.escalation_rules, this);
    await importRecords(metadata.records, this);
    await importScheduledTasks(metadata.scheduled_task, this);

    return this.model;
  }

  validate(type, input) {
    if (type === 'data') {
      if (!isObject(input)) return;
    }

    if (type === 'sections') {
      if (!isArray(input)) return;
    }

    return true;
  }
}
