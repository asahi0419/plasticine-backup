import { getSetting } from '../../../../../business/setting/index.js';
import { getOptions, validateOptions } from '../list.js';

describe('Server API', () => {
  describe('Models', () => {
    describe('List', () => {
      describe('getOptions(req)', () => {
        describe("['json', 'geojson']", () => {
          it(`Should return correct result`, async () => {
            let result, expected;

            result = getOptions();
            expected = { humanize: false, full_set: false, load_extra_fields: false };
            expect(result).toEqual(expected);

            result = getOptions({ query: { humanize: true } });
            expected = { humanize: true, full_set: false, load_extra_fields: false };
            expect(result).toEqual(expected);

            result = getOptions({ query: { humanize: true }, format: 'json' });
            expected = { humanize: true, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator') } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { humanize: 'true' }, format: 'json' });
            expected = { humanize: true, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator') } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { humanize: true }, format: 'geojson' });
            expected = { humanize: true, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator') } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { humanize: 'true' }, format: 'geojson' });
            expected = { humanize: true, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator') } };
            expect(result).toEqual(expected);

            result = getOptions({ format: 'json' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator') } };
            expect(result).toEqual(expected);

            result = getOptions({ format: 'geojson' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator') } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 0 } }, format: 'json' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: 0 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 0 } }, format: 'geojson' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: 0 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 10 } }, format: 'json' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: 10 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 10 } }, format: 'geojson' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: 10 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 100000000 } }, format: 'json' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator_max') } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 100000000 } }, format: 'geojson' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator_max') } };
            expect(result).toEqual(expected);
          });
        });
        describe("['csv', 'xlsx']", () => {
          it(`Should return correct result`, async () => {
            let result, expected;

            result = getOptions({ query: { humanize: true }, format: 'csv' });
            expected = { humanize: true, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator'), number: 1 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { humanize: 'true' }, format: 'csv' });
            expected = { humanize: true, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator'), number: 1 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { humanize: true }, format: 'xlsx' });
            expected = { humanize: true, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator'), number: 1 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { humanize: 'true' }, format: 'xlsx' });
            expected = { humanize: true, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator'), number: 1 } };
            expect(result).toEqual(expected);

            result = getOptions({ format: 'csv' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator'), number: 1 } };
            expect(result).toEqual(expected);

            result = getOptions({ format: 'xlsx' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.query_iterator'), number: 1 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 0 } }, format: 'csv' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: 0, number: 1 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 0 } }, format: 'xlsx' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: 0, number: 1 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 10 } }, format: 'csv' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: 10, number: 1 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 10 } }, format: 'xlsx' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: 10, number: 1 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 100000000 } }, format: 'csv' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.export_records_max'), number: 1 } };
            expect(result).toEqual(expected);

            result = getOptions({ query: { page: { size: 100000000 } }, format: 'xlsx' });
            expected = { humanize: false, full_set: false, load_extra_fields: false, page: { size: getSetting('limits.export_records_max'), number: 1 } };
            expect(result).toEqual(expected);
          });
        });
      });

      describe('validateOptions(req, options)', () => {
        it(`Should return correct result`, async () => {
          let result, expected;

          result = validateOptions({ format: 'xlsx' });
          expected = undefined;
          expect(result).toEqual(expected);

          result = () => validateOptions({ format: 'xlsx', model: { alias: 'test' } }, { fields: { _test: '1,2,3,4,5,6,7,8,9,10' }, page: { size: 100000 } });
          expect(result).toThrow();
        });
      });
    });
  });
});
