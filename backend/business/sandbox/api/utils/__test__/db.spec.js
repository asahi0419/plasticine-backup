import { isFunction } from 'lodash-es';

import dbNamespace from '../db/index.js';

describe('Sandbox', () => {
  describe('utils.db', () => {
    it('Should have proper attributes', async () => {
      const db = dbNamespace(sandbox);

      expect(isFunction(db.callFunc)).toEqual(true);
    });
  });
});
