import RecordManager from './index.js';

export const createManager = async (model, sandbox, safety = true) => {
  const mode = safety ? 'secure' : 'insecure';
  const newSandbox = await sandbox.cloneWithoutDynamicContext();

  return new RecordManager(model, newSandbox, mode);
};
