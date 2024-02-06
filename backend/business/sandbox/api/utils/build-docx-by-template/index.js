import logger from '../../../../logger/index.js';
import RecordProxy from '../../model/record/index.js';
import exportData, { DOCXByTemplateBuilder } from '../../../../export/index.js';

export default (sandbox) => async (template = {}, data, options = {}) => {
  try {
    const { fileName, mode } = options;
    const name = fileName || `generated_doc_${+new Date()}.docx`;
    const buffer = await exportData(data, new DOCXByTemplateBuilder(template), options);
    if (mode === 'buffer') return buffer
    const record = await RecordProxy.create({ file_name: name }, 'attachment', sandbox);

    return record.setBuffer(buffer);
  } catch (error) {
    logger.error(error);
  }
};
