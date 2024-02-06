import { prepareGoBackOptions, findFirstAvailableResource } from '../helpers';

afterEach(() => jest.clearAllMocks());

describe('ActionsProxy', () => {
  describe('Helpers', () => {
    describe('findFirstAvailableResource(modelAlias, resourceAlias, sandbox)', () => {
      it('Should correctly run', async () => {
        const modelAlias = 'model';
        const resourceAlias = 'form';

        const model = db.getModel('model');

        jest.spyOn(sandbox, 'executeScript');

        await findFirstAvailableResource(modelAlias, resourceAlias, sandbox);
        const resource = await db.model('form').where({ model: model.id }).getOne();

        expect(sandbox.executeScript).toBeCalledWith(resource.condition_script, `${resourceAlias}/${resource.id}/condition_script`, { modelId: resource.model });
        expect(sandbox.executeScript).toHaveBeenCalledTimes(1);
      });

      it('Should return first available resource', async () => {
        const modelAlias = 'model';
        const resourceAlias = 'form';

        const model = db.getModel('model');

        const result = await findFirstAvailableResource(modelAlias, resourceAlias, sandbox);
        const expected = await db.model('form').where({ model: model.id }).getOne();

        expect(result).toEqual(expected);
      });
    });

    describe('prepareGoBackOptions(context, options)', () => {
      it('Should return options object', () => {
        const result = prepareGoBackOptions();
        const expected = {};

        expect(result).toEqual(expected);
      });

      it('Should add removed record entry after delete action', () => {
        const actionAlias = 'delete';
        const modelAlias = 'test';
        const params = { actionAlias, modelAlias };
        const recordId = 1;
        const body = { record: { id: recordId } };
        const context = { request: { params, body } };

        const result = prepareGoBackOptions(context);
        const expected = { removed_record: { modelAlias, recordId } };

        expect(result).toEqual(expected);
      });
    });
  });
});
