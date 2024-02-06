import { parseOptions } from '../../helpers/index.js';

const processOptions = async (efa) => {
  const options = parseOptions(efa.options);

  if (efa.type === 'comments') {
    options.length = options.length || 1024;
  }

  efa.options = JSON.stringify(options);

  return efa;
};

export default {
  before_insert: [processOptions],
  before_update: [processOptions],
};
