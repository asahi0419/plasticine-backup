import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import lookup from '../../../extensions/lookup.js';
import BaseResolver from './base.js';

export default () => new BaseResolver();
// export default (await lookup(__dirname)) || (() => new BaseResolver());
