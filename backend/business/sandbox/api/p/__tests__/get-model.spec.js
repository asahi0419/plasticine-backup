import getModelFunction from '../get-model.js';
import ModelProxy from '../../model/index.js';

const getModel = getModelFunction(sandbox);

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('getModel(modelAlias)', () => {
        it('Should return model proxy instance', async () => {
          const alias = 'model';
          const result = await getModel(alias);

          expect(result).toBeInstanceOf(ModelProxy);
          expect(result.model.alias).toEqual(alias);
        });
        it('Should throw error if model not found', async () => {
          const result = getModel();
          await expect(result).rejects.toMatchObject({ name: 'ModelNotFoundError' });
        });
      });
    });
  });
});
