import { createRequire } from "module";
const require = createRequire(import.meta.url)

import getTCrossByRefFunction from '../get-t-cross-by-ref.js';

const getTCrossByRef = getTCrossByRefFunction(sandbox);
const record = {
  getField: () => ({ getOptions: () => ({ foreign_model: 'foreign_model' }) }),
  getValue: () => null,
};

describe('Sandbox', () => {
  describe('utils.getTCrossByRef(record, refFieldAlias, dtfAlias)', () => {
    it('Should return cross data object by reference', async () => {
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

      const result = await getTCrossByRef(record, '');

      expect(result).toHaveProperty('dtf_field_id');
      expect(result).toHaveProperty('dtf_record_id');
      expect(result).toHaveProperty('data_model_id');
      expect(result).toHaveProperty('data_record_id');

      mockOrm.clear();
      mockRecordFactory.clear();
    });
  });
});
