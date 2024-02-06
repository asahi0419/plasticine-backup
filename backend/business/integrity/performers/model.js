import db from '../../../data-layer/orm/index.js';
import BasePerformer from './base.js';
import { getForeignModelPattern } from '../utils/helpers.js';

export const COMPONENTS_TO_CLEANUP = [
  { model: 'privilege', field: 'model' },
  { model: 'db_rule', field: 'model' },
  { model: 'escalation_rule', field: 'model' },
  { model: 'ui_rule', field: 'model' },
  { model: 'filter', field: 'model' },
  { model: 'appearance', field: 'model' },
  { model: 'form', field: 'model' },
  { model: 'layout', field: 'model' },
  { model: 'action', field: 'model' },
  { model: 'chart', field: 'data_source' },
  { model: 'permission', field: 'model' },
  { model: 'core_lock', field: 'model' },
  { model: 'user_setting', field: 'model' },
  { model: 'json_translation', field: 'model' },
  { model: 'dynamic_translation', field: 'model' },
  { model: 'planned_task', field: 'model' },
  { model: 'global_references_cross', field: 'target_model' },
  { model: 'view', field: 'model' },
  { model: 'field', field: 'model' },
  { model: 'model', field: 'master_model' },
];

export default class ModelPerformer extends BasePerformer {
  getComponentsToCleanup() {
    return COMPONENTS_TO_CLEANUP;
  }

  async getDependency() {
    return {
      field: await db.model('field').whereIn('type', ['reference', 'reference_to_list', 'global_reference'])
                                    .andWhere('options', db.client.regexpClause(), getForeignModelPattern(db.getModel(this.record.id).alias)),
    };
  }
}
