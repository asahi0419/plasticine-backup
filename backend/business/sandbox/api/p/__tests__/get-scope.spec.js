import getScopeFunction from '../get-scope';

describe('p.getScope', () => {
  describe('Context', () => {
    it('Sould return scope [view]', async () => {
      const model =  db.getModel('model');
      const body = { exec_by: { type: 'view' } };

      const getScope = getScopeFunction({ request: { model, body, sandbox } });
      const scope = getScope();

      const result = await scope.count();
      const expected = await db.model(model.alias).count();

      expect(result).toEqual(expected);
    });
    it('Sould return scope [view] (filtered)', async () => {
      const model =  db.getModel('model');
      const body = { exec_by: { type: 'view' }, viewOptions: { filter: "`type` = 'core'", hidden_filter: "`id` IN ('1', '2')" } };

      const getScope = getScopeFunction({ request: { model, body, sandbox } });
      const scope = getScope();

      const result = await scope.count();
      const expected = await db.model(model.alias).where({ type: 'core' }).whereIn('id', [1, 2]).count();

      expect(result).toEqual(expected);
    });

    it('Sould return scope [form]', async () => {
      const model =  db.getModel('model');
      const body = { exec_by: { type: 'form' }, record: { id: 1 } };

      const getScope = getScopeFunction({ request: { model, body, sandbox } });
      const scope = getScope();

      const result = await scope.count();
      const expected = await db.model(model.alias).where({ id: 1 }).count();

      expect(result).toEqual(expected);
    });

    it('Sould return scope [page]', async () => {
      const model =  db.getModel('model');
      const body = { exec_by: { type: 'page' }, record: { id: 1 } };

      const getScope = getScopeFunction({ request: { model, body, sandbox } });
      const scope = getScope();

      const result = await scope.count();
      const expected = await db.model(model.alias).where({ id: 1 }).count();

      expect(result).toEqual(expected);
    });

    it('Sould return undefined [none]', async () => {
      const getScope = getScopeFunction();
      const scope = getScope();

      expect(scope).not.toBeDefined();
    });
  });

  describe('Common', () => {
    it('Sould correctly run', async () => {
      const model =  db.getModel('model');
      const body = { exec_by: { type: 'view' } };
      const getScope = getScopeFunction({ request: { model, body, sandbox } });

      let scope, result, expected, records;

      scope = getScope();
      records = await sandbox.vm.p.iterMap(scope.find({ type: 'core' }).limit(10), record => record)
      result = records.length;
      expected = 10;

      expect(result).toEqual(expected);

      scope = getScope();
      records = await sandbox.vm.p.iterMap(scope.find({}), record => record)
      result = records.length;
      expected = await db.model(model.alias).where({}).count();

      expect(result).toEqual(expected);

      scope = getScope();
      records = await scope.findOne({});
      result = [records].length;
      expected = 1;

      expect(result).toEqual(expected);
    });
  });
});
