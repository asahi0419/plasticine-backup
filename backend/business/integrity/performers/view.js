import db from '../../../data-layer/orm/index.js';
import BasePerformer from './base.js';

export const COMPONENTS_TO_CLEANUP = [
  { model: 'map_view_cache', field: 'view_id' },
];

export default class ViewPerformer extends BasePerformer {
  getComponentsToCleanup() {
    return COMPONENTS_TO_CLEANUP;
  }

  async getDependency() {
    return {
      form: await db.model('form').where('options', db.client.regexpClause(), `view":${this.record.id}`),
      dashboard: await db.model('dashboard').where('options', db.client.regexpClause(), `view":${this.record.id}`),
    };
  }
}
