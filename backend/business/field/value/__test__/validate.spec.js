import { omit } from 'lodash-es';

import { isFieldValueValid, fieldValueError, validateValues } from '../validate.js';

describe('Field', () => {
  describe('Value', () => {
    describe('validate', () => {
      describe('isFieldValueValid(field, value)', () => {
        it('Should return correct result', () => {
          let result, expected;

          // array_string
          result = isFieldValueValid({ type: 'array_string' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'array_string' }, 1);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'array_string' }, 'string');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'array_string', options: JSON.stringify({ multi_select: true }) }, 1);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'array_string', options: JSON.stringify({ multi_select: true }) }, 'string');
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'array_string', options: JSON.stringify({ multi_select: true }) }, []);
          expected = true;
          expect(result).toEqual(expected);

          result = isFieldValueValid({ type: 'array_string' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'array_string' }, 1);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'array_string' }, 'string');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'array_string', options: JSON.stringify({ multi_select: true }) }, 1);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'array_string', options: JSON.stringify({ multi_select: true }) }, 'string');
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'array_string', options: JSON.stringify({ multi_select: true }) }, []);
          expected = true;
          expect(result).toEqual(expected);

          // boolean
          result = isFieldValueValid({ type: 'boolean' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'boolean' }, 1);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'boolean' }, 'string');
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'boolean' }, false);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'boolean' }, true);
          expected = true;
          expect(result).toEqual(expected);

          // datetime
          result = isFieldValueValid({ type: 'datetime' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'datetime' }, 1);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'datetime' }, 'string');
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'datetime' }, new Date());
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'datetime' }, '2000');
          expected = true;
          expect(result).toEqual(expected);

          // reference_to_list
          result = isFieldValueValid({ type: 'reference_to_list' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'reference_to_list' }, 1);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'reference_to_list' }, 'string');
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'reference_to_list' }, []);
          expected = true;
          expect(result).toEqual(expected);

          // numbers
          result = isFieldValueValid({ type: 'integer' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'integer' }, 1);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'integer' }, '1');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'integer' }, 'string');
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'integer' }, []);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'float' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'float' }, 1);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'float' }, '1');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'float' }, 'string');
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'float' }, []);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'primary_key' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'primary_key' }, 1);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'primary_key' }, '1');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'primary_key' }, 'string');
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'primary_key' }, []);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'reference' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'reference' }, 1);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'reference' }, '1');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'reference' }, 'string');
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'reference' }, []);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'global_reference' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'global_reference' }, 1);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'global_reference' }, '1');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'global_reference' }, 'string');
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'global_reference' }, []);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'global_reference' }, {});
          expected = true;
          expect(result).toEqual(expected);

          // string-objects
          result = isFieldValueValid({ type: 'string' }, new Function());
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'string' }, true);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'string' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'string' }, 1);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'string' }, 'string');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'string' }, []);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'string' }, {});
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'string' }, new Date());
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_template' }, new Function());
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_template' }, true);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_template' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_template' }, 1);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_template' }, 'string');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_template' }, []);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_template' }, {});
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_template' }, new Date());
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_visual' }, new Function());
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_visual' }, true);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_visual' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_visual' }, 1);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_visual' }, 'string');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_visual' }, []);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_visual' }, {});
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'data_visual' }, new Date());
          expected = true;
          expect(result).toEqual(expected);

          // strings
          result = isFieldValueValid({ type: 'fa_icon' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'fa_icon' }, 1);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'fa_icon' }, 'string');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'fa_icon' }, []);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'file' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'file' }, 1);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'file' }, 'string');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'file' }, []);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'condition' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'condition' }, 1);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'condition' }, 'string');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'condition' }, []);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'filter' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'filter' }, 1);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'filter' }, 'string');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'filter' }, []);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'color' }, null);
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'color' }, 1);
          expected = false;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'color' }, 'string');
          expected = true;
          expect(result).toEqual(expected);
          result = isFieldValueValid({ type: 'color' }, []);
          expected = false;
          expect(result).toEqual(expected);
        });
      });

      describe('fieldValueError(field, value, sandbox)', () => {
        it('Should return correct result', () => {
          let result, expected, field;

          jest.spyOn(sandbox, 'translate');
          field = { type: 'array_string', alias: 'alias', name: 'name', options: JSON.stringify({ multi_select: false }) };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'string', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'array_string', alias: 'alias', name: 'name', options: JSON.stringify({ multi_select: true }) };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'array', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'boolean', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'boolean', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'datetime', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'datetime', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'reference_to_list', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'array', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'integer', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'number', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'float', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'number', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'primary_key', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'number', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'reference', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'number', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'global_reference', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'number', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'string', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'string', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'fa_icon', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'string', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'file', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'string', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'data_template', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'string', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'data_visual', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'string', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'condition', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'string', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'filter', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'string', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();

          jest.spyOn(sandbox, 'translate');
          field = { type: 'color', alias: 'alias', name: 'name' };
          result = fieldValueError(field, 'value', sandbox);
          expected = 'static.field_value_error';
          expect(result).toEqual(expected);
          expect(sandbox.translate).toBeCalledWith(expected, expect.objectContaining({ expected: 'string', ...omit(field, ['type', 'options']) }));
          jest.clearAllMocks();
        });
      });

      describe('validateValues(attributes, fields, sandbox, ErrorClass, ErrorPerfix, valueExtractor)', () => {
        it('Should correctly run', () => {
          let attributes = { array_string: {} };
          let fields = [{ type: 'array_string', alias: 'array_string' }];
          let ErrorClass = Error;

          let result = () => validateValues(attributes, fields, sandbox, ErrorClass);
          expect(result).toThrow(ErrorClass);

          attributes = { array_string: 'string' };
          fields = [{ type: 'array_string', alias: 'array_string' }];
          ErrorClass = Error;

          result = () => validateValues(attributes, fields, sandbox, ErrorClass);
          expect(result).not.toThrow(ErrorClass);
        });
      });
    });
  });
});
