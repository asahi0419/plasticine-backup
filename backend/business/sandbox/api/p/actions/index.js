import { isObject, isString } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import serializer from '../../../../record/serializer/json.js';
import { errorHandler } from '../../../../error/express.js'
import { isPlainObject } from '../../../../helpers/index.js';
import { findFirstAvailableResource, prepareGoBackOptions } from './helpers.js';
import { FormNotFoundError, ViewNotFoundError, RecordNotFoundError } from '../../../../error/index.js';

export default ({ request, response }, sandbox) => {
  return {
    openForm: async (model, ...args) => { /* formAlias?, record, options = {} */
      if (isPlainObject(args[0])) args.unshift(null);
      const [formAlias, record, options = {}] = args;
      if (!record) throw new RecordNotFoundError();

      const attributes = record.constructor.name === 'RecordProxy' ? record.attributes : record;
      const { associate } = request.body;

      if (associate) {
        options.associate = associate;
      }

      try {
        model = model.constructor.name === 'ModelProxy' ? model.model : db.getModel(model);
        await sandbox.assignRecord(attributes, model);

        let form = formAlias ? await db.model('form').where({ alias: formAlias }).getOne() : null
        form = form || await findFirstAvailableResource(model.alias, 'form', sandbox);
        if (!form) throw new FormNotFoundError();

        response.status(200).json({
          action: 'open_form',
          options: {
            dbop: sandbox.getVariable('action'),
            id: sandbox.record?.id,
            model: model.alias,
            form: form.alias,
            record: serializer(attributes),
            options,
          },
        });
      } catch (error) {
        errorHandler(error, request, response)
      }
    },

    openView: async (model, ...args) => { /* viewAlias?, options = {} */
      if (isPlainObject(args[0])) args.unshift(null);
      const [viewAlias, options = {}] = args;

      let modelAlias;
      if (isString(model)) modelAlias = model;
      if (isObject(model)) modelAlias = model.constructor.name === 'ModelProxy' ? model.model.alias : model.alias;

      if (modelAlias === '__self') {
        return response.status(200).json({
          action: 'open_self_view',
          options: { options },
        });
      }

      try {
        let view = viewAlias ? await db.model('view').where({ alias: viewAlias }).getOne() : null;
        view = view || await findFirstAvailableResource(modelAlias, 'view', sandbox);
        if (!view) throw new ViewNotFoundError();

        response.status(200).json({
          action: 'open_view',
          options: {
            model: modelAlias,
            view: view.alias,
            view_type: view.type,
            options,
          },
        });
      } catch (error) {
        errorHandler(error, request, response)
      }
    },

    openPage: (pageAlias, options) => {
      response.status(200).json({
        action: 'open_page',
        options: {
          page: pageAlias,
          options,
        },
      });
    },

    openURL: (url) => {
      response.status(200).json({
        action: 'open_url',
        options: { url },
      });
    },

    goBack: (options) => {
      response.status(200).json({
        action: 'go_back',
        options: {
          model: sandbox.model?.alias,
          ...prepareGoBackOptions({ request, response, sandbox }, options),
          dbop: sandbox.getVariable('action'),
          id: sandbox.record?.id,
        }
      });
    },

    showMessage: (message) => {
      response.status(200).json({
        action: 'show_message',
        options: { message },
      });
    },

    downloadFile: (attachment = {}) => {
      const { attributes = {} } = attachment;
      const { id, file_name } = attributes;

      response.status(200).json({
        action: 'download_file',
        options: { attachment: { id, file_name } },
      });
    },

    logout: (options = {}) => {
      response.status(200).json({
        action: 'logout',
        options,
      });
    },
  };
};
