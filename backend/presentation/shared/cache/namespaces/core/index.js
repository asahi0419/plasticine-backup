import Promise from 'bluebird';
import { uniqBy, isPlainObject, cloneDeep, filter, find, groupBy, map } from 'lodash-es';

import Base from '../base/index.js';
import * as Helpers from '../../../../../business/helpers/index.js';

import loaders from './loaders/index.js';
import reloadTranslations from './loaders/translation.js';
import reloadGlobalScripts from './loaders/global-script.js';

export default class Core extends Base {
  async init() {
    await Promise.each(Object.keys(loaders), async (key) => {
      await this.load(key)

      // temporary solution =================
      if (key === 'fields') {
        const fields = map(this['fields'], (f) => ({ ...f, options: Helpers.parseOptions(f.options) }))
        this['fields:model'] = groupBy(fields, 'model')
      }
      // ====================================
    });
    
    this.ready = true
  }
  
  async start(context) {
    await this.init();
    this.listen(context);
  }
  
  stop() {
    this.messageBus.end();
  }

  listen(context = {}) {
    this.messageBus.on('service:reload_cache', async (payload) => {
      if (payload.target === 'translations') return reloadTranslations(context);
      if (payload.target === 'json_translations') return reloadTranslations(context);
      if (payload.target === 'dynamic_translations') return reloadTranslations(context);
      if (payload.target === 'global_scripts') return reloadGlobalScripts(context);

      // temporary solution =================
      if (payload.target === 'fields') {
        await this.load(payload.target, payload.params, payload.mode);
        const fields = map(this['fields'], (f) => ({ ...f, options: Helpers.parseOptions(f.options) }))
        return this['fields:model'] = groupBy(fields, 'model')
      }
      // ====================================

      return this.load(payload.target, payload.params, payload.mode);
    });
  }

  get(target, params) {
    if (params) {
      if (params.filter) {
        const result = filter(this[target], params.filter);

        return params.uniqBy
          ? cloneDeep(uniqBy(result, params.uniqBy))
          : cloneDeep(result);
      }

      if (params.find) {
        const result = this[target] || {};

        return isPlainObject(params.find)
          ? cloneDeep(find(result, params.find))
          : cloneDeep(result[params.find]);
      }
    }

    return this[target];
  }

  async load(target, params, mode) {
    if (loaders[target]) {
      this[target] = await loaders[target](this.get(target), params, mode);
    }
  }
}