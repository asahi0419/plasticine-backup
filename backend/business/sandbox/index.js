import Promise from 'bluebird';
import vm from 'vm';
import { each } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import Api  from './api/index.js';
import logger from '../logger/index.js';
import Script from './script.js';
import ModelProxy, { wrapRecord } from './api/model/index.js';
import translator, { fakeI18n } from '../i18n/translator.js';
import { getSetting } from '../setting/index.js';
import { GlobalScriptError, ScriptError, ScriptTimeoutError, SystemError } from '../error/index.js';
import { createScriptExecutor } from './helpers.js';

const executeScript = createScriptExecutor();

Promise.config({ cancellation: true });

export default class Sandbox {
  static async create(context, mode = 'base', oldVM) {
    const sandbox = await new Sandbox(context, mode).createVM(oldVM);

    if (mode !== 'seeding') {
      const scripts = await db.model('global_script').where({ active: true, __inserted: true }).select('id', 'script').orderBy('id', 'asc');
      await sandbox.injectGlobalScripts(scripts);
    }

    return sandbox;
  }

  constructor(context = {}, mode) {
    this.mode = mode;
    this.internalVariables = {};
    this.i18n = context.request ? context.request.i18n : fakeI18n;
    this.translate = translator(this.i18n);

    this.__getContext = () => context;
  }

  get context() {
    return this.__getContext();
  }

  get model() {
    const { record = {}, context = {} } = this;
    const { request = {} } = context;

    return request.model || record.model;
  }

  get record() {
    return this.vm.p.record;
  }

  get user() {
    return this.context.user;
  }

  get timeZoneOffset() {
    const { request } = this.__getContext()
    return (request && request.timeZoneOffset) || 0;
  }

  cloneWithoutDynamicContext() {
    return new Sandbox(this.context, this.mode).createVM(this.vm);
  }

  async createVM(oldVM) {
    if (this.vm) delete this.vm;
    this.vm = new vm.createContext(await Api(this, oldVM));
    return this;
  }

  async injectGlobalScripts(scripts = []) {
    await this.createVM();

    const handleError = err => logger.error(new GlobalScriptError(err.message, err.stack));

    each(scripts, (globalScript) => {
      try {
        const script = new Script(globalScript.script, `global_script/${globalScript.id}`);
        const result = executeScript(this.vm, script);
        return result && typeof (result.then) === 'function' ? result.catch(handleError) : result;
      } catch (err) {
        handleError(err);
      }
    });

    return this;
  }

  addVariable(name, value) {
    if (this.context.request) this.context.request.sandbox.vm.p[name] = value;
    this.vm.p[name] = value;
    return this;
  }

  getVariable(name) {
    const variable = this.vm.p[name];
    if (variable) return variable;
    if (this.context.request) return this.context.request.sandbox.vm.p[name];
  }

  addInternalVariable(name, value) {
    this.vm.p.internalVariables[name] = value;
    return this;
  }

  async assignRecord(record, model, name = 'record', params = {}) {
    const modelProxy = new ModelProxy(model, this);
    const recordProxy = await wrapRecord(modelProxy, { preload_data: true, ...params })(record);

    this.addVariable(name, recordProxy);

    return recordProxy;
  }

  executeScript(code, path, context = {}, params = {}) {
    params = {
      use_timeout: true,
      ...getSetting('logs'),
      ...params,
    };

    if (!path) throw new SystemError('Wrong params provided into sandbox.executeScript');

    const script = new Script(code, path, context);

    if (script.calculatedResult !== undefined) return script.calculatedResult;

    const initialTime = new Date();
    const initialMemory = process.memoryUsage().heapUsed;

    const measureTime = (execution) => {
      const executionTime = new Date().getTime() - initialTime.getTime();
      const { transaction_logs_on, log_min_time } = params;

      transaction_logs_on &&
      (executionTime >= log_min_time) &&
      logger.trace(JSON.stringify({
        path: script.path,
        duration: executionTime,
        memory_usage_kb: (process.memoryUsage().heapUsed - initialMemory) / 1024,
        memory_kb: process.memoryUsage().heapUsed / 1024
      }));

      return execution;
    };

    const handleError = (err) => {
      measureTime();

      let ErrorClass = ScriptError;

      if (err.name === 'TimeoutError') {
        ErrorClass = ScriptTimeoutError;
        err.stack = `SCRIPT_PATH:${path}\n${err.stack}`;
      } else {
        logger.error(err);
      }

      throw new ErrorClass(err.message, err.stack, context);
    };

    try {
      const execution = executeScript(this.vm, script);

      if (execution && (typeof(execution.then) === 'function') && (typeof(execution.timeout) === 'function')) {
        return params.use_timeout
          ? execution.then(measureTime).timeout(script.timeout).catch(handleError)
          : execution.then(measureTime).catch(handleError);
      } else {
        return measureTime(execution);
      }
    } catch (err) {
      handleError(err);
    }
  }
}
