import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: Appearance', () => {
  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent views found', async () => {
      const model = await manager('model').create();
      const appearance = await manager('appearance').create({ model: model.id, type: 'grid' });
      const layout = await manager('layout').create({ model: model.id, type: 'grid' });
      const view = await manager('view').create({ model: model.id, type: 'grid', appearance: appearance.id, layout: layout.id });

      const result = new IntegrityManager(appearance, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['view'] }});
    });
  });
});
