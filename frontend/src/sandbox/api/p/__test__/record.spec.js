import moment from 'moment';

import Record from '../record';
import Sandbox from '../../../';
import RecordProxy from '../../../../containers/content/form/proxy-record';

describe('API: p.record', () => {
  describe('getPrevValue', () => {
    describe('String', () => {
      it('Should return previous value', () => {
        const type = 'string';
        const alias = 'string';
        const value = { prev: 'prev', curr: 'curr' };

        const attributes = { [alias]: value.prev };
        const metadata = {
          model: [{ alias: 'model' }],
          fields: [{ type, alias, __access: true, __update: true }],
        };
        const recordProxy = new RecordProxy(attributes, metadata);
        const record = new Record(recordProxy);

        record.setValue(alias, value.curr)

        expect(record.getValue(alias)).toEqual(value.curr);
        expect(record.getPrevValue(alias)).toEqual(value.prev);
      });
    });
  });

  describe('getVisibleValue', () => {
    describe('Datetime', () => {
      it('Should return correct result by simple value', () => {
        const format = 'YYYY-MM-DD'
        const attributes = { datetime: new Date };
        const metadata = {
          model: [{ alias: 'model' }],
          fields: [{ type: 'datetime', alias: 'datetime', options: JSON.stringify({ format }) }],
        };
        const recordProxy = new RecordProxy(attributes, metadata);
        const record = new Record(recordProxy);

        const result = record.getVisibleValue('datetime');
        const expected = moment(attributes.datetime).format(format)

        expect(result).toEqual(expected);
      });

      it('Should return correct result by moment value', () => {
        const format = 'YYYY-MM-DD'
        const attributes = { datetime: moment(new Date).format(format) };
        const metadata = {
          model: [{ alias: 'model' }],
          fields: [{ type: 'datetime', alias: 'datetime', options: JSON.stringify({ format }) }],
        };
        const recordProxy = new RecordProxy(attributes, metadata);
        const record = new Record(recordProxy);

        const result = record.getVisibleValue('datetime');
        const expected = attributes.datetime;

        expect(result).toEqual(expected);
      });
    });
  });

  describe('setValue', () => {
    it('Should set value for permitted fields', () => {
      let result, expected, field, recordProxy, record;

      const alias = 'string';
      const value = 'value';

      field = { alias, __access: true, __update: true };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);

      record.setValue(alias, value)
      result = record.getValue(alias);
      expected = value;
      expect(result).toEqual(expected);
    });
    it('Should not set value for restricted fields', () => {
      let result, expected, field, recordProxy, record;

      const alias = 'string';
      const value = 'value';

      field = { alias, __access: false, __update: false };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);

      record.setValue(alias, value)
      result = record.getValue(alias);
      expected = undefined;
      expect(result).toEqual(expected);

      field = { alias, __access: true, __update: false };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);

      record.setValue(alias, value)
      result = record.getValue(alias);
      expected = undefined;
      expect(result).toEqual(expected);

      field = { alias, __access: true, __update: true };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);

      record.setValue(alias, value)
      result = record.getValue(alias);
      expected = value;
      expect(result).toEqual(expected);
    });
  });

  describe('hasAccess', () => {
    it('Should check if field can be accessed', () => {
      let result, expected, field, recordProxy, record;

      const alias = 'string';

      field = { alias, __access: true };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);
      result = record.hasAccess(alias)
      expected = true;
      expect(result).toEqual(expected);

      field = { alias, __access: false };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);
      result = record.hasAccess(alias)
      expected = false;
      expect(result).toEqual(expected);

      field = { alias, __access: false, is_option: true };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);
      result = record.hasAccess(alias)
      expected = true;
      expect(result).toEqual(expected);

      field = { alias, __access: true, is_option: true };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);
      result = record.hasAccess(alias)
      expected = true;
      expect(result).toEqual(expected);
    });
  });

  describe('canUpdate', () => {
    it('Should check if field can be updated', () => {
      let result, expected, field, recordProxy, record;

      const alias = 'string';

      field = { alias, __update: true };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);
      result = record.canUpdate(alias)
      expected = true;
      expect(result).toEqual(expected);

      field = { alias, __update: false };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);
      result = record.canUpdate(alias)
      expected = false;
      expect(result).toEqual(expected);

      field = { alias, __update: false, is_option: true };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);
      result = record.canUpdate(alias)
      expected = true;
      expect(result).toEqual(expected);

      field = { alias, __update: true, is_option: true };
      recordProxy = new RecordProxy({}, { fields: [ field ] });
      record = new Record(recordProxy);
      result = record.canUpdate(alias)
      expected = true;
      expect(result).toEqual(expected);
    });
  });
});
