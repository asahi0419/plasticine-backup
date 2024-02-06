import { createRequire } from "module";
const require = createRequire(import.meta.url)

import getTCrossFunction from '../get-t-cross.js';

const getTCross = getTCrossFunction(sandbox);

describe('Sandbox', () => {
  describe('utils.getTCross(dtfModelAlias, dtfRecordId, dtfFieldAlias)', () => {
    it('Should return undefined if cross record not found', async () => {
      const mockOrm = h.mocker(require('../../../../../../data-layer/orm/index.js').default);

      mockOrm.assign({
        getModel: jest.fn().mockReturnValue({}),
        model: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            getOne: jest.fn().mockReturnValue({}),
            whereNull: jest.fn().mockReturnValue({
              getOne: jest.fn().mockReturnValue(),
            }),
          }),
        }),
      });

      const result = await getTCross('', '', '');
      const expected = undefined;

      expect(result).toEqual(expected);

      mockOrm.clear();
    });

    it('Should return cross data object otherwise', async () => {
      const mockOrm = h.mocker(require('../../../../../../data-layer/orm/index.js').default);
      const mockRecordFactory = h.mocker(require('../../../../../record/manager/factory'));

      mockOrm.assign({
        getModel: jest.fn().mockReturnValue({}),
        model: jest.fn().mockReturnValue({
          getManager: jest.fn().mockReturnValue({}),
          whereIn: jest.fn().mockReturnValue([]),
          where: jest.fn().mockReturnValue({
            getOne: jest.fn().mockReturnValue({}),
            whereIn: jest.fn().mockReturnValue([]),
            whereNull: jest.fn().mockReturnValue({
              getOne: jest.fn().mockReturnValue({}),
            }),
          }),
        }),
      });
      mockRecordFactory.assign({
        createManager: jest.fn().mockReturnValue({
          create: jest.fn().mockReturnValue({}),
        }),
      });

      const result = await getTCross('', '', '');

      expect(result).toHaveProperty('dtf_field_id');
      expect(result).toHaveProperty('dtf_record_id');
      expect(result).toHaveProperty('data_model_id');
      expect(result).toHaveProperty('data_record_id');

      mockOrm.clear();
      mockRecordFactory.clear();
    });
  });
});
