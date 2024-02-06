import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import crypto from 'crypto';

import lookup from '../../../../extensions/lookup.js';

function passwordEncryptor(password, salt) {
  return crypto.createHmac('sha512', salt).update(password).digest('hex');
}

export default passwordEncryptor;
// export default (await lookup(__dirname)) || passwordEncryptor;
