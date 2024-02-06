import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: View', () => {
  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent forms/dashboards found', async () => {
      const model = await manager('model').create();
      const layout = await manager('layout').create({ model: model.id, type: 'grid' });
      const view = await manager('view').create({ model: model.id, type: 'grid', layout: layout });
      const dashboard = await manager('dashboard').create({ options: `{"layout":[{"view":${view.id}}]}` });

      const formWithEmbeddedView = await manager('form').create({
        model: model.id,
        options: `{"components":{"options":{"__tab__.a9n6b":{"embedded_view":{"view":${view.id}}}}}}`
      });

      const formWithRelatedView = await manager('form').create({
        model: model.id,
        options: `{"related_components":{"list":[{"view":${view.id}}]}}`,
      });

      const result = new IntegrityManager(view, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['form', 'dashboard'] } });
    });
  });
});
