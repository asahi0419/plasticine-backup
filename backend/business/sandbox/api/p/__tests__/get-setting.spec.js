import { createRequire } from "module";
const require = createRequire(import.meta.url)

import cache from '../../../../../presentation/shared/cache/index.js';
import getSetting from '../get-setting';

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('getSetting(input)', () => {
        it('Should return extracted setting', async () => {
          const setting = require('../../../../setting/index.js');

          jest.spyOn(setting, 'extractSetting');

          const input = 'input';
          const result = getSetting(input);

          expect(setting.extractSetting).toBeCalledWith(cache.namespaces.core.get('settings'), input);
        });
      });
    });
  });
});
