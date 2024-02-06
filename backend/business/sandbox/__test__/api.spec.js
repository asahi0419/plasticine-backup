import Api from '../api/index.js';
import pNamespace from '../api/p/index.js';
import utilsNamespace from '../api/utils/index.js';
import helpersNamespace from '../api/helpers/index.js';

describe('Sandbox', () => {
  describe('Api', () => {
    it('Should return correct result', () => {
      const result = Api(sandbox);

      expect(result.db).toBeDefined();
      expect(result.Buffer).toBeDefined();
      expect(result.Promise).toBeDefined();
      expect(result.FormData).toBeDefined();
      expect(result.lodash).toBeDefined();
      expect(result.moment).toBeDefined();
      expect(result.base64).toBeDefined();
      expect(result.utf8).toBeDefined();
      expect(result.cheerio).toBeDefined();
      expect(result.setTimeout).toBeDefined();
      expect(result.redis).toBeDefined();
      expect(result.soap).toBeDefined();
      expect(result.xml2js).toBeDefined();
      expect(result.external).toBeDefined();

      expect(JSON.stringify(result.p)).toEqual(JSON.stringify(pNamespace(sandbox)));
      expect(JSON.stringify(result.utils)).toEqual(JSON.stringify(utilsNamespace(sandbox)));
      expect(JSON.stringify(result.helpers)).toEqual(JSON.stringify(helpersNamespace(sandbox)));
    });
  });
});
