import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: Filter', () => {
  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent views found', async () => {
      const model = await manager('model').create();
      const filter = await manager('filter').create({ model: model.id });
      const layout = await manager('layout').create({ model: model.id, type: 'grid' });
      const view = await manager('view').create({ model: model.id, type: 'grid', filter: filter.id, layout: layout });

      const result = new IntegrityManager(filter, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['view'] }});
    });
  });
});
