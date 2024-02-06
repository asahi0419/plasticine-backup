import logger from '../../../../logger/index.js';

export default (sandbox) => async (template = {}, data = {}, ext) => {
  try {
    const docx = await sandbox.vm.utils.buildDocxByTemplate(template, data);
    return sandbox.vm.utils.convertAttachment(docx, ext);
  } catch (error) {
    logger.error(error);
  }
};
