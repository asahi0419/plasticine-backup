import initExtensions from '../../../extensions/init.js';

const reinitPlugin = async (record, sandbox) => {
  await initExtensions({ sandbox });
};

export default { after_update: [ reinitPlugin ] };
