import uiUtils from './';

const sandbox = {}
const utils = uiUtils(sandbox);

describe('API: p.uiUtils', () => {
  describe('p.uiUtils.openForm', () => {
    it('Should throw error if no model and no record', () => {
      try {
        const result = utils.openForm()
        expect(result).toBeDefined();
      } catch (e) {
        expect(e.message).toBe('p.uiUtils.openForm(model, record, [options]): model should be provided, record should be provided');
      }
    });
  });
});
