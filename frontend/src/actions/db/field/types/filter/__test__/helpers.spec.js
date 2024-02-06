import { loadFields, loadTemplates } from '../helpers';

jest.mock('../../../../../../api', () => ({
  fetchRecords: jest.fn((modelAlias, params) => ({ data: { data: [{ id: +params.filter.replace('model = ', ''), type: 'field' }] } })),
  loadTemplates: jest.fn(() => ({ data: { data: [] } })),
}));

describe('Actions', () => {
  describe('DB', () => {
    describe('Field', () => {
      describe('Filter', () => {
        describe('Helpers', () => {
          describe('loadFields(modelId)', () => {
            it('Should return correct fields by model id', async () => {
              const modelId = 1;

              const result = await loadFields(modelId);
              const expected = { field: { 1: { __metadata: { counts: undefined, extra_attributes: undefined, extra_fields: undefined, human_attributes: {}, inserted: undefined, relationships: undefined }, id: 1 } } };

              expect(result).toEqual(expected);
            })
          });
          describe('loadTemplates(modelId)', () => {
            it('Should return correct templates by model id', async () => {
              const modelId = 1;

              const result = await loadTemplates(modelId);
              const expected = { templates: [] };

              expect(result).toEqual(expected);
            })
          });
        });
      });
    });
  });
});
