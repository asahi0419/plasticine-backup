import loadTemplates from '../templates.js';
import * as HELPERS from '../helpers.js';

const model = db.getModel('model');

const req = { query: { modelId: model.id } };
const res = { json: jest.fn(), error: jest.fn() };

jest.mock('../helpers', () => ({
  loadTemplates: jest.fn().mockReturnValue('templates'),
}));

describe('Server API', () => {
  describe('Commands', () => {
    describe('Load', () => {
      describe('Templates', () => {
        it(`Should call res.json with correct data`, async () => {
          jest.spyOn(res, 'json');

          await loadTemplates(req, res);

          expect(res.json).toBeCalledWith({ data: 'templates' });
        });
        it(`Should call res.error if catch some`, async () => {
          jest.spyOn(res, 'error');

          await loadTemplates(null, res);

          expect(res.error).toBeCalled();
        });
        it(`Should call loadTemplates helper with correct data`, async () => {
          jest.spyOn(HELPERS, 'loadTemplates');

          await loadTemplates(req, res);

          expect(HELPERS.loadTemplates).toBeCalledWith(model);
        });
      });
    });
  });
});
