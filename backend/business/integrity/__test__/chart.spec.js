import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: Chart', () => {
  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent views found', async () => {
      const model = await manager('model').create();
      const chart = await manager('chart').create({ data_source: model.id });
      const layout = await manager('layout').create({ model: model.id, type: 'grid' });
      const view = await manager('view').create({ model: model.id, type: 'grid', chart: chart.id, layout: layout.id });

      const result = new IntegrityManager(chart, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['view'] }});
    });
  });
});
