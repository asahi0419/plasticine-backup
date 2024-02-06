import FieldProxy from '../field.js';
import { parseOptions } from '../../../../../helpers/index.js';

beforeAll(() => {
  t.field = {
    id: 1,
    alias: 'alias',
    type: 'string',
    model: 1,
    options: '{}',
  };
  t.recordProxy = {
    getValue: jest.fn(),
    getVisibleValue: jest.fn(),
    setValue: jest.fn(),
    getComments: jest.fn(),
    setComments: jest.fn(),
  };
  t.fieldProxy = new FieldProxy(t.field, t.recordProxy);
});

describe('Sandbox API', () => {
  describe('FieldProxy', () => {
    describe('constructor(...)', () => {
      it('Should be properly executed', () => {
        expect(t.fieldProxy.id).toEqual(t.field.id);
        expect(t.fieldProxy.alias).toEqual(t.field.alias);
        expect(t.fieldProxy.type).toEqual(t.field.type);
        expect(t.fieldProxy.model).toEqual(t.field.model);
      });
    });

    describe('getOptions()', () => {
      it('Should return field options object', () => {
        const result = t.fieldProxy.getOptions();
        const expected = parseOptions(t.field.options);

        expect(result).toEqual(expected);
      });
    });

    describe('getValue()', () => {
      it('Should return field value', () => {
        jest.spyOn(t.recordProxy, 'getValue');

        const result = t.fieldProxy.getValue();

        expect(t.recordProxy.getValue).toBeCalledWith(t.field.alias);
      });
    });

    describe('getVisibleValue()', () => {
      it('Should return field visible value', () => {
        jest.spyOn(t.recordProxy, 'getVisibleValue');

        const result = t.fieldProxy.getVisibleValue();

        expect(t.recordProxy.getVisibleValue).toBeCalledWith(t.field.alias);
      });
    });

    describe('setValue()', () => {
      it('Should set field value', () => {
        jest.spyOn(t.recordProxy, 'setValue');

        const value = 'value';
        const result = t.fieldProxy.setValue(value);

        expect(t.recordProxy.setValue).toBeCalledWith(t.field.alias, value);
      });
    });

    describe('getComments()', () => {
      it('Should return field comments', () => {
        jest.spyOn(t.recordProxy, 'getComments');

        const result = t.fieldProxy.getComments();

        expect(t.recordProxy.getComments).toBeCalledWith(t.field.alias);
      });
    });

    describe('setComments()', () => {
      it('Should set field comments', () => {
        jest.spyOn(t.recordProxy, 'setComments');

        const comments = [];
        const result = t.fieldProxy.setComments(comments);

        expect(t.recordProxy.setComments).toBeCalledWith(t.field.alias, comments);
      });
    });
  })
});
