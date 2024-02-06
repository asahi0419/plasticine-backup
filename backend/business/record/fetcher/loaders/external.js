import { fileURLToPath } from 'url';

import lookup from '../../../../extensions/lookup.js';

export default async () => (await lookup(fileURLToPath(import.meta.url))) || ((records, fetcher) => records);
