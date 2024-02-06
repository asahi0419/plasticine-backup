import Promise from 'bluebird';

import associateRecord from './associate.js';

const PROCESSORS = {
  associate: associateRecord,
};

export default (actions, record, sandbox) => Promise.map(actions, ({ name, params }) => {
  const processor = PROCESSORS[name];
  if (!processor) return;
  return processor(params, record, sandbox);
});
