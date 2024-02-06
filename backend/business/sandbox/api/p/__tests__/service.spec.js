import serviceNamespace from '../service';

describe('p.service', () => {
  describe('referencedModelIds(modelId)', () => {
    it('Should return unique model ids from referenced fields', async () => {
      const model = db.getModel('model');

      const result = await serviceNamespace.referencedModelIds(model.id);
      const actual = await db.model('model').whereIn('id', result);

      expect(result.length).toEqual(actual.length);
    });

    it('Should return unique field ids from referenced fields', async () => {
      const model = db.getModel('model');

      const result = await serviceNamespace.referencedFieldIds(model.id);
      const actual = await db.model('field').whereIn('id', result);

      expect(result.length).toEqual(actual.length);
    });
  });
});
