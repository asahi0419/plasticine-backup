import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: Layout', () => {
  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent views found', async () => {
      const model = await manager('model').create();
      const layout = await manager('layout').create({ type: 'grid', model: model.id });
      const view = await manager('view').create({ model: model.id, type: 'grid', layout: layout.id });

      const result = new IntegrityManager(layout, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['view'] }});
    });
  });
});
