import { isObject, isEmpty } from 'lodash-es';

import loader from '../setting.js';

describe('Presentation > Shared > Cache > Namespaces > Core > Loaders', () => {
  describe('Setting', () => {
    it('Should correctly load items', async () => {
      const result = await loader();
      expect(isObject(result)).toEqual(true);
      expect(isEmpty(result)).toEqual(false);
      expect(result['limits']).toEqual(await db.model('setting').pluck('value').where({ alias: 'limits' }).getOne());
    });
  });
});
