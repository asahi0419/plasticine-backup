import db from '../../../../data-layer/orm/index.js';
import * as ERROR from '../../../../business/error/index.js';
import * as HELPERS from '../../../../business/helpers/index.js';

export async function checkFileFormat(fileName, sandbox) {
  const format = (/[^./\\]*$/.exec(fileName) || [''])[0].toLowerCase();

  const setting = await db.model('setting').where({ alias: 'attachments_settings' }).getOne();
  const { allowed_formats = [] } = HELPERS.parseOptions(setting.value);

  if (!allowed_formats.map((format) => format.toLowerCase()).includes(format)) {
    throw new ERROR.ParamsNotValidError(sandbox.translate('static.file_format_is_not_allowed', { format }));
  }
}
