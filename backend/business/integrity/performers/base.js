import Promise from 'bluebird';
import {
  map,
  each,
  uniq,
  uniqWith,
  compact,
  flattenDeep,
  isEqual,
  isEmpty,
  isUndefined
} from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import { IntegrityError } from '../../error/index.js';
import { createPerformer } from '../utils/helpers.js';
import { getPriority } from '../utils/priority.js';
import processAttributes from '../utils/process-attributes.js';

export default class BasePerformer {
  constructor(modelAlias, record, sandbox) {
    this.model = db.getModel(modelAlias);
    this.record = record;
    this.sandbox = sandbox;
  }

  async validate(parentModel) {
    const performers = await this.getPerformers();
    await Promise.each(performers, performer => performer.validateDependency(parentModel));
  }

  async update(attributes) {
    const changedAttributes = Object.keys(attributes);
    const commands = [];

    if (changedAttributes.includes('alias')) {
      const result = await this.processAlias();
      result.map(command => commands.push(command));
    }

    return this.mergeAndOptimize(commands);
  }

  async delete(parentModel) {
    const performers = await this.getPerformers();
    const commands = await Promise.map(performers, ({ model, record }) => ({
      type: 'delete',
      model: model.alias,
      record,
    }));

    each(await this.getDependencyToUpdate('delete'), async (records, model) => {
      each(records, (record) => commands.push({ type: 'update', model, record }));
    });

    return this.mergeAndOptimize(commands);
  }

  async getPerformers() {
    const cleanup = await this.getComponentsToCleanup();
    if (!cleanup.length) return [this];

    const performers = await Promise.map(cleanup, async ({ model, field, ...rest }) => {
      const records = await db.model(model).where({ [field]: this.record.id, ...rest });
      return Promise.map(records, record => createPerformer(model, record, this.sandbox).getPerformers());
    });

    return [this, ...flattenDeep(performers)];
  }

  mergeAndOptimize(commands) {
    return uniqWith(commands, isEqual).sort((a, b) => getPriority(a.model, a.model) - getPriority(a.model, b.model));
  }

  async getDependencyToUpdate(type, recordAlias) {
    return [];
  }

  async getComponentsToCleanup() {
    return [];
  }

  async getDependency() {
    return {};
  }

  async validateDependency(parentModel) {
    const dependency = await this.getDependency();
    const messages = compact(map(dependency, (records, model) => {
      if (!records.length) return;

      const dependent = (!isUndefined(getPriority(parentModel.alias, this.model.alias)) && !isUndefined(getPriority(parentModel.alias, model)))
        ? (getPriority(parentModel.alias, this.model.alias) > getPriority(parentModel.alias, model))
        : (getPriority(this.model.alias, this.model.alias) > getPriority(this.model.alias, model));

      const dependentModel = db.getModel(model);

      return dependent && {
        content: `${dependentModel.name} - [${map(records, 'id')}] (IntegrityPerformer: ${this.model.name})`,
        model: dependentModel.alias,
      };
    }));

    messages.length && this.throwIntegrityError(messages);
  }

  throwIntegrityError(messages) {
    const message = this.sandbox.translate('static.dependent_records_found', { message: map(messages, 'content').join(', ') });
    const stack = { models: uniq(map(messages, 'model')) };
    throw new IntegrityError(message, stack);
  }

  async processAlias() {
    const oldAlias = this.record.__previousAttributes.alias;
    const newAlias = this.record.alias;

    const dependency = {
      ...await this.getDependency(oldAlias),
      ...await this.getDependencyToUpdate('update', oldAlias),
    };

    const models = Object.keys(dependency);
    const commands = [];

    if (isEmpty(dependency)) return commands;

    if (oldAlias !== newAlias) {
      const getCommand = model => Promise.each(dependency[model], (record) => {
        const processor = processAttributes[model];
        if (!processor) return;

        commands.push({
          type: 'update',
          model,
          record,
          attributes: processor(record, oldAlias, newAlias),
        });
      });

      await Promise.each(models, model => getCommand(model));
    }

    return commands;
  }
}
