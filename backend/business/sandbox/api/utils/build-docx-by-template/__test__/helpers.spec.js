import { createRequire } from "module";
const require = createRequire(import.meta.url)

import { getBuffer, getAttributes } from '../helpers.js';
import { DOCXByTemplateBuilder } from '../../../../../export/index.js';

const EXPORT = require('../../../../../export/index.js');

describe('Sandbox', () => {
  describe('utils.buildDocxByTemplate: Helpers', () => {
    describe('getBuffer(templateAttachment, data)', () => {
      it('Should be properly called', async () => {
        EXPORT.default = jest.fn();

        const data = {};
        const templateAttachment = {};
        const result = getBuffer(templateAttachment, data);

        expect(EXPORT.default).toBeCalledWith(data, new DOCXByTemplateBuilder(templateAttachment));
      });
    });

    describe('getAttributes(buffer)', () => {
      it('Should return attributes for generated attachment', async () => {
        const buffer = { byteLength: 100 };
        const fileName = 'fileName';

        const result = getAttributes(buffer, fileName);
        const expected = {
          file_name: fileName,
          file_content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          file_size: buffer.byteLength,
        };

        expect(result).toEqual(expected);
      });
    });
  });
});
