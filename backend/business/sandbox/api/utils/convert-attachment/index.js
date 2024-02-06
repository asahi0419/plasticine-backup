import axios from 'axios';
import FormData from 'form-data';

import logger from '../../../../logger/index.js';
import RecordProxy from '../../model/record/index.js';

export default (sandbox) => async (attachment = {}, ext) => {
  const path = `http://${process.env.SERVICE_LIBREOFFICE_HOST}:${process.env.SERVICE_LIBREOFFICE_PORT}${process.env.ROOT_ENDPOINT}/services/libreoffice/convert/${ext}`;
  const buffer = await attachment.getBuffer();

  try {
    const data = new FormData();
    data.append('files[0]', buffer || '', attachment.getValue('file_name') || '');

    const response = await axios({
      method: 'post',
      responseType: 'arraybuffer',
      url: path,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: { 'Content-Type': `multipart/form-data; boundary=${data._boundary}` },
      data,
    });

    const record = await RecordProxy.create({
      file_name: attachment.getValue('file_name').replace(/\.[^/.]+$/, "") + `.${ext}`,
    }, 'attachment', sandbox);

    return record.setBuffer(Buffer.from(response.data, 'binary'));
  } catch (error) {
    logger.error(error);
  }
}
