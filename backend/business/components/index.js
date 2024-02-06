import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import lookup from '../../extensions/lookup.js';

export default async () => (await lookup(__dirname)) || {};
