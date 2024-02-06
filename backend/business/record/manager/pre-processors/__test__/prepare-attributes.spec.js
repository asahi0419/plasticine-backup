import moment from 'moment';
import prepareAttributes, * as PROCESSORS from '../prepare-attributes.js';

const dateWithNoZeroTime = '2018-12-03T22:22:22.784Z';
const dateWithZeroTime = '2018-12-03T00:00:00.784Z';

const modelFields = [
  {
    type: 'datetime',
    alias: 'datetime',
    options: JSON.stringify({ format: 'DD-MM-YYYY', date_only: false }),
  },
  {
    type: 'datetime',
    alias: 'datetime_date_only',
    options: JSON.stringify({ format: 'DD-MM-YYYY', date_only: true }),
  },
  {
    type: 'global_reference',
    alias: 'global_reference_string',
  },
];

const attributes = {
  datetime_no_date_only: dateWithNoZeroTime,
  datetime_date_only: dateWithNoZeroTime,
  global_reference_object: { model: 1, id: 2 },
  global_reference_string: '1/2',
};

const service = { modelFields, sandbox };

beforeAll(async () => {
  t.result = await prepareAttributes(service, attributes);
});

describe('Record: Pre-processors', () => {
  describe(('prepare attributes:'), () => {
    describe(('datetimeProcessor(value, field)'), async () => {
      it('Should don\'t change time', async () => {
        expect(moment(t.result.datetime_no_date_only).hour()).toEqual(moment(dateWithNoZeroTime).hour());
        expect(moment(t.result.datetime_no_date_only).minute()).toEqual(moment(dateWithNoZeroTime).minute());
        expect(moment(t.result.datetime_no_date_only).second()).toEqual(moment(dateWithNoZeroTime).second());
      });

      it('Should change time to zero', async () => {
        expect(moment(t.result.datetime_date_only).hour()).toEqual(moment(dateWithZeroTime).hour());
        expect(moment(t.result.datetime_date_only).minute()).toEqual(moment(dateWithZeroTime).minute());
        expect(moment(t.result.datetime_date_only).second()).toEqual(moment(dateWithZeroTime).second());
      });
    });

    describe(('globalReferenceProcessor(value)'), () => {
      it('Should return object if value is string', async () => {
        expect(t.result.global_reference_string.model).toEqual(1);
        expect(t.result.global_reference_string.id).toEqual(2);
      });

      it('Should return object if value is object', async () => {
        expect(t.result.global_reference_object.model).toEqual(1);
        expect(t.result.global_reference_object.id).toEqual(2);
      });
    });

    describe(('arrayStringProcessor(value, field)'), () => {
      it('Should return correct result', async () => {
        let field, value, result, expected;

        field = {}
        value = undefined;
        result = PROCESSORS.arrayStringProcessor(value, field);
        expected = null;
        expect(result).toEqual(expected);

        field = {}
        value = '';
        result = PROCESSORS.arrayStringProcessor(value, field);
        expected = null;
        expect(result).toEqual(expected);

        field = { options: JSON.stringify({ multi_select: true }) }
        value = ['v1', 'v2'];
        result = PROCESSORS.arrayStringProcessor(value, field);
        expected = ['v1', 'v2'];
        expect(result).toEqual(expected);

        field = { options: JSON.stringify({ multi_select: true }) }
        value = 'v1,v2';
        result = PROCESSORS.arrayStringProcessor(value, field);
        expected = ['v1', 'v2'];
        expect(result).toEqual(expected);

        field = { options: JSON.stringify({ multi_select: true }) }
        value = "'v1','v2'";
        result = PROCESSORS.arrayStringProcessor(value, field);
        expected = ['v1', 'v2'];
        expect(result).toEqual(expected);
      });
    });

    describe(('defaultProcessor(value, field)'), () => {
      it('Should correctly run', async () => {
        let field, value, result, expected;

        field = { type: 'string' };
        value = null;
        result = PROCESSORS.defaultProcessor(value, field);
        expect(result).toEqual(null);

        field = { type: 'string' };
        value = '';
        result = PROCESSORS.defaultProcessor(value, field);
        expect(result).toEqual(null);

        field = { type: 'string' };
        value = 'string';
        result = PROCESSORS.defaultProcessor(value, field);
        expect(result).toEqual('string');
      });
    });
  });
});
