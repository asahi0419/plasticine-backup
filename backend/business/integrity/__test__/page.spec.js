import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: Page', () => {
  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent forms found', async () => {
      const model = await manager('model').create();
      const page = await manager('page').create();
      const form = await manager('form').create({ model: model.id, page: page.id });

      const result = new IntegrityManager(page, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['form'] }});
    });
  });
});
