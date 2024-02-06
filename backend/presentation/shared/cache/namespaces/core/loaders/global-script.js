import db from '../../../../../../data-layer/orm/index.js';

export default async ({ sandbox }) => {
  if (!sandbox) return;

  const scripts = await db.model('global_script').where({ active: true, __inserted: true }).select('id', 'script').orderBy('id', 'asc');
  await sandbox.injectGlobalScripts(scripts);
};
