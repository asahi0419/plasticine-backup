import { isObject, isFunction } from 'lodash-es';

import СMDRunner from '../runner.js';

describe('СMDRunner', () => {
  describe('constructor(sandbox = {}, options = {})', () => {
    it('Should init with sandbox, options and request', () => {
      const runner = new СMDRunner();

      expect(isObject(runner.sandbox)).toBe(true);
      expect(isObject(runner.options)).toBe(true);
      expect(isFunction(runner.request)).toBe(true);
    });
  });
  describe('async run(command)', () => {
    it('Should throw an error if "command" parameter does not present', async () => {
      const result = new СMDRunner(sandbox).run();

      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Missing parameter 'command' in runCMD(...)" });
    });
    it('Should return correct response', async () => {
      const command = 'll';
      const options = JSON.stringify({ host: 'localhost', port: '8080', user_id: 1 });
      const response = { data: { stdout: 'test' } };
      const result = await new СMDRunner(sandbox, options, () => response).run(command);

      expect(result).toMatchObject({ result: 'OK', output: response.data.stdout });
    });
  });
  describe('processResponse(response = {})', () => {
    it('Should return correct processed OK response', () => {
      const response = { data: { stdout: 'test' } };
      const result = new СMDRunner().processResponse(response);
      const expected = { result: 'OK', output: response.data.stdout };

      expect(result).toEqual(expected);
    });
    it('Should return correct processed NOK response', () => {
      const response = { data: { stderr: 'test', stdout: 'test' } };
      const result = new СMDRunner().processResponse(response);
      const expected = { result: 'NOK', output: response.data.stdout };

      expect(result).toEqual(expected);
    });
  });
  describe('getRequestObject(command, options, token)', () => {
    it('Should return correct request object', async () => {
      const command = 'll';
      const options = { host: 'localhost', port: '8080' };
      const token = 'token'
      const request = {
        method: 'post',
        url: `${options.host}:${options.port}${process.env.ROOT_ENDPOINT}/__command/exec`,
        headers: { 'x-token': token },
        data: { command, options },
      };
      const result = new СMDRunner(sandbox).getRequestObject(command, options, token);

      expect(result).toMatchObject(request);
    });
  });
  describe('async getToken(options)', () => {
    it("Should throw an error if user with specified 'options.user_id' not found", async () => {
      const result = new СMDRunner(sandbox).getToken({ user_id: 1000 });

      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Cannot found user with specified 'options.user_id' in runCMD(...)" });
    });
    it("Should throw an error if account associated with user matching 'options.user_id' not found", async () => {
      await db.model('user').where({ id: 1 }).update({ account: null });

      const result = new СMDRunner(sandbox).getToken({ user_id: 1 });

      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Cannot found account associated with user matching 'options.user_id' in runCMD(...)" });
      await db.model('user').where({ id: 1 }).update({ account: 1 });
    });
    it("Should throw an error if token not found", async () => {
      const { static_token } = await db.model('account').where({ id: 1 }).getOne();
      await db.model('account').where({ id: 1 }).update({ static_token: null });

      const result = new СMDRunner(sandbox).getToken();

      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Missing x-token header in runCMD(...)" });
      await db.model('account').where({ id: 1 }).update({ static_token });
    });
    it("Should return token", async () => {
      const { static_token } = await db.model('account').where({ id: 1 }).getOne();
      const result = await new СMDRunner(sandbox).getToken({ user_id: 1 });

      expect(result).toEqual(static_token);
    });
  });
  describe('async getOptions()', () => {
    it("Should throw an error if parameter 'options.host' is missing", async () => {
      const result = () => new СMDRunner(sandbox).getOptions();

      expect(result).toThrow();
    });
    it("Should throw an error if parameter 'options.port' is missing", async () => {
      const options = JSON.stringify({ host: 'localhost' });
      const result = () => new СMDRunner(sandbox, options).getOptions();

      expect(result).toThrow();
    });
    it("Should throw an error if mode is async and parameter 'options.callback' is missing", async () => {
      const options = JSON.stringify({ host: 'localhost', port: '8080', mode: 'async' });
      const result = () => new СMDRunner(sandbox, options).getOptions();

      expect(result).toThrow();
    });
    it("Should return options", async () => {
      const options = { host: 'localhost', port: '8080' };
      const result = await new СMDRunner(sandbox, JSON.stringify(options)).getOptions();

      expect(result).toMatchObject({ mode: 'sync', ...options });
    });
  });
});
