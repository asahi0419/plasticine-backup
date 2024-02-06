import filterLoader from '../filter';

const state = { metadata: { app: { model: [{ id: 1 }, { id: 2 }] } } };

const dispatch = jest.fn();
const getState = jest.fn().mockReturnValue(state);

const loadFilter = filterLoader(dispatch, getState);

jest.mock('../filter/helpers', () => ({
  loadFields: jest.fn((modelId) => ({ fields: [{ model: modelId, }] })),
  loadTemplates: jest.fn(() => ({ templates: 'templates' })),
}));

describe('Actions', () => {
  describe('DB', () => {
    describe('Field', () => {
      describe('Filter', () => {
        it('Should return correct data by model', async () => {
          const field = { model: 1 };
          const recordId = 1;
          const value = 'id = 1';

          const result = await loadFilter(field, recordId, value);
          const expected = { payload: { metadata: { fields: [{ model: 1 }], model: { 1: { id: 1 } }, "templates": "templates" } } };

          expect(result).toEqual(expected);
        })
        it('Should return correct data by reference model', async () => {
          const field = { model: 1, options: '{"ref_model":2}' };
          const recordId = 1;
          const value = 'id = 1';

          const result = await loadFilter(field, recordId, value);
          const expected = { payload: { metadata: { fields: [{ model: 2 }], model: { 2: { id: 2 } }, "templates": "templates" } } };

          expect(result).toEqual(expected);
        })
      });
    });
  });
});
