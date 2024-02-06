import jwt from 'jsonwebtoken';

import * as HELPERS from '../helpers';
import * as CONSTANTS from '../constants';

describe('Helpers', () => {
  describe('viewAliasToId(model, alias)', () => {
    it('Should convert view alias to id', async () => {
      const model = db.getModel('model');
      const view = await db.model('view').where({ model: model.id, alias: 'default' }).getOne();

      const result = await HELPERS.viewAliasToId(model, view.alias);
      const expected = view.id;

      expect(result).toEqual(expected);
    });
  });

  describe('getAliasFromURL(url)', () => {
    it('Should return alias by url [page]', () => {
      expect(HELPERS.getAliasFromURL('')).not.toBeDefined();
      expect(HELPERS.getAliasFromURL('string')).not.toBeDefined();

      expect(HELPERS.getAliasFromURL('http://')).not.toBeDefined();
      expect(HELPERS.getAliasFromURL('http://test')).not.toBeDefined();
      expect(HELPERS.getAliasFromURL('http://test/start')).not.toBeDefined();
      expect(HELPERS.getAliasFromURL('http://test/start?param=1')).not.toBeDefined();
      expect(HELPERS.getAliasFromURL('http://test/pages/start/string/')).not.toBeDefined();

      expect(HELPERS.getAliasFromURL('https://')).not.toBeDefined();
      expect(HELPERS.getAliasFromURL('https://test')).not.toBeDefined();
      expect(HELPERS.getAliasFromURL('https://test/start')).not.toBeDefined();
      expect(HELPERS.getAliasFromURL('https://test/start?param=1')).not.toBeDefined();
      expect(HELPERS.getAliasFromURL('https://test/pages/start/string/')).not.toBeDefined();

      expect(HELPERS.getAliasFromURL('http://test/pages/start')).toEqual('start');
      expect(HELPERS.getAliasFromURL('http://test/pages/start?param=1')).toEqual('start');

      expect(HELPERS.getAliasFromURL('https://test/pages/start')).toEqual('start');
      expect(HELPERS.getAliasFromURL('https://test/pages/start?param=1')).toEqual('start');

      expect(HELPERS.getAliasFromURL('https://test-test/pages/start?param=1')).toEqual('start');
    });
    it('Should return undefined if attributes is not a string', () => {
      expect(HELPERS.getAliasFromURL({})).not.toBeDefined();
    });
  });

  describe('getRecord(modelAlias, attributes)', () => {
    it('Should return record', async () => {
      const modelAlias = 'page';
      const attributes = { alias: 'start' };

      const result = await HELPERS.getRecord(modelAlias, attributes);
      const expected = await db.model(modelAlias).where(attributes).getOne();

      expect(result).toEqual(expected);
    });
    it('Should return undefined if attributes is not an object', async () => {
      const modelAlias = 'page';
      const attributes = '';

      const result = await HELPERS.getRecord(modelAlias, attributes);

      expect(result).not.toBeDefined();
    });
    it('Should return undefined if attributes is is empty', async () => {
      const modelAlias = 'page';
      const attributes = {};

      const result = await HELPERS.getRecord(modelAlias, attributes);

      expect(result).not.toBeDefined();
    });
    it('Should return undefined if some attribute is undefined', async () => {
      const modelAlias = 'page';
      const attributes = { alias: undefined };

      const result = await HELPERS.getRecord(modelAlias, attributes);

      expect(result).not.toBeDefined();
    });
  });

  describe('beautifyJSON(json)', () => {
    it('Should return beautified json input', () => {
      const result = HELPERS.beautifyJSON('{"a":"a"}');
      const expected = `{
  \"a\": \"a\"
}`;

      expect(result).toEqual(expected);
    });
  });

  describe('parseDateFormat(options)', () => {
    it('Should parse datetime format', () => {
      let result, expected, format, date_only;

      result = HELPERS.parseDateFormat();
      expected = CONSTANTS.DEFAULT_DATE_FORMAT;

      result = HELPERS.parseDateFormat({ format: '' });
      expected = CONSTANTS.DEFAULT_DATE_FORMAT;

      result = HELPERS.parseDateFormat({ format: 'YYYY-MM-DD' });
      expected = 'YYYY-MM-DD';

      result = HELPERS.parseDateFormat({ format: 'YYYY-MM-DD HH:mm:ss' });
      expected = 'YYYY-MM-DD HH:mm:ss';

      result = HELPERS.parseDateFormat({ format: 'YYYY-MM-DD HH:mm:ss', date_only: true });
      expected = 'YYYY-MM-DD';

      expect(result).toEqual(expected);
    });
  });

  describe('parseNumber(value)', () => {
    it('Should return correct result', () => {
      let result, expected, value;

      value = '1.1'
      result = HELPERS.parseNumber(value);
      expected = 1.1;
      expect(result).toEqual(expected);

      value = 'string1.1'
      result = HELPERS.parseNumber(value);
      expected = 1.1;
      expect(result).toEqual(expected);

      value = '1.1string'
      result = HELPERS.parseNumber(value);
      expected = 1.1;
      expect(result).toEqual(expected);

      value = 'string1.1string'
      result = HELPERS.parseNumber(value);
      expected = 1.1;
      expect(result).toEqual(expected);

      value = '-1.1'
      result = HELPERS.parseNumber(value);
      expected = -1.1;
      expect(result).toEqual(expected);

      value = 'string-1.1'
      result = HELPERS.parseNumber(value);
      expected = -1.1;
      expect(result).toEqual(expected);

      value = '-1.1string'
      result = HELPERS.parseNumber(value);
      expected = -1.1;
      expect(result).toEqual(expected);

      value = 'string-1.1string'
      result = HELPERS.parseNumber(value);
      expected = -1.1;
      expect(result).toEqual(expected);
    });
  });

  describe('getJWTToken(user, session)', () => {
    it('Should correctly run', () => {
      jest.spyOn(jwt, 'sign');

      const user = {
        id: 'id',
        name: 'name',
        surname: 'surname',
        account: {
          email: 'email',
        }
      };
      const session = {
        id: 'id',
      };

      const context = {
        secret: process.env.APP_SECRET,
        options: {}
      };

      if (process.env.APP_SECRET_ALGORITHM) {
        context.secret = process.env.APP_SECRET_PRIVATE;
        context.options.algorithm = process.env.APP_SECRET_ALGORITHM;
      }

      const result = HELPERS.getJWTToken(user, session);

      expect(jwt.sign).toBeCalledWith({
        id: user.id,
        name: user.name,
        email: user.account.email,
        surname: user.surname,
        session_id: session.id,
      }, context.secret, context.options);

      expect(result).toBeDefined();
    });
  });

  describe('cleanupAttributes(attributes)', () => {
    it('Should correctly run', () => {
      const attributes = {
        key: '',
        __key: '',
        __hash: '',
        __type: '',
        __inserted: false,
      };

      const result = HELPERS.cleanupAttributes(attributes);
      const expected = {
        key: '',
        __key: '',
      };

      expect(result).toBeDefined();
    });
  });
});
