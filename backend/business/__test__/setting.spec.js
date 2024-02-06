import { getSetting, getSettings } from '../setting';

describe('Setting', () => {
  describe('getSetting(input)', () => {
    it('Should return setting value by alias', async () => {
      const result = getSetting('start_url');
      const expected = '/pages/login';

      expect(result).toEqual(expected);
    });
    it('Should return setting object by alias', async () => {
      const result = getSetting('mailer').enabled;
      const expected = true;

      expect(result).toEqual(expected);
    });
    it('Should return setting string value by alias', async () => {
      const result = getSetting('project_name');
      const expected = 'Streamline';

      expect(result).toEqual(expected);
    });
    it('Should return setting numeric value by alias', async () => {
      const result = getSetting('project_name');
      const expected = 'Streamline';

      expect(result).toEqual(expected);
    });
    it('Should return setting value by path', async () => {
      const result = getSetting('mailer.enabled');
      const expected = true;

      expect(result).toEqual(expected);
    });
  });

  describe('getSettings(list)', () => {
    it('Should return setting values by list of aliases', async () => {
      const result = getSettings(['start_url', 'project_name']);
      const expected = { start_url: '/pages/login', project_name: 'Streamline' };

      expect(result).toEqual(expected);
    });
  });
});
