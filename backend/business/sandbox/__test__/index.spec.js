import logger from '../../logger/index.js';
import Sandbox from '../index.js';
import { fakeI18n } from '../../i18n/translator.js';
import RecordProxy from '../api/model/record/index.js';
import { getSetting } from '../../setting/index.js';

beforeEach(async () => {
  jest.clearAllMocks();
});

describe('Sandbox', () => {
  describe('static create(context, mode)', () => {
    it('Should return sandbox instance', async () => {
      const result = await Sandbox.create();
      expect(result).toBeInstanceOf(Sandbox);
    });
    it('Should inject global scripts in base mode', async () => {
      jest.spyOn(Sandbox.prototype, 'injectGlobalScripts');
      const result = await Sandbox.create();
      const scripts = await db.model('global_script').where({ active: true, __inserted: true }).select('id', 'script').orderBy('id', 'asc');
      expect(Sandbox.prototype.injectGlobalScripts).toBeCalledWith(scripts);
    });
    it('Should not inject global scripts in seeding mode', async () => {
      jest.spyOn(Sandbox.prototype, 'injectGlobalScripts');
      const result = await Sandbox.create({}, 'seeding');
      expect(Sandbox.prototype.injectGlobalScripts).not.toBeCalled();
    });
  });
  describe('constructor(context, oldVM)', () => {
    it('Should correctly run', async () => {
      jest.spyOn(Sandbox.prototype, 'createVM');

      const context = {};
      const oldVM = {};

      const result = new Sandbox(context, oldVM);

      expect(result.context).toEqual(context);
      expect(result.internalVariables).toEqual({});
      expect(result.i18n).toEqual(fakeI18n);
      expect(Sandbox.prototype.createVM).toBeCalledWith(oldVM);
    });
  });
  describe('translate(path)', () => {
    const context = {};
    const oldVM = {};

    const sb = new Sandbox(context, oldVM);
    const expected = 'expected';
    const result = sb.translate(expected);

    expect(result).toEqual(expected);
  });
  describe('get model()', () => {
    it('Should return correct result', async () => {
      let result, context, record;

      result = new Sandbox();
      expect(result.model).toEqual();

      record = { model: 'model' };
      result = new Sandbox();
      result.addVariable('record', record);
      expect(result.model).toEqual(record.model);

      context = { request: { model: 'model' } };
      result = new Sandbox(context);
      expect(result.model).toEqual(context.request.model);
    });
  });
  describe('record()', () => {
    it('Should return correct result', async () => {
      let result, context, record;

      record = 'record';
      result = new Sandbox();
      result.addVariable('record', record);
      expect(result.record).toEqual(record);
    });
  });
  describe('user()', () => {
    it('Should return correct result', async () => {
      const context = { user: {} };
      const result = new Sandbox(context);

      expect(result.user).toEqual(context.user);
    });
  });
  describe('get timeZoneOffset()', () => {
    it('Should return correct result', async () => {
      let context = {};
      let result = new Sandbox(context);
      expect(result.timeZoneOffset).toEqual(0);

      context = { request: { timeZoneOffset: 'timeZoneOffset' } };
      result = new Sandbox(context);
      expect(result.timeZoneOffset).toEqual(context.request.timeZoneOffset);
    });
  });
  describe('cloneWithoutDynamicContext()', () => {
    it('Should return correct result', async () => {
      const context = {};
      const sb = new Sandbox(context);
      const result = sb.cloneWithoutDynamicContext();

      expect(result).toBeInstanceOf(Sandbox);
      expect(result.context).toEqual(context);
    });
  });
  describe('createVM(oldVM)', () => {
    it('Should correctly run', async () => {
      const prevVM = { test: 'test1' };
      const nextVM = { test: 'test2' };

      const sb = new Sandbox({}, prevVM);
      const prevResult = sb.vm.test;
      const result = sb.createVM(nextVM);
      const nextResult = result.vm.test;

      expect(result).toEqual(sb);
      expect(prevResult).toEqual(prevVM.test);
      expect(nextResult).toEqual(nextVM.test);
    });
  });
  describe('injectGlobalScripts(scripts)', () => {
    it('Should correctly run', async () => {
      const prevVM = { test: 'test1' };
      const nextVM = { test: 'test2' };

      const sb = new Sandbox({}, prevVM);
      const prevResult = sb.vm.test;
      const result = sb.injectGlobalScripts([{ id: 'id', script: `var test = '${nextVM.test}'` }]);
      const nextResult = result.vm.test;

      expect(result).toEqual(sb);
      expect(prevResult).toEqual(prevVM.test);
      expect(nextResult).toEqual(nextVM.test);
    });
    it('Should log errors running scripts', async () => {
      jest.spyOn(logger, 'error');
      const sb = new Sandbox();
      sb.injectGlobalScripts([{ id: 'id', script: `return` }]);
      expect(logger.error).toBeCalled();
    });
  });
  describe('addVariable(name, value)', () => {
    it('Should correctly run', async () => {
      const name = 'name';
      const value = 'value';

      const sb = new Sandbox();
      const result = sb.addVariable(name, value);

      expect(result).toEqual(sb);
      expect(result.vm.p[name]).toEqual(value);
    });
  });
  describe('addInternalVariable(name, value)', () => {
    it('Should return correct result', async () => {
      const name = 'name';
      const value = 'value';

      const sb = new Sandbox();
      const result = sb.addInternalVariable(name, value);

      expect(result).toEqual(sb);
      expect(result.vm.p.internalVariables[name]).toEqual(value);
    });
  });
  describe('assignRecord(record, model, name)', () => {
    it('Should correctly run', async () => {
      const record = { id: 1 };
      const model = { id: 1 };

      const sb = new Sandbox();
      const result = await sb.assignRecord(record, model);

      expect(result).toBeInstanceOf(RecordProxy);
      expect(sb.vm.p.record).toBeInstanceOf(RecordProxy);
      expect(sb.vm.p.record.id).toEqual(record.id);
      expect(sb.vm.p.record.options.preload_data).toEqual(true);
    });
  });
  describe('executeScript(code, path, context)', () => {
    it('Should correctly run', async () => {
      const vm = { test: 'test' };
      const sb = new Sandbox({}, vm);
      const result = sb.executeScript(`return test`, 'script/path');

      expect(result).toEqual(vm.test);
    });
    it('Should throw error if path is undefined', async () => {
      const sb = new Sandbox();

      expect(sb.executeScript).toThrow();
    });
    it('Should log error if timeout exceeded', async () => {
      const timeout = getSetting('timeout.action');
      const sb = new Sandbox();
      const code = `await new Promise((resolve) => setTimeout(resolve, ${timeout} + 1));`

      await expect(sb.executeScript(code, 'script/path')).rejects.toMatchObject({ description: 'operation timed out' });
    });
    it('Should trace logger if tracing param is active and timeout exceeded', async () => {
      jest.spyOn(logger, 'trace');

      const timeout = getSetting('timeout.action');
      const context = {};
      const params = { transaction_logs_on: true, log_min_time: 0 };
      const sb = new Sandbox();
      const code = `await new Promise((resolve) => setTimeout(resolve, ${timeout} + 1));`

      await expect(sb.executeScript(code, 'script/path', context, params)).rejects.toMatchObject({ description: 'operation timed out' });
      expect(logger.trace).toBeCalled();
    });
  });
});
