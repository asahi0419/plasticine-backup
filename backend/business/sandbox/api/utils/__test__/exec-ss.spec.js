describe('Sandbox', () => {
  describe('utils.execSS(script, params)', () => {
    it('Should throw error if script is not string', async () => {
      const script = [];
      const result = sandbox.vm.utils.execSS(script);

      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Parameter 'script' in execSS(...) must be a string" });
    });

    it('Should throw error if params is not object', async () => {
      const script = '';
      const params = '';
      const result = sandbox.vm.utils.execSS(script, params);

      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Parameter 'params' in execSS(...) must be an object" });
    });

    it('Should properly run', async () => {
      const script = 'return';
      const result = await sandbox.vm.utils.execSS(script);

      expect(result.exec_time).toBeDefined();
      expect(result.status).toEqual('ok');
      expect(result.result).toEqual('undefined');
      expect(result.message).toEqual(null);
    });

    it('Should return status "OK" and result if script executed properly', async () => {
      const script = 'return "test"';
      const result = await sandbox.vm.utils.execSS(script);

      expect(result.exec_time).toBeDefined();
      expect(result.status).toEqual('ok');
      expect(result.result).toEqual('"test"');
      expect(result.message).toEqual(null);
    });

    it('Should return status "PASS" if param exp_result is equal to result', async () => {
      const script = 'return "test"';
      const params = { exp_result: '"test"' };
      const result = await sandbox.vm.utils.execSS(script, params);

      expect(result.exec_time).toBeDefined();
      expect(result.status).toEqual('pass');
      expect(result.result).toEqual('"test"');
      expect(result.message).toEqual(null);
    });

    it('Should return status "NOT PASS" if param exp_result is not equal to result', async () => {
      const script = 'return "test"';
      const params = { exp_result: '"not test"' };
      const result = await sandbox.vm.utils.execSS(script, params);

      expect(result.exec_time).toBeDefined();
      expect(result.status).toEqual('not_pass');
      expect(result.result).toEqual('"test"');
      expect(result.message).toEqual(null);
    });

    it('Should return status "ERROR" and result if error occurs when running a script', async () => {
      const script = 'ret urn';
      const result = await sandbox.vm.utils.execSS(script);

      expect(result.exec_time).toBeDefined();
      expect(result.status).toEqual('error');
      expect(result.result).toEqual(null);
      expect(result.message).toMatch('SyntaxError');
    });
  });
});
