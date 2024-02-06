import { parseOptions } from '../../../../../helpers/index.js';

import extractPlain from './types/plain.js';
import extractMulti from './types/multi.js';

export default async (field, operator, value) => {
  const { multi_select: multi } = parseOptions(field.options);

  return multi
    ? extractMulti(field, operator, value)
    : extractPlain(field, operator, value);
};
