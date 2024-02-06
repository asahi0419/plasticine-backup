describe('Sandbox', () => {
  describe('utils.db', () => {
    describe('callFunc(funcName, args)', () => {
      it('Should throw error if funcName is not string', async () => {
        const result = sandbox.vm.utils.db.callFunc();
        await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Parameter 'funcName' in callFunc(...) must be a string" });
      });
      it('Should throw error if args is defined but not array', async () => {
        const result = sandbox.vm.utils.db.callFunc('funcName', '');
        await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Parameter 'args' in callFunc(...) must be an array" });
      });
      it('Should correctly run', async () => {
        const argument1 = 'argument1';
        const argument2 = 0;

        const funcName = 'funcName';
        const args = [ argument1, argument2 ];

        db.client.raw = () => {};
        jest.spyOn(db.client, 'raw');
        const result = sandbox.vm.utils.db.callFunc(funcName, args);
        expect(db.client.raw).toBeCalledWith(`SELECT * FROM ${funcName}('${argument1}', ${argument2})`);
        jest.clearAllMocks();
      });
    });
  });
});
