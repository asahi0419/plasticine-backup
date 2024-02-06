import lodash from 'lodash';

import store from '../../../../store';
import PlasticineApi from '../../../../api';

export default (sandbox) => ({
  getConditionResult: (ui_object, cond_query) => {
    const errors = [];
    if (!lodash.isObject(ui_object)) errors.push('ui_object should be an object');
    if (!lodash.isString(cond_query)) errors.push('cond_query should be a string');
    if (errors.length) {
      console.error(`p.uiUtils.getConditionResult(ui_object, cond_query): ${errors.join(', ')}`);
      return false
    }

    const sandbox = new Sandbox({ record: ui_object })
    return sandbox.executeScript(cond_query, {}, 'condition')
  },
  fetchRecords: (modelAlias, params = {}) => {
    const errors = [];
    if (!lodash.isString(modelAlias)) errors.push('modelAlias should be a string');
    if (!lodash.isPlainObject(params)) errors.push('params should be an object');
    if (errors.length) {
      throw new Error(`p.uiUtils.fetchRecords(modelAlias, params): ${errors.join(', ')}`);
    }

    return PlasticineApi.fetchRecords(modelAlias, params);
  },
  createRecord: (modelAlias, data = {}) => {
    const errors = [];
    if (!lodash.isString(modelAlias)) errors.push('modelAlias should be a string');
    if (!lodash.isPlainObject(data)) errors.push('data should be an object');
    if (errors.length) {
      throw new Error(`p.uiUtils.createRecord(modelAlias, data): ${errors.join(', ')}`);
    }

    return PlasticineApi.createRecord(modelAlias, data);
  },
  updateRecord: (modelAlias, recordId, data = {}) => {
    const errors = [];
    if (!lodash.isString(modelAlias)) errors.push('modelAlias should be a string');
    if (!lodash.isNumber(recordId)) errors.push('recordId should be a number');
    if (!lodash.isPlainObject(data)) errors.push('data should be an object');
    if (errors.length) {
      throw new Error(`p.uiUtils.updateRecord(modelAlias, recordId, data): ${errors.join(', ')}`);
    }

    return PlasticineApi.updateRecord(modelAlias, recordId, data);
  },
  deleteRecord: (modelAlias, recordId) => {
    const errors = [];
    if (!lodash.isString(modelAlias)) errors.push('modelAlias should be a string');
    if (!lodash.isNumber(recordId)) errors.push('recordId should be a number');
    if (errors.length) {
      throw new Error(`p.uiUtils.deleteRecord(modelAlias, recordId): ${errors.join(', ')}`);
    }

    return PlasticineApi.deleteRecord(modelAlias, recordId);
  },
  getCurrentUserToken: () => {
    return PlasticineApi.getCurrentUserToken();
  },
  invokeWebService: (webServiceAlias, params = {}) => {
    const errors = [];
    if (!lodash.isString(webServiceAlias)) errors.push('webServiceAlias should be a string');
    if (!lodash.isPlainObject(params)) errors.push('params should be an object');
    if (errors.length) {
      throw new Error(`p.uiUtils.invokeWebService(webServiceAlias, params): ${errors.join(', ')}`);
    }

    return PlasticineApi.invokeWebService(webServiceAlias, params);
  },
  openPage: (pageAlias, options = {}) => {
    const errors = []

    if (!pageAlias) errors.push('pageAlias should be provided');
    if (pageAlias && !lodash.isString(pageAlias)) errors.push('pageAlias should be a string')
    if (options && !lodash.isPlainObject(options)) errors.push('options should be an object')

    if (errors.length) {
      PubSub.publish('messages', { type: 'negative', content: `p.uiUtils.openPage(pageAlias, [options]): ${errors.join(', ')}` })
      throw new Error(`p.uiUtils.openPage(pageAlias, [options]): ${errors.join(', ')}`)
    }

    return new Promise((resolve) => {
      PubSub.publish('modal', {
        pageAlias,
        params: options,
        target: 'page',
        options: { popup: 'full' },
        parent: sandbox.api.p.this,
        onClose: resolve
      })

      if (options.message) {
        PubSub.publish('messages', options.message)
      }
    })
  },
  openForm: (model, record, options = {}) => {
    const errors = []

    if (!model) errors.push('model should be provided');
    if (model && !lodash.isString(model)) errors.push('model should be a string')
    if (!record) errors.push('record should be provided');
    if (record && !lodash.isPlainObject(record)) errors.push('record should be an object')
    if (record && !record.id) errors.push('record id should be provided')
    if (options && !lodash.isPlainObject(options)) errors.push('options should be an object')

    if (options.popup && options.popup === 'none') {
      return window.open(`/${model}/form/${record.id}`, "_blank");
    }

    if (errors.length) {
      PubSub.publish('messages', { type: 'negative', content: `p.uiUtils.openForm(model, record, [options]): ${errors.join(', ')}` })
      throw new Error(`p.uiUtils.openForm(model, record, [options]): ${errors.join(', ')}`)
    }

    return new Promise((resolve) => {
      PubSub.publish('modal', {
        modelAlias: model,
        recordId: record.id,
        options: options,
        target: 'form',
        parent: sandbox.api.p.this,
        onClose: resolve
      })

      if (options.message) {
        PubSub.publish('messages', options.message)
      }
    })
  },
  openView: (modelAlias, viewAlias, options = {}) => {
    const errors = [];

    if (modelAlias && !lodash.isString(modelAlias)) errors.push('modelAlias should be a string');
    if (!modelAlias) errors.push('modelAlias should be provided');
    if (viewAlias && !lodash.isString(viewAlias)) errors.push('viewAlias should be a string');
    if (options && !lodash.isPlainObject(options)) errors.push('options should be an object');

    const state = store.redux.state('metadata.app')

    const model = lodash.find(state.model, { alias: modelAlias });
    const view = viewAlias
      ? lodash.find(state.view, { model: model?.id, alias: viewAlias })
      : lodash.find(state.view, { model: model?.id })

    if (modelAlias !== '__model_selection') {
      if (!model) {
        errors.push('model by modelAlias not found');
      } else {
        if (!view) errors.push('view by viewAlias not found');
      }
    }


    if (errors.length) {
      PubSub.publish('messages', {
        type: 'negative',
        header: `p.uiUtils.openView`,
        content: errors.join(', '),
      })
      throw new Error(`p.uiUtils.openView(modelAlias, [viewAlias, options]): ${errors.join(', ')}`);
    }

    if (options.mode === 'view') {
      window.open(`/${model.alias}/view/${view.type}/${view.alias}`, '_blank');
      return;
    }

    return new Promise((resolve) => {
      const params = {
        modelAlias: model?.alias,
        viewAlias: view?.alias,
        target: 'view',
        options: {
          popup: 'full',
          filter: options.filter,
          onChange: resolve,
        },
        onClose: resolve,
        onChoose: (e, data, reference) => {
          const r = data?.record;
          const m = reference ? lodash.find(state.model, { alias: reference.model }) : model

          return resolve({
            model: m?.id,
            id: r?.id,
            record: r,
          })
        }
      };

      if (options.mode === 'multipicker') {
        Object.assign(params, {
          rowselect: true,
        });
        Object.assign(params.options, {
          popup: 'full',
          type: 'rtl_popup',
          selectedRecords: [],
        });

        if (modelAlias === '__model_selection') {
          Object.assign(params, {
            references: options.references || [],
            actions: [
              {
                name: 'Apply',
                alias: 'apply_rtl_records',
                type: 'view_button',
                client_script: `p.this.close(p.this.getSelectedRecords());`,
                active: true,
              }
            ]
          })
          Object.assign(params.options, {
            type: 'global_reference_view'
          });
        }
      } else {
        Object.assign(params, {
          selectable: false,
          references: options.references || [],
        });
        Object.assign(params.options, {
          type: (modelAlias === '__model_selection')
            ? 'global_reference_view'
            : 'reference_view',
        });
      }

      if (view?.type === 'map') {
        Object.assign(params, {
          showFilterManager: false,
          showQuicksearch: false,
          actions: [
            {
              name: 'Apply',
              alias: 'apply',
              type: 'view_button',
              client_script: `p.this.close(p.this.data);`,
              active: true,
            }
          ]
        })
      }

      PubSub.publish('modal', params)

      if (options.message) {
        PubSub.publish('messages', options.message)
      }
    })
  },
});
